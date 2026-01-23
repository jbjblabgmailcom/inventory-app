import SQLite from 'react-native-sqlite-2';

export const db = SQLite.openDatabase(
  'scanner.db',   
  '1.0',           
  'InventoryDB',             
  1               
);