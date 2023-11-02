import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
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
import { Ionicons,MaterialCommunityIcons,MaterialIcons } from '@expo/vector-icons';
import {useFonts} from 'expo-font';
import fonts from './fonts/fonts';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const store = configureStore({
  reducer: {
    flashcards: flashcardSlice.reducer,
  },
});

const TabNavigatorWrapper = (props) => {
  return <TabNavigator {...props} handleLogout={props.route.params?.handleLogout} />;
};

const TabNavigator = ({ handleLogout }) => {
  return (
    <Tab.Navigator
      initialRouteName="Categorías"
    
      screenOptions={{
        tabBarActiveTintColor: '#f2cc8f', // Cambia el color de la etiqueta activa
        tabBarInactiveTintColor: 'white', // Cambia el color de la etiqueta inactiva
        tabBarLabelStyle: {
          fontFamily: 'Pagebash',
          fontSize: 12, // Ajusta el tamaño de la etiqueta
          color: '#f2cc8f', // Cambia el color del texto
        },
        tabBarStyle: {
          width : '90%',
          alignSelf: 'center',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: '#092A48', // Cambia el color de fondo
          paddingHorizontal: 20, // Ajusta el ancho a los lados
        },
      }}
    >
      <Tab.Screen
        name="Categorías"
        component={CategoriesScreen}
        options={{
          headerShown: false,
          
          tabBarIcon: ({ color, size }) => (
<MaterialIcons name="category" size={24} color={color} />          ),
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
<MaterialCommunityIcons name="notebook-outline" size={24} color={color} />          ),
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
  );
};

const App = () => {
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
      setIsAuthenticated(false);  // Esto cambiará el conjunto de rutas renderizadas
    } catch (error) {
      console.log(error);
    }
  };

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
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
              <Stack.Screen name="FlashcardList" component={FlashcardList} options={{ headerShown: false }}  />
              <Stack.Screen name="AddFlashcard" component={AddFlashcard} options={{ headerShown: false }}  />
              <Stack.Screen name="AddCategory" component={AddCategory} options={{ headerShown: false }}  />
              <Stack.Screen name="Memorize" component={MemorizeScreen} options={{ headerShown: false }}  />
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
    </Provider>
  );
};

export default App;
