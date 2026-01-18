import SQLite from 'react-native-sqlite-2';

export const db = SQLite.openDatabase(
  'scanner.db',    // database name
  '1.0',           // version
  'InventoryDB',              // display name
  1                // size (ignored)
);