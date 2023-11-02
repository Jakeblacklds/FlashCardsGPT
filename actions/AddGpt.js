import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { chatWithGPT } from '../api';
import axios from 'axios';
import Slider from '@react-native-community/slider';

const AddGpt = ({ navigation }) => {
    const [category, setCategory] = useState('');
    const [numFlashcards, setNumFlashcards] = useState(0);

    const fetchFlashcardsFromGPT = async () => {
        const prompt = `
        
        
      Genera flashcards de palabras en inglés traducidas al español siguiendo estas estrictas pautas:
      - Cada flashcard debe tener la estructura "Inglés: [palabra/frase en inglés], Español: [palabra/frase en español]  Es importante que sigas esta estructura. NO AGREGUES NADA MAS, NO LO HAGAS".
      - No agregues Flashcard Numero X, Flashcard Numero Y, etc. Solo agrega las flashcards con la estructura mencionada anteriormente.
      - Tampoco menciones el numero en el que va la flashcard, solo agrega las flashcards con la estructura mencionada anteriormente.
      - Las palabras o frases no deben exceder los 50 carac  teres en cada idioma.
      - Evita números, caracteres especiales o palabras que no sean comunes en el idioma correspondiente.
      - Las palabras deben ser adecuadas para un público general y no deben contener jerga o términos ofensivos.
      - No debes mencionar otra cosa mas que las flashcards que pedio en el formato requerido
      - Por favor, proporciona ${numFlashcards} de flashcards relacionadas con la categoría ${category}.
    `;

        try {
            const response = await chatWithGPT(prompt, 'default');
            console.log("Respuesta de chatWithGPT:", response);
            if (typeof response !== 'string' || !response.trim()) {
                throw new Error('Received invalid response from GPT');
            }
            return response.split('\n');
        } catch (error) {
            console.error('Error fetching data from OpenAI:', error);
        }
    };


    const handleAddCategoryAndFlashcards = async () => {
        const generatedFlashcards = await fetchFlashcardsFromGPT();

        // Convertir las flashcards generadas en el formato deseado
        const formattedFlashcards = generatedFlashcards.map((flashcard, index) => {
            const [englishPart, spanishPart] = flashcard.split(', ');
            const english = englishPart.split(': ')[1];
            const spanish = spanishPart.split(': ')[1];

            return { english, spanish };
        });

        // Crear un objeto flashcardsObject similar al utilizado en AddCategory
        const flashcardsObject = formattedFlashcards.reduce((obj, item, index) => {
            obj[`flashcard${index + 1}`] = item;
            return obj;
        }, {});

        try {
            // Aquí solo necesitas agregar la nueva categoría, no sobrescribir todas las categorías.
            const categoryUrl = `https://flashcardgpt-default-rtdb.firebaseio.com/users/SpanishFlashcards/categories/${encodeURIComponent(category)}.json`;
            await axios.put(categoryUrl, {
                name: category,
                flashcards: flashcardsObject
            });

            alert('¡Lista Creada!');
            navigation.navigate('Categorías');
        } catch (error) {
            console.error('Error adding category and flashcards to Firebase:', error);
        }
    };

    return (
        <View style={styles.container}>
                        <Text style={styles.additionalText}>
                Tienes flojera de crear tus flashcards? Usa la IA!
            </Text>
            <TextInput
                style={styles.input}
                placeholder="Escribe la Categoría"
                value={category}
                onChangeText={(text) => setCategory(text)}
            />
            <View style={styles.sliderContainer}>
                <Text style={styles.sliderText}>Número de Flashcards: {numFlashcards}</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={20}
                    step={1}
                    value={numFlashcards}
                    onValueChange={(value) => setNumFlashcards(value)}
                    minimumTrackTintColor="#007BFF"
                    maximumTrackTintColor="#ccc"
                />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleAddCategoryAndFlashcards}>
                <Text style={styles.buttonText}>Agregar Categoría y Flashcards</Text>
            </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f1de', // Color de fondo de tu paleta
    },
    input: {
        padding: 10,
        marginVertical: 10,
        borderColor: '#ccc',
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
        backgroundColor: '#e07a5f', // Color de fondo del botón de tu paleta
        padding: 10,
        alignItems: 'center',
        borderRadius: 10,
        marginTop: 10,
    },
    buttonText: {
        color: '#FFF3E0', // Color del texto del botón de tu paleta
        fontWeight: 'bold',
    },
    additionalText: {
        marginTop: 20,
        color: '#43291f', // Color de texto de tu paleta
        fontFamily: 'Pagebash',
        fontSize: 18,
        textAlign: 'center',
    },
});

export default AddGpt;