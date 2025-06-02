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

    // Puedes ignorar `isLoadingParam` si no lo necesitas aquí.
    // console.log('isLoadingParam recibido en HandleAddCategory:', isLoadingParam);


    let generatedFlashcards;
    try {
        // Ahora `fetchFlashcardsFromGPT` debería ser la función correcta.
        generatedFlashcards = await fetchFlashcardsFromGPT(numFlashcards, category, selectedTags);
    } catch (fetchError) {
        console.error('Error al llamar a fetchFlashcardsFromGPT en HandleAddCategory:', fetchError);
        Alert.alert('Error de IA', `No se pudieron generar las flashcards: ${fetchError.message}`);
        throw fetchError; // Relanzar para que useFlashcardGeneration lo capture
    }
    
    if (!generatedFlashcards || generatedFlashcards.length === 0) {
        console.warn('fetchFlashcardsFromGPT no devolvió flashcards en HandleAddCategory.');
        Alert.alert('Sin Flashcards', 'La IA no generó flashcards para esta categoría.');
        return null; 
    }

    const formattedFlashcards = generatedFlashcards.map((flashcardText, index) => {
        const parts = flashcardText.split(', ');
        const englishPart = parts[0]?.includes(': ') ? parts[0].split(': ')[1] : `Error-Inglés-${index}`;
        const spanishPart = parts[1]?.includes(': ') ? parts[1].split(': ')[1] : `Error-Español-${index}`;
        const variant1Part = parts[2]?.includes(': ') ? parts[2].split(': ')[1] : null;
        const variant2Part = parts[3]?.includes(': ') ? parts[3].split(': ')[1] : null;
        const variant3Part = parts[4]?.includes(': ') ? parts[4].split(': ')[1] : null;
        return { english: englishPart, spanish: spanishPart, variant1: variant1Part, variant2: variant2Part, variant3: variant3Part };
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
        
        return category; // Devolver el nombre de la categoría como ID

    } catch (error) {
        console.error('Error añadiendo categoría y flashcards a Firebase:', error.response ? error.response.data : error.message);
        Alert.alert('Error en Firebase', `No se pudieron guardar los datos: ${error.response?.data?.error || error.message}`);
        throw error; // Relanzar para que useFlashcardGeneration lo capture
    } 
};