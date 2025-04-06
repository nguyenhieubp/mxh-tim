import { IPost } from "@/redux/features/post";
import { MoreVert, ReportProblem } from "@mui/icons-material";
import { 
  Avatar, 
  CardHeader, 
  IconButton, 
  Menu, 
  MenuItem, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Typography
} from "@mui/material";
import React, { useState } from "react";
import moment from "moment";
import { useRouter } from "next/navigation";
import AlertSnackbar from "@/components/common/AlertSnackbar";
import { useAppSelector } from "@/redux/configs/hooks";

const InfoUser = ({ post }: { post: IPost }) => {
  const router = useRouter();
  const userCurrent = useAppSelector((state) => state.auth.user);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  const handleAvatarClick = () => {
    router.push(`/profile/${post.user.userId}`);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleReportClick = () => {
    handleMenuClose();
    setOpenReportDialog(true);
  };

  const handleReportClose = () => {
    setOpenReportDialog(false);
    setReason('');
    setDescription('');
  };

  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  const handleReportSubmit = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/post/${post?.postId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userCurrent?.userId,
          reason,
          description
        }),
      });

      const result = await response.json();
      if (result.status === 201) {
        handleReportClose();
        setAlert({
          open: true,
          message: 'Báo cáo bài viết thành công',
          severity: 'success'
        });
      } else {
        setAlert({
          open: true,
          message: result.message || 'Có lỗi xảy ra khi báo cáo',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error reporting post:', error);
      setAlert({
        open: true,
        message: 'Có lỗi xảy ra khi báo cáo',
        severity: 'error'
      });
    }
  };

  return (
    <>
      <CardHeader
        avatar={
          <Avatar
            alt="User Avatar"
            src={`${process.env.NEXT_PUBLIC_API_URL}${post?.user?.profilePicture}`}
            onClick={handleAvatarClick}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          />
        }
        action={
          <IconButton onClick={handleMenuClick}>
            <MoreVert />
          </IconButton>
        }
        title={post.user.username}
        subheader={moment(post.createdAt).fromNow()}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleReportClick}>
          <ReportProblem className="mr-2" />
          Báo cáo bài viết
        </MenuItem>
      </Menu>

      <Dialog 
        open={openReportDialog} 
        onClose={handleReportClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="flex items-center">
          <ReportProblem className="mr-2 text-red-500" />
          Báo cáo bài viết
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <FormControl fullWidth>
              <InputLabel>Lý do báo cáo</InputLabel>
              <Select
                value={reason}
                label="Lý do báo cáo"
                onChange={(e) => setReason(e.target.value)}
              >
                <MenuItem value="SPAM">Spam</MenuItem>
                <MenuItem value="INAPPROPRIATE">Nội dung không phù hợp</MenuItem>
                <MenuItem value="HARASSMENT">Quấy rối</MenuItem>
                <MenuItem value="VIOLENCE">Bạo lực</MenuItem>
                <MenuItem value="OTHER">Khác</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Mô tả chi tiết"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReportClose}>Hủy</Button>
          <Button 
            onClick={handleReportSubmit}
            variant="contained"
            color="error"
            disabled={!reason || !description}
          >
            Gửi báo cáo
          </Button>
        </DialogActions>
      </Dialog>

      <AlertSnackbar
        open={alert.open}
        onClose={handleAlertClose}
        message={alert.message}
        severity={alert.severity}
      />
    </>
  );
};

export default InfoUser;
