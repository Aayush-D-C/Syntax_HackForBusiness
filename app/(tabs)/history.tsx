import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useScan } from '../../context/ScanContext';

interface HistoryItemProps {
  operation: any;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ operation }) => {
  const isAdd = operation.type === 'add';
  
  return (
    <View style={styles.historyItem}>
      <View style={styles.operationIcon}>
        <Ionicons 
          name={isAdd ? "add-circle" : "remove-circle"} 
          size={24} 
          color={isAdd ? "#4CAF50" : "#F44336"} 
        />
      </View>
      
      <View style={styles.operationDetails}>
        <Text style={styles.productName}>{operation.product.name}</Text>
        <Text style={styles.operationInfo}>
          {isAdd ? 'Added' : 'Removed'} {operation.quantity} units
        </Text>
        <Text style={styles.timestamp}>
          {new Date(operation.timestamp).toLocaleString()}
        </Text>
      </View>
      
      <View style={styles.operationValue}>
        <Text style={styles.valueText}>
          NPR {(operation.quantity * operation.product.price).toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

export default function HistoryScreen() {
  const { operations } = useScan();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory History</Text>
        <Text style={styles.headerSubtitle}>
          Recent inventory operations
        </Text>
      </View>

      <FlatList
        data={operations}
        keyExtractor={(item, index) => `${item.timestamp}-${index}`}
        renderItem={({ item }) => <HistoryItem operation={item} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No operations yet</Text>
            <Text style={styles.emptySubtext}>
              Start scanning products to see inventory history
            </Text>
          </View>
        }
      />
    </SafeAreaView>
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
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginTop: 5,
  },
  listContainer: {
    padding: 20,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  operationIcon: {
    marginRight: 16,
    justifyContent: 'center',
  },
  operationDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  operationInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  operationValue: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});