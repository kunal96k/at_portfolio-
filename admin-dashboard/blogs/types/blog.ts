import type {
  BlogArticle,
  BlogAttachment,
  BlogFormPayload,
  BlogPageResult,
  BlogSectionItem,
  BlogStats,
  BlogStatus,
} from '../../../src/services/blogsService';

export type {
  BlogArticle,
  BlogAttachment,
  BlogFormPayload,
  BlogPageResult,
  BlogSectionItem,
  BlogStats,
  BlogStatus,
};

export type BlogSortField =
  | 'displayOrder'
  | 'updatedAt'
  | 'createdAt'
  | 'title'
  | 'viewsCount';

export type SortDirection = 'asc' | 'desc';

export type BlogVisibilityFilter = 'all' | 'featured' | 'with-files';

export interface BlogQueryState {
  search: string;
  status: 'All' | BlogStatus;
  category: string;
  visibilityFilter: BlogVisibilityFilter;
  sortBy: BlogSortField;
  sortDir: SortDirection;
  page: number;
  pageSize: number;
}

export interface BlogValidationErrors {
  title?: string;
  slug?: string;
  category?: string;
  author?: string;
  scheduledAt?: string;
  excerpt?: string;
  sections?: string;
  displayOrder?: string;
}
