import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { selectFlashcardsByCategory } from '../FlashcardSlice';
import { selectDarkMode } from '../darkModeSlice'; // Importar selectDarkMode desde darkModeSlice

const MemorizeScreen = ({ route }) => {
  const { category, colorPair } = route.params;
  const flashcards = useSelector((state) => selectFlashcardsByCategory(state, category));
  const darkModeEnabled = useSelector(selectDarkMode); // Usar el selector para el modo oscuro
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
    <View style={[styles.container, { backgroundColor: darkModeEnabled ? '#121212' : 'lightgray' }]}> 
      <TouchableOpacity 
        onPress={handlePress} 
        style={[
          styles.flashcard, 
          { backgroundColor: showEnglish ? (darkModeEnabled ? '#121212' : colorPair.background) : (darkModeEnabled ? '#434753' : colorPair.text) } 
        ]}
      >
        <Text style={[
          styles.text, 
          { color: showEnglish ? (darkModeEnabled ? '#D3D3D3' : colorPair.text) : (darkModeEnabled ? '#D3D3D3' : colorPair.background) } 
        ]}>
          {showEnglish ? flashcards[currentIndex].english : flashcards[currentIndex].spanish}
        </Text>
      </TouchableOpacity>
      <View style={styles.buttons}>
        <TouchableOpacity onPress={prevFlashcard}>
          <Text style={[styles.buttonText, { color: darkModeEnabled ? '#D3D3D3' : 'black' }]}>Anterior</Text> 
        </TouchableOpacity>
        <TouchableOpacity onPress={nextFlashcard}>
          <Text style={[styles.buttonText, { color: darkModeEnabled ? '#D3D3D3' : 'black' }]}>Siguiente</Text> 
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
    // backgroundColor se define dinámicamente en el componente
  },
  flashcard: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor se define dinámicamente en el componente
  },
  text: {
    fontSize: 74,
    fontFamily: 'Pagebash',
    // color se define dinámicamente en el componente
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
    // color se define dinámicamente en el componente
  },
});

export default MemorizeScreen;
