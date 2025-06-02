// En tu archivo: /components/CategoryItem.js (o la ruta correcta)

import React, { useState, useEffect, useMemo } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Image,
  Modal,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { FontAwesome, Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system'; // Importa expo-file-system

import { selectDarkMode } from '../../../../redux/darkModeSlice';
import { fetchImage, upsertImage, deleteImage } from '../../../../db';
// Ajusta la ruta de importación si es necesario
import { generateImageWithGemini } from '../../../../geminiApi'; // <--- CAMBIO AQUÍ
import { fetchFlashcardCountByCategory, selectFlashcardCount } from '../../../../redux/FlashcardSlice';
import { getRandomColorPair } from '../../../../constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = 180;

const CategoryItem = ({ category, onPress, onDelete, initialColorPair, initialImageUri }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const colorPair = useMemo(() => initialColorPair || getRandomColorPair(), [initialColorPair]);
  const [categoryImageUri, setCategoryImageUri] = useState(initialImageUri || null);
  const [isImagePickerModalVisible, setImagePickerModalVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const darkModeEnabled = useSelector(selectDarkMode);
  const currentUserUID = useSelector(state => state.flashcards.currentUserUID);
  const dispatch = useDispatch();
  const { showActionSheetWithOptions } = useActionSheet();

  const categoryId = typeof category === 'string' ? category : category?.id;
  const categoryName = typeof category === 'string' ? category : category?.name; // Para el prompt
  const flashcardCount = useSelector(state => selectFlashcardCount(state, categoryId));

  useEffect(() => {
    let isMounted = true;
    if (!initialImageUri && categoryId) {
      setIsLoading(true);
      fetchImage(categoryId)
        .then(imageData => {
          if (isMounted && imageData) {
            setCategoryImageUri(imageData.uri);
          }
        })
        .catch(console.error)
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    } else if (initialImageUri) {
      setCategoryImageUri(initialImageUri);
    }
    return () => { isMounted = false; };
  }, [categoryId, initialImageUri]);

  useEffect(() => {
    if (currentUserUID && categoryId) {
      dispatch(fetchFlashcardCountByCategory(currentUserUID, categoryId));
    }
  }, [currentUserUID, categoryId, dispatch]);

  const handleDelete = () => onDelete(categoryId);
  const handleSelectImage = () => setImagePickerModalVisible(true);

  const handleChooseFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        if (!imageUri) {
          throw new Error('No se pudo obtener la URI de la imagen');
        }
        setIsLoading(true);
        await upsertImage(categoryId, imageUri);
        setCategoryImageUri(imageUri);
        setImageLoaded(false);
        Alert.alert('Éxito', 'Imagen guardada correctamente');
      }
    } catch (error) {
      console.error('Error en handleChooseFromGallery:', error);
      Alert.alert('Error', `No se pudo seleccionar la imagen: ${error.message || error}`);
    } finally {
      setIsLoading(false);
      setImagePickerModalVisible(false);
    }
  };

  // Renombrado de handleGenerateDalleImage a handleGenerateAIImage
  const handleGenerateAIImage = async () => {
    setImagePickerModalVisible(false);
    setIsGenerating(true);
    try {
      const prompt = `Modern vibrant illustration style, about ${categoryName || 'generic category'}, flashcard app category icon, high quality, clear subject`;
      console.log("Generando imagen con Gemini, prompt:", prompt);

      const base64ImageData = await generateImageWithGemini(prompt);

      if (!base64ImageData) {
        throw new Error('No se recibieron datos de imagen de Gemini.');
      }

      // Guardar imagen base64 en un archivo local
      const filename = `gemini_image_${categoryId}_${Date.now()}.png`;
      // Usar cacheDirectory para archivos temporales que el sistema puede limpiar,
      // o documentDirectory para archivos más persistentes que tu app gestiona.
      const filePath = `${FileSystem.cacheDirectory}${filename}`;
      
      console.log(`Intentando escribir imagen en: ${filePath}`);
      await FileSystem.writeAsStringAsync(filePath, base64ImageData, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('Imagen escrita en el sistema de archivos exitosamente:', filePath);

      // filePath es una URI local (ej. 'file:///...')
      await upsertImage(categoryId, filePath); // upsertImage debe poder manejar URIs de archivos locales
      setCategoryImageUri(filePath);
      setImageLoaded(false);
      Alert.alert('Éxito', 'Imagen generada con IA (Gemini) y guardada correctamente');

    } catch (error) {
      console.error('Error generando imagen con Gemini en CategoryItem:', error);
      Alert.alert(
        'Error de IA (Gemini)',
        `No se pudo generar la imagen: ${error.message || 'Intenta de nuevo.'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteImage = async () => {
    setIsLoading(true);
    try {
      await deleteImage(categoryId);
      setCategoryImageUri(null);
      setImageLoaded(false);
      Alert.alert('Éxito', 'Imagen eliminada');
    } catch (error) {
      console.error('Error deleting image:', error);
      Alert.alert('Error', 'No se pudo eliminar la imagen. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const showMenu = (event) => {
    if (event) event.stopPropagation();
    const imageRelatedOptions = categoryImageUri ? ['Eliminar Imagen'] : ['Agregar Imagen'];
    const options = ['Editar Categoría', ...imageRelatedOptions, 'Eliminar Categoría', 'Cancelar'];
    const destructiveButtonIndices = [options.indexOf('Eliminar Categoría')];
    if (options.indexOf('Eliminar Imagen') !== -1 && categoryImageUri) { // Solo si la opción existe y hay imagen
        // destructiveButtonIndices.push(options.indexOf('Eliminar Imagen')); // Opcional: hacerla destructiva
    }
    const cancelButtonIndex = options.indexOf('Cancelar');

    showActionSheetWithOptions({
      options,
      cancelButtonIndex,
      destructiveButtonIndex: destructiveButtonIndices.length > 0 ? destructiveButtonIndices[0] : undefined, // Solo una opción destructiva principal
      title: `Opciones para "${categoryName || 'Categoría'}"`,
      tintColor: darkModeEnabled ? '#4895ef' : '#007AFF',
      userInterfaceStyle: darkModeEnabled ? 'dark' : 'light',
    }, (buttonIndex) => {
      if (buttonIndex === null || buttonIndex === undefined || buttonIndex === cancelButtonIndex) return;
      const selectedOption = options[buttonIndex];
      switch (selectedOption) {
        case 'Editar Categoría':
          Alert.alert('Editar', `Editar categoría: ${categoryName}`);
          break;
        case 'Agregar Imagen':
          handleSelectImage();
          break;
        case 'Eliminar Imagen':
          handleDeleteImage();
          break;
        case 'Eliminar Categoría':
          Alert.alert(
            "Confirmar Eliminación",
            `¿Estás seguro de que quieres eliminar la categoría "${categoryName || ''}" y todas sus flashcards? Esta acción no se puede deshacer.`,
            [{ text: "Cancelar", style: "cancel" }, { text: "Eliminar", style: "destructive", onPress: handleDelete }]
          );
          break;
        default: break;
      }
    });
  };
  
  const styles = getStyles(darkModeEnabled, colorPair); // Asumo que getStyles está definido
  const gradientColors = darkModeEnabled
    ? ['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.9)']
    : ['rgba(255,255,255,0.0)', colorPair?.background || '#EEEEEE'];

  return (
    <>
      <TouchableOpacity
        style={styles.categoryCard}
        activeOpacity={0.85}
        onPress={() => onPress(category, colorPair, categoryImageUri)}
      >
        {(isGenerating || isLoading) && (
            <View style={styles.uploadOverlay}> 
                <ActivityIndicator size="large" color="#FFF" />
                <Text style={styles.uploadText}>
                    {isGenerating ? "Generando imagen IA..." : 
                     (isLoading ? "Procesando..." : "")} 
                </Text>
            </View>
        )}
        
        {isGenerating && ( 
            <View style={styles.lottieOverlay}>
                <LottieView
                    source={require('../../../../assets/loadimg2.json')} 
                    autoPlay
                    loop
                    speed={0.8}
                    style={styles.lottie}
                />
            </View>
        )}

        <View style={styles.imageContainer}>
          {categoryImageUri ? (
            <>
              {!imageLoaded && !isGenerating && <ActivityIndicator style={styles.imageLoader} color={darkModeEnabled ? "#FFF" : "#000"} /> }
              <Image
                source={{ uri: categoryImageUri }}
                style={styles.backgroundImage}
                onLoadStart={() => setImageLoaded(false)} 
                onLoad={() => setImageLoaded(true)}
                onError={(errorEvent) => {
                    console.error('Error al cargar imagen en componente Image:', errorEvent.nativeEvent.error); 
                    setImageLoaded(true); // Para ocultar el loader si falla
                    // Considera limpiar categoryImageUri si la imagen no se puede cargar persistentemente
                    // setCategoryImageUri(null); 
                    // Alert.alert("Error de Carga", "No se pudo mostrar la imagen de la categoría.");
                }}
              />
            </>
          ) : (
            !isGenerating && !isLoading && (
                <View style={styles.placeholderBackground}>
                <FontAwesome name="image" size={50} color={`${colorPair?.text || (darkModeEnabled ? '#FFFFFF' : '#000000')}55`} />
                </View>
            )
          )}
          <LinearGradient colors={gradientColors} style={styles.gradientOverlay} />
        </View>

        <TouchableOpacity style={styles.menuButton} onPress={showMenu}>
            <Feather name="more-vertical" size={24} color={colorPair?.text || (darkModeEnabled ? '#FFFFFF' : '#000000')} />
        </TouchableOpacity>

        <View style={styles.contentContainer}>
            <Text style={styles.categoryName} numberOfLines={2}>
                {categoryName || "Categoría sin nombre"} 
            </Text>
            <View style={styles.flashcardCountBadge}>
                <Text style={styles.categoryDescription}>
                    {flashcardCount} flashcards
                </Text>
            </View>
        </View>
      </TouchableOpacity>

      <Modal
        transparent
        visible={isImagePickerModalVisible}
        onRequestClose={() => {
            if (isLoading) setIsLoading(false);
            if (isGenerating) setIsGenerating(false);
            setImagePickerModalVisible(false);
        }}
        animationType="fade"
      >
        <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} style={styles.blurView} tint={darkModeEnabled ? "dark" : "light"}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Añadir Imagen</Text>
            <Text style={styles.modalText}>Elige una opción para "{categoryName || "esta categoría"}":</Text>

            <TouchableOpacity style={styles.modalButton} onPress={handleChooseFromGallery}>
              <FontAwesome name="photo" size={20} color={styles.modalButtonText.color} style={styles.buttonIcon} />
              <Text style={styles.modalButtonText}>Elegir de Galería</Text>
            </TouchableOpacity>

            {/* LLAMADA A LA NUEVA FUNCIÓN */}
            <TouchableOpacity style={styles.modalButton} onPress={handleGenerateAIImage}> 
              <FontAwesome name="magic" size={20} color={styles.modalButtonText.color} style={styles.buttonIcon} />
              <Text style={styles.modalButtonText}>Generar con IA (Gemini)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setImagePickerModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>
    </>
  );
};

// Asegúrate de que getStyles esté definido en alguna parte de tu archivo o importado.
// const getStyles = (darkModeEnabled, colorPair) => StyleSheet.create({ ... });
// Por ejemplo:
const getStyles = (darkModeEnabled, colorPair) => {
    const defaultLightColorPair = { background: '#EEEEEE', text: '#000000' };
    const defaultDarkColorPair = { background: '#333333', text: '#FFFFFF' };
    let currentPair = colorPair;
    if (!currentPair || typeof currentPair.background !== 'string' || typeof currentPair.text !== 'string') {
        currentPair = darkModeEnabled ? defaultDarkColorPair : defaultLightColorPair;
    }
    
    const safeTextColor = currentPair.text;
    const safeBackgroundColor = currentPair.background;

    const modalBackgroundColor = darkModeEnabled ? 'rgba(30, 30, 30, 0.97)' : 'rgba(242, 242, 247, 0.97)';
    const modalTextColor = darkModeEnabled ? '#EFEFEF' : '#1C1C1E';
    const modalButtonColor = darkModeEnabled ? '#2C2C2E' : '#FFFFFF'; 
    const modalButtonBorderColor = darkModeEnabled ? 'rgba(80,80,80,0.7)' : 'rgba(200,200,200,0.5)';
    const primaryActionColor = darkModeEnabled ? '#0A84FF' : '#007AFF';

    return StyleSheet.create({
        categoryCard: {
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            borderRadius: 28,
            marginVertical: 12,
            marginHorizontal: (width - CARD_WIDTH) / 2,
            backgroundColor: safeBackgroundColor,
            position: 'relative',
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: Platform.OS === 'ios' ? 6 : 4 },
            shadowOpacity: darkModeEnabled ? 0.35 : 0.12,
            shadowRadius: Platform.OS === 'ios' ? 12 : 8,
            elevation: Platform.OS === 'android' ? 8 : 0,
        },
        imageContainer: { ...StyleSheet.absoluteFillObject },
        backgroundImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
        imageLoader: { 
            ...StyleSheet.absoluteFillObject,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent', // Hacer transparente para que no oculte la imagen parcialmente cargada
            zIndex: 1, 
        },
        placeholderBackground: {
            ...StyleSheet.absoluteFillObject,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: `${safeTextColor}1A`, 
        },
        gradientOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 2 }, 
        contentContainer: { position: 'absolute', bottom: 16, left: 20, right: 20, zIndex: 3 }, 
        categoryName: {
            fontSize: 26,
            fontFamily: 'Pagebash', 
            fontWeight: 'bold',
            color: safeTextColor,
            marginBottom: 8,
            textShadowColor: 'rgba(0, 0, 0, 0.45)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 5,
        },
        flashcardCountBadge: {
            backgroundColor: `${safeTextColor}33`, 
            borderRadius: 12,
            paddingVertical: 5,
            paddingHorizontal: 12,
            alignSelf: 'flex-start',
        },
        categoryDescription: { fontSize: 14, color: safeTextColor, fontWeight: '500' },
        menuButton: {
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 4, 
            backgroundColor: darkModeEnabled ? 'rgba(50,50,50,0.6)' : 'rgba(250,250,250,0.6)',
            borderRadius: 16,
            padding: 7,
        },
        uploadOverlay: { 
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.75)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100, 
            borderRadius: 28, 
        },
        uploadText: { color: '#FFF', fontSize: 17, fontWeight: '500', marginTop: 15 },
        lottieOverlay: { 
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.7)', 
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 101, 
            borderRadius: 28,
        },
        lottie: { width: 170, height: 170 },
        blurView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        modalView: {
            width: Platform.OS === 'ios' ? '88%' : '92%',
            maxWidth: 400,
            backgroundColor: modalBackgroundColor,
            borderRadius: Platform.OS === 'ios' ? 26 : 20,
            paddingVertical: Platform.OS === 'ios' ? 22 : 20,
            paddingHorizontal: Platform.OS === 'ios' ? 20 : 18,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: Platform.OS === 'ios' ? 10 : 6 },
            shadowOpacity: darkModeEnabled ? 0.3 : 0.15,
            shadowRadius: Platform.OS === 'ios' ? 20 : 12,
            elevation: Platform.OS === 'android' ? 10 : 0,
            borderWidth: Platform.OS === 'android' && darkModeEnabled ? 0.5 : 0,
            borderColor: modalButtonBorderColor,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
            color: modalTextColor,
            marginBottom: 8,
            marginTop: Platform.OS === 'ios' ? 5 : 0,
        },
        modalText: {
            fontSize: 15,
            textAlign: 'center',
            color: darkModeEnabled ? `${modalTextColor}C0` : `${modalTextColor}B3`, // Opacidad ajustada
            marginBottom: 25,
            lineHeight: 21,
            paddingHorizontal: 10,
        },
        modalButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: modalButtonColor,
            paddingVertical: Platform.OS === 'ios' ? 15 : 14,
            paddingHorizontal: 20,
            marginBottom: 12,
            borderRadius: Platform.OS === 'ios' ? 14 : 12,
            width: '100%',
            borderWidth: Platform.OS === 'android' ? 0.7 : 0, // Borde sutil en Android
            borderColor: modalButtonBorderColor,
        },
        buttonIcon: { marginRight: 12 },
        modalButtonText: {
            fontSize: 17,
            fontWeight: Platform.OS === 'ios' ? '500' : '600', // Ajuste de peso
            color: primaryActionColor,
        },
        cancelButton: { marginTop: 8, paddingVertical: 12, paddingHorizontal: 20 },
        cancelButtonText: {
            fontSize: 16,
            fontWeight: '500',
            color: darkModeEnabled ? '#8A8A8E' : '#555555', // Color de cancelación estándar
        },
    });
};

export default CategoryItem;