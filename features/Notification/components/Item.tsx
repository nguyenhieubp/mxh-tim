import { Avatar, Box, ListItem, ListItemButton, Typography } from '@mui/material';
import React from 'react'
import type { INotificationItem } from '@/types/notification';


const Item: React.FC<{ notification: INotificationItem }> = ({ notification }) => {
    return (
        <ListItem
            key={notification.id}
            disablePadding
            sx={{
                '&:hover': {
                    backgroundColor: '#f8f9fa',
                    transition: 'background-color 0.2s ease'
                },
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0'
            }}
        >
            <ListItemButton
                sx={{
                    p: 1,
                    '&:hover': {
                        backgroundColor: 'transparent'
                    }
                }}
            >
                <Avatar
                    src={notification.avatar}
                    sx={{
                        mr: 2,
                        width: 48,
                        height: 48,
                        border: '2px solid #eaeaea'
                    }}
                />
                <Box>
                    <Typography
                        component="span"
                        sx={{
                            fontSize: '0.95rem',
                            color: '#2c3e50',
                            lineHeight: 1.4
                        }}
                    >
                        <strong>{notification.username}</strong> {notification.action}
                    </Typography>
                    <Typography
                        component="p"
                        sx={{
                            color: '#7f8c8d',
                            fontSize: '0.85rem',
                            mt: 0.5
                        }}
                    >
                        {notification.time}
                    </Typography>
                </Box>
            </ListItemButton>
        </ListItem>
    )
}

export default Item
