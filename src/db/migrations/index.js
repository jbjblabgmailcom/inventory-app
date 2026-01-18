import { v1_init } from "./v1_init";
import { v2_indexes } from "./v2_indexes";
import { v3_alterProductsTable } from './v3_alterProductsTable';

const migrations = [
  v1_init,
  v2_indexes,
  v3_alterProductsTable,

];

export const runMigrations = (db) => {
  db.transaction((tx) => {
    tx.executeSql(`PRAGMA user_version;`, [], (_, { rows }) => {
      let currentVersion = rows.item(0).user_version;

      migrations.forEach((migration, index) => {
        const targetVersion = index + 1;

        if (currentVersion < targetVersion) {
          console.log(`⬆ Migrating DB to v${targetVersion}`);
          migration(tx);
          tx.executeSql(`PRAGMA user_version = ${targetVersion};`);
        }
      });
    });
  });
};
