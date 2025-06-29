import { Link } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      {/* Decorative Top-Left Blob */}
      <View style={styles.topBlob} />

      {/* Illustration */}
      <Image
        source={require('./assets/demo.png')} // ← your welcome image here
        style={styles.illustration}
        resizeMode="contain"
      />

      {/* Text Block */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Grow Your Business</Text>
        <Text style={styles.description}>
          BizSaathi - Your Personal Business Assistant.{"\n"}
          Manage inventory, track transactions, build credit score, and get smart insights — all from your phone.
        </Text>
      </View>

      {/* Features */}
      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📊</Text>
          <Text style={styles.featureText}>Credit Score Analysis</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📦</Text>
          <Text style={styles.featureText}>Inventory Management</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📱</Text>
          <Text style={styles.featureText}>Smart Predictions</Text>
        </View>
      </View>

      {/* Get Started Button */}
      <View style={styles.buttonContainer}>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.getStartedButton}>
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
  },
  topBlob: {
    position: 'absolute',
    top: -50,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#D4E7FA',
    opacity: 0.5,
    zIndex: -1,
  },
  illustration: {
    width: '90%',
    height: 200,
    marginTop: 20,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    width: screenWidth,
    alignItems: 'center',
    backgroundColor: '#D4E7FA',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingVertical: 30,
    marginTop: 20,
  },
  getStartedButton: {
    backgroundColor: '#FFAA33',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
    elevation: 4,
  },
  getStartedText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
