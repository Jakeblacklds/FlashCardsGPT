import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import flashcardSlice from './redux/FlashcardSlice';
import { darkModeSlice } from './redux/darkModeSlice';
import { initDB } from './db';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { AuthProvider } from './Auth/AuthContext';
import { useFonts } from 'expo-font';
import fonts from './fonts/fonts';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './Auth/firebase-config';
import MainStackNavigator from './navigation/MainStackNavigator';
import AuthStackNavigator from './navigation/AuthStackNavigator';
import LoadingScreen from './screens/LoadingScreen';

const store = configureStore({
  reducer: {
    darkMode: darkModeSlice.reducer,
    flashcards: flashcardSlice.reducer,
  },
});

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initDB().catch((err) => console.log(err));
  }, []);

  const [loaded] = useFonts(fonts);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(true);
      if (user) {
        AsyncStorage.setItem('user', JSON.stringify(user));
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        AsyncStorage.removeItem('user');
      }

      // Temporizador para asegurar que el estado de carga se establezca en falso después de 1 segundo
      setTimeout(() => {
        setIsLoading(false);
      }, 2500);
    });
    return () => unsubscribe();
  }, []);

  if (!loaded || isLoading) {
    
    return <LoadingScreen />;
  }

  return (
    <ActionSheetProvider>
      <AuthProvider>
        <Provider store={store}>
          <NavigationContainer>
            {isAuthenticated ? <MainStackNavigator /> : <AuthStackNavigator />}
          </NavigationContainer>
        </Provider>
      </AuthProvider>
    </ActionSheetProvider>
  );
}

export default App;
