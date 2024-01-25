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
    updateFlashcardLearnedState: (state, action) => {
      const { flashcardId, isLearned } = action.payload;
      const flashcardIndex = state.flashcards.findIndex(flashcard => flashcard.id === flashcardId);
      if (flashcardIndex >= 0) {
        state.flashcards[flashcardIndex].isLearned = isLearned;
      }
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
        variant1: value.variant1 || null,
        variant2: value.variant2 || null,
        variant3: value.variant3 || null,
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
        variant1: value.variant1 || null,
        variant2: value.variant2 || null,
        variant3: value.variant3 || null,
        category: category,
        isLearned: value.isLearned || false,

      }));
      dispatch(setFlashcards({ flashcards: flashcardsArray }));
      console.log('flashcardsArray', flashcardsArray);
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

export const markFlashcardAsLearned = (flashcardId, categoryId, newLearnedState) => async (dispatch, getState) => {
  const currentUserUID = getState().flashcards.currentUserUID;
  const url = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories/${categoryId}/flashcards/${flashcardId}.json`;

  try {
    await axios.patch(url, { isLearned: newLearnedState });
    dispatch(updateFlashcardLearnedState({ flashcardId, isLearned: newLearnedState }));
    console.log('flashcardId', flashcardId, 'isLearned', newLearnedState);
  } catch (error) {
    console.error("Error al cambiar el estado de aprendizaje de la flashcard:", error);
  }
};


export const selectCategories = state => state.flashcards.categories;

export const { 
  setFlashcards, 
  setCategories, 
  addFlashcard, 
  deleteFlashcard, 
  updateFlashcardLearnedState, 
  setSelectedCategory,
  setCurrentUserUID,
} = flashcardSlice.actions;

export default flashcardSlice
