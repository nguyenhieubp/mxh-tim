"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import PostsGrid from "./components/PostsGrid";
import { CustomTabPanel, a11yProps } from "../../components/customs/TabPanel";
import { api } from "@/configs/apis/request";
import { APIs } from "@/configs/apis/listAPI";
import ProfileHeader from "./components/ProfileHeader";
import { IPost } from "@/redux/features/post/types";
import { ImageNotSupported, Refresh } from "@mui/icons-material";
import { useAppSelector } from "@/redux/configs/hooks";
import { selectCurrentUser } from "@/redux/features/auth";
import { Button, CircularProgress, IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";

interface IUser {
  userId: string;
  username: string;
  profilePicture: string | null;
  bio: string | null;
  numberPost: number;
}

interface ProfilePageProps {
  userId?: string;
}

const UserProfilePage = ({ userId }: ProfilePageProps) => {
  const [value, setValue] = React.useState(0);
  const [user, setUser] = React.useState<IUser | undefined>();
  const [posts, setPosts] = React.useState<Array<IPost>>([]);
  const [postPrivate, setPostPrivate] = React.useState<Array<IPost>>([]);

  const [pagePosts, setPagePosts] = React.useState(1);
  const [pagePrivate, setPagePrivate] = React.useState(1);

  const postLimit = 9; // Increased for better grid display
  const [hasMorePosts, setHasMorePosts] = React.useState(true);
  const [hasMorePrivate, setHasMorePrivate] = React.useState(true);

  const [savedPosts, setSavedPosts] = React.useState<Array<IPost>>([]);
  const [pageSaved, setPageSaved] = React.useState(1);
  const [hasMoreSaved, setHasMoreSaved] = React.useState(true);

  const [isLoading, setIsLoading] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0); // Key to force refresh
  
  const firstRender = React.useRef(true);
  const userMe = useAppSelector(selectCurrentUser);

  const isMe = userMe?.userId === user?.userId;

  const { t } = useTranslation();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);

    // Fetch data based on selected tab
    if (user?.userId) {
      if (isMe) {
        switch (newValue) {
          case 0: // Private tab
            setPostPrivate([]);
            setPagePrivate(1);
            setHasMorePrivate(true);
            getPostPrivate(1);
            break;
          case 1: // Posts tab
            setPosts([]);
            setPagePosts(1);
            setHasMorePosts(true);
            getPosts(1);
            break;
          case 2: // Saved tab
            setSavedPosts([]);
            setPageSaved(1);
            setHasMoreSaved(true);
            getSavedPosts(1);
            break;
        }
      } else {
        // For non-owner, only fetch posts
        setPosts([]);
        setPagePosts(1);
        setHasMorePosts(true);
        getPosts(1);
      }
    }
  };

  const refreshData = () => {
    setIsLoading(true);
    setRefreshKey(prev => prev + 1);
    
    // Reset states
    setPagePosts(1);
    setPagePrivate(1);
    setPageSaved(1);
    setHasMorePosts(true);
    setHasMorePrivate(true);
    setHasMoreSaved(true);
    
    // Clear existing data
    setPosts([]);
    setPostPrivate([]);
    setSavedPosts([]);
    
    // Refetch user profile and data
    if (userId) {
      profileUser(userId);
    } else {
      profileUser();
    }
    
    // Fetch appropriate data based on current tab
    if (isMe) {
      switch (value) {
        case 0:
          getPostPrivate(1);
          break;
        case 1:
          getPosts(1);
          break;
        case 2:
          getSavedPosts(1);
          break;
      }
    } else {
      getPosts(1);
    }
    
    setTimeout(() => setIsLoading(false), 800);
  };

  React.useEffect(() => {
    if (userId) {
      profileUser(userId);
    } else {
      profileUser();
    }
  }, [userId]);

  React.useEffect(() => {
    if (user?.userId && firstRender.current) {
      firstRender.current = false;
      setPosts([]);
      setPostPrivate([]);
      setSavedPosts([]); 
      setPagePosts(1);
      setPagePrivate(1);
      setPageSaved(1); 
      setHasMorePosts(true);
      setHasMorePrivate(true);
      setHasMoreSaved(true); 
      getPosts(1);
      getPostPrivate(1);
      getSavedPosts(1);
    }
  }, [user]);

  React.useEffect(() => {
    if (user?.userId && pagePosts > 1) {
      getPosts(pagePosts);
    }
  }, [pagePosts]);

  React.useEffect(() => {
    if (user?.userId && pagePrivate > 1) {
      getPostPrivate(pagePrivate);
    }
  }, [pagePrivate]);

  React.useEffect(() => {
    if (user?.userId && pageSaved > 1) {
      getSavedPosts(pageSaved);
    }
  }, [pageSaved]);

  // Key for forcing refresh
  React.useEffect(() => {
    if (refreshKey > 0) {
      // Data will be fetched when refreshKey changes
    }
  }, [refreshKey]);

  const profileUser = async (id?: string) => {
    try {
      const response = await api.get(
        id
          ? `${process.env.NEXT_PUBLIC_SERVER}/user/${id}/profile`
          : APIs.user.profile
      );
      setUser(response.data.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const getPosts = async (pageNumber: number) => {
    try {
      setIsLoading(true);
      const response = await api.get(
        `${process.env.NEXT_PUBLIC_SERVER}/user/${user?.userId}/posts?page=${pageNumber}&size=${postLimit}`
      );

      const newPosts = response.data.data.content;
      setPosts((prev) => [...prev, ...newPosts]);

      if (newPosts.length < postLimit) {
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPostPrivate = async (pageNumber: number) => {
    try {
      setIsLoading(true);
      const response = await api.get(
        `${process.env.NEXT_PUBLIC_SERVER}/user/${user?.userId}/private/posts?page=${pageNumber}&size=${postLimit}`
      );

      const newPosts = response.data.data.content;
      setPostPrivate((prev) => [...prev, ...newPosts]);

      if (newPosts.length < postLimit) {
        setHasMorePrivate(false);
      }
    } catch (error) {
      console.error("Error fetching private posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSavedPosts = async (pageNumber: number) => {
    try {
      setIsLoading(true);
      const response = await api.get(
        `${process.env.NEXT_PUBLIC_SERVER}/share/user/${user?.userId}?page=${pageNumber}&size=${postLimit}`
      );

      const newPosts = response?.data?.data?.content?.map((share: any) => share.post) || [];
      setSavedPosts((prev) => (pageNumber === 1 ? newPosts : [...prev, ...newPosts]));

      const totalPages = response?.data?.data?.totalPages || 1;
      setHasMoreSaved(pageNumber < totalPages);
    } catch (error) {
      console.error("Error fetching saved posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAllPosts = React.useCallback(async () => {
    // Reset all states
    setPosts([]);
    setPostPrivate([]);
    setPagePosts(1);
    setPagePrivate(1);
    setHasMorePosts(true);
    setHasMorePrivate(true);

    // Fetch first page of both types
    await Promise.all([
      getPosts(1),
      getPostPrivate(1)
    ]);
  }, []);

  const handlePostUpdate = () => {
    refreshData();
  };

  return (
    <div className="container mx-auto px-4 py-6 bg-white shadow-lg rounded-lg transition-all">
      <ProfileHeader user={user} />

      <Box sx={{ width: "100%", mt: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: 1, 
          borderColor: "divider"
        }}>
          {isMe ? (
            <Tabs 
              value={value} 
              onChange={handleChange} 
              aria-label="profile tabs"
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: 'primary.main',
                  height: 3
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  transition: 'all 0.2s',
                  '&:hover': {
                    color: 'primary.main',
                  },
                },
                '& .Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 600
                }
              }}
            >
              <Tab label={t("profile.tabs.posts")} {...a11yProps(0)} />
              <Tab label={t("profile.tabs.private")} {...a11yProps(1)} />
              <Tab label={t("profile.tabs.saved")} {...a11yProps(2)} />
            </Tabs>
          ) : (
            <Tabs 
              value={0} 
              onChange={handleChange} 
              aria-label="profile tabs"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: 'primary.main',
                  height: 3
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  transition: 'all 0.2s',
                  '&:hover': {
                    color: 'primary.main',
                  },
                },
                '& .Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 600
                }
              }}
            >
              <Tab label={t("profile.tabs.posts")} {...a11yProps(0)} />
            </Tabs>
          )}
          
          <Tooltip title="Làm mới">
            <IconButton 
              onClick={refreshData} 
              disabled={isLoading}
              sx={{ mr: 1 }}
            >
              {isLoading ? (
                <CircularProgress size={24} />
              ) : (
                <Refresh color="primary" />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        {isMe ? (
          <>
            <CustomTabPanel value={value} index={0}>
              {isLoading && posts.length === 0 ? (
                <div className="flex justify-center items-center py-16">
                  <CircularProgress />
                </div>
              ) : posts.length > 0 ? (
                <PostsGrid
                  posts={posts}
                  onPostUpdate={handlePostUpdate}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <ImageNotSupported sx={{ fontSize: 64, mb: 2 }} />
                  <p className="text-lg font-medium">Chưa có bài viết nào</p>
                  <p className="text-sm">Khi bạn chia sẻ ảnh, chúng sẽ xuất hiện trên trang cá nhân của bạn</p>
                </div>
              )}
              {hasMorePosts && !isLoading && (
                <div className="text-center mt-6">
                  <Button 
                    variant="contained" 
                    onClick={() => setPagePosts((prev) => prev + 1)}
                    endIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>}
                    sx={{
                      borderRadius: '24px',
                      textTransform: 'none',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                      background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Xem thêm
                  </Button>
                </div>
              )}
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              {isLoading && postPrivate.length === 0 ? (
                <div className="flex justify-center items-center py-16">
                  <CircularProgress />
                </div>
              ) : postPrivate.length > 0 ? (
                <PostsGrid
                  posts={postPrivate}
                  onPostUpdate={handlePostUpdate}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <ImageNotSupported sx={{ fontSize: 64, mb: 2 }} />
                  <p className="text-lg font-medium">Chưa có bài viết riêng tư nào</p>
                  <p className="text-sm">Những bài viết riêng tư của bạn sẽ xuất hiện ở đây</p>
                </div>
              )}
              {hasMorePrivate && !isLoading && (
                <div className="text-center mt-6">
                  <Button 
                    variant="contained" 
                    onClick={() => setPagePrivate((prev) => prev + 1)}
                    endIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>}
                    sx={{
                      borderRadius: '24px',
                      textTransform: 'none',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                      background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Xem thêm
                  </Button>
                </div>
              )}
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
              {isLoading && savedPosts.length === 0 ? (
                <div className="flex justify-center items-center py-16">
                  <CircularProgress />
                </div>
              ) : savedPosts.length > 0 ? (
                <PostsGrid
                  posts={savedPosts}
                  onPostUpdate={handlePostUpdate}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <ImageNotSupported sx={{ fontSize: 64, mb: 2 }} />
                  <p className="text-lg font-medium">Chưa có bài viết đã lưu nào</p>
                  <p className="text-sm">Những bài viết bạn đã lưu sẽ xuất hiện ở đây</p>
                </div>
              )}
              {hasMoreSaved && !isLoading && (
                <div className="text-center mt-6">
                  <Button 
                    variant="contained" 
                    onClick={() => setPageSaved((prev) => prev + 1)}
                    endIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>}
                    sx={{
                      borderRadius: '24px',
                      textTransform: 'none',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                      background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Xem thêm
                  </Button>
                </div>
              )}
            </CustomTabPanel>
          </>
        ) : (
          <CustomTabPanel value={0} index={0}>
            {isLoading && posts.length === 0 ? (
              <div className="flex justify-center items-center py-16">
                <CircularProgress />
              </div>
            ) : posts.length > 0 ? (
              <PostsGrid
                posts={posts}
                onPostUpdate={handlePostUpdate}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <ImageNotSupported sx={{ fontSize: 64, mb: 2 }} />
                <p className="text-lg font-medium">Người dùng chưa có bài viết nào</p>
                <p className="text-sm">Bài viết sẽ xuất hiện tại đây khi được chia sẻ</p>
              </div>
            )}
            {hasMorePosts && !isLoading && (
              <div className="text-center mt-6">
                <Button 
                  variant="contained" 
                  onClick={() => setPagePosts((prev) => prev + 1)}
                  endIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>}
                  sx={{
                    borderRadius: '24px',
                    textTransform: 'none',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                    background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Xem thêm
                </Button>
              </div>
            )}
          </CustomTabPanel>
        )}
      </Box>
    </div>
  );
};

export default UserProfilePage;
