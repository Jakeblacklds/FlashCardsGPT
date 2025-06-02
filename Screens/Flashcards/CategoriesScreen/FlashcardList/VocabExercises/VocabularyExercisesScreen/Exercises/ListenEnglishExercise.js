import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import LottieView from 'lottie-react-native';
import { useSelector } from 'react-redux';
import { selectDarkMode } from '../../../../../../../redux/darkModeSlice'; 

const ListenEnglishExercise = ({ word, onComplete, onMistake, flashcards, colorPair }) => {
    const [options, setOptions] = useState([]);
    const [isCorrect, setIsCorrect] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const soundAnimationRef = useRef(null);
    const correctAnimationRef = useRef(null);
    const congratsAnimationRef = useRef(null);
    const darkModeEnabled = useSelector(selectDarkMode);

    useEffect(() => {
        setOptions(generateOptions());
        setIsCorrect(null);
        setSelectedOption(null);
    }, [word]);

    const generateOptions = () => {
        const correctOption = word.spanish;
        let incorrectOptions = flashcards
            .filter(fc => fc.id !== word.id)
            .map(fc => fc.spanish)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
        const optionsArray = [...incorrectOptions, correctOption];
        return optionsArray.sort(() => Math.random() - 0.5);
    };

    const speak = (text, language = 'en-US') => {
        const options = { language };
        Speech.speak(text, options);
    };

    const handlePressSpeak = () => {
        speak(word.english);
        if (soundAnimationRef.current) {
            soundAnimationRef.current.play();
            setTimeout(() => {
                if (soundAnimationRef.current) {
                    soundAnimationRef.current.reset();
                }
            }, 900);
        }
    };

    const checkAnswer = (option) => {
        setSelectedOption(option);
        const isAnswerCorrect = option === word.spanish;
        setIsCorrect(isAnswerCorrect);
        if (isAnswerCorrect) {
            if (correctAnimationRef.current) {
                correctAnimationRef.current.play();
            }
            if (congratsAnimationRef.current) {
                congratsAnimationRef.current.play();
            }
        }
        setTimeout(() => {
            isAnswerCorrect ? onComplete() : onMistake();
        }, 1000);
    };

    const dynamicStyles = StyleSheet.create({
        container: {
            backgroundColor: darkModeEnabled ? colorPair.background : colorPair.text,
            width: '100%',
            height: '100%',
            position: 'relative',
        },
        option: {
            backgroundColor: darkModeEnabled ? colorPair.background : colorPair.background,
            borderColor: darkModeEnabled ? colorPair.background : colorPair.text,
        },
        optionText: {
            color: darkModeEnabled ? colorPair.text : colorPair.text,
        },
        darkModeOverlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        },
        darkModeOverlayButton: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 15,
        },
    });

    return (
        <View style={[styles.container, dynamicStyles.container]}>
            {darkModeEnabled && <View style={dynamicStyles.darkModeOverlay} />}
            <View style={styles.optionsRow}>
                {options.slice(0, 2).map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.option,
                            dynamicStyles.option,
                            selectedOption === option && (isCorrect ? styles.correctOption : styles.incorrectOption),
                        ]}
                        onPress={() => checkAnswer(option)}
                        disabled={isCorrect !== null}
                    >
                        {darkModeEnabled && <View style={dynamicStyles.darkModeOverlayButton} />}
                        <Text style={[styles.optionText, dynamicStyles.optionText]}>{option}</Text>
                        {selectedOption === option && isCorrect && (
                            <>
                                <LottieView
                                    ref={correctAnimationRef}
                                    source={require('../../../../../../../assets/correct.json')}
                                    autoPlay={true}
                                    loop={false}
                                    style={styles.animation}
                                />
                                <LottieView
                                    ref={congratsAnimationRef}
                                    source={require('../../../../../../../assets/congrats.json')}
                                    autoPlay={true}
                                    loop={false}
                                    style={styles.animation}
                                />
                            </>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
            <TouchableOpacity onPress={handlePressSpeak} style={styles.speakerButton}>
                <LottieView
                    ref={soundAnimationRef}
                    source={require('../../../../../../../assets/sound.json')}
                    loop={false}
                    speed={1.5}
                    style={styles.speakerAnimation}
                />
            </TouchableOpacity>
            <View style={styles.optionsRow}>
                {options.slice(2).map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.option,
                            dynamicStyles.option,
                            selectedOption === option && (isCorrect ? styles.correctOption : styles.incorrectOption),
                        ]}
                        onPress={() => checkAnswer(option)}
                        disabled={isCorrect !== null}
                    >
                        {darkModeEnabled && <View style={dynamicStyles.darkModeOverlayButton} />}
                        <Text style={[styles.optionText, dynamicStyles.optionText]}>{option}</Text>
                        {selectedOption === option && isCorrect && (
                            <>
                                <LottieView
                                    ref={correctAnimationRef}
                                    source={require('../../../../../../../assets/correct.json')}
                                    autoPlay={true}
                                    loop={false}
                                    style={styles.animation}
                                />
                                <LottieView
                                    ref={congratsAnimationRef}
                                    source={require('../../../../../../../assets/congrats.json')}
                                    autoPlay={true}
                                    loop={false}
                                    style={styles.animation}
                                />
                            </>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 20,
    },
    speakerButton: {
        position: 'absolute',
        top: '46%',
        marginBottom: 0,
    },
    optionsRow: {
        flexDirection: 'row',
        width: '110%',
        height: '40%',
    },
    option: {
        borderRadius: 15,
        marginVertical: 5,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionText: {
        fontSize: 40,
        fontFamily: 'Pagebash',
    },
    correctOption: {
        backgroundColor: '#00C851',
    },
    incorrectOption: {
        backgroundColor: '#ff4444',
    },
    feedbackText: {
        marginTop: 20,
        position: 'absolute',
        bottom: '50%',
        fontSize: 20,
        fontWeight: 'bold',
    },
    animation: {
        width: 150,
        height: 150,
        position: 'absolute',
    },
    speakerAnimation: {
        width: 100,
        height: 100,
    },
});

export default ListenEnglishExercise;
