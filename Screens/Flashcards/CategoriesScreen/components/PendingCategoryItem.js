import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Platform,
    Animated,
    Easing,
    TouchableOpacity,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Path } from 'react-native-svg';

import { selectDarkMode } from '../../../../redux/darkModeSlice';
import { resolvePendingCategory } from '../../../../redux/FlashcardSlice';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.45;
const CARD_HEIGHT = 200;

// Cartridge Container (Same as CategoryItem)
const CartuchoContainer = ({
    children,
    width: containerWidth = 160,
    height = 180,
    mainColor = "#5DBC67",
    insetColor = "#3EA055",
    darkMode = false,
    style,
}) => {
    const notchColor = darkMode ? "#23262A" : "#fff";
    const r = 12;
    const cutSize = 18;
    const sr = 6;
    const notchWidth = 11;
    const notchHeight = 4;
    const notchSpacing = 4;
    const topOffsetPos = 30;

    const renderNotches = (xPosition) => (
        <>
            <Rect x={xPosition} y={topOffsetPos} width={notchWidth} height={notchHeight} fill={notchColor} rx={1} />
            <Rect x={xPosition} y={topOffsetPos + notchHeight + notchSpacing} width={notchWidth} height={notchHeight} fill={notchColor} rx={1} />
            <Rect x={xPosition} y={topOffsetPos + (notchHeight + notchSpacing) * 2} width={notchWidth} height={notchHeight} fill={notchColor} rx={1} />
        </>
    );

    const bodyPath = `
    M 0 ${r}
    A ${r} ${r} 0 0 1 ${r} 0
    L ${containerWidth - cutSize - sr} 0
    A ${sr} ${sr} 0 0 1 ${containerWidth - cutSize} ${sr}
    L ${containerWidth - cutSize} ${cutSize - sr}
    A ${sr} ${sr} 0 0 0 ${containerWidth - cutSize + sr} ${cutSize}
    L ${containerWidth - sr} ${cutSize}
    A ${sr} ${sr} 0 0 1 ${containerWidth} ${cutSize + sr}
    L ${containerWidth} ${height - r}
    A ${r} ${r} 0 0 1 ${containerWidth - r} ${height}
    L ${r} ${height}
    A ${r} ${r} 0 0 1 0 ${height - r}
    Z
  `;

    return (
        <View style={[stylesCartucho.container, { width: containerWidth, height }, style]}>
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Svg width="100%" height="100%" viewBox={`0 0 ${containerWidth} ${height}`}>
                    <Path d={bodyPath} fill={mainColor} stroke={"rgba(0,0,0,0.1)"} strokeWidth={1} />
                    <Rect
                        x={containerWidth * 0.1}
                        y={height * 0.28}
                        width={containerWidth * 0.8}
                        height={height * 0.65}
                        rx={8}
                        fill={insetColor}
                    />
                    {renderNotches(-1)}
                    {renderNotches(containerWidth - notchWidth + 1)}
                </Svg>
            </View>
            <View style={stylesCartucho.contentContainer}>
                <View style={stylesCartucho.stickerInnerContainer}>
                    {children}
                </View>
            </View>
        </View>
    );
};

const stylesCartucho = StyleSheet.create({
    container: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        position: 'relative',
    },
    contentContainer: {
        flex: 1,
        paddingTop: '28%',
        paddingHorizontal: '10%',
        paddingBottom: '7%',
    },
    stickerInnerContainer: {
        flex: 1,
        borderRadius: 6,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.2)',
        position: 'relative',
    }
});

// Short status text
const getStatusText = (status, progress) => {
    switch (status) {
        case 'starting': return 'Starting...';
        case 'generating': return `Creating ${Math.round(progress)}%`;
        case 'saving': return 'Saving...';
        case 'error': return 'Error!';
        case 'complete': return 'Done!';
        default: return 'Loading...';
    }
};

