import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import FlashcardList from '../Screens/Flashcards/CategoriesScreen/FlashcardList/FlashcardList';
import AddFlashcard from '../Screens/Flashcards/CategoriesScreen/FlashcardList/components/AddFlashcard';
import AddCategory from '../Screens/Flashcards/CategoriesScreen/components/AddCategory'
import VocabularyExercisesScreen from '../Screens/Flashcards/CategoriesScreen/FlashcardList/VocabExercises/VocabularyExercisesScreen/VocabularyExercisesScreen';
import AddGpt from '../Screens/Flashcards/CategoriesScreen/components/AddGpt/AddGpt';
import MemorizeScreen from '../Screens/Flashcards/CategoriesScreen/FlashcardList/MemorizeScreen/MemorizeScreen';
import ModuleScreen from '../Screens/Learn/modules/ModuleScreen';
import SubSectionScreen from '../Screens/Learn/modules/SubSectionScreen';

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
      <MainStack.Screen name="ModuleScreen" component={ModuleScreen} options={{ headerShown: false }} />
      <MainStack.Screen name="SubsectionScreen" component={SubSectionScreen} options={{ headerShown: false }} />
    </MainStack.Navigator>
  );
};

export default MainStackNavigator;
