import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import IntroScreen from '../Screens/Login/IntroScreen';
import LoginScreen from '../Screens/Login/LoginScreen/LoginScreen'
import RegisterScreen from '../Screens/Login/RegisterScreen/RegisterScreen'

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
