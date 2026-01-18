import React, {useState, useEffect} from "react";
import { View, StyleSheet } from "react-native";
import {
  Text,
  TextInput,
  Button,
  useTheme,
} from "react-native-paper";
import { DatePickerComponent } from "../../components/DatePickerComponent";
import ScannerFrame from "../../components/ScannerComponent"; 
import { dateToSQLiteDateOnly } from "../../utils/ValidateFunctions";
import QtyWrapper from '../QtyWrapper';
import ModalCloseButton from "../ModalCloseButton";
import { BottomSheetContent } from "./BottomSheetContent";
import {noExpiryDate} from '../../consts/staticDate';

export const AddProductModal = ({
  modalOpen,
  setModalOpen,
  expiryDate,
  onConfirm,
  scannerVisible,
  productForAdd,
  counter,
  changeCounter,
  validateDateForSQLite,
  handleAddToDB,
  handleAddToDBOtherLocation,
  locationInfo,
  locationGlobal,
  onReadCode,
  barCodeValue,
  onDismissModal,
  locationOther,
  setLocationOther,
  locationsList,
  setExpiryDate,
  savingToDB,

}) => {

  
  const theme = useTheme();
  useEffect(()=>{
      if(productForAdd?.useexpiry === 0) {
        setExpiryDate(noExpiryDate)
      }; 
  },[productForAdd?.useexpiry]);
    

  return (
    <>
      <DatePickerComponent
        locale="pl"
        mode="single"
        visible={modalOpen}
        onDismiss={() => setModalOpen(false)}
        date={expiryDate || new Date()}
        onConfirm={onConfirm}
      />
      <View style={styles.onelinewrapperBaseline}>
        <Text variant="bodyLarge" style={{ marginTop: 10 }}>
          Dodajesz do lokalizacji:{" "}
        </Text>

        {!productForAdd?.other ? (
          <Text>{locationGlobal?.loc_name}</Text>
        ) : (
          <Text>{locationOther?.loc_name || "WYBIERZ Z LISTY"}</Text>
        )}
      </View>

      {productForAdd?.other && (
        <BottomSheetContent
          locationsList={locationsList}
          locationGlobal={locationOther}
          setLocationGlobal={setLocationOther}
          pickOtherLocation={true}
        />
      )}

      {scannerVisible && (
        <View style={styles.onelinewrapper}>
          <ScannerFrame onBarcodeRead={onReadCode} />
        </View>
      )}

      <View
        style={[
          styles.productwrapper,
          {
            borderColor: theme.colors.outline,
            backgroundColor: theme.colors.outlineVariant,
          },
        ]}
      >
        <View style={styles.onelinewrapper}>
          <Text variant="titleMedium">
            Produkt:{" "}
            {barCodeValue !== "Skanowanie w toku" && !productForAdd?.p_name
              ? "Nie znaleziono"
              : productForAdd?.p_name}{" "}
          </Text>
        </View>

        {barCodeValue !== "Skanowanie w toku" && (
          <View style={styles.onelinewrapper}>
            <Text variant="titleMedium">
              Kod: {barCodeValue || "Skanuj kod"}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.onelinewrapper}>
        <QtyWrapper
          changeQty={changeCounter}
          alteredProperty={counter}
          units={productForAdd?.units}
        />
      </View>

      <View style={styles.onelinewrapper}>
        {expiryDate === noExpiryDate ? (
          <Text>Produkt nie posiada daty ważności.</Text>
        ) : (
          <TextInput
            value={expiryDate && dateToSQLiteDateOnly(expiryDate)}
            label="Data ważności"
            showSoftInputOnFocus={false}
            style={{ flex: 1 }}
            onFocus={() => setModalOpen(true)}
            error={!validateDateForSQLite(expiryDate)}
          />
        )}
      </View>

      <View style={styles.onelinewrapper}>
        {scannerVisible ? (
          <Button
            loading={savingToDB}
            disabled={
              (barCodeValue !== "Skanowanie w toku" &&
                !productForAdd?.p_name) ||
              !productForAdd ||
              !expiryDate
            }
            mode="contained"
            style={{ margin: 20, width: "80%" }}
            onPress={() =>
              handleAddToDB(productForAdd.id, counter, expiryDate, locationInfo)
            }
          >
            {savingToDB === true ? "Zapisywanie" : "Zapisz"}
          </Button>
        ) : (
          <Button
            loading={savingToDB}
            disabled={
              productForAdd?.other ? !expiryDate || !locationOther : !expiryDate
            }
            mode="contained"
            style={{ margin: 20, width: "80%" }}
            onPress={() => {
              if (productForAdd.other) {
                handleAddToDBOtherLocation(
                  productForAdd.id,
                  counter,
                  expiryDate
                );
              } else {
                handleAddToDB(
                  productForAdd.id,
                  counter,
                  expiryDate,
                  productForAdd.location_id
                );
              }
            }}
          >
            {savingToDB === true ? "Zapisywanie" : "Zapisz"}
          </Button>
        )}
      </View>
      <View style={styles.onelinewrapper}>
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
    alignItems: "center",
  },
  onelinewrapperBaseline: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "baseline",
  },
  productwrapper: {
    borderWidth: 1,
    padding: 5,
    borderRadius: 5,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    marginVertical: 10,
  },
  iconbuttonstyle: {
    borderRadius: 5,
    marginTop: 10,
  },
});