import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#8c4dff', // Adjusted to match the background color in the image
    },
    loginBox: {
        width: '90%', // Adjusted for a bit wider box
        borderRadius: 25, // Increased to match the border radius in the image
        padding: 20,
        backgroundColor: 'white', // Added to give the box a white background
        alignItems: 'center',
        elevation: 5, // Added for shadow effect
    },
    title: {
        fontSize: 30, // Made larger to match the image
        fontFamily: 'Pagebash', // Make sure this font is available or choose a similar one
        color: '#4a148c', // Adjusted to match the color in the image
        textAlign: 'center',
        marginBottom: 40, // Increased spacing
    },
    input: {
        width: '100%',
        height: 50, // Increased height for a larger input area
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        paddingHorizontal: 15, // Increased for more internal space
        fontSize: 16, // Increased font size
        marginBottom: 15,
        borderWidth: 1.5, // Made border slightly thicker
        borderColor: '#4a148c', // Changed to match the theme color
        color: '#333',
    },
    button: {
        width: '100%',
        backgroundColor: '#4a148c', // Adjusted to match the button color in the image
        borderRadius: 20, // Increased to match the image
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 10,
        elevation: 3, // Adjusted for shadow effect
    },
    buttonText: {
        fontFamily: 'Pagebash', // Make sure this font is available or choose a similar one
        color: 'white',
        fontSize: 20, // Increased font size to match the image
    },
    // Other styles (createAccountButton, createAccountButtonText, modalView) seem to not be present in the image provided,
    // so they can either be removed or left as is if they are used elsewhere in the app.
});

export default styles;