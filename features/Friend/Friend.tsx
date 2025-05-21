'use client'

import React, { useEffect, useState } from "react";
import { TextField, InputAdornment, Avatar, CircularProgress } from "@mui/material";
import { Search } from "@mui/icons-material";
import Link from "next/link";

const Friend = () => {
    const [users, setUsers] = useState<{ userId: string; username: string; profilePicture: string | null }[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    // Base URL cho ảnh
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

    // Hàm fetch danh sách bạn bè từ API
    const fetchUsers = async (query = "") => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/user/all?name=${query}`);
            const result = await response.json();
            if (result.status === 200 && result.data && result.data.content) {
                const filteredUsers = result.data.content.filter((user: any) => 
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

    // Fetch dữ liệu khi component mount hoặc khi search thay đổi
    useEffect(() => {
        fetchUsers(search);
    }, [search]);

    return (
        <div className="flex flex-col h-screen p-4">
            {/* Ô tìm kiếm */}
            <div className="w-full mx-auto mb-4">
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search friends..."
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
                                <Link href={`/profile/${user.userId}`} key={user.userId} className="border rounded-lg flex flex-col items-center p-4 shadow-sm">
                                    <Avatar
                                        src={user.profilePicture ? `${BASE_URL}${user.profilePicture}` : "/default-avatar.png"}
                                        sx={{ width: 80, height: 80 }}
                                        alt={user.username}
                                    />
                                    <h1 className="mt-2 text-sm font-semibold">{user.username}</h1>
                                </Link>
                            ))
                        ) : (
                            <p className="text-center col-span-5">Không có bạn bè nào.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Friend;
