import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { selectGlobalStats, selectCurrentSession } from '../../../../../../../redux/StudyProgressSlice';

const { width } = Dimensions.get('window');

/**
 * GlobalStatsPanel - Panel de estadísticas globales de estudio
 */
const GlobalStatsPanel = ({ colorPair, darkModeEnabled }) => {
  const globalStats = useSelector(selectGlobalStats);
  const currentSession = useSelector(selectCurrentSession);
  
  const bgColor = darkModeEnabled ? '#1E2028' : '#FFFFFF';
  const textColor = darkModeEnabled ? '#FFFFFF' : '#1a1a2e';
  const accentColor = colorPair?.background || '#4A90D9';
  
  // Calcular estadísticas derivadas
  const stats = useMemo(() => ({
    totalWordsLearned: globalStats?.totalWordsLearned || 0,
    totalSessions: globalStats?.totalStudySessions || 0,
    bestStreak: globalStats?.bestStreak || 0,
    todayWords: currentSession?.wordsStudied || 0,
    todayAccuracy: currentSession?.correctAnswers && currentSession?.wordsStudied
      ? Math.round((currentSession.correctAnswers / currentSession.wordsStudied) * 100)
      : 0,
  }), [globalStats, currentSession]);
  
  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <FontAwesome5 name="chart-line" size={18} color={accentColor} />
        <Text style={[styles.title, { color: textColor }]}>YOUR STATS</Text>
      </View>
      
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="graduation-cap"
          iconColor="#4ADE80"
          value={stats.totalWordsLearned}
          label="Words Mastered"
          darkMode={darkModeEnabled}
        />
        
        <StatCard
          icon="book-reader"
          iconColor="#3B82F6"
          value={stats.totalSessions}
          label="Study Sessions"
          darkMode={darkModeEnabled}
        />
        
        <StatCard
          icon="fire"
          iconColor="#F59E0B"
          value={stats.bestStreak}
          label="Best Streak"
          darkMode={darkModeEnabled}
        />
        
        <StatCard
          icon="bullseye"
          iconColor="#8B5CF6"
          value={`${stats.todayAccuracy}%`}
          label="Today's Accuracy"
          darkMode={darkModeEnabled}
        />
      </View>
      
      {/* Motivational message */}
      <View style={[styles.motivationBox, { backgroundColor: `${accentColor}15` }]}>
        <FontAwesome5 name="lightbulb" size={16} color={accentColor} />
        <Text style={[styles.motivationText, { color: accentColor }]}>
          {getMotivationalMessage(stats)}
        </Text>
      </View>
    </View>
  );
};

/**
 * StatCard - Tarjeta individual de estadística
 */
const StatCard = ({ icon, iconColor, value, label, darkMode }) => (
  <View style={[styles.statCard, { backgroundColor: darkMode ? '#2a2a4e' : '#F8F9FA' }]}>
    <View style={[styles.iconCircle, { backgroundColor: `${iconColor}20` }]}>
      <FontAwesome5 name={icon} size={20} color={iconColor} />
    </View>
    <Text style={[styles.statValue, { color: darkMode ? '#FFF' : '#1a1a2e' }]}>
      {value}
    </Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

/**
 * Obtener mensaje motivacional basado en estadísticas
 */
const getMotivationalMessage = (stats) => {
  if (stats.totalWordsLearned === 0) {
    return "Start your learning journey today!";
  }
  if (stats.totalWordsLearned >= 100) {
    return "Amazing! You're a vocabulary master!";
  }
  if (stats.bestStreak >= 10) {
    return "Your focus is incredible! Keep it up!";
  }
  if (stats.totalSessions >= 10) {
    return "Consistency is key! You're doing great!";
  }
  return "Every word learned is progress!";
};

/**
 * StudyStreakWidget - Widget de racha de días estudiando
 */
export const StudyStreakWidget = ({ streak, colorPair, darkModeEnabled }) => {
  const accentColor = colorPair?.background || '#4A90D9';
  
  return (
    <LinearGradient
      colors={[accentColor, `${accentColor}CC`]}
      style={styles.streakWidget}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.streakContent}>
        <FontAwesome5 name="fire-alt" size={28} color="#FFD700" />
        <View style={styles.streakTextContainer}>
          <Text style={styles.streakValue}>{streak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>
      </View>
      
      {/* Week indicators */}
      <View style={styles.weekRow}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
          <View
            key={index}
            style={[
              styles.dayDot,
              index < streak % 7 && styles.dayDotActive,
            ]}
          >
            <Text style={styles.dayText}>{day}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: (width - 80) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#888',
    textAlign: 'center',
  },
  motivationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  motivationText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontStyle: 'italic',
    flex: 1,
  },
  
  // Streak Widget
  streakWidget: {
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  streakTextContainer: {
    flex: 1,
  },
  streakValue: {
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFF',
  },
  streakLabel: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: 'rgba(255,255,255,0.8)',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotActive: {
    backgroundColor: '#FFD700',
  },
  dayText: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFF',
  },
});

export default GlobalStatsPanel;
