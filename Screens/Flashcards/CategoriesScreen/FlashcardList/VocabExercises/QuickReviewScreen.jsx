import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { selectFlashcardsByCategory } from '../../../../../redux/FlashcardSlice';
import { selectDarkMode } from '../../../../../redux/darkModeSlice';
import useStudyProgress from './hooks/useStudyProgress';
import useRetroSounds from './hooks/useRetroSounds';
import { AnswerButton, SpeakButton } from './VocabularyExercisesScreen/components/ExerciseCard';

const { width } = Dimensions.get('window');
const QUICK_REVIEW_TIME = 60; // 60 segundos

/**
 * QuickReviewScreen - Modo de repaso rápido de 60 segundos
 * Responde tantas palabras como puedas contra reloj
 */
const QuickReviewScreen = ({ route, navigation }) => {
  const { category: categoryProp, colorPair } = route.params;
  const categoryName = typeof categoryProp === 'object' ? categoryProp.name : categoryProp;
  const darkModeEnabled = useSelector(selectDarkMode);
  const flashcards = useSelector((state) => selectFlashcardsByCategory(state, categoryName));
  
  // Hooks
  const { selectWords, submitAnswer, beginSession, finishSession, sessionAccuracy } = useStudyProgress(flashcards, categoryName);
  const { playCorrect, playWrong } = useRetroSounds();
  
  // Estados
  const [phase, setPhase] = useState('countdown'); // 'countdown', 'playing', 'results'
  const [timeLeft, setTimeLeft] = useState(QUICK_REVIEW_TIME);
  const [countdownValue, setCountdownValue] = useState(3);
  const [selectedWords, setSelectedWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  
  // Refs
  const timerRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;
  
  const currentWord = selectedWords[currentIndex];
  
  // Inicializar palabras
  useEffect(() => {
    const words = selectWords(flashcards.length, 'all');
    // Mezclar para variedad
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setSelectedWords(shuffled);
    beginSession();
  }, []);
  
  // Countdown inicial
  useEffect(() => {
    if (phase === 'countdown') {
      const interval = setInterval(() => {
        setCountdownValue(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setPhase('playing');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);
  
  // Timer principal
  useEffect(() => {
    if (phase === 'playing') {
      // Animar barra de progreso
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: QUICK_REVIEW_TIME * 1000,
        useNativeDriver: false,
      }).start();
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishSession();
            setPhase('results');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timerRef.current);
    }
  }, [phase]);
  
  // Generar opciones cuando cambia la palabra
  useEffect(() => {
    if (!currentWord || phase !== 'playing') return;
    
    const correctOption = currentWord.spanish;
    const incorrectOptions = selectedWords
      .filter(w => w.id !== currentWord.id)
      .map(w => w.spanish)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [...incorrectOptions, correctOption].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setSelectedOption(null);
    setIsCorrect(null);
  }, [currentIndex, currentWord, phase]);
  
  // Manejar selección
  const handleSelect = useCallback((option) => {
    if (selectedOption !== null) return;
    
    const correct = option === currentWord.spanish;
    setSelectedOption(option);
    setIsCorrect(correct);
    
    if (correct) {
      playCorrect();
      setScore(prev => prev + 10 + streak * 2); // Bonus por racha
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        return newStreak;
      });
      submitAnswer(currentWord.id, true);
      
      // Animación de acierto
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    } else {
      playWrong();
      setStreak(0);
      submitAnswer(currentWord.id, false);
    }
    
    // Pasar a siguiente palabra
    setTimeout(() => {
      if (currentIndex < selectedWords.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Reiniciar desde el principio con palabras mezcladas
        const reShuffled = [...selectedWords].sort(() => Math.random() - 0.5);
        setSelectedWords(reShuffled);
        setCurrentIndex(0);
      }
    }, 400);
  }, [currentWord, selectedOption, streak, bestStreak, currentIndex, selectedWords, playCorrect, playWrong, submitAnswer]);
  
  // Salir
  const handleExit = useCallback(() => {
    clearInterval(timerRef.current);
    navigation.goBack();
  }, [navigation]);
  
  const bgColor = darkModeEnabled ? '#16181D' : '#F0F4F8';
  const accentColor = colorPair?.background || '#4A90D9';
  
  // Pantalla de countdown
  if (phase === 'countdown') {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.countdownContainer}>
          <Text style={[styles.countdownLabel, { color: accentColor }]}>GET READY!</Text>
          <Text style={[styles.countdownNumber, { color: accentColor }]}>{countdownValue}</Text>
        </View>
      </View>
    );
  }
  
  // Pantalla de resultados
  if (phase === 'results') {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <LinearGradient colors={[accentColor, bgColor]} style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>TIME'S UP!</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>FINAL SCORE</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <FontAwesome5 name="check" size={24} color="#4ADE80" />
            <Text style={[styles.statValue, { color: darkModeEnabled ? '#FFF' : '#333' }]}>
              {Math.round(sessionAccuracy)}%
            </Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          
          <View style={styles.statBox}>
            <FontAwesome5 name="fire" size={24} color="#F59E0B" />
            <Text style={[styles.statValue, { color: darkModeEnabled ? '#FFF' : '#333' }]}>
              {bestStreak}
            </Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, { borderColor: accentColor }]} 
            onPress={handleExit}
          >
            <Text style={[styles.buttonText, { color: accentColor }]}>EXIT</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.buttonPrimary, { backgroundColor: accentColor }]} 
            onPress={() => {
              setPhase('countdown');
              setCountdownValue(3);
              setTimeLeft(QUICK_REVIEW_TIME);
              setScore(0);
              setStreak(0);
              setBestStreak(0);
              setCurrentIndex(0);
              progressAnim.setValue(1);
              beginSession();
            }}
          >
            <Text style={[styles.buttonText, { color: '#FFF' }]}>PLAY AGAIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  // Pantalla de juego
  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header con timer */}
      <View style={[styles.header, { backgroundColor: accentColor }]}>
        <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.timerContainer}>
          <FontAwesome5 name="clock" size={16} color="#FFF" />
          <Text style={styles.timerText}>{timeLeft}s</Text>
        </View>
        
        <View style={styles.scoreDisplay}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>
      
      {/* Barra de progreso */}
      <View style={styles.progressBarContainer}>
        <Animated.View 
          style={[
            styles.progressBar, 
            { 
              backgroundColor: timeLeft <= 10 ? '#EF4444' : accentColor,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }
          ]} 
        />
      </View>
      
      {/* Streak indicator */}
      {streak > 0 && (
        <Animated.View style={[styles.streakBadge, { transform: [{ scale: scaleAnim }] }]}>
          <FontAwesome5 name="fire" size={16} color="#F59E0B" />
          <Text style={styles.streakText}>{streak}x STREAK!</Text>
        </Animated.View>
      )}
      
      {/* Palabra en inglés */}
      <View style={styles.wordContainer}>
        <Text style={[styles.wordLabel, { color: darkModeEnabled ? '#888' : '#666' }]}>
          TRANSLATE:
        </Text>
        <Text style={[styles.wordText, { color: darkModeEnabled ? '#FFF' : '#1a1a2e' }]}>
          {currentWord?.english || '---'}
        </Text>
      </View>
      
      {/* Opciones */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={`${currentIndex}-${option}-${index}`}
            style={[
              styles.optionButton,
              { 
                backgroundColor: selectedOption === option 
                  ? (isCorrect ? '#4ADE80' : '#EF4444')
                  : (darkModeEnabled ? '#2a2a4e' : '#FFF'),
                borderColor: selectedOption === option 
                  ? (isCorrect ? '#22C55E' : '#DC2626')
                  : (darkModeEnabled ? '#3a3a6e' : '#E0E0E0'),
              }
            ]}
            onPress={() => handleSelect(option)}
            disabled={selectedOption !== null}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.optionText, 
              { 
                color: selectedOption === option 
                  ? '#FFF' 
                  : (darkModeEnabled ? '#FFF' : '#333') 
              }
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Countdown
  countdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 4,
    marginBottom: 20,
  },
  countdownNumber: {
    fontSize: 120,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFF',
  },
  scoreDisplay: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFF',
  },
  
  // Progress bar
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  progressBar: {
    height: '100%',
  },
  
  // Streak
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    gap: 8,
  },
  streakText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#92400E',
  },
  
  // Word
  wordContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  wordLabel: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 2,
    marginBottom: 12,
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  
  // Options
  optionsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  optionButton: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  
  // Results
  resultsHeader: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFF',
    letterSpacing: 3,
  },
  scoreContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  scoreLabel: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  statBox: {
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#888',
  },
  buttonRow: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 24,
    left: 16,
    right: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
  },
  buttonPrimary: {
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
  },
});

export default QuickReviewScreen;
