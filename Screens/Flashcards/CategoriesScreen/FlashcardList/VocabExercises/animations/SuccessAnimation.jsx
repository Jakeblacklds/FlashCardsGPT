import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withDelay,
    withTiming,
    runOnJS,
    interpolateColor,
} from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';

/**
 * SuccessAnimation - Animación de partículas/confetti para respuestas correctas
 * 
 * Muestra múltiples partículas que explotan hacia afuera con colores
 */
const SuccessAnimation = ({ 
    visible = false, 
    onComplete,
    colors = ['#4ADE80', '#22D3EE', '#A78BFA', '#FBBF24', '#FB7185'],
    particleCount = 8,
    size = 120,
}) => {
    const particles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        angle: (360 / particleCount) * i,
        color: colors[i % colors.length],
    }));

    return (
        <View style={[styles.container, { width: size, height: size }]} pointerEvents="none">
            {visible && particles.map((particle) => (
                <Particle
                    key={particle.id}
                    angle={particle.angle}
                    color={particle.color}
                    delay={particle.id * 30}
                    size={size}
                    onComplete={particle.id === 0 ? onComplete : undefined}
                />
            ))}
            {visible && <CenterCheck size={size * 0.4} />}
        </View>
    );
};

/**
 * Partícula individual
 */
const Particle = ({ angle, color, delay, size, onComplete }) => {
    const progress = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        progress.value = withDelay(
            delay,
            withSpring(1, { damping: 8, stiffness: 100 })
        );
        opacity.value = withDelay(
            delay + 300,
            withTiming(0, { duration: 300 }, (finished) => {
                if (finished && onComplete) {
                    runOnJS(onComplete)();
                }
            })
        );
    }, []);

    const angleRad = (angle * Math.PI) / 180;
    const distance = size * 0.4;

    const animatedStyle = useAnimatedStyle(() => {
        const x = Math.cos(angleRad) * distance * progress.value;
        const y = Math.sin(angleRad) * distance * progress.value;
        const scale = 1 - progress.value * 0.5;

        return {
            transform: [
                { translateX: x },
                { translateY: y },
                { scale },
                { rotate: `${progress.value * 180}deg` },
            ],
            opacity: opacity.value,
        };
    });

    return (
        <Animated.View style={[styles.particle, animatedStyle]}>
            <View style={[styles.particleInner, { backgroundColor: color }]} />
        </Animated.View>
    );
};

/**
 * Check central animado
 */
const CenterCheck = ({ size }) => {
    const scale = useSharedValue(0);
    const rotation = useSharedValue(-45);

    useEffect(() => {
        scale.value = withSequence(
            withSpring(1.2, { damping: 6 }),
            withSpring(1, { damping: 10 })
        );
        rotation.value = withSpring(0, { damping: 8 });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { rotate: `${rotation.value}deg` },
        ],
    }));

    return (
        <Animated.View style={[styles.centerCheck, { width: size, height: size }, animatedStyle]}>
            <FontAwesome5 name="check" size={size * 0.5} color="#FFF" />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },
    particle: {
        position: 'absolute',
        width: 12,
        height: 12,
    },
    particleInner: {
        width: '100%',
        height: '100%',
        borderRadius: 6,
    },
    centerCheck: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: '#4ADE80',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4ADE80',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 15,
        elevation: 8,
    },
});

export default SuccessAnimation;
