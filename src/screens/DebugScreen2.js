import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Button, 
  StyleSheet, 
  ScrollView 
} from 'react-native';
import { Vibration } from 'react-native';
//import SystemSoundComponent from '../utils/beep';


import { SafeAreaView } from 'react-native-safe-area-context';
// Import your database instance
// MAKE SURE THIS PATH IS CORRECT for your project!
import { db } from '../db/db'; 

// --- Hardcoded Query ---
const HARDCODED_QUERY = `SELECT page_count * page_size as size_bytes FROM pragma_page_count(), pragma_page_size();`;
//const HARDCODED_QUERY = "DROP TABLE location_names;";

export const DebugScreen2 = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Executes the SQL query in a transaction
   */
  const executeQuery = () => {
    setLoading(true);
    setResult(null);

    db.transaction(
      tx => {
        // Execute the single hardcoded query
        tx.executeSql(
          HARDCODED_QUERY,
          [],
          (_, resultSet) => {
            // Success Callback
            for (let i = 0; i < resultSet.rows.length; i++) {
      console.log(resultSet.rows.item(i));
    }
            const count = resultSet.rows.length;
            let firstRowDetails = 'N/A';
            
            if (count > 0) {
                // Get the first item for inspection
                const firstRow = resultSet.rows;
                // Use JSON.stringify for a clean, readable output of the object
                firstRowDetails = JSON.stringify(firstRow, null, 2);
            }

            const successMessage = `
              Query: ${HARDCODED_QUERY}
              
              Status: Successful Read
              Rows Found: ${count}
              
              --- First Row Data ---
              ${firstRowDetails}
            `;

            setResult({ 
                status: 'Success', 
                message: successMessage 
            });
          },
          (tx, error) => {
            // Error Callback
            setResult({ 
                status: 'Error', 
                message: `SQL Error during SELECT:\n${error.message}` 
            });
            return true; // Prevents global transaction rollback on failure
          }
        );
      },
      // Global Transaction Error Handler (e.g., if the transaction couldn't even start)
      (error) => {
        setResult({ 
            status: 'Error', 
            message: `Transaction Failed:\n${error.message}` 
        });
        setLoading(false);
      },
      // Global Transaction Success Handler (only called if all steps succeeded)
      () => {
        setLoading(false);
      }
    );
  };
  
  // Execute the query once when the component mounts
  useEffect(() => {
    executeQuery();
  }, []); // Empty dependency array means it runs only on mount

  // --- Rendering Logic ---

  const getResultStyle = () => {
    if (!result) return {};
    return {
      backgroundColor: result.status === 'Success' ? '#e6ffe6' : '#ffe6e6',
      borderColor: result.status === 'Success' ? '#4CAF50' : '#FF0000',
    };
  };

const testButton = () => {
  Vibration.cancel();
  Vibration.vibrate(100);
  
  
};


  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>🔬 Hardcoded SQL Debugger</Text>
     
        
        <Text style={styles.queryDisplay}>
          Query: **{HARDCODED_QUERY}**
        </Text>

        <Button 
          title={loading ? "Running..." : "Re-run Query"} 
          onPress={executeQuery} 
          disabled={loading}
        />
        <Button 
          title={"Vibrate"} 
          onPress={()=> testButton()} 
        
        />
      

        {result && (
          <View style={[styles.resultBox, getResultStyle()]}>
            <Text style={[styles.resultHeader, { color: result.status === 'Success' ? '#4CAF50' : '#FF0000' }]}>
              Result Status: {result.status}
            </Text>
            <Text style={styles.resultText}>
              {result.message}
            </Text>
          </View>
        )}
        
        <Text style={styles.infoText}>
          This screen automatically executes the hardcoded query on load.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  queryDisplay: {
    fontSize: 16,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
  resultBox: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
  },
  resultHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    // Use 'pre-wrap' to respect the newlines and spaces in the formatted JSON output
    // and the multiline success message.
    whiteSpace: 'pre-wrap', 
  },
  infoText: {
    marginTop: 20,
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  }
});