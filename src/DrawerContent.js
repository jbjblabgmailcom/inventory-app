import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Drawer, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";




export function CustomDrawer(props) {
  const navigation = useNavigation();



  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.container}
    >
      <View style={styles.logo}>
        <Text variant="headlineLarge">MagSmartApp</Text>
      </View>
    
      <Drawer.Item
        label="Mój magazyn"
        icon="warehouse"
        onPress={() => navigation.navigate("Moj magazyn")}
      />
      <Drawer.Item
        label="Definiuj nowy produkt"
        icon="new-box"
        onPress={() => navigation.navigate("Definiuj nowy produkt")}
      />
      <Drawer.Item
        label="Produkty, edycja."
      icon="playlist-edit"
        onPress={() => navigation.navigate("Produkty, edycja.")}
      />
      <Drawer.Item
        label="Terminy przydatności"
      icon="calendar-alert-outline"
         onPress={() =>
                navigation.navigate("Terminy przydatności - raport")
              }
      />

     
 
      <Drawer.Item
        label="DB View"
        onPress={() => navigation.navigate("Debugging")}
      />
      <Drawer.Item
        label="Debug2"
        onPress={() => navigation.navigate("Debuging2")}
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logo: { paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  image: {
    borderRadius: 5,
  },
});
