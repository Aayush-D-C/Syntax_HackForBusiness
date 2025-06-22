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
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useScan } from '../../context/ScanContext';
import { apiService } from '../../services/apiService';

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
  const { inventory, operations } = useScan();
  const { logout } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [aiPredictions, setAiPredictions] = useState<{
    nextMonthProfit?: number;
    nextMonthRevenue?: number;
    growthProbability?: number;
  }>({});

  // Calculate inventory statistics
  const inventoryStats = {
    totalItems: inventory.length,
    totalValue: inventory.reduce((sum, item) => sum + (item.price * (item.quantity || 0)), 0),
    lowStockItems: inventory.filter(item => (item.quantity || 0) < 10).length,
    totalQuantity: inventory.reduce((sum, item) => sum + (item.quantity || 0), 0)
  };

  // Calculate recent activity
  const recentOperations = operations.slice(0, 5); // Last 5 operations
  const todayOperations = operations.filter(op => {
    const opDate = new Date(op.timestamp);
    const today = new Date();
    return opDate.toDateString() === today.toDateString();
  });

  // Handle error display
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error, clearError]);

  // Fetch AI predictions when shopkeeper data is available
  useEffect(() => {
    const fetchAiPredictions = async () => {
      if (currentShopkeeper?.shopkeeper_id) {
        try {
          const prediction = await apiService.predictBusinessPerformance(currentShopkeeper.shopkeeper_id);
          setAiPredictions({
            nextMonthProfit: prediction.next_month_profit,
            nextMonthRevenue: prediction.next_month_revenue,
            growthProbability: prediction.growth_probability
          });
        } catch (error) {
          console.error('Failed to fetch AI predictions:', error);
        }
      }
    };

    fetchAiPredictions();
  }, [currentShopkeeper?.shopkeeper_id]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
      // Also refresh AI predictions
      if (currentShopkeeper?.shopkeeper_id) {
        const prediction = await apiService.predictBusinessPerformance(currentShopkeeper.shopkeeper_id);
        setAiPredictions({
          nextMonthProfit: prediction.next_month_profit,
          nextMonthRevenue: prediction.next_month_revenue,
          growthProbability: prediction.growth_probability
        });
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const getMonthlyTrendsData = () => {
    const trends = dashboardStats?.monthly_trends;
    if (!trends || trends.length === 0) {
      // Return fallback data structure instead of null
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            data: [0, 0, 0, 0, 0, 0],
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            strokeWidth: 2
          },
          {
            data: [0, 0, 0, 0, 0, 0],
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            strokeWidth: 2
          }
        ],
        legend: ['Profit (K)', 'Revenue (K)']
      };
    }
  
    const labels = trends.map(trend => trend.month);
    const profitData = trends.map(trend => trend.total_profit / 1000);
    const revenueData = trends.map(trend => trend.total_revenue / 1000);
  
    return {
      labels,
      datasets: [
        {
          data: profitData,
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // green for profit
          strokeWidth: 2
        },
        {
          data: revenueData,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`, // blue for revenue
          strokeWidth: 2
        }
      ],
      legend: ['Profit (K)', 'Revenue (K)']
    };
  };
  

  

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#ffa726"
    }
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
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>My Business Dashboard</Text>
            <Text style={styles.headerSubtitle}>Welcome back, {currentShopkeeper?.name || 'Shopkeeper'}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
            <Ionicons name="person-circle" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
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
            title="Inventory Value"
            value={`NPR ${inventoryStats.totalValue.toLocaleString()}`}
            icon="cube"
            color="#2196F3"
            subtitle={`${inventoryStats.totalItems} items`}
            onPress={() => router.push('/(tabs)/stocks')}
          />
        </View>
        
        <View style={styles.statsRow}>
          <StatCard
            title="Total Stock"
            value={inventoryStats.totalQuantity}
            icon="card"
            color="#FF9800"
            subtitle="Items in stock"
            onPress={() => router.push('/(tabs)/stocks')}
          />
          <StatCard
            title="Today's Activity"
            value={todayOperations.length}
            icon="time"
            color="#9C27B0"
            subtitle="Operations today"
            onPress={() => router.push('/(tabs)/history')}
          />
        </View>

        {/* AI Predictions Row */}
        {aiPredictions.nextMonthProfit && (
          <View style={styles.statsRow}>
            <StatCard
              title="AI Predicted Profit"
              value={`NPR ${aiPredictions.nextMonthProfit.toLocaleString()}`}
              icon="trending-up"
              color="#9C27B0"
              subtitle="Next month"
            />
            <StatCard
              title="Growth Probability"
              value={`${((aiPredictions.growthProbability || 0) * 100).toFixed(1)}%`}
              icon="analytics"
              color="#FF5722"
              subtitle="AI forecast"
            />
          </View>
        )}

        {/* Low Stock Alert */}
        {inventoryStats.lowStockItems > 0 && (
          <View style={styles.alertContainer}>
            <View style={styles.alertContent}>
              <Ionicons name="warning" size={20} color="#FF9800" />
              <Text style={styles.alertText}>
                {inventoryStats.lowStockItems} item{inventoryStats.lowStockItems > 1 ? 's' : ''} running low on stock
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.alertButton}
              onPress={() => router.push('/(tabs)/stocks')}
            >
              <Text style={styles.alertButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>My Monthly Trends (in thousands NPR)</Text>
        <LineChart
          data={getMonthlyTrendsData()}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.actionsTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/scanner')}
          >
            <Ionicons name="barcode" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Scan Products</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/stocks')}
          >
            <Ionicons name="cube" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>View Inventory</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/history')}
          >
            <Ionicons name="time" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>History</Text>
          </TouchableOpacity>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  profileButton: {
    padding: 8,
  },
  statsContainer: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statCardGradient: {
    borderRadius: 12,
    padding: 16,
  },
  statCardContent: {
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  statCardTitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  statCardSubtitle: {
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
  actionsContainer: {
    padding: 20,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF3E0',
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FF9800',
    borderRadius: 12,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  alertButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FF9800',
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default HomeScreen;