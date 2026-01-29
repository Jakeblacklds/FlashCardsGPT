import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Dimensions
} from 'react-native';
import { useSelector } from 'react-redux';
import CategoryItem from './CategoryItem';
import PendingCategoryItem from './PendingCategoryItem';
import RecentFlashcards from '../RecentFlashcards/RecentFlashcards';
import GameBoyFrame from './GameBoyFrame';
import RetroButton, { RetroIconButton } from './RetroButton';
import PixelDivider from './PixelDivider';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { selectPendingCategories } from '../../../../redux/FlashcardSlice';

const { width } = Dimensions.get('window');

// --- CÁLCULO DE GRID ---
const NUM_COLUMNS = 2;
const SCREEN_PADDING = 16;
const ITEM_GAP = 12;
const TOTAL_AVAILABLE_WIDTH = width - (SCREEN_PADDING * 2) - (ITEM_GAP * (NUM_COLUMNS - 1));
const CARD_WIDTH = Math.floor(TOTAL_AVAILABLE_WIDTH / NUM_COLUMNS);
const CARD_HEIGHT = CARD_WIDTH * 1.3;

const scale = width / 375;
function normalize(size) {
  const newSize = size * scale;
  return Platform.OS === 'ios' ? Math.round(newSize) : Math.round(newSize) - 2;
}

