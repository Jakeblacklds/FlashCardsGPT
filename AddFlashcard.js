import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { useDispatch } from 'react-redux';
import AddImageToFlashcard from './AddImageToFlashcard'

const AddFlashcard = ({ navigation }) => {
  const [english, setEnglish] = useState('');
  const [spanish, setSpanish] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const dispatch = useDispatch();

  const handleAddFlashcard = () => {
    const newFlashcard = {
      english,
      spanish,
    };

    dispatch(addFlashcard(newFlashcard));
    setEnglish('');
    setSpanish('');
    setImageUri(null);
    navigation.navigate('Flashcards');
  };

  return (
    <View>
      <TextInput
        placeholder="Inglés"
        value={english}
        onChangeText={(text) => setEnglish(text)}
      />
      <TextInput
        placeholder="Español"
        value={spanish}
        onChangeText={(text) => setSpanish(text)}
      />
      <AddImageToFlashcard
        onImageSelected={(uri) => setImageUri(uri)} // Función para capturar la URL de la imagen
      />
      {imageUri && (
        <Image source={{ uri: imageUri, width: 200, height: 200 }} /> // Muestra la imagen si hay una URL
      )}
      <Button title="Agregar Flashcard" onPress={handleAddFlashcard} />
    </View>
  )
}

export default AddFlashcard
