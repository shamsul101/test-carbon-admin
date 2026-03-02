import { create } from "zustand";

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image?: string;
  image_url?: string;
  link?: string;
  author: string;
  category: string;
  sub_category: string;
  date: string;
  is_active: boolean;
}

export interface CreateBlogPost {
  title: string;
  excerpt: string;
  image?: File | null;
  link?: string;
  author: string;
  category: string;
  sub_category: string;
  date: string;
}

export interface UpdateBlogPost extends Partial<Omit<CreateBlogPost, "image">> {
  id: number;
  image?: File | null;
}

interface BlogStore {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  createPost: (
    post: CreateBlogPost,
    accessToken?: string | null
  ) => Promise<void>;
  updatePost: (
    post: UpdateBlogPost,
    accessToken?: string | null
  ) => Promise<void>;
  updatePostStatus: (
    id: number,
    isActive: boolean,
    accessToken: string
  ) => Promise<void>;
  deletePost: (id: number, accessToken?: string | null) => Promise<void>;
  getPostById: (id: number) => BlogPost | undefined;
  getImageUrl: (post: BlogPost) => string | null;
}

export const useBlogStore = create<BlogStore>((set, get) => ({
  posts: [],
  loading: false,
  error: null,

  fetchPosts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/articles/posts/`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const posts: BlogPost[] = await response.json();
      set({ posts, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        loading: false,
      });
    }
  },

  createPost: async (post: CreateBlogPost, accessToken?: string | null) => {
    set({ loading: true, error: null });
    try {
      // FormData
      const formData = new FormData();

      // text fields
      formData.append("title", post.title?.trim() || "");
      formData.append("excerpt", post.excerpt?.trim() || "");
      formData.append("author", post.author?.trim() || "");
      formData.append("category", post.category?.trim() || "Blog");
      formData.append(
        "sub_category",
        post.sub_category?.trim() || "Educational"
      );
      formData.append(
        "date",
        post.date || new Date().toISOString().split("T")[0]
      );
      formData.append("link", post.link?.trim() || "");

      // image file if provided
      if (post.image && post.image instanceof File) {
        formData.append("image", post.image);
      }

      // Validate required fields
      if (!post.title?.trim()) {
        throw new Error("Title is required");
      }
      if (!post.excerpt?.trim()) {
        throw new Error("Content is required");
      }
      // if (!post.author?.trim()) {
      //   throw new Error("Author is required");
      // }

      const headers: HeadersInit = {};

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      console.log("Creating post with FormData");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/articles/posts/`,
        {
          method: "POST",
          headers,
          body: formData,
          redirect: "follow",
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to create post";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        console.error("Create post error:", errorMessage);
        throw new Error(errorMessage);
      }

      const newPost: BlogPost = await response.json();
      console.log("Post created successfully:", newPost);
      set((state) => ({
        posts: [newPost, ...state.posts],
        loading: false,
      }));
    } catch (error) {
      console.error("Create post error:", error);
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        loading: false,
      });
      throw error;
    }
  },

  updatePost: async (post: UpdateBlogPost, accessToken?: string | null) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();

      if (post.title) formData.append("title", post.title.trim());
      if (post.excerpt) formData.append("excerpt", post.excerpt.trim());
      if (post.author && post.author.trim() !== "") {
        formData.append("author", post.author.trim());
      }
      if (post.category) formData.append("category", post.category.trim());
      if (post.sub_category)
        formData.append("sub_category", post.sub_category.trim());
      if (post.date) formData.append("date", post.date);
      if (post.link) formData.append("link", post.link.trim());

      if (post.image && post.image instanceof File) {
        formData.append("image", post.image);
      }

      // Debug log
      for (const [key, value] of formData.entries()) {
        console.log("FORMDATA =>", key, value);
      }

      const headers: HeadersInit = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/articles/posts/${post.id}`,
        {
          method: "PATCH",
          headers,
          body: formData,
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to update post");
      }

      const updatedPost: BlogPost = await response.json();
      set((state) => ({
        posts: state.posts.map((p) => (p.id === post.id ? updatedPost : p)),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        loading: false,
      });
      throw error;
    }
  },

  updatePostStatus: async (
    id: number,
    is_active: boolean,
    accessToken?: string | null
  ) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("is_active", String(is_active));

      const headers: HeadersInit = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/articles/posts/${id}`,
        {
          method: "PATCH",
          headers,
          body: formData,
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to update status");
      }

      const updatedPost: BlogPost = await response.json();
      set((state) => ({
        posts: state.posts.map((p) => (p.id === id ? updatedPost : p)),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        loading: false,
      });
      throw error;
    }
  },

  deletePost: async (id: number, accessToken?: string | null) => {
    set({ loading: true, error: null });
    try {
      const headers: HeadersInit = {};

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/articles/posts/${id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to delete post");
      }

      set((state) => ({
        posts: state.posts.filter((p) => p.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        loading: false,
      });
      throw error;
    }
  },

  getPostById: (id: number) => {
    return get().posts.find((post) => post.id === id);
  },

  getImageUrl: (post: BlogPost) => {
    if (post.image_url) return post.image_url;
    if (post.image) {
      if (post.image.startsWith("http")) return post.image;

      if (post.image.startsWith("/media/")) {
        return `${import.meta.env.VITE_API_URL}${post.image}`;
      }
      return post.image;
    }
    return null;
  },
}));
