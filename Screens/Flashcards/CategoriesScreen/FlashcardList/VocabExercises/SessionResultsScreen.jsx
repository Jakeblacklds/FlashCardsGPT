import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Animated } from 'react-native';
import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { getMasteryInfo } from './utils/spacedRepetition';

/**
 * SessionResultsScreen - Pantalla de resultados estilo Pokemon battle end
 */
const SessionResultsScreen = ({
  visible,
  sessionData,
  wordResults,
  colorPair,
  darkModeEnabled,
  onClose,
  onPlayAgain,
}) => {
  const slideAnim = useRef(new Animated.Value(1000)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const celebrationRef = useRef(null);
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Reproducir animación de celebración
      setTimeout(() => {
        if (celebrationRef.current && sessionData.accuracy >= 70) {
          celebrationRef.current.play();
        }
      }, 500);
    } else {
      slideAnim.setValue(1000);
      fadeAnim.setValue(0);
    }
  }, [visible, slideAnim, fadeAnim, sessionData.accuracy]);
  
  if (!visible) return null;
  
  const bgColor = darkModeEnabled ? '#16181D' : '#F5F5F7';
  const cardBg = darkModeEnabled ? '#1E2028' : '#FFFFFF';
  const textColor = darkModeEnabled ? '#FFFFFF' : '#1a1a2e';
  const accentColor = colorPair?.background || '#4A90D9';
  
  // Determinar el mensaje según el rendimiento
  const getResultMessage = () => {
    if (sessionData.accuracy >= 90) return { title: 'EXCELLENT!', subtitle: 'You are a master!', icon: 'trophy' };
    if (sessionData.accuracy >= 70) return { title: 'GREAT JOB!', subtitle: 'Keep it up!', icon: 'star' };
    if (sessionData.accuracy >= 50) return { title: 'GOOD TRY!', subtitle: 'Practice makes perfect', icon: 'thumbs-up' };
    return { title: 'KEEP GOING!', subtitle: 'Every mistake is a lesson', icon: 'heart' };
  };
  
  const resultMessage = getResultMessage();
  
  // Contar palabras que subieron de nivel
  const levelUps = wordResults?.filter(w => w.leveledUp) || [];
  
  return (
    <Animated.View style={[
      styles.container,
      { 
        backgroundColor: bgColor,
        opacity: fadeAnim,
      }
    ]}>
      <Animated.View style={[
        styles.content,
        { transform: [{ translateY: slideAnim }] }
      ]}>
        {/* Header con gradiente */}
        <LinearGradient
          colors={[accentColor, adjustColor(accentColor, -30)]}
          style={styles.header}
        >
          <View style={styles.headerIcon}>
            <FontAwesome5 name={resultMessage.icon} size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>{resultMessage.title}</Text>
          <Text style={styles.headerSubtitle}>{resultMessage.subtitle}</Text>
          
          {/* Animación de celebración */}
          {sessionData.accuracy >= 70 && (
            <LottieView
              ref={celebrationRef}
              source={require('../../../../../assets/congrats.json')}
              loop={false}
              style={styles.celebration}
            />
          )}
        </LinearGradient>
        
        {/* Panel de estadísticas */}
        <View style={[styles.statsPanel, { backgroundColor: cardBg }]}>
          <View style={styles.statRow}>
            <StatBox
              icon="check-circle"
              iconColor="#4ADE80"
              label="CORRECT"
              value={sessionData.correctAnswers}
              darkMode={darkModeEnabled}
            />
            <View style={styles.statDivider} />
            <StatBox
              icon="times-circle"
              iconColor="#EF4444"
              label="WRONG"
              value={sessionData.incorrectAnswers}
              darkMode={darkModeEnabled}
            />
            <View style={styles.statDivider} />
            <StatBox
              icon="percent"
              iconColor={accentColor}
              label="ACCURACY"
              value={`${sessionData.accuracy}%`}
              darkMode={darkModeEnabled}
            />
          </View>
        </View>
        
        {/* Lista de palabras con nivel */}
        <View style={[styles.wordsPanel, { backgroundColor: cardBg }]}>
          <View style={styles.wordsPanelHeader}>
            <FontAwesome5 name="list" size={14} color={accentColor} />
            <Text style={[styles.wordsPanelTitle, { color: textColor }]}>
              WORD PROGRESS
            </Text>
          </View>
          
          <ScrollView style={styles.wordsList} showsVerticalScrollIndicator={false}>
            {wordResults?.map((result, index) => {
              const masteryInfo = getMasteryInfo(result.newLevel);
              return (
                <View key={result.wordId || index} style={styles.wordItem}>
                  <View style={styles.wordTextContainer}>
                    <Text style={[styles.wordEnglish, { color: textColor }]}>
                      {result.english}
                    </Text>
                    <Text style={styles.wordSpanish}>{result.spanish}</Text>
                  </View>
                  
                  <View style={styles.wordResultContainer}>
                    {result.wasCorrect ? (
                      <FontAwesome name="check" size={14} color="#4ADE80" />
                    ) : (
                      <FontAwesome name="times" size={14} color="#EF4444" />
                    )}
                    
                    <View style={[styles.levelBadge, { backgroundColor: masteryInfo.color }]}>
                      <Text style={styles.levelText}>{masteryInfo.pokemonLevel}</Text>
                    </View>
                    
                    {result.leveledUp && (
                      <View style={styles.levelUpBadge}>
                        <FontAwesome5 name="arrow-up" size={10} color="#FFD700" />
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
        
        {/* Level ups summary */}
        {levelUps.length > 0 && (
          <View style={[styles.levelUpPanel, { backgroundColor: '#FFD700' }]}>
            <FontAwesome5 name="level-up-alt" size={16} color="#1a1a2e" />
            <Text style={styles.levelUpText}>
              {levelUps.length} word{levelUps.length > 1 ? 's' : ''} leveled up!
            </Text>
          </View>
        )}
        
        {/* Botones */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary, { borderColor: accentColor }]}
            onPress={onClose}
          >
            <Ionicons name="arrow-back" size={20} color={accentColor} />
            <Text style={[styles.buttonText, { color: accentColor }]}>BACK</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary, { backgroundColor: accentColor }]}
            onPress={onPlayAgain}
          >
            <FontAwesome5 name="redo" size={18} color="#FFF" />
            <Text style={[styles.buttonText, { color: '#FFF' }]}>PLAY AGAIN</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

/**
 * StatBox - Caja de estadística individual
 */
const StatBox = ({ icon, iconColor, label, value, darkMode }) => (
  <View style={styles.statBox}>
    <FontAwesome5 name={icon} size={20} color={iconColor} />
    <Text style={[styles.statValue, { color: darkMode ? '#FFF' : '#1a1a2e' }]}>
      {value}
    </Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

/**
 * Utilidad para ajustar el color
 */
const adjustColor = (hex, amount) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  content: {
    flex: 1,
  },
  
  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  celebration: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  
  // Stats panel
  statsPanel: {
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#888',
    letterSpacing: 1,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  
  // Words panel
  wordsPanel: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  wordsPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  wordsPanelTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
  },
  wordsList: {
    flex: 1,
  },
  wordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  wordTextContainer: {
    flex: 1,
  },
  wordEnglish: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  wordSpanish: {
    fontSize: 12,
    color: '#888',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  wordResultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelText: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFF',
  },
  levelUpBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Level up panel
  levelUpPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  levelUpText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#1a1a2e',
  },
  
  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  buttonPrimary: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonSecondary: {
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
  },
});

export default SessionResultsScreen;
