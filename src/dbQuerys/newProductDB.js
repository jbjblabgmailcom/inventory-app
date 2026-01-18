import { Alert } from 'react-native';
import { dateToSQLite, dateToSQLiteCurrent } from '../utils/ValidateFunctions';

import { db } from '../db/db';

export const fetchNamesFromDB = () => {
  return new Promise((resolve, reject) => {
    try {
      db.transaction(
        tx => {
          tx.executeSql(
            `SELECT DISTINCT p_name FROM products`,
            [],
            (_, results) => {
              const rows = results.rows;  // array of objects
              resolve(rows);
            },
            (_, error) => {
              console.log("Error fetching distinct names:", error);
              reject(error);
              return true;
            }
          );
        },
        error => {
         console.log("DB Transaction error:", error);
         reject(error);
        }
      );
    } catch (e) {
     console.log("Unexpected DB error:", e);
      reject(e);
    }
  });
};
 

export const fetchCategoriesFromDB = () => {
  return new Promise((resolve, reject) => {
    try {
      db.transaction(
        tx => {
          tx.executeSql(
            `SELECT DISTINCT p_category FROM products`,
            [],
            (_, results) => {
              const rows = results.rows;  // array of objects
              resolve(rows);
            },
            (_, error) => {
              console.log("Error fetching distinct categories:", error);
             reject(error);
              return true;
            }
          );
        },
        error => {
          console.log("DB Transaction error:", error);
          reject(error);
        }
      );
    } catch (e) {
      console.log("Unexpected DB error:", e);
      reject(e);
    }
  });
};


export const fetchLocationsFromDB = () => {
  return new Promise((resolve, reject) => {
    try {
      db.transaction(
        tx => {
          tx.executeSql(
            `SELECT DISTINCT loc_name FROM location_names`,
            [],
            (_, results) => {
              const rows = results.rows;  // array of objects
              
              resolve(rows);
            },
            (_, error) => {
              console.log("Error fetching distinct locations:", error);
              reject(error);
              return true;
            }
          );
        },
        error => {
          console.log("DB Transaction error:", error);
          reject(error);
        }
      );
    } catch (e) {
      console.log("Unexpected DB error:", e);
      reject(e);
    }
  });
};



export const fetchProductsFromDB = (searchText = '') => {
  return new Promise((resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          `
          SELECT *
          FROM products
          WHERE p_name LIKE ?
          ORDER BY id DESC
          LIMIT 40
          `,
          [`%${searchText}%`],
          (_, results) => {
            resolve(results.rows);
          },
          (_, error) => {
            console.log('Error fetching products:', error);
            reject(error);
            return true;
          }
        );
      },
      error => {
        console.log('DB Transaction error:', error);
        reject(error);
      });
    } catch (e) {
      console.log('Unexpected DB error:', e);
      reject(e);
    }
  });
};

