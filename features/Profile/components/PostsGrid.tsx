import { IPost, Like } from "@/redux/features/post/types";
import Image from "next/image";
import { useState, useEffect } from "react";
import PostModal from "@/components/modals/PostModal";
import axios from "axios";
import { getAuthHeaders } from "@/utils/api";
import { useAppSelector } from "@/redux/configs/hooks";

interface PostsGridProps {
  posts: IPost[];
  onPostUpdate?: () => void;
}

const PostsGrid: React.FC<PostsGridProps> = ({ posts, onPostUpdate }) => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postLikes, setPostLikes] = useState<{ [key: string]: Like[] }>({});
  const [savedPosts, setSavedPosts] = useState<{ [key: string]: string }>({});
  const userCurrent = useAppSelector((state) => state.auth.user);

  // Add check saved status function
  const checkSavedStatus = async () => {
    if (!userCurrent?.userId) return;
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER}/share/user/${userCurrent.userId}`,
        getAuthHeaders()
      );
      const shares = response.data.data.content || [];
      const savedMap: { [key: string]: string } = {};

      shares.forEach((share: any) => {
        savedMap[share.post.postId] = share.shareId;
      });

      setSavedPosts(savedMap);
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };

  // Add save post function
  const handleSavePost = async (postId: string) => {
    if (!userCurrent?.userId) return;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER}/share/create`,
        {
          userId: userCurrent.userId,
          postId: postId,
        },
        getAuthHeaders()
      );
      setSavedPosts(prev => ({
        ...prev,
        [postId]: response.data.data.shareId
      }));
      onPostUpdate?.();
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  // Add unsave post function
  const handleUnsavePost = async (postId: string) => {
    const shareId = savedPosts[postId];
    if (!shareId) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER}/share/delete/${shareId}`,
        getAuthHeaders()
      );
      setSavedPosts(prev => {
        const newSaved = { ...prev };
        delete newSaved[postId];
        return newSaved;
      });
      onPostUpdate?.();
    } catch (error) {
      console.error("Error unsaving post:", error);
    }
  };

  useEffect(() => {
    checkSavedStatus();
  }, [userCurrent?.userId]);

  useEffect(() => {
    const fetchLikesForPosts = async () => {
      try {
        if (posts.length === 0) return;

        const likesPromises = posts.map(post =>
          axios.get(`${process.env.NEXT_PUBLIC_SERVER}/post/like-all/${post.postId}`)
        );

        const responses = await Promise.all(likesPromises);
        const likesMap: { [key: string]: Like[] } = {};

        responses.forEach((response, index) => {
          if (response.data && response.data.data) {
            likesMap[posts[index].postId] = response.data.data;
          }
        });

        setPostLikes(likesMap);
      } catch (error) {
        console.error('Error fetching likes:', error);
      }
    };

    fetchLikesForPosts();
  }, [posts]);

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPostId(null);
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-4 mx-auto">
        {posts.map((post) => (
          <div
            key={post.postId}
            className="relative aspect-square group cursor-pointer overflow-hidden"
            onClick={() => handlePostClick(post.postId)}
          >
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10" />
            <div className="w-full h-full relative bg-gray-100">
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}${post.mediaUrls[0]}`}
                alt={`Post by ${post.user?.username || 'user'}`}
                fill
                sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
                className="object-cover hover:scale-105 transition-transform duration-300"
                quality={90}
                loading="eager"
              />
            </div>
          </div>
        ))}
      </div>

      {selectedPostId && (
        <PostModal
          open={isModalOpen}
          onClose={handleCloseModal}
          postId={selectedPostId}
          likes={postLikes[selectedPostId] || []}
          isShared={Boolean(savedPosts[selectedPostId])}
          shareId={savedPosts[selectedPostId]}
          onShareChange={(isShared, shareId) => {
            if (isShared) {
              setSavedPosts(prev => ({
                ...prev,
                [selectedPostId]: shareId!
              }));
            } else {
              setSavedPosts(prev => {
                const newSaved = { ...prev };
                delete newSaved[selectedPostId];
                return newSaved;
              });
            }
            onPostUpdate?.();
          }}
        />
      )}
    </>
  );
};

export default PostsGrid;