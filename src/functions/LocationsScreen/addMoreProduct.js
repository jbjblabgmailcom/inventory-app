

export const createAddMoreProduct = ({
    setProductForAdd,
    setModalType,
    setModalVisible,
}) => {
    return (id, name, location_name, location_id, noscan = true, useexpiry, units) => {
        setProductForAdd({
          id,
          p_name: name,
          location_name,
          location_id,
          noscan,
          useexpiry,
          units,
        });

        setModalType('addMoreProduct');
        setModalVisible(true);
    }
}




export const createAddProductToLocation = ({
  setProductForAdd,
  setModalType,
  setModalVisible,
}) => {
  return (id, name, noscan = true, other = true, useexpiry, units) => {
    setProductForAdd({
      id,
      p_name: name,
      noscan,
      other,
      useexpiry,
      units
 
    });

    setModalType("addMoreProduct");
    setModalVisible(true);
  };
};