import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useData } from '../context/DataContext';

export default function AddShopkeeperScreen() {
  const router = useRouter();
  const { addShopkeeper } = useData();
  
  const [formData, setFormData] = useState({
    name: '',
    business_type: '',
    transactions_per_month: '',
    avg_transaction_amount: '',
    profit: '',
    revenue: '',
    expenses: '',
    days_active: '',
  });

  const handleSave = async () => {
    if (!formData.name || !formData.business_type) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await addShopkeeper({
        shopkeeper_id: Date.now().toString(), // Generate a temporary ID
        name: formData.name,
        business_type: formData.business_type,
        month: new Date().getMonth() + 1,
        transactions: parseInt(formData.transactions_per_month) || 0,
        on_time_payments: 0,
        missed_payments: 0,
        avg_transaction_amount: parseFloat(formData.avg_transaction_amount) || 0,
        profit: parseFloat(formData.profit) || 0,
        revenue: parseFloat(formData.revenue) || 0,
        expenses: parseFloat(formData.expenses) || 0,
        days_active: parseInt(formData.days_active) || 0,
      });
      Alert.alert('Success', 'Shopkeeper added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch {
      Alert.alert('Error', 'Failed to add shopkeeper');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#448BEF', '#6B44EF']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Shopkeeper</Text>
        <Text style={styles.headerSubtitle}>Enter shopkeeper information</Text>
      </LinearGradient>

      {/* Add Form */}
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter shopkeeper name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Business Type *</Text>
            <TextInput
              style={styles.input}
              value={formData.business_type}
              onChangeText={(text) => setFormData({ ...formData, business_type: text })}
              placeholder="Enter business type"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Metrics</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Transactions per Month</Text>
            <TextInput
              style={styles.input}
              value={formData.transactions_per_month}
              onChangeText={(text) => setFormData({ ...formData, transactions_per_month: text })}
              placeholder="Enter transactions per month"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Average Transaction Amount</Text>
            <TextInput
              style={styles.input}
              value={formData.avg_transaction_amount}
              onChangeText={(text) => setFormData({ ...formData, avg_transaction_amount: text })}
              placeholder="Enter average transaction amount"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Days Active</Text>
            <TextInput
              style={styles.input}
              value={formData.days_active}
              onChangeText={(text) => setFormData({ ...formData, days_active: text })}
              placeholder="Enter days active"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Monthly Revenue</Text>
            <TextInput
              style={styles.input}
              value={formData.revenue}
              onChangeText={(text) => setFormData({ ...formData, revenue: text })}
              placeholder="Enter monthly revenue"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Monthly Expenses</Text>
            <TextInput
              style={styles.input}
              value={formData.expenses}
              onChangeText={(text) => setFormData({ ...formData, expenses: text })}
              placeholder="Enter monthly expenses"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Monthly Profit</Text>
            <TextInput
              style={styles.input}
              value={formData.profit}
              onChangeText={(text) => setFormData({ ...formData, profit: text })}
              placeholder="Enter monthly profit"
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Add Shopkeeper</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF3FF',
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
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#44D3EF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#212121',
  },
  saveButton: {
    backgroundColor: '#448BEF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 