import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withSpring,
    withTiming,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';

/**
 * CorrectFeedback - Animación de check mark para respuestas correctas
 * 
 * @param {boolean} visible - Si mostrar la animación
 * @param {Function} onComplete - Callback cuando termina
 * @param {number} size - Tamaño del check
 */
const CorrectFeedback = ({
    visible = false,
    onComplete,
    size = 60,
    color = '#4ADE80',
}) => {
    const scale = useSharedValue(0);
    const rotation = useSharedValue(-45);
    const glowOpacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            // Aparecer con bounce
            scale.value = withSequence(
                withSpring(1.3, { damping: 6, stiffness: 200 }),
                withSpring(1, { damping: 10 })
            );

            // Rotación suave
            rotation.value = withSpring(0, { damping: 12, stiffness: 100 });

            // Glow pulsante
            glowOpacity.value = withSequence(
                withTiming(1, { duration: 200 }),
                withTiming(0.3, { duration: 300 }),
                withTiming(0, { duration: 500 }, (finished) => {
                    if (finished && onComplete) {
                        runOnJS(onComplete)();
                    }
                })
            );
        } else {
            scale.value = withTiming(0, { duration: 150 });
            rotation.value = -45;
            glowOpacity.value = 0;
        }
    }, [visible]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { rotate: `${rotation.value}deg` },
        ],
        opacity: scale.value > 0 ? 1 : 0,
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
        transform: [{ scale: 1.5 }],
    }));

    return (
        <View style={[styles.container, { width: size, height: size }]} pointerEvents="none">
            {/* Glow */}
            <Animated.View 
                style={[
                    styles.glow, 
                    { 
                        width: size, 
                        height: size, 
                        backgroundColor: color,
                        borderRadius: size / 2,
                    },
                    glowStyle
                ]} 
            />

            {/* Check circle */}
            <Animated.View 
                style={[
                    styles.checkCircle, 
                    { 
                        width: size, 
                        height: size, 
                        backgroundColor: color,
                        borderRadius: size / 2,
                    },
                    containerStyle
                ]}
            >
                <FontAwesome5 name="check" size={size * 0.5} color="#FFF" />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },
    glow: {
        position: 'absolute',
    },
    checkCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4ADE80',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 10,
    },
});

export default CorrectFeedback;
