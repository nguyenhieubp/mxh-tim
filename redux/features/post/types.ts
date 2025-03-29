export interface User {
  userId: string;
  username: string;
  profilePicture: string | null;
}

export interface IPost {
  postId: string;
  user: User;
  content: string;
  isPublicPost: boolean;
  isPublicComment: boolean;
  mediaUrls: string[];
  createdAt: string;
  numberLike: number;
  numberComment: number;
  numberShare: number;
}

export interface Pageable {
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
}

export interface PostResponse {
  content: IPost[];
  pageable: Pageable;
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

export interface Like {
  likeId: string;
  user: {
    userId: string;
    username: string;
    profilePicture: string | null;
  };
}

export interface CreatePostData {
  user: string;
  isPublicPost: boolean;
  isPublicComment: boolean;
  content: string;
  files?: File[];
}

export interface PostState {
  posts: IPost[];
  loading: boolean;
  loadingItem: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  selectedPost: IPost | null;
  listError: string | null;
  itemError: string | null;
  likes: {};
  loadingLikes: boolean;
  likesError: string | null;
  uploadingPost: boolean;
  uploadError: string | null;
  newPost: any;
  deletingPost: boolean;
  deleteError: string | null;
}

export interface UpdatePostCommentCountPayload {
  postId: string;
  increment: boolean;
}
