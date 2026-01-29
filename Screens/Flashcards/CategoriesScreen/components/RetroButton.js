import React, { useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

/**
 * RetroButton - Botón estilo Game Boy con efecto de profundidad
 * Soporta dos APIs:
 * - Nueva: icon (componente), iconName, label
 * - Legacy: text, icon (string), style
 */
const RetroButton = ({
    onPress,
    icon: Icon,
    iconName,
    iconSize = 24,
    color = '#6366F1',
    label,
    darkMode = false,
    size = 48,
    // Props legacy para compatibilidad con el modal
    text,
    style,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
            friction: 3,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 3,
        }).start();
    };

    // Si se usa la API legacy (text + icon como string), renderizar versión de texto
    if (text) {
        const iconNameResolved = typeof Icon === 'string' ? Icon : iconName;

        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[style]}
            >
                <Animated.View
                    style={[
                        styles.legacyButton,
                        {
                            backgroundColor: color,
                            transform: [{ scale: scaleAnim }],
                        }
                    ]}
                >
                    <View style={styles.legacyButtonHighlight} />
                    <View style={styles.legacyButtonContent}>
                        {iconNameResolved && (
                            <FontAwesome5
                                name={iconNameResolved}
                                size={16}
                                color="#FFFFFF"
                                style={{ marginRight: 10 }}
                            />
                        )}
                        <Text style={styles.legacyButtonText}>{text}</Text>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        );
    }

    // API nueva (botón circular con ícono)
    const shadowColor = darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)';
    const buttonShadow = darkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.25)';

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.container}
        >
            <Animated.View
                style={[
                    styles.buttonWrapper,
                    {
                        width: size,
                        height: size,
                        transform: [{ scale: scaleAnim }],
                    }
                ]}
            >
                {/* Shadow layer */}
                <View
                    style={[
                        styles.buttonShadow,
                        {
                            backgroundColor: buttonShadow,
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                        }
                    ]}
                />

                {/* Main button */}
                <View
                    style={[
                        styles.button,
                        {
                            backgroundColor: color,
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                        }
                    ]}
                >
                    {/* Top highlight */}
                    <View
                        style={[
                            styles.buttonHighlight,
                            {
                                borderRadius: size / 2,
                            }
                        ]}
                    />

                    {/* Icon or label */}
                    {Icon && iconName ? (
                        <Icon name={iconName} size={iconSize} color="#FFFFFF" />
                    ) : label ? (
                        <Text style={styles.buttonLabel}>{label}</Text>
                    ) : null}
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
};

/**
 * RetroIconButton - Variante con solo ícono, más pequeño
 */
export const RetroIconButton = ({
    onPress,
    icon: Icon,
    iconName,
    iconSize = 20,
    color = '#6366F1',
    darkMode = false,
}) => {
    return (
        <RetroButton
            onPress={onPress}
            icon={Icon}
            iconName={iconName}
            iconSize={iconSize}
            color={color}
            darkMode={darkMode}
            size={40}
        />
    );
};

/**
 * RetroTextButton - Variante con texto
 */
export const RetroTextButton = ({
    onPress,
    label,
    color = '#6366F1',
    darkMode = false,
}) => {
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            style={[styles.textButton, { backgroundColor: color }]}
        >
            <View style={styles.textButtonHighlight} />
            <Text style={styles.textButtonLabel}>{label}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        // Wrapper
    },
    buttonWrapper: {
        position: 'relative',
    },
    buttonShadow: {
        position: 'absolute',
        top: 4,
        left: 0,
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.15)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    buttonHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '40%',
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    // Estilos para la versión legacy (con texto)
    legacyButton: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.15)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    legacyButtonHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    legacyButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    legacyButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 1,
    },
    textButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.2)',
    },
    textButtonHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    textButtonLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        textAlign: 'center',
    },
});

export default RetroButton;
