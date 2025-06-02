// Ubicación: Screens/Flashcards/CategoriesScreen/components/AddGpt/components/ImageStyleSelector.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const IMAGE_STYLES = [
  { id: 'style_1', label: 'Ilustración', icon: 'color-palette-outline', promptPrefix: 'illustration style,' },
  { id: 'style_2', label: 'Minimalista', icon: 'ellipse-outline', promptPrefix: 'minimalist style,' },
  { id: 'style_3', label: '3D Render', icon: 'cube-outline', promptPrefix: '3d render,' },
  { id: 'style_4', label: 'Pixel Art', icon: 'grid-outline', promptPrefix: 'pixel art style,' },
  { id: 'style_5', label: 'Abstracto', icon: 'settings-outline', promptPrefix: 'abstract art,' },
  { id: 'style_6', label: 'Fantasía', icon: 'flame-outline', promptPrefix: 'fantasy art style,' },
  { id: 'style_7', label: 'Cyberpunk', icon: 'hardware-chip-outline', promptPrefix: 'cyberpunk style,' },
  { id: 'style_8', label: 'Acuarela', icon: 'water-outline', promptPrefix: 'watercolor style,' },
  { id: 'style_9', label: 'Ninguno', icon: 'close-circle-outline', promptPrefix: '' },
];

export const ImageStyleSelector = ({ selectedStyleLabel, onStyleSelect, darkModeEnabled, containerStyle }) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.title, darkModeEnabled ? styles.titleDark : styles.titleLight]}>
        Estilo de Imagen para Categoría (Opcional)
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScrollView}>
        {IMAGE_STYLES.map((style) => (
          <TouchableOpacity
            key={style.id}
            style={[
              styles.tag,
              darkModeEnabled ? styles.tagDark : styles.tagLight,
              selectedStyleLabel === style.label && (darkModeEnabled ? styles.tagSelectedDark : styles.tagSelectedLight),
            ]}
            onPress={() => onStyleSelect(style)}
            activeOpacity={0.7}
          >
            {style.icon && <Ionicons name={style.icon} size={18} color={selectedStyleLabel === style.label ? (darkModeEnabled ? '#FFFFFF' : '#FFFFFF') : (darkModeEnabled ? '#C0C0C0' : '#555')} style={styles.icon} />}
            <Text
              style={[
                styles.tagText,
                darkModeEnabled ? styles.tagTextDark : styles.tagTextLight,
                selectedStyleLabel === style.label && (darkModeEnabled ? styles.tagTextSelectedDark : styles.tagTextSelectedLight),
              ]}
            >
              {style.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
    paddingHorizontal: 5,
    width: '100%',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 15,
  },
  titleLight: { color: '#4A4A4A' },
  titleDark: { color: '#D1D1D1' },
  tagsScrollView: { paddingBottom: 5 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  tagLight: { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0' },
  tagDark: { backgroundColor: '#2A2A2E', borderColor: '#404040' },
  tagSelectedLight: { backgroundColor: '#8657E0', borderColor: '#7A4ED6' },
  tagSelectedDark: { backgroundColor: '#9362F5', borderColor: '#8657E0' },
  icon: { marginRight: 8 },
  tagText: { fontSize: 14, fontWeight: '500' },
  tagTextLight: { color: '#333' },
  tagTextDark: { color: '#EAEAEA' },
  tagTextSelectedLight: { color: '#FFFFFF' },
  tagTextSelectedDark: { color: '#FFFFFF' },
});