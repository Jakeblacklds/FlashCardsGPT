// Ubicación: Screens/Flashcards/CategoriesScreen/components/AddGpt/hooks/useFlashcardGeneration.js
import { useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { Keyboard, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Tus funciones externas
import { fetchFlashcardsFromGPT } from '../FetchFlashcards'; // ASEGÚRATE QUE ESTA RUTA ES CORRECTA
import { handleAddCategoryAndFlashcards } from '../HandleAddCategory'; // ESTA FUNCIÓN DEBE DEVOLVER categoryId

// Funciones de Gemini y DB local para imágenes
import { generateImageWithGemini } from '../../../../../../geminiApi'; // Ajusta tu ruta
import { upsertImage as upsertImageDb } from '../../../../../../db'; // Ajusta tu ruta

export const useFlashcardGeneration = (navigation, dispatch) => {
  const [debugMessage, setDebugMessage] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const isLoading = useSharedValue(false); // Tu SharedValue

  const handleGeneration = async (
    categoryName,
    numFlashcards,
    currentUserUID,
    selectedTags,
    imageStyleObject // El objeto de estilo seleccionado
  ) => {
    console.log('[useFlashcardGeneration] handleGeneration INICIADA.'); // <--- DEBUG
    setDebugMessage('Iniciando generación...');
    setLoadingMessage('Preparando...');
    isLoading.value = true;
    console.log('[useFlashcardGeneration] isLoading.value AHORA ES:', isLoading.value); // <--- DEBUG
    Keyboard.dismiss();

    if (!categoryName.trim()) {
      Alert.alert('Nombre Requerido', 'Por favor, ingresa un nombre para la categoría.');
      // Es importante resetear isLoading aquí si la función retorna prematuramente
      // aunque el 'finally' lo haría, es buena práctica ser explícito en retornos tempranos.
      // isLoading.value = false; // El 'finally' se encargará de esto.
      return;
    }
    if (!currentUserUID) {
      Alert.alert('Error de Usuario', 'No se pudo identificar al usuario.');
      // isLoading.value = false; // El 'finally' se encargará de esto.
      return;
    }

    let generatedCategoryId = null;

    try {
      setLoadingMessage('1/3 Creando categoría y flashcards...');
      setDebugMessage('Llamando a handleAddCategoryAndFlashcards...');

      const resultFromAddCategory = await handleAddCategoryAndFlashcards(
        categoryName,
        numFlashcards,
        currentUserUID,
        isLoading, // Pasando el SharedValue (aunque no se modifica directamente en la función llamada)
        dispatch,
        setShowSuccessModal, // Este setShowSuccessModal se refiere al del hook, no necesariamente al que maneja handleAdd...
        navigation,
        fetchFlashcardsFromGPT,
        selectedTags
      );

      if (typeof resultFromAddCategory === 'string' && resultFromAddCategory) {
        generatedCategoryId = resultFromAddCategory;
      } else if (typeof resultFromAddCategory === 'object' && resultFromAddCategory && resultFromAddCategory.id) {
        generatedCategoryId = resultFromAddCategory.id;
      } else {
        console.warn("[useFlashcardGeneration] handleAddCategoryAndFlashcards no devolvió un ID de categoría esperado. La imagen no se podrá asociar.");
        // Si handleAddCategoryAndFlashcards falla y muestra una alerta, puede que no necesitemos otra aquí.
        // Pero si no devuelve ID sin error aparente, es un problema.
        // No se lanza error aquí para permitir que el flujo continúe si las flashcards se crearon pero el ID falló.
      }

      setDebugMessage(`Categoría y flashcards procesadas. ID obtenido: ${generatedCategoryId}`);

      if (imageStyleObject && imageStyleObject.promptPrefix && generatedCategoryId) {
        setLoadingMessage('2/3 Generando imagen de categoría...');
        try {
          const imagePrompt = `${imageStyleObject.promptPrefix} ${categoryName}, category for a flashcard app, vibrant, high quality, clean design,detailed `;
          const base64ImageData = await generateImageWithGemini(imagePrompt);

          if (base64ImageData) {
            setLoadingMessage('3/3 Guardando imagen...');
            const filename = `category_image_${generatedCategoryId}_${Date.now()}.png`;
            const imagePath = `${FileSystem.cacheDirectory}${filename}`;

            await FileSystem.writeAsStringAsync(imagePath, base64ImageData, {
              encoding: FileSystem.EncodingType.Base64,
            });

            await upsertImageDb(generatedCategoryId, imagePath);
            setDebugMessage('¡Imagen de categoría generada y guardada localmente!');
          } else {
            setDebugMessage('Categoría creada, pero la IA no devolvió datos para la imagen.');
            // Considera una alerta si la imagen era esperada pero no se generó.
            Alert.alert("Advertencia de Imagen", "Las flashcards y categoría se crearon, pero no se generó la imagen.");
          }
        } catch (imageError) {
          console.error('[useFlashcardGeneration] Error generando o guardando imagen de categoría:', imageError);
          setDebugMessage(`Error con imagen: ${imageError.message}. Flashcards y categoría creadas.`);
          Alert.alert(
            "Advertencia de Imagen",
            "Las flashcards y la categoría se crearon, pero hubo un problema al generar o guardar la imagen."
          );
        }
      } else if (imageStyleObject && imageStyleObject.promptPrefix && !generatedCategoryId) {
        setDebugMessage('Se seleccionó estilo de imagen, pero no se pudo obtener el ID de la categoría para asociarla.');
        Alert.alert("Advertencia de Imagen", "No se pudo asociar la imagen porque faltó el ID de la categoría. Las flashcards y la categoría (si se crearon) podrían estar guardadas.");
      } else {
        setDebugMessage('Categoría creada. No se seleccionó estilo de imagen o se eligió "Ninguno".');
      }

      // Lógica de éxito y navegación:
      // Si handleAddCategoryAndFlashcards ya se encarga de setShowSuccessModal y la navegación tras éxito,
      // esta parte podría ser redundante o necesitar ajuste.
      // Basado en tu código original, handleAddCategoryAndFlashcards sí maneja esto.
      // Sin embargo, si generatedCategoryId no se obtuvo, es posible que handleAddCategoryAndFlashcards haya fallado
      // y ya haya mostrado una alerta.
      if (generatedCategoryId) { // Solo si la creación de categoría fue exitosa (implícito si tenemos ID)
        // `handleAddCategoryAndFlashcards` según tu código original maneja el success modal y navegación.
        // Si has movido esa lógica aquí, entonces descomenta y ajusta:
        /*
        setLoadingMessage('¡Proceso completado!');
        setShowSuccessModal(true); // El hook ahora maneja esto.
        setTimeout(() => {
            setShowSuccessModal(false);
            if (navigation.canGoBack()) {
                navigation.goBack();
            } else {
                navigation.navigate('Flashcards', { reload: true }); // O a donde deba ir
            }
        }, 2200);
        */
      } else {
          // Si no hay generatedCategoryId, `handleAddCategoryAndFlashcards` probablemente falló y ya manejó la alerta.
          // Si no falló pero no devolvió ID, es un problema en `handleAddCategoryAndFlashcards`.
          console.warn("[useFlashcardGeneration] El proceso de creación de categoría no resultó en un ID. Revisar `handleAddCategoryAndFlashcards`.");
          // Podrías mostrar una alerta genérica si no hay ID y no se intentó imagen,
          // pero es probable que `handleAddCategoryAndFlashcards` ya lo haya hecho.
      }

    } catch (error) {
      // Este catch captura errores lanzados por handleAddCategoryAndFlashcards
      // o errores en la lógica de este hook antes de esa llamada.
      console.error('[useFlashcardGeneration] Error en el proceso de generación principal:', error);
      setDebugMessage(`Error: ${error?.message || 'Desconocido'}`);
      Alert.alert('Error General', `Ocurrió un error durante la generación: ${error?.message || 'Intenta de nuevo.'}`);
    } finally {
      console.log('[useFlashcardGeneration] Bloque finally ALCANZADO. isLoading.value ANTES:', isLoading.value); // <--- DEBUG
      isLoading.value = false;
      console.log('[useFlashcardGeneration] isLoading.value AHORA ES (en finally):', isLoading.value); // <--- DEBUG
      setLoadingMessage('');
      // setDebugMessage(''); // Opcional: limpiar mensaje de debug al final
    }
  };

  return {
    debugMessage,
    loadingMessage,
    showSuccessModal,
    isLoading, // El SharedValue
    handleGeneration,
    setDebugMessage, // Si necesitas modificarlo desde fuera
    setShowSuccessModal, // Si necesitas modificarlo desde fuera
  };
};