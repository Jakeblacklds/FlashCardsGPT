import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSelector } from 'react-redux';
import { selectDarkMode } from '../redux/darkModeSlice';
import { chatWithGPT } from '../api';
import * as Animatable from 'react-native-animatable';

const ChatScreen = () => {
  const darkModeEnabled = useSelector(selectDarkMode);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('grammar');


  useEffect(() => {
    if (mode === 'grammar') {
      setMessages([{ sender: 'gpt', text: '¡Hola! ¿Qué tema quieres aprender hoy?' }]);
    } else {
      setMessages([{ sender: 'gpt', text: 'Hola! ¿Sobre qué quieres que hablemos?' }]);
    }
  }, [mode]);

  const handleSendMessage = async () => {
    try {
      let promptMessage;

      if (mode === 'grammar') {
        promptMessage = `
          1. Solo debes responder preguntas sobre el español. Si alguien pregunta algo diferente responde "Lo siento, solamente puedo responder tus preguntas sobre el español".
          2. No debes realizar resúmenes de textos o tareas extensas. Si alguien lo pide, responde "Lo siento, solamente puedo responder tus preguntas sobre el español".
          3. Si una pregunta es ambigua, debes pedir aclaraciones.
          Ahora, responde a la siguiente pregunta: "${input}"`;
      } else {
        promptMessage = `Actúa siempre como si fueras una persona que quiere empezar la conversación sobre el tema pedido. Las respuestas deben ser concisas pero no demasiado largas. Ahora, comencemos la conversación: "${input}"`;
      }

      const reply = await chatWithGPT(promptMessage, mode);
      setMessages(prevMessages => [...prevMessages, { sender: 'user', text: input }, { sender: 'gpt', text: reply }]);
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const toggleMode = () => {
    if (mode === 'grammar') {
      setMode('roleplay');
      setMessages([{ sender: 'gpt', text: 'Hola! ¿Sobre qué quieres que hablemos?' }]);
    } else {
      setMode('grammar');
      setMessages([{ sender: 'gpt', text: '¡Hola! ¿Qué tema quieres aprender hoy?' }]);
    }
  };

  // Estilos dinámicos basados en el modo
  const containerStyle = {
    backgroundColor: mode === 'grammar' ? '#f4f1de' : '#3d405b',
  };

  const textStyle = {
    color: mode === 'grammar' ? '#43291f' : 'black',
  };

  const sendButtonStyle = {
    backgroundColor: mode === 'grammar' ? '#e07a5f' : '#81b29a',
  };

 
  return (
    
    <View style={[styles.container, { backgroundColor: darkModeEnabled ? '#121212' : '#F5F5F5' }]}>
      <View style={styles.switchContainer}>
        <Text style={[styles.text, { color: darkModeEnabled ? '#D3D3D3' : 'black' }]}>Gramática</Text>
        <Switch
          value={mode === 'roleplay'}
          onValueChange={toggleMode}
          trackColor={{ false: 'purple', true: '#007BFF' }}
          thumbColor={darkModeEnabled ? 'white' : 'white'}
        />
        <Text style={[styles.text, { color: darkModeEnabled ? '#D3D3D3' : 'black' }]}>Roleplay</Text>
      </View>
      <ScrollView 
      style={[styles.chat, { borderColor: darkModeEnabled ? '#434753' : '#3F37C9' }]}
      >
  {messages.map((message, index) => (
    <View
      key={index}
      style={[
        styles.messageContainer,
        { backgroundColor: darkModeEnabled ? '#434753' : (message.sender === 'gpt' ? '#E5E5E5' : 'white') },
      ]}
    >
      {message.sender === 'gpt' ? (
        <Animatable.Text
          animation="fadeInLeft" // Puedes personalizar la animación según tus preferencias
          style={[
            styles.messageText,
            { color: darkModeEnabled ? '#D3D3D3' : (mode === 'grammar' ? '#43291f' : 'black') },
          ]}
        >
          {message.text}
        </Animatable.Text>
      ) : (
        <Text
          style={[
            styles.messageText,
            { color: darkModeEnabled ? '#D3D3D3' : (mode === 'grammar' ? '#43291f' : 'black') },
          ]}
        >
          {message.text}
        </Text>
      )}
    </View>
  ))}
</ScrollView>
      <View style={[styles.inputContainer, { color: darkModeEnabled ? '#D3D3D3' : 'black', backgroundColor: darkModeEnabled ? '#434753' : '#3F37C9' }]}>
        <TextInput
          style={[styles.input, { color: darkModeEnabled ? '#D3D3D3' : 'black', backgroundColor: darkModeEnabled ? '#434753' : 'white' }]}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={darkModeEnabled ? '#A9A9A9' : 'grey'}
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: darkModeEnabled ? '#434753' : (mode === 'grammar' ? '#e07a5f' : '#81b29a') }]}
          onPress={handleSendMessage}
        >
          <Text style={[styles.sendButtonText, { color: darkModeEnabled ? '#D3D3D3' : 'white' }]}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    padding: 10,
    paddingTop: 70,
  },
  chat: {
    flex: 1,
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 3,
    borderColor: '#3F37C9',
  },
  user: {
    textAlign: 'right',
    color: '#81b29a',
  },
  gpt: {
    color: '#f2cc8f',
  },
  messageContainer: {
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    

  },
  messageText: {
    fontFamily: 'Pagebash',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  input: {
    flex: 1,
    borderColor: '#3d405b',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  switch: {
    alignSelf: 'center',
    marginHorizontal: 5,
  },
  sendButton: {
    fontFamily: 'Pagebash',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontFamily: 'Pagebash',
    color: 'white',
    
  },
});


export default ChatScreen;
