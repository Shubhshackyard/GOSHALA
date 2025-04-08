import api from './api';

export interface ForumCategory {
  id: string;
  nameKey: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  category: string;
  tags: string[];
  likes: string[];
  views: number;
  createdAt: string;
  updatedAt: string;
  commentCount?: number;
  isSticky: boolean;
  isAnnouncement: boolean;
}

export interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  post: string;
  parentComment?: string;
  likes: string[];
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export interface PostDetail extends Post {
  comments: Comment[];
}

export interface PaginatedPosts {
  stickyPosts: Post[];
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PostInput {
  title: Record<string, string>;
  content: Record<string, string>;
  category: string;
  tags?: string[];
  isSticky?: boolean;
  isAnnouncement?: boolean;
  status?: 'published' | 'draft';
}

export interface CommentInput {
  content: Record<string, string>;
  parentComment?: string;
}

const forumService = {
  // Get categories
  getCategories: async (): Promise<ForumCategory[]> => {
    try {
      const response = await api.get('/forum/categories');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return mock data as fallback during development
      return [
        { id: 'general', nameKey: 'categories.general' },
        { id: 'organicFarming', nameKey: 'categories.organicFarming' },
        { id: 'cowCare', nameKey: 'categories.cowCare' },
        { id: 'productInfo', nameKey: 'categories.productInfo' },
        { id: 'marketTrends', nameKey: 'categories.marketTrends' }
      ];
    }
  },
  
  // Get paginated posts
  getPosts: async (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    category?: string;
    search?: string;
    tag?: string;
  }): Promise<PaginatedPosts> => {
    try {
      const response = await api.get('/forum/posts', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Return mock data as fallback during development
      return {
        stickyPosts: [],
        posts: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        }
      };
    }
  },
  
  // Get single post with comments
  getPost: async (id: string): Promise<PostDetail> => {
    const response = await api.get(`/forum/posts/${id}`);
    return response.data.data;
  },
  
  // Create post
  createPost: async (postData: PostInput): Promise<Post> => {
    const response = await api.post('/forum/posts', postData);
    return response.data.data;
  },
  
  // Update post
  updatePost: async (id: string, postData: PostInput): Promise<Post> => {
    const response = await api.put(`/forum/posts/${id}`, postData);
    return response.data.data;
  },
  
  // Delete post
  deletePost: async (id: string): Promise<void> => {
    await api.delete(`/forum/posts/${id}`);
  },
  
  // Create comment
  createComment: async (postId: string, commentData: CommentInput): Promise<Comment> => {
    const response = await api.post(`/forum/posts/${postId}/comments`, commentData);
    return response.data.data;
  },
  
  // Update comment
  updateComment: async (id: string, commentData: Omit<CommentInput, 'parentComment'>): Promise<Comment> => {
    const response = await api.put(`/forum/comments/${id}`, commentData);
    return response.data.data;
  },
  
  // Delete comment
  deleteComment: async (id: string): Promise<void> => {
    await api.delete(`/forum/comments/${id}`);
  },
  
  // Like/unlike post
  togglePostLike: async (id: string): Promise<void> => {
    await api.post(`/forum/posts/${id}/like`);
  },
  
  // Like/unlike comment
  toggleCommentLike: async (id: string): Promise<void> => {
    await api.post(`/forum/comments/${id}/like`);
  }
};

export default forumService;