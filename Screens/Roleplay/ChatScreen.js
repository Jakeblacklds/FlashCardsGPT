import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { chatWithGPT, textToSpeech, transcribeAudio } from '../../api';
import RecordButton from './RecordButton';
import MessageBubble from './MessageBubble';

const ChatScreen = () => {
  const [recording, setRecording] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [sound, setSound] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [textInput, setTextInput] = useState('');

  const startRecording = async () => {
    try {
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log('Recording started');
    } catch (error) {
      console.log('Error al iniciar la grabación:', error);
    }
  };

  const stopRecording = async () => {
    try {
      console.log('Stopping recording..');
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
      setRecording(null);
      processAudio(uri);
    } catch (error) {
      console.log('Error al detener la grabación:', error);
    }
  };

  const processAudio = async (audioUri) => {
    setIsProcessing(true);
    try {
      const transcribedText = await transcribeAudio(audioUri);
      console.log('Transcribed Text:', transcribedText);

      const newUserMessage = { text: transcribedText, isUser: true };
      const updatedHistory = [...conversationHistory, newUserMessage];
      setConversationHistory(updatedHistory);
      console.log('Updated History after user message:', updatedHistory);

      const gptResponse = await chatWithGPT(updatedHistory, 'roleplay');
      console.log('Sending to GPT:', { updatedHistory });
      console.log('GPT Response:', gptResponse);

      const newBotMessage = { text: gptResponse, isUser: false };
      const finalHistory = [...updatedHistory, newBotMessage];
      setConversationHistory(finalHistory);
      console.log('Final Updated History after GPT response:', finalHistory);

      const speechFilePath = await textToSpeech(gptResponse);
      await playAudio(speechFilePath);
    } catch (error) {
      console.log('Error al procesar el audio:', error);
    }
    setIsProcessing(false);
  };

  const playAudio = async (audioUri) => {
    try {
      console.log('Loading Sound');
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      setSound(sound);
      console.log('Playing Sound');
      await sound.playAsync();
    } catch (error) {
      console.log('Error al reproducir el audio:', error);
    }
  };

  const sendMessage = async () => {
    if (textInput.trim().length === 0) return;
    setIsProcessing(true);
    try {
      const newUserMessage = { text: textInput.trim(), isUser: true };
      const updatedHistory = [...conversationHistory, newUserMessage];
      setConversationHistory(updatedHistory);
      setTextInput('');
      console.log('Updated History after user message:', updatedHistory);

      const gptResponse = await chatWithGPT(updatedHistory, 'roleplay');
      console.log('Sending to GPT:', { updatedHistory });
      console.log('GPT Response:', gptResponse);

      const newBotMessage = { text: gptResponse, isUser: false };
      const finalHistory = [...updatedHistory, newBotMessage];
      setConversationHistory(finalHistory);
      console.log('Final Updated History after GPT response:', finalHistory);

      // Remove the call to textToSpeech here
      // const speechFilePath = await textToSpeech(gptResponse);
      // await playAudio(speechFilePath);
    } catch (error) {
      console.log('Error al enviar el mensaje de texto:', error);
    }
    setIsProcessing(false);
  };

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messagesContainer}>
        {conversationHistory.map((message, index) => (
          <MessageBubble key={index} text={message.text} isUser={message.isUser} />
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={textInput}
          onChangeText={setTextInput}
          placeholder="Escribe un mensaje"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={isProcessing}>
          <Icon name="send" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.recordButton}
          onPressIn={startRecording}
          onPressOut={stopRecording}
          disabled={isProcessing}
        >
          <Icon name="mic" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
  },
  recordButton: {
    padding: 10,
  },
});

export default ChatScreen;
