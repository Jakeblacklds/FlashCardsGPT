import React, { useState, useEffect } from 'react';
import { View, TouchableWithoutFeedback, Text, Alert, StatusBar } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { deleteCategory, fetchCategories, setCurrentUserUID, addImageToCategory } from '../../redux/FlashcardSlice';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './CategoriesScreen.styles';
import { selectDarkMode } from '../../redux/darkModeSlice';
import CategoryList from '../../components/CategoryList';
import AddButton from '../../components/AddButton';
import CategoryDisplay from '../../components/CategoryDisplay';
import LottieView from 'lottie-react-native';

const CategoriesScreen = ({ navigation }) => {
  const darkModeEnabled = useSelector(selectDarkMode);
  const categories = useSelector((state) => state.flashcards.categories);
  const currentUserUID = useSelector(state => state.flashcards.currentUserUID);
  const dispatch = useDispatch();
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [categoryToDisplay, setCategoryToDisplay] = useState('');
  const [categoryImageUri, setCategoryImageUri] = useState(null);
  const [selectedColorPair, setSelectedColorPair] = useState(null);


  useEffect(() => {
    const loadCategories = async () => {
      if (!currentUserUID) {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const { uid } = JSON.parse(storedUser);
          dispatch(setCurrentUserUID(uid));
        }
      }
      dispatch(fetchCategories());
    };
    loadCategories();
  }, [dispatch, currentUserUID]);

  const handleDeleteCategory = (categoryId) => {
    Alert.alert(
      "Eliminar Categoría",
      "¿Estás seguro de que quieres eliminar esta categoría?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", onPress: () => dispatch(deleteCategory(categoryId)) }
      ]
    );
  };

  const navigateToFlashcardList = (category, colorPair, imageUri) => {
    // Resetear el estado antes de establecer el nuevo valor
    setCategoryToDisplay('');
    setCategoryImageUri(null);
    setSelectedColorPair(null);
  
    // Usar un breve retraso para permitir que el estado se resetee antes de establecer el nuevo valor
    setTimeout(() => {
      setCategoryToDisplay(category.name);
      setCategoryImageUri(imageUri);
      setSelectedColorPair(colorPair);
    }, 10); // Un retraso muy corto
  
    // Navegar a FlashcardList después de un retraso para que la animación se complete
    setTimeout(() => {
      navigation.navigate('FlashcardList', { category: category.name, colorPair, imageUri });
    }, 1700);
  };

  const navigateToAddCategory = () => {
    navigation.navigate('AddCategory');
  };

  const navigateToAddGPT = () => {
    navigation.navigate('AddGpt');
  };

  const handleImagePick = async (categoryId) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [6, 8],
      quality: 1,
    });
    if (!result.canceled) {
      dispatch(addImageToCategory({ categoryId, imageUri: result.uri }));
    }
  };

  const handleButtonPress = () => {
    setIsButtonPressed(!isButtonPressed);
  };

  const handleScreenPress = () => {
    if (isButtonPressed) handleButtonPress();
  };


  return (
    <TouchableWithoutFeedback onPress={handleScreenPress}>

      
      <View style={[styles.container, { backgroundColor: darkModeEnabled ? '#121212' : '#F5F5F5' }]}>
        <StatusBar backgroundColor={darkModeEnabled ? '#121212' : '#3f37c9'} barStyle={darkModeEnabled ? 'light-content' : 'light-content'} />

        <CategoryList
          categories={categories}
          navigateToFlashcardList={navigateToFlashcardList}
          handleDeleteCategory={handleDeleteCategory}
          handleImagePick={handleImagePick}
          
        />
        <View style={styles.actionButtonPosition}>
          <AddButton
            isButtonPressed={isButtonPressed}
            handleButtonPress={handleButtonPress}
            navigateToAddCategory={navigateToAddCategory}
            navigateToAddGPT={navigateToAddGPT}
            darkModeEnabled={darkModeEnabled}
          />
        </View>
        <CategoryDisplay
          categoryToDisplay={categoryToDisplay}
          categoryImageUri={categoryImageUri}
          darkModeEnabled={darkModeEnabled}
          colorPair={selectedColorPair}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CategoriesScreen;
