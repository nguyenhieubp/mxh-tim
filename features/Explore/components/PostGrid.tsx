import { IPost } from "@/redux/features/post";
import { useTranslation } from "react-i18next";

interface PostGridProps {
  posts: IPost[];
  onPostClick: (index: number) => void;
}

const PostGrid: React.FC<PostGridProps> = ({ posts, onPostClick }) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-5xl mx-auto px-2 md:px-6">
      {posts.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 md:gap-6 auto-rows-auto">
          {/* Big featured post (span 2x2) */}
          {posts.length >= 5 && (
            <>
              <div
                onClick={() => onPostClick(0)}
                key={posts[0].postId}
                className="col-span-2 row-span-2 aspect-square relative cursor-pointer"
              >
                <div className="w-full h-full p-0.5 md:p-1">
                  <img
                    src={
                      `${process.env.NEXT_PUBLIC_API_URL}${posts[0].mediaUrls?.[0]}` ||
                      "/default-post-image.jpg"
                    }
                    alt={`post ${posts[0].postId}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 hover:opacity-20 transition-opacity duration-200"></div>
                </div>
              </div>

              {/* Regular sized posts to complete first pattern */}
              {posts.slice(1, 5).map((post, index) => (
                <div
                  onClick={() => onPostClick(index + 1)}
                  key={post.postId}
                  className="aspect-square relative cursor-pointer"
                >
                  <div className="w-full h-full p-0.5 md:p-1">
                    <img
                      src={
                        `${process.env.NEXT_PUBLIC_API_URL}${post.mediaUrls?.[0]}` ||
                        "/default-post-image.jpg"
                      }
                      alt={`post ${post.postId}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 hover:opacity-20 transition-opacity duration-200"></div>
                  </div>
                </div>
              ))}

              {/* Remaining posts in standard grid */}
              {posts.slice(5).map((post, index) => (
                <div
                  onClick={() => onPostClick(index + 5)}
                  key={post.postId}
                  className="aspect-square relative cursor-pointer"
                >
                  <div className="w-full h-full p-0.5 md:p-1">
                    <img
                      src={
                        `${process.env.NEXT_PUBLIC_API_URL}${post.mediaUrls?.[0]}` ||
                        "/default-post-image.jpg"
                      }
                      alt={`post ${post.postId}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 hover:opacity-20 transition-opacity duration-200"></div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* If less than 5 posts, render regular grid */}
          {posts.length < 5 &&
            posts.map((post, index) => (
              <div
                onClick={() => onPostClick(index)}
                key={post.postId}
                className="aspect-square relative cursor-pointer"
              >
                <div className="w-full h-full p-0.5 md:p-1">
                  <img
                    src={
                      `${process.env.NEXT_PUBLIC_API_URL}${post.mediaUrls?.[0]}` ||
                      "/default-post-image.jpg"
                    }
                    alt={`post ${post.postId}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 hover:opacity-20 transition-opacity duration-200"></div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-12">
          {t("explore.noPostsFound")}
        </p>
      )}
    </div>
  );
};

export default PostGrid;
