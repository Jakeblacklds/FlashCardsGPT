import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Platform, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

/**
 * ModeSelector - Selector de modo de estudio estilo Pokemon menu
 */
const ModeSelector = ({
  visible,
  onSelectMode,
  onCancel,
  modeCounts,
  colorPair,
  darkModeEnabled,
}) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Iniciar animación de entrada inmediatamente al montar
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const bgColor = darkModeEnabled ? '#1a1a2e' : '#FFF';
  const textColor = darkModeEnabled ? '#FFF' : '#1a1a2e';
  const accentColor = colorPair?.background || '#4A90D9';
  
  const modes = [
    {
      id: 'all',
      name: 'PRACTICE ALL',
      description: 'All words in category',
      icon: 'list',
      color: accentColor,
      count: modeCounts?.all || 0,
    },
    {
      id: 'review',
      name: 'SMART REVIEW',
      description: 'Words needing review',
      icon: 'brain',
      color: '#8B5CF6',
      count: modeCounts?.review || 0,
    },
    {
      id: 'new',
      name: 'NEW WORDS',
      description: 'Never studied before',
      icon: 'star',
      color: '#F59E0B',
      count: modeCounts?.new || 0,
    },
    {
      id: 'difficult',
      name: 'DIFFICULT',
      description: 'Words you struggle with',
      icon: 'exclamation-triangle',
      color: '#EF4444',
      count: modeCounts?.difficult || 0,
    },
  ];
  
  return (
    <View style={styles.overlay}>
      {/* Backdrop visual - solo decorativo, sin interacción */}
      <Animated.View 
        style={[
          StyleSheet.absoluteFill, 
          styles.backdrop, 
          { opacity: fadeAnim }
        ]} 
        pointerEvents="none"
      />
      
      {/* Área táctil del backdrop (solo la parte superior, fuera del contenedor) */}
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.backdropTouchArea} />
      </TouchableWithoutFeedback>
      
      {/* Contenedor principal - captura todos sus eventos */}
      <Animated.View 
        style={[
          styles.container,
          { 
            backgroundColor: bgColor,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: accentColor }]}>
          <FontAwesome5 name="gamepad" size={20} color={accentColor} />
          <Text style={[styles.headerTitle, { color: textColor }]}>
            SELECT MODE
          </Text>
          <TouchableOpacity 
            onPress={onCancel} 
            style={styles.closeButton}
            activeOpacity={0.7}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <FontAwesome name="times" size={20} color={textColor} />
          </TouchableOpacity>
        </View>
        
        {/* Mode Options */}
        <View style={styles.modesContainer}>
          {modes.map((mode, index) => (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.modeButton,
                { borderLeftColor: mode.color },
                mode.count === 0 && styles.modeButtonDisabled,
              ]}
              onPress={() => onSelectMode(mode.id)}
              disabled={mode.count === 0}
              activeOpacity={0.6}
            >
              <View style={[styles.modeIconContainer, { backgroundColor: mode.color }]}>
                <FontAwesome5 
                  name={mode.icon} 
                  size={18} 
                  color="#FFF" 
                />
              </View>
              
              <View style={styles.modeTextContainer}>
                <Text style={[
                  styles.modeName, 
                  { color: mode.count === 0 ? '#999' : textColor }
                ]}>
                  {mode.name}
                </Text>
                <Text style={styles.modeDescription}>
                  {mode.description}
                </Text>
              </View>
              
              <View style={[styles.modeCount, { backgroundColor: mode.color }]}>
                <Text style={styles.modeCountText}>{mode.count}</Text>
              </View>
              
              {/* Selection arrow */}
              <FontAwesome 
                name="chevron-right" 
                size={14} 
                color={mode.count === 0 ? '#999' : mode.color} 
                style={styles.modeArrow}
              />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Footer decorativo */}
        <View style={styles.footer}>
          <View style={[styles.footerDot, { backgroundColor: accentColor }]} />
          <View style={[styles.footerLine, { backgroundColor: accentColor }]} />
          <View style={[styles.footerDot, { backgroundColor: accentColor }]} />
        </View>
      </Animated.View>
    </View>
  );
};


/**
 * WordCountSelector - Selector de cantidad de palabras
 */
export const WordCountSelector = ({
  visible,
  onSelect,
  onCancel,
  maxCount,
  colorPair,
  darkModeEnabled,
}) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Iniciar animación de entrada inmediatamente al montar
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const bgColor = darkModeEnabled ? '#1a1a2e' : '#FFF';
  const textColor = darkModeEnabled ? '#FFF' : '#1a1a2e';
  const accentColor = colorPair?.background || '#4A90D9';
  
  // Opciones de cantidad, limitadas al máximo disponible
  const options = [5, 10, 15, 20].filter(n => n <= maxCount);
  if (maxCount > 0 && !options.includes(maxCount) && maxCount < 20) {
    options.push(maxCount);
    options.sort((a, b) => a - b);
  }
  
  return (
    <View style={styles.overlay}>
      {/* Backdrop visual - solo decorativo, sin interacción */}
      <Animated.View 
        style={[
          StyleSheet.absoluteFill, 
          styles.backdrop, 
          { opacity: fadeAnim }
        ]} 
        pointerEvents="none"
      />
      
      {/* Área táctil del backdrop (solo la parte superior, fuera del contenedor) */}
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.backdropTouchArea} />
      </TouchableWithoutFeedback>
      
      {/* Contenedor principal */}
      <Animated.View 
        style={[
          styles.container,
          { 
            backgroundColor: bgColor,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <View style={[styles.header, { borderBottomColor: accentColor }]}>
          <FontAwesome5 name="hashtag" size={20} color={accentColor} />
          <Text style={[styles.headerTitle, { color: textColor }]}>
            HOW MANY WORDS?
          </Text>
          <TouchableOpacity 
            onPress={onCancel} 
            style={styles.closeButton}
            activeOpacity={0.7}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <FontAwesome name="times" size={20} color={textColor} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.countOptionsContainer}>
          {options.map((count) => (
            <TouchableOpacity
              key={count}
              style={[
                styles.countButton, 
                { borderColor: accentColor },
              ]}
              onPress={() => onSelect(count)}
              activeOpacity={0.6}
            >
              <Text style={[styles.countNumber, { color: accentColor }]}>
                {count}
              </Text>
              <Text style={[styles.countLabel, { color: textColor }]}>
                WORDS
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.countHint}>
          {maxCount} words available in this mode
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backdropTouchArea: {
    flex: 1,
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 4,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 3,
    marginBottom: 16,
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 2,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Mode buttons
  modesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    gap: 12,
  },
  modeButtonDisabled: {
    opacity: 0.5,
  },
  modeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  modeTextContainer: {
    flex: 1,
  },
  modeName: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
    marginBottom: 2,
  },
  modeDescription: {
    fontSize: 11,
    color: '#888',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  modeCount: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 36,
    alignItems: 'center',
  },
  modeCountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  modeArrow: {
    marginLeft: 4,
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  footerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footerLine: {
    width: 40,
    height: 3,
    borderRadius: 2,
    opacity: 0.5,
  },
  
  // Count selector
  countOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  countButton: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  countNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  countLabel: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
    marginTop: 2,
  },
  countHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
    marginTop: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

export default ModeSelector;
