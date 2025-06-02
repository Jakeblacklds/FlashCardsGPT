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
  
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons,FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import { selectDarkMode } from '../../../../redux/darkModeSlice'; 
import { useSelector } from 'react-redux';

const { height } = Dimensions.get('window');

// Design system constants
const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 32
};

const COLORS = {
  primary: '#7209b7',
  primaryDark: '#5a189a',
  primaryLight: '#9d4edd',
  accent: '#ff8800',
  accentDark: '#ff5400',
  success: '#4caf50',
  danger: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
  dark: '#121212',
  darkSurface: 'rgba(25, 25, 38, 0.93)',
  lightBackground: '#ECDBFA',
  cardBackground: 'rgba(255, 255, 255, 0.9)',
  cardBackgroundDark: 'rgba(40, 40, 50, 0.95)',
  white: '#FFFFFF',
  text: {
    primary: '#43291f',
    secondary: '#666666',
    light: '#eeeeee',
    dark: '#222222'
  }
};

const AddCategory = ({ navigation }) => {
  const [category, setCategory] = useState('');
  const [flashcards, setFlashcards] = useState([{ english: '', spanish: '' }]);
  const darkModeEnabled = useSelector(selectDarkMode);
  const currentUserUID = useSelector(state => state.flashcards.currentUserUID);
  const [categoryFocused, setCategoryFocused] = useState(false);
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const categoryInputScale = useSharedValue(0.95);
  const flashcardsOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.95);

  // Initialize animations
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    categoryInputScale.value = withDelay(200, withTiming(1, { duration: 500 }));
    flashcardsOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    buttonOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    buttonScale.value = withDelay(600, withTiming(1, { duration: 600 }));
  }, []);
  
  // Animation styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: (1 - headerOpacity.value) * 20 }]
  }));
  
  const categoryInputStyle = useAnimatedStyle(() => ({
    opacity: categoryInputScale.value,
    transform: [{ scale: categoryInputScale.value }]
  }));
  
  const flashcardsStyle = useAnimatedStyle(() => ({
    opacity: flashcardsOpacity.value,
    transform: [{ translateY: (1 - flashcardsOpacity.value) * 15 }]
  }));
  
  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }]
  }));

  const handleAddCategory = async () => {
    try {
      if (!category.trim()) {
        Alert.alert('Atención', 'Por favor, ingrese un nombre de categoría.');
        return;
      }
  
      if (!currentUserUID) {
        console.error('UID de usuario no disponible');
        return;
      }
      
      // Animate button
      buttonScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1.05, { duration: 100 }),
        withTiming(1, { duration: 150 })
      );
  
      const flashcardsObject = flashcards.reduce((obj, item, index) => {
        obj[`flashcard${index + 1}`] = item;
        return obj;
      }, {});
  
      const url = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories/${encodeURIComponent(category)}.json`;
  
      await axios.put(url, {
        name: category,
        flashcards: flashcardsObject
      });
  
      Alert.alert('¡Éxito!', '¡Categoría creada exitosamente!', [
        { text: 'OK', onPress: () => navigation.navigate('Flashcards') }
      ]);
  
    } catch (error) {
      console.error('Error al agregar categoría y flashcards a Firebase:', error);
      Alert.alert('Error', 'Hubo un problema al crear la categoría');
    }
  };
  

  const handleAddFlashcard = () => {
    // Animate button
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1.05, { duration: 100 }),
      withTiming(1, { duration: 150 })
    );
    
    setFlashcards([...flashcards, { english: '', spanish: '' }]);
  };

  const handleFlashcardChange = (index, field, value) => {
    const newFlashcards = [...flashcards];
    newFlashcards[index][field] = value;
    setFlashcards(newFlashcards);
  };
  
  const getBackgroundGradient = () => {
    return darkModeEnabled 
      ? ['#121212', '#1a1a1a', '#222222']
      : ['#E6D3F9', '#D3C2F0', '#C0B1E8'];
  };

  return (
    <View style={styles.safeArea}>
      <LinearGradient
        colors={getBackgroundGradient()}
        style={styles.gradientContainer}
      >
        <StatusBar
          barStyle={darkModeEnabled ? 'light-content' : 'dark-content'}
          backgroundColor={darkModeEnabled ? COLORS.dark : COLORS.lightBackground}
        />
        
        <TouchableOpacity 
          style={[styles.backButton, darkModeEnabled && { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={darkModeEnabled ? COLORS.white : '#333'} 
          />
        </TouchableOpacity>
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={[styles.headerContainer, headerStyle]}>
              <Text style={[styles.headerTitle, darkModeEnabled && styles.textDark]}>
                Crear Nueva Categoría
              </Text>
              <Text style={[styles.headerSubtitle, darkModeEnabled && styles.textDark]}>
                Crea tu propia colección de flashcards
              </Text>
            </Animated.View>
            
            <Animated.View style={[styles.inputCategoryContainer, categoryInputStyle]}>
              <TextInput
                style={[
                  styles.inputCategory, 
                  darkModeEnabled ? styles.inputDark : {},
                  categoryFocused && styles.inputFocused
                ]}
                placeholder="Nombre de la categoría"
                placeholderTextColor={darkModeEnabled ? "#a0a0a0" : "#666"}
                value={category}
                onChangeText={(text) => setCategory(text)}
                onFocus={() => setCategoryFocused(true)}
                onBlur={() => setCategoryFocused(false)}
              />
              <View style={styles.inputIconContainer}>
                <Ionicons 
                  name="create-outline" 
                  size={20} 
                  color={darkModeEnabled ? COLORS.primaryLight : COLORS.primary} 
                />
              </View>
            </Animated.View>

            <Animated.View style={[styles.flashcardsContainer, flashcardsStyle]}>
              <Text style={[styles.sectionTitle, darkModeEnabled && styles.textDark]}>
                Flashcards
              </Text>
              
              {flashcards.map((item, index) => (
                <View key={index} style={styles.flashcardItemContainer}>
                  <View style={[styles.flashcardHeader, darkModeEnabled && styles.flashcardHeaderDark]}>
                    <Text style={[styles.flashcardTitle, darkModeEnabled && styles.textDark]}>
                      Flashcard {index + 1}
                    </Text>
                  </View>
                  
                  <View style={styles.flashcardInputsContainer}>
                    <View style={styles.inputRow}>
                      <View style={styles.inputIconWrapper}>
                        <Ionicons name="globe-outline" size={18} color={darkModeEnabled ? COLORS.primaryLight : COLORS.primary} />
                      </View>
                      <TextInput
                        style={[styles.flashcardInput, darkModeEnabled ? styles.inputDark : {}]}
                        placeholder="Inglés"
                        placeholderTextColor={darkModeEnabled ? "#a0a0a0" : "#666"}
                        value={item.english}
                        onChangeText={(text) => handleFlashcardChange(index, 'english', text)}
                      />
                    </View>
                    
                    <View style={styles.inputRow}>
                      <View style={styles.inputIconWrapper}>
                        <Ionicons name="text-outline" size={18} color={darkModeEnabled ? COLORS.primaryLight : COLORS.primary} />
                      </View>
                      <TextInput
                        style={[styles.flashcardInput, darkModeEnabled ? styles.inputDark : {}]}
                        placeholder="Español"
                        placeholderTextColor={darkModeEnabled ? "#a0a0a0" : "#666"}
                        value={item.spanish}
                        onChangeText={(text) => handleFlashcardChange(index, 'spanish', text)}
                      />
                    </View>
                  </View>
                </View>
              ))}
              
              <Animated.View style={[styles.addFlashcardButtonContainer, buttonStyle]}>
                <TouchableOpacity 
                  style={[styles.addFlashcardButton, darkModeEnabled && styles.addFlashcardButtonDark]} 
                  onPress={handleAddFlashcard}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle-outline" size={20} color={COLORS.white} style={styles.buttonIcon} />
                  <Text style={styles.addFlashcardButtonText}>Agregar Flashcard</Text>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
            
            <Animated.View style={[styles.submitButtonContainer, buttonStyle]}>
              <TouchableOpacity 
                style={[styles.submitButton, !category.trim() && styles.buttonDisabled]} 
                onPress={handleAddCategory}
                disabled={!category.trim()}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#7209b7', '#b5179e', '#f72585']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitButtonGradient}
                >
                  <FontAwesome5 name="save" size={18} color={COLORS.white} style={styles.buttonIcon} />
                  <Text style={styles.submitButtonText}>Guardar Categoría</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};


const styles = StyleSheet.create({
  // Container styles
  safeArea: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: Platform.OS === 'ios' ? 130 : StatusBar.currentHeight + 60,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    minHeight: Platform.OS === 'ios' ? height - 60 : height,
    paddingHorizontal: SPACING.lg,
  },
  containerDark: {
    backgroundColor: COLORS.dark,
  },
  
  // Back button
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    left: SPACING.md,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      }
    }),
  },
  
  // Header styles
  headerContainer: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Pagebash',
    fontSize: 28,
    marginBottom: SPACING.xs,
    color: COLORS.text.primary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    fontFamily: 'WorsSansSemiBold',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: SPACING.md,
  },
  
  // Category input styles
  inputCategoryContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  inputCategory: {
    fontFamily: 'Pagebash',
    padding: SPACING.md,
    paddingRight: 40,
    fontSize: 18,
    borderColor: COLORS.primary,
    borderWidth: 2,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    color: COLORS.text.dark,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      }
    }),
  },
  inputFocused: {
    borderColor: COLORS.accent,
    borderWidth: 2,
  },
  inputIconContainer: {
    position: 'absolute',
    right: SPACING.md,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  
  // Text styles
  textDark: {
    color: COLORS.text.light,
  },
  inputDark: {
    borderColor: COLORS.primaryLight,
    color: COLORS.white,
    backgroundColor: 'rgba(20, 20, 25, 0.98)',
  },
  
  // Flashcards section
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'WorsSansSemiBold',
    color: COLORS.primaryDark,
    marginBottom: SPACING.md,
    letterSpacing: 0.3,
  },
  flashcardsContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  flashcardItemContainer: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      }
    }),
  },
  flashcardHeader: {
    backgroundColor: 'rgba(114, 9, 183, 0.1)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  flashcardHeaderDark: {
    backgroundColor: 'rgba(114, 9, 183, 0.25)',
  },
  flashcardTitle: {
    fontFamily: 'Pagebash',
    fontSize: 18,
    color: COLORS.primaryDark,
    textAlign: 'center',
  },
  flashcardInputsContainer: {
    padding: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  inputIconWrapper: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
  },
  flashcardInput: {
    flex: 1,
    fontFamily: 'Pagebash',
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    borderColor: 'rgba(46, 41, 78, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  
  // Add Flashcard button
  addFlashcardButtonContainer: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  addFlashcardButton: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      }
    }),
  },
  addFlashcardButtonDark: {
    backgroundColor: COLORS.primaryDark,
  },
  addFlashcardButtonText: {
    color: COLORS.white,
    fontFamily: 'Pagebash',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  
  // Submit button
  submitButtonContainer: {
    marginVertical: SPACING.lg,
  },
  submitButton: {
    borderRadius: 25,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      }
    }),
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'Pagebash',
    letterSpacing: 0.6,
  },
  buttonIcon: {
    marginRight: SPACING.sm,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default AddCategory;