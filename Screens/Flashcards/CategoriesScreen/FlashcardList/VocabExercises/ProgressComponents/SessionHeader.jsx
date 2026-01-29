import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
    FadeIn,
    FadeInRight,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import StreakFlame from '../animations/StreakFlame';
import XPCounter from '../animations/XPCounter';

/**
 * SessionHeader - Header para sesión de ejercicios con streak y XP
 * 
 * Muestra:
 * - Nombre de categoría
 * - Streak actual con flame animado
 * - XP de la sesión con contador animado
 */
const SessionHeader = ({
    categoryName = '',
    streak = 0,
    xp = 0,
    xpGained = 0,
    wordsCompleted = 0,
    wordsTotal = 0,
    accentColor = '#4A90D9',
    darkMode = false,
}) => {
    const bgColor = darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.9)';
    const textColor = darkMode ? '#FFF' : '#333';
    const mutedColor = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';

    const progress = wordsTotal > 0 ? (wordsCompleted / wordsTotal) * 100 : 0;

    return (
        <Animated.View 
            style={[styles.container, { backgroundColor: bgColor }]}
            entering={FadeIn.duration(300)}
        >
            {/* Top row: Category + Streak */}
            <View style={styles.topRow}>
                <View style={styles.categoryContainer}>
                    <Text style={[styles.categoryLabel, { color: mutedColor }]}>
                        EXERCISE MODE
                    </Text>
                    <Text 
                        style={[styles.categoryName, { color: textColor }]}
                        numberOfLines={1}
                    >
                        {categoryName || 'Study Session'}
                    </Text>
                </View>

                {/* Streak Flame */}
                <Animated.View entering={FadeInRight.delay(200).springify()}>
                    <StreakFlame streak={streak} visible={streak >= 3} size="small" />
                </Animated.View>
            </View>

            {/* Bottom row: Progress + XP */}
            <View style={styles.bottomRow}>
                {/* Progress info */}
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: `${accentColor}20` }]}>
                        <Animated.View 
                            style={[
                                styles.progressFill,
                                { 
                                    width: `${progress}%`,
                                    backgroundColor: accentColor,
                                }
                            ]}
                        />
                    </View>
                    <Text style={[styles.progressText, { color: mutedColor }]}>
                        {wordsCompleted}/{wordsTotal}
                    </Text>
                </View>

                {/* XP Counter */}
                <XPCounter 
                    value={xp} 
                    gained={xpGained}
                    color="#F59E0B"
                    size="small"
                />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    categoryContainer: {
        flex: 1,
        marginRight: 16,
    },
    categoryLabel: {
        fontSize: 9,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 1,
        marginBottom: 2,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        marginRight: 16,
    },
    progressBar: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        maxWidth: 120,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 11,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
});

export default SessionHeader;
