import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {

        flex: 1,
        
        backgroundColor: 'white',
       

    },
    title: {
        fontFamily: 'Pagebash',
        backgroundColor: '#3f37c9',
        borderRadius: 30,
        fontSize: 40,
        marginHorizontal: 70,
        textAlign: 'center',
    },
    listContainer: {
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: 30,
    },
    buttonsContainer: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonContainer: {
        backgroundColor: 'transparent',
        borderRadius: 25,
        overflow: 'hidden',
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
        marginVertical: 1,
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
    text: {
        fontSize: 13,
        fontFamily: 'Pagebash',
    },
    actionButtonPosition: {
        position: 'absolute',
        right: 20,
        bottom: 20,
      },
});

export default styles