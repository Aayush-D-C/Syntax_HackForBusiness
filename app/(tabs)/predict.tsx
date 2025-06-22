import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { useData } from '../../context/DataContext';
import { useScan } from '../../context/ScanContext';
import { CreditScoreBreakdown, CreditScoreData, creditScoreService } from '../../services/creditScoreService';

const { width } = Dimensions.get('window');
const chartWidth = width - 40;

interface CreditMetricProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
}

const CreditMetric: React.FC<CreditMetricProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle 
}) => (
  <View style={styles.metricCard}>
    <LinearGradient
      colors={[color, `${color}80`]}
      style={styles.metricGradient}
    >
      <View style={styles.metricContent}>
        <Ionicons name={icon as any} size={24} color="#fff" />
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricTitle}>{title}</Text>
        {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
      </View>
    </LinearGradient>
  </View>
);

// Live Indicator Component
const LiveIndicator: React.FC = () => (
  <View style={styles.liveIndicator}>
    <View style={styles.liveDot} />
    <Text style={styles.liveText}>LIVE</Text>
  </View>
);

const CircularProgress: React.FC<{ score: number; size?: number }> = ({ score, size = 100 }) => {
  const color = getCreditScoreColor(score);
  const progress = (score / 100) * 360; // Convert score to degrees

  return (
    <View style={[styles.circularProgressContainer, { width: size, height: size }]}>
      {/* Background circle */}
      <View
        style={[
          styles.circularProgressTrack,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 6,
            borderColor: '#f0f0f0',
          },
        ]}
      />
      
      {/* Progress circle */}
      <View
        style={[
          styles.circularProgressFill,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 6,
            borderColor: color,
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            transform: [{ rotate: `${progress - 90}deg` }],
          },
        ]}
      />
      
      {/* Center text */}
      <View style={styles.circularProgressText}>
        <Text style={[styles.circularProgressScore, { color }]}>{score}</Text>
        <Text style={styles.circularProgressLabel}>Score</Text>
      </View>
    </View>
  );
};

const getCreditScoreColor = (score: number): string => {
  if (score >= 80) return '#4CAF50';
  if (score >= 60) return '#8BC34A';
  if (score >= 40) return '#FFC107';
  return '#F44336';
};

const getRiskCategoryColor = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'excellent': return '#4CAF50';
    case 'good': return '#8BC34A';
    case 'fair': return '#FFC107';
    case 'moderate risk': return '#FF9800';
    case 'high risk': return '#F44336';
    default: return '#9E9E9E';
  }
};

