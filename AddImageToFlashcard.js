import React, { useState } from 'react';
import { Button, Image, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToFirebase } from './FireBaseConfig';


export default function AddImageToFlashcard({ flashcardId }) {
  const [imageUri, setImageUri] = useState(null);

  const pickImage = async () => {
    // No se necesita pedir permisos para lanzar la galería de imágenes
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
     
      const imageUri = result.assets[0].uri;

     
      const imageUrl = await uploadImageToFirebase(imageUri, flashcardId);


      setImageUri(imageUrl);
    }
  };

  // Esta función te permite tomar una foto con la cámara y subirla a Firebase Storage
  const takePhoto = async () => {
    // Se necesita pedir permisos para acceder a la cámara
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Has rechazado el permiso para acceder a la cámara!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
     
      const imageUri = result.assets[0].uri;

     
      const imageUrl = await uploadImageToFirebase(imageUri, flashcardId);


      setImageUri(imageUrl);
    }
  };

  return (
    <View>
      {imageUri && <Image source={{ uri: imageUri, width: 200, height: 200 }} />}
      <Button title="Seleccionar una imagen" onPress={pickImage} />
      <Button title="Tomar una foto" onPress={takePhoto} />
    </View>
  );
}
