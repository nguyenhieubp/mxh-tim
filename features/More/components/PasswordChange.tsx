import { Lock, KeyboardArrowRight } from '@mui/icons-material';
import { ListItem, ListItemIcon, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

const PasswordChange = () => {
    const { t } = useTranslation();
    const [openPasswordDialog, setOpenPasswordDialog] = React.useState(false);
    const [passwordForm, setPasswordForm] = React.useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handlePasswordChange = () => {
        console.log('Password change:', passwordForm);
        setOpenPasswordDialog(false);
        setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
    };

    return (
        <>
            <ListItem>
                <ListItemIcon>
                    <Lock />
                </ListItemIcon>
                <ListItemText
                    primary={t('settings.changePassword')}
                    secondary={t('settings.updatePassword')}
                />
                <IconButton onClick={() => setOpenPasswordDialog(true)}>
                    <KeyboardArrowRight />
                </IconButton>
            </ListItem>

            <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
                <DialogTitle>{t('settings.changePassword')}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        type="password"
                        label={t('settings.currentPassword')}
                        fullWidth
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label={t('settings.newPassword')}
                        type="password"
                        fullWidth
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label={t('settings.confirmPassword')}
                        type="password"
                        fullWidth
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPasswordDialog(false)}>{t('settings.cancel')}</Button>
                    <Button
                        onClick={handlePasswordChange}
                        disabled={
                            !passwordForm.currentPassword ||
                            !passwordForm.newPassword ||
                            !passwordForm.confirmPassword ||
                            passwordForm.newPassword !== passwordForm.confirmPassword
                        }
                    >
                        {t('settings.save')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PasswordChange;