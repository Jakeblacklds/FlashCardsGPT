import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Alert, Image } from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { getRandomColorPair } from '../constants';

const CategoryItem = ({ category, onPress, onDelete, onImagePick }) => {
  const [colorPair, setColorPair] = useState(null);

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
        style={[styles.category, { backgroundColor: colorPair ? colorPair.background : 'lightgray' }]}
        onPress={() => onPress(category, colorPair)}
    >
        {category.imageUri && (
            <Image 
                source={{ uri: category.imageUri }} 
                style={{ width: '100%', height: '50%' }} 
                resizeMode="cover"
            />
        )}
        <View style={styles.gradient}>
            <Text style={[styles.categoryName, { color: colorPair ? colorPair.text : 'black' }]}>{category.name}</Text>
            <AntDesign name="closecircle" size={24} color="red" style={styles.deleteIcon} onPress={handleDelete} />
            <MaterialIcons 
                name="photo-library" 
                size={24} 
                style={styles.galleryIcon} 
                onPress={() => onImagePick(category.id)} 
            />
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
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
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
  galleryIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
});

export default CategoryItem;

