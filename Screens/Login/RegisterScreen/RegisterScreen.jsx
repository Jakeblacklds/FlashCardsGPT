import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated,
  Dimensions,
  Keyboard
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseConfig } from '../../../Auth/firebase-config'; 
import { initializeApp } from "firebase/app";
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setCurrentUserUID } from '../../../redux/FlashcardSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYBOARD_OFFSET_VALUE = -180;

const RegisterScreen = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const colorPair = props.colorPair || {
    background: '#8B5CF6',
    text: '#FFF'
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const panelAnim = useRef(new Animated.Value(Dimensions.get('window').height * 0.3)).current;
  const headerOpacityAnim = useRef(new Animated.Value(1)).current;
  const headerScaleAnim = useRef(new Animated.Value(1)).current;
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const handleKeyboardShow = () => {
      Animated.parallel([
        Animated.timing(keyboardOffset, {
          toValue: KEYBOARD_OFFSET_VALUE,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(headerScaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    };

    const handleKeyboardHide = () => {
      Animated.parallel([
        Animated.timing(keyboardOffset, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(headerScaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    };

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardHide);

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [keyboardOffset, headerOpacityAnim, headerScaleAnim]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(panelAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, panelAnim]);

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  const handleCreateAccount = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields", [{ text: "OK" }]);
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match", [{ text: "OK" }]);
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters", [{ text: "OK" }]);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await AsyncStorage.setItem('user', JSON.stringify({ uid: user.uid }));
      
      dispatch(setCurrentUserUID(user.uid));
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
      const url = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${user.uid}.json`;
      await axios.put(url, newUserStructure);
      Alert.alert("Welcome to Flashcardex! 🎉", "Your trainer account is ready", [{ text: "LET'S GO!" }]);
      navigation.navigate("Login");
    } catch (error) {
      console.error("Error creating user:", error);
      Alert.alert("Error", "Could not create account. Try a different email.", [{ text: "OK" }]);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, { backgroundColor: colorPair.background }]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <Animated.View style={[
          styles.contentWrapper, 
          { transform: [{ translateY: keyboardOffset }] }
        ]}>
          {/* Header estilo Pokédex */}
          <Animated.View style={[
            styles.headerContainer, 
            { 
              opacity: headerOpacityAnim,
              transform: [{ scale: headerScaleAnim }]
            }
          ]}>
            <Animated.View style={[styles.iconContainer, { opacity: fadeAnim }]}>
              <View style={styles.iconFrame}>
                <FontAwesome5 name="user-plus" size={42} color={colorPair.background} />
              </View>
            </Animated.View>

            <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
              NEW TRAINER
            </Animated.Text>
            <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
              ◆ Join Flashcardex ◆
            </Animated.Text>
          </Animated.View>

          {/* Panel de formulario */}
          <Animated.View style={[
            styles.panel,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: panelAnim }] 
            }
          ]}>
            {/* Decoración superior */}
            <View style={styles.panelDecor}>
              <View style={[styles.decorDot, { backgroundColor: '#FF6B6B' }]} />
              <View style={[styles.decorDot, { backgroundColor: '#FFD93D' }]} />
              <View style={[styles.decorDot, { backgroundColor: '#4ADE80' }]} />
            </View>

            {/* Campo Email */}
            <View style={[styles.inputGroup, { borderColor: `${colorPair.background}30` }]}>
              <View style={[styles.inputIcon, { backgroundColor: `${colorPair.background}15` }]}>
                <FontAwesome5 name="envelope" size={14} color={colorPair.background} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>

            {/* Campo Password */}
            <View style={[styles.inputGroup, { borderColor: `${colorPair.background}30` }]}>
              <View style={[styles.inputIcon, { backgroundColor: `${colorPair.background}15` }]}>
                <FontAwesome5 name="lock" size={14} color={colorPair.background} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                returnKeyType="next"
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <FontAwesome5 
                  name={showPassword ? "eye-slash" : "eye"} 
                  size={14} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <View style={[styles.inputGroup, { borderColor: `${colorPair.background}30` }]}>
              <View style={[styles.inputIcon, { backgroundColor: `${colorPair.background}15` }]}>
                <FontAwesome5 name="check-circle" size={14} color={colorPair.background} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                returnKeyType="done"
              />
            </View>

            {/* Botón Register */}
            <TouchableOpacity
              style={[styles.registerButton, { backgroundColor: colorPair.background }]}
              onPress={handleCreateAccount}
              activeOpacity={0.85}
            >
              <FontAwesome5 name="rocket" size={14} color="#FFF" />
              <Text style={styles.registerButtonText}>CREATE ACCOUNT</Text>
            </TouchableOpacity>

            {/* Link a Login */}
            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')} 
              style={styles.loginTouch}
            >
              <Text style={styles.loginText}>
                Already have an account?{' '}
                <Text style={[styles.loginBold, { color: colorPair.background }]}>Sign In</Text>
              </Text>
            </TouchableOpacity>

            {/* Volver */}
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
            >
              <FontAwesome5 name="arrow-left" size={12} color="#999" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerContainer: {
    paddingTop: Dimensions.get('window').height * 0.06,
    paddingHorizontal: 30,
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: 14,
  },
  iconFrame: {
    width: 85,
    height: 85,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  title: {
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 2,
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 11,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  panel: {
    width: '100%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderWidth: 3,
    borderBottomWidth: 0,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  panelDecor: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 18,
  },
  decorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 10,
    height: 50,
    overflow: 'hidden',
  },
  inputIcon: { 
    width: 42,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#333',
    paddingRight: 12,
  },
  eyeButton: {
    paddingHorizontal: 12,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 6,
    marginBottom: 14,
    gap: 10,
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  registerButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#FFF',
  },
  loginTouch: {
    marginTop: 2,
    paddingVertical: 6,
  },
  loginText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    textAlign: 'center',
    color: '#666',
  },
  loginBold: {
    fontWeight: '900',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    color: '#999',
  },
});

export default RegisterScreen;