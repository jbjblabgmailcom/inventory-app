import React, { useCallback, memo } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, ActivityIndicator, Surface, useTheme } from "react-native-paper";




const TransactionItem = memo(({ t, units }) => {
  const theme = useTheme();
    
  
  return (
    <Surface
      style={[
        styles.surface,
        t.transaction_type === "CLEAR" && {
          backgroundColor: theme.colors.onPrimary,
        },
        t.transaction_type === "OUT" && {
          backgroundColor: theme.colors.onError,
        },
        t.transaction_type === "IN" && {
          backgroundColor: theme.colors.onTertiary,
        },
        
      ]}
    >
      <View style={styles.row}>
        <Text variant="labelLarge">{t.transaction_type}</Text>
        <Text variant="bodyMedium">
          {(t.transaction_type === "CLEAR" || t.transaction_type === "OUT"
            ? "-"
            : "+") + t.transaction_qty}{units}
        </Text>
      </View>
      
      <View style={styles.row} >
      <Text variant="bodySmall">
        {t.transaction_date && t.transaction_date}
      </Text>
      {t.transaction_notes && (
        <Text variant="bodySmall" style={styles.muted}>
          {t.transaction_notes}
        </Text>

      )}
      </View>
    </Surface>
  );
});

// 2. The Main List Component
const TransactionList = ({ transactions, loadMore, loading, filters, units }) => {
  const renderItem = useCallback(
    ({ item }) => <TransactionItem t={item} units={units} />,
    []
  );

  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      style={styles.list}
      data={transactions}
      keyExtractor={(item) => item.transaction_id.toString()}
      renderItem={renderItem}
      ListEmptyComponent={() => (
        <Text style={styles.emptyText}>Brak transakcji</Text>
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

const styles = StyleSheet.create({
  list: {
    //  height: screenHeight * 0.55,
    flex: 1,
    // minHeight: 300,
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
    paddingHorizontal: 15,
  },
});

export default memo(TransactionList);
