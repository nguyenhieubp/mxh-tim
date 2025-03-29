import React, { useState, useRef, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useTranslation } from 'react-i18next';
import socketService from "@/services/socketService";
import { IChatMessage, IMessage } from "@/types/message";
import { useAppSelector } from "@/redux/configs/hooks";
import { selectCurrentUser } from "@/redux/features/auth";

export interface IUser {
  id: number;
  username: string;
  profilePicture: string;
}

interface ChatBoxProps {
  user: IUser;
}

const ChatBox: React.FC<ChatBoxProps> = ({ user }) => {
  const { t } = useTranslation();
  const currentUserId = useAppSelector(selectCurrentUser)?.userId;
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Connect to socket when component mounts
  useEffect(() => {
    if (!currentUserId) return;

    const socket = socketService.connect(currentUserId.toString());

    socket.on('connect', () => {
      setIsConnected(true);
      console.log("Socket connected");
    });

    return () => {
      socketService.disconnect();
      setIsConnected(false);
    };
  }, [currentUserId]);

  // Listen for incoming messages
  useEffect(() => {
    if (!isConnected) return;

    socketService.onReceiveMessage((message: IMessage) => {
      if (message.senderId === user.id.toString()) {
        const newMsg: IChatMessage = {
          text: message.content,
          sender: "other",
          timestamp: message.timestamp || new Date()
        };
        setMessages(prev => [...prev, newMsg]);
      }
    });

    return () => {
      socketService.removeReceiveMessageListener();
    };
  }, [isConnected, user.id]);

  // Load chat history
  useEffect(() => {
    // In a real application, you would fetch chat history from your API
    // For now, we'll use mock data
    setMessages([
      { text: t('messages.defaultMessages.greeting'), sender: "other" },
      { text: t('messages.defaultMessages.howAreYou'), sender: "other" },
      { text: t('messages.defaultMessages.imFine'), sender: "me" }
    ]);
  }, [user.id, t]);

  // Scroll to the newest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() === "" || !isConnected) return;

    // Add message to local state
    const newMsg: IChatMessage = {
      text: newMessage,
      sender: "me",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMsg]);

    // Send message via socket
    socketService.sendMessage(
      user.id.toString(),
      newMessage
    );

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh)] w-full bg-white shadow-lg rounded-lg">
      <ChatHeader user={user} />
      <MessageList messages={messages} chatEndRef={chatEndRef} />
      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
        isConnected={isConnected}
      />
    </div>
  );
};

export default ChatBox;
