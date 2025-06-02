import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    modalView: {
        top: '23%',
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 40,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    title: {
        fontSize: 24,
        fontFamily: 'Pagebash',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    input: {
        width: '100%',
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        color: '#333',
    },
    button: {
        width: '100%',
        backgroundColor: '#3498DB',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: 'rgba(52, 152, 219, 0.5)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
    },
    buttonText: {
        fontFamily: 'Pagebash',
        color: 'white',
        fontSize: 18,
    },
});

export default styles
