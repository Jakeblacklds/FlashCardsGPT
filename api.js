import axios from 'axios';
import { OPENAI_API_KEY } from '@env';
import * as FileSystem from 'expo-file-system';

const api = axios.create({
  baseURL: 'https://api.openai.com/v1',
});

export const chatWithGPT = async (message, mode) => {
  const previousMessages = [{ role: "user", content: message }];

  
  const response = await api.post('/chat/completions', {
    model: 'gpt-3.5-turbo-1106',
    messages: previousMessages,
    temperature: mode === 'roleplay' ? 0.7 : 1.0,
    max_tokens: 500,
  }, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data.choices[0].message.content.trim();
};


export const transcribeAudio = async (audioUri) => {
  const fileInfo = await FileSystem.getInfoAsync(audioUri);
  if (fileInfo.size > 25 * 1024 * 1024) { // 25 MB
    throw new Error("El archivo excede el límite de tamaño de 25 MB.");
  }

  // Primero, leemos el archivo como un 'blob'
  const blob = await (await fetch(audioUri)).blob();

  // Creamos un objeto FormData y agregamos el archivo de audio
  let formData = new FormData();
  formData.append('file', blob, 'audio.mp3'); // Asegúrate de que la extensión del archivo coincida con el formato real del audio
  formData.append('model', 'whisper-1');

  // Realizamos la solicitud
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Error al transcribir el audio: [Error: HTTP error! status: ${response.status}]`);
  }

  const data = await response.json();
  return data.text;
};





export const textToSpeech = async (text, voice = 'alloy') => {
  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
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

    const blob = await response.blob();
    const filePath = `${FileSystem.documentDirectory}${Date.now()}.mp3`;
    await FileSystem.writeAsStringAsync(filePath, await blob.text(), { encoding: FileSystem.EncodingType.Base64 });
    return filePath;
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
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
