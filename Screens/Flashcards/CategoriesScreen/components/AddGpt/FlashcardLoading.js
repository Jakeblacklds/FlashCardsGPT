// Ubicación: Screens/Flashcards/CategoriesScreen/components/AddGpt/FlashcardLoading.js
import React from 'react';
import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import styles from './AddGpt.styles'; // Tus estilos para fullScreenOverlay, modalContent, loadingText

export const LoadingOverlay = ({ isLoading, loadingMessage }) => { // `isLoading` aquí es el SHARED VALUE
    const modalAnimatedStyle = useAnimatedStyle(() => {
        const isActive = isLoading.value; // Leer el valor del SharedValue
        return {
            opacity: withTiming(isActive ? 1 : 0, { duration: 150 }), // Duración corta para aparecer rápido
            // Usar un zIndex alto cuando está activo para asegurar que esté encima de otros elementos.
            // El zIndex del estilo estático styles.fullScreenOverlay (999) puede ser suficiente si
            // este componente solo controla la opacidad.
            // Pero para ser explícitos y controlar desde Reanimated:
            zIndex: isActive ? 1000 : -1, // Un zIndex alto
            // Opcional: controlar display para quitarlo del layout completamente cuando no está activo
            // display: isActive ? 'flex' : 'none',
        };
    });

    // Imprimir para depuración (puedes quitarlo después)
    // console.log('[LoadingOverlay] isLoading.value:', isLoading?.value, 'Msg:', loadingMessage);

    // Si no quieres que ocupe espacio cuando está invisible (display: 'none' en el estilo animado)
    // O si quieres evitar el renderizado del contenido interno:
    // if (!isLoading.value && modalAnimatedStyle.value.opacity === 0) {
    //     return null; // Esto podría causar el problema de "opacity of undefined" si LinearGradient es sensible.
    // }
    // Es más seguro siempre renderizar el Animated.View y controlar con opacity/zIndex.

    return (
        // Aplicar el zIndex de styles.fullScreenOverlay como base, y el modalAnimatedStyle lo anulará si es necesario.
        // Si quitaste zIndex de styles.fullScreenOverlay, entonces modalAnimatedStyle es el único controlador.
        <Animated.View style={[styles.fullScreenOverlay, modalAnimatedStyle]}>
            <View style={styles.modalContent}>
                <LottieView
                    source={require('../../../../../assets/loadflash.json')} // Verifica bien esta ruta
                    autoPlay
                    loop
                    style={{ width: 300, height: 300 }} // Tu estilo original
                />
                <Text style={styles.loadingText}>
                    {loadingMessage || 'Generando Flashcards...'} {/* Usa el loadingMessage */}
                </Text>
            </View>
        </Animated.View>
    );
};

export const SuccessModal = ({ showSuccessModal }) => {
    // showSuccessModal es un booleano normal de useState
    const successModalAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(showSuccessModal ? 1 : 0, { duration: 300 }),
            zIndex: showSuccessModal ? 1001 : -1, // Incluso más alto que el loading overlay
            transform: [{ translateY: withTiming(showSuccessModal ? 0 : -150) }], // Ajusta para que se oculte bien
        };
    });

    return (
        // Asegúrate que styles.successModal tenga position: 'absolute' y un `top` inicial
        // (ej. top: 40, o el valor que usaste en tu style.successModal.top)
        <Animated.View style={[styles.successModal, successModalAnimatedStyle]}>
            <Text style={styles.successModalText}>Flashcards Created!</Text>
        </Animated.View>
    );
};