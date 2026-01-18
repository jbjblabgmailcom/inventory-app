import { useState } from "react";

export const useDatePicker = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [expiryDate, setExpiryDate] = useState(null);

  const onConfirm = ({ date }) => {
    setModalOpen(false);
    if (date) {
      setExpiryDate(date);
    }
  };

  return {
    modalOpen,
    setModalOpen,
    expiryDate,
    onConfirm,
    setExpiryDate,
  };
};
