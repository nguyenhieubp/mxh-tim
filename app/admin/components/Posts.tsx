"use client";

import { useEffect, useState } from "react";
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
    CircularProgress,
    Avatar,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Box,
    Divider,
    Pagination,
    TextField,
    Stack
} from "@mui/material";
import { Visibility, ThumbUp, Comment, Share, Search } from "@mui/icons-material";
import Image from "next/image";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

interface Post {
    postId: string;
    user: {
        userId: string;
        username: string;
        profilePicture: string;
    };
    content: string;
    isPublicPost: boolean;
    isPublicComment: boolean;
    mediaUrls: string[];
    createdAt: string;
    numberLike: number;
    numberComment: number;
    numberShare: number;
}

const Posts = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [searchName, setSearchName] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
    const [tempEndDate, setTempEndDate] = useState<Date | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                let url = `${process.env.NEXT_PUBLIC_SERVER}/post/all?page=${page}&size=10`;
                if (searchName) url += `&userName=${encodeURIComponent(searchName)}`;
                if (startDate) {
                    const year = startDate.getFullYear();
                    const month = String(startDate.getMonth() + 1).padStart(2, '0');
                    const day = String(startDate.getDate()).padStart(2, '0');
                    url += `&startDate=${year}-${month}-${day}`;
                }
                if (endDate) {
                    const year = endDate.getFullYear();
                    const month = String(endDate.getMonth() + 1).padStart(2, '0');
                    const day = String(endDate.getDate()).padStart(2, '0');
                    url += `&endDate=${year}-${month}-${day}`;
                }
                const response = await fetch(url);
                const result = await response.json();
                if (result.status === 200 && result.data) {
                    setPosts(result.data.content);
                    setTotalPages(result.data.totalPages);
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [page, searchName, startDate, endDate]);

    const handleViewPost = (post: Post) => {
        setSelectedPost(post);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedPost(null);
    };

    const handleSearch = () => {
        setSearchName(searchInput.trim());
        setStartDate(tempStartDate);
        setEndDate(tempEndDate);
        setPage(1);
    };

    const handleDateChange = (newStartDate: Date | null, newEndDate: Date | null) => {
        setTempStartDate(newStartDate);
        setTempEndDate(newEndDate);
    };

    return (
        <Card className="bg-white shadow-xl rounded-lg">
            <CardContent className="p-6">
                <Typography
                    variant="h6"
                    className="font-bold text-blue-700"
                    sx={{
                        letterSpacing: 0.5,
                        borderBottom: '2px solid #e3f2fd',
                        paddingBottom: 1.5,
                        marginBottom: 3
                    }}
                >
                    Danh sách bài viết
                </Typography>
                <Box
                    mb={3}
                    sx={{
                        backgroundColor: '#f8fafc',
                        padding: 2,
                        borderRadius: 1.5,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        justifyContent="flex-end"
                        sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' }, gap: 1.5 }}
                    >
                        <TextField
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            placeholder="Tìm kiếm theo tên tác giả..."
                            size="small"
                            sx={{
                                width: '220px',
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'white',
                                    height: '40px',
                                    '&:hover fieldset': {
                                        borderColor: '#1976d2',
                                    },
                                },
                            }}
                        />
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Từ ngày"
                                value={tempStartDate}
                                onChange={(newValue) => handleDateChange(newValue, tempEndDate)}
                                slotProps={{ 
                                    textField: { 
                                        size: "small",
                                        sx: {
                                            width: '180px',
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: 'white',
                                                height: '40px',
                                                '&:hover fieldset': {
                                                    borderColor: '#1976d2',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                transform: 'translate(14px, 8px)',
                                                '&.MuiInputLabel-shrink': {
                                                    transform: 'translate(14px, -9px) scale(0.75)',
                                                },
                                            },
                                        }
                                    } 
                                }}
                            />
                            <DatePicker
                                label="Đến ngày"
                                value={tempEndDate}
                                onChange={(newValue) => handleDateChange(tempStartDate, newValue)}
                                slotProps={{ 
                                    textField: { 
                                        size: "small",
                                        sx: {
                                            width: '180px',
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: 'white',
                                                height: '40px',
                                                '&:hover fieldset': {
                                                    borderColor: '#1976d2',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                transform: 'translate(14px, 8px)',
                                                '&.MuiInputLabel-shrink': {
                                                    transform: 'translate(14px, -9px) scale(0.75)',
                                                },
                                            },
                                        }
                                    } 
                                }}
                            />
                        </LocalizationProvider>
                        <Button
                            variant="contained"
                            startIcon={<Search />}
                            onClick={handleSearch}
                            sx={{ 
                                borderRadius: 1.5, 
                                textTransform: 'none', 
                                px: 2.5,
                                height: '40px',
                                minWidth: '100px',
                                backgroundColor: '#1976d2',
                                '&:hover': {
                                    backgroundColor: '#1565c0',
                                },
                                boxShadow: '0 1px 3px rgba(25,118,210,0.2)',
                            }}
                        >
                            Tìm kiếm
                        </Button>
                    </Stack>
                </Box>
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <CircularProgress sx={{ color: '#1976d2' }} size={24} />
                    </div>
                ) : (
                    <TableContainer
                        component={Paper}
                        sx={{
                            borderRadius: 2,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                            overflow: 'hidden'
                        }}
                    >
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{
                                    background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                                    '& th': {
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        padding: '12px 16px',
                                        whiteSpace: 'nowrap'
                                    }
                                }}>
                                    <TableCell width="40%">Nội dung</TableCell>
                                    <TableCell width="25%">Người đăng</TableCell>
                                    <TableCell width="20%">Ngày đăng</TableCell>
                                    <TableCell width="15%" align="center">Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Array.isArray(posts) && posts?.map((post) => (
                                    <TableRow
                                        key={post.postId}
                                        hover
                                        sx={{
                                            transition: 'all 0.2s',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                background: '#e3f2fd',
                                                transform: 'translateY(-1px)',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                            },
                                            '& td': {
                                                padding: '12px 16px',
                                                borderBottom: '1px solid #e0e0e0',
                                                fontSize: '0.875rem'
                                            }
                                        }}
                                    >
                                        <TableCell sx={{ maxWidth: '400px' }}>
                                            <Typography
                                                noWrap
                                                sx={{
                                                    color: '#424242',
                                                    fontSize: '0.875rem',
                                                    lineHeight: 1.4
                                                }}
                                            >
                                                {post.content.substring(0, 50)}...
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Avatar
                                                    src={post.user.profilePicture}
                                                    alt={post.user.username}
                                                    sx={{
                                                        width: 28,
                                                        height: 28,
                                                        border: '1px solid #e3f2fd'
                                                    }}
                                                />
                                                <span className="font-medium text-gray-700 text-sm">{post.user.username}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ color: '#666', fontSize: '0.875rem' }}>
                                                {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<Visibility sx={{ fontSize: '1rem' }} />}
                                                onClick={() => handleViewPost(post)}
                                                sx={{
                                                    borderRadius: 1.5,
                                                    textTransform: 'none',
                                                    borderColor: '#1976d2',
                                                    color: '#1976d2',
                                                    fontSize: '0.75rem',
                                                    py: 0.5,
                                                    px: 1.5,
                                                    minWidth: '80px',
                                                    '&:hover': {
                                                        borderColor: '#1565c0',
                                                        backgroundColor: 'rgba(25,118,210,0.04)'
                                                    }
                                                }}
                                            >
                                                Xem
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Box
                            display="flex"
                            justifyContent="center"
                            mt={2}
                            mb={1.5}
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    fontSize: '0.875rem',
                                    '&.Mui-selected': {
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#1565c0',
                                        }
                                    }
                                }
                            }}
                        >
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(_, value) => setPage(value)}
                                color="primary"
                                size="small"
                            />
                        </Box>
                    </TableContainer>
                )}
            </CardContent>

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                        color: 'white',
                        fontWeight: 600,
                        letterSpacing: 0.5,
                        padding: '16px 20px',
                        fontSize: '1.1rem'
                    }}
                >
                    Chi tiết bài viết
                </DialogTitle>
                <DialogContent sx={{ p: 3, background: '#f8fafc' }}>
                    {selectedPost && (
                        <Grid container spacing={2} direction="column">
                            <Grid item xs={12}>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight="bold"
                                    color="primary"
                                    sx={{ mb: 0.5 }}
                                >
                                    Nội dung
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        mb: 2,
                                        color: '#424242',
                                        lineHeight: 1.5,
                                        backgroundColor: 'white',
                                        padding: 1.5,
                                        borderRadius: 1,
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    {selectedPost.content}
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Typography
                                    variant="subtitle2"
                                    fontWeight="bold"
                                    color="primary"
                                    sx={{ mb: 0.5 }}
                                >
                                    Người đăng
                                </Typography>
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    sx={{
                                        backgroundColor: 'white',
                                        padding: 1.5,
                                        borderRadius: 1,
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <Avatar
                                        src={selectedPost.user.profilePicture}
                                        alt={selectedPost.user.username}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            mr: 1.5,
                                            border: '1px solid #e3f2fd'
                                        }}
                                    />
                                    <Typography variant="body2" fontWeight={600} color="#424242">
                                        {selectedPost.user.username}
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight="bold"
                                    color="primary"
                                    sx={{ mt: 2, mb: 0.5 }}
                                >
                                    Ngày đăng
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        mb: 2,
                                        color: '#666',
                                        backgroundColor: 'white',
                                        padding: 1.5,
                                        borderRadius: 1,
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    {new Date(selectedPost.createdAt).toLocaleString('vi-VN', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                    })}
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Typography
                                    variant="subtitle2"
                                    fontWeight="bold"
                                    color="primary"
                                    sx={{ mb: 0.5 }}
                                >
                                    Trạng thái
                                </Typography>
                                <Box
                                    sx={{
                                        backgroundColor: 'white',
                                        padding: 1.5,
                                        borderRadius: 1,
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <Typography variant="body2" color="#424242">
                                        Bài viết công khai: <b style={{ color: selectedPost.isPublicPost ? '#2e7d32' : '#d32f2f' }}>
                                            {selectedPost.isPublicPost ? "Có" : "Không"}
                                        </b>
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                {selectedPost.mediaUrls && selectedPost.mediaUrls.length > 0 && (
                                    <Box>
                                        <Typography
                                            variant="subtitle2"
                                            fontWeight="bold"
                                            color="primary"
                                            mb={1.5}
                                        >
                                            Media
                                        </Typography>
                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedPost.mediaUrls.map((url, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        borderRadius: 1.5,
                                                        overflow: 'hidden',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                                                        transition: 'transform 0.2s',
                                                        '&:hover': {
                                                            transform: 'scale(1.02)'
                                                        }
                                                    }}
                                                >
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}${url}`}
                                                        alt={`Media ${index + 1}`}
                                                        width={300}
                                                        height={300}
                                                        style={{
                                                            objectFit: 'cover',
                                                            width: '100%',
                                                            height: 'auto'
                                                        }}
                                                    />
                                                </Box>
                                            ))}
                                        </div>
                                    </Box>
                                )}
                                <Divider sx={{ my: 2 }} />
                                <Box
                                    textAlign="center"
                                    sx={{
                                        backgroundColor: 'white',
                                        padding: 2,
                                        borderRadius: 1.5,
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        fontWeight="bold"
                                        color="primary"
                                        mb={1.5}
                                    >
                                        Thống kê
                                    </Typography>
                                    <Box
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                        gap={3}
                                    >
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            gap={0.75}
                                            sx={{
                                                padding: '6px 12px',
                                                borderRadius: 1.5,
                                                backgroundColor: '#e3f2fd',
                                                color: '#1976d2'
                                            }}
                                        >
                                            <ThumbUp sx={{ fontSize: '1rem' }} />
                                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedPost.numberLike}</span>
                                        </Box>
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            gap={0.75}
                                            sx={{
                                                padding: '6px 12px',
                                                borderRadius: 1.5,
                                                backgroundColor: '#e8f5e9',
                                                color: '#2e7d32'
                                            }}
                                        >
                                            <Comment sx={{ fontSize: '1rem' }} />
                                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedPost.numberComment}</span>
                                        </Box>
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            gap={0.75}
                                            sx={{
                                                padding: '6px 12px',
                                                borderRadius: 1.5,
                                                backgroundColor: '#fff3e0',
                                                color: '#f57c00'
                                            }}
                                        >
                                            <Share sx={{ fontSize: '1rem' }} />
                                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedPost.numberShare}</span>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions
                    sx={{
                        background: '#f0f4fa',
                        padding: '12px 20px',
                        borderTop: '1px solid #e0e0e0'
                    }}
                >
                    <Button
                        onClick={handleCloseDialog}
                        color="primary"
                        variant="contained"
                        sx={{
                            borderRadius: 1.5,
                            px: 3,
                            py: 0.75,
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            boxShadow: '0 1px 3px rgba(25,118,210,0.2)',
                            '&:hover': {
                                backgroundColor: '#1565c0',
                            }
                        }}
                    >
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default Posts; 