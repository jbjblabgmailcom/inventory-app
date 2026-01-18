import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
// ⚠️ IMPORTANT: Ensure the path below correctly points to your database connection file
import { db } from "../db/db"; 

const useDBDebugger = () => {
    const [allData, setAllData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

useEffect(() => {
    const getAllTableContents = async () => {
        try {
            const collectedData = {};

            await new Promise((resolve, reject) => {
                db.transaction(
                    tx => {
                        console.log('--- DB Debugger: Starting Transaction ---');

                        // 1. SELECT table names
                        tx.executeSql(
                            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
                            [],
                            (_, tablesResult) => {
                                const tableNames = [];
                                for (let i = 0; i < tablesResult.rows.length; i++) {
                                    tableNames.push(tablesResult.rows.item(i).name);
                                }
                                console.log('Found tables:', tableNames);

                                const fetchNextTable = (index) => {
                                    // 2. Base Case: End of recursion
                                    if (index >= tableNames.length) {
                                        // The transaction will commit successfully here.
                                        return; 
                                    }

                                    const tableName = tableNames[index];
                                    console.log(`Fetching data for table: ${tableName}`);

                                    // 3. SELECT data for current table
                                    tx.executeSql(
                                        `SELECT * FROM "${tableName}"`,
                                        [],
                                        (_, contentResult) => {
                                            const rows = [];
                                            for (let i = 0; i < contentResult.rows.length; i++) {
                                                rows.push(contentResult.rows.item(i));
                                            }

                                            collectedData[tableName] = rows;

                                            // Proceed to the next table
                                            fetchNextTable(index + 1);
                                        },
                                        (_, err) => {
                                            // SQL Error in SELECT: Reject and signal rollback
                                            reject(err);
                                            return true; 
                                        }
                                    );
                                };

                                // Start the recursive fetch
                                fetchNextTable(0);
                            },
                            (_, err) => {
                                // SQL Error in getting table names: Reject and signal rollback
                                reject(err);
                                return true;
                            }
                        );
                    },
                    // Global Transaction Error Handler (called if any tx.executeSql returns true)
                    (err) => {
                        console.error('DB Transaction failed (Rollback):', err);
                        reject(err);
                    },
                    // Global Transaction Success Handler (called only if all SQL succeeds)
                    () => {
                        console.log('DB Transaction completed successfully.');
                        resolve(); // Resolve the outer Promise
                    }
                );
            }); // End of Promise wrapper

            // This code runs only AFTER the Promise resolves successfully
            setAllData(collectedData);
            setLoading(false);
            console.log("ALL DATA LOG:", collectedData); // Final log
            console.log('--- DB Debugger: Finished ---');


        } catch (e) {
            // Catches errors from the outer Promise reject or synchronous errors
            console.error("DB DEBUGGER FATAL ERROR:", e);
            setError(e.message || "Unknown DB Error");
            setLoading(false);
        }
    };

    getAllTableContents();
}, []);



    return { allData, loading, error };
};


// --- 3. MAIN COMPONENT: DebugScreen ---
const DebugScreen = () => {
    // Use the custom hook to manage state and fetch data on mount
    const { allData, loading, error } = useDBDebugger();

    // Helper to render the fetched data for visual inspection
    const renderData = () => {
        if (loading) {
            return <Text style={styles.status}>Loading database contents...</Text>;
        }
        if (error) {
            return <Text style={[styles.status, styles.error]}>Error: {error}</Text>;
        }
        if (!allData || Object.keys(allData).length === 0) {
            return <Text style={styles.status}>No tables or data found.</Text>;
        }

        return Object.entries(allData).map(([tableName, rows]) => (
            <View key={tableName} style={styles.tableContainer}>
                <Text style={styles.tableName}>📝 Table: **{tableName}** ({rows.length} rows)</Text>
                {rows.length > 0 ? (
                    rows.map((row, index) => (
                        // Use JSON.stringify to show the contents of the row object
                        <Text key={index} style={styles.rowText}>
                            {JSON.stringify(row, null, 2)}
                        </Text>
                    ))
                ) : (
                    <Text style={styles.rowText}>No data in this table.</Text>
                )}
            </View>
        ));
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>🐛 Database Debugger</Text>
            {renderData()}
        </ScrollView>
    );
}

// --- 4. STYLES ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#f9f9f9',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    status: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        padding: 20,
    },
    error: {
        color: 'red',
        fontWeight: 'bold',
    },
    tableContainer: {
        marginBottom: 25,
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    tableName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    rowText: {
        fontSize: 12,
        fontFamily: 'monospace',
        backgroundColor: '#000000ff',
        padding: 5,
        borderRadius: 4,
        marginTop: 5,
    }
});

export default DebugScreen;