import { createSlice, createSelector } from '@reduxjs/toolkit';
 import axios from 'axios';
 import AsyncStorage from '@react-native-async-storage/async-storage';
 import { getAuth } from "firebase/auth";

 const initialState = {
  flashcards: [],
  categories: [],
  selectedCategory: null,
  currentUserUID: null,
  recentCategories: [],
  flashcardCounts: {},
  loadedCategories: [],
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
  state.flashcards = state.flashcards.filter(flashcard => flashcard.id !== action.payload);
  },
  updateFlashcardLearnedState: (state, action) => {
  const { flashcardId, isLearned } = action.payload;
  const index = state.flashcards.findIndex(f => f.id === flashcardId);
  if (index >= 0) state.flashcards[index].isLearned = isLearned;
  },
  setSelectedCategory: (state, action) => {
  state.selectedCategory = action.payload;
  },
  setCurrentUserUID: (state, action) => {
  state.currentUserUID = action.payload;
  },
  setRecentCategories: (state, action) => {
  state.recentCategories = action.payload;
  },
  setFlashcardCounts: (state, action) => {
  const { categoryId, count } = action.payload;
  state.flashcardCounts[categoryId] = count;
  },
  setCategoryAsLoaded: (state, action) => {
  const categoryId = action.payload;
  if (!state.loadedCategories.includes(categoryId)) {
  state.loadedCategories.push(categoryId);
  }
  },
  },
 });

 // THUNKS

 export const fetchCategories = () => async (dispatch, getState) => {
  const currentUserUID = getState().flashcards.currentUserUID;
  const auth = getAuth();
  const user = auth.currentUser;
  if (!currentUserUID || !user) {
  console.log("Abort fetchCategories, usuario o UID no disponibles");
  return;
  }

  let token;
  try {
  token = await user.getIdToken(true); // Fuerza refresh
  } catch (err) {
  dispatch(setCurrentUserUID(null));
  return;
  }

  const url = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories.json?auth=${token}`;
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
  if (
  error.response &&
  (error.response.status === 401 || error.response.status === 403)
  ) {
  if (!global._already401) {
  global._already401 = true;
  alert('No tienes permiso para acceder. Inicia sesión nuevamente.');
  }
  dispatch(setCurrentUserUID(null));
  return;
  } else {
  alert('Error al obtener las categorías');
  }
  console.error(error);
  }
 };

 export const reset401Flag = () => {
  global._already401 = false;
 };

 export const fetchFlashcardsByCategory = (user_id, category) => async (dispatch) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user_id || !user) {
  console.log("Abort fetchFlashcardsByCategory, usuario o UID no disponibles");
  return;
  }

  const categoryId = typeof category === 'string' ? category : category?.id;
  let token;
  try {
  token = await user.getIdToken(true);
  } catch (err) {
  return;
  }
  const url = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${user_id}/categories/${categoryId}/flashcards.json?auth=${token}`;

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
  isLearned: value.isLearned || false,
  }));
  dispatch(setFlashcards({ flashcards: flashcardsArray }));
  }
  } catch (error) {
  if (error.response && (error.response.status === 401 || error.response.status === 403)) {
  alert('No tienes permiso para acceder. Inicia sesión nuevamente.');
  } else {
  alert('Error al obtener los flashcards');
  }
  console.error(error);
  }
 };

 export const fetchFlashcardCountByCategory = (userId, categoryId) => async (dispatch) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!userId || !user) {
  console.log("Abort fetchFlashcardCountByCategory, usuario o UID no disponibles");
  return;
  }

  let token;
  try {
  token = await user.getIdToken(true);
  } catch (err) {
  return;
  }
  const url = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${userId}/categories/${categoryId}/flashcards.json?shallow=true&auth=${token}`;

  try {
  const response = await axios.get(url);
  const count = response.data ? Object.keys(response.data).length : 0;
  dispatch(setFlashcardCounts({ categoryId, count }));
  } catch (error) {
  if (error.response && (error.response.status === 401 || error.response.status === 403)) {
  alert('No tienes permiso para acceder. Inicia sesión nuevamente.');
  } else {
  alert('Error al contar flashcards');
  }
  console.error(error);
  dispatch(setFlashcardCounts({ categoryId, count: 0 }));
  }
 };

 export const fetchRecentCategories = () => async (dispatch) => {
  try {
  const recentData = await AsyncStorage.getItem('recentCategories');
  if (recentData) {
  const parsedData = JSON.parse(recentData);
  const validData = parsedData.filter(item => item?.category?.id);
  dispatch(setRecentCategories(validData));
  }
  } catch (error) {
  console.error("Error al obtener las categorías recientes:", error);
  }
 };

 // THUNK NUEVO Y CORREGIDO
 export const markFlashcardAsLearned = (flashcardId, categoryId) => async (dispatch, getState) => {
    const { currentUserUID, flashcards } = getState().flashcards;
    const auth = getAuth();
    const user = auth.currentUser;

    if (!currentUserUID || !user) {
        console.log("Abort markFlashcardAsLearned, usuario o UID no disponibles");
        return;
    }

    const flashcard = flashcards.find(f => f.id === flashcardId);
    if (!flashcard) {
        console.error("Flashcard no encontrada en el estado.");
        return;
    }

    const newLearnedState = !flashcard.isLearned;
    // Actualización optimista en el estado local
    dispatch(updateFlashcardLearnedState({ flashcardId, isLearned: newLearnedState }));

    let token;
    try {
        token = await user.getIdToken(true);
    } catch (err) {
        console.error("Error al obtener el token:", err);
        // Revertir la actualización optimista
        dispatch(updateFlashcardLearnedState({ flashcardId, isLearned: flashcard.isLearned }));
        return;
    }

    const url = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories/${categoryId}/flashcards/${flashcardId}.json?auth=${token}`;

    try {
        // Actualizar el valor en Firebase
        await axios.patch(url, { isLearned: newLearnedState });
    } catch (error) {
        console.error("Error al actualizar el estado de 'learned' en Firebase:", error);
        // Revertir la actualización optimista en caso de fallo
        dispatch(updateFlashcardLearnedState({ flashcardId, isLearned: flashcard.isLearned }));
        alert('Error al marcar como aprendida. Inténtalo de nuevo.');
    }
};


 // SELECTORS

 export const selectFlashcardsByCategory = createSelector(
  [(state, category) => state.flashcards.flashcards, (_, category) => category],
  (flashcards, category) => flashcards.filter(f => f.category === category)
 );

 export const selectFlashcardCount = (state, categoryId) =>
  state.flashcards.flashcardCounts?.[categoryId] || 0;

 export const isCategoryLoaded = (state, categoryId) =>
  state.flashcards.loadedCategories.includes(categoryId);

 export const selectCategories = state => state.flashcards.categories;

 // ACCIONES

 export const {
  setFlashcards,
  setCategories,
  addFlashcard,
  deleteFlashcard,
  updateFlashcardLearnedState,
  setSelectedCategory,
  setCurrentUserUID,
  setRecentCategories,
  setFlashcardCounts,
  setCategoryAsLoaded,
 } = flashcardSlice.actions;

 export default flashcardSlice;