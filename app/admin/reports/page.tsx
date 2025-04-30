"use client";

import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import ReportedPosts from "../components/ReportedPosts";

function ReportsContent() {
  const { isAdmin, isLoading } = useAdmin();

  if (isLoading || !isAdmin) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Bài viết bị báo cáo</h1>
      <div className="space-y-6">
        <ReportedPosts />
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <AdminProvider>
      <ReportsContent />
    </AdminProvider>
  );
} 