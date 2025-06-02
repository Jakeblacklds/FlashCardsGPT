import React, { useState, useEffect, useRef } from 'react';
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
 } from 'react-native';
 import { useSelector, useDispatch } from 'react-redux';
 import { selectFlashcardsByCategory, markFlashcardAsLearned } from '../../../../../redux/FlashcardSlice';
 import { selectDarkMode } from '../../../../../redux/darkModeSlice';
 import * as Speech from 'expo-speech';
 import { Audio } from 'expo-av';
 import { Ionicons, FontAwesome } from '@expo/vector-icons';
 import { LinearGradient } from 'expo-linear-gradient';

 const { width, height } = Dimensions.get('window');
 const CARD_WIDTH = width * 0.9;
 const CARD_HEIGHT = height * 0.6;

 const MemorizeScreen = ({ route, navigation }) => {
  const { category, colorPair, currentIndex: initialIndex = 0 } = route.params;
  const flashcards = useSelector(state => selectFlashcardsByCategory(state, category));
  const darkMode = useSelector(selectDarkMode);
  const dispatch = useDispatch();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showEnglish, setShowEnglish] = useState(true);
  const [variantIndex, setVariantIndex] = useState(0);

  const scrollRef = useRef();
  const scrollX = useRef(new Animated.Value(initialIndex * width)).current;

  // nuevos valores animados para contador
  const opacityCounter = useRef(new Animated.Value(1)).current;
  const translateCounterX = useRef(new Animated.Value(0)).current;

  // animación horizontal + fade
  const animateCounter = () => {
  Animated.sequence([
  Animated.parallel([
  Animated.timing(translateCounterX, { toValue: -20, duration:150, useNativeDriver: true }),
  Animated.timing(opacityCounter, { toValue: 0, duration: 150, useNativeDriver: true }),
  ]),
  Animated.parallel([
  Animated.timing(translateCounterX, { toValue: 0, duration: 150, useNativeDriver: true }),
  Animated.timing(opacityCounter, { toValue: 1, duration: 150, useNativeDriver: true }),
  ]),
  ]).start();
  };

  // resto de animaciones (toggle, variant)
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const animateToggle = () => {
  Animated.sequence([
  Animated.timing(opacityAnim, { toValue: 0.9, duration: 50, useNativeDriver: true }),
  Animated.timing(scaleAnim, { toValue: 0.98, duration: 50, useNativeDriver: true }),
  Animated.timing(scaleAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
  Animated.timing(opacityAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
  ]).start();
  };

  useEffect(() => {
  Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  }, []);

  useEffect(() => {
  if (Platform.OS === 'android') {
  StatusBar.setBackgroundColor(colorPair.background);
  }
  StatusBar.setBarStyle(darkMode ? 'light-content' : 'dark-content');
  }, [darkMode]);

  useEffect(() => {
  if (scrollRef.current && initialIndex > 0) {
  setTimeout(() => {
  scrollRef.current.scrollTo({ x: initialIndex * width, animated: false });
  }, 100);
  }
  }, []);

  useEffect(() => {
  Animated.sequence([
  Animated.timing(translateY, { toValue: -20, duration: 80, useNativeDriver: true }),
  Animated.timing(opacityAnim, { toValue: 0.5, duration: 80, useNativeDriver: true }),
  Animated.timing(translateY, { toValue: 0, duration: 80, useNativeDriver: true }),
  Animated.timing(opacityAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
  ]).start();
  }, [variantIndex]);

  const toggleLanguage = () => {
  animateToggle();
  setShowEnglish(prev => !prev);
  };

  const handleVariant = () => {
  const card = flashcards[currentIndex];
  const variants = [card.spanish, card.variant1, card.variant2, card.variant3].filter(Boolean);
  if (variants.length > 1) setVariantIndex(i => (i + 1) % variants.length);
  };

  const getSpanish = () => {
  const card = flashcards[currentIndex];
  const variants = [card.spanish, card.variant1, card.variant2, card.variant3].filter(Boolean);
  return variants[variantIndex] || card.spanish;
  };

  const speak = (text, lang) => {
  Speech.speak(text, { language: lang });
  };

  const handleSpeak = () => {
  const card = flashcards[currentIndex];
  const text = showEnglish ? card.english : getSpanish();
  speak(text, showEnglish ? 'en-US' : 'es-ES');
  };

  const markLearned = () => {
  const card = flashcards[currentIndex];
  dispatch(markFlashcardAsLearned(card.id, category));
  };

  // nuevo listener en onScroll para actualizar índice y animar contador sin delay
  const handleScroll = Animated.event(
  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
  {
  useNativeDriver: false,
  listener: e => {
  const offsetX = e.nativeEvent.contentOffset.x;
  const newIndex = Math.round(offsetX / width);
  if (newIndex !== currentIndex) {
  animateCounter();
  setCurrentIndex(newIndex);
  setShowEnglish(true);
  setVariantIndex(0);
  }
  },
  }
  );

  const cardStyle = idx => {
  const active = idx === currentIndex;
  return darkMode
  ? { backgroundColor: 'rgba(30,30,30,0.95)', borderWidth: 2, borderColor: showEnglish ? colorPair.background : colorPair.text, zIndex: active ? 10 : 1 }
  : { backgroundColor: showEnglish ? colorPair.background : colorPair.text, shadowColor: showEnglish ? colorPair.text : colorPair.background, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10, zIndex: active ? 10 : 1 };
  };

  const textColor = darkMode
  ? { color: showEnglish ? colorPair.background : colorPair.text }
  : { color: showEnglish ? colorPair.text : colorPair.background };

  const renderProgress = () => (
  <View style={styles.progressContainer}>
  {flashcards.map((_, i) => {
  const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
  const widthAnim = scrollX.interpolate({ inputRange, outputRange: [8, 20, 8], extrapolate: 'clamp' });
  const backgroundColor = scrollX.interpolate({
  inputRange,
  outputRange: ['rgba(150,150,150,0.4)', darkMode ? colorPair.text : colorPair.background, 'rgba(150,150,150,0.4)'],
  extrapolate: 'clamp',
  });
  return <Animated.View key={i} style={[styles.progressDot, { width: widthAnim, backgroundColor }]} />;
  })}
  </View>
  );

  return (
  <SafeAreaView style={[styles.safeArea, { backgroundColor: darkMode ? '#121212' : '#f8f8f8' }]}>
  <LinearGradient colors={darkMode ? ['#121212', '#1a1a1a', '#121212'] : ['#f8f8f8', '#ffffff', '#f8f8f8']} style={styles.container}>
  <View style={styles.header}>
  <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
  <Ionicons name="arrow-back" size={24} color={darkMode ? colorPair.text : colorPair.background} />
  </TouchableOpacity>
  <Text style={[styles.headerTitle, { color: darkMode ? colorPair.text : colorPair.background }]}>{category}</Text>
  <TouchableOpacity style={styles.iconBtn} onPress={markLearned}>
  <FontAwesome name={flashcards[currentIndex]?.isLearned ? 'check-circle' : 'circle-o'} size={22} color={darkMode ? colorPair.text : colorPair.background} />
  </TouchableOpacity>
  </View>

  <Animated.View
  style={[
  styles.counter,
  {
  transform: [{ translateX: translateCounterX }],
  opacity: opacityCounter,
  },
  ]}
  >
  <Text style={[styles.counterText, { color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }]}>
  {currentIndex + 1} / {flashcards.length}
  </Text>
  </Animated.View>

  <Animated.ScrollView
  ref={scrollRef}
  horizontal
  pagingEnabled
  decelerationRate="fast"
  snapToInterval={width}
  snapToAlignment="center"
  showsHorizontalScrollIndicator={false}
  onScroll={handleScroll}
  scrollEventThrottle={16}
  contentContainerStyle={styles.scrollContent}
  >
  {flashcards.map((card, idx) => (
  <View key={card.id} style={[styles.scrollCard, { width, height: CARD_HEIGHT }]}>
  <Animated.View style={[styles.card, cardStyle(idx)]}>
  <TouchableOpacity activeOpacity={0.1} onPress={toggleLanguage} style={styles.cardContent}>
  <Animated.View
  style={[
  styles.textWrap,
  idx === currentIndex && { transform: [{ translateY }, { scale: scaleAnim }], opacity: opacityAnim },
  ]}
  >
  <Text style={[styles.langLabel, textColor]}>{showEnglish ? 'ENGLISH' : 'ESPAÑOL'}</Text>
  <Text style={[styles.mainText, textColor]}>{showEnglish ? card.english : getSpanish()}</Text>
  {!showEnglish && idx === currentIndex && card.variant1 && (
  <TouchableOpacity
  style={[styles.variantBtn, { backgroundColor: darkMode ? 'rgba(165, 165, 165, 0.1)' : 'rgba(0,0,0,0.1)' }]}
  onPress={handleVariant}
  >
  <Text style={[styles.variantText, textColor]}>Variante {variantIndex + 1}</Text>
  </TouchableOpacity>
  )}
  <TouchableOpacity
  style={[styles.speakBtn, { backgroundColor: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]}
  onPress={handleSpeak}
  >
  <Ionicons name="volume-high" size={22} color={textColor.color} />
  </TouchableOpacity>
  </Animated.View>
  </TouchableOpacity>
  </Animated.View>
  </View>
  ))}
  </Animated.ScrollView>

  {renderProgress()}
  </LinearGradient>
  </SafeAreaView>
  );
 };

 const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  iconBtn: { padding: 8, borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontFamily: 'Pagebash', letterSpacing: 0.5 },
  counter: { marginVertical: 10 },
  counterText: { fontSize: 16, fontFamily: 'WorsSansSemiBold' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  scrollCard: { justifyContent: 'center', alignItems: 'center' },
  card: { width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 22, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  cardContent: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', padding: 25 },
  textWrap: { width: '100%', alignItems: 'center' },
  langLabel: { fontSize: 14, fontFamily: 'WorsSansSemiBold', letterSpacing: 1.5, marginBottom: 30, opacity: 0.8 },
  mainText: { textAlign: 'center', fontSize: 38, fontFamily: 'Pagebash', paddingHorizontal: 15, lineHeight: 46 },
  variantBtn: { marginTop: 30, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 15 },
  variantText: { fontSize: 14, fontFamily: 'WorsSansSemiBold' },
  speakBtn: { position: 'absolute', top:  230, right: -5, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  progressContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 20, marginTop: 20 },
  progressDot: { height: 8, borderRadius: 4, marginHorizontal: 3 },
 });

 export default MemorizeScreen;