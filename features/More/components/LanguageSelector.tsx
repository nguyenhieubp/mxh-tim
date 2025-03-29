import { Language, KeyboardArrowRight } from '@mui/icons-material';
import { ListItem, ListItemIcon, ListItemText, IconButton, Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../redux/configs/hooks';
import { setLanguage } from '../../../redux/features/languageSlice';
import React from 'react';

const LanguageSelector = () => {
    const { t, i18n } = useTranslation();
    const dispatch = useAppDispatch();
    const currentLanguage = useAppSelector((state) => state.language.currentLanguage);
    const [languageAnchorEl, setLanguageAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
        setLanguageAnchorEl(event.currentTarget);
    };

    const handleLanguageClose = (language?: string) => {
        if (language) {
            dispatch(setLanguage(language));
            const langCode = language === 'Tiếng Việt' ? 'vi' : 'en';
            i18n.changeLanguage(langCode);
        }
        setLanguageAnchorEl(null);
    };

    return (
        <>
            <ListItem>
                <ListItemIcon>
                    <Language />
                </ListItemIcon>
                <ListItemText
                    primary={t('settings.language')}
                    secondary={currentLanguage}
                />
                <IconButton onClick={handleLanguageClick}>
                    <KeyboardArrowRight />
                </IconButton>
            </ListItem>

            <Menu
                anchorEl={languageAnchorEl}
                open={Boolean(languageAnchorEl)}
                onClose={() => handleLanguageClose()}
            >
                <MenuItem onClick={() => handleLanguageClose('Tiếng Việt')}>Tiếng Việt</MenuItem>
                <MenuItem onClick={() => handleLanguageClose('English')}>English</MenuItem>
            </Menu>
        </>
    );
};

export default LanguageSelector;