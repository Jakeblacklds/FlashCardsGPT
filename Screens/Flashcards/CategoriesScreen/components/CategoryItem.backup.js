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
import Svg, { Rect, Path } from 'react-native-svg'; // Asegúrate de tener react-native-svg instalado
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import { getColors } from 'react-native-image-colors';

// Importaciones de tu proyecto
import { selectDarkMode } from '../../../../redux/darkModeSlice';
import { fetchImage, upsertImage, deleteImage } from '../../../../db';
import { generateImageWithGemini } from '../../../../geminiApi';
import { fetchFlashcardCountByCategory, selectFlashcardCount } from '../../../../redux/FlashcardSlice';
import { getRandomColorPair } from '../../../../constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.45;
const CARD_HEIGHT = 200; // Aumenté un poco la altura para que el cartucho luzca mejor

// -------------------------------------------------------------------------
// 1. COMPONENTE VISUAL: CARTUCHO CONTAINER (Estilo Gameboy)
// -------------------------------------------------------------------------
const CartuchoContainer = ({
  children,
  width = 160,
  height = 180,
  mainColor = "#5DBC67",
  insetColor = "#3EA055",
  darkMode = false,
  style,
}) => {
  const notchColor = darkMode ? "#23262A" : "#fff";
  const r = 12; // Radio de esquinas grandes

  // Configuración del indent (el bocado de la esquina)
  const cutSize = 18;
  const sr = 6;

  // Configuración de las rayitas laterales
  const notchWidth = 11;
  const notchHeight = 4;
  const notchSpacing = 4;
  const topOffsetPos = 30;

  const renderNotches = (xPosition) => (
    <>
      <Rect x={xPosition} y={topOffsetPos} width={notchWidth} height={notchHeight} fill={notchColor} rx={1} />
      <Rect x={xPosition} y={topOffsetPos + notchHeight + notchSpacing} width={notchWidth} height={notchHeight} fill={notchColor} rx={1} />
      <Rect x={xPosition} y={topOffsetPos + (notchHeight + notchSpacing) * 2} width={notchWidth} height={notchHeight} fill={notchColor} rx={1} />
    </>
  );

  const bodyPath = `
    M 0 ${r}
    A ${r} ${r} 0 0 1 ${r} 0
    L ${width - cutSize - sr} 0             
    A ${sr} ${sr} 0 0 1 ${width - cutSize} ${sr}  
    L ${width - cutSize} ${cutSize - sr}    
    A ${sr} ${sr} 0 0 0 ${width - cutSize + sr} ${cutSize} 
    L ${width - sr} ${cutSize}              
    A ${sr} ${sr} 0 0 1 ${width} ${cutSize + sr} 
    L ${width} ${height - r}
    A ${r} ${r} 0 0 1 ${width - r} ${height}
    L ${r} ${height}
    A ${r} ${r} 0 0 1 0 ${height - r}
    Z
  `;

  return (
    <View style={[stylesCartucho.container, { width, height }, style]}>
      {/* Capa SVG Absoluta para el cuerpo del cartucho */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
          {/* Cuerpo Principal */}
          <Path d={bodyPath} fill={mainColor} stroke={"rgba(0,0,0,0.1)"} strokeWidth={1} />

          {/* Inset (El hueco donde va la etiqueta/sticker) */}
          <Rect
            x={width * 0.1}
            y={height * 0.28}
            width={width * 0.8}
            height={height * 0.65}
            rx={8}
            fill={insetColor}
          />

          {/* Rayitas Decorativas */}
          {renderNotches(-1)}
          {renderNotches(width - notchWidth + 1)}
        </Svg>
      </View>

      {/* Contenedor del contenido (La etiqueta/Sticker) */}
      <View style={stylesCartucho.contentContainer}>
        {/* Un contenedor extra para recortar la imagen a bordes redondeados dentro del area del sticker */}
        <View style={stylesCartucho.stickerInnerContainer}>
          {children}
        </View>
      </View>
    </View>
  );
};

const stylesCartucho = StyleSheet.create({
  container: {
    // Sombras externas del cartucho completo
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    // Esto alinea el contenido exactamente sobre el "Rect" del Inset definido en el SVG
    paddingTop: '28%',     // Coincide con y={height * 0.28}
    paddingHorizontal: '10%', // Coincide con x={width * 0.1}
    paddingBottom: '7%',   // Ajuste visual para el margen inferior
  },
  stickerInnerContainer: {
    flex: 1,
    borderRadius: 6, // Un poco menos que el rx del Rect para que encaje dentro
    overflow: 'hidden', // Importante para que la imagen no se salga del sticker
    backgroundColor: 'rgba(0,0,0,0.2)', // Fondo oscuro por si la imagen carga
    position: 'relative',
  }
});


// -------------------------------------------------------------------------
// 2. LÓGICA Y COMPONENTE PRINCIPAL: CATEGORY ITEM
// -------------------------------------------------------------------------

function getContrastYIQ(hexcolor) {
  if (!hexcolor) return '#fff';
  let hex = hexcolor.replace('#', '');
  if (hex.length === 8) hex = hex.substr(2);
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 180 ? '#222222' : '#ffffff';
}

const getStyles = (darkModeEnabled, colorPair) => {
  const safeTextColor = colorPair?.text || (darkModeEnabled ? '#FFF' : '#000');

  return StyleSheet.create({
    // Estilos generales del Wrapper (TouchableOpacity)
    touchableWrapper: {
      marginVertical: 12,
      alignItems: 'center',
    },
    // Estilos internos del contenido del "Sticker"
    imageContainer: { ...StyleSheet.absoluteFillObject },
    backgroundImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    imageLoader: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    placeholderBackground: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#e0e0e0', // Fondo gris claro para sticker vacio
    },
    gradientOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 2 },

    // Contenido de Texto (Ahora va sobre el sticker)
    contentOverlay: {
      position: 'absolute',
      bottom: 10,
      left: 12,
      right: 12,
      zIndex: 3
    },
    categoryName: {
      fontSize: 22, // Ligeramente más pequeño para caber en el sticker
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto', // Ajusta a tu fuente 'Pagebash' si la tienes cargada
      fontWeight: 'bold',
      color: '#FFF', // En el sticker siempre blanco se ve bien con sombra, o usa safeTextColor
      marginBottom: 4,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: -1, height: 1 },
      textShadowRadius: 3,
    },
    flashcardCountBadge: {
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 8,
      paddingVertical: 3,
      paddingHorizontal: 8,
      alignSelf: 'flex-start',
    },
    categoryDescription: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFF',
    },

    // Botón de menú (Ahora en la esquina del sticker)
    menuButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      zIndex: 10,
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderRadius: 12,
      padding: 4,
    },

    // Overlays de carga (Lottie/Spinner)
    uploadOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100,
    },
    uploadText: { color: '#FFF', fontSize: 14, fontWeight: '500', marginTop: 10, textAlign: 'center' },
    lottieOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 101,
    },
    lottie: { width: 100, height: 100 },

    // Estilos de Modales (Sin cambios)
    blurView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modalView: {
      width: Platform.OS === 'ios' ? '88%' : '92%',
      maxWidth: 400,
      backgroundColor: darkModeEnabled ? 'rgba(30,30,30,0.97)' : 'rgba(242,242,247,0.97)',
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.3,
      elevation: 5,
    },
    optionModalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    optionModalBox: {
      width: 320,
      padding: 24,
      borderRadius: 26,
      backgroundColor: colorPair?.background || '#6366F1',
      elevation: 10,
    },
    optionTitle: { fontSize: 21, fontWeight: 'bold', color: colorPair?.text, marginBottom: 20, textAlign: 'center' },
    optionButton: { marginBottom: 14, paddingVertical: 14, borderRadius: 15, backgroundColor: colorPair?.text, alignItems: 'center' },
    optionButtonDanger: { marginBottom: 18, paddingVertical: 14, borderRadius: 15, backgroundColor: '#c0392b', alignItems: 'center' },
    optionButtonCancel: { paddingVertical: 13, alignItems: 'center' },
    optionButtonText: { fontWeight: '600', fontSize: 17 },
    optionButtonTextAccent: { color: colorPair?.background || '#6366F1' },
    optionButtonTextDanger: { color: '#fff' },
    optionButtonTextCancel: { fontSize: 16, color: '#fff', opacity: 0.9 },

    // Modal Picker Styles
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: darkModeEnabled ? '#fff' : '#000' },
    modalText: { fontSize: 16, marginBottom: 20, textAlign: 'center', color: darkModeEnabled ? '#ccc' : '#333' },
    modalButton: { flexDirection: 'row', alignItems: 'center', padding: 15, width: '100%', marginBottom: 10, backgroundColor: darkModeEnabled ? '#444' : '#fff', borderRadius: 10 },
    buttonIcon: { marginRight: 10 },
    modalButtonText: { fontSize: 16, color: darkModeEnabled ? '#fff' : '#000' },
    cancelButton: { marginTop: 10, padding: 10 },
    cancelButtonText: { fontSize: 16, color: '#ff4444' }
  });
};

