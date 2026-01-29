import React, { useRef, useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Alert, StatusBar, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import CarouselLogin from './CarouselLogin';
import { COLOR_PAIRS } from '../../constants';
import { useAuth } from '../../Auth/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingScreen from './LoadingScreen';

const slidesLength = 3;

function isLightColor(hex) {
  const c = hex.replace('#', '');
  const rgb = parseInt(c.length === 3 ? c.split('').map(x=>x+x).join('') : c, 16);
  const r = (rgb >> 16) & 0xff, g = (rgb >> 8) & 0xff, b = rgb & 0xff;
  return (0.2126*r + 0.7152*g + 0.0722*b) > 164;
}

const IntroScreen = () => {
  const navigation = useNavigation();
  const { signInWithGoogle } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const panelAnim = useRef(new Animated.Value(60)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;

  const pairs = Array.from({ length: slidesLength }, (_, i) => 
    COLOR_PAIRS[`pair${i + 6}`] || { background: '#6366F1', text: '#FFF' }
  );
  
  const animatedBg = backgroundAnim.interpolate({
    inputRange: pairs.map((_, i) => i),
    outputRange: pairs.map((pair) => pair.background)
  });
  
  const currentColors = pairs[activeSlide];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(panelAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleSlideChange = (idx) => {
    setActiveSlide(idx);
    Animated.timing(backgroundAnim, {
      toValue: idx,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(currentColors.background, true);
    }
    StatusBar.setBarStyle(isLightColor(currentColors.background) ? 'dark-content' : 'light-content', true);
  }, [activeSlide, currentColors.background]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const result = await signInWithGoogle();
    setIsLoading(false);
    if (!result.success) {
      Alert.alert('Authentication Error', result.error, [{ text: 'OK' }]);
    }
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: animatedBg }]}>
      <StatusBar 
        translucent
        backgroundColor="transparent"
        barStyle={isLightColor(currentColors.background) ? 'dark-content' : 'light-content'}
        animated
      />
      {!isLoading && (
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={{ width: '100%', paddingTop: insets.top }}>
            <CarouselLogin onSlideChange={handleSlideChange} />
          </View>

          {/* Panel de acciones estilo Pokédex */}
          <Animated.View style={[
            styles.panel,
            { transform: [{ translateY: panelAnim }] }
          ]}>
            {/* Header del panel */}
            <View style={styles.panelHeader}>
              <View style={[styles.headerDot, { backgroundColor: '#FF6B6B' }]} />
              <View style={[styles.headerDot, { backgroundColor: '#FFD93D' }]} />
              <View style={[styles.headerDot, { backgroundColor: '#4ADE80' }]} />
              <Text style={styles.panelTitle}>◆ SELECT ACTION ◆</Text>
              <View style={[styles.headerDot, { backgroundColor: '#4ADE80' }]} />
              <View style={[styles.headerDot, { backgroundColor: '#FFD93D' }]} />
              <View style={[styles.headerDot, { backgroundColor: '#FF6B6B' }]} />
            </View>

            {/* Botón Sign In */}
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, { 
                backgroundColor: currentColors.background,
                borderColor: currentColors.background,
              }]}
              activeOpacity={0.87}
              onPress={() => navigation.navigate('Login')}
            >
              <FontAwesome5 name="sign-in-alt" size={16} color="#FFF" />
              <Text style={styles.primaryButtonText}>SIGN IN</Text>
            </TouchableOpacity>

            {/* Botón Google */}
            <TouchableOpacity
              style={[styles.button, styles.googleButton, isLoading && styles.buttonDisabled]}
              activeOpacity={0.85}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <MaterialCommunityIcons name="google" size={18} color="#EA4335" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Separador */}
            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>OR</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Botón Create Account */}
            <TouchableOpacity
              style={[styles.button, styles.registerButton, { borderColor: currentColors.background }]}
              activeOpacity={0.87}
              onPress={() => navigation.navigate('RegisterScreen')}
            >
              <FontAwesome5 name="user-plus" size={14} color={currentColors.background} />
              <Text style={[styles.registerButtonText, { color: currentColors.background }]}>
                CREATE ACCOUNT
              </Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <FontAwesome5 name="lock" size={10} color="rgba(0,0,0,0.3)" />
              <Text style={styles.footerText}>Your data is private and secure</Text>
            </View>
          </Animated.View>
        </Animated.View>
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <LoadingScreen />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  
  // Panel estilo Pokédex
  panel: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderBottomWidth: 0,
    borderColor: 'rgba(0,0,0,0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  headerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  panelTitle: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: 'rgba(0,0,0,0.4)',
    letterSpacing: 1.5,
    marginHorizontal: 6,
  },
  
  // Botones
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 10,
    borderWidth: 3,
  },
  primaryButton: {},
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFF',
    letterSpacing: 1.5,
  },
  googleButton: {
    backgroundColor: '#FFF',
    borderColor: '#E5E5E5',
  },
  googleButtonText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#333',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 4,
    gap: 10,
  },
  separatorLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 1,
  },
  separatorText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: 'rgba(0,0,0,0.3)',
    fontWeight: '600',
    letterSpacing: 1,
  },
  registerButton: {
    backgroundColor: 'transparent',
  },
  registerButtonText: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  footerText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: 'rgba(0,0,0,0.3)',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  }
});

export default IntroScreen;
