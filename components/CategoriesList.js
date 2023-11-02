import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import CategoryItem from './CategoryItem';

const CategoriesList = ({ categories, navigateToFlashcardList, onDelete }) => {
  const renderItem = ({ item }) => (
    <CategoryItem category={item} onPress={navigateToFlashcardList} onDelete={onDelete} />
  );

  return (
    <FlatList
      data={categories}
      renderItem={renderItem}
      keyExtractor={(item) => item.name}
      contentContainerStyle={styles.listContainer}
      numColumns={2}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default CategoriesList;
