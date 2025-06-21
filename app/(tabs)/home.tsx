import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function Home() {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.creditBox}>
          <Text style={styles.creditText}>Credit Score</Text>
          <Text style={styles.creditValue}>720</Text>
        </View>
        <Image
          source={require('../assets/user.png')}
          style={styles.profileIcon}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Spending Overview</Text>
        <LineChart
          data={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                data: [1500, 2000, 1800, 2500, 2200, 2700],
              },
            ],
          }}
          width={screenWidth - 40}
          height={400}
          yAxisSuffix=" Rs"
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#f4f4f4',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  creditBox: {
    backgroundColor: '#007AFF',
    padding: 50,
    borderRadius: 12,
    flex: 1,
    marginRight: 100,
  },
  creditText: {
    color: '#fff',
    fontSize: 27,
  },
  creditValue: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 5,
  },
  profileIcon: {
    width: 100,
    height: 100,
  },
  chartContainer: {
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#333',
  },
});