import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, StatusBar, Text, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { selectFlashcardsByCategory } from '../../../../../../redux/FlashcardSlice';
import { selectDarkMode } from '../../../../../../redux/darkModeSlice';
import Animated, { Layout, FadeIn } from 'react-native-reanimated';

// Componentes
import SessionHeader from './components/SessionHeader';
import ModeSelector, { WordCountSelector } from './components/ModeSelector';
import ExerciseCard from './components/ExerciseCard';
import SessionResultsScreen from '../SessionResultsScreen';
import LevelUpAnimation from './components/LevelUpAnimation';

// Hooks
import useStudyProgress from '../hooks/useStudyProgress';
import useRetroSounds from '../hooks/useRetroSounds';

// Sistema de sesiones mejorado
import { SessionQueue, EXERCISE_TYPES } from '../utils/sessionManager';

// Ejercicios
import ListenAndChooseExerciseNew from './Exercises/ListenAndChooseExerciseNew';
import WriteWordExerciseNew from './Exercises/WriteWordExerciseNew';
import SpellingExerciseNew from './Exercises/SpellingExerciseNew';
import FillBlankExerciseNew from './Exercises/FillBlankExerciseNew';
import MatchPairsExerciseNew from './Exercises/MatchPairsExerciseNew';

/**
 * VocabularyExercisesScreen - Pantalla principal de ejercicios
 * Con sistema de repetición inteligente: las palabras incorrectas vuelven a aparecer
 */
