import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Animated, Easing } from 'react-native';
import Svg, { Rect, Circle, Line, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

/**
 * PowerLED - LED animado estilo Game Boy
 */
const PowerLED = ({ active = true, color = '#4ADE80' }) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        if (active) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 1200,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1200,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );

            const glow = Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 1,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0.5,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );

            pulse.start();
            glow.start();

            return () => {
                pulse.stop();
                glow.stop();
            };
        }
    }, [active, pulseAnim, glowAnim]);

    return (
        <View style={styles.ledWrapper}>
            <Animated.View
                style={[
                    styles.ledGlow,
                    {
                        backgroundColor: color,
                        opacity: glowAnim,
                        transform: [{ scale: pulseAnim }],
                    }
                ]}
            />
            <View style={[styles.led, { backgroundColor: color }]} />
        </View>
    );
};

/**
 * SpeakerGrille - Decoración estilo rejilla de altavoz
 */
const SpeakerGrille = ({ darkMode }) => {
    const dotColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)';
    const dots = [];

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 6; col++) {
            dots.push(
                <Circle
                    key={`dot-${row}-${col}`}
                    cx={4 + col * 8}
                    cy={4 + row * 8}
                    r={1.5}
                    fill={dotColor}
                />
            );
        }
    }

    return (
        <View style={styles.speakerGrille}>
            <Svg width="50" height="24" viewBox="0 0 50 24">
                {dots}
            </Svg>
        </View>
    );
};

/**
 * GameBoyFrame - Marco estilo Game Boy para envolver contenido
 */
const GameBoyFrame = ({
    children,
    darkMode = false,
    title = "CATEGORY SELECT",
    showPowerLED = true,
}) => {
    const bgColor = darkMode ? '#1A1C1E' : '#E8E8E8';
    const frameColor = darkMode ? '#0D0D0E' : '#BDBDBD';
    const textColor = darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
    const accentColor = darkMode ? '#4ADE80' : '#306230';

    return (
        <View style={[styles.outerFrame, { backgroundColor: frameColor }]}>
            {/* Top bezel */}
            <View style={[styles.topBezel, { backgroundColor: frameColor }]}>
                {/* Left side decorations */}
                <View style={styles.leftDecor}>
                    <SpeakerGrille darkMode={darkMode} />
                </View>

                {/* Center title */}
                <View style={styles.centerTitle}>
                    <View style={styles.titleBox}>
                        <Text style={[styles.titleText, { color: textColor }]}>
                            {title}
                        </Text>
                        <View style={styles.titleUnderline}>
                            <View style={[styles.underlineDot, { backgroundColor: accentColor }]} />
                            <View style={[styles.underlineLine, { backgroundColor: textColor }]} />
                            <View style={[styles.underlineDot, { backgroundColor: accentColor }]} />
                        </View>
                    </View>
                </View>

                {/* Right side - Power LED */}
                <View style={styles.rightDecor}>
                    {showPowerLED && (
                        <View style={styles.powerSection}>
                            <Text style={[styles.powerLabel, { color: textColor }]}>PWR</Text>
                            <PowerLED active={true} color={accentColor} />
                        </View>
                    )}
                </View>
            </View>

            {/* Screen area */}
            <View style={[styles.screenContainer, { backgroundColor: bgColor }]}>
                {/* Screen bezel shadow */}
                <View style={styles.screenBezel}>
                    {/* Decorative screws */}
                    <View style={[styles.screw, styles.screwTL, { backgroundColor: frameColor }]}>
                        <View style={[styles.screwSlot, { backgroundColor: textColor }]} />
                    </View>
                    <View style={[styles.screw, styles.screwTR, { backgroundColor: frameColor }]}>
                        <View style={[styles.screwSlot, { backgroundColor: textColor }]} />
                    </View>
                    <View style={[styles.screw, styles.screwBL, { backgroundColor: frameColor }]}>
                        <View style={[styles.screwSlot, { backgroundColor: textColor }]} />
                    </View>
                    <View style={[styles.screw, styles.screwBR, { backgroundColor: frameColor }]}>
                        <View style={[styles.screwSlot, { backgroundColor: textColor }]} />
                    </View>

                    {/* Content */}
                    <View style={styles.screenContent}>
                        {children}
                    </View>
                </View>
            </View>

            {/* Bottom label - Model number style */}
            <View style={[styles.bottomBezel, { backgroundColor: frameColor }]}>
                <Text style={[styles.modelText, { color: textColor }]}>
                    DMG-FCL-01
                </Text>
                <View style={styles.decorativeLine}>
                    <View style={[styles.lineSegment, { backgroundColor: textColor }]} />
                    <View style={[styles.lineDot, { backgroundColor: accentColor }]} />
                    <View style={[styles.lineSegment, { backgroundColor: textColor }]} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerFrame: {
        borderRadius: 20,
        padding: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    topBezel: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    leftDecor: {
        width: 50,
    },
    speakerGrille: {
        // Container for speaker grille SVG
    },
    centerTitle: {
        flex: 1,
        alignItems: 'center',
    },
    titleBox: {
        alignItems: 'center',
    },
    titleText: {
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 3,
        textTransform: 'uppercase',
    },
    titleUnderline: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
        gap: 4,
    },
    underlineDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
    },
    underlineLine: {
        width: 40,
        height: 1,
    },
    rightDecor: {
        width: 50,
        alignItems: 'flex-end',
    },
    powerSection: {
        alignItems: 'center',
        gap: 4,
    },
    powerLabel: {
        fontSize: 7,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 1,
    },
    ledWrapper: {
        width: 12,
        height: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ledGlow: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    led: {
        width: 8,
        height: 8,
        borderRadius: 4,
        position: 'absolute',
    },
    screenContainer: {
        borderRadius: 4,
        overflow: 'hidden',
    },
    screenBezel: {
        position: 'relative',
        minHeight: 400,
    },
    screw: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    screwSlot: {
        width: 6,
        height: 1,
        borderRadius: 0.5,
    },
    screwTL: { top: 8, left: 8 },
    screwTR: { top: 8, right: 8 },
    screwBL: { bottom: 8, left: 8 },
    screwBR: { bottom: 8, right: 8 },
    screenContent: {
        flex: 1,
    },
    bottomBezel: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    modelText: {
        fontSize: 8,
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 1,
    },
    decorativeLine: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    lineSegment: {
        width: 20,
        height: 1,
    },
    lineDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
    },
});

export default GameBoyFrame;
