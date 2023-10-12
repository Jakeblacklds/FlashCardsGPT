import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const flashcardSlice = createSlice({
  name: 'flashcards',
  initialState: {
    flashcards: [],
  },
  reducers: {
    setFlashcards: (state, action) => {
      state.flashcards = action.payload;
    },
    addFlashcard: (state, action) => {
      state.flashcards.push(action.payload);
    },
    deleteFlashcard: (state, action) => {
      state.flashcards = state.flashcards.filter(
        (flashcard) => flashcard.id !== action.payload
      );
    },
  },
});

export const { setFlashcards, addFlashcard, deleteFlashcard } = flashcardSlice.actions;

export const fetchFlashcards = () => async (dispatch) => {
  const response = await axios.get(
    'https://flashcardgpt-default-rtdb.firebaseio.com/SpanishFlashcards.json'
  );
  dispatch(setFlashcards(response.data));
};

export default flashcardSlice
