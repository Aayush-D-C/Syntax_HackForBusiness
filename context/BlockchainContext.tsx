import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

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

interface PendingSale {
  id: string;
  storeId: string;
  products: Array<{
    name: string;
    price: number;
    category: string;
    barcode: string;
  }>;
  quantity: number;
  total: number;
  timestamp: string;
}

interface BlockchainContextType {
  blockchainData: {
    chain: BlockData[];
    isValid: boolean;
    summary: BlockchainSummary;
    difficulty: number;
    totalBlocks: number;
  } | null;
  pendingSales: PendingSale[];
  addSaleToBlockchain: (sale: PendingSale) => void;
  processPendingSales: () => void;
  clearPendingSales: () => void;
  refreshBlockchain: () => void;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

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

export const BlockchainProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [blockchainData, setBlockchainData] = useState(MOCK_BLOCKCHAIN_DATA);
  const [pendingSales, setPendingSales] = useState<PendingSale[]>([]);

  // Load pending sales from AsyncStorage
  useEffect(() => {
    const loadPendingSales = async () => {
      try {
        const savedSales = await AsyncStorage.getItem('pendingBlockchainSales');
        if (savedSales) {
          setPendingSales(JSON.parse(savedSales));
        }
      } catch (error) {
        console.error('Error loading pending sales:', error);
      }
    };

    loadPendingSales();
  }, []);

  const addSaleToBlockchain = useCallback((sale: PendingSale) => {
    // Create a new block with the sale data
    setBlockchainData(prevData => {
      const newBlockIndex = prevData.chain.length;
      const newBlock: BlockData = {
        index: newBlockIndex,
        hash: `000${newBlockIndex}mnop...`,
        previousHash: prevData.chain[prevData.chain.length - 1].hash,
        nonce: Math.floor(Math.random() * 10000),
        timestamp: new Date().toISOString(),
        transaction: {
          txid: `tx-${String(newBlockIndex).padStart(3, '0')}`,
          storeId: sale.storeId,
          total: sale.total,
          timestamp: sale.timestamp,
          products: sale.products
        }
      };

      // Update blockchain data
      const updatedChain = [...prevData.chain, newBlock];
      const newTotalSales = prevData.summary.totalSales + sale.products.length;
      const newTotalRevenue = prevData.summary.totalRevenue + sale.total;
      const newTransactions = prevData.summary.transactions + 1;

      const updatedBlockchainData = {
        ...prevData,
        chain: updatedChain,
        totalBlocks: updatedChain.length,
        summary: {
          ...prevData.summary,
          totalSales: newTotalSales,
          totalRevenue: newTotalRevenue,
          transactions: newTransactions,
          storeSales: {
            ...prevData.summary.storeSales,
            [sale.storeId]: {
              salesCount: (prevData.summary.storeSales[sale.storeId as keyof typeof prevData.summary.storeSales]?.salesCount || 0) + sale.products.length,
              revenue: (prevData.summary.storeSales[sale.storeId as keyof typeof prevData.summary.storeSales]?.revenue || 0) + sale.total
            }
          }
        }
      };

      console.log('Sale added to blockchain:', sale);
      return updatedBlockchainData;
    });
  }, []);

  const processPendingSales = useCallback(async () => {
    if (pendingSales.length === 0) return;

    // Process all pending sales
    for (const sale of pendingSales) {
      addSaleToBlockchain(sale);
    }

    // Clear pending sales
    setPendingSales([]);
    await AsyncStorage.removeItem('pendingBlockchainSales');
    
    console.log(`Processed ${pendingSales.length} pending sales`);
  }, [pendingSales, addSaleToBlockchain]);

  const clearPendingSales = useCallback(async () => {
    setPendingSales([]);
    await AsyncStorage.removeItem('pendingBlockchainSales');
  }, []);

  const refreshBlockchain = useCallback(() => {
    // This could be used to refresh blockchain data from a server
    console.log('Refreshing blockchain data...');
  }, []);

  const contextValue: BlockchainContextType = {
    blockchainData,
    pendingSales,
    addSaleToBlockchain,
    processPendingSales,
    clearPendingSales,
    refreshBlockchain,
  };

  return (
    <BlockchainContext.Provider value={contextValue}>
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = (): BlockchainContextType => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
}; 