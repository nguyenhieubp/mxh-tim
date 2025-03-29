import { RootState } from "../../configs/store";

export const selectPosts = (state: RootState) => state.posts.posts;
export const selectSelectedPost = (state: RootState) =>
  state.posts.selectedPost;
export const selectPostsLoading = (state: RootState) => state.posts.loading;
export const selectPostItemLoading = (state: RootState) =>
  state.posts.loadingItem;
export const selectListError = (state: RootState) => state.posts.listError;
export const selectItemError = (state: RootState) => state.posts.itemError;
export const selectHasMore = (state: RootState) => state.posts.hasMore;
export const selectCurrentPage = (state: RootState) => state.posts.currentPage;
export const selectPostLikes = (state: RootState) => state.posts.likes;
export const selectLoadingLikes = (state: RootState) =>
  state.posts.loadingLikes;
export const selectLikesError = (state: RootState) => state.posts.likesError;
export const selectUploadingPost = (state: RootState) =>
  state.posts.uploadingPost;
export const selectUploadError = (state: RootState) => state.posts.uploadError;
export const selectDeletingPost = (state: RootState) =>
  state.posts.deletingPost;
export const selectDeleteError = (state: RootState) => state.posts.deleteError;
