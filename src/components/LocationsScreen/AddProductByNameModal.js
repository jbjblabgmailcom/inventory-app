import React, {useState, useEffect} from "react";
import { View, StyleSheet, FlatList, TouchableOpacity} from "react-native";
import {
  Text,
  TextInput,
  Button,
  useTheme,
  IconButton,
  Surface
} from "react-native-paper";
import { DatePickerComponent } from "../../components/DatePickerComponent";

import { dateToSQLiteDateOnly } from "../../utils/ValidateFunctions";
import QtyWrapper from '../QtyWrapper';
import ModalCloseButton from "../ModalCloseButton";

import {noExpiryDate} from '../../consts/staticDate';
import { fetchProductsFromDB } from "../../dbQuerys/newProductDB";
import SearchComponent from "../SearchComponent";



export const AddProductByNameModal = ({
  modalOpen,
  setModalOpen,
  expiryDate,
  onConfirm,
  counter,
  changeCounter,
  validateDateForSQLite,
  locationGlobal,
  onDismissModal,
  setExpiryDate,
  savingToDB,
  locationOther,
  setLocationOther,
  handleAddToDBOtherLocation,
  setOnRemove,
  onRemove
 

}) => {

  
  const theme = useTheme();
  const [inputSearchValue, setInputSearchValue] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productList, setProductList] = useState({});
  const [trigger, setTrigger] = useState(false);
  const [productForAdd, setProductForAdd] = useState({});

    useEffect (()=> {
     // setLoadingProducts(true);
         fetchProductsFromDB(inputSearchValue)
      .then(
        result => 
          {setProductList(result._array);
          //  setLoadingProducts(false);
        console.log('Lista produktów z bazy w modalu', result._array);
          }
      )
      .catch(err => console.error("DB error", err));
  
    },[trigger]);

    const handleEndEditing = () =>{
      setTrigger(!trigger);
    }

  useEffect(()=>{
      if(productForAdd?.useexpiry === 0) {
        setExpiryDate(noExpiryDate)
      } else if (productForAdd?.useexpiry === 1) {
        setExpiryDate(null);
      } 
  },[productForAdd]); 

  useEffect(()=>{
    setLocationOther(locationGlobal);
  }, [locationGlobal])
    

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
        <Text>{locationOther?.loc_name}</Text> 
      </View>

      <View style={styles.onelinewrapper}>
        {!productForAdd && <Text>Produkt: {productForAdd?.p_name}</Text>}
      </View>

                
                        <SearchComponent
                        inputValue={inputSearchValue}
                        setInputValue={setInputSearchValue}
                        handleEndEditing={handleEndEditing}
                        loadingProducts={false}
                        />

                        <View style={styles.flatListWrapperModal}>
          <FlatList
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={styles.list}
            contentContainerStyle={styles.flatListContent}
            data={productList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({item}) => {
              const isSelected = productForAdd?.id === item.id;
              

              return (
                <TouchableOpacity
                  onPress={() => setProductForAdd({
                    id: item.id,
                    p_name: item.p_name,
                    noscan: true,
                    other: true,
                    useexpiry: item.p_useexpiry,
                    units: item.p_units,

                  })}
              
                >
                  <View
                  mode="elevated"
                    style={[styles.surface, isSelected && styles.withBorder, {backgroundColor: theme.colors.elevation.level2}]}
                  >
                      <View style={styles.surfaceColumn}
                    
                  >
                    <IconButton
                      icon={isSelected ? 'check-circle-outline' : 'checkbox-blank-circle-outline'}
                      size={30}
                      mode="contained"
                    />
                    </View>
                    <View style={styles.surfaceColumn} >
                    <Text variant="bodyLarge">{item.p_name}</Text>
                    <Text variant="bodyMedium">Kod: {item.p_code}</Text>
                  </View>
                 </View>
                  
                  
                </TouchableOpacity>
              );
            }}
          />
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
            <Button
                  loading={savingToDB}
                  disabled={
                    productForAdd ? !expiryDate || !locationOther : !expiryDate
                  }
                  mode="contained"
                  style={{ margin: 20, width: "80%" }}
                  onPress={() => {
                    if (locationOther) {
                      handleAddToDBOtherLocation(
                        productForAdd.id,
                        counter,
                        expiryDate
                      );
                      setOnRemove(!onRemove);
                    }
                  }}
                >
                  {savingToDB === true ? "Zapisywanie" : "Zapisz"}
                </Button>
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
  flatListWrapperModal: {
    height: 250,
    width: '98%',
    },
  list: {
    flex: 1,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  flatListContent: {
    
  },
  surface: {
    display: "flex",
    flexDirection: "row",
    borderRadius: 3,
    marginTop: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 0,
  },
  surfaceColumn: {
    display: "flex",
    flexDirection: "column",
   
    justifyContent: "flex-start",
    
    
  },
  withBorder: {
    borderColor: "rgba(49, 133, 0, 1)",
    borderWidth: 1,
  },
});