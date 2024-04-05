import React, { useEffect } from 'react';
import { Text, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming } from 'react-native-reanimated';
import styles from '../screens/CategoriesScreen/CategoriesScreen.styles';

const CategoryDisplay = ({ categoryToDisplay, categoryImageUri, darkModeEnabled, colorPair }) => {
  const translateY = useSharedValue(1000);
  const categoryBackgroundColor = useSharedValue('rgba(0,0,0,0.7)');
  const categoryTextColor = useSharedValue('white');
  const imageScale = useSharedValue(1);
  const imageRotate = useSharedValue('0deg');

  useEffect(() => {
    if (categoryToDisplay) {
      imageScale.value = withSpring(1, { damping: 2, stiffness: 100 });
      imageRotate.value = withRepeat(withTiming('20deg', { duration: 150 }), 6, true);
      translateY.value = withSpring(0);
      categoryBackgroundColor.value = darkModeEnabled ? '#434753' : (colorPair ? colorPair.background : 'rgba(0,0,0,0.7)');
      categoryTextColor.value = darkModeEnabled ? '#D3D3D3' : (colorPair ? colorPair.text : 'white');

      setTimeout(() => {
        translateY.value = withSpring(1000);
      }, 1700);
    }
  }, [categoryToDisplay, colorPair, darkModeEnabled, imageRotate, imageScale, translateY]);

  const categoryAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      position: 'absolute',
      top: 130,
      left: 20,
      right: 20,
      borderRadius: 20,
      shadowColor: '#000',
      
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
      bottom: 90,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: categoryBackgroundColor.value,
    };
  });
  const categoryTextStyle = {
    color: darkModeEnabled ? '#D3D3D3' : (colorPair ? colorPair.text : 'white'),
    fontFamily: 'Pagebash',
    fontSize: 50,
    textAlign: 'center',
  };

  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: imageScale.value }, { rotate: imageRotate.value }],
    };
  });

  return (
    <Animated.View style={categoryAnimatedStyle}>
      {categoryImageUri && (
        <Animated.Image
          source={{ uri: categoryImageUri }}
          style={[{ width: 225, height: 225, marginBottom: 20, borderRadius: 20 }, animatedImageStyle]}
        />
      )}
      <Text style={categoryTextStyle}>
        <Animated.Text>
          {categoryToDisplay}
        </Animated.Text>
      </Text>
    </Animated.View>
  );
};

export default CategoryDisplay