import { ListItem, ListItemButton } from '@mui/material';
import React from 'react'
import Item from './Item';
import { INotificationItem } from '@/types/notification';

const notifications: Array<INotificationItem> = [
    {
        id: 1,
        avatar: 'https://source.unsplash.com/random/100x100?face-1',
        username: 'john_doe',
        action: 'đã thích bài viết của bạn',
        time: '1 giờ trước'
    },
    {
        id: 2,
        avatar: 'https://source.unsplash.com/random/100x100?face-2',
        username: 'mary_jane',
        action: 'đã bắt đầu theo dõi bạn',
        time: '2 giờ trước'
    }
];


const ListNotification = () => {
    return (
        <div> {notifications.map((notification) => (
            <Item notification={notification} key={notification.id}></Item>
        ))}</div>
    )
}

export default ListNotification