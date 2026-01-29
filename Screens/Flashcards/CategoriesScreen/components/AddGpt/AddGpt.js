import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Text,
  TextInput,
  Dimensions,
  Platform,
  StyleSheet,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

import { useFlashcardGeneration } from './hooks/useFlashcardGeneration';
import { selectDarkMode } from '../../../../../redux/darkModeSlice';
import { addPendingCategory } from '../../../../../redux/FlashcardSlice';
import { getRandomColorPair } from '../../../../../constants';
import ImageBankSelector, { IMAGE_BANK } from '../../../../../components/ImageBankSelector';

const { width, height } = Dimensions.get('window');
const retroFont = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

// Tags disponibles para seleccionar
const AVAILABLE_TAGS = [
  { id: 1, label: 'Travel', icon: 'plane', color: '#4A90D9' },
  { id: 2, label: 'Food', icon: 'utensils', color: '#E67E22' },
  { id: 3, label: 'Business', icon: 'briefcase', color: '#27AE60' },
  { id: 4, label: 'Slang', icon: 'comment-dots', color: '#9B59B6' },
  { id: 5, label: 'Academic', icon: 'graduation-cap', color: '#3498DB' },
  { id: 6, label: 'Daily', icon: 'home', color: '#E74C3C' },
];

const AddGpt = ({ navigation }) => {
  const [category, setCategory] = useState('');
  const [numFlashcards, setNumFlashcards] = useState(5);
  const [selectedTags, setSelectedTags] = useState([]);
  const [inputFocused, setInputFocused] = useState(false);
  const [selectedImageKey, setSelectedImageKey] = useState(null);
  const [isImageSelectorVisible, setImageSelectorVisible] = useState(false);

  const darkModeEnabled = useSelector(selectDarkMode);
  const currentUserUID = useSelector(state => state.flashcards.currentUserUID);
  const dispatch = useDispatch();

  const flashcardGeneration = useFlashcardGeneration(navigation, dispatch);

  // Animaciones
  const buttonScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animación de pulso para el botón cuando hay categoría
  React.useEffect(() => {
    if (category.trim()) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.02, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [category]);

  const handleTagPress = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag.label)
        ? prevTags.filter(t => t !== tag.label)
        : [...prevTags, tag.label]
    );
  };

  const handleGeneratePress = () => {
    // Validate inputs first
    if (!flashcardGeneration.validateInputs(category, currentUserUID)) {
      return;
    }

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    // Create a temporary ID and color for the pending category
    const tempId = `pending_${Date.now()}`;
    const colorPair = getRandomColorPair();

    // Add pending category to Redux (shows in CategoriesScreen immediately)
    dispatch(addPendingCategory({
      tempId,
      name: category,
      colorPair,
      numFlashcards,
      selectedTags,
      progress: 0,
      status: 'starting',
      error: null,
      createdCards: 0,
      selectedImageKey, // Pass the selected image key
    }));

    // Navigate back immediately - user sees the pending card in CategoriesScreen
    navigation.goBack();

    // Start background generation (runs after navigation)
    setTimeout(() => {
      flashcardGeneration.handleBackgroundGeneration(
        tempId,
        category,
        numFlashcards,
        currentUserUID,
        selectedTags
      );
    }, 100);
  };

  // Colores según modo
  const bgColor = darkModeEnabled ? '#0a0a14' : '#D4E8F2';
  const cardBgColor = darkModeEnabled ? '#1a1a2e' : '#F0F7FB';
  const accentColor = '#4A90D9';
  const textPrimary = darkModeEnabled ? '#FFFFFF' : '#1a1a2e';
  const textSecondary = darkModeEnabled ? 'rgba(255,255,255,0.6)' : 'rgba(26,26,46,0.6)';
  const textMuted = darkModeEnabled ? 'rgba(255,255,255,0.4)' : 'rgba(26,26,46,0.4)';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar
        barStyle={darkModeEnabled ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ============ HEADER RETRO ============ */}
        <View style={[styles.header, { backgroundColor: accentColor }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerLabel}>◆ AI GENERATOR ◆</Text>
            <Text style={styles.headerTitle}>CREATE FLASHCARDS</Text>
          </View>

          <View style={styles.headerRight}>
            <MaterialCommunityIcons name="robot" size={24} color="#FFF" />
          </View>
        </View>

        {/* ============ PANEL PRINCIPAL (ESTILO POKÉDEX) ============ */}
        <View style={[styles.mainPanel, { backgroundColor: cardBgColor }]}>
          {/* Barra de título del panel */}
          <View style={[styles.panelHeader, { backgroundColor: accentColor }]}>
            <FontAwesome5 name="magic" size={14} color="#FFF" />
            <Text style={styles.panelHeaderText}>CATEGORY NAME</Text>
          </View>

          {/* Input de categoría */}
          <View style={styles.inputSection}>
            <View style={[styles.inputContainer, {
              borderColor: inputFocused ? accentColor : (darkModeEnabled ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'),
              backgroundColor: darkModeEnabled ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)',
            }]}>
              <FontAwesome5
                name="folder-open"
                size={16}
                color={inputFocused ? accentColor : textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: textPrimary }]}
                value={category}
                onChangeText={setCategory}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Enter category name..."
                placeholderTextColor={textMuted}
              />
            </View>
            <Text style={[styles.inputHint, { color: textMuted }]}>
              e.g. "Animals", "Kitchen Items", "Travel Phrases"
            </Text>
          </View>

          {/* Separador decorativo */}
          <View style={[styles.separator, { backgroundColor: darkModeEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]} />

          {/* ============ TAGS SECTION ============ */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 name="tags" size={12} color={accentColor} />
              <Text style={[styles.sectionTitle, { color: textSecondary }]}>TOPIC TAGS</Text>
              <Text style={[styles.sectionBadge, { backgroundColor: `${accentColor}20`, color: accentColor }]}>
                {selectedTags.length} SELECTED
              </Text>
            </View>

            <View style={styles.tagsGrid}>
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag.label);
                return (
                  <TouchableOpacity
                    key={tag.id}
                    style={[
                      styles.tagButton,
                      {
                        backgroundColor: isSelected ? tag.color : (darkModeEnabled ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
                        borderColor: isSelected ? tag.color : (darkModeEnabled ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'),
                      }
                    ]}
                    onPress={() => handleTagPress(tag)}
                    activeOpacity={0.7}
                  >
                    <FontAwesome5
                      name={tag.icon}
                      size={12}
                      color={isSelected ? '#FFF' : textMuted}
                    />
                    <Text style={[
                      styles.tagText,
                      { color: isSelected ? '#FFF' : textSecondary }
                    ]}>
                      {tag.label.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Separador decorativo */}
          <View style={[styles.separator, { backgroundColor: darkModeEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]} />

          {/* ============ SLIDER SECTION ============ */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="cards" size={14} color={accentColor} />
              <Text style={[styles.sectionTitle, { color: textSecondary }]}>NUMBER OF CARDS</Text>
            </View>

            <View style={styles.sliderContainer}>
              {/* Display del número estilo LCD */}
              <View style={[styles.lcdDisplay, {
                backgroundColor: darkModeEnabled ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.05)',
                borderColor: accentColor,
              }]}>
                <Text style={[styles.lcdNumber, { color: accentColor }]}>
                  {String(numFlashcards).padStart(2, '0')}
                </Text>
                <Text style={[styles.lcdLabel, { color: textMuted }]}>CARDS</Text>
              </View>

              {/* Slider retro */}
              <View style={styles.sliderWrapper}>
                <Text style={[styles.sliderMin, { color: textMuted }]}>01</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={20}
                  step={1}
                  value={numFlashcards}
                  onValueChange={setNumFlashcards}
                  minimumTrackTintColor={accentColor}
                  maximumTrackTintColor={darkModeEnabled ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}
                  thumbTintColor={accentColor}
                />
                <Text style={[styles.sliderMax, { color: textMuted }]}>20</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ============ IMAGE SELECTION SECTION ============ */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <FontAwesome5 name="image" size={12} color={accentColor} />
            <Text style={[styles.sectionTitle, { color: textSecondary }]}>CATEGORY IMAGE</Text>
            <Text style={[styles.sectionBadge, { backgroundColor: `${accentColor}20`, color: accentColor }]}>
              {selectedImageKey ? 'SELECTED' : 'AUTO'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.imagePickerButton, {
              backgroundColor: darkModeEnabled ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              borderColor: darkModeEnabled ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
            }]}
            onPress={() => setImageSelectorVisible(true)}
            activeOpacity={0.7}
          >
            {selectedImageKey && IMAGE_BANK[selectedImageKey] ? (
              <>
                <Image
                  source={IMAGE_BANK[selectedImageKey].image}
                  style={styles.selectedImagePreview}
                  resizeMode="cover"
                />
                <View style={styles.imagePickerTextContainer}>
                  <Text style={[styles.imagePickerLabel, { color: textPrimary }]}>
                    {IMAGE_BANK[selectedImageKey].label.toUpperCase()}
                  </Text>
                  <Text style={[styles.imagePickerHint, { color: textMuted }]}>
                    Tap to change
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={[styles.imagePickerIcon, { backgroundColor: `${accentColor}20` }]}>
                  <FontAwesome5 name="magic" size={20} color={accentColor} />
                </View>
                <View style={styles.imagePickerTextContainer}>
                  <Text style={[styles.imagePickerLabel, { color: textPrimary }]}>
                    AUTO-DETECT
                  </Text>
                  <Text style={[styles.imagePickerHint, { color: textMuted }]}>
                    Based on category name
                  </Text>
                </View>
              </>
            )}
            <Ionicons name="chevron-forward" size={20} color={textMuted} />
          </TouchableOpacity>
        </View>

        {/* Separador decorativo */}
        <View style={[styles.separator, { backgroundColor: darkModeEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]} />

        {/* ============ BOTÓN GENERAR (ESTILO GAME BOY A BUTTON) ============ */}
        <Animated.View style={[
          styles.generateButtonWrapper,
          { transform: [{ scale: Animated.multiply(buttonScale, pulseAnim) }] }
        ]}>
          <TouchableOpacity
            style={[
              styles.generateButton,
              {
                backgroundColor: category.trim() ? accentColor : (darkModeEnabled ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'),
                opacity: category.trim() ? 1 : 0.6,
              }
            ]}
            onPress={handleGeneratePress}
            disabled={!category.trim()}
            activeOpacity={0.8}
          >
            {/* Highlight superior */}
            <View style={styles.buttonHighlight} />

            <View style={styles.buttonContent}>
              <FontAwesome5 name="bolt" size={18} color="#FFF" />
              <Text style={styles.generateButtonText}>GENERATE</Text>
            </View>

            {/* Sombra inferior */}
            <View style={[styles.buttonShadow, { backgroundColor: category.trim() ? '#2563EB' : 'rgba(0,0,0,0.2)' }]} />
          </TouchableOpacity>
        </Animated.View>

        {/* Instrucciones */}
        <View style={styles.instructionsContainer}>
          <MaterialCommunityIcons name="information" size={14} color={textMuted} />
          <Text style={[styles.instructionsText, { color: textMuted }]}>
            AI will generate vocabulary flashcards based on your category and selected tags
          </Text>
        </View>

      </ScrollView>

      {/* Image Bank Selector Modal */}
      <ImageBankSelector
        visible={isImageSelectorVisible}
        onClose={() => setImageSelectorVisible(false)}
        onSelect={(key, imageSource) => {
          setSelectedImageKey(key);
        }}
        selectedKey={selectedImageKey}
        darkMode={darkModeEnabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ========== HEADER ==========
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 50,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 9,
    fontFamily: retroFont,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: retroFont,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  headerRight: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ========== MAIN PANEL ==========
  mainPanel: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  panelHeaderText: {
    fontSize: 11,
    fontFamily: retroFont,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 1,
  },

  // ========== INPUT ==========
  inputSection: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 3,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: retroFont,
    fontWeight: 'bold',
  },
  inputHint: {
    fontSize: 10,
    fontFamily: retroFont,
    marginTop: 8,
    textAlign: 'center',
  },

  // ========== SEPARATOR ==========
  separator: {
    height: 2,
    marginHorizontal: 16,
  },

  // ========== SECTIONS ==========
  sectionContainer: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: retroFont,
    fontWeight: 'bold',
    letterSpacing: 1,
    flex: 1,
  },
  sectionBadge: {
    fontSize: 9,
    fontFamily: retroFont,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },

  // ========== TAGS ==========
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    gap: 6,
  },
  tagText: {
    fontSize: 10,
    fontFamily: retroFont,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  // ========== SLIDER ==========
  sliderContainer: {
    alignItems: 'center',
  },
  lcdDisplay: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    borderWidth: 3,
    marginBottom: 16,
  },
  lcdNumber: {
    fontSize: 48,
    fontFamily: retroFont,
    fontWeight: 'bold',
  },
  lcdLabel: {
    fontSize: 10,
    fontFamily: retroFont,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 4,
  },
  sliderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderMin: {
    fontSize: 10,
    fontFamily: retroFont,
    fontWeight: 'bold',
    marginRight: 8,
  },
  sliderMax: {
    fontSize: 10,
    fontFamily: retroFont,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // ========== GENERATE BUTTON ==========
  generateButtonWrapper: {
    alignItems: 'center',
    marginTop: 24,
    marginHorizontal: 16,
  },
  generateButton: {
    width: '100%',
    height: 64,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  buttonHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  generateButtonText: {
    fontSize: 16,
    fontFamily: retroFont,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 2,
  },
  buttonShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },

  // ========== INSTRUCTIONS ==========
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginHorizontal: 32,
    gap: 8,
  },
  instructionsText: {
    fontSize: 10,
    fontFamily: retroFont,
    textAlign: 'center',
    lineHeight: 14,
  },

  // ========== IMAGE PICKER ==========
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  imagePickerIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedImagePreview: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  imagePickerTextContainer: {
    flex: 1,
  },
  imagePickerLabel: {
    fontSize: 12,
    fontFamily: retroFont,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  imagePickerHint: {
    fontSize: 10,
    fontFamily: retroFont,
    marginTop: 2,
  },
});

export default AddGpt;