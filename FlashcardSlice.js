import { createSlice, createSelector } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  flashcards: [],
  categories: [],
  selectedCategory: null,
  currentUserUID: null,
};

const flashcardSlice = createSlice({
  name: 'flashcards',
  initialState,
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
      state.flashcards = state.flashcards.filter(
        flashcard => flashcard.id !== action.payload
      );
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setCurrentUserUID: (state, action) => {
      state.currentUserUID = action.payload;
    },
  },
});



export const fetchCategories = () => async (dispatch, getState) => {
  const currentUserUID = getState().flashcards.currentUserUID;
  const url = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories.json`;

  try {
    const response = await axios.get(url);
    if (response.data) {
      const categoriesArray = Object.entries(response.data).map(([key, value]) => ({
        id: key,
        name: value.name,
      }));
      dispatch(setCategories({ categories: categoriesArray }));
    }
    console.log("Categorías obtenidas:", response);
  } catch (error) {
    console.error("Error al obtener las categorías:", error);
  }
};

export const fetchFlashcards = (categoryId) => async (dispatch, getState) => {
  const currentUserUID = getState().flashcards.currentUserUID;
  const url = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories/${categoryId}/flashcards.json`;

  try {
    const response = await axios.get(url);
    if (response.data) {
      const flashcardsArray = Object.entries(response.data).map(([key, value]) => ({
        id: key,
        english: value.english,
        spanish: value.spanish,
        category: categoryId,
      }));
      dispatch(setFlashcards({ flashcards: flashcardsArray }));
    }
  } catch (error) {
    console.error("Error al obtener los flashcards:", error);
  }
};

export const fetchFlashcardsByCategory = (user_id, category) => async (dispatch, getState) => {
  const currentUserUID = getState().flashcards.currentUserUID;
  const url = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories/${category}/flashcards.json`;

  try {
    const response = await axios.get(url);
    if (response.data) {
      const flashcardsArray = Object.entries(response.data).map(([key, value]) => ({
        id: key,
        english: value.english,
        spanish: value.spanish,
        category: category,
      }));
      dispatch(setFlashcards({ flashcards: flashcardsArray }));
    }
  } catch (error) {
    console.error("Error al obtener los flashcards:", error);
  }
}

export const selectFlashcardsByCategory = createSelector(
  [(state, category) => state.flashcards.flashcards, (_, category) => category],
  (flashcards, category) => {
    return flashcards.filter(flashcard => flashcard.category === category);
  }
);

export const deleteCategory = (categoryId) => async (dispatch, getState) => {
  const currentUserUID = getState().flashcards.currentUserUID;
  await axios.delete(`https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories/${categoryId}.json`);
  dispatch(fetchCategories());
};

export const deleteFlashcardsByCategory = (categoryName) => async (dispatch, getState) => {
  const currentUserUID = getState().flashcards.currentUserUID;
  const urlAllFlashcards = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories/${categoryName}/flashcards.json`;
  const responseAllFlashcards = await axios.get(urlAllFlashcards);
  if (responseAllFlashcards && responseAllFlashcards.data) {
    const flashcardsEntries = Object.entries(responseAllFlashcards.data);
    for (let [key, value] of flashcardsEntries) {
      if (value.category === categoryName) {
        await axios.delete(`https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories/${categoryName}/flashcards/${key}.json`);
      }
    }
  }
};

export const selectCategories = state => state.flashcards.categories;

export const { 
  setFlashcards, 
  setCategories, 
  addFlashcard, 
  deleteFlashcard, 
  setSelectedCategory,
  setCurrentUserUID,
} = flashcardSlice.actions;

export default flashcardSlice
