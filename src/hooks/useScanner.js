import { useState } from 'react';
//import { playBeep } from '../utils/beep';
import { Vibration } from "react-native";
//import {playSystemAlarm} from '../utils/beep';


export const useScanner = () => {
 // const [scanned, setScanned] = useState(false);
  const [barCodeValue, setBarCoreValue] = useState('Skanowanie w toku');

  const onReadCode = (event) => {
    // if (!scanned) {
     // setScanned(true);
     Vibration.vibrate(50);
    // playSystemAlarm();
      setBarCoreValue(event.nativeEvent.codeStringValue);
     /*  Alert.alert('Scanned Code', event.nativeEvent.codeStringValue, [
        {
          text: 'Scan Again',
          onPress: () => setScanned(false),
        },
      ]); */
    }
  

 // const resetScanner = () => setScanned(false);

 // return { scanned, onReadCode, resetScanner, barCodeValue };
 return { onReadCode, barCodeValue, setBarCoreValue };
};