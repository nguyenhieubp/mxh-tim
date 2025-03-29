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

export interface IUser {
  id: number;
  username: string;
  profilePicture: string;
}

const Messages: React.FC = () => {
  const { t } = useTranslation();
  const userId = useAppSelector(selectCurrentUser)?.userId;
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [users, setUsers] = useState<IUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [conversation, setConversation] = useState<Array<any>>([]);
  const [otherUsers, setOtherUsers] = useState<string[]>([]);
  const [room, setRoom] = useState<any[]>([]);

  const userMessage = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_MESSAGE}/conversations/user/${userId}`
      );
      setConversation(res.data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  // Lấy danh sách người còn lại khi conversation thay đổi
  useEffect(() => {
    if (conversation.length > 0) {
      const users = conversation.map((conv) =>
        conv.user1Id === userId ? conv.user2Id : conv.user1Id
      );
      setOtherUsers(users);
    }
  }, [conversation]); // Chạy lại khi conversation thay đổi

  useEffect(() => {
    userMessage();
  }, []);

  const getDetailConversation = async () => {
    try {
      if (otherUsers.length === 0) return;

      console.log("Fetching profile for: ", otherUsers);

      const responses = await Promise.all(
        otherUsers.map((user) =>
          axios.get(`${process.env.NEXT_PUBLIC_SERVER}/user/${user}/profile`)
        )
      );

      const userProfiles = responses.map((res) => res.data.data);
      setRoom(userProfiles);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // Gọi getDetailConversation khi otherUsers cập nhật
  useEffect(() => {
    if (otherUsers.length > 0) {
      getDetailConversation();
    }
  }, [otherUsers]);

  // const profileUser = async (id?: string) => {
  //   try {
  //     const response = await api.get(
  //       id
  //         ? `${process.env.NEXT_PUBLIC_SERVER}/user/${id}/profile`
  //         : APIs.user.profile
  //     );
  //   } catch (error) {
  //     console.error("Error fetching user profile:", error);
  //   }
  // };

  React.useEffect(() => {
    getDetailConversation();
  }, []);

  // Connect to socket when component mounts
  useEffect(() => {
    if (!userId) return;

    const socket = socketService.connect(userId.toString());

    // Listen for online users updates (you would need to implement this on the server)
    socket.on("onlineUsers", (userIds: string[]) => {
      setOnlineUsers(new Set(userIds));
    });

    return () => {
      socketService.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    if (room.length > 0) {
      const formattedUsers: IUser[] = room.map((user) => ({
        id: user.userId, 
        username: user.username,
        profilePicture: user.profilePicture || "https://via.placeholder.com/150",
      }));
      setUsers(formattedUsers);
    }
  }, [room]); // Chạy khi room cập nhật

  return (
    <div className="flex">
      {/* Sidebar user list */}
      <div className="w-[20rem] border-r-2 h-[100vh] overflow-y-auto scrollbar-hide">
        {users.map((user) => (
          <ItemUser
            key={user.id}
            user={user}
            onSelect={() => setSelectedUser(user)}
            isSelected={selectedUser?.id === user.id}
            isOnline={onlineUsers.has(user.id.toString())}
          />
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1">
        {selectedUser ? (
          <ChatBox user={selectedUser} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {t("messages.selectConversation")}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