export const fetchSingleProductFromDB = (productId, locationId) => {
  return new Promise((resolve, reject) => {
    // 1. Define the object here to ensure it persists across the transaction lifecycle
    const resultObj = {
      productData: null,
      expiryDates: [],
      transactions: [],
      otherLocationsSummary: []
    };

    db.transaction(
      tx => {
        const sqlError = (label) => (_, err) => {
          console.error(`❌ ${label} FAILED:`, err.message);
         
        };

        /* 1️⃣ PRODUCT DATA */
        tx.executeSql(
          `SELECT p.id AS product_id, p.p_name, p.p_category, p.p_code, p.p_desc,
                  p.p_date_created, p.p_photo, p.p_useexpiry, p.p_units, l.location_id, l.location_name, l.location_qty
           FROM products p
           JOIN locations l ON l.product_id = p.id
           WHERE p.id = ? AND l.location_id = ?
           LIMIT 1`,
          [productId, locationId],
          (_, res) => {
            if (res.rows.length > 0) {
              resultObj.productData = res.rows.item(0);
            }
          },
          sqlError("PRODUCT QUERY")
        );

        /* 2️⃣ EXPIRY DATES */
        tx.executeSql(
          `SELECT id, expiry_date, expiry_qty FROM expiry_dates
           WHERE product_id = ? AND location_id = ? AND expiry_qty > 0
           ORDER BY expiry_date ASC`,
          [productId, locationId],
          (_, res) => {
            resultObj.expiryDates = Array.from({ length: res.rows.length }, (_, i) => res.rows.item(i));
          },
          sqlError("EXPIRY QUERY")
        );

       
        tx.executeSql(
          `SELECT transaction_id, transaction_type, transaction_qty,
                  transaction_date, transaction_notes
           FROM transactions
           WHERE product_id = ? AND location_id = ?
           ORDER BY transaction_date DESC LIMIT 5`,
          [productId, locationId],
          (_, res) => {
            resultObj.transactions = Array.from(
              { length: res.rows.length },
              (_, i) => res.rows.item(i)
            );
          },
          sqlError("TRANSACTIONS QUERY")
        );

        /* 4️⃣ OTHER LOCATIONS */
        tx.executeSql(
          `SELECT location_name, SUM(location_qty) AS total_qty
           FROM locations
           WHERE product_id = ?
           GROUP BY location_name
           ORDER BY total_qty DESC`,
          [productId],
          (_, res) => {
            resultObj.otherLocationsSummary = Array.from({ length: res.rows.length }, (_, i) => res.rows.item(i));
          },
          sqlError("OTHER LOCATIONS QUERY")
        );
      },
      err => {
        console.error("🔥 TRANSACTION FAILED", err);
        reject(err);
      },
      () => {
        // Success! All queries finished and resultObj is populated.
        resolve(resultObj);
      }
    );
  });
};

export const fetchTransactionsFromDB = (productId, locationId, filters) => {
  const { type, fromDate, toDate, limit, cursor } = filters;

  console.log("⚡ fetchTransactionsFromDB called with:");
  console.log({ productId, locationId, filters });

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        let where = `WHERE product_id = ? AND location_id = ?`;
        const params = [productId, locationId];

        if (type?.length) {
          where += ` AND transaction_type IN (${type
            .map(() => "?")
            .join(",")})`;
          params.push(...type);
        }

        if (fromDate) {
          where += ` AND transaction_date >= ?`;
          params.push(fromDate);
        }

        if (toDate) {
          where += ` AND transaction_date <= ?`;
          params.push(toDate);
        }

        if (cursor) {
          where += ` AND transaction_date < ?`;
          params.push(cursor);
        }

        const sql = `
          SELECT transaction_id, transaction_type, transaction_qty,
                 transaction_date, transaction_notes
          FROM transactions
          ${where}
          ORDER BY transaction_date DESC
          LIMIT ?
        `;
        params.push(limit + 1); // fetch one extra row for hasMore

        console.log("📝 SQL query:", sql);
        console.log("📝 SQL params:", params);

        tx.executeSql(
          sql,
          params,
          (_, res) => {
            console.log("✅ Query executed, rows found:", res.rows.length);

            const rows = Array.from({ length: res.rows.length }, (_, i) =>
              res.rows.item(i)
            );

            const hasMore = rows.length > limit;
            const transactions = hasMore ? rows.slice(0, limit) : rows;

            const nextCursor =
              transactions.length > 0
                ? transactions[transactions.length - 1].transaction_date
                : null;

            console.log("📦 transactions returned:", transactions.length);
            console.log("➡ nextCursor:", nextCursor, "hasMore:", hasMore);

            resolve({
              transactions,
              hasMore,
              nextCursor,
            });
          },
          (_, err) => {
            console.error("❌ SQL execution error:", err);
            reject(err);
            return true;
          }
        );
      },
      (txErr) => {
        console.error("❌ Transaction error:", txErr);
        reject(txErr);
      }
    );
  });
};


