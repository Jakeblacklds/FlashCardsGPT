import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Alert, Image } from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { selectDarkMode } from '../darkModeSlice';
import { getRandomColorPair } from '../constants';

const CategoryItem = ({ category, onPress, onDelete, onImagePick }) => {
  const [colorPair, setColorPair] = useState(null);
  const darkModeEnabled = useSelector(selectDarkMode);

  useEffect(() => {
    if (!colorPair) {
      const randomPair = getRandomColorPair();
      setColorPair(randomPair);
    }
  }, [colorPair]);

  const handleDelete = () => {
    Alert.alert(
      "Eliminar Categoría",
      "¿Seguro que quieres borrarla?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Aceptar", onPress: () => onDelete(category.id) }
      ]
    );
  };

  return (
    <TouchableOpacity
        style={[
          styles.category, 
          {
            backgroundColor: darkModeEnabled ? '#434753' : colorPair ? colorPair.background : 'lightgray',
            borderColor: darkModeEnabled ? 'white' : 'black',
            shadowColor: darkModeEnabled ? 'white' : 'black',
          }
        ]}
        onPress={() => onPress(category, colorPair)}
    >

        <View style={styles.gradient}>
            <Text style={[
              styles.categoryName, 
              { color: darkModeEnabled ? '#D3D3D3' : colorPair ? colorPair.text : 'black' }
            ]}>
              {category.name}
            </Text>
            <AntDesign name="closecircle" size={24} color="red" style={styles.deleteIcon} onPress={handleDelete} />

        </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  category: {
    width: 140,
    height: 140,
    borderRadius: 12,
    margin: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,

  },
  categoryName: {
    fontSize: 25,
    fontFamily: 'Pagebash',

  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  deleteIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
  },

});

export default CategoryItem;
