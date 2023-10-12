import React, { useEffect } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFlashcards,deleteFlashcard } from './FlashcardSlice';


const FlashcardList = ({ navigation }) => {
  const dispatch = useDispatch();
  const flashcards = useSelector((state) => state.flashcards.flashcards);

  useEffect(() => {
    dispatch(fetchFlashcards());
  }, []);

  const handleDeleteFlashcard = (flashcardId) => {
    dispatch(deleteFlashcard(flashcardId));
  };

  return (
    <View>
      <Button
        title="Agregar Flashcard"
        onPress={() => navigation.navigate('Agregar Flashcard')}
      />
<FlatList
  data={flashcards}
  keyExtractor={(item, index) => index.toString()}
  renderItem={({ item }) => {
    if (item !== null) {
      return (
        <View>
          <Text>{item.english}</Text>
          <Text>{item.spanish}</Text>
          <Button
            title="Eliminar"
            onPress={() => handleDeleteFlashcard(item.id)}
          />
        </View>
      );
    } else {
      return <Text>Error: No se puede borrar</Text>;
    }
  }}
/>

    </View>
  );
};

export default FlashcardList;
