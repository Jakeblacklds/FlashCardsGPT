import React, { useEffect, useState, useRef } from 'react';
import { TouchableOpacity, Text, FlatList, StyleSheet, View, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { selectDarkMode } from '../../redux/darkModeSlice';
import { FontAwesome } from '@expo/vector-icons';

// Importar el JSON como un módulo
import data from './modules/data.json';

const { width } = Dimensions.get('window');

const ExercisesScreen = ({ navigation }) => {
    const darkModeEnabled = useSelector(selectDarkMode);
    const [modules, setModules] = useState([]);
    const flatListRef = useRef(null);

    useEffect(() => {
        // Establecer los módulos directamente desde el archivo JSON importado
        setModules(data.modules);
    }, []);

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

    const navigateToModule = (module) => {
        navigation.navigate('ModuleScreen', { module });
    };

    const renderItem = ({ item }) => (
        <View style={styles.levelContainer}>
            <TouchableOpacity
                style={buttonStyle}
                onPress={() => navigateToModule(item)}
            >
                <Text style={textStyle}>{item.title}</Text>
                <Text style={subtextStyle}>{item.description}</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={containerStyle}>
            <Text style={styles.text}>Exercises</Text>
            <FlatList
                data={modules}
                renderItem={renderItem}
                keyExtractor={(item) => item.key}
                contentContainerStyle={styles.carouselContainer}
                showsHorizontalScrollIndicator={false}
                horizontal
                pagingEnabled
                snapToAlignment="center"
                decelerationRate="fast"
                snapToInterval={width} // Ensure snapping aligns items in center
                ref={flatListRef}
            />
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
    carouselContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    levelContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: width,
        paddingHorizontal: 20,
    },
    button: {
        borderRadius: 15,
        borderWidth: 2,
        height: 500,
        width: width * 0.8, // Adjust the width to fit in the screen
        paddingVertical: 20,
        paddingHorizontal: 30,
        marginVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontFamily: 'Pagebash',
        fontSize: 18,
        
    },
    buttonSubtext: {
        fontFamily: 'Pagebash',
        fontSize: 14,
        marginTop: 5,
        textAlign: 'center',
    },
    text: {
        fontFamily: 'Pagebash',
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
        color: '#3d405b',
    },
});

export default ExercisesScreen;
