import React from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Text, Button, IconButton, Surface } from "react-native-paper";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";

export const BottomSheetContent = ({
  locationsList,
  locationGlobal,
  setLocationGlobal,
  modalVisible,
  setModalVisible,
  setModalType,
  pickOtherLocation,
}) => {
  return (
    <>
      {!pickOtherLocation && (
        <View style={styles.onelinewrapperSpaced}>
          <Text style={styles.title}>Menu wyboru lokalizacji</Text>

          <Button
            style={styles.inlinebuttonstyle}
            icon="plus"
            onPress={() => {
              setModalVisible(!modalVisible);
              setModalType("addLocation");
            }}
            mode="contained"
          >
            Dodaj
          </Button>
        </View>
      )}
      {!pickOtherLocation && (
        <BottomSheetFlatList
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ padding: 25 }}
          style={{ flex: 1 }}
          data={locationsList}
          keyExtractor={(item) => item.location_name_id.toString()}
          renderItem={({ item: locationItem }) => (
            <TouchableOpacity onPress={() => setLocationGlobal(locationItem)}>
              <Surface
                elevation={3}
                mode="elevated"
                style={[
                  styles.surface,
                  locationGlobal?.location_name_id ===
                    locationItem.location_name_id && styles.withBorder,
                ]}
              >
                <IconButton
                  icon="cube-outline"
                  size={40}
                  mode="contained"
                  onPress={() => setLocationGlobal(locationItem)}
                  disabled={
                    locationGlobal?.location_name_id ===
                    locationItem.location_name_id
                  }
                />
                <Text>{locationItem.loc_name}</Text>
              </Surface>
            </TouchableOpacity>
          )}
        />
      )}

      {pickOtherLocation && (
        <View style={styles.flatListWrapperModal}>
          <FlatList
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={styles.list}
            data={locationsList}
            keyExtractor={(item) => item.location_name_id.toString()}
            renderItem={({ item: locationItem }) => {
              const isSelected =
                locationGlobal?.location_name_id ===
                locationItem.location_name_id;

              return (
                <TouchableOpacity
                  onPress={() => setLocationGlobal(locationItem)}
                >
                  <Surface
                    elevation={4}
                    mode="elevated"
                    style={[styles.surface, isSelected && styles.withBorder]}
                  >
                    <IconButton
                      icon="cube-outline"
                      size={20}
                      mode="contained"
                      disabled={isSelected}
                    />
                    <Text variant="bodyLarge">{locationItem.loc_name}</Text>
                  </Surface>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  onelinewrapperSpaced: {
    marginVertical: 10,
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  surface: {
    display: "flex",
    flexDirection: "row",
    borderRadius: 10,
    marginTop: 5,
    marginHorizontal: 5,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  withBorder: {
    borderColor: "rgba(49, 133, 0, 1)",
    borderWidth: 1,
  },
  list: {
    flex: 1,
  },

  flatListWrapperModal: {
    height: 250,
    width: '90%'
  },
});