import React, { useEffect } from 'react';
import { View, Text, Alert, StatusBar, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import ListenAndChooseExercise from './ListenAndChooseExercise';
import ListenEnglishExercise from './ListenEnglishExercise';
import WriteWordExercise from './WriteWordExercise';
import SpeakAndTranslateExercise from './SpeakAndTranslateExercise';
import { selectDarkMode } from '../../../../../../../redux/darkModeSlice'; 



const ExerciseComponent = ({ exercisesStarted, learnedWordsCount, numWordsToLearn, currentWord, handleWordCompleted, selectedWords, category, colorPair, currentExerciseTypeIndex }) => {
    const darkModeEnabled = useSelector(selectDarkMode);

    useEffect(() => {
        StatusBar.setBackgroundColor(darkModeEnabled ? colorPair.background : colorPair.background);
    }, [darkModeEnabled, colorPair]);

    if (!exercisesStarted) {
        return <Text>How many words do you want learn?</Text>;
    }

    if (learnedWordsCount === numWordsToLearn) {
        Alert.alert(`¡Felicidades! Has aprendido ${numWordsToLearn} palabras.`);
        return <Text>¡Bien hecho!</Text>;
    }

    if (!currentWord) {
        return <Text>Esperando para comenzar los ejercicios...</Text>;
    }

    const exerciseTypes = [
        ListenAndChooseExercise,
        WriteWordExercise,
        ListenEnglishExercise,
    ];
    const SelectedExerciseComponent = exerciseTypes[currentExerciseTypeIndex];

    const exerciseProps = {
        word: currentWord,
        category: category,
        onComplete: () => handleWordCompleted(currentWord.id, true),
        onMistake: () => handleWordCompleted(currentWord.id, false),
        flashcards: selectedWords,
        colorPair: colorPair,
    };

    return (
        <View style={[styles.container, { backgroundColor: darkModeEnabled ? colorPair.background : colorPair.text }]}>
            {darkModeEnabled && <View style={styles.darkModeOverlay} />}
            <SelectedExerciseComponent {...exerciseProps} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        borderRadius: 10,
    },
    darkModeOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo negro con opacidad
        borderRadius: 10,
    },
});

export default ExerciseComponent;
