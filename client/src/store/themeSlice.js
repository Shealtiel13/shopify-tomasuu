import { createSlice } from '@reduxjs/toolkit'

const darkMode = localStorage.getItem('darkMode') !== 'false'

const themeSlice = createSlice({
  name: 'theme',
  initialState: { darkMode },
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode
      localStorage.setItem('darkMode', state.darkMode)
      document.documentElement.classList.toggle('dark', state.darkMode)
    },
  },
})

export const { toggleDarkMode } = themeSlice.actions
export default themeSlice.reducer
