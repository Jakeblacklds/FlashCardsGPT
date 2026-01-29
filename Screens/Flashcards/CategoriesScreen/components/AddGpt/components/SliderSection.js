import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import { BlurView } from 'expo-blur';
// Eliminamos Ionicons, no los necesitamos para este look ultra-limpio
import styles from '../AddGpt.styles';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

export const SliderSection = ({ numFlashcards, onValueChange, darkModeEnabled, sliderContainerStyle }) => (
  <Animated.View style={[
    styles.bentoBoxWrapper,
    sliderContainerStyle
  ]}>
    {/* Eliminamos el título exterior "Quantity", lo integraremos dentro */}

    <View style={[
      styles.bentoBoxContainer,
      darkModeEnabled && styles.bentoBoxContainerDark,
      { borderRadius: 24 } // Bordes un poco más redondeados para este bloque grande
    ]}>
      <BlurView
        tint={darkModeEnabled ? 'dark' : 'light'}
        intensity={Platform.OS === 'ios' ? 50 : 85}
      >
        <View style={[
          styles.sliderContent,
          styles.bentoBoxPadding,
          // MÁS ESPACIO VERTICAL: Clave para el look moderno
          { paddingVertical: isSmallDevice ? 24 : 32 }
        ]}>

          {/* 1. Título sutil superior */}
          <Text style={[
            styles.sectionTitle,
            darkModeEnabled && styles.sectionTitleDark,
            { textAlign: 'center', marginBottom: 4, fontSize: 12, opacity: 0.7 }
          ]}>
            TOTAL FLASHCARDS
          </Text>

          {/* 2. EL HÉROE TIPOGRÁFICO: Número Gigante */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 24 }}>
            <Text style={[
              styles.sliderText,
              darkModeEnabled && styles.sliderTextDark,
              // Sobreescribimos el tamaño para hacerlo ENORME
              {
                fontSize: isSmallDevice ? 56 : 72,
                lineHeight: isSmallDevice ? 60 : 76,
                marginBottom: 0,
                letterSpacing: -2
              }
            ]}>
              {numFlashcards}
            </Text>
            {/* La palabra "cards" más pequeña al lado */}
            <Text style={{
              fontSize: isSmallDevice ? 18 : 22,
              color: darkModeEnabled ? '#94A3B8' : '#64748B',
              fontFamily: 'WorsSansSemiBold',
              marginLeft: 8,
              marginBottom: isSmallDevice ? 8 : 10, // Alineación base con el número gigante
            }}>
              cards
            </Text>
          </View>

          {/* 3. El Slider Limpio (Sin etiquetas debajo) */}
          <Slider
            style={[
              styles.slider,
              // Hacemos el área táctil más alta
              { height: 44, width: '95%' }
            ]}
            minimumValue={1}
            maximumValue={20}
            step={1}
            value={numFlashcards}
            onValueChange={onValueChange}
            // --- COLORES VIBRANTES ---
            // Track Activo: Cyan Eléctrico (#06B6D4) para que resalte
            minimumTrackTintColor="#06B6D4"
            // Track Inactivo: Más sutil
            maximumTrackTintColor={darkModeEnabled ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
            // Thumb (Botón): Blanco puro en dark mode para máximo contraste
            thumbTintColor={darkModeEnabled ? "#FFFFFF" : "#4F46E5"}
          />

          {/* Se eliminaron las etiquetas Min 1 / Max 20 para limpieza total */}

        </View>
      </BlurView>
    </View>
  </Animated.View>
);