import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getMasteryInfo } from '../VocabExercises/utils/spacedRepetition';

/**
 * CategoryProgressBar - Barra de progreso de dominio de la categoría
 * Muestra el estado general de aprendizaje de todas las palabras
 */
const CategoryProgressBar = ({ 
  categoryStats, 
  colorPair, 
  darkModeEnabled,
  compact = false,
}) => {
  if (!categoryStats || categoryStats.total === 0) return null;
  
  const { newCount, learningCount, masteredCount, total, progressPercent } = categoryStats;
  
  // Calcular anchos proporcionales
  const segments = useMemo(() => {
    return [
      { count: masteredCount, color: '#4ADE80', label: 'Mastered' },
      { count: learningCount, color: '#3B82F6', label: 'Learning' },
      { count: newCount, color: '#9CA3AF', label: 'New' },
    ].filter(s => s.count > 0);
  }, [masteredCount, learningCount, newCount]);
  
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={[styles.compactBar, { backgroundColor: darkModeEnabled ? '#333' : '#E8E8E8' }]}>
          {segments.map((segment, index) => (
            <View
              key={segment.label}
              style={[
                styles.compactSegment,
                { 
                  backgroundColor: segment.color,
                  width: `${(segment.count / total) * 100}%`,
                  borderTopLeftRadius: index === 0 ? 4 : 0,
                  borderBottomLeftRadius: index === 0 ? 4 : 0,
                  borderTopRightRadius: index === segments.length - 1 ? 4 : 0,
                  borderBottomRightRadius: index === segments.length - 1 ? 4 : 0,
                }
              ]}
            />
          ))}
        </View>
        <Text style={[styles.compactText, { color: darkModeEnabled ? '#AAA' : '#666' }]}>
          {progressPercent}% mastered
        </Text>
      </View>
    );
  }
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor: darkModeEnabled ? '#1E2028' : '#FFFFFF' }
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <FontAwesome5 name="chart-bar" size={14} color={colorPair?.background || '#4A90D9'} />
          <Text style={[styles.title, { color: darkModeEnabled ? '#FFF' : '#1a1a2e' }]}>
            STUDY PROGRESS
          </Text>
        </View>
        <View style={[styles.percentBadge, { backgroundColor: colorPair?.background || '#4A90D9' }]}>
          <Text style={styles.percentText}>{progressPercent}%</Text>
        </View>
      </View>
      
      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: darkModeEnabled ? '#333' : '#E8E8E8' }]}>
        {segments.map((segment, index) => (
          <View
            key={segment.label}
            style={[
              styles.progressSegment,
              { 
                backgroundColor: segment.color,
                width: `${(segment.count / total) * 100}%`,
                borderTopLeftRadius: index === 0 ? 6 : 0,
                borderBottomLeftRadius: index === 0 ? 6 : 0,
                borderTopRightRadius: index === segments.length - 1 ? 6 : 0,
                borderBottomRightRadius: index === segments.length - 1 ? 6 : 0,
              }
            ]}
          />
        ))}
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4ADE80' }]} />
          <Text style={[styles.legendLabel, { color: darkModeEnabled ? '#AAA' : '#666' }]}>
            Mastered
          </Text>
          <Text style={[styles.legendCount, { color: darkModeEnabled ? '#FFF' : '#333' }]}>
            {masteredCount}
          </Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={[styles.legendLabel, { color: darkModeEnabled ? '#AAA' : '#666' }]}>
            Learning
          </Text>
          <Text style={[styles.legendCount, { color: darkModeEnabled ? '#FFF' : '#333' }]}>
            {learningCount}
          </Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#9CA3AF' }]} />
          <Text style={[styles.legendLabel, { color: darkModeEnabled ? '#AAA' : '#666' }]}>
            New
          </Text>
          <Text style={[styles.legendCount, { color: darkModeEnabled ? '#FFF' : '#333' }]}>
            {newCount}
          </Text>
        </View>
      </View>
    </View>
  );
};

/**
 * MasteryIndicator - Indicador pequeño de nivel para cada flashcard
 */
export const MasteryIndicator = ({ level, size = 'normal' }) => {
  const info = getMasteryInfo(level);
  const isSmall = size === 'small';
  
  return (
    <View style={[
      styles.masteryIndicator,
      { backgroundColor: info.color },
      isSmall && styles.masteryIndicatorSmall,
    ]}>
      <Text style={[
        styles.masteryText,
        isSmall && styles.masteryTextSmall,
      ]}>
        {info.pokemonLevel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
  },
  percentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  percentText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFFFFF',
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressSegment: {
    height: '100%',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  legendCount: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  
  // Compact version
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  compactSegment: {
    height: '100%',
  },
  compactText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  
  // Mastery Indicator
  masteryIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  masteryIndicatorSmall: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  masteryText: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFFFFF',
  },
  masteryTextSmall: {
    fontSize: 8,
  },
});

export default CategoryProgressBar;
