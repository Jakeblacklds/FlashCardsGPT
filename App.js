import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import flashcardSlice, { setCurrentUserUID } from './redux/FlashcardSlice';
import { darkModeSlice } from './redux/darkModeSlice';
import { initDB } from './db';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { AuthProvider } from './Auth/AuthContext';
import { useFonts } from 'expo-font';
import fonts from './fonts/fonts';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import MainStackNavigator from './navigation/MainStackNavigator';
import AuthStackNavigator from './navigation/AuthStackNavigator';
import LoadingScreen from './Screens/Login/LoadingScreen';

const store = configureStore({
  reducer: {
    darkMode: darkModeSlice.reducer,
    flashcards: flashcardSlice.reducer,
  },
});

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loaded] = useFonts(fonts);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await initDB();
        console.log('Database initialized');
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };
    initializeDatabase();
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(true);
      if (user) {
        setIsAuthenticated(true);
        store.dispatch(setCurrentUserUID(user.uid));
      } else {
        setIsAuthenticated(false);
        store.dispatch(setCurrentUserUID(null));
      }
      setTimeout(() => setIsLoading(false), 800); // Ajusta el delay a tu gusto
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
};

export default AppContent;
