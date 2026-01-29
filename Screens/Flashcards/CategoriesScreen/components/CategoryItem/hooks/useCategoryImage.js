import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, Alert, InteractionManager } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { getColors } from 'react-native-image-colors';

import { fetchImage, upsertImage, deleteImage } from '../../../../../../db';
import { generateImageWithGemini } from '../../../../../../geminiApi';

// Utilidades de color avanzadas
import {
    selectBestColorFromExtracted,
    getBestTextColor,
    generateColorPalette,
    validateAndEnhanceColor,
    getAccentColor,
    isColorDark,
    lightenColor,
    darkenColor,
} from '../utils/colorUtils';

/**
 * useCategoryImage - Hook personalizado para manejar la lógica de imágenes
 * Incluye extracción inteligente de colores con contraste garantizado
 */
const useCategoryImage = ({
    categoryId,
    categoryName,
    initialImageUri,
    darkModeEnabled,
    refreshKey,
    fallbackColorPair,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [categoryImageUri, setCategoryImageUri] = useState(initialImageUri || null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [extractedColors, setExtractedColors] = useState(null);

    /**
     * Extrae colores de una imagen y genera una paleta optimizada
     * con contraste WCAG garantizado
     */
    const extractColorsFromImage = useCallback(async (imageUri) => {
        try {
            let processedUri = imageUri;

            // Convertir archivos locales a base64 para getColors
            if (imageUri.startsWith('file://')) {
                const base64 = await FileSystem.readAsStringAsync(imageUri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                let mimeType = 'image/jpeg';
                if (imageUri.toLowerCase().endsWith('.png')) mimeType = 'image/png';
                if (imageUri.toLowerCase().endsWith('.webp')) mimeType = 'image/webp';
                processedUri = `data:${mimeType};base64,${base64}`;
            }

            // Extraer colores con react-native-image-colors
            const result = await getColors(processedUri, {
                fallback: darkModeEnabled ? '#23262A' : '#EEEEEE',
                cache: true,
                key: `${categoryId}_v2`, // Versión para invalidar cache anterior
                quality: 'high',
            });

            // Seleccionar el mejor color de los extraídos
            const bestColor = selectBestColorFromExtracted(result, darkModeEnabled);

            // Validar y mejorar el color si es necesario
            const enhancedColor = validateAndEnhanceColor(bestColor);

            // Generar paleta completa con contraste garantizado
            const palette = generateColorPalette(enhancedColor, darkModeEnabled);

            // Calcular color de texto con contraste WCAG
            const textColor = getBestTextColor(enhancedColor);

            // Color de acento para elementos interactivos
            const accentColor = getAccentColor(enhancedColor, darkModeEnabled);

            // Crear el color pair final con información extendida
            const colorPair = {
                // Colores principales
                background: enhancedColor,
                text: textColor,

                // Colores adicionales de la paleta
                primary: palette.primary,
                primaryDark: palette.primaryDark,
                primaryLight: palette.primaryLight,
                accent: accentColor,
                textSecondary: palette.textSecondary,

                // Metadata
                isDark: isColorDark(enhancedColor),
                contrastSafe: true, // Indicador de que pasó validación WCAG

                // Colores originales extraídos (para debug o uso avanzado)
                extracted: {
                    vibrant: result.vibrant,
                    dominant: result.dominant,
                    muted: result.muted,
                    lightVibrant: result.lightVibrant,
                    darkVibrant: result.darkVibrant,
                    lightMuted: result.lightMuted,
                    darkMuted: result.darkMuted,
                    average: result.average,
                    // iOS specific
                    primary: result.primary,
                    secondary: result.secondary,
                    background: result.background,
                    detail: result.detail,
                }
            };

            setExtractedColors(colorPair);
            return colorPair;

        } catch (error) {
            console.error('Error extrayendo colores:', error);

            // En caso de error, devolver colores seguros
            const safeColorPair = {
                background: darkModeEnabled ? '#374151' : '#E5E7EB',
                text: darkModeEnabled ? '#FFFFFF' : '#1F2937',
                primary: darkModeEnabled ? '#6366F1' : '#4F46E5',
                primaryDark: darkModeEnabled ? '#4F46E5' : '#3730A3',
                primaryLight: darkModeEnabled ? '#818CF8' : '#A5B4FC',
                accent: darkModeEnabled ? '#10B981' : '#059669',
                textSecondary: darkModeEnabled ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                isDark: darkModeEnabled,
                contrastSafe: true,
                extracted: null,
            };

            setExtractedColors(safeColorPair);
            return safeColorPair;
        }
    }, [categoryId, darkModeEnabled]);

    // Carga inicial de imagen - DIFERIDA para no bloquear animaciones
    useEffect(() => {
        let isMounted = true;
        let interactionHandle;

        // Diferir operaciones pesadas hasta que termine la animación
        interactionHandle = InteractionManager.runAfterInteractions(() => {
            if (!isMounted) return;

            setIsLoading(true);

            fetchImage(categoryId)
                .then(imageData => {
                    if (isMounted && imageData?.uri) {
                        setCategoryImageUri(imageData.uri);
                        // Extraer colores también diferido
                        extractColorsFromImage(imageData.uri);
                    } else if (isMounted && initialImageUri) {
                        setCategoryImageUri(initialImageUri);
                        extractColorsFromImage(initialImageUri);
                    } else if (isMounted) {
                        setCategoryImageUri(null);
                        setExtractedColors(null);
                    }
                })
                .catch(console.error)
                .finally(() => {
                    if (isMounted) setIsLoading(false);
                });
        });

        return () => {
            isMounted = false;
            if (interactionHandle) {
                interactionHandle.cancel();
            }
        };
    }, [categoryId, initialImageUri, refreshKey, extractColorsFromImage]);

    // Seleccionar imagen de galería
    const handleChooseFromGallery = useCallback(async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets?.length > 0) {
                const imageUri = result.assets[0].uri;
                setIsLoading(true);
                await upsertImage(categoryId, imageUri);
                setCategoryImageUri(imageUri);
                setImageLoaded(false);
                await extractColorsFromImage(imageUri);
                Alert.alert('✓ Listo', 'Imagen guardada correctamente');
            }
        } catch (error) {
            Alert.alert('Error', `No se pudo seleccionar la imagen: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [categoryId, extractColorsFromImage]);

    // Generar imagen con IA
    const handleGenerateAIImage = useCallback(async () => {
        setIsGenerating(true);
        try {
            const prompt = `Retro game cartridge sticker art, ${categoryName || 'gaming concept'}, vibrant colors, 80s style, pixel art influenced, nostalgic, high quality illustration`;
            const base64ImageData = await generateImageWithGemini(prompt);

            if (!base64ImageData) {
                throw new Error('No se recibieron datos de Gemini.');
            }

            const filename = `gemini_${categoryId}_${Date.now()}.png`;
            const filePath = `${FileSystem.documentDirectory}${filename}`;
            await FileSystem.writeAsStringAsync(filePath, base64ImageData, {
                encoding: FileSystem.EncodingType.Base64
            });

            await upsertImage(categoryId, filePath);
            setCategoryImageUri(filePath);
            setImageLoaded(false);
            await extractColorsFromImage(filePath);
            Alert.alert('✓ Arte Creado', 'Imagen generada con IA');
        } catch (error) {
            Alert.alert('Error IA', 'No se pudo generar la imagen.');
        } finally {
            setIsGenerating(false);
        }
    }, [categoryId, categoryName, extractColorsFromImage]);

    // Eliminar imagen
    const handleDeleteImage = useCallback(async () => {
        setIsLoading(true);
        try {
            await deleteImage(categoryId);
            setCategoryImageUri(null);
            setImageLoaded(false);
            setExtractedColors(null);
            Alert.alert('✓ Eliminado', 'Imagen eliminada correctamente');
        } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar la imagen.');
        } finally {
            setIsLoading(false);
        }
    }, [categoryId]);

    // Color activo (extraído o fallback) con formato consistente
    const activeColorPair = extractedColors || {
        background: fallbackColorPair?.background || (darkModeEnabled ? '#374151' : '#6366F1'),
        text: fallbackColorPair?.text || '#FFFFFF',
        primary: fallbackColorPair?.background || (darkModeEnabled ? '#6366F1' : '#4F46E5'),
        primaryDark: darkenColor(fallbackColorPair?.background || '#6366F1', 15),
        primaryLight: lightenColor(fallbackColorPair?.background || '#6366F1', 20),
        accent: getAccentColor(fallbackColorPair?.background || '#6366F1', darkModeEnabled),
        textSecondary: darkModeEnabled ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
        isDark: isColorDark(fallbackColorPair?.background || '#6366F1'),
        contrastSafe: true,
        extracted: null,
    };

    return {
        // Estados
        isLoading,
        isGenerating,
        categoryImageUri,
        imageLoaded,
        setImageLoaded,
        activeColorPair,

        // Acciones
        handleChooseFromGallery,
        handleGenerateAIImage,
        handleDeleteImage,

        // Utilidad para re-extraer colores si es necesario
        reExtractColors: () => categoryImageUri && extractColorsFromImage(categoryImageUri),
    };
};

export default useCategoryImage;
