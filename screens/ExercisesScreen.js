import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux'; // Importa useSelector
import { selectDarkMode } from '../redux/darkModeSlice';// Asegúrate de que la ruta de importación es correcta

const ExercisesScreen = ({ navigation }) => {
    const darkModeEnabled = useSelector(selectDarkMode); // Usa useSelector para obtener el estado del modo oscuro

    const containerStyle = [
        styles.container,
        { backgroundColor: darkModeEnabled ? '#121212' : '#f4f1de' },
    ];

    const buttonStyle = [
        styles.button,
        {
            backgroundColor: darkModeEnabled ? '#3d405b' : '#3f37c9',
            borderColor: darkModeEnabled ? '#f4f1de' : '#3d405b',
        },
    ];

    const textStyle = [
        styles.buttonText,
        { color: darkModeEnabled ? '#f4f1de' : '#FFF3E0' },
    ];

    const subtextStyle = [
        styles.buttonSubtext,
        { color: darkModeEnabled ? '#f4f1de' : '#e07a5f' },
    ];

    return (
        <View style={containerStyle}>
            <TouchableOpacity
                style={buttonStyle}
                onPress={() => navigation.navigate('SelectCategoryScreen')}
            >
                <Text style={textStyle}>Comprobar Flashcards</Text>
                <Text style={subtextStyle}>Practica y mejora tu vocabulario</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={buttonStyle}
                onPress={() => {/* Implementar */}}
            >
                <Text style={textStyle}>Practicar Gramática y Vocabulario</Text>
                <Text style={subtextStyle}>Mejora tus habilidades lingüísticas</Text>
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

