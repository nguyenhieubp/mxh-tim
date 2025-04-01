"use client";

import React, { useState, useEffect } from "react";
import ItemUser from "./components/ItemUser";
import ChatBox from "./components/ChatBox";
import { useTranslation } from "react-i18next";
import socketService from "@/services/socketService";
import { useAppSelector } from "@/redux/configs/hooks";
import { selectCurrentUser } from "@/redux/features/auth";
import axios from "axios";
import { APIs } from "@/configs/apis/listAPI";
import { api } from "@/configs/apis/request";
import LayoutMessage from "@/components/common/LayoutMessage";
import { useParams, useRouter } from "next/navigation";

export interface IUser {
  id: number;
  username: string;
  profilePicture: string;
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

  // Fetch conversations and user details
  const fetchConversationsAndUsers = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      // Get conversations
      const conversationsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_MESSAGE}/conversations/user/${userId}`
      );
      setConversation(conversationsResponse.data);

      // Extract other user IDs from conversations
      const otherUserIds = conversationsResponse.data.map((conv: any) =>
        conv.user1Id === userId ? conv.user2Id : conv.user1Id
      );
      setOtherUsers(otherUserIds);

      // Fetch user details for each conversation
      if (otherUserIds.length > 0) {
        const userResponses = await Promise.all(
          otherUserIds.map((userId: string) =>
            axios.get(`${process.env.NEXT_PUBLIC_SERVER}/user/${userId}/profile`)
          )
        );

        const formattedUsers = userResponses.map(response => {
          const userData = response.data.data;
          return {
            id: userData.userId,
            username: userData.username,
            profilePicture: userData.profilePicture
              ? `${process.env.NEXT_PUBLIC_API_URL}${userData.profilePicture}`
              : "/default-post-image.jpg",
          };
        });

        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error("Error fetching conversations and users:", error);
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
    socket.on("receiveMessage", () => {
      fetchConversationsAndUsers();
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("receiveMessage");
      socketService.disconnect();
    };
  }, [userId]);

  const handleUserSelect = (user: IUser) => {
    setSelectedUser(user);
    // Update URL without full page reload
    router.push(`/messages/${user.id}`, { scroll: false });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sidebar - User list */}
      <div className={`
        ${selectedUser ? 'hidden md:block' : 'block'}
        w-full md:w-[20rem] border-r-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300
      `}>
        <div className="py-4 m-0">
          <LayoutMessage></LayoutMessage>
        </div>
        <hr />
        
        {/* Show temporary user at the top if it exists */}
        {tempUser && !users.some(user => user.id.toString() === tempUser.id.toString()) && (
          <ItemUser
            key={tempUser.id}
            user={tempUser}
            onSelect={() => handleUserSelect(tempUser)}
            isSelected={selectedUser?.id === tempUser.id}
            isOnline={onlineUsers.has(tempUser.id.toString())}
            isTemporary={true}
          />
        )}
        
        {/* Show existing conversations */}
        {users.map((user) => (
          <ItemUser
            key={user.id}
            user={user}
            onSelect={() => handleUserSelect(user)}
            isSelected={selectedUser?.id === user.id}
            isOnline={onlineUsers.has(user.id.toString())}
          />
        ))}
      </div>

      {/* Chat area */}
      <div className={`
        ${selectedUser ? 'block' : 'hidden md:block'}
        flex-1 h-full
      `}>
        {selectedUser ? (
          <div className="h-full relative">
            <button 
              onClick={() => setSelectedUser(null)}
              className="md:hidden absolute top-4 left-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <ChatBox 
              user={selectedUser}
              onMessageSent={fetchConversationsAndUsers}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 p-4 text-center">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg font-medium">{t("messages.selectConversation")}</p>
              <p className="text-sm mt-2">{t("messages.selectConversationHint")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
