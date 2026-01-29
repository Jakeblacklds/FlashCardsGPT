import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    FadeIn,
    FadeInUp,
    FadeInDown,
    FadeOut,
    Layout,
    ZoomIn,
} from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import CorrectFeedback from '../../animations/CorrectFeedback';
import IncorrectFeedback from '../../animations/IncorrectFeedback';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * Divide una palabra en sílabas inteligentes de 2-3 caracteres
 * Intenta respetar patrones silábicos del español
 */
const splitIntoSyllables = (word) => {
    if (!word || word.length <= 3) {
        return [{ id: '0', text: word, originalIndex: 0 }];
    }

    const syllables = [];
    let remaining = word.toLowerCase();
    let index = 0;

    // Patrones de vocales y consonantes en español
    const vowels = 'aeiouáéíóúü';
    const isVowel = (char) => vowels.includes(char);

    while (remaining.length > 0) {
        let syllableLength = 2; // Default 2 caracteres

        // Si quedan 3 o menos, tomar todo
        if (remaining.length <= 3) {
            syllables.push({
                id: `${index}-${remaining}`,
                text: remaining,
                originalIndex: index,
            });
            break;
        }

        // Lógica para determinar longitud de sílaba
        const char0 = remaining[0];
        const char1 = remaining[1];
        const char2 = remaining[2];
        const char3 = remaining[3] || '';

        // Patrones comunes: CVC, CV, VC, CCV
        if (!isVowel(char0) && isVowel(char1)) {
            // Consonante + Vocal: ver si agregar más
            if (char2 && !isVowel(char2)) {
                // CVC - tomar 3 si la siguiente es vocal o fin
                if (!char3 || isVowel(char3)) {
                    syllableLength = 3;
                } else {
                    syllableLength = 2;
                }
            } else {
                syllableLength = 2;
            }
        } else if (isVowel(char0) && !isVowel(char1)) {
            // Vocal + Consonante
            syllableLength = 2;
        } else if (!isVowel(char0) && !isVowel(char1) && isVowel(char2)) {
            // CC + V (como "tr", "pr", "bl")
            syllableLength = 3;
        } else {
            // Default: 2-3 caracteres
            syllableLength = remaining.length >= 4 ? 3 : 2;
        }

        // Asegurar mínimo 2, máximo 3
        syllableLength = Math.max(2, Math.min(3, syllableLength));

        // No dejar sílabas de 1 al final
        if (remaining.length - syllableLength === 1) {
            syllableLength = remaining.length;
        }

        const syllable = remaining.substring(0, syllableLength);
        syllables.push({
            id: `${index}-${syllable}`,
            text: syllable,
            originalIndex: index,
        });

        remaining = remaining.substring(syllableLength);
        index++;
    }

    return syllables;
};

/**
 * SpellingExerciseNew - Ejercicio de deletrear con SÍLABAS (2-3 letras)
 * 
 * Más fácil y natural que letra por letra
 */
