import React, { useState, useEffect} from 'react';
import { View, StyleSheet, ScrollView} from 'react-native';
import { Text, Card, Button, Divider, Surface, useTheme} from 'react-native-paper';

import { fetchSingleProductFromDB } from '../dbQuerys/newProductDB';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import {
  dateFromSQLiteDateOnly,
  numberOfDaysToDate,
} from "../utils/ValidateFunctions";


export default function ProductInfoScreen() {

  const navigation = useNavigation();
  const route = useRoute();
   let itemId = '';
  let location_id = '';
   if(route.params && route.params.itemId) {
    itemId = route.params.itemId;
    location_id = route.params.location_id;

  } 


  //dane w formularzu



  const [product, setProduct] = useState({});
  const [expiry, setExpiry] = useState([]);
  const [LocationsSummary, setLocationsSummary] = useState([]);
  const [trans, setTrans] = useState([]);

  const theme = useTheme();

  useEffect(()=> {
      if(itemId === '' || itemId === null) {
        return;
      }
    
      fetchSingleProductFromDB(itemId, location_id)
     .then(result => {
   
      setProduct(result.productData);
      setExpiry(result.expiryDates);
      setLocationsSummary(result.otherLocationsSummary);
      setTrans(result.transactions);

      
      })
     .catch(err=> console.error("DB Error", err))
      

  },[itemId]);





  return (
    <ScrollView
      style={styles.scrollview}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      <Card mode="contained" style={styles.card}>
        {product.p_photo && <Card.Cover source={{ uri: product.p_photo }} />}
        {!product.p_photo && (
          <Card.Cover source={require("../assets/imgplaceholder.png")} />
        )}
        <Card.Title
          title={`Produkt: ${product.p_name}`}
          subtitle={`Kategoria: ${product.p_category}`}
        />

        <Card.Content>
          <Text variant="titleLarge">Kod: {product.p_code}</Text>
          <Text variant="bodyMedium">Opis: {product.p_desc}</Text>

          <Text variant="bodyMedium">
            Stan w lokalizacji {product.location_name}: {product.location_qty}{" "}
            {product.p_units}
          </Text>
          <Text>
            Data utworzenia:{" "}
            {(product.p_date_created &&
              dateFromSQLiteDateOnly(product.p_date_created)) ||
              ""}
          </Text>
          <Text>
            Posiada datę ważności: {product.p_useexpiry === 1 ? "TAK" : "NIE"}
          </Text>
        </Card.Content>
      </Card>
      {product.p_useexpiry === 1 && (
        <Card mode="contained" style={styles.card}>
          <Card.Title title="📅 Ilosc produktu wg daty ważności." />
          <Card.Content>
            <View style={styles.row}>
              <Text variant="bodyMedium">Data ważności</Text>
              <Text variant="bodyMedium">Dni ważności</Text>
              <Text variant="bodyMedium">
                Ilość {"("}
                {product.p_units}
                {")"}
              </Text>
            </View>
            {expiry.length === 0 ? (
              <Text variant="bodyMedium">Brak danych</Text>
            ) : (
              expiry.map((e, i) => {
                const days = numberOfDaysToDate(
                  dateFromSQLiteDateOnly(e.expiry_date)
                );

                return (
                  <View key={i} style={styles.row}>
                    <Text variant="bodyMedium">
                      {(e.expiry_date &&
                        dateFromSQLiteDateOnly(e.expiry_date)) ||
                        ""}
                    </Text>
                    <Surface
                      elevation={0}
                      style={[
                        styles.surface,
                        days < 0 && { backgroundColor: theme.colors.onError },
                        days === 0 && { backgroundColor: theme.colors.error },
                        days > 0 &&
                          days <= 30 && {
                            backgroundColor: theme.colors.onSecondary,
                          },
                        days > 30 && {
                          backgroundColor: theme.colors.onTertiary,
                        },
                      ]}
                    >
                      <Text>{days}</Text>
                    </Surface>
                    <Text variant="labelLarge">{e.expiry_qty}</Text>
                  </View>
                );
              })
            )}
            <Button
              mode="outlined"
              onPress={() =>
                navigation.navigate("Terminy przydatności", {
                  itemId,
                  locId: product.location_id,
                  pName: product.p_name,
                  pCode: product.p_code,
                  pQty: product.location_qty,
                  dateCreated: product.p_date_created,
                  locName: product.location_name,
                  useExpiry: product.p_useexpiry,
                  units: product.p_units,
                })
              }
            >
              Pełny raport dat przydatności
            </Button>
          </Card.Content>
        </Card>
      )}

      <Card mode="contained" style={styles.card}>
        <Card.Title title="📦 Stan w lokalizacjach." />
        <Card.Content>
          <View style={styles.row}>
            <Text variant="bodyMedium">Nazwa</Text>
            <Text variant="labelLarge">
              Ilość {"("}
              {product.p_units}
              {")"}
            </Text>
          </View>

          {LocationsSummary.length === 0 ? (
            <Text variant="bodyMedium">
              Brak produktu w innych lokalizacjach
            </Text>
          ) : (
            LocationsSummary.map((l, i) => (
              <View key={i} style={styles.row}>
                <Text variant="bodyMedium">{l.location_name}</Text>
                <Text variant="labelLarge">{l.total_qty}</Text>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      <Card mode="contained" style={styles.card}>
        <Card.Title title="🔄 Ostatnie transakcje" />
        <Card.Content>
          <View style={styles.row}>
            <Text variant="bodyMedium">Typ/Data</Text>
            <Text variant="labelLarge">
              Ilość {"("}
              {product.p_units}
              {")"}
            </Text>
          </View>
          {trans.length === 0 ? (
            <Text variant="bodyMedium">Brak danych o transakcjach.</Text>
          ) : (
            trans.map((t) => (
              <View key={t.transaction_id} style={styles.block}>
                <View style={styles.row}>
                  <Text variant="labelLarge">{t.transaction_type}</Text>
                  <Text variant="bodyMedium">
                    {t.transaction_type === "CLEAR" ||
                    t.transaction_type === "OUT"
                      ? "-"
                      : "+"}
                    {t.transaction_qty}
                  </Text>
                </View>
                <Text variant="bodySmall">
                  {(t.transaction_date &&
                    t.transaction_date) ||
                    ""}
                </Text>
                {t.transaction_notes ? (
                  <Text variant="bodySmall" style={styles.muted}>
                    {t.transaction_notes}
                  </Text>
                ) : null}
                <Divider style={styles.divider} />
              </View>
            ))
          )}
          <Button
            mode="outlined"
            onPress={() =>
              navigation.navigate("Transakcje", {
                itemId,
                locId: product.location_id,
                pName: product.p_name,
                pCode: product.p_code,
                pQty: product.location_qty,
                dateCreated: product.p_date_created,
                locName: product.location_name,
                useExpiry: product.p_useexpiry,
                units: product.p_units,
              })
            }
          >
            Więcej transakcji
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollview: {},

  container: {
    dispay: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexDirection: "column",
    paddingHorizontal: 10,
  },
  surface: {
    padding: 3,
    marginVertical: 2,
    borderRadius: 8,
  },

  onelinewrapper: {
    display: "flex",
    flexDirection: "row",
  },

  pictureView: {
    display: "flex",
    alignSelf: "center",
    minWidth: "80%",
    maxWidth: "90%",
    marginTop: 10,
    marginBottom: 10,
  },
  container: {
    padding: 12,
    gap: 12,
  },
  card: {
    borderRadius: 12,
    marginTop: 10,
    marginHorizontal: 5,
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
});
