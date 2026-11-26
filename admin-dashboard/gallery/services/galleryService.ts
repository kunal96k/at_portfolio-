import {
  createGalleryItemBackend,
  deleteGalleryItemBackend,
  fetchAdminGalleryPageBackend,
  fetchAllGalleryItemsBackend,
  fetchNextGalleryCodeBackend,
  toggleGalleryFeaturedBackend,
  toggleGalleryStatusBackend,
  updateGalleryItemBackend,
  uploadGalleryImageBackend,
  type GalleryFormPayload,
  type GalleryItem,
  type GalleryPageResult,
  type GallerySearchParams,
  type GalleryStatus,
} from '../../../src/services/galleryService';

export const galleryAdminService = {
  searchPage(
    params: GallerySearchParams,
    signal?: AbortSignal
  ): Promise<GalleryPageResult> {
    return fetchAdminGalleryPageBackend(params, signal);
  },

  listAll(): Promise<GalleryItem[]> {
    return fetchAllGalleryItemsBackend();
  },

  getNextCode(): Promise<string> {
    return fetchNextGalleryCodeBackend();
  },

  uploadImage(file: File) {
    return uploadGalleryImageBackend(file);
  },

  createItem(payload: GalleryFormPayload): Promise<GalleryItem> {
    return createGalleryItemBackend(payload);
  },

  updateItem(id: string, payload: GalleryFormPayload): Promise<GalleryItem> {
    return updateGalleryItemBackend(id, payload);
  },

  toggleStatus(id: string, status?: GalleryStatus): Promise<GalleryItem> {
    return toggleGalleryStatusBackend(id, status);
  },

  toggleFeatured(id: string, featured?: boolean): Promise<GalleryItem> {
    return toggleGalleryFeaturedBackend(id, featured);
  },

  deleteItem(id: string): Promise<void> {
    return deleteGalleryItemBackend(id);
  },
};
