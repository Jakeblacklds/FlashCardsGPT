import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { selectDarkMode } from '../redux/darkModeSlice';
import { chatWithGPT, textToSpeech,transcribeAudio } from '../api';
import { startRecording, stopRecording, playAudio } from '../actions/audioHelpers';

const ChatScreen = () => {
    const darkModeEnabled = useSelector(selectDarkMode);
    const [recording, setRecording] = useState(null);

    const handleRecordPress = async () => {
        if (recording) {
            const uri = await stopRecording(recording);
            setRecording(null);
            handleSendAudio(uri);
        } else {
            const newRecording = await startRecording();
            setRecording(newRecording);
        }
    };

    const handleSendAudio = async (audioUri) => {
        const transcribedText = await transcribeAudio(audioUri); // Usa la función transcribeAudio para obtener el texto
        const reply = await chatWithGPT(transcribedText, 'default');
        const filePath = await textToSpeech(reply);
        playAudio(filePath); // Reproduce el audio generado por textToSpeech
    };
    
    return (
        <View style={[styles.container, { backgroundColor: darkModeEnabled ? '#121212' : '#F5F5F5' }]}>
            <TouchableOpacity style={styles.button} onPress={handleRecordPress}>
                <Text style={styles.buttonText}>{recording ? 'Detener' : 'Hablar'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
    },
});

export default ChatScreen;
