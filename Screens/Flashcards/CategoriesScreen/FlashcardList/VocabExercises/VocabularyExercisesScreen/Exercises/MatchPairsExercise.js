import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

/**
 * MatchPairsExercise - Ejercicio de emparejar inglés con español
 * El usuario debe conectar palabras con sus traducciones
 */
const MatchPairsExercise = ({
    words, // Array de 4 palabras
    colorPair,
    darkModeEnabled,
    onComplete, // Callback cuando completa todas las parejas
    onMistake,  // Callback cuando falla
}) => {
    const [leftItems, setLeftItems] = useState([]);
    const [rightItems, setRightItems] = useState([]);
    const [selectedLeft, setSelectedLeft] = useState(null);
    const [selectedRight, setSelectedRight] = useState(null);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [wrongPair, setWrongPair] = useState(null);
    const [mistakes, setMistakes] = useState(0);

    const shakeAnim = useRef(new Animated.Value(0)).current;

    // Inicializar items
    useEffect(() => {
        if (!words || words.length === 0) return;

        // Tomar máximo 4 palabras
        const selectedWords = words.slice(0, 4);

        // Crear items para la izquierda (inglés) y derecha (español)
        const left = selectedWords.map((w, i) => ({ id: w.id, text: w.english, index: i }));
        const right = selectedWords.map((w, i) => ({ id: w.id, text: w.spanish, index: i }));

        // Mezclar el lado derecho
        const shuffledRight = [...right].sort(() => Math.random() - 0.5);

        setLeftItems(left);
        setRightItems(shuffledRight);
        setMatchedPairs([]);
        setMistakes(0);
    }, [words]);

    // Verificar match cuando ambos están seleccionados
    useEffect(() => {
        if (selectedLeft !== null && selectedRight !== null) {
            const leftItem = leftItems[selectedLeft];
            const rightItem = rightItems[selectedRight];

            if (leftItem.id === rightItem.id) {
                // ¡Match correcto!
                setMatchedPairs(prev => [...prev, leftItem.id]);
                setSelectedLeft(null);
                setSelectedRight(null);

                // Verificar si completó todos
                if (matchedPairs.length + 1 === leftItems.length) {
                    setTimeout(() => {
                        onComplete(mistakes);
                    }, 500);
                }
            } else {
                // Match incorrecto
                setWrongPair({ left: selectedLeft, right: selectedRight });
                setMistakes(prev => prev + 1);
                onMistake();

                // Animación de shake
                Animated.sequence([
                    Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
                ]).start(() => {
                    setWrongPair(null);
                    setSelectedLeft(null);
                    setSelectedRight(null);
                });
            }
        }
    }, [selectedLeft, selectedRight, leftItems, rightItems, matchedPairs, mistakes, onComplete, onMistake, shakeAnim]);

    const handleLeftPress = (index) => {
        if (matchedPairs.includes(leftItems[index].id)) return;
        setSelectedLeft(index);
    };

    const handleRightPress = (index) => {
        if (matchedPairs.includes(rightItems[index].id)) return;
        setSelectedRight(index);
    };

    const bgColor = darkModeEnabled ? '#2a2a4e' : '#F8F9FA';
    const textColor = darkModeEnabled ? '#FFF' : '#333';
    const accentColor = colorPair?.background || '#4A90D9';

    return (
        <View style={styles.container}>
            <Text style={[styles.instruction, { color: darkModeEnabled ? '#AAA' : '#666' }]}>
                Match the pairs
            </Text>

            <View style={styles.columnsContainer}>
                {/* Columna izquierda (Inglés) */}
                <View style={styles.column}>
                    {leftItems.map((item, index) => {
                        const isMatched = matchedPairs.includes(item.id);
                        const isSelected = selectedLeft === index;
                        const isWrong = wrongPair?.left === index;

                        return (
                            <Animated.View
                                key={`left-${item.id}`}
                                style={[
                                    isWrong && { transform: [{ translateX: shakeAnim }] }
                                ]}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.matchItem,
                                        { backgroundColor: bgColor },
                                        isMatched && styles.matchedItem,
                                        isMatched && { backgroundColor: '#4ADE80' },
                                        isSelected && { borderColor: accentColor, borderWidth: 3 },
                                        isWrong && { backgroundColor: '#EF4444' },
                                    ]}
                                    onPress={() => handleLeftPress(index)}
                                    disabled={isMatched}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.matchText,
                                        { color: isMatched || isWrong ? '#FFF' : textColor }
                                    ]}>
                                        {item.text}
                                    </Text>
                                    {isMatched && (
                                        <FontAwesome5 name="check" size={14} color="#FFF" style={styles.checkIcon} />
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </View>

                {/* Línea divisoria */}
                <View style={[styles.divider, { backgroundColor: accentColor }]} />

                {/* Columna derecha (Español) */}
                <View style={styles.column}>
                    {rightItems.map((item, index) => {
                        const isMatched = matchedPairs.includes(item.id);
                        const isSelected = selectedRight === index;
                        const isWrong = wrongPair?.right === index;

                        return (
                            <Animated.View
                                key={`right-${item.id}`}
                                style={[
                                    isWrong && { transform: [{ translateX: shakeAnim }] }
                                ]}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.matchItem,
                                        { backgroundColor: bgColor },
                                        isMatched && styles.matchedItem,
                                        isMatched && { backgroundColor: '#4ADE80' },
                                        isSelected && { borderColor: accentColor, borderWidth: 3 },
                                        isWrong && { backgroundColor: '#EF4444' },
                                    ]}
                                    onPress={() => handleRightPress(index)}
                                    disabled={isMatched}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.matchText,
                                        { color: isMatched || isWrong ? '#FFF' : textColor }
                                    ]}>
                                        {item.text}
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </View>
            </View>

            {/* Progress indicator */}
            <View style={styles.progressRow}>
                {leftItems.map((item, index) => (
                    <View
                        key={index}
                        style={[
                            styles.progressDot,
                            matchedPairs.includes(item.id) && { backgroundColor: '#4ADE80' },
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 10,
    },
    instruction: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        textAlign: 'center',
        marginBottom: 20,
        letterSpacing: 1,
    },
    columnsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flex: 1,
    },
    column: {
        flex: 1,
        gap: 10,
    },
    divider: {
        width: 3,
        marginHorizontal: 12,
        borderRadius: 2,
        alignSelf: 'stretch',
        opacity: 0.3,
    },
    matchItem: {
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    matchedItem: {
        opacity: 0.8,
    },
    matchText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        textAlign: 'center',
        flex: 1,
    },
    checkIcon: {
        marginLeft: 8,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 20,
    },
    progressDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#DDD',
    },
});

export default MatchPairsExercise;
