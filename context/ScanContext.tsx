// context/ScanContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface Product {
  barcode: string;
  name: string;
  category: string;
  price: number;
  quantity?: number;
  exists: boolean;
}

interface InventoryOperation {
  type: 'add' | 'remove';
  product: Product;
  quantity: number;
  timestamp: string;
}

type ScanContextType = {
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
};

const ScanContext = createContext<ScanContextType>({
  scanData: '',
  setScanData: () => {},
  clearScanData: () => {},
  scannedProduct: null,
  setScannedProduct: () => {},
  inventory: [],
  addToInventory: () => {},
  removeFromInventory: () => {},
  getProductByBarcode: () => undefined,
  operations: [],
  addOperation: () => {},
  loadInventory: async () => {},
  saveInventory: async () => {},
});

export const ScanProvider = ({ children }: { children: ReactNode }) => {
  const [scanData, setScanData] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [inventory, setInventory] = useState<Product[]>([]);
  const [operations, setOperations] = useState<InventoryOperation[]>([]);

  // Load inventory from AsyncStorage on app start
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const savedInventory = await AsyncStorage.getItem('inventory');
      const savedOperations = await AsyncStorage.getItem('inventory_operations');
      
      if (savedInventory) {
        setInventory(JSON.parse(savedInventory));
      } else {
        // Initialize with sample data if no saved data exists
        const sampleInventory = [
          {
            barcode: '1234567890123',
            name: 'Rice (Basmati)',
            category: 'Grains',
            price: 120,
            quantity: 50,
            exists: true,
          },
          {
            barcode: '9876543210987',
            name: 'Cooking Oil (Sunflower)',
            category: 'Oils',
            price: 250,
            quantity: 15,
            exists: true,
          },
          {
            barcode: '4567891234567',
            name: 'Sugar (White)',
            category: 'Sweeteners',
            price: 180,
            quantity: 25,
            exists: true,
          },
          {
            barcode: '7891234567890',
            name: 'Tea (Black)',
            category: 'Beverages',
            price: 150,
            quantity: 30,
            exists: true,
          },
          {
            barcode: '3210987654321',
            name: 'Milk Powder',
            category: 'Dairy',
            price: 300,
            quantity: 20,
            exists: true,
          },
          {
            barcode: '6543210987654',
            name: 'Bread (White)',
            category: 'Bakery',
            price: 40,
            quantity: 0,
            exists: true,
          },
          {
            barcode: '1357924680135',
            name: 'Tomato Sauce',
            category: 'Condiments',
            price: 80,
            quantity: 12,
            exists: true,
          },
          {
            barcode: '2468135790246',
            name: 'Soap (Bathing)',
            category: 'Personal Care',
            price: 60,
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
    if (quantity > 0) {
      const product = getProductByBarcode(barcode);
      if (product) {
        recordSaleOnBlockchain(product, quantity);
      }
    }
    
    // Save to AsyncStorage
    setTimeout(() => saveInventory(), 100);
  };

  const recordSaleOnBlockchain = async (product: Product, quantity: number) => {
    try {
      const saleData = {
        storeId: 'Shop-1', // You can make this dynamic based on current shopkeeper
        products: [{
          name: product.name,
          price: product.price,
          category: product.category,
          barcode: product.barcode
        }]
      };

      const response = await fetch('http://localhost:3001/api/blockchain/sale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        console.log('Sale recorded on blockchain successfully');
      } else {
        console.error('Failed to record sale on blockchain');
      }
    } catch (error) {
      console.error('Error recording sale on blockchain:', error);
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

export const useScan = () => {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
};