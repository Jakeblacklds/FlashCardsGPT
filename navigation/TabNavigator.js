import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { View, Platform, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { selectDarkMode } from '../redux/darkModeSlice';

import CategoriesScreen from '../Screens/Flashcards/CategoriesScreen/CategoriesScreen';
import ChatScreen from '../Screens/Roleplay/ChatScreen';
import ExercisesScreen from '../Screens/Learn/ExercisesScreen';
import AccountScreen from '../Screens/Account/AccountScreen/AccountScreen';

// ICONOS FLASHCARDS
const flashcards_icons = {
  light: {
    selected: require('../assets/img/sections/flashcards/flashcards_light_selected.png'),
    unselected: require('../assets/img/sections/flashcards/flashcards_light_unselected.png'),
  },
  dark: {
    selected: require('../assets/img/sections/flashcards/flashcards_dark_selected.png'),
    unselected: require('../assets/img/sections/flashcards/flashcards_dark_unselected.png'),
  },
};
// ICONOS GRAMMAR
const grammar_icons = {
  light: {
    selected: require('../assets/img/sections/grammar/grammar_light_selected.png'),
    unselected: require('../assets/img/sections/grammar/grammar_light_unselected.png'),
  },
  dark: {
    selected: require('../assets/img/sections/grammar/grammar_dark_selected.png'),
    unselected: require('../assets/img/sections/grammar/grammar_dark_unselected.png'),
  },
};
// ICONOS CHAT
const chat_icons = {
  light: {
    selected: require('../assets/img/sections/chat/chat_light_selected.png'),
    unselected: require('../assets/img/sections/chat/chat_light_unselected.png'),
  },
  dark: {
    selected: require('../assets/img/sections/chat/chat_dark_selected.png'),
    unselected: require('../assets/img/sections/chat/chat_dark_unselected.png'),
  },
};
// ICONOS ACCOUNT
const account_icons = {
  light: {
    selected: require('../assets/img/sections/account/account_hex_light_selected.png'),
    unselected: require('../assets/img/sections/account/account_hex_light_unselected.png'),
  },
  dark: {
    selected: require('../assets/img/sections/account/account_hex_dark_selected.png'),
    unselected: require('../assets/img/sections/account/account_hex_dark_unselected.png'),
  },
};

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

// ANIMATED ICON with crossfade
const AnimatedTabBarIcon = ({ focused, darkMode, icons }) => {
  // Animated values con valores iniciales adaptados al estado focused
  const scale = useSharedValue(focused ? 1.12 : 1);
  const selectedOpacity = useSharedValue(focused ? 1 : 0);
  const unselectedOpacity = useSharedValue(focused ? 0 : 1);


  // Animación del fondo usando un enfoque más directo
  const bgStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      backgroundColor: darkMode 
        ? `rgba(247, 37, 133, ${selectedOpacity.value * 0.12})` 
        : `rgba(30, 30, 30, ${selectedOpacity.value * 0.09})`,
    };
  });

  // Estilos para las imágenes
  const selectedIconStyle = useAnimatedStyle(() => ({
    opacity: selectedOpacity.value,
    position: 'absolute',
    width: '100%',
    height: '100%',
  }));
  
  const unselectedIconStyle = useAnimatedStyle(() => ({
    opacity: unselectedOpacity.value,
    position: 'absolute',
    width: '100%',
    height: '100%',
  }));

  const iconSelected = darkMode ? icons.dark.selected : icons.light.selected;
  const iconUnselected = darkMode ? icons.dark.unselected : icons.light.unselected;

  return (
    <View style={styles.tabItemContainer}>
      <Animated.View style={[styles.iconContainer, bgStyle]}>
        <Animated.Image
          source={iconUnselected}
          style={[styles.icon, unselectedIconStyle]}
          resizeMode="contain"
        />
        <Animated.Image
          source={iconSelected}
          style={[styles.icon, selectedIconStyle]}
          resizeMode="contain"
        />
      </Animated.View>
      {focused && (
        <View
          style={[
            styles.activeIndicator,
            { backgroundColor: darkMode ? '#f72585' : '#6a6ef0' },
          ]}
        />
      )}
    </View>
  );
};

const TabNavigator = () => {
  const darkModeEnabled = useSelector(selectDarkMode);

  return (
    <View style={{ flex: 1, backgroundColor: darkModeEnabled ? '#121212' : '#F8F8F8' }}>
      <Tab.Navigator
        initialRouteName="Flashcards"
        screenOptions={{
          headerShown: false,
          animation: 'fade',

          tabBarShowLabel: false,
          tabBarStyle: {
            ...styles.tabBar,
            backgroundColor: darkModeEnabled ? '#18181c' : '#fff', // FONDO SÓLIDO
            borderTopWidth: 0,
          },
        }}
      >
        <Tab.Screen
          name="Flashcards"
          component={CategoriesScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <AnimatedTabBarIcon
                focused={focused}
                darkMode={darkModeEnabled}
                icons={flashcards_icons}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Grammar"
          component={ExercisesScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <AnimatedTabBarIcon
                focused={focused}
                darkMode={darkModeEnabled}
                icons={grammar_icons}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <AnimatedTabBarIcon
                focused={focused}
                darkMode={darkModeEnabled}
                icons={chat_icons}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Account"
          component={AccountScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <AnimatedTabBarIcon
                focused={focused}
                darkMode={darkModeEnabled}
                icons={account_icons}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 16,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    borderTopWidth: 0,
    paddingBottom: 0,
    paddingTop: 0,
    zIndex: 2,
    overflow: 'hidden',
  },
  tabItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  icon: {
    width: 48,
    height: 48,
  },
  activeIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 4,
  },
});

export default TabNavigator;