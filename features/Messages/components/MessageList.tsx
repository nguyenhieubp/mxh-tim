import React, { useEffect, useRef } from "react";
import { IChatMessage } from "@/features/Messages/message";
import { formatDistanceToNow } from "date-fns";
import { IUser } from "../Messages";
import { useTranslation } from "react-i18next";
import { Avatar } from "@mui/material";

interface MessageListProps {
  messages: IChatMessage[];
  chatEndRef: React.RefObject<HTMLDivElement>;
  currentUser: IUser;
  otherUser: IUser;
}

const MessageList: React.FC<MessageListProps> = ({ messages, chatEndRef, currentUser, otherUser }) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollHeightRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Store the scroll height before update
    lastScrollHeightRef.current = container.scrollHeight;

    // After messages update, check if we should scroll
    const shouldAutoScroll = container.scrollTop + container.clientHeight >= lastScrollHeightRef.current - 100;

    if (shouldAutoScroll) {
      chatEndRef.current?.scrollIntoView({ block: 'end' });
    }
  }, [messages]);

  const formatMessageTime = (timestamp: Date | undefined) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };

  const renderAvatar = (user: IUser) => (
    <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden">
      {user.profilePicture ? (
        <Avatar
          src={user.profilePicture}
          alt={user.username}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full bg-blue-100 flex items-center justify-center text-blue-500 text-sm font-bold">
          {user.username.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className="flex-1 p-2 sm:p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
    >
      <div className="space-y-2 sm:space-y-4">
        {messages.map((msg, index) => {
          const isMe = msg.sender === "me";
          const user = isMe ? currentUser : otherUser;
          const showAvatar = index === 0 || 
            messages[index - 1]?.sender !== msg.sender;

          return (
            <div key={index} className={`flex items-end gap-1 sm:gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar container - maintains space even when avatar isn't shown */}
              <div className="flex-shrink-0 w-6 sm:w-8">
                {showAvatar && (
                  <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full overflow-hidden">
                    {user.profilePicture ? (
                      <Avatar
                        src={user.profilePicture}
                        alt={user.username}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-blue-100 flex items-center justify-center text-blue-500 text-xs sm:text-sm font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Message content */}
              <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%] sm:max-w-[70%]`}>
                {showAvatar && (
                  <span className="text-xs text-gray-500 mb-1 px-1">
                    {isMe ? t("messages.user.you") : user.username}
                  </span>
                )}
                <div
                  className={`px-3 py-2 sm:px-4 sm:py-2 rounded-2xl text-sm ${
                    isMe 
                      ? "bg-blue-500 text-white rounded-tr-none" 
                      : "bg-gray-100 text-gray-800 rounded-tl-none"
                  }`}
                >
                  <div className="break-words">{msg.text}</div>
                  {msg.timestamp && (
                    <div className={`text-[10px] sm:text-xs mt-1 ${isMe ? "text-blue-100" : "text-gray-500"}`}>
                      {formatMessageTime(msg.timestamp)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} className="h-2 sm:h-4" />
      </div>
    </div>
  );
};

export default MessageList; 