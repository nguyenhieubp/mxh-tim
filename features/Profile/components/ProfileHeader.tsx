"use client";

import { useEffect, useState, useCallback } from "react";
import EditProfileModal from "./EditProfileModal";
import { useTranslation } from "react-i18next";
import { api } from "@/configs/apis/request";
import Image from "next/image";
import ListUserFlow from "@/components/modals/ListUserFlow";
import { Modal } from "@mui/material";
import { useAppSelector } from "@/redux/configs/hooks";
import { selectCurrentUser } from "@/redux/features/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface IUser {
  userId: string;
  username: string;
  profilePicture: string | null;
  bio: string | null;
  numberPost: number;
}

const ProfileHeader = ({ user }: { user: IUser | undefined }) => {
  const pathname = usePathname();
  const id = pathname.split("/").pop();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userData, setUserData] = useState<IUser | undefined>(user);
  const [following, setFollowing] = useState<any>([]);
  const [followers, setFollowers] = useState<any>([]);
  const { t } = useTranslation();
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const userMe = useAppSelector(selectCurrentUser);

  const isMe = userMe?.userId === id;


  const handleEditProfile = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);

  useEffect(() => {
    if (userData?.userId) {
      getFollowing();
      getFollowers();
    }
  }, [userData]);

  const getFollowing = useCallback(async () => {
    try {
      const response = await api.get(
        `${process.env.NEXT_PUBLIC_SERVER}/follows/${userData?.userId}/following`
      );
      setFollowing(response.data);
    } catch (error) {
      console.error("Error fetching following list:", error);
      // Thêm thông báo lỗi cho người dùng
    }
  }, [userData]);

  const getFollowers = useCallback(async () => {
    try {
      const response = await api.get(
        `${process.env.NEXT_PUBLIC_SERVER}/follows/${userData?.userId}/followers`
      );
      setFollowers(response.data);
    } catch (error) {
      console.error("Error fetching followers list:", error);

    }
  }, [userData]);

  const handleSaveProfile = useCallback((updatedUser: {
    username: string;
    profilePicture: string | null;
    bio: string | null;
  }) => {
    if (!userData) return;

    setUserData({
      ...userData,
      username: updatedUser.username,
      profilePicture: updatedUser.profilePicture,
      bio: updatedUser.bio,
    });
  }, [userData]);

  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (!userMe?.userId || !userData?.userId) return;

      try {
        const response = await api.get(
          `${process.env.NEXT_PUBLIC_SERVER}/follows/${userData.userId}/followers`
        );
        const followers = response.data || [];
        const isCurrentUserFollowing = followers.some(
          (follower: { userId: string }) => follower.userId === userMe.userId
        );
        setIsFollowing(isCurrentUserFollowing);
      } catch (error) {
        console.error("Error checking following status:", error);
      }
    };

    checkFollowingStatus();
  }, [userMe?.userId, userData?.userId]); // Remove following dependency and add userIds

  const handleFollowToggle = useCallback(async () => {
    if (!userData || !userMe) return;

    try {
      if (isFollowing) {
        await api.delete(
          `${process.env.NEXT_PUBLIC_SERVER}/follows/${userMe.userId}/unfollow/${userData.userId}`
        );
        setIsFollowing(false);
      } else {
        await api.post(
          `${process.env.NEXT_PUBLIC_SERVER}/follows/${userMe.userId}/follow/${userData.userId}`
        );
        setIsFollowing(true);
      }

      await Promise.all([
        getFollowers(),
        getFollowing()
      ]);

    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  }, [isFollowing, userMe, userData, getFollowers, getFollowing]);

  return (
    <>
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 border-b pb-4 mb-4">
        <div className="">
          <div
            className="p-1 bg-gradient-to-br from-pink-500 to-yellow-500 rounded-full cursor-pointer"
            onClick={() => setIsAvatarModalOpen(true)}
          >
            <Image
              width={100}
              height={100}
              alt={userData?.username || "avatarUser"}
              src={
                userData?.profilePicture
                  ? `${process.env.NEXT_PUBLIC_API_URL}${userData?.profilePicture}`
                  : "/default-post-image.jpg"
              }
              className="border-2 border-white rounded-full object-cover w-[6rem] h-[6rem]"
            />
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex-1">
          <div className="flex items-center space-x-4">
            <h2 className="text-3xl font-bold">{userData?.username}</h2>
            {isMe && (
              <button
                onClick={handleEditProfile}
                className="px-4 py-1 border rounded text-sm font-semibold hover:bg-gray-100 transition-all duration-200"
              >
                {t("profile.editProfile")}
              </button>
            )}
            {!isMe && (
              <>
                <button
                  onClick={handleFollowToggle}
                  className="px-4 py-1 border rounded text-sm font-semibold hover:bg-gray-100 transition-all duration-200"
                >
                  {isFollowing ? "Hủy theo dõi" : "Theo dõi"}
                </button>
                <Link
                  href={`/messages/${user?.userId}`}
                  className="px-4 py-1 border rounded text-sm font-semibold hover:bg-gray-100 transition-all duration-200"
                >
                  Message
                </Link>
              </>
            )}
          </div>
          <div className="mt-4 flex space-x-8">
            <div>
              <span className="font-bold">{userData?.numberPost}</span>{" "}
              {t("profile.posts")}
            </div>
            <div
              onClick={() => setIsFollowersModalOpen(true)}
              className="cursor-pointer hover:text-gray-600 transition-colors"
            >
              <span className="font-bold">{followers?.length}</span>{" "}
              {t("profile.followers")}
            </div>
            <div
              onClick={() => setIsFollowingModalOpen(true)}
              className="cursor-pointer hover:text-gray-600 transition-colors"
            >
              <span className="font-bold">{following?.length}</span>{" "}
              {t("profile.following")}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-700">{userData?.bio}</p>
          </div>
        </div>
      </div>

      {userData && (
        <EditProfileModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={userData}
          onSave={handleSaveProfile}
        />
      )}

      <ListUserFlow
        open={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        type="followers"
        title={t("profile.followers")}
        userId={userData?.userId} // Add userId
      />

      <ListUserFlow
        open={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
        type="following"
        title={t("profile.following")}
        userId={userData?.userId} // Add userId
      />

      <Modal
        open={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(5px)",
        }}
      >
        <div className="relative bg-transparent p-4 rounded-xl max-w-[90vw] max-h-[90vh]">
          <Image
            width={800}
            height={800}
            alt={userData?.username || "avatarUser"}
            src={
              userData?.profilePicture
                ? `${process.env.NEXT_PUBLIC_API_URL}${userData?.profilePicture}`
                : "/default-post-image.jpg"
            }
            className="rounded-lg object-contain max-h-[80vh] w-auto"
            priority
          />
          <button
            onClick={() => setIsAvatarModalOpen(false)}
            className="fixed top-4 right-4 text-white hover:text-gray-200 rounded-full p-2 transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ProfileHeader;
