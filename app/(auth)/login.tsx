// app/(auth)/login.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    login();
    router.replace("/(tabs)/home");
  };

  return (
    <View style={styles.container}>
      {/* App Logo and Name */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/logo.jpg')} // Replace with your actual logo path
          style={styles.logo}
        />
        <Text style={styles.appName}>BizSaathi</Text>
        <Text style={styles.tagline}>Manage Your Inventory with Ease</Text>
      </View>

      {/* Login Form */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome Back</Text>
        
        <TextInput 
          placeholder="Username" 
          style={styles.input} 
          placeholderTextColor="#999"
        />
        
        <TextInput 
          placeholder="Password" 
          secureTextEntry 
          style={styles.input}
          placeholderTextColor="#999"
        />
        
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>Don't have an account? <Text style={styles.linkText}>Sign up</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 30,
    backgroundColor: '#f8f9fa',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  loginButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#7f8c8d',
  },
  linkText: {
    color: '#3498db',
    fontWeight: '600',
  },
});