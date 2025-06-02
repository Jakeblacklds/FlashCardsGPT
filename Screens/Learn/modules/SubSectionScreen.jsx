import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, View, Dimensions, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useSelector } from 'react-redux';
import { selectDarkMode } from '../../../redux/darkModeSlice'; 

const { width } = Dimensions.get('window');

const SubsectionScreen = ({ route }) => {
    const { subsection } = route.params;
    const darkModeEnabled = useSelector(selectDarkMode);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');

    const containerStyle = [
        styles.container,
        { backgroundColor: darkModeEnabled ? '#121212' : '#f4f1de' },
    ];

    const textStyle = [
        styles.text,
        { color: darkModeEnabled ? '#f4f1de' : '#000000' },
    ];

    useEffect(() => {
        if (subsection && subsection.exercises) {
            setCurrentExerciseIndex(0); // Iniciar con el primer ejercicio
        }
    }, [subsection]);

    const goToNextExercise = () => {
        const nextIndex = currentExerciseIndex + 1;
        if (nextIndex < subsection.exercises.length) {
            setCurrentExerciseIndex(nextIndex);
            setUserAnswer(''); // Resetear la respuesta del usuario
        } else {
            Alert.alert("¡Buen trabajo!", "Has completado todos los ejercicios.");
        }
    };

    const handleOptionPress = (isCorrect) => {
        if (isCorrect) {
            Alert.alert("¡Correcto!", "Has seleccionado la respuesta correcta.", [
                { text: "Siguiente", onPress: goToNextExercise }
            ]);
        } else {
            Alert.alert("Incorrecto", "Inténtalo de nuevo.");
        }
    };

    const handleCheckAnswer = () => {
        const currentExercise = subsection.exercises[currentExerciseIndex];
        if (userAnswer.trim().toLowerCase() === currentExercise.correct_answer.trim().toLowerCase()) {
            Alert.alert("¡Correcto!", "Has proporcionado la respuesta correcta.", [
                { text: "Siguiente", onPress: goToNextExercise }
            ]);
        } else {
            Alert.alert("Incorrecto", "Inténtalo de nuevo.");
        }
    };

    const renderExercise = () => {
        const currentExercise = subsection.exercises[currentExerciseIndex];

        if (!currentExercise) {
            return <Text style={textStyle}>No exercise available</Text>;
        }

        switch (currentExercise.type) {
            case "Choose the correct option":
                return (
                    <>
                        <Text style={textStyle}>Question: {currentExercise.question}</Text>
                        {currentExercise.options.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.optionButton}
                                onPress={() => handleOptionPress(option.isCorrect)}
                            >
                                <Text style={textStyle}>Option {index + 1}: {option.text}</Text>
                            </TouchableOpacity>
                        ))}
                    </>
                );
            case "Complete the sentence":
                return (
                    <>
                        <Text style={textStyle}>Question: {currentExercise.question}</Text>
                        <TextInput
                            style={styles.textInput}
                            value={userAnswer}
                            onChangeText={setUserAnswer}
                            placeholder="Tu respuesta"
                        />
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleCheckAnswer}
                        >
                            <Text style={textStyle}>Submit</Text>
                        </TouchableOpacity>
                    </>
                );
            case "Translate the phrase":
                return (
                    <>
                        <Text style={textStyle}>Phrase: {currentExercise.phrase}</Text>
                        <TextInput
                            style={styles.textInput}
                            value={userAnswer}
                            onChangeText={setUserAnswer}
                            placeholder="Tu traducción"
                        />
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleCheckAnswer}
                        >
                            <Text style={textStyle}>Submit</Text>
                        </TouchableOpacity>
                    </>
                );
            default:
                return <Text style={textStyle}>Unknown exercise type</Text>;
        }
    };

    return (
        <View style={containerStyle}>
            <Text style={textStyle}>{subsection.title}</Text>
            <Text style={textStyle}>Exercise {currentExerciseIndex + 1}</Text>
            <View style={styles.exerciseContainer}>
                {renderExercise()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f1de',
        flexGrow: 1,
        paddingVertical: 20,
    },
    text: {
        fontFamily: 'Pagebash',
        fontSize: 18,
        textAlign: 'center',
    },
    exerciseContainer: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    optionButton: {
        backgroundColor: '#6200EE',
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
        width: width * 0.8,
        alignItems: 'center',
    },
    textInput: {
        backgroundColor: '#fff',
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
        width: width * 0.8,
    },
    submitButton: {
        backgroundColor: '#6200EE',
        padding: 10,
        borderRadius: 5,
        width: width * 0.8,
        alignItems: 'center',
    }
});

export default SubsectionScreen;
