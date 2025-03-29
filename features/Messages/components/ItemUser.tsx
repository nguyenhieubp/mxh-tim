import React from "react";
import Image from "next/image";

export interface IUser {
  id: number;
  username: string;
  profilePicture: string;
}

interface ItemUserProps {
  user: IUser;
  onSelect: () => void;
  isSelected: boolean;
  isOnline?: boolean;
}

const ItemUser: React.FC<ItemUserProps> = ({
  user,
  onSelect,
  isSelected,
  isOnline = false,
}) => {
  return (
    <div
      className={`flex items-center p-3 border-b cursor-pointer transition-all duration-300 rounded-lg ${
        isSelected ? "bg-blue-100 shadow-md scale-105" : "hover:bg-gray-100"
      }`}
      onClick={onSelect}
    >
      <div className="relative w-12 h-12">
        <Image
          src={
            user.profilePicture
              ? `${process.env.NEXT_PUBLIC_API_URL}${user.profilePicture}`
              : "https://via.placeholder.com/150"
          }
          alt={user.username}
          width={56}
          height={56}
          className="w-14 h-14 rounded-full object-cover border-2 border-gray-300 shadow-md"
        />
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        )}
      </div>

      <div className="ml-3">
        <div className="font-semibold text-gray-900">{user.username}</div>
        <div
          className={`text-sm ${
            isOnline ? "text-green-600 font-medium" : "text-gray-500"
          }`}
        >
          {isOnline ? "Online" : "Offline"}
        </div>
      </div>
    </div>
  );
};

export default ItemUser;
