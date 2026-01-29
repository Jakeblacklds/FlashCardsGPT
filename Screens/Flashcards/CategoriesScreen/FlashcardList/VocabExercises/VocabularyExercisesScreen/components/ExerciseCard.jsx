import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  FadeIn,
  FadeOut,
  Layout,
  ZoomIn,
  SlideInUp,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { MasteryBadge } from './SessionHeader';

const { width } = Dimensions.get('window');

/**
 * ExerciseCard - Contenedor de ejercicio estilo Pokemon battle UI Rediseñado
 */
const ExerciseCard = ({
  word,
  masteryLevel,
  exerciseType,
  children,
  colorPair,
  darkModeEnabled,
  showFeedback,
  isCorrect,
  onContinue,
  isRetry,
  isConfirmation,
}) => {
  const scale = useSharedValue(1);
  const shakeX = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  const feedbackOpacity = useSharedValue(0);
  const confettiRef = useRef(null);
  
  const bgColor = darkModeEnabled ? '#16181D' : '#F0F4F8';
  const cardBg = darkModeEnabled ? '#1E2028' : '#FFFFFF';
  const accentColor = colorPair?.background || '#4A90D9';
  
  const getMotivationalMessage = () => {
    if (isConfirmation) return "¡PROVE YOUR KNOWLEDGE!";
    if (isRetry) return "¡TRY AGAIN!";
    if (masteryLevel === 0) return "¡NEW WORD!";
    if (masteryLevel >= 4) return "¡ALMOST MASTERED!";
    return "¡YOU GOT THIS!";
  };

  useEffect(() => {
    if (showFeedback) {
      feedbackOpacity.value = withTiming(1, { duration: 300 });

      if (isCorrect) {
        scale.value = withSequence(
          withSpring(1.05, { damping: 12 }),
          withSpring(1)
        );
        if (confettiRef.current) confettiRef.current.play();
      } else {
        shakeX.value = withSequence(
          withTiming(10, { duration: 50 }),
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
      }
      
      progressWidth.value = 0;
      progressWidth.value = withTiming(1, { duration: 1500 }, (finished) => {
        if (finished && onContinue) {
          // runOnJS is needed because this is called on the UI thread
          // though since onContinue is likely a JS function it needs to be called via runOnJS
          // or just triggered back to JS side.
        }
      });

      // Simple timeout for JS side navigation to avoid threading issues
      const timer = setTimeout(() => {
        if (onContinue) onContinue();
      }, 1600);
      return () => clearTimeout(timer);
    } else {
      feedbackOpacity.value = withTiming(0, { duration: 200 });
      progressWidth.value = 0;
    }
  }, [showFeedback, isCorrect]);
  
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: shakeX.value }
    ],
  }));

  const feedbackAnimatedStyle = useAnimatedStyle(() => ({
    opacity: feedbackOpacity.value,
    pointerEvents: feedbackOpacity.value > 0.5 ? 'auto' : 'none',
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const exerciseLabels = {
    'listen-choose': { icon: 'headphones', label: 'LISTEN & CHOOSE' },
    'write': { icon: 'keyboard', label: 'TRANSLATE' },
    'spelling': { icon: 'spell-check', label: 'SPELL IT' },
    'fill-blank': { icon: 'language', label: 'TRANSLATE' },
    'match-pairs': { icon: 'random', label: 'MATCH PAIRS' },
    'listen-english': { icon: 'language', label: 'LISTEN ENGLISH' },
  };
  
  const exerciseInfo = exerciseLabels[exerciseType] || { icon: 'question', label: 'EXERCISE' };
  
  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.motivationTextSmall, { color: darkModeEnabled ? '#888' : '#666' }]}>
        {getMotivationalMessage()}
      </Text>

      <View style={styles.badgeContainer}>
        <Animated.View 
          entering={ZoomIn.duration(400)}
          style={[styles.exerciseTypeBadge, { backgroundColor: accentColor }]}
        >
          <FontAwesome5 name={exerciseInfo.icon} size={12} color="#FFF" />
          <Text style={styles.exerciseTypeText}>{exerciseInfo.label}</Text>
        </Animated.View>
        
        {isConfirmation && (
          <Animated.View entering={ZoomIn.delay(100)} style={[styles.retryBadge, { backgroundColor: '#8B5CF6' }]}>
            <FontAwesome name="check-circle" size={10} color="#FFF" />
            <Text style={styles.retryBadgeText}>CONFIRMATION</Text>
          </Animated.View>
        )}

        {isRetry && !isConfirmation && (
          <Animated.View entering={ZoomIn.delay(100)} style={styles.retryBadge}>
            <FontAwesome name="refresh" size={10} color="#FFF" />
            <Text style={styles.retryBadgeText}>RETRY</Text>
          </Animated.View>
        )}
      </View>
      
      <Animated.View 
        layout={Layout.springify().damping(15)}
        style={{ flex: 1 }}
      >
        <Animated.View 
          style={[
            styles.card,
            { backgroundColor: cardBg },
            cardAnimatedStyle
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.wordInfo}>
              <Text style={[styles.wordLabel, { color: darkModeEnabled ? '#888' : '#666' }]}>
                PRACTICE MODE
              </Text>
            </View>
            <MasteryBadge level={masteryLevel} />
          </View>
          
          <View style={[styles.divider, { backgroundColor: accentColor, opacity: 0.3 }]} />
          
          <Animated.View 
            key={exerciseType + '-' + (word?.id || 'new')}
            entering={FadeIn.duration(400)}
            style={styles.exerciseContent}
          >
            {children}
          </Animated.View>

          {showFeedback && (
            <Animated.View style={[
              styles.feedbackOverlay,
              {
                backgroundColor: isCorrect 
                  ? 'rgba(74, 222, 128, 0.98)' 
                  : 'rgba(239, 68, 68, 0.98)',
              },
              feedbackAnimatedStyle
            ]}>
              {isCorrect && (
                <LottieView
                  ref={confettiRef}
                  source={require('../../../../../../../assets/congrats.json')}
                  loop={false}
                  style={styles.confetti}
                />
              )}

              <Animated.View 
                 entering={SlideInUp.springify().damping(12)}
                 style={styles.feedbackContent}
              >
                <View style={styles.feedbackIconCircle}>
                  <FontAwesome5 
                      name={isCorrect ? "check" : "times"} 
                      size={40} 
                      color="#FFF" 
                  />
                </View>
                <Text style={styles.feedbackTitle}>{isCorrect ? 'EXCELLENT!' : 'KEEP GOING!'}</Text>
                {!isCorrect && (
                  <View style={styles.answerReveal}>
                    <Text style={styles.revealLabel}>CORRECT ANSWER:</Text>
                    <Text style={styles.revealText}>{word?.spanish}</Text>
                  </View>
                )}
                
                <View style={styles.autoProgressContainer}>
                  <Animated.View 
                    style={[styles.autoProgressBar, progressStyle]} 
                  />
                </View>
                <Text style={styles.autoProgressText}>Next exercise in 1.5s</Text>
              </Animated.View>
            </Animated.View>
          )}
        </Animated.View>
      </Animated.View>
      
      <View style={styles.bottomDecoration}>
        <View style={[styles.decorLine, { backgroundColor: accentColor }]} />
        <View style={styles.decorDots}>
          <View style={[styles.dot, { backgroundColor: '#FF6B6B' }]} />
          <View style={[styles.dot, { backgroundColor: '#FFD93D' }]} />
          <View style={[styles.dot, { backgroundColor: '#4ADE80' }]} />
        </View>
        <View style={[styles.decorLine, { backgroundColor: accentColor }]} />
      </View>
    </View>
  );
};

