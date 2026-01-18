import React, {useState ,useEffect} from 'react';
import { StyleSheet, View} from 'react-native';
import { fetchProductsFromDB } from '../dbQuerys/newProductDB';
import ListItems from '../components/ListItems';
import SearchComponent from '../components/SearchComponent';
import FloatingButton from '../components/FloatingButton';
import { useNavigation } from '@react-navigation/native';
import {Portal, Modal, Text, ActivityIndicator, Button} from 'react-native-paper';
import { useScanner } from '../hooks/useScanner';
import ScannerFrame from '../components/ScannerComponent';
import { fetchProductByCodefromDB } from '../dbQuerys/newProductDB';





export default function ListProductsEditScreen() {


  const [productList, setProductList] = useState();
  const [removedProduct, setRemovedProduct] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const navigation = useNavigation();
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [loadingAnimation, setLoadingAnimation] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [info, setInfo] = useState({});

  const { onReadCode, barCodeValue, setBarCoreValue } = useScanner();

  useEffect (()=> {
    setLoadingProducts(true);
    fetchProductsFromDB(inputValue)
    .then(
      result => 
        {setProductList(result);
          setLoadingProducts(false);
      console.log('Lista produktów z bazy', result);
        }
    )
    .catch(err => console.error("DB error", err));
  },[removedProduct]);

  const handleEndEditing = () => {
          setRemovedProduct(!removedProduct);
  };


    useEffect(()=>{
        setInfo('');
        if(barCodeValue != 'Skanowanie w toku') {
        fetchProductByCodefromDB(barCodeValue)
        .then(result =>{
            if(result.product != null) {
            console.log("result tu i teraz", result.product);
            setInfo(
              {
                success: true,
                message: `Znaleziono produkt: ${result.product.p_name}`
              });
            setLoadingAnimation(true);
         
            setTimeout(() => {
              dismissModal();
              navigation.navigate('Definiuj nowy produkt', {itemId: result.product.id});
              

              }, 1000);
    
            }
        

        })
        .catch(error => {
           console.log("nie znaleziono takiego kodu", error);
            setInfo(
              {
                success: false,
                message: 'Nie znaleziono takiego kodu'
              });

        });
          } //if


    },[barCodeValue]);


  
  const dismissModal = () => {
    setScanModalVisible(false);
    setInfo({});
    setLoadingAnimation(false);
    setBarCoreValue('Skanowanie w toku');
  }

  return (
    <>
      <Portal>
        <Modal
          visible={scanModalVisible}
          onDismiss={() => dismissModal()}
          style={styles.modalStyle}
          animationType="fade"
        >
          <Text style={styles.modalText}>
            Skanuj kod produktu. Produkt musi już być zdefiniowany.
          </Text>

          <ScannerFrame onBarcodeRead={onReadCode} active={scanModalVisible} />

          <Text style={styles.modalText}>{barCodeValue}</Text>
          <Text
            style={[
              styles.modalText,
              info?.success ? styles.textSuccess : styles.textNoSuccess,
            ]}
          >
            {info?.message}
          </Text>

          <ActivityIndicator
            mode="contained"
            animating={loadingAnimation}
            size={80}
          />
          <Button mode="contained" onPress={dismissModal}>
            Zamknij
          </Button>
        </Modal>
      </Portal>

      <View style={styles.container}>
        <SearchComponent
          handleEndEditing={handleEndEditing}
          inputValue={inputValue}
          setInputValue={setInputValue}
          loadingProducts={loadingProducts}
        />

        <ListItems
          dbData={productList || {}}
          onRemove={removedProduct}
          setOnRemove={setRemovedProduct}
          loadingProducts={loadingProducts}
        />

        <FloatingButton
          visibility={false}
          onPress={() => navigation.navigate("Definiuj nowy produkt")}
          icon="new-box"
          right={110}
        />
        <FloatingButton
          visibility={false}
          onPress={() => setScanModalVisible(true)}
          icon="qrcode-edit"
          right={10}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    justifyContent: 'flex-start',

    paddingHorizontal: 5,

 },
 modalStyle: {
        display: 'flex',
        borderColor: 'rgba(73, 80, 121, 1)',
        borderWidth: 2,
        borderStyle:'solid', 
        borderRadius: 10,
        padding: 20,
        margin: 10,
        backgroundColor: 'rgba(78, 78, 78, 0.77)',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        marginTop: 100,
        maxHeight: 600,
        textAlign: 'center',
      
    },

    modalText: {
      alignSelf: 'center',
    },

    textSuccess: {
      color: 'rgba(81, 255, 0, 1)',
      fontSize: 20,
    
    },
    textNoSuccess: {
      color: 'rgba(255, 0, 0, 1)',
      fontSize: 20,
     
    },
});
