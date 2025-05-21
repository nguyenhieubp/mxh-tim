"use client";

import Post from "./Post";
import SideBar from "../SideBar/SideBar";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {  IPost } from "@/redux/features/post";
import axios from "axios";

export default function ListPost() {
  const [localPosts, setLocalPosts] = useState<IPost[]>([]);
  const [page, setPage] = useState(1);
  const [size] = useState(3);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchPost = async (page: number, size: number) => {
    try {
      if (isLoading) return; // Prevent multiple simultaneous requests
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER}/post/all?page=${page}&size=${size}`
      );
      const { content, totalElements: total } = response.data.data;
      
      setTotalElements(total);
      setHasMore(localPosts.length + content.length < total);

      setLocalPosts((prevPosts) => {
        // Create a Set of existing post IDs for quick lookup
        const existingPostIds = new Set(prevPosts.map(post => post.postId));
        
        // Filter out any posts that already exist
        const uniqueNewPosts = content.filter((post: IPost) => !existingPostIds.has(post.postId));
        
        // Append only the new unique posts
        return [...prevPosts, ...uniqueNewPosts];
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return; // Don't observe if we're already loading
      
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          if (localPosts.length < totalElements) {
            setPage((prev) => prev + 1);
          } else {
            setHasMore(false);
          }
        }
      }, {
        threshold: 0.5,
        rootMargin: '100px'
      });
      
      if (node) observer.current.observe(node);
    },
    [hasMore, isLoading, localPosts.length, totalElements]
  );

  useEffect(() => {
    fetchPost(page, size);
  }, [page]);

  return (
    <main className="flex h-screen w-full">
      <SideBar>
        <div className="max-w-[800px] mx-auto">
          {localPosts.map((post: IPost) => (
            <div key={post.postId}>
              <Post post={post} />
              {post === localPosts[localPosts.length - 1] && (
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