// FlashcardList.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchFlashcardsByCategory,
  selectFlashcardsByCategory,
  deleteFlashcard,
  isCategoryLoaded,
  setCategoryAsLoaded
} from '../../../../redux/FlashcardSlice';
import { selectDarkMode } from '../../../../redux/darkModeSlice';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AnimatedSpanishVariantText from './components/AnimatedSpanishVariantText';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const FlashcardList = ({ navigation, route }) => {
  const { category: categoryProp, colorPair } = route.params;
  const categoryName = typeof categoryProp === 'object' ? categoryProp.name : categoryProp;

  const flashcards = useSelector((state) => selectFlashcardsByCategory(state, categoryName));
  const darkModeEnabled = useSelector(selectDarkMode);
  const dispatch = useDispatch();
  const currentUserUID = useSelector(state => state.flashcards.currentUserUID);
  const scrollY = useRef(new Animated.Value(0)).current;
  const categoryAlreadyLoaded = useSelector(state => isCategoryLoaded(state, categoryName));
  const [isLoading, setIsLoading] = useState(true);
  const [loadAttempted, setLoadAttempted] = useState(false);

  const getVariantsForItem = (item) => {
    return [item.spanish, item.variant1, item.variant2, item.variant3].filter(Boolean);
  };

  const loadFlashcards = async () => {
    if (!currentUserUID) return;
    setIsLoading(true);
    try {
      await dispatch(fetchFlashcardsByCategory(currentUserUID, categoryName));
      dispatch(setCategoryAsLoaded(categoryName));
    } catch (error) {
      console.error("Error al cargar flashcards:", error);
    } finally {
      setIsLoading(false);
      setLoadAttempted(true);
    }
  };

  useEffect(() => {
    const shouldLoad = (!categoryAlreadyLoaded || flashcards.length === 0) && !loadAttempted;
    if (shouldLoad) {
      loadFlashcards();
    } else {
      setIsLoading(false);
    }
  }, [categoryName, currentUserUID, categoryAlreadyLoaded, flashcards.length, loadAttempted]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colorPair.background);
    }
    StatusBar.setBarStyle(getContrastYIQ(colorPair.background) ? 'dark-content' : 'light-content');
  }, [darkModeEnabled, colorPair]);

  function getContrastYIQ(hexcolor) {
    if (hexcolor.startsWith('#')) {
      hexcolor = hexcolor.slice(1);
    }
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128;
  }

  if (!colorPair) {
    return (
        <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>Error: colorPair no definido.</Text>
        </SafeAreaView>
    );
  }

  const handleFlashcardPress = (index) => {
    navigation.navigate('Memorize', { category: categoryName, colorPair, currentIndex: index });
  };

  const handleMemorizePress = () => {
    navigation.navigate('VocabularyExercises', { category: categoryName, colorPair });
  };

  const handleAddFlashcardPress = () => {
    navigation.navigate('AddFlashcard', { category: categoryName, colorPair });
  };

  const handleDeleteFlashcard = async (flashcardId) => {
    dispatch(deleteFlashcard(flashcardId));
    try {
      await axios.delete(`https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories/${categoryName}/flashcards/${flashcardId}.json`);
    } catch (error) {
      console.error('Error al eliminar flashcard de Firebase:', error);
    }
  };

  const handleRefresh = () => {
    setLoadAttempted(false);
    loadFlashcards();
  };

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100], outputRange: [150, 0], extrapolate: 'clamp',
  });
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90], outputRange: [1, 0.3, 0], extrapolate: 'clamp',
  });
  const titleScale = scrollY.interpolate({
    inputRange: [0, 100], outputRange: [1, 0.8], extrapolate: 'clamp',
  });
  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, 100], outputRange: [0, -10], extrapolate: 'clamp',
  });

  // --- RENDER ITEM COMPLETAMENTE REESTRUCTURADO ---
  const renderItem = ({ item, index }) => {
    const isLearned = item.isLearned;
    const cardBackgroundColor = darkModeEnabled ? 'rgba(30, 30, 30, 0.9)' : 'white';
    const spanishTextColor = darkModeEnabled ? colorPair.text : colorPair.background;
    const itemVariants = getVariantsForItem(item);

    return (
      <TouchableOpacity
        style={[styles.flashcard, {
          backgroundColor: cardBackgroundColor,
          borderColor: isLearned ? colorPair.background : 'rgba(0,0,0,0.1)',
          borderLeftWidth: isLearned ? 5 : 1,
          borderTopWidth: 1, borderRightWidth: 1, borderBottomWidth: 1,
        }]}
        activeOpacity={0.9}
        onPress={() => handleFlashcardPress(index)}
      >
        {/* --- INICIO: NUEVO ENCABEZADO DE TARJETA --- */}
        <View style={styles.cardHeader}>
          {/* Lado izquierdo: El badge o un espacio vacío para alinear */}
          <View style={styles.headerLeft}>
            {isLearned && (
              <View style={[styles.learnedBadge, { backgroundColor: colorPair.background }]}>
                <FontAwesome5 name="check" size={10} color="white" />
                <Text style={styles.learnedText}>Learned</Text>
              </View>
            )}
          </View>
          
          {/* Lado derecho: El botón de eliminar */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteFlashcard(item.id)}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="close-circle" size={24} color="tomato" />
          </TouchableOpacity>
        </View>
        {/* --- FIN: NUEVO ENCABEZADO DE TARJETA --- */}

        {/* Contenido principal de la tarjeta */}
        <View style={styles.cardContent}>
          <AnimatedSpanishVariantText
            variants={itemVariants}
            textStyle={[styles.spanishText, { color: spanishTextColor }]}
            hasVariants={itemVariants.length > 1}
            containerStyle={styles.spanishTextContainer}
          />

          <View style={styles.divider} />

          <Text style={[styles.englishText, {
            color: darkModeEnabled ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
          }]}>
            {item.english}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colorPair.background }]}>
      <View style={[styles.container, { backgroundColor: darkModeEnabled ? 'rgba(0,0,0,0.85)' : colorPair.background }]}>
        <StatusBar backgroundColor={colorPair.background} barStyle={getContrastYIQ(colorPair.background) ? 'dark-content' : 'light-content'} />
        <Animated.View style={[
          styles.headerContainer, {
            height: headerHeight, opacity: headerOpacity,
            backgroundColor: darkModeEnabled ? 'transparent' : colorPair.background
          }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={darkModeEnabled ? colorPair.text : '#FFF'} />
          </TouchableOpacity>
          <Animated.Text style={[
            styles.title, {
              color: darkModeEnabled ? colorPair.text : '#FFF',
              transform: [{ scale: titleScale }, { translateY: titleTranslateY }]
            }]}>
            {categoryName} 
          </Animated.Text>
          <Text style={[styles.subtitle, { color: darkModeEnabled ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.9)' }]}>
            {flashcards.length} flashcards
          </Text>
        </Animated.View>

        <View style={styles.listContainer}>
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colorPair.background} />
              <Text style={[styles.loaderText, { color: darkModeEnabled ? 'white' : 'black' }]}>
                Cargando flashcards...
              </Text>
            </View>
          ) : (
            <Animated.FlatList
              data={flashcards}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.flatListContent}
              showsVerticalScrollIndicator={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="library-books" size={70} color={darkModeEnabled ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} />
                  <Text style={[styles.emptyText, { color: darkModeEnabled ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>
                    No flashcards yet. Add some to start learning!
                  </Text>
                  <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                    <Text style={[styles.refreshText, { color: colorPair.background }]}>
                      Recargar datos
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>

        <View style={styles.buttonContainer}>
          <LinearGradient
            colors={['transparent', darkModeEnabled ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)']}
            style={styles.buttonGradient}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colorPair.background }]}
              activeOpacity={0.8} onPress={handleMemorizePress}>
              <FontAwesome5 name="brain" size={18} color="white" style={styles.buttonIcon} />
              <Text style={styles.actionButtonText}>Memorizar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.addButton]}
              activeOpacity={0.8} onPress={handleAddFlashcardPress}>
              <Ionicons name="add-circle" size={18} color={colorPair.background} style={styles.buttonIcon} />
              <Text style={[styles.actionButtonText, { color: colorPair.background }]}>
                Agregar Flashcard
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
};

// --- STYLESHEET AJUSTADO PARA EL NUEVO ENFOQUE DE ENCABEZADO ---
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: 15, justifyContent: 'flex-end', paddingBottom: 20,
    marginTop:100,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 3 : 10,
    left: 15, zIndex: 10, width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 30, fontFamily: 'Pagebash',
   
   },
  subtitle: { fontSize: 16, fontFamily: 'WorsSansSemiBold', opacity: 0.8 },
  listContainer: { flex: 1 },
  flatListContent: {
    paddingTop: 20,
    paddingBottom: 120,
    paddingHorizontal: width * 0.075,
  },
  flashcard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 3 }
    }),
  },
  // --- NUEVOS ESTILOS PARA EL ENCABEZADO DE TARJETA ---
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 5, // Espacio entre el header y el contenido
  },
  headerLeft: {
    flex: 1, // Ocupa el espacio disponible
  },
  learnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start', // Para que no se estire
  },
  learnedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  deleteButton: {
    // Ya no necesita posición absoluta
    // Se alinea gracias al flexbox del cardHeader
  },
  // --- FIN DE NUEVOS ESTILOS ---
  cardContent: {
    paddingHorizontal: 20,
    paddingTop: 10, // Menos padding porque el header ya da espacio
    paddingBottom: 24,
  },
  spanishTextContainer: {
    marginBottom: 10,
  },
  spanishText: {
    fontSize: 22,
    fontFamily: 'Pagebash',
  },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginVertical: 10 },
  englishText: { fontSize: 18, fontFamily: 'WorsSansSemiBold', marginTop: 5 },
  buttonContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100 },
  buttonGradient: {
    flexDirection: 'row', justifyContent: 'space-evenly', paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  actionButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30, minWidth: 140,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4 },
      android: { elevation: 4 }
    }),
  },
  addButton: { backgroundColor: 'white', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  actionButtonText: { color: 'white', fontSize: 15, fontFamily: 'Pagebash', fontWeight: '600' },
  buttonIcon: { marginRight: 8 },
  emptyContainer: {
    alignItems: 'center', justifyContent: 'center', padding: 50,
    marginTop: height * 0.1,
  },
  emptyText: {
    textAlign: 'center', marginTop: 20, fontSize: 16,
    fontFamily: 'WorsSansSemiBold', maxWidth: '80%',
  },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 10, fontSize: 16, fontFamily: 'WorsSansSemiBold' },
  refreshButton: {
    marginTop: 20, paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: 'white',
  },
  refreshText: { fontSize: 14, fontFamily: 'WorsSansSemiBold' }
});

export default FlashcardList;