import axios from "axios";
import { getAuthHeaders } from "@/utils/api";

interface PostInteractionResponse {
  success: boolean;
  data: any;
  message?: string;
}

class PostInteractionService {
  private static instance: PostInteractionService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SERVER || "";
  }

  public static getInstance(): PostInteractionService {
    if (!PostInteractionService.instance) {
      PostInteractionService.instance = new PostInteractionService();
    }
    return PostInteractionService.instance;
  }

  // Like/Unlike a post
  async toggleLike(
    postId: string,
    userId: string
  ): Promise<PostInteractionResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/like/post`,
        { postId, userId },
        getAuthHeaders()
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error toggling like:", error);
      return {
        success: false,
        data: null,
        message: "Failed to toggle like",
      };
    }
  }

  // Create a share (bookmark)
  async createShare(
    postId: string,
    userId: string
  ): Promise<PostInteractionResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/share/create`,
        { postId, userId },
        getAuthHeaders()
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating share:", error);
      return {
        success: false,
        data: null,
        message: "Failed to create share",
      };
    }
  }

  // Delete a share (bookmark)
  async deleteShare(shareId: string): Promise<PostInteractionResponse> {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/share/delete/${shareId}`,
        getAuthHeaders()
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error deleting share:", error);
      return {
        success: false,
        data: null,
        message: "Failed to delete share",
      };
    }
  }

  // Check if user has shared a post
  async getUserShares(userId: string): Promise<PostInteractionResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/share/user/${userId}`,
        getAuthHeaders()
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error checking user shares:", error);
      return {
        success: false,
        data: null,
        message: "Failed to check user shares",
      };
    }
  }

  // Get likes for a post
  async getLikes(postId: string): Promise<PostInteractionResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/post/like-all/${postId}`,
        getAuthHeaders()
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error getting likes:", error);
      return {
        success: false,
        data: null,
        message: "Failed to get likes",
      };
    }
  }

  // Get saves for a post
  async getSaves(postId: string): Promise<PostInteractionResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/post/save-all/${postId}`,
        getAuthHeaders()
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error getting saves:", error);
      return {
        success: false,
        data: null,
        message: "Failed to get saves",
      };
    }
  }

  // Get shares for a post
  async getShares(postId: string): Promise<PostInteractionResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/post/share-all/${postId}`,
        getAuthHeaders()
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error getting shares:", error);
      return {
        success: false,
        data: null,
        message: "Failed to get shares",
      };
    }
  }
}

export default PostInteractionService;
