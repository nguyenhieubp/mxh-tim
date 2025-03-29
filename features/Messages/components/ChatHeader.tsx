import { Avatar } from "@mui/material";
import { IoCallOutline, IoVideocamOutline } from "react-icons/io5";
import { IoIosArrowBack } from "react-icons/io";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export interface IUser {
  id: number;
  username: string;
  profilePicture: string;
}

interface ChatHeaderProps {
  user: IUser;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ user }) => {
  const { t } = useTranslation();
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);

  const handleStartVideoCall = () => {
    setIsVideoCallOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <IoIosArrowBack className="text-2xl cursor-pointer" />
          <Avatar
            src={user.profilePicture}
            alt={user.username}
            sx={{ width: 40, height: 40 }}
          />
          <h2 className="text-lg font-bold">{user.username}</h2>
        </div>
        <div className="flex items-center gap-3">
          <IoCallOutline
            className="text-2xl cursor-pointer hover:text-gray-600"
            title={t("messages.call")}
          />
          <IoVideocamOutline
            className="text-2xl cursor-pointer hover:text-gray-600"
            title={t("messages.videoCall")}
            onClick={handleStartVideoCall}
          />
        </div>
      </div>
    </>
  );
};

export default ChatHeader;
