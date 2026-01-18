import React, { useCallback, memo } from "react";
import {View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Text, ActivityIndicator, Surface, useTheme} from "react-native-paper";
import {
  dateFromSQLiteDateOnly,
  numberOfDaysToDate,
} from "../../utils/ValidateFunctions";
import { useNavigation } from "@react-navigation/native";



const ExpiryDatesList = ({ expiryDates, loadMore, loading, filters, units}) => {


 
  const renderItem = useCallback(
    ({ item }) => <ExpiryDatesItem t={item} units={units} />,
    []
  );

  return (
    
    <FlatList
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      style={styles.list}
      data={expiryDates}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      ListEmptyComponent={() => (
        <Text style={styles.emptyText}>Brak danych</Text>
      )}
      onEndReached={() => {
        loadMore(filters, false);
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loading ? <ActivityIndicator style={styles.loader} /> : null
      }
      removeClippedSubviews={true}
    />
  );
};

const ExpiryDatesItem = memo(({ t, units }) => {
  const navigation = useNavigation();
  const theme = useTheme();
  const days = numberOfDaysToDate(dateFromSQLiteDateOnly(t.expiry_date));
  return (

    <TouchableOpacity 
   
    onPress={() => navigation.navigate("Moj magazyn", {location_name: t.location_name})}
    >
    <Surface
      elevation={0}
      style={[
        styles.surface,
        days < 0 && { backgroundColor: theme.colors.onError },
        days === 0 && { backgroundColor: theme.colors.error },
        days > 0 && days <= 30 && { backgroundColor: theme.colors.onSecondary },
        days > 30 && { backgroundColor: theme.colors.onTertiary },
      ]}
    >
      {t.p_name && 
      <View style={styles.row}>
        <Text variant="labelLarge">
          Produkt: {t.p_name}
        </Text>

        <Text variant="bodyLarge">Kod:{t.p_code}</Text>
      </View>
      }
      <View style={styles.row}>
        <Text variant="labelLarge">
          Data: {t.expiry_date && dateFromSQLiteDateOnly(t.expiry_date)}
        </Text>
        <Text variant="labelLarge">
          {days > 0 ? "Dni do końca: " : "Dni po terminie: "}

          {days}
        </Text>

       
      </View>

      <View style={styles.row}>
        <Text variant="labelMedium">Lok.: {t.location_name}</Text>
        <Text variant="bodyLarge">Ilość: {t.expiry_qty} {units && units}{t.p_units && t.p_units}</Text> 
      </View>
    </Surface>
    </TouchableOpacity>
  );
});
  

 
 


const styles = StyleSheet.create({
  list: {

  flex: 1,

  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  block: {
    paddingVertical: 3,
   
  },
  divider: {
    marginTop: 8,
  },
  muted: {
    opacity: 0.7,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
  },
  loader: {
    marginVertical: 10,
  },
  surface: {
    minHeight: 60,
    padding: 5,
    marginVertical: 2,
    borderRadius: 10,
    
  },
});

export default memo(ExpiryDatesList);
