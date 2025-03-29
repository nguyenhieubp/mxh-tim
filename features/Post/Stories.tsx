import { Avatar, Box, Typography } from '@mui/material';
import React from 'react';

interface Story {
    id: number;
    username: string;
    avatar: string;
    hasNewStory: boolean;
}

const Stories = () => {
    const stories: Story[] = [
        { id: 1, username: "john_doe", avatar: "/static/images/avatar/1.jpg", hasNewStory: true },
        { id: 2, username: "jane_smith", avatar: "/static/images/avatar/2.jpg", hasNewStory: true },
        { id: 3, username: "mike_wilson", avatar: "/static/images/avatar/3.jpg", hasNewStory: false },
        { id: 4, username: "sara_parker", avatar: "/static/images/avatar/4.jpg", hasNewStory: true },
        { id: 5, username: "alex_brown", avatar: "/static/images/avatar/5.jpg", hasNewStory: true },
        { id: 6, username: "emma_davis", avatar: "/static/images/avatar/6.jpg", hasNewStory: false },
    ];

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 2,
                overflowX: 'auto',
                p: 2,
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
            }}
        >
            {stories.map((story) => (
                <Box
                    key={story.id}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                    }}
                >
                    <Box
                        sx={{
                            padding: '3px',
                            borderRadius: '50%',
                            background: story.hasNewStory
                                ? 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
                                : 'transparent',
                        }}
                    >
                        <Avatar
                            src={story.avatar}
                            sx={{
                                width: 56,
                                height: 56,
                                border: '2px solid white',
                            }}
                        />
                    </Box>
                    <Typography
                        variant="caption"
                        sx={{
                            mt: 1,
                            maxWidth: '70px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {story.username}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};

export default Stories;