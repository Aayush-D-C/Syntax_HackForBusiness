import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

export default function ProductActionScreen() {
  const router = useRouter();
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

  useEffect(() => {
    if (scanData) {
      // Check if product exists in inventory
      const existingProduct = getProductByBarcode(scanData);
      
      if (existingProduct) {
        setScannedProduct(existingProduct);
        setProductName(existingProduct.name);
        setProductCategory(existingProduct.category);
        setProductPrice(existingProduct.price.toString());
      } else {
        // New product - create placeholder
        const newProduct = {
          barcode: scanData,
          name: '',
          category: '',
          price: 0,
          exists: false,
        };
        setScannedProduct(newProduct);
      }
    }
  }, [scanData, getProductByBarcode, setScannedProduct]);

  const handleAddToInventory = () => {
    if (!productName.trim() || !productCategory.trim() || !productPrice.trim()) {
      Alert.alert('Error', 'Please fill in all product details');
      return;
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const priceNum = parseFloat(productPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    const product = {
      barcode: scanData,
      name: productName.trim(),
      category: productCategory.trim(),
      price: priceNum,
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
          text: 'Continue Scanning',
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
          text: 'Continue Scanning',
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
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
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
          {scannedProduct.exists ? 'Update Inventory' : 'Add New Product'}
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
              editable={!scannedProduct.exists}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category *</Text>
            <TextInput
              style={styles.input}
              value={productCategory}
              onChangeText={setProductCategory}
              placeholder="Enter category"
              editable={!scannedProduct.exists}
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
              editable={!scannedProduct.exists}
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
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityInput}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => {
                const current = parseInt(quantity) || 1;
                if (current > 1) setQuantity((current - 1).toString());
              }}
            >
              <Ionicons name="remove" size={20} color="#007AFF" />
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
              <Ionicons name="add" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {scannedProduct.exists ? (
            <TouchableOpacity style={styles.removeButton} onPress={handleRemoveFromInventory}>
              <Ionicons name="remove-circle" size={24} color="white" />
              <Text style={styles.buttonText}>Remove from Inventory</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.addButton} onPress={handleAddToInventory}>
              <Ionicons name="add-circle" size={24} color="white" />
              <Text style={styles.buttonText}>Add to Inventory</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  barcodeSection: {
    backgroundColor: 'white',
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
    color: '#333',
    fontFamily: 'monospace',
  },
  detailsSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  currentStock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 6,
  },
  currentStockLabel: {
    fontSize: 14,
    color: '#666',
  },
  currentStockValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  quantitySection: {
    backgroundColor: 'white',
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
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityTextInput: {
    width: 80,
    height: 40,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    marginTop: 16,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  removeButton: {
    backgroundColor: '#F44336',
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
    backgroundColor: '#007AFF',
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