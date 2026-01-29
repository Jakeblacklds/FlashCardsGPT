import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { Ionicons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { getMasteryInfo } from '../../utils/spacedRepetition';

// Mapeo de tipos de ejercicio a iconos
const EXERCISE_ICONS = {
  'listen-choose': { icon: 'headphones', label: 'LISTEN' },
  'fill-blank': { icon: 'language', label: 'TRANSLATE' },
  'spelling': { icon: 'spell-check', label: 'SPELL' },
  'write': { icon: 'pen', label: 'WRITE' },
  'match-pairs': { icon: 'random', label: 'MATCH' },
};

/**
 * AnimatedStreakStat - Stat de racha con fuego animado
 */
const AnimatedStreakStat = ({ streak }) => {
    const scale = useSharedValue(1);
    const flicker = useSharedValue(1);
    const isOnFire = streak >= 3;

    useEffect(() => {
        if (isOnFire) {
            // Animación de pulso cuando hay streak >= 3
            scale.value = withRepeat(
                withSequence(
                    withSpring(1.1, { damping: 8 }),
                    withSpring(1, { damping: 8 })
                ),
                -1,
                true
            );
            // Flicker de fuego
            flicker.value = withRepeat(
                withSequence(
                    withTiming(0.7, { duration: 100 }),
                    withTiming(1, { duration: 100 })
                ),
                -1,
                true
            );
        } else {
            scale.value = withSpring(1);
            flicker.value = 1;
        }
    }, [isOnFire, streak]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const fireStyle = useAnimatedStyle(() => ({
        opacity: flicker.value,
    }));

    const getStreakLabel = () => {
        if (streak >= 20) return '🔥⚡🔥';
        if (streak >= 10) return '🔥🔥🔥';
        if (streak >= 5) return '🔥🔥';
        if (streak >= 3) return '🔥';
        return '';
    };

    return (
        <Animated.View style={[styles.statBox, containerStyle]}>
            <View style={[styles.statIconContainer, isOnFire && styles.statIconOnFire]}>
                <Animated.Text style={[{ fontSize: 14 }, fireStyle]}>
                    {isOnFire ? '🔥' : ''}
                </Animated.Text>
                {!isOnFire && <FontAwesome name="fire" size={14} color="#888" />}
            </View>
            <Text style={styles.statLabel}>
                STREAK{isOnFire ? '!' : ''}
            </Text>
            <View style={styles.streakRow}>
                <Text style={[
                    styles.statValue, 
                    { color: isOnFire ? '#F97316' : 'rgba(255,255,255,0.5)' }
                ]}>
                    {streak}
                </Text>
                {streak >= 5 && (
                    <Text style={styles.streakEmoji}>{getStreakLabel()}</Text>
                )}
            </View>
        </Animated.View>
    );
};

/**
 * SessionHeader - Header estilo Pokemon con estadísticas de sesión
 */
const SessionHeader = ({
  categoryName,
  colorPair,
  darkModeEnabled,
  currentIndex,
  totalWords,
  correctCount,
  currentStreak,
  onBack,
  isRetry,
  exerciseType,
  xpEarned = 0,
}) => {
  const insets = useSafeAreaInsets();
  const bgColor = darkModeEnabled ? '#1a1a2e' : colorPair?.background || '#4A90D9';
  const textColor = '#FFFFFF';
  const exerciseInfo = EXERCISE_ICONS[exerciseType] || EXERCISE_ICONS['listen-choose'];
  
  return (
    <View style={[styles.container, { backgroundColor: bgColor, paddingTop: insets.top + 10 }]}>
      {/* Barra superior con botón back y nombre */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={[styles.categoryName, { color: textColor }]} numberOfLines={1}>
            {categoryName?.toUpperCase() || 'TRAINING'}
          </Text>
          {/* Indicador de tipo de ejercicio */}
          <View style={styles.exerciseTypeContainer}>
            <FontAwesome5 name={exerciseInfo.icon} size={10} color="rgba(255,255,255,0.7)" />
            <Text style={styles.exerciseTypeText}>{exerciseInfo.label}</Text>
            {isRetry && (
              <View style={styles.retryBadge}>
                <FontAwesome name="refresh" size={8} color="#FFF" />
                <Text style={styles.retryText}>RETRY</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* XP Badge si hay XP ganado */}
        {xpEarned > 0 ? (
          <View style={styles.xpBadge}>
            <FontAwesome name="star" size={10} color="#FFF" />
            <Text style={styles.xpText}>+{xpEarned}</Text>
          </View>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      
      {/* Panel de estadísticas simplificado */}
      <View style={styles.statsPanel}>
        {/* Palabras dominadas */}
        <View style={styles.statBox}>
          <View style={styles.statIconContainer}>
            <FontAwesome name="check" size={14} color="#4ADE80" />
          </View>
          <Text style={styles.statLabel}>MASTERED</Text>
          <Text style={[styles.statValue, { color: '#4ADE80' }]}>{correctCount}/{totalWords}</Text>
        </View>
        
        {/* Separador */}
        <View style={styles.separator} />
        
        {/* Racha - Con animación */}
        <AnimatedStreakStat streak={currentStreak} />
      </View>
      
      {/* Barra de progreso - solo avanza con aciertos */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <Animated.View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${totalWords > 0 ? (correctCount / totalWords) * 100 : 0}%`,
                backgroundColor: currentStreak >= 3 ? '#F97316' : '#4ADE80',
              }
            ]} 
          />
        </View>
        <View style={styles.progressBarSegments}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={i} style={styles.progressSegment} />
          ))}
        </View>
      </View>
    </View>
  );
};

/**
 * MasteryBadge - Badge de nivel de dominio estilo Pokemon
 */
export const MasteryBadge = ({ level, size = 'normal' }) => {
  const info = getMasteryInfo(level);
  const isSmall = size === 'small';
  
  return (
    <View style={[
      styles.masteryBadge,
      { backgroundColor: info.color },
      isSmall && styles.masteryBadgeSmall,
    ]}>
      <Text style={[
        styles.masteryLevel,
        isSmall && styles.masteryLevelSmall,
      ]}>
        {info.pokemonLevel}
      </Text>
    </View>
  );
};

/**
 * WordInfoPanel - Panel de información de la palabra actual estilo Pokemon
 */
export const WordInfoPanel = ({ word, masteryInfo, darkModeEnabled }) => {
  return (
    <View style={[
      styles.wordPanel,
      { backgroundColor: darkModeEnabled ? '#2a2a4e' : '#FFF' }
    ]}>
      <View style={styles.wordPanelHeader}>
        <Text style={[
          styles.wordPanelTitle,
          { color: darkModeEnabled ? '#FFF' : '#333' }
        ]}>
          TARGET WORD
        </Text>
        <MasteryBadge level={masteryInfo?.masteryLevel || 0} size="small" />
      </View>
      
      <View style={styles.wordPanelDivider} />
      
      <View style={styles.wordContent}>
        <FontAwesome name="volume-up" size={16} color={masteryInfo?.color || '#666'} />
        <Text style={[
          styles.currentWord,
          { color: darkModeEnabled ? '#FFF' : '#1a1a2e' }
        ]}>
          {word?.english || '---'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    paddingBottom: 8,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    borderBottomWidth: 3,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  
  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1.5,
  },
  exerciseTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  exerciseTypeText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  retryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  retryText: {
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFF',
  },
  placeholder: {
    width: 40,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  xpText: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFF',
  },
  
  // Stats panel
  statsPanel: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 6,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statIconOnFire: {
    backgroundColor: 'rgba(249, 115, 22, 0.3)',
    borderWidth: 1,
    borderColor: '#F97316',
  },
  statLabel: {
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFFFFF',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakEmoji: {
    fontSize: 10,
  },
  separator: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 8,
  },
  
  // Progress bar
  progressBarContainer: {
    height: 16,
    position: 'relative',
  },
  progressBarBg: {
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarSegments: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  progressSegment: {
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  
  // Mastery Badge
  masteryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  masteryBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  masteryLevel: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  masteryLevelSmall: {
    fontSize: 10,
  },
  
  // Word Panel
  wordPanel: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  wordPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  wordPanelTitle: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 2,
    opacity: 0.6,
  },
  wordPanelDivider: {
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginBottom: 12,
    borderRadius: 1,
  },
  wordContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currentWord: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

export default SessionHeader;
