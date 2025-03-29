import * as React from "react";
import PostModal from "../../components/modals/PostModal";
import { Like } from "@/redux/features/post";

interface CommentProps {
  open: boolean;
  onClose: () => void;
  postId: string;
  setNumberComments: React.Dispatch<React.SetStateAction<number | undefined>>;
  likes: Like[];
  handleLike: () => void;
}

export default function Comment({
  open,
  onClose,
  postId,
  setNumberComments,
  likes,
  handleLike,
}: CommentProps) {
  return open ? (
    <PostModal
      open={open}
      onClose={onClose}
      postId={postId}
      setNumberComments={setNumberComments}
      likes={likes}
      handleLike={handleLike}
    />
  ) : null;
}
