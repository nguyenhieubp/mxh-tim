'use client'

import { 
  Notifications, 
  AccountCircle 
} from '@mui/icons-material';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Badge, 
  Box 
} from '@mui/material';

const AdminHeader = () => {
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        width: 'calc(100% - 256px)', 
        ml: '256px',
        bgcolor: 'white',
        color: 'black',
        boxShadow: 'none',
        borderBottom: '1px solid #e5e7eb'
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton>
            <Badge badgeContent={4} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <IconButton>
            <AccountCircle />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader; 