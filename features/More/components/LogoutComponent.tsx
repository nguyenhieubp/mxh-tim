import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Logout } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface LogoutComponentProps {
    onLogoutClick: () => void;
}

const LogoutComponent = ({ onLogoutClick }: LogoutComponentProps) => {
    const { t } = useTranslation();

    return (
        <ListItem onClick={onLogoutClick} className="cursor-pointer hover:bg-gray-100">
            <ListItemIcon>
                <Logout className="text-red-500" />
            </ListItemIcon>
            <ListItemText 
                primary={t('settings.logout')} 
                className="text-red-500"
            />
        </ListItem>
    );
};

export default LogoutComponent;