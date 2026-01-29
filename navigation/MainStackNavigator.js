import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { selectDarkMode } from '../redux/darkModeSlice';
import TabNavigator from './TabNavigator';
import FlashcardList from '../Screens/Flashcards/CategoriesScreen/FlashcardList/FlashcardList';
import AddFlashcard from '../Screens/Flashcards/CategoriesScreen/FlashcardList/components/AddFlashcard';
import AddCategory from '../Screens/Flashcards/CategoriesScreen/components/AddCategory'
import VocabularyExercisesScreen from '../Screens/Flashcards/CategoriesScreen/FlashcardList/VocabExercises/VocabularyExercisesScreen/VocabularyExercisesScreen';
import QuickReviewScreen from '../Screens/Flashcards/CategoriesScreen/FlashcardList/VocabExercises/QuickReviewScreen';
import AddGpt from '../Screens/Flashcards/CategoriesScreen/components/AddGpt/AddGpt';
import MemorizeScreen from '../Screens/Flashcards/CategoriesScreen/FlashcardList/MemorizeScreen/MemorizeScreen';
import ModuleScreen from '../Screens/Learn/modules/ModuleScreen';
import SubSectionScreen from '../Screens/Learn/modules/SubSectionScreen';

const MainStack = createStackNavigator();

const MainStackNavigator = () => {
  const darkModeEnabled = useSelector(selectDarkMode);
  const backgroundColor = darkModeEnabled ? '#0D0D0E' : '#F5F5F7';

  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor },
        gestureEnabled: true,
        cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        transitionSpec: {
          open: { animation: 'timing', config: { duration: 200 } },
          close: { animation: 'timing', config: { duration: 200 } },
        },
      }}
    >
      <MainStack.Screen name="TabNavigator" component={TabNavigator} options={{ headerShown: false }} />
      <MainStack.Screen name="VocabularyExercises" component={VocabularyExercisesScreen} options={{ headerShown: false }} />
      <MainStack.Screen name="QuickReview" component={QuickReviewScreen} options={{ headerShown: false }} />
      <MainStack.Screen name="FlashcardList" component={FlashcardList} options={{ headerShown: false }} />
      <MainStack.Screen name="AddFlashcard" component={AddFlashcard} options={{ headerShown: false }} />
      <MainStack.Screen name="AddCategory" component={AddCategory} options={{ headerShown: false }} />
      <MainStack.Screen name="Memorize" component={MemorizeScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <MainStack.Screen name="AddGpt" component={AddGpt} options={{ headerShown: false }} />
      <MainStack.Screen name="ModuleScreen" component={ModuleScreen} options={{ headerShown: false }} />
      <MainStack.Screen name="SubsectionScreen" component={SubSectionScreen} options={{ headerShown: false }} />
    </MainStack.Navigator>
  );
};

export default MainStackNavigator;
