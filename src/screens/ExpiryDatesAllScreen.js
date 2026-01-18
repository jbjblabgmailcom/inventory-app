import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button, Portal, Modal, useTheme } from 'react-native-paper';

import { fetchExpiryDatesFromDB2 } from '../dbQuerys/newProductDB';

import { useRoute } from '@react-navigation/native';
import FilterForm from '../components/FilterForm';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import ExpiryDatesList from "../components/ExpiryDatesInfoScreen/ExpiryDatesFlatList";




export default function ExpiryDatesAllScreen() {

  
  //const route = useRoute();

//const {itemId, locId, pName, pCode, pQty, dateCreated, locName, useExpiry, units} = route.params
 // const [infoExpiry, setInfoExpiry] = useState({itemId, locId, pName, pCode, pQty, dateCreated, locName, useExpiry, units});

const DEFAULT_EXPIRY_FILTERS = {
  fromDate: null,
  toDate: null,
  limit: 6,
  cursor: null, 
};




const [filters, setFilters] = useState(DEFAULT_EXPIRY_FILTERS);


useEffect(() => {
  setExpiryDates([]); // Clear immediately on filter change
  setCursor(null);
  setHasMore(true);
  loadMore(filters, true);
}, [filters]);

  const [expiryDates, setExpiryDates] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const theme = useTheme();
  const anim = useSharedValue(0);
    
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

    const onDismissModal = () => {
        setModalVisible(false);
    }

  useEffect(()=>{
    console.log("EXPIRY", expiryDates);
  },[expiryDates]);


  const loadMore = useCallback(
    async (customFilters = filters, reset = false) => {
      if (loading) return; 
      if (!hasMore && !reset) return;

      setLoading(true);

      try {
        
        const res = await fetchExpiryDatesFromDB2(null,{
          ...customFilters,
          cursor: reset ? null : cursor,
        });
        
        setExpiryDates((prev) => {
          const newData = res.items;
          if (reset) {
            return newData; // Completely replace if filtering/resetting
          }

          // Filter out any duplicates that might already exist in 'prev'
          const existingIds = new Set(prev.map((ex) => ex.id));
          const uniqueNewData = newData.filter(
            (ex) => !existingIds.has(ex.id)
          );

          return [...prev, ...uniqueNewData];
        });

        setCursor(res.nextCursor);
        setHasMore(res.hasMore);
      } catch (err) {
        console.error("Failed to load expiryDates:", err);
      } finally {
        setLoading(false);
      }
    },
    [cursor, hasMore, loading, filters]
  );

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
            <FilterForm
              filters={filters}
              setFilters={setFilters}
              default_filters={DEFAULT_EXPIRY_FILTERS}
              setExpiryDates={setExpiryDates}
              setCursor={setCursor}
              setHasMore={setHasMore}
              loadMore={loadMore}
              onDismissModal={onDismissModal}
            />
          </Animated.View>
        </Modal>
      </Portal>
      <View style={styles.container}>
        

        <View
          style={[
            styles.transactionCard,
            { backgroundColor: theme.colors.elevation.level2 },
          ]}
        >
          <View style={styles.onelinewrapperSpacedApart}>
            <Text style={styles.transactionHeader}>
              🔄 Daty ważności - wszytkie produkty.
            </Text>
       
          </View>

          
          <View style={{ flex: 1 }}>
            {expiryDates.length === 0 ? (
              <Text variant="bodyMedium">Brak danych o datach ważności.</Text>
            ) : (
              <ExpiryDatesList
                expiryDates={expiryDates}
                loadMore={loadMore}
                loading={loading}
                filters={filters}
                
              />
            )}
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({

  transactionHeader: {
    marginVertical: 10,
    
  },

  input: {
    flex: 1,
    marginHorizontal: 5,
    width: "70%",
  },

  onelinewrapper: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    flex: 1,
    justifyContent: "center",
  },
  onelinewrapperLeft: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "flex-start",
  },
  multilinewrapper: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    flex: 1,
    alignItems: "center",
  },
  onelinewrapperSpaced: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    flex: 1,
    justifyContent: "space-evenly",
    marginTop: 30,
  },
  onelinewrapperSpacedApart: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginTop: 5,
  },

  container: {
    flex: 1,
    padding: 5,
   
    gap: 5,
  },
 
  transactionCard: {
    flex: 1,
    borderRadius: 5,
    marginHorizontal: 0,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingBottom: 20,

  },
  cardContentFull: {
    flex: 1,
    paddingBottom: 10, 
  },

 
  modalContainer: {
    position: "absolute",
    //top: 50,
    bottom: 50,
    left: 0,
    right: 0,
    margin: 10,
  },
  modalStyle: {
    display: "flex",
    borderWidth: 2,
    borderStyle: "solid",
    borderRadius: 5,
    margin: 10,
    minHeight: 200,

    padding: 10,
    paddingBottom: 20,
  },
});
