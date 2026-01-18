import React, { useState, useEffect} from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Text, IconButton, Card, Button, Switch, useTheme} from 'react-native-paper';

import { pickImage, takePhoto } from '../utils/CameraFunctions';
import { fetchNamesFromDB, fetchCategoriesFromDB, saveNewProductInDB, fetchProductByCodefromDB, fetchSingleProductByIDFromDB } from '../dbQuerys/newProductDB';

import { validateName, validateBarcode, validateDescription, dateToSQLiteCurrent} from "../utils/ValidateFunctions"
import PaperAutocomplete from '../components/PaperAutocomplete';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import ScannerFrame from '../components/ScannerComponent';
import { useScanner } from '../hooks/useScanner';
import { allUnits } from './../consts/units';



export default function DefineNewProductScreen() {

  const navigation = useNavigation();
  const { onReadCode, barCodeValue, setBarCoreValue } = useScanner();
  const [scannerVisible, setScannerVisible] = useState(false);
  const route = useRoute();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);



//arrays from db for autocomplete
  const [nazwaList, setNazwaList] = useState([{p_name: ""}]);
  const [categoriesList, setCategoriesList] = useState([{p_category: ""}]);

  //dane w formularzu
  const [id, setId] = useState(null);
  const [pname, setPName] = useState("");
  const [bcode, setBCode] = useState("");
  const [category_value, setCategory_value] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [dateCreated, setDateCreated] = useState(new Date());
  const [useExpiry, setUseExpiry] = useState(1);
  const [units, setUnits] = useState('szt.');


  let itemId = '';

  if(route.params && route.params.itemId) {
    itemId = route.params.itemId;
  }

  // set barcode value on scan

  useEffect(()=>{
    setBCode(barCodeValue);

    fetchProductByCodefromDB(barCodeValue)
    .then(result => { 
 
    if(result.product) {
      console.log("znaleziono", result.product);
      const foundItem = result.product;
      populateForm(foundItem);

    } else if (!result.product) {
      console.log("NIE ZNALEZIONO produktu z TAKIm KODem");
    }
    })
    .catch(err => console.log("DB Error", err));
  },[barCodeValue]);

  //fetch initial info from DB

  useEffect(() => {
    fetchNamesFromDB()
    .then(result => { setNazwaList(result)
    console.log("Nazwa list", nazwaList);
    })
    .catch(err=> console.error("DB Error", err));
    
  },[]);

  useEffect(() => {
    fetchCategoriesFromDB()
    .then(result => { setCategoriesList(result);
     console.log(result);
     console.log("Categories list", categoriesList);
    })
    .catch(err=> console.error("DB Error", err));
    
  },[]);

  useEffect(()=> {
        if(itemId === '' || itemId === null) {
          return;
        }
        
        console.log('ITEM ID', itemId);
        
        fetchSingleProductByIDFromDB(itemId)
        .then(result => {
         
          const productData = result;
          console.log("product data", productData);
          populateForm(productData);
  
        })
        .catch(err=> console.error("DB Error", err))
        
  
    },[itemId]);

 const onToggleSwitch = () => {
  (useExpiry === 1) ? setUseExpiry(0) : null;
  (useExpiry === 0) ? setUseExpiry(1) : null;
  console.log(useExpiry);
 };


