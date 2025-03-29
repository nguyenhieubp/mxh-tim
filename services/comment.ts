import axios from 'axios';
import { getAuthHeaders } from '@/utils/api';
import { Comment, CommentReply } from '@/types/post';

interface CommentResponse {
  data: {
    content: Comment[];
    last: boolean;
  };
}

interface CommentReplyResponse {
  data: {
    content: CommentReply[];
    last: boolean;
  };
}

export const commentService = {
  fetchComments: async (postId: string, page: number, size: number = 3) => {
    const response = await axios.get<CommentResponse>(
      `${process.env.NEXT_PUBLIC_SERVER}/comment/${postId}/all?page=${page}&size=${size}`,
      getAuthHeaders()
    );
    return response.data.data;
  },

  fetchReplies: async (commentId: string, page: number, size: number = 3) => {
    const response = await axios.get<CommentReplyResponse>(
      `${process.env.NEXT_PUBLIC_SERVER}/comment/${commentId}/getAllCommentReply?page=${page}&size=${size}`,
      getAuthHeaders()
    );
    return response.data.data;
  },

  createComment: async (data: {
    userId: string;
    postId: string;
    content: string;
    parentCommentId?: string;
  }) => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER}/comment/create`,
      data,
      getAuthHeaders()
    );
    return response.data.data;
  }
};