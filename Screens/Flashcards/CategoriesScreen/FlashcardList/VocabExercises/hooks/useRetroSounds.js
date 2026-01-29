import { useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';

/**
 * useRetroSounds - Hook para reproducir sonidos retro 8-bit
 * Precarga los sonidos al montar para reproducción inmediata
 */
const useRetroSounds = () => {
    const soundsRef = useRef({});
    const isLoadedRef = useRef(false);

    // Precargar sonidos al montar
    useEffect(() => {
        const loadSounds = async () => {
            try {
                // Configurar audio
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: true,
                });

                // Cargar sonidos
                const soundFiles = {
                    correct: require('../../../../../../assets/audio/exercises/correct.wav'),
                    wrong: require('../../../../../../assets/audio/exercises/wrong.wav'),
                };

                for (const [name, source] of Object.entries(soundFiles)) {
                    const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: false });
                    soundsRef.current[name] = sound;
                }

                isLoadedRef.current = true;
                console.log('Retro sounds loaded successfully');
            } catch (error) {
                console.error('Error loading sounds:', error);
            }
        };

        loadSounds();

        // Limpiar sonidos al desmontar
        return () => {
            Object.values(soundsRef.current).forEach(sound => {
                if (sound) {
                    sound.unloadAsync().catch(() => { });
                }
            });
        };
    }, []);

    // Reproducir un sonido
    const playSound = useCallback(async (soundName) => {
        try {
            const sound = soundsRef.current[soundName];
            if (sound && isLoadedRef.current) {
                await sound.setPositionAsync(0);
                await sound.playAsync();
            }
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }, []);

    // Sonidos específicos
    const playCorrect = useCallback(() => playSound('correct'), [playSound]);
    const playWrong = useCallback(() => playSound('wrong'), [playSound]);
    const playLevelUp = useCallback(() => playSound('levelup'), [playSound]);
    const playClick = useCallback(() => playSound('click'), [playSound]);

    return {
        playSound,
        playCorrect,
        playWrong,
        playLevelUp,
        playClick,
        isLoaded: isLoadedRef.current,
    };
};

export default useRetroSounds;
