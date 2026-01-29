import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { tags } from '../utils/constants'; // Asegúrate que esta ruta es correcta
import styles from '../AddGpt.styles';

const selectedTagGradient = ['#4F46E5', '#06B6D4'];

export const TagSelector = ({ selectedTags, onTagPress, darkModeEnabled, tagContainerStyle }) => (
  <Animated.View style={[styles.bentoBoxWrapper, tagContainerStyle]}>
    <Text style={[styles.sectionTitle, darkModeEnabled && styles.sectionTitleDark]}>
      Settings
    </Text>

    <View style={[styles.bentoBoxContainer, darkModeEnabled && styles.bentoBoxContainerDark]}>
      <BlurView
        tint={darkModeEnabled ? 'dark' : 'light'}
        intensity={Platform.OS === 'ios' ? 50 : 90}
      >
        <View style={[styles.tagsContainer, styles.bentoBoxPadding]}>
          {tags.map((tag) => {
            const selected = selectedTags.includes(tag.label);
            return (
              <TouchableOpacity
                key={tag.label}
                style={[
                  styles.tag,
                  darkModeEnabled && styles.tagDark,
                  selected && styles.tagSelected
                ]}
                onPress={() => onTagPress(tag)}
                activeOpacity={0.7}
              >
                {selected && (
                  <LinearGradient
                    colors={selectedTagGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFill, { borderRadius: 100 }]}
                  />
                )}
                <FontAwesome5
                  name={tag.icon}
                  size={12}
                  color={selected ? '#fff' : (darkModeEnabled ? '#94A3B8' : '#64748B')}
                  style={styles.tagIcon}
                />
                <Text style={[
                  styles.tagText,
                  darkModeEnabled && styles.tagTextDark,
                  selected && styles.tagTextSelected
                ]}>
                  {tag.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  </Animated.View>
);