const CategoryList = ({
  categories,
  navigateToFlashcardList,
  handleDeleteCategory,
  handleImagePick,
  darkModeEnabled,
  recentCategories,
  navigateToAddCategory,
  navigateToAddGPT,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  // Get pending categories from Redux
  const pendingCategories = useSelector(selectPendingCategories);

  const toggleModal = useCallback(() => setModalVisible(!modalVisible), [modalVisible]);

  // Combine pending + regular categories for the FlatList
  const combinedData = useMemo(() => {
    const pendingItems = (pendingCategories || []).map(p => ({ ...p, isPending: true }));
    const regularItems = (categories || []).map(c => ({ ...c, isPending: false }));
    return [...pendingItems, ...regularItems];
  }, [pendingCategories, categories]);

  const renderHeader = useCallback(() => (
    <View>
      {/* Recent Flashcards - fuera del frame */}
      <View style={{ marginTop: insets.top + 10 }}>
        <RecentFlashcards
          recentCategories={recentCategories}
          onNavigateToFlashcardList={navigateToFlashcardList}
        />
      </View>

      {/* Divider decorativo entre secciones */}
      <PixelDivider
        text="CARTRIDGES"
        darkMode={darkModeEnabled}
      />

      {/* Header con título y botón */}
      <View style={styles.headerContainer}>
        <View style={styles.titleSection}>
          <View style={styles.titleDecoration}>
            <View style={[styles.decorPixel, {
              backgroundColor: darkModeEnabled ? '#4ADE80' : '#306230'
            }]} />
            <View style={[styles.decorPixel, {
              backgroundColor: darkModeEnabled ? '#4ADE80' : '#306230'
            }]} />
          </View>
          <View>
            <Text style={[styles.categoriesTitle, {
              color: darkModeEnabled ? '#FFF' : '#191A1F'
            }]}>
              COLLECTION
            </Text>
            <View style={styles.subtitleRow}>
              <View style={[styles.subtitleDot, {
                backgroundColor: darkModeEnabled ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'
              }]} />
              <Text style={[styles.subtitle, {
                color: darkModeEnabled ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'
              }]}>
                {categories.length} GAME{categories.length !== 1 ? 'S' : ''}
              </Text>
            </View>
          </View>
        </View>

        <RetroIconButton
          onPress={toggleModal}
          icon={Ionicons}
          iconName="add"
          iconSize={24}
          color={darkModeEnabled ? '#4ADE80' : '#6366F1'}
          darkMode={darkModeEnabled}
        />
      </View>

      <PixelDivider darkMode={darkModeEnabled} variant="dots" />
    </View>
  ), [recentCategories, darkModeEnabled, categories.length, toggleModal, navigateToFlashcardList, insets.top]);

  const renderItem = useCallback(({ item }) => {
    // Render PendingCategoryItem for pending items
    if (item.isPending) {
      return (
        <PendingCategoryItem
          pendingCategory={item}
          onRetry={(pending) => {
            // TODO: Implement retry logic
            console.log('Retry:', pending);
          }}
          onCancel={(pending) => {
            console.log('Cancelled:', pending);
          }}
        />
      );
    }

    // Render regular CategoryItem
    return (
      <CategoryItem
        category={item}
        onPress={navigateToFlashcardList}
        onDelete={handleDeleteCategory}
        onImagePick={handleImagePick}
        initialColorPair={item.colorPair}
        darkModeEnabled={darkModeEnabled}
        cardWidth={CARD_WIDTH}
        cardHeight={CARD_HEIGHT}
      />
    );
  }, [navigateToFlashcardList, handleDeleteCategory, handleImagePick, darkModeEnabled]);

  return (
    <View style={{ flex: 1, backgroundColor: darkModeEnabled ? '#0D0D0E' : '#F5F5F7' }}>
      <FlatList
        data={combinedData}
        ListHeaderComponent={renderHeader}
        keyExtractor={(item) => item.isPending ? item.tempId : item.id.toString()}
        extraData={[darkModeEnabled, recentCategories, pendingCategories]}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={{
          paddingHorizontal: SCREEN_PADDING,
          paddingBottom: 100,
        }}
        columnWrapperStyle={{
          gap: ITEM_GAP,
        }}
        ItemSeparatorComponent={() => <View style={{ height: ITEM_GAP }} />}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true} // Cambiado a true para mejor performance
        maxToRenderPerBatch={6} // Reducido para no saturar el hilo
        updateCellsBatchingPeriod={100}
        initialNumToRender={8}
        windowSize={5}
      />

      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={toggleModal}
        >
          <View style={[
            styles.modalContent,
            { backgroundColor: darkModeEnabled ? '#1A1C1E' : '#F5F5F7' }
          ]}>
            <View style={[
              styles.modalHeader,
              { borderBottomColor: darkModeEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
            ]}>
              <FontAwesome5
                name="plus-circle"
                size={20}
                color={darkModeEnabled ? '#4ADE80' : '#6366F1'}
              />
              <Text style={[styles.modalTitle, { color: darkModeEnabled ? '#FFF' : '#191A1F' }]}>
                NEW CONTENT
              </Text>
            </View>

            <View style={styles.modalBody}>
              <RetroButton
                text="ADD CATEGORY MANUALLY"
                onPress={() => {
                  toggleModal();
                  navigateToAddCategory();
                }}
                color={darkModeEnabled ? '#4ADE80' : '#6366F1'}
                darkMode={darkModeEnabled}
                icon="plus"
                style={styles.modalButton}
              />

              <View style={styles.modalSeparator}>
                <View style={[styles.sepLine, { backgroundColor: darkModeEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
                <Text style={[styles.sepText, { color: darkModeEnabled ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }]}>OR</Text>
                <View style={[styles.sepLine, { backgroundColor: darkModeEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
              </View>

              <RetroButton
                text="GENERATE WITH AI (GPT)"
                onPress={() => {
                  toggleModal();
                  navigateToAddGPT();
                }}
                color={darkModeEnabled ? '#F59E0B' : '#F59E0B'}
                darkMode={darkModeEnabled}
                icon="robot"
                style={styles.modalButton}
              />
            </View>

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={toggleModal}
            >
              <Text style={[styles.closeModalText, { color: darkModeEnabled ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }]}>
                CANCEL
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleDecoration: {
    gap: 4,
  },
  decorPixel: {
    width: 6,
    height: 6,
    borderRadius: 1,
  },
  categoriesTitle: {
    fontSize: normalize(20),
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 2,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  subtitleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: normalize(10),
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: normalize(16),
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
  },
  modalBody: {
    gap: 12,
  },
  modalButton: {
    width: '100%',
  },
  modalSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 10,
  },
  sepLine: {
    flex: 1,
    height: 1,
  },
  sepText: {
    fontSize: normalize(10),
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  closeModalButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  closeModalText: {
    fontSize: normalize(11),
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
  },
});

export default CategoryList;