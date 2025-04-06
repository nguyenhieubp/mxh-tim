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
      onPostUpdate?.();
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
        onPostUpdate?.();
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
                <IconButton
                  onClick={(e) => handleSettingsClick(e, post)}
                  className="bg-white/50 hover:bg-white/75"
                  size="small"
                >
                  <MoreVert className="text-white" />
                </IconButton>
                <IconButton
                  onClick={(e) => handleDeleteClick(e, post.postId)}
                  className="bg-white/50 hover:bg-white/75 ml-1"
                  size="small"
                >
                  <DeleteOutline className="text-white" />
                </IconButton>
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
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}${post.mediaUrls[0]}`}
                alt={`Post by ${post.user?.username || "user"}`}
                fill
                sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
                className="object-cover hover:scale-105 transition-transform duration-300"
                quality={90}
                loading="eager"
              />
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={showSettingsModal}
        onClose={handleCloseSettings}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: 'white',
            padding: '16px 24px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>{t("post.settings.title")}</span>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseSettings}
            aria-label="close"
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: '24px', bgcolor: '#fafafa' }}>
          {selectedPost && (
            <div className="space-y-6">
              <div className="aspect-square relative w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}${selectedPost.mediaUrls[0]}`}
                  alt="Post preview"
                  fill
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

              <div className="mt-6 mb-2 font-medium text-gray-800 text-lg">{t("post.settings.postContent")}</div>
              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
                <p className="text-gray-700">{selectedPost.content || t("post.settings.noContent")}</p>
              </div>

              <div className="space-y-4 max-w-md mx-auto bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="text-lg font-medium text-gray-800 mb-3">{t("post.settings.privacyOptions")}</div>

                <FormControlLabel
                  control={
                    <Switch
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      color="primary"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#3b82f6',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#93c5fd',
                        },
                      }}
                    />
                  }
                  label={
                    <div className="flex items-center gap-2">
                      {isPublic ?
                        <Public className="text-blue-500" /> :
                        <Lock className="text-blue-500" />
                      }
                      <span className="text-gray-700 font-medium">{isPublic ? t("post.settings.public") : t("post.settings.private")}</span>
                    </div>
                  }
                  className="w-full mb-2"
                  sx={{ margin: 0 }}
                />
                <div className="text-sm text-gray-500 ml-9 -mt-1 mb-4">
                  {isPublic
                    ? t("post.settings.publicDesc")
                    : t("post.settings.privateDesc")}
                </div>

                <FormControlLabel
                  control={
                    <Switch
                      checked={isComment}
                      onChange={(e) => setIsComment(e.target.checked)}
                      color="primary"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#3b82f6',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#93c5fd',
                        },
                      }}
                    />
                  }
                  label={
                    <div className="flex items-center gap-2">
                      {isComment ?
                        <CommentBank className="text-blue-500" /> :
                        <CommentOutlined className="text-blue-500" />
                      }
                      <span className="text-gray-700 font-medium">{isComment ? t("post.settings.allowComments") : t("post.settings.disableComments")}</span>
                    </div>
                  }
                  className="w-full"
                  sx={{ margin: 0 }}
                />
                <div className="text-sm text-gray-500 ml-9 -mt-1">
                  {isComment
                    ? t("post.settings.commentsDesc")
                    : t("post.settings.noCommentsDesc")}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{
          padding: '16px 24px',
          backgroundColor: '#fafafa',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <Button
            onClick={handleCloseSettings}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              padding: '8px 16px',
              textTransform: 'none',
              borderColor: '#d1d5db',
              color: '#4b5563',
              '&:hover': {
                borderColor: '#9ca3af',
                backgroundColor: 'rgba(156, 163, 175, 0.04)'
              }
            }}
          >
            {t("post.settings.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveConfig}
            sx={{
              borderRadius: '8px',
              padding: '8px 20px',
              background: 'linear-gradient(90deg, #3b82f6, #4f46e5)',
              textTransform: 'none',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2), 0 2px 4px -1px rgba(59, 130, 246, 0.1)',
              '&:hover': {
                background: 'linear-gradient(90deg, #2563eb, #4338ca)',
                boxShadow: '0 4px 12px -1px rgba(59, 130, 246, 0.3), 0 2px 6px -1px rgba(59, 130, 246, 0.2)',
              }
            }}
          >
            {t("post.settings.saveSettings")}
          </Button>
        </DialogActions>
      </Dialog>

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
            onPostUpdate?.();
          }}
        />
      )}

      <Dialog
        open={showDeleteDialog}
        onClose={() => !isDeleting && setShowDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            padding: '16px 24px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>{t("post.delete.title")}</span>
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => !isDeleting && setShowDeleteDialog(false)}
            aria-label="close"
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: '24px', bgcolor: '#fafafa' }}>
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{t("post.delete.confirm")}</h3>
              <p className="text-gray-600">{t("post.delete.warning")}</p>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{
          padding: '16px 24px',
          backgroundColor: '#fafafa',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <Button
            onClick={() => !isDeleting && setShowDeleteDialog(false)}
            variant="outlined"
            disabled={isDeleting}
            sx={{
              borderRadius: '8px',
              padding: '8px 16px',
              textTransform: 'none',
              borderColor: '#d1d5db',
              color: '#4b5563',
              '&:hover': {
                borderColor: '#9ca3af',
                backgroundColor: 'rgba(156, 163, 175, 0.04)'
              }
            }}
          >
            {t("post.delete.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={() => postToDelete && handleDeletePost(postToDelete)}
            disabled={isDeleting}
            sx={{
              borderRadius: '8px',
              padding: '8px 20px',
              background: 'linear-gradient(90deg, #ef4444, #dc2626)',
              textTransform: 'none',
              boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2), 0 2px 4px -1px rgba(239, 68, 68, 0.1)',
              '&:hover': {
                background: 'linear-gradient(90deg, #dc2626, #b91c1c)',
                boxShadow: '0 4px 12px -1px rgba(239, 68, 68, 0.3), 0 2px 6px -1px rgba(239, 68, 68, 0.2)',
              },
              '&.Mui-disabled': {
                background: '#fca5a5',
                color: 'white'
              }
            }}
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t("post.delete.deleting")}</span>
              </div>
            ) : (
              t("post.delete.delete")
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PostsGrid;

