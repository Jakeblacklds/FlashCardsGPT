import React, { useState, useEffect, useMemo } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
  Alert,
  Image,
} from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { getColors } from 'react-native-image-colors';
import { LinearGradient } from 'expo-linear-gradient';

import { selectDarkMode } from '../../../../redux/darkModeSlice';
import { fetchFlashcardCountByCategory, selectFlashcardCount, saveCategoryImage } from '../../../../redux/FlashcardSlice';
import {
  getCategoryImage,
  getCategoryEmoji,
  getCategoryFallbackColor,
  matchCategoryToKey,
  hasCategoryImage as checkHasImage,
} from '../../../../utils/CategoryImageBank';
import ImageBankSelector from '../../../../components/ImageBankSelector';
import { IMAGE_BANK } from '../../../../utils/generatedImageBank';

const { width } = Dimensions.get('window');

// Grid calculations
const NUM_COLUMNS = 2;
const SCREEN_PADDING = 16;
const ITEM_GAP = 12;
const TOTAL_AVAILABLE_WIDTH = width - (SCREEN_PADDING * 2) - (ITEM_GAP * (NUM_COLUMNS - 1));
const CARD_WIDTH = Math.floor(TOTAL_AVAILABLE_WIDTH / NUM_COLUMNS);
const CARD_HEIGHT = CARD_WIDTH * 1.25;

const retroFont = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

// Helper to get contrast color
const getContrastColor = (hexcolor) => {
  if (!hexcolor) return '#FFF';
  let hex = hexcolor.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#1a1a2e' : '#FFFFFF';
};

// Helper to check if a color is dark (for choosing text colors)
const isColorDark = (hexcolor) => {
  if (!hexcolor) return true;
  let hex = hexcolor.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
};

