import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const CARD_WIDTH = width * 0.45;
export const CARD_HEIGHT = 210;

/**
 * getContrastYIQ - Calcula el color de texto contrastante para un fondo dado
 */
export const getContrastYIQ = (hexcolor) => {
    if (!hexcolor) return '#fff';
    let hex = hexcolor.replace('#', '');
    if (hex.length === 8) hex = hex.substr(2);
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 180 ? '#222222' : '#ffffff';
};

/**
 * getStyles - Genera estilos dinámicos basados en modo oscuro y colores
 */
export const getStyles = (darkModeEnabled, colorPair) => {
    const safeTextColor = colorPair?.text || (darkModeEnabled ? '#FFF' : '#000');

    return StyleSheet.create({
        // Wrapper principal
        touchableWrapper: {
            marginVertical: 12,
            alignItems: 'center',
        },

        // Contenedor de imagen
        imageContainer: {
            ...StyleSheet.absoluteFillObject
        },
        backgroundImage: {
            width: '100%',
            height: '100%',
            resizeMode: 'cover'
        },
        imageLoader: {
            ...StyleSheet.absoluteFillObject,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1,
        },
        placeholderBackground: {
            ...StyleSheet.absoluteFillObject,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: darkModeEnabled ? '#0D0D12' : '#F2F2F7',
        },
        placeholderPattern: {
            ...StyleSheet.absoluteFillObject,
            opacity: 0.05,
        },
        gradientOverlay: {
            ...StyleSheet.absoluteFillObject,
            zIndex: 2
        },

        // Botón de menú
        menuButton: {
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 15,
            padding: 8,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
        },

        // Overlays de carga
        uploadOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
        },
        uploadText: {
            color: '#FFF',
            fontSize: 13,
            fontWeight: '700',
            marginTop: 12,
            textAlign: 'center',
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            letterSpacing: 1,
        },
        lottieOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.85)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 101,
        },
        lottie: {
            width: 100,
            height: 100
        },

        // Modal Blur
        blurView: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        },
        modalView: {
            width: Platform.OS === 'ios' ? '88%' : '92%',
            maxWidth: 400,
            backgroundColor: darkModeEnabled ? '#1C1C1E' : '#FFFFFF',
            borderRadius: 24,
            padding: 24,
            alignItems: 'center',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
        },

        // Modal de opciones
        optionModalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.75)',
        },
        optionModalBox: {
            width: 320,
            padding: 24,
            borderRadius: 24,
            backgroundColor: darkModeEnabled ? '#1A1A1A' : (colorPair?.background || '#6366F1'),
            borderWidth: 2,
            borderColor: darkModeEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
            // Sombra premium
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.5,
            shadowRadius: 30,
            elevation: 20,
        },
        optionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
        },
        optionHeaderDeco: {
            width: 8,
            height: 8,
            backgroundColor: colorPair?.text || '#FFF',
            transform: [{ rotate: '45deg' }],
            marginHorizontal: 10,
        },
        optionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colorPair?.text,
            textAlign: 'center',
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        optionButton: {
            marginBottom: 12,
            paddingVertical: 14,
            borderRadius: 12,
            backgroundColor: colorPair?.text,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: 'rgba(0,0,0,0.1)',
        },
        optionButtonDanger: {
            marginBottom: 16,
            paddingVertical: 14,
            borderRadius: 12,
            backgroundColor: '#dc3545',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: 'rgba(0,0,0,0.2)',
        },
        optionButtonCancel: {
            paddingVertical: 12,
            alignItems: 'center'
        },
        optionButtonText: {
            fontWeight: '700',
            fontSize: 14,
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            letterSpacing: 0.5,
        },
        optionButtonTextAccent: {
            color: colorPair?.background || '#6366F1'
        },
        optionButtonTextDanger: {
            color: '#fff'
        },
        optionButtonTextCancel: {
            fontSize: 14,
            color: '#fff',
            opacity: 0.85,
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        },

        // Modal Picker
        modalTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 12,
            color: darkModeEnabled ? '#fff' : '#000',
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            textTransform: 'uppercase',
        },
        modalText: {
            fontSize: 14,
            marginBottom: 20,
            textAlign: 'center',
            color: darkModeEnabled ? '#aaa' : '#555',
            fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        },
        modalButton: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 15,
            width: '100%',
            marginBottom: 10,
            backgroundColor: darkModeEnabled ? '#3a3a3a' : '#fff',
            borderRadius: 12,
            borderWidth: 2,
            borderColor: darkModeEnabled ? '#4a4a4a' : '#e0e0e0',
        },
        buttonIcon: {
            marginRight: 12
        },
        modalButtonText: {
            fontSize: 15,
            color: darkModeEnabled ? '#fff' : '#000',
            fontWeight: '600',
        },
        cancelButton: {
            marginTop: 10,
            padding: 10
        },
        cancelButtonText: {
            fontSize: 15,
            color: '#ff4757',
            fontWeight: '600',
        }
    });
};
