import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from '../firebase-config';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios'; // Asegúrate de que axios esté instalado
import { useDispatch } from 'react-redux';
import { setCurrentUserUID } from '../FlashcardSlice';

const LoginScreen = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const handleEmailChange = (text) => setEmail(text);
    const handlePasswordChange = (text) => setPassword(text);

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const handleSignIn = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Usuario logueado");
            const user = userCredential.user;
            await AsyncStorage.setItem('user', JSON.stringify({ uid: user.uid }));
            
            // Despacha la acción para establecer el UID del usuario
            dispatch(setCurrentUserUID(user.uid)); 
    
            if (props.onAuthenticated) {
                props.onAuthenticated();
            }
            navigation.navigate('TabNavigator');
        } catch (error) {
            console.log("Error al loguear el usuario:", error);
            Alert.alert("Error", "No se pudo iniciar sesión", [{ text: "OK" }]);
        }
    };

    const handleCreateAccount = async (modalEmail, modalPassword) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, modalEmail, modalPassword);
            console.log("Usuario creado");
            const user = userCredential.user;
    
            // UID del usuario
            const uid = user.uid;
    
            // Crear una estructura en Firebase para el nuevo usuario con una categoría y flashcard por defecto
            const newUserStructure = {
                categories: {
                    "Animales": {
                        "flashcards": {
                            "flashcard1": {
                                "english": "dog",
                                "spanish": "perro"
                            }
                        },
                        "name": "Animales"
                    }
                }
            };
    
            // URL con el UID del usuario
            const url = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${uid}.json`;
    
            const response = await axios.put(url, newUserStructure);
            console.log("Respuesta de Firebase:", response);
    
            setModalVisible(false);
            Alert.alert("Cuenta creada", "Ahora puedes iniciar sesión", [{ text: "OK" }]);
        } catch (error) {
            console.error("Error al crear el usuario en Firebase:", error);
            Alert.alert("Error", "No se pudo crear la cuenta", [{ text: "OK" }]);
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
                <TouchableOpacity style={styles.createAccountButton} onPress={() => setModalVisible(true)}>
                    <Text style={styles.createAccountButtonText}>Crear Cuenta</Text>
                </TouchableOpacity>
            </View>
            <CreateAccountModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onCreateAccount={handleCreateAccount}
            />
        </View>
    );
};

const CreateAccountModal = ({ visible, onClose, onCreateAccount }) => {
    const [modalEmail, setModalEmail] = useState('');
    const [modalPassword, setModalPassword] = useState('');

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalView}>
                <Text style={styles.title}>Crea Una Cuenta Nueva</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Correo electrónico"
                    onChangeText={setModalEmail}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    secureTextEntry
                    onChangeText={setModalPassword}
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => onCreateAccount(modalEmail, modalPassword)}
                >
                    <Text style={styles.buttonText}>Crear Cuenta</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={onClose}
                >
                    <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#34495E',
    },
    loginBox: {
        width: '80%',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
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
        textAlign: 'center',
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
        color: '#333',
    },
    button: {
        width: '100%',
        backgroundColor: '#3498DB',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: 'rgba(52, 152, 219, 0.5)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
    },
    buttonText: {
        fontFamily: 'Pagebash',
        color: 'white',
        fontSize: 18,
        
    },
    createAccountButton: {
        width: '50%',
        backgroundColor: '#E74C3C',
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: 'rgba(231, 76, 60, 0.5)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
    },
    createAccountButtonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Pagebash',
    },
    modalView: {
        top: '23%',
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 40,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
});

export default LoginScreen;