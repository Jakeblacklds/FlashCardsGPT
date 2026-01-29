import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';

/**
 * CartuchoContainer - Componente visual SVG estilo Gameboy
 * Renderiza la forma de un cartucho retro con notches decorativos
 */
const CartuchoContainer = ({
    children,
    width = 160,
    height = 180,
    mainColor = "#5DBC67",
    insetColor = "#3EA055",
    accentColor = "#5DBC67",
    darkMode = false,
    style,
}) => {
    // En modo oscuro, las muescas (notches) brillan con el color de la categoría
    const notchColor = darkMode ? accentColor : "#fff";
    const borderColor = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)";
    const r = 14;

    // Configuración del indent (el bocado de la esquina)
    const cutSize = 20;
    const sr = 7;

    // Configuración de las rayitas laterales
    const notchWidth = 10;
    const notchHeight = 4;
    const notchSpacing = 6;
    const topOffsetPos = 32;

    const renderNotches = (xPosition) => (
        <View style={{ opacity: darkMode ? 0.8 : 1 }}>
            <Rect x={xPosition} y={topOffsetPos} width={notchWidth} height={notchHeight} fill={notchColor} rx={1} />
            <Rect x={xPosition} y={topOffsetPos + notchHeight + notchSpacing} width={notchWidth} height={notchHeight} fill={notchColor} rx={1} />
            <Rect x={xPosition} y={topOffsetPos + (notchHeight + notchSpacing) * 2} width={notchWidth} height={notchHeight} fill={notchColor} rx={1} />
        </View>
    );

    const bodyPath = `
    M 0 ${r}
    A ${r} ${r} 0 0 1 ${r} 0
    L ${width - cutSize - sr} 0             
    A ${sr} ${sr} 0 0 1 ${width - cutSize} ${sr}  
    L ${width - cutSize} ${cutSize - sr}    
    A ${sr} ${sr} 0 0 0 ${width - cutSize + sr} ${cutSize} 
    L ${width - sr} ${cutSize}              
    A ${sr} ${sr} 0 0 1 ${width} ${cutSize + sr} 
    L ${width} ${height - r}
    A ${r} ${r} 0 0 1 ${width - r} ${height}
    L ${r} ${height}
    A ${r} ${r} 0 0 1 0 ${height - r}
    Z
  `;

    // Highlight path (efecto de brillo superior)
    const highlightPath = `
    M ${r} 2
    L ${width - cutSize - sr - 5} 2
    A ${sr - 2} ${sr - 2} 0 0 1 ${width - cutSize - 2} ${sr + 2}
  `;

    return (
        <View style={[styles.container, { width, height }, style]}>
            {/* Capa SVG Absoluta para el cuerpo del cartucho */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
                    {/* Brillo exterior en modo oscuro (Glow) */}
                    {darkMode && (
                        <Path
                            d={bodyPath}
                            fill="none"
                            stroke={accentColor}
                            strokeWidth={4}
                            strokeOpacity={0.15}
                        />
                    )}

                    {/* Sombra sutil del cuerpo */}
                    <Path
                        d={bodyPath}
                        fill="rgba(0,0,0,0.25)"
                        transform="translate(0, 4)"
                    />

                    {/* Cuerpo Principal */}
                    <Path
                        d={bodyPath}
                        fill={mainColor}
                        stroke={borderColor}
                        strokeWidth={1.5}
                    />

                    {/* Highlight sutil en el borde superior */}
                    <Path
                        d={highlightPath}
                        fill="none"
                        stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.25)"}
                        strokeWidth={2}
                        strokeLinecap="round"
                    />

                    {/* Inset (El hueco donde va la etiqueta/sticker) */}
                    <Rect
                        x={width * 0.1}
                        y={height * 0.26}
                        width={width * 0.8}
                        height={height * 0.67}
                        rx={10}
                        fill={insetColor}
                        stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.15)"}
                        strokeWidth={1}
                    />

                    {/* Borde interno del inset para profundidad */}
                    <Rect
                        x={width * 0.1 + 2}
                        y={height * 0.26 + 2}
                        width={width * 0.8 - 4}
                        height={height * 0.67 - 4}
                        rx={8}
                        fill="none"
                        stroke={darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.1)"}
                        strokeWidth={1}
                    />

                    {/* Rayitas Decorativas (Notches) */}
                    {renderNotches(-2)}
                    {renderNotches(width - notchWidth + 2)}
                </Svg>
            </View>

            {/* Contenedor del contenido (La etiqueta/Sticker) */}
            <View style={styles.contentContainer}>
                <View style={styles.stickerInnerContainer}>
                    {children}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 12,
        position: 'relative',
    },
    contentContainer: {
        flex: 1,
        paddingTop: '26%',
        paddingHorizontal: '10%',
        paddingBottom: '7%',
    },
    stickerInnerContainer: {
        flex: 1,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.25)',
        position: 'relative',
    }
});

export default CartuchoContainer;
