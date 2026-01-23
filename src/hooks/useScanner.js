import { useState } from 'react';
import { Vibration } from "react-native";



export const useScanner = () => {

  const [barCodeValue, setBarCoreValue] = useState('Skanowanie w toku');

  const onReadCode = (event) => {
     Vibration.vibrate(50);
      setBarCoreValue(event.nativeEvent.codeStringValue);

    }
  
 return { onReadCode, barCodeValue, setBarCoreValue };
};