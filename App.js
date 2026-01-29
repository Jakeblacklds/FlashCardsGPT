import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Provider, useSelector } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import flashcardSlice, { setCurrentUserUID } from './redux/FlashcardSlice';
import { darkModeSlice, selectDarkMode } from './redux/darkModeSlice';
import studyProgressSlice, { loadStudyProgress } from './redux/StudyProgressSlice';
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
    studyProgress: studyProgressSlice.reducer,
  },
});

// Temas personalizados para eliminar el flash blanco
const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0D0D0E',
    card: '#0D0D0E',
  },
};

const MyLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F5F5F7',
    card: '#F5F5F7',
  },
};

// Componente interno que usa el tema basado en Redux
const AppNavigator = ({ isAuthenticated }) => {
  const darkModeEnabled = useSelector(selectDarkMode);
  const theme = darkModeEnabled ? MyDarkTheme : MyLightTheme;

  return (
    <NavigationContainer theme={theme}>
      {isAuthenticated ? <MainStackNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
};

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

    // Cargar progreso de estudio desde AsyncStorage
    store.dispatch(loadStudyProgress());
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
      setTimeout(() => setIsLoading(false), 800);
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
          <AppNavigator isAuthenticated={isAuthenticated} />
        </Provider>
      </AuthProvider>
    </ActionSheetProvider>
  );
};

export default AppContent;
