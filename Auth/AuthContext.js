import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from './firebase-config'; // Asegúrate de que la ruta sea correcta
import { onAuthStateChanged, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({
    isAuthenticated: false, // Estado inicial
    setIsAuthenticated: () => {}, // Función vacía como placeholder
    handleLogout: () => {} // Función vacía como placeholder
  });
  

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children,navigation }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            await AsyncStorage.removeItem('user'); // Asegúrate de que 'user' es la clave correcta
            setIsAuthenticated(false);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };
    

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};
