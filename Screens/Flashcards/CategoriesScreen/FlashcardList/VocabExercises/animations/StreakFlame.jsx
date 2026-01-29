import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withSpring,
    Easing,
    interpolate,
} from 'react-native-reanimated';

/**
 * StreakFlame - Fuego animado para mostrar racha de respuestas correctas
 * 
 * @param {number} streak - Número de respuestas correctas consecutivas
 * @param {boolean} visible - Si mostrar la animación
 */
const StreakFlame = ({ streak = 0, visible = true, size = 'medium' }) => {
    const flicker = useSharedValue(0);
    const scale = useSharedValue(1);
    const glow = useSharedValue(0);

    const sizes = {
        small: { container: 40, emoji: 20, text: 12 },
        medium: { container: 56, emoji: 28, text: 14 },
        large: { container: 72, emoji: 36, text: 18 },
    };

    const currentSize = sizes[size] || sizes.medium;

    // Intensidad basada en streak
    const intensity = Math.min(1, streak / 10);

    useEffect(() => {
        if (visible && streak >= 3) {
            // Animación de parpadeo constante
            flicker.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 150, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.7, { duration: 150, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );

            // Escala pulsante
            scale.value = withRepeat(
                withSequence(
                    withSpring(1 + intensity * 0.15, { damping: 10 }),
                    withSpring(1, { damping: 10 })
                ),
                -1,
                true
            );

            // Glow pulsante
            glow.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 400 }),
                    withTiming(0.5, { duration: 400 })
                ),
                -1,
                true
            );
        } else {
            flicker.value = withTiming(0, { duration: 200 });
            scale.value = withTiming(1, { duration: 200 });
            glow.value = withTiming(0, { duration: 200 });
        }
    }, [visible, streak]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: visible && streak >= 3 ? 1 : 0,
    }));

    const flameStyle = useAnimatedStyle(() => ({
        opacity: flicker.value,
        transform: [
            { translateY: interpolate(flicker.value, [0.7, 1], [0, -2]) },
        ],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glow.value * 0.4,
        transform: [{ scale: 1 + glow.value * 0.3 }],
    }));

    const getFlameEmoji = () => {
        if (streak >= 20) return '⚡🔥⚡';
        if (streak >= 10) return '🔥🔥🔥';
        if (streak >= 5) return '🔥🔥';
        return '🔥';
    };

    const getLabel = () => {
        if (streak >= 20) return 'LEGENDARY!';
        if (streak >= 10) return 'UNSTOPPABLE!';
        if (streak >= 5) return 'HOT STREAK!';
        return 'ON FIRE!';
    };

    if (streak < 3) return null;

    return (
        <Animated.View style={[styles.container, { width: currentSize.container }, containerStyle]}>
            {/* Glow background */}
            <Animated.View 
                style={[
                    styles.glowBg, 
                    { 
                        width: currentSize.container * 1.5, 
                        height: currentSize.container * 1.5,
                    },
                    glowStyle
                ]} 
            />
            
            {/* Flame emoji */}
            <Animated.View style={flameStyle}>
                <Text style={[styles.flame, { fontSize: currentSize.emoji }]}>
                    {getFlameEmoji()}
                </Text>
            </Animated.View>
            
            {/* Streak count */}
            <View style={[styles.countBadge, { backgroundColor: getBadgeColor(streak) }]}>
                <Text style={[styles.countText, { fontSize: currentSize.text * 0.7 }]}>
                    {streak}
                </Text>
            </View>
            
            {/* Label */}
            <Text style={[styles.label, { fontSize: currentSize.text * 0.6 }]}>
                {getLabel()}
            </Text>
        </Animated.View>
    );
};

const getBadgeColor = (streak) => {
    if (streak >= 20) return '#F59E0B';
    if (streak >= 10) return '#EF4444';
    if (streak >= 5) return '#F97316';
    return '#FB923C';
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowBg: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: '#F97316',
    },
    flame: {
        textAlign: 'center',
    },
    countBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    countText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    label: {
        color: '#F97316',
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        marginTop: 2,
        textShadowColor: 'rgba(249, 115, 22, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
});

export default StreakFlame;
