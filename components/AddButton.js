import React from 'react';
import { View, TouchableOpacity, Text, TouchableWithoutFeedback,StyleSheet } from 'react-native';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const ActionButton = ({
  isButtonPressed,
  handleButtonPress,
  navigateToAddCategory,
  navigateToAddGPT,
  darkModeEnabled
}) => {
  const posX = useSharedValue(5); // Posición X inicial
  const posY = useSharedValue(5); // Posición Y inicial
  const width = useSharedValue(50); // Ancho inicial
  const height = useSharedValue(50); // Altura inicial

  // Animación para el botón
  const animatedStyle = useAnimatedStyle(() => {
    return {
      left: posX.value,
      top: posY.value,
      width: width.value,
      height: height.value,
    };
  });

  // Manejar la animación al presionar el botón
  React.useEffect(() => {
    if (isButtonPressed) {
      posX.value = withSpring(1, { damping: 10, stiffness: 200 });
      posY.value = withSpring(1, { damping: 10, stiffness: 200 });
      width.value = withSpring(210, { damping: 10, stiffness: 200 });
      height.value = withSpring(110, { damping: 10, stiffness: 200 });
    } else {
      posX.value = withSpring(5, { damping: 10, stiffness: 200 });
      posY.value = withSpring(5, { damping: 10, stiffness: 200 });
      width.value = withSpring(50, { damping: 10, stiffness: 200 });
      height.value = withSpring(50, { damping: 10, stiffness: 200 });
    }
  }, [isButtonPressed, posX, posY, width, height]);

  return (
    <Animated.View style={[styles.actionButtonContainer, animatedStyle]}>
      {isButtonPressed ? (
        <View style={styles.expandedButtonsContainer}>
          {/* Botones expandidos */}
          <TouchableOpacity
            style={[styles.expandedButton, {
              backgroundColor: darkModeEnabled ? '#121212' : '#fff',
              borderWidth: 2,
              borderColor: darkModeEnabled ? 'rgba(255, 255, 255, 0.5)' : 'white',
            }]}
            onPress={navigateToAddCategory}
          >
            <AntDesign name="plus" size={24} color={darkModeEnabled ? 'white' : 'black'} />
            <Text style={[styles.text, { color: darkModeEnabled ? '#D3D3D3' : 'black' }]}>Agregar Categoría</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.expandedButton, {
              backgroundColor: darkModeEnabled ? '#121212' : '#fff',
              borderWidth: 2,
              borderColor: darkModeEnabled ? 'rgba(255, 255, 255, 0.5)' : 'white',
            }]}
            onPress={navigateToAddGPT}
          >
            <MaterialCommunityIcons name="robot" size={24} color={darkModeEnabled ? 'white' : 'black'} />
            <Text style={[styles.text, { color: darkModeEnabled ? '#D3D3D3' : 'black' }]}>Agregar Categoría Con IA</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableWithoutFeedback onPress={handleButtonPress}>
          <View style={[styles.actionButton, {
            backgroundColor: darkModeEnabled ? '#121212' : '#fff',
            borderWidth: 2,
            borderColor: darkModeEnabled ? 'rgba(255, 255, 255, 0.5)' : 'white',
          }]}>
            <AntDesign name="plus" size={24} color={darkModeEnabled ? 'white' : 'black'} />
          </View>
        </TouchableWithoutFeedback>
      )}
    </Animated.View>
  );
};

export default ActionButton;

const styles = StyleSheet.create({
    actionButtonContainer: {
        backgroundColor: 'transparent',
        borderRadius: 25,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        
        left: 5,
        
    },
    actionButton: {
        width: 50,
        height: 50,
        
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
        backgroundColor: '#fff',
    },
    expandedButton: {
        width: '100%',
        height: '40%',
        borderRadius: 25,
        flexDirection: 'row',
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
        backgroundColor: '#fff',
        marginVertical: 5,
    },
    expandedButtonsContainer: {
        width: 200,
        height: 100,
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingBottom: 10,
    },
    text: {
        fontSize: 13,
        fontFamily: 'Pagebash',
        marginLeft: 10,
    },
});

