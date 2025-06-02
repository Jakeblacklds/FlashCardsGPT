import { useSharedValue, useAnimatedStyle, withTiming, withSequence, withDelay, Easing } from 'react-native-reanimated';
import { useEffect } from 'react';

export const useAddGptAnimations = (inputFocused, category, darkModeEnabled) => {
  // Animation values
  const robotScale = useSharedValue(1);
  const robotRotate = useSharedValue(0);
  const robotGlow = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const tagContainerOpacity = useSharedValue(0);
  const sliderContainerOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.95);
  const borderColor = useSharedValue('#7209b7');
  const labelAnim = useSharedValue(category !== '' || inputFocused ? 1 : 0);

  // Animation on component mount
  useEffect(() => {
    robotScale.value = withSequence(
      withTiming(1.1, { duration: 400 }),
      withTiming(1, { duration: 300 })
    );
    
    robotGlow.value = withDelay(300, withTiming(1, { duration: 700 }));
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    tagContainerOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    sliderContainerOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    buttonOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    buttonScale.value = withDelay(800, withTiming(1, { duration: 800 }));
  }, []);

  // Animation for input focus
  useEffect(() => {
    if (inputFocused) {
      borderColor.value = withTiming('#ff8800', { duration: 300 });
      robotGlow.value = withTiming(1.2, { duration: 400 });
    } else {
      borderColor.value = withTiming('#7209b7', { duration: 300 });
      robotGlow.value = withTiming(1, { duration: 400 });
    }
  }, [inputFocused]);

  // Label animation
  useEffect(() => {
    labelAnim.value = withTiming(
      category !== '' || inputFocused ? 1 : 0,
      {
        duration: 420,
        easing: Easing.out(Easing.cubic),
      }
    );
  }, [inputFocused, category]);

  const animateRobot = () => {
    robotRotate.value = withSequence(
      withTiming(0.1, { duration: 100 }),
      withTiming(-0.1, { duration: 100 }),
      withTiming(0.1, { duration: 100 }),
      withTiming(-0.1, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
    
    robotScale.value = withSequence(
      withTiming(1.08, { duration: 150 }),
      withTiming(1, { duration: 150 })
    );
    
    robotGlow.value = withSequence(
      withTiming(1.3, { duration: 150 }),
      withTiming(1, { duration: 400 })
    );
  };

  const animateButton = () => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1.05, { duration: 100 }),
      withTiming(1, { duration: 150 })
    );
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: borderColor.value,
    };
  });

  const robotStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: robotScale.value },
        { rotate: `${robotRotate.value}rad` }
      ]
    };
  });
  
  const robotGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: robotGlow.value,
      transform: [{ scale: robotGlow.value }]
    };
  });

  const titleStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value,
      transform: [{ translateY: (1 - titleOpacity.value) * 20 }]
    };
  });

  const tagContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: tagContainerOpacity.value,
      transform: [{ translateY: (1 - tagContainerOpacity.value) * 15 }]
    };
  });

  const sliderContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: sliderContainerOpacity.value,
      transform: [{ translateY: (1 - sliderContainerOpacity.value) * 15 }]
    };
  });

  const buttonStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonOpacity.value,
      transform: [{ scale: buttonScale.value }]
    };
  });

  const animatedLabelStyle = useAnimatedStyle(() => {
    return {
      top: 18 - 12 * labelAnim.value,
      fontSize: 18 - 5 * labelAnim.value,
      color: darkModeEnabled ? '#b5179e' : '#7209b7',
      opacity: 1,
      transform: [
        { translateY: -2 * labelAnim.value },
      ],
    };
  });

  return {
    animatedStyle,
    robotStyle,
    robotGlowStyle,
    titleStyle,
    tagContainerStyle,
    sliderContainerStyle,
    buttonStyle,
    animatedLabelStyle,
    animateRobot,
    animateButton
  };
};