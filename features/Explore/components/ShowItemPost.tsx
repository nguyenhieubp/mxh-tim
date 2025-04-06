import * as React from "react";
import PostModal from "../../../components/modals/PostModal";
import { IPost, Like } from "@/redux/features/post";
import { useAppDispatch, useAppSelector } from "@/redux/configs/hooks";
import { getAuthHeaders } from "@/utils/api";
import axios from "axios";
import { getCurrentUser } from "@/redux/features/auth";
import PostInteractionService from "@/services/postInteraction.service";
import socketService from "@/services/socketService";
import { createComment } from "@/redux/features/comment";

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
  const postService = PostInteractionService.getInstance();

  React.useEffect(() => {
    dispatch(getCurrentUser());
  }, []);

  const userId = useAppSelector((state) => state.auth.user?.userId);
  const [likes, setLikes] = React.useState<Like[]>([]);
  const [isShared, setIsShared] = React.useState(false);
  const [shareId, setShareId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchLikes = async () => {
      const data = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER}/post/like-all/${post.postId}`
      );
      const response = await data.data;
      setLikes(response.data);
    };

    fetchLikes();
    checkShareStatus();
  }, [post.postId, userId]);

  const checkShareStatus = async () => {
    if (!userId || !post.postId) return;
    try {
      const response = await postService.getUserShares(userId);
      if (response.success) {
        const shares = response.data.data.content || [];
        const existingShare = shares.find((share: any) => share.post.postId === post.postId);
        
        if (existingShare) {
          setIsShared(true);
          setShareId(existingShare.shareId);
        } else {
          setIsShared(false);
          setShareId(null);
        }
      }
    } catch (error) {
      console.error("Error checking share status:", error);
    }
  };

  const hasLiked = likes?.some((like: Like) => like.user.userId === userId);

  const handleLike = async () => {
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

      // Gửi thông báo khi like
      if (!hasLiked && post.user?.userId !== userId) {
        await socketService.sendNotification({
          actor: userId,
          userId: post.user?.userId,
          title: 'New Like',
          content: 'liked your post',
          data: {
            type: 'like',
            postId: post.postId
          }
        });
      }
    } catch (error) {
      console.error("Error updating like:", error);
      setLikes((prev: any) =>
        hasLiked
          ? [...prev, { user: { userId } }]
          : prev.filter((like: any) => like.user.userId !== userId)
      );
    }
  };

  const handleShare = async () => {
    if (!userId) return;

    try {
      if (isShared && shareId) {
        const response = await postService.deleteShare(shareId);
        if (response.success) {
          setIsShared(false);
          setShareId(null);
        }
      } else {
        const response = await postService.createShare(post.postId, userId);
        if (response.success) {
          setIsShared(true);
          setShareId(response.data.data.shareId);
        }
      }
    } catch (error) {
      console.error("Error handling share:", error);
    }
  };

  const handleComment = async (comment: string) => {
    if (!userId || !comment) return;
    
    try {
      await dispatch(createComment({
        userId,
        postId: post.postId,
        content: comment,
      }));

      // Gửi thông báo khi comment
      if (post.user?.userId !== userId) {
        await socketService.sendNotification({
          actor: userId,
          userId: post.user?.userId,
          title: 'New Comment',
          content: 'commented on your post',
          data: {
            type: 'comment',
            postId: post.postId,
            commentContent: comment
          }
        });
      }
    } catch (error) {
      console.error("Error creating comment:", error);
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
      isShared={isShared}
      shareId={shareId}
      onShareChange={(newIsShared) => setIsShared(newIsShared)}
    />
  );
};

export default ShowItemPost;
