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
  pendingCategories: [], // Categories being created in background
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
    // ✅ REDUCER PARA ACTUALIZAR IMAGEN DE CATEGORÍA (imageKey del banco)
    updateCategoryImage: (state, action) => {
      const { categoryId, imageKey } = action.payload;
      state.categories = state.categories.map(category =>
        category.id === categoryId
          ? { ...category, imageKey }
          : category
      );
    },
    deleteCategory: (state, action) => {
      const categoryId = action.payload;
      state.categories = state.categories.filter(category => category.id !== categoryId);
    },
    // Pending categories for background creation
    addPendingCategory: (state, action) => {
      state.pendingCategories.push(action.payload);
    },
    updatePendingProgress: (state, action) => {
      const { tempId, progress, status, createdCards } = action.payload;
      const pending = state.pendingCategories.find(p => p.tempId === tempId);
      if (pending) {
        pending.progress = progress;
        pending.status = status;
        if (createdCards !== undefined) pending.createdCards = createdCards;
      }
    },
    resolvePendingCategory: (state, action) => {
      const { tempId } = action.payload;
      state.pendingCategories = state.pendingCategories.filter(p => p.tempId !== tempId);
    },
    setPendingError: (state, action) => {
      const { tempId, error } = action.payload;
      const pending = state.pendingCategories.find(p => p.tempId === tempId);
      if (pending) {
        pending.status = 'error';
        pending.error = error;
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
        imageKey: value.imageKey || null, // ✅ INCLUIR CAMPO imageKey del banco
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

// Helper para obtener la clave de caché
const getCacheKey = (userId, categoryId) => `flashcards_${userId}_${categoryId}`;

// Thunk para cargar flashcards del caché local
export const loadFlashcardsFromCache = (userId, categoryId) => async (dispatch) => {
  try {
    const cacheKey = getCacheKey(userId, categoryId);
    const cachedData = await AsyncStorage.getItem(cacheKey);

    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      // Verificar que el caché no sea muy viejo (24 horas)
      const cacheAge = Date.now() - (parsed.timestamp || 0);
      const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 horas

      if (cacheAge < MAX_CACHE_AGE && parsed.flashcards?.length > 0) {
        dispatch(setFlashcards({ flashcards: parsed.flashcards }));
        return true; // Indica que había datos en caché
      }
    }
    return false;
  } catch (error) {
    console.error("Error al cargar flashcards del caché:", error);
    return false;
  }
};

export const fetchFlashcardsByCategory = (user_id, category) => async (dispatch, getState) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user_id || !user) {
    console.log("Abort fetchFlashcardsByCategory, usuario o UID no disponibles");
    return;
  }

  const categoryId = typeof category === 'string' ? category : category?.id;
  const cacheKey = getCacheKey(user_id, categoryId);

  // 1. Primero intentar cargar del caché para mostrar datos inmediatamente
  const currentFlashcards = getState().flashcards.flashcards;
  const categoryFlashcards = currentFlashcards.filter(f => f.category === categoryId);

  if (categoryFlashcards.length === 0) {
    // Si no hay datos en memoria, intentar cargar del caché
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (parsed.flashcards?.length > 0) {
          dispatch(setFlashcards({ flashcards: parsed.flashcards }));
        }
      }
    } catch (cacheError) {
      console.log("No se pudo cargar caché:", cacheError);
    }
  }

  // 2. Luego obtener datos frescos de Firebase
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
        id: `${categoryId}_${key}`, // ID único: categoría + key de Firebase
        firebaseKey: key, // Guardar el key original para operaciones de Firebase
        english: value.english,
        spanish: value.spanish,
        type: value.type || 'vocab',
        rarity: value.rarity || 1,
        icon: value.icon || '📚',
        variant1: value.variant1 || null,
        variant2: value.variant2 || null,
        variant3: value.variant3 || null,
        userProgress: value.userProgress || null,
        category: categoryId,
        isLearned: value.isLearned || false,
      }));

      // Actualizar Redux
      dispatch(setFlashcards({ flashcards: flashcardsArray }));

      // 3. Guardar en caché local para futuras cargas
      try {
        const cacheData = {
          flashcards: flashcardsArray,
          timestamp: Date.now(),
          categoryId
        };
        await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (cacheError) {
        console.log("Error al guardar en caché:", cacheError);
      }
    } else {
      // Si no hay datos en Firebase, limpiar el caché
      await AsyncStorage.removeItem(cacheKey);
      dispatch(setFlashcards({ flashcards: [] }));
    }
  } catch (error) {
    // Si hay error de red pero tenemos datos en caché, no mostrar error
    const cachedData = await AsyncStorage.getItem(cacheKey);
    if (cachedData) {
      console.log("Usando datos en caché debido a error de red");
      return; // Los datos ya están en Redux del paso 1
    }

    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      alert('No tienes permiso para acceder. Inicia sesión nuevamente.');
    } else {
      alert('Error al obtener los flashcards');
    }
    console.error(error);
  }
};