export const fetchExpiryDatesFromDB = (
  productId,
  filters
) => {
  const { fromDate, toDate, limit, cursor } = filters;

  console.log("⚡ fetchExpiryDatesFromDB called with:");
  console.log({ productId, filters });

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        let where = `WHERE e.product_id = ?`;
        const params = [productId];

        if (fromDate) {
          where += ` AND e.expiry_date >= ?`;
          params.push(fromDate);
        }

        if (toDate) {
          where += ` AND e.expiry_date <= ?`;
          params.push(toDate);
        }

        if (cursor) {
          where += ` AND e.expiry_date > ?`;
          params.push(cursor);
        }

        const sql = `
          SELECT
            e.id,
            e.location_id,
            l.location_name,
            e.expiry_date,
            e.expiry_qty
          FROM expiry_dates e
          JOIN locations l
            ON l.location_id = e.location_id
           AND l.product_id = e.product_id
           AND e.expiry_qty > 0
          ${where}
          ORDER BY e.expiry_date ASC
          LIMIT ?
        `;

        params.push(limit + 1); // fetch extra row for hasMore

        console.log("📝 SQL:", sql);
        console.log("📝 params:", params);

        tx.executeSql(
          sql,
          params,
          (_, res) => {
            const rows = Array.from({ length: res.rows.length }, (_, i) =>
              res.rows.item(i)
            );

            const hasMore = rows.length > limit;
            const items = hasMore ? rows.slice(0, limit) : rows;

            const nextCursor =
              items.length > 0 ? items[items.length - 1].expiry_date : null;

            console.log("📦 expiry dates returned:", items);
            console.log("➡ nextCursor:", nextCursor, "hasMore:", hasMore);

            resolve({
              items, // unified list
              hasMore,
              nextCursor,
            });
          },
          (_, err) => {
            console.error("❌ SQL error:", err);
            reject(err);
            return true;
          }
        );
      },
      (txErr) => {
        console.error("❌ Transaction error:", txErr);
        reject(txErr);
      }
    );
  });
};





export const fetchProductByCodefromDB = async (code, locName) => {
  return new Promise((resolve, reject) => {
    try {
      db.transaction(
        tx => {
          // Step 1: Check product exists
          tx.executeSql(
            `SELECT * FROM products WHERE p_code = ?`,
            [code],
            (_, results) => {
              if (results.rows.length === 0) {
                console.log("product not found at all");
                resolve(null);
                return;
              }

              const productRow = results.rows.item(0);
              const product = {
                id: productRow.id,
                p_name: productRow.p_name,
                p_category: productRow.p_category,
                p_code: productRow.p_code,
                p_desc: productRow.p_desc,
                p_date_created: productRow.p_date_created,
                p_photo: productRow.p_photo,
                p_useexpiry: productRow.p_useexpiry,
                p_units: productRow.p_units
              };

              // Step 2: Fetch location info (optional)
              tx.executeSql(
                `
                SELECT location_id, location_name, location_qty, location_last_updated
                FROM locations
                WHERE product_id = ? AND location_name = ?
                `,
                [product.id, locName],
                (_, locResults) => {
                  let location = null;
                  if (locResults.rows.length > 0) {
                    const locRow = locResults.rows.item(0);
                    location = {
                      location_id: locRow.location_id,
                      location_name: locRow.location_name,
                      location_qty: locRow.location_qty,
                      location_last_updated: locRow.location_last_updated,
                    };
                  }

                  resolve({ product, location });
                },
                (_, locErr) => {
                  console.log("Error fetching location:", locErr);
                  reject(locErr);
                  return true;
                }
              );
            },
            (_, error) => {
              console.log("Error fetching product:", error);
              reject(error);
              return true;
            }
          );
        },
        txError => {
          console.log("DB transaction error:", txError);
          reject(txError);
        }
      );
    } catch (e) {
      console.log("Unexpected DB error:", e);
      reject(e);
    }
  });
};






