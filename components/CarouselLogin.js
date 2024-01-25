import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Dimensions, Animated, StyleSheet, Image } from 'react-native';
import { COLOR_PAIRS } from '../constants'; // Asegúrate de que la ruta sea correcta

const windowWidth = Dimensions.get('window').width;

const slide1Image = require('../assets/slide1.png');
const slide2Image = require('../assets/slide2.png');
const slide3Image = require('../assets/slide3.png');

const CarouselLogin = () => {
    const [activeSlide, setActiveSlide] = useState(0);
    const backgroundColorAnim = useRef(new Animated.Value(0)).current;

    const slides = [
        {
            title: "Crea Flashcards con IA",
            content: "Genera flashcards únicas con ChatGPT. Aprende cualquier tema, ¡de manera inteligente!",
            image: slide1Image
        },
        {
            title: "Domina el Español",
            content: "Ejercicios interactivos para elevar tu español a otro nivel. ¡Aprende y diviértete!",
            image: slide2Image
        },
        {
            title: "Practica Speaking con IA",
            content: "Habla, interactúa y mejora con nuestra IA. ¡Gana fluidez en tiempo real!",
            image: slide3Image
        },
    ];

    useEffect(() => {
        Animated.timing(backgroundColorAnim, {
            toValue: activeSlide,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [activeSlide]);

    const backgroundColor = backgroundColorAnim.interpolate({
        inputRange: slides.map((_, index) => index),
        outputRange: slides.map((_, index) => COLOR_PAIRS[`pair${index + 6}`].background),
    });

    const handleScroll = (event) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        setActiveSlide(roundIndex);
    };

    return (
        <Animated.View style={[styles.container, { backgroundColor }]}>
            <ScrollView
                horizontal
                pagingEnabled
                onScroll={handleScroll}
                showsHorizontalScrollIndicator={false}
            >
                {slides.map((slide, index) => (
                    <View key={index} style={styles.slide}>
                        <Image source={slide.image} style={styles.slideImage} />
                        <Text style={[styles.title, { color: COLOR_PAIRS[`pair${index + 6}`].text }]}>
                            {slide.title}
                        </Text>
                        <Text style={[styles.content, { color: COLOR_PAIRS[`pair${index + 6}`].text }]}>
                            {slide.content}
                        </Text>
                    </View>
                ))}
            </ScrollView>
            <View style={styles.indicatorContainer}>
                {slides.map((_, index) => (
                    <Text key={index} style={[styles.indicator, { color: index === activeSlide ? COLOR_PAIRS[`pair${index + 4}`].text : 'gray' }]}>
                        ⬤
                    </Text>
                ))}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    slide: {
        width: windowWidth,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    slideImage: {
        width: 250,
        height: 250,
        marginBottom: 20,
        resizeMode: 'contain'
    },
    title: {
        fontSize: 30,
        textAlign: 'center',
        fontFamily: 'Pagebash',
        marginBottom: 10
    },
    content: {
        fontSize: 18,
        textAlign: 'center',
        fontFamily: 'Pagebash'
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0
    },
    indicator: {
        margin: 3,
        fontFamily: 'Pagebash'
    }
});

export default CarouselLogin;
