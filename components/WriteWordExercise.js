import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Animated } from 'react-native';

const WriteWordExercise = ({ word, onComplete, onMistake, colorPair }) => {
    const [userInput, setUserInput] = useState('');
    const [isCorrect, setIsCorrect] = useState(null);
    const [buttonOpacity] = useState(new Animated.Value(1));

    const handleSubmit = () => {
        Animated.timing(buttonOpacity, {
            toValue: 0.5,
            duration: 500,
            useNativeDriver: true
        }).start(() => {
            buttonOpacity.setValue(1);
            if (userInput.toLowerCase() === word.spanish.toLowerCase()) {
                setIsCorrect(true);
                Alert.alert("¡Correcto!", "Tu traducción es correcta.", [{ text: "Siguiente", onPress: onComplete }]);
            } else {
                setIsCorrect(false);
                Alert.alert("Incorrecto", "Intenta de nuevo.", [{ text: "OK", onPress: onMistake }]);
            }
        });
    };

    const dynamicStyles = StyleSheet.create({
        container: {
            backgroundColor: colorPair.background ,
            width: 400,
        },
        questionText: {
            color: colorPair.text || '#334E68',
        },
        input: {
            borderColor: colorPair.text || '#486581',
            color: colorPair.background,
        },
        submitButton: {
            backgroundColor: colorPair.text || '#3D5A80',
            opacity: buttonOpacity,
        },
        submitButtonText: {
            color: colorPair.background || '#FAF9F9',
        },
        errorText: {
            color: '#EF476F',
        },
        word: {
            position: 'absolute',
            top: '35%',
            color: colorPair.text || '#334E68',
            fontSize: 55,
            fontFamily: 'Pagebash',
            marginBottom: 20,
            
        },
    });

    return (
        <KeyboardAvoidingView style={{ flex: 1 }}>
            <View style={[styles.container, dynamicStyles.container]}>
                <Text style={[styles.questionText, dynamicStyles.questionText]}>Translate to Spanish </Text>
                <Text style={[dynamicStyles.word]}>{word.english}</Text>
                <TextInput
                    style={[styles.input, dynamicStyles.input]}
                    onChangeText={setUserInput}
                    value={userInput}
                    placeholder="Escribe la traducción aquí"
                    autoCapitalize="none"
                    placeholderTextColor={colorPair.background || '#BCCCDC'}
                />
                <Animated.View style={[styles.submitButton, dynamicStyles.submitButton]}>
                    <TouchableOpacity onPress={handleSubmit} style={styles.submitButtonTouchable}>
                        <Text style={[styles.submitButtonText, dynamicStyles.submitButtonText]}>Check</Text>
                    </TouchableOpacity>
                </Animated.View>
                {isCorrect === false && <Text style={styles.errorText}>Inténtalo de nuevo</Text>}
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        
        
        
    },
    questionText: {
        fontSize: 24,
        position: 'absolute',
        top: '30%',
        marginBottom: 25,
        fontFamily: 'Pagebash',
        textAlign: 'center',
    },
    input: {
        position: 'absolute',
        width: '60%',
        bottom: '30%',
        borderWidth: 2,
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        fontSize: 18,
        textAlign: 'center',
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    submitButton: {
        padding: 15,
        position: 'absolute',
        bottom: '20%',
        borderRadius: 10,
        shadowColor: '#000',
        width: '50%',
        
        
    },
    submitButtonTouchable: {
        justifyContent: 'center',
        alignItems: 'center',
       
    },
    submitButtonText: {
        color: 'black',
        fontSize: 20,
        fontFamily: 'Pagebash'
    },
    errorText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default WriteWordExercise;

