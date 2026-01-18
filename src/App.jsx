import 'react-native-gesture-handler';
import 'react-native-reanimated';
import RootLayout from './_layout'; 
import './utils/prototypes';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';





export default function App() {
    return (
          <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: 'rgb(1,1,1)'}} edges={['bottom']} >
              <RootLayout />
              </SafeAreaView>
          </SafeAreaProvider>
            

  );
}

