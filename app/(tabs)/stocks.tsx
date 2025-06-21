// app/(tabs)/stocks.tsx
import { Text, View, StyleSheet, FlatList, SectionList } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

type Product = {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  lowStockThreshold: number;
  price: number;
  lastUpdated: string;
};

const Stocks = () => {
  // Sample inventory data
  const inventory: Product[] = [
    {
      id: "1",
      name: "iPhone 15 Pro",
      category: "Smartphones",
      currentStock: 15,
      lowStockThreshold: 5,
      price: 999,
      lastUpdated: "2023-10-15",
    },
    {
      id: "2",
      name: "MacBook Air M2",
      category: "Laptops",
      currentStock: 8,
      lowStockThreshold: 3,
      price: 1199,
      lastUpdated: "2023-10-14",
    },
    {
      id: "3",
      name: "AirPods Pro (2nd Gen)",
      category: "Audio",
      currentStock: 2,
      lowStockThreshold: 4,
      price: 249,
      lastUpdated: "2023-10-16",
    },
    {
      id: "4",
      name: "iPad Pro 12.9\"",
      category: "Tablets",
      currentStock: 6,
      lowStockThreshold: 2,
      price: 1099,
      lastUpdated: "2023-10-13",
    },
    {
      id: "5",
      name: "Apple Watch Series 9",
      category: "Wearables",
      currentStock: 12,
      lowStockThreshold: 5,
      price: 399,
      lastUpdated: "2023-10-15",
    },
    {
      id: "6",
      name: "Magic Keyboard",
      category: "Accessories",
      currentStock: 1,
      lowStockThreshold: 3,
      price: 299,
      lastUpdated: "2023-10-16",
    },
  ];

  // Group products by category
  const groupedProducts = inventory.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const sectionData = Object.keys(groupedProducts).map((category) => ({
    title: category,
    data: groupedProducts[category],
  }));

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={[
      styles.productItem,
      item.currentStock === 0 ? styles.outOfStockItem : 
      item.currentStock <= item.lowStockThreshold ? styles.lowStockItem : null
    ]}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.stockInfo}>
          <MaterialIcons 
            name={item.currentStock === 0 ? "error-outline" : 
                  item.currentStock <= item.lowStockThreshold ? "warning" : "check-circle"} 
            size={18} 
            color={item.currentStock === 0 ? "#f44336" : 
                   item.currentStock <= item.lowStockThreshold ? "#ff9800" : "#4caf50"} 
          />
          <Text style={styles.stockText}>
            Stock: {item.currentStock} {item.currentStock <= item.lowStockThreshold && 
              `(Low stock, threshold: ${item.lowStockThreshold})`}
            {item.currentStock === 0 && " (Out of stock)"}
          </Text>
        </View>
        <Text style={styles.lastUpdated}>Last updated: {item.lastUpdated}</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        <Text style={styles.totalValue}>Total: ${(item.price * item.currentStock).toFixed(2)}</Text>
      </View>
    </View>
  );

  // Calculate inventory summary
  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.currentStock), 0);
  const lowStockItems = inventory.filter(item => item.currentStock <= item.lowStockThreshold && item.currentStock > 0).length;
  const outOfStockItems = inventory.filter(item => item.currentStock === 0).length;

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Products</Text>
          <Text style={styles.summaryValue}>{totalItems}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Inventory Value</Text>
          <Text style={styles.summaryValue}>${totalValue.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryCard, styles.warningCard]}>
          <Text style={styles.summaryTitle}>Low Stock</Text>
          <Text style={styles.summaryValue}>{lowStockItems}</Text>
        </View>
        <View style={[styles.summaryCard, styles.dangerCard]}>
          <Text style={styles.summaryTitle}>Out of Stock</Text>
          <Text style={styles.summaryValue}>{outOfStockItems}</Text>
        </View>
      </View>

      <SectionList
        sections={sectionData}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  summaryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  summaryCard: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  warningCard: {
    backgroundColor: "#fff3e0",
  },
  dangerCard: {
    backgroundColor: "#ffebee",
  },
  summaryTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  listContent: {
    paddingBottom: 16,
  },
  sectionHeader: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionHeaderText: {
    fontWeight: "600",
    color: "#555",
    fontSize: 16,
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  lowStockItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#ff9800",
  },
  outOfStockItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  stockInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  stockText: {
    color: "#666",
    fontSize: 14,
    marginLeft: 5,
  },
  lastUpdated: {
    color: "#999",
    fontSize: 12,
  },
  priceContainer: {
    alignItems: "flex-end",
    marginLeft: 10,
  },
  price: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  totalValue: {
    color: "#666",
    fontSize: 14,
  },
});

export default Stocks;