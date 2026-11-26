import {
  createBlogBackend,
  deleteBlogBackend,
  fetchAdminBlogsPageBackend,
  fetchAllBlogsFromApiOrStorage,
  fetchNextBlogCodeBackend,
  patchBlogFeaturedBackend,
  patchBlogStatusBackend,
  updateBlogBackend,
  type BlogSearchParams,
} from '../../../src/services/blogsService';
import type {
  BlogArticle,
  BlogFormPayload,
  BlogPageResult,
  BlogStatus,
} from '../types/blog';

export const blogService = {
  async searchPage(
    params: BlogSearchParams,
    signal?: AbortSignal
  ): Promise<BlogPageResult> {
    return fetchAdminBlogsPageBackend(params, signal);
  },

  async listBlogs(): Promise<BlogArticle[]> {
    const res = await fetchAllBlogsFromApiOrStorage();
    return res.items;
  },

  async getNextBlogCode(): Promise<string> {
    try {
      return await fetchNextBlogCodeBackend();
    } catch {
      return 'BLOG-001';
    }
  },

  async createBlog(payload: BlogFormPayload): Promise<BlogArticle> {
    return createBlogBackend(payload);
  },

  async updateBlog(
    id: string,
    payload: BlogFormPayload
  ): Promise<BlogArticle> {
    return updateBlogBackend(id, payload);
  },

  async toggleStatus(
    id: string,
    nextStatus: BlogStatus
  ): Promise<BlogArticle> {
    return patchBlogStatusBackend(id, nextStatus);
  },

  async toggleFeatured(
    id: string,
    featured: boolean
  ): Promise<BlogArticle> {
    return patchBlogFeaturedBackend(id, featured);
  },

  async deleteBlog(id: string): Promise<void> {
    return deleteBlogBackend(id);
  },
};
