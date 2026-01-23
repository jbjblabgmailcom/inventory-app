import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button, Portal, Modal, useTheme } from 'react-native-paper';
import { fetchTransactionsFromDB } from '../dbQuerys/newProductDB';
import { useRoute } from '@react-navigation/native';
import FilterForm from '../components/FilterForm';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import TransactionList from '../components/TransactionScreen/TransactionsFlatList';
import { dateFromSQLiteDateOnly } from '../utils/ValidateFunctions';



export default function TransactionsInfoScreen() {


  const route = useRoute();


const {itemId, locId, pName, pCode, pQty, dateCreated, locName, useExpiry, units} = route.params;

    const DEFAULT_FILTERS = {
      type: ["IN", "OUT", "CLEAR"],
      fromDate: null,
      toDate: null,
      limit: 10,
      cursor: null, // ← last transaction_date
    };




const [filters, setFilters] = useState(DEFAULT_FILTERS);


useEffect(() => {
  setTransactions([]); // Clear immediately on filter change
  setCursor(null);
  setHasMore(true);
  loadMore(filters, true);
}, [filters]);

  const [transactions, setTransactions] = useState([]);
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


  const loadMore = useCallback(
    async (customFilters = filters, reset = false) => {
      if (loading) return;
      if (!hasMore && !reset) return;

      setLoading(true);

      try {
        const res = await fetchTransactionsFromDB(itemId, locId, {
          ...customFilters,
          cursor: reset ? null : cursor,
        });

        setTransactions((prev) => {
          const newData = res.transactions;
          if (reset) {
            return newData;
          }

          
          const existingIds = new Set(prev.map((t) => t.transaction_id));
          const uniqueNewData = newData.filter(
            (t) => !existingIds.has(t.transaction_id)
          );

          return [...prev, ...uniqueNewData];
        });

        setCursor(res.nextCursor);
        setHasMore(res.hasMore);
      } catch (err) {
        console.log("Failed to load transactions:", err);
      } finally {
        setLoading(false);
      }
    },
    [cursor, hasMore, loading, filters, itemId, locId]
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
              default_filters={DEFAULT_FILTERS}
              setTransactions={setTransactions}
              setCursor={setCursor}
              setHasMore={setHasMore}
              loadMore={loadMore}
              onDismissModal={onDismissModal}
            />
          </Animated.View>
        </Modal>
      </Portal>
      <View style={styles.container}>
        <Card mode="outlined" style={[styles.card, {backgroundColor: theme.colors.background2}]}>
          <Card.Content>
            <Text variant="titleLarge">Kod: {pCode}</Text>
            <Text variant="titleMedium">Produkt: {pName}</Text>
            <Text variant="bodyMedium">
              Stan w lokalizacji {locName}: {pQty} {units}
            </Text>
            <Text>
              Data utworzenia: {dateCreated && dateFromSQLiteDateOnly(dateCreated)}
            </Text>
          </Card.Content>
        </Card>

        <View
          style={[
            styles.transactionCard,
             {backgroundColor: theme.colors.background2,
              borderColor: theme.colors.elevation.level4
            },
          ]}
        >
          <View style={styles.onelinewrapperSpacedApart}>
            <Text style={styles.transactionHeader}>
              🔄 Wszystkie transakcje
            </Text>
            <Button mode="text" onPress={() => setModalVisible(true)}>
              Filtruj
            </Button>
          </View>

          <View style={styles.row}>
            <Text variant="bodyMedium">Typ/Data</Text>
            <Text variant="labelLarge">Ilość {units}</Text>
          </View>
          <View style={{ flex: 1 }}>
            {transactions.length === 0 ? (
              <Text variant="bodyMedium">Brak danych o transakcjach.</Text>
            ) : (
              <TransactionList
                transactions={transactions}
                loadMore={loadMore}
                loading={loading}
                filters={filters}
                units={units}
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
    marginTop: 10,
    marginLeft: 10,
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
  card: {
    borderRadius: 12,
 
    
  },
  transactionCard: {
    flex: 1,
    borderRadius: 12,
 
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingBottom: 20,
    borderWidth: 1,
  },
  cardContentFull: {
    flex: 1,
    paddingBottom: 10, 
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  block: {
    paddingVertical: 6,
  },
  divider: {
    marginTop: 8,
  },
  muted: {
    opacity: 0.7,
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
