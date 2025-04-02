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
  const targetUserId = params.id as string;

  const userId = useAppSelector(selectCurrentUser)?.userId;
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [users, setUsers] = useState<IUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [conversation, setConversation] = useState<Array<any>>([]);
  const [otherUsers, setOtherUsers] = useState<string[]>([]);
  const [room, setRoom] = useState<any[]>([]);
  const [tempUser, setTempUser] = useState<IUser | null>(null);
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
      setConversation(sortedConversations);

      // Extract other user IDs from conversations
      const otherUserIds = sortedConversations.map((conv: any) =>
        conv.user1Id === userId ? conv.user2Id : conv.user1Id
      );
      console.log("Other user IDs:", otherUserIds);
      setOtherUsers(otherUserIds);

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
        // Nếu không có cuộc trò chuyện nào, đặt danh sách người dùng rỗng
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching conversations and users:", error);
      // Trong trường hợp lỗi, đặt danh sách người dùng rỗng
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

      // Check if targetUserId is already in the otherUsers list
      if (otherUsers.includes(targetUserId)) {
        // Find and select the existing user
        const existingUser = users.find(u => u.id.toString() === targetUserId);
        if (existingUser) {
          setSelectedUser(existingUser);
          return;
        }
      }

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

        setTempUser(formattedUser);
        setSelectedUser(formattedUser);
      } catch (error) {
        console.error("Error fetching target user profile:", error);
      }
    };

    fetchTargetUser();
  }, [targetUserId, userId, otherUsers, users]);

  // Connect to socket and handle online users
  useEffect(() => {
    if (!userId) return;

    const socket = socketService.connect(userId.toString());

    socket.on("onlineUsers", (userIds: string[]) => {
      setOnlineUsers(new Set(userIds));
    });

    // Listen for new messages to update conversation list
    socket.on("receiveMessage", (message) => {
      // Thay vì gọi fetchConversationsAndUsers() trực tiếp, cập nhật UI một cách mượt mà hơn
      if (message && (message.senderId === userId || message.receiverId === userId)) {
        // Chỉ cập nhật nếu tin nhắn liên quan đến người dùng hiện tại
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
    // Update URL without full page reload
    router.push(`/messages/${user.id}`, { scroll: false });
  };

  // Hàm xử lý khi tin nhắn được gửi
  const handleMessageSent = () => {
    // Cập nhật danh sách cuộc trò chuyện ngay lập tức
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
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 transition-all duration-200">
          {/* Show temporary user at the top if it exists */}
          {tempUser && !users.some(user => user.id.toString() === tempUser.id.toString()) && (
            <div className="px-3 py-2">
              <ItemUser
                key={tempUser.id}
                user={tempUser}
                onSelect={() => handleUserSelect(tempUser)}
                isSelected={selectedUser?.id === tempUser.id}
                isOnline={onlineUsers.has(tempUser.id.toString())}
                isTemporary={true}
              />
            </div>
          )}

          {/* Show existing conversations */}
          <div className="px-3 space-y-1">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.id} className="py-1">
                  <ItemUser
                    user={user}
                    onSelect={() => handleUserSelect(user)}
                    isSelected={selectedUser?.id === user.id}
                    isOnline={onlineUsers.has(user.id.toString())}
                  />
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <div className="text-gray-500 mb-2">
                  {t("messages.noResults")}
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  {t("messages.newChat.startConversation")}
                </div>
                <button
                  onClick={() => router.push('/explore')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {t("messages.newChat.findUsers")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className={`
        ${selectedUser ? 'block' : 'hidden md:block'}
        flex-1 h-full relative
      `}>
        {/* Mobile back button */}
        {selectedUser && (
          <button
            onClick={() => setSelectedUser(null)}
            className="md:hidden absolute top-4 left-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {selectedUser ? (
          <div className="h-full">
            <ChatBox
              user={selectedUser}
              onMessageSent={handleMessageSent}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center p-4">
            <div className="max-w-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">{t("messages.selectConversation")}</h3>
              <p className="text-gray-500">{t("messages.selectConversationHint")}</p>
            </div>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default Messages;
