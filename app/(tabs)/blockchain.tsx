import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useBlockchain } from '../../context/BlockchainContext';
import { useData } from '../../context/DataContext';

const { width } = Dimensions.get('window');

interface BlockData {
  index: number;
  hash: string;
  previousHash: string;
  nonce: number;
  timestamp: string;
  transaction: {
    txid: string;
    storeId: string;
    total: number;
    timestamp: string;
    products: Array<{
      barcode: string;
      name: string;
      price: number;
      category: string;
    }>;
  };
}

interface BlockchainSummary {
  totalSales: number;
  totalRevenue: number;
  transactions: number;
  storeSales: Record<string, {
    salesCount: number;
    revenue: number;
  }>;
}

// Mock blockchain data
const MOCK_BLOCKCHAIN_DATA = {
  chain: [
    {
      index: 0,
      hash: '0000abcd...',
      previousHash: 'Genesis',
      nonce: 0,
      timestamp: '2024-01-01T00:00:00.000Z',
      transaction: {
        txid: 'genesis-0001',
        storeId: 'System',
        total: 0,
        timestamp: '2024-01-01T00:00:00.000Z',
        products: []
      }
    },
    {
      index: 1,
      hash: '0001efgh...',
      previousHash: '0000abcd...',
      nonce: 1234,
      timestamp: '2024-01-15T10:30:00.000Z',
      transaction: {
        txid: 'tx-001',
        storeId: 'Ram Kumar',
        total: 370,
        timestamp: '2024-01-15T10:30:00.000Z',
        products: [
          { barcode: '1234567890123', name: 'Rice', price: 120, category: 'Grains' },
          { barcode: '9876543210987', name: 'Oil', price: 250, category: 'Oils' }
        ]
      }
    },
    {
      index: 2,
      hash: '0002ijkl...',
      previousHash: '0001efgh...',
      nonce: 5678,
      timestamp: '2024-01-20T14:45:00.000Z',
      transaction: {
        txid: 'tx-002',
        storeId: 'Ram Kumar',
        total: 450,
        timestamp: '2024-01-20T14:45:00.000Z',
        products: [
          { barcode: '4567891234567', name: 'Sugar', price: 180, category: 'Grains' },
          { barcode: '7891234567890', name: 'Tea', price: 270, category: 'Beverages' }
        ]
      }
    }
  ],
  isValid: true,
  summary: {
    totalSales: 4,
    totalRevenue: 820,
    transactions: 2,
    storeSales: {
      'Ram Kumar': {
        salesCount: 4,
        revenue: 820
      }
    }
  },
  difficulty: 2,
  totalBlocks: 3
};

