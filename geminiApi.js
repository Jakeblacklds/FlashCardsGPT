// En tu archivo: /api/geminiApi.js

import { GoogleGenerativeAI } from '@google/generative-ai';
import Constants from 'expo-constants';

const geminiApiKey = Constants.expoConfig?.extra?.geminiApiKey;

if (!geminiApiKey) {
  throw new Error('No se encontró la clave API de Gemini. Por favor, configúrala en app.config.js o variables de entorno.');
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

/**
 * Genera flashcards (contenido de texto) usando Gemini.
 * @param {string} prompt El prompt para generar las flashcards.
 * @returns {Promise<string>} El texto generado.
 */
export const generateFlashcards = async (prompt) => {
  try {
    // Asegúrate de que 'gemini-1.5-flash-latest' u otro modelo de texto válido esté aquí.
    // 'gemini-2.0-flash-lite' no es un modelo de generación de texto estándar conocido.
    // Considera usar 'gemini-1.5-flash-latest' o el modelo de texto que estés utilizando.
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' }); // Ejemplo: 'gemini-1.5-flash-latest'
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error al generar contenido de texto con Gemini:', error);
    throw error;
  }
};

/**
 * Genera una imagen usando Gemini 2.0 Flash.
 * @param {string} promptText El prompt de texto para generar la imagen.
 * @returns {Promise<string|null>} La imagen generada como string base64, o null si falla.
 */
export const generateImageWithGemini = async (promptText) => {
  console.log("Intentando generar imagen con Gemini y el prompt:", promptText);
  try {
    const modelName = "gemini-2.5-flash-image";
    const model = genAI.getGenerativeModel({ model: modelName });

    // Construir la solicitud. La documentación que proporcionaste indica:
    // `responseModalities: ["TEXT", "IMAGE"]` debe incluirse en la configuración.
    // La forma más probable de pasar esto con el SDK @google/generative-ai es dentro de generationConfig.
    const requestPayload = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        // Intentamos pasar responseModalities aquí.
        // Si esto causa un error, puede que el SDK espere este parámetro de otra forma
        // para este modelo específico en vista previa, o que la documentación
        // se refiera a una estructura de llamada ligeramente diferente (ej. @google/genai SDK).
        // @ts-ignore // Para evitar errores de TypeScript si responseModalities no está en la definición estándar
        responseModalities: ["TEXT", "IMAGE"],
      }
    };

    console.log("Enviando solicitud a Gemini con payload:", JSON.stringify(requestPayload, null, 2));
    const result = await model.generateContent(requestPayload);
    const response = await result.response;

    console.log("Respuesta completa de Gemini (generación de imagen):", JSON.stringify(response, null, 2));

    if (!response.candidates || response.candidates.length === 0) {
      console.error("No se encontraron candidatos en la respuesta de Gemini.");
      if (response.promptFeedback?.blockReason) {
        const blockMessage = response.promptFeedback.blockReasonMessage || response.promptFeedback.blockReason;
        console.error(`Generación de imagen bloqueada. Razón: ${blockMessage}`);
        throw new Error(`Generación de imagen bloqueada: ${blockMessage}`);
      }
      throw new Error('No hubo candidatos en la respuesta de Gemini.');
    }

    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      console.error("No se encontraron partes de contenido en el candidato:", JSON.stringify(candidate, null, 2));
      if (candidate.finishReason && candidate.finishReason !== "STOP") {
        throw new Error(`La generación de imagen falló o se detuvo. Razón: ${candidate.finishReason}`);
      }
      // Si hay un promptFeedback con blockReason a nivel de respuesta general
      if (response.promptFeedback?.blockReason) {
        const blockMessage = response.promptFeedback.blockReasonMessage || response.promptFeedback.blockReason;
        throw new Error(`Generación de imagen bloqueada: ${blockMessage}`);
      }
      throw new Error('No se encontraron partes de contenido en el candidato de respuesta de Gemini.');
    }

    let imageBase64 = null;
    let responseText = null;

    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data && part.inlineData.mimeType?.startsWith("image/")) {
        imageBase64 = part.inlineData.data;
        console.log(`Datos de imagen encontrados, mimeType: ${part.inlineData.mimeType}`);
      } else if (part.text) {
        responseText = part.text;
        console.log("Parte de texto de la respuesta de Gemini: ", responseText);
      }
    }

    if (!imageBase64) {
      console.error("No se encontraron datos de imagen base64 en las partes de la respuesta:", candidate.content.parts);
      // Diagnósticos adicionales
      if (candidate.finishReason && candidate.finishReason !== "STOP" && candidate.finishReason !== "MAX_TOKENS") {
        throw new Error(`La generación de imagen falló o fue incompleta. Razón de finalización: ${candidate.finishReason}.`);
      } else if (response.promptFeedback?.blockReason) {
        const blockMessage = response.promptFeedback.blockReasonMessage || response.promptFeedback.blockReason;
        throw new Error(`Generación de imagen bloqueada: ${blockMessage}`);
      }
      throw new Error('Datos de imagen no encontrados en la respuesta de Gemini. El modelo pudo haber generado solo texto o encontrado un problema.');
    }

    return imageBase64; // Devolvemos solo la imagen base64 por ahora

  } catch (error) {
    console.error('Error detallado en generateImageWithGemini:', error);
    if (error.response && error.response.data) { // Si el error viene de una respuesta HTTP con datos
      console.error('Detalles del error de la API Gemini:', error.response.data);
      throw new Error(`Error de API Gemini: ${error.response.data.error?.message || JSON.stringify(error.response.data)}`);
    }
    // Para errores de validación de la solicitud o de la propia API de Gemini que no sean HTTP errors.
    if (error.message && error.message.toLowerCase().includes("please ensure that response_modalities is a valid")) {
      console.error("Error de validación: 'responseModalities' podría no ser un campo esperado en 'generationConfig' para esta versión del SDK o modelo. Revisa la documentación específica del SDK para 'gemini-2.0-flash-preview-image-generation'.");
    }
    throw new Error(`Fallo al generar imagen con Gemini: ${error.message || error}`);
  }
};