export const v3_alterProductsTable = (tx) => {
  tx.executeSql(
    `ALTER TABLE products ADD COLUMN p_useexpiry INTEGER DEFAULT 0;`
  );

  tx.executeSql(`ALTER TABLE products ADD COLUMN p_units TEXT;`);

 
};
