import { Modal, TextField, Button, Avatar } from "@mui/material";
import { useState } from "react";
import ImageUpload from "../../../components/uploads/ImageUpload";
import { useTranslation } from "react-i18next";
import axios from "axios";
import AlertSnackbar from "../../../components/common/AlertSnackbar";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    userId: string;
    username: string;
    profilePicture: string | null;
    bio: string | null;
  };
  onSave: (updatedUser: any) => void;
}

const EditProfileModal = ({
  open,
  onClose,
  user,
  onSave,
}: EditProfileModalProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: user.username,
    bio: user.bio,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(
    `${process.env.NEXT_PUBLIC_API_URL}${user.profilePicture}` || ""
  );
  // Add snackbar state
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý chọn ảnh
  const handleImageSelect = async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    setSelectedFile(file);
  };

  // Gửi dữ liệu lên server
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("username", formData.username);
    formDataToSend.append("bio", formData.bio || "");

    if (selectedFile) {
      formDataToSend.append("profilePicture", selectedFile);
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER}/user/update/profile/${user.userId}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      onSave(response.data.data);
      setShowSnackbar(true);
      setIsLoading(false);
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="bg-white p-6 rounded-lg w-[400px] max-w-[90vw]">
          <h2 className="text-2xl font-bold mb-6">{t("profile.editProfile")}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-4 mb-6">
              <Avatar
                src={previewImage}
                alt={formData.username}
                sx={{ width: 60, height: 60 }}
              />
              <ImageUpload onImageSelect={handleImageSelect} />
            </div>

            <TextField
              fullWidth
              label={t("profile.username")}
              name="username"
              value={formData.username}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label={t("profile.bio")}
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              multiline
              rows={3}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                onClick={onClose}
                color="inherit"
                disabled={isLoading}
              >
                {t("settings.cancel")}
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading}
              >
                {isLoading ? t("common.saving") : t("settings.save")}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
      <AlertSnackbar
        open={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        message={t("profile.updateSuccess")}
        severity="success"
      />
    </>
  );
};

export default EditProfileModal;
