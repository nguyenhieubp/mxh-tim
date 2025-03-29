import { RootState } from "../../configs/store";

export const selectComments = (state: RootState) => state.comments.comments;
export const selectCommentsLoading = (state: RootState) =>
  state.comments.loading;
export const selectCommentsError = (state: RootState) => state.comments.error;
export const selectCommentsHasMore = (state: RootState) =>
  state.comments.hasMore;
export const selectCommentsCurrentPage = (state: RootState) =>
  state.comments.currentPage;
export const selectCreatingComment = (state: RootState) =>
  state.comments.creatingComment;
export const selectCreateCommentError = (state: RootState) =>
  state.comments.createError;
export const selectDeletingComment = (state: RootState) =>
  state.comments.deletingComment;
export const selectDeleteCommentError = (state: RootState) =>
  state.comments.deleteError;
export const selectReplyingComment = (state: RootState) => state.comments.replyingComment;
export const selectReplyError = (state: RootState) => state.comments.replyError;
export const selectReplies = (state: RootState) => state.comments.replies;
export const selectLoadingReplies = (state: RootState) => state.comments.loadingReplies;
export const selectRepliesError = (state: RootState) => state.comments.repliesError;
export const selectRepliesHasMore = (state: RootState) => state.comments.repliesHasMore;
export const selectRepliesCurrentPage = (state: RootState) => state.comments.repliesCurrentPage;
