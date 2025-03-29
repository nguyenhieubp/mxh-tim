import { Favorite, MoreVert } from '@mui/icons-material'
import { Avatar, CardHeader, IconButton } from '@mui/material'
import React from 'react'

// Component Reply riêng biệt
const ItemUserReply = () => {
    return (
        <div className='flex px-4 py-2 group hover:bg-gray-50'>
            <div className='flex flex-1 gap-3'>
                <Avatar
                    alt="User Avatar"
                    src="https://via.placeholder.com/150"
                    sx={{ width: 24, height: 24 }}
                />
                <div className='flex flex-col'>
                    <div className='flex gap-2 items-center'>
                        <span className='font-semibold text-sm'>Reply User</span>
                        <span className='text-gray-500 text-xs'>2 hours ago</span>
                    </div>
                    <p className='text-sm'>This is a reply comment!</p>
                    <div className='flex gap-4 mt-1'>
                        <button className='text-xs text-gray-500 hover:text-gray-700'>Reply</button>
                        <button className='text-xs text-gray-500 hover:text-gray-700'>5 likes</button>
                    </div>
                </div>
            </div>
            <div className='flex items-start'>
                <IconButton
                    size="small"
                    className='opacity-0 group-hover:opacity-100'
                >
                    <Favorite sx={{ fontSize: 14 }} />
                </IconButton>
                <IconButton
                    size="small"
                    className='opacity-0 group-hover:opacity-100'
                >
                    <MoreVert sx={{ fontSize: 14 }} />
                </IconButton>
            </div>
        </div>
    )
}

const ItemUserComment = () => {
    const [showReplies, setShowReplies] = React.useState(false)

    return (
        <div className='flex flex-col'>
            <div className='flex px-4 py-2 group hover:bg-gray-50'>
                <div className='flex flex-1 gap-3'>
                    <Avatar
                        alt="User Avatar"
                        src="https://via.placeholder.com/150"
                        sx={{ width: 32, height: 32 }}
                    />
                    <div className='flex flex-col'>
                        <div className='flex gap-2 items-center'>
                            <span className='font-semibold text-sm'>John Doe</span>
                            <span className='text-gray-500 text-xs'>5 hours ago</span>
                        </div>
                        <p className='text-sm'>This is a comment text. It can be multiple lines and will look good!</p>
                        <div className='flex gap-4 mt-1'>
                            <button className='text-xs text-gray-500 hover:text-gray-700'>Reply</button>
                            <button className='text-xs text-gray-500 hover:text-gray-700'>999 likes</button>
                            <button 
                                className='text-xs text-gray-500 hover:text-gray-700'
                                onClick={() => setShowReplies(!showReplies)}
                            >
                                {showReplies ? 'Hide replies' : 'Show replies'} (100)
                            </button>
                        </div>
                        <div className='flex items-center gap-2'>
                            <div className='w-[5rem] h-[1px] bg-black'></div>
                            <div className='text-xs text-gray-500 cursor-pointer'>100 comments</div>
                        </div>
                    </div>
                </div>
                <div className='flex items-start'>
                    <IconButton
                        size="small"
                        className='opacity-0 group-hover:opacity-100'
                    >
                        <Favorite sx={{ fontSize: 14 }} />
                    </IconButton>
                    <IconButton
                        size="small"
                        className='opacity-0 group-hover:opacity-100'
                    >
                        <MoreVert sx={{ fontSize: 14 }} />
                    </IconButton>
                </div>
            </div>
            
            {showReplies && (
                <div className='ml-14'>
                    <ItemUserReply />
                    <ItemUserReply />
                    <ItemUserReply />
                </div>
            )}
        </div>
    )
}

export default ItemUserComment