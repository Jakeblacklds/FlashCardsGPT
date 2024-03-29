import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFlashcardsByCategory, selectFlashcardsByCategory, deleteFlashcard } from '../redux/FlashcardSlice';
import axios from 'axios';
import { selectDarkMode } from '../redux/darkModeSlice';

const FlashcardList = ({ navigation, route }) => {
  const { category, colorPair } = route.params;
  const flashcards = useSelector((state) => selectFlashcardsByCategory(state, category));
  const darkModeEnabled = useSelector(selectDarkMode);
  const dispatch = useDispatch();
  const currentUserUID = useSelector(state => state.flashcards.currentUserUID);

  useEffect(() => {
    if (currentUserUID) {
      dispatch(fetchFlashcardsByCategory(currentUserUID, category));
    }
  }, [dispatch, category, currentUserUID]);

  if (!colorPair) {
    console.error('colorPair is undefined in FlashcardList');
  }

  const handleFlashcardPress = (index) => {
    navigation.navigate('Memorize', { category, colorPair, currentIndex: index });
  };

  const handleMemorizePress = () => {
    navigation.navigate('VocabularyExercises', { category, colorPair });
  };

  const handleAddFlashcardPress = () => {
    navigation.navigate('AddFlashcard', { category, colorPair });
  };

  const handleDeleteFlashcard = async (flashcardId) => {
    dispatch(deleteFlashcard(flashcardId));
    try {
      await axios.delete(`https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories/${category}/flashcards/${flashcardId}.json`);
    } catch (error) {
      console.error('Error al eliminar flashcard de Firebase:', error);
    }
  };

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity 
        style={[styles.flashcard, { backgroundColor: darkModeEnabled ? '#121212' : colorPair.text, borderColor: darkModeEnabled ? 'white' : 'black', borderWidth: darkModeEnabled ? 1 : 0 }]}
        onPress={() => handleFlashcardPress(index)}
      >
        {item.isLearned && (
          <View style={[styles.ribbon, { backgroundColor: colorPair.background }]}>
            <Text style={styles.ribbonText}>Learned</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => handleDeleteFlashcard(item.id)}
        >
          <Text style={[styles.closeButtonText, { color: darkModeEnabled ? '#121212' : 'white' }]}>X</Text>
        </TouchableOpacity>
        <Text style={[styles.english, { color: darkModeEnabled ? 'white' : colorPair.background }]}>{item.english}</Text>
        <Text style={[styles.spanish, { color: darkModeEnabled ? 'white' : colorPair.background }]}>{item.spanish}</Text>
      </TouchableOpacity>
    );
  };

  //renderHeader de category con sus propios estilos 

  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: darkModeEnabled ? '#D3D3D3' : 'white' }]}>{category}</Text>
      </View>
    );
  }


  return (
    <View style={[styles.container, { backgroundColor: darkModeEnabled ? '#121212' : colorPair.background }]}>
      <StatusBar backgroundColor={colorPair.background} barStyle={darkModeEnabled ? 'light-content' : 'light-content'} />
      <View style= {styles.listContainer}>
        <Animated.FlatList
          data={flashcards}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
         

        />
      </View>
      <View style={[styles.buttonContainer]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: darkModeEnabled ? '#434753' : 'gray', borderWidth: 2, borderColor: darkModeEnabled ? 'white' : 'black' }]}
          onPress={handleMemorizePress}
        >
          <Text style={[styles.buttonText, { color: darkModeEnabled ? '#D3D3D3' : 'white' }]}>Memorizar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: darkModeEnabled ? '#434753' : 'white', borderWidth: 2, borderColor: darkModeEnabled ? 'white' : 'black' }]}
          onPress={handleAddFlashcardPress}
        >
          <Text style={[styles.buttonText, { color: darkModeEnabled ? '#D3D3D3' : 'black' }]}>Agregar Flashcard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems:'center',
  },
  flashcard: {
    width: 300,
    height: 105,
    borderRadius: 10,
    margin: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spanish: {
    fontSize: 18,
    fontFamily: 'Pagebash',
  },
  english: {
    fontFamily: 'Pagebash',
    fontSize: 30,
  },
  button: {
    width: 130,
    height: 50,
    borderRadius: 25,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontFamily: 'Pagebash',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  ribbon: {
    position: 'absolute',
    top: 18,
    left: -30,
    transform: [{ rotate: '-45deg' }],
    width: 110,
  },
  ribbonText: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Pagebash',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 300,
  },
  listContainer: {
    flex: 1,
    alignContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  title: {
    fontSize:30,
    fontFamily: 'Pagebash',
    textAlign: 'center',
  },

});

export default FlashcardList;
