'use client';

import { usePathname } from 'next/navigation';
import { IoHomeOutline } from "react-icons/io5";
import { MdOutlineExplore, MdOutlinePersonAdd } from "react-icons/md";
import { PiTelegramLogo } from "react-icons/pi";
import { FaRegHeart, FaRegSquarePlus } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { MdOutlineSettings } from "react-icons/md";
import SideBarItem from './SideBarItem';

import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from "@/redux/configs/hooks";
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/redux/features/auth';
import socketService from '@/services/socketService';
import axios from 'axios';
import { Badge } from '@mui/material';

interface SideBarNavProps {
    setShowNotifications: React.Dispatch<React.SetStateAction<boolean>>;
    setShowCreatePost: React.Dispatch<React.SetStateAction<boolean>>;
}

const SideBarNav = ({ setShowNotifications, setShowCreatePost }: SideBarNavProps) => {
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const { t } = useTranslation();
    const [unreadCount, setUnreadCount] = useState<number>(0);

    const userId = useAppSelector(state => state.auth.user?.userId);

    useEffect(() => {
        dispatch(getCurrentUser());
    }, [dispatch]);

    // Connect to socket when component mounts
    useEffect(() => {
        if (userId) {
            // Connect to socket
            const socket = socketService.connect(userId);

            // Log connection status
            console.log('Socket connected:', socketService.isConnected());

            // Listen for new notifications
            socketService.onReceiveNotification((notification) => {
                console.log('Received new notification:', notification);
                // Update unread count
                setUnreadCount(prev => prev + 1);
            });

            // Listen for connect/disconnect events
            socket.on('connect', () => {
                console.log('Socket connected successfully');
                // Fetch unread count when socket connects
                fetchUnreadCount();
            });

            socket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            // Cleanup on unmount
            return () => {
                socketService.removeReceiveNotificationListener();
                socket.off('connect');
                socket.off('disconnect');
                socketService.disconnect();
            };
        }
    }, [userId]);

    // Fetch unread notifications count
    const fetchUnreadCount = async () => {
        if (!userId) return;

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_MESSAGE}/notifications/unread`,
                { userId }
            );
            setUnreadCount(response.data.length);
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
        }
    };

    // Initial fetch of unread count
    useEffect(() => {
        if (userId) {
            fetchUnreadCount();
        }
    }, [userId]);

    // Listen for notification read events
    useEffect(() => {
        const handleNotificationsRead = () => {
            setUnreadCount(0);
        };

        window.addEventListener('notifications-read', handleNotificationsRead);

        return () => {
            window.removeEventListener('notifications-read', handleNotificationsRead);
        };
    }, []);

    const handleNotificationsClick = () => {
        // Only reset count when opening, not when closing
        setShowNotifications(prev => {
            const isOpening = !prev;
            if (isOpening) {
                setUnreadCount(0);
            }
            return !prev;
        });
    };

    const isMyProfile = pathname?.startsWith(`/profile/${userId}`);

    return (
        <ul className="space-y-3 px-2 py-4">
            <li className="relative">
                <div className="absolute -left-2 top-0 h-full w-1 bg-indigo-500 rounded-r-lg opacity-0 transition-opacity duration-300"
                    style={{ opacity: pathname === '/' ? 1 : 0 }} />
                <SideBarItem
                    href="/"
                    icon={<IoHomeOutline size={25} />}
                    label={t('navigation.home')}
                    isActive={pathname === '/'}
                />
            </li>
            <li className="relative">
                <div className="absolute -left-2 top-0 h-full w-1 bg-indigo-500 rounded-r-lg opacity-0 transition-opacity duration-300"
                    style={{ opacity: pathname === '/explore' ? 1 : 0 }} />
                <SideBarItem
                    href="/explore"
                    icon={<MdOutlineExplore size={25} />}
                    label={t('navigation.explore')}
                    isActive={pathname === '/explore'}
                />
            </li>
            <li className="relative">
                <div className="absolute -left-2 top-0 h-full w-1 bg-indigo-500 rounded-r-lg opacity-0 transition-opacity duration-300"
                    style={{ opacity: pathname === '/messages' ? 1 : 0 }} />
                <SideBarItem
                    href="/messages"
                    icon={<PiTelegramLogo size={25} />}
                    label={t('navigation.messages')}
                    isActive={pathname === '/messages'}
                />
            </li>
            <li className="relative">
                <SideBarItem
                    icon={
                        <Badge badgeContent={unreadCount} color="error" invisible={unreadCount === 0}>
                            <FaRegHeart size={25} />
                        </Badge>
                    }
                    label={t('navigation.notifications')}
                    onClick={handleNotificationsClick}
                />
            </li>
            <li className="relative">
                <SideBarItem
                    icon={<FaRegSquarePlus size={25} />}
                    label={t('navigation.create')}
                    onClick={() => setShowCreatePost(prev => !prev)}
                />
            </li>
            <li className="relative">
                <div className="absolute -left-2 top-0 h-full w-1 bg-indigo-500 rounded-r-lg opacity-0 transition-opacity duration-300"
                    style={{ opacity: isMyProfile ? 1 : 0 }} />
                <SideBarItem
                    href={`/profile/${userId}`}
                    icon={<CgProfile size={25} />}
                    label={t('navigation.profile')}
                    isActive={isMyProfile}
                />
            </li>
            <li className="relative">
                <div className="absolute -left-2 top-0 h-full w-1 bg-indigo-500 rounded-r-lg opacity-0 transition-opacity duration-300"
                    style={{ opacity: pathname === '/friends' ? 1 : 0 }} />
                <SideBarItem
                    href="/friends"
                    icon={<MdOutlinePersonAdd size={25} />}
                    label={t('navigation.friends')}
                    isActive={pathname === '/friends'}
                />
            </li>
            <li className="relative">
                <div className="absolute -left-2 top-0 h-full w-1 bg-indigo-500 rounded-r-lg opacity-0 transition-opacity duration-300"
                    style={{ opacity: pathname === '/more' ? 1 : 0 }} />
                <SideBarItem
                    href="/more"
                    icon={<MdOutlineSettings size={25} />}
                    label={t('navigation.more')}
                    isActive={pathname === '/more'}
                />
            </li>
        </ul>
    );
};

export default SideBarNav;