export const saveNewProductInDB = (productDetails) => {
  return new Promise((resolve, reject) => {
    console.log("NEW PRODUCT DETAILS", productDetails);
    
    // 1. Destructure the product details
    const { 
        id,
        pname,
        category_value,
        bcode,
        description,
        dCreated,
        imgUri,
        useExpiry,
        units
    } = productDetails;
    
    
    const productSql = `
      INSERT INTO products (id, p_name, p_category, p_code, p_desc, p_date_created, p_photo, p_useexpiry, p_units)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  p_name = excluded.p_name,
  p_category = excluded.p_category,
  p_code = excluded.p_code,
  p_desc = excluded.p_desc,
  p_photo = excluded.p_photo,
  p_useexpiry = excluded.p_useexpiry,
  p_units = excluded.p_units;
    `;
    
    
    const productParams = [
      id,
      pname,
      category_value,
      bcode,
      description,
      dCreated,
      imgUri,
      useExpiry,
      units,
    ];

   try {
      db.transaction(
        tx => {
          tx.executeSql(
            productSql,
            productParams,
            (_, results) => {
              const productId = id || results.insertId; 
              console.log(`Product ID determined: ${productId}`);
              resolve({ productId, message: "NEW Product saved successfully." });
            },
            (_, error) => {
              console.error("Error inserting product (Step 1):", error);
             
              return true; 
            }
          );
        },
       
        error => {
          
          console.error("DB Transaction error (Rolled Back):", error);
          reject(error);
        },
       
        () => {
          console.log("Product save transaction committed successfully.");
         
        }
      );
    } catch (e) {
      console.error("Unexpected DB error:", e);
      reject(e);
    }
  });
};



export const fetchLocationsNamesFromDB = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // 1. First, check if the table exists in the SQLite master schema
      tx.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='location_names'",
        [],
        (_, results) => {
          if (results.rows.length === 0) {
            // Table does not exist: Resolve with empty array safely
            console.log("Table 'location_names' does not exist yet. Skipping.");
            resolve([]); 
          } else {
            // 2. Table exists: Carry on with the original query
            tx.executeSql(
              `SELECT * FROM location_names`,
              [],
              (_, subResults) => {
                resolve(subResults.rows._array || []); // Use ._array for convenience in some RN SQLite libs
              },
              (_, error) => {
                console.log("Error fetching rows:", error);
                reject(error);
              }
            );
          }
        },
        (_, error) => {
          console.log("Error checking table existence:", error);
          reject(error);
        }
      );
    });
  });
};


export const saveNewLocationInDB = (locationName) => {
  return new Promise((resolve, reject) => {
    console.log("NEW Location into db goes", locationName);
    
    
    const query = `
      INSERT INTO location_names 
        (loc_name)
      VALUES 
        (?);
    `;
   
   try {
      db.transaction(
        tx => {
          tx.executeSql(
            query,
            [locationName],
            (_, results) => {
              const location_name_id = results.insertId; 
              console.log(`Product ID determined: ${location_name_id}`);
              resolve({ location_name_id, message: "NEW location saved successfully." });
            },
            (_, error) => {
             // console.error("Error inserting new location:", error);
             Alert.alert("Nazwa lokalizacji nie może się powtarzać.");
              return true; 
            }
          );
        },
        
        error => {
          //console.error("DB Transaction error (Rolled Back):", error);
          //reject(error);
        },
       
        () => {
          console.log("Location save transaction committed successfully.");
         
        }
      );
    } catch (e) {
      console.error("Unexpected DB error:", e);
      reject(e);
    }
  });
};

 
export const fetchProductByLocationfromDB = (loc_name, searchText = '') => {

  
  return new Promise((resolve, reject) => {
    try {
      db.transaction(
        tx => {
          tx.executeSql(
            `SELECT 
    locations.*, 
    products.id, 
    products.p_name, 
    products.p_category, 
    products.p_photo,
    products.p_code,
    products.p_useexpiry,
    products.p_units
FROM locations
JOIN products 
    ON locations.product_id = products.id
WHERE locations.location_name = ?
AND products.p_name LIKE ?
;`,
            [loc_name, `%${searchText}%`],
            (_, results) => {
              const rows = results.rows; // array of objects
              resolve(rows);
            },
            (_, error) => {
              console.log("Error fetching product with code:", error);
              reject(error);
              return true;
            }
          );
        },
        error => {
          console.log("DB Transaction error:", error);
          reject(error);
        }
      );
    } catch (e) {
      console.log("Unexpected DB error:", e);
      reject(e);
    }
  });
};


