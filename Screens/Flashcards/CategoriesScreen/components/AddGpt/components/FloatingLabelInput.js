import React, { useRef } from 'react';
import { View, TextInput } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
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

  return (
    <Animated.View style={[
      styles.floatingLabelContainer,
      darkModeEnabled && styles.floatingLabelContainerDark,
      animatedStyle,
      isSmallDevice && styles.inputContainerSmall
    ]}>
      <Animated.Text
        style={[
          styles.floatingLabel,
          darkModeEnabled && styles.floatingLabelDark,
          animatedLabelStyle
        ]}
        pointerEvents="none"
      >
        Enter Category Name
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
        selectionColor={darkModeEnabled ? "#ff8800" : "#7209b7"}
        underlineColorAndroid="transparent"
        autoCorrect={false}
        autoCapitalize="words"
        blurOnSubmit
      />
      {!inputFocused && value === '' && (
        <View style={styles.inputIconContainer}>
          <Ionicons
            name="create-outline"
            size={20}
            color={darkModeEnabled ? '#b5179e' : '#7209b7'}
          />
        </View>
      )}
    </Animated.View>
  );
};