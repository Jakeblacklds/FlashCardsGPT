
import { createSlice } from '@reduxjs/toolkit';

export const darkModeSlice = createSlice({
  name: 'darkMode',
  initialState: {
    enabled: false,
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.enabled = !state.enabled;
    },
  },
});

export const { toggleDarkMode } = darkModeSlice.actions;

export const selectDarkMode = (state) => state.darkMode.enabled;

export default darkModeSlice.reducer;

