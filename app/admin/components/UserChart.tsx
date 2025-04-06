'use client'

import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Box
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

interface UserData {
    date: string;
    count?: number;    // Tổng số người dùng
    newUsers?: number; // Số người dùng mới
}

const UserChart = () => {
    const [data, setData] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserGrowth = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/user/growth`);
                const result = await response.json();
                if (result.status === 200 && result.data) {
                    // Format data for chart
                    const formattedData = result.data.map((item: any) => ({
                        date: new Date(item.date).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        }),
                        count: item.count || item.totalUsers,
                        newUsers: item.newUsers
                    }));
                    setData(formattedData);
                }
            } catch (error) {
                console.error("Error fetching user growth data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserGrowth();
    }, []);

    return (
        <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
                <Typography variant="h6" className="mb-4">
                    Tăng trưởng người dùng
                </Typography>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <CircularProgress />
                    </div>
                ) : (
                    <Box className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={data}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 20,
                                }}
                            >
                                <CartesianGrid 
                                    strokeDasharray="3 3" 
                                    stroke="#f0f0f0"
                                />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12, fill: '#666' }}
                                    tickLine={{ stroke: '#666' }}
                                    axisLine={{ stroke: '#666' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#666' }}
                                    tickLine={{ stroke: '#666' }}
                                    axisLine={{ stroke: '#666' }}
                                    tickFormatter={(value: number) => value.toLocaleString()}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    }}
                                    formatter={(value: number, name: string) => [
                                        value.toLocaleString(), 
                                        name === 'count' ? 'Tổng số người dùng' : 'Người dùng mới'
                                    ]}
                                    labelFormatter={(label: string) => `Ngày: ${label}`}
                                />
                                <Legend 
                                    verticalAlign="top" 
                                    height={36}
                                    formatter={(value) => (
                                        <span className="text-sm text-gray-600">
                                            {value === 'count' ? 'Tổng số người dùng' : 'Người dùng mới'}
                                        </span>
                                    )}
                                />
                                {data[0]?.count !== undefined && (
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        name="count"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={{ 
                                            r: 4,
                                            fill: '#3b82f6',
                                            stroke: '#fff',
                                            strokeWidth: 2
                                        }}
                                        activeDot={{ 
                                            r: 6,
                                            fill: '#3b82f6',
                                            stroke: '#fff',
                                            strokeWidth: 2
                                        }}
                                    />
                                )}
                                {data[0]?.newUsers !== undefined && (
                                    <Line
                                        type="monotone"
                                        dataKey="newUsers"
                                        name="newUsers"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={{ 
                                            r: 4,
                                            fill: '#10b981',
                                            stroke: '#fff',
                                            strokeWidth: 2
                                        }}
                                        activeDot={{ 
                                            r: 6,
                                            fill: '#10b981',
                                            stroke: '#fff',
                                            strokeWidth: 2
                                        }}
                                    />
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default UserChart; 