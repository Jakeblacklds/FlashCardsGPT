import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchFlashcardsByCategory,
  selectFlashcardsByCategory,
  deleteFlashcard,
  isCategoryLoaded,
  setCategoryAsLoaded,
  syncCacheForCategory
} from '../../../../redux/FlashcardSlice';
import { selectDarkMode } from '../../../../redux/darkModeSlice';
import { Ionicons, FontAwesome5, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AnimatedSpanishVariantText from './components/AnimatedSpanishVariantText';
import useStudyProgress from './VocabExercises/hooks/useStudyProgress';


const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 28;


const FlashcardList = ({ navigation, route }) => {
  const { category: categoryProp, colorPair, categoryImageUri } = route.params;
  const categoryName = typeof categoryProp === 'object' ? categoryProp.name : categoryProp;
  const flashcards = useSelector((state) => selectFlashcardsByCategory(state, categoryName));
  const darkModeEnabled = useSelector(selectDarkMode);
  const dispatch = useDispatch();
  const currentUserUID = useSelector(state => state.flashcards.currentUserUID);
  const categoryAlreadyLoaded = useSelector(state => isCategoryLoaded(state, categoryName));
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Seguimiento de progreso
  const { categoryStats, getWordMastery } = useStudyProgress(flashcards, categoryName);

  // Colores retro
  const bgColor = darkModeEnabled ? '#0a0a14' : '#D4E8F2';
  const cardBgColor = darkModeEnabled ? '#1a1a2e' : '#F0F7FB';
  const accentColor = colorPair?.background || '#4A90D9';
  const textPrimary = darkModeEnabled ? '#FFFFFF' : '#1a1a2e';
  const textSecondary = darkModeEnabled ? 'rgba(255,255,255,0.7)' : 'rgba(26,26,46,0.6)';
  const textMuted = darkModeEnabled ? 'rgba(255,255,255,0.4)' : 'rgba(26,26,46,0.4)';
  const retroFont = Platform.OS === 'ios' ? 'Menlo' : 'monospace';


  const getVariantsForItem = (item) => [item.spanish, item.variant1, item.variant2, item.variant3].filter(Boolean);


  // Cargar flashcards con estrategia cache-first
  const loadFlashcards = useCallback(async (showFullLoader = true) => {
    if (!currentUserUID) {
      setIsLoading(false);
      return;
    }

    // Si ya tenemos datos en caché, solo mostramos indicador sutil
    if (flashcards.length > 0) {
      setIsRefreshing(true);
      showFullLoader = false;
    } else {
      setIsLoading(showFullLoader);
    }

    try {
      await dispatch(fetchFlashcardsByCategory(currentUserUID, categoryName));
      dispatch(setCategoryAsLoaded(categoryName));
    } catch (error) {
      console.error("Error al cargar flashcards:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentUserUID, categoryName, flashcards.length, dispatch]);


  useEffect(() => {
    // Si la categoría no está cargada o no hay flashcards, cargar
    if (!categoryAlreadyLoaded) {
      loadFlashcards(true);
    } else if (flashcards.length === 0) {
      // Categoría marcada como cargada pero sin datos, intentar de nuevo
      loadFlashcards(true);
    } else {
      // Ya tenemos datos, no mostrar loader
      setIsLoading(false);
    }
  }, [categoryName, currentUserUID]);


  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }
    StatusBar.setBarStyle(darkModeEnabled ? 'light-content' : 'dark-content');
  }, [darkModeEnabled]);


  if (!colorPair) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: bgColor }}>
        <Text style={{ color: textPrimary, fontFamily: retroFont }}>ERROR: COLORPAIR NO DEFINIDO</Text>
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

  const handleDeleteFlashcard = async (flashcardId, firebaseKey) => {
    dispatch(deleteFlashcard(flashcardId));
    try {
      // Usar firebaseKey para la URL de Firebase (si existe), si no, usar flashcardId
      const keyForFirebase = firebaseKey || flashcardId;
      await axios.delete(`https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories/${categoryName}/flashcards/${keyForFirebase}.json`);
      // Sincronizar caché local después de eliminar
      dispatch(syncCacheForCategory(categoryName));
    } catch (error) {
      console.error('Error al eliminar flashcard de Firebase:', error);
    }
  };


  // Función para obtener estrellas según el nivel de maestría
  const getMasteryStars = (level) => {
    const stars = [];
    const maxStars = 5;
    const filledStars = Math.min(level, maxStars);

    for (let i = 0; i < maxStars; i++) {
      stars.push(
        <FontAwesome
          key={i}
          name={i < filledStars ? "star" : "star-o"}
          size={11}
          color={i < filledStars ? "#FFD700" : textMuted}
          style={{ marginHorizontal: 1 }}
        />
      );
    }
    return stars;
  };


  // ------- RENDER FLASHCARD RETRO COLECCIÓN -------
  const renderItem = ({ item, index }) => {
    const isLearned = item.isLearned;
    const masteryInfo = getWordMastery(item.id);
    const itemVariants = getVariantsForItem(item);
    const cardBorderColor = isLearned ? '#4ADE80' : accentColor;

    return (
      <TouchableOpacity
        style={[
          styles.flashcard,
          {
            backgroundColor: cardBgColor,
            borderColor: cardBorderColor,
          }
        ]}
        activeOpacity={0.9}
        onPress={() => handleFlashcardPress(index)}
      >
        {/* Borde superior con color */}
        <View style={[styles.cardTopBar, { backgroundColor: cardBorderColor }]}>
          <Text style={styles.cardNumber}>#{String(index + 1).padStart(3, '0')}</Text>
          {isLearned && (
            <View style={styles.learnedPill}>
              <FontAwesome name="check" size={8} color="#FFF" />
              <Text style={styles.learnedPillText}>LEARNED</Text>
            </View>
          )}
        </View>

        {/* Contenido principal - estilo carta */}
        <View style={styles.cardMainContent}>
          {/* Lado izquierdo - Emoji de la palabra */}
          <View style={[styles.cardIconBox, {
            backgroundColor: darkModeEnabled ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)',
            borderColor: `${accentColor}50`,
          }]}>
            <Text style={styles.cardEmoji}>{item.icon || '📚'}</Text>
          </View>

          {/* Lado derecho - Texto */}
          <View style={styles.cardTextContent}>
            {/* Palabra en español */}
            <AnimatedSpanishVariantText
              variants={itemVariants}
              textStyle={[styles.spanishText, { color: textPrimary }]}
              hasVariants={itemVariants.length > 1}
              containerStyle={styles.spanishContainer}
            />

            {/* Palabra en inglés */}
            <Text style={[styles.englishText, { color: textSecondary }]}>
              {item.english}
            </Text>
          </View>
        </View>

        {/* Barra inferior con badges retro */}
        <View style={[styles.cardFooter, {
          backgroundColor: darkModeEnabled ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)',
          borderTopColor: darkModeEnabled ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
        }]}>
          {/* Badge Tipo */}
          <View style={[styles.retroBadge, { backgroundColor: `${accentColor}25` }]}>
            <Text style={[styles.retroBadgeLabel, { color: textMuted }]}>TIPO:</Text>
            <Text style={[styles.retroBadgeValue, { color: accentColor }]}>
              {(item.type || 'vocab').toUpperCase()}
            </Text>
          </View>

          {/* Badge Nivel */}
          <View style={[styles.retroBadge, { backgroundColor: darkModeEnabled ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
            <Text style={[styles.retroBadgeLabel, { color: textMuted }]}>NIVEL:</Text>
            <Text style={[styles.retroBadgeValue, { color: '#4ECDC4' }]}>
              {masteryInfo?.masteryLevel > 0 ? `LV${masteryInfo.masteryLevel}` : 'NEW'}
            </Text>
          </View>

          {/* Estrellas de rareza */}
          <View style={[styles.retroBadgeStars, { backgroundColor: 'rgba(255,215,0,0.12)' }]}>
            <Text style={[styles.retroBadgeLabel, { color: textMuted }]}>RAREZA</Text>
            <View style={styles.starsRow}>
              {getMasteryStars(item.rarity || 1)}
            </View>
          </View>
        </View>

        {/* Botón eliminar */}
        <TouchableOpacity
          style={[styles.deleteBtn, { backgroundColor: darkModeEnabled ? 'rgba(255,0,0,0.2)' : 'rgba(255,0,0,0.1)' }]}
          onPress={() => handleDeleteFlashcard(item.id, item.firebaseKey)}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <FontAwesome name="trash-o" size={12} color="#FF6B6B" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };


  const learnedCount = flashcards.filter(f => f.isLearned).length;


  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar
        barStyle={darkModeEnabled ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      {/* ============ HEADER RETRO ============ */}
      <SafeAreaView>
        <View style={[styles.header, {
          backgroundColor: accentColor,
          borderColor: darkModeEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)',
        }]}>
          {/* Botón volver */}
          <TouchableOpacity
            style={styles.headerBackBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>

          {/* Centro - Título */}
          <View style={styles.headerCenter}>
            <Text style={styles.headerLabel}>◆ CATEGORÍA ◆</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {categoryName?.toUpperCase() || 'CATEGORY'}
            </Text>
          </View>

          {/* Imagen de categoría */}
          <View style={styles.headerImgContainer}>
            {categoryImageUri ? (
              <Image source={{ uri: categoryImageUri }} style={styles.headerImg} />
            ) : (
              <View style={styles.headerImgPlaceholder}>
                <FontAwesome5 name="folder" size={16} color="#FFF" />
              </View>
            )}
          </View>
        </View>

        {/* Panel de stats */}
        <View style={[styles.statsRow, { backgroundColor: darkModeEnabled ? '#12121f' : '#C5DDE9' }]}>
          <View style={styles.statItem}>
            <FontAwesome name="th-list" size={12} color={accentColor} />
            <Text style={[styles.statText, { color: textPrimary }]}>{flashcards.length}</Text>
            <Text style={[styles.statLabel, { color: textMuted }]}>CARDS</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: textMuted }]} />
          <View style={styles.statItem}>
            <FontAwesome name="check-circle" size={12} color="#4ADE80" />
            <Text style={[styles.statText, { color: textPrimary }]}>{learnedCount}</Text>
            <Text style={[styles.statLabel, { color: textMuted }]}>LEARNED</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: textMuted }]} />
          <View style={styles.statItem}>
            <FontAwesome name="star" size={12} color="#FFD700" />
            <Text style={[styles.statText, { color: textPrimary }]}>
              {flashcards.length > 0 ? Math.round((learnedCount / flashcards.length) * 100) : 0}%
            </Text>
            <Text style={[styles.statLabel, { color: textMuted }]}>PROGRESS</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* ============ INDICADOR DE ACTUALIZANDO ============ */}
      {isRefreshing && (
        <View style={styles.refreshingBar}>
          <ActivityIndicator size="small" color={accentColor} />
          <Text style={[styles.refreshingText, { color: textSecondary }]}>Actualizando...</Text>
        </View>
      )}

      {/* ============ LISTA DE FLASHCARDS ============ */}
      {isLoading ? (
        // Skeleton loader mientras carga
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4].map((_, index) => (
            <View
              key={index}
              style={[styles.skeletonCard, {
                backgroundColor: cardBgColor,
                borderColor: `${accentColor}50`,
              }]}
            >
              {/* Top bar skeleton */}
              <View style={[styles.skeletonTopBar, { backgroundColor: `${accentColor}40` }]} />

              {/* Content skeleton */}
              <View style={styles.skeletonContent}>
                <View style={[styles.skeletonIcon, { backgroundColor: `${accentColor}20` }]} />
                <View style={styles.skeletonTextArea}>
                  <View style={[styles.skeletonLine, styles.skeletonLineLong, { backgroundColor: darkModeEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]} />
                  <View style={[styles.skeletonLine, styles.skeletonLineMedium, { backgroundColor: darkModeEnabled ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} />
                </View>
              </View>

              {/* Footer skeleton */}
              <View style={[styles.skeletonFooter, { backgroundColor: darkModeEnabled ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)' }]}>
                <View style={[styles.skeletonBadge, { backgroundColor: `${accentColor}15` }]} />
                <View style={[styles.skeletonBadge, { backgroundColor: darkModeEnabled ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]} />
                <View style={[styles.skeletonBadge, { backgroundColor: 'rgba(255,215,0,0.1)' }]} />
              </View>
            </View>
          ))}
          <View style={styles.loadingTextContainer}>
            <ActivityIndicator size="small" color={accentColor} style={{ marginRight: 8 }} />
            <Text style={[styles.loadingText, { color: textSecondary }]}>Cargando cartas...</Text>
          </View>
        </View>
      ) : (
        <Animated.FlatList
          data={flashcards}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{
            paddingTop: 14,
            paddingBottom: 130,
            paddingHorizontal: 14,
          }}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyBox, {
                backgroundColor: cardBgColor,
                borderColor: accentColor,
              }]}>
                <View style={[styles.emptyIconBox, { backgroundColor: `${accentColor}20` }]}>
                  <MaterialCommunityIcons name="cards-outline" size={40} color={accentColor} />
                </View>
                <Text style={[styles.emptyTitle, { color: textPrimary }]}>NO HAY CARTAS</Text>
                <Text style={[styles.emptyText, { color: textSecondary }]}>
                  ¡Agrega tu primera carta para{'\n'}empezar tu colección!
                </Text>
              </View>
            </View>
          )}
        />
      )}

      {/* ============ BOTONES FAB RETRO ============ */}
      <View style={styles.fabContainer}>
        <LinearGradient
          colors={['transparent', bgColor]}
          style={styles.fabGradient}
        >
          <View style={styles.fabRow}>
            {/* Botón Agregar */}
            <TouchableOpacity
              style={[styles.retroFab, {
                backgroundColor: darkModeEnabled ? '#252540' : '#FFF',
                borderColor: accentColor,
              }]}
              activeOpacity={0.85}
              onPress={handleAddFlashcardPress}
            >
              <FontAwesome name="plus" size={14} color={accentColor} />
              <Text style={[styles.retroFabText, { color: accentColor }]}>AGREGAR</Text>
            </TouchableOpacity>

            {/* Botón Entrenar */}
            <TouchableOpacity
              style={[styles.retroFab, styles.retroFabPrimary, { backgroundColor: '#4ADE80' }]}
              activeOpacity={0.85}
              onPress={handleMemorizePress}
              delayPressIn={0}
            >
              <FontAwesome5 name="play" size={12} color="#FFF" />
              <Text style={[styles.retroFabText, { color: '#FFF' }]}>¡ENTRENAR!</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ========== HEADER RETRO ==========
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    borderBottomWidth: 3,
  },
  headerBackBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerLabel: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerImgContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  headerImg: {
    width: '100%',
    height: '100%',
  },
  headerImgPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    opacity: 0.3,
  },

  // ========== FLASHCARD RETRO COLECCIÓN ==========
  flashcard: {
    width: CARD_WIDTH,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cardNumber: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 1,
  },
  learnedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  learnedPillText: {
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  cardMainContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  cardIconBox: {
    width: 60,
    height: 60,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardTextContent: {
    flex: 1,
    marginLeft: 12,
  },
  spanishContainer: {
    marginBottom: 2,
  },
  spanishText: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: 'bold',
  },
  englishText: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  cardFooter: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 2,
    gap: 6,
  },
  retroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
  },
  retroBadgeLabel: {
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  retroBadgeValue: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: 'bold',
  },
  retroBadgeStars: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 'auto',
    gap: 4,
  },
  starsRow: {
    flexDirection: 'row',
  },
  deleteBtn: {
    position: 'absolute',
    top: 36,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ========== EMPTY STATE ==========
  emptyContainer: {
    paddingVertical: 50,
    paddingHorizontal: 16,
  },
  emptyBox: {
    padding: 28,
    borderRadius: 14,
    borderWidth: 3,
    alignItems: 'center',
  },
  emptyIconBox: {
    width: 70,
    height: 70,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'center',
    lineHeight: 18,
  },

  // ========== FAB RETRO ==========
  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  fabGradient: {
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    paddingHorizontal: 14,
  },
  fabRow: {
    flexDirection: 'row',
    gap: 10,
  },
  retroFab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 3,
    gap: 8,
  },
  retroFabPrimary: {
    borderWidth: 0,
  },
  retroFabText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // ========== SKELETON LOADER ==========
  skeletonContainer: {
    paddingTop: 14,
    paddingHorizontal: 14,
  },
  skeletonCard: {
    width: CARD_WIDTH,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 3,
  },
  skeletonTopBar: {
    height: 28,
    width: '100%',
  },
  skeletonContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  skeletonIcon: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  skeletonTextArea: {
    flex: 1,
    marginLeft: 12,
    gap: 8,
  },
  skeletonLine: {
    height: 14,
    borderRadius: 4,
  },
  skeletonLineLong: {
    width: '80%',
  },
  skeletonLineMedium: {
    width: '55%',
  },
  skeletonFooter: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 6,
  },
  skeletonBadge: {
    width: 55,
    height: 22,
    borderRadius: 6,
  },
  loadingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.5,
  },

  // ========== REFRESHING INDICATOR ==========
  refreshingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  refreshingText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.3,
  },
});


export default FlashcardList;