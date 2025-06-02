// TranscriptText.js
import React from 'react';
import { Text, StyleSheet } from 'react-native';

const TranscriptText = ({ transcript }) => {
  return <Text style={styles.transcriptText}>Transcripción: {transcript}</Text>;
};

const styles = StyleSheet.create({
  transcriptText: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
});

export default TranscriptText;