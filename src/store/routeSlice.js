import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currRoute: ''
}

export const routeSlice = createSlice({
  name: 'routeReducer',
  initialState,
  reducers: {
    setCurrRoute: (state, action) => {
      state.currRoute = action.payload
    }
  }
})

export const { setCurrRoute } = routeSlice.actions

export default routeSlice.reducer
