import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    Animated,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

/**
 * WriteWordExerciseNew - Ejercicio de escribir la traducción
 * Versión rediseñada con estilo Pokemon
 */
const WriteWordExerciseNew = ({
    word,
    colorPair,
    darkModeEnabled,
    onCorrect,
    onIncorrect,
    disabled,
}) => {
    const [userInput, setUserInput] = useState('');
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const inputRef = useRef(null);
    const buttonScale = useRef(new Animated.Value(1)).current;

    // Resetear cuando cambia la palabra
    useEffect(() => {
        setUserInput('');
        setHasSubmitted(false);

        // Enfocar input después de un breve delay
        setTimeout(() => {
            inputRef.current?.focus();
        }, 300);
    }, [word?.id]);

    // Normalizar texto para comparación
    const normalizeText = (text) => {
        return text
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remover acentos
            .replace(/[¿¡?!.,]/g, ''); // Remover puntuación
    };

    // Verificar respuesta
    const handleSubmit = () => {
        if (disabled || hasSubmitted || !userInput.trim()) return;

        // Animación del botón
        Animated.sequence([
            Animated.timing(buttonScale, { toValue: 0.95, duration: 50, useNativeDriver: true }),
            Animated.timing(buttonScale, { toValue: 1, duration: 50, useNativeDriver: true }),
        ]).start();

        setHasSubmitted(true);

        const userAnswer = normalizeText(userInput);
        const correctAnswer = normalizeText(word.spanish);

        // También verificar variantes si existen
        const variants = [
            word.spanish,
            word.variant1,
            word.variant2,
            word.variant3,
        ].filter(Boolean).map(normalizeText);

        const isCorrect = variants.includes(userAnswer);

        setTimeout(() => {
            if (isCorrect) {
                onCorrect();
            } else {
                onIncorrect();
            }
        }, 200);
    };

    const bgColor = darkModeEnabled ? '#2a2a4e' : '#FFFFFF';
    const textColor = darkModeEnabled ? '#FFFFFF' : '#1a1a2e';
    const placeholderColor = darkModeEnabled ? '#666' : '#999';
    const accentColor = colorPair?.background || '#4A90D9';

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Instrucciones */}
            <View style={styles.instructionContainer}>
                <FontAwesome5 name="keyboard" size={16} color={accentColor} />
                <Text style={[styles.instruction, { color: darkModeEnabled ? '#AAA' : '#666' }]}>
                    Write the Spanish translation
                </Text>
            </View>

            {/* Palabra en inglés */}
            <View style={[
                styles.wordDisplay,
                {
                    backgroundColor: `${accentColor}12`,
                    borderColor: `${accentColor}30`,
                    shadowColor: accentColor,
                }
            ]}>
                <Text style={styles.wordEmoji}>{word?.icon || '📚'}</Text>
                <Text style={[styles.wordText, { color: textColor }]}>
                    "{word?.english || '---'}"
                </Text>
                <View style={styles.arrowContainer}>
                    <FontAwesome5 name="arrow-down" size={12} color={accentColor} />
                    <Text style={[styles.wordHint, { color: darkModeEnabled ? '#888' : '#666' }]}>Spanish</Text>
                </View>
            </View>

            {/* Input de texto */}
            <View style={styles.inputContainer}>
                <TextInput
                    ref={inputRef}
                    style={[
                        styles.input,
                        {
                            backgroundColor: bgColor,
                            color: textColor,
                            borderColor: hasSubmitted
                                ? (userInput.trim() ? '#888' : '#EF4444')
                                : accentColor,
                        }
                    ]}
                    value={userInput}
                    onChangeText={setUserInput}
                    placeholder="Type in Spanish..."
                    placeholderTextColor={placeholderColor}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!disabled && !hasSubmitted}
                    onSubmitEditing={handleSubmit}
                    returnKeyType="done"
                />
            </View>

            {/* Botón de verificar */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        {
                            backgroundColor: userInput.trim() ? accentColor : '#888',
                            opacity: disabled || hasSubmitted ? 0.5 : 1,
                        }
                    ]}
                    onPress={handleSubmit}
                    disabled={disabled || hasSubmitted || !userInput.trim()}
                    activeOpacity={0.8}
                >
                    <FontAwesome5 name="check" size={18} color="#FFF" />
                    <Text style={styles.submitButtonText}>CHECK</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Hint */}
            <View style={styles.hintContainer}>
                <Text style={[styles.hint, { color: darkModeEnabled ? '#555' : '#BBB' }]}>
                    Tip: Accents are optional
                </Text>
            </View>
        </KeyboardAvoidingView>
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
        fontSize: 11,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 0.5,
    },
    wordDisplay: {
        padding: 18,
        borderRadius: 16,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1.5,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 15,
        shadowOpacity: 0.2,
        elevation: 4,
    },
    wordEmoji: {
        fontSize: 36,
        marginBottom: 4,
    },
    wordText: {
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        textAlign: 'center',
        marginBottom: 8,
    },
    arrowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    wordHint: {
        fontSize: 11,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        padding: 12,
        borderRadius: 10,
        borderWidth: 2,
        textAlign: 'center',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 10,
        gap: 10,
    },
    submitButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        color: '#FFF',
        letterSpacing: 1,
    },
    hintContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    hint: {
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontStyle: 'italic',
    },
});

export default WriteWordExerciseNew;
