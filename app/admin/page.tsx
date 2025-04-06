'use client'

import UserChart from './components/UserChart';
import UserStats from './components/UserStats';

export default function AdminPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <UserStats />
                <UserChart />
            </div>
        </div>
    );
}