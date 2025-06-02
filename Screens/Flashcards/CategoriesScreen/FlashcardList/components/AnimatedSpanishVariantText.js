// AnimatedSpanishVariantText.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const LETTER_ANIM_DURATION = 200;
const LETTER_STAGGER_DELAY = 35;
const LETTER_OUT_TRANSLATE_X = -10;
const LETTER_IN_TRANSLATE_X_START = 10;

const createLetterState = (char, index, keyPrefix, initialOpacity = 0, initialTranslateX = 0) => ({
  char,
  key: `${keyPrefix}-${index}-${char}-${Math.random()}`,
  // Animaciones con native driver (transform, opacity)
  opacity: new Animated.Value(initialOpacity),
  translateX: new Animated.Value(initialTranslateX),
  // Animaciones SIN native driver (para efectos metálicos)
  shimmerOpacity: new Animated.Value(0),
  glowOpacity: new Animated.Value(0),
  highlightOpacity: new Animated.Value(0),
});

const AnimatedSpanishVariantText = ({
  variants,
  textStyle,
  showVariantIndicator = true,
  containerStyle,
  accessibilityLabelPrefix = "Texto en español",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displaySlot1IsActive, setDisplaySlot1IsActive] = useState(true);
  const [letters1, setLetters1] = useState([]);
  const [letters2, setLetters2] = useState([]);

  const setupLetters = useCallback((text, isActiveSlot) => {
    return text.split('').map((char, index) =>
      createLetterState(
        char,
        index,
        isActiveSlot ? 's1' : 's2',
        isActiveSlot ? 1 : 0,
        isActiveSlot ? 0 : LETTER_IN_TRANSLATE_X_START
      )
    );
  }, []);

  useEffect(() => {
    if (variants && variants.length > 0) {
      setLetters1(setupLetters(variants[0], true));
      setLetters2(setupLetters('', false));
      setCurrentIndex(0);
      setDisplaySlot1IsActive(true);
    }
  }, [variants, setupLetters]);

  const changeVariant = () => {
    if (isAnimating || !variants || variants.length <= 1) return;

    setIsAnimating(true);
    const nextIdx = (currentIndex + 1) % variants.length;
    const nextVariantText = variants[nextIdx];

    const outgoingLetters = displaySlot1IsActive ? letters1 : letters2;
    const setIncomingLettersState = displaySlot1IsActive ? setLetters2 : setLetters1;

    const incomingLettersData = setupLetters(nextVariantText, false);
    setIncomingLettersState(incomingLettersData);

    requestAnimationFrame(() => {
      // Animaciones de salida (SOLO native driver)
      const outgoingAnimations = outgoingLetters.map(letter =>
        Animated.parallel([
          Animated.timing(letter.opacity, {
            toValue: 0,
            duration: LETTER_ANIM_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(letter.translateX, {
            toValue: LETTER_OUT_TRANSLATE_X,
            duration: LETTER_ANIM_DURATION,
            useNativeDriver: true,
          }),
        ])
      );

      // Animaciones de entrada básicas (SOLO native driver)
      const incomingBasicAnimations = incomingLettersData.map(letter =>
        Animated.parallel([
          Animated.timing(letter.opacity, {
            toValue: 1,
            duration: LETTER_ANIM_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(letter.translateX, {
            toValue: 0,
            duration: LETTER_ANIM_DURATION,
            useNativeDriver: true,
          }),
        ])
      );

      // Animaciones del efecto metálico (SIN native driver) - COMPLETAMENTE SEPARADAS
      const metallicAnimations = incomingLettersData.map((letter, index) =>
        Animated.sequence([
          Animated.delay(index * 40 + LETTER_ANIM_DURATION * 0.3), // Empezar después de que la letra aparezca
          // Primera onda de brillo
          Animated.parallel([
            Animated.timing(letter.shimmerOpacity, {
              toValue: 0.9,
              duration: LETTER_ANIM_DURATION * 0.4,
              useNativeDriver: false,
            }),
            Animated.timing(letter.glowOpacity, {
              toValue: .1,
              duration: LETTER_ANIM_DURATION * 0.3,
              useNativeDriver: false,
            }),
          ]),
          // Highlight máximo
          Animated.timing(letter.highlightOpacity, {
            toValue: 0.9,
            duration: LETTER_ANIM_DURATION * 0.2,
            useNativeDriver: false,
          }),
          // Desvanecimiento
          Animated.parallel([
            Animated.timing(letter.shimmerOpacity, {
              toValue: 0,
              duration: LETTER_ANIM_DURATION * 0.6,
              useNativeDriver: false,
            }),
            Animated.timing(letter.glowOpacity, {
              toValue: 0,
              duration: LETTER_ANIM_DURATION * 0.5,
              useNativeDriver: false,
            }),
            Animated.timing(letter.highlightOpacity, {
              toValue: 0,
              duration: LETTER_ANIM_DURATION * 0.4,
              useNativeDriver: false,
            }),
          ]),
        ])
      );

      // Ejecutar animaciones por grupos separados
      const basicAnimationsGroup = Animated.parallel([
        Animated.stagger(LETTER_STAGGER_DELAY, outgoingAnimations),
        Animated.stagger(LETTER_STAGGER_DELAY, incomingBasicAnimations),
      ]);

      const metallicAnimationsGroup = Animated.parallel(metallicAnimations);

      // Ejecutar ambos grupos en paralelo pero manteniendo separación
      Animated.parallel([
        basicAnimationsGroup,
        metallicAnimationsGroup,
      ]).start(() => {
        if (displaySlot1IsActive) {
          setLetters1(setupLetters('', false));
        } else {
          setLetters2(setupLetters('', false));
        }
        setCurrentIndex(nextIdx);
        setDisplaySlot1IsActive(!displaySlot1IsActive);
        setIsAnimating(false);
      });
    });
  };

  const currentActiveTextForAccessibility = displaySlot1IsActive
    ? letters1.map(l => l.char).join('')
    : letters2.map(l => l.char).join('');

  const hasMultipleVariants = variants && variants.length > 1;

  const renderLetter = (letter) => (
    <View key={letter.key} style={localStyles.letterContainer}>
      {/* Texto base */}
      <Animated.Text
        style={[
          textStyle,
          localStyles.letterText,
          {
            opacity: letter.opacity,
            transform: [{ translateX: letter.translateX }],
          },
        ]}
      >
        {letter.char}
      </Animated.Text>

      {/* Capa de brillo metálico 1 - Shimmer */}
      <Animated.Text
        style={[
          textStyle,
          localStyles.letterText,
          localStyles.shimmerText,
          {
            opacity: letter.shimmerOpacity,
          },
        ]}
        pointerEvents="none"
      >
        {letter.char}
      </Animated.Text>

      {/* Capa de brillo metálico 2 - Glow */}
      <Animated.Text
        style={[
          textStyle,
          localStyles.letterText,
          localStyles.glowText,
          {
            opacity: letter.glowOpacity,
          },
        ]}
        pointerEvents="none"
      >
        {letter.char}
      </Animated.Text>

      {/* Capa de brillo metálico 3 - Highlight */}
      <Animated.Text
        style={[
          textStyle,
          localStyles.letterText,
          localStyles.highlightText,
          {
            opacity: letter.highlightOpacity,
          },
        ]}
        pointerEvents="none"
      >
        {letter.char}
      </Animated.Text>
    </View>
  );

  return (
    <TouchableOpacity
      onPress={changeVariant}
      disabled={isAnimating || !hasMultipleVariants}
      style={containerStyle}
      activeOpacity={hasMultipleVariants ? 0.7 : 1}
      accessibilityLabel={`${accessibilityLabelPrefix}: ${currentActiveTextForAccessibility}. ${hasMultipleVariants ? `Variante ${currentIndex + 1} de ${variants.length}. Toca para cambiar.` : ''}`}
      accessibilityRole={hasMultipleVariants ? "button" : "text"}
    >
      <View style={localStyles.textWrapper}>
        <View style={localStyles.lettersContainer}>
          {letters1.map(renderLetter)}
        </View>

        <View style={[localStyles.lettersContainer, localStyles.overlayLettersContainer]}>
          {letters2.map(renderLetter)}
        </View>
      </View>

      {showVariantIndicator && hasMultipleVariants && (
        <Text
          style={[
            localStyles.variantIndicator,
            { color: textStyle?.color || '#000000', opacity: 0.6 },
          ]}
          accessible={false}
        >
          {currentIndex + 1}/{variants.length}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const localStyles = StyleSheet.create({
  textWrapper: {
    position: 'relative',
    minHeight: 48,
  },
  lettersContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  overlayLettersContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  letterContainer: {
    position: 'relative',
  },
  letterText: {
    backgroundColor: 'transparent',
  },
  // Capas de efecto metálico aplicadas directamente al texto
  shimmerText: {
    position: 'absolute',
    top: 0,
    left: 0,
    color: '#D0D0D0', // Gris claro para el primer brillo
  },
  glowText: {
    position: 'absolute',
    top: 0,
    left: 0,
    color: '#F0F0F0', // Casi blanco para el resplandor
  },
  highlightText: {
    position: 'absolute',
    top: 0,
    left: 0,
    color: '#FFFFFF', // Blanco puro para el highlight máximo
  },
  variantIndicator: {
    fontSize: 10,
    textAlign: 'right',
    fontFamily: 'WorsSansRegular',
  },
});

export default AnimatedSpanishVariantText;