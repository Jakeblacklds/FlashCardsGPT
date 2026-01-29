import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    interpolateColor,
    FadeInUp,
    FadeOutDown,
    Layout,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * AnimatedOption - Botón de opción animado para ejercicios
 * 
 * Incluye animaciones de entrada, selección, correcto/incorrecto
 * 
 * @param {string} text - Texto de la opción
 * @param {Function} onPress - Callback al presionar
 * @param {boolean} selected - Si está seleccionada
 * @param {string} state - 'default' | 'correct' | 'incorrect' | 'disabled'
 * @param {number} index - Índice para delay de animación
 */
const AnimatedOption = ({
    text,
    onPress,
    selected = false,
    state = 'default',
    index = 0,
    accentColor = '#4A90D9',
    darkMode = false,
    disabled = false,
}) => {
    const scale = useSharedValue(1);
    const colorProgress = useSharedValue(0);

    const bgDefault = darkMode ? '#2a2a4e' : '#FFF';
    const textDefault = darkMode ? '#FFF' : '#333';
    const borderDefault = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    const handlePressIn = () => {
        scale.value = withSpring(0.96, { damping: 15 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 10 });
    };

    const handlePress = () => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
    };

    // Actualizar color basado en estado
    React.useEffect(() => {
        switch (state) {
            case 'correct':
                colorProgress.value = withTiming(1, { duration: 200 });
                break;
            case 'incorrect':
                colorProgress.value = withTiming(2, { duration: 200 });
                break;
            case 'selected':
                colorProgress.value = withTiming(3, { duration: 150 });
                break;
            default:
                colorProgress.value = withTiming(0, { duration: 150 });
        }
    }, [state]);

    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            colorProgress.value,
            [0, 1, 2, 3],
            [bgDefault, '#4ADE8030', '#EF444430', `${accentColor}20`]
        );

        const borderColor = interpolateColor(
            colorProgress.value,
            [0, 1, 2, 3],
            [borderDefault, '#4ADE80', '#EF4444', accentColor]
        );

        return {
            transform: [{ scale: scale.value }],
            backgroundColor,
            borderColor,
            borderWidth: colorProgress.value > 0 ? 2 : 1.5,
        };
    });

    const textAnimStyle = useAnimatedStyle(() => {
        const color = interpolateColor(
            colorProgress.value,
            [0, 1, 2, 3],
            [textDefault, '#4ADE80', '#EF4444', accentColor]
        );

        return { color };
    });

    return (
        <Animated.View 
            entering={FadeInUp.delay(index * 80).springify().damping(15)}
            exiting={FadeOutDown.duration(200)}
            layout={Layout}
        >
            <AnimatedTouchable
                style={[styles.container, animatedStyle]}
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
                disabled={disabled || state === 'correct' || state === 'incorrect'}
            >
                <Animated.Text style={[styles.text, textAnimStyle]} numberOfLines={2}>
                    {text}
                </Animated.Text>

                {/* Indicador de estado */}
                {state === 'correct' && (
                    <Animated.View 
                        style={styles.stateIcon}
                        entering={FadeInUp.springify()}
                    >
                        <Text style={styles.stateEmoji}>✓</Text>
                    </Animated.View>
                )}
                {state === 'incorrect' && (
                    <Animated.View 
                        style={styles.stateIcon}
                        entering={FadeInUp.springify()}
                    >
                        <Text style={styles.stateEmoji}>✗</Text>
                    </Animated.View>
                )}
            </AnimatedTouchable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    text: {
        fontSize: 15,
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        textAlign: 'center',
        flex: 1,
    },
    stateIcon: {
        position: 'absolute',
        right: 12,
    },
    stateEmoji: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default AnimatedOption;
