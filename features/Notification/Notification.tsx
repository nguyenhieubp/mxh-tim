import { Box, List } from '@mui/material'
import React from 'react'
import ListNotification from './components/ListNotification';
import NotificationHeader from './components/NotificationHeader';

interface NotificationCompProps {
    setShowNotifications: (value: boolean) => void;
}

const NotificationComp: React.FC<NotificationCompProps> = ({ setShowNotifications }) => {
    return (
        <Box
            sx={{
                width: 400,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                borderRadius: '8px',
                overflow: 'hidden'
            }}
            role="presentation"
            onClick={() => setShowNotifications(false)}
        >
            <NotificationHeader />
            <List sx={{ p: 0, maxHeight: '100%', overflowY: 'auto' }}>
                <ListNotification />
            </List>
        </Box>
    )
}

export default NotificationComp