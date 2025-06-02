import React, { useState } from 'react';
import { FlatList, Text, View, StyleSheet, TouchableOpacity, Modal, Platform, Dimensions } from 'react-native';
import CategoryItem from './CategoryItem';
import RecentFlashcards from '../RecentFlashcards/RecentFlashcards';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // <-- Importa este hook

const { width, height } = Dimensions.get('window');
const scale = width / 375;
function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(newSize);
  } else {
    return Math.round(newSize) - 2;
  }
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

  const insets = useSafeAreaInsets(); // <-- Hook para conocer el notch

  const toggleModal = () => setModalVisible(!modalVisible);

  return (
    <View style={{ flex: 1, backgroundColor: darkModeEnabled ? '#121212' : '#f7f7f7' }}>
      <FlatList
        data={categories}
        ListHeaderComponent={() => (
          <>
            <View style={{ marginTop: insets.top + 8 }}>
              <RecentFlashcards
                recentCategories={recentCategories}
                onNavigateToFlashcardList={navigateToFlashcardList}
              />
              <View style={styles.titleRow}>
                <Text
                  style={[
                    styles.categoriesTitle,
                    { color: darkModeEnabled ? '#FFF' : '#191A1F' }
                  ]}
                >
                  Categories
                </Text>
                <TouchableOpacity
                  style={[
                    styles.plusButton,
                    {
                      backgroundColor: darkModeEnabled ? '#23262A' : '#fff',
                      shadowColor: darkModeEnabled ? '#23262A' : '#000',
                    },
                  ]}
                  onPress={toggleModal}
                  activeOpacity={0.85}
                >
                  <AntDesign name="plus" size={normalize(28)} color={darkModeEnabled ? '#fff' : '#191A1F'} />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
        renderItem={({ item }) => (
          <CategoryItem
            category={item}
            onPress={navigateToFlashcardList}
            onDelete={handleDeleteCategory}
            onImagePick={handleImagePick}
            colorPair={item.colorPair}
            darkModeEnabled={darkModeEnabled}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        numColumns={1}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={toggleModal}>
          <View style={[
            styles.modalContent,
            { backgroundColor: darkModeEnabled ? '#23262A' : '#fff' }
          ]}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                navigateToAddCategory();
                toggleModal();
              }}
            >
              <AntDesign name="plus" size={normalize(22)} color={darkModeEnabled ? '#fff' : '#23262A'} />
              <Text style={[
                styles.modalText,
                { color: darkModeEnabled ? '#E0E0E0' : '#23262A' }
              ]}>
                Agregar Categoría
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                navigateToAddGPT();
                toggleModal();
              }}
            >
              <MaterialCommunityIcons name="robot" size={normalize(22)} color={darkModeEnabled ? '#fff' : '#23262A'} />
              <Text style={[
                styles.modalText,
                { color: darkModeEnabled ? '#E0E0E0' : '#23262A' }
              ]}>
                Agregar Categoría Con IA
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CategoryList;

// --- ESTILOS RESPONSIVE ---
const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: width * 0.05, // 5% del ancho
    marginTop: height * 0.03,       // 3% del alto
    marginBottom: height * 0.02,
  },
  categoriesTitle: {
    fontSize: normalize(30),
    fontFamily: 'Pagebash',
    letterSpacing: -0.5,
  },
  plusButton: {
    width: width * 0.13,     // 13% del ancho de pantalla
    height: width * 0.13,
    borderRadius: width * 0.065,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.17,
        shadowRadius: 7,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(32,32,32,0.3)',
  },
  modalContent: {
    width: width > 450 ? 400 : width * 0.86,
    borderRadius: 22,
    padding: 24,
    alignItems: 'stretch',
    shadowColor: '#23262A',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.045,
    marginVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(100,100,100,0.06)',
  },
  modalText: {
    fontSize: normalize(18),
    fontFamily: 'WorsSansSemiBold',
    marginLeft: 15,
    letterSpacing: 0,
  },
  listContainer: {
    paddingTop: height * 0.01,
    paddingBottom: height * 0.15, // Espacio responsivo para TabBar
  },
});
