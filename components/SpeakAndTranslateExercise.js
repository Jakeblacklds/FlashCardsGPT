import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import * as SpeechRecognizer from 'expo-speech-recognition'; // Asegúrate de que este módulo esté disponible

const SpeakAndTranslateExercise = ({ word, onComplete, onMistake, colorPair }) => {
    const [isListening, setIsListening] = useState(false);
    
    useEffect(() => {
        SpeechRecognition.getPermissionsAsync()
            .then(status => {
                if (status !== 'granted') {
                    SpeechRecognition.requestPermissionsAsync();
                }
            });
    }, []);

    const startListening = async () => {
        setIsListening(true);
        let result = await SpeechRecognizer.startAsync({
            language: 'es-ES',
            onSpeechEnd: () => {
                setIsListening(false);
                verifyAnswer(result);
            },
        });
    };

    const verifyAnswer = (result) => {
        if (result && result.transcript.toLowerCase() === word.spanish.toLowerCase()) {
            onComplete();
        } else {
            onMistake();
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Traduce esta palabra al español:</Text>
            <Text style={{ fontSize: 30, color: colorPair.text }}>{word.english}</Text>
            <TouchableOpacity onPress={startListening} style={{ marginTop: 20 }}>
                <Text style={{ color: colorPair.text }}>Presiona para hablar</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SpeakAndTranslateExercise;
