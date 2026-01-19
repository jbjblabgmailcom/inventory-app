import React from 'react'; 
import { adaptNavigationTheme, MD3DarkTheme, MD3LightTheme, PaperProvider, IconButton } from 'react-native-paper';
import { useColorScheme, View } from "react-native";
import { Colors } from './consts/Colors'; 
import merge from "deepmerge";
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme, ThemeProvider, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 
import { registerTranslation } from "react-native-paper-dates";

import ListProductsEditScreen from './screens/ListProductsEditScreen';
import LocationsScreen from './screens/LocationsScreen';
import DebugScreen from './screens/DebugScreen';
import {DebugScreen2} from './screens/DebugScreen2';
import DefineNewProductScreen from './screens/DefineNewProduct';
import ProductInfoScreen from './screens/ProductInfoScreen';
import TransactionsInfoScreen from './screens/TransactionsInfoScreen';
import ExpiryDatesInfoScreen from './screens/ExpiryDatesInfoScreen';
import ExpiryDatesAllScreen from './screens/ExpiryDatesAllScreen';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createDrawerNavigator} from "@react-navigation/drawer";
import { CustomDrawer } from './DrawerContent';



const Stack = createNativeStackNavigator(); 


const customDarkTheme = {...MD3DarkTheme, colors: Colors.dark};
const customLightTheme = {...MD3LightTheme, colors: Colors.light};

const { LightTheme, DarkTheme } = adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
   
    reactNavigationDark: NavigationDarkTheme, 
});

const CombinedDefaultTheme = merge(LightTheme, customLightTheme);
const CombinedDarkTheme = merge(DarkTheme, customDarkTheme);



export default function RootLayout() {

    registerTranslation('pl', {
  save: 'Zapisz',
  selectSingle: 'Wybierz date',
  selectMultiple: 'Wybierz daty',
  selectRange: 'Zakres czasu',
  notAccordingToDateFormat: (inputFormat) =>
    `Format daty musi być ${inputFormat}`,
  mustBeHigherThan: (date) => `Data musi być później niż ${date}`,
  mustBeLowerThan: (date) => `Data musi być wcześniej niż ${date}`,
  close: 'Zamknij',
  confirm: 'Zatwierdź',
  cancel: 'Anuluj',
  label: 'Wybierz date',
  startLabel: 'Data rozpoczęcia',
  endLabel: 'Data zakończenia',
  typeInDate: 'Wpisz datę',
  input: 'Pole',
  previous: 'Poprzedni miesiąc',
  next: 'Następny miesiąc',
  pickDateFromCalendar: 'Wybierz datę z kalendarza',
});

    const colorScheme = useColorScheme();
    const paperTheme = colorScheme === "dark" ? CombinedDarkTheme : CombinedDefaultTheme;
    const Drawer = createDrawerNavigator();

    function MainStack() {
      return (
        <Stack.Navigator
          screenOptions={({ navigation }) => ({
            headerLeft: () => (
              <View style={{ flexDirection: "row", alignItems: 'flex-start' }}>
                {/* Hamburger button */}
                <IconButton
                  icon="menu"
                  size={28}
                  onPress={() => navigation.openDrawer()}
                />

              
                {navigation.canGoBack() && (
                  <IconButton
                    icon="arrow-left"
                    size={25}
                    onPress={() => navigation.goBack()}
                  />
                )}
              </View>
            ),
          })}
        >
          <Stack.Screen name="Moj magazyn" component={LocationsScreen} />

          <Stack.Screen
            name="Definiuj nowy produkt"
            component={DefineNewProductScreen}
          />
          <Stack.Screen
            name="Produkty, edycja."
            component={ListProductsEditScreen}
          />

          <Stack.Screen name="Transakcje" component={TransactionsInfoScreen} />

          <Stack.Screen
            name="Terminy przydatności"
            component={ExpiryDatesInfoScreen}
          />
          <Stack.Screen
            name="Terminy przydatności - raport"
            component={ExpiryDatesAllScreen}
          />
          <Stack.Screen
            name="Informacja o produkcie"
            component={ProductInfoScreen}
          />

          <Stack.Screen name="Debugging" component={DebugScreen} />
          <Stack.Screen name="Debuging2" component={DebugScreen2} />
        </Stack.Navigator>
      );
    }

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider theme={paperTheme}>
          <ThemeProvider value={paperTheme}>
            <NavigationContainer theme={paperTheme}>
              <Drawer.Navigator
                drawerContent={(props) => <CustomDrawer {...props} />}
                screenOptions={{ headerShown: false }} // keep stack headers
              >
                <Drawer.Screen name="Home" component={MainStack} />
              </Drawer.Navigator>
            </NavigationContainer>
          </ThemeProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    );
};