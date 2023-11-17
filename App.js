import React, { useEffect, useState ,useRef} from 'react';
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
import { View,TouchableOpacity,Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const store = configureStore({
  reducer: {
    darkMode: darkModeSlice.reducer,
    flashcards: flashcardSlice.reducer,
  },
});

function MyTabBar({ state, descriptors, navigation }) {
  const darkModeEnabled = useSelector(selectDarkMode);

  // Crear valores compartidos para cada ruta
  const scales = state.routes.map(() => useSharedValue(0.95));
  const opacities = state.routes.map(() => useSharedValue(0.5));

  useEffect(() => {
    state.routes.forEach((route, index) => {
      const isFocused = state.index === index;
      scales[index].value = withTiming(isFocused ? 1.1 : 0.95, { duration: 200 });
      opacities[index].value = withTiming(isFocused ? 1 : 0.5, { duration: 200 });
    });
  }, [state.index, state.routes]);

  return (
    <View style={{backgroundColor: darkModeEnabled ? '#121212' : '#F5F5F5',}}>
    <View style={{
      flexDirection: 'row',
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 5,
      width: '90%',
      borderRadius: 20,
      backgroundColor: darkModeEnabled ? '#121212' : '#3f37c9',
      borderTopWidth: 0,
      marginBottom: 10,
      paddingHorizontal: 15,
    }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const animatedStyles = useAnimatedStyle(() => {
          return {
            transform: [{ scale: scales[index].value }],
            opacity: opacities[index].value,
          };
        });

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={{
              
              flex: 1, paddingTop: 5, justifyContent: 'center', alignItems: 'center' }}
            accessibilityRole="button"
          >
            <Animated.View style={[animatedStyles]}>
              {options.tabBarIcon({ focused: isFocused, color: isFocused ? '#F3F9E3' : 'white', size: 24 })}
              <Text style={{ textAlign: 'center', color: isFocused ? '#F3F9E3' : 'white', fontSize: 10, marginTop: 4 }}>
                {options.title}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
    </View>
  );
}

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Flashcards"
      
     tabBar={props => <MyTabBar {...props} />}>
      <Tab.Screen
        name="Flashcards"
        component={CategoriesScreen}
        options={{
          headerShown: false,
          title: 'FlashCards',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="category" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          headerShown: false,
          title: 'Chat',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="robot-excited-outline" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Exercises"
        component={ExercisesScreen}
        options={{
          headerShown: false,
          title: 'Exercises',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="notebook-outline" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          headerShown: false,
          title: 'Account',
          tabBarIcon: ({ color }) => (
            <Ionicons name="people-outline" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
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
