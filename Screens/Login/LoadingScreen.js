import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

/**
 * LoadingScreen - Pantalla de carga estilo Gameboy/Pokemon
 */
const LoadingScreen = () => {
  const dotAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animación de pulso del icono
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animación de dots
    const animateDots = () => {
      const animations = dotAnims.map((anim, index) => {
        return Animated.sequence([
          Animated.delay(index * 150),
          Animated.loop(
            Animated.sequence([
              Animated.timing(anim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(anim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
            ])
          ),
        ]);
      });
      Animated.parallel(animations).start();
    };

    animateDots();
  }, []);

  return (
    <View style={styles.container}>
      {/* Icono central con pulso */}
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.iconFrame}>
          <FontAwesome5 name="brain" size={50} color="#4ADE80" />
        </View>
      </Animated.View>

      {/* Texto de carga */}
      <Text style={styles.loadingText}>LOADING</Text>

      {/* Dots animados */}
      <View style={styles.dotsContainer}>
        {dotAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                opacity: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
                transform: [{
                  scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                }],
              },
            ]}
          />
        ))}
      </View>

      {/* Mensaje de tip */}
      <Text style={styles.tipText}>Preparing your adventure...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconFrame: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 3,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFF',
    letterSpacing: 4,
    marginBottom: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ADE80',
  },
  tipText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
});

export default LoadingScreen;
