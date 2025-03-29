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
import { ImageNotSupported } from "@mui/icons-material";
import { useAppSelector } from "@/redux/configs/hooks";
import { selectCurrentUser } from "@/redux/features/auth";

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

  const postLimit = 6;
  const [hasMorePosts, setHasMorePosts] = React.useState(true);
  const [hasMorePrivate, setHasMorePrivate] = React.useState(true);

  const [savedPosts, setSavedPosts] = React.useState<Array<IPost>>([]);
  const [pageSaved, setPageSaved] = React.useState(1);
  const [hasMoreSaved, setHasMoreSaved] = React.useState(true);

  const firstRender = React.useRef(true);
  const userMe = useAppSelector(selectCurrentUser);

  const isMe = userMe?.userId === user?.userId;


  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  console.log("USERID ", userId);

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
      setSavedPosts([]); // Add this
      setPagePosts(1);
      setPagePrivate(1);
      setPageSaved(1); // Add this
      setHasMorePosts(true);
      setHasMorePrivate(true);
      setHasMoreSaved(true); // Add this
      getPosts(1);
      getPostPrivate(1);
      getSavedPosts(1); // Add this
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
    }
  };

  const getPostPrivate = async (pageNumber: number) => {
    try {
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
    }
  };

  const getSavedPosts = async (pageNumber: number) => {
    try {
      const response = await api.get(
        `${process.env.NEXT_PUBLIC_SERVER}/share/user/${user?.userId}?page=${pageNumber}&size=${postLimit}`
      );

      const newPosts = response?.data?.data?.content?.map((share: any) => share.post) || [];
      setSavedPosts((prev) => (pageNumber === 1 ? newPosts : [...prev, ...newPosts]));

      const totalPages = response?.data?.data?.totalPages || 1;
      setHasMoreSaved(pageNumber < totalPages);
    } catch (error) {
      console.error("Error fetching saved posts:", error);
    }
  };

  const refreshSavedPosts = React.useCallback(async () => {
    if (value === 2) { // Only refresh if we're on the Saved tab
      setSavedPosts([]); // Clear current posts
      setPageSaved(1); // Reset page
      setHasMoreSaved(true);
      await getSavedPosts(1); // Fetch first page again
    }
  }, [value]);


  console.log("+============ ", posts)

  return (
    <div className="container mx-auto px-4 py-8 bg-white shadow-sm rounded-lg">
      <ProfileHeader user={user} />

      <Box sx={{ width: "100%", mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          {isMe ? (
            <>
              <Tabs value={value} onChange={handleChange} aria-label="profile tabs">
                <Tab label="Private" {...a11yProps(0)} />
                <Tab label="Posts" {...a11yProps(1)} />
                <Tab label="Saved" {...a11yProps(2)} />
              </Tabs>
            </>
          ) : (
            <Tabs value={value} onChange={handleChange} aria-label="profile tabs">
              <Tab label="Posts" {...a11yProps(1)} />
            </Tabs>
          )}
        </Box>
        <CustomTabPanel value={value} index={0}>
          {postPrivate.length > 0 ? (
            <PostsGrid
              posts={postPrivate}
              onPostUpdate={refreshSavedPosts}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ImageNotSupported sx={{ fontSize: 64, mb: 2 }} />
              <p className="text-lg font-medium">Chưa có bài viết riêng tư nào</p>
              <p className="text-sm">Những bài viết riêng tư của bạn sẽ xuất hiện ở đây</p>
            </div>
          )}
          {hasMorePrivate && (
            <div className="text-center mt-6">
              <button
                onClick={() => setPagePrivate((prev) => prev + 1)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full 
                hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md 
                hover:shadow-lg transform hover:-translate-y-0.5 flex items-center mx-auto gap-2"
              >
                <span>Xem thêm</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          {posts.length > 0 ? (
            <PostsGrid
              posts={posts}
              onPostUpdate={refreshSavedPosts}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ImageNotSupported sx={{ fontSize: 64, mb: 2 }} />
              <p className="text-lg font-medium">Chưa có bài viết nào</p>
              <p className="text-sm">Khi bạn chia sẻ ảnh, chúng sẽ xuất hiện trên trang cá nhân của bạn</p>
            </div>
          )}
          {hasMorePosts && (
            <div className="text-center mt-6">
              <button
                onClick={() => setPagePosts((prev) => prev + 1)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full 
                hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md 
                hover:shadow-lg transform hover:-translate-y-0.5 flex items-center mx-auto gap-2"
              >
                <span>Xem thêm</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          {savedPosts.length > 0 ? (
            <PostsGrid
              posts={savedPosts}
              onPostUpdate={refreshSavedPosts}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ImageNotSupported sx={{ fontSize: 64, mb: 2 }} />
              <p className="text-lg font-medium">Chưa có bài viết đã lưu nào</p>
              <p className="text-sm">Những bài viết bạn đã lưu sẽ xuất hiện ở đây</p>
            </div>
          )}
          {hasMoreSaved && (
            <div className="text-center mt-6">
              <button
                onClick={() => setPageSaved((prev) => prev + 1)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full 
        hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md 
        hover:shadow-lg transform hover:-translate-y-0.5 flex items-center mx-auto gap-2"
              >
                <span>Xem thêm</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </CustomTabPanel>
      </Box>
    </div>
  );
};

export default UserProfilePage;
