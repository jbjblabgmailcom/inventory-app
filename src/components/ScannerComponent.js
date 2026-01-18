import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';



const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ScannerFrame({
  onBarcodeRead,
  frameWidth = SCREEN_WIDTH * 0.9,
  frameHeight,
  active = true   // <-- new prop
}) {
  const cameraRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(active);

  // Update camera activation when modal opens/closes
  React.useEffect(() => {
    setCameraActive(active);
  }, [active]);

  const VIEWFINDER_HEIGHT = frameHeight || frameWidth / 2;

  return (
    <View style={[styles.scannerContainer, { height: VIEWFINDER_HEIGHT + 40 }]}>
      {cameraActive && (
        <Camera
          ref={cameraRef}
          style={{ flex: 1, width: '100%' }}
          scanBarcode={true}
          onReadCode={onBarcodeRead}
          cameraOptions={{
            flashMode: 'auto',
            focusMode: 'on',
            cameraType: CameraType.Back,
          }}
          barcodeTypes={[
            'QR', 'EAN13', 'EAN8', 'CODE39', 'CODE128',
            'PDF417', 'UPCE', 'ITF', 'AZTEC', 'DATA_MATRIX',
          ]}
        />
      )}

      <View style={styles.overlay}>
        <View
          style={[
            styles.frame,
            { width: frameWidth, height: VIEWFINDER_HEIGHT },
          ]}
        >
          <View style={styles.laserLine} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scannerContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 10,
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  laserLine: {
    width: '100%',
    height: 2,
    backgroundColor: 'red',
    position: 'absolute',
    top: '50%',
  },
});
