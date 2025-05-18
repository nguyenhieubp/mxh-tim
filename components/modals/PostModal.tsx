import {
  IconButton,
  Modal,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Avatar,
} from "@mui/material";
import {
  ChatBubbleOutline,
  Send,
  BookmarkBorder,
  ClearSharp,
  ArrowBackIos,
  ArrowForwardIos,
  Favorite,
  MoreVert,
  ReportProblem,
} from "@mui/icons-material";
import * as React from "react";
import { fetchPostById, fetchPostLikes, Like } from "@/redux/features/post";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/redux/configs/hooks";
import ControlPointOutlinedIcon from "@mui/icons-material/ControlPointOutlined";
import moment from "moment";
import axios from "axios";
import { getAuthHeaders } from "@/utils/api";
import { useRouter } from "next/navigation";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import socketService from "@/services/socketService";
import AlertSnackbar from "@/components/common/AlertSnackbar";

interface PostModalProps {
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
  isShared?: boolean;
  shareId?: string | null;
  onShareChange?: (isShared: boolean, shareId: string | null) => void;
}

const PostModal: React.FC<PostModalProps> = ({
  open,
  onClose,
  postId,
  showNavigation = false,
  onPrev,
  onNext,
  canPrev = false,
  canNext = true,
  setNumberComments,
  likes,
  handleLike,
  isShared = false,
  shareId = null,
  onShareChange,
}) => {
  const handleShare = async () => {
    if (!userCurrent?.userId) return;

    try {
      if (isShared && shareId) {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_SERVER}/share/delete/${shareId}`,
          getAuthHeaders()
        );
        onShareChange?.(false, null);
      } else {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER}/share/create`,
          {
            userId: userCurrent.userId,
            postId: postId,
          },
          getAuthHeaders()
        );
        onShareChange?.(true, response.data.data.shareId);
      }
    } catch (error) {
      console.error("Error handling share:", error);
    }
  };
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const userCurrent = useAppSelector((state) => state.auth.user);
  const post = useAppSelector((state) => state.posts.selectedPost);

  const [localComments, setLocalComments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const commentInputRef = React.useRef<HTMLInputElement | null>(null);
  const [commentReplies, setCommentReplies] = React.useState<{
    [commentId: string]: any[];
  }>({});
  const [comment, setComment] = React.useState("");
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
  const [parentCommentId, setParentCommentId] = React.useState<string | null>(
    null
  );
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [expandedCommentIds, setExpandedCommentIds] = React.useState<string[]>(
    []
  );
  const [currentPage, setCurrentPage] = React.useState(1);
  const hasLiked = likes?.some(
    (like) => like.user.userId === userCurrent?.userId
  );

  // Add new state for report functionality
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [openReportDialog, setOpenReportDialog] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [alert, setAlert] = React.useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  const fetchComments = React.useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const pageSize = 3;
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER}/comment/${postId}/all?page=${page}&size=${pageSize}`,
          getAuthHeaders()
        );
        const newComments = data.data.content;
        setLocalComments((prev) =>
          page === 1 ? newComments : [...prev, ...newComments]
        );
        setHasMore(newComments.length > 0);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    },
    [postId]
  );

  const fetchCommentReplies = async (commentId: string) => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER}/comment/${commentId}/getAllCommentReply`,
        getAuthHeaders()
      );

      if (data && data.data && Array.isArray(data.data.content)) {
        setCommentReplies((prev) => ({
          ...prev,
          [commentId]: data.data.content,
        }));
      }
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  // Initial data loading
  React.useEffect(() => {
    if (open) {
      dispatch(fetchPostById(postId));
      dispatch(fetchPostLikes(postId));
      fetchComments(1);
      resetCommentStates();
      setCurrentPage(1);
    }
  }, [dispatch, postId, open, fetchComments]);

  const resetCommentStates = () => {
    setComment("");
    setReplyingTo(null);
    setParentCommentId(null);
  };

  const handleToggleReply = (commentId: string) => {
    setExpandedCommentIds((prev) => {
      if (prev.includes(commentId)) {
        return prev.filter((id) => id !== commentId);
      }
      fetchCommentReplies(commentId);
      return [...prev, commentId];
    });
  };

  // Handle reply click
  const handleReplyClick = (username: string, commentId: string) => {
    setReplyingTo(username);
    setComment(`@${username} `);
    setParentCommentId(commentId);
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  // Handle image navigation
  const handleImageNavigation = (direction: "prev" | "next") => {
    setCurrentImageIndex((prev) => {
      if (direction === "prev" && prev > 0) return prev - 1;
      if (direction === "next" && prev < (post?.mediaUrls?.length ?? 1) - 1)
        return prev + 1;
      return prev;
    });
  };

  // Handle load more comments
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      fetchComments(nextPage);
      setCurrentPage(nextPage);
    }
  };

  // Handle posting comments
  const handlePostComment = async () => {
    if (!comment.trim()) return;
    try {
      const newComment = {
        userId: userCurrent?.userId,
        postId,
        content: comment,
        parentCommentId,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER}/comment/create`,
        newComment,
        getAuthHeaders()
      );

      // If this is a reply, update the replies state
      if (parentCommentId) {
        setCommentReplies((prev) => ({
          ...prev,
          [parentCommentId]: [...(prev[parentCommentId] || []), response.data.data]
        }));

        // Update the number of replies for the parent comment
        setLocalComments((prev) =>
          prev.map((comment) =>
            comment.commentId === parentCommentId
              ? {
                ...comment,
                numberReplyComment: (comment.numberReplyComment || 0) + 1,
              }
              : comment
          )
        );

        // Tự động mở phần replies nếu chưa mở
        setExpandedCommentIds((prev) => {
          if (!prev.includes(parentCommentId)) {
            return [...prev, parentCommentId];
          }
          return prev;
        });
      } else {
        // If it's a top-level comment, add to localComments
        setLocalComments((prev) => [...prev, response.data.data]);
      }

      // Update total comment count
      setNumberComments?.((prev) => (prev || 0) + 1);

      // Send notification if commenting on someone else's post
      if (post?.user?.userId !== userCurrent?.userId) {
        await socketService.sendNotification({
          actor: userCurrent?.userId || "",
          userId: post?.user?.userId || "",
          title: "New Comment",
          content: parentCommentId ? "replied to a comment" : "commented on your post",
          data: {
            type: "comment",
            postId: postId,
            commentContent: comment,
            parentCommentId,
          },
        });
      }

      resetCommentStates();
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleNavigateToProfile = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleReportClick = () => {
    handleMenuClose();
    setOpenReportDialog(true);
  };

  const handleReportClose = () => {
    setOpenReportDialog(false);
    setReason("");
    setDescription("");
  };

  const handleReportSubmit = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/post/${post?.postId}/report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userCurrent?.userId,
            reason,
            description,
          }),
        }
      );

      const result = await response.json();
      if (result.status === 201) {
        handleReportClose();
        setAlert({
          open: true,
          message: "Báo cáo bài viết thành công",
          severity: "success",
        });
      } else {
        setAlert({
          open: true,
          message: result.message || "Có lỗi xảy ra khi báo cáo",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error reporting post:", error);
      setAlert({
        open: true,
        message: "Có lỗi xảy ra khi báo cáo",
        severity: "error",
      });
    }
  };

  if (!post) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <div className="relative">
        <div className="absolute top-[-2rem] right-[-7rem]">
          <IconButton
            onClick={onClose}
            sx={{
              backgroundColor: "white",
              "&:hover": {
                backgroundColor: "#f3f4f6",
              },
              boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
              padding: "8px",
            }}
          >
            <ClearSharp sx={{ fontSize: 20 }} />
          </IconButton>
        </div>
        {showNavigation && (
          <>
            <div className="absolute left-[-7rem] top-1/2 transform -translate-y-1/2">
              <IconButton
                sx={{
                  backgroundColor: "white",
                  "&:hover": {
                    backgroundColor: "#f3f4f6",
                  },
                  boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                  padding: "8px",
                }}
                onClick={onPrev}
                disabled={!canPrev}
                className={`bg-white hover:bg-gray-100 shadow-md ${!canPrev ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                <ArrowBackIos />
              </IconButton>
            </div>
            <div className="absolute right-[-7rem] top-1/2 transform -translate-y-1/2">
              <IconButton
                sx={{
                  backgroundColor: "white",
                  "&:hover": {
                    backgroundColor: "#f3f4f6",
                  },
                  boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                  padding: "8px",
                }}
                onClick={onNext}
                disabled={!canNext}
                className={`bg-white hover:bg-gray-100 shadow-md ${!canNext ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                <ArrowForwardIos />
              </IconButton>
            </div>
          </>
        )}
        <div className="bg-white p-4 rounded-lg w-[80rem] h-[90vh]">
          <div className="flex gap-4 h-full w-full relative">
            <div className="w-[40rem] h-full relative flex items-center justify-center bg-gray-100">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    width={1000}
                    height={1000}
                    className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
                    src={
                      post?.mediaUrls?.[currentImageIndex]
                        ? `${process.env.NEXT_PUBLIC_API_URL}${post.mediaUrls[currentImageIndex]}`
                        : "/default-post-image.jpg"
                    }
                    alt={t("post.imageAlt")}
                    onLoad={(e) => {
                      const img = e.target as HTMLImageElement;
                      const isPortrait = img.naturalHeight > img.naturalWidth;
                      if (isPortrait) {
                        img.style.maxHeight = '80vh';
                        img.style.width = 'auto';
                        img.style.padding = '1rem';
                      } else {
                        img.style.maxHeight = '90vh';
                        img.style.width = '100%';
                        img.style.padding = '0';
                      }
                    }}
                  />
                </div>
                {post?.mediaUrls && post.mediaUrls.length > 1 && (
                  <>
                    <button
                      onClick={() => handleImageNavigation("prev")}
                      className={`absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white 
                                rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110
                                ${currentImageIndex === 0
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:shadow-xl"
                        }`}
                      disabled={currentImageIndex === 0}
                    >
                      <ArrowBackIos className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => handleImageNavigation("next")}
                      className={`absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white 
                                rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110
                                ${currentImageIndex === post.mediaUrls.length - 1
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:shadow-xl"
                        }`}
                      disabled={currentImageIndex === post.mediaUrls.length - 1}
                    >
                      <ArrowForwardIos className="w-6 h-6" />
                    </button>
                  </>
                )}
                {post?.mediaUrls && post.mediaUrls.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white/80 px-4 py-2 rounded-full shadow-lg">
                    {post.mediaUrls.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentImageIndex
                            ? "bg-blue-500 scale-125"
                            : "bg-gray-300 hover:bg-gray-400"
                          }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="w-[40rem] h-full">
              <div className="border-b-2 border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={
                        `${post?.user?.profilePicture ? `${process.env.NEXT_PUBLIC_API_URL}${post?.user?.profilePicture}` : "/default-image.jpg"}`
                      }
                      onClick={() =>
                        handleNavigateToProfile(post?.user?.userId)
                      }
                      alt={post?.user.username}
                      className="w-8 h-8 rounded-full cursor-pointer"
                    />
                    <span className="font-semibold">{post?.user.username}</span>
                  </div>
                  <IconButton onClick={handleMenuClick}>
                    <MoreVert />
                  </IconButton>
                </div>
              </div>

              <div className="h-[24rem] overflow-y-auto scrollbar-hide p-4">
                {post?.content && (
                  <div className="flex gap-3 mb-4">
                    <Avatar
                      src={
                        `${post?.user?.profilePicture ? `${process.env.NEXT_PUBLIC_API_URL}${post?.user?.profilePicture}` : "/default-image.jpg"}`
                      }
                      onClick={() =>
                        handleNavigateToProfile(post?.user?.userId)
                      }
                      alt={post.user.username}
                      className="w-8 h-8 rounded-full cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold mr-2">
                        {post.user.username}
                      </span>
                      <span>{post.content}</span>
                    </div>
                  </div>
                )}

                <div>
                  {localComments.map((comment) => (
                    <div
                      key={comment.commentId}
                      className="flex flex-col gap-3 mb-4"
                    >
                      <div className="flex gap-3">
                        <Avatar
                          src={
                            `${comment.user.profilePicture ? `${process.env.NEXT_PUBLIC_API_URL}${comment.user.profilePicture}` : "/default-image.jpg"}`
                          }
                          alt={comment.user.username}
                          onClick={() =>
                            handleNavigateToProfile(comment.user.userId)
                          }
                          className="w-8 h-8 rounded-full object-cover cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="text-sm">
                            <span className="font-semibold mr-2 hover:text-gray-500 cursor-pointer">
                              {comment.user.username}
                            </span>
                            <span className="text-gray-900">
                              {comment.content}
                            </span>
                          </div>
                          <div className="flex gap-4 mt-1 text-xs text-gray-500">
                            <span>{moment(comment.createdAt).fromNow()}</span>
                            <span
                              className="font-semibold cursor-pointer"
                              onClick={() =>
                                handleReplyClick(
                                  comment.user.username,
                                  comment.commentId
                                )
                              }
                            >
                              Reply
                            </span>
                          </div>

                          {comment.numberReplyComment > 0 && (
                            <div
                              className="mt-2 flex items-center gap-2 cursor-pointer text-[0.75rem] text-gray-500 hover:text-gray-700 transition duration-200"
                              onClick={() =>
                                handleToggleReply(comment.commentId)
                              }
                            >
                              <div className="w-12 border-t border-gray-300"></div>
                              <span className="font-semibold">
                                {comment.numberReplyComment} replies
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        {expandedCommentIds.includes(comment.commentId) && (
                          <div className="ml-12 space-y-4">
                            {commentReplies[comment.commentId]?.map((reply) => (
                              <div key={reply.commentId} className="flex gap-3">
                                <Avatar
                                  onClick={() =>
                                    handleNavigateToProfile(reply.user.userId)
                                  }
                                  src={`${reply.user.profilePicture ? `${process.env.NEXT_PUBLIC_API_URL}${reply.user.profilePicture}` : "/default-image.jpg"}`}
                                  alt={reply.user.username}
                                  className="w-8 h-8 rounded-full object-cover cursor-pointer"
                                />
                                <div className="flex-1">
                                  <div className="text-sm">
                                    <span className="font-semibold mr-2 hover:text-gray-500 cursor-pointer">
                                      {reply.user.username}
                                    </span>
                                    <span className="text-gray-900">{reply.content}</span>
                                  </div>
                                  <div className="flex gap-4 mt-1 text-xs text-gray-500">
                                    <span>{moment(reply.createdAt).fromNow()}</span>
                                    <span
                                      onClick={() =>
                                        handleReplyClick(
                                          reply.user.username,
                                          comment.commentId
                                        )
                                      }
                                      className="font-semibold cursor-pointer"
                                    >
                                      Reply
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  onClick={handleLoadMore}
                  className="flex items-center justify-center gap-4 cursor-pointer"
                >
                  <IconButton>
                    <ControlPointOutlinedIcon />
                  </IconButton>
                </div>
              </div>

              <div className="p-2 border-t-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <IconButton
                      color={hasLiked ? "error" : "default"}
                      onClick={handleLike}
                    >
                      <Favorite />
                    </IconButton>
                    <IconButton
                      onClick={() => commentInputRef.current?.focus()}
                    >
                      <ChatBubbleOutline />
                    </IconButton>
                  </div>
                  <div>
                    <IconButton onClick={handleShare}>
                      {isShared ? (
                        <BookmarkIcon className="text-yellow-500" />
                      ) : (
                        <BookmarkBorder />
                      )}
                    </IconButton>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="font-semibold">{likes?.length} likes</span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {replyingTo && (
                    <>
                      Replying to{" "}
                      <span className="font-semibold">{replyingTo}</span>
                      <IconButton
                        size="small"
                        onClick={() => resetCommentStates()}
                      >
                        <ClearSharp />
                      </IconButton>
                    </>
                  )}
                </div>

                <div className="flex items-center mt-2">
                  <input
                    type="text"
                    ref={commentInputRef}
                    className="flex-1 border-none outline-none p-2 rounded-full bg-gray-100"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handlePostComment();
                      }
                    }}
                  />
                  <IconButton onClick={handlePostComment} disabled={!comment}>
                    <Send />
                  </IconButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Report Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleReportClick}>
            <ReportProblem className="mr-2" />
            Báo cáo bài viết
          </MenuItem>
        </Menu>

        {/* Add Report Dialog */}
        <Dialog
          open={openReportDialog}
          onClose={handleReportClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle className="flex items-center">
            <ReportProblem className="mr-2 text-red-500" />
            Báo cáo bài viết
          </DialogTitle>
          <DialogContent>
            <div className="space-y-4 mt-4">
              <FormControl fullWidth>
                <InputLabel>Lý do báo cáo</InputLabel>
                <Select
                  value={reason}
                  label="Lý do báo cáo"
                  onChange={(e) => setReason(e.target.value)}
                >
                  <MenuItem value="SPAM">Spam</MenuItem>
                  <MenuItem value="INAPPROPRIATE">
                    Nội dung không phù hợp
                  </MenuItem>
                  <MenuItem value="HARASSMENT">Quấy rối</MenuItem>
                  <MenuItem value="VIOLENCE">Bạo lực</MenuItem>
                  <MenuItem value="OTHER">Khác</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Mô tả chi tiết"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleReportClose}>Hủy</Button>
            <Button
              onClick={handleReportSubmit}
              variant="contained"
              color="error"
              disabled={!reason || !description}
            >
              Gửi báo cáo
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Alert Snackbar */}
        <AlertSnackbar
          open={alert.open}
          onClose={() => setAlert({ ...alert, open: false })}
          message={alert.message}
          severity={alert.severity}
        />
      </div>
    </Modal>
  );
};

export default PostModal;
