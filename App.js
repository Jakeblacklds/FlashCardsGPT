import React, { useState, useEffect } from 'react';
import {View,Animated} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider, useSelector } from 'react-redux'; // Agregamos useSelector
import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import flashcardSlice from './FlashcardSlice';
import CategoriesScreen from './screens/CategoriesScreen';
import ChatScreen from './screens/ChatScreen';
import ExercisesScreen from './screens/ExercisesScreen';
import AccountScreen from './screens/AccountScreen';
import FlashcardList from './screens/FlashcardList';
import AddFlashcard from './actions/AddFlashcard';
import AddCategory from './actions/AddCategory';
import MemorizeScreen from './screens/MemorizeScreen';
import AddGpt from './actions/AddGpt';
import SelectCategoryScreen from './screens/SelectCategoryScreen';
import CheckFlashcardScreen from './screens/CheckFlashcardScreen';
import LoginScreen from './screens/LoginScreen';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import fonts from './fonts/fonts';
import { darkModeSlice, selectDarkMode } from './darkModeSlice';
import { initDB } from './db';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


const store = configureStore({
  reducer: {
    darkMode: darkModeSlice.reducer,
    flashcards: flashcardSlice.reducer,
  },
});

const TabNavigatorWrapper = (props) => {
  return <TabNavigator {...props} handleLogout={props.route.params?.handleLogout} />;
};

const TabNavigator = ({ handleLogout }) => {
  // Obtén el estado del modo oscuro desde Redux store
  const darkModeEnabled = useSelector(selectDarkMode);

  return (
    <View style={{ flex: 1, backgroundColor: darkModeEnabled ? '#121212' : '#F5F5F5' }}>
    <Tab.Navigator
      initialRouteName="Categorías"
      screenOptions={{
        tabBarActiveTintColor: '#f2cc8f',
        tabBarInactiveTintColor: 'white',
        tabBarLabelStyle: {
          fontFamily: 'Pagebash',
          fontSize: 12,
        },
        tabBarStyle: {
          width: '90%',
          alignSelf: 'center', // Ajusta el ancho para cubrir todo el contenedor
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: darkModeEnabled ? 'black' : '#092A48', // Cambia el color de fondo
          paddingHorizontal: 20,
          borderColor: darkModeEnabled ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          borderWidth: 1,
        },
      }}
    >
      <Tab.Screen
        name="Categorías"
        component={CategoriesScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="category" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="robot-excited-outline" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Exercises"
        component={ExercisesScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Exercises',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="notebook-outline" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        options={{
          headerShown: false,
          tabBarLabel: 'Account',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={24} color={color} />
          ),
        }}
      >
        {(props) => <AccountScreen {...props} handleLogout={handleLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
    </View>
  );
};

const App = () => {

  useEffect(() => {
    initDB().catch((err) => console.log(err));
  }, []);
  
  const [loaded] = useFonts(fonts);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthentication = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user !== null) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  const onAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setIsAuthenticated(false);
    } catch (error) {
      console.log(error);
    }
  };

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <ActionSheetProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {isAuthenticated ? (
            <>
              <Stack.Screen
                name="TabNavigator"
                component={TabNavigatorWrapper}
                initialParams={{ handleLogout: handleLogout }}
                options={{ headerShown: false }}
              />
              <Stack.Screen name="FlashcardList" component={FlashcardList} options={{ headerShown: false }} />
              <Stack.Screen name="AddFlashcard" component={AddFlashcard} options={{ headerShown: false }} />
              <Stack.Screen name="AddCategory" component={AddCategory} options={{ headerShown: false }} />
              <Stack.Screen name="Memorize" component={MemorizeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="AddGpt" component={AddGpt} options={{ headerShown: false }} />
              <Stack.Screen name="SelectCategoryScreen" component={SelectCategoryScreen} options={{ headerShown: false }} />
              <Stack.Screen name="CheckFlashcardScreen" component={CheckFlashcardScreen} options={{ headerShown: false }} />
            </>
          ) : (
            <Stack.Screen
              name="Login"
              children={(props) => <LoginScreen {...props} onAuthenticated={onAuthenticated} />}
              options={{ headerShown: false }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      </ActionSheetProvider>
    </Provider>
  );
};

export default App;
