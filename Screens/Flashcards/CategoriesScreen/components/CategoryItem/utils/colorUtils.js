/**
 * colorUtils.js - Utilidades avanzadas para extracción y procesamiento de colores
 * Garantiza legibilidad y armonía visual en cualquier combinación de colores
 */

/**
 * Convierte un color HEX a RGB
 */
export const hexToRgb = (hex) => {
    if (!hex) return { r: 0, g: 0, b: 0 };

    let cleanHex = hex.replace('#', '');

    // Manejar formato ARGB (8 caracteres) - remover alpha
    if (cleanHex.length === 8) {
        cleanHex = cleanHex.substring(2);
    }

    // Expandir formato corto (#RGB -> #RRGGBB)
    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map(c => c + c).join('');
    }

    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;

    return { r, g, b };
};

/**
 * Convierte RGB a HEX
 */
export const rgbToHex = (r, g, b) => {
    const toHex = (c) => {
        const hex = Math.round(Math.max(0, Math.min(255, c))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Convierte RGB a HSL
 */
export const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
};

/**
 * Convierte HSL a RGB
 */
export const hslToRgb = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
};

/**
 * Calcula la luminancia relativa (WCAG 2.1)
 * Devuelve un valor entre 0 (negro) y 1 (blanco)
 */
export const getRelativeLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calcula el ratio de contraste WCAG entre dos colores
 * Devuelve un valor entre 1 (sin contraste) y 21 (máximo contraste)
 * WCAG AA requiere mínimo 4.5:1 para texto normal, 3:1 para texto grande
 */
export const getContrastRatio = (color1, color2) => {
    const rgb1 = typeof color1 === 'string' ? hexToRgb(color1) : color1;
    const rgb2 = typeof color2 === 'string' ? hexToRgb(color2) : color2;

    const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Determina si un color es "oscuro" basado en luminancia
 */
export const isColorDark = (color) => {
    const rgb = typeof color === 'string' ? hexToRgb(color) : color;
    const luminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b);
    return luminance < 0.179; // Umbral estándar
};

/**
 * Aclara un color por un porcentaje dado
 */
export const lightenColor = (hex, percent) => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    hsl.l = Math.min(100, hsl.l + percent);

    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
};

/**
 * Oscurece un color por un porcentaje dado
 */
export const darkenColor = (hex, percent) => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    hsl.l = Math.max(0, hsl.l - percent);

    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
};

/**
 * Ajusta la saturación de un color
 */
export const adjustSaturation = (hex, amount) => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    hsl.s = Math.max(0, Math.min(100, hsl.s + amount));

    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
};

/**
 * Encuentra el mejor color de texto para un fondo dado
 * Garantiza contraste WCAG AA (4.5:1 mínimo)
 */
export const getBestTextColor = (backgroundColor, preferLight = null) => {
    const bgRgb = hexToRgb(backgroundColor);
    const bgHsl = rgbToHsl(bgRgb.r, bgRgb.g, bgRgb.b);

    // Candidatos de texto: blanco puro, negro puro, y variaciones
    const candidates = [
        '#FFFFFF',
        '#F5F5F5',
        '#EEEEEE',
        '#000000',
        '#1A1A1A',
        '#2D2D2D',
        '#333333',
    ];

    // Si el fondo tiene un color, añadir versiones muy claras/oscuras del mismo tono
    if (bgHsl.s > 10) {
        const lightTinted = hslToRgb(bgHsl.h, 10, 95);
        const darkTinted = hslToRgb(bgHsl.h, 15, 10);
        candidates.push(rgbToHex(lightTinted.r, lightTinted.g, lightTinted.b));
        candidates.push(rgbToHex(darkTinted.r, darkTinted.g, darkTinted.b));
    }

    let bestColor = '#FFFFFF';
    let bestContrast = 0;

    for (const candidate of candidates) {
        const contrast = getContrastRatio(backgroundColor, candidate);

        // Preferencia por el tipo de color si se especifica
        if (preferLight !== null) {
            const candidateIsLight = !isColorDark(candidate);
            if (candidateIsLight !== preferLight && contrast >= 4.5) {
                continue; // Saltar si no coincide con la preferencia y ya hay suficiente contraste
            }
        }

        if (contrast > bestContrast) {
            bestContrast = contrast;
            bestColor = candidate;
        }
    }

    // Si el mejor contraste es menor a 4.5, forzar blanco o negro
    if (bestContrast < 4.5) {
        const whiteContrast = getContrastRatio(backgroundColor, '#FFFFFF');
        const blackContrast = getContrastRatio(backgroundColor, '#000000');
        bestColor = whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
    }

    return bestColor;
};

/**
 * Genera un color de acento complementario
 */
export const getAccentColor = (baseColor, isDarkMode = false) => {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Rotar el tono 30-60 grados para un color análogo vibrante
    let newHue = (hsl.h + 40) % 360;

    // Ajustar saturación y luminosidad para que destaque
    let newSat = Math.min(100, hsl.s + 20);
    let newLight = isDarkMode ? 65 : 45;

    const accentRgb = hslToRgb(newHue, newSat, newLight);
    return rgbToHex(accentRgb.r, accentRgb.g, accentRgb.b);
};

/**
 * Genera una paleta completa a partir de un color base
 */
