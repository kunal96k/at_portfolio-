import type {
  StudentTestimonial,
  TestimonialFormPayload,
  TestimonialPageResult,
  TestimonialSearchParams,
  TestimonialStats,
  TestimonialStatus,
} from '../../../src/services/testimonialsService';

export type {
  StudentTestimonial,
  TestimonialFormPayload,
  TestimonialPageResult,
  TestimonialSearchParams,
  TestimonialStats,
  TestimonialStatus,
};

export type TestimonialSortField =
  | 'displayOrder'
  | 'updatedAt'
  | 'createdAt'
  | 'studentName'
  | 'company'
  | 'courseTrack'
  | 'testimonialCode';

export type TestimonialVisibilityFilter = 'all' | 'featured';

export interface TestimonialQueryState {
  search: string;
  status: 'All' | TestimonialStatus;
  courseTrack: string;
  visibilityFilter: TestimonialVisibilityFilter;
  sortBy: TestimonialSortField;
  sortDir: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface TestimonialValidationErrors {
  studentName?: string;
  role?: string;
  courseTrack?: string;
  quote?: string;
  displayOrder?: string;
}
