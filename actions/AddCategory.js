
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import { selectDarkMode } from '../darkModeSlice';
import { useSelector } from 'react-redux';

const AddCategory = ({ navigation }) => {
  const [category, setCategory] = useState('');
  const [flashcards, setFlashcards] = useState([{ english: '', spanish: '' }]);
  const darkModeEnabled = useSelector(selectDarkMode);
  const currentUserUID = useSelector(state => state.flashcards.currentUserUID); // Obtén el UID del usuario actual


  const handleAddCategory = async () => {
    try {
      // Verifica que la categoría no esté vacía
      if (!category) {
        alert('Por favor, ingrese un nombre de categoría.');
        return;
      }
  
      // Verifica que el UID del usuario esté disponible
      if (!currentUserUID) {
        console.error('UID de usuario no disponible');
        return;
      }
  
      const flashcardsObject = flashcards.reduce((obj, item, index) => {
        obj[`flashcard${index + 1}`] = item;
        return obj;
      }, {});
  
      // Modifica la URL para incluir el UID del usuario y el nombre de la categoría
      const url = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories/${encodeURIComponent(category)}.json`;
  
      await axios.put(url, {
        name: category,
        flashcards: flashcardsObject
      });
  
      alert('¡Lista Creada!');
      navigation.navigate('Flashcards');
  
    } catch (error) {
      console.error('Error al agregar categoría y flashcards a Firebase:', error);
    }
  };
  

  const handleAddFlashcard = () => {
    setFlashcards([...flashcards, { english: '', spanish: '' }]);
  };

  const handleFlashcardChange = (index, field, value) => {
    const newFlashcards = [...flashcards];
    newFlashcards[index][field] = value;
    setFlashcards(newFlashcards);
  };

  return (
    <View style={[styles.container, darkModeEnabled ? styles.containerDark : {}]}>
      <TextInput
        style={[styles.inputCategory, darkModeEnabled ? styles.inputDark : {}]}
        placeholder="Nombre de la categoría"
        placeholderTextColor={darkModeEnabled ? "#D3D3D3" : "#333"} // Cambia el color del placeholder también
        value={category}
        onChangeText={(text) => setCategory(text)}
      />

      <FlatList
        data={flashcards}
        renderItem={({ item, index }) => (
          <View>
            <Text style={[styles.flashcardTitle, darkModeEnabled ? styles.textDark : {}]}>
              Flashcard {index + 1}
            </Text>
            <TextInput
              style={[styles.flashcardInput, darkModeEnabled ? styles.inputDark : {}]}
              placeholder="Inglés"
              placeholderTextColor={darkModeEnabled ? "#D3D3D3" : "#333"} // Cambia el color del placeholder también
              value={item.english}
              onChangeText={(text) => handleFlashcardChange(index, 'english', text)}
            />
            <TextInput
              style={[styles.flashcardInput, darkModeEnabled ? styles.inputDark : {}]}
              placeholder="Español"
              placeholderTextColor={darkModeEnabled ? "#D3D3D3" : "#333"} // Cambia el color del placeholder también
              value={item.spanish}
              onChangeText={(text) => handleFlashcardChange(index, 'spanish', text)}
            />
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        ListFooterComponent={
          <TouchableOpacity style={styles.addButton} onPress={handleAddFlashcard}>
            <Text style={styles.buttonText}>Agregar Flashcard</Text>
          </TouchableOpacity>
        }
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
        <Text style={styles.buttonText}>Agregar Categoría</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  containerDark: {
    backgroundColor: '#121212', // Cambiar según tu paleta de colores para el modo oscuro
  },
  inputDark: {
    borderColor: '#757575', // Color del borde para el modo oscuro
    color: 'white', 
    // Color del texto para el modo oscuro
  },
  textDark: {
    color: '#D3D3D3', // Color del texto para el modo oscuro
  },
  flashcardTitle: {
    fontFamily: 'Pagebash',
    padding: 5,
    marginVertical: 5,
    fontSize: 20, // Tamaño del texto del título

    color: '#333', // Color del texto del título
    textAlign: 'center', // Alineación del texto
  },
  container: {

    flex: 1,
    paddingTop: 80,
    padding: 16,
    backgroundColor: '#ECDBFA', // Color de fondo de tu paleta
  },
  inputCategory: {
    fontFamily: 'Pagebash',
    padding: 10,
    marginVertical: 10,
    borderColor: '#7209b7',
    borderWidth: 4,
    borderRadius: 10,
  },
  input: {
    textAlign: 'center',
    padding: 10,
    marginVertical: 10,
    
    borderWidth: 1,
    borderRadius: 10,
  },
  flashcardInput: {
    fontFamily: 'Pagebash',
    padding: 10,
    marginVertical: 5,
    borderColor: '#2E294E ',
    borderWidth: 1,
    borderRadius: 10,
  },
  addButton: {

    backgroundColor: '#7209b7', // Color de fondo del botón de tu paleta
    padding: 10,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    fontFamily: 'Pagebash',
    color: '#FFF3E0', // Color del texto del botón de tu paleta

  },
});

export default AddCategory;