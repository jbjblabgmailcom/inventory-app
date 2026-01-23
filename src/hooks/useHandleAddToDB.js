import { useCallback } from "react";
import { dateToSQLite } from "../utils/ValidateFunctions";
import { insertProductIntoLocationInDB,
        fetchProductByLocationfromDB,
 } from "../dbQuerys/newProductDB";


 export const useHandleAddToDB = ({
   locationGlobal,
   setProductList,
   onDismissModal,
   setSavingToDB,
 }) => {
   const handleAddToDB = useCallback(
  
     async (productId, qty, expiry, locId) => {
        setSavingToDB(true);
       try {
         const result = await insertProductIntoLocationInDB(
           productId,
           qty,
           dateToSQLite(expiry),
           locationGlobal.loc_name,
           locId
         );

         if (result) {
           const products = await fetchProductByLocationfromDB(
             locationGlobal.loc_name
           );

           setProductList(products._array);
           setTimeout(() => {
             setSavingToDB(false);
             onDismissModal();
           }, 500);
         }
        
          
       } catch (error) {
         console.log("ERROR adding product to DB", error);
       }
      
     },
     [locationGlobal?.loc_name, setProductList, onDismissModal]
   );

   return handleAddToDB;
 };


 export const useHandleAddToDBOtherLocation = ({
   locationOther,
   onDismissModal,
   setSavingToDB,
 }) => {
   const handleAddToDBOtherLocation = useCallback(
     async (productId, qty, expiry) => {
      setSavingToDB(true);
       try {
         const result = await insertProductIntoLocationInDB(
           productId,
           qty,
           dateToSQLite(expiry),
           locationOther.loc_name
         );

         if (result) {
          setTimeout(() => {
            setSavingToDB(false);
            onDismissModal();
            }, 500);
          
          

         }
       } catch (error) {
         console.log("ERROR adding product to DB", error);
       }
       
     },
     [locationOther?.loc_name, onDismissModal]
   );

   return handleAddToDBOtherLocation;
 };