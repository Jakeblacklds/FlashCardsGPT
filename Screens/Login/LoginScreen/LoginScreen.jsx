import React, { useState } from 'react';
import { KeyboardAvoidingView, View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Platform } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setCurrentUserUID } from '../../../redux/FlashcardSlice'; 

const LoginScreen = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();
    const dispatch = useDispatch();

    // Solo debes usar el auth inicializado UNA VEZ en tu app principal
    const auth = getAuth(); // No vuelvas a hacer initializeApp(firebaseConfig) aquí

    const handleEmailChange = (text) => setEmail(text);
    const handlePasswordChange = (text) => setPassword(text);

    const handleSignIn = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Usuario logueado:", user.uid);

            // Ahora Redux manejará el UID globalmente
            dispatch(setCurrentUserUID(user.uid));

            if (props.onAuthenticated) {
                props.onAuthenticated();
            }
        } catch (error) {
            console.log("Error al loguear el usuario:", error);
            Alert.alert("Error", "No se pudo iniciar sesión", [{ text: "OK" }]);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={styles.topCurve} />
                <View style={styles.loginBox}>
                    <Text style={styles.title}>Hello</Text>
                    <Text style={styles.subtitle}>Sign into your Account</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Email ID"
                        placeholderTextColor="#666"
                        value={email}
                        onChangeText={handleEmailChange}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#666"
                        secureTextEntry
                        value={password}
                        onChangeText={handlePasswordChange}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                    <Text style={styles.registerText}>Don't have an account? Register Now</Text>
                </View>
                <View style={styles.bottomCurve} />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#8c4dff',
    },
    topCurve: {
        height: 200,
        width: '100%',
        backgroundColor: '#9c27b0',
        borderBottomLeftRadius: 220,
        borderBottomRightRadius: 220,
        position: 'absolute',
    },
    loginBox: {
        width: '90%',
        alignSelf: 'center',
        alignItems: 'center',
        top: 30,
        marginTop: 220,
        padding: 20,
        borderRadius: 25,
        backgroundColor: 'white',
        elevation: 5,
    },
    title: {
        fontSize: 24,
        color: '#4a148c',
        fontFamily: 'Pagebash',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#4a148c',
        textAlign: 'center',
        fontFamily: 'Pagebash',
        marginBottom: 40,
    },
    input: {
        width: '100%',
        height: 50,
        fontFamily: 'Pagebash',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 15,
        borderWidth: 1.5,
        borderColor: '#4a148c',
        color: '#333',
    },
    button: {
        width: '100%',
        backgroundColor: '#4a148c',
        borderRadius: 20,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 10,
        elevation: 3,
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontFamily: 'Pagebash',
    },
    registerText: {
        marginTop: 15,
        color: '#4a148c',
        fontFamily: 'Pagebash',
    },
    bottomCurve: {
        height: 200,
        width: '100%',
        backgroundColor: '#9c27b0',
        borderTopLeftRadius: 220,
        borderTopRightRadius: 220,
        top: 80,
        position: 'relative',
        bottom: 0,
    },
});

export default LoginScreen;
