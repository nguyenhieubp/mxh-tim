'use client';

import { useState } from 'react';
import { Drawer } from '@mui/material';
import CreatePost from '../CreatePost/CreatePost';
import NotificationComp from '../Notification/Notification';
import SideBarNav from './SideBarNav';
import Link from 'next/link';

interface SideBarProps {
  children: React.ReactNode;
}

const SideBar = ({ children }: SideBarProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  return (
    <>
      <div className="flex h-screen w-full">
        <div className="flex flex-col justify-between bg-gradient-to-b from-white via-indigo-50/20 to-purple-50/20 h-full p-6 w-72 border-r border-gray-200 shadow-lg">
          <div className="flex flex-col space-y-2">
            <Link href={"/"}>
              <h1 className="text-3xl cursor-pointer font-bold mb-8 px-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-all duration-500">
                Socialverse
              </h1>
            </Link>
            <div>
              <SideBarNav
                setShowNotifications={setShowNotifications}
                setShowCreatePost={setShowCreatePost}
              />
            </div>
          </div>
          <div className="px-3 py-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm rounded-lg">
            <p className="text-gray-600 text-sm font-medium hover:text-indigo-600 transition-colors duration-300">
              © 2024 Socialverse. All rights reserved.
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-100">
          {children}
        </div>
      </div>
      {showNotifications && (
        <Drawer open={showNotifications} onClose={() => setShowNotifications(false)}>
          <NotificationComp setShowNotifications={setShowNotifications} />
        </Drawer>
      )}
      {showCreatePost && (
        <CreatePost setShowCreatePost={setShowCreatePost} />
      )}
    </>
  );
};

export default SideBar;