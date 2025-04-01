import React, { useState, useRef, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useTranslation } from 'react-i18next';
import socketService from "@/services/socketService";
import { IChatMessage, IMessage } from "@/types/message";
import { useAppSelector } from "@/redux/configs/hooks";
import { selectCurrentUser } from "@/redux/features/auth";
import axios from "axios";
import { api } from "@/configs/apis/request";
import { formatDistanceToNow } from "date-fns";

export interface IUser {
  id: number;
  username: string;
  profilePicture: string;
}

interface ChatBoxProps {
  user: IUser;
  onMessageSent?: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ user, onMessageSent }) => {
  const { t } = useTranslation();
  const currentUserId = useAppSelector(selectCurrentUser)?.userId;
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversationExists, setConversationExists] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  // Scroll to the newest message
  useEffect(() => {
    if (chatEndRef.current) {
      // Use instant scroll for initial load and new messages
      chatEndRef.current.scrollIntoView({ block: 'end' });
    }
  }, [messages]);

  // Listen for incoming messages
  useEffect(() => {
    if (!isConnected || !currentUserId) return;

    socketService.onReceiveMessage((message: IMessage) => {
      console.log('Received message in chat:', message);
      if (message.senderId === user.id.toString()) {
        const newMsg: IChatMessage = {
          text: message.content,
          sender: "other",
          timestamp: new Date(message.createdAt || new Date())
        };
        setMessages(prev => [...prev, newMsg]);
        // Instant scroll for new messages
        chatEndRef.current?.scrollIntoView({ block: 'end' });
      }
    });

    return () => {
      socketService.removeReceiveMessageListener();
    };
  }, [isConnected, user.id, currentUserId]);

  // Load chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!currentUserId || !user.id) return;

      try {
        if (conversationExists) {
          // Fetch real messages when conversation exists
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_SERVER_MESSAGE}/messages/conversation/${currentUserId}/${user.id.toString()}`
          );

          const formattedMessages = response.data.map((msg: any) => ({
            text: msg.content,
            sender: msg.senderId === currentUserId ? "me" : "other",
            timestamp: new Date(msg.createdAt)
          }));

          setMessages(formattedMessages);
        } else {
          // Show empty chat room for new conversation
          setMessages([]);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
        // Fallback to empty messages
        setMessages([]);
      }
    };

    fetchChatHistory();
  }, [user.id, currentUserId, conversationExists, t]);

  // Check if conversation exists
  useEffect(() => {
    const checkConversation = async () => {
      if (!currentUserId || !user.id) return;

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_MESSAGE}/conversations/user/${currentUserId}`
        );

        // Check if there's a conversation with this user
        const exists = response.data.some(
          (conv: any) =>
            (conv.user1Id === currentUserId.toString() && conv.user2Id === user.id.toString()) ||
            (conv.user1Id === user.id.toString() && conv.user2Id === currentUserId.toString())
        );

        setConversationExists(exists);
      } catch (error) {
        console.error("Error checking conversation:", error);
      }
    };

    checkConversation();
  }, [currentUserId, user.id]);

  const sendMessage = async () => {
    if (newMessage.trim() === "" || !isConnected || isLoading) return;

    setIsLoading(true);

    try {
      // Create conversation if it doesn't exist
      if (!conversationExists && currentUserId) {
        await api.post(`${process.env.NEXT_PUBLIC_SERVER_MESSAGE}/conversations/create`, {
          user1Id: currentUserId,
          user2Id: user.id.toString()
        });
        setConversationExists(true);
      }

      // Send message via socket and get the message object back
      const sentMessage = socketService.sendMessage(
        user.id.toString(),
        newMessage
      );

      // Add message to local state
      const newMsg: IChatMessage = {
        text: newMessage,
        sender: "me",
        timestamp: new Date(sentMessage?.createdAt || new Date())
      };
      setMessages(prev => [...prev, newMsg]);

      // Clear input
      setNewMessage("");
      
      // Instant scroll for sent messages
      chatEndRef.current?.scrollIntoView({ block: 'end' });

      // Notify parent component that message was sent
      onMessageSent?.();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh)] w-full bg-white shadow-lg rounded-lg">
      <ChatHeader user={user} />
      {messages.length > 0 ? (
        <MessageList 
          messages={messages} 
          chatEndRef={chatEndRef}
          currentUser={{
            id: currentUserId as number,
            username: "You", // You might want to get the actual username from your auth state
            profilePicture: "" // Add your user's profile picture here
          }}
          otherUser={user}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.username}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <p className="text-lg sm:text-xl font-semibold mb-1">{user.username}</p>
          <p className="text-sm mb-4">{t('messages.newChat.startConversation')}</p>
          <p className="text-xs text-center max-w-md px-4">
            {t('messages.newChat.sendFirstMessage')}
          </p>
        </div>
      )}
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
