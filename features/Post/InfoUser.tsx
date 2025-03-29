import { IPost } from "@/redux/features/post";
import { MoreVert } from "@mui/icons-material";
import { Avatar, CardHeader, IconButton } from "@mui/material";
import React from "react";
import moment from "moment";
import { useRouter } from "next/navigation";

const InfoUser = ({ post }: { post: IPost }) => {
  const router = useRouter();

  const handleAvatarClick = () => {
    router.push(`/profile/${post.user.userId}`);
  };

  return (
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
        <IconButton>
          <MoreVert />
        </IconButton>
      }
      title={post.user.username}
      subheader={moment(post.createdAt).fromNow()}
    />
  );
};

export default InfoUser;
