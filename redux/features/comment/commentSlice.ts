import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { CommentState, CreateCommentData } from "./types";
import { commentService } from "./commentService";

// Add new thunk
export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async (commentId: string) => {
    await commentService.deleteComment(commentId);
    return commentId;
  }
);

export const replyComment = createAsyncThunk(
  "comments/replyComment",
  async (commentData: CreateCommentData) => {
    return await commentService.replyComment(commentData);
  }
);

const initialState: CommentState = {
  comments: [],
  loading: false,
  loadingItem: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  hasMore: true,
  selectedComment: null,
  listError: null,
  itemError: null,
  creatingComment: false,
  createError: null,
  deletingComment: false,
  deleteError: null,
  replyingComment: false,
  replyError: null,
  replies: [],
  loadingReplies: false,
  repliesError: null,
  repliesCurrentPage: 1,
  repliesTotalPages: 1,
  repliesHasMore: true,
};

export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async ({ postId, page = 1 }: { postId: string; page?: number }) => {
    return await commentService.getComments(postId, page);
  }
);

export const createComment = createAsyncThunk(
  "comments/createComment",
  async (commentData: CreateCommentData) => {
    return await commentService.createComment(commentData);
  }
);

export const fetchCommentReplies = createAsyncThunk(
  "comments/fetchCommentReplies",
  async ({
    commentId,
    page = 1,
  }: {
    commentId: string | null;
    page?: number;
  }) => {
    return await commentService.getCommentReplies(commentId, page);
  }
);

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearComments: (state) => {
      state.comments = [];
      state.currentPage = 1;
      state.hasMore = true;
      state.listError = null;
      state.totalPages = 1;
    },
    clearSelectedComment: (state) => {
      state.selectedComment = null;
      state.itemError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Comments
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.listError = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        const newComments = action.payload.content.filter(
          (newComment) =>
            !state.comments.some(
              (existing) => existing.commentId === newComment.commentId
            )
        );
        state.comments = [...state.comments, ...newComments];
        state.totalPages = action.payload.totalPages;
        state.hasMore = !action.payload.last;
        state.currentPage += 1;
        state.listError = null;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.listError = action.error.message || "Failed to fetch comments";
      })
      // Create Comment
      .addCase(createComment.pending, (state) => {
        state.creatingComment = true;
        state.createError = null;
      })
      .addCase(createComment.fulfilled, (state, action: PayloadAction<any>) => {
        state.creatingComment = false;
        state.comments = [action.payload, ...state.comments];
        state.createError = null;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.creatingComment = false;
        state.createError = action.error.message || "Failed to create comment";
      })
      .addCase(deleteComment.pending, (state) => {
        state.deletingComment = true;
        state.deleteError = null;
      })
      .addCase(
        deleteComment.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.deletingComment = false;
          state.comments = state.comments.filter(
            (comment) => comment.commentId !== action.payload
          );
          state.deleteError = null;
        }
      )
      .addCase(deleteComment.rejected, (state, action) => {
        state.deletingComment = false;
        state.deleteError = action.error.message || "Failed to delete comment";
      })
      .addCase(replyComment.pending, (state) => {
        state.replyingComment = true;
        state.replyError = null;
      })
      .addCase(replyComment.fulfilled, (state, action: PayloadAction<any>) => {
        state.replyingComment = false;
        state.comments = [action.payload, ...state.comments];
        state.replyError = null;
      })
      .addCase(replyComment.rejected, (state, action) => {
        state.replyingComment = false;
        state.replyError = action.error.message || "Failed to reply to comment";
      })
      .addCase(fetchCommentReplies.pending, (state) => {
        state.loadingReplies = true;
        state.repliesError = null;
      })
      .addCase(fetchCommentReplies.fulfilled, (state, action) => {
        state.loadingReplies = false;
        state.replies = action.payload.content;
        state.repliesTotalPages = action.payload.totalPages;
        state.repliesHasMore = !action.payload.last;
        state.repliesCurrentPage += 1;
        state.repliesError = null;
      })
      .addCase(fetchCommentReplies.rejected, (state, action) => {
        state.loadingReplies = false;
        state.repliesError =
          action.error.message || "Failed to fetch comment replies";
      });
  },
});

export const { clearComments, clearSelectedComment } = commentSlice.actions;
export default commentSlice.reducer;
