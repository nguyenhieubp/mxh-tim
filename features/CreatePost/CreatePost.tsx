import { Box, Modal, Typography, TextField, Switch, FormControlLabel } from "@mui/material";
import { LockOpen, Lock } from "@mui/icons-material";
import React, { useState } from "react";
import ImageUploader from "./components/ImageUploader";
import ActionButtons from "./components/ActionButtons";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/redux/configs/hooks";
import { createPost } from "@/redux/features/post";
import AlertSnackbar from "@/components/common/AlertSnackbar";

interface CreatePostProps {
  setShowCreatePost: (value: boolean) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ setShowCreatePost }) => {
  const dispath = useAppDispatch();
  const { t } = useTranslation();
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const userId = useAppSelector((state) => state.auth.user?.userId ?? undefined);
  const [isPublicPost, setIsPublicPost] = useState(true);
  const [isPublicComment, setIsPublicComment] = useState(true);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handleClose = () => {
    setShowCreatePost(false);
  };

  const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setImages((prevImages) => [...prevImages, ...files]);
      const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setPreviewUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!userId) return;

    try {
      await dispath(createPost({
        user: userId,
        content: caption,
        isPublicPost,
        isPublicComment,
        files: images,
      })).unwrap();

      setAlert({
        open: true,
        message: t("createPost.successMessage"),
        severity: "success",
      });

      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      setAlert({
        open: true,
        message: t("createPost.errorMessage"),
        severity: "error",
      });
    }
  };

  return (
    <>
      <AlertSnackbar
        open={alert.open}
        onClose={handleCloseAlert}
        message={alert.message}
        severity={alert.severity}
      />
      <Modal
        open={true}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        className="flex items-center justify-center"
      >
        <Box
          className="w-full max-w-2xl bg-white rounded-xl shadow-2xl transform transition-all"
          sx={{
            position: "relative",
            mx: 2,
            p: { xs: 2, sm: 4 },
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6"
          >
            {t("createPost.title")}
          </Typography>

          <ImageUploader
            previewUrls={previewUrls}
            onImageChange={handleImageChange}
            onRemoveImage={handleRemoveImage}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder={t("createPost.captionPlaceholder")}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="mb-6"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '1rem',
                backgroundColor: '#f8fafc',
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                },
                '& fieldset': {
                  borderColor: '#e2e8f0',
                },
                '&:hover fieldset': {
                  borderColor: '#94a3b8',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3b82f6',
                },
              },
            }}
          />

          <div className="flex flex-col gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
            <FormControlLabel
              control={
                <Switch
                  checked={isPublicPost}
                  onChange={(e) => setIsPublicPost(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <div className="flex items-center gap-2">
                  {isPublicPost ? <LockOpen className="text-blue-500" /> : <Lock className="text-gray-500" />}
                  <span className="text-sm">
                    {isPublicPost ? t('createPost.publicPost') : t('createPost.privatePost')}
                  </span>
                </div>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={isPublicComment}
                  onChange={(e) => setIsPublicComment(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <div className="flex items-center gap-2">
                  {isPublicComment ? <LockOpen className="text-blue-500" /> : <Lock className="text-gray-500" />}
                  <span className="text-sm">
                    {isPublicComment ? t('createPost.allowComments') : t('createPost.disableComments')}
                  </span>
                </div>
              }
            />
          </div>
          <ActionButtons
            onClose={handleClose}
            onSubmit={handleSubmit}
            disabled={images.length === 0 || !caption}
          />
        </Box>
      </Modal>
    </>
  );
};
export default CreatePost;
