"use client";

import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import UserSearch from "../components/UserSearch";

function UsersContent() {
  const { isAdmin, isLoading } = useAdmin();

  if (isLoading || !isAdmin) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Quản lý người dùng</h1>
      <div className="space-y-6">
        <UserSearch />
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <AdminProvider>
      <UsersContent />
    </AdminProvider>
  );
}