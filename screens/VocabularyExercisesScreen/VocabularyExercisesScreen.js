import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectFlashcardsByCategory, markFlashcardAsLearned } from '../../redux/FlashcardSlice';
import ExerciseComponent from '../../components/ExerciseComponent';
import WordSelectionComponent from '../../components/WordSelectionComponent';
import styles from './VocabularyExercisesScreen.styles';

const VocabularyExercisesScreen = ({ route, navigation }) => {
    const dispatch = useDispatch();
    const { category, colorPair } = route.params;
    const darkModeEnabled = useSelector((state) => state.darkMode.isEnabled);
    const flashcards = useSelector((state) => selectFlashcardsByCategory(state, category));
    const [numWordsToLearn, setNumWordsToLearn] = useState(0);
    const [learnedWordsCount, setLearnedWordsCount] = useState(0);
    const [selectedWords, setSelectedWords] = useState([]);
    const [wordScores, setWordScores] = useState({});
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [exercisesStarted, setExercisesStarted] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [showMemorizedWords, setShowMemorizedWords] = useState(false);
    const [memorizedWordsHeight, setMemorizedWordsHeight] = useState(new Animated.Value(0));
    const [currentExerciseTypeIndex, setCurrentExerciseTypeIndex] = useState(null);
    const [currentWord, setCurrentWord] = useState(null);
    const [lastExerciseTypeIndex, setLastExerciseTypeIndex] = useState(null);



    useEffect(() => {
        setModalVisible(true);
    }, []);

    useEffect(() => {
        if (exercisesStarted && selectedWords.length > 0) {
            setCurrentWord(getRandomUnlearnedWord());
            setCurrentExerciseTypeIndex(Math.floor(Math.random() * 3));
        }
    }, [exercisesStarted, selectedWords]);

    useEffect(() => {
        if (numWordsToLearn > 0 && flashcards.length > 0 && exercisesStarted && selectedWords.length === 0) {
            const unlearnedWords = flashcards.filter(flashcard => !flashcard.isLearned);
            const selected = unlearnedWords.sort(() => 0.5 - Math.random()).slice(0, numWordsToLearn);
            setSelectedWords(selected);
            setWordScores(selected.reduce((scores, word) => {
                scores[word.id] = 1;
                return scores;
            }, {}));
        }
    }, [numWordsToLearn, flashcards, exercisesStarted]);

    const toggleMemorizedWords = () => {
        setShowMemorizedWords(!showMemorizedWords);
        Animated.timing(memorizedWordsHeight, {
            toValue: showMemorizedWords ? 0 : 300,
            duration: 500,
            useNativeDriver: false,
        }).start();
    };

    const selectNewExerciseType = () => {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * 3);
        } while (newIndex === lastExerciseTypeIndex);
        setLastExerciseTypeIndex(newIndex);
        setCurrentExerciseTypeIndex(newIndex);
    };

    const handleWordCompleted = (wordId, success) => {
        setWordScores(prevScores => {
            const newScore = success ? prevScores[wordId] + 1 : Math.max(prevScores[wordId] - 1, 1);
            let learnedIncrement = 0;
    
            if (newScore === 4) {
                dispatch(markFlashcardAsLearned(wordId, category, true));
                learnedIncrement = 1;
            }
    
            const newLearnedCount = learnedWordsCount + learnedIncrement;
            setLearnedWordsCount(newLearnedCount);
    
            const updatedScores = { ...prevScores, [wordId]: newScore };
    
            // Seleccionar una nueva palabra utilizando los puntajes actualizados
            if (newLearnedCount < numWordsToLearn) {
                const unlearnedWords = selectedWords.filter(word => updatedScores[word.id] < 4);
                if (unlearnedWords.length > 0) {
                    const newWord = unlearnedWords[Math.floor(Math.random() * unlearnedWords.length)];
                    setCurrentWord(newWord);
                } else {
                    // No hay más palabras por aprender
                    setCurrentWord(null);
                }
            }
    
            return updatedScores;
        });
    
        selectNewExerciseType();
    };
    
    

    
    const confirmStartExercises = (number) => {
        setNumWordsToLearn(number);
        setModalVisible(false);
        setExercisesStarted(true);

        selectNewExerciseType();
    };
    

    const cancelAndGoBack = () => {
        navigation.goBack();
    };

    const getRandomUnlearnedWord = () => {
        const unlearnedWords = selectedWords.filter(word => wordScores[word.id] < 6);
        if (unlearnedWords.length === 0) {
            return null;
        }
        return unlearnedWords[Math.floor(Math.random() * unlearnedWords.length)];
    };


    const dynamicStyles = StyleSheet.create({
        modalView: {
            backgroundColor: darkModeEnabled ? '#121212' : colorPair.text,
            borderRadius: 20,
            padding: 20,
            height: '110%',
            width: '100%',
            alignItems: 'center',
        },
        numberButton: {
            backgroundColor: darkModeEnabled ? '#434753' : colorPair.background,
            borderRadius: 15,
            marginTop: 20,
            padding: 40,
            width: '45%',
            height: 130,
            alignItems: 'center',
        },
        numberButtonText: {
            color: darkModeEnabled ? 'white' : colorPair.text,
            fontSize: 50,
            fontFamily: 'Pagebash',
        },
        cancelButton: {
            backgroundColor: darkModeEnabled ? '#434753' : colorPair.background,
            borderRadius: 10,
            padding: 15,
            marginTop: '40%',
            width: '80%',
            alignItems: 'center',
        },
        cancelButtonText: {
            color: 'white',
            fontSize: 18,
            fontFamily: 'Pagebash',
        },
        buttonRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            margin: 10,
        },
        modalText: {
            marginTop: '50%',
            textAlign: 'center',
            color: darkModeEnabled ? 'white' : colorPair.background,
            fontSize: 30,
            fontFamily: 'Pagebash',
        },
        floatingButton: {
            position: 'absolute',
            right: 20,
            bottom: '47%',
            backgroundColor: darkModeEnabled ? '#434753' : colorPair.background,
            borderRadius: 50,
            padding: 15,
            borderWidth: 2,
            borderColor: darkModeEnabled ? 'white' : colorPair.text,
        },
        floatingButtonText: {
            color: darkModeEnabled ? 'white' : colorPair.text,
            fontSize: 16,
        },
        memorizedWordsView: {
            position: 'absolute',
            bottom: -30,
            width: '90%',
            borderWidth: 4,
            borderColor: darkModeEnabled ? 'white' : colorPair.text,
            backgroundColor: darkModeEnabled ? '#434753' : colorPair.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            maxHeight: '50%',
        },
        memorizedListTitle: {
            color: darkModeEnabled ? 'white' : colorPair.text,
            fontSize: 20,
            fontFamily: 'Pagebash',
            marginBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: darkModeEnabled ? 'white' : colorPair.text,

        },

        memorizedWord: {
            fontSize: 16,
            fontFamily: 'Pagebash',
            color: darkModeEnabled ? 'white' : colorPair.text,
        },
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: darkModeEnabled ? '#121212' : colorPair.background,
        },

        


    });
    

 
    return (
        <View style={dynamicStyles.container}>
            <ExerciseComponent
                exercisesStarted={exercisesStarted}
                learnedWordsCount={learnedWordsCount}
                numWordsToLearn={numWordsToLearn}
                currentWord={currentWord}
                handleWordCompleted={handleWordCompleted}
                selectedWords={selectedWords}
                category={category}
                colorPair={colorPair}
                currentExerciseTypeIndex={currentExerciseTypeIndex}
            />
            <WordSelectionComponent
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                cancelAndGoBack={cancelAndGoBack}
                dynamicStyles={dynamicStyles}
                confirmStartExercises={confirmStartExercises}
            />
            <Animated.View style={[dynamicStyles.memorizedWordsView, {height: memorizedWordsHeight}]}>
                <Text style={dynamicStyles.memorizedListTitle}>Palabras Memorizadas:</Text>
                {selectedWords.filter(word => wordScores[word.id] === 4).map((word, index) => (
                    <View styke={dynamicStyles.memorizedWordcontainer} key={index}>
                    <Text key={index} style={dynamicStyles.memorizedWord}>
                        {word.english} - {word.spanish}
                    </Text>
                    </View>
                ))}
            </Animated.View>
            <TouchableOpacity
                style={dynamicStyles.floatingButton}
                onPress={toggleMemorizedWords}
            >
                <Text style={dynamicStyles.floatingButtonText}>{showMemorizedWords ? 'Ocultar' : '  ?  '}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default VocabularyExercisesScreen;