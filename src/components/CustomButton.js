import React from 'react';
import {Text, StyleSheet, TouchableOpacity } from 'react-native';


export default function CustomButton({text, redirectTo}) {

 



  return (
    <TouchableOpacity style={styles.button}
        onPress={redirectTo}
        >
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { 
    display: 'flex',
    flex: 1,                        
  marginHorizontal: 3,            
  height: '100%',                 
  justifyContent: 'center',
  
  alignItems: 'center',
  backgroundColor: '#8b79bb9c',       
  borderRadius: 10,
  padding: 3,
  paddingStart:5,
  
  
  

},
  text: { 
    color: 'rgba(211, 209, 192, 1)',
  fontSize: 16,
  fontWeight: 'bold',
  textAlign:'justify',
  
  
   },
});
