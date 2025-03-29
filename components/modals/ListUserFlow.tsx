"use client";

import { Dialog } from "@mui/material";
import { useState, useEffect } from "react";
import Image from "next/image";
import { IoSearchCircleOutline } from "react-icons/io5";
import { api } from "@/configs/apis/request";
import { usePathname } from "next/navigation"; // ✅ Dùng thay thế useRouter()
import Link from "next/link";

interface User {
  userId: string;
  username: string;
  email: string;
  profilePicture: string;
}

interface ListUserFlowProps {
  open: boolean;
  onClose: () => void;
  title: string;
  type: "following" | "followers";
  userId?: string;
}

const ListUserFlow = ({ open, onClose, title, type, userId }: ListUserFlowProps) => {
  const [following, setFollowing] = useState<User[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!userId || !open) return;

    const fetchData = async () => {
      try {
        const [followingRes, followersRes] = await Promise.all([
          api.get(`${process.env.NEXT_PUBLIC_SERVER}/follows/${userId}/following`),
          api.get(`${process.env.NEXT_PUBLIC_SERVER}/follows/${userId}/followers`),
        ]);
        setFollowing(followingRes.data);
        setFollowers(followersRes.data);
      } catch (error) {
        console.error("Error fetching follow data:", error);
      }
    };

    fetchData();
  }, [userId, open]);

  const users = type === "following" ? following : followers;

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: { maxHeight: "80vh", height: "80vh" },
      }}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {title} ({users.length})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <IoSearchCircleOutline className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredUsers.map((user) => (
            <Link
              href={`/profile/${user.userId}`}
              key={user.userId}
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              <div className="relative h-12 w-12 rounded-full overflow-hidden">
                <Image
                  src={
                    user.profilePicture
                      ? `${process.env.NEXT_PUBLIC_API_URL}${user.profilePicture}`
                      : "/default-post-image.jpg"
                  }
                  alt={user.username}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{user.username}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Dialog>
  );
};

export default ListUserFlow;
