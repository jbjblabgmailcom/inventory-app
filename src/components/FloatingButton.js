import React from 'react';
import {IconButton, useTheme} from 'react-native-paper';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
} from 'react-native-reanimated';

export default function FloatingButton({
  icon,
  onPress,
  size = 80,
  mode = 'contained',
  bottom = 40,
  right = 20,
  borderWidth = 1,
  style = {},
  visibility = {},
  ...props
}) {


  const {colors} = useTheme();


  return (

      <>
      {!visibility && 
      <>
      <Animated.View
      style={[
        {
          position: 'absolute',
          bottom,
          right,
          zIndex: 9999,
          elevation: Platform.OS === 'android' ? 10 : 0,
          
        }
       ]} 
    entering={FadeIn}
    exiting={FadeOut}
  >
    <IconButton
      icon = {icon}
      onPress = {onPress}
      size = {size}
      mode = {mode}
      style = {[
        {
          borderWidth,
          borderColor: colors.primary,
        }, 
        style,
      ]}
     
      {...props} 
    />
    </Animated.View>
      
      </>
      }
      </>
   
       
     
  );

}

 
