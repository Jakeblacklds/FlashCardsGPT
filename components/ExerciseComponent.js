import React from 'react';
import { View, Text, Alert } from 'react-native';
import ListenAndChooseExercise from './ListenAndChooseExercise';
import ListenEnglishExercise from './ListenEnglishExercise';
import WriteWordExercise from './WriteWordExercise';
import SpeakAndTranslateExercise from './SpeakAndTranslateExercise';

const ExerciseComponent = ({ exercisesStarted, learnedWordsCount, numWordsToLearn, currentWord, handleWordCompleted, selectedWords, category, colorPair, currentExerciseTypeIndex }) => {
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

    return <SelectedExerciseComponent {...exerciseProps} />;
};

export default ExerciseComponent;
