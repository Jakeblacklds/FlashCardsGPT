import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

/**
 * IncorrectFeedback - Animación de shake para respuestas incorrectas
 * 
 * @param {boolean} visible - Si mostrar la animación
 * @param {Function} onComplete - Callback cuando termina
 * @param {number} intensity - Intensidad del shake (1-3)
 */
const IncorrectFeedback = ({
    visible = false,
    onComplete,
    size = 60,
    color = '#EF4444',
    intensity = 2,
    haptic = true,
}) => {
    const translateX = useSharedValue(0);
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);
    const bgOpacity = useSharedValue(0);

    const shakeDistance = intensity * 8;
    const shakeDuration = 50;

    useEffect(() => {
        if (visible) {
            // Haptic feedback
            if (haptic) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }

            // Aparecer
            scale.value = withSpring(1, { damping: 10 });
            opacity.value = withTiming(1, { duration: 100 });

            // Flash de fondo rojo
            bgOpacity.value = withSequence(
                withTiming(0.3, { duration: 100 }),
                withTiming(0, { duration: 300 })
            );

            // Shake animation
            translateX.value = withSequence(
                withTiming(-shakeDistance, { duration: shakeDuration }),
                withTiming(shakeDistance, { duration: shakeDuration }),
                withTiming(-shakeDistance, { duration: shakeDuration }),
                withTiming(shakeDistance, { duration: shakeDuration }),
                withTiming(-shakeDistance / 2, { duration: shakeDuration }),
                withTiming(shakeDistance / 2, { duration: shakeDuration }),
                withTiming(0, { duration: shakeDuration }),
                // Fade out después del shake
                withTiming(0, { duration: 300 }, (finished) => {
                    if (finished) {
                        opacity.value = withTiming(0, { duration: 200 }, () => {
                            scale.value = 0;
                            if (onComplete) {
                                runOnJS(onComplete)();
                            }
                        });
                    }
                })
            );
        } else {
            scale.value = 0;
            opacity.value = 0;
            translateX.value = 0;
            bgOpacity.value = 0;
        }
    }, [visible]);

    const iconStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { scale: scale.value },
        ],
        opacity: opacity.value,
    }));

    const bgStyle = useAnimatedStyle(() => ({
        opacity: bgOpacity.value,
    }));

    return (
        <View style={styles.container} pointerEvents="none">
            {/* Background flash */}
            <Animated.View style={[styles.bgFlash, { backgroundColor: color }, bgStyle]} />

            {/* X icon */}
            <Animated.View 
                style={[
                    styles.iconCircle, 
                    { 
                        width: size, 
                        height: size, 
                        backgroundColor: color,
                        borderRadius: size / 2,
                    },
                    iconStyle
                ]}
            >
                <FontAwesome5 name="times" size={size * 0.5} color="#FFF" />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },
    bgFlash: {
        ...StyleSheet.absoluteFillObject,
    },
    iconCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 10,
    },
});

export default IncorrectFeedback;
