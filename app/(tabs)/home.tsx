// app/(tabs)/home.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useData } from '../../context/DataContext';

const { width } = Dimensions.get('window');
const chartWidth = width - 40;

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle,
  onPress 
}) => (
  <TouchableOpacity onPress={onPress} style={styles.statCard}>
    <LinearGradient
      colors={[color, `${color}80`]}
      style={styles.statCardGradient}
    >
      <View style={styles.statCardContent}>
        <Ionicons name={icon as any} size={24} color="#fff" />
        <Text style={styles.statCardValue}>{value}</Text>
        <Text style={styles.statCardTitle}>{title}</Text>
        {subtitle && <Text style={styles.statCardSubtitle}>{subtitle}</Text>}
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const getRiskColor = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'excellent': return '#4CAF50';
    case 'good': return '#8BC34A';
    case 'fair': return '#FFC107';
    case 'moderate risk': return '#FF9800';
    case 'high risk': return '#F44336';
    default: return '#9E9E9E';
  }
};

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { 
    currentShopkeeper, 
    dashboardStats, 
    error, 
    refreshData,
    clearError 
  } = useData();
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error, clearError]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  };

  const getMonthlyTrendsData = () => {
    if (!dashboardStats?.monthly_trends) return null;

    const labels = dashboardStats.monthly_trends.map(trend => trend.month);
    const profitData = dashboardStats.monthly_trends.map(trend => trend.total_profit / 1000); // In thousands
    const revenueData = dashboardStats.monthly_trends.map(trend => trend.total_revenue / 1000);

    return {
      labels,
      datasets: [
        {
          data: profitData,
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: revenueData,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          strokeWidth: 2,
        }
      ],
      legend: ['Profit (K)', 'Revenue (K)']
    };
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>My Business Dashboard</Text>
        <Text style={styles.headerSubtitle}>Welcome back, {currentShopkeeper?.name || 'Shopkeeper'}</Text>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <StatCard
            title="My Credit Score"
            value={currentShopkeeper?.credit_score || 0}
            icon="star"
            color="#4CAF50"
            subtitle={currentShopkeeper?.risk_category || 'Calculating...'}
            onPress={() => router.push('/predict')}
          />
          <StatCard
            title="Monthly Profit"
            value={`NPR ${currentShopkeeper?.monthly_profit_avg?.toLocaleString() || '0'}`}
            icon="trending-up"
            color="#2196F3"
          />
        </View>
        
        <View style={styles.statsRow}>
          <StatCard
            title="Transactions"
            value={currentShopkeeper?.transactions_per_month || 0}
            icon="card"
            color="#FF9800"
            subtitle="This month"
          />
          <StatCard
            title="Payment Reliability"
            value={`${((currentShopkeeper?.payment_reliability || 0) * 100).toFixed(1)}%`}
            icon="checkmark-circle"
            color="#4CAF50"
            subtitle="On-time payments"
          />
        </View>
      </View>

      {/* Monthly Trends */}
      {getMonthlyTrendsData() && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>My Monthly Trends (in thousands NPR)</Text>
          <LineChart
            data={getMonthlyTrendsData()!}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/predict')}
          >
            <Ionicons name="analytics" size={24} color="#667eea" />
            <Text style={styles.actionButtonText}>Credit Analysis</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/scanner')}
          >
            <Ionicons name="barcode" size={24} color="#667eea" />
            <Text style={styles.actionButtonText}>Scan Products</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/history')}
          >
            <Ionicons name="time" size={24} color="#667eea" />
            <Text style={styles.actionButtonText}>Transaction History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Business Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Insights</Text>
        <View style={styles.insightCard}>
          <Ionicons name="bulb" size={20} color="#FFC107" />
          <Text style={styles.insightText}>
            {(currentShopkeeper?.credit_score ?? 0) >= 80 
              ? "Excellent! Your credit score shows strong business performance."
              : (currentShopkeeper?.credit_score ?? 0) >= 60
              ? "Good progress! Focus on increasing transactions to improve your score."
              : "Consider increasing your monthly transactions to boost your credit score."
            }
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

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
  statsContainer: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statCardGradient: {
    padding: 20,
  },
  statCardContent: {
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statCardTitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
    textAlign: 'center',
  },
  statCardSubtitle: {
    fontSize: 12,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  section: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    minWidth: 80,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  insightText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});

export default HomeScreen;