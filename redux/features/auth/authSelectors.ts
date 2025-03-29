import { RootState } from "../../configs/store";

export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthSuccess = (state: RootState) => state.auth.success;
export const selectAuthMessage = (state: RootState) => state.auth.message;
export const selectCurrentUser = (state: RootState) => state.auth.user;