import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PostState, CreatePostData } from "./types";
import { postService } from "./postService";

const initialState: PostState = {
  posts: [],
  loading: false,
  loadingItem: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  hasMore: true,
  selectedPost: null,
  listError: null,
  itemError: null,
  likes: {},
  loadingLikes: false,
  likesError: null,
  newPost: null,
  uploadError: null,
  uploadingPost: false,
  deletingPost: false,
  deleteError: null,
};

export const createPost = createAsyncThunk(
  "posts/createPost",
  async (postData: CreatePostData) => {
    return await postService.createPost(postData);
  }
);

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (page?: number) => {
    return await postService.getAllPosts(page || 1);
  }
);

export const fetchPostById = createAsyncThunk(
  "posts/fetchPostById",
  async (postId: string) => {
    return await postService.getPostById(postId);
  }
);

export const fetchPostLikes = createAsyncThunk(
  "posts/fetchPostLikes",
  async (postId: string) => {
    return await postService.getLikesByPostId(postId);
  }
);

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId: string) => {
    await postService.deletePost(postId);
    return postId;
  }
);

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearPosts: (state) => {
      state.posts = [];
      state.currentPage = 1;
      state.hasMore = true;
    },
    clearSelectedPost: (state) => {
      state.selectedPost = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.listError = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.hasMore = !action.payload.last;
        state.currentPage += 1;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.listError = action.error.message || "Failed to fetch posts";
      })
      .addCase(fetchPostById.pending, (state) => {
        state.loadingItem = true;
        state.itemError = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loadingItem = false;
        state.selectedPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loadingItem = false;
        state.itemError = action.error.message || "Failed to fetch post";
      })
      .addCase(fetchPostLikes.pending, (state) => {
        state.loadingLikes = true;
        state.likesError = null;
      })
      .addCase(fetchPostLikes.fulfilled, (state, action) => {
        state.loadingLikes = false;
        state.likes = action.payload;
      })
      .addCase(fetchPostLikes.rejected, (state, action) => {
        state.loadingLikes = false;
        state.likesError = action.error.message || "Failed to fetch likes";
      })
      .addCase(createPost.pending, (state) => {
        state.uploadingPost = true;
        state.uploadError = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.uploadingPost = false;
        state.posts = [action.payload, ...state.posts];
      })
      .addCase(createPost.rejected, (state, action) => {
        state.uploadingPost = false;
        state.uploadError = action.error.message || "Failed to create post";
      })
      .addCase(deletePost.pending, (state) => {
        state.deletingPost = true;
        state.deleteError = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.deletingPost = false;
        state.posts = state.posts.filter(
          (post) => post.postId !== action.payload
        );
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.deletingPost = false;
        state.deleteError = action.error.message || "Failed to delete post";
      });
  },
});

export const { clearPosts, clearSelectedPost } = postSlice.actions;
export default postSlice.reducer;
