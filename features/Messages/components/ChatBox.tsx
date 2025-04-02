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
import VideoCall from "./VideoCall";

export interface IUser {
  id: number;
  username: string;
  profilePicture: string;
}

interface ChatBoxProps {
  user: IUser;
  onMessageSent?: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ user, onMessageSent }): JSX.Element => {
  const { t } = useTranslation();
  const currentUserId = useAppSelector(selectCurrentUser)?.userId;
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversationExists, setConversationExists] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [incomingCaller, setIncomingCaller] = useState<IUser | null>(null);

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

  // Handle incoming calls
  useEffect(() => {
    if (!isConnected || !currentUserId) return;

    socketService.onCallOffer((_, caller) => {
      setIncomingCaller({
        id: parseInt(caller.id),
        username: caller.username,
        profilePicture: caller.profilePicture
      });
      setIsIncomingCall(true);
    });

    socketService.onEndCall(() => {
      setIsInCall(false);
      setIsIncomingCall(false);
      setIncomingCaller(null);
    });

    return () => {
      // Remove call listeners
      socketService.removeListener('call:offer');
      socketService.removeListener('call:end');
    };
  }, [isConnected, currentUserId]);

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
      if (onMessageSent) {
        // Gọi callback để cập nhật UI
        onMessageSent();
        
        // Thêm một timeout ngắn để đảm bảo UI được cập nhật
        setTimeout(() => {
          // Gọi lại callback sau một khoảng thời gian ngắn để đảm bảo UI được cập nhật
          onMessageSent();
        }, 500);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCall = () => {
    setIsInCall(true);
  };

  const handleAcceptCall = () => {
    setIsInCall(true);
    setIsIncomingCall(false);
  };

  const handleRejectCall = () => {
    setIsIncomingCall(false);
    setIncomingCaller(null);
    socketService.sendEndCall(user.id.toString());
  };

  const handleEndCall = () => {
    setIsInCall(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <ChatHeader
        user={user}
        onVideoCall={handleStartCall}
      />

      {messages.length > 0 ? (
        <MessageList
          messages={messages}
          chatEndRef={chatEndRef}
          currentUser={{
            id: currentUserId as unknown as number,
            username: "You",
            profilePicture: ""
          }}
          otherUser={user}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4 mx-auto">
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
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              {user.username}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('messages.newChat.startConversation')}
            </p>
            <p className="text-xs text-gray-500">
              {t('messages.newChat.sendFirstMessage')}
            </p>
          </div>
        </div>
      )}

      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
        isConnected={isConnected}
      />

      {/* Video call components */}
      {isInCall && (
        <VideoCall
          currentUser={{
            id: currentUserId as unknown as number,
            username: "You",
            profilePicture: ""
          }}
          otherUser={user}
          onEndCall={handleEndCall}
          isIncoming={isIncomingCall}
        />
      )}

      {/* Incoming call dialog */}
      {isIncomingCall && !isInCall && incomingCaller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full overflow-hidden">
                {incomingCaller.profilePicture ? (
                  <img
                    src={incomingCaller.profilePicture}
                    alt={incomingCaller.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-blue-100 flex items-center justify-center text-blue-500 text-2xl font-bold">
                    {incomingCaller.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{incomingCaller.username}</h3>
                <p className="text-gray-600">Đang gọi video...</p>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleRejectCall}
                className="px-6 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Từ chối
              </button>
              <button
                onClick={handleAcceptCall}
                className="px-6 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                Trả lời
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
