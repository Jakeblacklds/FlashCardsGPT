import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import styles from '../AddGpt.styles';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

export const FloatingLabelInput = ({
  value,
  onChangeText,
  onFocus,
  onBlur,
  animatedStyle,
  animatedLabelStyle,
  darkModeEnabled,
  inputFocused
}) => {
  const inputRef = useRef(null);

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(value === '' && !inputFocused ? 1 : 0, { duration: 200 }),
      transform: [
        { translateX: withTiming(value === '' && !inputFocused ? 0 : 10, { duration: 200 }) },
        { scale: withTiming(value === '' && !inputFocused ? 1 : 0.8, { duration: 200 }) }
      ]
    };
  });

  return (
    <Animated.View style={[
      styles.floatingLabelContainer,
      animatedStyle,
      isSmallDevice && styles.inputContainerSmall
    ]}>
      <BlurView
        style={StyleSheet.absoluteFill}
        tint={darkModeEnabled ? 'dark' : 'light'}
        intensity={Platform.OS === 'ios' ? 40 : 80}
      />

      <Animated.Text
        style={[styles.floatingLabel, animatedLabelStyle]}
        pointerEvents="none"
      >
        Topic or Category
      </Animated.Text>

      <TextInput
        ref={inputRef}
        style={[
          styles.floatingLabelInput,
          darkModeEnabled && styles.floatingLabelInputDark
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        selectionColor={darkModeEnabled ? "#06B6D4" : "#4F46E5"}
        underlineColorAndroid="transparent"
        autoCorrect={false}
        autoCapitalize="sentences"
        blurOnSubmit
      />

      <Animated.View style={[styles.inputIconContainer, iconAnimatedStyle]} pointerEvents="none">
        <Ionicons
          name="sparkles-outline"
          size={20}
          color={darkModeEnabled ? 'rgba(255,255,255,0.4)' : 'rgba(79, 70, 229, 0.4)'}
        />
      </Animated.View>

    </Animated.View>
  );
};