import { FlatList, StyleSheet } from 'react-native';
import {Text} from 'react-native-paper';


export default function InfiniteScrollFlatList({renderItem, loadMore, filters, data, loading, style}) {
    return (
        <FlatList
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100}}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
     
          style={style ? style : styles.list}
          data={data}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          onEndReached={() => {
            if (!loading) {
              loadMore(filters, false);
            }
          }}
          ListEmptyComponent={() => ( <Text style={styles.emptyText}>Brak danych, nie znaleziono.</Text> )}
          onEndReachedThreshold={0.5}
          removeClippedSubviews
        />
    );
}

const styles = StyleSheet.create({
    list: {
    flex: 1,
    
   
  },

});