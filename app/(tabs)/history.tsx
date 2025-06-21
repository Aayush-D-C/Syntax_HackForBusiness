// app/(tabs)/history.tsx
import { Text, View, StyleSheet, FlatList, SectionList } from "react-native";

type Transaction = {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  type: "sold" | "bought";
  date: string;
};

const History = () => {
  // Sample transaction data
  const transactions: Transaction[] = [
    {
      id: "1",
      productName: "iPhone 13",
      quantity: 2,
      price: 999,
      type: "sold",
      date: "2023-05-15",
    },
    {
      id: "2",
      productName: "MacBook Pro",
      quantity: 1,
      price: 1999,
      type: "sold",
      date: "2023-05-14",
    },
    {
      id: "3",
      productName: "AirPods Pro",
      quantity: 5,
      price: 249,
      type: "bought",
      date: "2023-05-13",
    },
    {
      id: "4",
      productName: "iPad Air",
      quantity: 3,
      price: 599,
      type: "sold",
      date: "2023-05-12",
    },
    {
      id: "5",
      productName: "Apple Watch",
      quantity: 10,
      price: 399,
      type: "bought",
      date: "2023-05-10",
    },
  ];

  // Group transactions by date
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    if (!acc[transaction.date]) {
      acc[transaction.date] = [];
    }
    acc[transaction.date].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const sectionData = Object.keys(groupedTransactions).map((date) => ({
    title: date,
    data: groupedTransactions[date],
  }));

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <View
      style={[
        styles.transactionItem,
        item.type === "sold" ? styles.soldItem : styles.boughtItem,
      ]}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.quantity}>Qty: {item.quantity}</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>
          ${(item.price * item.quantity).toFixed(2)}
        </Text>
        <Text style={styles.pricePerUnit}>(${item.price.toFixed(2)}/unit)</Text>
      </View>
      <View
        style={[
          styles.typeBadge,
          item.type === "sold" ? styles.soldBadge : styles.boughtBadge,
        ]}
      >
        <Text style={styles.typeText}>
          {item.type === "sold" ? "SOLD" : "BOUGHT"}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transaction History</Text>
      
      <SectionList
        sections={sectionData}
        keyExtractor={(item) => item.id}
        renderItem={renderTransactionItem}
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
  header: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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
  },
  transactionItem: {
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
  soldItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  boughtItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  quantity: {
    color: "#666",
    fontSize: 14,
  },
  priceContainer: {
    alignItems: "flex-end",
    marginRight: 16,
  },
  price: {
    fontWeight: "bold",
    fontSize: 16,
  },
  pricePerUnit: {
    color: "#666",
    fontSize: 12,
  },
  typeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  soldBadge: {
    backgroundColor: "#E8F5E9",
  },
  boughtBadge: {
    backgroundColor: "#FFEBEE",
  },
  typeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default History;