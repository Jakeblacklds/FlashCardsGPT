import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

/**
 * RetroLabel - Etiqueta estilo retro para mostrar nombre de categoría y contador
 * 
 * IMPORTANTE: Este label va SOBRE UN GRADIENTE OSCURO, por lo tanto
 * el texto SIEMPRE debe ser blanco/claro para garantizar legibilidad.
 * El colorPair.text es para modales y otras áreas SIN gradiente.
 */
const RetroLabel = ({
    categoryName,
    flashcardCount,
    colorPair = {},
}) => {
    // SIEMPRE usar texto blanco - estamos sobre un gradiente oscuro
    const textColor = '#FFFFFF';
    const textSecondary = 'rgba(255,255,255,0.75)';

    // El color de acento puede variar para personalidad, pero debe ser brillante
    // Usamos primaryLight o accent, garantizando que sea visible sobre fondo oscuro
    const accentColor = colorPair.primaryLight || colorPair.accent || '#00FF88';

    const badgeBgColor = 'rgba(0,0,0,0.75)';

    return (
        <View style={styles.container}>
            {/* Título de la categoría */}
            <View style={styles.titleContainer}>
                <View style={styles.titleDecoration}>
                    <View style={[styles.decorLine, { backgroundColor: textColor, opacity: 0.5 }]} />
                    <View style={[styles.decorDiamond, { borderColor: textColor }]} />
                    <View style={[styles.decorLine, { backgroundColor: textColor, opacity: 0.5 }]} />
                </View>

                <Text style={[styles.categoryName, { color: textColor }]} numberOfLines={2}>
                    {categoryName || "Nueva Partida"}
                </Text>
            </View>

            {/* Badge de contador estilo pixel/retro */}
            <View style={styles.badgeContainer}>
                <View style={styles.badge}>
                    {/* Triángulo izquierdo del badge */}
                    <View style={[styles.badgeTriangleLeft, { borderRightColor: badgeBgColor }]} />

                    {/* Contenido del badge */}
                    <View style={[styles.badgeContent, { backgroundColor: badgeBgColor }]}>
                        <FontAwesome5
                            name="layer-group"
                            size={10}
                            color={textSecondary}
                            style={styles.badgeIcon}
                        />
                        <Text style={[styles.badgeText, {
                            color: accentColor,
                            textShadowColor: accentColor,
                        }]}>
                            {flashcardCount}
                        </Text>
                        <Text style={[styles.badgeLabel, { color: textSecondary }]}>
                            CARDS
                        </Text>
                    </View>

                    {/* Triángulo derecho del badge */}
                    <View style={[styles.badgeTriangleRight, { borderLeftColor: badgeBgColor }]} />
                </View>
            </View>
        </View>
    );
};

/**
 * RetroLabelPixel - Variante más pixelada/8-bit del label
 * También sobre gradiente oscuro = texto siempre blanco
 */
export const RetroLabelPixel = ({
    categoryName,
    flashcardCount,
    colorPair = {},
}) => {
    // SIEMPRE texto blanco sobre gradiente oscuro
    const textColor = '#FFFFFF';
    const accentColor = colorPair.primaryLight || '#FFD700';

    return (
        <View style={stylesPixel.container}>
            {/* Título con borde estilo pixel */}
            <View style={stylesPixel.titleWrapper}>
                <View style={[stylesPixel.pixelBorderTop, { backgroundColor: `${textColor}40` }]} />
                <View style={stylesPixel.titleContent}>
                    <Text style={[stylesPixel.categoryName, { color: textColor }]} numberOfLines={2}>
                        {categoryName || "NUEVA PARTIDA"}
                    </Text>
                </View>
                <View style={[stylesPixel.pixelBorderBottom, { backgroundColor: `${textColor}40` }]} />
            </View>

            {/* Badge contador estilo consola */}
            <View style={[stylesPixel.statBadge, { borderColor: accentColor }]}>
                <View style={[stylesPixel.statDot, { backgroundColor: '#FF4444' }]} />
                <Text style={[stylesPixel.statNumber, {
                    color: accentColor,
                    textShadowColor: accentColor,
                }]}>
                    {flashcardCount}
                </Text>
                <Text style={stylesPixel.statLabel}>×CARDS</Text>
            </View>
        </View>
    );
};

/**
 * RetroLabelMinimal - Variante minimalista para imágenes muy coloridas
 * Usa fondo semi-transparente oscuro = texto siempre blanco
 */
export const RetroLabelMinimal = ({
    categoryName,
    flashcardCount,
    colorPair = {},
}) => {
    // El badge usa el color del cartucho, pero con texto siempre blanco
    const primaryColor = colorPair.primary || colorPair.background || '#6366F1';
    const textColor = '#FFFFFF';

    return (
        <View style={stylesMinimal.container}>
            <View style={stylesMinimal.contentBox}>
                <Text style={stylesMinimal.categoryName} numberOfLines={2}>
                    {categoryName || "Nueva Partida"}
                </Text>

                <View style={[stylesMinimal.countBadge, { backgroundColor: primaryColor }]}>
                    <Text style={[stylesMinimal.countText, { color: textColor }]}>
                        {flashcardCount}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 10,
        zIndex: 3,
    },
    titleContainer: {
        marginBottom: 8,
    },
    titleDecoration: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    decorLine: {
        flex: 1,
        height: 1,
    },
    decorDiamond: {
        width: 6,
        height: 6,
        borderWidth: 1,
        transform: [{ rotate: '45deg' }],
        marginHorizontal: 6,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.9)',
        textShadowOffset: { width: 1, height: 2 },
        textShadowRadius: 4,
        textTransform: 'uppercase',
    },
    badgeContainer: {
        alignSelf: 'flex-start',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badgeTriangleLeft: {
        width: 0,
        height: 0,
        borderTopWidth: 12,
        borderBottomWidth: 12,
        borderRightWidth: 8,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
    },
    badgeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    badgeIcon: {
        marginRight: 5,
    },
    badgeText: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        marginRight: 4,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4,
    },
    badgeLabel: {
        fontSize: 9,
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 1,
    },
    badgeTriangleRight: {
        width: 0,
        height: 0,
        borderTopWidth: 12,
        borderBottomWidth: 12,
        borderLeftWidth: 8,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
    },
});

const stylesPixel = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 8,
        zIndex: 3,
    },
    titleWrapper: {
        marginBottom: 6,
    },
    pixelBorderTop: {
        height: 2,
        marginHorizontal: 4,
    },
    titleContent: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    pixelBorderBottom: {
        height: 2,
        marginHorizontal: 4,
    },
    categoryName: {
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 0,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderWidth: 2,
        borderStyle: 'solid',
    },
    statDot: {
        width: 6,
        height: 6,
        marginRight: 6,
        shadowColor: '#FF4444',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 4,
    },
    statNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 3,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.8)',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        marginLeft: 2,
    },
});

const stylesMinimal = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 8,
        zIndex: 3,
    },
    contentBox: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 8,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    categoryName: {
        flex: 1,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        textTransform: 'uppercase',
        marginRight: 8,
    },
    countBadge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        minWidth: 36,
        alignItems: 'center',
    },
    countText: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
});

export default RetroLabel;
