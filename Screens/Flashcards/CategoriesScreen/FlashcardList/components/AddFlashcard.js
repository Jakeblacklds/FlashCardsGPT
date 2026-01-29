import React, { useEffect, useRef, useState } from 'react';
import {
  View, TextInput, TouchableOpacity, Text, StyleSheet, Animated, Easing,
  Platform, KeyboardAvoidingView, ActivityIndicator, ScrollView, StatusBar, Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Slider from '@react-native-community/slider';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { addFlashcard, syncCacheForCategory, selectFlashcardsByCategory } from '../../../../../redux/FlashcardSlice';
import { selectDarkMode } from '../../../../../redux/darkModeSlice';
import { generateFlashcards } from '../../../../../geminiApi';
import { getAuth } from 'firebase/auth';

const { width } = Dimensions.get('window');
const retroFont = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const LOADING_MESSAGES = [
  '🔍 Analizando categoría...',
  '🧠 Pensando vocabulario...',
  '✨ Generando palabras...',
  '📝 Creando variantes...',
  '🎯 Finalizando...',
];

const AddFlashcard = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [msgType, setMsgType] = useState('error'); // 'error' or 'info'
  const [successMsg, setSuccessMsg] = useState(null);

  // Manual mode
  const [english, setEnglish] = useState('');
  const [spanish, setSpanish] = useState('');
  const [englishFocused, setEnglishFocused] = useState(false);
  const [spanishFocused, setSpanishFocused] = useState(false);

  // AI mode - PERSISTENT between tabs
  const [numFlashcards, setNumFlashcards] = useState(3);
  const [generatedCards, setGeneratedCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState(new Set());
  const [generationStep, setGenerationStep] = useState('idle');

  // Loading animation states
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

  const dispatch = useDispatch();
  const { category, colorPair } = route.params;
  const currentUserUID = useSelector((state) => state.flashcards.currentUserUID);
  const darkModeEnabled = useSelector(selectDarkMode);

  // Obtener flashcards existentes para validar duplicados
  const existingFlashcards = useSelector((state) => selectFlashcardsByCategory(state, category));

  // Función para verificar si una palabra en inglés ya existe
  const isDuplicate = (englishWord) => {
    const normalizedWord = englishWord.trim().toLowerCase();
    return existingFlashcards.some(fc => fc.english?.trim().toLowerCase() === normalizedWord);
  };

  // Animations
  const intro = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const tabIndicator = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const loadingBarAnim = useRef(new Animated.Value(0)).current;
  const loadingGlowAnim = useRef(new Animated.Value(0)).current;
  const cardsRevealAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([]).current;

  // Colors
  const bgColor = darkModeEnabled ? '#0a0a14' : '#D4E8F2';
  const cardBgColor = darkModeEnabled ? '#1a1a2e' : '#F0F7FB';
  const accentColor = colorPair?.background || '#4A90D9';
  const aiColor = '#9B59B6';
  const textPrimary = darkModeEnabled ? '#FFFFFF' : '#1a1a2e';
  const textSecondary = darkModeEnabled ? 'rgba(255,255,255,0.7)' : 'rgba(26,26,46,0.6)';
  const textMuted = darkModeEnabled ? 'rgba(255,255,255,0.4)' : 'rgba(26,26,46,0.4)';

  const isManualValid = english.trim().length > 0 && spanish.trim().length > 0;

  useEffect(() => {
    Animated.timing(intro, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    Animated.spring(tabIndicator, { toValue: activeTab === 'manual' ? 0 : 1, useNativeDriver: true, speed: 15, bounciness: 4 }).start();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'ai' && generationStep === 'idle') {
      const pulse = Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]));
      pulse.start();
      return () => pulse.stop();
    } else { pulseAnim.setValue(1); }
  }, [activeTab, generationStep]);

  // Loading glow animation
  useEffect(() => {
    if (generationStep === 'generating') {
      const glow = Animated.loop(Animated.sequence([
        Animated.timing(loadingGlowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(loadingGlowAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]));
      glow.start();
      return () => glow.stop();
    }
  }, [generationStep]);

  const onPressIn = () => { Animated.spring(btnScale, { toValue: 0.95, useNativeDriver: true, speed: 20 }).start(); };
  const onPressOut = () => { Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, speed: 20 }).start(); };

  const runSuccess = (message) => {
    setSuccessMsg(message);
    successAnim.setValue(0);
    Animated.sequence([
      Animated.timing(successAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
      Animated.timing(successAnim, { toValue: 0, delay: 1500, duration: 300, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(() => setSuccessMsg(null));
  };

  // Animate cards reveal
  const animateCardsReveal = (numCards) => {
    cardAnims.length = 0;
    for (let i = 0; i < numCards; i++) {
      cardAnims.push(new Animated.Value(0));
    }

    cardsRevealAnim.setValue(0);
    Animated.timing(cardsRevealAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    const staggeredAnims = cardAnims.map((anim, i) =>
      Animated.timing(anim, { toValue: 1, duration: 300, delay: i * 80, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true })
    );
    Animated.stagger(80, staggeredAnims).start();
  };

  // Fake loading progress
  const runLoadingAnimation = () => {
    setLoadingProgress(0);
    loadingBarAnim.setValue(0);

    let progress = 0;
    let messageIndex = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress > 95) progress = 95;
      setLoadingProgress(Math.floor(progress));

      const newMsgIndex = Math.min(Math.floor(progress / 20), LOADING_MESSAGES.length - 1);
      if (newMsgIndex !== messageIndex) {
        messageIndex = newMsgIndex;
        setLoadingMessage(LOADING_MESSAGES[messageIndex]);
      }

      Animated.timing(loadingBarAnim, { toValue: progress / 100, duration: 200, useNativeDriver: false }).start();

      if (progress >= 95) clearInterval(interval);
    }, 400);

    return () => clearInterval(interval);
  };

  const completeLoadingAnimation = () => {
    setLoadingProgress(100);
    setLoadingMessage('✅ ¡Completado!');
    Animated.timing(loadingBarAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start();
  };

  // ========== MANUAL MODE ==========
  const handleAddManualFlashcard = async () => {
    setErrorMsg(null);
    if (!isManualValid) { setErrorMsg('Completa ambos campos.'); return; }
    if (!currentUserUID) { setErrorMsg('UID de usuario no disponible.'); return; }

    // Validar duplicados
    if (isDuplicate(english)) {
      setMsgType('error');
      setErrorMsg(`"${english.trim()}" ya existe en esta categoría.`);
      return;
    }

    setLoading(true);
    const newFlashcardId = 'flashcard' + Math.floor(Math.random() * 10342341);
    const newFlashcard = {
      id: newFlashcardId, english: english.trim(), spanish: spanish.trim(), category,
      type: 'vocab', rarity: 1, icon: '📚', variants: [], variant1: null, variant2: null, variant3: null,
      userProgress: { currentLevel: 0, xp: 0, timesCorrect: 0, timesIncorrect: 0, lastPracticed: null },
    };

    try {
      // Obtener token de autenticación
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setMsgType('error');
        setErrorMsg('Usuario no autenticado.');
        setLoading(false);
        return;
      }
      const token = await user.getIdToken(true);
      const categoryKey = encodeURIComponent(category);

      await axios.put(
        `https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories/${categoryKey}/flashcards/${newFlashcardId}.json?auth=${token}`,
        newFlashcard
      );
      dispatch(addFlashcard(newFlashcard));
      dispatch(syncCacheForCategory(category));
      setEnglish(''); setSpanish('');
      runSuccess('¡Flashcard agregada!');
      setTimeout(() => navigation.navigate('FlashcardList', { category, colorPair }), 800);
    } catch (error) {
      console.error('Error:', error);
      setMsgType('error');
      setErrorMsg('Error al guardar. Intenta de nuevo.');
    } finally { setLoading(false); }
  };

  // ========== AI MODE ==========
  const generateWithAI = async () => {
    setErrorMsg(null);
    setGenerationStep('generating');
    const cleanupLoading = runLoadingAnimation();

    // Obtener las palabras en inglés que ya existen para evitar duplicados
    const existingWords = existingFlashcards.map(fc => fc.english?.trim()).filter(Boolean);
    const existingWordsStr = existingWords.length > 0
      ? `\nALREADY EXISTS (DO NOT generate these words): ${existingWords.join(', ')}`
      : '';

    const prompt = `You generate bilingual flashcards for American learners of Spanish.
Create exactly ${numFlashcards} NEW flashcards related to "${category}".${existingWordsStr}
OUTPUT: one flashcard per line (no extra lines, no numbering).
EXACT format: "English: [word], Spanish: [translation], Type: [vocab|phrase|idiom|verb|adjective|noun], Rarity: [1-5], Emoji: [emoji], Alternatives: [JSON]"
ALTERNATIVES: If Rarity <= 2 → []. Otherwise max 3 alternatives as [{"text":"...","rarity":"common|uncommon|rare"}]
IMPORTANT: Generate ONLY new words that are NOT in the "ALREADY EXISTS" list above.
Use natural Spanish. No repeats. Return ONLY flashcards.`.trim();


    try {
      const response = await generateFlashcards(prompt);
      if (!response || typeof response !== 'string') throw new Error('La IA no devolvió datos válidos.');

      const flashcardLines = response.split('\n').map(str => str.trim()).filter(Boolean);
      const parsedCards = flashcardLines.map((text, i) => parseFlashcardLine(text, i)).filter(c => c !== null);

      if (parsedCards.length === 0) throw new Error('No se pudieron parsear las flashcards.');

      // Filtrar duplicados - solo mostrar flashcards que NO existen
      const uniqueCards = parsedCards.filter(card => !isDuplicate(card.english));
      const duplicatesCount = parsedCards.length - uniqueCards.length;

      completeLoadingAnimation();

      setTimeout(() => {
        if (uniqueCards.length === 0) {
          setMsgType('error');
          setErrorMsg(`Todas las ${parsedCards.length} flashcards generadas ya existen en esta categoría. ¡Intenta generar más!`);
          setGenerationStep('idle');
          return;
        }

        setGeneratedCards(uniqueCards);
        setSelectedCards(new Set(uniqueCards.map((_, i) => i)));
        setGenerationStep('preview');
        animateCardsReveal(uniqueCards.length);

        // Mostrar mensaje si hubo duplicados filtrados
        if (duplicatesCount > 0) {
          setMsgType('info');
          setErrorMsg(`${duplicatesCount} flashcard${duplicatesCount > 1 ? 's' : ''} duplicada${duplicatesCount > 1 ? 's' : ''} ${duplicatesCount > 1 ? 'fueron filtradas' : 'fue filtrada'}.`);
        }
      }, 500);

    } catch (error) {
      console.error('Error:', error);
      setMsgType('error');
      setErrorMsg('Error al generar. Intenta de nuevo.');
      setGenerationStep('idle');
    }
  };


  const parseFlashcardLine = (text, index) => {
    try {
      const parts = text.split(', ');
      const getValue = (part, en, es) => {
        if (!part) return null;
        const lower = part.toLowerCase();
        if (lower.includes(en.toLowerCase() + ':') || lower.includes(es.toLowerCase() + ':')) {
          return part.substring(part.indexOf(':') + 1).trim();
        }
        return null;
      };

      const english = getValue(parts[0], 'English', 'Inglés') || parts[0]?.split(': ')[1] || null;
      const spanish = getValue(parts[1], 'Spanish', 'Español') || parts[1]?.split(': ')[1] || null;
      if (!english || !spanish) return null;

      const type = (getValue(parts[2], 'Type', 'Tipo') || parts[2]?.split(': ')[1] || 'vocab').toLowerCase();
      const rarity = Math.min(5, Math.max(1, parseInt(getValue(parts[3], 'Rarity', 'Rareza') || parts[3]?.split(': ')[1]) || 1));
      const icon = getValue(parts[4], 'Emoji', 'Emoji') || parts[4]?.split(': ')[1] || '📚';

      let variants = [];
      const altRaw = getValue(parts[5], 'Alternatives', 'Variantes') || parts[5]?.split('Alternatives: ')[1];
      if (altRaw) {
        try {
          const parsed = JSON.parse(altRaw);
          if (Array.isArray(parsed)) {
            const levels = { common: 2, uncommon: 5, rare: 8 };
            variants = parsed.map((v, i) => ({ text: v.text || '', rarity: v.rarity || 'common', level: i + 1, unlockAtWordLevel: levels[v.rarity] || 2 }));
          }
        } catch (e) { }
      }

      const validTypes = ['vocab', 'phrase', 'idiom', 'verb', 'adjective', 'noun'];
      return {
        english, spanish, type: validTypes.includes(type) ? type : 'vocab', rarity, icon, variants,
        variant1: variants[0]?.text || null, variant2: variants[1]?.text || null, variant3: variants[2]?.text || null,
      };
    } catch (e) { return null; }
  };

  const toggleCardSelection = (i) => {
    const newSel = new Set(selectedCards);
    newSel.has(i) ? newSel.delete(i) : newSel.add(i);
    setSelectedCards(newSel);
  };

  const saveSelectedCards = async () => {
    if (selectedCards.size === 0 || !currentUserUID) return;
    setGenerationStep('saving');

    try {
      // Obtener token de autenticación
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setMsgType('error');
        setErrorMsg('Usuario no autenticado.');
        setGenerationStep('preview');
        return;
      }
      const token = await user.getIdToken(true);
      const categoryKey = encodeURIComponent(category);

      const cards = generatedCards.filter((_, i) => selectedCards.has(i));
      for (const card of cards) {
        const id = 'flashcard' + Math.floor(Math.random() * 10342341);
        const flashcard = {
          id, english: card.english, spanish: card.spanish, category, type: card.type || 'vocab',
          rarity: card.rarity || 1, icon: card.icon || '📚', variants: card.variants || [],
          variant1: card.variant1, variant2: card.variant2, variant3: card.variant3,
          userProgress: { currentLevel: 0, xp: 0, timesCorrect: 0, timesIncorrect: 0, lastPracticed: null },
        };
        await axios.put(
          `https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories/${categoryKey}/flashcards/${id}.json?auth=${token}`,
          flashcard
        );
        dispatch(addFlashcard(flashcard));
      }
      dispatch(syncCacheForCategory(category));
      runSuccess(`¡${cards.length} flashcard${cards.length > 1 ? 's' : ''} guardada${cards.length > 1 ? 's' : ''}!`);
      setTimeout(() => navigation.navigate('FlashcardList', { category, colorPair }), 1000);
    } catch (error) {
      console.error('Error:', error);
      setMsgType('error');
      setErrorMsg('Error al guardar.');
      setGenerationStep('preview');
    }
  };

  const resetAIMode = () => {
    setGeneratedCards([]);
    setSelectedCards(new Set());
    setGenerationStep('idle');
    setLoadingProgress(0);
    setErrorMsg(null);
  };

  const getRarityStars = (r) => '★'.repeat(r) + '☆'.repeat(5 - r);
  const tabTranslateX = tabIndicator.interpolate({ inputRange: [0, 1], outputRange: [0, (width - 48) / 2] });
  const containerOpacity = intro;
  const containerTranslateY = intro.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  const renderGeneratedCard = (item, index) => {
    const isSelected = selectedCards.has(index);
    const anim = cardAnims[index] || new Animated.Value(1);

    return (
      <Animated.View
        key={index}
        style={{
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
          { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
        }}
      >
        <TouchableOpacity
          style={[styles.generatedCard, { backgroundColor: cardBgColor, borderColor: isSelected ? '#4ADE80' : (darkModeEnabled ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)') }]}
          onPress={() => toggleCardSelection(index)}
          activeOpacity={0.8}
        >
          <View style={[styles.cardCheckbox, { backgroundColor: isSelected ? '#4ADE80' : 'transparent', borderColor: isSelected ? '#4ADE80' : textMuted }]}>
            {isSelected && <Ionicons name="checkmark" size={14} color="#FFF" />}
          </View>
          <View style={[styles.cardEmoji, { backgroundColor: `${accentColor}20` }]}>
            <Text style={styles.emojiText}>{item.icon || '📚'}</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.cardRow}>
              <Text style={styles.cardFlag}>🇺🇸</Text>
              <Text style={[styles.cardEnglish, { color: textPrimary }]} numberOfLines={1}>{item.english}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardFlag}>🇪🇸</Text>
              <Text style={[styles.cardSpanish, { color: textSecondary }]} numberOfLines={1}>{item.spanish}</Text>
            </View>
            {item.variants?.length > 0 && (
              <View style={styles.variantsRow}>
                <FontAwesome5 name="random" size={8} color={textMuted} />
                <Text style={[styles.variantsText, { color: textMuted }]}>+{item.variants.length} variante{item.variants.length > 1 ? 's' : ''}</Text>
              </View>
            )}
          </View>
          <View style={styles.cardBadges}>
            <View style={[styles.typeBadge, { backgroundColor: `${accentColor}25` }]}>
              <Text style={[styles.typeBadgeText, { color: accentColor }]}>{(item.type || 'vocab').toUpperCase()}</Text>
            </View>
            <Text style={styles.rarityStars}>{getRarityStars(item.rarity || 1)}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={darkModeEnabled ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={[styles.header, { backgroundColor: accentColor }]}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerLabel}>◆ ADD NEW ◆</Text>
              <Text style={styles.headerTitle}>FLASHCARD</Text>
            </View>
            <View style={styles.headerRight}>
              <MaterialCommunityIcons name="cards-playing-outline" size={24} color="#FFF" />
            </View>
          </View>

          <View style={[styles.categoryBadge, { backgroundColor: `${accentColor}20` }]}>
            <FontAwesome5 name="folder-open" size={12} color={accentColor} />
            <Text style={[styles.categoryText, { color: accentColor }]}>{category?.toUpperCase() || 'CATEGORY'}</Text>
          </View>

          <Animated.View style={[styles.content, { transform: [{ translateY: containerTranslateY }], opacity: containerOpacity }]}>
            {/* Tabs - NO reset AI state on tab change */}
            <View style={[styles.tabContainer, { backgroundColor: cardBgColor }]}>
              <Animated.View style={[styles.tabIndicator, { backgroundColor: activeTab === 'manual' ? accentColor : aiColor, transform: [{ translateX: tabTranslateX }] }]} />
              <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('manual')} activeOpacity={0.7}>
                <FontAwesome5 name="edit" size={14} color={activeTab === 'manual' ? '#FFF' : textMuted} />
                <Text style={[styles.tabText, { color: activeTab === 'manual' ? '#FFF' : textMuted }]}>MANUAL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('ai')} activeOpacity={0.7}>
                <MaterialCommunityIcons name="robot" size={16} color={activeTab === 'ai' ? '#FFF' : textMuted} />
                <Text style={[styles.tabText, { color: activeTab === 'ai' ? '#FFF' : textMuted }]}>GEMINI AI</Text>
              </TouchableOpacity>
            </View>

            {/* Main Panel */}
            <View style={[styles.mainPanel, { backgroundColor: cardBgColor }]}>
              <View style={[styles.panelHeader, { backgroundColor: activeTab === 'manual' ? accentColor : aiColor }]}>
                {activeTab === 'manual' ? (
                  <><FontAwesome5 name="edit" size={12} color="#FFF" /><Text style={styles.panelHeaderText}>ENTRADA MANUAL</Text></>
                ) : (
                  <><MaterialCommunityIcons name="robot" size={14} color="#FFF" /><Text style={styles.panelHeaderText}>GENERAR DE "{category?.toUpperCase()}"</Text></>
                )}
              </View>

              {activeTab === 'manual' ? (
                <View style={styles.inputSection}>
                  <View style={styles.inputWrapper}>
                    <Text style={[styles.inputLabel, { color: textMuted }]}>ENGLISH</Text>
                    <View style={[styles.inputContainer, { borderColor: englishFocused ? accentColor : (darkModeEnabled ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'), backgroundColor: darkModeEnabled ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)' }]}>
                      <Text style={styles.inputIcon}>🇺🇸</Text>
                      <TextInput style={[styles.input, { color: textPrimary }]} value={english} onChangeText={setEnglish} onFocus={() => setEnglishFocused(true)} onBlur={() => setEnglishFocused(false)} placeholder="e.g., apple" placeholderTextColor={textMuted} autoCapitalize="none" autoCorrect={false} />
                    </View>
                  </View>
                  <View style={styles.inputWrapper}>
                    <Text style={[styles.inputLabel, { color: textMuted }]}>ESPAÑOL</Text>
                    <View style={[styles.inputContainer, { borderColor: spanishFocused ? accentColor : (darkModeEnabled ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'), backgroundColor: darkModeEnabled ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)' }]}>
                      <Text style={styles.inputIcon}>🇪🇸</Text>
                      <TextInput style={[styles.input, { color: textPrimary }]} value={spanish} onChangeText={setSpanish} onFocus={() => setSpanishFocused(true)} onBlur={() => setSpanishFocused(false)} placeholder="ej., manzana" placeholderTextColor={textMuted} autoCapitalize="none" autoCorrect={false} />
                    </View>
                  </View>
                  <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                    <TouchableOpacity style={[styles.primaryButton, { backgroundColor: isManualValid ? accentColor : (darkModeEnabled ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'), opacity: isManualValid ? 1 : 0.6 }]} onPressIn={onPressIn} onPressOut={onPressOut} onPress={handleAddManualFlashcard} disabled={loading || !isManualValid} activeOpacity={0.8}>
                      <View style={styles.buttonHighlight} />
                      <View style={styles.buttonContent}>
                        {loading ? <ActivityIndicator size="small" color="#FFF" /> : <><FontAwesome5 name="plus" size={14} color="#FFF" /><Text style={styles.buttonText}>AGREGAR FLASHCARD</Text></>}
                      </View>
                      <View style={[styles.buttonShadow, { backgroundColor: isManualValid ? darkenColor(accentColor, 0.2) : 'rgba(0,0,0,0.2)' }]} />
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              ) : (
                <View style={styles.inputSection}>
                  {generationStep === 'idle' && (
                    <>
                      <View style={styles.sliderSection}>
                        <View style={styles.sliderHeader}>
                          <MaterialCommunityIcons name="cards" size={14} color={aiColor} />
                          <Text style={[styles.sliderLabel, { color: textSecondary }]}>NÚMERO DE FLASHCARDS</Text>
                        </View>
                        <View style={[styles.lcdDisplay, { backgroundColor: darkModeEnabled ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.05)', borderColor: aiColor }]}>
                          <Text style={[styles.lcdNumber, { color: aiColor }]}>{String(numFlashcards).padStart(2, '0')}</Text>
                          <Text style={[styles.lcdLabel, { color: textMuted }]}>CARDS</Text>
                        </View>
                        <View style={styles.sliderWrapper}>
                          <Text style={[styles.sliderMin, { color: textMuted }]}>01</Text>
                          <Slider style={styles.slider} minimumValue={1} maximumValue={10} step={1} value={numFlashcards} onValueChange={(val) => setNumFlashcards(Math.round(val))} minimumTrackTintColor={aiColor} maximumTrackTintColor={darkModeEnabled ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'} thumbTintColor={aiColor} />
                          <Text style={[styles.sliderMax, { color: textMuted }]}>10</Text>
                        </View>
                      </View>
                      <View style={[styles.infoBox, { backgroundColor: `${aiColor}15` }]}>
                        <MaterialCommunityIcons name="lightbulb-on" size={16} color={aiColor} />
                        <Text style={[styles.infoText, { color: textSecondary }]}>Genera {numFlashcards} flashcard{numFlashcards > 1 ? 's' : ''} de <Text style={{ color: aiColor, fontWeight: 'bold' }}>"{category}"</Text> con variantes.</Text>
                      </View>
                      <Animated.View style={{ transform: [{ scale: Animated.multiply(btnScale, pulseAnim) }] }}>
                        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: aiColor }]} onPressIn={onPressIn} onPressOut={onPressOut} onPress={generateWithAI} activeOpacity={0.8}>
                          <View style={styles.buttonHighlight} />
                          <View style={styles.buttonContent}>
                            <MaterialCommunityIcons name="auto-fix" size={18} color="#FFF" />
                            <Text style={styles.buttonText}>GENERAR CON IA</Text>
                          </View>
                          <View style={[styles.buttonShadow, { backgroundColor: '#7D3C98' }]} />
                        </TouchableOpacity>
                      </Animated.View>
                    </>
                  )}

                  {generationStep === 'generating' && (
                    <View style={styles.loadingContainer}>
                      <Animated.View style={[styles.loadingIconContainer, { opacity: loadingGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }]}>
                        <MaterialCommunityIcons name="robot" size={50} color={aiColor} />
                      </Animated.View>
                      <Text style={[styles.loadingText, { color: textPrimary }]}>{loadingMessage}</Text>
                      <View style={[styles.progressBarContainer, { backgroundColor: darkModeEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                        <Animated.View style={[styles.progressBar, { backgroundColor: aiColor, width: loadingBarAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
                      </View>
                      <Text style={[styles.progressText, { color: aiColor }]}>{loadingProgress}%</Text>
                    </View>
                  )}

                  {generationStep === 'preview' && (
                    <Animated.View style={{ opacity: cardsRevealAnim }}>
                      <View style={styles.previewHeader}>
                        <View style={styles.previewTitleRow}>
                          <MaterialCommunityIcons name="check-circle" size={16} color="#4ADE80" />
                          <Text style={[styles.previewTitle, { color: textPrimary }]}>{generatedCards.length} FLASHCARDS GENERADAS</Text>
                        </View>
                        <View style={styles.previewActions}>
                          <TouchableOpacity onPress={() => setSelectedCards(new Set(generatedCards.map((_, i) => i)))}><Text style={[styles.selectActionText, { color: aiColor }]}>Todas</Text></TouchableOpacity>
                          <Text style={[styles.selectDivider, { color: textMuted }]}>|</Text>
                          <TouchableOpacity onPress={() => setSelectedCards(new Set())}><Text style={[styles.selectActionText, { color: textMuted }]}>Ninguna</Text></TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.cardsListContainer}>
                        {generatedCards.map((item, index) => renderGeneratedCard(item, index))}
                      </View>
                      <View style={[styles.selectionInfo, { backgroundColor: `${aiColor}15` }]}>
                        <Text style={[styles.selectionInfoText, { color: textSecondary }]}>{selectedCards.size} de {generatedCards.length} seleccionadas</Text>
                      </View>
                      <View style={styles.previewButtons}>
                        <TouchableOpacity style={[styles.secondaryButton, { borderColor: textMuted }]} onPress={resetAIMode}>
                          <Ionicons name="refresh" size={14} color={textSecondary} />
                          <Text style={[styles.secondaryButtonText, { color: textSecondary }]}>REGENERAR</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.saveButton, { backgroundColor: selectedCards.size > 0 ? '#4ADE80' : (darkModeEnabled ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'), opacity: selectedCards.size > 0 ? 1 : 0.6 }]} onPress={saveSelectedCards} disabled={selectedCards.size === 0 || generationStep === 'saving'}>
                          {generationStep === 'saving' ? <ActivityIndicator size="small" color="#FFF" /> : <><Ionicons name="checkmark" size={16} color="#FFF" /><Text style={styles.saveButtonText}>GUARDAR ({selectedCards.size})</Text></>}
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  )}
                </View>
              )}
            </View>

            {errorMsg && (
              <View style={[styles.errorContainer, { backgroundColor: msgType === 'info' ? 'rgba(255,165,0,0.15)' : 'rgba(255,99,99,0.15)' }]}>
                <Ionicons name={msgType === 'info' ? 'information-circle' : 'alert-circle'} size={16} color={msgType === 'info' ? '#F59E0B' : '#FF6B6B'} />
                <Text style={[styles.errorText, { color: msgType === 'info' ? '#F59E0B' : '#FF6B6B' }]}>{errorMsg}</Text>
              </View>
            )}

            {(activeTab === 'manual' || generationStep === 'idle') && (
              <View style={styles.instructionsContainer}>
                <MaterialCommunityIcons name="information-outline" size={14} color={textMuted} />
                <Text style={[styles.instructionsText, { color: textMuted }]}>{activeTab === 'manual' ? 'Ingresa la palabra en inglés y su traducción' : `Genera flashcards de "${category}" automáticamente`}</Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {successMsg && (
        <Animated.View pointerEvents="none" style={[styles.successOverlay, { opacity: successAnim, transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
          <View style={[styles.successModal, { backgroundColor: '#4ADE80' }]}>
            <Ionicons name="checkmark-circle" size={24} color="#FFF" />
            <Text style={styles.successText}>{successMsg}</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const darkenColor = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent * 100);
  const R = (num >> 16) - amt, G = ((num >> 8) & 0x00ff) - amt, B = (num & 0x0000ff) - amt;
  return `#${(0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 + (B < 255 ? (B < 1 ? 0 : B) : 255)).toString(16).slice(1)}`;
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 50, borderBottomWidth: 4, borderBottomColor: 'rgba(0,0,0,0.2)' },
  backButton: { width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerLabel: { fontSize: 9, fontFamily: retroFont, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },
  headerTitle: { fontSize: 14, fontFamily: retroFont, fontWeight: 'bold', color: '#FFF', letterSpacing: 0.5 },
  headerRight: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, marginTop: 16, gap: 6 },
  categoryText: { fontSize: 11, fontFamily: retroFont, fontWeight: 'bold', letterSpacing: 0.5 },
  content: { padding: 16 },
  tabContainer: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 16, overflow: 'hidden', position: 'relative' },
  tabIndicator: { position: 'absolute', width: '50%', height: '100%', borderRadius: 10, left: 4, top: 4, bottom: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 8, zIndex: 1 },
  tabText: { fontSize: 11, fontFamily: retroFont, fontWeight: 'bold', letterSpacing: 0.5 },
  mainPanel: { borderRadius: 16, overflow: 'hidden', borderWidth: 3, borderColor: 'rgba(0,0,0,0.1)' },
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 8 },
  panelHeaderText: { fontSize: 10, fontFamily: retroFont, fontWeight: 'bold', color: '#FFF', letterSpacing: 1 },
  inputSection: { padding: 16, gap: 16 },
  inputWrapper: { gap: 6 },
  inputLabel: { fontSize: 10, fontFamily: retroFont, fontWeight: 'bold', letterSpacing: 1, paddingLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 3, borderRadius: 12, paddingHorizontal: 12, height: 52, gap: 10 },
  inputIcon: { fontSize: 18 },
  input: { flex: 1, fontSize: 16, fontFamily: retroFont, fontWeight: 'bold' },
  sliderSection: { gap: 12 },
  sliderHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sliderLabel: { fontSize: 10, fontFamily: retroFont, fontWeight: 'bold', letterSpacing: 1 },
  lcdDisplay: { alignItems: 'center', alignSelf: 'center', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 12, borderWidth: 3 },
  lcdNumber: { fontSize: 42, fontFamily: retroFont, fontWeight: 'bold' },
  lcdLabel: { fontSize: 9, fontFamily: retroFont, fontWeight: 'bold', letterSpacing: 2, marginTop: 2 },
  sliderWrapper: { flexDirection: 'row', alignItems: 'center' },
  slider: { flex: 1, height: 40 },
  sliderMin: { fontSize: 10, fontFamily: retroFont, fontWeight: 'bold', marginRight: 8 },
  sliderMax: { fontSize: 10, fontFamily: retroFont, fontWeight: 'bold', marginLeft: 8 },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, borderRadius: 10, gap: 10 },
  infoText: { flex: 1, fontSize: 11, fontFamily: retroFont, lineHeight: 16 },
  primaryButton: { width: '100%', height: 56, borderRadius: 14, position: 'relative', overflow: 'hidden' },
  buttonHighlight: { position: 'absolute', top: 0, left: 0, right: 0, height: '45%', backgroundColor: 'rgba(255,255,255,0.25)', borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  buttonContent: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  buttonText: { fontSize: 13, fontFamily: retroFont, fontWeight: 'bold', color: '#FFF', letterSpacing: 1 },
  buttonShadow: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 5, borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  loadingContainer: { alignItems: 'center', paddingVertical: 40, gap: 16 },
  loadingIconContainer: { marginBottom: 8 },
  loadingText: { fontSize: 14, fontFamily: retroFont, fontWeight: 'bold' },
  progressBarContainer: { width: '80%', height: 12, borderRadius: 6, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 6 },
  progressText: { fontSize: 18, fontFamily: retroFont, fontWeight: 'bold' },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  previewTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  previewTitle: { fontSize: 11, fontFamily: retroFont, fontWeight: 'bold', letterSpacing: 0.5 },
  previewActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectActionText: { fontSize: 10, fontFamily: retroFont, fontWeight: 'bold' },
  selectDivider: { fontSize: 10 },
  cardsListContainer: { gap: 10 },
  generatedCard: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 2, gap: 10 },
  cardCheckbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  emojiText: { fontSize: 22 },
  cardContent: { flex: 1, gap: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardFlag: { fontSize: 12 },
  cardEnglish: { fontSize: 14, fontFamily: retroFont, fontWeight: 'bold', flex: 1 },
  cardSpanish: { fontSize: 12, fontFamily: retroFont, flex: 1 },
  variantsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  variantsText: { fontSize: 9, fontFamily: retroFont },
  cardBadges: { alignItems: 'flex-end', gap: 4 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  typeBadgeText: { fontSize: 8, fontFamily: retroFont, fontWeight: 'bold' },
  rarityStars: { fontSize: 10, color: '#FFD700' },
  selectionInfo: { alignItems: 'center', padding: 10, borderRadius: 8, marginTop: 12 },
  selectionInfoText: { fontSize: 11, fontFamily: retroFont, fontWeight: 'bold' },
  previewButtons: { flexDirection: 'row', gap: 10, marginTop: 12 },
  secondaryButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 10, borderWidth: 2, gap: 6 },
  secondaryButtonText: { fontSize: 11, fontFamily: retroFont, fontWeight: 'bold', letterSpacing: 0.5 },
  saveButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 10, gap: 6 },
  saveButtonText: { fontSize: 11, fontFamily: retroFont, fontWeight: 'bold', color: '#FFF', letterSpacing: 0.5 },
  errorContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12, padding: 12, borderRadius: 10, gap: 8 },
  errorText: { flex: 1, fontSize: 11, fontFamily: retroFont, color: '#FF6B6B' },
  instructionsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, gap: 8, paddingHorizontal: 16 },
  instructionsText: { fontSize: 10, fontFamily: retroFont, textAlign: 'center', lineHeight: 14, flex: 1 },
  successOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  successModal: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16, gap: 10, elevation: 6 },
  successText: { fontSize: 14, fontFamily: retroFont, fontWeight: 'bold', color: '#FFF', letterSpacing: 0.5 },
});

export default AddFlashcard;
