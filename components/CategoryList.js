import React from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import CategoryItem from './CategoryItem';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const CategoryList = ({
  categories,
  navigateToFlashcardList,
  handleDeleteCategory,
  handleImagePick,
  darkModeEnabled,
}) => {
  const scrollY = useSharedValue(0);

  const animatedHeaderStyle = useAnimatedStyle(() => {
    const translateY = withSpring(
      interpolate(
        scrollY.value,
        [0, 20],
        [0, -50],
        Extrapolate.CLAMP
      ),
      {
        damping: 15,
        stiffness: 100,
      }
    );

    return {
      transform: [{ translateY }],
    };
  });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <SafeAreaView style={{ flex: 1,
      
    }}>
      <Animated.FlatList
        data={categories}
        ListHeaderComponent={() => (
          <Animated.View style={
            //los estilos deben tambien estar con el darkModeEnabled
            [styles.headerContainer, animatedHeaderStyle, { backgroundColor: darkModeEnabled ? '#3f37c9' : 'black' }]

          }>
            <Text style={[styles.title, { color: darkModeEnabled ? '#D3D3D3' : 'white' }]}>Flashcards</Text>
          </Animated.View>
        )}
        renderItem={({ item }) => (
          <CategoryItem
            category={item}
            onPress={navigateToFlashcardList}
            onDelete={handleDeleteCategory}
            onImagePick={handleImagePick}
            colorPair={item.colorPair}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        numColumns={1}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        useNativeDriver
      />
    </SafeAreaView>
  );
};

export default CategoryList;

const styles = StyleSheet.create({
  headerContainer: {
    padding: 15,
    top: -30,
    width: 380,
    height: 110,
 
  },
  title: {
    fontSize: 35,
    top: 30,
    fontFamily: 'Pagebash',
  },
  listContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
