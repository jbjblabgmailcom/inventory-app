export const v2_indexes = (tx) => {
  tx.executeSql(
    `CREATE INDEX IF NOT EXISTS idx_products_p_code
     ON products (p_code);`
  );

  tx.executeSql(
    `CREATE INDEX IF NOT EXISTS idx_transactions_product
     ON transactions (product_id);`
  );

  tx.executeSql(
    `CREATE INDEX IF NOT EXISTS idx_transactions_product_location_date
     ON transactions (product_id, location_id, transaction_date DESC);`
  );
};
