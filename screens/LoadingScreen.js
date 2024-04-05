import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text,Image } from 'react-native';
import LottieView from 'lottie-react-native';

const LoadingScreen = () => {
    return (
        <View style={styles.container}>
            <LottieView 
        source={require('../assets/kid.json')}
        autoPlay
        loop
        speed={1}
        style={{ width: 200, height: 200, justifyContent: 'center', alignItems: 'center', }}
      />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff', // Puedes cambiar el color de fondo si lo deseas
    },
    text: {
        marginTop: 20,
        fontSize: 20,
        
        color: '#000', // Puedes cambiar el color del texto si lo deseas
    },
    image: {
        width: 250,
        height: 250,
    }
});

export default LoadingScreen;
