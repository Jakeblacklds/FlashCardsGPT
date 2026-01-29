import React, { useState, useEffect, useMemo } from 'react';
import {
    TouchableOpacity,
    View,
    Image,
    ActivityIndicator,
    InteractionManager,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Componentes internos
import CartuchoContainer from './CartuchoContainer';
import RetroLabel, { RetroLabelPixel } from './RetroLabel';
import OptionsModal from './modals/OptionsModal';
import ImagePickerModal from './modals/ImagePickerModal';

// Hooks y estilos
import useCategoryImage from './hooks/useCategoryImage';
import { getStyles, CARD_WIDTH, CARD_HEIGHT } from './CategoryItem.styles';

// Redux
import { selectDarkMode } from '../../../../../redux/darkModeSlice';
import { fetchFlashcardCountByCategory, selectFlashcardCount } from '../../../../../redux/FlashcardSlice';
import { getRandomColorPair } from '../../../../../constants';

/**
 * CategoryItem - Componente principal de tarjeta de categoría
 * Muestra un cartucho estilo retro con imagen, nombre y contador
 * 
 * @param {Object} category - Objeto o string de categoría
 * @param {Function} onPress - Callback al presionar
 * @param {Function} onDelete - Callback para eliminar
 * @param {Object} initialColorPair - Par de colores inicial
 * @param {string} initialImageUri - URI de imagen inicial
 * @param {any} refreshKey - Key para refrescar datos
 */
const CategoryItem = ({
    category,
    onPress,
    onDelete,
    initialColorPair,
    initialImageUri,
    refreshKey,
}) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    // Estados de modales
    const [isOptionsModalVisible, setOptionsModalVisible] = useState(false);
    const [isImagePickerModalVisible, setImagePickerModalVisible] = useState(false);

    // Redux state
    const darkModeEnabled = useSelector(selectDarkMode);
    const currentUserUID = useSelector(state => state.flashcards.currentUserUID);

    // Datos de categoría
    const categoryId = typeof category === 'string' ? category : category?.id;
    const categoryName = typeof category === 'string' ? category : category?.name;
    const flashcardCount = useSelector(state => selectFlashcardCount(state, categoryId));

    // Color fallback
    const fallbackColorPair = useMemo(
        () => initialColorPair || getRandomColorPair(),
        [initialColorPair]
    );

    // Hook de imagen personalizado
    const {
        isLoading,
        isGenerating,
        categoryImageUri,
        imageLoaded,
        setImageLoaded,
        activeColorPair,
        handleChooseFromGallery,
        handleGenerateAIImage,
        handleDeleteImage,
    } = useCategoryImage({
        categoryId,
        categoryName,
        initialImageUri,
        darkModeEnabled,
        refreshKey,
        fallbackColorPair,
    });

    // Cargar contador de flashcards - DIFERIDO para no bloquear animaciones
    useEffect(() => {
        if (currentUserUID && categoryId) {
            const handle = InteractionManager.runAfterInteractions(() => {
                dispatch(fetchFlashcardCountByCategory(currentUserUID, categoryId));
            });
            return () => handle.cancel();
        }
    }, [currentUserUID, categoryId, dispatch]);

    // Estilos dinámicos
    const styles = getStyles(darkModeEnabled, activeColorPair);

    // Colores del cartucho adaptados al modo oscuro
    // En modo oscuro, el cuerpo del cartucho es oscuro para no deslumbrar,
    // y usamos el color de la categoría como acento.
    const cartridgeMainColor = darkModeEnabled
        ? '#1A1C1E' // Gris muy oscuro premium
        : (activeColorPair?.background || '#5DBC67');

    const cartridgeInsetColor = darkModeEnabled
        ? 'rgba(0,0,0,0.6)'
        : 'rgba(0,0,0,0.2)';

    // Color de acento para detalles (como las muescas del cartucho)
    const accentColor = activeColorPair?.background || '#5DBC67';

    // Navegación al presionar
    const handlePress = () => {
        if (onPress) {
            onPress(category, activeColorPair, categoryImageUri);
        } else {
            // Fallback por si acaso
            navigation.navigate('FlashcardList', {
                category: categoryName,
                colorPair: activeColorPair,
                imageUri: categoryImageUri
            });
        }
    };

    // Handlers de modales
    const handleSelectImage = () => setImagePickerModalVisible(true);
    const handleDelete = () => onDelete(categoryId);

    return (
        <>
            <TouchableOpacity
                style={styles.touchableWrapper}
                activeOpacity={0.92}
                onPress={handlePress}
            >
                <CartuchoContainer
                    width={CARD_WIDTH}
                    height={CARD_HEIGHT}
                    mainColor={cartridgeMainColor}
                    insetColor={cartridgeInsetColor}
                    accentColor={accentColor}
                    darkMode={darkModeEnabled}
                >
                    {/* Imagen de fondo */}
                    <View style={styles.imageContainer}>
                        {categoryImageUri ? (
                            <>
                                {!imageLoaded && !isGenerating && (
                                    <ActivityIndicator
                                        style={styles.imageLoader}
                                        color="#FFF"
                                    />
                                )}
                                <Image
                                    source={{ uri: categoryImageUri }}
                                    style={styles.backgroundImage}
                                    onLoadEnd={() => setImageLoaded(true)}
                                />
                            </>
                        ) : (
                            !isGenerating && !isLoading && (
                                <View style={styles.placeholderBackground}>
                                    <FontAwesome5
                                        name="gamepad"
                                        size={36}
                                        color="rgba(0,0,0,0.15)"
                                    />
                                </View>
                            )
                        )}

                        {/* Gradiente para legibilidad del texto */}
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.85)']}
                            style={styles.gradientOverlay}
                            locations={[0.35, 1]}
                        />
                    </View>

                    {/* Botón de menú */}
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => setOptionsModalVisible(true)}
                    >
                        <Ionicons name="ellipsis-horizontal" size={18} color="#FFF" />
                    </TouchableOpacity>

                    {/* Indicadores de carga */}
                    {(isGenerating || isLoading) && (
                        <View style={styles.uploadOverlay}>
                            <ActivityIndicator size="small" color="#FFF" />
                        </View>
                    )}

                    {isGenerating && (
                        <View style={styles.lottieOverlay}>
                            <LottieView
                                source={require('../../../../../assets/loadimg2.json')}
                                autoPlay
                                loop
                                style={styles.lottie}
                            />
                        </View>
                    )}

                    {/* Label retro con nombre y contador - usa paleta completa */}
                    <RetroLabel
                        categoryName={categoryName}
                        flashcardCount={flashcardCount}
                        colorPair={activeColorPair}
                    />
                </CartuchoContainer>
            </TouchableOpacity>

            {/* Modales */}
            <OptionsModal
                visible={isOptionsModalVisible}
                onClose={() => setOptionsModalVisible(false)}
                styles={styles}
                categoryName={categoryName}
                categoryImageUri={categoryImageUri}
                colorPair={activeColorPair}
                onSelectImage={handleSelectImage}
                onDeleteImage={handleDeleteImage}
                onDelete={handleDelete}
            />

            <ImagePickerModal
                visible={isImagePickerModalVisible}
                onClose={() => setImagePickerModalVisible(false)}
                styles={styles}
                darkModeEnabled={darkModeEnabled}
                categoryName={categoryName}
                activeColorPair={activeColorPair}
                onChooseFromGallery={handleChooseFromGallery}
                onGenerateAI={handleGenerateAIImage}
            />
        </>
    );
};

export default React.memo(CategoryItem);
