import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import { Button, TextInput, useTheme, RadioButton, Text } from 'react-native-paper';

import { validateName } from '../../utils/ValidateFunctions';
import PaperAutocomplete from '../PaperAutocomplete';
import { fetchCategoriesFromDB } from '../../dbQuerys/newProductDB';




const FilterForm = ({ filters, setFilters, default_filters, setProductList, setHasMore, setCursor, loadMore }) => {

   const [category_value, setCategory_value] = useState("");
   const [categoriesList, setCategoriesList] = useState([]);

   const [qtyFrom, setQtyFrom] = useState('');
   const [qtyTo, setQtyTo] = useState('');






    const [draft, setDraft] = useState(filters);
    const [buttonLoading, setButtonLoading] = useState(false);
    const theme = useTheme();


      useEffect(() => {
          fetchCategoriesFromDB()
          .then(result => { setCategoriesList(result);
           console.log(result);
           console.log("Categories list", categoriesList);
          })
          .catch(err=> console.error("DB Error", err));
          
        },[]);

    const handleSelectionCategory = (option) => {
    setCategory_value(option.p_category);
    console.log('Selected:', option.label);
  };

    const handleTextChangeCategory = (text) => {
    setCategory_value(text);
   setDraft(prev => ({
    ...prev,
    category: text
  }));
    
    console.log('User entered:', text);
  };

const isPositiveInt = (v) => /^[1-9]\d*$/.test(v);
const hasValue = (v) => v !== "";

 const showRangeError =
  hasValue(qtyFrom) &&
  hasValue(qtyTo) &&
  (
    !isPositiveInt(qtyFrom) ||
    !isPositiveInt(qtyTo) ||
    Number(qtyFrom) > Number(qtyTo)
  );
        
 

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.elevation.level2}]}>
     
      <View style={styles.onelinewrapper}>
            <PaperAutocomplete
                            label="Kategoria"
                            options={categoriesList}
                            keyName="p_category"
                            mode="flat"
                            onSelect={handleSelectionCategory}
                            onChangeText={handleTextChangeCategory}
                            value={category_value}
                            error={!validateName(category_value) && category_value != ""}
                            
                          />
      </View>
      <View style={styles.onelinewrapper}>
        <TextInput
        keyboardType="number-pad"
        style={styles.input}
        label="Ilość OD" 
        value={qtyFrom}
        error={showRangeError}
        onChangeText={(text) => {

          setQtyFrom(text.replace(/\D/g, ""))
          setDraft(prev => ({
            ...prev,
            qtyFrom: text.replace(/\D/g, "")
        }));
        }} 
        
        />
        <TextInput
        error={showRangeError}
        keyboardType="number-pad"
        style={styles.input}
        label=" DO" 
        value={qtyTo}
        onChangeText={(text) => {

          setQtyTo(text.replace(/\D/g, ""));
          setDraft(prev => ({
            ...prev,
            qtyTo: text.replace(/\D/g, "")
        }));
        }} 
         />

      </View>
       <View style={[styles.onelinewrapperLeft, {height: 40}]}>
        <View style={[styles.column, {width: '45%', alignItems: 'center'}]}>
          <Text>Ma datę ważności: </Text>
        </View>
        <View style={[styles.column, {flex: 1}]}>
          <View style={styles.onelinewrapperSpaced2}>
            <View style={{width: '45%'}}>
                <Text>Wszystkie</Text>
            </View>
            <View style={{width: '30%'}}>
                <Text>Tak</Text>    
            </View>
            <View style={{width: '30%'}}>
                <Text>Nie</Text>    
            </View>
              
          
          
          </View>
          <View style={[styles.onelinewrapperSpaced2]}>
              
        <RadioButton 
        value="all"
        status={draft.useExpiry === 'all' ? 'checked' : 'unchecked'}
       onPress={()=> {
        setDraft(prev => ({
            ...prev,
            useExpiry: 'all', 
          }))}}
        />
        
        <RadioButton 
        value="yes"
        status={draft.useExpiry === 'yes' ? 'checked' : 'unchecked'}
        onPress={()=> {
        setDraft(prev => ({
            ...prev,
            useExpiry: 'yes', 
          }))}}
        />
        <RadioButton 
        value="no"
        status={draft.useExpiry === 'no' ? 'checked' : 'unchecked'}
        onPress={()=> {
        setDraft(prev => ({
            ...prev,
            useExpiry: 'no', 
          }))}}
        />
          </View>
          
        </View>
        </View>

    

      <View style={styles.onelinewrapperSpaced}>
        <Button
          mode="contained"
          loading={buttonLoading}
          onPress={() => {
            setButtonLoading(true);
            setFilters(draft);
            loadMore(draft, true);
            setTimeout(() => {
              setButtonLoading(false);
            }, 500);
          }}
       
        >
          Filtruj
        </Button>

        <Button
          mode="outlined"
          onPress={() => {
            // reset everything to defaults
            setDraft(default_filters);
            setFilters(default_filters);
            setProductList([]);
            setCursor(null);
            setHasMore(true);
            loadMore(default_filters);
            setCategory_value("");
            setQtyFrom('');
            setQtyTo('');

          }}
        >
          Reset
        </Button>
      </View>
       </View>
  );
};


export default FilterForm;

const styles = StyleSheet.create({
  container: {
    dislpay: "flex",
    justifyContent: "flex-start",
    flexDirection: "column",
    paddingBottom: 10,
    paddingHorizontal: 5,
    marginHorizontal: 3,
    marginBottom: 5,
    marginRight: 5,
    borderWidth: 1,
    marginLeft: 40,
    borderBottomLeftRadius: 8,
    borderBottomEndRadius: 8,
   },

  input: {
    flex: 1,
    marginHorizontal: 1,
    
  
  },

  onelinewrapper: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
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

    alignItems: "center",
  },
  onelinewrapperSpaced: {
    display: "flex",
    flexDirection: "row",
    width: "100%",

    justifyContent: "space-evenly",
    marginTop: 20,
  },
  dropmenu: {
    flex: 4,
    marginTop: 5,
  },
  radio: {
    margin: 0,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',

  },
  onelinewrapperSpaced2: {
    display: "flex",
    flexDirection: "row",
    justifyContent: 'space-around',
    
  }
});
