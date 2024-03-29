import axios from 'axios';
import { OPENAI_API_KEY } from '@env';  


const api = axios.create({
  baseURL: 'https://api.openai.com/v1',
});

export const chatWithGPT = async (message, mode) => {
  try {
    const previousMessages = [{ role: "user", content: message }];
    const response = await api.post('/chat/completions', {
      model: 'gpt-4-1106-preview',
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
  } catch (error) {
    console.error('Error chatting with GPT:', error);
    console.error(`Axios Error: ${error.response ? error.response.data : error.message}`);
    throw error;
  }
};


export const generateImageWithDalle = async (prompt) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/images/generations', {
      model: "dall-e-2",
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

