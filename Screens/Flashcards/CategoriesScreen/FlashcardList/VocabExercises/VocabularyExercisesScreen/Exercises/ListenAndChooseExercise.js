import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import LottieView from 'lottie-react-native';
import { useSelector } from 'react-redux';

import { selectDarkMode } from '../../../../../../../redux/darkModeSlice'; 

const ListenAndChooseExercise = ({ word, onComplete, onMistake, flashcards, colorPair }) => {
  const [options, setOptions] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const soundAnimationRef = useRef(null);
  const correctAnimationRef = useRef(null);
  const congratsAnimationRef = useRef(null);
  const animationDuration = 800; // Duración de la animación en milisegundos
  const darkModeEnabled = useSelector(selectDarkMode);

  useEffect(() => {
    const correctOption = word.english;
    let incorrectOptions = flashcards
      .filter(fc => fc.id !== word.id)
      .map(fc => fc.english)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    const optionsArray = [...incorrectOptions, correctOption];
    setOptions(optionsArray.sort(() => Math.random() - 0.5));
    setIsCorrect(null);
    setSelectedOption(null);
  }, [word]);

  const speak = () => {
    Speech.speak(word.spanish, { language: 'es-ES' });
    if (soundAnimationRef.current) {
      soundAnimationRef.current.play(0);
    }
  };

  const checkAnswer = (option) => {
    setSelectedOption(option);
    const isAnswerCorrect = option === word.english;
    setIsCorrect(isAnswerCorrect);
    
    setTimeout(() => {
      if (isAnswerCorrect) {
        if (correctAnimationRef.current && congratsAnimationRef.current) {
          correctAnimationRef.current.play();
          congratsAnimationRef.current.play();
        }
        onComplete();
      } else {
        onMistake();
      }
    }, 1300);
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: darkModeEnabled ? colorPair.background : colorPair.text,
      width: '100%',
      height: '100%',
      position: 'relative',
    },
    option: {
      backgroundColor: darkModeEnabled ? colorPair.background : colorPair.background,
      borderColor: darkModeEnabled ? colorPair.background : colorPair.text,
    },
    optionText: {
      color: darkModeEnabled ? colorPair.text : colorPair.text,
    },
    darkModeOverlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      
    },
    darkModeOverlayButton: {
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius:15,
    },
  });

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {darkModeEnabled && <View style={dynamicStyles.darkModeOverlay} />}
      <View style={styles.optionsRow}>
      
        {options.slice(0, 2).map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              dynamicStyles.option,
              selectedOption === option && (isCorrect ? styles.correctOption : styles.incorrectOption),
            ]}
            onPress={() => checkAnswer(option)}
            disabled={isCorrect !== null}
          >
            {darkModeEnabled && <View style={dynamicStyles.darkModeOverlayButton} />}
            <Text style={[styles.optionText, dynamicStyles.optionText]}>{option}</Text>
            {selectedOption === option && isCorrect && (
              <>
                <LottieView
                  ref={correctAnimationRef}
                  source={require('../../../../../../../assets/correct.json')}
                  autoPlay={true}
                  loop={false}
                  style={styles.animation}
                />
                <LottieView
                  ref={congratsAnimationRef}
                  source={require('../../../../../../../assets/congrats.json')}
                  autoPlay={true}
                  loop={false}
                  style={styles.animation}
                />
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={speak} style={styles.speakerButton}>
        <LottieView
          ref={soundAnimationRef}
          source={require('../../../../../../../assets/sound.json')}
          loop={false}
          style={styles.speakerAnimation}
        />
      </TouchableOpacity>
      <View style={styles.optionsRow}>
        {options.slice(2).map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              dynamicStyles.option,
              selectedOption === option && (isCorrect ? styles.correctOption : styles.incorrectOption),
            ]}
            onPress={() => checkAnswer(option)}
            disabled={isCorrect !== null}
          >
            {darkModeEnabled && <View style={dynamicStyles.darkModeOverlayButton} />}

            <Text style={[styles.optionText, dynamicStyles.optionText]}>{option}</Text>
            {selectedOption === option && isCorrect && (
              <>
                <LottieView
                  ref={correctAnimationRef}
                  source={require('../../../../../../../assets/correct.json')}
                  autoPlay={true}
                  loop={false}
                  style={styles.animation}
                />
                <LottieView
                  ref={congratsAnimationRef}
                  source={require('../../../../../../../assets/congrats.json')}
                  autoPlay={true}
                  loop={false}
                  style={styles.animation}
                />
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
  },
  speakerButton: {
    position: 'absolute',
    top: '47%',
    marginBottom: 0,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '110%',
    height: '40%',
  },
  option: {
    borderRadius: 20,
    marginVertical: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  optionText: {
    fontSize: 40,
    fontFamily: 'Pagebash',
  },
  correctOption: {
    
    backgroundColor: '#5EDE2B',
  },
  incorrectOption: {
    backgroundColor: '#ff4444',
  },
  feedbackText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
  },
  animation: {
    width: 150,
    height: 150,
    position: 'absolute',
  },
  speakerAnimation: {
    width: 100,
    height: 100,
  },
});

export default ListenAndChooseExercise;
