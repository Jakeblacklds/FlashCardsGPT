import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFlashcardsByCategory, selectFlashcardsByCategory } from '../redux/FlashcardSlice';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { selectDarkMode } from '../redux/darkModeSlice';

export default function CheckFlashcardScreen({ route, navigation }) {
    const { category } = route.params;
    const dispatch = useDispatch();
    const darkModeEnabled = useSelector(selectDarkMode);
    const user_id = "SpanishFlashcards";
    const flashcards = useSelector(state => selectFlashcardsByCategory(state, category));
    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [attemptCount, setAttemptCount] = useState(0);

    useEffect(() => {
        dispatch(fetchFlashcardsByCategory(user_id, category));
    }, [category, dispatch]);

    const inputScale = useSharedValue(1);
    const inputColor = useSharedValue(darkModeEnabled ? '#333' : '#ffffff');

    const animatedInputStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: inputScale.value }],
            borderColor: inputColor.value,
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
            inputColor.value = '#ffffff';
        } else {
            Alert.alert('Hecho', 'Has completado todas las flashcards en esta categoría.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        }
    };

    const questionStyle = {
        ...styles.question,
        color: darkModeEnabled ? '#FFF' : '#000',
    };

    const containerStyle = {
        ...styles.container,
        
        backgroundColor: darkModeEnabled ? '#121212' : '#f4f1de',
    };

    const textStyle = {
        ...styles.textInput,
        color: darkModeEnabled ? '#FFF' : '#000',
    };

    const buttonStyle = {
        ...styles.button,
        backgroundColor: darkModeEnabled ? '#333' : '#81b29a',
    };

    const buttonTextStyle = {
        ...styles.buttonText,
        color: darkModeEnabled ? '#FFF' : '#000',
    };

    return (
        <View style={containerStyle}>
            {flashcards && flashcards.length > 0 ? (
                <View>
                    <Text style={questionStyle}>Pregunta (Inglés): {flashcards[currentFlashcardIndex].english}</Text>
                    <Animated.View style={[styles.textInput, animatedInputStyle]}>
                        <TextInput
                            onChangeText={text => setUserAnswer(text)}
                            value={userAnswer}
                            placeholder="Escribe tu respuesta en español"
                            placeholderTextColor={darkModeEnabled ? '#AAA' : '#666'}
                            style={textStyle}
                        />
                    </Animated.View>
                    <TouchableOpacity style={buttonStyle} onPress={checkAnswer}>
                        <Text style={buttonTextStyle}>Verificar</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <Text style={textStyle}>No hay flashcards para esta categoría.</Text>
            )}
            <TouchableOpacity style={buttonStyle} onPress={() => navigation.goBack()}>
                <Text style={buttonTextStyle}>Volver a categorías</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    question: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f1de',
    },
    textInput: {
        height: 50,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        width: '80%',
        textAlign: 'center',
        fontSize: 20,  // Reducido el tamaño del texto
        borderRadius: 10,
    },
    button: {
        backgroundColor: '#81b29a',
        padding: 15,
        borderRadius: 10,
        margin: 10,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 20,  // Reducido el tamaño del texto
        textAlign: 'center',
    },
});
