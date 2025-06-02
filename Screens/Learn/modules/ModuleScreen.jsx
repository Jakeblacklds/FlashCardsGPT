import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, FlatList, StyleSheet, View, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { selectDarkMode } from '../../../redux/darkModeSlice';

const { width } = Dimensions.get('window');

const ModuleScreen = ({ route, navigation }) => {
    const { module } = route.params;
    const darkModeEnabled = useSelector(selectDarkMode);
    const [subsections, setSubsections] = useState([]);

    useEffect(() => {
        if (module && module.subsections) {
            setSubsections(module.subsections);
        }
    }, [module]);

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

    const navigateToSubsection = (subsection) => {
        navigation.navigate('SubsectionScreen', { subsection });
    };

    const renderItem = ({ item }) => (
        <View style={styles.levelContainer}>
            <TouchableOpacity
                style={buttonStyle}
                onPress={() => navigateToSubsection(item)}
            >
                <Text style={textStyle}>{item.title}</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={containerStyle}>
      
            <Text style={styles.text}>{module.title}</Text>
            <FlatList
                data={subsections}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={containerStyle}
                showsVerticalScrollIndicator={false}
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
    levelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: width,
        paddingHorizontal: 40,
    },
    button: {
        borderRadius: 15,
        borderWidth: 2,
        height: 150,
        flex: 1,
        paddingVertical: 20,
        paddingHorizontal: 30,
        marginVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontFamily: 'Pagebash',
        fontSize: 18,
        textAlign: 'center',
    },
});

export default ModuleScreen;
