"use client";

import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import Posts from "../components/Posts";

function PostsContent() {
  const { isAdmin, isLoading } = useAdmin();

  if (isLoading || !isAdmin) return null;

  return (
    <div>
      <div className="space-y-6">
        <Posts />
      </div>
    </div>
  );
}

export default function PostsPage() {
  return (
    <AdminProvider>
      <PostsContent />
    </AdminProvider>
  );
}