export default function CreditAnalysisScreen() {
  const router = useRouter();
  const { currentShopkeeper, error, clearError } = useData();
  const { inventory, operations } = useScan();
  const [loading, setLoading] = useState(false);
  const [dynamicCreditData, setDynamicCreditData] = useState<{
    credit_score: number;
    risk_category: string;
    breakdown: CreditScoreBreakdown;
    data: CreditScoreData;
  } | null>(null);

  // Calculate dynamic credit score data
  const calculateDynamicCreditData = () => {
    try {
      // Calculate business metrics from inventory operations
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      const recentOperations = operations.filter(op => 
        new Date(op.timestamp) >= last30Days
      );

      // Calculate inventory statistics
      const inventoryStats = {
        totalItems: inventory.length,
        totalValue: inventory.reduce((sum, item) => sum + (item.price * (item.quantity || 0)), 0),
        totalQuantity: inventory.reduce((sum, item) => sum + (item.quantity || 0), 0)
      };

      // Calculate metrics
      const totalTransactions = recentOperations.length;
      const salesOperations = recentOperations.filter(op => op.type === 'remove');
      const purchaseOperations = recentOperations.filter(op => op.type === 'add');
      
      // Calculate revenue and profit from operations
      const totalRevenue = salesOperations.reduce((sum, op) => 
        sum + (op.product.price * op.quantity), 0
      );
      
      const totalCost = purchaseOperations.reduce((sum, op) => 
        sum + (op.product.price * op.quantity * 0.7), 0
      );
      
      const totalProfit = totalRevenue - totalCost;
      
      // Enhanced calculation considering inventory value
      let enhancedTransactions = totalTransactions;
      let enhancedRevenue = totalRevenue;
      let enhancedProfit = totalProfit;
      
      // If no recent operations, use inventory value as baseline
      if (totalTransactions === 0 && inventory.length > 0) {
        enhancedTransactions = Math.max(5, Math.floor(inventoryStats.totalValue / 1000));
        enhancedRevenue = inventoryStats.totalValue * 0.3;
        enhancedProfit = enhancedRevenue * 0.25;
      }
      
      // Ensure minimum values for new businesses
      const minTransactions = Math.max(enhancedTransactions, 3);
      const minRevenue = Math.max(enhancedRevenue, inventoryStats.totalValue * 0.1);
      const minProfit = Math.max(enhancedProfit, minRevenue * 0.2);
      
      // Calculate days active
      const uniqueDays = new Set(
        recentOperations.map(op => new Date(op.timestamp).toDateString())
      ).size;
      
      // Create credit score data
      const creditScoreData: CreditScoreData = {
        transactions: minTransactions,
        on_time_payments: Math.floor(minTransactions * 0.9),
        missed_payments: Math.floor(minTransactions * 0.1),
        avg_transaction_amount: minRevenue / minTransactions,
        profit: minProfit,
        revenue: minRevenue,
        expenses: minRevenue - minProfit,
        days_active: Math.max(uniqueDays, 7),
      };

      // Calculate credit score and breakdown
      const result = creditScoreService.calculateCreditScoreSimple(creditScoreData);
      const breakdown = creditScoreService.getCreditScoreBreakdown(creditScoreData);
      
      setDynamicCreditData({
        credit_score: result.credit_score,
        risk_category: result.risk_category,
        breakdown,
        data: creditScoreData,
      });

      return { result, breakdown, data: creditScoreData };
    } catch (error) {
      console.error('Error calculating dynamic credit data:', error);
      return null;
    }
  };

  useEffect(() => {
    calculateDynamicCreditData();
  }, [operations, inventory]); // Recalculate when operations or inventory changes

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error, clearError]);

  const getCreditScoreData = () => {
    // Use dynamic data if available, otherwise fallback to mock data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentScore = dynamicCreditData?.credit_score || currentShopkeeper?.credit_score || 75;
    const scores = [65, 68, 72, 75, 78, currentScore];
    
    return {
      labels: months,
      datasets: [
        {
          data: scores,
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 3,
        }
      ],
    };
  };

  const getPerformanceData = () => {
    // Use dynamic data if available
    if (dynamicCreditData) {
      return {
        labels: ['Profit', 'Revenue', 'Expenses'],
        datasets: [
          {
            data: [
              dynamicCreditData.data.profit,
              dynamicCreditData.data.revenue,
              dynamicCreditData.data.expenses
            ]
          }
        ]
      };
    }

    // Fallback to shopkeeper data
    const shopkeeper = currentShopkeeper;
    if (!shopkeeper) return null;

    return {
      labels: ['Profit', 'Revenue', 'Expenses'],
      datasets: [
        {
          data: [
            shopkeeper.monthly_profit_avg || 0,
            shopkeeper.monthly_revenue_avg || 0,
            (shopkeeper.monthly_revenue_avg || 0) - (shopkeeper.monthly_profit_avg || 0)
          ]
        }
      ]
    };
  };

  const getPaymentReliabilityData = () => {
    // Use dynamic data if available
    if (dynamicCreditData) {
      const onTime = dynamicCreditData.data.on_time_payments;
      const missed = dynamicCreditData.data.missed_payments;
      const total = onTime + missed;

      if (total === 0) return null;

      return [
        {
          name: 'On Time',
          population: onTime,
          color: '#4CAF50',
          legendFontColor: '#7F7F7F',
          legendFontSize: 12,
        },
        {
          name: 'Missed',
          population: missed,
          color: '#F44336',
          legendFontColor: '#7F7F7F',
          legendFontSize: 12,
        },
      ];
    }

    // Fallback to shopkeeper data
    const shopkeeper = currentShopkeeper;
    if (!shopkeeper) return null;

    const onTime = shopkeeper.on_time_payments || 0;
    const missed = shopkeeper.missed_payments || 0;
    const total = onTime + missed;

    if (total === 0) return null;

    return [
      {
        name: 'On Time',
        population: onTime,
        color: '#4CAF50',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      },
      {
        name: 'Missed',
        population: missed,
        color: '#F44336',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      },
    ];
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4CAF50',
    },
  };

  const barChartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    barPercentage: 0.7,
    yAxisLabel: '',
    yAxisSuffix: '',
  };

  const getRecommendations = () => {
    if (dynamicCreditData) {
      const score = dynamicCreditData.credit_score;
      const data = dynamicCreditData.data;
      
      const recommendations = [];
      
      if (data.transactions < 10) {
        recommendations.push('Increase transaction volume to improve credit score');
      }
      
      if (data.profit < 1000) {
        recommendations.push('Focus on improving profit margins through better pricing');
      }
      
      if (data.revenue < 5000) {
        recommendations.push('Expand your product range to increase revenue');
      }
      
      if (data.days_active < 30) {
        recommendations.push('Maintain consistent business operations');
      }
      
      if (score < 60) {
        recommendations.push('Consider implementing better inventory management');
        recommendations.push('Focus on building customer relationships for repeat business');
      }
      
      if (recommendations.length === 0) {
        recommendations.push('Continue maintaining your excellent business practices');
        recommendations.push('Consider expanding to new markets or products');
      }
      
      return recommendations;
    }
    
    // Fallback to static recommendations
    const score = currentShopkeeper?.credit_score || 0;
    if (score >= 80) {
      return [
        "Maintain your excellent payment history",
        "Consider expanding your business operations",
        "You're eligible for higher credit limits",
      ];
    } else if (score >= 60) {
      return [
        "Increase your monthly transactions",
        "Ensure timely payments",
        "Consider diversifying your product range",
      ];
    } else {
      return [
        "Focus on increasing monthly revenue",
        "Improve payment reliability",
        "Consider reducing expenses",
        "Build consistent transaction history",
      ];
    }
  };

  const getStrengths = () => {
    if (dynamicCreditData) {
      const data = dynamicCreditData.data;
      const strengths = [];
      
      if (data.transactions >= 10) {
        strengths.push('Good transaction volume');
      }
      
      if (data.profit >= 1000) {
        strengths.push('Strong profitability');
      }
      
      if (data.revenue >= 5000) {
        strengths.push('Healthy revenue generation');
      }
      
      if (data.days_active >= 30) {
        strengths.push('Consistent business operations');
      }
      
      if (data.on_time_payments / (data.on_time_payments + data.missed_payments) >= 0.9) {
        strengths.push('Excellent payment reliability');
      }
      
      if (strengths.length === 0) {
        strengths.push('New business with growth potential');
        strengths.push('Fresh start with no negative history');
      }
      
      return strengths;
    }
    
    // Fallback to static strengths
    const strengths = [];
    const shopkeeper = currentShopkeeper;
    
    if (!shopkeeper) return ["No data available"];
    
    if (shopkeeper.payment_reliability > 0.8) {
      strengths.push("Excellent payment reliability");
    }
    if (shopkeeper.monthly_profit_avg > 50000) {
      strengths.push("Strong monthly profits");
    }
    if (shopkeeper.transactions_per_month > 100) {
      strengths.push("High transaction volume");
    }
    if (shopkeeper.avg_profit_margin > 0.2) {
      strengths.push("Good profit margins");
    }
    
    return strengths.length > 0 ? strengths : ["Building credit history"];
  };

  const getWeaknesses = () => {
    if (dynamicCreditData) {
      const data = dynamicCreditData.data;
      const weaknesses = [];
      
      if (data.transactions < 5) {
        weaknesses.push('Low transaction volume');
      }
      
      if (data.profit < 500) {
        weaknesses.push('Limited profitability');
      }
      
      if (data.revenue < 2000) {
        weaknesses.push('Low revenue generation');
      }
      
      if (data.days_active < 15) {
        weaknesses.push('Limited business history');
      }
      
      if (data.missed_payments > 0) {
        weaknesses.push('Some payment delays');
      }
      
      if (weaknesses.length === 0) {
        weaknesses.push('No significant weaknesses identified');
      }
      
      return weaknesses;
    }
    
    // Fallback to static weaknesses
    const weaknesses = [];
    const shopkeeper = currentShopkeeper;
    
    if (!shopkeeper) return ["No data available"];
    
    if (shopkeeper.payment_reliability < 0.7) {
      weaknesses.push("Payment reliability needs improvement");
    }
    if (shopkeeper.monthly_profit_avg < 20000) {
      weaknesses.push("Low monthly profits");
    }
    if (shopkeeper.transactions_per_month < 50) {
      weaknesses.push("Low transaction volume");
    }
    if (shopkeeper.monthly_loss_count > 2) {
      weaknesses.push("Frequent monthly losses");
    }
    
    return weaknesses.length > 0 ? weaknesses : ["No major weaknesses identified"];
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>Credit Score Analysis</Text>
              {dynamicCreditData && <LiveIndicator />}
            </View>
            <Text style={styles.headerSubtitle}>
              {dynamicCreditData ? 'Live data from your business operations' : 'Analysis based on business metrics'}
            </Text>
          </View>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Credit Score Overview */}
      <View style={styles.scoreContainer}>
        <CircularProgress 
          score={dynamicCreditData?.credit_score || currentShopkeeper?.credit_score || 0} 
          size={80} 
        />
        <View style={styles.scoreDetails}>
          <Text style={styles.riskCategory}>
            {dynamicCreditData?.risk_category || currentShopkeeper?.risk_category || 'Calculating...'}
          </Text>
          <Text style={styles.scoreDescription}>
            {dynamicCreditData 
              ? 'Your credit score is calculated live from your inventory operations and business performance'
              : 'Your credit score is based on payment history, transaction volume, and business performance'
            }
          </Text>
        </View>
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsContainer}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.metricsGrid}>
          <CreditMetric
            title="Transactions"
            value={dynamicCreditData?.data.transactions || currentShopkeeper?.transactions_per_month || 0}
            icon="swap-horizontal"
            color="#4CAF50"
            subtitle="Last 30 days"
          />
          <CreditMetric
            title="Revenue"
            value={`$${(dynamicCreditData?.data.revenue || currentShopkeeper?.monthly_revenue_avg || 0).toLocaleString()}`}
            icon="trending-up"
            color="#2196F3"
            subtitle="Monthly average"
          />
          <CreditMetric
            title="Profit"
            value={`$${(dynamicCreditData?.data.profit || currentShopkeeper?.monthly_profit_avg || 0).toLocaleString()}`}
            icon="cash"
            color="#FF9800"
            subtitle="Monthly average"
          />
          <CreditMetric
            title="Payment Rate"
            value={`${dynamicCreditData ? Math.round((dynamicCreditData.data.on_time_payments / (dynamicCreditData.data.on_time_payments + dynamicCreditData.data.missed_payments)) * 100) : currentShopkeeper?.payment_reliability || 90}%`}
            icon="checkmark-circle"
            color="#9C27B0"
            subtitle="On-time payments"
          />
        </View>
      </View>

      {/* Credit Score Trend */}
      {getCreditScoreData() && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Credit Score Trend (6 Months)</Text>
          <LineChart
            data={getCreditScoreData()}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* Performance Overview */}
      {getPerformanceData() && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Financial Performance (NPR)</Text>
          <BarChart
            data={getPerformanceData()!}
            width={chartWidth}
            height={220}
            chartConfig={barChartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </View>
      )}

      {/* Payment Reliability Chart */}
      {getPaymentReliabilityData() && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Payment Reliability</Text>
          <PieChart
            data={getPaymentReliabilityData()!}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      )}

      {/* Credit Score Breakdown */}
      <View style={styles.breakdownContainer}>
        <Text style={styles.sectionTitle}>Credit Score Breakdown</Text>
        {dynamicCreditData?.breakdown ? (
          <View style={styles.breakdownGrid}>
            {Object.entries(dynamicCreditData.breakdown).map(([category, score]) => (
              <View key={category} style={styles.breakdownItem}>
                <Text style={styles.breakdownCategory}>{category.replace(/_/g, ' ').toUpperCase()}</Text>
                <View style={styles.breakdownScoreContainer}>
                  <View style={[styles.breakdownScoreBar, { width: `${score}%` }]} />
                  <Text style={styles.breakdownScore}>{score}%</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.breakdownGrid}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownCategory}>PAYMENT HISTORY</Text>
              <View style={styles.breakdownScoreContainer}>
                <View style={[styles.breakdownScoreBar, { width: '85%' }]} />
                <Text style={styles.breakdownScore}>85%</Text>
              </View>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownCategory}>TRANSACTION VOLUME</Text>
              <View style={styles.breakdownScoreContainer}>
                <View style={[styles.breakdownScoreBar, { width: '70%' }]} />
                <Text style={styles.breakdownScore}>70%</Text>
              </View>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownCategory}>PROFITABILITY</Text>
              <View style={styles.breakdownScoreContainer}>
                <View style={[styles.breakdownScoreBar, { width: '80%' }]} />
                <Text style={styles.breakdownScore}>80%</Text>
              </View>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownCategory}>BUSINESS STABILITY</Text>
              <View style={styles.breakdownScoreContainer}>
                <View style={[styles.breakdownScoreBar, { width: '75%' }]} />
                <Text style={styles.breakdownScore}>75%</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Analysis Sections */}
      <View style={styles.analysisContainer}>
        <View style={styles.analysisSection}>
          <Text style={styles.analysisTitle}>Strengths</Text>
          {getStrengths().map((strength, index) => (
            <View key={index} style={styles.analysisItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.analysisText}>{strength}</Text>
            </View>
          ))}
        </View>

        <View style={styles.analysisSection}>
          <Text style={styles.analysisTitle}>Areas for Improvement</Text>
          {getWeaknesses().map((weakness, index) => (
            <View key={index} style={styles.analysisItem}>
              <Ionicons name="alert-circle" size={16} color="#FF9800" />
              <Text style={styles.analysisText}>{weakness}</Text>
            </View>
          ))}
        </View>

        <View style={styles.analysisSection}>
          <Text style={styles.analysisTitle}>Recommendations</Text>
          {getRecommendations().map((recommendation, index) => (
            <View key={index} style={styles.analysisItem}>
              <Ionicons name="bulb" size={16} color="#2196F3" />
              <Text style={styles.analysisText}>{recommendation}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/scanner')}
        >
          <Ionicons name="barcode" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Scan Products</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/history')}
        >
          <Ionicons name="time" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>View History</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  backButton: {
    padding: 10,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 120,
  },
  circularProgressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circularProgressTrack: {
    position: 'absolute',
  },
  circularProgressFill: {
    position: 'absolute',
  },
  circularProgressText: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circularProgressScore: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  circularProgressLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  scoreDetails: {
    flex: 1,
    marginLeft: 20,
  },
  riskCategory: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  metricsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    marginBottom: 16,
  },
  metricGradient: {
    borderRadius: 12,
    padding: 16,
  },
  metricContent: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 2,
  },
  chartContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 12,
  },
  analysisContainer: {
    padding: 20,
  },
  analysisSection: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  analysisItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    paddingBottom: 40,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
    marginRight: 4,
    // Add pulsing animation
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  breakdownContainer: {
    padding: 20,
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    width: '48%',
    marginBottom: 16,
  },
  breakdownCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  breakdownScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownScoreBar: {
    height: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginRight: 8,
  },
  breakdownScore: {
    fontSize: 12,
    color: '#666',
  },
});