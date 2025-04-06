"use client";

import React from "react";
import { Favorite } from "@mui/icons-material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SendIcon from "@mui/icons-material/Send";
import Comment from "./Comment";
import InfoUser from "./InfoUser";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { IPost, Like } from "@/redux/features/post";
import { useAppDispatch, useAppSelector } from "@/redux/configs/hooks";
import axios from "axios";
import { getAuthHeaders } from "@/utils/api";
import { createComment } from "@/redux/features/comment";
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import PostModal from "@/components/modals/PostModal";
import socketService from "@/services/socketService";

export default function ItemPost({ post }: { post: IPost }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [open, setOpen] = React.useState<boolean>(false);
  const [likes, setLikes] = React.useState<Like[]>([]);
  const [numberComments, setNumberComments] = React.useState<any>(
    post.numberComment
  );
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const userId = useAppSelector((state) => state.auth.user?.userId);
  const [comment, setCommet] = React.useState<string>("");

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

  // Kiểm tra người dùng đã like chưa
  const hasLiked = likes?.some((like: Like) => like.user.userId === userId);

  // Xử lý like/unlike
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

      // Create notification when liking (not when unliking)
      if (!hasLiked) {
        try {
          // Send real-time notification via socket
          if (socketService.isConnected() && userId && post.user.userId) {
            socketService.sendNotification({
              actor: userId,
              userId: post.user.userId,
              title: 'New Like',
              content: 'liked your post',
              data: {
                type: 'like',
                postId: post.postId
              }
            });
          }
        } catch (error) {
          console.error("Error creating notification:", error);
        }
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

  const handleComment = async () => {
    if (!comment) return;
    await dispatch(
      createComment({
        userId,
        postId: post.postId,
        content: comment,
      })
    );

    try {
      // Send real-time notification via socket
      if (socketService.isConnected() && userId && post.user.userId) {
        socketService.sendNotification({
          actor: userId,
          userId: post.user.userId,
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
      console.error("Error creating comment notification:", error);
    }

    setCommet("");
    setNumberComments((prev: any) => prev + 1);
  };

  const [isShared, setIsShared] = React.useState(false);
  const [shareId, setShareId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const checkShareStatus = async () => {
      if (!userId || !post.postId) return;
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER}/share/user/${userId}`,
          getAuthHeaders()
        );
        const shares = response.data.data.content || [];
        const existingShare = shares.find((share: any) => share.post.postId === post.postId);

        if (existingShare) {
          setIsShared(true);
          setShareId(existingShare.shareId);
        } else {
          setIsShared(false);
          setShareId(null);
        }
      } catch (error) {
        console.error("Error checking share status:", error);
      }
    };

    checkShareStatus();
  }, [userId, post.postId]);

  // Update handleShare function
  const handleShare = async () => {
    if (!userId) return;

    try {
      if (isShared && shareId) {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_SERVER}/share/delete/${shareId}`,
          getAuthHeaders()
        );
        setIsShared(false);
        setShareId(null);
      } else {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER}/share/create`,
          {
            userId,
            postId: post.postId,
          },
          getAuthHeaders()
        );
        setIsShared(true);
        setShareId(response.data.data.shareId);
      }
    } catch (error) {
      console.error("Error handling share:", error);
    }
  };

  return (
    <>
      <div className="max-w-[600px] mx-10 mt-2 bg-white rounded-lg shadow">
        <InfoUser post={post} />

        {/* Post Images with Navigation */}
        <div className="relative w-full pt-[100%]">
          <img
            className="absolute top-0 left-0 w-full h-full object-cover bg-[#efefef]"
            src={
              `${process.env.NEXT_PUBLIC_API_URL}${post.mediaUrls?.[currentImageIndex]}` ||
              post.mediaUrls?.[currentImageIndex] ||
              "/default-post-image.jpg"
            }
            alt="Post Image"
          />

          {post.mediaUrls && post.mediaUrls.length > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white hover:bg-gray-50 shadow-md"
                onClick={() => setCurrentImageIndex((prev) => Math.max(prev - 1, 0))}
              >
                <ArrowBackIos className="w-5 h-5" />
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white hover:bg-gray-50 shadow-md"
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    Math.min(prev + 1, post.mediaUrls.length - 1)
                  )
                }
              >
                <ArrowForwardIos className="w-5 h-5" />
              </button>

              {/* Image indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {post.mediaUrls.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${index === currentImageIndex ? "bg-blue-500" : "bg-gray-300"
                      }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Post Content */}
        <div className="p-4">
          <div className="flex items-center gap-4">
            <button
              className={`p-2 rounded-full hover:bg-gray-100 ${hasLiked ? "text-red-500" : "text-gray-700"}`}
              onClick={handleLike}
            >
              <Favorite className="w-6 h-6" />
            </button>

            <button
              className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
              onClick={() => setOpen(true)}
            >
              <ChatBubbleOutlineIcon className="w-6 h-6" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-700">
              <SendIcon className="w-6 h-6" />
            </button>
            <button
              onClick={handleShare}
              className={`p-2 rounded-full hover:bg-gray-100 ${isShared ? 'text-yellow-500' : 'text-gray-700'} ml-auto`}
            >
              {isShared ? <BookmarkIcon className="w-6 h-6" /> : <BookmarkBorderIcon className="w-6 h-6" />}
            </button>
          </div>

          <p className="text-sm text-gray-600 mt-2">
            <span className="font-bold">{likes.length} likes</span>
          </p>

          <p className="text-sm text-gray-600 mt-2">
            <span className="font-bold mr-2">{post.user.username}</span>
            {post.content}
          </p>

          <p className="text-sm text-gray-600 mt-2">
            View all <span className="font-bold">{numberComments} comments</span>
          </p>
        </div>

        {/* Add Comment */}
        <div className="px-4 pb-4 flex items-center">
          <input
            type="text"
            onChange={(e) => setCommet(e.target.value)}
            value={comment}
            placeholder={t("post.add_comment")}
            className="flex-1 outline-none text-sm"
          />
          <button
            onClick={handleComment}
            className="text-sm text-blue-500 font-semibold hover:text-blue-600"
          >
            {t("post.post")}
          </button>
        </div>
      </div>

      {/* Comment Modal */}
      <Comment
        setNumberComments={setNumberComments}
        postId={post.postId}
        key={"postKey"}
        open={open}
        onClose={() => setOpen(false)}
        likes={likes}
        handleLike={handleLike}
      />
      <PostModal
        setNumberComments={setNumberComments}
        postId={post.postId}
        key={"postKey"}
        open={open}
        onClose={() => setOpen(false)}
        likes={likes}
        handleLike={handleLike}
        isShared={isShared}
        shareId={shareId}
        onShareChange={(newIsShared, newShareId) => {
          setIsShared(newIsShared);
          setShareId(newShareId);
        }}
      />
    </>
  );
}
