'use client'

import { IPost, Like } from "@/redux/features/post/types";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import PostModal from "@/components/modals/PostModal";
import axios from "axios";
import { getAuthHeaders } from "@/utils/api";
import { useAppSelector } from "@/redux/configs/hooks";
import { FavoriteBorder, ChatBubbleOutline, DeleteOutline } from "@mui/icons-material";
import { MoreVert } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Switch, FormControlLabel } from "@mui/material";
import { Public, Lock, CommentOutlined, CommentBank } from "@mui/icons-material";
import AlertSnackbar from "@/components/common/AlertSnackbar";
import socketService from "@/services/socketService";
import { useTranslation } from "react-i18next";

interface PostsGridProps {
  posts: IPost[];
  onPostUpdate?: () => void;
}

const PostsGrid: React.FC<PostsGridProps> = ({ posts, onPostUpdate }) => {
  const { t } = useTranslation();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSettingsClick = (event: React.MouseEvent<HTMLButtonElement>, post: IPost): void => {
    event.stopPropagation();
    setSelectedPost(post);
    setShowSettingsModal(true);
  };

  const handleCloseSettings = () => {
    setShowSettingsModal(false);
    setSelectedPost(null);
  };
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postLikes, setPostLikes] = useState<Record<string, Like[]>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, string>>({});
  const userCurrent = useAppSelector((state) => state.auth.user);
  const [isComment, setIsComment] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const handleRefreshPosts = () => {
    onPostUpdate?.();
  };

  const checkSavedStatus = useCallback(async () => {
    if (!userCurrent?.userId) return;
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER}/share/user/${userCurrent.userId}`,
        getAuthHeaders()
      );
      const shares = response.data.data.content || [];
      const savedMap: Record<string, string> = {};

      shares.forEach((share: any) => {
        savedMap[share.post.postId] = share.shareId;
      });

      setSavedPosts(savedMap);
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  }, [userCurrent?.userId]);

  useEffect(() => {
    checkSavedStatus();
  }, [checkSavedStatus]);


  useEffect(() => {
    if (selectedPost) {
      setIsComment(selectedPost.isPublicComment);
      setIsPublic(selectedPost.isPublicPost);
    }
  }, [selectedPost]);

  useEffect(() => {
    const fetchLikesForPosts = async () => {
      if (posts.length === 0) return;

      try {
        const likesPromises = posts.map((post) =>
          axios.get(`${process.env.NEXT_PUBLIC_SERVER}/post/like-all/${post.postId}`)
        );

        const responses = await Promise.all(likesPromises);
        const likesMap: Record<string, Like[]> = {};

        responses.forEach((response, index) => {
          if (response.data?.data) {
            likesMap[posts[index].postId] = response.data.data;
          }
        });

        setPostLikes(likesMap);
      } catch (error) {
        console.error("Error fetching likes:", error);
      }
    };

    fetchLikesForPosts();
  }, [posts]);

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPostId(null);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      setIsDeleting(true);
      const url = `${process.env.NEXT_PUBLIC_SERVER}/post/${postId}`;
      const headers = getAuthHeaders();
      await axios.delete(url, headers);
      setSnackbar({
        open: true,
        message: t("post.delete.success"),
        severity: "success",
      });
      handleRefreshPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      setSnackbar({
        open: true,
        message: t("post.delete.error"),
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setPostToDelete(null);
    }
  };

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>, postId: string) => {
    event.stopPropagation();
    setPostToDelete(postId);
    setShowDeleteDialog(true);
  };

  const handleLike = async (postId: string) => {
    if (!userCurrent?.userId) return;

    const url = `${process.env.NEXT_PUBLIC_SERVER}/like/post`;
    const body = { postId, userId: userCurrent.userId };
    const headers = getAuthHeaders();

    const currentLikes = postLikes[postId] || [];
    const hasLiked = currentLikes.some((like) => like.user.userId === userCurrent.userId);

    setPostLikes((prev) => ({
      ...prev,
      [postId]: hasLiked
        ? currentLikes.filter((like) => like.user.userId !== userCurrent.userId)
        : [...currentLikes, { user: { userId: userCurrent.userId } } as Like],
    }));

    try {
      await axios.post(url, body, headers);
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER}/post/like-all/${postId}`);
      setPostLikes((prev) => ({
        ...prev,
        [postId]: data.data,
      }));

      // Gửi thông báo khi like
      if (!hasLiked) {
        const post = posts.find(p => p.postId === postId);
        if (post && post.user?.userId !== userCurrent.userId) {
          await socketService.sendNotification({
            actor: userCurrent.userId,
            userId: post.user?.userId,
            title: 'New Like',
            content: 'liked your post',
            data: {
              type: 'like',
              postId: postId
            }
          });
        }
      }
    } catch (error) {
      console.error("Error updating like:", error);
      setPostLikes((prev) => ({
        ...prev,
        [postId]: currentLikes,
      }));
    }
  };

  const handleSaveConfig = async () => {
    try {
      const postId = selectedPost?.postId;
      const baseUrl = process.env.NEXT_PUBLIC_SERVER;
      const apiUrl = `${baseUrl}/post/update/${postId}`;

      const bodyData = {
        isPublicPost: isPublic,
        isPublicComment: isComment,
      };

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Cập nhật thành công!",
          severity: "success",
        });
        handleRefreshPosts();
        handleCloseSettings();
      } else {
        setSnackbar({
          open: true,
          message: "Cập nhật thất bại!",
          severity: "error",
        });
        handleCloseSettings();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      setSnackbar({
        open: true,
        message: "Có lỗi xảy ra!",
        severity: "error",
      });
      handleCloseSettings();
    }
  };



  return (
    <>
      <div className="grid grid-cols-3 gap-4 mx-auto">
        {posts.map((post) => (
          <div key={post.postId} onClick={() => handlePostClick(post.postId)} className="relative aspect-square group cursor-pointer overflow-hidden">
            {userCurrent?.userId === post.user?.userId && (
              <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => handleSettingsClick(e, post)}
                  className="bg-white/50 hover:bg-white/75 p-1 rounded-full"
                >
                  <MoreVert className="text-white" />
                </button>
                <button
                  onClick={(e) => handleDeleteClick(e, post.postId)}
                  className="bg-white/50 hover:bg-white/75 p-1 rounded-full ml-1"
                >
                  <DeleteOutline className="text-white" />
                </button>
              </div>
            )}

            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 flex items-center justify-center gap-8">
              <div className="flex items-center gap-2 text-white">
                <FavoriteBorder />
                <span className="font-semibold">{postLikes[post.postId]?.length || 0}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <ChatBubbleOutline />
                <span className="font-semibold">{post.numberComment || 0}</span>
              </div>
            </div>
            <div className="w-full h-full relative bg-gray-100">
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${post.mediaUrls[0]}`}
                alt={`Post by ${post.user?.username || "user"}`}
                className="object-cover hover:scale-105 transition-transform duration-300 w-full h-full"
                loading="eager"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Settings Modal */}
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${showSettingsModal ? 'opacity-100' : 'opacity-0 pointer-events-none'} overflow-y-auto`}>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden transform transition-all duration-300 ${showSettingsModal ? 'scale-100' : 'scale-95'}`}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 flex justify-between items-center">
              <h2 className="text-white font-semibold text-xl">{t("post.settings.title")}</h2>
              <button
                onClick={handleCloseSettings}
                className="text-white hover:bg-white/10 p-2 rounded-full transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="flex">
              {selectedPost && (
                <div className="w-1/2 p-6 bg-gray-50 border-r border-gray-200">
                  <div className="aspect-square relative w-full rounded-xl overflow-hidden shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${selectedPost.mediaUrls[0]}`}
                      alt="Post preview"
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent backdrop-blur-sm text-white p-4 flex justify-center gap-8">
                      <div className="flex items-center gap-2">
                        <FavoriteBorder fontSize="small" className="text-white" />
                        <span className="font-medium text-white">{postLikes[selectedPost.postId]?.length || 0} likes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChatBubbleOutline fontSize="small" className="text-white" />
                        <span className="font-medium text-white">{selectedPost.numberComment || 0} comments</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="font-medium text-gray-800 text-lg mb-2">{t("post.settings.postContent")}</div>
                    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                      <p className="text-gray-700">{selectedPost.content || t("post.settings.noContent")}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="w-1/2 p-6 bg-gray-50">
                <div className="text-lg font-medium text-gray-800 mb-4">{t("post.settings.privacyOptions")}</div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      {isPublic ? <Public className="text-blue-500" /> : <Lock className="text-blue-500" />}
                      <div>
                        <span className="text-gray-700 font-medium block">
                          {isPublic ? t("post.settings.public") : t("post.settings.private")}
                        </span>
                        <span className="text-sm text-gray-500">
                          {isPublic ? t("post.settings.publicDesc") : t("post.settings.privateDesc")}
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center p-5 bg-gray-50 border-t border-gray-200">
              <button
                onClick={handleCloseSettings}
                className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium"
              >
                {t("post.settings.cancel")}
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors duration-200 font-medium shadow-md"
              >
                {t("post.settings.saveSettings")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${showDeleteDialog ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all duration-300 ${showDeleteDialog ? 'scale-100' : 'scale-95'}`}>
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 flex justify-between items-center">
              <h2 className="text-white font-semibold text-xl">{t("post.delete.title")}</h2>
              <button
                onClick={() => !isDeleting && setShowDeleteDialog(false)}
                className="text-white hover:bg-white/10 p-2 rounded-full transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="p-6 bg-gray-50">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{t("post.delete.confirm")}</h3>
                  <p className="text-gray-600">{t("post.delete.warning")}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-5 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => !isDeleting && setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium disabled:opacity-50"
              >
                {t("post.delete.cancel")}
              </button>
              <button
                onClick={() => postToDelete && handleDeletePost(postToDelete)}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-colors duration-200 font-medium shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t("post.delete.deleting")}</span>
                  </>
                ) : (
                  t("post.delete.delete")
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AlertSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
        severity={snackbar.severity as "success" | "error"}
      />

      {selectedPostId && (
        <PostModal
          open={isModalOpen}
          onClose={handleCloseModal}
          postId={selectedPostId}
          likes={postLikes[selectedPostId] || []}
          handleLike={() => handleLike(selectedPostId)}
          isShared={Boolean(savedPosts[selectedPostId])}
          shareId={savedPosts[selectedPostId]}
          onShareChange={(isShared, shareId) => {
            setSavedPosts((prev) => {
              if (isShared) {
                return { ...prev, [selectedPostId]: shareId! };
              } else {
                const newSaved = { ...prev };
                delete newSaved[selectedPostId];
                return newSaved;
              }
            });
            handleRefreshPosts();
          }}
        />
      )}
    </>
  );
};

export default PostsGrid;