const PendingCategoryItem = ({ pendingCategory, onRetry, onCancel }) => {
    const darkModeEnabled = useSelector(selectDarkMode);
    const dispatch = useDispatch();

    const { tempId, name, colorPair, progress = 0, status, error, numFlashcards } = pendingCategory;

    // Animations
    const pulseAnim = useRef(new Animated.Value(0.6)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    // Pulse animation for loading state
    useEffect(() => {
        if (status !== 'error' && status !== 'complete') {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 0.6, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        }
    }, [status]);

    // Rotate animation for icon
    useEffect(() => {
        if (status !== 'error' && status !== 'complete') {
            const rotate = Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );
            rotate.start();
            return () => rotate.stop();
        }
    }, [status]);

    // Progress bar animation
    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const mainColor = colorPair?.background || '#6366F1';
    const insetColor = darkModeEnabled ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)';
    const isError = status === 'error';
    const isComplete = status === 'complete';

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.touchableWrapper}>
            <CartuchoContainer
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
                mainColor={isError ? '#EF4444' : mainColor}
                insetColor={insetColor}
                darkMode={darkModeEnabled}
            >
                {/* Background gradient */}
                <LinearGradient
                    colors={isError ? ['#EF4444', '#B91C1C'] : isComplete ? ['#10B981', '#059669'] : [mainColor, `${mainColor}DD`]}
                    style={StyleSheet.absoluteFill}
                />

                {/* Animated pulse overlay */}
                {!isError && !isComplete && (
                    <Animated.View style={[styles.pulseOverlay, { opacity: pulseAnim }]}>
                        <LinearGradient
                            colors={['transparent', 'rgba(255,255,255,0.15)', 'transparent']}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                    </Animated.View>
                )}

                {/* Content - Compact Layout */}
                <View style={styles.contentContainer}>
                    {/* Icon with rotation */}
                    <View style={styles.iconRow}>
                        {isError ? (
                            <FontAwesome5 name="exclamation-circle" size={24} color="#FFF" />
                        ) : isComplete ? (
                            <FontAwesome5 name="check-circle" size={24} color="#FFF" />
                        ) : (
                            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                                <FontAwesome5 name="cog" size={24} color="#FFF" />
                            </Animated.View>
                        )}
                    </View>

                    {/* Category name - compact */}
                    <Text style={styles.categoryName} numberOfLines={2}>
                        {name || 'Category'}
                    </Text>

                    {/* Status text with integrated progress */}
                    <Text style={styles.statusText}>
                        {getStatusText(status, progress)}
                    </Text>

                    {/* Compact progress bar */}
                    {!isError && (
                        <View style={styles.progressBarContainer}>
                            <View style={styles.progressBarBackground}>
                                <Animated.View
                                    style={[
                                        styles.progressBarFill,
                                        {
                                            width: progressWidth,
                                            backgroundColor: isComplete ? '#FFF' : 'rgba(255,255,255,0.9)'
                                        }
                                    ]}
                                />
                            </View>
                        </View>
                    )}

                    {/* Error actions - compact */}
                    {isError && (
                        <View style={styles.errorActions}>
                            <TouchableOpacity
                                style={styles.retryButton}
                                onPress={() => onRetry?.(pendingCategory)}
                            >
                                <Ionicons name="refresh" size={12} color="#FFF" />
                                <Text style={styles.actionText}>Retry</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => {
                                    dispatch(resolvePendingCategory({ tempId }));
                                    onCancel?.(pendingCategory);
                                }}
                            >
                                <Ionicons name="close" size={12} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* AI Badge - top right corner */}
                {!isError && !isComplete && (
                    <View style={styles.aiBadge}>
                        <Animated.View style={{ opacity: pulseAnim }}>
                            <FontAwesome5 name="robot" size={8} color="#FFF" />
                        </Animated.View>
                    </View>
                )}
            </CartuchoContainer>
        </View>
    );
};

const styles = StyleSheet.create({
    touchableWrapper: {
        marginVertical: 12,
        alignItems: 'center',
    },
    pulseOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
        zIndex: 2,
    },
    iconRow: {
        marginBottom: 6,
    },
    categoryName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
        marginBottom: 4,
        lineHeight: 16,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.95)',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        marginBottom: 8,
        textAlign: 'center',
    },
    progressBarContainer: {
        width: '85%',
    },
    progressBarBackground: {
        width: '100%',
        height: 5,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    aiBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 5,
        paddingVertical: 3,
        borderRadius: 6,
    },
    errorActions: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 6,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        gap: 4,
    },
    cancelButton: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 5,
        borderRadius: 5,
    },
    actionText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#FFF',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
});

export default PendingCategoryItem;
