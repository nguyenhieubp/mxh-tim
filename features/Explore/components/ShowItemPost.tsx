import * as React from "react";
import PostModal from "../../../components/modals/PostModal";
import { IPost, Like } from "@/redux/features/post";
import { useAppDispatch, useAppSelector } from "@/redux/configs/hooks";
import { getAuthHeaders } from "@/utils/api";
import axios from "axios";
import { getCurrentUser } from "@/redux/features/auth";

interface ShowItemPostProps {
  open: boolean;
  onClose: () => void;
  currentPostIndex: number | null;
  posts: IPost[];
  onPrev: () => void;
  onNext: () => void;
  likes?: Like[];
}

const ShowItemPost: React.FC<ShowItemPostProps> = ({
  open,
  onClose,
  currentPostIndex,
  posts,
  onPrev,
  onNext,
}) => {
  if (!open || currentPostIndex === null) return null;
  const post = posts[currentPostIndex];
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(getCurrentUser());
  }, []);

  const userId = useAppSelector((state) => state.auth.user?.userId);
  const [likes, setLikes] = React.useState<Like[]>([]);

  React.useEffect(() => {
    const fetchLikes = async () => {
      const data = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER}/post/like-all/${post.postId}`
      );
      const response = await data.data;
      setLikes(response.data);
    };

    fetchLikes();
  }, [post.postId]);

  const hasLiked = likes?.some((like: Like) => like.user.userId === userId);

  const handleLike = async () => {
    console.log("=========userId ", userId);
    if (!userId) return;
    const url = `${process.env.NEXT_PUBLIC_SERVER}/like/post`;
    const body = { postId: post.postId, userId };
    const headers = getAuthHeaders();

    setLikes((prev: any) =>
      hasLiked
        ? prev.filter((like: any) => like.user.userId !== userId)
        : [...prev, { user: { userId } }]
    );

    try {
      await axios.post(url, body, headers);
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER}/post/like-all/${post.postId}`
      );
      setLikes(data.data);
    } catch (error) {
      console.error("Error updating like:", error);
      setLikes((prev: any) =>
        hasLiked
          ? [...prev, { user: { userId } }]
          : prev.filter((like: any) => like.user.userId !== userId)
      );
    }
  };

  return (
    <PostModal
      open={open}
      onClose={onClose}
      postId={post.postId}
      showNavigation={true}
      onPrev={onPrev}
      onNext={onNext}
      canPrev={currentPostIndex > 0}
      canNext={currentPostIndex < posts.length - 1}
      likes={likes}
      handleLike={handleLike}
    />
  );
};

export default ShowItemPost;
