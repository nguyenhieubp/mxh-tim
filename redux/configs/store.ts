import { configureStore } from "@reduxjs/toolkit";
import languageReducer from "../features/languageSlice";
import { postReducer } from "../features/post";
import { commentReducer } from "../features/comment";
import { authReducer } from "../features/auth";


const store = configureStore({
  reducer: {
    language: languageReducer,
    posts: postReducer,
    comments: commentReducer,
    auth: authReducer,
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
