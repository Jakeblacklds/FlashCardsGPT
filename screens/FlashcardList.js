import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFlashcardsByCategory, selectFlashcardsByCategory, deleteFlashcard } from '../FlashcardSlice';
import axios from 'axios';

const FlashcardList = ({ navigation, route }) => {
  const { category, colorPair } = route.params;
  const flashcards = useSelector((state) => selectFlashcardsByCategory(state, category));
  const dispatch = useDispatch();

  if (!colorPair) {
    console.error('colorPair is undefined in FlashcardList');
    
}

  const handleMemorizePress = () => {
    navigation.navigate('Memorize', { category, colorPair });
  };

  const handleAddFlashcardPress = () => {
    navigation.navigate('AddFlashcard', { category, colorPair });
  };

  const handleDeleteFlashcard = async (flashcardId) => {
    dispatch(deleteFlashcard(flashcardId));

    try {
      await axios.delete(`https://flashcardgpt-default-rtdb.firebaseio.com/users/SpanishFlashcards/categories/${category}/flashcards/${flashcardId}.json`);
    } catch (error) {
      console.error('Error al eliminar flashcard de Firebase:', error);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.flashcard, { backgroundColor: colorPair.text }]}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => handleDeleteFlashcard(item.id)}
        >
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
        <Text style={[styles.english, { color: colorPair.background }]}>{item.english}</Text>
        <Text style={[styles.spanish, { color: colorPair.background }]}>{item.spanish}</Text>
      </View>
    );
  };

  useEffect(() => {
    console.log('Efecto ejecutado');
    const user_id = "SpanishFlashcards";  // Este es un valor constante, pero en realidad deberías obtenerlo de algún lugar.
    dispatch(fetchFlashcardsByCategory(user_id, category));
  }, [category]);

  return (
    <View style={[styles.container, { backgroundColor: colorPair.background }]}>
      <Text style={[styles.title, { color: colorPair.text }]}>Flashcards de {category}</Text>
      <FlatList
        data={flashcards}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        extraData={flashcards}
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: 'gray', borderWidth: 2, borderColor: 'white' }]}
        onPress={handleMemorizePress}
      >
        <Text style={[styles.buttonText, { color: 'white' }]}>Memorizar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: 'white', borderWidth: 2, borderColor: 'black' }]}
        onPress={handleAddFlashcardPress}
      >
        <Text style={[styles.buttonText, { color: 'black' }]}>Agregar Flashcard</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 10,
  },
  flashcard: {
    width: 300,
    height: 100,
    borderRadius: 10,
    margin: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spanish: {
    fontSize: 18,
    fontFamily: 'Pagebash',
  },
  english: {
    fontFamily: 'Pagebash',
    fontSize: 30,
    
  },
  button: {
    width: 200,
    height: 50,
    borderRadius: 25,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Pagebash',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

});

export default FlashcardList;
