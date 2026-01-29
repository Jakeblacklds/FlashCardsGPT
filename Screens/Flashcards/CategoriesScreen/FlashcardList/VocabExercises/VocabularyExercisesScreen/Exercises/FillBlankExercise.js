import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

/**
 * FillBlankExercise - Ejercicio de rellenar el espacio en blanco
 * Muestra una oración con una palabra faltante y opciones para completar
 */
const FillBlankExercise = ({
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

    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Oraciones de ejemplo con placeholder
    const sentenceTemplates = [
        { template: 'The ___ is very important.', blank: 'word' },
        { template: 'I need to learn the ___.', blank: 'word' },
        { template: 'Can you understand this ___?', blank: 'word' },
        { template: 'Please write the ___ correctly.', blank: 'word' },
        { template: 'This ___ has a different meaning.', blank: 'word' },
    ];

    // Generar ejercicio
    useEffect(() => {
        if (!word) return;

        const correctOption = word.english;

        // Obtener opciones incorrectas
        const incorrectOptions = flashcards
            .filter(fc => fc.id !== word.id)
            .map(fc => fc.english)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        const allOptions = [...incorrectOptions, correctOption].sort(() => Math.random() - 0.5);

        setOptions(allOptions);
        setSelectedOption(null);
        setIsCorrect(null);
    }, [word?.id]);

    // Manejar selección
    const handleSelect = (option) => {
        if (disabled || selectedOption !== null) return;

        const correct = option === word.english;
        setSelectedOption(option);
        setIsCorrect(correct);

        // Animación
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();

        setTimeout(() => {
            if (correct) {
                onCorrect();
            } else {
                onIncorrect();
            }
        }, 300);
    };

    const bgColor = darkModeEnabled ? '#2a2a4e' : '#FFF';
    const textColor = darkModeEnabled ? '#FFF' : '#333';
    const accentColor = colorPair?.background || '#4A90D9';

    // Generar oración con blank
    const sentence = `Translate: "${word?.spanish || '---'}" → ___`;

    return (
        <View style={styles.container}>
            {/* Instrucción */}
            <View style={styles.instructionContainer}>
                <FontAwesome5 name="fill-drip" size={16} color={accentColor} />
                <Text style={[styles.instruction, { color: darkModeEnabled ? '#AAA' : '#666' }]}>
                    Fill in the blank
                </Text>
            </View>

            {/* Oración con blank */}
            <Animated.View
                style={[
                    styles.sentenceContainer,
                    { backgroundColor: `${accentColor}15`, transform: [{ scale: scaleAnim }] }
                ]}
            >
                <Text style={[styles.sentenceText, { color: textColor }]}>
                    {sentence.split('___')[0]}
                    <Text style={[styles.blankText, { color: accentColor }]}>
                        {selectedOption || '______'}
                    </Text>
                    {sentence.split('___')[1]}
                </Text>
            </Animated.View>

            {/* Opciones */}
            <View style={styles.optionsContainer}>
                {options.map((option, index) => {
                    const isSelected = selectedOption === option;
                    const showCorrect = isSelected && isCorrect === true;
                    const showWrong = isSelected && isCorrect === false;

                    return (
                        <TouchableOpacity
                            key={`${word?.id}-${option}-${index}`}
                            style={[
                                styles.optionButton,
                                {
                                    backgroundColor: showCorrect ? '#4ADE80' : showWrong ? '#EF4444' : bgColor,
                                    borderColor: isSelected
                                        ? (showCorrect ? '#22C55E' : showWrong ? '#DC2626' : accentColor)
                                        : (darkModeEnabled ? '#3a3a6e' : '#E0E0E0'),
                                }
                            ]}
                            onPress={() => handleSelect(option)}
                            disabled={disabled || selectedOption !== null}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.optionText,
                                { color: isSelected ? '#FFF' : textColor }
                            ]}>
                                {option}
                            </Text>

                            {showCorrect && (
                                <FontAwesome5 name="check" size={14} color="#FFF" style={styles.icon} />
                            )}
                            {showWrong && (
                                <FontAwesome5 name="times" size={14} color="#FFF" style={styles.icon} />
                            )}
                        </TouchableOpacity>
                    );
                })}
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
    instructionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
    },
    instruction: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 1,
    },
    sentenceContainer: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 30,
    },
    sentenceText: {
        fontSize: 18,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        textAlign: 'center',
        lineHeight: 28,
    },
    blankText: {
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    optionsContainer: {
        gap: 12,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 3,
    },
    optionText: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    icon: {
        marginLeft: 10,
    },
});

export default FillBlankExercise;
