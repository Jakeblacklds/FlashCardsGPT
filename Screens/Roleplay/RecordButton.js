// RecordButton.js
import React from 'react';
import { Button } from 'react-native';

const RecordButton = ({ recording, onStartRecording, onStopRecording, disabled }) => {
  return (
    <Button
      title={recording ? 'Detener Grabación' : 'Iniciar Grabación'}
      onPress={recording ? onStopRecording : onStartRecording}
      disabled={disabled}
      color="#4CAF50"
    />
  );
};

export default RecordButton;