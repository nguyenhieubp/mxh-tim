import { DarkMode } from '@mui/icons-material';
import { ListItem, ListItemIcon, ListItemText, Switch } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

const ThemeToggle = () => {
    const { t } = useTranslation();
    const [darkMode, setDarkMode] = React.useState(false);

    const handleThemeChange = () => {
        setDarkMode(!darkMode);
    };

    return (
        <ListItem>
            <ListItemIcon>
                <DarkMode />
            </ListItemIcon>
            <ListItemText
                primary={t('settings.darkMode')}
                secondary={darkMode ? t('settings.on') : t('settings.off')}
            />
            <Switch
                edge="end"
                checked={darkMode}
                onChange={handleThemeChange}
            />
        </ListItem>
    );
};

export default ThemeToggle;