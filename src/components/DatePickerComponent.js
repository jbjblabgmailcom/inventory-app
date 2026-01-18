import React from "react";
import { DatePickerModal } from "react-native-paper-dates";

export const DatePickerComponent = ({
  visible,
  onDismiss,
  date,
  onConfirm,
}) => {
  return (
    <DatePickerModal
      locale="pl"
      mode="single"
      visible={visible}
      onDismiss={onDismiss}
      date={date}
      onConfirm={onConfirm}
    />
  );
};
