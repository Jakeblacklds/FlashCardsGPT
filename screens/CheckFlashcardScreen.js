import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFlashcardsByCategory, selectFlashcardsByCategory } from '../FlashcardSlice';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';



export default function CheckFlashcardScreen({ route, navigation }) {
    const { category } = route.params;
    const dispatch = useDispatch();

    const user_id = "SpanishFlashcards";
  
    const flashcards = useSelector(state => selectFlashcardsByCategory(state, category));

    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [attemptCount, setAttemptCount] = useState(0);

    useEffect(() => {
        dispatch(fetchFlashcardsByCategory(user_id, category));
    }, [category, dispatch]);

    const inputScale = useSharedValue(1);
    const inputColor = useSharedValue('#ffffff');

    const animatedInputStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: inputScale.value }],
            backgroundColor: inputColor.value,
        };
    });

    const checkAnswer = () => {
      if (userAnswer.toLowerCase() === flashcards[currentFlashcardIndex].spanish.toLowerCase()) {
          inputScale.value = withSpring(1.2, { damping: 3, stiffness: 200 }, () => {
              inputScale.value = withSpring(1);
          });
          inputColor.value = '#00ff00';
          setTimeout(() => {
              Alert.alert('Correcto!', 'Bien hecho, vamos a la siguiente.', [{ text: 'OK' }]);
              nextFlashcard();
          }, 500); 
        } else {
            inputScale.value = withSpring(1.2, { damping: 3, stiffness: 200 }, () => {
                inputScale.value = withSpring(1);
            });
            inputColor.value = '#ff0000';
            setAttemptCount(attemptCount + 1);
            if (attemptCount >= 1) {
                Alert.alert('Incorrecto', `La respuesta correcta es: ${flashcards[currentFlashcardIndex].spanish}. Vamos a la siguiente.`, [{ text: 'OK' }]);
                nextFlashcard();
            } else {
                Alert.alert('Incorrecto', 'Inténtalo de nuevo.', [{ text: 'OK' }]);
            }
        }
    };

    const nextFlashcard = () => {
        if (currentFlashcardIndex < flashcards.length - 1) {
            setCurrentFlashcardIndex(currentFlashcardIndex + 1);
            setAttemptCount(0);
            setUserAnswer('');
            inputColor.value = '#ffffff';  // Reset the background color
        } else {
            Alert.alert('Hecho', 'Has completado todas las flashcards en esta categoría.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        }
    };

    return (
      <View style={styles.container}>
          {flashcards && flashcards.length > 0 ? (
              <View>
                  <Text>Pregunta (Inglés): {flashcards[currentFlashcardIndex].english}</Text>
                  <Animated.View style={[styles.textInput, animatedInputStyle]}>
                      <TextInput
                            
                          onChangeText={text => setUserAnswer(text)}
                          value={userAnswer}
                          placeholder="Escribe tu respuesta en español"
                      />
                  </Animated.View>
                  <TouchableOpacity style={styles.button} onPress={checkAnswer}>
                      <Text style={styles.buttonText}>Verificar</Text>
                  </TouchableOpacity>
              </View>
          ) : (
              <Text>No hay flashcards para esta categoría.</Text>
          )}
          <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
              <Text style={styles.buttonText}>Volver a categorías</Text>
          </TouchableOpacity>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f4f1de',
  },
  textInput: {
      height: 50,  // Aumentado de 40 a 50
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 20,
      width: '80%',
      textAlign: 'center',
      fontSize: 40,  // Aumentado de 18 a 24
      borderRadius: 10,
  },
  button: {
      backgroundColor: '#81b29a',
      padding: 15,  // Aumentado de 10 a 15
      borderRadius: 10,
      margin: 10,
  },
  buttonText: {
      color: '#FFF',
      fontSize: 24,  // Aumentado de 18 a 24
      textAlign: 'center',
  },
});