import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  interpolate,
  interpolateColor,
  Easing
} from 'react-native-reanimated';

const COLORS = {
  light: {
    inactive: 'rgba(0,0,0,0.05)',
    active: '#4F46E5', // Indigo
    textInactive: '#94A3B8',
    textActive: '#4F46E5',
  },
  dark: {
    inactive: 'rgba(255,255,255,0.1)',
    active: '#06B6D4', // Cyan
    textInactive: '#64748B',
    textActive: '#06B6D4',
  }
};

export const useAddGptAnimations = (inputFocused, category, darkModeEnabled) => {
  const focusAnim = useSharedValue(category !== '' || inputFocused ? 1 : 0);

  // Animaciones de Entrada
  const titleOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0);
  const buttonPressScale = useSharedValue(1);

  // 1. Entrada Secuencial
  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.exp) });
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    buttonScale.value = withDelay(400, withSpring(1, { damping: 12, stiffness: 90 }));
  }, []);

  // 2. Foco Input
  useEffect(() => {
    focusAnim.value = withTiming(category !== '' || inputFocused ? 1 : 0, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [inputFocused, category]);

  const animateButton = () => {
    buttonPressScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  };

  // --- Estilos ---
  const animatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnim.value,
      [0, 1],
      [
        darkModeEnabled ? COLORS.dark.inactive : COLORS.light.inactive,
        darkModeEnabled ? COLORS.dark.active : COLORS.light.active
      ]
    );
    const scale = interpolate(focusAnim.value, [0, 1], [1, 1.01]);
    return { borderColor, transform: [{ scale }] };
  });

  const animatedLabelStyle = useAnimatedStyle(() => {
    const translateY = interpolate(focusAnim.value, [0, 1], [0, -28]);
    const translateX = interpolate(focusAnim.value, [0, 1], [0, -2]);
    const fontSize = interpolate(focusAnim.value, [0, 1], [18, 13]);
    const color = interpolateColor(
      focusAnim.value,
      [0, 1],
      [
        darkModeEnabled ? COLORS.dark.textInactive : COLORS.light.textInactive,
        darkModeEnabled ? COLORS.dark.textActive : COLORS.light.textActive
      ]
    );
    return { transform: [{ translateY }, { translateX }], fontSize, color };
  });

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: interpolate(titleOpacity.value, [0, 1], [20, 0]) }]
  }));

  const containerEnterStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: interpolate(contentOpacity.value, [0, 1], [20, 0]) }]
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value * buttonPressScale.value }],
    opacity: buttonScale.value,
  }));

  return {
    animatedStyle,
    animatedLabelStyle,
    titleStyle,
    tagContainerStyle: containerEnterStyle,
    sliderContainerStyle: containerEnterStyle,
    buttonStyle,
    animateButton
  };
};