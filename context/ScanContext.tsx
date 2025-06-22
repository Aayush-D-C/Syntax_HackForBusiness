// context/ScanContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useBlockchain } from './BlockchainContext';

interface Product {
  barcode: string;
  name: string;
  category: string;
  price: number; // Selling price
  costPrice: number; // Cost price for profit calculation
  quantity?: number;
  exists: boolean;
}

interface InventoryOperation {
  type: 'add' | 'remove';
  product: Product;
  quantity: number;
  timestamp: string;
}

interface ScanContextType {
  scanData: string;
  setScanData: (data: string) => void;
  clearScanData: () => void;
  scannedProduct: Product | null;
  setScannedProduct: (product: Product | null) => void;
  inventory: Product[];
  addToInventory: (product: Product, quantity: number) => void;
  removeFromInventory: (barcode: string, quantity: number) => void;
  getProductByBarcode: (barcode: string) => Product | undefined;
  operations: InventoryOperation[];
  addOperation: (operation: InventoryOperation) => void;
  loadInventory: () => Promise<void>;
  saveInventory: () => Promise<void>;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export const useScan = (): ScanContextType => {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
};

interface ScanProviderProps {
  children: ReactNode;
}

export const ScanProvider: React.FC<ScanProviderProps> = ({ children }) => {
  const [scanData, setScanData] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [inventory, setInventory] = useState<Product[]>([]);
  const [operations, setOperations] = useState<InventoryOperation[]>([]);
  const { addSaleToBlockchain } = useBlockchain();

  // Load inventory data on mount
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const savedInventory = await AsyncStorage.getItem('inventory');
      const savedOperations = await AsyncStorage.getItem('inventory_operations');
      
      if (savedInventory) {
        const parsedInventory = JSON.parse(savedInventory);
        // Migrate existing inventory to include costPrice if missing
        const migratedInventory = parsedInventory.map((item: any) => ({
          ...item,
          costPrice: item.costPrice || Math.round(item.price * 0.8), // Default to 80% of selling price
        }));
        setInventory(migratedInventory);
        // Save migrated inventory back to storage
        await AsyncStorage.setItem('inventory', JSON.stringify(migratedInventory));
      } else {
        // Load sample inventory if none exists
        const sampleInventory = [
          {
            barcode: '1234567890123',
            name: 'Rice (Basmati)',
            category: 'Grains',
            price: 120,
            costPrice: 100,
            quantity: 50,
            exists: true,
          },
          {
            barcode: '9876543210987',
            name: 'Cooking Oil',
            category: 'Oils',
            price: 250,
            costPrice: 200,
            quantity: 30,
            exists: true,
          },
          {
            barcode: '4567891234567',
            name: 'Sugar (White)',
            category: 'Grains',
            price: 180,
            costPrice: 150,
            quantity: 40,
            exists: true,
          },
          {
            barcode: '7891234567890',
            name: 'Tea (Black)',
            category: 'Beverages',
            price: 270,
            costPrice: 220,
            quantity: 25,
            exists: true,
          },
          {
            barcode: '1357924680135',
            name: 'Wheat Flour',
            category: 'Grains',
            price: 95,
            costPrice: 80,
            quantity: 60,
            exists: true,
          },
          {
            barcode: '2468135790246',
            name: 'Soap (Bathing)',
            category: 'Personal Care',
            price: 60,
            costPrice: 50,
            quantity: 35,
            exists: true,
          },
        ];
        setInventory(sampleInventory);
        await AsyncStorage.setItem('inventory', JSON.stringify(sampleInventory));
      }
      
      if (savedOperations) {
        setOperations(JSON.parse(savedOperations));
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const saveInventory = async () => {
    try {
      await AsyncStorage.setItem('inventory', JSON.stringify(inventory));
      await AsyncStorage.setItem('inventory_operations', JSON.stringify(operations));
    } catch (error) {
      console.error('Error saving inventory:', error);
    }
  };

  const clearScanData = () => {
    setScanData('');
    setScannedProduct(null);
  };

  const getProductByBarcode = (barcode: string): Product | undefined => {
    return inventory.find(item => item.barcode === barcode);
  };

  const addToInventory = (product: Product, quantity: number) => {
    setInventory(prev => {
      const existingIndex = prev.findIndex(item => item.barcode === product.barcode);
      
      if (existingIndex >= 0) {
        // Update existing product
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: (updated[existingIndex].quantity || 0) + quantity,
        };
        return updated;
      } else {
        // Add new product
        return [...prev, { ...product, quantity, exists: true }];
      }
    });
    
    // Save to AsyncStorage
    setTimeout(() => saveInventory(), 100);
  };

  const removeFromInventory = (barcode: string, quantity: number) => {
    // Get product before updating state to avoid stale closure
    const product = getProductByBarcode(barcode);
    
    setInventory(prev => {
      const existingIndex = prev.findIndex(item => item.barcode === barcode);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        const currentQuantity = updated[existingIndex].quantity || 0;
        const newQuantity = Math.max(0, currentQuantity - quantity);
        
        if (newQuantity === 0) {
          // Remove item if quantity becomes 0
          return updated.filter((_, index) => index !== existingIndex);
        } else {
          // Update quantity
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQuantity,
          };
          return updated;
        }
      }
      return prev;
    });
    
    // Record sale on blockchain if removing items
    if (quantity > 0 && product) {
      recordSaleOnBlockchain(product, quantity);
    }
    
    // Save to AsyncStorage
    setTimeout(() => saveInventory(), 100);
  };

  const recordSaleOnBlockchain = async (product: Product, quantity: number) => {
    try {
      // Create sale data for blockchain
      const saleData = {
        id: Date.now().toString(),
        storeId: 'Ram Kumar', // Use current shopkeeper name
        products: [{
          name: product.name,
          price: product.price,
          category: product.category,
          barcode: product.barcode
        }],
        quantity: quantity,
        total: product.price * quantity,
        timestamp: new Date().toISOString()
      };

      // Add sale directly to blockchain
      addSaleToBlockchain(saleData);
      
      console.log('Sale recorded for blockchain:', {
        product: product.name,
        quantity: quantity,
        total: product.price * quantity,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error recording sale for blockchain:', error);
    }
  };

  const addOperation = (operation: InventoryOperation) => {
    setOperations(prev => {
      const newOperations = [operation, ...prev.slice(0, 99)]; // Keep last 100 operations
      // Save to AsyncStorage
      setTimeout(() => AsyncStorage.setItem('inventory_operations', JSON.stringify(newOperations)), 100);
      return newOperations;
    });
  };

  return (
    <ScanContext.Provider value={{ 
      scanData, 
      setScanData, 
      clearScanData,
      scannedProduct,
      setScannedProduct,
      inventory,
      addToInventory,
      removeFromInventory,
      getProductByBarcode,
      operations,
      addOperation,
      loadInventory,
      saveInventory,
    }}>
      {children}
    </ScanContext.Provider>
  );
};