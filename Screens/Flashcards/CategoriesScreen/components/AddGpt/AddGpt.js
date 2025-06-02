// Ubicación: Screens/Flashcards/CategoriesScreen/components/AddGpt/AddGpt.js
import React, { useState } from 'react';
import {
 View,
 ScrollView,
 StatusBar,
 TouchableOpacity,
 Dimensions,
 Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Hooks personalizados
import { useAddGptAnimations } from './hooks/useAddGptAnimations';
import { useFlashcardGeneration } from './hooks/useFlashcardGeneration'; // Este se modificará

// Componentes
import { RobotHeader } from './components/RobotHeader';
import { FloatingLabelInput } from './components/FloatingLabelInput';
import { TagSelector } from './components/TagSelector';
import { ImageStyleSelector } from './components/ImageStyleSelector'; // <--- IMPORTADO
import { SliderSection } from './components/SliderSection';
import { GenerateButton } from './components/GenerateButton';
import { DebugMessage } from './components/DebugMessage';
import { LoadingOverlay, SuccessModal } from './FlashcardLoading';

// Utilidades
import { getBackgroundGradient } from './utils/constants';
import { selectDarkMode } from '../../../../../redux/darkModeSlice'; // Ajusta tu ruta
import styles from './AddGpt.styles';

const { width } = Dimensions.get('window');

const AddGpt = ({ navigation }) => {
 const [category, setCategory] = useState('');
 const [numFlashcards, setNumFlashcards] = useState(5);
 const [selectedTags, setSelectedTags] = useState([]);
 const [selectedImageStyleObj, setSelectedImageStyleObj] = useState(null); // <--- NUEVO ESTADO
 const [inputFocused, setInputFocused] = useState(false);
 
 const darkModeEnabled = useSelector(selectDarkMode);
 const currentUserUID = useSelector(state => state.flashcards.currentUserUID); // Ajusta tu ruta
 const dispatch = useDispatch();
 
 const animations = useAddGptAnimations(inputFocused, category, darkModeEnabled);
 const flashcardGeneration = useFlashcardGeneration(navigation, dispatch);
 
 const handleTagPress = (tag) => {
  animations.animateRobot();
  setSelectedTags((prevTags) => 
    prevTags.includes(tag.label) 
      ? prevTags.filter(t => t !== tag.label)
      : [...prevTags, tag.label]
  );
 };

 const handleImageStyleSelect = (styleObject) => { // <--- NUEVO HANDLER
    animations.animateRobot();
    if (styleObject.label === "Ninguno") {
        setSelectedImageStyleObj(null);
    } else {
        setSelectedImageStyleObj((prevStyleObj) => 
        prevStyleObj && prevStyleObj.id === styleObject.id ? null : styleObject
        );
    }
  };

 const handleGeneratePress = () => {
  animations.animateButton();
  flashcardGeneration.handleGeneration(
    category, 
    numFlashcards, 
    currentUserUID, 
    selectedTags,
    selectedImageStyleObj // <--- PASAR ESTILO
  );
 };

 return (
  <View style={styles.safeArea}>
    <LinearGradient
      colors={getBackgroundGradient(darkModeEnabled)}
      style={styles.gradientContainer}
    >
      <StatusBar
        barStyle={darkModeEnabled ? 'light-content' : 'dark-content'}
        backgroundColor={darkModeEnabled ? '#121212' : (Platform.OS === 'android' ? '#E6D3F9' : 'transparent')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
      <LoadingOverlay 
            isLoading={flashcardGeneration.isLoading} // PASANDO EL SHARED VALUE DIRECTAMENTE
            loadingMessage={flashcardGeneration.loadingMessage}
        />
        <SuccessModal showSuccessModal={flashcardGeneration.showSuccessModal} />

        <TouchableOpacity
          style={[styles.backButton, darkModeEnabled && styles.backButtonDark]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={darkModeEnabled ? '#E0E0E0' : '#333333'}
          />
        </TouchableOpacity>

        <RobotHeader 
          robotStyle={animations.robotStyle}
          robotGlowStyle={animations.robotGlowStyle}
          titleStyle={animations.titleStyle}
          darkModeEnabled={darkModeEnabled}
        />
        
        <FloatingLabelInput
          value={category}
          onChangeText={setCategory}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          animatedStyle={animations.animatedStyle}
          animatedLabelStyle={animations.animatedLabelStyle}
          darkModeEnabled={darkModeEnabled}
          inputFocused={inputFocused}
        />

        <TagSelector
          selectedTags={selectedTags}
          onTagPress={handleTagPress}
          darkModeEnabled={darkModeEnabled}
          tagContainerStyle={animations.tagContainerStyle}
        />

        {/* === NUEVO COMPONENTE === */}
        <ImageStyleSelector
            selectedStyleLabel={selectedImageStyleObj?.label}
            onStyleSelect={handleImageStyleSelect}
            darkModeEnabled={darkModeEnabled}
            containerStyle={animations.tagContainerStyle} // Puedes reusar la animación o crear una específica
        />
        {/* ======================= */}

        <SliderSection
          numFlashcards={numFlashcards}
          onValueChange={setNumFlashcards}
          darkModeEnabled={darkModeEnabled}
          sliderContainerStyle={animations.sliderContainerStyle}
        />

        <GenerateButton
          category={category}
          onPress={handleGeneratePress}
          onAnimatePress={animations.animateButton}
          buttonStyle={animations.buttonStyle}
          darkModeEnabled={darkModeEnabled}
        />

        <DebugMessage 
          message={flashcardGeneration.debugMessage} 
          darkModeEnabled={darkModeEnabled} 
        />
      </ScrollView>
    </LinearGradient>
  </View>
 );
};

export default AddGpt;