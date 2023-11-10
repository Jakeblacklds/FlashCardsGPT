import axios from 'axios';
import { OPENAI_API_KEY } from '@env';  // Asegúrate de que @env es el módulo correcto y está configurado correctamente


const api = axios.create({
  baseURL: 'https://api.openai.com/v1',
});

export const chatWithGPT = async (message, mode) => {
  try {
    const previousMessages = [{ role: "user", content: message }];
    const response = await api.post('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: previousMessages,
      temperature: mode === 'roleplay' ? 0.7 : 1.0,
      max_tokens: 500,
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,  // Mueve la autorización al momento de la llamada
        'Content-Type': 'application/json',
      },
    });
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error chatting with GPT:', error);
    console.error(`Axios Error: ${error.response ? error.response.data : error.message}`);
    throw error;
  }
};

