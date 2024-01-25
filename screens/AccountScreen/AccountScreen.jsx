import React, { useState, useEffect,useContext } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { selectDarkMode, toggleDarkMode } from '../../redux/darkModeSlice';
import { Ionicons } from '@expo/vector-icons';
import { useAuth,AuthContext } from '../../Auth/AuthContext'; 

const AccountScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const darkModeEnabled = useSelector(selectDarkMode);
  const {handleLogout} = useAuth();

  const [iconOpacity] = useState(new Animated.Value(darkModeEnabled ? 1 : 0));
  const [backgroundColor] = useState(new Animated.Value(darkModeEnabled ? 1 : 0));

  useEffect(() => {
    Animated.timing(iconOpacity, {
      toValue: darkModeEnabled ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.timing(backgroundColor, {
      toValue: darkModeEnabled ? 1 : 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [darkModeEnabled, backgroundColor, iconOpacity]);

  const backgroundStyle = backgroundColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgb(245, 245, 245)', '#121212'],
  });

  const onLogoutPress = async () => {
    await handleLogout();
    //console log con el usuario y diciendo que se ha cerrado sesion
    console.log('Usuario desconectado');
    
};

  const onToggleDarkMode = () => {
    dispatch(toggleDarkMode());
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: backgroundStyle }]}>
      <TouchableOpacity onPress={onToggleDarkMode} style={styles.iconToggle}>
        <Animated.View
          style={[
            styles.icon,
            { opacity: iconOpacity.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
          ]}
        >
          <Ionicons name="sunny" size={24} color='black' />
        </Animated.View>
        <Animated.View style={[styles.icon, { opacity: iconOpacity }]}>
          <Ionicons name="moon" size={24} color='#f4f3f4' />
        </Animated.View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogoutPress}>
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconToggle: {
    marginBottom: 20,
    padding: 10,
  },
  icon: {
    position: 'absolute',
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#6200EE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutButtonText: {
    fontFamily: 'Pagebash',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccountScreen;
