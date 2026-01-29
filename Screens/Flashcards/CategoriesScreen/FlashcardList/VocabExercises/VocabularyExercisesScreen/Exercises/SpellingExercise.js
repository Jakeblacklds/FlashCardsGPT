import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

/**
 * SpellingExercise - Ejercicio de deletrear la palabra
 * El usuario debe ordenar las letras para formar la palabra
 */
const SpellingExercise = ({
    word,
    colorPair,
    darkModeEnabled,
    onCorrect,
    onIncorrect,
    disabled,
}) => {
    const [shuffledLetters, setShuffledLetters] = useState([]);
    const [selectedLetters, setSelectedLetters] = useState([]);
    const [isCorrect, setIsCorrect] = useState(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const shakeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Inicializar letras mezcladas
    useEffect(() => {
        if (!word) return;

        const letters = word.spanish.split('').map((letter, index) => ({
            id: `${index}-${letter}`,
            letter,
            originalIndex: index,
        }));

        // Mezclar letras
        const shuffled = [...letters].sort(() => Math.random() - 0.5);

        setShuffledLetters(shuffled);
        setSelectedLetters([]);
        setIsCorrect(null);
        setHasSubmitted(false);

        // Reproducir palabra en inglés
        setTimeout(() => {
            Speech.speak(word.english, { language: 'en-US', rate: 0.9 });
        }, 300);
    }, [word?.id]);

    // Hablar la palabra
    const speak = () => {
        if (word?.english) {
            Speech.speak(word.english, { language: 'en-US', rate: 0.9 });
        }
    };

    // Seleccionar una letra
    const handleSelectLetter = (letterObj) => {
        if (disabled || hasSubmitted) return;

        // Agregar a seleccionadas
        setSelectedLetters(prev => [...prev, letterObj]);
        // Quitar de disponibles
        setShuffledLetters(prev => prev.filter(l => l.id !== letterObj.id));

        // Animación suave
        Animated.spring(scaleAnim, {
            toValue: 1.02,
            tension: 100,
            friction: 10,
            useNativeDriver: true,
        }).start(() => {
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 10,
                useNativeDriver: true,
            }).start();
        });
    };

    // Quitar una letra seleccionada
    const handleRemoveLetter = (letterObj, index) => {
        if (disabled || hasSubmitted) return;

        // Quitar de seleccionadas
        setSelectedLetters(prev => prev.filter((_, i) => i !== index));
        // Agregar de vuelta a disponibles
        setShuffledLetters(prev => [...prev, letterObj]);
    };

    // Verificar respuesta
    const handleCheck = () => {
        if (disabled || hasSubmitted) return;

        const userAnswer = selectedLetters.map(l => l.letter).join('');
        const correct = userAnswer.toLowerCase() === word.spanish.toLowerCase();

        setIsCorrect(correct);
        setHasSubmitted(true);

        if (correct) {
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
            ]).start();

            setTimeout(() => onCorrect(), 300);
        } else {
            // Shake animation
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
            ]).start();

            setTimeout(() => onIncorrect(), 300);
        }
    };

    // Limpiar selección
    const handleClear = () => {
        if (disabled || hasSubmitted) return;

        // Devolver todas las letras
        const allLetters = [...shuffledLetters, ...selectedLetters].sort(() => Math.random() - 0.5);
        setShuffledLetters(allLetters);
        setSelectedLetters([]);
    };

    const bgColor = darkModeEnabled ? '#2a2a4e' : '#FFF';
    const textColor = darkModeEnabled ? '#FFF' : '#333';
    const accentColor = colorPair?.background || '#4A90D9';

    const isComplete = selectedLetters.length === word?.spanish.length;

    return (
        <View style={styles.container}>
            {/* Instrucción */}
            <View style={styles.instructionRow}>
                <FontAwesome5 name="spell-check" size={16} color={accentColor} />
                <Text style={[styles.instruction, { color: darkModeEnabled ? '#AAA' : '#666' }]}>
                    Spell the word in Spanish
                </Text>
            </View>

            {/* Palabra en inglés + audio */}
            <TouchableOpacity style={styles.wordContainer} onPress={speak}>
                <Text style={[styles.englishWord, { color: textColor }]}>{word?.english}</Text>
                <FontAwesome5 name="volume-up" size={18} color={accentColor} />
            </TouchableOpacity>

            {/* Área de respuesta */}
            <Animated.View
                style={[
                    styles.answerContainer,
                    {
                        backgroundColor: hasSubmitted
                            ? (isCorrect ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)')
                            : `${accentColor}15`,
                        borderColor: hasSubmitted
                            ? (isCorrect ? '#4ADE80' : '#EF4444')
                            : accentColor,
                        transform: [{ translateX: shakeAnim }, { scale: scaleAnim }],
                    }
                ]}
            >
                {selectedLetters.length === 0 ? (
                    <Text style={[styles.placeholder, { color: darkModeEnabled ? '#666' : '#AAA' }]}>
                        Tap letters below
                    </Text>
                ) : (
                    <View style={styles.selectedLettersRow}>
                        {selectedLetters.map((letterObj, index) => (
                            <TouchableOpacity
                                key={`selected-${letterObj.id}`}
                                style={[styles.letterTile, styles.selectedTile, { backgroundColor: accentColor }]}
                                onPress={() => handleRemoveLetter(letterObj, index)}
                                disabled={hasSubmitted}
                            >
                                <Text style={styles.letterText}>{letterObj.letter}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </Animated.View>

            {/* Letras disponibles */}
            <View style={styles.lettersContainer}>
                {shuffledLetters.map((letterObj) => (
                    <TouchableOpacity
                        key={letterObj.id}
                        style={[styles.letterTile, { backgroundColor: bgColor, borderColor: accentColor }]}
                        onPress={() => handleSelectLetter(letterObj)}
                        disabled={disabled || hasSubmitted}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.letterText, { color: textColor }]}>{letterObj.letter}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Botones */}
            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[styles.button, styles.clearButton]}
                    onPress={handleClear}
                    disabled={disabled || hasSubmitted || selectedLetters.length === 0}
                >
                    <FontAwesome5 name="redo" size={14} color="#888" />
                    <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.button,
                        styles.checkButton,
                        { backgroundColor: isComplete ? accentColor : '#888' }
                    ]}
                    onPress={handleCheck}
                    disabled={!isComplete || hasSubmitted || disabled}
                >
                    <FontAwesome5 name="check" size={14} color="#FFF" />
                    <Text style={styles.checkButtonText}>Check</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 10,
    },
    instructionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 16,
    },
    instruction: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 1,
    },
    wordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 20,
    },
    englishWord: {
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    answerContainer: {
        minHeight: 60,
        borderRadius: 16,
        borderWidth: 3,
        padding: 12,
        marginBottom: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholder: {
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontStyle: 'italic',
    },
    selectedLettersRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 6,
    },
    lettersContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 24,
    },
    letterTile: {
        width: 44,
        height: 44,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedTile: {
        borderWidth: 0,
    },
    letterText: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        color: '#FFF',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
    },
    clearButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#888',
    },
    clearButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        color: '#888',
    },
    checkButton: {
        minWidth: 120,
        justifyContent: 'center',
    },
    checkButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        color: '#FFF',
    },
});

export default SpellingExercise;
