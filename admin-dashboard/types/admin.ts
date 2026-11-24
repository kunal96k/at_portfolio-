export type AdminSectionId =
  | 'overview'
  | 'topics'
  | 'blogs'
  | 'courses'
  | 'resources'
  | 'gallery'
  | 'testimonials'
  | 'enquiries'
  | 'media';

export type RecordStatus =
  | 'Published'
  | 'Draft'
  | 'New'
  | 'Read'
  | 'Replied'
  | 'Active'
  | 'Scheduled'
  | 'Archived';

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

export interface BlogRecord {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  readTime: string;
  status: 'Published' | 'Draft';
  featured: boolean;
  coverImage: string;
  summary: string;
  updatedAt: string;
}

export interface CourseRecord {
  id: string;
  title: string;
  code: string;
  track: string;
  duration: string;
  mode: 'Classroom & Online' | 'Online Live' | 'Corporate Workshop';
  nextBatch: string;
  enrolled: number;
  status: 'Active' | 'Scheduled' | 'Draft';
  coverImage: string;
  summary: string;
  updatedAt: string;
}

export interface ResourceRecord {
  id: string;
  title: string;
  subject: string;
  fileType: 'PDF' | 'DOCX' | 'Lab Topology' | 'Cheat Sheet';
  fileName: string;
  fileSize: string;
  downloads: number;
  status: 'Published' | 'Draft';
  updatedAt: string;
  summary: string;
}

export interface GalleryRecord {
  id: string;
  title: string;
  category: 'Lab Session' | 'Corporate Training' | 'Network Rack' | 'Workspace';
  imageUrl: string;
  dimensions: string;
  status: 'Published' | 'Draft';
  uploadedAt: string;
  caption: string;
}

export interface TestimonialRecord {
  id: string;
  studentName: string;
  role: string;
  company: string;
  track: string;
  avatarUrl: string;
  quote: string;
  featured: boolean;
  status: 'Published' | 'Draft';
  updatedAt: string;
}

export interface EnquiryRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  channel: 'Website Form' | 'WhatsApp' | 'Phone Call';
  message: string;
  status: 'New' | 'Read' | 'Replied';
  receivedAt: string;
}

export interface MediaAssetRecord {
  id: string;
  title: string;
  fileName: string;
  mimeType: 'Image / JPEG' | 'Image / PNG' | 'Document / PDF';
  size: string;
  folder: 'Lab Photos' | 'Student Portraits' | 'Study PDFs' | 'Brand Assets';
  previewUrl: string;
  status: 'Active' | 'Archived';
  uploadedAt: string;
}

export interface MonthlyPerformanceRow {
  month: string;
  topicViews: number;
  noteDownloads: number;
  enquiries: number;
  conversions: number;
  avgResponseHrs: number;
  completionRate: string;
}
