import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const IMAGE_STYLES = [
  { id: 'style_1', label: 'Ilustración', icon: 'color-palette-outline' },
  { id: 'style_2', label: 'Minimalista', icon: 'ellipse-outline' },
  { id: 'style_3', label: '3D Render', icon: 'cube-outline' },
  { id: 'style_4', label: 'Pixel Art', icon: 'grid-outline' },
  { id: 'style_5', label: 'Abstracto', icon: 'settings-outline' },
  { id: 'style_6', label: 'Fantasía', icon: 'flame-outline' },
  { id: 'style_7', label: 'Cyberpunk', icon: 'hardware-chip-outline' },
  { id: 'style_8', label: 'Acuarela', icon: 'water-outline' },
  { id: 'style_9', label: 'Ninguno', icon: 'close-circle-outline' },
];

export const ImageStyleSelector = ({ selectedStyleLabel, onStyleSelect, darkModeEnabled, containerStyle }) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.title, darkModeEnabled ? styles.titleDark : styles.titleLight]}>
        IMAGE STYLE
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagsScrollView}
      >
        {IMAGE_STYLES.map((style) => {
          const isSelected = selectedStyleLabel === style.label;
          return (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.tag,
                darkModeEnabled ? styles.tagDark : styles.tagLight,
                isSelected && styles.tagSelected,
              ]}
              onPress={() => onStyleSelect(style)}
              activeOpacity={0.7}
            >
              {isSelected && (
                <LinearGradient
                  colors={['#4F46E5', '#06B6D4']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              )}
              <Ionicons
                name={style.icon}
                size={16}
                color={isSelected ? '#FFF' : (darkModeEnabled ? '#94A3B8' : '#64748B')}
                style={styles.icon}
              />
              <Text style={[
                styles.tagText,
                darkModeEnabled ? styles.tagTextDark : styles.tagTextLight,
                isSelected && styles.tagTextSelected,
              ]}>
                {style.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20, marginTop: 10, width: '100%', paddingLeft: '5%' },
  title: { fontSize: 12, fontFamily: 'WorsSansSemiBold', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' },
  titleLight: { color: '#64748B' },
  titleDark: { color: '#94A3B8' },
  tagsScrollView: { paddingRight: 20 },
  tag: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 100, marginRight: 8, borderWidth: 1, overflow: 'hidden' },
  tagLight: { backgroundColor: '#FFFFFF', borderColor: 'rgba(0,0,0,0.05)' },
  tagDark: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
  tagSelected: { borderWidth: 0, borderColor: 'transparent' },
  icon: { marginRight: 6 },
  tagText: { fontSize: 13, fontWeight: '500' },
  tagTextLight: { color: '#475569' },
  tagTextDark: { color: '#CBD5E1' },
  tagTextSelected: { color: '#FFFFFF', fontWeight: 'bold' },
});