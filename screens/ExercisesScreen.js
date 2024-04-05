import React from 'react';
import { TouchableOpacity, Text, ScrollView, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { selectDarkMode } from '../redux/darkModeSlice';

const ExercisesScreen = ({ navigation }) => {
    const darkModeEnabled = useSelector(selectDarkMode);

    const containerStyle = [
        styles.container,
        { backgroundColor: darkModeEnabled ? '#121212' : '#f4f1de' },
    ];

    const buttonStyle = [
        styles.button,
        {
            backgroundColor: darkModeEnabled ? '#3d405b' : '#3f37c9',
            borderColor: darkModeEnabled ? '#f4f1de' : '#3d405b',
        },
    ];

    const textStyle = [
        styles.buttonText,
        { color: darkModeEnabled ? '#f4f1de' : '#FFF3E0' },
    ];

    const subtextStyle = [
        styles.buttonSubtext,
        { color: darkModeEnabled ? '#f4f1de' : '#e07a5f' },
    ];

    const verbTenses = [
        { key: 'present', text: 'Presente', subtext: 'Practica el tiempo presente' },
        { key: 'past', text: 'Pasado', subtext: 'Practica el tiempo pasado' },
        { key: 'future', text: 'Futuro', subtext: 'Practica el tiempo futuro' },
        { key: 'conditional', text: 'Condicional', subtext: 'Practica el tiempo condicional' },
        { key: 'imperfect', text: 'Imperfecto', subtext: 'Practica el tiempo imperfecto' },
        { key: 'subjunctive', text: 'Subjuntivo', subtext: 'Practica el tiempo subjuntivo' },
    ];

    const tenseToScreenMap = {
        present: 'PresentTense',
        past: 'PastTense',
        future: 'FutureTense',
        conditional: 'ConditionalTense',
        imperfect: 'ImperfectTense',
        subjunctive: 'SubjunctiveTense',
    };

    const navigateToTense = (tenseKey) => {
        const screenName = tenseToScreenMap[tenseKey];
        if (screenName) {
            navigation.navigate(screenName);
        } else {
            console.warn(`No screen found for key: ${tenseKey}`);
        }
    };

    return (
        <ScrollView contentContainerStyle={containerStyle}>
            {verbTenses.map((tense) => (
                <TouchableOpacity
                    key={tense.key}
                    style={buttonStyle}
                    onPress={() => navigateToTense(tense.key)}
                >
                    <Text style={textStyle}>{tense.text}</Text>
                    <Text style={subtextStyle}>{tense.subtext}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f1de',
        flexGrow: 1,
    },
    button: {
        borderRadius: 15,
        borderWidth: 2,
        width: '70%',
        paddingVertical: 20,
        paddingHorizontal: 30,
        marginVertical: 15,
        alignItems: 'center',
    },
    buttonText: {
        fontFamily: 'Pagebash',
        fontSize: 18,
        textAlign: 'center',
    },
    buttonSubtext: {
        fontFamily: 'Pagebash',
        fontSize: 14,
        marginTop: 5,
    },
});

export default ExercisesScreen;
