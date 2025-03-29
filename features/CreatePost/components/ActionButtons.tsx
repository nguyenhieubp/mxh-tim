import { Button, Box } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ActionButtonsProps {
    onClose: () => void;
    onSubmit: () => void;
    disabled: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onClose, onSubmit, disabled }) => {
    const { t } = useTranslation();
    
    return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
                variant="outlined"
                onClick={onClose}
                sx={{ borderRadius: 2, textTransform: 'none' }}
            >
                {t('createPost.cancel')}
            </Button>
            <Button
                variant="contained"
                onClick={onSubmit}
                disabled={disabled}
                sx={{ borderRadius: 2, textTransform: 'none' }}
            >
                {t('createPost.post')}
            </Button>
        </Box>
    );
};

export default ActionButtons;