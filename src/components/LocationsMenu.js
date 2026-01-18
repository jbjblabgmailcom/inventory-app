import React, { useMemo, forwardRef } from 'react';

import BottomSheet from '@gorhom/bottom-sheet'; // Import BottomSheetView
import { useTheme, Portal } from 'react-native-paper';

import { View } from "react-native";


const LocationsMenu = forwardRef(({content, setIsSheetOpen}, ref) => {
  const snapPoints = useMemo(() => ['50%', '70%'], []);
    const theme = useTheme();
 
  return (
    <Portal>
      <View style={{flex: 1, marginTop: 250}}>
        <BottomSheet
          keyboardBehavior="interactive"
          keyboardBlurBehavior="none"
          backgroundStyle={{ backgroundColor: theme.colors.elevation.level5 }}
          ref={ref}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onChange={(index) => {
            if (index === -1) {
              console.log("Sheet is now CLOSED");
              setIsSheetOpen(false);
            }
          }}
        >
          {content}
        </BottomSheet>
      </View>
    </Portal>
  );
});



export default LocationsMenu;