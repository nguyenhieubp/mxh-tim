import React from 'react';
import { IUser } from '../Messages';
import { Avatar } from '@mui/material';

interface ChatHeaderProps {
  user: IUser;
  onVideoCall: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ user, onVideoCall }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full overflow-hidden">
          {user.profilePicture ? (
            <Avatar
              src={user.profilePicture}
              alt={user.username}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-blue-100 flex items-center justify-center text-blue-500 text-lg font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{user.username}</h3>
        </div>
      </div>
      
      <button
        onClick={onVideoCall}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        title="Bắt đầu cuộc gọi video"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  );
};

export default ChatHeader;
