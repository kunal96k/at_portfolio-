import type {
  CourseAttachment,
  CourseDomain,
  CourseDomainFormPayload,
  CourseDomainStatus,
} from '../../../src/services/coursesService';

export type {
  CourseAttachment,
  CourseDomain,
  CourseDomainFormPayload,
  CourseDomainStatus,
};

export type CourseSortField =
  | 'displayOrder'
  | 'updatedAt'
  | 'createdAt'
  | 'title';

export type SortDirection = 'asc' | 'desc';

export interface CourseQueryState {
  search: string;
  status: 'All' | CourseDomainStatus;
  category: string;
  hasFilesOnly: boolean;
  sortBy: CourseSortField;
  sortDir: SortDirection;
  page: number;
  pageSize: number;
}

export interface CourseValidationErrors {
  title?: string;
  slug?: string;
  category?: string;
  shortDescription?: string;
  detailedSyllabus?: string;
  displayOrder?: string;
}
