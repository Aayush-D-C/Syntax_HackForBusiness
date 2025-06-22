import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
  const [blockchainData, setBlockchainData] = useState<{
    chain: BlockData[];
    isValid: boolean;
    summary: BlockchainSummary;
    difficulty: number;
    totalBlocks: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBlockchainData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/blockchain/status', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setBlockchainData(result.data);
      } else {
        console.error('Failed to fetch blockchain data');
      }
    } catch (error) {
      console.error('Error fetching blockchain data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockchainData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBlockchainData();
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
      const sampleProducts = [
        { name: 'Rice', price: 120, category: 'Grains', barcode: '1234567890123' },
        { name: 'Oil', price: 250, category: 'Oils', barcode: '9876543210987' }
      ];

      const saleData = {
        storeId: currentShopkeeper?.name || 'Shop-1',
        products: sampleProducts
      };

      const response = await fetch('http://localhost:3001/api/blockchain/sale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Sample sale added to blockchain!');
        fetchBlockchainData();
      } else {
        Alert.alert('Error', 'Failed to add sale to blockchain');
      }
    } catch (error) {
      console.error('Error adding sale:', error);
      Alert.alert('Error', 'Failed to add sale to blockchain');
    }
  };

  if (loading) {
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

      {/* Blockchain Status */}
      {blockchainData && (
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
      )}

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
          data={blockchainData?.chain || []}
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
});

export default BlockchainScreen; 