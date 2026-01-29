import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
  StatusBar,
  Platform,
  SafeAreaView,
  Dimensions,
  InteractionManager,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectFlashcardsByCategory, markFlashcardAsLearned } from '../../../../../redux/FlashcardSlice';
import { selectDarkMode } from '../../../../../redux/darkModeSlice';
import useStudyProgress from '../VocabExercises/hooks/useStudyProgress';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Ionicons, FontAwesome, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 48;
const CARD_HEIGHT = height * 0.58; // Aumentado para el panel de stats
const retroFont = Platform.OS === 'ios' ? 'Menlo' : 'monospace';


// ============ FLASHCARD COMPONENT ============
const FlashCard = React.memo(({
  card,
  index,
  scrollX,
  showEnglish,
  variantIndex,
  colorPair,
  darkMode,
  onToggleLanguage,
  onVariantPress,
  onSpeak,
  getSpanish,
  translateY,
  scaleAnim,
  opacityAnim,
  currentIndex,
  masteryInfo, // Progreso real del studyProgress slice
}) => {
  const centerInput = index * width;
  const distance = Animated.subtract(scrollX, centerInput);

  const scale = distance.interpolate({
    inputRange: [-width, 0, width],
    outputRange: [0.9, 1, 0.9],
    extrapolate: 'clamp',
  });
  const opacity = distance.interpolate({
    inputRange: [-width, 0, width],
    outputRange: [0.4, 1, 0.4],
    extrapolate: 'clamp',
  });

  const isActive = index === currentIndex;
  const spanish = useMemo(() => getSpanish(card, variantIndex), [card, variantIndex, getSpanish]);

  const accentColor = colorPair?.background || '#4A90D9';
  const bgColor = darkMode ? '#1a1a2e' : '#F0F7FB';
  const textColor = darkMode ? '#FFFFFF' : '#1a1a2e';
  const textMuted = darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';

  // Función para renderizar estrellas de rareza
  const renderRarityStars = (rarity = 1) => {
    const stars = [];
    const maxStars = 5;
    const filledStars = Math.min(rarity, maxStars);
    for (let i = 0; i < maxStars; i++) {
      stars.push(
        <FontAwesome
          key={i}
          name={i < filledStars ? "star" : "star-o"}
          size={10}
          color={i < filledStars ? "#FFD700" : textMuted}
          style={{ marginHorizontal: 1 }}
        />
      );
    }
    return stars;
  };

  // Obtener color según el tipo
  const getTypeColor = (type) => {
    const typeColors = {
      vocab: '#4A90D9',
      phrase: '#9B59B6',
      idiom: '#E67E22',
      verb: '#27AE60',
      adjective: '#E74C3C',
      noun: '#3498DB',
    };
    return typeColors[type?.toLowerCase()] || accentColor;
  };

  const typeColor = getTypeColor(card.type);
  // Usar masteryInfo del studyProgress slice (real) en lugar de card.userProgress
  const masteryLevel = masteryInfo?.masteryLevel || 0;
  const xpProgress = masteryInfo?.correctStreak || 0; // correctStreak como indicador de progreso
  const maxXp = 5; // 5 correctas para subir de nivel

  // ============ EMOJI ANIMADO ============
  const emojiScale = useRef(new Animated.Value(1)).current;
  const emojiRotate = useRef(new Animated.Value(0)).current;
  const emojiTranslateX = useRef(new Animated.Value(0)).current;
  const lastAnimationType = useRef(-1);

  // 4 animaciones diferentes
  const animations = {
    // 1. Bounce - Rebote hacia arriba y abajo
    bounce: () => {
      Animated.sequence([
        Animated.timing(emojiScale, { toValue: 1.3, duration: 150, useNativeDriver: true }),
        Animated.spring(emojiScale, { toValue: 1, friction: 3, tension: 100, useNativeDriver: true }),
      ]).start();
    },
    // 2. Spin - Giro 360°
    spin: () => {
      emojiRotate.setValue(0);
      Animated.timing(emojiRotate, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }).start();
    },
    // 3. Shake - Vibración lateral
    shake: () => {
      Animated.sequence([
        Animated.timing(emojiTranslateX, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(emojiTranslateX, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(emojiTranslateX, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(emojiTranslateX, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(emojiTranslateX, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    },
    // 4. Pulse - Latido
    pulse: () => {
      Animated.sequence([
        Animated.timing(emojiScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.timing(emojiScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
        Animated.timing(emojiScale, { toValue: 1.15, duration: 100, useNativeDriver: true }),
        Animated.timing(emojiScale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    },
  };

  const animationKeys = Object.keys(animations);

  const triggerRandomAnimation = useCallback(() => {
    // Seleccionar animación aleatoria diferente a la anterior
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * animationKeys.length);
    } while (newIndex === lastAnimationType.current && animationKeys.length > 1);

    lastAnimationType.current = newIndex;
    animations[animationKeys[newIndex]]();
  }, []);

  // Trigger animation cuando cambia el idioma
  useEffect(() => {
    if (isActive) {
      triggerRandomAnimation();
    }
  }, [showEnglish, isActive]);

  const spinInterpolate = emojiRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.scrollCard, { width }]}>
      <Animated.View style={[
        styles.card,
        {
          backgroundColor: bgColor,
          borderColor: accentColor,
          transform: [{ scale }],
          opacity,
        }
      ]}>
        {/* Barra superior de la carta con número */}
        <View style={[styles.cardTopBar, { backgroundColor: accentColor }]}>
          <View style={styles.cardTopBarLeft}>
            <Text style={styles.cardNumber}>#{String(index + 1).padStart(3, '0')}</Text>
          </View>
          <Text style={styles.cardTopBarText}>
            {showEnglish ? '◆ ENG ◆' : '◆ ESP ◆'}
          </Text>
        </View>

        {/* Contenido principal - área táctil */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={onToggleLanguage}
          style={styles.cardTouchArea}
        >
          {/* Indicador de tap */}
          <View style={styles.tapIndicator}>
            <MaterialCommunityIcons
              name="gesture-tap"
              size={14}
              color={darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'}
            />
            <Text style={[styles.tapText, { color: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)' }]}>
              TAP TO FLIP
            </Text>
          </View>

          {/* EMOJI GRANDE ANIMADO */}
          <Animated.Text
            style={[
              styles.bigEmoji,
              {
                transform: [
                  { scale: emojiScale },
                  { rotate: spinInterpolate },
                  { translateX: emojiTranslateX },
                ],
              },
            ]}
          >
            {card.icon || '📚'}
          </Animated.Text>

          {/* Texto principal */}
          <Animated.View
            style={[
              styles.textWrap,
              isActive && {
                transform: [{ translateY }, { scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            <Text style={[styles.mainText, { color: textColor }]}>
              {showEnglish ? card.english : spanish}
            </Text>
          </Animated.View>

          {/* Botón de variantes (solo en español) */}
          {!showEnglish && isActive && card.variant1 && (
            <TouchableOpacity
              style={[styles.variantBtn, {
                borderColor: accentColor,
                backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : `${accentColor}15`,
              }]}
              onPress={onVariantPress}
              activeOpacity={0.7}
            >
              <FontAwesome5 name="sync-alt" size={12} color={accentColor} />
              <Text style={[styles.variantText, { color: accentColor }]}>
                VAR {variantIndex + 1}
              </Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* ============ STATS PANEL POKÉDEX STYLE ============ */}
        <View style={[styles.statsPanel, {
          backgroundColor: darkMode ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.05)',
          borderTopColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        }]}>
          {/* Fila 1: Tipo y Rareza */}
          <View style={styles.statsRow}>
            {/* Badge Tipo */}
            <View style={[styles.statBadge, { backgroundColor: `${typeColor}20` }]}>
              <Text style={[styles.statLabel, { color: textMuted }]}>TYPE</Text>
              <Text style={[styles.statValue, { color: typeColor }]}>
                {(card.type || 'VOCAB').toUpperCase()}
              </Text>
            </View>

            {/* Badge Rareza */}
            <View style={[styles.statBadge, { backgroundColor: 'rgba(255,215,0,0.12)' }]}>
              <Text style={[styles.statLabel, { color: textMuted }]}>RARITY</Text>
              <View style={styles.starsRow}>
                {renderRarityStars(card.rarity || 1)}
              </View>
            </View>
          </View>

          {/* Fila 2: Nivel y XP */}
          <View style={styles.statsRow}>
            {/* Badge Nivel */}
            <View style={[styles.statBadge, { backgroundColor: darkMode ? 'rgba(78,205,196,0.15)' : 'rgba(78,205,196,0.1)' }]}>
              <Text style={[styles.statLabel, { color: textMuted }]}>LEVEL</Text>
              <View style={styles.levelContainer}>
                <Text style={[styles.levelValue, { color: '#4ECDC4' }]}>
                  {masteryLevel > 0 ? `LV.${masteryLevel}` : 'NEW'}
                </Text>
                {masteryLevel > 0 && (
                  <View style={styles.levelBadge}>
                    <FontAwesome5 name="medal" size={10} color="#4ECDC4" />
                  </View>
                )}
              </View>
            </View>

            {/* Barra de XP */}
            <View style={[styles.statBadge, { backgroundColor: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', flex: 1.5 }]}>
              <Text style={[styles.statLabel, { color: textMuted }]}>MASTERY</Text>
              <View style={styles.xpContainer}>
                <View style={[styles.xpBarBg, { backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                  <View style={[styles.xpBarFill, {
                    width: `${Math.min((xpProgress / maxXp) * 100, 100)}%`,
                    backgroundColor: accentColor
                  }]} />
                </View>
                <Text style={[styles.xpText, { color: textMuted }]}>
                  {xpProgress}/{maxXp}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Barra inferior con estado y audio */}
        <View style={[styles.cardBottomBar, {
          backgroundColor: darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
          borderTopColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        }]}>
          {/* Estado aprendido */}
          <View style={[styles.statusBadge, {
            backgroundColor: card.isLearned ? '#4ADE8030' : (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
          }]}>
            <FontAwesome
              name={card.isLearned ? "check-circle" : "circle-o"}
              size={12}
              color={card.isLearned ? '#4ADE80' : (darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)')}
            />
            <Text style={[styles.statusText, {
              color: card.isLearned ? '#4ADE80' : (darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'),
            }]}>
              {card.isLearned ? 'LEARNED' : 'NEW'}
            </Text>
          </View>

          {/* Botón de audio - siempre visible para mantener layout */}
          <TouchableOpacity
            style={[styles.speakBtn, {
              backgroundColor: accentColor,
              opacity: isActive ? 1 : 0.3,
            }]}
            onPress={onSpeak}
            activeOpacity={0.8}
            disabled={!isActive}
          >
            <Ionicons name="volume-high" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
});


// ============ PROGRESS DOT ============
const ProgressDot = React.memo(({ card, index, scrollX, colorPair, darkMode }) => {
  const centerInput = index * width;
  const distance = Animated.subtract(scrollX, centerInput);

  const scale = distance.interpolate({
    inputRange: [-width, 0, width],
    outputRange: [1, 1.5, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.progressDotContainer}>
      <Animated.View
        style={[
          styles.progressDot,
          {
            backgroundColor: card.isLearned ? '#4ADE80' : (darkMode ? '#444' : '#CCC'),
            transform: [{ scale }],
          },
        ]}
      />
    </View>
  );
});


// ============ MAIN SCREEN ============
const MemorizeScreen = ({ route, navigation }) => {
  const { category, colorPair, currentIndex: initialIndex = 0 } = route.params;
  const flashcards = useSelector(state => selectFlashcardsByCategory(state, category));
  const darkMode = useSelector(selectDarkMode);
  const dispatch = useDispatch();

  // Hook para obtener el progreso de estudio de las palabras
  const { getWordMastery } = useStudyProgress(flashcards, category);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showEnglish, setShowEnglish] = useState(true);
  const [variantIndex, setVariantIndex] = useState(0);
  const [isReady, setIsReady] = useState(false); // Estado para diferir renderizado

  const scrollRef = useRef();
  const scrollX = useRef(new Animated.Value(initialIndex * width)).current;
  const opacityCounter = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Colores
  const bgColor = darkMode ? '#0a0a14' : '#D4E8F2';
  const accentColor = colorPair?.background || '#4A90D9';
  const textPrimary = darkMode ? '#FFFFFF' : '#1a1a2e';
  const textMuted = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';


  const animateCounter = useCallback(() => {
    Animated.sequence([
      Animated.timing(opacityCounter, { toValue: 0.5, duration: 60, useNativeDriver: true }),
      Animated.timing(opacityCounter, { toValue: 1, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [opacityCounter]);

  const animateLanguageSwitch = useCallback(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(translateY, { toValue: -20, duration: 150, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]),
      Animated.timing(translateY, { toValue: 20, duration: 0, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]),
    ]).start();
  }, [translateY, opacityAnim]);


  // Diferir la carga hasta después de la transición de navegación
  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      setIsReady(true);
    });
    return () => handle.cancel();
  }, []);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }
    StatusBar.setBarStyle('light-content');
  }, [darkMode]);

  useEffect(() => {
    if (isReady && scrollRef.current && initialIndex > 0) {
      setTimeout(() => {
        scrollRef.current.scrollTo({ x: initialIndex * width, animated: false });
      }, 50);
    }
  }, [isReady, initialIndex]);


  const toggleLanguage = useCallback(() => {
    animateLanguageSwitch();
    setTimeout(() => setShowEnglish(prev => !prev), 150);
  }, [animateLanguageSwitch]);

  const handleVariant = useCallback(() => {
    const card = flashcards[currentIndex];
    const variants = [card.spanish, card.variant1, card.variant2, card.variant3].filter(Boolean);
    if (variants.length > 1) setVariantIndex(i => (i + 1) % variants.length);
  }, [flashcards, currentIndex]);

  const getSpanish = useCallback((card, varIdx) => {
    const variants = [card.spanish, card.variant1, card.variant2, card.variant3].filter(Boolean);
    return variants[varIdx] || card.spanish;
  }, []);

  const handleSpeak = useCallback(() => {
    const card = flashcards[currentIndex];
    const text = showEnglish ? card.english : getSpanish(card, variantIndex);
    Speech.speak(text, { language: showEnglish ? 'en-US' : 'es-ES' });
  }, [flashcards, currentIndex, showEnglish, variantIndex, getSpanish]);

  const markLearned = useCallback(() => {
    const card = flashcards[currentIndex];
    dispatch(markFlashcardAsLearned(card.id, category));
  }, [flashcards, currentIndex, category, dispatch]);

  const lastAnimationTime = useRef(0);

  // Animación nativa para scroll fluido
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true }
  );

  // Actualizar estado solo cuando termina el scroll
  const handleScrollEnd = useCallback((e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < flashcards.length) {
      const now = Date.now();
      if (now - lastAnimationTime.current > 100) {
        animateCounter();
        lastAnimationTime.current = now;
      }
      setCurrentIndex(newIndex);
      setShowEnglish(true);
      setVariantIndex(0);
    }
  }, [currentIndex, flashcards.length, animateCounter]);



  const visibleDots = useMemo(() => {
    // Si hay 25 o menos flashcards, mostrar todos los dots
    if (flashcards.length <= 25) {
      return flashcards.map((card, idx) => ({
        card,
        originalIndex: idx,
      }));
    }

    // Si hay más de 25, mostrar una ventana centrada de 25 dots
    const windowSize = 25;
    const halfWindow = Math.floor(windowSize / 2);

    // Calcular el centro de la ventana, asegurando que no se salga de los límites
    let start = currentIndex - halfWindow;
    let end = currentIndex + halfWindow + 1;

    // Ajustar si nos pasamos del inicio
    if (start < 0) {
      end = Math.min(flashcards.length, end - start);
      start = 0;
    }

    // Ajustar si nos pasamos del final
    if (end > flashcards.length) {
      start = Math.max(0, start - (end - flashcards.length));
      end = flashcards.length;
    }

    return flashcards.slice(start, end).map((card, idx) => ({
      card,
      originalIndex: start + idx,
    }));
  }, [flashcards, currentIndex]);

  const currentCard = flashcards[currentIndex];


  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ============ HEADER RETRO ============ */}
      <SafeAreaView>
        <View style={[styles.header, { backgroundColor: accentColor }]}>
          {/* Botón volver */}
          <TouchableOpacity
            style={styles.headerBackBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>

          {/* Centro - Info */}
          <View style={styles.headerCenter}>
            <Text style={styles.headerLabel}>◆ STUDY MODE ◆</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {category?.toUpperCase() || 'CATEGORY'}
            </Text>
          </View>

          {/* Botón marcar aprendido */}
          <TouchableOpacity
            style={[
              styles.learnedBtn,
              { backgroundColor: currentCard?.isLearned ? '#4ADE80' : 'rgba(0,0,0,0.25)' }
            ]}
            onPress={markLearned}
            activeOpacity={0.7}
          >
            <FontAwesome
              name={currentCard?.isLearned ? 'check' : 'circle-o'}
              size={16}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Contador de tarjetas */}
      <Animated.View style={[styles.counterContainer, { opacity: opacityCounter }]}>
        <View style={[styles.counterBox, {
          backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        }]}>
          <MaterialCommunityIcons name="cards" size={14} color={accentColor} />
          <Text style={[styles.counterCurrent, { color: textPrimary }]}>
            {currentIndex + 1}
          </Text>
          <Text style={[styles.counterSlash, { color: textMuted }]}>/</Text>
          <Text style={[styles.counterTotal, { color: textMuted }]}>
            {flashcards.length}
          </Text>
        </View>
      </Animated.View>

      {/* ============ CARRUSEL DE CARTAS ============ */}
      {!isReady ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      ) : (
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          decelerationRate="fast"
          snapToInterval={width}
          snapToAlignment="center"
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
          removeClippedSubviews={false}
        >
          {flashcards.map((card, idx) => (
            <FlashCard
              key={card.id}
              card={card}
              index={idx}
              scrollX={scrollX}
              showEnglish={showEnglish}
              variantIndex={variantIndex}
              colorPair={colorPair}
              darkMode={darkMode}
              onToggleLanguage={toggleLanguage}
              onVariantPress={handleVariant}
              onSpeak={handleSpeak}
              getSpanish={getSpanish}
              translateY={translateY}
              scaleAnim={scaleAnim}
              opacityAnim={opacityAnim}
              currentIndex={currentIndex}
              masteryInfo={getWordMastery(card.id)}
            />
          ))}
        </Animated.ScrollView>
      )}

      {/* ============ INDICADOR DE PROGRESO ============ */}
      <View style={[styles.progressContainer, { backgroundColor: darkMode ? '#12121f' : '#C5DDE9' }]}>
        <View style={styles.progressInner}>
          <View style={styles.progressTrack}>
            {visibleDots.map(({ card, originalIndex }) => (
              <ProgressDot
                key={originalIndex}
                card={card}
                index={originalIndex}
                scrollX={scrollX}
                colorPair={colorPair}
                darkMode={darkMode}
              />
            ))}
          </View>

          {/* Hint de navegación */}
          <View style={styles.navHint}>
            <Ionicons name="chevron-back" size={14} color={textMuted} />
            <Text style={[styles.navHintText, { color: textMuted }]}>SWIPE</Text>
            <Ionicons name="chevron-forward" size={14} color={textMuted} />
          </View>
        </View>
      </View>

    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ========== HEADER ==========
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0,0,0,0.2)',
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
    fontFamily: retroFont,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: retroFont,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  learnedBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  // ========== COUNTER ==========
  counterContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  counterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  counterCurrent: {
    fontSize: 16,
    fontFamily: retroFont,
    fontWeight: 'bold',
  },
  counterSlash: {
    fontSize: 14,
    fontFamily: retroFont,
  },
  counterTotal: {
    fontSize: 14,
    fontFamily: retroFont,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ========== CARDS ==========
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  scrollCard: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    borderWidth: 4,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  cardTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cardTopBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardNumber: {
    fontSize: 10,
    fontFamily: retroFont,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  cardEmoji: {
    fontSize: 16,
  },
  cardTopBarText: {
    fontSize: 10,
    fontFamily: retroFont,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 1,
  },
  cardTouchArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tapIndicator: {
    position: 'absolute',
    top: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tapText: {
    fontSize: 9,
    fontFamily: retroFont,
    fontWeight: '600',
    letterSpacing: 1,
  },
  bigEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  textWrap: {
    width: '100%',
    alignItems: 'center',
  },
  mainText: {
    textAlign: 'center',
    fontSize: 26,
    fontFamily: retroFont,
    fontWeight: 'bold',
    lineHeight: 36,
    letterSpacing: 0.5,
  },
  variantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    gap: 6,
  },
  variantText: {
    fontSize: 10,
    fontFamily: retroFont,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // ========== STATS PANEL POKÉDEX ==========
  statsPanel: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 2,
    gap: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 8,
    fontFamily: retroFont,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 11,
    fontFamily: retroFont,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  levelValue: {
    fontSize: 12,
    fontFamily: retroFont,
    fontWeight: 'bold',
  },
  levelBadge: {
    marginLeft: 2,
  },
  xpContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 3,
  },
  xpBarBg: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  xpText: {
    fontSize: 8,
    fontFamily: retroFont,
    fontWeight: 'bold',
  },
  cardBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  statusText: {
    fontSize: 10,
    fontFamily: retroFont,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  speakBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ========== PROGRESS ==========
  progressContainer: {
    paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  progressInner: {
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressDotContainer: {
    width: 10,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  navHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navHintText: {
    fontSize: 10,
    fontFamily: retroFont,
    fontWeight: '600',
    letterSpacing: 2,
  },
});


export default MemorizeScreen;
