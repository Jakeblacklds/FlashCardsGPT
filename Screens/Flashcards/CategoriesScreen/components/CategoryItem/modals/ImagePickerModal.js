import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

/**
 * ImagePickerModal - Modal para seleccionar origen de imagen
 * Permite elegir entre galería o generación con IA
 */
const ImagePickerModal = ({
    visible,
    onClose,
    styles,
    darkModeEnabled,
    categoryName,
    activeColorPair,
    onChooseFromGallery,
    onGenerateAI,
}) => {
    const handleGallery = () => {
        onClose();
        onChooseFromGallery();
    };

    const handleAI = () => {
        onClose();
        onGenerateAI();
    };

    return (
        <Modal
            transparent
            visible={visible}
            onRequestClose={onClose}
            animationType="slide"
        >
            <BlurView
                intensity={90}
                style={styles.blurView}
                tint={darkModeEnabled ? "dark" : "light"}
            >
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>
                        🎮 PERSONALIZAR
                    </Text>
                    <Text style={styles.modalText}>
                        Elige el arte para "{categoryName}"
                    </Text>

                    {/* Opción Galería */}
                    <TouchableOpacity
                        style={styles.modalButton}
                        onPress={handleGallery}
                    >
                        <Ionicons
                            name="images"
                            size={24}
                            color={activeColorPair?.background}
                            style={styles.buttonIcon}
                        />
                        <Text style={styles.modalButtonText}>
                            Galería de Fotos
                        </Text>
                    </TouchableOpacity>

                    {/* Opción IA */}
                    <TouchableOpacity
                        style={styles.modalButton}
                        onPress={handleAI}
                    >
                        <Ionicons
                            name="sparkles"
                            size={24}
                            color={activeColorPair?.background}
                            style={styles.buttonIcon}
                        />
                        <Text style={styles.modalButtonText}>
                            Generar con IA ✨
                        </Text>
                    </TouchableOpacity>

                    {/* Cancelar */}
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={onClose}
                    >
                        <Text style={styles.cancelButtonText}>
                            Cancelar
                        </Text>
                    </TouchableOpacity>
                </View>
            </BlurView>
        </Modal>
    );
};

export default ImagePickerModal;
