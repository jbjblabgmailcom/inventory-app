import React, {useState ,useEffect, useCallback, useRef} from 'react';
import { StyleSheet, View} from 'react-native';
import { fetchProductsFromDB } from '../dbQuerys/newProductDB';
import ListItems from '../components/ListItems';
import SearchComponent from '../components/SearchComponent';
import FloatingButton from '../components/FloatingButton';
import { useNavigation } from '@react-navigation/native';
import {Portal, Modal, Text, ActivityIndicator, Button, useTheme, IconButton} from 'react-native-paper';
import { useScanner } from '../hooks/useScanner';
import ScannerFrame from '../components/ScannerComponent';
import { fetchProductByCodefromDB } from '../dbQuerys/newProductDB';
import FilterForm from '../components/ListProductEditScreen/FilterForm';





export default function ListProductsEditScreen() {

  const DEFAULT_FILTERS = {
        category: "",
        limit: 20,
        cursor: null, 
      };
  
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const loadingRef = useRef(false);

  useEffect(() => {
      setProductList([]); // Clear immediately on filter change
      setCursor(null);
      setHasMore(true);
      loadMore(filters, true);
    }, [filters]);


  const [productList, setProductList] = useState();
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const navigation = useNavigation();
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [loadingAnimation, setLoadingAnimation] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [tuneMenuVisible, setTuneMenuVisible] = useState(false);
  const theme = useTheme();

  const [info, setInfo] = useState({});

  const { onReadCode, barCodeValue, setBarCoreValue } = useScanner();

  const loadMore = useCallback(
  async (customFilters = filters, reset = false) => {
    if (loadingRef.current) return;

    if (!hasMore && !reset) return;

    loadingRef.current = true;
    setLoadingProducts(true);

    // reset pagination safely
    if (reset) {
      setCursor(null);
      setHasMore(true);
    }

    try {
      const res = await fetchProductsFromDB(inputValue, {
        ...customFilters,
        cursor: reset ? null : cursor,
      });

      const fetchedData = res.data || [];

      setProductList(prev => {
        if (reset) return fetchedData;

        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNew = fetchedData.filter(p => !existingIds.has(p.id));

        return [...prev, ...uniqueNew];
      });

      setCursor(res.nextCursor);
      setHasMore(res.hasMore);

    } catch (err) {
      console.log('Failed to load products:', err);
    } finally {
      loadingRef.current = false;
      setLoadingProducts(false);
    }
  },
  [cursor, hasMore, filters, inputValue]
);


  const handleEndEditing = () => {
          loadMore(filters, true);
  };

  useEffect(()=> {
  
      handleEndEditing();
  
    
  },[inputValue]);


    useEffect(()=>{
        setInfo('');
        if(barCodeValue != 'Skanowanie w toku') {
        fetchProductByCodefromDB(barCodeValue)
        .then(result =>{
            if(result.product != null) {
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
           setInfo(
              {
                success: false,
                message: 'Nie znaleziono takiego kodu'
              });

        });
          } 


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
          style={[styles.modalStyle, {backgroundColor: theme.colors.background2, borderColor: theme.colors.elevation.level5}]}
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
            size={60}
          />
          <Button mode="contained" onPress={dismissModal}>
            Zamknij
          </Button>
        </Modal>
      </Portal>

      <View style={styles.container}>
        <View style={styles.onelinewrapperBaseSpace}>
          <View style={{width: '85%'}}>
              <SearchComponent
          handleEndEditing={handleEndEditing}
          inputValue={inputValue}
          setInputValue={setInputValue}
          
        />
          </View>
          
        <IconButton 
        mode='contained'
        style={styles.tuneIcon}
        icon="tune"
        size={40}
        onPress={()=> setTuneMenuVisible(!tuneMenuVisible)}
        />
        </View>
        {tuneMenuVisible &&
        <FilterForm
              filters={filters}
              setFilters={setFilters}
              default_filters={DEFAULT_FILTERS}
              setProductList={setProductList}
              setCursor={setCursor}
              setHasMore={setHasMore}
              loadMore={loadMore}
             // onDismissModal={onDismissModal}
            />
            }
        {!loadingProducts &&
       
        <ListItems
          dbData={productList || {}}
          handleEndEditing={handleEndEditing}
          loadingProducts={loadingProducts}
          loadMore={loadMore}
          filters={filters}
        />
        
          
        }
        <FloatingButton
          visibility={false}
          onPress={() => navigation.navigate("Definiuj nowy produkt")}
          icon="new-box"
          right={95}
          bottom={20}
          size={60}
        />
        <FloatingButton
          visibility={false}
          onPress={() => setScanModalVisible(true)}
          icon="qrcode-edit"
          right={10}
          bottom={20}
          size={60}
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
 onelinewrapper: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
  },
  onelinewrapperBaseSpace: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
 modalStyle: {
        display: 'flex',
        borderWidth: 1,
        borderStyle:'solid', 
        borderRadius: 10,
        padding: 20,
        margin: 10,
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
    tuneIcon: {
      flex: 1, 
      borderRadius: 0,
      borderTopLeftRadius: 5,
      borderTopRightRadius: 5,
      borderBottomWidth: 1,

    },
});
