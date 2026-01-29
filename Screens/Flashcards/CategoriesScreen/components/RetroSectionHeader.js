import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

/**
 * RetrSectionHeader - Encabezado de sección con estilo retro Game Boy
 */
const RetroSectionHeader = ({
    title,
    subtitle,
    icon,
    darkMode = false,
}) => {
    const textColor = darkMode ? '#FFFFFF' : '#1A1A2E';
    const subtitleColor = darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
    const accentColor = darkMode ? '#4ADE80' : '#306230';
    const borderColor = darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';

    return (
        <View style={styles.container}>
            {/* Top border decoration */}
            <View style={styles.topBorder}>
                <View style={[styles.borderSegmentLine, { backgroundColor: borderColor }]} />
                <View style={[styles.borderDot, { backgroundColor: accentColor }]} />
                <View style={[styles.borderSegmentLine, { backgroundColor: borderColor }]} />
            </View>

            {/* Main content */}
            <View style={styles.content}>
                {/* Icon section */}
                {icon && (
                    <View style={[styles.iconContainer, { backgroundColor: accentColor }]}>
                        <FontAwesome5 name={icon} size={14} color="#FFFFFF" />
                    </View>
                )}

                {/* Text section */}
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: textColor }]}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text style={[styles.subtitle, { color: subtitleColor }]}>
                            {subtitle}
                        </Text>
                    )}
                </View>

                {/* Decorative pixels */}
                <View style={styles.pixelDecoration}>
                    <View style={[styles.pixel, { backgroundColor: accentColor }]} />
                    <View style={[styles.pixel, { backgroundColor: accentColor, opacity: 0.6 }]} />
                    <View style={[styles.pixel, { backgroundColor: accentColor, opacity: 0.3 }]} />
                </View>
            </View>

            {/* Bottom border decoration */}
            <View style={styles.bottomBorder}>
                <View style={[styles.borderDot, { backgroundColor: accentColor }]} />
                <View style={[styles.borderSegmentLine, { backgroundColor: borderColor }]} />
                <View style={[styles.borderDot, { backgroundColor: accentColor }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    topBorder: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    borderSegmentLine: {
        flex: 1,
        height: 2,
    },
    borderDot: {
        width: 6,
        height: 6,
        borderRadius: 1,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 10,
        marginTop: 2,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 1,
    },
    pixelDecoration: {
        gap: 3,
    },
    pixel: {
        width: 8,
        height: 2,
        borderRadius: 1,
    },
    bottomBorder: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
});

export default RetroSectionHeader;
