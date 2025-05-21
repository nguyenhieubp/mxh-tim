'use client'

import { useState, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { Search } from '@mui/icons-material';

interface User {
  userId: string;
  username: string;
  profilePicture: string | null;
}

interface UserProfile {
  userId: string;
  username: string;
  profilePicture: string | null;
  email: string;
  role: string;
  createdAt: string;
  bio?: string;
  phone?: string;
}

const UserSearch = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Base URL cho ảnh
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

  // Hàm fetch danh sách người dùng từ API
  const fetchUsers = async (query = "") => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/user/all?name=${query}`);
      const result = await response.json();
      if (result.status === 200 && result.data && result.data.content) {
        // Lọc bỏ user có tên là Admin
        const filteredUsers = result.data.content.filter((user: User) => 
          user.username.toLowerCase() !== 'admin'
        );
        setUsers(filteredUsers);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
    setLoading(false);
  };

  // Hàm fetch thông tin chi tiết người dùng
  const fetchUserProfile = async (userId: string) => {
    setProfileLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/user/${userId}/profile`);
      console.log(response);
      const result = await response.json();
      if (result.status === 200 && result.data) {
        setSelectedUser(result.data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
    setProfileLoading(false);
  };

  // Fetch dữ liệu khi component mount hoặc khi search thay đổi
  useEffect(() => {
    fetchUsers(search);
  }, [search]);

  const handleUserClick = async (user: User) => {
    setIsModalOpen(true);
    await fetchUserProfile(user.userId);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="flex flex-col h-screen p-4">
      {/* Ô tìm kiếm */}
      <div className="w-full mx-auto mb-4">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search className="text-gray-500" />
              </InputAdornment>
            ),
          }}
        />
      </div>

      {/* Hiển thị trạng thái loading */}
      {loading ? (
        <div className="flex justify-center items-center flex-1">
          <CircularProgress />
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto border rounded-lg p-4 shadow-sm">
          <div className="grid grid-cols-5 gap-4">
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.userId}
                  className="border rounded-lg flex flex-col items-center p-4 shadow-sm cursor-pointer hover:bg-gray-50"
                  onClick={() => handleUserClick(user)}
                >
                  <Avatar
                    src={user.profilePicture ? `${BASE_URL}${user.profilePicture}` : "/default-avatar.png"}
                    sx={{ width: 80, height: 80 }}
                    alt={user.username}
                  />
                  <h1 className="mt-2 text-sm font-semibold">{user.username}</h1>
                </div>
              ))
            ) : (
              <p className="text-center col-span-5">Không có người dùng nào.</p>
            )}
          </div>
        </div>
      )}

      {/* Modal hiển thị thông tin người dùng */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            minHeight: '60vh'
          }
        }}
      >
        {profileLoading ? (
          <DialogContent>
            <div className="flex justify-center items-center p-4">
              <CircularProgress />
            </div>
          </DialogContent>
        ) : selectedUser ? (
          <>
            <DialogTitle className="text-center text-2xl font-bold">
              Thông tin người dùng
            </DialogTitle>
            <DialogContent>
              <Box className="flex flex-col items-center p-4 md:p-8">
                <Avatar
                  src={selectedUser.profilePicture ? `${BASE_URL}${selectedUser.profilePicture}` : "/default-avatar.png"}
                  sx={{
                    width: 150,
                    height: 150,
                    mb: 4,
                    border: '4px solid #f3f4f6',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                >
                  {selectedUser.username[0]}
                </Avatar>
                <div className="w-full max-w-md space-y-5">
                  <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
                    <Typography variant="h5" className="font-bold text-center mb-2">
                      {selectedUser.username}
                    </Typography>
                    <Typography color="textSecondary" className="text-center">
                      {selectedUser.email}
                    </Typography>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gray-50 p-5 rounded-lg text-center shadow-sm">
                      <Typography color="textSecondary" className="text-sm mb-1">
                        Ngày tham gia
                      </Typography>
                      <Typography className="font-medium">
                        {new Date(selectedUser.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </Typography>
                    </div>
                  </div>
                  {selectedUser.bio && (
                    <div className="bg-gray-50 p-5 rounded-lg text-center shadow-sm">
                      <Typography color="textSecondary" className="text-sm mb-1">
                        Giới thiệu
                      </Typography>
                      <Typography className="font-medium">
                        {selectedUser.bio}
                      </Typography>
                    </div>
                  )}

                  {selectedUser.phone && (
                    <div className="bg-gray-50 p-5 rounded-lg text-center shadow-sm">
                      <Typography color="textSecondary" className="text-sm mb-1">
                        Số điện thoại
                      </Typography>
                      <Typography className="font-medium">
                        {selectedUser.phone}
                      </Typography>
                    </div>
                  )}
                </div>
              </Box>
            </DialogContent>
            <DialogActions className="p-4">
              <Button
                onClick={handleCloseModal}
                variant="outlined"
                className="px-6 py-2 mx-auto"
                sx={{
                  borderRadius: '9999px',
                  borderColor: '#e0e0e0',
                  color: '#666',
                  '&:hover': {
                    borderColor: '#999',
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                Đóng
              </Button>
            </DialogActions>
          </>
        ) : null}
      </Dialog>
    </div>
  );
};

export default UserSearch; 