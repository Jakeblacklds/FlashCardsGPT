import React, { useState, useRef, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  Animated,
  ScrollView,
  Dimensions
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setCurrentUserUID } from '../../../redux/FlashcardSlice';

const screenHeight = Dimensions.get('window').height;

const LoginScreen = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const auth = getAuth();

  // Animación de entrada
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      dispatch(setCurrentUserUID(user.uid));
      if (props.onAuthenticated) props.onAuthenticated();
    } catch (error) {
      Alert.alert("Error", "No se pudo iniciar sesión", [{ text: "OK" }]);
    }
  };

  return (
    <LinearGradient
      colors={['#5ae4aa', '#4d8cff', '#c94fff']}
      start={{ x: 0.1, y: 0.2 }}
      end={{ x: 0.9, y: 0.9 }}
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.panel,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.title}>¡Bienvenido de nuevo!</Text>
            <Text style={styles.subtitle}>
              Ingresa tus datos para continuar
            </Text>
            <View style={styles.inputGroup}>
              <MaterialCommunityIcons name="email-outline" size={22} color="#1e1e1e" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#777"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize='none'
              />
            </View>
            <View style={styles.inputGroup}>
              <MaterialCommunityIcons name="lock-outline" size={22} color="#1e1e1e" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#777"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSignIn}>
              <Text style={styles.buttonText}>Continuar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')} style={styles.registerTouch}>
              <Text style={styles.registerText}>
                ¿No tienes cuenta? <Text style={styles.registerBold}>Regístrate</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: screenHeight,
    paddingVertical: 34,
  },
  panel: {
    width: '90%',
    alignSelf: 'center',
    paddingVertical: 34,
    paddingHorizontal: 22,
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderRadius: 36,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 26,
    elevation: 15,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Pagebash',
    color: '#292929',
    textAlign: 'center',
    fontWeight: '800',
    marginBottom: 5,
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 17,
    color: '#444',
    textAlign: 'center',
    fontFamily: 'Pagebash',
    marginBottom: 27,
    opacity: 0.90,
    fontWeight: '500'
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 9,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 15,
    paddingHorizontal: 13,
    fontSize: 16.5,
    fontFamily: 'Pagebash',
    borderWidth: 1.2,
    borderColor: '#78e4ff',
    color: '#212121',
  },
  button: {
    width: '100%',
    backgroundColor: '#4d8cff',
    borderRadius: 22,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 7,
    elevation: 5,
    shadowColor: '#4d8cff',
  },
  buttonText: {
    fontFamily: 'Pagebash',
    color: '#1e1e1e',
    fontSize: 21,
    fontWeight: '700',
  },
  registerTouch: {
    marginTop: 12,
    paddingVertical: 8,
  },
  registerText: {
    fontFamily: 'Pagebash',
    color: '#3268b8',
    fontWeight: '500',
    fontSize: 15.5,
    textAlign: 'center',
  },
  registerBold: {
    fontWeight: '700',
    textDecorationLine: 'underline',
    color: '#c94fff',
  },
});

export default LoginScreen;