export async function insertProductIntoLocationInDB(
  productId,
  addQty,
  expiryDate = dateToSQLite(expiryDate), // "YYYY-MM-DD"
  locName,
  locationId = null,
  notes = "Stock IN"
) {
  console.log("[DB][INSERT] called", {
    productId,
    addQty,
    expiryDate,
    locName,
    locationId,
    notes,
  });

  return new Promise((resolve, reject) => {
    const now = dateToSQLiteCurrent(new Date());
    console.log("[DB][TIME]", now);

    db.transaction((tx) => {
      const handleExpiryInsert = (locId) => {
        console.log("[DB][EXPIRY] handleExpiryInsert", {
          locId,
          productId,
          expiryDate,
          addQty,
        });

        tx.executeSql(
          `SELECT id, expiry_qty
           FROM expiry_dates
           WHERE product_id = ? AND location_id = ? AND expiry_date = ?`,
          [productId, locId, expiryDate],
          (_, res) => {
            console.log("[DB][EXPIRY] select result", {
              rows: res.rows.length,
            });

            if (res.rows.length === 0) {
              console.log("[DB][EXPIRY] inserting new batch");
              tx.executeSql(
                `INSERT INTO expiry_dates
                 (product_id, location_id, expiry_date, expiry_qty)
                 VALUES (?, ?, ?, ?)`,
                [productId, locId, expiryDate, addQty]
              );
            } else {
              const row = res.rows.item(0);
              console.log("[DB][EXPIRY] updating batch", {
                oldQty: row.expiry_qty,
                newQty: row.expiry_qty + addQty,
              });

              tx.executeSql(
                `UPDATE expiry_dates
                 SET expiry_qty = ?
                 WHERE id = ?`,
                [row.expiry_qty + addQty, row.id]
              );
            }

            console.log("[DB][TX] logging transaction");

            tx.executeSql(
              `INSERT INTO transactions
               (product_id, location_id, transaction_type, transaction_qty, transaction_date, transaction_notes)
               VALUES (?, ?, 'IN', ?, ?, ?)`,
              [productId, locId, addQty, now, notes],
              () => {
                console.log("[DB][SUCCESS] transaction committed");
                resolve(true);
              },
              (_, err) => {
                console.error("[DB][ERROR] transaction log failed", err);
                reject(err);
                return true;
              }
            );
          },
          (_, err) => {
            console.error("[DB][ERROR] expiry select failed", err);
            reject(err);
            return true;
          }
        );
      };

      // 🔹 Case 1: explicit locationId
      if (locationId) {
        console.log("[DB][LOCATION] using provided locationId", locationId);
        handleExpiryInsert(locationId);
        return;
      }

      // 🔹 Case 2 & 3: resolve by product + location name
      console.log("[DB][LOCATION] resolving by name", {
        productId,
        locName,
      });

      tx.executeSql(
        `SELECT location_id FROM locations
         WHERE product_id = ? AND location_name = ?`,
        [productId, locName],
        (_, res) => {
          console.log("[DB][LOCATION] resolve result", {
            found: res.rows.length,
          });

          if (res.rows.length > 0) {
            const locId = res.rows.item(0).location_id;
            console.log("[DB][LOCATION] existing location", locId);
            handleExpiryInsert(locId);
          } else {
            console.log("[DB][LOCATION] creating new location");

            tx.executeSql(
              `INSERT INTO locations
               (product_id, location_name, location_qty, location_last_updated)
               VALUES (?, ?, 0, ?)`,
              [productId, locName, now],
              (_, result) => {
                console.log("[DB][LOCATION] new location created", {
                  id: result.insertId,
                });
                handleExpiryInsert(result.insertId);
              },
              (_, err) => {
                console.error("[DB][ERROR] location insert failed", err);
                reject(err);
                return true;
              }
            );
          }
        },
        (_, err) => {
          console.error("[DB][ERROR] location resolve failed", err);
          reject(err);
          return true;
        }
      );
    });
  });
}






