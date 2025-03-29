import { Box, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

const NotificationHeader = () => {
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                textAlign: 'center',
                borderBottom: '1px solid #eaeaea',
                padding: '15px 0',
                backgroundColor: '#f8f9fa'
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
        </Box>
    );
};

export default NotificationHeader;