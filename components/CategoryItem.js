import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Alert, Image, Modal, Button, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { selectDarkMode } from '../redux/darkModeSlice';
import { getRandomColorPair } from '../constants';
import { fetchImage, upsertImage, deleteImage } from '../db'
import { useActionSheet } from '@expo/react-native-action-sheet';
import { FontAwesome } from '@expo/vector-icons';
import { generateImageWithDalle } from '../api';
import LottieView from 'lottie-react-native';

const CategoryItem = ({ category, onPress, onDelete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const [colorPair, setColorPair] = useState(null);
  const [categoryImageUri, setCategoryImageUri] = useState(null);
  const [isImagePickerModalVisible, setImagePickerModalVisible] = useState(false);
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

  const handleGenerateDalleImage = async () => {
    setImagePickerModalVisible(false);
    setIsLoading(true); // Activar el indicador de carga
    const prompt = `Create a clear,64 bit pixel art image about ${category.name}`;

    try {
      const imageUrl = await generateImageWithDalle(prompt);
      await upsertImage(category.id, imageUrl);
      setCategoryImageUri(imageUrl);
    } catch (error) {
      console.error('Error generating image with DALL·E:', error);
    } finally {
      setIsLoading(false); // Desactivar el indicador de carga
    }
  };

  const showMenu = () => {
    const imageOptions = categoryImageUri ? ['Eliminar Imagen'] : ['Agregar Imagen'];
    const options = ['Editar', 'Eliminar Categoría', ...imageOptions, 'Cancelar'];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            break;
          case 1:
            handleDelete();
            break;
          case 2:
            if (categoryImageUri) {
              handleDeleteImage();
            } else {
              handleSelectImage();
            }
            break;

          default:
            break;
        }
      }
    );
  };

  const handleDelete = () => {
    onDelete(category.id);
  };

  const handleSelectImage = () => {
    setImagePickerModalVisible(true);
  };

  const handleChooseFromGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      upsertImage(category.id, imageUri)
        .then(() => {
          setCategoryImageUri(imageUri);
        })
        .catch((err) => console.log(err));
    }
    setImagePickerModalVisible(false);
  };

  const handleGenerateDalleImageModal = async () => {
    await handleGenerateDalleImage();
    setImagePickerModalVisible(false);
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
      onPress={() => onPress(category, colorPair, categoryImageUri)}
      onLongPress={showMenu}
    >
      <View style={styles.imageContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <LottieView
              source={require('../assets/loadimg2.json')}
              autoPlay
              loop
              speed={.8}
              style={{ width: 300, height: 150 }}
            />
            <Text style={styles.loadingText}>Generando imagen...</Text>
          </View>
        ) : categoryImageUri ? (
          <Image source={{ uri: categoryImageUri }} style={styles.categoryImage} />
        ) : (
          <FontAwesome name="photo" size={80} color={darkModeEnabled ? '#D3D3D3' : colorPair ? colorPair.text : 'black'} />
        )}
      </View>
      <View style={styles.gradient}>
        <Text style={[
          styles.categoryName,
          { color: darkModeEnabled ? '#D3D3D3' : colorPair ? colorPair.text : 'black' }
        ]}>
          {category.name}
        </Text>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isImagePickerModalVisible}
        onRequestClose={() => {
          setImagePickerModalVisible(!isImagePickerModalVisible);
        }}
      >
        <View style={[styles.centeredView]}>
          <View style={[styles.modalView, { backgroundColor: '#f72585' }]}>
            <Text style={[styles.modalText, { color: '#FFE8FF' }]}>Elige una opción para la imagen:</Text>

            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#FFE8FF' }]}
              onPress={handleChooseFromGallery}>
              <Text style={[styles.buttonText, { color: '#f72585' }]}>Elegir de la Galería</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#FFE8FF' }]}
              onPress={handleGenerateDalleImageModal}>
              <Text style={[styles.buttonText, { color: '#f72585' }]}>Generar con DALL·E</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#FFE8FF' }]}
              onPress={() => setImagePickerModalVisible(false)}>
              <Text style={[styles.buttonText, { color: '#f72585' }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  category: {
    flexDirection: 'row',
    width: 330,
    height: 180,
    borderRadius: 12,
    margin: 12,
    

    shadowColor: 'black',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
  },
  categoryName: {
    fontSize: 25,
    fontFamily: 'Pagebash',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  categoryImage: {
    width: 130,
    height: 130,
    borderRadius: 80,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  modalButton: {
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20
  },
  buttonText: {
    fontSize: 16
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: 'black',
    fontSize: 14,
  },
});

export default CategoryItem;
