
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
import RadialGradient from 'react-native-radial-gradient';
import { chatWithGPT } from '../api';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('grammar');
  const animationValue = useRef(new Animated.Value(0)).current;

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
    <View style={[styles.container, containerStyle]}>
      <View style={styles.switchContainer}>
        <Text style={textStyle}>Gramática</Text>
        <Switch
          value={mode === 'roleplay'}
          onValueChange={toggleMode}
          trackColor={{ false: 'purple', true: '#007BFF' }}
          thumbColor={mode === 'grammar' ? 'white' : 'white'} // Cambia el color del interruptor
          style={styles.switch}
        />
        <Text style={textStyle}>Roleplay</Text>
      </View>
      <ScrollView style={styles.chat}>
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              { backgroundColor: message.sender === 'gpt' ? '#E5E5E5' : 'white' },
            ]}
          >
            <Text style={[styles.messageText, textStyle]}>{message.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, textStyle]}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={mode === 'grammar' ? 'white' : 'lightblue'}
        />
        <TouchableOpacity
          style={[styles.sendButton, sendButtonStyle]}
          onPress={handleSendMessage}
        >
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#f2cc8f',
    margin: 10,
    marginTop: 70,
  },
  chat: {
    flex: 1,
    padding: 10,
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
    backgroundColor: '#f2cc8f',
    borderRadius: 10,
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
