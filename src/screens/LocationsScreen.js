import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useMemo,
  useCallback
} from "react";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { View, StyleSheet } from "react-native";
import {
  Portal,
  Modal,
  IconButton,
  Text,
  Button,
 
   } from "react-native-paper";
import {
  fetchLocationsNamesFromDB,
  saveNewLocationInDB,
  fetchProductByCodefromDB,
  fetchProductByLocationfromDB2,
} from "../dbQuerys/newProductDB";
import {
  validateName,
  validateDateForSQLite,
} from "../utils/ValidateFunctions";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "react-native-paper";
import LocationsMenu from "../components/LocationsMenu";
import { useScanner } from "../hooks/useScanner";
import { useDatePicker } from "../hooks/useDatePicker";
import ListItemsByLocation from "../components/ListItemsByLocations";
import { useCounter } from "../hooks/useCounter";
import FloatingButton from "../components/FloatingButton";
import { createAddMoreProduct, createAddProductToLocation } from "../functions/LocationsScreen/addMoreProduct";
import { useToggleBottomSheet } from "../hooks/useToggleBottomSheet";
import {
  useHandleAddToDB,
  useHandleAddToDBOtherLocation,
} from "../hooks/useHandleAddToDB";
import { useDismissModal } from "../hooks/useDismissModal";
import { AddLocationModal } from '../components/LocationsScreen/AddLocationModal';
import { AddProductModal } from "../components/LocationsScreen/AddProductModal";
import { AddProductByNameModal } from "../components/LocationsScreen/AddProductByNameModal";
import { BottomSheetContent } from "../components/LocationsScreen/BottomSheetContent";
import RemoveProductModal from '../components/LocationsScreen/RemoveProductModal';


import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from "react-native-reanimated";

import { useDB } from "../hooks/useDB";





const LocationsScreen = () => {



  const [locationGlobal, setLocationGlobal] = useState({});
  const [locationOther, setLocationOther] = useState({});
  const [locationsList, setLocationsList] = useState([]);
  const [locationName, setLocationName] = useState("");
  const [locationSaved, setLocationSaved] = useState(false);
  const [locationInfo, setLocationInfo] = useState(null);

  const [productList, setProductList] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [savingToDB, setSavingToDB] = useState(false);

  const { onReadCode, barCodeValue, setBarCoreValue } = useScanner();
  const [scannerVisible, setScannerVisible] = useState(false);
  const [onRemove, setOnRemove] = useState(false);
  const [productForAdd, setProductForAdd] = useState(null);

  const { modalOpen, setModalOpen, expiryDate, onConfirm, setExpiryDate } = useDatePicker();
  const { counter, changeCounter, setCounter } = useCounter();

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");

  const [inputValue, setInputValue] = useState('');

  const { loading, error } = useDB();

  const route = useRoute();
  const theme = useTheme();

  const anim = useSharedValue(0);

    const DEFAULT_FILTERS = {
          category: '',
          qtyFrom: '',
          qtyTo: '',
          useExpiry: 'all',
          limit:  20,
          cursor: null,
        };
    
      const [filters, setFilters] = useState(DEFAULT_FILTERS);
      const loadingRef = useRef(false);

      const [cursor, setCursor] = useState(null);
      const [hasMore, setHasMore] = useState(true);

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
            if(locationGlobal && Object.keys(locationGlobal).length != 0) {
             const res = await fetchProductByLocationfromDB2(locationGlobal?.loc_name, inputValue, {
              ...customFilters,
              cursor: reset ? null : cursor,
            });
      
            const fetchedData = res._array || [];
           
            setProductList(prev => {
              if (reset) return fetchedData;
      
              const existingIds = new Set(prev.map(p => p.id));
              const uniqueNew = fetchedData.filter(p => !existingIds.has(p.id));
      
              return [...prev, ...uniqueNew];
            });
      
            setCursor(res.nextCursor);
            setHasMore(res.hasMore);
            }
      
          } catch (err) {
          } finally {
            loadingRef.current = false;
            setLoadingProducts(false);
          }
        },
        [cursor, hasMore, filters, inputValue, locationGlobal]
      );
      
      
        const handleEndEditing = () => {
                loadMore(filters, true);
        };

          useEffect(()=> {
          
              handleEndEditing();
          
          },[inputValue]);
  
    useEffect(() => {
        setProductList([]); // Clear immediately on filter change
        setCursor(null);
        setHasMore(true);
        loadMore(filters, true);
      }, [filters]);
  
      useEffect(() => {
        anim.value = withTiming(modalVisible ? 1 : 0, {
          duration: modalVisible ? 250 : 250,
        });
      }, [modalVisible]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: anim.value,
    transform: [
      {
        translateY: interpolate(
          anim.value,
          [0, 1],
          [60, 0] 
        ),
      },
    ],
  }));

  const bottomSheetRef = useRef(null);

   const onDismissModal = useDismissModal({
     setModalVisible,
     setLocationName,
     setModalType,
     setCounter,
     setProductForAdd,
     setScannerVisible,
     setBarCoreValue,
     setLocationInfo,
     setLocationOther,
     setExpiryDate,
   });

  const handleAddToDB = useHandleAddToDB({
    locationGlobal,
    setProductList,
    onDismissModal,
    setSavingToDB,
  });

    const handleAddToDBOtherLocation = useHandleAddToDBOtherLocation({
      locationOther,
      onDismissModal,
      setSavingToDB,
    });


  const toggleMenu = useToggleBottomSheet({
    bottomSheetRef,
    isSheetOpen,
    setIsSheetOpen,
  });

   

  const addMoreProduct = useMemo(
    () =>
      createAddMoreProduct({
        setProductForAdd,
        setModalType,
        setModalVisible,
      }),
    []
  );

    const addProductToLocation = useMemo(
      () =>
        createAddProductToLocation({
          setProductForAdd,
          setModalType,
          setModalVisible,
        }),
      []
    );

  useEffect(() => {
  
    if (!route.params) {
      if(locationsList || locationsList != 0) {
      setLocationGlobal(locationsList[0]);
      }
     
    }
  }, [locationsList]);

