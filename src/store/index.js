import { configureStore } from '@reduxjs/toolkit'
import routeReducer from './routeSlice'

export const store = configureStore({
  reducer: {
    routeReducer
  }
})
