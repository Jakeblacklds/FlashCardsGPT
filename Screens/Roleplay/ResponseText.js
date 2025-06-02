// ResponseText.js
import React from 'react';
import { Text, StyleSheet } from 'react-native';

const ResponseText = ({ response }) => {
  return <Text style={styles.responseText}>Respuesta: {response}</Text>;
};

const styles = StyleSheet.create({
  responseText: {
    fontSize: 16,
    marginTop: 10,
    color: '#333',
  },
});

export default ResponseText;