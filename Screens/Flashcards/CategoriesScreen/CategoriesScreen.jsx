import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableWithoutFeedback, Alert, StatusBar } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { deleteCategory, fetchCategories, addImageToCategory } from '../../../redux/FlashcardSlice'; 
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './CategoriesScreen.styles';
import { selectDarkMode } from '../../../redux/darkModeSlice'; 
import CategoryList from './components/CategoryList';

const CategoriesScreen = ({ navigation }) => {
  const darkModeEnabled = useSelector(selectDarkMode);
  const categories = useSelector((state) => state.flashcards.categories);
  const currentUserUID = useSelector(state => state.flashcards.currentUserUID);
  const dispatch = useDispatch();
  const [recentCategories, setRecentCategories] = useState([]);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    // SOLO hace fetch si hay UID y aún no ha hecho fetch, nunca en loop.
    if (currentUserUID && !hasFetched) {
      dispatch(fetchCategories());
      loadRecentCategories();
      setHasFetched(true);
    }
    // Si el UID cambia por logout/login, resetea la bandera
    if (!currentUserUID && hasFetched) {
      setHasFetched(false);
    }
  }, [currentUserUID, hasFetched]);

  const loadRecentCategories = useCallback(async () => {
    const recentData = await AsyncStorage.getItem('recentCategories');
    if (recentData) {
      const parsedData = JSON.parse(recentData);
      setRecentCategories(parsedData.filter(item => item && item.category && item.category.id));
    } else {
      setRecentCategories([]);
    }
  }, []);

  const handleDeleteCategory = useCallback((categoryId) => {
    Alert.alert(
      "Eliminar Categoría",
      "¿Estás seguro de que quieres eliminar esta categoría?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", onPress: () => dispatch(deleteCategory(categoryId)) }
      ]
    );
  }, [dispatch]);

  const navigateToFlashcardList = useCallback(async (category, colorPair, imageUri) => {
    try {
      navigation.navigate('FlashcardList', { category: category.name, colorPair, imageUri });

      let updatedRecentCategories = [...recentCategories];
      if (category && category.id) {
        updatedRecentCategories = updatedRecentCategories.filter(item => item && item.category && item.category.id !== category.id);
        updatedRecentCategories.unshift({ category, colorPair, imageUri });

        if (updatedRecentCategories.length > 4) {
          updatedRecentCategories.pop();
        }

        setRecentCategories(updatedRecentCategories);
        await AsyncStorage.setItem('recentCategories', JSON.stringify(updatedRecentCategories));
      }
    } catch (error) {
      console.error('Error updating recent categories:', error);
    }
  }, [navigation, recentCategories]);

  const navigateToAddCategory = useCallback(() => {
    navigation.navigate('AddCategory');
  }, [navigation]);

  const navigateToAddGPT = useCallback(() => {
    navigation.navigate('AddGpt');
  }, [navigation]);

  const handleImagePick = useCallback(async (categoryId) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [6, 8],
      quality: 1,
    });
    if (!result.canceled) {
      dispatch(addImageToCategory({ categoryId, imageUri: result.uri }));
    }
  }, [dispatch]);

  return (
    <TouchableWithoutFeedback>
      <View style={[styles.container, { backgroundColor: darkModeEnabled ? '#121212' : '#F5F5F5' }]}>
      <StatusBar backgroundColor={darkModeEnabled ? '#121212' : '#3f37c9'} barStyle={darkModeEnabled ? 'light-content' : 'dark-content'} />        
      <CategoryList
          categories={categories}
          navigateToFlashcardList={navigateToFlashcardList}
          handleDeleteCategory={handleDeleteCategory}
          handleImagePick={handleImagePick}
          darkModeEnabled={darkModeEnabled}
          navigation={navigation}
          recentCategories={recentCategories}
          navigateToAddCategory={navigateToAddCategory}
          navigateToAddGPT={navigateToAddGPT}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CategoriesScreen;
