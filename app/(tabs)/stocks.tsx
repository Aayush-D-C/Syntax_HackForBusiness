// app/(tabs)/stocks.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useData } from '../../context/DataContext';
import { useScan } from '../../context/ScanContext';

interface InventoryCardProps {
  item: any;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const getStockStatusColor = (quantity: number): string => {
  if (quantity === 0) return '#F44336';
  if (quantity <= 10) return '#FF9800';
  return '#4CAF50';
};

const InventoryCard: React.FC<InventoryCardProps> = ({
  item,
  onPress,
  onEdit,
  onDelete,
}) => {
  const stockStatusColor = getStockStatusColor(item.quantity || 0);
  const stockStatus = item.quantity === 0 ? 'Out of Stock' : 
                     (item.quantity || 0) <= 10 ? 'Low Stock' : 'In Stock';

  return (
    <TouchableOpacity style={styles.inventoryCard} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemCategory}>{item.category}</Text>
        </View>
        <View style={styles.stockStatus}>
          <View style={[styles.statusDot, { backgroundColor: stockStatusColor }]} />
          <Text style={[styles.statusText, { color: stockStatusColor }]}>
            {stockStatus}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Quantity:</Text>
          <Text style={styles.detailValue}>{item.quantity || 0}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price:</Text>
          <Text style={styles.detailValue}>NPR {item.price?.toLocaleString() || 0}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Value:</Text>
          <Text style={styles.detailValue}>NPR {((item.quantity || 0) * (item.price || 0)).toLocaleString()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Barcode:</Text>
          <Text style={styles.detailValue}>{item.barcode}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
          <Ionicons name="pencil" size={16} color="#007AFF" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <Ionicons name="trash" size={16} color="#F44336" />
          <Text style={[styles.actionText, { color: '#F44336' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const InventoryScreen: React.FC = () => {
  const router = useRouter();
  const { currentShopkeeper, loading, error, clearError } = useData();
  const { inventory, addToInventory, removeFromInventory } = useScan();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterBy, setFilterBy] = useState<'all' | 'low' | 'out' | 'in'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'value'>('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: '',
    price: '',
    barcode: '',
  });

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // In real app, fetch inventory data here
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  };

  const filteredAndSortedInventory = React.useMemo(() => {
    let filtered = inventory.filter(item =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.category.toLowerCase().includes(searchText.toLowerCase()) ||
      item.barcode.includes(searchText)
    );

    // Apply stock filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(item => {
        const quantity = item.quantity || 0;
        switch (filterBy) {
          case 'low':
            return quantity > 0 && quantity <= 10;
          case 'out':
            return quantity === 0;
          case 'in':
            return quantity > 10;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'quantity':
          return (b.quantity || 0) - (a.quantity || 0);
        case 'value':
          return ((b.quantity || 0) * (b.price || 0)) - ((a.quantity || 0) * (a.price || 0));
        default:
          return 0;
      }
    });

    return filtered;
  }, [inventory, searchText, filterBy, sortBy]);

  const handleAddItem = () => {
    if (!newItem.name || !newItem.category || !newItem.quantity || !newItem.price || !newItem.barcode) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const product = {
      barcode: newItem.barcode,
      name: newItem.name,
      category: newItem.category,
      price: parseFloat(newItem.price),
      exists: true,
    };

    addToInventory(product, parseInt(newItem.quantity));
    setNewItem({ name: '', category: '', quantity: '', price: '', barcode: '' });
    setShowAddModal(false);
    Alert.alert('Success', 'Item added successfully');
  };

  const handleEditItem = (item: any) => {
    // Navigate to scanner with the item's barcode
    Alert.alert('Edit Item', `Scan the barcode for ${item.name} to edit it`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Scan',
        onPress: () => {
          // In a real app, you would set the scan data and navigate
          router.push('/(tabs)/scanner');
        },
      },
    ]);
  };

  const handleDeleteItem = (item: any) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeFromInventory(item.barcode, item.quantity || 0);
            Alert.alert('Success', 'Item deleted successfully');
          },
        },
      ]
    );
  };

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filters & Sorting</Text>
          
          <Text style={styles.filterSectionTitle}>Filter by Stock Status</Text>
          <View style={styles.filterOptions}>
            {[
              { key: 'all', label: 'All Items' },
              { key: 'in', label: 'In Stock' },
              { key: 'low', label: 'Low Stock' },
              { key: 'out', label: 'Out of Stock' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterOption,
                  filterBy === option.key && styles.filterOptionActive,
                ]}
                onPress={() => setFilterBy(option.key as any)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filterBy === option.key && styles.filterOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterSectionTitle}>Sort by</Text>
          <View style={styles.filterOptions}>
            {[
              { key: 'name', label: 'Name' },
              { key: 'quantity', label: 'Quantity' },
              { key: 'value', label: 'Value' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterOption,
                  sortBy === option.key && styles.filterOptionActive,
                ]}
                onPress={() => setSortBy(option.key as any)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    sortBy === option.key && styles.filterOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setShowFilters(false)}
          >
            <Text style={styles.closeModalText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const AddItemModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Item to Inventory</Text>
          
          <TextInput
            style={styles.modalInput}
            placeholder="Item Name"
            value={newItem.name}
            onChangeText={(text) => setNewItem({ ...newItem, name: text })}
          />
          
          <TextInput
            style={styles.modalInput}
            placeholder="Category"
            value={newItem.category}
            onChangeText={(text) => setNewItem({ ...newItem, category: text })}
          />
          
          <TextInput
            style={styles.modalInput}
            placeholder="Quantity"
            value={newItem.quantity}
            onChangeText={(text) => setNewItem({ ...newItem, quantity: text })}
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.modalInput}
            placeholder="Price (NPR)"
            value={newItem.price}
            onChangeText={(text) => setNewItem({ ...newItem, price: text })}
            keyboardType="numeric"
          />
          
          <View style={styles.barcodeContainer}>
            <TextInput
              style={[styles.modalInput, styles.barcodeInput]}
              placeholder="Barcode (or scan below)"
              value={newItem.barcode}
              onChangeText={(text) => setNewItem({ ...newItem, barcode: text })}
            />
            <TouchableOpacity
              style={styles.scanBarcodeButton}
              onPress={() => {
                setShowAddModal(false);
                // Navigate to scanner for adding items
                router.push('/add-item-scanner');
              }}
            >
              <Ionicons name="barcode-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleAddItem}
            >
              <Text style={styles.saveButtonText}>Add to Inventory</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading && inventory.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading inventory...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>My Inventory</Text>
        <Text style={styles.headerSubtitle}>
          {filteredAndSortedInventory.length} items
        </Text>
      </LinearGradient>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search inventory..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Item</Text>
      </TouchableOpacity>

      {/* Inventory Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Items</Text>
          <Text style={styles.summaryValue}>{inventory.length}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Low Stock</Text>
          <Text style={styles.summaryValue}>
            {inventory.filter(item => (item.quantity || 0) > 0 && (item.quantity || 0) <= 10).length}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Out of Stock</Text>
          <Text style={styles.summaryValue}>
            {inventory.filter(item => (item.quantity || 0) === 0).length}
          </Text>
        </View>
      </View>

      {/* Inventory List */}
      <FlatList
        data={filteredAndSortedInventory}
        keyExtractor={(item) => item.barcode}
        renderItem={({ item }) => (
          <InventoryCard
            item={item}
            onPress={() => handleEditItem(item)}
            onEdit={() => handleEditItem(item)}
            onDelete={() => handleDeleteItem(item)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No items found</Text>
            <Text style={styles.emptySubtext}>
              {searchText || filterBy !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Add your first inventory item to get started'}
            </Text>
          </View>
        }
      />

      <FilterModal />
      <AddItemModal />
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 50,
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
  searchContainer: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  filterButton: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 25,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  inventoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  stockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  actionText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
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
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  filterOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 10,
  },
  filterOptionActive: {
    backgroundColor: '#007AFF',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  closeModalButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  barcodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barcodeInput: {
    flex: 1,
  },
  scanBarcodeButton: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});

export default InventoryScreen;