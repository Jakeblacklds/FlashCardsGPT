// Ubicación: Screens/Flashcards/CategoriesScreen/components/AddGpt/FetchFlashcards.js
import { generateFlashcards } from '../../../../../geminiApi'; // Ajusta tu ruta

export const fetchFlashcardsFromGPT = async (numFlashcards, category, selectedTags /* isLoading ya no se necesita aquí o no se usa para modificar */) => {
    const tagsString = selectedTags.length > 0 ? `Etiquetas: ${selectedTags.join(', ')}` : '';
    const prompt = `
Eres un generador de flashcards bilingües especializado en vocabulario de inglés a español para estudiantes mexicanos.

Crea exactamente ${numFlashcards} flashcards relacionadas con la categoría "${category}".${tagsString}

Sigue estas reglas estrictamente:
- Cada flashcard debe tener el formato:
"Inglés: [palabra o frase en inglés], Español: [traducción en español], Variante 1: [sinónimo o frase alternativa en español], Variante 2: [sinónimo o frase alternativa en español, opcional], Variante 3: [sinónimo o frase alternativa en español, opcional]"
- Las variantes SOLO deben ser en español.
- Siempre incluye al menos una variante. Si existen más, incluye hasta 3.
- Si no hay variantes posibles, escribe solo "Variante 1: -"
- NO agregues nada más fuera de la estructura, ni explicaciones, ni numeración.
- No uses puntos al final de cada línea ni salto de línea extra.
- No repitas palabras.
- Si no hay variantes posibles no las hagas para no poner espacios vacios
- Usa vocabulario útil, actual y natural para estudiantes mexicanos.
- Si hay etiquetas proporcionadas, intégralas en la selección de palabras: ${tagsString}

Devuelve solo las flashcards, una por línea, siguiendo la estructura. No incluyas encabezados ni instrucciones adicionales.
    `;

    try {
        // isLoading.value = true; // --- ELIMINADO ---
        const response = await generateFlashcards(prompt);

        console.log('[IA fetchFlashcardsFromGPT] Respuesta cruda:', response);

        if (!response || typeof response !== "string") {
            // isLoading.value = false; // --- ELIMINADO ---
            throw new Error("La IA no devolvió datos válidos (revisa tu modelo o prompt).");
        }

        const flashcards = response
            .split('\n')
            .map(str => str.trim())
            .filter(Boolean);

        console.log('[IA fetchFlashcardsFromGPT] Flashcards procesadas:', flashcards);

        // isLoading.value = false; // --- ELIMINADO ---
        return flashcards;
    } catch (error) {
        console.error('Error al obtener datos de Gemini en fetchFlashcardsFromGPT:', error);
        // isLoading.value = false; // --- ELIMINADO ---
        throw error; // Relanzar el error para que la función llamadora lo maneje
    }
};