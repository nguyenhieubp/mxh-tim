"use client";

import ShowItemPost from "./components/ShowItemPost";
import PostGrid from "./components/PostGrid";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { IPost } from "@/redux/features/post";

const Explore = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<boolean>(false);
  const [currentPostIndex, setCurrentPostIndex] = useState<number | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [size] = useState(3);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPost = async (page: number, size: number) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER}/post/all?page=${page}&size=${size}`
      );
      const newPosts = response.data.data.content;

      if (newPosts.length < size) {
        setHasMore(false);
      }

      setPosts((prevPosts) => {
        const existingPostIds = new Set(prevPosts.map(post => post.postId));
        
        const uniqueNewPosts = newPosts.filter((post: IPost) => !existingPostIds.has(post.postId));
        
        return [...prevPosts, ...uniqueNewPosts];
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPost(page, size);
  }, [page, size]);

  const handleShowPost = (index: number) => {
    setCurrentPostIndex(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentPostIndex(null);
  };

  const handleNext = () => {
    if (currentPostIndex !== null && currentPostIndex < posts.length - 1) {
      setCurrentPostIndex(currentPostIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentPostIndex !== null && currentPostIndex > 0) {
      setCurrentPostIndex(currentPostIndex - 1);
    }
  };

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, isLoading]
  );

  const filteredPosts = posts.filter((post) =>
    post.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="p-4">
        <div>
          <PostGrid posts={filteredPosts} onPostClick={handleShowPost} />
        </div>
        {hasMore && (
          <div ref={lastPostRef} className="text-center p-4">
            {isLoading ? (
              <span>Loading more posts...</span>
            ) : (
              <span>Scroll for more...</span>
            )}
          </div>
        )}
      </div>
      <ShowItemPost
        open={open}
        onClose={handleClose}
        currentPostIndex={currentPostIndex}
        posts={posts}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
};

export default Explore;