import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const ExercisesScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('SelectCategoryScreen')}
            >
                <Text style={styles.buttonText}>Comprobar Flashcards</Text>
                <Text style={styles.buttonSubtext}>Practica y mejora tu vocabulario</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.button}
                onPress={() => {/* Implementar */}}
            >
                <Text style={styles.buttonText}>Practicar Gramática y Vocabulario</Text>
                <Text style={styles.buttonSubtext}>Mejora tus habilidades lingüísticas</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f1de',
    },
    button: {
        backgroundColor: '#e07a5f',
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#3d405b',
        paddingVertical: 20, // Hacer el botón más grande verticalmente
        paddingHorizontal: 30, // Hacer el botón más grande horizontalmente
        marginVertical: 15, // Añadir espacio entre botones verticalmente
        alignItems: 'center', // Centrar el contenido horizontalmente
    },
    buttonText: {
        color: '#FFF3E0',
        fontFamily: 'Pagebash',
        fontSize: 18, // Aumentar el tamaño del texto
        textAlign: 'center',
    },
    buttonSubtext: {
        color: '#43291f',
        fontFamily: 'Pagebash',
        fontSize: 14, // Tamaño de fuente para el subtexto
        marginTop: 5, // Espacio entre el texto principal y el subtexto
    },
});

export default ExercisesScreen;

