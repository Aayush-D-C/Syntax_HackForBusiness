import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useData } from '../../context/DataContext';

export default function ShopkeeperDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { fetchShopkeeperById, currentShopkeeper, loading } = useData();

  useEffect(() => {
    if (id) {
      fetchShopkeeperById(id as string);
    }
  }, [id, fetchShopkeeperById]);

  if (loading && !currentShopkeeper) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#448BEF" />
        <Text style={styles.loadingText}>Loading shopkeeper details...</Text>
      </View>
    );
  }

  if (!currentShopkeeper) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Shopkeeper not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#448BEF', '#6B44EF']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentShopkeeper.name}</Text>
        <Text style={styles.headerSubtitle}>{currentShopkeeper.business_type}</Text>
      </LinearGradient>

      {/* Shopkeeper Details */}
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Business Type:</Text>
            <Text style={styles.infoValue}>{currentShopkeeper.business_type}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Transactions per Month:</Text>
            <Text style={styles.infoValue}>{currentShopkeeper.transactions_per_month}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Days Active:</Text>
            <Text style={styles.infoValue}>{currentShopkeeper.days_active}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Metrics</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Credit Score:</Text>
            <Text style={[styles.infoValue, { color: currentShopkeeper.credit_score >= 80 ? '#448BEF' : currentShopkeeper.credit_score >= 60 ? '#44D3EF' : '#6B44EF' }]}>
              {currentShopkeeper.credit_score}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Risk Category:</Text>
            <Text style={[styles.infoValue, { color: currentShopkeeper.risk_category === 'High Risk' ? '#F44336' : currentShopkeeper.risk_category === 'Excellent' ? '#448BEF' : '#44D3EF' }]}>
              {currentShopkeeper.risk_category}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Monthly Profit Avg:</Text>
            <Text style={styles.infoValue}>NPR {currentShopkeeper.monthly_profit_avg?.toLocaleString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Monthly Revenue Avg:</Text>
            <Text style={styles.infoValue}>NPR {currentShopkeeper.monthly_revenue_avg?.toLocaleString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Avg Transaction Amount:</Text>
            <Text style={styles.infoValue}>NPR {currentShopkeeper.avg_transaction_amount?.toLocaleString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Profit Margin:</Text>
            <Text style={styles.infoValue}>{currentShopkeeper.avg_profit_margin?.toFixed(2)}%</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>On-time Payments:</Text>
            <Text style={styles.infoValue}>{currentShopkeeper.on_time_payments}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Missed Payments:</Text>
            <Text style={styles.infoValue}>{currentShopkeeper.missed_payments}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Reliability:</Text>
            <Text style={styles.infoValue}>{(currentShopkeeper.payment_reliability * 100).toFixed(1)}%</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Monthly Loss Count:</Text>
            <Text style={styles.infoValue}>{currentShopkeeper.monthly_loss_count}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF3FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EAF3FF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EAF3FF',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    backgroundColor: '#448BEF',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginTop: 5,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  backButtonText: {
    color: '#448BEF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 