import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';


export default function QtyWrapper({changeQty, alteredProperty, units}) {

return (
  <View style={styles.qtywrapper}>
    <IconButton
      mode="contained"
      size={40}
      icon="minus"
      onPress={() => changeQty("dec")}
      style={styles.plusminusicon}
    />
    <Text variant="displayLarge">{alteredProperty}</Text>
    <Text variant="displaySmall"> {units}</Text>

    <IconButton
      mode="contained"
      size={40}
      icon="plus"
      onPress={() => changeQty("inc")}
      style={styles.plusminusicon}
    />
  </View>
);
};

const styles = StyleSheet.create({
  qtywrapper: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "85%",
    marginVertical: 10,

    borderRadius: 10,
    height: 80,
    alignItems: "center",
  },

  plusminusicon: {
    borderWidth: 1,
  },
});

