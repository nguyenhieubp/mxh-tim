"use client";

import { useAppDispatch, useAppSelector } from "@/redux/configs/hooks";
import Post from "./Post";
import SideBar from "../SideBar/SideBar";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { fetchPosts, IPost } from "@/redux/features/post";
import axios from "axios";

export default function ListPost() {
  const dispatch = useAppDispatch();
  const posts = useAppSelector((state) => state.posts.posts);
  const [localPosts, setLocalPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [size] = useState(3);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

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

      setLocalPosts((prevPosts) => {
        const startIndex = (page - 1) * size;
        const updatedPosts = [...prevPosts];

        newPosts.forEach((post: any, index: number) => {
          updatedPosts[startIndex + index] = post;
        });

        return updatedPosts;
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
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

  useEffect(() => {
    fetchPost(page, size);
  }, [page]);

  return (
    <main className="flex h-screen w-full">
      <SideBar>
        <div className="max-w-[800px] mx-auto">
          {localPosts.map((post: IPost, index: number) => (
            <div key={post.postId}>
              <Post post={post} />
              {index === localPosts.length - 1 && (
                <div ref={lastPostRef} className="text-center p-4">
                  {isLoading ? (
                    <span>Loading more posts...</span>
                  ) : (
                    hasMore && <span>Scroll for more...</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </SideBar>
    </main>
  );
}