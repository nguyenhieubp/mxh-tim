import { User } from "../post/types";

export interface Comment {
  commentId: string;
  user: User;
  content: string;
  createdAt: string;
  numberLike: number;
  numberReplyComment: number;
  numberLikeComment: number;
}

export interface CommentResponse {
  content: Comment[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  empty: boolean;
}

export interface CreateCommentData {
  userId: string | undefined;
  postId: string;
  content: string;
  parentCommentId?: string | null;
}
export interface CommentState {
  comments: Comment[];
  loading: boolean;
  loadingItem: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  selectedComment: Comment | null;
  listError: string | null;
  itemError: string | null;
  creatingComment: boolean;
  createError: string | null;
  deletingComment: boolean;
  deleteError: string | null;
  replyingComment: boolean;
  replyError: string | null;
  replies: Comment[];
  loadingReplies: boolean;
  repliesError: string | null;
  repliesCurrentPage: number;
  repliesTotalPages: number;
  repliesHasMore: boolean;
}
