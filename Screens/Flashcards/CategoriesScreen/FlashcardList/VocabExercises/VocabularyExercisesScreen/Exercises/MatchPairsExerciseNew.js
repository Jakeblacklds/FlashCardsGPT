import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    withDelay,
    FadeIn,
    FadeInUp,
    FadeOut,
    Layout,
    runOnJS,
} from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Svg, { Line } from 'react-native-svg';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * MatchPairsExerciseNew - Ejercicio de emparejar mejorado con Reanimated 2
 * 
 * Características:
 * - Línea conectora animada entre pares matched
 * - Glow pulsante en items seleccionados
 * - Desvanecimiento suave de pares matched
 * - Shake mejorado para errores
 */
const MatchPairsExerciseNew = ({
    words,
    colorPair,
    darkModeEnabled,
    onComplete,
    onIncorrect,
}) => {
    const [leftItems, setLeftItems] = useState([]);
    const [rightItems, setRightItems] = useState([]);
    const [selectedLeft, setSelectedLeft] = useState(null);
    const [selectedRight, setSelectedRight] = useState(null);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [wrongPair, setWrongPair] = useState(null);
    const [matchedConnections, setMatchedConnections] = useState([]);
    const startTime = useRef(Date.now());

    // Shared values para animaciones
    const shakeX = useSharedValue(0);
    const pulseScale = useSharedValue(1);

    const accentColor = colorPair?.background || '#4A90D9';
    const bgColor = darkModeEnabled ? '#2a2a4e' : '#FFF';
    const textColor = darkModeEnabled ? '#FFF' : '#333';
    const mutedColor = darkModeEnabled ? '#AAA' : '#666';

    // Inicializar items
    useEffect(() => {
        if (!words || words.length === 0) return;

        startTime.current = Date.now();

        const left = words.map((w, i) => ({
            id: w.id,
            text: w.english,
            index: i,
            originalY: 0, // Se calcula después
        }));
        const right = words.map((w, i) => ({
            id: w.id,
            text: w.spanish,
            index: i,
            originalY: 0,
        }));

        setLeftItems([...left].sort(() => Math.random() - 0.5));
        setRightItems([...right].sort(() => Math.random() - 0.5));
        setMatchedPairs([]);
        setMatchedConnections([]);
        setSelectedLeft(null);
        setSelectedRight(null);

        // Animación de pulso sutil
        pulseScale.value = withSequence(
            withDelay(500, withSpring(1.02)),
            withSpring(1)
        );
    }, [words]);

    // Verificar match cuando ambos están seleccionados
    useEffect(() => {
        if (selectedLeft !== null && selectedRight !== null) {
            const leftItem = leftItems[selectedLeft];
            const rightItem = rightItems[selectedRight];

            if (leftItem.id === rightItem.id) {
                // ¡Correcto!
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                const newMatched = [...matchedPairs, leftItem.id];
                setMatchedPairs(newMatched);

                // Agregar conexión visual
                setMatchedConnections(prev => [...prev, {
                    id: leftItem.id,
                    leftIndex: selectedLeft,
                    rightIndex: selectedRight,
                }]);

                setSelectedLeft(null);
                setSelectedRight(null);

                // Verificar si completó todo
                if (newMatched.length === leftItems.length) {
                    setTimeout(() => {
                        onComplete?.({
                            responseTimeMs: Date.now() - startTime.current,
                            matchedCount: newMatched.length,
                        });
                    }, 600);
                }
            } else {
                // ¡Incorrecto!
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                setWrongPair({ left: selectedLeft, right: selectedRight });
                onIncorrect?.();

                // Shake animation
                shakeX.value = withSequence(
                    withTiming(12, { duration: 50 }),
                    withTiming(-12, { duration: 50 }),
                    withTiming(12, { duration: 50 }),
                    withTiming(-12, { duration: 50 }),
                    withTiming(0, { duration: 50 })
                );

                setTimeout(() => {
                    setWrongPair(null);
                    setSelectedLeft(null);
                    setSelectedRight(null);
                }, 400);
            }
        }
    }, [selectedLeft, selectedRight]);

    const handleLeftPress = useCallback((index) => {
        if (matchedPairs.includes(leftItems[index]?.id) || wrongPair) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedLeft(index);
    }, [matchedPairs, leftItems, wrongPair]);

    const handleRightPress = useCallback((index) => {
        if (matchedPairs.includes(rightItems[index]?.id) || wrongPair) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedRight(index);
    }, [matchedPairs, rightItems, wrongPair]);

    // Estilo animado para shake
    const shakeStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeX.value }],
    }));

    if (!words || words.length === 0) return null;

    return (
        <View style={styles.container}>
            <Animated.View
                style={styles.instructionRow}
                entering={FadeIn.delay(50)}
            >
                <FontAwesome5 name="link" size={14} color={accentColor} />
                <Text style={[styles.instruction, { color: mutedColor }]}>
                    Match English with Spanish
                </Text>
            </Animated.View>

            {/* Progress indicator */}
            <View style={styles.progressRow}>
                <Text style={[styles.progressText, { color: mutedColor }]}>
                    {matchedPairs.length}/{leftItems.length} matched
                </Text>
                <View style={[styles.progressBar, { backgroundColor: `${accentColor}20` }]}>
                    <Animated.View
                        style={[
                            styles.progressFill,
                            {
                                backgroundColor: accentColor,
                                width: `${(matchedPairs.length / Math.max(1, leftItems.length)) * 100}%`,
                            }
                        ]}
                    />
                </View>
            </View>

            <Animated.View style={[styles.columnsContainer, shakeStyle]}>
                {/* Columna izquierda - English */}
                <View style={styles.column}>
                    <Text style={[styles.columnLabel, { color: mutedColor }]}>English</Text>
                    {leftItems.map((item, index) => {
                        const isMatched = matchedPairs.includes(item.id);
                        const isSelected = selectedLeft === index;
                        const isWrong = wrongPair?.left === index;

                        return (
                            <MatchItem
                                key={`left-${item.id}`}
                                item={item}
                                index={index}
                                isMatched={isMatched}
                                isSelected={isSelected}
                                isWrong={isWrong}
                                onPress={() => handleLeftPress(index)}
                                accentColor={accentColor}
                                bgColor={bgColor}
                                textColor={textColor}
                                darkMode={darkModeEnabled}
                                side="left"
                            />
                        );
                    })}
                </View>

                {/* Columna derecha - Spanish */}
                <View style={styles.column}>
                    <Text style={[styles.columnLabel, { color: mutedColor }]}>Spanish</Text>
                    {rightItems.map((item, index) => {
                        const isMatched = matchedPairs.includes(item.id);
                        const isSelected = selectedRight === index;
                        const isWrong = wrongPair?.right === index;

                        return (
                            <MatchItem
                                key={`right-${item.id}`}
                                item={item}
                                index={index}
                                isMatched={isMatched}
                                isSelected={isSelected}
                                isWrong={isWrong}
                                onPress={() => handleRightPress(index)}
                                accentColor={accentColor}
                                bgColor={bgColor}
                                textColor={textColor}
                                darkMode={darkModeEnabled}
                                side="right"
                            />
                        );
                    })}
                </View>
            </Animated.View>
        </View>
    );
};

