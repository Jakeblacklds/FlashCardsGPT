import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from '../../Auth/firebase-config';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setCurrentUserUID } from '../../redux/FlashcardSlice';

const RegisterScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const handleCreateAccount = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("User created");
            const user = userCredential.user;

            await AsyncStorage.setItem('user', JSON.stringify({ uid: user.uid }));

            dispatch(setCurrentUserUID(user.uid));

            const newUserStructure = {
                categories: {
                    "Animals": {
                        "flashcards": {
                            "flashcard1": {
                                "english": "dog",
                                "spanish": "perro"
                            }
                        },
                        "name": "Animals"
                    }
                }
            };

            const url = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${user.uid}.json`;
            await axios.put(url, newUserStructure);

            Alert.alert("Account created", "You can now log in", [{ text: "OK" }]);
            navigation.navigate('Login');
        } catch (error) {
            console.error("Error creating user:", error);
            Alert.alert("Error", "Account creation failed", [{ text: "OK" }]);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.topCurve} />
            <View style={styles.registerBox}>
                <Text style={styles.title}>Create a New Account</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleCreateAccount}
                >
                    <Text style={styles.buttonText}>Create Account</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.bottomCurve} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4361ee',
    },
    topCurve: {
        height: 210,
        width: '100%',
        backgroundColor: '#3f37c9',
        borderBottomLeftRadius: 200,
        borderBottomRightRadius: 200,
        position: 'absolute',
        top: 0,
    },
    registerBox: {
        width: '90%',
        alignSelf: 'center',
        alignItems: 'center',
        marginTop: 220,
        padding: 20,
        borderRadius: 25,
        backgroundColor: 'white',
        top: 30,
        elevation: 5,
    },
    title: {
        fontFamily: 'Pagebash',
        fontSize: 24,
        color: '#4361ee',
        textAlign: 'center',
    },
    input: {
        width: '100%',
        marginTop: 20,
        height: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        paddingHorizontal: 15,
        fontFamily: 'Pagebash',
        fontSize: 16,
        marginBottom: 15,
        borderWidth: 1.5,
        borderColor: '#4361ee',
        color: '#333',
    },
    button: {
        width: '100%',
        backgroundColor: '#3f37c9',
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
    bottomCurve: {
        height: 220,
        width: '100%',
        backgroundColor: '#3f37c9',
        borderTopLeftRadius: 220,
        borderTopRightRadius: 220,
        top: 85,
    },
});

export default RegisterScreen;
