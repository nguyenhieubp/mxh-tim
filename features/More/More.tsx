"use client"

import React, { useState } from 'react';
import { List, ListSubheader, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './components/LanguageSelector';
import PasswordChange from './components/PasswordChange';
import ThemeToggle from './components/ThemeToggle';
import LogoutComponent from './components/LogoutComponent';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/features/auth';

const More = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useDispatch();
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    const handleLogout = () => {
        setIsLogoutDialogOpen(true);
    };

    const handleLogoutConfirm = () => {
        try {
            dispatch(logout());
            localStorage.removeItem('token');
            setIsLogoutDialogOpen(false);
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <List
                subheader={
                    <ListSubheader
                        component="div"
                        className="bg-transparent text-gray-800 dark:text-white text-xl font-semibold py-4"
                    >
                        {t('settings.title')}
                    </ListSubheader>
                }
            >
                <div className="space-y-1">
                    <div className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <LanguageSelector />
                    </div>
                    <Divider />

                    <div className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <PasswordChange />
                    </div>
                    <Divider />

                    <div className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <ThemeToggle />
                    </div>
                    <Divider />

                    <div
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                        <div onClick={handleLogout}>
                            <LogoutComponent onLogoutClick={handleLogout} />
                        </div>
                    </div>
                </div>
            </List>

            <Dialog
                open={isLogoutDialogOpen}
                onClose={() => setIsLogoutDialogOpen(false)}
                PaperProps={{
                    className: 'rounded-lg'
                }}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle className="text-xl font-semibold border-b pb-4">
                    {t('settings.logoutConfirm.title')}
                </DialogTitle>
                <DialogContent className="mt-4">
                    <p className="text-gray-600 dark:text-gray-300">
                        {t('settings.logoutConfirm.message')}
                    </p>
                </DialogContent>
                <DialogActions className="p-4 border-t">
                    <Button
                        onClick={() => setIsLogoutDialogOpen(false)}
                        variant="outlined"
                        color="inherit"
                        size="large"
                    >
                        {t('settings.logoutConfirm.cancel')}
                    </Button>
                    <Button
                        onClick={handleLogoutConfirm}
                        variant="contained"
                        color="error"
                        size="large"
                        autoFocus
                    >
                        {t('settings.logoutConfirm.confirm')}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default More;