import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { getMasteryInfo } from '../../utils/spacedRepetition';

const { width, height } = Dimensions.get('window');

/**
 * LevelUpAnimation - Animación de subida de nivel estilo Pokemon
 */
const LevelUpAnimation = ({
  visible,
  previousLevel,
  newLevel,
  wordText,
  onComplete,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const starburstRef = useRef(null);

  const previousInfo = getMasteryInfo(previousLevel);
  const newInfo = getMasteryInfo(newLevel);

  useEffect(() => {
    if (visible) {
      // Reset
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      glowAnim.setValue(0);
      textAnim.setValue(0);

      // Secuencia de animación
      Animated.sequence([
        // Aparición con escala
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        // Glow pulsante
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.5,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 2 }
        ),
        // Texto de nivel
        Animated.spring(textAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        // Esperar y cerrar
        Animated.delay(1000),
      ]).start(() => {
        if (onComplete) onComplete();
      });

      // Reproducir animación Lottie
      if (starburstRef.current) {
        setTimeout(() => starburstRef.current?.play(), 200);
      }
    }
  }, [visible, scaleAnim, rotateAnim, glowAnim, textAnim, onComplete]);

  if (!visible) return null;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.overlay}>
      {/* Fondo oscuro */}
      <View style={styles.backdrop} />

      {/* Contenedor principal */}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Starburst animation */}
        <LottieView
          ref={starburstRef}
          source={require('../../../../../../../assets/congrats.json')}
          loop={false}
          style={styles.starburst}
        />

        {/* Badge de nivel */}
        <Animated.View
          style={[
            styles.levelBadge,
            {
              backgroundColor: newInfo.color,
              transform: [
                { scale: Animated.add(1, Animated.multiply(glowAnim, 0.1)) },
              ],
            },
          ]}
        >
          <View style={styles.levelInner}>
            <FontAwesome5 name="arrow-up" size={24} color="#FFD700" />
            <Text style={styles.levelUpText}>LEVEL UP!</Text>
          </View>
        </Animated.View>

        {/* Palabra que subió de nivel */}
        <Animated.View
          style={[
            styles.wordContainer,
            {
              opacity: textAnim,
              transform: [
                {
                  translateY: textAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.wordLabel}>WORD MASTERED</Text>
          <Text style={styles.wordText}>{wordText}</Text>
        </Animated.View>

        {/* Cambio de nivel */}
        <Animated.View
          style={[
            styles.levelChange,
            {
              opacity: textAnim,
            },
          ]}
        >
          <View style={[styles.oldLevel, { backgroundColor: previousInfo.color }]}>
            <Text style={styles.levelText}>{previousInfo.pokemonLevel}</Text>
          </View>
          <FontAwesome5 name="arrow-right" size={20} color="#FFF" />
          <View style={[styles.newLevel, { backgroundColor: newInfo.color }]}>
            <Text style={styles.levelText}>{newInfo.pokemonLevel}</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  container: {
    alignItems: 'center',
    padding: 40,
  },
  starburst: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
  },
  levelBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFD700',
    marginBottom: 24,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  levelInner: {
    alignItems: 'center',
  },
  levelUpText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFF',
    marginTop: 4,
    letterSpacing: 1,
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  wordLabel: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#888',
    letterSpacing: 2,
    marginBottom: 8,
  },
  wordText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFF',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  levelChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  oldLevel: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    opacity: 0.6,
  },
  newLevel: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFF',
  },
});

export default LevelUpAnimation;