useEffect(() => {
  const selectedName = route.params?.location_name;

  if (selectedName) {
    const matchedLocation = locationsList.find(
      (loc) => loc.loc_name === selectedName
    );

    if (matchedLocation) {

      setLocationGlobal(matchedLocation);
    }
  }
}, [route.params?.location_name, locationsList]); 



  

  useLayoutEffect(() => {
    navigation.setOptions({
      title: locationGlobal?.loc_name || "Utwórz lokalizację",
      headerRight: () => (
        <>
          <IconButton
           icon={isSheetOpen ? "arrow-down" : "arrow-up"}
          
            onPress={toggleMenu}
            mode="outlined"
          />
        </>
      ),
    });
  }, [navigation, toggleMenu, isSheetOpen, locationGlobal]);

  useFocusEffect(
    useCallback(() => {
      handleEndEditing();
    }, [locationGlobal, onRemove])
  );

  useEffect(() => {
    if (barCodeValue != "Skanowanie w toku") {
      setProductForAdd(null);
      
      fetchProductByCodefromDB(barCodeValue, locationGlobal.loc_name)
        .then((r) => {
          
          addMoreProduct(
            r.product.id,
            r.product.p_name,
            locationGlobal.loc_name,
            null,
            false,
            r.product.p_useexpiry,
            r.product.p_units,
          );
  

          if (r.location) {
            setLocationInfo(r.location.location_id);
          }
        })
        .catch((err) => {
          console.log("Nie mozna pobrac produktu z bazy danych");
        });
    }
  }, [barCodeValue]);





    useEffect(() => {
   
      fetchLocationsNamesFromDB()
      .then((result) => {
        setLocationsList(result);
        if(result.length === 0) {
              setModalType('addLocation');
              setModalVisible(true);
        }

      })
      .catch((err) => console.log("DB error", err));
      
        
   
    
  }, [locationSaved]); 


  const saveNewLocation = (param) => {
    if (validateName(param)) {
      saveNewLocationInDB(param)
        .then((result) => {
         setLocationSaved(!locationSaved);
        })
        .catch((error) => {
          console.log(error);
        });
    }

    onDismissModal();
  };


 

  
  return (
  
   <>
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={onDismissModal}
          contentContainerStyle={styles.modalContainer}
        >
          <Animated.View
            style={[
              styles.modalStyle,
              {
                backgroundColor: theme.colors.elevation.level3,
                borderColor: theme.colors.elevation.level5,
              },
              animatedStyle,
            ]}
          >
            {modalType === "addLocation" && (
              <AddLocationModal
                locationName={locationName}
                setLocationName={setLocationName}
                scannerVisible={scannerVisible}
                setScannerVisible={setScannerVisible}
                onDismissModal={onDismissModal}
                onReadCode={onReadCode}
                saveNewLocation={saveNewLocation}
                validateName={validateName}
              />
            )}
            {modalType === "addMoreProduct" && (
              <AddProductModal
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
                expiryDate={expiryDate}
                onConfirm={onConfirm}
                scannerVisible={scannerVisible}
                productForAdd={productForAdd}
                counter={counter}
                changeCounter={changeCounter}
                validateDateForSQLite={validateDateForSQLite}
                handleAddToDB={handleAddToDB}
                handleAddToDBOtherLocation={handleAddToDBOtherLocation}
                locationInfo={locationInfo}
                locationGlobal={locationGlobal}
                onReadCode={onReadCode}
                barCodeValue={barCodeValue}
                onDismissModal={onDismissModal}
                locationOther={locationOther}
                setLocationOther={setLocationOther}
                locationsList={locationsList}
                setExpiryDate={setExpiryDate}
                savingToDB={savingToDB}
              />
            )}
            {modalType === "addproductbyname" && (
              <AddProductByNameModal
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
                expiryDate={expiryDate}
                onConfirm={onConfirm}
               productForAdd={productForAdd}
               setProductForAdd={setProductForAdd}
                counter={counter}
                changeCounter={changeCounter}
                validateDateForSQLite={validateDateForSQLite}
                handleAddToDBOtherLocation={handleAddToDBOtherLocation}
               locationInfo={locationInfo}
                locationGlobal={locationGlobal}
                onDismissModal={onDismissModal}
                locationsList={locationsList}
                setExpiryDate={setExpiryDate}
                savingToDB={savingToDB}
                locationOther={locationOther}
                setLocationOther={setLocationOther}
                setOnRemove={setOnRemove}
                onRemove={onRemove}
                

              />
            )}

            {modalType === "removeProduct" && (
              <RemoveProductModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                locationGlobal={locationGlobal}
                modalType={modalType}
                onRemove={onRemove}
                setOnRemove={setOnRemove}
                onDismissModal={onDismissModal}
              />
            )}
          </Animated.View>
        </Modal>
      </Portal>
  
  {locationGlobal === undefined &&
  <View style={{ paddingBottom: 150, paddingTop: 10 }}>
    <View style={styles.modalStyle}>
      
    <Text variant="titleMedium" style={styles.modalText}>Stwórz swoją pierwszą lokalizację.</Text>
    <Button
    style={styles.buttonstyle}
    mode="contained"
    icon="plus"
    onPress={()=>{
      setModalType('addLocation');
      setModalVisible(true);
    }}
    >
      Dodaj
    </Button>
    
    </View>
    </View>}

  {!loading && !error && locationGlobal && Object.keys(locationGlobal).length != 0 &&
  

  <>
      <View style={{flex: 1 }}>
            <ListItemsByLocation
              dbData={productList}
              addMoreProduct={addMoreProduct}
              addProductToLocation={addProductToLocation}
              inputValue={inputValue}
              setInputValue={setInputValue}
              loadingProducts={loadingProducts}
              handleEndEditing={handleEndEditing}
              filters={filters}
              setFilters={setFilters}
              DEFAULT_FILTERS={DEFAULT_FILTERS}
              setProductList={setProductList}
              setCursor={setCursor}
              setHasMore={setHasMore}
              loadMore={loadMore}
            />
        
      </View>

      <LocationsMenu
        ref={bottomSheetRef}
        content={
          <BottomSheetContent
            locationsList={locationsList}
            locationGlobal={locationGlobal}
            setLocationGlobal={setLocationGlobal}
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            setModalType={setModalType}
          />
        }
        setIsSheetOpen={setIsSheetOpen}
      />
   
      <FloatingButton
        onPress={() => {
          setModalVisible(true);
          setModalType("addMoreProduct");
          setScannerVisible(true);
        }}
        icon="qrcode-plus"
        visibility={isSheetOpen}
        right={10}
        size={60}
        bottom={20}
      />
   
      <FloatingButton
        onPress={() => {
          setModalVisible(true);
          setModalType("addproductbyname");
          setScannerVisible(false);
        }}
        icon="playlist-plus"
        visibility={isSheetOpen}
        right={100}
        size={60}
        bottom={20}
      />
         
      <FloatingButton
        onPress={() => {
          setModalVisible(true);
          setModalType("removeProduct");
          setScannerVisible(true);
        }}
        icon="qrcode-minus"
        visibility={isSheetOpen}
        right={190}
        size={60}
        bottom={20}
      />
    
        </> 
          }
      </>

 
  );
};

