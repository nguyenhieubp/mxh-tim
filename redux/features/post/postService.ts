import { getAuthHeadersWithFormData } from "./../../../utils/api";
import axios from "axios";
import { CreatePostData, Like, IPost, PostResponse } from "./types";

const API_URL = "http://localhost:8080/api/v1/post";

export const postService = {
  getAllPosts: async (page: number, size: number = 6) => {
    const response = await axios.get<{
      status: number;
      message: string;
      data: PostResponse;
    }>(`${API_URL}/all?page=${page}&size=${size}`);
    return response.data.data;
  },

  getPostById: async (postId: string) => {
    const response = await axios.get<{
      status: number;
      message: string;
      data: IPost;
    }>(`${API_URL}/item/${postId}`);
    return response.data.data;
  },

  getLikesByPostId: async (postId: string) => {
    const response = await axios.get<{
      status: number;
      message: string;
      data: Like[];
    }>(`${API_URL}/like-all/${postId}`);
    return response.data.data;
  },

  createPost: async (postData: CreatePostData) => {
    const formData = new FormData();

    if (postData.files) {
      postData.files.forEach((file) => {
        formData.append("files", file);
      });
    }

    formData.append(
      "post",
      new Blob(
        [
          JSON.stringify({
            user: postData.user,
            isPublicPost: postData.isPublicPost,
            isPublicComment: postData.isPublicComment,
            content: postData.content,
          }),
        ],
        { type: "application/json" }
      )
    );

    const response = await axios.post<{
      status: number;
      message: string;
      data: IPost;
    }>(`${API_URL}/upload`, formData, getAuthHeadersWithFormData());
    return response.data.data;
  },

  deletePost: async (postId: string) => {
    const response = await axios.delete<{ status: number; message: string }>(
      `${API_URL}/${postId}`
    );
    return response.data;
  },
};