// -------------------------------------------------------------------------
// CARTUCHO CONTAINER (GameBoy Style)
// -------------------------------------------------------------------------
const CartuchoContainer = ({
  children,
  cardWidth = CARD_WIDTH,
  cardHeight = CARD_HEIGHT,
  mainColor = "#5DBC67",
  darkMode = false,
}) => {
  const notchColor = darkMode ? "#1a1a2e" : "#fff";
  const r = 10;
  const cutSize = 14;
  const sr = 5;
  const notchWidth = 8;
  const notchHeight = 3;
  const notchSpacing = 3;
  const topOffsetPos = 22;

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
    L ${cardWidth - cutSize - sr} 0
    A ${sr} ${sr} 0 0 1 ${cardWidth - cutSize} ${sr}
    L ${cardWidth - cutSize} ${cutSize - sr}
    A ${sr} ${sr} 0 0 0 ${cardWidth - cutSize + sr} ${cutSize}
    L ${cardWidth - sr} ${cutSize}
    A ${sr} ${sr} 0 0 1 ${cardWidth} ${cutSize + sr}
    L ${cardWidth} ${cardHeight - r}
    A ${r} ${r} 0 0 1 ${cardWidth - r} ${cardHeight}
    L ${r} ${cardHeight}
    A ${r} ${r} 0 0 1 0 ${cardHeight - r}
    Z
  `;

  const insetColor = darkMode ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)';

  return (
    <View style={[stylesCartucho.container, { width: cardWidth, height: cardHeight }]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox={`0 0 ${cardWidth} ${cardHeight}`}>
          <Path d={bodyPath} fill={mainColor} stroke={"rgba(0,0,0,0.15)"} strokeWidth={1} />
          <Rect
            x={cardWidth * 0.08}
            y={cardHeight * 0.22}
            width={cardWidth * 0.84}
            height={cardHeight * 0.72}
            rx={6}
            fill={insetColor}
          />
          {renderNotches(-1)}
          {renderNotches(cardWidth - notchWidth + 1)}
        </Svg>
      </View>
      <View style={stylesCartucho.contentArea}>
        {children}
      </View>
    </View>
  );
};

const stylesCartucho = StyleSheet.create({
  container: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    position: 'relative',
  },
  contentArea: {
    position: 'absolute',
    top: '22%',
    left: '8%',
    right: '8%',
    bottom: '6%',
    borderRadius: 6,
    overflow: 'hidden',
  },
});

// -------------------------------------------------------------------------
// CATEGORY ITEM COMPONENT 
// -------------------------------------------------------------------------
const CategoryItem = ({
  category,
  onPress,
  onDelete,
  initialColorPair,
}) => {
  const [isOptionsModalVisible, setOptionsModalVisible] = useState(false);
  const [isImageSelectorVisible, setImageSelectorVisible] = useState(false);
  const [extractedColor, setExtractedColor] = useState(null);

  // Leer imageKey guardada en la categoría (desde Firebase/Redux)
  const savedImageKey = typeof category === 'object' ? category?.imageKey : null;

  const darkModeEnabled = useSelector(selectDarkMode);
  const currentUserUID = useSelector(state => state.flashcards.currentUserUID);
  const dispatch = useDispatch();

  const categoryId = typeof category === 'string' ? category : category?.id;
  const categoryName = typeof category === 'string' ? category : category?.name;
  const flashcardCount = useSelector(state => selectFlashcardCount(state, categoryId));

  // Get the image source, emoji and color for this category
  const categoryKey = useMemo(() => matchCategoryToKey(categoryName), [categoryName]);

  // Use saved image key if set, otherwise auto-detect
  const categoryImage = useMemo(() => {
    if (savedImageKey && IMAGE_BANK[savedImageKey]) {
      return IMAGE_BANK[savedImageKey].image;
    }
    return getCategoryImage(categoryName);
  }, [categoryName, savedImageKey]);

  const categoryEmoji = useMemo(() => {
    if (savedImageKey && IMAGE_BANK[savedImageKey]) {
      return IMAGE_BANK[savedImageKey].emoji;
    }
    return getCategoryEmoji(categoryName);
  }, [categoryName, savedImageKey]);

  const fallbackColor = useMemo(() => getCategoryFallbackColor(categoryName), [categoryName]);
  const hasImage = categoryImage !== null;

  // Extract colors from the category image (only if image exists)
  // Extrae: backgroundColor (fondo de la imagen) y accentColor (elementos/texto)
  const [colorPalette, setColorPalette] = useState({
    background: null,
    accent: null,
  });

  useEffect(() => {
    if (!hasImage || !categoryImage) return;

    const extractColors = async () => {
      try {
        const { uri } = Image.resolveAssetSource(categoryImage);

        const result = await getColors(uri, {
          fallback: fallbackColor,
          cache: true,
          key: savedImageKey || categoryKey,
        });

        let bgColor, accentColor;

        if (Platform.OS === 'android') {
          // Android: background es el color dominante/average, accent es vibrant/muted
          bgColor = result.dominant || result.average || result.vibrant;
          accentColor = result.vibrant || result.lightVibrant || result.muted;
        } else {
          // iOS: background es el fondo, accent viene de primary/detail
          bgColor = result.background || result.primary;
          accentColor = result.primary || result.detail || result.secondary;
        }

        // Si el accent es muy oscuro, buscar alternativa más clara para texto
        if (accentColor) {
          const isAccentDark = isColorDark(accentColor);
          if (isAccentDark && Platform.OS === 'android') {
            // Preferir lightVibrant o lightMuted para texto si están disponibles
            accentColor = result.lightVibrant || result.lightMuted || accentColor;
          } else if (isAccentDark && Platform.OS === 'ios') {
            accentColor = result.secondary || result.detail || accentColor;
          }
        }

        setColorPalette({
          background: bgColor || fallbackColor,
          accent: accentColor || bgColor || fallbackColor,
        });
        setExtractedColor(bgColor);
      } catch (error) {
        console.log('Color extraction error:', error);
      }
    };

    extractColors();
  }, [categoryImage, categoryKey, savedImageKey, fallbackColor, hasImage]);

  useEffect(() => {
    if (currentUserUID && categoryId) {
      dispatch(fetchFlashcardCountByCategory(currentUserUID, categoryId));
    }
  }, [currentUserUID, categoryId, dispatch]);

  const handleDelete = () => onDelete(categoryId);

  // Colors - Usando la paleta extraída de la imagen
  const mainColor = colorPalette.background || extractedColor || fallbackColor;
  const accentColor = colorPalette.accent || mainColor;
  const textOnColor = getContrastColor(mainColor);
  const screenBg = darkModeEnabled ? '#0a0a14' : '#f0f4f8';
  const textPrimary = darkModeEnabled ? '#FFFFFF' : '#1a1a2e';
  const textSecondary = darkModeEnabled ? 'rgba(255,255,255,0.6)' : 'rgba(26,26,46,0.5)';

  // Para texto sobre el cartucho, usar accent si es suficientemente claro, sino blanco
  const decorativeColor = isColorDark(accentColor) ? '#FFFFFF' : accentColor;

  // Color pair to pass to FlashcardList
  const colorPairToPass = {
    background: mainColor,
    text: textOnColor,
    accent: accentColor,
  };

  return (
    <>
      <TouchableOpacity
        style={styles.touchableWrapper}
        activeOpacity={0.9}
        onPress={() => onPress(category, colorPairToPass, null)}
      >
        <CartuchoContainer
          cardWidth={CARD_WIDTH}
          cardHeight={CARD_HEIGHT}
          mainColor={mainColor}
          darkMode={darkModeEnabled}
        >
          {/* LCD Screen - Nuevo diseño horizontal estilo Pokédex */}
          <View style={[styles.lcdScreen, { backgroundColor: darkModeEnabled ? '#1a1a2e' : '#f0f4f8' }]}>

            {/* Header con número */}
            <View style={[styles.lcdHeader, { backgroundColor: mainColor }]}>
              <Text style={styles.slotLabel}>#{String(flashcardCount).padStart(3, '0')}</Text>
              <TouchableOpacity
                style={styles.menuButtonHeader}
                onPress={() => setOptionsModalVisible(true)}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <Ionicons name="ellipsis-horizontal" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Contenido principal - Layout horizontal */}
            <View style={styles.lcdContentHorizontal}>

              {/* Marco de imagen a la izquierda */}
              <View style={[styles.imageFrame, { borderColor: mainColor }]}>
                {hasImage ? (
                  <Image
                    source={categoryImage}
                    style={styles.frameImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={[styles.emojiFrame, { backgroundColor: `${mainColor}20` }]}>
                    <Text style={styles.frameEmoji}>{categoryEmoji}</Text>
                  </View>
                )}
              </View>

              {/* Info a la derecha */}
              <View style={styles.infoContainer}>
                {/* Nombre de categoría */}
                <Text
                  style={[styles.categoryNameNew, { color: darkModeEnabled ? '#FFF' : '#1a1a2e' }]}
                  numberOfLines={2}
                >
                  {categoryName?.toUpperCase() || 'CATEGORY'}
                </Text>

                {/* Línea decorativa - usa accent color de los elementos de la imagen */}
                <View style={[styles.decorativeLine, { backgroundColor: accentColor }]} />

                {/* Stats */}
                <View style={styles.statsRow}>
                  <FontAwesome5 name="layer-group" size={11} color={accentColor} />
                  <Text style={[styles.statsText, { color: darkModeEnabled ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
                    {flashcardCount} CARDS
                  </Text>
                </View>
              </View>
            </View>

            {/* Footer con indicador de color usando accent */}
            <View style={[styles.lcdFooterNew, { backgroundColor: `${accentColor}15` }]}>
              <View style={[styles.colorIndicator, { backgroundColor: accentColor }]} />
              <Text style={[styles.footerLabel, { color: darkModeEnabled ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }]}>
                ◆ FLASHCARDEX ◆
              </Text>
            </View>
          </View>
        </CartuchoContainer>
      </TouchableOpacity>

      {/* Options Modal */}
      <Modal
        visible={isOptionsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOptionsModalVisible(false)}
        >
          <View style={[styles.optionModalBox, {
            backgroundColor: darkModeEnabled ? '#1a1a2e' : '#FFF',
            borderColor: mainColor,
          }]}>
            <View style={[styles.modalHeader, { backgroundColor: mainColor }]}>
              <Text style={[styles.modalHeaderText, { color: textOnColor }]}>
                {categoryName?.toUpperCase()}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.optionButton, { borderBottomColor: darkModeEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
              onPress={() => {
                setOptionsModalVisible(false);
                setImageSelectorVisible(true);
              }}
            >
              <FontAwesome5 name="image" size={14} color={mainColor} />
              <Text style={[styles.optionButtonText, { color: textPrimary }]}>Change Image</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, { borderBottomColor: darkModeEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
              onPress={() => {
                setOptionsModalVisible(false);
                Alert.alert('Edit', `Rename: ${categoryName}`);
              }}
            >
              <FontAwesome5 name="edit" size={14} color={mainColor} />
              <Text style={[styles.optionButtonText, { color: textPrimary }]}>Rename Category</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                setOptionsModalVisible(false);
                Alert.alert(
                  "Delete Category",
                  `Are you sure you want to delete "${categoryName}"?`,
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: handleDelete }
                  ]
                );
              }}
            >
              <FontAwesome5 name="trash-alt" size={14} color="#EF4444" />
              <Text style={[styles.optionButtonText, { color: '#EF4444' }]}>Delete Category</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setOptionsModalVisible(false)}
            >
              <Text style={[styles.cancelButtonText, { color: textSecondary }]}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Image Bank Selector Modal */}
      <ImageBankSelector
        visible={isImageSelectorVisible}
        onClose={() => setImageSelectorVisible(false)}
        onSelect={(key, imageSource) => {
          // Guardar la imageKey en Firebase para persistencia
          dispatch(saveCategoryImage(categoryId, key));
          // Reset extracted color so it re-extracts from new image
          setExtractedColor(null);
        }}
        selectedKey={savedImageKey}
        darkMode={darkModeEnabled}
      />
    </>
  );
};

const styles = StyleSheet.create({
  touchableWrapper: {
    marginVertical: 6,
  },

  // LCD Screen
  lcdScreen: {
    flex: 1,
    borderRadius: 5,
    overflow: 'hidden',
  },

  // Header
  lcdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  slotLabel: {
    fontSize: 10,
    fontFamily: retroFont,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 1,
  },
  menuButtonHeader: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },

  // Contenido horizontal
  lcdContentHorizontal: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 10,
  },

  // Marco de imagen
  imageFrame: {
    width: 52,
    height: 52,
    borderRadius: 8,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  frameImage: {
    width: '100%',
    height: '100%',
  },
  emojiFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameEmoji: {
    fontSize: 26,
  },

  // Info container
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryNameNew: {
    fontSize: 11,
    fontFamily: retroFont,
    fontWeight: 'bold',
    letterSpacing: 0.3,
    lineHeight: 14,
  },
  decorativeLine: {
    height: 2,
    width: '60%',
    borderRadius: 1,
    marginVertical: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statsText: {
    fontSize: 9,
    fontFamily: retroFont,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Footer nuevo
  lcdFooterNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 6,
  },
  colorIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  footerLabel: {
    fontSize: 7,
    fontFamily: retroFont,
    fontWeight: '600',
    letterSpacing: 1,
  },
  menuButton: {
    padding: 6,
    borderRadius: 6,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  optionModalBox: {
    width: '85%',
    maxWidth: 320,
    borderRadius: 12,
    borderWidth: 3,
    overflow: 'hidden',
  },
  modalHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  modalHeaderText: {
    fontSize: 12,
    fontFamily: retroFont,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  optionButtonText: {
    fontSize: 14,
    fontFamily: retroFont,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 11,
    fontFamily: retroFont,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default CategoryItem;
