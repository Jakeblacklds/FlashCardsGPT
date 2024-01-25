import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CarouselLogin from '../components/CarouselLogin';

const screenHeight = Dimensions.get('window').height;

const IntroScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.carouselContainer}>
                <CarouselLogin />
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.buttonText}>Iniciar Sesión</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('RegisterScreen')}>
                    <Text style={styles.buttonText}>Crear Cuenta</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    carouselContainer: {
        position: 'absolute', // Posicionamiento absoluto para el carrusel
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        position: 'absolute', // Posicionamiento absoluto para los botones
        bottom: 20, // Espaciado desde la parte inferior
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#b5179e',
        padding: 10,
        borderRadius: 20,
        marginVertical: 10,
        width: '50%',
        alignSelf: 'center',
        bottom: 30,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        fontFamily:'Pagebash'
    }
});

export default IntroScreen;