// Helper para sincronizar el caché local con el estado actual de Redux
export const syncCacheForCategory = (categoryId) => async (dispatch, getState) => {
  const { currentUserUID, flashcards } = getState().flashcards;
  if (!currentUserUID || !categoryId) return;

  try {
    const categoryFlashcards = flashcards.filter(f => f.category === categoryId);
    const cacheKey = getCacheKey(currentUserUID, categoryId);

    const cacheData = {
      flashcards: categoryFlashcards,
      timestamp: Date.now(),
      categoryId
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.log("Error al sincronizar caché:", error);
  }
};

// Helper para limpiar el caché de una categoría
export const clearCategoryCache = (categoryId) => async (dispatch, getState) => {
  const { currentUserUID } = getState().flashcards;
  if (!currentUserUID || !categoryId) return;

  try {
    const cacheKey = getCacheKey(currentUserUID, categoryId);
    await AsyncStorage.removeItem(cacheKey);
  } catch (error) {
    console.log("Error al limpiar caché:", error);
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

  const url = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories/${categoryId}/flashcards/${flashcard.firebaseKey || flashcardId}.json?auth=${token}`;

  try {
    // Actualizar el valor en Firebase
    await axios.patch(url, { isLearned: newLearnedState });
    // Sincronizar el caché local para que el estado de 'learned' se persista
    dispatch(syncCacheForCategory(categoryId));
  } catch (error) {
    console.error("Error al actualizar el estado de 'learned' en Firebase:", error);
    // Revertir la actualización optimista en caso de fallo
    dispatch(updateFlashcardLearnedState({ flashcardId, isLearned: flashcard.isLearned }));
    alert('Error al marcar como aprendida. Inténtalo de nuevo.');
  }
};

// ✅ THUNK PARA GUARDAR IMAGEN DE CATEGORÍA (imageKey del banco)
export const saveCategoryImage = (categoryId, imageKey) => async (dispatch, getState) => {
  const { currentUserUID } = getState().flashcards;
  const auth = getAuth();
  const user = auth.currentUser;

  if (!currentUserUID || !user) {
    console.log("Abort saveCategoryImage, usuario o UID no disponibles");
    return;
  }

  let token;
  try {
    token = await user.getIdToken(true);
  } catch (err) {
    console.error("Error al obtener el token:", err);
    return;
  }

  const url = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories/${categoryId}.json?auth=${token}`;

  try {
    // Actualizar la imageKey en Firebase
    await axios.patch(url, { imageKey });
    // Actualizar el estado local
    dispatch(updateCategoryImage({ categoryId, imageKey }));
  } catch (error) {
    console.error("Error al guardar imagen de categoría:", error);
    alert('Error al guardar la imagen. Inténtalo de nuevo.');
  }
};

// ✅ NUEVO THUNK PARA ELIMINAR CATEGORÍA
export const deleteCategoryFromFirebase = (categoryId) => async (dispatch, getState) => {
  const { currentUserUID } = getState().flashcards;
  const auth = getAuth();
  const user = auth.currentUser;

  if (!currentUserUID || !user) {
    console.log("Abort deleteCategory, usuario o UID no disponibles");
    return;
  }

  let token;
  try {
    token = await user.getIdToken(true);
  } catch (err) {
    console.error("Error al obtener el token:", err);
    return;
  }

  // Codificar el categoryId por si contiene caracteres especiales (como espacios)
  const encodedCategoryId = encodeURIComponent(categoryId);
  const url = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories/${encodedCategoryId}.json?auth=${token}`;

  try {
    // Eliminar de Firebase
    await axios.delete(url);
    // Eliminar del estado local
    dispatch(deleteCategoryLocal(categoryId));
    // Limpiar el caché local de esta categoría
    dispatch(clearCategoryCache(categoryId));
  } catch (error) {
    console.error("Error al eliminar categoría de Firebase:", error);
    alert('Error al eliminar la categoría. Inténtalo de nuevo.');
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

export const selectPendingCategories = state => state.flashcards.pendingCategories;

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
  updateCategoryImage,
  deleteCategory: deleteCategoryLocal,
  // Pending category actions
  addPendingCategory,
  updatePendingProgress,
  resolvePendingCategory,
  setPendingError,
} = flashcardSlice.actions;

// Alias para mantener compatibilidad si se usa el thunk como 'deleteCategory'
export const deleteCategoryAction = deleteCategoryLocal;
export { deleteCategoryFromFirebase as deleteCategory };

// Alias para guardar imagen de categoría
export const addImageToCategory = ({ categoryId, imageUri }) => saveCategoryImage(categoryId, imageUri);

export default flashcardSlice;
