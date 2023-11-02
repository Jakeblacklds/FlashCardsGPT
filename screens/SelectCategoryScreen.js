import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectCategories } from '../FlashcardSlice';
import { Picker } from '@react-native-picker/picker';
import { fetchCategories } from '../FlashcardSlice';

const colors = {
  pair1: { background: '#f4f1de', text: '#43291f' },
  pair2: { background: '#e07a5f', text: '#FFF3E0' },
  pair3: { background: '#3d405b', text: '#E0FFF4' },
  pair4: { background: '#81b29a', text: '#003112' },
  pair5: { background: '#f2cc8f', text: '#143100' },
};

export default function SelectCategoryScreen({ navigation }) {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const [selectedCategory, setSelectedCategory] = React.useState(
    categories[0]?.name || null
  );

  const selectedColor = colors.pair2; // Cambia el par de colores según tu preferencia

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: selectedColor.background }]}>
      <Text style={[styles.title, { color: selectedColor.text }]}>¡Elige una categoría para practicar flashcards!</Text>

      <Picker
        style={styles.picker}
        selectedValue={selectedCategory}
        onValueChange={(itemValue) => {
          setSelectedCategory(itemValue);
        }}
      >
        {categories &&
          categories.map((category) => (
            <Picker.Item
              key={category.id.toString()}
              label={category.name}
              value={category.name}
            />
          ))}
      </Picker>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: selectedColor.text }]}
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
        <Text style={[styles.buttonText, { color: selectedColor.background }]}>Comenzar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  picker: {
    width: '100%',
    height: 50,
    borderWidth: 2,
    borderColor: 'white',
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Fondo semitransparente
    color: 'white', // Color de texto
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    elevation: 2, // Sombra para un efecto elevado
  },
  buttonText: {
    fontSize: 20,
    textAlign: 'center',
  },
});
