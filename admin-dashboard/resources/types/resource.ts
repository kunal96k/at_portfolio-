import type {
  ResourceDownloadAccessFilter,
  ResourcePreviewMode,
  ResourceSectionType,
  ResourceStatus,
  StudyResourceFormPayload,
  StudyResourceNote,
  StudyResourcePage,
  StudyResourceStats,
} from '../../../src/services/resourcesService';

export type {
  ResourceDownloadAccessFilter,
  ResourcePreviewMode,
  ResourceSectionType,
  ResourceStatus,
  StudyResourceFormPayload,
  StudyResourceNote,
  StudyResourcePage,
  StudyResourceStats,
};

export type ResourceSortField =
  | 'displayOrder'
  | 'updatedAt'
  | 'createdAt'
  | 'title'
  | 'downloads';

export type SortDirection = 'asc' | 'desc';

export interface ResourceQueryState {
  search: string;
  status: 'All' | ResourceStatus;
  sectionType: 'All' | ResourceSectionType;
  domain: string;
  fileType: string;
  hasFilesOnly: boolean;
  downloadAccess: ResourceDownloadAccessFilter;
  sortBy: ResourceSortField;
  sortDir: SortDirection;
  page: number;
  pageSize: number;
}

export interface ResourceValidationErrors {
  title?: string;
  slug?: string;
  domain?: string;
  summary?: string;
  topicsText?: string;
  fileUrl?: string;
  displayOrder?: string;
}
