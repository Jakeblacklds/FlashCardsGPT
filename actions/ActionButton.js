// ActionButton.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const ActionButton = ({ isButtonPressed, onButtonPress }) => {
  return (
    <View style={styles.buttonsContainer}>
      {isButtonPressed ? (
        <View style={styles.expandedButtonsContainer}>
          <TouchableOpacity
            style={[styles.expandedButton, styles.addGPTButton]}
            onPress={() => onButtonPress('AddCategory')}
          >
            <AntDesign name="plus" size={24} color="black" />
            <Text>Agregar Categoría</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.expandedButton, styles.addGPTButton]}
            onPress={() => onButtonPress('AddGpt')}
          >
            <AntDesign name="robot" size={24} color="black" />
            <Text>Agregar Categoría Con IA</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableWithoutFeedback onPress={onButtonPress}>
          <View style={styles.actionButton}>
            <AntDesign name="plus" size={24} color="black" />
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonsContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginVertical: 5,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: '#fff',
  },
  expandedButtonsContainer: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: 200,
    height: 100,
  },
  addGPTButton: {},
});

export default ActionButton;
