import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import CategoriesScreen from '../screens/CategoriesScreen/CategoriesScreen';
import ChatScreen from '../screens/ChatScreen';
import ExercisesScreen from '../screens/ExercisesScreen';
import AccountScreen from '../screens/AccountScreen/AccountScreen';
import LottieView from 'lottie-react-native';
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
            opacities[index].value = withTiming(isFocused ? 1 : 0.7, { duration: 200 });
        });
    }, [state.index, state.routes]);

    return (
        <View style={{ backgroundColor: darkModeEnabled ? '#121212' : '#F5F5F5' }}>
            <View style={{
                flexDirection: 'row',
                
                paddingHorizontal: 20,
                height: 70,
                backgroundColor: darkModeEnabled ? '#121212' : '#3f37c9',

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
                            style={{ flex: 1,  }}
                            accessibilityRole="button"
                        >
                            <Animated.View style={[animatedStyles]}>
                                {options.tabBarIcon({ focused: isFocused, })}
                                <Text style={{ textAlign: 'center', color: isFocused ? '#F3F9E3' : 'white', fontSize: 10, top: 50,}}>
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
                    tabBarIcon: ({ focused }) => {
                        const animationRef = useRef(null);
                        useEffect(() => {
                            if (focused) {
                                animationRef.current?.play();
                            } else {
                                animationRef.current?.reset();
                            }
                        }, [focused]);
                        return (
                            <LottieView
                                ref={animationRef}
                                source={require('../assets/book.json')}
                                loop={false}
                                speed={2}
                                style={{ 
                                    width: 110, 
                                    height: 110,
                                    position: 'absolute',
                                    bottom: -70,
                                    left: '-15%',
                                }}
                            />
                        );
                    },
                }}
            />
            <Tab.Screen
                name="Chat"
                component={ChatScreen}
                options={{
                    headerShown: false,
                    title: 'Chat',
                    tabBarIcon: ({ focused }) => {
                        const animationRef = useRef(null);
                        useEffect(() => {
                            if (focused) {
                                animationRef.current?.play(0, 85);
                            } else {
                                animationRef.current?.play(85, 160);
                            }
                        }, [focused]);
                        return (
                            <LottieView
                                ref={animationRef}
                                source={require('../assets/robot.json')}
                                loop={false}
                                speed={2}
                                style={{ width: 80, 
                                        height: 60, 
                                        position: 'absolute',
                                        bottom: -44,
                                        left: '1%',
                                    }}
                            />
                        );
                    },
                }}
            />
            <Tab.Screen
                name="Exercises"
                component={ExercisesScreen}
                options={{
                    headerShown: false,
                    title: 'Exercises',
                    tabBarIcon: ({ focused }) => {
                        const animationRef = useRef(null);
                        useEffect(() => {
                            if (focused) {
                                animationRef.current?.play(0, 75);
                            } else {
                                animationRef.current?.play(75, 100);
                            }
                        }, [focused]);
                        return (
                            <LottieView
                                ref={animationRef}
                                source={require('../assets/books.json')}
                                loop={false}
                                speed={4}
                                style={{ width: 70,
                                        height: 50, 
                                        position: 'absolute',
                                        bottom: -40,
                                        left: '7%',    
                                    }}
                            />
                        );
                    },
                }}
            />
            <Tab.Screen
                name="Account"
                component={AccountScreen}
                options={{
                    headerShown: false,
                    title: 'Account',
                    tabBarIcon: ({ focused }) => {
                        const animationRef = useRef(null);
                        useEffect(() => {
                            if (focused) {
                                animationRef.current?.play(0, 100);
                            } else {
                                animationRef.current?.play(100, 120);
                            }
                        }, [focused]);
                        return (
                            <LottieView
                                ref={animationRef}
                                source={require('../assets/profile.json')}
                                loop={false}
                                speed={2}
                                style={{ width: 80, 
                                        height: 60,
                                        position: 'absolute',
                                        bottom: -45,
                                        left: '2%',   
                                    }}
                            />
                        );
                    },
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;