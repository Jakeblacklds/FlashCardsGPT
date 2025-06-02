import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import styles from '../AddGpt.styles';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

export const GenerateButton = ({ category, onPress, buttonStyle, darkModeEnabled, onAnimatePress }) => (
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
        colors={['#7209b7', '#b5179e', '#f72585']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.buttonGradient, isSmallDevice && { paddingVertical: 12 }]}
      >
        <FontAwesome5
          name="magic"
          size={isSmallDevice ? 16 : 18}
          color="#fff"
          style={styles.buttonIcon}
        />
        <Text
          style={[
            styles.buttonText,
            isSmallDevice && styles.buttonTextSmall
          ]}
        >
          Generate Flashcards
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  </Animated.View>
);