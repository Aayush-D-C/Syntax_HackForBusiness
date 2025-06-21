// app/(tabs)/scanner.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { useScan } from '../../context/ScanContext';

export default function BarcodeScanner() {
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { setScanData } = useScan();

  useEffect(() => {
    return () => {
      setScanned(false);
    };
  }, []);

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    if (!scanned) {
      Vibration.vibrate(100);
      setScanned(true);
      setScanData(data);
      
      setTimeout(() => {
        setScanned(false);
        router.push('/product-action');
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
        <View style={styles.scanFrame} />
        <Text style={styles.scanText}>Align barcode within the frame</Text>
      </View>

      <View style={styles.controls}>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanFrame: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  scanText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    zIndex: 10,
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
});