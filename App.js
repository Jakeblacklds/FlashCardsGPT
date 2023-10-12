import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FlashcardList from './FlashcardList';
import AddFlashcard from './AddFlashcard';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import flashcardSlice from './FlashcardSlice';

const Stack = createStackNavigator();

const store = configureStore({
  reducer: {
    flashcards: flashcardSlice.reducer,
  },
});

const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Flashcards">
          <Stack.Screen name="Flashcards" component={FlashcardList} />
          <Stack.Screen name="Agregar Flashcard" component={AddFlashcard} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;
