import React, { useState, useMemo, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { TextInput, Menu, List, useTheme } from 'react-native-paper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PaperAutocomplete = ({ 
  label, 
  options, 
  keyName = 'label',
  mode = 'outlined', 
  onSelect, 
  onChangeText, 
  value,
  error = false,
  disabled = false,
 

}) => {
  const theme = useTheme();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [textInputLayout, setTextInputLayout] = useState(null);
  const visibilityTimer = useRef(null);

const safeValue =
  typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : '';


  const mappedOptions = useMemo(() => {
    const dataArray = options?._array || options;

    if (!Array.isArray(dataArray)) return [];

    return dataArray.map((item, index) => {
      const displayValue = item?.[keyName];

      const label = displayValue === null
        ? ''
        : String(displayValue);

      return {
        label,
        value: label || `fallback-${index}`,
        originalItem: item,
      };
    });
  }, [options, keyName]);


  const filteredOptions = useMemo(() => {
    if (!safeValue) return mappedOptions;

    const search = safeValue.toLowerCase();

    return mappedOptions.filter(option =>
      option.label.toLowerCase().includes(search)
    );
  }, [safeValue, mappedOptions]);


  const handleSelect = (option) => {
    onChangeText?.(option.label);
    setIsMenuVisible(false);
    onSelect?.(option.originalItem);
  };

  const handleInputChange = (text) => {
    const safeText = text === null ? '' : String(text);

    onChangeText?.(safeText);

    if (visibilityTimer.current) {
      clearTimeout(visibilityTimer.current);
    }

    if (safeText.length > 0) {
      visibilityTimer.current = setTimeout(() => {
        setIsMenuVisible(true);
      }, 350);
    } else {
      setIsMenuVisible(false);
    }
  };

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        setTextInputLayout(event.nativeEvent.layout);
      }}
    >
      <Menu
      
        visible={isMenuVisible && filteredOptions.length > 0}
        onDismiss={() => setIsMenuVisible(false)}
        anchorPosition="bottom"
        anchor={
          <TextInput
            label={label}
            mode={mode}
            value={safeValue}
            onChangeText={handleInputChange}
            error={error}
            style={styles.textInput}
            disabled={disabled}
           
          />
        }
        style={[
          {
            width: textInputLayout?.width || SCREEN_WIDTH - 40,
         
          },
         
        ]}
      >
        {filteredOptions.map((option) => (
          <List.Item
            key={option.value}
            title={option.label}
            onPress={() => handleSelect(option)}
            style={[
              styles.menuItem,
              { backgroundColor: theme.colors.elevation.level3 },
            ]}
          />
        ))}
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 10,
  },
  textInput: {
 
    width: '100%'
  },
  menuContent: {
    maxHeight: 400,
  },
  menuItem: {
    borderRadius: 5,
    borderBottomWidth: 1,
    
  },
});

export default PaperAutocomplete;
