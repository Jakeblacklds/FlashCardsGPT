import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import * as Speech from 'expo-speech';
import { AnswerButton, SpeakButton } from '../components/ExerciseCard';

const { width } = Dimensions.get('window');

/**
 * ListenAndChooseExerciseNew - Ejercicio de escuchar y elegir
 * Versión rediseñada con estilo Pokemon
 */
const ListenAndChooseExerciseNew = ({
    word,
    flashcards,
    colorPair,
    darkModeEnabled,
    onCorrect,
    onIncorrect,
    disabled,
}) => {
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const hasPlayed = useRef(false);

    // Generar opciones cuando cambia la palabra
    useEffect(() => {
        if (!word) return;

        const correctOption = word.english;

        // Obtener opciones incorrectas de otras flashcards
        const incorrectOptions = flashcards
            .filter(fc => fc.id !== word.id)
            .map(fc => fc.english)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        // Combinar y mezclar
        const allOptions = [...incorrectOptions, correctOption];
        const shuffled = allOptions.sort(() => Math.random() - 0.5);

        setOptions(shuffled);
        setSelectedOption(null);
        setIsCorrect(null);
        hasPlayed.current = false;

        // Auto-reproducir el audio
        setTimeout(() => {
            if (!hasPlayed.current) {
                speak();
                hasPlayed.current = true;
            }
        }, 500);
    }, [word?.id]);

    // Reproducir palabra en español
    const speak = () => {
        if (word?.spanish) {
            Speech.speak(word.spanish, {
                language: 'es-ES',
                rate: 0.9,
            });
        }
    };

    // Manejar selección de respuesta
    const handleSelect = (option) => {
        if (disabled || selectedOption !== null) return;

        const correct = option === word.english;
        setSelectedOption(option);
        setIsCorrect(correct);

        // Dar feedback al padre
        setTimeout(() => {
            if (correct) {
                onCorrect();
            } else {
                onIncorrect();
            }
        }, 300);
    };

    return (
        <View style={styles.container}>
            {/* Instrucciones */}
            <View style={styles.instructionContainer}>
                <Text style={[styles.instruction, { color: darkModeEnabled ? '#AAA' : '#666' }]}>
                    Listen and choose the correct translation
                </Text>
            </View>

            {/* Botón de audio */}
            <View style={styles.speakContainer}>
                <View style={styles.emojiContainer}>
                    <Text style={styles.wordEmoji}>{word?.icon || '📚'}</Text>
                </View>
                <SpeakButton
                    onPress={speak}
                    colorPair={colorPair}
                    size="large"
                />
                <Text style={[styles.speakHint, { color: darkModeEnabled ? '#888' : '#999' }]}>
                    TAP TO LISTEN
                </Text>
            </View>

            {/* Grid de opciones */}
            <View style={styles.optionsGrid}>
                {options.map((option, index) => (
                    <View key={`${word?.id}-${option}-${index}`} style={styles.optionWrapper}>
                        <AnswerButton
                            text={option}
                            onPress={() => handleSelect(option)}
                            isSelected={selectedOption === option}
                            isCorrect={selectedOption === option ? isCorrect : null}
                            isDisabled={disabled || (selectedOption !== null && selectedOption !== option)}
                            colorPair={colorPair}
                            darkModeEnabled={darkModeEnabled}
                        />
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 4,
    },
    instructionContainer: {
        alignItems: 'center',
        marginBottom: 8,
    },
    instruction: {
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    speakContainer: {
        alignItems: 'center',
        marginVertical: 8,
    },
    speakHint: {
        fontSize: 9,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 1,
        marginTop: 4,
    },
    emojiContainer: {
        marginBottom: 10,
    },
    wordEmoji: {
        fontSize: 44,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 8,
    },
    optionWrapper: {
        width: '48%',
    },
});

export default ListenAndChooseExerciseNew;
