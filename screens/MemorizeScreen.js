// MemorizeScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { selectFlashcardsByCategory } from '../FlashcardSlice';

const MemorizeScreen = ({ route }) => {
  const { category, colorPair } = route.params;
  const flashcards = useSelector((state) => selectFlashcardsByCategory(state, category));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEnglish, setShowEnglish] = useState(true);

  const handlePress = () => {
    setShowEnglish(!showEnglish);
  };

  const nextFlashcard = () => {
    setCurrentIndex((currentIndex + 1) % flashcards.length);
    setShowEnglish(true);
  };

  const prevFlashcard = () => {
    setCurrentIndex((currentIndex - 1 + flashcards.length) % flashcards.length);
    setShowEnglish(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={handlePress} 
        style={[
          styles.flashcard, 
          { backgroundColor: showEnglish ? colorPair.background : colorPair.text }
        ]}
      >
        <Text style={[
          styles.text, 
          { color: showEnglish ? colorPair.text : colorPair.background }
        ]}>
          {showEnglish ? flashcards[currentIndex].english : flashcards[currentIndex].spanish}
        </Text>
      </TouchableOpacity>
      <View style={styles.buttons}>
        <TouchableOpacity onPress={prevFlashcard}>
          <Text style={styles.buttonText}>Anterior</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={nextFlashcard}>
          <Text style={styles.buttonText}>Siguiente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightgray',
  },
  flashcard: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 74,
    fontFamily: 'Pagebash',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    position: 'absolute',
    bottom: 50,
  },
  buttonText: {
    fontSize: 20,
  },
});

export default MemorizeScreen;