export const deleteProductById = (productId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM products WHERE id = ?`,
        [productId],
        (_, result) => resolve(result.rowsAffected),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  }) 
};



export const fetchSingleProductByIDFromDB = (productId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM products WHERE id = ?`,
        [productId],
        (_, result) => resolve(result.rows._array[0]),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  }) 
};



 


export const removeProductFromLocation = (data) => {
  const {
    removeId,
    removeLocId,
    removeQty
  } = data;

  return new Promise((resolve, reject) => {
    db.transaction(tx => {

      // 1️⃣ Total available stock
      tx.executeSql(
        `SELECT SUM(expiry_qty) AS total
         FROM expiry_dates
         WHERE product_id = ? AND location_id = ?`,
        [removeId, removeLocId],
        (_, sumRes) => {

          const available = Number(sumRes.rows.item(0).total || 0);

          if (available < removeQty) {
            reject({
              code: 'INSUFFICIENT_STOCK',
              available,
              requested: removeQty
            });
            return;
          }

          // 2️⃣ FIFO expiry rows
          tx.executeSql(
            `SELECT id, expiry_qty
             FROM expiry_dates
             WHERE product_id = ? AND location_id = ?
             ORDER BY expiry_date ASC`,
            [removeId, removeLocId],
            (_, rowsRes) => {

              let remaining = Number(removeQty);
              let totalRemoved = 0;

              for (let i = 0; i < rowsRes.rows.length && remaining > 0; i++) {
                const row = rowsRes.rows.item(i);
                const rowQty = Number(row.expiry_qty);

                if (rowQty <= remaining) {
                  tx.executeSql(
                    `UPDATE expiry_dates
                     SET expiry_qty = 0
                     WHERE id = ?`,
                    [row.id]
                  );
                  remaining -= rowQty;
                  totalRemoved += rowQty;
                } else {
                  tx.executeSql(
                    `UPDATE expiry_dates
                     SET expiry_qty = expiry_qty - ?
                     WHERE id = ?`,
                    [remaining, row.id]
                  );
                  totalRemoved += remaining;
                  remaining = 0;
                }
              }

              // 3️⃣ Read final qty AFTER triggers ran
              tx.executeSql(
                `SELECT location_qty
                 FROM locations
                 WHERE location_id = ?`,
                [removeLocId],
                (_, locRes) => {

                  const leftQty = Number(locRes.rows.item(0).location_qty);

                  const transactionType =
                    leftQty === 0 ? 'CLEAR' : 'OUT';

                  const transactionNotes =
                    leftQty === 0 ? 'Stock CLEAR' : 'Stock OUT';
                    const dateNow = dateToSQLiteCurrent(new Date());
                  
                  tx.executeSql(
                    `INSERT INTO transactions (
                      product_id,
                      location_id,
                      transaction_type,
                      transaction_qty,
                      transaction_date,
                      transaction_notes
                    ) VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                      removeId,
                      removeLocId,
                      transactionType,
                      totalRemoved,
                      dateNow,
                      transactionNotes
                    ]
                  );

                  resolve({
                    removed: totalRemoved,
                    remaining: leftQty,
                    transactionType
                  });
                }
              );
            }
          );
        }
      );
    });
  });
};
