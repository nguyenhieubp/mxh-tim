import axios from "axios";
import { CommentResponse, CreateCommentData } from "./types";
import { getAuthHeaders } from "../../../utils/api";

const API_URL = "http://localhost:8080/api/v1/comment";

export const commentService = {
  getComments: async (postId: string, page: number = 0, size: number = 3) => {
    const response = await axios.get<{
      status: number;
      message: string;
      data: CommentResponse;
    }>(`${API_URL}/${postId}/all?page=${page}&size=${size}`, getAuthHeaders());
    return response.data.data;
  },
  createComment: async (commentData: CreateCommentData) => {
    const response = await axios.post<{
      status: number;
      message: string;
      data: Comment;
    }>(`${API_URL}/create`, commentData, getAuthHeaders());
    return response.data.data;
  },

  deleteComment: async (commentId: string) => {
    const response = await axios.delete<{ status: number; message: string }>(
      `${API_URL}/${commentId}`,
      getAuthHeaders()
    );
    return response.data;
  },
  replyComment: async (commentData: CreateCommentData) => {
    const response = await axios.post<{
      status: number;
      message: string;
      data: Comment;
    }>(`${API_URL}/create`, commentData, getAuthHeaders());
    return response.data.data;
  },
  getCommentReplies: async (
    commentId: string | null,
    page: number = 1,
    size: number = 10
  ) => {
    const response = await axios.get<{
      status: number;
      message: string;
      data: CommentResponse;
    }>(
      `${API_URL}/${commentId}/getAllCommentReply?page=${page}&size=${size}`,
      getAuthHeaders()
    );
    return response.data.data;
  },
};
