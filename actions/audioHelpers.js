import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export const startRecording = async () => {
    await Audio.requestPermissionsAsync();
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    await recording.startAsync();
    return recording;
};

export const stopRecording = async (recording) => {
    await recording.stopAndUnloadAsync();
    return recording.getURI();
};

export const playAudio = async (filePath) => {
    const { sound } = await Audio.Sound.createAsync({ uri: filePath });
    await sound.playAsync();
};
