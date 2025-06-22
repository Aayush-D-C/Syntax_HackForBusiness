import { MaterialIcons } from '@expo/vector-icons';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { useScan } from '../context/ScanContext';

export default function AddItemScanner() {
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { setScanData } = useScan();
  const [scanLinePosition] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animate scan line
    const animateScanLine = () => {
      Animated.sequence([
        Animated.timing(scanLinePosition, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(scanLinePosition, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ]).start(() => animateScanLine());
    };

    animateScanLine();

    return () => {
      setScanned(false);
    };
  }, [scanLinePosition]);

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    if (!scanned) {
      Vibration.vibrate(100);
      setScanned(true);
      setScanData(data);
      
      setTimeout(() => {
        setScanned(false);
        router.push('/product-action?mode=add');
      }, 1000);
    }
  };

  if (!permission) {
    return <View style={styles.loadingContainer} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need access to your camera to scan barcodes</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: [
            'ean13',
            'ean8',
            'upc_a',
            'upc_e',
            'code39',
            'code93',
            'code128',
            'codabar',
            'itf14',
            'qr',
          ],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      
      {/* Overlay positioned absolutely */}
      <View style={styles.overlay}>
        <View style={styles.scanFrame}>
          {/* Corner indicators */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          
          {/* Animated scan line */}
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [{
                  translateY: scanLinePosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 160], // Height of scan frame - 20
                  })
                }]
              }
            ]}
          />
        </View>
        <Text style={styles.scanText}>Scan barcode to ADD to inventory</Text>
        <Text style={styles.scanSubtext}>This will open the add item form</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
          <MaterialIcons name="flip-camera-android" size={32} color="white" />
        </TouchableOpacity>
      </View>

      {scanned && (
        <View style={styles.successOverlay}>
          <Text style={styles.successText}>Barcode scanned successfully!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'black',
  },
  permissionText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingTop: 100,
  },
  scanFrame: {
    width: 280,
    height: 180,
    borderWidth: 3,
    borderColor: '#007AFF',
    backgroundColor: 'transparent',
    borderRadius: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  scanText: {
    color: 'white',
    marginTop: 30,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  scanSubtext: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 8,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
    borderRadius: 50,
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
    borderRadius: 50,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,180,0,0.7)',
    padding: 20,
    alignItems: 'center',
    zIndex: 20,
  },
  successText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  topLeft: {
    top: -3,
    left: -3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -3,
    right: -3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -3,
    left: -3,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -3,
    right: -3,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: '#007AFF',
  },
}); 