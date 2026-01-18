import { useColorScheme } from 'react-native';
import { Colors } from '../consts/Colors';

export const useThemeColors = () => {
  const scheme = useColorScheme(); // 'light' | 'dark'
  return scheme === 'dark' ? Colors.dark : Colors.light;
};
