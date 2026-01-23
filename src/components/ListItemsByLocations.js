import React, {useState, useEffect, useCallback} from 'react';
import {Text, Surface, IconButton, Button, Portal, useTheme, Modal, Menu, Divider} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FlatList, TouchableOpacity, View, StyleSheet, Image} from 'react-native';
import { removeProductFromLocation } from '../dbQuerys/newProductDB';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import QtyWrapper from './QtyWrapper';
import SearchComponent from './SearchComponent';
import FilterForm from './LocationsScreen/FilterForm';
import InfiniteScrollFlatList from './InfiniteScrollFlatList';




export default function ListItemsByLocation(props){

  const {
    dbData: productList = [],
    inputValue,
    setInputValue,
    loadingProducts,
    handleEndEditing,
    filters,
    setFilters,
    DEFAULT_FILTERS,
    setProductList,
    setCursor,
    setHasMore,
    loadMore
  } = props;
    
    
    const [modalVisible, setModalVisible] = useState(false);
    const [productForRemoval, setProductForRemoval] = useState({});
    const [maxRemove, setMaxRemove] = useState(0);
    const [tuneMenuVisible, setTuneMenuVisible] = useState(false);
  
    const theme = useTheme();

    const [menuVisibleFor, setMenuVisibleFor] = useState(null);
 
    

    const anim = useSharedValue(0);

    useEffect(() => {
      anim.value = withTiming(modalVisible ? 1 : 0, {
        duration: modalVisible ? 250 : 1000,
      });
    }, [modalVisible]);

const animatedStyle = useAnimatedStyle(() => ({
  opacity: anim.value,
  transform: [
    {
      translateY: interpolate(
        anim.value,
        [0, 1],
        [60, 0] // slides down when dismissing
      ),
    },
  ],
}));



    
        const deleteProduct = (id, name, locId, locName, qty, units) => {
                setProductForRemoval({
                    removeId: id,
                    removeName: name,
                    removeLocId: locId,
                    removeLocName: locName,
                    removeQty: qty,
                    removeUnits: units
                });
               setModalVisible(true);
              
        }; 

        const changeQty = (operation) => {
          
            setProductForRemoval(prev => {
              if(!prev) return prev;
              let newQty = prev.removeQty;
              if (operation === 'inc') newQty +=1;
              if (operation === 'dec') newQty -=1;

              newQty = Math.max(1, Math.min(newQty, maxRemove));

              return {
                  ...prev,
                  removeQty: newQty,
              };
            } );
          
        };
        

    
        const deleteProductConfirm = () => {
         
            removeProductFromLocation(productForRemoval)
           .then(result => {
               
                onDismissModal();
                handleEndEditing();
           })
           .catch(err => console.log("DELETING ERROR", err)); 
    
        };
    
        const onDismissModal = () => {
          setModalVisible(false);
          
          setTimeout(()=>{
            setProductForRemoval({});
            setMaxRemove(0);
          },250);  
          
            
        };


  const dismissMenu = () => {
    setMenuVisibleFor(null);
  }

     
    
        const navigation = useNavigation();


       const ProductItem = React.memo(({ item }) => (
         <Menu
         mode="elevated"
            elevation={3}
           visible={menuVisibleFor === item.id}
           onDismiss={() => dismissMenu()}
           anchor={
             <TouchableOpacity
               onPress={() =>
                 navigation.navigate("Informacja o produkcie", {
                   itemId: item.id,
                   location_id: item.location_id,
                   location_name: item.location_name,
                 })
               }
               onLongPress={() => setMenuVisibleFor(item.id)}
             >
               <Surface elevation={2} style={styles.row}>
                 <View style={styles.left}>
                   <Image
                     source={
                       item.p_photo
                         ? { uri: item.p_photo }
                         : require("../assets/imgplaceholder.png")
                     }
                     style={{ width: 70, height: 70, borderRadius: 5 }}
                   />
                 </View>

                 <View style={styles.middle}>
                   <Text style={{ fontSize: 16 }}>{item.p_name}</Text>
                   <Text style={{ fontSize: 15 }}>
                     Ilość: {item.location_qty} {item.p_units}
                   </Text>
                   <Text style={{ fontSize: 15 }}>Kod: {item.p_code}</Text>
                 </View>

                 <View style={styles.right}>
                   <IconButton
                     size={25}
                     style={styles.minusicon}
                      icon="minus"
                     onPress={() => {
                        setMaxRemove(item.location_qty);
                       deleteProduct(
                         item.id,
                         item.p_name,
                         item.location_id,
                         item.location_name,
                         1,
                         item.p_units
                       );
                     }}
                   />
                   <IconButton
                     size={25}
                      icon="plus"
                     style={styles.plusicon}
                     onPress={() =>
                       props.addMoreProduct(
                         item.id,
                         item.p_name,
                         item.location_name,
                         item.location_id,
                         true,
                         item.p_useexpiry,
                         item.p_units
                       )
                     }
                   />
                 </View>
               </Surface>
             </TouchableOpacity>
           }
         >
           <Menu.Item
           leadingIcon="invoice-text-edit-outline"
             onPress={() => {
               navigation.navigate("Definiuj nowy produkt", {
                 itemId: item.id,
               });
               dismissMenu();
             }}
             title={`Edytuj ${item.p_name}`}
           />
           <Menu.Item
           leadingIcon="page-next-outline"
             onPress={() => {
               props.addProductToLocation(
                 item.id,
                 item.p_name,
                 true,
                 true,
                 item.p_useexpiry,
                 item.p_units
               );
               dismissMenu();
             }}
             title="Dodaj do innej lokalizacji"
           />
           <Menu.Item
           leadingIcon="information-outline"
           onPress={() => {
               navigation.navigate("Informacja o produkcie", {
                 itemId: item.id,
                 location_id: item.location_id,
                 location_name: item.location_name,
               });
               dismissMenu();
             }
            }

             title="Informacje"
           />
         </Menu>
       ));

const renderItem = useCallback(
  ({ item }) => <ProductItem item={item} />,
  [menuVisibleFor, productList]
);

    return (
      <>
        <Portal>
          <Modal visible={modalVisible} onDismiss={onDismissModal}>
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
              <QtyWrapper
                changeQty={changeQty}
                alteredProperty={productForRemoval.removeQty}
                units={productForRemoval.removeUnits}
              />

              <View style={styles.viewcolumnmodal}>
                {maxRemove - productForRemoval.removeQty >= 0 ? (
                <>
                <Text style={styles.modaltext}>
                  Usuwasz {productForRemoval.removeQty}{" "}
                  {productForRemoval.removeUnits} {productForRemoval.removeName}{" "}
                  z {productForRemoval.removeLocName}.
                </Text>

                  <Text style={styles.modaltext}>
                  Pozostanie {maxRemove - productForRemoval.removeQty}{" "}
                  {productForRemoval.removeUnits}
                  </Text>  
                  <Text style={styles.modaltext}>Na pewno?</Text>
                  </>
                  ):(
                    <>
                    <Text style={styles.modaltext}>
                  Dostępna ilość to {maxRemove}{" "}
                  {productForRemoval.removeUnits}
                  </Text>  
                  <Text style={styles.modaltext}>Nie można usunąć.</Text>
                  </>
                  )}
                  
                
             
                
              </View>
              <View style={styles.onelinewrapperSpaced}>
                <Button
                  mode="outlined"
                   icon="close"
                  onPress={() => onDismissModal()}
                >
                  Nie
                </Button>

                <Button
                  disabled={maxRemove - productForRemoval.removeQty < 0}
                  mode="contained"
                  icon="check"
                  onPress={() => deleteProductConfirm()}
                  iconColor={theme.colors.tertiary}
                >
                  Tak
                </Button>
              </View>
            </Animated.View>
          </Modal>
        </Portal>
        <View style={styles.column}>
          <View style={styles.onelinewrapperBaseSpace}>
                  <View style={{width: '85%'}}>
                      <SearchComponent
                      handleEndEditing={handleEndEditing}
                      inputValue={inputValue}
                      setInputValue={setInputValue}
                      loadingProducts={loadingProducts}
                    
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
             
            />
            }
           
        

          <View style={{flex: 1}}>
            {!loadingProducts && productList.length === 0 && (
              <View style={styles.modalStyle}>
                <Text variant="titleLarge">
                  Brak produktów w tej lokalizacji
                </Text>
              </View>
            )}

            {productList.length > 0 && (
           
                  <InfiniteScrollFlatList 
                    renderItem={renderItem}
                    loadMore={loadMore}
                    filters={filters}
                    data={productList}
                    loading={loadingProducts}
                    
                    /> 
             
            )
            
            }
          </View>
        </View>
      </>
    );

}


