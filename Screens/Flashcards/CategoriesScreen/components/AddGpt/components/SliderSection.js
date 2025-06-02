import React from 'react';
import { View, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import styles from '../AddGpt.styles';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

export const SliderSection = ({ numFlashcards, onValueChange, darkModeEnabled, sliderContainerStyle }) => (
  <Animated.View style={[
    styles.sliderContainerWrapper,
    sliderContainerStyle
  ]}>
    <Text style={[
      styles.sectionTitle,
      darkModeEnabled && styles.textDark,
      isSmallDevice && styles.sectionTitleSmall
    ]}>
      Number of Flashcards
    </Text>
    <View style={[
      styles.sliderContainer,
      darkModeEnabled && styles.sliderContainerDark
    ]}>
      <Text style={[
        styles.sliderText,
        darkModeEnabled && styles.sliderTextDark,
        isSmallDevice && styles.sliderTextSmall
      ]}>
        {numFlashcards}
      </Text>
      <Slider
        style={[
          styles.slider,
          isSmallDevice && styles.sliderSmall
        ]}
        minimumValue={1}
        maximumValue={20}
        step={1}
        value={numFlashcards}
        onValueChange={onValueChange}
        minimumTrackTintColor="#b5179e"
        maximumTrackTintColor={darkModeEnabled ? "#555" : "#DDD"}
        thumbTintColor="#3f37c9"
      />
      <View style={styles.sliderLabels}>
        <Text style={[
          styles.sliderLabelText,
          darkModeEnabled && styles.sliderLabelTextDark
        ]}>1</Text>
        <Text style={[
          styles.sliderLabelText,
          darkModeEnabled && styles.sliderLabelTextDark
        ]}>20</Text>
      </View>
    </View>
  </Animated.View>
);