'use client'

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid
} from '@mui/material';
import { People, Article } from '@mui/icons-material';

const UserStats = () => {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch tổng số người dùng
        const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/user/count`);
        const usersResult = await usersResponse.json();
        if (usersResult.status === 200 && usersResult.data) {
          setTotalUsers(usersResult.data.totalUsers);
        }

        // Fetch tổng số bài viết
        const postsResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/post/all`);
        const postsResult = await postsResponse.json();
        if (postsResult.status === 200 && postsResult.data) {
          setTotalPosts(postsResult.data.content.length);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card className="bg-white shadow-lg h-full">
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
      </Grid>

      <Grid item xs={12} md={6}>
        <Card className="bg-white shadow-lg h-full">
          <CardContent className="flex items-center p-6">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <Article className="text-green-600" />
            </div>
            <div>
              <Typography color="textSecondary" className="text-sm">
                Tổng số bài viết
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h4" className="font-bold">
                  {totalPosts.toLocaleString()}
                </Typography>
              )}
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default UserStats; 