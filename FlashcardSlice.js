import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { createSelector } from '@reduxjs/toolkit';
import { getRandomColorPair } from './constants';

const flashcardSlice = createSlice({
  name: 'flashcards',
  initialState: {
    flashcards: [],
    categories: [], 
    selectedCategory: null,
  },
  reducers: {
    setFlashcards: (state, action) => {
      state.flashcards = action.payload.flashcards;
    },
    setCategories: (state, action) => {
      state.categories = action.payload.categories;
    },
    addFlashcard: (state, action) => {
      state.flashcards.push(action.payload);
    },
    deleteFlashcard: (state, action) => {
      if (state.flashcards && state.flashcards.length > 0) {
        state.flashcards = state.flashcards.filter(
          (flashcard) => flashcard.id !== action.payload
        );
      }
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    addImageToCategory: (state, action) => {
      const { categoryId, imageUri } = action.payload;
      const categoryIndex = state.categories.findIndex(category => category.id === categoryId);
      if (categoryIndex !== -1) {
        state.categories[categoryIndex].imageUri = imageUri;
      }
    },
  },
});

export const { addImageToCategory,setFlashcards, setCategories, addFlashcard, deleteFlashcard, setSelectedCategory } = flashcardSlice.actions;

export const fetchCategories = () => async (dispatch) => {
  const url = `https://flashcardgpt-default-rtdb.firebaseio.com/users/SpanishFlashcards/categories.json`;

  try {
    const response = await axios.get(url);


    if (response.data) {
      const categoriesArray = Object.entries(response.data).map(([key, value]) => ({ id: key, name: value.name }));
      dispatch(setCategories({ categories: categoriesArray }));
    } else {
      console.error("La respuesta de Firebase fue nula");
    }
  } catch (error) {
    console.error("Error al obtener las categorías:", error);
  }
};

export const fetchFlashcards = (user_id, categoryId) => async (dispatch) => {
  const url = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${user_id}/categories/${categoryId}/flashcards.json`;
  
  try {
    const response = await axios.get(url);
    console.log("Respuesta de Firebase: ", response.data); 

    if (response.data) {
      const flashcardsArray = Object.entries(response.data).map(([key, value]) => ({
        id: key, 
        english: value.english,
        spanish: value.spanish,
        category: categoryId
      }));
      dispatch(setFlashcards({ flashcards: flashcardsArray }));
    } else {
      console.error("La respuesta de Firebase fue nula para la categoría:", categoryId);
    }
  } catch (error) {
    console.error("Error al obtener los flashcards:", error);
  }
};

export const fetchFlashcardsByCategory = (user_id, categoryId) => async (dispatch) => {
  dispatch(fetchFlashcards(user_id, categoryId));
};

export const selectFlashcardsByCategory = createSelector(
  [(state, category) => state.flashcards.flashcards, (_, category) => category], 
  (flashcards, category) => {
    return flashcards.filter((flashcard) => flashcard.category === category);
  }
);

export const deleteCategory = (categoryId) => async (dispatch) => {
  await axios.delete(`https://flashcardgpt-default-rtdb.firebaseio.com/users/SpanishFlashcards/categories/${categoryId}.json`);
  dispatch(fetchCategories());
};

export const deleteFlashcardsByCategory = (categoryName) => async (dispatch) => {
  const urlAllFlashcards = 'https://flashcardgpt-default-rtdb.firebaseio.com/SpanishFlashcards/flashcards.json';
  const responseAllFlashcards = await axios.get(urlAllFlashcards);
  if (responseAllFlashcards && responseAllFlashcards.data) {
    const flashcardsEntries = Object.entries(responseAllFlashcards.data);
    for (let [key, value] of flashcardsEntries) {
      if (value.category === categoryName) {
        await axios.delete(`https://flashcardgpt-default-rtdb.firebaseio.com/SpanishFlashcards/flashcards/${key}.json`);
      }
    }
  }
  await axios.delete(`https://flashcardgpt-default-rtdb.firebaseio.com/SpanishFlashcards/categories/${categoryName}/flashcards.json`);
};

export const selectCategories = (state) => state.flashcards.categories;

export default flashcardSlice