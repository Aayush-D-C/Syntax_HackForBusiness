import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { CreditScoreData, creditScoreService } from '../services/creditScoreService';

export default function CreditScoreCalculator() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreditScoreData>({
    transactions: 0,
    on_time_payments: 0,
    missed_payments: 0,
    avg_transaction_amount: 0,
    profit: 0,
    revenue: 0,
    expenses: 0,
    days_active: 0,
  });
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const updateFormData = (field: keyof CreditScoreData, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setFormData(prev => ({ ...prev, [field]: numValue }));
  };

  const calculateCreditScore = async () => {
    setLoading(true);
    try {
      if (formData.transactions === 0 || formData.days_active === 0) {
        Alert.alert('Error', 'Please enter valid transaction and days active data');
        return;
      }

      const creditResult = creditScoreService.calculateCreditScoreSimple(formData);
      setResult(creditResult);
    } catch (error) {
      Alert.alert('Error', 'Failed to calculate credit score');
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    const sampleData = creditScoreService.generateSampleData();
    setFormData(sampleData);
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Credit Score Calculator</Text>
        <Text style={styles.headerSubtitle}>
          Calculate your business credit score
        </Text>
      </LinearGradient>

      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Business Metrics</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Total Transactions</Text>
          <TextInput
            style={styles.textInput}
            value={formData.transactions.toString()}
            onChangeText={(text) => updateFormData('transactions', text)}
            placeholder="Enter total transactions"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>On-time Payments</Text>
          <TextInput
            style={styles.textInput}
            value={formData.on_time_payments.toString()}
            onChangeText={(text) => updateFormData('on_time_payments', text)}
            placeholder="Enter on-time payments"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Missed Payments</Text>
          <TextInput
            style={styles.textInput}
            value={formData.missed_payments.toString()}
            onChangeText={(text) => updateFormData('missed_payments', text)}
            placeholder="Enter missed payments"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Average Transaction Amount (NPR)</Text>
          <TextInput
            style={styles.textInput}
            value={formData.avg_transaction_amount.toString()}
            onChangeText={(text) => updateFormData('avg_transaction_amount', text)}
            placeholder="Enter average amount"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Total Profit (NPR)</Text>
          <TextInput
            style={styles.textInput}
            value={formData.profit.toString()}
            onChangeText={(text) => updateFormData('profit', text)}
            placeholder="Enter total profit"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Total Revenue (NPR)</Text>
          <TextInput
            style={styles.textInput}
            value={formData.revenue.toString()}
            onChangeText={(text) => updateFormData('revenue', text)}
            placeholder="Enter total revenue"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Total Expenses (NPR)</Text>
          <TextInput
            style={styles.textInput}
            value={formData.expenses.toString()}
            onChangeText={(text) => updateFormData('expenses', text)}
            placeholder="Enter total expenses"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Days Active</Text>
          <TextInput
            style={styles.textInput}
            value={formData.days_active.toString()}
            onChangeText={(text) => updateFormData('days_active', text)}
            placeholder="Enter days active"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.sampleButton}
            onPress={generateSampleData}
          >
            <Ionicons name="refresh" size={20} color="#667eea" />
            <Text style={styles.sampleButtonText}>Generate Sample Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.calculateButton, loading && styles.calculateButtonDisabled]}
            onPress={calculateCreditScore}
            disabled={loading}
          >
            <Ionicons name="calculator" size={20} color="#fff" />
            <Text style={styles.calculateButtonText}>
              {loading ? 'Calculating...' : 'Calculate Credit Score'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {result && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Credit Score Results</Text>
          
          <View style={styles.scoreCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.scoreGradient}
            >
              <Text style={styles.scoreLabel}>Your Credit Score</Text>
              <Text style={styles.scoreValue}>{result.credit_score}</Text>
              <Text style={styles.riskCategory}>{result.risk_category}</Text>
              <Text style={styles.scoreDate}>
                Calculated on {new Date(result.calculation_date).toLocaleDateString()}
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.recommendationsContainer}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {creditScoreService.getRecommendations(result.credit_score).map((recommendation, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Ionicons name="bulb" size={16} color="#FFC107" />
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
  },
  sampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sampleButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#667eea',
    borderRadius: 8,
  },
  calculateButtonDisabled: {
    opacity: 0.6,
  },
  calculateButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  resultsContainer: {
    padding: 20,
  },
  scoreCard: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreGradient: {
    padding: 24,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  riskCategory: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
  },
  scoreDate: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  recommendationsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
});
