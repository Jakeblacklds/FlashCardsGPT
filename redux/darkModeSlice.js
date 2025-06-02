import { createSlice } from '@reduxjs/toolkit';
import { Appearance } from 'react-native';

const getPreferredColorScheme = () => {
  return Appearance.getColorScheme() === 'dark';
};

export const darkModeSlice = createSlice({
  name: 'darkMode',
  initialState: {
    enabled: getPreferredColorScheme(),
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
