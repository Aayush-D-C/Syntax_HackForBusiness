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
import { LineChart } from 'react-native-chart-kit';
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
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreValue}>
            {currentShopkeeper?.credit_score || 0}
          </Text>
          <Text style={styles.scoreLabel}>Credit Score</Text>
        </View>
        <View style={styles.scoreDetails}>
          <Text style={[
            styles.riskCategory,
            { color: getRiskCategoryColor(currentShopkeeper?.risk_category || 'Fair') }
          ]}>
            {currentShopkeeper?.risk_category || 'Calculating...'}
          </Text>
          <Text style={styles.scoreDescription}>
            {currentShopkeeper?.credit_score >= 80 
              ? "Excellent credit standing"
              : currentShopkeeper?.credit_score >= 60
              ? "Good credit standing"
              : "Needs improvement"
            }
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
            title="Monthly Profit"
            value={`NPR ${(currentShopkeeper?.monthly_profit_avg || 0).toLocaleString()}`}
            icon="trending-up"
            color="#2196F3"
            subtitle="Average monthly"
          />
          <CreditMetric
            title="Transactions"
            value={currentShopkeeper?.transactions_per_month || 0}
            icon="card"
            color="#FF9800"
            subtitle="Per month"
          />
          <CreditMetric
            title="Profit Margin"
            value={`${(currentShopkeeper?.avg_profit_margin || 0) * 100}%`}
            icon="pie-chart"
            color="#9C27B0"
            subtitle="Average margin"
          />
        </View>
      </View>

      {/* Credit Score Trend */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Credit Score Trend</Text>
        <LineChart
          data={getCreditScoreData()}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Strengths & Weaknesses */}
      <View style={styles.analysisContainer}>
        <View style={styles.analysisSection}>
          <Text style={styles.analysisTitle}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            {' '}Strengths
          </Text>
          {getStrengths().map((strength, index) => (
            <View key={index} style={styles.analysisItem}>
              <Text style={styles.analysisText}>• {strength}</Text>
            </View>
          ))}
        </View>

        <View style={styles.analysisSection}>
          <Text style={styles.analysisTitle}>
            <Ionicons name="alert-circle" size={20} color="#FF9800" />
            {' '}Areas for Improvement
          </Text>
          {getWeaknesses().map((weakness, index) => (
            <View key={index} style={styles.analysisItem}>
              <Text style={styles.analysisText}>• {weakness}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recommendations */}
      <View style={styles.recommendationsContainer}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        {getRecommendations().map((recommendation, index) => (
          <View key={index} style={styles.recommendationItem}>
            <Ionicons name="bulb" size={16} color="#FFC107" />
            <Text style={styles.recommendationText}>{recommendation}</Text>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/scanner')}
        >
          <Ionicons name="barcode" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Scan Products</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/history')}
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
    paddingTop: 50,
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
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  scoreDetails: {
    flex: 1,
  },
  riskCategory: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#666',
  },
  metricsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  metricGradient: {
    padding: 15,
  },
  metricContent: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  metricTitle: {
    fontSize: 12,
    color: '#fff',
    marginTop: 5,
    textAlign: 'center',
  },
  metricSubtitle: {
    fontSize: 10,
    color: '#fff',
    opacity: 0.8,
    marginTop: 2,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
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
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  analysisItem: {
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  recommendationsContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    paddingBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});