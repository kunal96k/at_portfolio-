import type {
  BatchAttachment,
  BatchCategory,
  BatchLearningLevel,
  BatchStats,
  BatchStatus,
  ManagedBatch,
} from '../../../src/services/batchesService';

export type {
  BatchAttachment,
  BatchCategory,
  BatchLearningLevel,
  BatchStats,
  BatchStatus,
};

export type Batch = ManagedBatch;

export interface BatchFormValues {
  batchCode: string;
  title: string;
  slug: string;
  shortDescription: string;
  detailedContent: string;
  category: BatchCategory;
  relatedCourse: string;
  batchDate: string;
  batchTime: string;
  mode: string;
  seatsTotal: number;
  location: string;
  coverImage: string;
  coverImageName: string;
  tags: string[];
  learningLevel: BatchLearningLevel;
  attachments: BatchAttachment[];
  displayOrder: number;
  featured: boolean;
  status: BatchStatus;
}

export type BatchSortField =
  | 'displayOrder'
  | 'batchStartAt'
  | 'batchDate'
  | 'updatedAt'
  | 'createdAt'
  | 'title';

export type SortDirection = 'asc' | 'desc';

export type BatchScheduleFilter = 'All' | 'upcoming' | 'started';

export interface BatchQueryState {
  search: string;
  status: 'All' | BatchStatus;
  category: 'All' | BatchCategory;
  relatedCourse?: string;
  level: 'All' | BatchLearningLevel;
  hasFilesOnly?: boolean;
  scheduleFilter?: BatchScheduleFilter;
  sortBy: BatchSortField;
  sortDir: SortDirection;
  page: number;
  pageSize: number;
}

export interface BatchValidationErrors {
  title?: string;
  slug?: string;
  shortDescription?: string;
  detailedContent?: string;
  relatedCourse?: string;
  batchDate?: string;
  batchTime?: string;
  displayOrder?: string;
}
