import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Platform, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withSpring,
    withDelay,
    withTiming,
    runOnJS,
    Easing,
} from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import { getMasteryInfo } from '../utils/spacedRepetition';

const { width } = Dimensions.get('window');

/**
 * LevelUpModal - Modal de celebración cuando una palabra sube de nivel
 * 
 * @param {boolean} visible - Si mostrar el modal
 * @param {number} newLevel - Nuevo nivel alcanzado
 * @param {number} oldLevel - Nivel anterior
 * @param {string} wordEnglish - Palabra en inglés
 * @param {Function} onDismiss - Callback para cerrar
 */
const LevelUpModal = ({
    visible = false,
    newLevel = 1,
    oldLevel = 0,
    wordEnglish = '',
    onDismiss,
    autoDismissMs = 2500,
}) => {
    const bgOpacity = useSharedValue(0);
    const scale = useSharedValue(0);
    const rotation = useSharedValue(-20);
    const starScale = useSharedValue(0);
    const confettiProgress = useSharedValue(0);

    const newInfo = getMasteryInfo(newLevel);
    const oldInfo = getMasteryInfo(oldLevel);

    useEffect(() => {
        if (visible) {
            // Background fade in
            bgOpacity.value = withTiming(1, { duration: 200 });

            // Card appear
            scale.value = withSequence(
                withSpring(1.1, { damping: 8, stiffness: 150 }),
                withSpring(1, { damping: 10 })
            );

            rotation.value = withSpring(0, { damping: 12 });

            // Stars appear
            starScale.value = withDelay(
                200,
                withSpring(1, { damping: 8 })
            );

            // Confetti
            confettiProgress.value = withDelay(
                100,
                withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) })
            );

            // Auto dismiss
            if (autoDismissMs > 0 && onDismiss) {
                const timeout = setTimeout(() => {
                    handleDismiss();
                }, autoDismissMs);
                return () => clearTimeout(timeout);
            }
        } else {
            bgOpacity.value = 0;
            scale.value = 0;
            rotation.value = -20;
            starScale.value = 0;
            confettiProgress.value = 0;
        }
    }, [visible]);

    const handleDismiss = () => {
        bgOpacity.value = withTiming(0, { duration: 200 });
        scale.value = withTiming(0, { duration: 200 }, () => {
            if (onDismiss) {
                runOnJS(onDismiss)();
            }
        });
    };

    const bgStyle = useAnimatedStyle(() => ({
        opacity: bgOpacity.value,
    }));

    const cardStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { rotate: `${rotation.value}deg` },
        ],
    }));

    const starStyle = useAnimatedStyle(() => ({
        transform: [{ scale: starScale.value }],
    }));

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none">
            <Animated.View style={[styles.backdrop, bgStyle]} onTouchEnd={handleDismiss}>
                <Animated.View style={[styles.card, { borderColor: newInfo.color }, cardStyle]}>
                    {/* Confetti particles */}
                    <ConfettiParticles progress={confettiProgress} color={newInfo.color} />

                    {/* Stars */}
                    <Animated.View style={[styles.starsContainer, starStyle]}>
                        <Text style={styles.stars}>⭐ ⭐ ⭐</Text>
                    </Animated.View>

                    {/* Title */}
                    <Text style={styles.title}>LEVEL UP!</Text>

                    {/* Emoji transition */}
                    <View style={styles.emojiRow}>
                        <View style={[styles.emojiBox, { opacity: 0.5 }]}>
                            <Text style={styles.emojiSmall}>{oldInfo.emoji}</Text>
                            <Text style={[styles.levelLabel, { color: oldInfo.color }]}>{oldInfo.shortName}</Text>
                        </View>
                        <FontAwesome5 name="arrow-right" size={24} color={newInfo.color} />
                        <View style={[styles.emojiBox, styles.emojiBoxActive, { borderColor: newInfo.color }]}>
                            <Text style={styles.emojiBig}>{newInfo.emoji}</Text>
                            <Text style={[styles.levelLabel, { color: newInfo.color }]}>{newInfo.shortName}</Text>
                        </View>
                    </View>

                    {/* Word */}
                    {wordEnglish && (
                        <Text style={styles.word}>"{wordEnglish}"</Text>
                    )}

                    {/* New level badge */}
                    <View style={[styles.levelBadge, { backgroundColor: newInfo.color }]}>
                        <Text style={styles.levelBadgeText}>{newInfo.name}</Text>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

/**
 * Mini confetti particles
 */
const ConfettiParticles = ({ progress, color }) => {
    const particles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        angle: (360 / 12) * i,
        color: i % 2 === 0 ? color : '#F59E0B',
    }));

    return (
        <View style={styles.confettiContainer}>
            {particles.map((p) => (
                <ConfettiParticle key={p.id} angle={p.angle} color={p.color} progress={progress} />
            ))}
        </View>
    );
};

const ConfettiParticle = ({ angle, color, progress }) => {
    const animStyle = useAnimatedStyle(() => {
        const angleRad = (angle * Math.PI) / 180;
        const distance = 100 * progress.value;
        const x = Math.cos(angleRad) * distance;
        const y = Math.sin(angleRad) * distance;

        return {
            transform: [
                { translateX: x },
                { translateY: y },
                { rotate: `${progress.value * 360}deg` },
                { scale: 1 - progress.value * 0.5 },
            ],
            opacity: 1 - progress.value,
        };
    });

    return (
        <Animated.View style={[styles.confettiParticle, { backgroundColor: color }, animStyle]} />
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        width: width * 0.8,
        backgroundColor: '#1a1a2e',
        borderRadius: 20,
        borderWidth: 3,
        padding: 24,
        alignItems: 'center',
        overflow: 'visible',
    },
    confettiContainer: {
        position: 'absolute',
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confettiParticle: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    starsContainer: {
        marginBottom: 8,
    },
    stars: {
        fontSize: 24,
        textAlign: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 2,
        marginBottom: 16,
        textShadowColor: 'rgba(245, 158, 11, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    emojiRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
    },
    emojiBox: {
        alignItems: 'center',
        padding: 12,
    },
    emojiBoxActive: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        borderWidth: 2,
    },
    emojiSmall: {
        fontSize: 32,
    },
    emojiBig: {
        fontSize: 48,
    },
    levelLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        marginTop: 4,
    },
    word: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        fontStyle: 'italic',
        marginBottom: 16,
    },
    levelBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    levelBadgeText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
});

export default LevelUpModal;
