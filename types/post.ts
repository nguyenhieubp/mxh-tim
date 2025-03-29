export interface User {
  userId: string;
  username: string;
  profilePicture: string;
}

export interface Post {
  id: string;
  content?: string;
  mediaUrls?: string[];
  user: User;
  createdAt: string;
}

export interface Like {
  id: string;
  user: User;
}

export interface Comment {
  commentId: string;
  content: string;
  createdAt: string;
  numberReplyComment: number;
  user: User;
}

export interface CommentReply {
  id: string;
  content: string;
  createdAt: string;
  user: User;
}

export interface PostModalProps {
  open: boolean;
  onClose: () => void;
  postId: string;
  showNavigation?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  canPrev?: boolean;
  canNext?: boolean;
  setNumberComments?: React.Dispatch<React.SetStateAction<number | undefined>>;
  likes?: Like[];
  handleLike?: () => void;
}
