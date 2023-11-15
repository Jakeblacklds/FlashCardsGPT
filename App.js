import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider, useSelector } from 'react-redux';
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
import { AuthProvider } from './AuthContext'; // Importa el AuthProvider
import { View } from 'react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const store = configureStore({
  reducer: {
    darkMode: darkModeSlice.reducer,
    flashcards: flashcardSlice.reducer,
  },
});

const TabNavigator = () => {
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
            textAlign: 'center',
          },
          tabBarStyle: {
            width: '90%',
            alignSelf: 'center',
            borderRadius: 30,
            paddingBottom: 5,
            marginBottom: 10,
            backgroundColor: darkModeEnabled ? '#121212' : '#092A48',
            paddingHorizontal: 20,
            borderColor: darkModeEnabled ? 'white' : 'rgba(0, 0, 0, 0.2)',
            borderTopWidth: 0,
            borderWidth: 0,
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
          component={AccountScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'Account',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={24} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initDB().catch((err) => console.log(err));
  }, []);
  
  const [loaded] = useFonts(fonts);

  useEffect(() => {
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

    checkAuthentication();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <AuthProvider>
        <ActionSheetProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen
                name="TabNavigator"
                component={TabNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen name="FlashcardList" component={FlashcardList} options={{ headerShown: false }} />
              <Stack.Screen name="AddFlashcard" component={AddFlashcard} options={{ headerShown: false }} />
              <Stack.Screen name="AddCategory" component={AddCategory} options={{ headerShown: false }} />
              <Stack.Screen name="Memorize" component={MemorizeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="AddGpt" component={AddGpt} options={{ headerShown: false }} />
              <Stack.Screen name="SelectCategoryScreen" component={SelectCategoryScreen} options={{ headerShown: false }} />
              <Stack.Screen name="CheckFlashcardScreen" component={CheckFlashcardScreen} options={{ headerShown: false }} />
              <Stack.Screen
                name="Login"
                children={(props) => <LoginScreen {...props} />}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </ActionSheetProvider>
      </AuthProvider>
    </Provider>
  );
};

export default App;
