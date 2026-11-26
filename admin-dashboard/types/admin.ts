export type AdminSectionId =
  | 'overview'
  | 'batches'
  | 'blogs'
  | 'courses'
  | 'resources'
  | 'gallery'
  | 'testimonials'
  | 'enquiries';

export type RecordStatus =
  | 'Published'
  | 'Draft'
  | 'New'
  | 'Read'
  | 'Replied'
  | 'Archived'
  | 'Scheduled';

export interface ToastItem {
  id: string;
  tone: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  timeAgo: string;
  read: boolean;
  targetSection: AdminSectionId;
}
