import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from '../firebase-config';
import { useNavigation } from '@react-navigation/native'; // Agregar la importación

const LoginScreen = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation(); // Utilizar useNavigation para la navegación

    const handleEmailChange = (text) => {
        setEmail(text);
    };

    const handlePasswordChange = (text) => {
        setPassword(text);
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const handleCreateAccount = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("Usuario creado");
            const user = userCredential.user;
            console.log(user);
            await AsyncStorage.setItem('user', JSON.stringify(user));
            if (props.onAuthenticated) {
                props.onAuthenticated();
            }
        } catch (error) {
            console.log("Error al crear el usuario");
            console.log(error);

            // Agregar una alerta sencilla
            Alert.alert(
                "Error",
                "El correo ya está registrado",
                [{ text: "OK" }]
            );
        }
    };

    const handleSignIn = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Usuario logueado");
            const user = userCredential.user;
            console.log(user);
            await AsyncStorage.setItem('user', JSON.stringify(user));
            if (props.onAuthenticated) {
                props.onAuthenticated();
            }
            navigation.navigate('TabNavigator');
        } catch (error) {
            console.log("Error al loguear el usuario");
            console.log(error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.loginBox}>
                <Text style={styles.title}>¡Bienvenido a tu App de Flashcards!</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Correo electrónico"
                    placeholderTextColor="#666"
                    value={email}
                    onChangeText={handleEmailChange}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    placeholderTextColor="#666"
                    secureTextEntry
                    value={password}
                    onChangeText={handlePasswordChange}
                />
                <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                    <Text style={styles.buttonText}>Iniciar Sesión</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.createAccountButton} onPress={handleCreateAccount}>
                    <Text style={styles.createAccountButtonText}>Crear Cuenta</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#34495E', // Cambiar el color de fondo a un tono más oscuro y atractivo
    },
    loginBox: {
        width: '80%',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#FFFFFF', // Cambiar el color del recuadro de inicio de sesión a blanco
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Pagebash',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        width: '100%',
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        color: '#333', // Cambiar el color del texto de entrada
    },
    button: {
        width: '100%',
        backgroundColor: '#3498DB', // Cambiar el color del botón de inicio de sesión
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: 'rgba(52, 152, 219, 0.5)', // Color del sombreado
        shadowOffset: { width: 0, height: 4 }, // Tamaño del sombreado
        shadowOpacity: 1, // Opacidad del sombreado
        shadowRadius: 8, // Radio del sombreado
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    createAccountButton: {
        width: '100%',
        backgroundColor: '#E74C3C', // Cambiar el color del botón Crear Cuenta
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: 'rgba(231, 76, 60, 0.5)', // Color del sombreado
        shadowOffset: { width: 0, height: 4 }, // Tamaño del sombreado
        shadowOpacity: 1, // Opacidad del sombreado
        shadowRadius: 8, // Radio del sombreado
    },
    createAccountButtonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Pagebash',
    },
});

export default LoginScreen;
