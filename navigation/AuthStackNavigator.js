import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import IntroScreen from '../screens/IntroScreen';
import LoginScreen from '../screens/LoginScreen/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen/RegisterScreen';

const AuthStack = createStackNavigator();

const AuthStackNavigatorComponent = () => {
    return (
        <AuthStack.Navigator>
            <AuthStack.Screen name="IntroScreen" component={IntroScreen} options={{ headerShown: false }} />
            <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <AuthStack.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }} />
        </AuthStack.Navigator>
    );
};

export default AuthStackNavigatorComponent;
