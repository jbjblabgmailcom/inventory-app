import React, {useState, useEffect, useRef} from "react";
import {View, StyleSheet, FlatList} from 'react-native';
import {Text} from 'react-native-paper';
import ScannerFrame from "../ScannerComponent";
import { useScanner } from "../../hooks/useScanner";
import { fetchProductByCodefromDB, removeProductFromLocation } from "../../dbQuerys/newProductDB";
import ModalCloseButton from "../ModalCloseButton";




export default function RemoveProductModal({
    modalVisible,
    locationGlobal,
    onRemove,
    setOnRemove,
    onDismissModal,
        
}) {

    const [productList, setProductList] = useState([]);
    const { onReadCode, barCodeValue, setBarCoreValue } = useScanner();
    const listRef = useRef(null);

    useEffect(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, [productList.length]);

    useEffect(() => {
        if (barCodeValue != "Skanowanie w toku") {
        
          
          fetchProductByCodefromDB(barCodeValue, locationGlobal.loc_name)
            .then((r) => {
              if (r.product && r.location) {

                removeProductFromLocation({
                  removeId: r.product.id,
                  removeLocId: r.location.location_id,
                  removeQty: 1,
                  
                })
                  .then((result) => {
                    setProductList(prevList => [...prevList, {
                        id: r.product.id,
                        name: r.product.p_name,
                        removedQty: result.removed,
                        remainingQty: result.remaining,
                        remainingUnits: r.product.p_units
                  
                    }]);
                    setOnRemove(!onRemove);
                    setBarCoreValue('Skanowanie w toku');
                  })
                  .catch((err) => console.log("DELETING ERROR", err));
              }
            }
              )
            .catch((err) => {
              console.log("Nie mozna pobrac produktu z bazy danych", err);
            });
        }
      }, [barCodeValue]);


    return (
      <>
        <View style={styles.container}>
          <View style={styles.onelinewrapper}>
            <Text variant="bodyLarge" style={styles.headLineText}>
              Wydanie produktów z lokalizacji {locationGlobal.loc_name}
            </Text>
          </View>
          <View style={styles.onelinewrapper}>
            {modalVisible && <ScannerFrame onBarcodeRead={onReadCode} />}
          </View>
          <View style={styles.onelinewrapper}>
            <View style={styles.row}>
              <Text style={[styles.cell, styles.colName]}>Nazwa</Text>
              <Text style={styles.cell}>Wydano</Text>
              <Text style={styles.cell}>Pozostało</Text>
            </View>
          </View>
          <FlatList
            ref={listRef}
            style={styles.flatList}
            showsVerticalScrollIndicator={false}
            data={productList}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={[styles.cell, styles.colName]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.cell}>{item.removedQty}</Text>
                <Text style={styles.cell}>{item.remainingQty}{" "}{item.remainingUnits}</Text>
              </View>
            )}
          />
          <View style={styles.onelinewrapper}>
              
           <ModalCloseButton onPress={onDismissModal} />
                      
          </View>
        </View>
      </>
    );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,    
  },
  container: {
    dispay: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexDirection: "column",
    paddingHorizontal: 10,
    borderBottom: 200,
    flex: 1,
  },
  onelinewrapper: {
    display: 'flex',
    flexDirection: "row",
    width: '100%',
    justifyContent: 'center',

  },
  row: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 6,
 
  },
  cell: {
    flex: 1,
    textAlign: "center",
  },
  colName: {
    flex: 2,
    textAlign: "left",
  },
  scrollContent: {
    alignItems: "center",
    width: "100%",
    height: "300",
    paddingBottom: 20,
  },
  headLineText: {
    textAlign: "center",

    fontWeight: "500",
    letterSpacing: 0.2,

    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  flatList: {
    flex: 1,
    
    minWidth: "100%",
    height: "300",
   
  },
 
});