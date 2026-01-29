import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Alert, StatusBar, StyleSheet, InteractionManager } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { deleteCategory, fetchCategories, addImageToCategory } from '../../../redux/FlashcardSlice'; 
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { selectDarkMode } from '../../../redux/darkModeSlice'; 
import CategoryList from './components/CategoryList';

const CategoriesScreen = ({ navigation }) => {
  const darkModeEnabled = useSelector(selectDarkMode);
  const categoriesBase = useSelector((state) => state.flashcards.categories);
  const currentUserUID = useSelector(state => state.flashcards.currentUserUID);
  const dispatch = useDispatch();
  
  const [recentCategories, setRecentCategories] = useState([]);
  const [hasInitialFetched, setHasInitialFetched] = useState(false);

  // useRef para evitar bloqueos y stale closures
  const recentCategoriesRef = useRef([]);

  // Memorizar las categorías para evitar cálculos extra
  const categories = useMemo(() => categoriesBase || [], [categoriesBase]);

  // 1. CARGA INICIAL (Solo una vez por sesión o cambio de usuario)
  useEffect(() => {
    if (currentUserUID && !hasInitialFetched) {
      dispatch(fetchCategories());
      loadRecentCategories();
      setHasInitialFetched(true);
    }
  }, [currentUserUID, hasInitialFetched, dispatch]);

  // 2. CARGA DE RECIENTES (Optimizada)
  const loadRecentCategories = useCallback(async () => {
    try {
      const recentData = await AsyncStorage.getItem('recentCategories');
      if (recentData) {
        const parsedData = JSON.parse(recentData);
        const validData = parsedData.filter(item => item && item.category && item.category.id);
        
        // Solo actualizar el estado si los datos realmente cambiaron
        // Esto evita renders innecesarios
        setRecentCategories(prev => {
          if (JSON.stringify(prev) === JSON.stringify(validData)) return prev;
          return validData;
        });
        recentCategoriesRef.current = validData;
      }
    } catch (error) {
      console.error('Error loading recent categories:', error);
    }
  }, []);

  // Recargar solo cuando vuelve el foco, pero diferido para no trabar la animación
  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        loadRecentCategories();
      });
      return () => task.cancel();
    }, [loadRecentCategories])
  );

  const handleDeleteCategory = useCallback((categoryId) => {
    dispatch(deleteCategory(categoryId));
  }, [dispatch]);

  const navigateToFlashcardList = useCallback((category, colorPair, imageUri) => {
    // 1. Navegación instantánea
    navigation.navigate('FlashcardList', { 
      category: category.name, 
      colorPair, 
      imageUri 
    });
    
    // 2. Lógica recordatorio en background SIN bloquear
    InteractionManager.runAfterInteractions(async () => {
      if (category && category.id) {
        let updated = [...recentCategoriesRef.current];
        updated = updated.filter(item => item?.category?.id !== category.id);
        updated.unshift({ category, colorPair, imageUri });
        if (updated.length > 4) updated.pop();
        
        setRecentCategories(updated);
        recentCategoriesRef.current = updated;
        await AsyncStorage.setItem('recentCategories', JSON.stringify(updated)).catch(() => {});
      }
    });
  }, [navigation]);

  const navigateToAddCategory = useCallback(() => navigation.navigate('AddCategory'), [navigation]);
  const navigateToAddGPT = useCallback(() => navigation.navigate('AddGpt'), [navigation]);

  const handleImagePick = useCallback(async (categoryId) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      dispatch(addImageToCategory({ categoryId, imageUri: result.uri }));
    }
  }, [dispatch]);

  // Fondo dinámico
  const backgroundColor = darkModeEnabled ? '#0D0D0E' : '#F5F5F7';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar 
        backgroundColor={backgroundColor} 
        barStyle={darkModeEnabled ? 'light-content' : 'dark-content'} 
        translucent={true}
      />
      
      <CategoryList
        categories={categories}
        navigateToFlashcardList={navigateToFlashcardList}
        handleDeleteCategory={handleDeleteCategory}
        handleImagePick={handleImagePick}
        darkModeEnabled={darkModeEnabled}
        recentCategories={recentCategories}
        navigateToAddCategory={navigateToAddCategory}
        navigateToAddGPT={navigateToAddGPT}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CategoriesScreen;