export const AnswerButton = ({
  text,
  onPress,
  isSelected,
  isCorrect,
  isDisabled,
  colorPair,
  darkModeEnabled,
}) => {
  const scale = useSharedValue(1);
  
  const handlePress = () => {
    scale.value = withSequence(withTiming(0.95, { duration: 50 }), withSpring(1));
    onPress();
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  let bgColor = darkModeEnabled ? '#2a2a4e' : '#FFF';
  let borderColor = darkModeEnabled ? '#3a3a6e' : '#E0E0E0';
  let textColor = darkModeEnabled ? '#FFF' : '#333';
  
  if (isSelected) {
    if (isCorrect === true) {
      bgColor = '#4ADE80';
      borderColor = '#22C55E';
      textColor = '#FFF';
    } else if (isCorrect === false) {
      bgColor = '#EF4444';
      borderColor = '#DC2626';
      textColor = '#FFF';
    } else {
      bgColor = colorPair?.background || '#4A90D9';
      borderColor = colorPair?.background || '#4A90D9';
      textColor = '#FFF';
    }
  }
  
  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.answerButton,
          { backgroundColor: bgColor, borderColor },
          isDisabled && styles.answerButtonDisabled,
        ]}
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.8}
      >
        <Text style={[styles.answerButtonText, { color: textColor }]} numberOfLines={2}>
          {text}
        </Text>
        
        {isSelected && isCorrect === true && (
          <FontAwesome name="check" size={18} color="#FFF" style={styles.answerIcon} />
        )}
        {isSelected && isCorrect === false && (
          <FontAwesome name="times" size={18} color="#FFF" style={styles.answerIcon} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const SpeakButton = ({ onPress, colorPair, size = 'normal' }) => {
  const scale = useSharedValue(1);
  const soundAnimRef = useRef(null);
  
  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.9, { duration: 100 }), 
      withSpring(1, { damping: 5, stiffness: 100 })
    );
    if (soundAnimRef.current) soundAnimRef.current.play(0);
    onPress();
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isLarge = size === 'large';
  const buttonSize = isLarge ? 110 : 75;
  const iconSize = isLarge ? 90 : 55;
  
  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.speakButton,
          { 
            width: buttonSize, 
            height: buttonSize,
            backgroundColor: colorPair?.background || '#4A90D9',
          }
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <LottieView
          ref={soundAnimRef}
          source={require('../../../../../../../assets/sound.json')}
          loop={false}
          style={{ width: iconSize, height: iconSize }}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 4,
  },
  motivationTextSmall: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 1,
    opacity: 0.7,
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  exerciseTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  exerciseTypeText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFF',
    letterSpacing: 0.8,
  },
  retryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
  },
  retryBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFF',
  },
  card: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 24,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.06)',
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  wordInfo: {
    flex: 1,
  },
  wordLabel: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1.5,
  },
  divider: {
    height: 2,
    borderRadius: 1,
    marginBottom: 16,
  },
  exerciseContent: {
    flex: 1,
    justifyContent: 'center',
  },
  feedbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderRadius: 22, // Match card borderRadius - offset
  },
  feedbackContent: {
    alignItems: 'center',
    width: '90%',
    gap: 16,
    padding: 24,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  feedbackIconCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(255,255,255,0.25)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: 'rgba(255,255,255,0.4)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
  },
  feedbackTitle: {
    fontSize: 36,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFF',
    letterSpacing: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  answerReveal: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      padding: 18,
      borderRadius: 20,
      width: '100%',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.2)',
  },
  revealLabel: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 11,
      fontWeight: '800',
      marginBottom: 6,
      letterSpacing: 1,
  },
  revealText: {
      color: '#FFF',
      fontSize: 28,
      fontWeight: '900',
      letterSpacing: 0.5,
  },
  autoProgressContainer: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  autoProgressBar: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 5,
  },
  autoProgressText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 10,
    letterSpacing: 1,
    fontWeight: '900',
  },
  confetti: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  bottomDecoration: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 14,
  },
  decorLine: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    opacity: 0.15,
  },
  decorDots: {
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  answerButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginVertical: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  answerButtonDisabled: {
    opacity: 0.35,
  },
  answerButtonText: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'center',
    flex: 1,
  },
  answerIcon: {
    marginLeft: 10,
  },
  speakButton: {
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 12,
  },
});

export default ExerciseCard;

