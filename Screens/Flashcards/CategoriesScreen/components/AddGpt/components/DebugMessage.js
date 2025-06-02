import React from 'react';
import { View, Text } from 'react-native';
import styles from '../AddGpt.styles';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const DebugMessage = ({ message, darkModeEnabled }) => {
  if (!message) return null;

  return (
    <View style={[
      styles.debugContainer,
      darkModeEnabled ? { backgroundColor: '#2d2d2d' } : { backgroundColor: 'rgba(255,255,255,0.7)' }
    ]}>
      <Text style={[
        styles.debugText,
        darkModeEnabled ? { color: '#f0f0f0' } : { color: '#333' }
      ]}>
        {message}
      </Text>
    </View>
  );
};