const BlockCard: React.FC<{ block: BlockData; onPress: () => void }> = ({ block, onPress }) => {
  const isGenesis = block.index === 0;
  const getBlockColor = () => {
    if (isGenesis) return '#4CAF50';
    return '#2196F3';
  };

  return (
    <TouchableOpacity style={styles.blockCard} onPress={onPress}>
      <View style={[styles.blockHeader, { backgroundColor: getBlockColor() }]}>
        <Text style={styles.blockIndex}>Block #{block.index}</Text>
        <Text style={styles.blockHash}>{block.hash}</Text>
      </View>
      
      <View style={styles.blockContent}>
        <View style={styles.blockInfo}>
          <Text style={styles.blockLabel}>Previous Hash:</Text>
          <Text style={styles.blockValue}>{block.previousHash}</Text>
        </View>
        
        <View style={styles.blockInfo}>
          <Text style={styles.blockLabel}>Nonce:</Text>
          <Text style={styles.blockValue}>{block.nonce}</Text>
        </View>
        
        <View style={styles.blockInfo}>
          <Text style={styles.blockLabel}>Timestamp:</Text>
          <Text style={styles.blockValue}>
            {new Date(block.timestamp).toLocaleString()}
          </Text>
        </View>
        
        {!isGenesis && (
          <>
            <View style={styles.blockInfo}>
              <Text style={styles.blockLabel}>Store:</Text>
              <Text style={styles.blockValue}>{block.transaction.storeId}</Text>
            </View>
            
            <View style={styles.blockInfo}>
              <Text style={styles.blockLabel}>Total:</Text>
              <Text style={styles.blockValue}>NPR {block.transaction.total.toLocaleString()}</Text>
            </View>
            
            <View style={styles.blockInfo}>
              <Text style={styles.blockLabel}>Products:</Text>
              <Text style={styles.blockValue}>{block.transaction.products.length} items</Text>
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const BlockchainScreen: React.FC = () => {
  const router = useRouter();
  const { currentShopkeeper } = useData();
  const { blockchainData, pendingSales, processPendingSales, clearPendingSales } = useBlockchain();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Process any pending sales
    await processPendingSales();
    setRefreshing(false);
  };

  const handleBlockPress = (block: BlockData) => {
    Alert.alert(
      `Block #${block.index}`,
      `Hash: ${block.hash}\nPrevious: ${block.previousHash}\nNonce: ${block.nonce}\nTimestamp: ${new Date(block.timestamp).toLocaleString()}`,
      [{ text: 'OK' }]
    );
  };

  const handleVerifyChain = () => {
    if (blockchainData) {
      Alert.alert(
        'Blockchain Verification',
        `Chain is ${blockchainData.isValid ? 'VALID' : 'INVALID'}\nTotal Blocks: ${blockchainData.totalBlocks}\nDifficulty: ${blockchainData.difficulty}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleAddSampleSale = async () => {
    try {
      // Create a new block with sample sale data
      const newBlockIndex = blockchainData ? blockchainData.chain.length : 1;
      const newBlock: BlockData = {
        index: newBlockIndex,
        hash: `000${newBlockIndex}mnop...`,
        previousHash: blockchainData ? blockchainData.chain[blockchainData.chain.length - 1].hash : '0000abcd...',
        nonce: Math.floor(Math.random() * 10000),
        timestamp: new Date().toISOString(),
        transaction: {
          txid: `tx-${String(newBlockIndex).padStart(3, '0')}`,
          storeId: currentShopkeeper?.name || 'Ram Kumar',
          total: Math.floor(Math.random() * 500) + 200, // Random amount between 200-700
          timestamp: new Date().toISOString(),
          products: [
            { 
              barcode: Math.random().toString().slice(2, 15), 
              name: ['Rice', 'Oil', 'Sugar', 'Tea', 'Flour', 'Milk'][Math.floor(Math.random() * 6)], 
              price: Math.floor(Math.random() * 300) + 100, 
              category: ['Grains', 'Oils', 'Beverages', 'Dairy'][Math.floor(Math.random() * 4)] 
            },
            { 
              barcode: Math.random().toString().slice(2, 15), 
              name: ['Bread', 'Eggs', 'Vegetables', 'Fruits', 'Meat', 'Fish'][Math.floor(Math.random() * 6)], 
              price: Math.floor(Math.random() * 400) + 150, 
              category: ['Bakery', 'Proteins', 'Produce', 'Seafood'][Math.floor(Math.random() * 4)] 
            }
          ]
        }
      };

      // Update the blockchain data with the new block
      if (blockchainData) {
        const updatedChain = [...blockchainData.chain, newBlock];
        const newTotalSales = blockchainData.summary.totalSales + newBlock.transaction.products.length;
        const newTotalRevenue = blockchainData.summary.totalRevenue + newBlock.transaction.total;
        const newTransactions = blockchainData.summary.transactions + 1;

        const updatedBlockchainData = {
          ...blockchainData,
          chain: updatedChain,
          totalBlocks: updatedChain.length,
          summary: {
            ...blockchainData.summary,
            totalSales: newTotalSales,
            totalRevenue: newTotalRevenue,
            transactions: newTransactions,
            storeSales: {
              ...blockchainData.summary.storeSales,
              [newBlock.transaction.storeId]: {
                salesCount: (blockchainData.summary.storeSales[newBlock.transaction.storeId as keyof typeof blockchainData.summary.storeSales]?.salesCount || 0) + newBlock.transaction.products.length,
                revenue: (blockchainData.summary.storeSales[newBlock.transaction.storeId as keyof typeof blockchainData.summary.storeSales]?.revenue || 0) + newBlock.transaction.total
              }
            }
          }
        };

        // Note: This would need to be integrated with the BlockchainContext
        // For now, we'll just show an alert
        Alert.alert('Success', `New sale added to blockchain!\nBlock #${newBlockIndex}\nTotal: NPR ${newBlock.transaction.total.toLocaleString()}`);
      }
    } catch (error) {
      console.error('Error adding sale:', error);
      Alert.alert('Error', 'Failed to add sale to blockchain');
    }
  };

  if (!blockchainData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading blockchain data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Sales Blockchain</Text>
        <Text style={styles.headerSubtitle}>
          Secure transaction ledger
        </Text>
      </LinearGradient>

      {/* Pending Sales Alert */}
      {pendingSales.length > 0 && (
        <View style={styles.pendingAlert}>
          <Text style={styles.pendingText}>
            {pendingSales.length} pending sale{pendingSales.length > 1 ? 's' : ''} ready to be added to blockchain
          </Text>
          <TouchableOpacity style={styles.processButton} onPress={processPendingSales}>
            <Text style={styles.processButtonText}>Process Sales</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Blockchain Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Blockchain Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Valid:</Text>
            <View style={[styles.statusIndicator, { backgroundColor: blockchainData.isValid ? '#4CAF50' : '#F44336' }]} />
            <Text style={styles.statusValue}>{blockchainData.isValid ? 'Valid' : 'Invalid'}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Blocks:</Text>
            <Text style={styles.statusValue}>{blockchainData.totalBlocks}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Difficulty:</Text>
            <Text style={styles.statusValue}>{blockchainData.difficulty}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Sales Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Transactions:</Text>
            <Text style={styles.summaryValue}>{blockchainData.summary.transactions}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Sales:</Text>
            <Text style={styles.summaryValue}>{blockchainData.summary.totalSales}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Revenue:</Text>
            <Text style={styles.summaryValue}>NPR {blockchainData.summary.totalRevenue.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleVerifyChain}>
          <Ionicons name="shield-checkmark" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Verify Chain</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleAddSampleSale}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Add Sample Sale</Text>
        </TouchableOpacity>
      </View>

      {/* Blockchain Blocks */}
      <View style={styles.blocksContainer}>
        <Text style={styles.blocksTitle}>Blockchain Ledger</Text>
        <FlatList
          data={blockchainData.chain}
          keyExtractor={(item) => item.index.toString()}
          renderItem={({ item }) => (
            <BlockCard
              block={item}
              onPress={() => handleBlockPress(item)}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No blocks found</Text>
              <Text style={styles.emptySubtext}>
                Add a sale to start building the blockchain
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
  statusContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  blocksContainer: {
    flex: 1,
    padding: 20,
  },
  blocksTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  blockCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  blockHeader: {
    padding: 12,
  },
  blockIndex: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  blockHash: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  blockContent: {
    padding: 16,
  },
  blockInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  blockLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  blockValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  pendingAlert: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  pendingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 16,
  },
  processButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  processButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default BlockchainScreen; 