import Constants from 'expo-constants';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';

// Obtener la API key desde Constants.expoConfig

const { openaiApiKey  } = Constants.expoConfig?.extra || {};


const api = axios.create({
  baseURL: 'https://api.openai.com/v1',
});

export const chatWithGPT = async (conversationHistory, mode) => {
  const messages = conversationHistory.map(msg => ({
    
    role: msg.isUser ? "user" : "assistant",
    content: msg.text,
  }));

 
  
  const response = await api.post('/chat/completions', {
   
    model: 'gpt-3.5-turbo-1106',
    messages: messages,
    temperature: mode === 'roleplay' ? 0.7 : 1.0,
    max_tokens: 500,
  }, {
    headers: {
      'Authorization': `Bearer ${openaiApiKey }`,
      'Content-Type': 'application/json',
      
    },
  });
  return response.data.choices[0].message.content.trim();
};

export const transcribeAudio = async (audioUri) => {
  const fileInfo = await FileSystem.getInfoAsync(audioUri);
  if (fileInfo.size > 25 * 1024 * 1024) {
    throw new Error("El archivo excede el límite de tamaño de 25 MB.");
  }

  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'audio.m4a',
  });
  formData.append('model', 'whisper-1');

  console.log('Enviando archivo de audio a la API de OpenAI');
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey }`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Error al transcribir el audio: ${response.statusText}`);
  }

  const data = await response.json();
  return data.text;
};

const base64Encode = (arrayBuffer) => {
  const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const bytes = new Uint8Array(arrayBuffer);
  let base64 = '';

  for (let i = 0; i < bytes.length; i += 3) {
    const byte1 = bytes[i];
    const byte2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const byte3 = i + 2 < bytes.length ? bytes[i + 2] : 0;

    const chunk = (byte1 << 16) | (byte2 << 8) | byte3;

    const char1 = base64Chars.charAt((chunk >> 18) & 0x3F);
    const char2 = base64Chars.charAt((chunk >> 12) & 0x3F);
    const char3 = i + 1 < bytes.length ? base64Chars.charAt((chunk >> 6) & 0x3F) : '=';
    const char4 = i + 2 < bytes.length ? base64Chars.charAt(chunk & 0x3F) : '=';

    base64 += char1 + char2 + char3 + char4;
  }

  return base64;
};

export const textToSpeech = async (text, voice = 'alloy') => {
  console.log('Convirtiendo texto a voz:', text);
  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey }`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: voice,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const contentType = response.headers.get('content-type');
    if (!contentType.includes('audio')) {
      throw new Error('Response is not an audio file');
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64String = base64Encode(arrayBuffer);
    const uri = `${FileSystem.documentDirectory}${Date.now()}.mp3`;
    await FileSystem.writeAsStringAsync(uri, base64String, { encoding: FileSystem.EncodingType.Base64 });
    return uri;
  } catch (error) {
    console.error('Error converting text to speech:', error);
    throw error;
  }
};

export const generateImageWithDalle = async (prompt) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/images/generations', {
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024"
    }, {
      headers: {
        'Authorization': `Bearer ${openaiApiKey }`,
        'Content-Type': 'application/json',
      },
    });

    const imageUrl = response.data.data[0].url; 
    return imageUrl;
  } catch (error) {
    console.error('Error generating image with DALL·E:', error);
    throw error;
  }
};
