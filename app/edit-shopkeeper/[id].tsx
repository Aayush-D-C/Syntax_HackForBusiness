import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useData } from '../../context/DataContext';

const API_BASE_URL = 'http://your-backend-url.com/api'; // Replace with your actual API URL

export default function EditShopkeeperScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { fetchShopkeeperById, updateShopkeeper, currentShopkeeper, loading } = useData();
  
  const [formData, setFormData] = useState({
    name: '',
    business_type: '',
    transactions_per_month: '',
    avg_transaction_amount: '',
  });

  useEffect(() => {
    if (id) {
      fetchShopkeeperById(id as string);
    }
  }, [id, fetchShopkeeperById]);

  useEffect(() => {
    if (currentShopkeeper) {
      setFormData({
        name: currentShopkeeper.name,
        business_type: currentShopkeeper.business_type,
        transactions_per_month: currentShopkeeper.transactions_per_month.toString(),
        avg_transaction_amount: currentShopkeeper.avg_transaction_amount.toString(),
      });
    }
  }, [currentShopkeeper]);

  const handleSave = async () => {
    if (!formData.name || !formData.business_type) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await updateShopkeeper(id as string, {
        name: formData.name,
        business_type: formData.business_type,
        transactions_per_month: parseInt(formData.transactions_per_month) || 0,
        avg_transaction_amount: parseFloat(formData.avg_transaction_amount) || 0,
      });
      Alert.alert('Success', 'Shopkeeper updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch {
      Alert.alert('Error', 'Failed to update shopkeeper');
    }
  };

  if (loading && !currentShopkeeper) {
    return (
      <View style={styles.loadingContainer}>
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
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Shopkeeper</Text>
        <Text style={styles.headerSubtitle}>{currentShopkeeper.name}</Text>
      </LinearGradient>

      {/* Edit Form */}
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
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EAF3FF',
  },
  loadingText: {
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
  backButtonText: {
    color: '#448BEF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 