import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectFlashcardsByCategory, markFlashcardAsLearned } from '../redux/FlashcardSlice';
import { selectDarkMode } from '../redux/darkModeSlice';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

const MemorizeScreen = ({ route }) => {
  const { category, colorPair, currentIndex: initialIndex } = route.params;
  const flashcards = useSelector((state) => selectFlashcardsByCategory(state, category));
  const darkModeEnabled = useSelector(selectDarkMode);
  const dispatch = useDispatch();
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const [showEnglish, setShowEnglish] = useState(true);
  const [variantIndex, setVariantIndex] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const bannerOpacity = useRef(new Animated.Value(0)).current;
  const bannerTranslateX = useRef(new Animated.Value(0)).current;
  const learnedStatus = flashcards[currentIndex]?.isLearned;

  useEffect(() => {
    const configureAudio = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
    };
    configureAudio();
  }, []);

  const animateScale = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleLanguage = () => {
    animateScale();
    setShowEnglish(!showEnglish);
  };

  const animateFlashcardChange = (direction) => {
    Animated.sequence([
      Animated.timing(translateX, {
        toValue: direction === 'next' ? -100 : 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateVariantChange = () => {
    Animated.sequence([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    animateVariantChange();
  }, [variantIndex]);

  const handleVariantChange = (direction) => {
    const currentFlashcard = flashcards[currentIndex];
    const variants = [currentFlashcard.spanish, currentFlashcard.variant1, currentFlashcard.variant2, currentFlashcard.variant3].filter(Boolean);
    if (variants.length > 1) {
      if (direction === 'up') {
        setVariantIndex((variantIndex + 1) % variants.length);
      } else {
        setVariantIndex((variantIndex - 1 + variants.length) % variants.length);
      }
    }
  };

  const hasVariants = () => {
    const currentFlashcard = flashcards[currentIndex];
    return currentFlashcard.variant1 !== null;
  };

  const speak = (text, language) => {
    const options = { language };
    Speech.speak(text, options);
  };

  const handlePressSpeak = () => {
    const currentFlashcard = flashcards[currentIndex];
    const language = showEnglish ? 'en-US' : 'es-ES';
    const text = showEnglish ? currentFlashcard.english : getSpanishVariant();
    speak(text, language);
  };

  const nextFlashcard = () => {
    animateFlashcardChange('next');
    setCurrentIndex((currentIndex + 1) % flashcards.length);
    setShowEnglish(true);
  };

  const prevFlashcard = () => {
    animateFlashcardChange('prev');
    setCurrentIndex((currentIndex - 1 + flashcards.length) % flashcards.length);
    setShowEnglish(true);
  };

  const getSpanishVariant = () => {
    const currentFlashcard = flashcards[currentIndex];
    const variants = [currentFlashcard.spanish, currentFlashcard.variant1, currentFlashcard.variant2, currentFlashcard.variant3].filter(Boolean);
    return variants
    [variantIndex] || currentFlashcard.spanish;
  };

  useEffect(() => {
    Animated.timing(bannerOpacity, {
      toValue: learnedStatus ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
    Animated.timing(bannerTranslateX, {
      toValue: learnedStatus ? 0 : -100,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [learnedStatus]);

  const markAsLearnedHandler = () => {
    const currentFlashcard = flashcards[currentIndex];
    const newLearnedState = !currentFlashcard.isLearned;
    dispatch(markFlashcardAsLearned(currentFlashcard.id, category, newLearnedState));
  };


  const renderMarkLearnedIcon = () => {
    const currentFlashcard = flashcards[currentIndex];
    return currentFlashcard.isLearned ? "check" : "circle-o";
  };

  const renderBanner = () => {
    return (
      <View style={{
        position: 'absolute',
        bottom: 700,
        left: 0,
        right: 0,
        alignItems: 'center',
      }}>
        <Animated.View style={{
          width: 140,
          backgroundColor: showEnglish ? (darkModeEnabled ? '#121212' : colorPair.text) : (darkModeEnabled ? '#434753' : colorPair.background),
          padding: 10,
          opacity: bannerOpacity,
          transform: [{ translateX: bannerTranslateX }],
          borderRadius: 20, // Redondear las esquinas
        }}>
          <Text style={{ 
            textAlign: 'center', 
            fontSize: 20,
            color: showEnglish ? (darkModeEnabled ? '#D3D3D3' : colorPair.background) : (darkModeEnabled ? '#D3D3D3' : colorPair.text),
            fontFamily: 'Pagebash',
          }}>Learned</Text>
        </Animated.View>
        <View style={{
          position: 'absolute',
          bottom: -10, // Ajusta según sea necesario
          width: 20,
          height: 20,
          backgroundColor: 'yourBorderColor', // Color de fondo para coincidir con el borde
          transform: [{ rotate: '45deg' }], // Gira para crear el pico
        }}/>
      </View>
    );
  };
  

  return (
    <View style={[styles.container, { backgroundColor: darkModeEnabled ? '#121212' : 'gray' }]}>
      <TouchableOpacity onPress={toggleLanguage} style={[styles.flashcard, { backgroundColor: showEnglish ? (darkModeEnabled ? '#121212' : colorPair.background) : (darkModeEnabled ? '#434753' : colorPair.text) }]}>
        <Animated.Text style={[styles.text, { color: showEnglish ? (darkModeEnabled ? '#D3D3D3' : colorPair.text) : (darkModeEnabled ? '#D3D3D3' : colorPair.background), transform: [{ translateY }, { translateX }, { scale }] }]}>
          {showEnglish ? flashcards[currentIndex].english : getSpanishVariant()}
        </Animated.Text>
      </TouchableOpacity>
      {!showEnglish && hasVariants() && <View style={styles.variantButtons}>
        <TouchableOpacity onPress={() => handleVariantChange('down')}>
          <FontAwesome name="arrow-circle-down" size={40} color={darkModeEnabled ? '#D3D3D3' : colorPair.background} />
        </TouchableOpacity>
      </View>}
      <View style={styles.buttons}>
        <TouchableOpacity onPress={prevFlashcard}>
          <FontAwesome name="arrow-circle-left" size={40} color={showEnglish ? (darkModeEnabled ? '#D3D3D3' : colorPair.text) : (darkModeEnabled ? '#D3D3D3' : colorPair.background)} />
        </TouchableOpacity>
        <TouchableOpacity onPress={nextFlashcard}>
          <FontAwesome name="arrow-circle-right" size={40} color={showEnglish ? (darkModeEnabled ? '#D3D3D3' : colorPair.text) : (darkModeEnabled ? '#D3D3D3' : colorPair.background)} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handlePressSpeak} style={styles.speakButton}>
        <Ionicons name="volume-high" size={35} color={showEnglish ? (darkModeEnabled ? '#D3D3D3' : colorPair.text) : (darkModeEnabled ? '#D3D3D3' : colorPair.background)} />
      </TouchableOpacity>
      <TouchableOpacity onPress={markAsLearnedHandler} style={[styles.markLearnedButton, { backgroundColor: darkModeEnabled ? 'green' : 'transparent' }]}>
      <FontAwesome name={renderMarkLearnedIcon()} size={35} color={showEnglish ? (darkModeEnabled ? '#D3D3D3' : colorPair.text) : (darkModeEnabled ? '#D3D3D3' : colorPair.background )} />
      </TouchableOpacity>
      {renderBanner()}
    </View>
  );
};

const styles = StyleSheet.create

  ({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    flashcard: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      textAlign: 'center',
      fontSize: 60,
      fontFamily: 'Pagebash',
    },
    buttons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      position: 'absolute',
      bottom: 190,
    },
    speakButton: {
      position: 'absolute',
      bottom: 80,
      right: 20,
    },
    variantButtons: {
      flexDirection: 'column',
      position: 'absolute',
      bottom: 100,
    },
    markLearnedButton: {
      position: 'absolute',
      bottom: 10,
      right: 10,
      
      padding: 10,
      borderRadius: 40,
    },
  });

export default MemorizeScreen;

