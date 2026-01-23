export const v1_init = (tx) => {
  
  tx.executeSql(`PRAGMA foreign_keys = ON;`);

  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      p_name TEXT,
      p_category TEXT,
      p_code TEXT UNIQUE,
      p_desc TEXT,
      p_date_created TEXT,
      p_photo TEXT
    );
  `);

  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS locations (
      location_id INTEGER PRIMARY KEY,
      product_id INTEGER NOT NULL,
      location_name TEXT NOT NULL,
      location_qty INTEGER NOT NULL DEFAULT 0,
      location_last_updated TEXT NOT NULL,
      UNIQUE (product_id, location_name),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);
 
  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS expiry_dates (
      id INTEGER PRIMARY KEY,
      product_id INTEGER NOT NULL,
      location_id INTEGER NOT NULL,
      expiry_date TEXT NOT NULL,
      expiry_qty INTEGER NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE CASCADE
    );
  `);

  tx.executeSql(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_expiry_unique
    ON expiry_dates (product_id, location_id, expiry_date);
  `);

 
  tx.executeSql(`
    CREATE TRIGGER IF NOT EXISTS trg_expiry_insert
    AFTER INSERT ON expiry_dates
    BEGIN
      UPDATE locations
      SET location_qty = (
        SELECT COALESCE(SUM(expiry_qty), 0)
        FROM expiry_dates
        WHERE product_id = NEW.product_id
          AND location_id = NEW.location_id
      ),
      location_last_updated = datetime('now')
      WHERE product_id = NEW.product_id
        AND location_id = NEW.location_id;
    END;
  `);

  tx.executeSql(`
    CREATE TRIGGER IF NOT EXISTS trg_expiry_update
    AFTER UPDATE OF expiry_qty ON expiry_dates
    BEGIN
      UPDATE locations
      SET location_qty = (
        SELECT COALESCE(SUM(expiry_qty), 0)
        FROM expiry_dates
        WHERE product_id = NEW.product_id
          AND location_id = NEW.location_id
      ),
      location_last_updated = datetime('now')
      WHERE product_id = NEW.product_id
        AND location_id = NEW.location_id;
    END;
  `);

  tx.executeSql(`
    CREATE TRIGGER IF NOT EXISTS trg_expiry_delete
    AFTER DELETE ON expiry_dates
    BEGIN
      UPDATE locations
      SET location_qty = (
        SELECT COALESCE(SUM(expiry_qty), 0)
        FROM expiry_dates
        WHERE product_id = OLD.product_id
          AND location_id = OLD.location_id
      ),
      location_last_updated = datetime('now')
      WHERE product_id = OLD.product_id
        AND location_id = OLD.location_id;
    END;
  `);

  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS transactions (
      transaction_id INTEGER PRIMARY KEY,
      product_id INTEGER NOT NULL,
      location_id INTEGER NOT NULL,
      transaction_type TEXT NOT NULL,
      transaction_qty INTEGER NOT NULL,
      transaction_date TEXT NOT NULL,
      transaction_notes TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE CASCADE
    );
  `);

  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS location_names (
      location_name_id INTEGER PRIMARY KEY AUTOINCREMENT,
      loc_name TEXT NOT NULL UNIQUE
    );
  `);
};
