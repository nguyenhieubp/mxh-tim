import { Box, Typography, Button } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import DoneAllIcon from '@mui/icons-material/DoneAll';

interface NotificationHeaderProps {
    onMarkAllAsRead?: () => void;
    unreadCount?: number;
}

const NotificationHeader: React.FC<NotificationHeaderProps> = ({ onMarkAllAsRead, unreadCount = 0 }) => {
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                textAlign: 'center',
                borderBottom: '1px solid #eaeaea',
                padding: '15px 0',
                backgroundColor: '#f8f9fa',
                position: 'relative',
            }}
        >
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 600,
                    color: '#2c3e50'
                }}
            >
                {t('navigation.notifications')}
            </Typography>
            
            {unreadCount > 0 && (
                <Button
                    startIcon={<DoneAllIcon />}
                    onClick={onMarkAllAsRead}
                    size="small"
                    variant="text"
                    sx={{ 
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'primary.main',
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        minWidth: 'auto',
                    }}
                >
                    {t('notification.markAllAsRead', 'Mark all as read')}
                </Button>
            )}
        </Box>
    );
};

export default NotificationHeader;