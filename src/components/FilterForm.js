import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import { TextInput, Button, Text, Switch } from 'react-native-paper';
import ModalCloseButton from './ModalCloseButton';
import { DatePickerComponent } from './DatePickerComponent';
import { useDatePicker } from '../hooks/useDatePicker';
import { dateToSQLite, dateToSQLiteEndOfDay, dateToSQLiteDateOnly } from '../utils/ValidateFunctions';




const FilterForm = ({ filters, setFilters, default_filters, setTransactions, setHasMore, setCursor, loadMore, onDismissModal }) => {



  
    
    const [invalidDateSet, setInvalidDateSet] = useState(false);
    const [draft, setDraft] = useState(filters);
    const [buttonLoading, setButtonLoading] = useState(false);
    const {
      modalOpen: fromModalOpen,
      setModalOpen: fromSetModalOpen,
      expiryDate: fromDate,
      onConfirm: fromOnConfirm,
      setExpiryDate: fromSetDate,
    } = useDatePicker();

    const {
      modalOpen: toModalOpen,
      setModalOpen: toSetModalOpen,
      expiryDate: toDate,
      onConfirm: toOnConfirm,
      setExpiryDate: toSetDate,
    } = useDatePicker();

       useEffect(() => {
        if (fromDate instanceof Date) {
          setDraft((prev) => ({
          ...prev,
          fromDate: dateToSQLite(fromDate),
        }));
      }
      }, [fromDate]);
        
         
  
     
      useEffect(() => {
        if(toDate instanceof Date) {
                 setDraft((prev) => ({ ...prev, toDate: dateToSQLiteEndOfDay(toDate), }));
        }
            }, [toDate]); 


          
     useEffect(()=> {
      if(draft.fromDate > draft.toDate) {
        setInvalidDateSet(true);
        Alert.alert("Data OD musi być wcześniej niż DO");
      } else {
        setInvalidDateSet(false);
      }
     },[draft]);  


  return (
    <View style={styles.container}>
      <DatePickerComponent
        locale="pl"
        mode="single"
        visible={fromModalOpen}
        onDismiss={() => fromSetModalOpen(false)}
        date={fromDate}
        onConfirm={fromOnConfirm}
      />
      <DatePickerComponent
        locale="pl"
        mode="single"
        visible={toModalOpen}
        onDismiss={() => toSetModalOpen(false)}
        date={toDate}
        onConfirm={toOnConfirm}
      />
      <View style={styles.onelinewrapperLeft}>
        <Text>Typy transakcji:</Text>
      </View>
      <View style={styles.onelinewrapper}>
        {["IN", "OUT", "CLEAR"].map((type) => (
          <View key={type}>
          
              <Text>{"  "}{type}</Text>
              <Switch
                label={type}
                value={draft.type.includes(type) ? true : false}
                onValueChange={() =>
                  setDraft((prev) => ({
                    ...prev,
                    type: prev.type.includes(type)
                      ? prev.type.filter((t) => t !== type)
                      : [...prev.type, type],
                  }))
                }
              />
              <Text>{'  '}</Text>
            
          </View>
        ))}
      </View>
      <View style={styles.onelinewrapperLeft}>
        <Text>Daty:</Text>
      </View>
      <View style={styles.multilinewrapper}>
        <TextInput
          label="Data OD"
          showSoftInputOnFocus={false}
          value={
            (fromDate && dateToSQLiteDateOnly(fromDate)) || draft.fromDate || ""
          }
          onPressIn={() => fromSetModalOpen(true)}
          style={styles.input}
          error={invalidDateSet}
        />
        <TextInput
          label="Data do"
          showSoftInputOnFocus={false}
          value={(toDate && dateToSQLiteDateOnly(toDate)) || draft.toDate || ""}
          onPressIn={() => toSetModalOpen(true)}
          style={styles.input}
          error={invalidDateSet}
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
          disabled={invalidDateSet}
        >
          Filtruj
        </Button>

        <Button
          mode="outlined"
          onPress={() => {
            // reset everything to defaults
            setDraft(default_filters);
            setFilters(default_filters);
            setTransactions([]);
            setCursor(null);
            setHasMore(true);
            loadMore(default_filters);
            fromSetDate(null);
            toSetDate(null);
          }}
        >
          Reset
        </Button>
      </View>
      <View style={styles.onelinewrapperSpaced}>
        <ModalCloseButton onPress={onDismissModal} />
      </View>
    </View>
  );
};


export default FilterForm;

const styles = StyleSheet.create({
  container: {
    dislpay: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexDirection: "column",
    paddingHorizontal: 10,
  },

  input: {
    marginHorizontal: 5,
    width: "70%",
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
});