export const generateColorPalette = (baseColor, isDarkMode = false) => {
    if (!baseColor || baseColor === 'transparent') {
        return {
            primary: isDarkMode ? '#6366F1' : '#4F46E5',
            primaryDark: isDarkMode ? '#4F46E5' : '#3730A3',
            primaryLight: isDarkMode ? '#818CF8' : '#A5B4FC',
            text: isDarkMode ? '#FFFFFF' : '#1F2937',
            textSecondary: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
            accent: isDarkMode ? '#10B981' : '#059669',
            background: baseColor || (isDarkMode ? '#1F2937' : '#FFFFFF'),
        };
    }

    const bgRgb = hexToRgb(baseColor);
    const bgHsl = rgbToHsl(bgRgb.r, bgRgb.g, bgRgb.b);

    // Color primario (el base, posiblemente ajustado)
    let primary = baseColor;

    // Si el color es muy claro o muy oscuro, ajustarlo
    if (bgHsl.l > 85) {
        primary = darkenColor(baseColor, 20);
    } else if (bgHsl.l < 15) {
        primary = lightenColor(baseColor, 20);
    }

    // Versiones claras y oscuras del primario
    const primaryDark = darkenColor(primary, 15);

    // Para primaryLight: garantizar luminosidad mínima para legibilidad en fondos oscuros
    // En modo oscuro, necesitamos que primaryLight tenga al menos 60% de luminosidad
    const primaryRgb = hexToRgb(primary);
    const primaryHsl = rgbToHsl(primaryRgb.r, primaryRgb.g, primaryRgb.b);

    let primaryLight;
    if (isDarkMode) {
        // En modo oscuro, garantizar luminosidad mínima de 60%
        const targetLightness = Math.max(60, primaryHsl.l + 25);
        const lightRgb = hslToRgb(primaryHsl.h, Math.min(80, primaryHsl.s), Math.min(85, targetLightness));
        primaryLight = rgbToHex(lightRgb.r, lightRgb.g, lightRgb.b);
    } else {
        primaryLight = lightenColor(primary, 20);
    }

    // Color de texto con contraste garantizado
    const text = getBestTextColor(primary);

    // Texto secundario (mismo tono pero con opacidad o ajuste de luminosidad)
    const textSecondary = isColorDark(text)
        ? 'rgba(0,0,0,0.6)'
        : 'rgba(255,255,255,0.7)';

    // Color de acento
    const accent = getAccentColor(primary, isDarkMode);

    return {
        primary,
        primaryDark,
        primaryLight,
        text,
        textSecondary,
        accent,
        background: baseColor,
    };
};

/**
 * Valida y mejora un color extraído de imagen
 * Garantiza que sea usable y vibrante
 */
export const validateAndEnhanceColor = (color, fallback = '#6366F1') => {
    if (!color || color === 'transparent' || color === 'undefined') {
        return fallback;
    }

    try {
        const rgb = hexToRgb(color);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        // Si el color es casi gris (baja saturación), aumentar un poco
        if (hsl.s < 15 && hsl.l > 20 && hsl.l < 80) {
            hsl.s = 25;
            const enhanced = hslToRgb(hsl.h, hsl.s, hsl.l);
            return rgbToHex(enhanced.r, enhanced.g, enhanced.b);
        }

        // Si el color es demasiado oscuro, aclarar
        if (hsl.l < 15) {
            hsl.l = 25;
            const enhanced = hslToRgb(hsl.h, hsl.s, hsl.l);
            return rgbToHex(enhanced.r, enhanced.g, enhanced.b);
        }

        // Si el color es demasiado claro, oscurecer ligeramente
        if (hsl.l > 90) {
            hsl.l = 80;
            const enhanced = hslToRgb(hsl.h, hsl.s, hsl.l);
            return rgbToHex(enhanced.r, enhanced.g, enhanced.b);
        }

        return color;
    } catch (e) {
        return fallback;
    }
};

/**
 * Selecciona el mejor color de una lista de colores extraídos
 * Prioriza colores vibrantes y usables
 */
export const selectBestColorFromExtracted = (colors, isDarkMode = false) => {
    const fallback = isDarkMode ? '#6366F1' : '#4F46E5';

    if (!colors || typeof colors !== 'object') {
        return fallback;
    }

    // Orden de preferencia de colores de react-native-image-colors
    const priorityOrder = isDarkMode
        ? ['vibrant', 'lightVibrant', 'dominant', 'muted', 'lightMuted', 'darkVibrant', 'darkMuted', 'average', 'primary', 'secondary', 'background', 'detail']
        : ['vibrant', 'darkVibrant', 'dominant', 'muted', 'darkMuted', 'lightVibrant', 'lightMuted', 'average', 'primary', 'secondary', 'background', 'detail'];

    let bestColor = null;
    let bestScore = -1;

    for (const key of priorityOrder) {
        const color = colors[key];
        if (!color || color === 'transparent' || color === '#000000' || color === '#FFFFFF') {
            continue;
        }

        try {
            const rgb = hexToRgb(color);
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

            // Calcular un "score" basado en saturación y luminosidad apropiada
            let score = 0;

            // Preferir colores saturados (más vibrantes)
            score += hsl.s * 0.4;

            // Preferir luminosidad media (ni muy oscuro ni muy claro)
            const idealLightness = isDarkMode ? 50 : 45;
            const lightnessDistance = Math.abs(hsl.l - idealLightness);
            score += (100 - lightnessDistance) * 0.3;

            // Bonus por ser un color "vibrant" en el nombre
            if (key.toLowerCase().includes('vibrant')) {
                score += 20;
            }

            // Penalizar colores casi grises
            if (hsl.s < 10) {
                score -= 30;
            }

            if (score > bestScore) {
                bestScore = score;
                bestColor = color;
            }
        } catch (e) {
            continue;
        }
    }

    return bestColor ? validateAndEnhanceColor(bestColor, fallback) : fallback;
};

export default {
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    hslToRgb,
    getRelativeLuminance,
    getContrastRatio,
    isColorDark,
    lightenColor,
    darkenColor,
    adjustSaturation,
    getBestTextColor,
    getAccentColor,
    generateColorPalette,
    validateAndEnhanceColor,
    selectBestColorFromExtracted,
};
