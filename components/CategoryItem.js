import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Alert, Image } from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { selectDarkMode } from '../darkModeSlice';
import { getRandomColorPair } from '../constants';
import { fetchImage, upsertImage, deleteImage } from '../db'
import { useActionSheet } from '@expo/react-native-action-sheet';

const CategoryItem = ({ category, onPress, onDelete }) => {
  const [colorPair, setColorPair] = useState(null);
  const [categoryImageUri, setCategoryImageUri] = useState(null);
  const darkModeEnabled = useSelector(selectDarkMode);
  const { showActionSheetWithOptions } = useActionSheet();

  useEffect(() => {
    fetchImage(category.id)
      .then((imageData) => {
        if (imageData) {
          setCategoryImageUri(imageData.uri);
        }
      })
      .catch((err) => console.log(err));

    if (!colorPair) {
      const randomPair = getRandomColorPair();
      setColorPair(randomPair);
    }
  }, [category, colorPair]);

  const showMenu = () => {
    // Verifica si la imagen existe y ajusta las opciones del menú
    const imageOption = categoryImageUri ? 'Eliminar Imagen' : 'Agregar Imagen';
    const options = ['Editar', 'Eliminar Categoría', imageOption, 'Cancelar'];
    const cancelButtonIndex = 3;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            // Implementar lógica para "Editar"
            break;
          case 1:
            handleDelete();
            break;
          case 2:
            if (categoryImageUri) {
              handleDeleteImage(); // Implementar lógica para eliminar la imagen
            } else {
              handleSelectImage(); // Implementar lógica para agregar la imagen
            }
            break;
          default:
            // Cancelar o cualquier otra acción
            break;
        }
      }
    );
};


  const handleDelete = () => {
    onDelete(category.id);
  };

  const handleSelectImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled) {
      const imageUri = result.assets[0].uri; // Usar 'assets' en lugar de 'uri' directamente
      upsertImage(category.id, imageUri)
        .then(() => {
          setCategoryImageUri(imageUri);
        })
        .catch((err) => console.log(err));
    }
  };

  const handleDeleteImage = () => {
    deleteImage(category.id)
      .then(() => {
        setCategoryImageUri(null);
      })
      .catch((err) => console.log(err));
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
      onLongPress={showMenu}
    >

      <View style={styles.imageContainer}>
          <Image source={{ uri: categoryImageUri }} style={styles.categoryImage} />
        
      </View>
      <View style={styles.gradient}>
        <Text style={[
          styles.categoryName, 
          { color: darkModeEnabled ? '#D3D3D3' : colorPair ? colorPair.text : 'black' }
        ]}>
          {category.name}
        </Text> 
      </View>


    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  deleteIconImage: {
    position: 'absolute',
    bottom: 5,
    right: 5,
  },


  category: {
    width: 140,
    height: 140,
    borderRadius: 12,
    margin: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2, // Aumenta el ancho del borde para dar más énfasis
    borderColor: 'black', // Puedes cambiar el color según tu preferencia
    backgroundColor: 'white', // El color de fondo también afecta la apariencia 3D
    shadowColor: 'black', // Agrega sombras alrededor de la tarjeta
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, // Aumenta la opacidad de la sombra
    shadowRadius: 10, // Aumenta el radio de la sombra
    elevation: 12, // Aumenta la profundidad de la tarjeta
  },
  categoryName: {
    paddingTop: 20,
    textAlign: 'center',
    fontSize: 24,
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
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'absolute',
    top: -16,
    left:70,
  },
  imagePlaceholder: {
    position: 'absolute',
    top:  -30,
    left: 10,
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: -30,
    height: 60,
    width: '100%',
    alignItems: 'center',
  },
});

export default CategoryItem;
