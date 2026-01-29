import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { View, Platform, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { selectDarkMode } from '../redux/darkModeSlice';

import CategoriesScreen from '../Screens/Flashcards/CategoriesScreen/CategoriesScreen';
import ChatScreen from '../Screens/Roleplay/ChatScreen';
import ExercisesScreen from '../Screens/Learn/ExercisesScreen';
import AccountScreen from '../Screens/Account/AccountScreen/AccountScreen';

const Tab = createBottomTabNavigator();

const TAB_CONFIG = {
  Flashcards: {
    iconFocused: 'layers',
    iconUnfocused: 'layers-outline',
    label: 'GAMES',
    accentColor: '#10B981', // Green
  },
  Grammar: {
    iconFocused: 'book',
    iconUnfocused: 'book-outline',
    label: 'STUDY',
    accentColor: '#F59E0B', // Amber
  },
  Chat: {
    iconFocused: 'chatbubbles',
    iconUnfocused: 'chatbubbles-outline',
    label: 'CHAT',
    accentColor: '#3B82F6', // Blue
  },
  Account: {
    iconFocused: 'person-circle',
    iconUnfocused: 'person-circle-outline',
    label: 'USER',
    accentColor: '#8B5CF6', // Purple
  },
};

/**
 * PixelDot - Decoración de píxel animado
 */
const PixelDot = ({ focused, color }) => {
  const opacity = useSharedValue(focused ? 1 : 0.3);

  useEffect(() => {
    if (focused) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0.5, { duration: 600 })
        ),
        -1,
        true
      );
    } else {
      opacity.value = withTiming(0.3, { duration: 200 });
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.pixelDot,
        { backgroundColor: color },
        animatedStyle
      ]}
    />
  );
};

/**
 * RetroButton - Botón estilo Game Boy con efecto 3D
 */
const AnimatedTabIcon = ({ focused, routeName, darkMode }) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (focused) {
      // Animación de "bounce" al seleccionar
      scale.value = withSequence(
        withSpring(1.15, { damping: 8, stiffness: 100 }),
        withSpring(1.08, { damping: 10 })
      );
      translateY.value = withSpring(-3, { damping: 10 });
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      scale.value = withSpring(1, { damping: 10 });
      translateY.value = withSpring(0, { damping: 10 });
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [focused]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const config = TAB_CONFIG[routeName];
  const buttonColor = config.accentColor;
  const shadowColor = darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.25)';

  return (
    <View style={styles.iconContainer}>
      {/* Glow effect */}
      {focused && (
        <Animated.View
          style={[
            styles.glowEffect,
            { backgroundColor: buttonColor },
            animatedGlowStyle
          ]}
        />
      )}

      {/* Button shadow */}
      <View
        style={[
          styles.buttonShadow,
          { backgroundColor: shadowColor }
        ]}
      />

      {/* Main button */}
      <Animated.View
        style={[
          styles.retroButton,
          { backgroundColor: focused ? buttonColor : (darkMode ? '#2A2D35' : '#E5E7EB') },
          { borderColor: focused ? buttonColor : (darkMode ? '#3A3D45' : '#D1D5DB') },
          animatedButtonStyle
        ]}
      >
        {/* Button highlight */}
        <View style={styles.buttonHighlight} />

        {/* Icon */}
        <Ionicons
          name={focused ? config.iconFocused : config.iconUnfocused}
          size={22}
          color={focused ? '#FFFFFF' : (darkMode ? '#8A8A8E' : '#6B7280')}
        />

        {/* Pixel decoration dots */}
        {focused && (
          <View style={styles.pixelDecoration}>
            <PixelDot focused={focused} color="rgba(255,255,255,0.6)" />
            <PixelDot focused={focused} color="rgba(255,255,255,0.4)" />
          </View>
        )}
      </Animated.View>
    </View>
  );
};

/**
 * Scanlines - Efecto de líneas CRT
 */
const Scanlines = () => {
  const opacity = useSharedValue(0.03);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.05, { duration: 2000 }),
        withTiming(0.02, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.scanlines, animatedStyle]}>
      {[...Array(8)].map((_, i) => (
        <View key={i} style={styles.scanline} />
      ))}
    </Animated.View>
  );
};

/**
 * CustomTabBar - Barra de tabs rediseñada estilo Game Boy
 */
