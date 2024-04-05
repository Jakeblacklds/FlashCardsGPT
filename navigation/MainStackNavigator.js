import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import FlashcardList from '../screens/FlashcardList';
import AddFlashcard from '../actions/AddFlashcard';
import AddCategory from '../actions/AddCategory';
import VocabularyExercisesScreen from '../screens/VocabularyExercisesScreen/VocabularyExercisesScreen';
import AddGpt from '../actions/AddGpt';
import SelectCategoryScreen from '../screens/SelectCategoryScreen';
import CheckFlashcardScreen from '../screens/CheckFlashcardScreen';
import MemorizeScreen from '../screens/MemorizeScreen';


const MainStack = createStackNavigator();

const MainStackNavigator = () => {
  return (
    <MainStack.Navigator>
      <MainStack.Screen name="TabNavigator" component={TabNavigator} options={{ headerShown: false }} />
      <MainStack.Screen name="VocabularyExercises" component={VocabularyExercisesScreen} options={{ headerShown: false }} />
      <MainStack.Screen name="FlashcardList" component={FlashcardList} options={{ headerShown: false }} />
      <MainStack.Screen name="AddFlashcard" component={AddFlashcard} options={{ headerShown: false }} />
      <MainStack.Screen name="AddCategory" component={AddCategory} options={{ headerShown: false }} />
      <MainStack.Screen name="Memorize" component={MemorizeScreen} options={{ headerShown: false }} />
      <MainStack.Screen name="AddGpt" component={AddGpt} options={{ headerShown: false }} />
      <MainStack.Screen name="SelectCategoryScreen" component={SelectCategoryScreen} options={{ headerShown: false }} />
      <MainStack.Screen name="CheckFlashcardScreen" component={CheckFlashcardScreen} options={{ headerShown: false }} />
    </MainStack.Navigator>
  );
};

export default MainStackNavigator;
