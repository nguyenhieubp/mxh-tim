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
        <div className="flex flex-col justify-between bg-white h-full p-6 w-72 border-r border-gray-200 shadow-lg">
          <div className="flex flex-col ">
            <Link href={"/"}>
              <h1 className="text-3xl  cursor-pointer font-bold mb-8 px-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-pink-600 hover:to-purple-600 transition-all duration-300">
                Socialverse
              </h1>
            </Link>
            <div className=" transition-transform duration-200">
              <SideBarNav
                setShowNotifications={setShowNotifications}
                setShowCreatePost={setShowCreatePost}
              />
            </div>
          </div>
          <div className="px-3 py-4 border-t border-gray-100">
            <p className="text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors duration-200">
              © 2024 Socialverse. All rights reserved.
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
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