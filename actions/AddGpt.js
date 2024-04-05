import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Image, Keyboard, ActivityIndicator } from 'react-native';
import { chatWithGPT } from '../api';
import axios from 'axios';
import Slider from '@react-native-community/slider';
import robotflash from '../assets/robotflash.png';
import { selectDarkMode } from '../redux/darkModeSlice';
import { useSelector, useDispatch } from 'react-redux';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { fetchCategories } from '../redux/FlashcardSlice';
import LottieView from 'lottie-react-native';

const AddGpt = ({ navigation }) => {
    const [category, setCategory] = useState('');
    const [numFlashcards, setNumFlashcards] = useState(1);
    const darkModeEnabled = useSelector(selectDarkMode);
    const currentUserUID = useSelector(state => state.flashcards.currentUserUID);
    const isLoading = useSharedValue(false);
    const [generatedCount, setGeneratedCount] = useState(0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const dispatch = useDispatch();

    const modalStyle = useAnimatedStyle(() => {
        return {
            opacity: isLoading.value ? withTiming(1) : withTiming(0),
            zIndex: isLoading.value ? 1 : -1,
        };
    });

    const successModalStyle = useAnimatedStyle(() => {
        return {
            opacity: showSuccessModal ? withTiming(1) : withTiming(0),
            zIndex: showSuccessModal ? 1 : -1,
            top: showSuccessModal ? withTiming(40) : withTiming(-100),
        };
    });

    const fetchFlashcardsFromGPT = async () => {
        const prompt = `
        Genera flashcards de palabras en inglés traducidas al español siguiendo estas estrictas pautas:
        - Cada flashcard debe tener la estructura "Inglés: [palabra/frase en inglés], Español: [traducción en español], Variante 1: [opcional], Variante 2: [opcional], Variante 3: [opcional]"
        - No agregues nada más a la estructura de la flashcard.
        - Las variantes son sinónimos o frases alternativas que se pueden usar para la palabra o frase en inglés.
        - Siempre trata de agregar variantes si existen, y si es posible más de 1
        - No pongas puntos al final de las frases.
        - Siempre debe de haber una variante 1, pero las variantes 2 y 3 son opcionales.
        - Tampoco agregues un salto de línea al final de cada flashcard, ya que se usará para un json.
        - Sigue estrictamente la estructura mencionada. NO AGREGUES NADA MÁS, ni cambies el orden de la estructura.
        - Proporciona ${numFlashcards} flashcards relacionadas con la categoría ${category}.
        `;
        try {
            isLoading.value = true;
            Keyboard.dismiss();
            const response = await chatWithGPT(prompt, 'default');
            const flashcards = response.split('\n');
            setGeneratedCount(flashcards.length);
            return flashcards;
        } catch (error) {
            console.error('Error fetching data from OpenAI:', error);
            console.error(error.response.data);
            console.error(error.response.status);
            console.error(error.response.headers);
        } finally {
            isLoading.value = false;
        }
    };

    const handleAddCategoryAndFlashcards = async () => {
        const generatedFlashcards = await fetchFlashcardsFromGPT();
        const formattedFlashcards = generatedFlashcards.map((flashcard, index) => {
            const parts = flashcard.split(', ');
            const english = parts[0].split(': ')[1];
            const spanish = parts[1].split(': ')[1];
            const variant1 = parts[2] ? parts[2].split(': ')[1] : null;
            const variant2 = parts[3] ? parts[3].split(': ')[1] : null;
            const variant3 = parts[4] ? parts[4].split(': ')[1] : null;
            return { english, spanish, variant1, variant2, variant3 };
        });

        if (!category.trim()) {
            alert('Por favor, ingresa un nombre para la categoría.');
            return;
        }

        if (numFlashcards <= 0) {
            alert('Por favor, selecciona un número válido de flashcards.');
            return;
        }

        const flashcardsObject = formattedFlashcards.reduce((obj, item, index) => {
            obj[`flashcard${index + 1}`] = item;
            return obj;
        }, {});
        try {
            if (!currentUserUID) {
                console.error('UID de usuario no disponible');
                return;
            }
            const categoryUrl = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories/${encodeURIComponent(category)}.json`;
            await axios.put(categoryUrl, {
                name: category,
                flashcards: flashcardsObject
            });
            dispatch(fetchCategories());
            setShowSuccessModal(true);
            setTimeout(() => {
                navigation.navigate('Flashcards', { reload: true });
                setShowSuccessModal(false);
            }, 1000);
            console.log('se han actualizado las categorias');
        
        } catch (error) {
            console.error('Error adding category and flashcards to Firebase:', error);
        }
    };

    return (
        <View style={[styles.container, darkModeEnabled ? styles.containerDark : {}]}>
            <Animated.View style={[styles.fullScreenOverlay, modalStyle]}>
                <View style={styles.modalContent}>
                    <LottieView 
                        source={require('../assets/loadflash.json')}
                        autoPlay
                        loop
                        style={{ width: 300, height: 300, justifyContent: 'center', alignItems: 'center', }}
                    />
                    <Text style={styles.loadingText}>Generando flashcards...</Text>
                </View>
            </Animated.View>
            <Animated.View style={[styles.successModal, successModalStyle]}>
                <Text style={styles.successModalText}>¡Lista Creada!</Text>
            </Animated.View>
            <Image 
                source={robotflash} 
                style={styles.robotFlashImage} 
            />
            <Text style={[styles.additionalText, darkModeEnabled ? styles.textDark : {}]}>
                Tienes flojera de crear tus flashcards? Usa la IA!
            </Text>
            <TextInput
                style={[styles.input, darkModeEnabled ? styles.inputDark : {}]}
                placeholder="Escribe la Categoría"
                placeholderTextColor={darkModeEnabled ? "#D3D3D3" : "#333"}
                value={category}
                onChangeText={(text) => setCategory(text)}
            />
            <View style={styles.sliderContainer}>
                <Text style={[styles.sliderText, darkModeEnabled ? styles.textDark : {}]}>
                    Número de Flashcards: {numFlashcards}
                </Text>
                <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={20}
                    step={1}
                    value={numFlashcards}
                    onValueChange={(value) => setNumFlashcards(value)}
                    minimumTrackTintColor="#b5179e"
                    maximumTrackTintColor="#b5179e"
                    thumbTintColor="#3f37c9"
                />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleAddCategoryAndFlashcards}>
                <Text style={styles.buttonText}>Agregar Categoría y Flashcards</Text>
            </TouchableOpacity>
        </View>
    );
};


const styles = StyleSheet.create({
    containerDark: {
        backgroundColor: '#121212',
    },
    inputDark: {
        borderColor: '#757575',
        color: '#FFFFFF',
    },
    textDark: {
        color: '#D3D3D3',
    },
    robotFlashImage: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ECDBFA',
    },
    input: {
        padding: 10,
        marginVertical: 10,
        borderColor: '#7209b7',
        borderWidth: 1,
        borderRadius: 10,
    },
    sliderContainer: {
        marginVertical: 10,
    },
    sliderText: {
        color: '#007BFF',
        marginBottom: 5,
        fontFamily: 'Pagebash',
    },
    slider: {
        height: 40,
    },
    button: {
        backgroundColor: '#7209b7',
        padding: 10,
        alignItems: 'center',
        borderRadius: 10,
        marginTop: 10,
    },
    buttonText: {
        color: '#FFF3E0',
        fontWeight: 'bold',
    },
    additionalText: {
        marginTop: 20,
        color: '#43291f',
        fontFamily: 'Pagebash',
        fontSize: 18,
        textAlign: 'center',
    },
    fullScreenOverlay: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#480ca8',
    },
    modalContent: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        color: '#c7f9cc',
        fontSize: 30,
        fontFamily: 'Pagebash',
    },
    successModal: {
        position: 'absolute',
        backgroundColor: '#4caf50',
        padding: 10,
        borderRadius: 20,
        top: -100,
        alignSelf: 'center',
    },
    successModalText: {
        color: 'white',
    },
});

export default AddGpt;