const handleSelectionCategory = (option) => {
    setCategory_value(option.p_category);
    console.log('Selected:', option.label);
  };

  const handleTextChangeCategory = (text) => {
    setCategory_value(text);
    console.log('User entered:', text);
  };

  const handleSelectionName = (option) => {
    setPName(option.p_name);
    console.log('Selected:', option.p_name);
  };

  const handleTextChangeName = (text) => {
    setPName(text);
    console.log('User entered:', text);
  };



  const populateForm = (productData) => {
        setId(productData.id);
        console.log("id to populate", productData.id);
        setPName(productData.p_name);
        setCategory_value(productData.p_category);
        setBCode(productData.p_code);
        setDescription(productData.p_desc);
        setDateCreated(new Date(productData.p_date_created));
        setImageUri(productData.p_photo);
        setUseExpiry(productData.p_useexpiry);
        setUnits(productData.p_units);
  }

  const saveProduct = () => {
    setLoading(true);
    const nameIsValid = validateName(pname);
          if(!nameIsValid){ 
            Alert.alert("Nazwa 1-20 znaków");
          return;
          } ;
    const barcodeIsValid = validateBarcode(bcode);
          if(!barcodeIsValid){ 
            Alert.alert("Nieprawidłowy kod") 
          return;
          } ;
    const categoryIsValid = validateName(category_value);
          if(!categoryIsValid){ Alert.alert("Wybierz jedną z kategori lub dowaj nową");
            return;
           } ;
   
  
    const descIsValid = validateDescription(description);
          if(!descIsValid){ 
            Alert.alert("Opis 1 - 200 znaków.");
          return;
          } ;
   

    if(nameIsValid && barcodeIsValid && categoryIsValid && descIsValid) {
        
      

      const newProductData = {
        id: id || null,
        pname,
        category_value,
        bcode,
        description,
        dCreated: dateToSQLiteCurrent(dateCreated),
        imgUri: imageUri || '',
        useExpiry,
        units

      };
        saveNewProductInDB(newProductData)
        
        .then(insertedId => {
          console.log(`New product created succesfuly with ID: ${insertedId}`);
          //navigation.navigate('Moj magazyn');
          setLoading(false);
          setSuccess(true);
          setTimeout(()=>{
            navigation.navigate('Produkty, edycja.');

          }, 500);
        })
        .catch(error => {
          Alert.alert("Operacja nie została wykonana:", error);
        });

        } //koniec if all is valid

    

  }



  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}
    showsHorizontalScrollIndicator={false}
    showsVerticalScrollIndicator={false}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          {/*SCANNER WINDOW */}
          {scannerVisible && (
            <View style={styles.onelinewrapper}>
              <ScannerFrame onBarcodeRead={onReadCode} />
            </View>
          )}
          <View style={styles.onelinewrapperBase}>
            <TextInput
              label="Kod produktu"
              value={bcode === "Skanowanie w toku" ? "" : bcode}
              onChangeText={(text) => setBCode(text)}
              onEndEditing={() => setBarCoreValue(bcode)}
              style={styles.nazwainput}
              error={
                !validateBarcode(bcode) &&
                bcode != "" &&
                bcode != "Skanowanie w toku"
              }
            />
            <IconButton
              mode="contained"
              size={40}
              style={styles.iconbuttonstyle}
              icon="barcode-scan"
              onPress={() => setScannerVisible(!scannerVisible)}
            />
          </View>

          <View style={styles.onelinewrapper}>
            <View style={[styles.dropmenu, { marginRight: 3, flex: 5 }]}>
              <PaperAutocomplete
                label="Nazwa"
                options={nazwaList}
                keyName="p_name"
                mode="flat"
                onSelect={handleSelectionName}
                onChangeText={handleTextChangeName}
                value={pname}
                error={!validateName(pname) && pname != ""}
              />
            </View>
 
            <View style={styles.dropmenu}>
              <PaperAutocomplete
                label="Kategoria"
                options={categoriesList}
                keyName="p_category"
                mode="flat"
                onSelect={handleSelectionCategory}
                onChangeText={handleTextChangeCategory}
                value={category_value}
                error={!validateName(category_value) && category_value != ""}
              />
            </View>
          </View>

          <TextInput
            label="Opis"
            value={description}
            onChangeText={(text) => setDescription(text)}
            multiline
            numberOfLines={3}
            style={[styles.textinput, { height: 90 }]}
            error={!validateDescription(description) && description != ""}
          />
        </View>

        <View style={styles.onelinewrapper}>
          <View
            style={[
              styles.formTextView,
              {
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: theme.colors.outline,
              },
            ]}
          >
            <Text>Produkt ma date ważności?</Text>
            <Switch value={useExpiry === 1} onValueChange={onToggleSwitch} />
          </View>
        </View>
        <View
          style={[
            styles.formTextView,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.outline,
            },
          ]}
        >
          {allUnits?.map((item) => {
            return (
              <Button
                style={
                  units === item
                    ? { borderColor: "rgba(84, 189, 35, 1)" }
                    : null
                }
                mode="outlined"
                key={item.toString()}
                disabled={units === item}
                onPress={() => setUnits(item)}
              >
                {item}
              </Button>
            );
          })}
        </View>

        {/* ikony do wyboru zdjęć */}

        <View style={styles.pictureView}>
          {!imageUri && (
            <View style={[styles.onelinewrapper]}>
              <View
                style={{
                  alignItems: "center",
                  padding: 20,
                  justifyContent: "space-around",
                }}
              >
                <IconButton
                  icon="file-image"
                  size={100}
                  mode="contained"
                  onPress={() => pickImage(setImageUri)}
                />
                <Text>Wybierz zdjęcie</Text>
              </View>

              <View
                style={{
                  alignItems: "center",
                  padding: 20,
                  justifyContent: "space-around",
                }}
              >
                <IconButton
                  icon="camera"
                  size={100}
                  mode="contained"
                  onPress={() => takePhoto(setImageUri)}
                />
                <Text>Zrób zdjęcie</Text>
              </View>
            </View>
          )}
          {imageUri && <Card.Cover source={{ uri: imageUri }} />}

          {imageUri && (
            <IconButton
              mode="contained"
              size={40}
              style={styles.deleteicon}
              icon="trash-can-outline"
              onPress={() => setImageUri(null)}
            />
          )}
        </View>

        {/* SAVE BUTTON */}
        <View style={styles.saveButtonWrapper}>
          <Button
            disabled={success}
            mode="contained"
            style={styles.savebutton}
            labelStyle={{ fontSize: 25 }}
            onPress={saveProduct}
            loading={loading}
          >
            {success ? 'Zapisano' : 'Zapisz'}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    dispay: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexDirection: "column",
    paddingHorizontal: 10,
  },
  textinput: { fontSize: 20, width: "100%", marginTop: 5 },

  onelinewrapper: {
    display: "flex",
    flexDirection: "row",
  },
  onelinewrapperBase: {
    display: "flex",
    flexDirection: "row",
    alignItems: 'baseline'
  },
  nazwainput: { fontSize: 20, flex: 6, marginTop: 10, marginRight: 5 },
  dropmenu: {
    flex: 4,
    marginTop: 5,
  },
  iconbuttonstyle: {
    borderRadius: 10,
    marginTop: 10,
  },

  pictureView: {
   width: '90%',
   alignSelf: 'center',
   marginVertical: 10,
   
  },
  deleteicon: {
    position: "absolute",
    borderRadius: 10,
    bottom: 0,
    right: 0,
    margin: 0,
    zIndex: 100,
  },
  saveButtonWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 30,
  },

  savebutton: {
    width: "90%",
    height: 50,
    alignSelf: "center",
    justifyContent: "center",
  },

  formTextView: {
    display: "flex",
    flex: 1,
    justifyContent: "space-evenly",
    flexDirection: "row",
    height: 60,
    marginTop: 5,
    borderTopEndRadius: 5,
    borderTopLeftRadius: 5,
    marginHorizontal: 10,
    alignItems: "center",
    borderBottomWidth: 1,
  },
});
