import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectCategories, fetchCategories } from '../FlashcardSlice';
import { Picker } from '@react-native-picker/picker';
import { selectDarkMode } from '../darkModeSlice';

export default function SelectCategoryScreen({ navigation }) {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const darkModeEnabled = useSelector(selectDarkMode);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || null);

  const darkModeColors = {
    background: '#121212',
    text: '#f4f1de',
    button: '#3d405b',
    buttonText: '#FFF3E0',
  };

  const containerStyle = {
    ...styles.container,
    backgroundColor: darkModeEnabled ? darkModeColors.background : '#f4f1de',
  };

  const titleStyle = {
    ...styles.title,
    color: darkModeEnabled ? darkModeColors.text : '#43291f',
  };

  const buttonStyle = {
    ...styles.button,
    backgroundColor: darkModeEnabled ? darkModeColors.button : '#e07a5f',
  };

  const textStyle = {
    ...styles.buttonText,
    color: darkModeEnabled ? darkModeColors.buttonText : '#FFF3E0',
  };

  const pickerStyle = {
    ...styles.picker,
    
    backgroundColor: darkModeEnabled ? darkModeColors.button : '#e07a5f',
    color: darkModeEnabled ? darkModeColors.text : '#43291f',
  };

  return (
    <SafeAreaView style={containerStyle}>
      <Text style={titleStyle}>¡Elige una categoría para practicar flashcards!</Text>
      <Picker
        style={pickerStyle}
        selectedValue={selectedCategory}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
        
      >
        {categories.map((category) => (
          <Picker.Item
            style={pickerStyle}
            key={category.id.toString()}
            label={category.name}
            value={category.name}
          />
        ))}
      </Picker>
      <TouchableOpacity
        style={buttonStyle}
        onPress={() => {
          if (selectedCategory) {
            navigation.navigate('CheckFlashcardScreen', {
              category: selectedCategory,
            });
          } else {
            alert('Por favor selecciona una categoría.');
          }
        }}
      >
        <Text style={textStyle}>Comenzar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 20,
  },
  picker: {
    width: '80%',
    height: 50,
  },
  button: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
  },
});
