import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// User roles slice
const userRolesSlice = createSlice({
  name: 'userRoles',
  initialState: {
    redux_userRoles: [] as string[],
  },
  reducers: {
    setUserRoles: (state, action: PayloadAction<string[]>) => {
      state.redux_userRoles = action.payload;
    },
  },
});

// Export actions
export const { setUserRoles } = userRolesSlice.actions;

// Configure the Redux store
const store = configureStore({
  reducer: {
    userRoles: userRolesSlice.reducer,
  },
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;