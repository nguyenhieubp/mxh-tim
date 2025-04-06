'use client'

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { ReportProblem, Visibility, Delete } from '@mui/icons-material';

interface ReportedPost {
  reportId: string;
  post: {
    postId: string;
    content: string;
    user: {
      userId: string;
      username: string;
      profilePicture: string;
    };
    createdAt: string;
    updatedAt: string;
    isPublicPost: boolean;
    isPublicComment: boolean;
  };
  reporter: {
    userId: string;
    username: string;
    profilePicture: string;
  };
  reason: string;
  description: string;
  status: string;
  createdAt: string;
}

const ReportedPosts = () => {
  const [reportedPosts, setReportedPosts] = useState<ReportedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<string>('PENDING');
  const [selectedPost, setSelectedPost] = useState<ReportedPost | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const fetchReportedPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/post/reports?page=${page - 1}&size=10&status=${status}`
      );
      const result = await response.json();
      if (result.status === 200 && result.data) {
        setReportedPosts(result.data.content);
        setTotalPages(result.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching reported posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportedPosts();
  }, [page, status]);

  const handleStatusChange = (event: any) => {
    setStatus(event.target.value);
    setPage(1); // Reset to first page when status changes
  };

  const handleViewPost = (post: ReportedPost) => {
    setSelectedPost(post);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPost(null);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/post/${postId}`,
        {
          method: 'DELETE',
        }
      );
      const result = await response.json();
      if (result.status === 200) {
        fetchReportedPosts(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6" className="flex items-center">
            <ReportProblem className="mr-2" />
            Bài viết bị báo cáo
          </Typography>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <CircularProgress />
          </div>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nội dung bài viết</TableCell>
                    <TableCell>Người đăng</TableCell>
                    <TableCell>Người báo cáo</TableCell>
                    <TableCell>Lý do</TableCell>
                    <TableCell>Ngày báo cáo</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportedPosts.map((report) => (
                    <TableRow key={report.reportId}>
                      <TableCell>
                        {report.post.content.substring(0, 50)}...
                      </TableCell>
                      <TableCell>{report.post.user.username}</TableCell>
                      <TableCell>{report.reporter.username}</TableCell>
                      <TableCell>{report.reason}</TableCell>
                      <TableCell>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => handleViewPost(report)}
                          >
                            Xem
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<Delete />}
                            onClick={() => handleDeletePost(report.post.postId)}
                          >
                            Xóa
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <div className="flex justify-center mt-4">
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </div>
          </>
        )}
      </CardContent>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle className="flex items-center justify-between">
          <span>Chi tiết báo cáo</span>
        </DialogTitle>
        <DialogContent>
          {selectedPost && (
            <div className="space-y-6">
              {/* Thông tin bài viết */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <Typography variant="subtitle1" className="font-semibold mb-2">
                  Thông tin bài viết
                </Typography>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${selectedPost.post.user.profilePicture}`}
                      alt={selectedPost.post.user.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <Typography variant="body2" className="font-medium">
                        {selectedPost.post.user.username}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(selectedPost.post.createdAt).toLocaleString()}
                      </Typography>
                    </div>
                  </div>
                  <Typography className="mt-2">
                    {selectedPost.post.content}
                  </Typography>
                </div>
              </div>

              {/* Thông tin báo cáo */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <Typography variant="subtitle1" className="font-semibold mb-2">
                  Thông tin báo cáo
                </Typography>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${selectedPost.reporter.profilePicture}`}
                      alt={selectedPost.reporter.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <Typography variant="body2" className="font-medium">
                        {selectedPost.reporter.username}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(selectedPost.createdAt).toLocaleString()}
                      </Typography>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Typography variant="subtitle2" color="textSecondary">
                      Lý do báo cáo
                    </Typography>
                    <Typography className="font-medium">
                      {selectedPost.reason}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2" color="textSecondary">
                      Mô tả chi tiết
                    </Typography>
                    <Typography>
                      {selectedPost.description}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Đóng</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDeletePost(selectedPost?.post.postId || '')}
          >
            Xóa bài viết
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ReportedPosts; 