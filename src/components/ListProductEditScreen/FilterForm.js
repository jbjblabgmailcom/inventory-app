import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import { Button, useTheme } from 'react-native-paper';

import { validateName } from '../../utils/ValidateFunctions';
import PaperAutocomplete from '../PaperAutocomplete';
import { fetchCategoriesFromDB } from '../../dbQuerys/newProductDB';




const FilterForm = ({ filters, setFilters, default_filters, setProductList, setHasMore, setCursor, loadMore }) => {

    const [category_value, setCategory_value] = useState("");
    const [categoriesList, setCategoriesList] = useState([]);

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
    alignItems: "flex-end",
    flexDirection: "column",
    paddingBottom: 10,
    paddingHorizontal: 2,
    marginHorizontal: 3,
    marginBottom: 5,
    borderWidth: 1,
    marginLeft: 50,
    borderBottomLeftRadius: 8,
    borderBottomEndRadius: 8,
   },

  input: {
    marginHorizontal: 1,
    width: "50%",
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
});
