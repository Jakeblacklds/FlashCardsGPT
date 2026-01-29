import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withSpring,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';

/**
 * XPCounter - Contador animado de XP ganado
 * 
 * @param {number} value - XP actual
 * @param {number} gained - XP recién ganado (para animación)
 * @param {string} color - Color del contador
 */
const XPCounter = ({
    value = 0,
    gained = 0,
    color = '#F59E0B',
    size = 'medium',
    showGainedAnimation = true,
}) => {
    const [displayValue, setDisplayValue] = useState(value - gained);
    const [showGained, setShowGained] = useState(false);

    const scale = useSharedValue(1);
    const gainedY = useSharedValue(0);
    const gainedOpacity = useSharedValue(0);

    const sizes = {
        small: { text: 14, icon: 12, gained: 12 },
        medium: { text: 18, icon: 14, gained: 14 },
        large: { text: 24, icon: 18, gained: 18 },
    };

    const currentSize = sizes[size] || sizes.medium;

    useEffect(() => {
        if (gained > 0 && showGainedAnimation) {
            setShowGained(true);

            // Bounce del contador principal
            scale.value = withSequence(
                withSpring(1.2, { damping: 6 }),
                withSpring(1, { damping: 10 })
            );

            // Animación del número ganado
            gainedY.value = 0;
            gainedOpacity.value = 1;
            
            gainedY.value = withTiming(-30, { 
                duration: 800, 
                easing: Easing.out(Easing.cubic) 
            });
            gainedOpacity.value = withTiming(0, { 
                duration: 800 
            }, () => {
                runOnJS(setShowGained)(false);
            });

            // Contador numérico incremental
            const startValue = value - gained;
            const increment = gained / 20;
            let current = startValue;
            
            const interval = setInterval(() => {
                current += increment;
                if (current >= value) {
                    clearInterval(interval);
                    setDisplayValue(value);
                } else {
                    setDisplayValue(Math.floor(current));
                }
            }, 30);

            return () => clearInterval(interval);
        } else {
            setDisplayValue(value);
        }
    }, [value, gained]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const gainedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: gainedY.value }],
        opacity: gainedOpacity.value,
    }));

    return (
        <View style={styles.wrapper}>
            <Animated.View style={[styles.container, containerStyle]}>
                <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                    <FontAwesome5 name="star" size={currentSize.icon} color={color} solid />
                </View>
                <Text style={[styles.value, { fontSize: currentSize.text, color }]}>
                    {displayValue.toLocaleString()}
                </Text>
                <Text style={[styles.label, { fontSize: currentSize.text * 0.6, color: `${color}99` }]}>
                    XP
                </Text>
            </Animated.View>

            {/* Número ganado flotante */}
            {showGained && (
                <Animated.View style={[styles.gainedContainer, gainedStyle]}>
                    <Text style={[styles.gainedText, { fontSize: currentSize.gained, color }]}>
                        +{gained}
                    </Text>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'relative',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    iconContainer: {
        padding: 6,
        borderRadius: 8,
    },
    value: {
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    label: {
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    gainedContainer: {
        position: 'absolute',
        top: 0,
        right: -20,
    },
    gainedText: {
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
});

export default XPCounter;
