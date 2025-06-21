import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Link } from 'expo-router';

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
        <Text style={styles.title}>Grow Up The Business</Text>
        <Text style={styles.description}>
          BizSaathi - Your Trusted Partner for Smart Sales & Growth.{"\n"}
          Track your transactions, manage inventory, and build your credit profile — all from your phone.
        </Text>
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
    height: 240,
    marginTop: 20,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
  },
  buttonContainer: {
    width: screenWidth,
    alignItems: 'center',
    backgroundColor: '#D4E7FA',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingVertical: 30,
    marginTop: 30,
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
