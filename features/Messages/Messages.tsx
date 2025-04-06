"use client";

import React, { useState, useEffect } from "react";
import ItemUser from "./components/ItemUser";
import ChatBox from "./components/ChatBox";
import { useTranslation } from "react-i18next";
import socketService from "@/services/socketService";
import { useAppSelector } from "@/redux/configs/hooks";
import { selectCurrentUser } from "@/redux/features/auth";
import axios from "axios";
import LayoutMessage from "@/components/common/LayoutMessage";
import { useParams, useRouter } from "next/navigation";

export interface IUser {
  id: number;
  username: string;
  profilePicture: string;
  lastMessageAt?: string;
}

const Messages: React.FC = () => {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const targetUserId = params?.id as string;

  const userId = useAppSelector(selectCurrentUser)?.userId;
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [users, setUsers] = useState<IUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);

  // Fetch conversations and users
  const fetchConversationsAndUsers = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      console.log("Fetching conversations for user:", userId);

      // Get conversations
      const conversationsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_MESSAGE}/conversations/user/${userId}`
      );

      console.log("Conversations response:", conversationsResponse.data);

      // Sort conversations by lastMessageAt
      const sortedConversations = conversationsResponse.data.sort((a: any, b: any) => {
        const dateA = a.lastMessageAt || a.createdAt;
        const dateB = b.lastMessageAt || b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      console.log("Sorted conversations:", sortedConversations);

      // Extract other user IDs from conversations
      const otherUserIds = sortedConversations.map((conv: any) =>
        conv.user1Id === userId ? conv.user2Id : conv.user1Id
      );
      console.log("Other user IDs:", otherUserIds);

      // Fetch user details for each conversation
      if (otherUserIds.length > 0) {
        console.log("Fetching user details for", otherUserIds.length, "users");
        const userResponses = await Promise.all(
          otherUserIds.map((userId: string) =>
            axios.get(`${process.env.NEXT_PUBLIC_SERVER}/user/${userId}/profile`)
          )
        );

        const formattedUsers = userResponses.map((response, index) => {
          const userData = response.data.data;
          const userId = userData.userId;

          // Tìm cuộc trò chuyện tương ứng với người dùng này
          const userConversation = sortedConversations.find((conv: any) =>
            conv.user1Id === userId.toString() || conv.user2Id === userId.toString()
          );

          return {
            id: userData.userId,
            username: userData.username,
            profilePicture: userData.profilePicture
              ? `${process.env.NEXT_PUBLIC_API_URL}${userData.profilePicture}`
              : "/default-post-image.jpg",
            lastMessageAt: userConversation?.lastMessageAt || userConversation?.createdAt || undefined,
          };
        });

        console.log("Formatted users:", formattedUsers);
        setUsers(formattedUsers);
      } else {
        console.log("No conversations found, setting empty users array");
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching conversations and users:", error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchConversationsAndUsers();
  }, [userId]);

  // Fetch target user if not in conversation list
  useEffect(() => {
    const fetchTargetUser = async () => {
      if (!targetUserId || !userId) return;

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER}/user/${targetUserId}/profile`
        );

        const userData = response.data.data;

        const formattedUser: IUser = {
          id: userData.userId,
          username: userData.username,
          profilePicture: userData.profilePicture
            ? `${process.env.NEXT_PUBLIC_API_URL}${userData.profilePicture}`
            : "/default-post-image.jpg",
          lastMessageAt: undefined,
        };

        setSelectedUser(formattedUser);
      } catch (error) {
        console.error("Error fetching target user profile:", error);
      }
    };

    fetchTargetUser();
  }, [targetUserId, userId]);

  // Connect to socket and handle online users
  useEffect(() => {
    if (!userId) return;

    const socket = socketService.connect(userId.toString());

    socket.on("onlineUsers", (userIds: string[]) => {
      setOnlineUsers(new Set(userIds));
    });

    // Listen for new messages to update conversation list
    socket.on("receiveMessage", (message) => {
      if (message && (message.senderId === userId || message.receiverId === userId)) {
        fetchConversationsAndUsers();
      }
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("receiveMessage");
      socketService.disconnect();
    };
  }, [userId]);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = users.filter(user =>
      user.username.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleUserSelect = (user: IUser) => {
    setSelectedUser(user);
    router.push(`/messages/${user.id}`, { scroll: false });
  };

  const handleMessageSent = () => {
    fetchConversationsAndUsers();
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      {/* Sidebar - User list */}
      <div className={`
        ${selectedUser ? 'hidden md:block' : 'block'}
        w-full md:w-80 lg:w-96 border-r border-gray-200 h-full
        flex flex-col bg-white shadow-sm
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <LayoutMessage />
        </div>

        {/* Search bar */}
        <div className="p-4 border-b border-gray-200 bg-white sticky top-[72px] z-10">
          <div className="relative">
            <input
              type="text"
              placeholder={t("messages.searchConversations")}
              className="w-full px-4 py-2 pl-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <p className="text-gray-500 text-lg font-medium mb-2">{t("messages.emptyState.title")}</p>
              <p className="text-gray-400 text-sm mb-4">{t("messages.emptyState.description")}</p>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={() => router.push("/explore")}
              >
                {t("messages.emptyState.startChat")}
              </button>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <ItemUser
                key={user.id}
                user={user}
                isSelected={selectedUser?.id === user.id}
                onSelect={() => handleUserSelect(user)}
                isOnline={onlineUsers.has(user.id.toString())}
              />
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 ${!selectedUser ? 'hidden md:block' : 'block'}`}>
        {selectedUser ? (
          <ChatBox
            user={selectedUser}
            onMessageSent={handleMessageSent}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-gray-500 text-lg font-medium mb-2">{t("messages.selectConversation")}</p>
            <p className="text-gray-400 text-sm">{t("messages.newChat.sendFirstMessage")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
