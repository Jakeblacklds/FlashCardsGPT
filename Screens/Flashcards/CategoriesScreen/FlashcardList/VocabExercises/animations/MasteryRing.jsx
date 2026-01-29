import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedProps,
    withTiming,
    withSpring,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * MasteryRing - Anillo circular de progreso para mostrar nivel de dominio
 * 
 * @param {number} level - Nivel de dominio (0-5)
 * @param {number} progress - Progreso hacia el siguiente nivel (0-100)
 * @param {string} color - Color del anillo
 * @param {number} size - Tamaño del componente
 */
const MasteryRing = ({
    level = 0,
    progress = 0,
    color = '#4A90D9',
    size = 80,
    strokeWidth = 6,
    showLabel = true,
    showLevel = true,
    animated = true,
}) => {
    const animatedProgress = useSharedValue(0);
    const scale = useSharedValue(1);

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    useEffect(() => {
        if (animated) {
            animatedProgress.value = withTiming(progress / 100, {
                duration: 800,
                easing: Easing.out(Easing.cubic),
            });

            // Pequeña animación de escala cuando cambia
            scale.value = withSpring(1.05, { damping: 10 }, () => {
                scale.value = withSpring(1, { damping: 10 });
            });
        } else {
            animatedProgress.value = progress / 100;
        }
    }, [progress, animated]);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - animatedProgress.value),
    }));

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const getLevelEmoji = () => {
        const emojis = ['🥚', '🌱', '📖', '💪', '⭐', '🏆'];
        return emojis[Math.min(5, Math.max(0, level))];
    };

    const getLevelLabel = () => {
        const labels = ['NEW', 'LV.1', 'LV.5', 'LV.15', 'LV.30', 'MAX'];
        return labels[Math.min(5, Math.max(0, level))];
    };

    const bgColor = `${color}20`;

    return (
        <Animated.View style={[styles.container, { width: size, height: size }, containerStyle]}>
            <Svg width={size} height={size}>
                <G rotation="-90" origin={`${center}, ${center}`}>
                    {/* Background ring */}
                    <Circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke={bgColor}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Progress ring */}
                    <AnimatedCircle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        animatedProps={animatedProps}
                        strokeLinecap="round"
                    />
                </G>
            </Svg>

            {/* Center content */}
            <View style={styles.centerContent}>
                <Text style={[styles.emoji, { fontSize: size * 0.3 }]}>
                    {getLevelEmoji()}
                </Text>
                {showLevel && (
                    <Text style={[styles.levelText, { fontSize: size * 0.12, color }]}>
                        {getLevelLabel()}
                    </Text>
                )}
            </View>

            {/* Progress label */}
            {showLabel && (
                <View style={[styles.progressBadge, { backgroundColor: color }]}>
                    <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerContent: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emoji: {
        textAlign: 'center',
    },
    levelText: {
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        marginTop: 2,
    },
    progressBadge: {
        position: 'absolute',
        bottom: -4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        minWidth: 32,
        alignItems: 'center',
    },
    progressText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
});

export default MasteryRing;
