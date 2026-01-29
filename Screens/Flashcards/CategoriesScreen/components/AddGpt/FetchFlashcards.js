// Ubicación: Screens/Flashcards/CategoriesScreen/components/AddGpt/FetchFlashcards.js
import { generateFlashcards } from '../../../../../geminiApi'; // Ajusta tu ruta

export const fetchFlashcardsFromGPT = async (
    numFlashcards,
    category,
    selectedTags
) => {
    const tagsString =
        selectedTags && selectedTags.length > 0
            ? `Tags: ${selectedTags.join(', ')}`
            : '';

    const prompt = `
You generate bilingual flashcards for American learners of Spanish.

Create exactly ${numFlashcards} flashcards related to "${category}".
${tagsString}

OUTPUT: one flashcard per line (no extra lines, no numbering).
EXACT format:
"English: [word or phrase], Spanish: [translation], Type: [vocab|phrase|idiom|verb|adjective|noun], Rarity: [1-5], Emoji: [one emoji], Alternatives: [JSON]"

ALTERNATIVES (only when truly interchangeable):
Replacement Test = an alternative is valid ONLY if it can replace the Spanish term in a natural sentence without changing meaning.

Rules:
- If Rarity <= 2 → Alternatives: []
- Otherwise, include Alternatives ONLY if at least TWO valid alternatives pass the Replacement Test
- If fewer than 2 → Alternatives: []
- Max 3 alternatives
- Each alternative must be a single word or short expression (no explanatory phrases)

BANNED (never output as alternatives):
- Definitions/descriptions: "device used for...", "something that...", "person who..."
- Generic placeholders/words: "-", "N/A", "thing", "object", "device", "instrument", "element", "person"

Alternatives JSON format (single line):
[{"text":"...","rarity":"common|uncommon|rare"}]

EMOJI:
- Exactly ONE concrete emoji directly related to the core meaning
- Avoid abstract or generic emojis (💡📌📘)

FINAL:
- Use natural, standard Spanish
- Do not repeat English terms or Spanish translations across flashcards
- Return ONLY the flashcards
  `.trim();

    try {
        const response = await generateFlashcards(prompt);

        console.log('[IA fetchFlashcardsFromGPT] Raw response:', response);

        if (!response || typeof response !== 'string') {
            throw new Error('AI did not return valid data (check model or prompt).');
        }

        const flashcards = response
            .split('\n')
            .map(str => str.trim())
            .filter(Boolean);

        console.log('[IA fetchFlashcardsFromGPT] Processed flashcards:', flashcards);

        return flashcards;
    } catch (error) {
        console.error(
            'Error fetching data from Gemini in fetchFlashcardsFromGPT:',
            error
        );
        throw error;
    }
};
