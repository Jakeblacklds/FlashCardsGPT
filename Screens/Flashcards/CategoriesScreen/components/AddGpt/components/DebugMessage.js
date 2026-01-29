import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import styles from '../AddGpt.styles';

export const DebugMessage = ({ message, darkModeEnabled }) => {
  if (!message) return null;

  return (
    <View style={styles.debugContainer}>
      <BlurView
        style={StyleSheet.absoluteFill}
        tint={darkModeEnabled ? 'dark' : 'light'}
        intensity={90}
      />
      <Text style={[
        styles.debugText,
        darkModeEnabled ? { color: '#CBD5E1' } : { color: '#475569' }
      ]}>
        {message}
      </Text>
    </View>
  );
};