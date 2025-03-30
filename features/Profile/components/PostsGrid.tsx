'use client'

import { IPost, Like } from "@/redux/features/post/types";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import PostModal from "@/components/modals/PostModal";
import axios from "axios";
import { getAuthHeaders } from "@/utils/api";
import { useAppSelector } from "@/redux/configs/hooks";
import { FavoriteBorder, ChatBubbleOutline } from "@mui/icons-material";
import { MoreVert } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Switch, FormControlLabel } from "@mui/material";
import { Public, Lock, CommentOutlined, CommentBank } from "@mui/icons-material";
import AlertSnackbar from "@/components/common/AlertSnackbar";

interface PostsGridProps {
  posts: IPost[];
  onPostUpdate?: () => void;
}

const PostsGrid: React.FC<PostsGridProps> = ({ posts, onPostUpdate }) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);

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
            <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100">
              <IconButton
                onClick={(e) => handleSettingsClick(e, post)}
                className="bg-white/50 hover:bg-white/75"
                size="small"
              >
                <MoreVert className="text-white" />
              </IconButton>
            </div>

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
        className="relative"
        open={showSettingsModal}
        onClose={handleCloseSettings}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          Post Settings
        </DialogTitle>
        <DialogContent className="!p-6">
          {selectedPost && (
            <div className="space-y-6">
              <div className="aspect-square relative w-full max-w-md mx-auto rounded-lg overflow-hidden shadow-sm border border-gray-100">
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}${selectedPost.mediaUrls[0]}`}
                  alt="Post preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/40 backdrop-blur-sm text-white p-3 flex justify-center gap-8">
                  <div className="flex items-center gap-2">
                    <FavoriteBorder fontSize="small" className="text-gray-100" />
                    <span className="font-normal text-gray-100">{postLikes[selectedPost.postId]?.length || 0} likes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChatBubbleOutline fontSize="small" className="text-gray-100" />
                    <span className="font-normal text-gray-100">{selectedPost.numberComment || 0} comments</span>
                  </div>
                </div>
                <div>
                  <p>{selectedPost.content}</p>
                </div>
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                <FormControlLabel
                  control={
                    <Switch
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <div className="flex items-center gap-2">
                      {!isPublic ?
                        <Public className="text-gray-500" /> :
                        <Lock className="text-gray-500" />
                      }
                      <span className="text-gray-600">Public Post</span>
                    </div>
                  }
                  className="w-full"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={isComment}
                      onChange={(e) => setIsComment(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <div className="flex items-center gap-2">
                      {!isComment ?
                        <CommentBank className="text-gray-500" /> :
                        <CommentOutlined className="text-gray-500" />
                      }
                      <span className="text-gray-600">Is Comments</span>
                    </div>
                  }
                  className="w-full"
                />
              </div>

            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveConfig}
            className="bg-blue-500 hover:bg-blue-600 mr-8"
          >
            Save Settings
          </Button>
          <Button onClick={handleCloseSettings} color="primary">
            Close
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
    </>
  );
};

export default PostsGrid;

