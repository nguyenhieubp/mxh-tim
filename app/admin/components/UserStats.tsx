'use client'

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress
} from '@mui/material';
import { People } from '@mui/icons-material';

const UserStats = () => {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/user/count`);
        const result = await response.json();
        if (result.status === 200 && result.data) {
          setTotalUsers(result.data.totalUsers);
        }
      } catch (error) {
        console.error("Error fetching total users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalUsers();
  }, []);

  return (
    <Card className="bg-white shadow-lg">
      <CardContent className="flex items-center p-6">
        <div className="bg-blue-100 p-3 rounded-full mr-4">
          <People className="text-blue-600" />
        </div>
        <div>
          <Typography color="textSecondary" className="text-sm">
            Tổng số người dùng
          </Typography>
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <Typography variant="h4" className="font-bold">
              {totalUsers.toLocaleString()}
            </Typography>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStats; 