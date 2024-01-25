import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView, FlatList, Dimensions, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectCategories, fetchCategories } from '../redux/FlashcardSlice';
import { selectDarkMode } from '../redux/darkModeSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLOR_PAIRS, getRandomColorPair } from '../constants';

export default function SelectCategoryScreen({ navigation }) {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const darkModeEnabled = useSelector(selectDarkMode);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const [pairColor, setPairColor] = useState(COLOR_PAIRS.pair1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const windowWidth = Dimensions.get('window').width;

  useEffect(() => {
    dispatch(fetchCategories());
    Animated.timing(scaleAnim, {
      toValue: 1.2,
      duration: 1000,
      useNativeDriver: true
    }).start(() => {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      }).start();
    });
    Animated.sequence([
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.timing(rotationAnim, {
        toValue: -1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.timing(rotationAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      })
    ]).start();
  }, [dispatch, scaleAnim, rotationAnim]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== selectedIndex) {
      setSelectedIndex(viewableItems[0].index);
      setPairColor(getRandomColorPair());
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item, index }) => {
    const isSelected = selectedIndex === index;
    const style = isSelected ? styles.selectedItemContainer : styles.itemContainer;
    return (
      <View style={style}>
        <Text style={[styles.itemText, { color: darkModeEnabled ? '#D3D3D3' : pairColor.text }]}>{item.name}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkModeEnabled ? '#121212' : pairColor.background }]}>
      <Text style={[styles.title, { color: darkModeEnabled ? '#D3D3D3' : pairColor.text }]}>¡Elige una categoría para practicar flashcards!</Text>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal={true}
        snapToAlignment="center"
        snapToInterval={windowWidth}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        contentContainerStyle={styles.flatListContentContainer}
      />
      <Animated.View style={{
        bottom: 80,
        transform: [{
          rotate: rotationAnim.interpolate({
            inputRange: [-1, 1],
            outputRange: ['-20deg', '20deg']
          })
        }]
      }}>
        <MaterialCommunityIcons name="gesture-swipe" size={50} color={darkModeEnabled ? '#D3D3D3' : pairColor.text} />
      </Animated.View>
      <TouchableOpacity
        style={[
          styles.button,
          { 
            backgroundColor: darkModeEnabled ? '#121212' : pairColor.background,
            transform: [{ scale: scaleAnim }]
          }
        ]}
        onPress={() => {
          if (selectedIndex !== null) {
            navigation.navigate('CheckFlashcardScreen', {
              category: categories[selectedIndex].name,
            });
          } else {
            alert('Por favor selecciona una categoría.');
          }
        }}
      >
        <Text style={[styles.textStyle, { color: darkModeEnabled ? '#D3D3D3' : pairColor.text }]}>
          Presiona aquí para comenzar
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Pagebash',
    top: 150,
    fontSize: 30,
    textAlign: 'center',
  },
  button: {
    bottom: 0,
    height: '20%',
    width: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  textStyle: {
    top: 60,
    fontFamily: 'Pagebash',
    fontSize: 20,
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('window').width,
    top: 70,
    borderRadius: 10,
  },
  selectedItemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('window').width,
    top: 70,
    borderRadius: 10,
    borderColor: '#000',
  },
  itemText: {
    fontFamily: 'Pagebash',
    fontSize: 50,
    textAlign: 'center',
  },
  flatListContentContainer: {
    alignItems: 'center',
  },
});
