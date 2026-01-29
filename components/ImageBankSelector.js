import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    FlatList,
    Image,
    Dimensions,
    Platform,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// ✅ Importar IMAGE_BANK del archivo AUTO-GENERADO
// Para regenerar: node scripts/generateImageBank.js
import { IMAGE_BANK } from '../utils/generatedImageBank';

const { width } = Dimensions.get('window');
const GRID_PADDING = 16;
const NUM_COLUMNS = 3;
const ITEM_GAP = 10;
const ITEM_SIZE = (width - (GRID_PADDING * 2) - (ITEM_GAP * (NUM_COLUMNS - 1))) / NUM_COLUMNS;

const retroFont = Platform.OS === 'ios' ? 'Menlo' : 'monospace';


/**
 * ImageBankSelector - Modal to select an image from the bank
 * 
 * @param {boolean} visible - Whether the modal is visible
 * @param {function} onClose - Called when modal is closed
 * @param {function} onSelect - Called with (key, imageSource) when an image is selected
 * @param {string} selectedKey - Currently selected image key
 * @param {boolean} darkMode - Dark mode enabled
 */
const ImageBankSelector = ({
    visible,
    onClose,
    onSelect,
    selectedKey = null,
    darkMode = false
}) => {
    const [hoveredKey, setHoveredKey] = useState(null);

    const imageList = useMemo(() => {
        return Object.entries(IMAGE_BANK).map(([key, data]) => ({
            key,
            ...data,
        }));
    }, []);

    const bgColor = darkMode ? '#0D0D0E' : '#F5F5F7';
    const cardBg = darkMode ? '#1a1a2e' : '#FFF';
    const textPrimary = darkMode ? '#FFF' : '#1a1a2e';
    const textSecondary = darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(26,26,46,0.5)';
    const accentColor = '#4ADE80';

    const handleSelect = (item) => {
        onSelect(item.key, item.image);
        onClose();
    };

    const renderItem = ({ item }) => {
        const isSelected = selectedKey === item.key;

        return (
            <TouchableOpacity
                style={[
                    styles.imageItem,
                    {
                        backgroundColor: cardBg,
                        borderColor: isSelected ? accentColor : (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                        borderWidth: isSelected ? 3 : 1,
                    }
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelect(item)}
            >
                <Image
                    source={item.image}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />

                {/* Gradient overlay */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.thumbnailGradient}
                />

                {/* Label */}
                <View style={styles.labelContainer}>
                    <Text style={styles.emoji}>{item.emoji}</Text>
                    <Text style={styles.label}>{item.label.toUpperCase()}</Text>
                </View>

                {/* Selected checkmark */}
                {isSelected && (
                    <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark" size={14} color="#FFF" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                <View style={[styles.modalContent, { backgroundColor: bgColor }]}>
                    {/* Header */}
                    <View style={[styles.header, { backgroundColor: accentColor }]}>
                        <Text style={styles.headerTitle}>SELECT IMAGE</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <Ionicons name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Subtitle */}
                    <View style={styles.subtitleContainer}>
                        <FontAwesome5 name="images" size={14} color={textSecondary} />
                        <Text style={[styles.subtitle, { color: textSecondary }]}>
                            Choose a category image
                        </Text>
                    </View>

                    {/* Image Grid */}
                    <FlatList
                        data={imageList}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.key}
                        numColumns={NUM_COLUMNS}
                        contentContainerStyle={styles.gridContainer}
                        columnWrapperStyle={styles.row}
                        showsVerticalScrollIndicator={false}
                    />

                    {/* None option */}
                    <TouchableOpacity
                        style={[styles.noneButton, {
                            backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                            borderColor: selectedKey === null ? accentColor : 'transparent',
                            borderWidth: selectedKey === null ? 2 : 0,
                        }]}
                        onPress={() => {
                            onSelect(null, null);
                            onClose();
                        }}
                    >
                        <Ionicons name="close-circle-outline" size={18} color={textSecondary} />
                        <Text style={[styles.noneButtonText, { color: textSecondary }]}>
                            NO IMAGE (AUTO-DETECT)
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    headerTitle: {
        fontSize: 14,
        fontFamily: retroFont,
        fontWeight: 'bold',
        color: '#FFF',
        letterSpacing: 1,
    },
    closeButton: {
        padding: 4,
    },
    subtitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    subtitle: {
        fontSize: 12,
        fontFamily: retroFont,
    },
    gridContainer: {
        padding: GRID_PADDING,
    },
    row: {
        gap: ITEM_GAP,
        marginBottom: ITEM_GAP,
    },
    imageItem: {
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    thumbnailGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
    },
    labelContainer: {
        position: 'absolute',
        bottom: 6,
        left: 6,
        right: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    emoji: {
        fontSize: 12,
    },
    label: {
        fontSize: 9,
        fontFamily: retroFont,
        fontWeight: 'bold',
        color: '#FFF',
        letterSpacing: 0.5,
    },
    selectedBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#4ADE80',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noneButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: GRID_PADDING,
        marginBottom: 20,
        paddingVertical: 14,
        borderRadius: 10,
        gap: 8,
    },
    noneButtonText: {
        fontSize: 11,
        fontFamily: retroFont,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});

// Export the IMAGE_BANK for use elsewhere
export { IMAGE_BANK };
export default ImageBankSelector;
