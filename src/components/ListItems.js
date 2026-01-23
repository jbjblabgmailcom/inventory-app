import React, {useEffect, useState, useCallback} from 'react';
import {Text, Surface, IconButton, Portal, Modal, Menu, useTheme} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FlatList, TouchableOpacity, View, StyleSheet, Image } from 'react-native';
import { deleteProductById } from '../dbQuerys/newProductDB';
import InfiniteScrollFlatList from './InfiniteScrollFlatList';




export default function ListItems(props) {
  const {
    dbData = [],
    handleEndEditing,
    loadingProducts,
    loadMore,
    filters,
  } = props;

  const theme = useTheme();
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [productForRemoval, setProductForRemoval] = useState({});
  const [menuVisibleFor, setMenuVisibleFor] = useState(null);

  const dismissMenu = () => setMenuVisibleFor(null);

  useEffect(() => {
    setMenuVisibleFor(null);
  }, [dbData]);

  const deleteProduct = (id, name) => {
    setProductForRemoval({ removeId: id, removeName: name });
    setModalVisible(true);
  };

  const deleteProductConfirm = (removeId) => {
    deleteProductById(removeId)
      .then(() => {
        handleEndEditing();
        onDismissModal();
      })
      .catch(err => console.log('DELETING ERROR', err));
  };

  const onDismissModal = () => {
    setProductForRemoval({});
    setModalVisible(false);
  };

  const ProductItem = React.memo(({ item }) => (
    <View>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('Definiuj nowy produkt', { itemId: item.id })
        }
      >
        <Surface elevation={2} style={styles.row}>
          <View style={styles.left}>
            {item.p_photo ? (
              <Image
                source={{ uri: item.p_photo }}
                style={{ width: 70, height: 70, borderRadius: 5 }}
              />
            ) : (
              <Image
                source={require('../assets/imgplaceholder.png')}
                style={{ width: 70, height: 70, borderRadius: 5 }}
              />
            )}
          </View>

          <View style={styles.middle}>
            <Text style={{ fontSize: 14 }}>{item.p_name}</Text>
            <Text style={{ fontSize: 12 }}>
              Kategoria: {item.p_category}
            </Text>
            <Text style={{ fontSize: 14 }}>Kod: {item.p_code}</Text>
          </View>

          <Menu
            mode="elevated"
            visible={menuVisibleFor === item.id}
            onDismiss={dismissMenu}
            anchor={
              <IconButton
                mode="contained"
                size={30}
                icon="menu"
                onPress={() => setMenuVisibleFor(item.id)}
                loading={productForRemoval.removeId === item.id}
              />
            }
          >
            <Menu.Item
              leadingIcon="invoice-text-edit-outline"
              title={`Edytuj ${item.p_name}`}
              onPress={() => {
                dismissMenu();
                navigation.navigate('Definiuj nowy produkt', {
                  itemId: item.id,
                });
              }}
            />

            <Menu.Item
              leadingIcon="trash-can-outline"
              title="Usuń ten produkt"
              onPress={() => {
                dismissMenu();
                deleteProduct(item.id, item.p_name);
              }}
            />
          </Menu>
        </Surface>
      </TouchableOpacity>
    </View>
  ));

  const renderItem = useCallback(
  ({ item }) => <ProductItem item={item} />,
  [menuVisibleFor, productForRemoval]
);

  return (
    <>
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={onDismissModal}
          contentContainerStyle={[
            styles.modalStyle,
            { backgroundColor: theme.colors.background2 },
          ]}
        >
          <View style={styles.viewcolumnmodal}>
            <Text style={styles.modaltext}>
              Usuwasz: {productForRemoval.removeName}
            </Text>
            <Text>
              Uwaga! Permanentnie usuwasz ten produkt oraz wszystkie dane.
            </Text>
            <Text style={styles.modaltext}>
              Czy na pewno chcesz usunąć?
            </Text>
          </View>

          <View style={styles.viewrow}>
            <IconButton
              size={60}
              icon="checkbox-marked-circle"
              iconColor="rgba(255,0,0,0.84)"
              onPress={() =>
                deleteProductConfirm(productForRemoval.removeId)
              }
            />
            <IconButton
              size={60}
              icon="file-excel-box"
              iconColor="rgba(81,255,0,0.73)"
              onPress={onDismissModal}
            />
          </View>
        </Modal>
      </Portal>

      {!loadingProducts && dbData.length === 0 && (
        <View style={{ alignSelf: 'center' }}>
          <View style={styles.modalStyle}>
            <Text variant="titleLarge">
              Nie znaleziono produktów.
            </Text>
          </View>
        </View>
      )}

      <InfiniteScrollFlatList 
      renderItem={renderItem}
      loadMore={loadMore}
      filters={filters}
      data={dbData}
      loading={loadingProducts}
      
      />
    
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
  list: {
    flex: 1,
   
  },
  loader: {
    marginVertical: 10,
  },
})