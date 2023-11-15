import React, { createContext, useState, useContext } from 'react';

// Crear un contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);

// Proveedor de contexto que envuelve la aplicación
export const AuthProvider = ({ children }) => {
    // Estado para controlar si el usuario está autenticado
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Función para manejar el cierre de sesión
    const handleLogout = async () => {
        try {
            // Aquí va tu lógica para eliminar el token de autenticación o sesión de usuario
            await AsyncStorage.removeItem('user');
            // Actualizar el estado para indicar que el usuario ya no está autenticado
            setIsAuthenticated(false);
        } catch (error) {
            // En caso de error, podrías manejarlo aquí
            console.log(error);
        }
    };

    // Proporcionar el estado y las funciones a los componentes hijos
    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};
