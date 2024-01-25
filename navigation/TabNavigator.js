import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { View, TouchableOpacity, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import CategoriesScreen from '../screens/CategoriesScreen/CategoriesScreen';
import ChatScreen from '../screens/ChatScreen';
import ExercisesScreen from '../screens/ExercisesScreen';
import AccountScreen from '../screens/AccountScreen/AccountScreen';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { selectDarkMode } from '../redux/darkModeSlice';

const Tab = createBottomTabNavigator();

function MyTabBar({ state, descriptors, navigation }) {
    const darkModeEnabled = useSelector(selectDarkMode);
    const scales = state.routes.map(() => useSharedValue(0.95));
    const opacities = state.routes.map(() => useSharedValue(0.5));

    useEffect(() => {
        state.routes.forEach((route, index) => {
            const isFocused = state.index === index;
            scales[index].value = withTiming(isFocused ? 1.1 : 0.95, { duration: 200 });
            opacities[index].value = withTiming(isFocused ? 1 : 0.5, { duration: 200 });
        });
    }, [state.index, state.routes]);

    return (
        <View style={{ backgroundColor: darkModeEnabled ? '#121212' : '#F5F5F5' }}>
            <View style={{
                flexDirection: 'row',
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 5,
                paddingBottom: 9,
                width: '90%',
                borderRadius: 90,
                backgroundColor: darkModeEnabled ? '#121212' : '#3f37c9',
                borderTopWidth: 0,
                marginBottom: 10,
                paddingHorizontal: 15,
            }}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;

                    const animatedStyles = useAnimatedStyle(() => {
                        return {
                            transform: [{ scale: scales[index].value }],
                            opacity: opacities[index].value,
                        };
                    });

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            style={{ flex: 1, paddingTop: 5, justifyContent: 'center', alignItems: 'center' }}
                            accessibilityRole="button"
                        >
                            <Animated.View style={[animatedStyles]}>
                                {options.tabBarIcon({ focused: isFocused, color: isFocused ? '#F3F9E3' : 'white', size: 24 })}
                                <Text style={{ textAlign: 'center', color: isFocused ? '#F3F9E3' : 'white', fontSize: 10, marginTop: 4 }}>
                                    {options.title}
                                </Text>
                            </Animated.View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const TabNavigator = () => {
    return (
        <Tab.Navigator
            initialRouteName="Flashcards"
            tabBar={props => <MyTabBar {...props} />}
        >
            <Tab.Screen
                name="Flashcards"
                component={CategoriesScreen}
                options={{
                    headerShown: false,
                    title: 'FlashCards',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="category" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Chat"
                component={ChatScreen}
                options={{
                    headerShown: false,
                    title: 'Chat',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="robot-excited-outline" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Exercises"
                component={ExercisesScreen}
                options={{
                    headerShown: false,
                    title: 'Exercises',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="notebook-outline" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Account"
                component={AccountScreen}
                options={{
                    headerShown: false,
                    title: 'Account',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="people-outline" size={24} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;
