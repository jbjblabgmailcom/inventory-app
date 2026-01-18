import { useCallback } from "react";

export const useDismissModal = ({
  setModalVisible,
  setLocationName,
  setModalType,
  setCounter,
  setProductForAdd,
  setScannerVisible,
  setBarCoreValue,
  setLocationInfo,
  setLocationOther,
  setExpiryDate,
  
}) => {
  const onDismissModal = useCallback(() => {
    setModalVisible(false);
    setLocationName("");
    setModalType("");
    setCounter(1);
    setProductForAdd(null);
    setScannerVisible(false);
    setBarCoreValue("Skanowanie w toku");
    setLocationInfo(null);
    setLocationOther(null);
    setExpiryDate(null);
  }, []);

  return onDismissModal;
};
