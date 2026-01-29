import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    FadeIn,
    FadeInUp,
    Layout,
    interpolateColor,
} from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AnimatedOption from '../../animations/AnimatedOption';
import SuccessAnimation from '../../animations/SuccessAnimation';
import CorrectFeedback from '../../animations/CorrectFeedback';
import IncorrectFeedback from '../../animations/IncorrectFeedback';

const { width } = Dimensions.get('window');

/**
 * FillBlankExerciseNew - Ejercicio de selección múltiple mejorado
 * 
 * Características:
 * - Animaciones fluidas con Reanimated 2
 * - Feedback visual inmediato (CorrectFeedback / IncorrectFeedback)
 * - Haptic feedback
 * - Opciones con entrada animada escalonada
 */
const FillBlankExerciseNew = ({
    word,
    flashcards,
    colorPair,
    darkModeEnabled,
    onCorrect,
    onIncorrect,
    disabled,
    showStreak = false,
    streak = 0,
}) => {
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [resultState, setResultState] = useState(null); // 'correct' | 'incorrect' | null
    const [showSuccessAnim, setShowSuccessAnim] = useState(false);
    const [showIncorrectAnim, setShowIncorrectAnim] = useState(false);
    const startTime = useRef(Date.now());

    // Animaciones
    const wordScale = useSharedValue(1);
    const wordGlow = useSharedValue(0);

    const accentColor = colorPair?.background || '#4A90D9';
    const bgColor = darkModeEnabled ? '#2a2a4e' : '#FFF';
    const textColor = darkModeEnabled ? '#FFF' : '#333';
    const mutedColor = darkModeEnabled ? '#888' : '#999';

    // Generar opciones cuando cambia la palabra
    useEffect(() => {
        if (!word) return;

        startTime.current = Date.now();
        setSelectedOption(null);
        setResultState(null);
        setShowSuccessAnim(false);
        setShowIncorrectAnim(false);

        const correctOption = word.english;

        // Obtener opciones incorrectas de otras flashcards
        const incorrectOptions = flashcards
            .filter(fc => fc.id !== word.id && fc.english !== correctOption)
            .map(fc => fc.english)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        // Rellenar si no hay suficientes
        while (incorrectOptions.length < 3) {
            const filler = `${word.english} (${incorrectOptions.length + 1})`;
            if (!incorrectOptions.includes(filler)) {
                incorrectOptions.push(filler);
            }
        }

        const allOptions = [...incorrectOptions, correctOption].sort(() => Math.random() - 0.5);
        setOptions(allOptions);

        // Animación de entrada de la palabra
        wordScale.value = 0.8;
        wordScale.value = withSpring(1, { damping: 10, stiffness: 150 });
        wordGlow.value = 0;
        wordGlow.value = withSequence(
            withTiming(1, { duration: 300 }),
            withTiming(0.3, { duration: 500 })
        );
    }, [word?.id]);

    // Manejar selección de opción
    const handleSelect = useCallback((option) => {
        if (disabled || selectedOption !== null) return;

        const responseTimeMs = Date.now() - startTime.current;
        const isCorrect = option === word.english;

        setSelectedOption(option);
        setResultState(isCorrect ? 'correct' : 'incorrect');

        // Haptic feedback
        if (isCorrect) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setShowSuccessAnim(true);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setShowIncorrectAnim(true);
        }

        // Animación de la palabra
        wordScale.value = withSequence(
            withSpring(isCorrect ? 1.05 : 0.98, { damping: 10 }),
            withSpring(1, { damping: 8 })
        );

        // Callback con tiempo de respuesta
        setTimeout(() => {
            if (isCorrect) {
                onCorrect?.({ responseTimeMs });
            } else {
                onIncorrect?.({ responseTimeMs });
            }
        }, 400);
    }, [disabled, selectedOption, word, onCorrect, onIncorrect]);

    // Determinar estado de cada opción
    const getOptionState = useCallback((option) => {
        if (selectedOption === null) return 'default';

        const isSelected = selectedOption === option;
        const isCorrectOption = option === word?.english;

        if (isSelected) {
            return resultState === 'correct' ? 'correct' : 'incorrect';
        }

        // Mostrar la respuesta correcta si el usuario se equivocó
        if (resultState === 'incorrect' && isCorrectOption) {
            return 'correct';
        }

        return 'disabled';
    }, [selectedOption, resultState, word]);

    // Estilos animados
    const wordContainerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: wordScale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        shadowOpacity: wordGlow.value * 0.4,
    }));

    return (
        <View style={styles.container}>
            {/* Instrucción */}
            <Animated.View
                style={styles.instructionContainer}
                entering={FadeIn.delay(50).duration(300)}
            >
                <FontAwesome5 name="language" size={16} color={accentColor} />
                <Text style={[styles.instruction, { color: mutedColor }]}>
                    Choose the correct translation
                </Text>
            </Animated.View>

            {/* Palabra en español */}
            <Animated.View
                entering={FadeInUp.delay(100).springify().damping(12)}
                layout={Layout}
            >
                <Animated.View
                    style={[
                        styles.wordContainer,
                        {
                            backgroundColor: darkModeEnabled ? '#2a2d4e' : '#FFFFFF',
                            borderColor: accentColor,
                        },
                        wordContainerStyle,
                    ]}
                >
                    <View style={[styles.wordAccent, { backgroundColor: accentColor }]} />
                    <View style={styles.wordInner}>
                        <Text style={styles.wordEmoji}>{word?.icon || '📚'}</Text>
                        <FontAwesome5 name="volume-up" size={20} color={accentColor} style={styles.wordIcon} />
                        <Text style={[styles.spanishWord, { color: textColor }]}>
                            {word?.spanish}
                        </Text>
                    </View>
                    <View style={[styles.wordBadge, { backgroundColor: `${accentColor}15` }]}>
                        <FontAwesome5 name="arrow-right" size={10} color={accentColor} />
                        <Text style={[styles.wordHint, { color: accentColor }]}>
                            Translate to English
                        </Text>
                    </View>
                </Animated.View>
            </Animated.View>

            {/* Opciones animadas */}
            <View style={styles.optionsContainer}>
                {options.map((option, index) => (
                    <AnimatedOption
                        key={`${word?.id}-${option}-${index}`}
                        text={option}
                        onPress={() => handleSelect(option)}
                        state={getOptionState(option)}
                        index={index}
                        accentColor={accentColor}
                        darkMode={darkModeEnabled}
                        disabled={disabled || selectedOption !== null}
                    />
                ))}
            </View>

            {/* Animaciones de feedback central */}
            <View style={styles.feedbackContainer}>
                {showSuccessAnim && (
                    <SuccessAnimation
                        visible={showSuccessAnim}
                        onComplete={() => setShowSuccessAnim(false)}
                        colors={[accentColor, '#4ADE80', '#22D3EE', '#A78BFA']}
                    />
                )}
                <CorrectFeedback
                    visible={showSuccessAnim}
                    color="#4ADE80"
                    size={50}
                />
                <IncorrectFeedback
                    visible={showIncorrectAnim}
                    onComplete={() => setShowIncorrectAnim(false)}
                    size={50}
                    haptic={false} // Ya lo manejamos arriba
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 10,
        position: 'relative',
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
    wordContainer: {
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 2,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        shadowOpacity: 0.12,
        elevation: 6,
    },
    wordAccent: {
        height: 4,
        width: '100%',
    },
    wordInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        gap: 12,
    },
    wordIcon: {
        opacity: 0.7,
    },
    wordEmoji: {
        fontSize: 32,
        marginRight: 10,
    },
    spanishWord: {
        fontSize: 26,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        textAlign: 'center',
    },
    wordBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    wordHint: {
        fontSize: 11,
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 0.5,
    },
    optionsContainer: {
        paddingHorizontal: 4,
    },
    feedbackContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
    },
});

export default FillBlankExerciseNew;
