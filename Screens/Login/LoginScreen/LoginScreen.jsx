import React, { useState, useRef, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  ScrollView,
  Dimensions,
  Alert,
  Keyboard
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setCurrentUserUID } from '../../../redux/FlashcardSlice';

const KEYBOARD_OFFSET_VALUE = -180;

const LoginScreen = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const colorPair = props.colorPair || {
    background: '#6366F1',
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

  const auth = getAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields", [{ text: "OK" }]);
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      dispatch(setCurrentUserUID(user.uid));
      if (props.onAuthenticated) props.onAuthenticated();
    } catch (error) {
      Alert.alert("Error", "Invalid email or password", [{ text: "OK" }]);
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
                <FontAwesome5 name="user-lock" size={45} color={colorPair.background} />
              </View>
            </Animated.View>

            <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
              TRAINER LOGIN
            </Animated.Text>
            <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
              ◆ Access your Flashcardex ◆
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
                autoCapitalize='none'
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
                returnKeyType="done"
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

            {/* Botón Login */}
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colorPair.background }]}
              onPress={handleSignIn}
              activeOpacity={0.85}
            >
              <FontAwesome5 name="sign-in-alt" size={14} color="#FFF" />
              <Text style={styles.loginButtonText}>ENTER</Text>
            </TouchableOpacity>

            {/* Link a Register */}
            <TouchableOpacity 
              onPress={() => navigation.navigate('RegisterScreen')} 
              style={styles.registerTouch}
            >
              <Text style={styles.registerText}>
                Don't have an account?{' '}
                <Text style={[styles.registerBold, { color: colorPair.background }]}>Register</Text>
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
    paddingTop: Dimensions.get('window').height * 0.08,
    paddingHorizontal: 30,
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconFrame: {
    width: 90,
    height: 90,
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
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
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
    marginBottom: 20,
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
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderWidth: 3,
    borderBottomWidth: 0,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  panelDecor: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
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
    marginBottom: 12,
    height: 52,
    overflow: 'hidden',
  },
  inputIcon: { 
    width: 44,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#333',
    paddingRight: 12,
  },
  eyeButton: {
    paddingHorizontal: 14,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 16,
    gap: 10,
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  loginButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#FFF',
  },
  registerTouch: {
    marginTop: 4,
    paddingVertical: 8,
  },
  registerText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
  registerBold: {
    fontWeight: '900',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: '#999',
  },
});

export default LoginScreen;