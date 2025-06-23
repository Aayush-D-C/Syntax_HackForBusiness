import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useScan } from '../context/ScanContext';

// Suppress maximum update depth warnings during scanning operations
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const message = args.join(' ');
  if (message.includes('Maximum update depth exceeded')) {
    // Suppress this specific warning during scanning
    return;
  }
  originalConsoleWarn.apply(console, args);
};

export default function ProductActionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isAddingItem = params.mode === 'add'; // Check if we're adding or removing
  
  const { 
    scanData, 
    scannedProduct, 
    setScannedProduct, 
    getProductByBarcode,
    addToInventory,
    removeFromInventory,
    addOperation,
    clearScanData
  } = useScan();
  
  const [quantity, setQuantity] = useState('1');
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCostPrice, setProductCostPrice] = useState('');

  useEffect(() => {
    if (scanData) {
      // Check if product exists in inventory
      const existingProduct = getProductByBarcode(scanData);
      
      if (existingProduct) {
        setScannedProduct(existingProduct);
        setProductName(existingProduct.name);
        setProductCategory(existingProduct.category);
        setProductPrice(existingProduct.price.toString());
        setProductCostPrice((existingProduct.costPrice || 0).toString());
      } else {
        // New product - create placeholder
        const newProduct = {
          barcode: scanData,
          name: '',
          category: '',
          price: 0,
          costPrice: 0,
          exists: false,
        };
        setScannedProduct(newProduct);
      }
    }
  }, [scanData]); // Removed function dependencies to prevent infinite loops

  const handleAddToInventory = () => {
    if (!productName.trim() || !productCategory.trim() || !productPrice.trim() || !productCostPrice.trim()) {
      Alert.alert('Error', 'Please fill in all product details including cost price');
      return;
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const priceNum = parseFloat(productPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert('Error', 'Please enter a valid selling price');
      return;
    }

    const costPriceNum = parseFloat(productCostPrice);
    if (isNaN(costPriceNum) || costPriceNum < 0) {
      Alert.alert('Error', 'Please enter a valid cost price');
      return;
    }

    if (costPriceNum >= priceNum) {
      Alert.alert('Error', 'Cost price should be less than selling price for profit');
      return;
    }

    const product = {
      barcode: scanData,
      name: productName.trim(),
      category: productCategory.trim(),
      price: priceNum,
      costPrice: costPriceNum,
      exists: true,
    };

    addToInventory(product, quantityNum);
    
    // Record operation
    addOperation({
      type: 'add',
      product,
      quantity: quantityNum,
      timestamp: new Date().toISOString(),
    });

    Alert.alert(
      'Success', 
      `${quantityNum} ${productName} added to inventory`,
      [
        {
          text: 'Continue Adding',
          onPress: () => {
            clearScanData();
            router.push('/add-item-scanner');
          }
        },
        {
          text: 'Go to Inventory',
          onPress: () => {
            clearScanData();
            router.push('/(tabs)/stocks');
          }
        }
      ]
    );
  };

  const handleRemoveFromInventory = () => {
    if (!scannedProduct) return;

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const currentQuantity = scannedProduct.quantity || 0;
    if (quantityNum > currentQuantity) {
      Alert.alert('Error', `Only ${currentQuantity} items available in inventory`);
      return;
    }

    removeFromInventory(scanData, quantityNum);
    
    // Record operation
    addOperation({
      type: 'remove',
      product: scannedProduct,
      quantity: quantityNum,
      timestamp: new Date().toISOString(),
    });

    Alert.alert(
      'Success', 
      `${quantityNum} ${scannedProduct.name} removed from inventory`,
      [
        {
          text: 'Continue Removing',
          onPress: () => {
            clearScanData();
            router.push('/(tabs)/scanner');
          }
        },
        {
          text: 'Go to Inventory',
          onPress: () => {
            clearScanData();
            router.push('/(tabs)/stocks');
          }
        }
      ]
    );
  };

  const handleBack = () => {
    clearScanData();
    router.back();
  };

  if (!scannedProduct) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#448BEF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Not Found</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.errorText}>Product with barcode {scanData} not found</Text>
          <TouchableOpacity style={styles.button} onPress={handleBack}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isAddingItem ? 'Add New Product' : 'Remove from Inventory'}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Barcode Display */}
        <View style={styles.barcodeSection}>
          <Text style={styles.barcodeLabel}>Barcode</Text>
          <Text style={styles.barcodeText}>{scanData}</Text>
        </View>

        {/* Product Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Product Name *</Text>
            <TextInput
              style={styles.input}
              value={productName}
              onChangeText={setProductName}
              placeholder="Enter product name"
              editable={isAddingItem || !scannedProduct.exists}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category *</Text>
            <TextInput
              style={styles.input}
              value={productCategory}
              onChangeText={setProductCategory}
              placeholder="Enter category"
              editable={isAddingItem || !scannedProduct.exists}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Price (NPR) *</Text>
            <TextInput
              style={styles.input}
              value={productPrice}
              onChangeText={setProductPrice}
              placeholder="Enter price"
              keyboardType="numeric"
              editable={isAddingItem || !scannedProduct.exists}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cost Price (NPR) *</Text>
            <TextInput
              style={styles.input}
              value={productCostPrice}
              onChangeText={setProductCostPrice}
              placeholder="Enter cost price"
              keyboardType="numeric"
              editable={isAddingItem || !scannedProduct.exists}
            />
          </View>

          {scannedProduct.exists && (
            <View style={styles.currentStock}>
              <Text style={styles.currentStockLabel}>Current Stock:</Text>
              <Text style={styles.currentStockValue}>{scannedProduct.quantity || 0}</Text>
            </View>
          )}
        </View>

        {/* Quantity Input */}
        <View style={styles.quantitySection}>
          <Text style={styles.sectionTitle}>
            {isAddingItem ? 'Quantity to Add' : 'Quantity to Remove'}
          </Text>
          <View style={styles.quantityInput}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => {
                const current = parseInt(quantity) || 1;
                if (current > 1) setQuantity((current - 1).toString());
              }}
            >
              <Ionicons name="remove" size={20} color="#448BEF" />
            </TouchableOpacity>
            
            <TextInput
              style={styles.quantityTextInput}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              textAlign="center"
            />
            
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => {
                const current = parseInt(quantity) || 1;
                setQuantity((current + 1).toString());
              }}
            >
              <Ionicons name="add" size={20} color="#448BEF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isAddingItem ? (
            <TouchableOpacity style={styles.addButton} onPress={handleAddToInventory}>
              <Ionicons name="add-circle" size={24} color="white" />
              <Text style={styles.buttonText}>Add to Inventory</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.removeButton} onPress={handleRemoveFromInventory}>
              <Ionicons name="remove-circle" size={24} color="white" />
              <Text style={styles.buttonText}>Remove from Inventory</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF3FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#44D3EF',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  barcodeSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  barcodeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  barcodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    fontFamily: 'monospace',
  },
  detailsSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#44D3EF',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#212121',
  },
  currentStock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#EAF3FF',
    borderRadius: 6,
  },
  currentStockLabel: {
    fontSize: 14,
    color: '#666',
  },
  currentStockValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#448BEF',
  },
  quantitySection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  quantityInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityTextInput: {
    width: 80,
    height: 40,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#44D3EF',
    borderRadius: 6,
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: '#fff',
    color: '#212121',
  },
  actionButtons: {
    marginTop: 16,
  },
  addButton: {
    backgroundColor: '#448BEF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  removeButton: {
    backgroundColor: '#6B44EF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#448BEF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 32,
  },
}); 