const CustomTabBar = ({ state, descriptors, navigation, darkMode }) => {
  const bgColor = darkMode ? '#1A1C1E' : '#F5F5F7';
  const borderColor = darkMode ? 'rgba(74,222,128,0.2)' : 'rgba(16,185,129,0.15)';

  return (
    <View style={styles.tabBarContainer}>
      <LinearGradient
        colors={
          darkMode
            ? ['#0F0F0F', '#1A1C1E']
            : ['#FFFFFF', '#F5F5F7']
        }
        style={styles.gradientBg}
      >
        {/* Top decorative border */}
        <View style={styles.topDecorRow}>
          <View style={[styles.topDecorLine, { backgroundColor: borderColor }]} />
          <View style={styles.topDecorCenter}>
            <View style={[styles.decorPixelSmall, {
              backgroundColor: darkMode ? '#4ADE80' : '#10B981'
            }]} />
            <View style={[styles.decorPixelSmall, {
              backgroundColor: darkMode ? '#4ADE80' : '#10B981',
              opacity: 0.6
            }]} />
            <View style={[styles.decorPixelSmall, {
              backgroundColor: darkMode ? '#4ADE80' : '#10B981',
              opacity: 0.3
            }]} />
          </View>
          <View style={[styles.topDecorLine, { backgroundColor: borderColor }]} />
        </View>

        {/* Scanlines effect */}
        <Scanlines />

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const config = TAB_CONFIG[route.name];

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TouchableOpacity
                key={route.key}
                style={styles.tabButton}
                onPress={onPress}
                onLongPress={onLongPress}
                activeOpacity={0.7}
              >
                <AnimatedTabIcon
                  focused={isFocused}
                  routeName={route.name}
                  darkMode={darkMode}
                />

                {/* Label */}
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isFocused
                        ? (darkMode ? '#FFFFFF' : '#1F2937')
                        : (darkMode ? '#6B7280' : '#9CA3AF')
                    }
                  ]}
                >
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom decorative elements */}
        <View style={styles.bottomDecor}>
          <View style={[styles.bottomDot, {
            backgroundColor: darkMode ? 'rgba(74,222,128,0.3)' : 'rgba(16,185,129,0.2)'
          }]} />
          <View style={[styles.bottomLine, {
            backgroundColor: darkMode ? 'rgba(74,222,128,0.15)' : 'rgba(16,185,129,0.1)'
          }]} />
          <View style={[styles.bottomDot, {
            backgroundColor: darkMode ? 'rgba(74,222,128,0.3)' : 'rgba(16,185,129,0.2)'
          }]} />
        </View>
      </LinearGradient>

      {/* Border */}
      <View
        style={[
          styles.tabBarBorder,
          { borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }
        ]}
      />
    </View>
  );
};

const TabNavigator = () => {
  const darkModeEnabled = useSelector(selectDarkMode);

  return (
    <View style={{ flex: 1, backgroundColor: darkModeEnabled ? '#0D0D0E' : '#F5F5F7' }}>
      <Tab.Navigator
        initialRouteName="Flashcards"
        tabBar={(props) => (
          <CustomTabBar {...props} darkMode={darkModeEnabled} />
        )}
        screenOptions={{
          headerShown: false,
          animation: 'shift',
        }}
      >
        <Tab.Screen name="Flashcards" component={CategoriesScreen} />
        <Tab.Screen name="Grammar" component={ExercisesScreen} />
        <Tab.Screen name="Chat" component={ChatScreen} />
        <Tab.Screen name="Account" component={AccountScreen} />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 95 : 85,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  gradientBg: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  },
  tabBarBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomWidth: 0,
    pointerEvents: 'none',
  },

  // Top decoration
  topDecorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 6,
    gap: 8,
  },
  topDecorLine: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  topDecorCenter: {
    flexDirection: 'row',
    gap: 4,
  },
  decorPixelSmall: {
    width: 4,
    height: 4,
    borderRadius: 1,
  },

  // Scanlines
  scanlines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-around',
    pointerEvents: 'none',
  },
  scanline: {
    height: 1,
    backgroundColor: '#000',
  },

  // Tabs
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  // Icon container
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowEffect: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    zIndex: 0,
  },
  buttonShadow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    top: 3,
    zIndex: 1,
  },
  retroButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
    overflow: 'hidden',
  },
  buttonHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  pixelDecoration: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    gap: 3,
  },
  pixelDot: {
    width: 3,
    height: 3,
    borderRadius: 1,
  },

  // Label
  tabLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // Bottom decoration
  bottomDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    gap: 8,
  },
  bottomDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  bottomLine: {
    width: 60,
    height: 2,
    borderRadius: 1,
  },
});

export default TabNavigator;
