
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text, StyleSheet } from 'react-native';
import axios from 'axios';

const AddCategory = ({ navigation }) => {
  const [category, setCategory] = useState('');
  const [flashcards, setFlashcards] = useState([{ english: '', spanish: '' }]);

  const handleAddCategory = async () => {
    try {
      // Verifica que la categoría no esté vacía
      if (!category) {
        alert('Por favor, ingrese un nombre de categoría.');
        return;
      }
  
      const flashcardsObject = flashcards.reduce((obj, item, index) => {
        obj[`flashcard${index + 1}`] = item;
        return obj;
      }, {});
  
      // Modifica la URL para incluir el nombre de la categoría
      const url = `https://flashcardgpt-default-rtdb.firebaseio.com/users/SpanishFlashcards/categories/${encodeURIComponent(category)}.json`;
  
      await axios.put(url, {
        name: category,
        flashcards: flashcardsObject
      });
  
      alert('¡Lista Creada!');
      navigation.navigate('Categorías');
  
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
    <View style={styles.container}>
      <TextInput
        style={styles.inputCategory}
        placeholder="Nombre de la categoría"
        value={category}
        onChangeText={(text) => setCategory(text)}
      />

      <FlatList
        data={flashcards}
        renderItem={({ item, index }) => (
          <View>
            <TextInput
              style={styles.flashcardInput}
              placeholder="Inglés"
              value={item.english}
              onChangeText={(text) => handleFlashcardChange(index, 'english', text)}
            />
            <TextInput
              style={styles.flashcardInput}
              placeholder="Español"
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
  container: {
    
    flex: 1,
    paddingTop: 80,
    padding: 16,
    backgroundColor: '#f4f1de', // Color de fondo de tu paleta
  },
  inputCategory: {
    fontFamily: 'Pagebash',
    padding: 10,
    marginVertical: 10,
    borderColor: '#FFD29D',
    borderWidth: 4,
    borderRadius: 10,
  },
    input: {
    
    padding: 10,
    marginVertical: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
  },
  flashcardInput: {
    fontFamily: 'Pagebash',
    padding: 10,
    marginVertical: 5,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
  },
  addButton: {
    
    backgroundColor: '#e07a5f', // Color de fondo del botón de tu paleta
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