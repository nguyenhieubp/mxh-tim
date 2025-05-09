import { Box, List } from '@mui/material'
import React, { useEffect, useState } from 'react'
import NotificationHeader from './components/NotificationHeader';
import { NotificationList } from './components/NotificationList';
import { useAppSelector } from '@/redux/configs/hooks';
import axios from 'axios';

interface NotificationCompProps {
    setShowNotifications: (value: boolean) => void;
}

const NotificationComp: React.FC<NotificationCompProps> = ({ setShowNotifications }) => {
    const userId = useAppSelector(state => state.auth.user?.userId);
    const [isMarkedAsRead, setIsMarkedAsRead] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch unread count
    useEffect(() => {
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

        fetchUnreadCount();
    }, [userId]);

    // Mark all notifications as read when component opens
    useEffect(() => {
        const markAllAsRead = async () => {
            if (!userId) return;
            
            try {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_SERVER_MESSAGE}/notifications/read-all`,
                    { userId }
                );
                
                // Dispatch custom event to reset the badge count in SideBarNav
                const event = new CustomEvent('notifications-read');
                window.dispatchEvent(event);
                setIsMarkedAsRead(true);
                setUnreadCount(0);
            } catch (error) {
                console.error('Error marking notifications as read:', error);
            }
        };

        markAllAsRead();
    }, [userId]);

    const handleMarkAllAsRead = async () => {
        if (!userId) return;
        
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_MESSAGE}/notifications/read-all`,
                { userId }
            );
            
            // Dispatch custom event to reset the badge count in SideBarNav
            const event = new CustomEvent('notifications-read');
            window.dispatchEvent(event);
            setIsMarkedAsRead(true);
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    const handleOutsideClick = (e: React.MouseEvent) => {
        // Only close if clicking the outer Box, not its children
        if (e.target === e.currentTarget) {
            setShowNotifications(false);
        }
    };

    return (
        <Box
            sx={{
                width: 500,
                maxWidth: '90vw',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                borderRadius: '12px',
                overflow: 'hidden',
                bgcolor: 'background.paper',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                }
            }}
            role="presentation"
            onClick={handleOutsideClick}
        >
            <NotificationHeader 
                onMarkAllAsRead={handleMarkAllAsRead}
                unreadCount={unreadCount}
            />
            <List 
                sx={{ 
                    p: 0, 
                    maxHeight: '60vh', 
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                        width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(0,0,0,0.1)',
                        borderRadius: '3px',
                        '&:hover': {
                            background: 'rgba(0,0,0,0.2)',
                        }
                    }
                }}
            >
                <NotificationList 
                    setShowNotifications={setShowNotifications} 
                    isMarkedAsRead={isMarkedAsRead}
                />
            </List>
        </Box>
    )
}

export default NotificationComp