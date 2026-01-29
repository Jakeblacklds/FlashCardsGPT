import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { getAuth } from "firebase/auth";

import { selectDarkMode } from '../../../../redux/darkModeSlice';
import { generateImageWithGemini } from '../../../../geminiApi';
import { upsertImage } from '../../../../db';
import { fetchCategories } from '../../../../redux/FlashcardSlice';

const { width, height } = Dimensions.get('window');

const SPACING = {
  sm: 8,
  md: 16,
  lg: 20,
  xl: 32,
};

const ACCENT_COLOR = '#6366F1';

// --- NUEVO: Constantes para los estilos de imagen ---
const IMAGE_STYLES = [
  { name: 'Ilustración', value: 'Modern vibrant illustration style' },
  { name: 'Neón', value: 'Neon-punk aesthetic' },
  { name: 'Pixel Art', value: 'Pixel art style' },
  { name: 'Minimalista', value: 'Minimalist flat icon' },
  { name: 'Arcano', value: 'Dark fantasy, arcane, magical runes' },
];

const AddCategory = ({ navigation }) => {
  const [category, setCategory] = useState('');
  const [flashcards, setFlashcards] = useState([{ english: '', spanish: '' }]);
  const darkModeEnabled = useSelector(selectDarkMode);
  const currentUserUID = useSelector(state => state.flashcards.currentUserUID);
  const dispatch = useDispatch();
  
  const [categoryImageUri, setCategoryImageUri] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // --- NUEVO: Estado para el estilo de imagen seleccionado ---
  const [selectedImageStyle, setSelectedImageStyle] = useState(null);


  // Animaciones
  const headerOpacity = useSharedValue(0);
  const formScale = useSharedValue(0.95);
  const flashcardsOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    formScale.value = withDelay(200, withTiming(1, { duration: 500 }));
    flashcardsOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    buttonOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
  }, []);

  // Estilos animados
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: (1 - headerOpacity.value) * 20 }],
  }));
  const formStyle = useAnimatedStyle(() => ({
    opacity: formScale.value,
    transform: [{ scale: formScale.value }],
  }));
  const flashcardsStyle = useAnimatedStyle(() => ({
    opacity: flashcardsOpacity.value,
  }));
  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  // --- Lógica de generación de imagen (MODIFICADA) ---
  const handleGenerateAIImage = async () => {
    if (!category.trim()) {
      Alert.alert('Espera', 'Primero necesitas un nombre de categoría para generar una imagen relevante.');
      return;
    }
    
    // --- NUEVA VALIDACIÓN 1: Estilo seleccionado ---
    if (!selectedImageStyle) {
      Alert.alert('Elige un estilo', 'Por favor, selecciona un estilo para la imagen antes de generar.');
      return;
    }

    // --- NUEVA VALIDACIÓN 2: Imagen ya generada ---
    if (categoryImageUri) {
      Alert.alert('Imagen ya generada', 'Ya se ha generado una imagen para esta categoría.');
      return;
    }
    
    setIsGenerating(true);
    try {
      // --- PROMPT MODIFICADO: Usa el estilo seleccionado ---
      const prompt = `${selectedImageStyle}, about ${category.trim()}, flashcard app category icon, high quality, clear subject, 2025 design trends`;
      
      const base64ImageData = await generateImageWithGemini(prompt);
      if (!base64ImageData) throw new Error('No se recibieron datos de imagen de Gemini.');

      const filename = `gemini_image_${Date.now()}.png`;
      const filePath = `${FileSystem.documentDirectory}${filename}`;
      
      await FileSystem.writeAsStringAsync(filePath, base64ImageData, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      setCategoryImageUri(filePath);
    } catch (error) {
      console.error('Error generando imagen con Gemini:', error);
      Alert.alert('Error de IA (Gemini)', `No se pudo generar la imagen: ${error.message || 'Intenta de nuevo.'}`, [{ text: 'OK' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Lógica de guardado (sin cambios, pero revisada) ---
  // La lógica de .filter() ya maneja correctamente las flashcards vacías al guardar.
  const handleAddCategory = async () => {
    const newCategoryName = category.trim();
    if (!newCategoryName) {
      Alert.alert('Atención', 'Por favor, ingrese un nombre de categoría.');
      return;
    }
    if (!currentUserUID) {
      console.error('UID de usuario no disponible');
      Alert.alert('Error', 'No se pudo identificar al usuario.');
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Error', 'No hay un usuario autenticado. Por favor, inicia sesión de nuevo.');
      return;
    }
    
    setIsSaving(true);

    try {
      let token;
      try {
        token = await user.getIdToken(true);
      } catch (authError) {
        console.error("Error al obtener el token de autenticación:", authError);
        throw new Error('No se pudo verificar tu sesión. Inicia de nuevo.');
      }

      const flashcardsObject = flashcards
        .filter(f => f.english.trim() && f.spanish.trim()) // Esto ya filtra las vacías
        .reduce((obj, item, index) => {
          obj[`flashcard${index + 1}`] = item;
          return obj;
        }, {});

      // --- VALIDACIÓN: Asegurarse de que al menos haya una flashcard completa ---
      if (Object.keys(flashcardsObject).length === 0) {
         Alert.alert('Flashcards vacías', 'Debes tener al menos una flashcard completa (con término y definición) para guardar la categoría.');
         setIsSaving(false);
         return;
      }

      const url = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories/${encodeURIComponent(newCategoryName)}.json?auth=${token}`;

      await axios.put(url, {
        name: newCategoryName,
        flashcards: flashcardsObject,
        imageUri: categoryImageUri || null 
      });

      if (categoryImageUri) {
        await upsertImage(newCategoryName, categoryImageUri);
      }

      Alert.alert('¡Éxito!', '¡Categoría creada exitosamente!', [
        { text: 'OK', onPress: () => {
            dispatch(fetchCategories());
            navigation.goBack();
          } 
        },
      ]);
    } catch (error) {
      console.error('Error al agregar categoría:', error);
      Alert.alert('Error', `Hubo un problema al crear la categoría: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Lógica de añadir flashcard (MODIFICADA) ---
  const handleAddFlashcard = () => {
    // --- NUEVA VALIDACIÓN: Comprobar si la última flashcard está vacía ---
    if (flashcards.length > 0) {
      const lastFlashcard = flashcards[flashcards.length - 1];
      if (!lastFlashcard.english.trim() || !lastFlashcard.spanish.trim()) {
        Alert.alert(
          'Completa la flashcard', 
          'Por favor, rellena los campos de "Término" y "Definición" de la última flashcard antes de añadir una nueva.'
        );
        return; // Bloquea la adición
      }
    }
    setFlashcards([...flashcards, { english: '', spanish: '' }]);
  };

  const handleFlashcardChange = (index, field, value) => {
    const newFlashcards = [...flashcards];
    newFlashcards[index][field] = value;
    setFlashcards(newFlashcards);
  };
  
  const handleRemoveFlashcard = (index) => {
    if (flashcards.length <= 1) {
        Alert.alert('Espera', 'Debes tener al menos una flashcard.');
        return;
    }
    const newFlashcards = flashcards.filter((_, i) => i !== index);
    setFlashcards(newFlashcards);
  };

  const styles = getStyles(darkModeEnabled);
  const gradientBackground = darkModeEnabled ? ['#1C1C1E', '#121212'] : ['#F7F7F7', '#E9E9E9'];

  // --- NUEVO: Variable de estado para deshabilitar el botón de añadir flashcard ---
  const isLastFlashcardEmpty = 
    flashcards.length > 0 && 
    (!flashcards[flashcards.length - 1].english.trim() || !flashcards[flashcards.length - 1].spanish.trim());

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradientBackground} style={StyleSheet.absoluteFill} />
      <StatusBar
        barStyle={darkModeEnabled ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <BlurView intensity={80} tint={darkModeEnabled ? 'dark' : 'light'} style={styles.blurButton}>
          <Ionicons
            name="arrow-back"
            size={22}
            color={darkModeEnabled ? '#FFF' : '#000'}
          />
        </BlurView>
      </TouchableOpacity>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -StatusBar.currentHeight}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.headerContainer, headerStyle]}>
            <Text style={styles.headerTitle}>
              Nueva Colección
            </Text>
           
          </Animated.View>

          {/* --- TARJETA 1: CATEGORÍA --- */}
          <Animated.View style={[styles.card, formStyle]}>
            <Text style={styles.cardTitle}>Define tu Categoría</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre de la categoría"
              placeholderTextColor={darkModeEnabled ? '#888' : '#666'}
              value={category}
              onChangeText={setCategory}
            />
            
        
            <Text style={styles.styleSelectorTitle}>Estilo de imagen</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.styleSelectorScroll}
            >
              {IMAGE_STYLES.map((style) => (
                <TouchableOpacity
                  key={style.value}
                  style={[
                    styles.styleChip,
                    selectedImageStyle === style.value && styles.styleChipSelected
                  ]}
                  onPress={() => setSelectedImageStyle(style.value)}
                  // No se puede cambiar el estilo si ya se generó una imagen o se está generando
                  disabled={!!categoryImageUri || isGenerating}
                >
                  <Text style={[
                    styles.styleChipText,
                    selectedImageStyle === style.value && styles.styleChipTextSelected
                  ]}>
                    {style.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={[
                styles.imagePlaceholder, 
                (!selectedImageStyle && !categoryImageUri) && styles.disabledPlaceholder // Atenuar si no hay estilo
              ]} 
              onPress={handleGenerateAIImage}
              // --- MODIFICADO: Lógica de 'disabled' ---
              disabled={isGenerating || !!categoryImageUri || !selectedImageStyle}
            >
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
              {categoryImageUri && !isGenerating ? (
                <Image source={{ uri: categoryImageUri }} style={styles.categoryImagePreview} />
              ) : (
                !isGenerating && (
                  <>
                    {/* --- MODIFICADO: Icono y texto dinámicos --- */}
                    <Ionicons 
                      name={!selectedImageStyle ? "hand-left-outline" : "sparkles-outline"} 
                      size={24} 
                      color={!selectedImageStyle ? (darkModeEnabled ? '#777' : '#888') : ACCENT_COLOR} 
                    />
                    <Text style={[
                      styles.imagePlaceholderText, 
                      !selectedImageStyle && styles.disabledPlaceholderText
                    ]}>
                      {!selectedImageStyle 
                        ? '↑ Primero selecciona un estilo'
                        : 'Toca para generar una imagen con IA'
                      }
                    </Text>
                  </>
                )
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* --- TARJETA 2: FLASHCARDS --- */}
          <Animated.View style={[styles.card, flashcardsStyle]}>
            <Text style={styles.cardTitle}>Añade Flashcards</Text>
            
            {flashcards.map((item, index) => (
              <Animated.View 
                key={index} 
                style={styles.flashcardItem}
                entering={FadeInDown.duration(400)}
              >
                <View style={styles.flashcardInputs}>
                  <TextInput
                    style={styles.flashcardInput}
                    placeholder="Término (ej. Inglés)"
                    placeholderTextColor={darkModeEnabled ? '#888' : '#666'}
                    value={item.english}
                    onChangeText={(text) => handleFlashcardChange(index, 'english', text)}
                  />
                  <View style={styles.inputSeparator} />
                  <TextInput
                    style={styles.flashcardInput}
                    placeholder="Definición (ej. Español)"
                    placeholderTextColor={darkModeEnabled ? '#888' : '#666'}
                    value={item.spanish}
                    onChangeText={(text) => handleFlashcardChange(index, 'spanish', text)}
                  />
                </View>
                {flashcards.length > 1 && (
                    <TouchableOpacity onPress={() => handleRemoveFlashcard(index)} style={styles.removeButton}>
                        <Ionicons name="trash-outline" size={20} color="#E74C3C" />
                    </TouchableOpacity>
                )}
              </Animated.View>
            ))}

            <TouchableOpacity
              // --- MODIFICADO: Añadir estilo y prop 'disabled' ---
              style={[styles.addFlashcardButton, isLastFlashcardEmpty && styles.disabledButton]}
              onPress={handleAddFlashcard}
              disabled={isLastFlashcardEmpty}
              activeOpacity={0.8}
            >
              <BlurView intensity={80} tint={darkModeEnabled ? 'dark' : 'light'} style={styles.blurButton}>
                <Ionicons name="add" size={22} color={darkModeEnabled ? '#FFF' : '#000'} />
                <Text style={styles.addFlashcardButtonText}>Añadir otra flashcard</Text>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- BOTÓN DE GUARDAR (FUERA DEL SCROLLVIEW) --- */}
      <Animated.View style={[styles.submitButtonContainer, buttonStyle]}>
        <TouchableOpacity
          onPress={handleAddCategory}
          disabled={!category.trim() || isSaving || isGenerating}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={!category.trim() ? ['#999', '#999'] : [ACCENT_COLOR, '#818CF8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButton}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <FontAwesome5 name="save" size={18} color="#FFF" style={styles.buttonIcon} />
                <Text style={styles.submitButtonText}>Guardar Colección</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

    </View>
  );
};

// --- ESTILOS MODERNIZADOS (AÑADIDOS NUEVOS ESTILOS) ---
const getStyles = (darkModeEnabled) => {
  const cardBackgroundColor = darkModeEnabled ? 'rgba(40, 40, 40, 0.85)' : 'rgba(255, 255, 255, 0.85)';
  const inputBackgroundColor = darkModeEnabled ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = darkModeEnabled ? '#FFFFFF' : '#1C1C1E';
  const subtitleColor = darkModeEnabled ? '#B0B0B0' : '#444444';

  return StyleSheet.create({
    flex: { flex: 1 },
    container: {
      flex: 1,
      backgroundColor: darkModeEnabled ? '#000' : '#F0F0F0',
    },
    scrollViewContent: {
      paddingTop: (Platform.OS === 'ios' ? 50 : StatusBar.currentHeight) + 60,
      paddingBottom: 120, 
      paddingHorizontal: SPACING.md,
    },
    backButton: {
      position: 'absolute',
      top: (Platform.OS === 'ios' ? 50 : StatusBar.currentHeight) + SPACING.md,
      left: SPACING.md,
      zIndex: 10,
      width: 44,
      height: 44,
      borderRadius: 22,
      overflow: 'hidden',
    },
    blurButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    headerContainer: {
      marginBottom: SPACING.lg,
      alignItems: 'flex-start',
    },
    headerTitle: {
      fontSize: 34,
      fontWeight: 'bold',
      color: textColor,
      marginBottom: SPACING.sm,
    },
    headerSubtitle: {
      fontSize: 17,
      color: subtitleColor,
    },
    card: {
      backgroundColor: cardBackgroundColor,
      borderRadius: 28,
      padding: SPACING.md,
      marginBottom: SPACING.lg,
      overflow: 'hidden',
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: textColor,
      marginBottom: SPACING.md,
    },
    input: {
      backgroundColor: inputBackgroundColor,
      borderRadius: 16,
      paddingHorizontal: SPACING.md,
      paddingVertical: Platform.OS === 'ios' ? 16 : 14,
      fontSize: 16,
      color: textColor,
    },
    
    // --- NUEVOS ESTILOS (Selector de Estilo) ---
    styleSelectorTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: subtitleColor,
      marginBottom: SPACING.md,
      marginTop: SPACING.lg,
    },
    styleSelectorScroll: {
      marginBottom: SPACING.md,
      marginHorizontal: -SPACING.md, // Permite que el scroll toque los bordes de la tarjeta
      paddingHorizontal: SPACING.md, // Añade padding interno
    },
    styleChip: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: 20,
      backgroundColor: inputBackgroundColor,
      marginRight: SPACING.sm,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    styleChipSelected: {
      backgroundColor: 'rgba(99, 102, 241, 0.2)', // Fondo suave del color de acento
      borderColor: ACCENT_COLOR, // Borde del color de acento
    },
    styleChipText: {
      color: textColor,
      fontWeight: '500',
    },
    styleChipTextSelected: {
      color: ACCENT_COLOR, // Texto del color de acento
      fontWeight: '600',
    },
    // --- FIN NUEVOS ESTILOS ---

    imagePlaceholder: {
      height: 120,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: ACCENT_COLOR,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      // marginTop: SPACING.md, // Movido al scroll de estilos
      backgroundColor: darkModeEnabled ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
      overflow: 'hidden',
    },
    // --- NUEVO ---
    disabledPlaceholder: {
      borderColor: darkModeEnabled ? '#555' : '#AAA',
      backgroundColor: 'transparent',
    },
    imagePlaceholderText: {
      color: ACCENT_COLOR,
      marginTop: SPACING.sm,
      fontSize: 14,
      fontWeight: '500',
    },
    // --- NUEVO ---
    disabledPlaceholderText: {
      color: darkModeEnabled ? '#777' : '#888',
    },
    categoryImagePreview: {
      width: '100%',
      height: '100%',
      position: 'absolute',
    },
    lottieOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 101,
    },
    lottie: {
      width: 120,
      height: 120,
    },
    flashcardItem: {
      backgroundColor: inputBackgroundColor,
      borderRadius: 16,
      marginBottom: SPACING.sm,
      flexDirection: 'row',
      alignItems: 'center',
    },
    flashcardInputs: {
        flex: 1,
    },
    flashcardInput: {
      paddingHorizontal: SPACING.md,
      paddingVertical: Platform.OS === 'ios' ? 16 : 14,
      fontSize: 16,
      color: textColor,
    },
    inputSeparator: {
      height: 1,
      backgroundColor: darkModeEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      marginHorizontal: SPACING.md,
    },
    removeButton: {
        padding: SPACING.md,
    },
    addFlashcardButton: {
      height: 50,
      borderRadius: 16,
      overflow: 'hidden',
      marginTop: SPACING.sm,
    },
    addFlashcardButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: textColor,
      marginLeft: SPACING.sm,
    },
    // --- NUEVO ---
    disabledButton: {
      opacity: 0.5,
    },
    submitButtonContainer: {
      paddingHorizontal: SPACING.md,
      position: 'absolute',
      bottom: Platform.OS === 'ios' ? 40 : 20, 
      left: 0,
      right: 0,
      zIndex: 10, 
    },
    submitButton: {
      borderRadius: 28,
      paddingVertical: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 10,
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 18,
    },
    buttonIcon: {
      marginRight: SPACING.md,
    },
  });
};

export default AddCategory;