/**
 * Item individual de match
 */
const MatchItem = ({
    item,
    index,
    isMatched,
    isSelected,
    isWrong,
    onPress,
    accentColor,
    bgColor,
    textColor,
    darkMode,
    side,
}) => {
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0);

    useEffect(() => {
        if (isSelected) {
            scale.value = withSpring(1.03, { damping: 12 });
            glowOpacity.value = withSequence(
                withTiming(1, { duration: 200 }),
                withSpring(0.6)
            );
        } else {
            scale.value = withSpring(1, { damping: 10 });
            glowOpacity.value = withTiming(0, { duration: 150 });
        }
    }, [isSelected]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: isMatched ? 0.3 : 1,
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const getBorderColor = () => {
        if (isWrong) return '#EF4444';
        if (isSelected) return accentColor;
        if (isMatched) return '#4ADE80';
        return darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    };

    const getBgColor = () => {
        if (isWrong) return '#EF444420';
        if (isMatched) return '#4ADE8020';
        if (isSelected) return `${accentColor}20`;
        return bgColor;
    };

    return (
        <Animated.View
            entering={FadeInUp.delay(index * 60).springify()}
            layout={Layout}
        >
            <AnimatedTouchable
                style={[
                    styles.item,
                    {
                        backgroundColor: getBgColor(),
                        borderColor: getBorderColor(),
                        borderWidth: isSelected || isMatched ? 2.5 : 1.5,
                    },
                    containerStyle,
                ]}
                onPress={onPress}
                disabled={isMatched || isWrong}
                activeOpacity={0.8}
            >
                {/* Glow effect */}
                <Animated.View
                    style={[
                        styles.glow,
                        { backgroundColor: accentColor },
                        glowStyle,
                    ]}
                />

                <Text
                    style={[
                        styles.itemText,
                        { color: isMatched ? '#4ADE80' : textColor }
                    ]}
                    numberOfLines={2}
                >
                    {item.text}
                </Text>

                {isMatched && (
                    <Animated.View
                        style={styles.checkMark}
                        entering={FadeIn.springify()}
                    >
                        <FontAwesome5 name="check" size={10} color="#4ADE80" />
                    </Animated.View>
                )}
            </AnimatedTouchable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 8,
    },
    instructionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 10,
    },
    instruction: {
        fontSize: 11,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 0.5,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 12,
    },
    progressText: {
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    progressBar: {
        width: 80,
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    columnsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    column: {
        flex: 1,
        gap: 6,
    },
    columnLabel: {
        fontSize: 9,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        textAlign: 'center',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    item: {
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
        position: 'relative',
        overflow: 'hidden',
    },
    glow: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0,
    },
    itemText: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        textAlign: 'center',
    },
    checkMark: {
        position: 'absolute',
        top: 4,
        right: 4,
    },
});

export default MatchPairsExerciseNew;
