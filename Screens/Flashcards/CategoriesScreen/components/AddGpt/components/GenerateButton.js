import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import styles from '../AddGpt.styles';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const buttonGradientColors = ['#4F46E5', '#06B6D4'];

export const GenerateButton = ({ category, onPress, buttonStyle, onAnimatePress }) => (
  <Animated.View style={[styles.buttonWrapper, buttonStyle]}>
    <TouchableOpacity
      style={[
        styles.button,
        isSmallDevice && styles.buttonSmall,
        !category && styles.buttonDisabled
      ]}
      onPress={() => {
        if (category) {
          onAnimatePress && onAnimatePress();
          onPress();
        }
      }}
      disabled={!category}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={buttonGradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.buttonGradient}
      >
        <Ionicons name="flash" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={[styles.buttonText, isSmallDevice && styles.buttonTextSmall]}>
          GENERATE
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  </Animated.View>
);