const VocabularyExercisesScreen = ({ route, navigation }) => {
  const { category: categoryProp, colorPair } = route.params;
  const categoryName = typeof categoryProp === 'object' ? categoryProp.name : categoryProp;
  const darkModeEnabled = useSelector(selectDarkMode);
  const flashcards = useSelector((state) => selectFlashcardsByCategory(state, categoryName));
  
  // Hook de progreso de estudio
  const {
    isLoaded,
    categoryStats,
    currentSession,
    sessionAccuracy,
    selectWords,
    getModeCounts,
    getWordMastery,
    getProgressMap,
    beginSession,
    submitAnswer,
    finishSession,
  } = useStudyProgress(flashcards, categoryName);
  
  // Hook de sonidos
  const { playCorrect, playWrong } = useRetroSounds();
  
  // Referencia a la sesión con cola de repetición
  const sessionQueueRef = useRef(null);
  
  // Estados de la UI
  const [phase, setPhase] = useState('mode-select'); // 'mode-select', 'count-select', 'exercising', 'results'
  const [selectedMode, setSelectedMode] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(null); // { word, exerciseType, round, isRetry }
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [wordResults, setWordResults] = useState([]);
  const [sessionProgress, setSessionProgress] = useState({ current: 0, total: 0, remaining: 0, percentage: 0 });
  
  // Estado para animación de level up
  const [levelUpData, setLevelUpData] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  
  // Contadores de modos
  const modeCounts = useMemo(() => getModeCounts(), [getModeCounts]);
  
  // Palabra y ejercicio actual
  const currentWord = currentExercise?.word || null;
  const currentMastery = currentWord ? getWordMastery(currentWord.id) : null;
  const currentExerciseType = currentExercise?.exerciseType || 'listen-choose';
  
  // Obtener todas las palabras de la sesión para contexto en ejercicios
  const sessionWords = useMemo(() => {
    if (!sessionQueueRef.current) return [];
    return sessionQueueRef.current.originalWords;
  }, [currentExercise]);

  // Preparar palabras para el ejercicio de emparejar
  const matchPairsWords = useMemo(() => {
    if (!currentWord || currentExerciseType !== 'match-pairs') return [];
    const others = sessionWords.filter(w => w.id !== currentWord.id);
    const shuffled = others.sort(() => 0.5 - Math.random());
    return [currentWord, ...shuffled.slice(0, 3)].sort(() => 0.5 - Math.random());
  }, [currentWord?.id, sessionWords, currentExerciseType]);
  
  // Manejar selección de modo
  const handleSelectMode = useCallback((mode) => {
    setSelectedMode(mode);
    setPhase('count-select');
  }, []);
  
  // Manejar selección de cantidad - inicializa la sesión con cola inteligente
  const handleSelectCount = useCallback((count) => {
    const words = selectWords(count, selectedMode);
    const progressMap = getProgressMap();
    
    // Crear nueva cola de sesión con repetición inteligente
    const sessionQueue = new SessionQueue(words, progressMap);
    sessionQueueRef.current = sessionQueue;
    
    // Obtener primer ejercicio
    const firstExercise = sessionQueue.getNext();
    console.log('Session started with words:', words.length);
    console.log('First exercise:', firstExercise?.word?.english, 'Type:', firstExercise?.exerciseType);
    
    if (firstExercise) {
      setCurrentExercise(firstExercise);
      setSessionProgress(sessionQueue.getProgress());
      setCurrentStreak(0);
      setWordResults([]);
      beginSession();
      setPhase('exercising');
    } else {
      console.log('No exercises available for the selected mode/count');
      // Podríamos mostrar un mensaje aquí
      setPhase('mode-select');
    }
  }, [selectWords, selectedMode, getProgressMap, beginSession]);
  
  // Manejar respuesta correcta
  const handleCorrect = useCallback(() => {
    if (showFeedback || !currentExercise) return;
    
    const word = currentExercise.word;
    const previousLevel = getWordMastery(word.id)?.masteryLevel || 0;
    
    submitAnswer(word.id, true);
    
    // Reproducir sonido de éxito
    playCorrect();
    
    // Reportar a la cola de sesión
    const result = sessionQueueRef.current?.reportResult(word.id, true);
    
    const newLevel = Math.min(5, previousLevel + 1);
    const leveledUp = newLevel > previousLevel && previousLevel >= 3;
    
    setWordResults(prev => [...prev, {
      wordId: word.id,
      english: word.english,
      spanish: word.spanish,
      wasCorrect: true,
      previousLevel,
      newLevel,
      leveledUp,
      exerciseType: currentExercise.exerciseType,
      round: currentExercise.round,
      wasRetry: currentExercise.isRetry,
    }]);
    
    setCurrentStreak(prev => prev + 1);
    setLastAnswerCorrect(true);
    setShowFeedback(true);
    
    // Mostrar animación de level up si aplica
    if (leveledUp && newLevel >= 4) {
      setLevelUpData({
        word,
        previousLevel,
        newLevel,
      });
      setShowLevelUp(true);
    }
    
    // Actualizar progreso
    if (sessionQueueRef.current) {
      setSessionProgress(sessionQueueRef.current.getProgress());
    }
  }, [currentExercise, showFeedback, submitAnswer, getWordMastery, playCorrect]);
  
  // Manejar respuesta incorrecta
  const handleIncorrect = useCallback(() => {
    if (showFeedback || !currentExercise) return;
    
    const word = currentExercise.word;
    const previousLevel = getWordMastery(word.id)?.masteryLevel || 0;
    
    submitAnswer(word.id, false);
    
    // Reproducir sonido de error
    playWrong();
    
    // Reportar a la cola - esto añadirá la palabra de nuevo más tarde
    const result = sessionQueueRef.current?.reportResult(word.id, false);
    
    setWordResults(prev => [...prev, {
      wordId: word.id,
      english: word.english,
      spanish: word.spanish,
      wasCorrect: false,
      previousLevel,
      newLevel: Math.max(0, previousLevel - 1),
      leveledUp: false,
      exerciseType: currentExercise.exerciseType,
      round: currentExercise.round,
      wasRetry: currentExercise.isRetry,
      willRetry: result?.remaining > 0 && sessionQueueRef.current?.queue.some(q => q.word.id === word.id),
    }]);
    
    setCurrentStreak(0);
    setLastAnswerCorrect(false);
    setShowFeedback(true);
    
    // Actualizar progreso
    if (sessionQueueRef.current) {
      setSessionProgress(sessionQueueRef.current.getProgress());
    }
  }, [currentExercise, showFeedback, submitAnswer, getWordMastery, playWrong]);
  
  // Continuar al siguiente ejercicio
  const handleContinue = useCallback(() => {
    setShowFeedback(false);
    setLastAnswerCorrect(null);
    
    if (!sessionQueueRef.current) {
      finishSession();
      setPhase('results');
      return;
    }
    
    const nextExercise = sessionQueueRef.current.getNext();
    
    if (nextExercise) {
      console.log('Next exercise:', nextExercise.word.english, 'Type:', nextExercise.exerciseType, 'Round:', nextExercise.round);
      setCurrentExercise(nextExercise);
      setSessionProgress(sessionQueueRef.current.getProgress());
    } else {
      console.log('Session complete!');
      finishSession();
      setPhase('results');
    }
  }, [finishSession]);
  
  // Volver atrás
  const handleBack = useCallback(() => {
    if (phase === 'exercising') {
      navigation.goBack();
    } else if (phase === 'count-select') {
      setPhase('mode-select');
    } else if (phase === 'results') {
      setPhase('mode-select');
    } else {
      navigation.goBack();
    }
  }, [phase, navigation]);
  
  // Jugar de nuevo
  const handlePlayAgain = useCallback(() => {
    sessionQueueRef.current = null;
    setCurrentExercise(null);
    setPhase('mode-select');
    setWordResults([]);
  }, []);
  
  // Configurar StatusBar
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colorPair?.background || '#4A90D9');
    }
  }, [colorPair]);
  
  const bgColor = darkModeEnabled ? '#16181D' : '#F0F4F8';
  
  // Calcular estadísticas para resultados
  const sessionStats = useMemo(() => {
    const uniqueCorrect = new Set(wordResults.filter(r => r.wasCorrect).map(r => r.wordId)).size;
    const uniqueWords = new Set(wordResults.map(r => r.wordId)).size;
    
    return {
      correctAnswers: wordResults.filter(r => r.wasCorrect).length,
      incorrectAnswers: wordResults.filter(r => !r.wasCorrect).length,
      accuracy: wordResults.length > 0 
        ? Math.round((wordResults.filter(r => r.wasCorrect).length / wordResults.length) * 100)
        : 0,
      uniqueWordsCompleted: uniqueCorrect,
      totalUniqueWords: uniqueWords,
      totalExercises: wordResults.length,
    };
  }, [wordResults]);
  
  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar 
        backgroundColor={colorPair?.background || '#4A90D9'} 
        barStyle="light-content" 
      />
      
      {/* Header siempre visible durante ejercicios */}
      {phase === 'exercising' && (
        <SessionHeader
          categoryName={categoryName}
          colorPair={colorPair}
          darkModeEnabled={darkModeEnabled}
          currentIndex={sessionProgress.current}
          totalWords={sessionProgress.total}
          correctCount={sessionStats.correctAnswers}
          currentStreak={currentStreak}
          onBack={handleBack}
          isRetry={currentExercise?.isRetry}
          exerciseType={currentExerciseType}
        />
      )}
      
      {/* Contenido principal */}
      {phase === 'exercising' && currentWord && (
        <Animated.View 
          key={`exercise-container-${currentWord.id}-${currentExerciseType}`}
          entering={FadeIn.duration(400)}
          layout={Layout.springify().damping(15)}
          style={{ flex: 1 }}
        >
          <ExerciseCard
            word={currentWord}
            masteryLevel={currentMastery?.masteryLevel || 0}
            exerciseType={currentExerciseType}
            colorPair={colorPair}
            darkModeEnabled={darkModeEnabled}
            showFeedback={showFeedback}
            isCorrect={lastAnswerCorrect}
            onContinue={handleContinue}
            isRetry={currentExercise?.isRetry}
            isConfirmation={currentExercise?.isConfirmation}
          >
            {/* Renderizar ejercicio según tipo */}
            <Animated.View 
               key={`content-${currentExerciseType}-${currentWord.id}`}
               entering={FadeIn.delay(200).duration(400)}
               style={{ flex: 1 }}
            >
              {currentExerciseType === 'listen-choose' && (
                <ListenAndChooseExerciseNew
                  word={currentWord}
                  flashcards={sessionWords}
                  colorPair={colorPair}
                  darkModeEnabled={darkModeEnabled}
                  onCorrect={handleCorrect}
                  onIncorrect={handleIncorrect}
                  disabled={showFeedback}
                />
              )}
              
              {currentExerciseType === 'write' && (
                <WriteWordExerciseNew
                  word={currentWord}
                  colorPair={colorPair}
                  darkModeEnabled={darkModeEnabled}
                  onCorrect={handleCorrect}
                  onIncorrect={handleIncorrect}
                  disabled={showFeedback}
                />
              )}
              
              {currentExerciseType === 'spelling' && (
                <SpellingExerciseNew
                  word={currentWord}
                  colorPair={colorPair}
                  darkModeEnabled={darkModeEnabled}
                  onCorrect={handleCorrect}
                  onIncorrect={handleIncorrect}
                  disabled={showFeedback}
                />
              )}
              
              {currentExerciseType === 'fill-blank' && (
                <FillBlankExerciseNew
                  word={currentWord}
                  flashcards={sessionWords}
                  colorPair={colorPair}
                  darkModeEnabled={darkModeEnabled}
                  onCorrect={handleCorrect}
                  onIncorrect={handleIncorrect}
                  disabled={showFeedback}
                />
              )}

              {currentExerciseType === 'match-pairs' && (
                <MatchPairsExerciseNew
                  words={matchPairsWords}
                  colorPair={colorPair}
                  darkModeEnabled={darkModeEnabled}
                  onComplete={handleCorrect}
                  onIncorrect={handleIncorrect}
                  disabled={showFeedback}
                />
              )}
            </Animated.View>
          </ExerciseCard>
        </Animated.View>
      )}
      
      {/* Selector de modo - solo se monta cuando phase === 'mode-select' */}
      {phase === 'mode-select' && (
        <ModeSelector
          visible={true}
          onSelectMode={handleSelectMode}
          onCancel={handleBack}
          modeCounts={modeCounts}
          colorPair={colorPair}
          darkModeEnabled={darkModeEnabled}
        />
      )}
      
      {/* Selector de cantidad - solo se monta cuando phase === 'count-select' */}
      {phase === 'count-select' && (
        <WordCountSelector
          visible={true}
          onSelect={handleSelectCount}
          onCancel={() => setPhase('mode-select')}
          maxCount={modeCounts[selectedMode] || 0}
          colorPair={colorPair}
          darkModeEnabled={darkModeEnabled}
        />
      )}
      
      {/* Pantalla de resultados */}
      <SessionResultsScreen
        visible={phase === 'results'}
        sessionData={sessionStats}
        wordResults={wordResults}
        colorPair={colorPair}
        darkModeEnabled={darkModeEnabled}
        onClose={() => navigation.goBack()}
        onPlayAgain={handlePlayAgain}
      />
      
      {/* Animación de Level Up */}
      <LevelUpAnimation
        visible={showLevelUp}
        word={levelUpData?.word}
        previousLevel={levelUpData?.previousLevel || 0}
        newLevel={levelUpData?.newLevel || 0}
        wordText={levelUpData?.word?.english}
        onComplete={() => setShowLevelUp(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default VocabularyExercisesScreen;
