import { BookmarkBorder, ChatBubbleOutline, FavoriteBorder, Send } from "@mui/icons-material";
import { IconButton } from "@mui/material";

interface PostActionsProps {
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
}

const PostActions: React.FC<PostActionsProps> = () => {
  return (
    <div className='flex justify-between py-2'>
      <div className='flex gap-2'>
        <IconButton>
          <FavoriteBorder />
        </IconButton>
        <IconButton>
          <ChatBubbleOutline />
        </IconButton>
        <IconButton>
          <Send />
        </IconButton>
      </div>
      <IconButton>
        <BookmarkBorder />
      </IconButton>
    </div>
  );
};

export default PostActions; 