const styles = StyleSheet.create({
  viewrow: {},
  viewcolumn: {
    marginLeft: 20,
  },
  
  

  surfacestyle: {
    display: "flex",
    marginHorizontal: 5,
    marginVertical: 5,
    borderRadius: 5,
    padding: 5,
    alignItems: "flex-start",
    flexDirection: "row",
    maxWidth: "100%",
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 5,

    padding: 5,
    borderRadius: 5,
    alignItems: "flex-start",
    flexDirection: "row",
    maxWidth: "100%",
    justifyContent: "space-evenly",

    marginBottom: 2,
  },
  left: {},

  middle: {
    flex: 1,
    marginHorizontal: 10,
  },

  right: {
    display: "flex",
    flexDirection: "row",
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
  modaltext: {
    alignSelf: "center",
    fontSize: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  viewcolumnmodal: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  viewrow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  deleteicon: {
    margin: 0,
    borderWidth: 1,
  },
  minusicon: {
    marginTop: 25,
    margin: 0,
    borderWidth: 1,
  },
  plusicon: {
    margin: 0,

    borderWidth: 1,
  },
  onelinewrapperSpaced: {
    display: "flex",
    width: "80%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  onelinewrapper: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  column: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  tuneIcon: {
      flex: 1, 
      borderRadius: 0,
      borderTopLeftRadius: 5,
      borderTopRightRadius: 5,
      borderBottomWidth: 1,
      

    },
  onelinewrapperBaseSpace: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      justifyContent: 'space-evenly',
      alignItems: 'center'
  },
});