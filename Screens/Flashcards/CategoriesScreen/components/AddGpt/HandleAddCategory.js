// Ubicación: Screens/Flashcards/CategoriesScreen/components/AddGpt/HandleAddCategory.js
import axios from 'axios';
import { Alert } from 'react-native';
import { fetchCategories } from '../../../../../redux/FlashcardSlice';
import { getAuth } from 'firebase/auth';

export const handleAddCategoryAndFlashcards = async (
    category,               // 1. categoryName
    numFlashcards,          // 2. numFlashcards
    currentUserUID,         // 3. currentUserUID
    isLoadingParam,         // 4. El objeto `isLoading` (SharedValue) que se pasa desde useFlashcardGeneration
    dispatch,               // 5. dispatch
    setShowSuccessModal,    // 6. setShowSuccessModal
    navigation,             // 7. navigation
    fetchFlashcardsFromGPT, // 8. AHORA SÍ es la función fetchFlashcardsFromGPT
    selectedTags            // 9. selectedTags
) => {
    if (!category.trim()) {
        Alert.alert('Error', 'Por favor, ingresa un nombre para la categoría.');
        return null;
    }
    if (numFlashcards <= 0) {
        Alert.alert('Error', 'Por favor, ingresa un número válido de flashcards.');
        return null;
    }
    if (!currentUserUID) {
        console.error('UID de usuario no disponible en handleAddCategoryAndFlashcards');
        Alert.alert('Error', 'UID de usuario no disponible.');
        return null;
    }

    let generatedFlashcards;
    try {
        generatedFlashcards = await fetchFlashcardsFromGPT(numFlashcards, category, selectedTags);
    } catch (fetchError) {
        console.error('Error al llamar a fetchFlashcardsFromGPT en HandleAddCategory:', fetchError);
        Alert.alert('Error de IA', `No se pudieron generar las flashcards: ${fetchError.message}`);
        throw fetchError;
    }

    if (!generatedFlashcards || generatedFlashcards.length === 0) {
        console.warn('fetchFlashcardsFromGPT no devolvió flashcards en HandleAddCategory.');
        Alert.alert('Sin Flashcards', 'La IA no generó flashcards para esta categoría.');
        return null;
    }

    const formattedFlashcards = generatedFlashcards.map((flashcardText, index) => {
        const parts = flashcardText.split(', ');

        // Helper para obtener valores sin importar si la etiqueta está en inglés o español
        const getValue = (part, englishLabel, spanishLabel) => {
            if (!part) return null;
            const lowerPart = part.toLowerCase();
            if (lowerPart.includes(englishLabel.toLowerCase() + ':') ||
                lowerPart.includes(spanishLabel.toLowerCase() + ':')) {
                const colonIndex = part.indexOf(':');
                return part.substring(colonIndex + 1).trim();
            }
            return null;
        };

        // Parsear con soporte para etiquetas en inglés (nuevo prompt) y español (anterior)
        const englishPart = getValue(parts[0], 'English', 'Inglés') || parts[0]?.split(': ')[1] || `Error-Eng-${index}`;
        const spanishPart = getValue(parts[1], 'Spanish', 'Español') || parts[1]?.split(': ')[1] || `Error-Esp-${index}`;
        const typePart = (getValue(parts[2], 'Type', 'Tipo') || parts[2]?.split(': ')[1] || 'vocab').toLowerCase();
        const rarityPart = parseInt(getValue(parts[3], 'Rarity', 'Rareza') || parts[3]?.split(': ')[1]) || 1;
        const emojiPart = getValue(parts[4], 'Emoji', 'Emoji') || parts[4]?.split(': ')[1] || '📚';

        // Parsear variantes (ahora llamadas Alternatives en el prompt en inglés)
        let variants = [];
        const alternativesPartRaw = getValue(parts[5], 'Alternatives', 'Variantes') ||
            parts[5]?.split('Variantes: ')[1] ||
            parts[5]?.split('Alternatives: ')[1];

        if (alternativesPartRaw) {
            try {
                const parsed = JSON.parse(alternativesPartRaw);
                if (Array.isArray(parsed)) {
                    const UNLOCK_LEVELS = { common: 2, uncommon: 5, rare: 8 };
                    variants = parsed.map((variant, vIndex) => ({
                        text: variant.text || '',
                        rarity: variant.rarity || 'common',
                        level: vIndex + 1,
                        unlockAtWordLevel: UNLOCK_LEVELS[variant.rarity] || 2
                    }));
                }
            } catch (e) {
                console.warn(`Error parsing variants for index ${index}:`, e);
                variants = [];
            }
        }

        const validTypes = ['vocab', 'phrase', 'idiom', 'verb', 'adjective', 'noun'];
        const type = validTypes.includes(typePart) ? typePart : 'vocab';
        const rarity = Math.min(5, Math.max(1, rarityPart));

        return {
            english: englishPart,
            spanish: spanishPart,
            type,
            rarity,
            icon: emojiPart,
            variants,
            variant1: variants[0]?.text || null,
            variant2: variants[1]?.text || null,
            variant3: variants[2]?.text || null,
            userProgress: {
                currentLevel: 0,
                xp: 0,
                timesCorrect: 0,
                timesIncorrect: 0,
                lastPracticed: null
            }
        };
    });

    const flashcardsObject = formattedFlashcards.reduce((obj, item, index) => {
        obj[`flashcard${index + 1}`] = item;
        return obj;
    }, {});

    try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            throw new Error("Usuario no autenticado. Por favor, inicia sesión de nuevo.");
        }

        const token = await user.getIdToken(true);
        const categoryKey = encodeURIComponent(category);
        const categoryUrl = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories/${categoryKey}.json?auth=${token}`;

        await axios.put(categoryUrl, {
            name: category,
            flashcards: flashcardsObject,
        });

        dispatch(fetchCategories());

        if (setShowSuccessModal && navigation) {
            setShowSuccessModal(true);
            setTimeout(() => {
                if (navigation.canGoBack()) {
                    navigation.goBack();
                } else {
                    navigation.navigate('Flashcards', { reload: true });
                }
                setShowSuccessModal(false);
            }, 1000);
        }

        return category;

    } catch (error) {
        console.error('Error añadiendo categoría y flashcards a Firebase:', error.response ? error.response.data : error.message);
        Alert.alert('Error en Firebase', `No se pudieron guardar los datos: ${error.response?.data?.error || error.message}`);
        throw error;
    }
};