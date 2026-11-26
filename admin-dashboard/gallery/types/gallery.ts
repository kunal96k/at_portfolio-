import type {
  GalleryCategory,
  GalleryFormPayload,
  GalleryItem,
  GalleryPageResult,
  GallerySearchParams,
  GalleryStats,
  GalleryStatus,
} from '../../../src/services/galleryService';

export type {
  GalleryCategory,
  GalleryFormPayload,
  GalleryItem,
  GalleryPageResult,
  GallerySearchParams,
  GalleryStats,
  GalleryStatus,
};

export type GallerySortField =
  | 'displayOrder'
  | 'updatedAt'
  | 'createdAt'
  | 'title'
  | 'galleryCode'
  | 'takenAt';

export type GalleryVisibilityFilter = 'all' | 'featured';

export interface GalleryQueryState {
  search: string;
  status: 'All' | GalleryStatus;
  category: string;
  visibilityFilter: GalleryVisibilityFilter;
  sortBy: GallerySortField;
  sortDir: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface GalleryValidationErrors {
  title?: string;
  category?: string;
  caption?: string;
  imageUrl?: string;
  altText?: string;
  displayOrder?: string;
}
