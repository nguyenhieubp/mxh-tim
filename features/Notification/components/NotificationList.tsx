import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Box,
  Avatar,
  Divider,
  Badge,
  Modal,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  PersonAdd as PersonAddIcon,
  Close as CloseIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useAppSelector } from '@/redux/configs/hooks';
import { selectCurrentUser } from '@/redux/features/auth';
import Link from 'next/link';
import PostModal from '@/components/modals/PostModal';
import PostInteractionService from '@/services/postInteraction.service';
import { getAuthHeaders } from '@/utils/api';
import { useRouter } from 'next/navigation';

interface Notification {
  _id: string;
  userId: string;
  title: string;
  content: string;
  isRead: boolean;
  data?: {
    type: string;
    postId?: string;
    userId?: string;
    userName?: string;
    userAvatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  actor: string;
}

interface NotificationListProps {
  setShowNotifications?: (value: boolean) => void;
  isMarkedAsRead?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_SERVER_MESSAGE || 'http://localhost:3000';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'like':
      return <FavoriteIcon color="error" />;
    case 'comment':
      return <CommentIcon color="primary" />;
    case 'share':
      return <ShareIcon color="success" />;
    case 'follow':
      return <PersonAddIcon color="info" />;
    default:
      return <FavoriteIcon color="primary" />;
  }
};

const ModalWrapper = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => {
  return (
    <Box
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {children}
    </Box>
  );
};

