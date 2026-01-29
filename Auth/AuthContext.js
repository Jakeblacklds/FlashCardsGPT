import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from './firebase-config';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';

/**
 * CONTEXTO DE AUTENTICACIÓN FLASHCARD
 * Maneja: Estado de autenticación, login Google, logout.
 * - Después de login Google, crea estructura inicial en RealtimeDB solo si no existe (pila tipo RegisterScreen).
 * - Compatible con reglas Firebase que requieren JWT token.
 */
const AuthContext = createContext({
    isAuthenticated: false,
    setIsAuthenticated: () => {},
    handleLogout: () => {},
    signInWithGoogle: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children, navigation }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
        });

        return () => unsubscribe();
    }, []);

    // Cierra sesión en Google, Firebase y limpia la app.
    const handleLogout = async () => {
        try {
            try {
                await GoogleSignin.revokeAccess();
                await GoogleSignin.signOut();
            } catch (googleError) {
                console.log('No hay sesión Google activa o error al cerrar:', googleError.message);
            }
            await signOut(auth);
            await AsyncStorage.removeItem('user');
            setIsAuthenticated(false);
            console.log('Sesión cerrada exitosamente');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            try {
                await signOut(auth);
                setIsAuthenticated(false);
            } catch (finalError) {
                console.error("Error crítico al cerrar sesión:", finalError);
            }
        }
    };

    /**
     * LOGIN CON GOOGLE + CREACIÓN DE PILA EN REALTIMEDB
     * - Siempre usa el token JWT para escritura conforme a reglas de Firebase.
     * - Si el usuario es nuevo, crea la estructura inicial de flashcards.
     * - Si el usuario ya existe, no sobrescribe.
     */
    const signInWithGoogle = async () => {
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const { idToken } = await GoogleSignin.signIn();
            const googleCredential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, googleCredential);
            const user = userCredential.user;
            await AsyncStorage.setItem('user', JSON.stringify(user));
            const uid = user.uid;
            const token = await user.getIdToken(true); // JWT válido para tu usuario, requerido por reglas

            const dbUrl = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${uid}.json?auth=${token}`;
            const newUserStructure = {
                categories: {
                    Animals: {
                        flashcards: {
                            flashcard1: { english: "dog", spanish: "perro" }
                        },
                        name: "Animals"
                    }
                }
            };

            try {
                // Checa primero si existe (por reglas: solo el usuario accede a su subrama)
                const exists = await axios.get(dbUrl);
                if (!exists.data) {
                    await axios.put(dbUrl, newUserStructure);
                    console.log('✅ Estructura inicial creada para usuario Google:', uid);
                } else {
                    console.log('ℹ️ Usuario Google ya tiene estructura, no se sobreescribe:', uid);
                }
            } catch (err) {
                console.log('❌ Error al crear estructura inicial:', err.message);
            }

            return {
                success: true,
                user: user
            };
        } catch (error) {
            console.error('Error en Google Sign-In:', error);
            if (error.code === 'sign_in_cancelled') {
                return { success: false, error: 'Inicio de sesión cancelado' };
            } else if (error.code === 'in_progress') {
                return { success: false, error: 'Inicio de sesión en progreso' };
            } else if (error.code === 'play_services_not_available') {
                return { success: false, error: 'Google Play Services no disponible' };
            }
            return { 
                success: false, 
                error: error.message || 'Error al iniciar sesión con Google' 
            };
        }
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            setIsAuthenticated, 
            handleLogout,
            signInWithGoogle 
        }}>
            {children}
        </AuthContext.Provider>
    );
};
