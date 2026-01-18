import React, {useEffect} from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button, IconButton } from "react-native-paper";
import ScannerFrame from "../../components/ScannerComponent"; 
import { useScanner } from "../../hooks/useScanner";
import ModalCloseButton from '../ModalCloseButton';


export const AddLocationModal = ({
  locationName,
  setLocationName,
  scannerVisible,
  setScannerVisible,
  onDismissModal,
  saveNewLocation,
  validateName,
}) => {

    const { onReadCode, barCodeValue, setBarCoreValue } = useScanner();

    useEffect(()=> {
      if(barCodeValue != 'Skanowanie w toku') {
        setLocationName(barCodeValue);
      }
    },
    [barCodeValue]);



  return (
    <>
      <View style={styles.onelinewrapper}>
        <Text variant="headlineSmall" style={styles.modalText}>
          Stwórz nową lokalizację
        </Text>
      </View>

      {scannerVisible && (
        <View style={styles.onelinewrapper}>
          <ScannerFrame onBarcodeRead={onReadCode} />
        </View>
      )}

      <View style={styles.onelinewrapper}>
        <TextInput
          label="Wpisz nową nazwę."
          value={locationName}
          onChangeText={(text) => setLocationName(text)}
          style={styles.nazwainput}
          error={!validateName(locationName) && locationName !== ""}
        />
        <IconButton
          icon="barcode-scan"
          size={30}
          onPress={() => setScannerVisible(!scannerVisible)}
        />
      </View>

      <View style={styles.onelinewrapperSpaced}>
        <Button
          icon="plus"
          mode="contained"
          onPress={() => saveNewLocation(locationName)}
        >
          Dodaj
        </Button>
        <ModalCloseButton onPress={onDismissModal} />
      </View>
    </>
  );
};


const styles = StyleSheet.create({
  onelinewrapper: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingTop: 10,
  },
  onelinewrapperSpaced: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingTop: 30,
  },
  modalText: {
    marginVertical: 10,
  },
  nazwainput: {
    minWidth: "75%",
    minHeight: "20",
    fontSize: 20,
    marginLeft: 5,
  },
});