export default LocationsScreen;

const styles = StyleSheet.create({
  modalContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    margin: 5, // optional
    alignSelf: "stretch",
  },
  container: {
    dispay: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexDirection: "column",
    paddingHorizontal: 10,
    borderBottom: 200,
  },
  modalStyle: {
    display: "flex",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 5,
    margin: 10,
    minHeight: 200,
    alignItems: "center",
    padding: 10,
    paddingBottom: 20,
  },
  modalText: {
    marginVertical: 10,
  },
  textinput: {
    fontSize: 20,
    width: "100%",
    marginTop: 10,
  },

  onelinewrapper: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    
  },
  onelinewrapperSpaced: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },

  dropmenu: {
    flex: 4,
    marginTop: 10,
  },
  iconbuttonstyle: {
    borderRadius: 5,
    marginTop: 10,
  },
  buttonstyle: {
    marginTop: 30,
  },

  warningtextWrap: {
    margin: 20,
    minHeight: 50,
  },

  menuButton: {
    marginTop: 5,
  },
  surface: {
    borderRadius: 10,
    marginTop: 5,
    marginHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  withBorder: {
    borderColor: "rgba(49, 133, 0, 1)",
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  nazwainput: {
    minWidth: "75%",
    minHeight: "20",
    fontSize: 20,
    marginLeft: 5,
  },

  saveButton: {
    borderRadius: 5,
  },

  productwrapper: {
    borderWidth: 1,
    padding: 5,
    borderRadius: 5,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    marginVertical: 10,
  },
});
