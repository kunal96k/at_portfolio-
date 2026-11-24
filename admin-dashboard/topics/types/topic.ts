export type TopicStatus = 'Published' | 'Draft';

export type TopicLearningLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface TopicAttachment {
  id: string;
  name: string;
  type: string;
  sizeBytes: number;
  url?: string;
  uploadedAt: string;
}

export interface Topic {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  detailedContent: string;
  relatedCourse: string;
  subject: string;
  coverImage: string;
  coverImageName?: string;
  tags: string[];
  learningLevel: TopicLearningLevel;
  attachments: TopicAttachment[];
  displayOrder: number;
  featured: boolean;
  status: TopicStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TopicFormValues {
  title: string;
  slug: string;
  shortDescription: string;
  detailedContent: string;
  relatedCourse: string;
  subject: string;
  coverImage: string;
  coverImageName: string;
  tags: string[];
  learningLevel: TopicLearningLevel;
  attachments: TopicAttachment[];
  displayOrder: number;
  featured: boolean;
  status: TopicStatus;
}

export type TopicSortField =
  | 'displayOrder'
  | 'updatedAt'
  | 'createdAt'
  | 'title';

export type SortDirection = 'asc' | 'desc';

export interface TopicQueryState {
  search: string;
  status: 'All' | TopicStatus;
  level: 'All' | TopicLearningLevel;
  course: string;
  featuredOnly: boolean;
  sortBy: TopicSortField;
  sortDir: SortDirection;
  page: number;
  pageSize: number;
}

export interface TopicValidationErrors {
  title?: string;
  slug?: string;
  shortDescription?: string;
  detailedContent?: string;
  relatedCourse?: string;
  displayOrder?: string;
}
