import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { addFlashcard } from '../FlashcardSlice';

const AddFlashcard = ({ navigation, route }) => {
  const [english, setEnglish] = useState('');
  const [spanish, setSpanish] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const dispatch = useDispatch();
  const { category, colorPair } = route.params;


  const handleAddFlashcard = async () => {
    const newFlashcardId = 'flashcard' + Math.floor(Math.random() * 10342341); // Genera un identificador único

    const newFlashcard = {
        id: newFlashcardId,
        imageUri,
        english,
        spanish,
        category,
    };

    try {
        // Envía la nueva flashcard a Firebase en tiempo real
        await axios.put(
            `https://flashcardgpt-default-rtdb.firebaseio.com/users/SpanishFlashcards/categories/${category}/flashcards/${newFlashcardId}.json`,
            newFlashcard
        );

        // Actualiza el estado local después de agregar la flashcard a Firebase
        dispatch(addFlashcard(newFlashcard));
        setEnglish('');
        setSpanish('');
        setImageUri(null);
        console.log('colorPair antes de navegar:', colorPair);
        navigation.navigate('FlashcardList', { category, colorPair });
        
    } catch (error) {
        console.error('Error al agregar flashcard a Firebase:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colorPair.background }]}>
      <TextInput
        placeholder="Inglés"
        value={english}
        onChangeText={setEnglish}
        style={[styles.input, { borderColor: colorPair.text }]}
        placeholderTextColor={colorPair.text}
      />
      <TextInput
        placeholder="Español"
        value={spanish}
        onChangeText={setSpanish}
        style={[styles.input, { borderColor: colorPair.text }]}
        placeholderTextColor={colorPair.text}
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: colorPair.text }]} onPress={handleAddFlashcard}>
        <Text style={styles.buttonText}>Agregar Flashcard</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    color: 'black',
  },
  button: {
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  }
});

export default AddFlashcard;