"use client";

import UserStats from "./components/UserStats";
import UserChart from "./components/UserChart";
import PostChart from "./components/PostChart";

export default function AdminPage() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 mb-6">
        <UserStats />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UserChart />
          <PostChart />
        </div>
      </div>
    </div>
  );
}
