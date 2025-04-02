import React from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export interface IUser {
  id: number;
  username: string;
  profilePicture: string;
  lastMessageAt?: string;
}

interface ItemUserProps {
  user: IUser;
  onSelect: () => void;
  isSelected: boolean;
  isOnline?: boolean;
  isTemporary?: boolean;
}

const ItemUser: React.FC<ItemUserProps> = ({
  user,
  onSelect,
  isSelected,
  isOnline = false,
  isTemporary = false,
}) => {
  const { t } = useTranslation();
  
  // Format the last message time
  const formatLastMessageTime = (dateString?: string) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      
      // Kiểm tra xem date có hợp lệ không
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString);
        return "";
      }
      
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      
      // Hiển thị thời gian tương đối
      if (diffInSeconds < 30) {
        return "Just now";
      } else if (diffInMinutes < 1) {
        return `${diffInSeconds}s ago`;
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else if (diffInDays < 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };
  
  return (
    <div
      className={`flex items-center p-3 cursor-pointer transition-all duration-300 rounded-lg group
        ${isSelected 
          ? "bg-blue-50 shadow-sm border-l-4 border-l-blue-500" 
          : "hover:bg-gray-50 border-l-4 border-l-transparent"
        } 
        ${isTemporary ? "border-l-4 border-l-blue-500" : ""}
      `}
      onClick={onSelect}
    >
      <div className="relative w-12 h-12 flex-shrink-0">
        <Image
          src={user.profilePicture}
          alt={user.username}
          width={56}
          height={56}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-200 transition-all duration-300"
        />
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
        )}
      </div>

      <div className="ml-3 flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <div className="font-medium text-gray-900 truncate">{user.username}</div>
          {user.lastMessageAt && (
            <div className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {formatLastMessageTime(user.lastMessageAt)}
            </div>
          )}
        </div>
        <div className={`text-sm truncate ${
          isOnline ? "text-green-600" : "text-gray-500"
        }`}>
          {isTemporary ? t("messages.newMessage") : isOnline ? "Online" : "Offline"}
        </div>
      </div>

      {isSelected && (
        <div className="ml-2 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default ItemUser;
