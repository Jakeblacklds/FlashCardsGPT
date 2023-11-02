import axios from 'axios';
import { OPENAI_API_KEY } from '@env';  // Importar la variable de entorno

const api = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,  // Uso de la variable de entorno
    'Content-Type': 'application/json',
  },
});

export const chatWithGPT = async (message, mode) => {
  try {
    const previousMessages = [{ role: "user", content: message }];
    const response = await api.post('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: previousMessages,
        temperature: mode === 'roleplay' ? 0.7 : 1.0,
        max_tokens: 500,
    });
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error chatting with GPT:', error);
    throw error;
  }
};
