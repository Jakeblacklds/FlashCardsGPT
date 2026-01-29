import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Dimensions, Animated, StyleSheet, Image, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { COLOR_PAIRS } from '../../constants';

const windowWidth = Dimensions.get('window').width;

const slide1Image = require('../../assets/slide1.png');
const slide2Image = require('../../assets/slide2.png');
const slide3Image = require('../../assets/slide3.png');

const CarouselLogin = ({ onSlideChange }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const backgroundColorAnim = useRef(new Animated.Value(0)).current;

  const slides = [
    {
      number: "001",
      icon: "robot",
      title: "AI FLASHCARDS",
      subtitle: "Powered by ChatGPT",
      content: "Generate unique flashcards instantly. Just type a topic and start learning!",
      image: slide1Image,
    },
    {
      number: "002",
      icon: "brain",
      title: "SMART REVIEW",
      subtitle: "SM-2 Algorithm",
      content: "Science-backed spaced repetition. Review at the perfect time to never forget!",
      image: slide2Image,
    },
    {
      number: "003",
      icon: "gamepad",
      title: "FUN TRAINING",
      subtitle: "Gamified Learning",
      content: "Earn XP, build streaks, and level up your vocabulary with fun exercises!",
      image: slide3Image,
    },
  ];

  useEffect(() => {
    Animated.timing(backgroundColorAnim, {
      toValue: activeSlide,
      duration: 400,
      useNativeDriver: false,
    }).start();
    if (onSlideChange) onSlideChange(activeSlide);
  }, [activeSlide, onSlideChange]);

  const getColorPair = (index) => {
    const pairKey = `pair${index + 6}`;
    return COLOR_PAIRS[pairKey] || { background: '#6366F1', text: '#FFFFFF' };
  };

  const backgroundColor = backgroundColorAnim.interpolate({
    inputRange: slides.map((_, index) => index),
    outputRange: slides.map((_, index) => getColorPair(index).background),
  });

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (roundIndex !== activeSlide && roundIndex >= 0 && roundIndex < slides.length) {
      setActiveSlide(roundIndex);
    }
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        horizontal
        pagingEnabled
        onScroll={handleScroll}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="fast"
        contentContainerStyle={{ alignItems: 'center' }}
        snapToInterval={windowWidth}
        snapToAlignment="center"
      >
        {slides.map((slide, index) => {
          const colorPair = getColorPair(index);
          return (
            <View key={index} style={styles.slide}>

              {/* Card estilo Pokédex */}
              <View style={styles.card}>
                {/* Header con número */}
                <View style={[styles.cardHeader, { backgroundColor: colorPair.background }]}>
                  <Text style={styles.cardNumber}>#{slide.number}</Text>
                  <View style={styles.headerDecor}>
                    <View style={[styles.decorDot, { backgroundColor: '#FF6B6B' }]} />
                    <View style={[styles.decorDot, { backgroundColor: '#FFD93D' }]} />
                    <View style={[styles.decorDot, { backgroundColor: '#4ADE80' }]} />
                  </View>
                </View>

                {/* Contenido principal */}
                <View style={styles.cardBody}>
                  {/* Imagen con marco */}
                  <View style={[styles.imageFrame, { borderColor: colorPair.background }]}>
                    <Image source={slide.image} style={styles.slideImage} />
                  </View>

                  {/* Título */}
                  <View style={styles.titleContainer}>
                    <Text style={[styles.titleLabel, { color: colorPair.background }]}>
                      ◆ {slide.subtitle.toUpperCase()} ◆
                    </Text>
                    <Text style={styles.title}>{slide.title}</Text>
                  </View>

                  {/* Descripción */}
                  <Text style={styles.description}>{slide.content}</Text>

                  {/* Badge de feature */}
                  <View style={[styles.featureBadge, { backgroundColor: `${colorPair.background}15`, borderColor: `${colorPair.background}40` }]}>
                    <FontAwesome5 name={slide.icon} size={12} color={colorPair.background} />
                    <Text style={[styles.featureText, { color: colorPair.background }]}>
                      FLASHCARDEX FEATURE
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Indicadores estilo Pokédex */}
      <View style={styles.indicatorContainer}>
        <View style={styles.indicatorLabel}>
          <Text style={styles.indicatorText}>SLIDE {activeSlide + 1} OF {slides.length}</Text>
        </View>
        <View style={styles.indicatorDots}>
          {slides.map((_, index) => {
            const colorPair = getColorPair(activeSlide);
            const isActive = index === activeSlide;
            return (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: isActive ? colorPair.background : 'rgba(255,255,255,0.3)',
                    width: isActive ? 20 : 8,
                  }
                ]}
              />
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    paddingBottom: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  slide: {
    width: windowWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 8,
  },

  // Card estilo Pokédex
  card: {
    width: windowWidth - 40,
    backgroundColor: '#FFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 5 },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cardNumber: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
  },
  headerDecor: {
    flexDirection: 'row',
    gap: 5,
  },
  decorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cardBody: {
    padding: 16,
    alignItems: 'center',
  },
  imageFrame: {
    borderWidth: 3,
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  slideImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  titleLabel: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '900',
    color: '#1a1a2e',
    letterSpacing: 1,
    textAlign: 'center',
  },
  description: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 6,
  },
  featureText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Indicadores
  indicatorContainer: {
    alignItems: 'center',
    paddingTop: 10,
    gap: 6,
  },
  indicatorLabel: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  indicatorText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
    color: '#FFF',
    letterSpacing: 1,
  },
  indicatorDots: {
    flexDirection: 'row',
    gap: 6,
  },
  indicator: {
    height: 6,
    borderRadius: 3,
  },
});

export default CarouselLogin;
