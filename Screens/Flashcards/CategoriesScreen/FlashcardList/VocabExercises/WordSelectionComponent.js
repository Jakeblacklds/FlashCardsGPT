import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useSelector } from 'react-redux';

import { selectDarkMode } from '../../../../../redux/darkModeSlice'; 



const WordSelectionComponent = ({ modalVisible, setModalVisible, cancelAndGoBack, dynamicStyles, confirmStartExercises }) => {
    const darkModeEnabled = useSelector(selectDarkMode);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(false);
                cancelAndGoBack();
            }}
        >
            <View style={styles.centeredView}>
                <View style={dynamicStyles.modalView}>
                    {darkModeEnabled && <View style={dynamicStyles.darkModeOverlay} />}
                    <LottieView 
                        source={require('../../../../../assets/think.json')}
                        autoPlay
                        loop
                        style={{ width: 160, height: 200, position: 'absolute', top: '1%' }}
                    />
                    <Text style={dynamicStyles.modalText}>How many words do you want learn?</Text>
                    <View style={dynamicStyles.buttonRow}>
                        
                        {[2, 3, 4, 5].map((number) => (
                            
                            <TouchableOpacity
                                key={number}
                                style={dynamicStyles.numberButton}
                                onPress={() => confirmStartExercises(number)}
                            >
                                {darkModeEnabled && <View style={dynamicStyles.darkModeOverlayButton} />}
                                <Text style={dynamicStyles.numberButtonText}>{number}</Text>
                                
                            </TouchableOpacity>
                        ))}
                    </View>
                    
                    <TouchableOpacity
                        style={dynamicStyles.cancelButton}
                        onPress={cancelAndGoBack}
                    >
                        {darkModeEnabled && <View style={dynamicStyles.darkModeOverlayButton} />}
                        <Text style={dynamicStyles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default WordSelectionComponent;

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '10%',
    },
    modalView: {
        margin: 20,
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#f72585',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.75,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        fontSize: 20,
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 15,
    },
    numberButton: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    numberButtonText: {
        fontSize: 20,
        color: '#f72585',
    },
});
