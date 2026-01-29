import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

/**
 * PixelDivider - Separador estilo pixel art / 8-bit
 */
const PixelDivider = ({
    text,
    darkMode = false,
    variant = 'default', // 'default', 'dots', 'dashed'
}) => {
    const lineColor = darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
    const textColor = darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
    const dotColor = darkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)';

    if (variant === 'dots') {
        return (
            <View style={styles.container}>
                <View style={styles.dotLine}>
                    {[...Array(20)].map((_, i) => (
                        <View
                            key={i}
                            style={[styles.dot, { backgroundColor: dotColor }]}
                        />
                    ))}
                </View>
            </View>
        );
    }

    if (variant === 'dashed') {
        return (
            <View style={styles.container}>
                <View style={styles.dashedLine}>
                    {[...Array(12)].map((_, i) => (
                        <View
                            key={i}
                            style={[styles.dash, { backgroundColor: lineColor }]}
                        />
                    ))}
                </View>
            </View>
        );
    }

    // Default variant with optional text
    return (
        <View style={styles.container}>
            {text ? (
                <View style={styles.textDivider}>
                    <View style={[styles.line, { backgroundColor: lineColor }]} />
                    <View style={styles.textContainer}>
                        <View style={[styles.pixelCornerTL, { backgroundColor: lineColor }]} />
                        <View style={[styles.pixelCornerTR, { backgroundColor: lineColor }]} />
                        <Text style={[styles.text, { color: textColor }]}>
                            {text}
                        </Text>
                        <View style={[styles.pixelCornerBL, { backgroundColor: lineColor }]} />
                        <View style={[styles.pixelCornerBR, { backgroundColor: lineColor }]} />
                    </View>
                    <View style={[styles.line, { backgroundColor: lineColor }]} />
                </View>
            ) : (
                <View style={styles.simpleDivider}>
                    <View style={[styles.fullLine, { backgroundColor: lineColor }]} />
                    <View style={styles.centerDecor}>
                        <View style={[styles.decorSquare, { backgroundColor: dotColor }]} />
                    </View>
                    <View style={[styles.fullLine, { backgroundColor: lineColor }]} />
                </View>
            )}
        </View>
    );
};

/**
 * PixelSection - Contenedor con bordes pixel art
 */
export const PixelSection = ({ children, title, darkMode = false }) => {
    const borderColor = darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
    const bgColor = darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
    const textColor = darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';

    return (
        <View style={styles.sectionContainer}>
            {/* Top border with notches */}
            <View style={styles.sectionTop}>
                <View style={[styles.notch, { backgroundColor: borderColor }]} />
                <View style={[styles.topBorder, { backgroundColor: borderColor }]} />
                <View style={[styles.notch, { backgroundColor: borderColor }]} />
            </View>

            {/* Content area */}
            <View style={[styles.sectionContent, {
                backgroundColor: bgColor,
                borderLeftColor: borderColor,
                borderRightColor: borderColor,
            }]}>
                {title && (
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>
                            {title}
                        </Text>
                    </View>
                )}
                {children}
            </View>

            {/* Bottom border with notches */}
            <View style={styles.sectionBottom}>
                <View style={[styles.notch, { backgroundColor: borderColor }]} />
                <View style={[styles.bottomBorder, { backgroundColor: borderColor }]} />
                <View style={[styles.notch, { backgroundColor: borderColor }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: 12,
    },

    // Default variant
    textDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    line: {
        flex: 1,
        height: 2,
    },
    textContainer: {
        position: 'relative',
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    text: {
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    pixelCornerTL: { position: 'absolute', top: 0, left: 0, width: 3, height: 3 },
    pixelCornerTR: { position: 'absolute', top: 0, right: 0, width: 3, height: 3 },
    pixelCornerBL: { position: 'absolute', bottom: 0, left: 0, width: 3, height: 3 },
    pixelCornerBR: { position: 'absolute', bottom: 0, right: 0, width: 3, height: 3 },

    // Simple variant
    simpleDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    fullLine: {
        flex: 1,
        height: 2,
    },
    centerDecor: {
        width: 6,
        height: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    decorSquare: {
        width: 4,
        height: 4,
        transform: [{ rotate: '45deg' }],
    },

    // Dots variant
    dotLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
    },

    // Dashed variant
    dashedLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    dash: {
        width: 20,
        height: 2,
        borderRadius: 1,
    },

    // Section styles
    sectionContainer: {
        marginVertical: 8,
    },
    sectionTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionBottom: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notch: {
        width: 8,
        height: 2,
    },
    topBorder: {
        flex: 1,
        height: 2,
    },
    bottomBorder: {
        flex: 1,
        height: 2,
    },
    sectionContent: {
        borderLeftWidth: 2,
        borderRightWidth: 2,
        paddingVertical: 8,
    },
    sectionHeader: {
        paddingHorizontal: 12,
        paddingBottom: 8,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});

export default PixelDivider;
