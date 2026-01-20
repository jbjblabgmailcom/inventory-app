import React from 'react';
import {TextInput, ActivityIndicator, Text, Surface} from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { validateName } from '../utils/ValidateFunctions';


export default function SearchComponent({handleEndEditing, inputValue, setInputValue}) {

   

    return (
      <>
        
          <TextInput
            label="Wyszukaj nazwe produktu"
            value={inputValue}
            onChangeText={(text) => setInputValue(text)}
            style={styles.textinput}
            error={!validateName(inputValue) && inputValue != ""}
            onEndEditing={handleEndEditing}
            right={
              inputValue ? (
                <TextInput.Icon
                  icon="close"
                  onPress={() => {
                    setInputValue("");
                    handleEndEditing();
                    }}
                />
              ) : null
            }
            left={<TextInput.Icon icon="magnify" />}
          />
         
      </>
    );


};


const styles = StyleSheet.create({
  loading: {
      borderRadius: 10,
      padding: 10,
      marginTop: 20,
      marginBottom: 10,
  },

    textinput: {
      marginHorizontal: 5,
      marginVertical: 5,
      width: '100%',      
    },
});