const SpellingExerciseNew = ({
    word,
    colorPair,
    darkModeEnabled,
    onCorrect,
    onIncorrect,
    disabled,
}) => {
    const [syllables, setSyllables] = useState([]);
    const [availableSyllables, setAvailableSyllables] = useState([]);
    const [selectedSyllables, setSelectedSyllables] = useState([]);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const startTime = useRef(Date.now());

    const answerScale = useSharedValue(1);
    const progressWidth = useSharedValue(0);

    const accentColor = colorPair?.background || '#4A90D9';
    const bgColor = darkModeEnabled ? '#2a2a4e' : '#FFF';
    const textColor = darkModeEnabled ? '#FFF' : '#333';
    const mutedColor = darkModeEnabled ? '#888' : '#666';

    // Inicializar sílabas
    useEffect(() => {
        if (!word) return;

        startTime.current = Date.now();
        setHasSubmitted(false);
        setResult(null);
        progressWidth.value = 0;

        const targetWord = word.spanish;
        const wordSyllables = splitIntoSyllables(targetWord);

        setSyllables(wordSyllables);

        // Mezclar sílabas
        let shuffled = [...wordSyllables];
        let attempts = 0;
        do {
            shuffled = [...wordSyllables].sort(() => Math.random() - 0.5);
            attempts++;
        } while (
            shuffled.map(s => s.originalIndex).join('') ===
            wordSyllables.map(s => s.originalIndex).join('') &&
            attempts < 10 &&
            wordSyllables.length > 1
        );

        setAvailableSyllables(shuffled);
        setSelectedSyllables([]);

        // Pronunciar palabra
        setTimeout(() => {
            Speech.speak(word.english, { language: 'en-US', rate: 0.9 });
        }, 500);
    }, [word?.id]);

    // Actualizar progreso
    useEffect(() => {
        if (syllables.length === 0) return;
        const progress = selectedSyllables.length / syllables.length;
        progressWidth.value = withSpring(progress * 100, { damping: 15 });
    }, [selectedSyllables.length, syllables.length]);

    const speak = useCallback(() => {
        if (word?.english) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Speech.speak(word.english, { language: 'en-US', rate: 0.9 });
        }
    }, [word]);

    const handleSelectSyllable = useCallback((syllable) => {
        if (disabled || hasSubmitted) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        answerScale.value = withSequence(
            withSpring(1.02, { damping: 15 }),
            withSpring(1, { damping: 10 })
        );

        setSelectedSyllables(prev => [...prev, syllable]);
        setAvailableSyllables(prev => prev.filter(s => s.id !== syllable.id));
    }, [disabled, hasSubmitted]);

    const handleRemoveSyllable = useCallback((syllable, index) => {
        if (disabled || hasSubmitted) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedSyllables(prev => prev.filter((_, i) => i !== index));
        setAvailableSyllables(prev => [...prev, syllable]);
    }, [disabled, hasSubmitted]);

    const handleCheck = useCallback(() => {
        if (disabled || hasSubmitted) return;

        const responseTimeMs = Date.now() - startTime.current;
        const userAnswer = selectedSyllables.map(s => s.text).join('');
        const isCorrect = userAnswer.toLowerCase() === word.spanish.toLowerCase();

        setHasSubmitted(true);
        setResult(isCorrect ? 'correct' : 'incorrect');

        if (isCorrect) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            answerScale.value = withSequence(
                withSpring(1.05, { damping: 8 }),
                withSpring(1, { damping: 10 })
            );
            setTimeout(() => onCorrect?.({ responseTimeMs }), 500);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            answerScale.value = withSequence(
                withTiming(0.98, { duration: 50 }),
                withTiming(1.02, { duration: 50 }),
                withTiming(0.98, { duration: 50 }),
                withTiming(1, { duration: 50 })
            );
            setTimeout(() => onIncorrect?.({ responseTimeMs }), 500);
        }
    }, [disabled, hasSubmitted, selectedSyllables, word, onCorrect, onIncorrect]);

    const handleClear = useCallback(() => {
        if (disabled || hasSubmitted) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const all = [...availableSyllables, ...selectedSyllables].sort(() => Math.random() - 0.5);
        setAvailableSyllables(all);
        setSelectedSyllables([]);
    }, [disabled, hasSubmitted, availableSyllables, selectedSyllables]);

    const answerContainerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: answerScale.value }],
        borderColor: result === 'correct' ? '#4ADE80' : result === 'incorrect' ? '#EF4444' : accentColor,
    }));

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progressWidth.value}%`,
    }));

    const isComplete = selectedSyllables.length === syllables.length;

    return (
        <View style={styles.container}>
            {/* Instrucción */}
            <Animated.View style={styles.instructionRow} entering={FadeIn.delay(50)}>
                <FontAwesome5 name="puzzle-piece" size={16} color={accentColor} />
                <Text style={[styles.instruction, { color: mutedColor }]}>
                    Arrange the syllables
                </Text>
            </Animated.View>

            {/* Palabra en inglés + audio */}
            <Animated.View
                entering={FadeInUp.delay(100).springify()}
                layout={Layout}
            >
                <Animated.View
                    style={[
                        styles.wordContainer,
                        {
                            backgroundColor: `${accentColor}12`,
                            borderColor: `${accentColor}30`,
                            shadowColor: accentColor,
                        }
                    ]}
                >
                    <View style={styles.emojiWrapper}>
                        <Text style={styles.wordEmoji}>{word?.icon || '📚'}</Text>
                    </View>
                    <TouchableOpacity style={styles.wordContent} onPress={speak} activeOpacity={0.8}>
                        <Text style={[styles.englishWord, { color: textColor }]}>"{word?.english}"</Text>
                        <View style={[styles.speakerButton, { backgroundColor: `${accentColor}20` }]}>
                            <FontAwesome5 name="volume-up" size={18} color={accentColor} />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.arrowContainer}>
                        <FontAwesome5 name="arrow-down" size={12} color={accentColor} />
                        <Text style={[styles.wordHint, { color: mutedColor }]}>Spanish</Text>
                    </View>
                </Animated.View>
            </Animated.View>

            {/* Área de respuesta */}
            <Animated.View
                entering={FadeInUp.delay(150).springify()}
                layout={Layout}
            >
                <Animated.View
                    style={[
                        styles.answerContainer,
                        { backgroundColor: `${accentColor}08`, borderColor: accentColor },
                        answerContainerStyle,
                    ]}
                >
                    {/* Barra de progreso */}
                    <View style={styles.progressBar}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                { backgroundColor: result === 'correct' ? '#4ADE80' : result === 'incorrect' ? '#EF4444' : accentColor },
                                progressStyle
                            ]}
                        />
                    </View>

                    {selectedSyllables.length === 0 ? (
                        <View style={styles.placeholderContainer}>
                            <Text style={[styles.placeholder, { color: mutedColor }]}>
                                ⬇️ Tap syllables below
                            </Text>
                            <Text style={[styles.targetHint, { color: `${accentColor}80` }]}>
                                → {word?.spanish}
                            </Text>
                        </View>
                    ) : (
                        <Animated.View
                            layout={Layout.springify().damping(15)}
                            style={styles.selectedRow}
                        >
                            {selectedSyllables.map((syl, index) => (
                                <Animated.View
                                    key={`selected-${syl.id}`}
                                    entering={ZoomIn.springify().damping(12)}
                                    exiting={FadeOut.duration(150)}
                                    layout={Layout.springify().damping(15)}
                                >
                                    <TouchableOpacity
                                        style={[styles.syllableTile, styles.selectedTile, { backgroundColor: accentColor }]}
                                        onPress={() => handleRemoveSyllable(syl, index)}
                                        disabled={hasSubmitted}
                                    >
                                        <Text style={styles.selectedSyllableText}>{syl.text}</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                        </Animated.View>
                    )}
                </Animated.View>
            </Animated.View>

            {/* Sílabas disponibles */}
            <Animated.View
                style={styles.syllablesContainer}
                entering={FadeInDown.delay(200).springify()}
                layout={Layout.springify()}
            >
                {availableSyllables.map((syl, index) => (
                    <Animated.View
                        key={syl.id}
                        entering={FadeInUp.delay(index * 60).springify()}
                        layout={Layout.springify()}
                    >
                        <TouchableOpacity
                            style={[
                                styles.syllableTile,
                                { backgroundColor: bgColor, borderColor: `${accentColor}50` }
                            ]}
                            onPress={() => handleSelectSyllable(syl)}
                            disabled={disabled || hasSubmitted}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.syllableText, { color: textColor }]}>
                                {syl.text}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </Animated.View>

            {/* Botones */}
            <Animated.View style={styles.buttonRow} entering={FadeInUp.delay(300)}>
                <TouchableOpacity
                    style={[styles.button, styles.clearButton, { borderColor: mutedColor }]}
                    onPress={handleClear}
                    disabled={disabled || hasSubmitted || selectedSyllables.length === 0}
                    activeOpacity={0.7}
                >
                    <FontAwesome5 name="redo" size={14} color={mutedColor} />
                    <Text style={[styles.clearButtonText, { color: mutedColor }]}>Clear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.button,
                        styles.checkButton,
                        {
                            backgroundColor: isComplete && !hasSubmitted ? accentColor : '#888',
                            opacity: isComplete && !hasSubmitted ? 1 : 0.5,
                        }
                    ]}
                    onPress={handleCheck}
                    disabled={!isComplete || hasSubmitted || disabled}
                    activeOpacity={0.8}
                >
                    <FontAwesome5 name="check" size={14} color="#FFF" />
                    <Text style={styles.checkButtonText}>Check</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Feedback animations */}
            <View style={styles.feedbackContainer} pointerEvents="none">
                <CorrectFeedback visible={result === 'correct'} size={50} />
                <IncorrectFeedback visible={result === 'incorrect'} size={50} haptic={false} />
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
        letterSpacing: 0.5,
    },
    wordContainer: {
        padding: 24,
        borderRadius: 24,
        marginBottom: 20,
        alignItems: 'center',
        borderWidth: 2,
        backgroundColor: 'rgba(255,255,255,0.05)',
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 20,
        shadowOpacity: 0.1,
        elevation: 8,
    },
    wordContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15,
        marginBottom: 12,
    },
    emojiWrapper: {
        marginBottom: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 10,
        borderRadius: 20,
    },
    wordEmoji: {
        fontSize: 40,
    },
    englishWord: {
        fontSize: 28,
        fontWeight: '900',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        textAlign: 'center',
        letterSpacing: 1,
    },
    speakerButton: {
        padding: 12,
        borderRadius: 15,
    },
    arrowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 15,
        paddingVertical: 4,
        borderRadius: 20,
    },
    wordHint: {
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    answerContainer: {
        minHeight: 80,
        borderRadius: 14,
        borderWidth: 2,
        padding: 12,
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    progressBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    placeholderContainer: {
        alignItems: 'center',
        gap: 4,
    },
    placeholder: {
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    targetHint: {
        fontSize: 11,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontStyle: 'italic',
    },
    selectedRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
    syllablesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 24,
        paddingHorizontal: 10,
    },
    syllableTile: {
        minWidth: 50,
        height: 44,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    selectedTile: {
        borderWidth: 0,
        shadowOpacity: 0.2,
    },
    syllableText: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    selectedSyllableText: {
        fontSize: 16,
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
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
    },
    clearButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
    },
    clearButtonText: {
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    checkButton: {
        minWidth: 110,
        justifyContent: 'center',
    },
    checkButtonText: {
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        color: '#FFF',
    },
    feedbackContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default SpellingExerciseNew;
