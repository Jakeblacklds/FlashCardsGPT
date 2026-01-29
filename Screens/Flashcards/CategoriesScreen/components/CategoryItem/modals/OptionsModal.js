import React from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';

/**
 * OptionsModal - Modal de opciones para el cartucho
 * Permite editar, cambiar arte, quitar arte y eliminar
 */
const OptionsModal = ({
    visible,
    onClose,
    styles,
    categoryName,
    categoryImageUri,
    colorPair,
    onSelectImage,
    onDeleteImage,
    onDelete,
}) => {
    const handleEdit = () => {
        onClose();
        Alert.alert('Editar', `Renombrar: ${categoryName}`);
    };

    const handleChangeArt = () => {
        onClose();
        onSelectImage();
    };

    const handleRemoveArt = () => {
        onClose();
        onDeleteImage();
    };

    const handleDestroy = () => {
        onClose();
        Alert.alert(
            "⚠️ GAME OVER",
            `¿Eliminar "${categoryName}" y perder todas las flashcards?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: onDelete
                }
            ]
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.optionModalContainer}>
                <View style={styles.optionModalBox}>
                    {/* Header decorativo */}
                    <View style={styles.optionHeader}>
                        <View style={styles.optionHeaderDeco} />
                        <Text style={styles.optionTitle}>OPCIONES</Text>
                        <View style={styles.optionHeaderDeco} />
                    </View>

                    {/* Botón Editar */}
                    <TouchableOpacity
                        style={styles.optionButton}
                        onPress={handleEdit}
                    >
                        <Text style={[styles.optionButtonText, styles.optionButtonTextAccent]}>
                            ✎ EDITAR NOMBRE
                        </Text>
                    </TouchableOpacity>

                    {/* Botón Cambiar Arte */}
                    <TouchableOpacity
                        style={styles.optionButton}
                        onPress={handleChangeArt}
                    >
                        <Text style={[styles.optionButtonText, styles.optionButtonTextAccent]}>
                            🎨 CAMBIAR ARTE
                        </Text>
                    </TouchableOpacity>

                    {/* Botón Quitar Arte (solo si hay imagen) */}
                    {categoryImageUri && (
                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={handleRemoveArt}
                        >
                            <Text style={[styles.optionButtonText, styles.optionButtonTextAccent]}>
                                ✕ QUITAR ARTE
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Botón Eliminar */}
                    <TouchableOpacity
                        style={styles.optionButtonDanger}
                        onPress={handleDestroy}
                    >
                        <Text style={[styles.optionButtonText, styles.optionButtonTextDanger]}>
                            💀 DESTRUIR CARTUCHO
                        </Text>
                    </TouchableOpacity>

                    {/* Botón Cancelar */}
                    <TouchableOpacity
                        style={styles.optionButtonCancel}
                        onPress={onClose}
                    >
                        <Text style={styles.optionButtonTextCancel}>
                            ← VOLVER
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default OptionsModal;