export const NotificationList: React.FC<NotificationListProps> = ({ 
  setShowNotifications,
  isMarkedAsRead = false
}) => {
  const user = useAppSelector(selectCurrentUser);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});
  const [open, setOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<any>(null);
  const [likes, setLikes] = useState<any[]>([]);
  const [isShared, setIsShared] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const router = useRouter();

  const postService = PostInteractionService.getInstance();

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER}/user/${userId}/profile`);
      setUserProfiles(prev => ({
        ...prev,
        [userId]: response.data.data
      }));
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      notifications.forEach(notification => {
        if (notification.actor && !userProfiles[notification.actor]) {
          fetchUserProfile(notification.actor);
        }
      });
    }
  }, [notifications, fetchUserProfile]);

  const fetchNotifications = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/notifications/get-all`, {
        userId: user.userId
      });
      setNotifications(response.data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.userId, isMarkedAsRead]);

  const handleMarkAsRead = async (id: string) => {
    if (!user?.userId) return;

    try {
      setError(null);
      await axios.post(`${API_URL}/notifications/${id}/read`, {
        userId: user.userId
      });
      await fetchNotifications();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.userId) return;

    try {
      setError(null);
      await axios.post(`${API_URL}/notifications/read-all`, {
        userId: user.userId
      });
      await fetchNotifications();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to mark all notifications as read');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.userId) return;

    try {
      setError(null);
      await axios.delete(`${API_URL}/notifications/${id}`, {
        data: { userId: user.userId }
      });
      await fetchNotifications();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete notification');
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleNotificationClick = async (notification: Notification, event: React.MouseEvent) => {
    event.stopPropagation();

    if (notification.data?.postId) {
      try {
        const postId = notification.data.postId;
        setCurrentPost(postId);

        // Fetch likes for the post
        const likesResponse = await postService.getLikes(postId);
        if (likesResponse.success) {
          setLikes(likesResponse.data.data);
        }

        // Check share status
        if (user?.userId) {
          const sharesResponse = await postService.getShares(postId);
          if (sharesResponse.success) {
            const shares = sharesResponse.data.data.content || [];
            const existingShare = shares.find((share: any) => share.post.postId === postId);
            setIsShared(!!existingShare);
            setShareId(existingShare?.shareId || null);
          }
        }

        setOpen(true);
        if (!notification.isRead) {
          handleMarkAsRead(notification._id);
        }
      } catch (error) {
        console.error('Error handling notification click:', error);
        setError('Failed to open post');
      }
    }
  };

  const handleLike = async (postId: string) => {
    if (!user?.userId) return;

    try {
      const response = await postService.toggleLike(postId, user.userId);
      if (response.success) {
        const likesResponse = await postService.getLikes(postId);
        if (likesResponse.success) {
          setLikes(likesResponse.data.data);
        }
      }
    } catch (error) {
      console.error('Error handling like:', error);
      setError('Failed to like post');
    }
  };

  useEffect(() => {
    if (currentPost) {
      setOpen(true);
    }
  }, [currentPost]);

  const handleCloseModal = () => {
    setOpen(false);
    setCurrentPost(null);
  };

  console.log("currentPost", currentPost)

  // Update the effect to consider isMarkedAsRead
  useEffect(() => {
    if (!isMarkedAsRead) { // Only refresh if not already marked as read by parent
      // Refresh notifications after they are marked as read
      const refreshTimer = setTimeout(() => {
        fetchNotifications();
      }, 500);
      
      return () => clearTimeout(refreshTimer);
    }
  }, [open, isMarkedAsRead]);

  useEffect(() => {
    // Send event to update the sidebar badge count
    if (notifications.length > 0 && notifications.every(n => n.isRead)) {
      // If all notifications are read, tell parent component to reset the badge count
      if (setShowNotifications) {
        const event = new CustomEvent('notifications-read');
        window.dispatchEvent(event);
      }
    }
  }, [notifications, setShowNotifications]);

  const handleProfileClick = (e: React.MouseEvent, userId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (setShowNotifications) {
      setShowNotifications(false);
    }
    router.push(`/profile/${userId}`);
  };

  return (
    <>
      {notifications.length === 0 && !loading && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <DoneAllIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No notifications
          </Typography>
        </Box>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {notifications.map((notification) => (
        <React.Fragment key={notification._id}>
          <ListItem
            sx={{
              py: 2,
              px: 3,
              bgcolor: notification.isRead ? 'inherit' : 'action.hover',
              '&:hover': {
                bgcolor: 'action.selected',
              },
              transition: 'all 0.2s',
              cursor: 'pointer',
              position: 'relative',
              '&:not(:last-child)::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '1px',
                bgcolor: 'divider',
                opacity: 0.1
              }
            }}
            onClick={(e) => handleNotificationClick(notification, e)}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
              <Badge
                color="error"
                variant="dot"
                invisible={notification.isRead}
                sx={{ 
                  mr: 1,
                  '& .MuiBadge-badge': {
                    right: 2,
                    top: 2,
                    border: '2px solid white'
                  }
                }}
              >
                {userProfiles[notification.actor]?.profilePicture ? (
                  <Avatar 
                    src={`${process.env.NEXT_PUBLIC_API_URL}${userProfiles[notification.actor]?.profilePicture}`}
                    alt={userProfiles[notification.actor]?.username || 'User'}
                    onClick={(e) => handleProfileClick(e, notification.actor)}
                    sx={{ 
                      width: 48, 
                      height: 48,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      border: '2px solid white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }
                    }}
                  />
                ) : (
                  <Avatar 
                    onClick={(e) => handleProfileClick(e, notification.actor)}
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      bgcolor: 'primary.main',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      border: '2px solid white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    {getNotificationIcon(notification.data?.type || '')}
                  </Avatar>
                )}
              </Badge>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography
                    component="span"
                    variant="body2"
                    onClick={(e) => handleProfileClick(e, notification.actor)}
                    sx={{
                      fontWeight: 600,
                      color: 'primary.main',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' },
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {userProfiles[notification.actor]?.username || 'Unknown User'}
                  </Typography>
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ 
                      color: 'text.secondary',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {notification.content}
                  </Typography>
                  {notification.isRead && (
                    <Tooltip title="Read" placement="top">
                      <CheckCircleIcon 
                        sx={{ 
                          fontSize: 16, 
                          color: 'success.main',
                          ml: 1,
                          flexShrink: 0
                        }} 
                      />
                    </Tooltip>
                  )}
                </Box>
                <Typography
                  variant="caption"
                  sx={{ 
                    color: 'text.secondary', 
                    display: 'block', 
                    mt: 0.5,
                    fontSize: '0.75rem'
                  }}
                >
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </Typography>
              </Box>
              
              <ListItemSecondaryAction sx={{ right: 8 }}>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification._id);
                  }}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'error.main',
                      bgcolor: 'error.lighter'
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </Box>
          </ListItem>
          <Divider variant="inset" component="li" />
        </React.Fragment>
      ))}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Modal
        open={open}
        onClose={handleCloseModal}
        aria-labelledby="post-modal"
        aria-describedby="post-modal-description"
      >
        <ModalWrapper onClose={handleCloseModal}>
          <PostModal
            open={open}
            onClose={handleCloseModal}
            postId={currentPost || ''}
            likes={likes}
            handleLike={() => currentPost ? handleLike(currentPost) : undefined}
            isShared={isShared}
            shareId={shareId}
            onShareChange={(newIsShared) => setIsShared(newIsShared)}
          />
        </ModalWrapper>
      </Modal>
    </>
  );
}; 