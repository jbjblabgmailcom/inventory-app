import React, {useEffect, useState} from 'react';
import {Text, Surface, IconButton, Portal, Modal, Menu} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FlatList, TouchableOpacity, View, StyleSheet, Image } from 'react-native';
import { deleteProductById } from '../dbQuerys/newProductDB';




export default function ListItems(props){

    const [modalVisible, setModalVisible] = useState(false);
   
    const [productForRemoval, setProductForRemoval] = useState({});
    
     const [menuVisibleFor, setMenuVisibleFor] = useState(null);
     const dismissMenu = () => {
    setMenuVisibleFor(null);
  }


   const productList = props.dbData?._array || [];
   const onRemove = props.onRemove;
   const setOnRemove = props.setOnRemove;

    const deleteProduct = (id, name) => {
            setProductForRemoval({
                removeId: id,
                removeName: name,
            });
           setModalVisible(true);
    }; 

    const deleteProductConfirm = (removeId) => {
       deleteProductById(removeId)
       .then(result => {
            setOnRemove(!onRemove);
            onDismissModal();
       })
       .catch(err => console.log("DELETING ERROR", err));

    };

    const onDismissModal = () => {
        setProductForRemoval({});
        setModalVisible(false);
    };


    
        const navigation = useNavigation();


        const ProductItem = ({ item }) => (
            <Menu
            mode="elevated"
            elevation={3}
           visible={menuVisibleFor === item.id}
           onDismiss={() => dismissMenu()}
           anchor={
           <TouchableOpacity onPress={() => navigation.navigate('Definiuj nowy produkt', {itemId: item.id})}>
                <Surface elevation={2}  style={styles.row}>
                     
                    <View style={styles.left}>
                                    {item.p_photo != "" && (
                                      <Image
                                        source={{ uri: item.p_photo }}
                                        style={{ width: 70, height: 70, borderRadius: 5 }}
                                      />
                                    )}
                                    {item.p_photo === "" && (
                                      <Image
                                        style={{ width: 70, height: 70, borderRadius: 5 }}
                                        source={require("../assets/imgplaceholder.png")}
                                      />
                                    )}
                                  </View>
                    
                    
                    <View style={styles.middle}>
                        <Text style={{fontSize: 14}}>{item.p_name} </Text>
                        
                        <Text style={{fontSize: 12}}>Kategoria: {item.p_category} </Text>
                        <Text style={{fontSize: 14}}>Kod: {item.p_code} </Text>
                    </View>
                    <View style={styles.right}>
                        <IconButton 
                        mode="contained"
                        size={30}
                        icon="menu"
                        onPress={() => setMenuVisibleFor(item.id)}
                        loading={productForRemoval.removeId === item.id}
                        />
                    </View>
                    
                </Surface>
                </TouchableOpacity>
           }
           >
            <Menu.Item
            leadingIcon="invoice-text-edit-outline"
             onPress={() => {
               navigation.navigate("Definiuj nowy produkt", {
                 itemId: item.id,
               });
               dismissMenu();
             }}
             title={`Edytuj ${item.p_name}`}
           />
{/*            <Menu.Item
           leadingIcon="page-next-outline"
             onPress={() => {
               props.addProductToLocation(
                 item.id,
                 item.p_name,
                 true,
                 true,
                 item.p_useexpiry,
                 item.p_units
               );
               dismissMenu();
             }}
             title="Dodaj do lokalizacji"
           /> */}
           <Menu.Item
            leadingIcon="trash-can-outline"
             onPress={() => {
                deleteProduct(item.id, item.p_name);
                dismissMenu();
             }
            }
            title="Usuń ten produkt"
           />
         </Menu>
          
            
        );



    return (
        <>
        
        <Portal>
        <Modal visible={modalVisible} onDismiss={onDismissModal} contentContainerStyle={styles.modalStyle}>
        <View style={styles.viewcolumnmodal}>
        <Text style={styles.modaltext}>Usuwasz: {productForRemoval.removeName}</Text>
          <Text>Uwaga! Permanentnie usuwasz ten produkt oraz wszystkie dane na jego temat łącznie z historią.</Text>
          <Text style={styles.modaltext}>Czy na pewno chcesz usunąć?.</Text>
          </View>
        <View style={styles.viewrow}>
         <IconButton 
                        mode="contained"
                        size={60}
                        style={styles.deleteicon}
                        icon="checkbox-marked-circle"
                        onPress={() => deleteProductConfirm(productForRemoval.removeId)}
                        iconColor={'rgba(255, 0, 0, 0.84)'}
                        />
                        <IconButton 
                        mode="contained"
                        size={60}
                        style={styles.deleteicon}
                        icon="file-excel-box"
                        onPress={() => onDismissModal()}
                        iconColor={'rgba(81, 255, 0, 0.73)'}

                        />

        </View>         
        </Modal>
      </Portal>
      
        {productList.length === 0 && 
            <View style={{display: 'flex', justifyContent: 'space-around', alignSelf: 'center'}}>
                <View style={styles.modalStyle}>
                <Text variant="titleLarge">Brak produków zgodnych z wyszukiwaną frazą. Zdefiniuj nowy produkt.</Text>
               </View>
            </View>
        }
      
        {productList.length > 0 && 
        <FlatList
        horizontal={false}
        data={productList}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProductItem item={item} /> } 
        contentContainerStyle={{paddingBottom: 200}}   
        
        />
        }
        
        </>
    );

}


const styles = StyleSheet.create({
    viewrow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',


    },
    viewcolumnmodal: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: "center",


    },
    modaltext: {
        alignSelf: 'center',
        fontSize: 20,
        marginTop: 10,
        marginBottom: 15,
    },

    viewcolumn:{
        display: 'flex',
        marginRight:5,
        flexWrap:'wrap',
    },


    modalStyle: {
        borderColor: 'rgba(255, 0, 0, 0.84)',
        borderWidth: 2,
        borderStyle:'solid', 
        borderRadius: 10,
        padding: 20,
        margin: 10,
        backgroundColor: 'rgba(78, 78, 78, 1)',
        

    },
    deleteicon: {
       
    },

    row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
        marginHorizontal: 5,
   
        padding: 5,
        borderRadius: 5,
        alignItems:'flex-start',
        flexDirection: 'row',
        maxWidth: '100%',
        justifyContent: 'space-evenly',
    
        marginBottom: 3,
  },

  left: {
  
  },

  middle: { 
     flex: 1,
     marginHorizontal: 10,
  },

  right: {

  },
})