import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import styles from '../AddGpt.styles';

export const RobotHeader = ({ titleStyle, darkModeEnabled }) => (
    <View style={styles.robotContainer}>
        <Animated.Text style={[
            styles.additionalText,
            darkModeEnabled && styles.textDark,
            titleStyle,
        ]}>
            Create with AI
        </Animated.Text>

        <Animated.Text style={[
            styles.subText,
            darkModeEnabled && styles.subTextDark,
            titleStyle,
        ]}>
            Describe your topic and let the AI generate flashcards instantly.
        </Animated.Text>
    </View>
);