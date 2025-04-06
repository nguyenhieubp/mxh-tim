import { Lock, KeyboardArrowRight, Visibility, VisibilityOff } from '@mui/icons-material';
import { ListItem, ListItemIcon, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, InputAdornment } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import AlertSnackbar from '@/components/common/AlertSnackbar';
import { useRouter } from 'next/navigation';

const PasswordChange = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const [openPasswordDialog, setOpenPasswordDialog] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState({
        current: false,
        new: false,
        confirm: false
    });
    const [passwordForm, setPasswordForm] = React.useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [alert, setAlert] = React.useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });

    const handleCloseAlert = () => {
        setAlert(prev => ({ ...prev, open: false }));
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handlePasswordChange = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('Mật khẩu mới không khớp');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER}/auth/change-password`,
                {
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.status === 200) {
                setAlert({
                    open: true,
                    message: 'Đổi mật khẩu thành công',
                    severity: 'success'
                });
                setOpenPasswordDialog(false);
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
            }
        } catch (error: any) {
            setAlert({
                open: true,
                message: error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
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
                        type={showPassword.current ? "text" : "password"}
                        label={t('settings.currentPassword')}
                        fullWidth
                        value={passwordForm.currentPassword}
                        onChange={(e) => {
                            setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                            setError('');
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => togglePasswordVisibility('current')}
                                        edge="end"
                                    >
                                        {showPassword.current ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        margin="dense"
                        label={t('settings.newPassword')}
                        type={showPassword.new ? "text" : "password"}
                        fullWidth
                        value={passwordForm.newPassword}
                        onChange={(e) => {
                            setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                            setError('');
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => togglePasswordVisibility('new')}
                                        edge="end"
                                    >
                                        {showPassword.new ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        margin="dense"
                        label={t('settings.confirmPassword')}
                        type={showPassword.confirm ? "text" : "password"}
                        fullWidth
                        value={passwordForm.confirmPassword}
                        onChange={(e) => {
                            setPasswordForm({ ...passwordForm, confirmPassword: e.target.value });
                            setError('');
                        }}
                        error={!!error}
                        helperText={error}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => togglePasswordVisibility('confirm')}
                                        edge="end"
                                    >
                                        {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
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
                            passwordForm.newPassword !== passwordForm.confirmPassword ||
                            loading
                        }
                    >
                        {loading ? 'Đang xử lý...' : t('settings.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            <AlertSnackbar
                open={alert.open}
                onClose={handleCloseAlert}
                message={alert.message}
                severity={alert.severity}
            />
        </>
    );
};

export default PasswordChange;