const CategoryItem = ({
  category,
  onPress,
  onDelete,
  initialColorPair,
  initialImageUri,
  refreshKey,
}) => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptionsModalVisible, setOptionsModalVisible] = useState(false);

  // Colores y Estados de Imagen
  const fallbackColorPair = useMemo(() => initialColorPair || getRandomColorPair(), [initialColorPair]);
  const [extractedColors, setExtractedColors] = useState(null);
  const [categoryImageUri, setCategoryImageUri] = useState(initialImageUri || null);
  const [isImagePickerModalVisible, setImagePickerModalVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Redux
  const darkModeEnabled = useSelector(selectDarkMode);
  const currentUserUID = useSelector(state => state.flashcards.currentUserUID);
  const dispatch = useDispatch();

  const categoryId = typeof category === 'string' ? category : category?.id;
  const categoryName = typeof category === 'string' ? category : category?.name;
  const flashcardCount = useSelector(state => selectFlashcardCount(state, categoryId));

  // --- EFECTOS (Carga de imagen e info) ---
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchImage(categoryId)
      .then(imageData => {
        if (isMounted && imageData && imageData.uri) {
          setCategoryImageUri(imageData.uri);
          extractColorsFromImage(imageData.uri);
        } else if (isMounted && initialImageUri) {
          setCategoryImageUri(initialImageUri);
          extractColorsFromImage(initialImageUri);
        } else if (isMounted) {
          setCategoryImageUri(null);
          setExtractedColors(null);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, [categoryId, initialImageUri, refreshKey]);

  useEffect(() => {
    if (currentUserUID && categoryId) {
      dispatch(fetchFlashcardCountByCategory(currentUserUID, categoryId));
    }
  }, [currentUserUID, categoryId, dispatch]);

  // --- LÓGICA DE COLORES ---
  const extractColorsFromImage = async (imageUri) => {
    try {
      let processedUri = imageUri;
      if (imageUri.startsWith('file://')) {
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        let mimeType = 'image/jpeg';
        if (imageUri.toLowerCase().endsWith('.png')) mimeType = 'image/png';
        if (imageUri.toLowerCase().endsWith('.webp')) mimeType = 'image/webp';
        processedUri = `data:${mimeType};base64,${base64}`;
      }

      const result = await getColors(processedUri, {
        fallback: darkModeEnabled ? '#23262A' : '#EEEEEE',
        cache: true,
        key: categoryId,
        quality: 'high',
      });

      let colorPair = { background: '', text: '' };

      // Ajuste de preferencia de color para el "Plástico" del cartucho
      if (Platform.OS === 'android') {
        colorPair.background = result.vibrant || result.dominant || result.average;
      } else {
        colorPair.background = result.background || result.primary || result.detail;
      }

      // Si el color es muy claro y estamos en modo oscuro, o viceversa, podríamos ajustar,
      // pero por ahora usamos el contraste calculado para el texto.
      colorPair.text = getContrastYIQ(colorPair.background);

      setExtractedColors(colorPair);
      return colorPair;
    } catch (error) {
      console.error('Error extrayendo colores:', error);
      return null;
    }
  };

  // --- MANEJADORES DE ACCIÓN ---
  const handleDelete = () => onDelete(categoryId);
  const handleSelectImage = () => setImagePickerModalVisible(true);

  const handleChooseFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3], // Aspecto un poco más rectangular para el sticker
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const imageUri = result.assets[0].uri;
        setIsLoading(true);
        await upsertImage(categoryId, imageUri);
        setCategoryImageUri(imageUri);
        setImageLoaded(false);
        await extractColorsFromImage(imageUri);
        Alert.alert('Éxito', 'Imagen guardada correctamente');
      }
    } catch (error) {
      Alert.alert('Error', `No se pudo seleccionar la imagen: ${error.message}`);
    } finally {
      setIsLoading(false);
      setImagePickerModalVisible(false);
    }
  };

  const handleGenerateAIImage = async () => {
    setImagePickerModalVisible(false);
    setIsGenerating(true);
    try {
      // Prompt ajustado para estilo "Sticker" o ilustración vibrante
      const prompt = `Sticker art style, ${categoryName || 'generic concept'}, colorful, vector style, white outline, minimal background, high resolution`;
      const base64ImageData = await generateImageWithGemini(prompt);
      if (!base64ImageData) throw new Error('No se recibieron datos de Gemini.');

      const filename = `gemini_${categoryId}_${Date.now()}.png`;
      const filePath = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(filePath, base64ImageData, { encoding: FileSystem.EncodingType.Base64 });

      await upsertImage(categoryId, filePath);
      setCategoryImageUri(filePath);
      setImageLoaded(false);
      await extractColorsFromImage(filePath);
      Alert.alert('Éxito', 'Imagen generada con IA');
    } catch (error) {
      Alert.alert('Error IA', 'No se pudo generar la imagen.');
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
      setExtractedColors(null);
      Alert.alert('Éxito', 'Imagen eliminada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la imagen.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- VARIABLES DE RENDERIZADO ---
  const activeColorPair = extractedColors || fallbackColorPair;
  const styles = getStyles(darkModeEnabled, activeColorPair);

  // El plástico del cartucho usa el color de fondo extraído
  const cartridgeMainColor = activeColorPair?.background || '#5DBC67';
  // El hueco del sticker (inset) lo hacemos un poco más oscuro que el plástico para dar profundidad
  // O usamos un gris neutro oscuro si queremos realismo
  const cartridgeInsetColor = darkModeEnabled ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)';

  const gradientColors = ['transparent', 'rgba(0,0,0,0.9)'];

  return (
    <>
      <TouchableOpacity
        style={styles.touchableWrapper}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('FlashcardList', {
            category,
            colorPair: activeColorPair,
            categoryImageUri
          })
        }
      >
        {/* Aquí usamos el contenedor Cartucho envolviendo el contenido */}
        <CartuchoContainer
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          mainColor={cartridgeMainColor}
          insetColor={cartridgeInsetColor}
          darkMode={darkModeEnabled}
        >
          {/* --- TODO ESTO VA DENTRO DEL STICKER (Children) --- */}

          {/* 1. Imagen de Fondo del Sticker */}
          <View style={styles.imageContainer}>
            {categoryImageUri ? (
              <>
                {!imageLoaded && !isGenerating && <ActivityIndicator style={styles.imageLoader} color="#FFF" />}
                <Image
                  source={{ uri: categoryImageUri }}
                  style={styles.backgroundImage}
                  onLoadEnd={() => setImageLoaded(true)}
                />
              </>
            ) : (
              !isGenerating && !isLoading && (
                <View style={styles.placeholderBackground}>
                  {/* Icono más pequeño dentro del sticker */}
                  <FontAwesome name="gamepad" size={40} color="rgba(0,0,0,0.2)" />
                </View>
              )
            )}
            {/* Gradiente solo sobre la parte inferior del sticker para que el texto se lea */}
            <LinearGradient colors={gradientColors} style={styles.gradientOverlay} locations={[0.4, 1]} />
          </View>

          {/* 2. Botón de Menú (Dentro del sticker arriba a la derecha) */}
          <TouchableOpacity style={styles.menuButton} onPress={() => setOptionsModalVisible(true)}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#FFF" />
          </TouchableOpacity>

          {/* 3. Indicadores de Carga */}
          {(isGenerating || isLoading) && (
            <View style={styles.uploadOverlay}>
              <ActivityIndicator size="small" color="#FFF" />
              <Text style={styles.uploadText}>{isGenerating ? "Creando arte..." : "Cargando..."}</Text>
            </View>
          )}
          {isGenerating && (
            <View style={styles.lottieOverlay}>
              {/* Asegúrate de que la ruta de tu lottie sea correcta */}
              <LottieView
                source={require('../../../../assets/loadimg2.json')}
                autoPlay
                loop
                style={styles.lottie}
              />
            </View>
          )}

          {/* 4. Texto e Información (Abajo en el sticker) */}
          <View style={styles.contentOverlay}>
            <Text style={styles.categoryName} numberOfLines={2}>
              {categoryName || "Nueva Partida"}
            </Text>
            <View style={styles.flashcardCountBadge}>
              <Text style={styles.categoryDescription}>
                {flashcardCount} cards
              </Text>
            </View>
          </View>

        </CartuchoContainer>
      </TouchableOpacity>

      {/* --- MODALES (Fuera del TouchableOpacity para que cubran toda la pantalla) --- */}

      {/* Modal de Opciones */}
      <Modal
        visible={isOptionsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <View style={styles.optionModalContainer}>
          <View style={styles.optionModalBox}>
            <Text style={styles.optionTitle}>Opciones del Cartucho</Text>

            <TouchableOpacity style={styles.optionButton} onPress={() => {
              setOptionsModalVisible(false);
              Alert.alert('Editar', `Renombrar: ${categoryName}`);
            }}>
              <Text style={[styles.optionButtonText, styles.optionButtonTextAccent]}>Editar nombre</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={() => {
              setOptionsModalVisible(false);
              handleSelectImage();
            }}>
              <Text style={[styles.optionButtonText, styles.optionButtonTextAccent]}>Cambiar arte (Sticker)</Text>
            </TouchableOpacity>

            {categoryImageUri && (
              <TouchableOpacity style={styles.optionButton} onPress={() => {
                setOptionsModalVisible(false);
                handleDeleteImage();
              }}>
                <Text style={[styles.optionButtonText, styles.optionButtonTextAccent]}>Quitar arte</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.optionButtonDanger} onPress={() => {
              setOptionsModalVisible(false);
              Alert.alert(
                "¡Game Over!",
                `¿Eliminar "${categoryName}" y perder todo el progreso de estas flashcards?`,
                [{ text: "Cancelar", style: "cancel" }, { text: "Eliminar", style: "destructive", onPress: handleDelete }]
              );
            }}>
              <Text style={[styles.optionButtonText, styles.optionButtonTextDanger]}>Destruir cartucho</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButtonCancel} onPress={() => setOptionsModalVisible(false)}>
              <Text style={styles.optionButtonTextCancel}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Selección de Imagen */}
      <Modal
        transparent
        visible={isImagePickerModalVisible}
        onRequestClose={() => setImagePickerModalVisible(false)}
        animationType="slide"
      >
        <BlurView intensity={90} style={styles.blurView} tint={darkModeEnabled ? "dark" : "light"}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Personalizar Cartucho</Text>
            <Text style={styles.modalText}>Elige el arte para "{categoryName}"</Text>

            <TouchableOpacity style={styles.modalButton} onPress={handleChooseFromGallery}>
              <Ionicons name="images" size={24} color={activeColorPair?.background} style={styles.buttonIcon} />
              <Text style={styles.modalButtonText}>Galería de Fotos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalButton} onPress={handleGenerateAIImage}>
              <Ionicons name="color-wand" size={24} color={activeColorPair?.background} style={styles.buttonIcon} />
              <Text style={styles.modalButtonText}>Generar con IA (Gemini)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setImagePickerModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>
    </>
  );
};

export default CategoryItem;