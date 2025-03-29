import { IconButton } from "@mui/material";
import { BookmarkBorder, ChatBubbleOutline, FavoriteBorder, Send } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const CommentActions = () => {
    const { t } = useTranslation();
    return (
        <div className='px-4 pb-2'>
            <div className='flex justify-between py-2'>
                <div className='flex gap-2'>
                    <IconButton><FavoriteBorder /></IconButton>
                    <IconButton><ChatBubbleOutline /></IconButton>
                    <IconButton><Send /></IconButton>
                </div>
                <IconButton><BookmarkBorder /></IconButton>
            </div>

            <div className='font-semibold mb-2'>45,384 likes</div>
            <div className='text-gray-500 text-xs uppercase mb-2'>3 hours ago</div>

            <div className='flex items-center border-t pt-3'>
                <button className='p-2'>
                    <span className='text-2xl'>☺</span>
                </button>
                <input
                    type="text"
                    placeholder="Add a comment..."
                    className='flex-1 outline-none text-sm'
                />
                <button
                    className='text-blue-500 font-semibold text-sm opacity-50 hover:opacity-100 disabled:opacity-50'
                    disabled={true}
                >
                    {t('post.post')}
                </button>
            </div>
        </div>
    );
}

export default CommentActions; 