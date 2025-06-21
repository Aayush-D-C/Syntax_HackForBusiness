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

const CircularProgress: React.FC<{ score: number; size?: number }> = ({ score, size = 120 }) => {
  const color = getCreditScoreColor(score);

  return (
    <View style={[styles.circularProgressContainer, { width: size, height: size }]}>
      <View style={styles.circularProgress}>
        <View
          style={[
            styles.circularProgressTrack,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 8,
              borderColor: '#f0f0f0',
            },
          ]}
        />
        <View
          style={[
            styles.circularProgressFill,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 8,
              borderColor: color,
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              transform: [{ rotate: '-90deg' }],
            },
          ]}
        />
      </View>
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error, clearError]);

  const getCreditScoreData = () => {
    // Mock data - in real app, this would come from API
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const scores = [65, 68, 72, 75, 78, currentShopkeeper?.credit_score || 75];
    
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
  };

  const getRecommendations = () => {
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
        <Text style={styles.headerTitle}>Credit Analysis</Text>
        <Text style={styles.headerSubtitle}>Your business credit insights</Text>
      </LinearGradient>

      {/* Credit Score Overview */}
      <View style={styles.scoreContainer}>
        <CircularProgress score={currentShopkeeper?.credit_score || 0} />
        <View style={styles.scoreDetails}>
          <Text style={styles.riskCategory}>
            {currentShopkeeper?.risk_category || 'Calculating...'}
          </Text>
          <Text style={styles.scoreDescription}>
            Your credit score is based on payment history, transaction volume, and business performance
          </Text>
        </View>
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsContainer}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.metricsGrid}>
          <CreditMetric
            title="Payment Reliability"
            value={`${((currentShopkeeper?.payment_reliability || 0) * 100).toFixed(1)}%`}
            icon="checkmark-circle"
            color="#4CAF50"
            subtitle="On-time payments"
          />
          <CreditMetric
            title="Monthly Transactions"
            value={currentShopkeeper?.transactions_per_month || 0}
            icon="card"
            color="#2196F3"
            subtitle="Average per month"
          />
          <CreditMetric
            title="Profit Margin"
            value={`${(currentShopkeeper?.avg_profit_margin || 0).toFixed(1)}%`}
            icon="trending-up"
            color="#FF9800"
            subtitle="Monthly average"
          />
          <CreditMetric
            title="Business Days"
            value={currentShopkeeper?.days_active || 0}
            icon="calendar"
            color="#9C27B0"
            subtitle="Active days"
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
  },
  circularProgressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgress: {
    position: 'absolute',
  },
  circularProgressTrack: {
    position: 'absolute',
  },
  circularProgressFill: {
    position: 'absolute',
  },
  circularProgressText: {
    alignItems: 'center',
  },
  circularProgressScore: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  circularProgressLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
});