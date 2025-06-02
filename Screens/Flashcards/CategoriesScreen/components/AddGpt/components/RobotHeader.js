import React from 'react';
import { View, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import robotflash from '../../../../../../assets/robotflash.png';
import styles from '../AddGpt.styles';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

export const RobotHeader = ({ robotStyle, robotGlowStyle, titleStyle, darkModeEnabled }) => (
  <>
    <Animated.View style={[styles.robotContainer, robotStyle]}>
      <View style={styles.robotContainer}>
        <View style={[styles.robotImageWrapper, darkModeEnabled && styles.robotImageWrapperDark]}>
          <Animated.View style={[styles.robotGlowEffect, robotGlowStyle]} />
          <Animated.Image
            source={robotflash}
            style={[
              styles.robotFlashImage,
              isSmallDevice && styles.robotFlashImageSmall,
              darkModeEnabled && styles.robotFlashImageDark,
              robotStyle
            ]}
          />
        </View>
      </View>
    </Animated.View>

    <Animated.Text style={[
      styles.additionalText,
      darkModeEnabled && styles.textDark,
      titleStyle,
      isSmallDevice && styles.additionalTextSmall
    ]}>
      AI Flashcard Generator
    </Animated.Text>

    <Text style={[
      styles.subText,
      darkModeEnabled && styles.textDark,
      isSmallDevice && styles.subTextSmall
    ]}>
      Let AI create your flashcards in seconds!
    </Text>
  </>
);