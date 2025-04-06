'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Dashboard,
    People,
    Settings,
    Logout
} from '@mui/icons-material';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { text: 'Users', icon: <People />, path: '/admin/users' },
    { text: 'Settings', icon: <Settings />, path: '/admin/settings' },
];

const AdminSidebar = () => {
    const pathname = usePathname();

    return (
        <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0">
            <div className="p-4">
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            </div>
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            component={Link}
                            href={item.path}
                            selected={pathname === item.path}
                            className={pathname === item.path ? 'bg-blue-50' : ''}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon><Logout /></ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </List>
        </div>
    );
};

export default AdminSidebar; 