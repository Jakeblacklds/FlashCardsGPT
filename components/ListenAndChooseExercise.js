import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import LottieView from 'lottie-react-native';

const ListenAndChooseExercise = ({ word, onComplete, onMistake, flashcards, colorPair }) => {
  const [options, setOptions] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const soundAnimationRef = useRef(null);
  const correctAnimationRef = useRef(null);
  const congratsAnimationRef = useRef(null);
  const animationDuration = 800; // Duración de la animación en milisegundos

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
    
    // Esperar a que se establezca el estado antes de intentar reproducir la animación
    setTimeout(() => {
      if (isAnswerCorrect) {
        // Asegúrate de que las referencias de las animaciones no sean null
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


  return (
    <View style={styles.container}>
      <View style={styles.optionsRow}>
        {options.slice(0, 2).map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              { backgroundColor: colorPair.background,
                borderWidth: 4,
                borderColor: colorPair.text },
              selectedOption === option &&
              (isCorrect ? styles.correctOption : styles.incorrectOption),
            ]}
            onPress={() => checkAnswer(option)}
            disabled={isCorrect !== null}
          >
            <Text style={[styles.optionText, { color: colorPair.text }]}>{option}</Text>
            {selectedOption === option && isCorrect && (
              <>
                <LottieView
                  ref={correctAnimationRef}
                  source={require('../assets/correct.json')}
                  autoPlay={true}
                  loop={false}
                  style={{ width: 150, height: 150,
                          position: 'absolute',
                          }}
                />
                <LottieView
                  ref={congratsAnimationRef}
                  source={require('../assets/congrats.json')}
                  autoPlay={true}
                  loop={false}
                  style={{ width: 400, height: 400,
                          position: 'absolute',
                          }}
                />
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={speak} style={styles.speakerButton}>
        <LottieView
          ref={soundAnimationRef}
          source={require('../assets/sound.json')}
          loop={false}
          style={{ width: 100, height: 100 }}
        />
      </TouchableOpacity>
      <View style={styles.optionsRow}>
        {options.slice(2).map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              { backgroundColor: colorPair.background,
                borderWidth: 4,
                borderColor: colorPair.text },
              selectedOption === option &&
              (isCorrect ? styles.correctOption : styles.incorrectOption),
            ]}
            onPress={() => checkAnswer(option)}
            disabled={isCorrect !== null}
          >
            <Text style={[styles.optionText, { color: colorPair.text }]}>{option}</Text>
            {selectedOption === option && isCorrect && (
              <>
                <LottieView
                  ref={correctAnimationRef}
                  source={require('../assets/correct.json')}
                  autoPlay={true}
                  loop={false}
                  style={{
                    width: 150, 
                    height: 150,
                    position: 'absolute',
                    
                  }}
                />
                <LottieView
                  ref={congratsAnimationRef}
                  source={require('../assets/congrats.json')}
                  autoPlay={true}
                  loop={false}
                  style={{ width: 400, height: 400
                          ,position: 'absolute',
                          }}
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
    fontFamily  : 'Pagebash',
  },
  correctOption: {
    backgroundColor: '#00C851',
  },
  incorrectOption: {
    backgroundColor: '#ff4444',
  },
  feedbackText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default ListenAndChooseExercise;
