import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  FlatList,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { deleteCategory, fetchCategories,setCurrentUserUID } from '../FlashcardSlice';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import CategoryItem from '../components/CategoryItem';
import * as ImagePicker from 'expo-image-picker';
import { addImageToCategory } from '../FlashcardSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { selectDarkMode } from '../darkModeSlice';

const CategoriesScreen = ({ navigation }) => {
  const darkModeEnabled = useSelector(selectDarkMode);
  const categories = useSelector((state) => state.flashcards.categories);
  const dispatch = useDispatch();
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  const translateY = useSharedValue(1000);
  const [categoryToDisplay, setCategoryToDisplay] = useState('');
  const categoryBackgroundColor = useSharedValue('rgba(0,0,0,0.7)');
  const categoryTextColor = useSharedValue('white');
  const currentUserUID = useSelector(state => state.flashcards.currentUserUID);

  useEffect(() => {
    const loadCategories = async () => {
      // Intenta obtener el UID del usuario del almacenamiento local si no está en el estado de Redux
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

  //otrouseEffect para actualizar las categorias cuando se agrega una nueva
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchCategories());
    }, [dispatch])
  );

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

  const navigateToFlashcardList = (category, colorPair) => {
    animateCategoryDisplay(category.name, colorPair);
    setTimeout(() => {
      navigation.navigate('FlashcardList', { category: category.name, colorPair });
    }, 1200);
  };

  const navigateToAddCategory = () => {
    navigation.navigate('AddCategory');
  };

  const navigateToAddGPT = () => {
    navigation.navigate('AddGpt');
  };

  const categoryAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      position: 'absolute',
      top: 200,
      left: 20,
      right: 20,
    
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
      bottom: 30,
      borderColor: darkModeEnabled ? 'white' : 'black',
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: darkModeEnabled ? '#434753' : categoryBackgroundColor.value,
    };
  });

  const categoryTextStyle = useAnimatedStyle(() => {
    return {
      color: darkModeEnabled ? '#D3D3D3' : categoryTextColor.value,
      fontFamily: 'Pagebash',
      fontSize: 70,
      textAlign: 'center',
      
    };
  });

  const animateCategoryDisplay = (categoryName, colorPair) => {
    setCategoryToDisplay(categoryName);
    translateY.value = withSpring(0);
    categoryBackgroundColor.value = darkModeEnabled ? '#434753' : colorPair.background;
    categoryTextColor.value = darkModeEnabled ? '#D3D3D3' : colorPair.text;
    setTimeout(() => {
      translateY.value = withSpring(1000);
    }, 1200);
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

  const posX = useSharedValue(5);
  const posY = useSharedValue(5);
  const width = useSharedValue(50);
  const height = useSharedValue(50);

  const handleButtonPress = () => {
    setIsButtonPressed(!isButtonPressed);
    if (isButtonPressed) {
      posX.value = withSpring(5, { damping: 10, stiffness: 200 });
      posY.value = withSpring(5, { damping: 10, stiffness: 200 });
      width.value = withSpring(50, { damping: 10, stiffness: 200 });
      height.value = withSpring(50, { damping: 10, stiffness: 200 });
    } else {
      posX.value = withSpring(1, { damping: 10, stiffness: 200 });
      posY.value = withSpring(1, { damping: 10, stiffness: 200 });
      width.value = withSpring(210, { damping: 10, stiffness: 200 });
      height.value = withSpring(110, { damping: 10, stiffness: 200 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      
      left: posX.value,
      top: posY.value,
      width: width.value,
      height: height.value,
    };
  });

  const handleScreenPress = () => {
    if (isButtonPressed) handleButtonPress();
  };

  return (
    <TouchableWithoutFeedback onPress={handleScreenPress}>
      <View style={[styles.container, { backgroundColor: darkModeEnabled ? '#121212' : '#F5F5F5' }]}>
       
        <Text style={[styles.title, { color: darkModeEnabled ? '#D3D3D3' : 'black' }]}>Flashcards</Text>
        
        <FlatList
          data={categories}
          renderItem={({ item }) => (
            <CategoryItem
              category={item}
              onPress={navigateToFlashcardList}
              onDelete={handleDeleteCategory}
              onImagePick={handleImagePick}
              colorPair={item.colorPair}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          numColumns={1}
        />
        <View style={styles.buttonsContainer}>
          <Animated.View style={[styles.actionButtonContainer, animatedStyle]}>
            {isButtonPressed ? (
              <View style={styles.expandedButtonsContainer}>
                <TouchableOpacity
                  style={[styles.expandedButton, {
                    backgroundColor: darkModeEnabled ? '#121212' : '#fff',
                    borderWidth: 2,
                    borderColor: darkModeEnabled ? 'rgba(255, 255, 255, 0.5)' : 'white',
                  }]}
                  onPress={navigateToAddCategory}
                >
                  <AntDesign name="plus" size={24} color={darkModeEnabled ? 'white' : 'black'} />
                  <Text style={[styles.text, { color: darkModeEnabled ? '#D3D3D3' : 'black' }]}>Agregar Categoría</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.expandedButton, {
                    backgroundColor: darkModeEnabled ? '#121212' : '#fff',
                    borderWidth: 2,
                    borderColor: darkModeEnabled ? 'rgba(255, 255, 255, 0.5)' : 'white',
                  }]}
                  onPress={navigateToAddGPT}
                >
                  <MaterialCommunityIcons name="robot" size={24} color={darkModeEnabled ? 'white' : 'black'} />
                  <Text style={[styles.text, { color: darkModeEnabled ? '#D3D3D3' : 'black' }]}>Agregar Categoría Con IA</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableWithoutFeedback onPress={handleButtonPress}>
                <View style={[styles.actionButton, {
                  backgroundColor: darkModeEnabled ? '#121212' : '#fff',
                  borderWidth: 2,
                  borderColor: darkModeEnabled ? 'rgba(255, 255, 255, 0.5)' : 'white',
                }]}>
                  <AntDesign name="plus" size={24} color={darkModeEnabled ? 'white' : 'black'} />
                </View>
              </TouchableWithoutFeedback>
            )}
          </Animated.View>
        </View>
        <Animated.View style={categoryAnimatedStyle}>
          <Animated.Text style={[{ fontFamily: 'Pagebash' }, categoryTextStyle]}>
            {categoryToDisplay}
          </Animated.Text>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {

    flex: 1,
    paddingTop: 20,
    backgroundColor: 'white',
    
  },
  title: {
    fontFamily: 'Pagebash',
    fontSize: 30,
    margin: 20,
    textAlign: 'center',
  },
  listContainer: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  buttonsContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonContainer: {
    backgroundColor: 'transparent',
    borderRadius: 25,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {

    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginVertical: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: '#fff',
  },
  expandedButton: {

    width: '100%',
    height: '40%',
    borderRadius: 25,
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: '#fff',
  },
  expandedButtonsContainer: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: 200,
    height: 100,
  },
  text: {
    fontSize: 13,
    fontFamily: 'Pagebash',
  },
});

export default CategoriesScreen;