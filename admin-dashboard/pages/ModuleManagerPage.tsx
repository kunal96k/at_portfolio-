import { ChevronRight, Info, Plus, Search } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  DocumentUploadList,
  ImageUploadZone,
  type UploadedDocItem,
} from '../components/FileUploadZone';
import { MobileModalShell } from '../components/MobileModalShell';
import {
  ResponsiveDataView,
  type CardField,
  type RowAction,
  type TableColumn,
} from '../components/ResponsiveDataView';
import { StatusBadge } from '../components/StatusBadge';
import type {
  AdminSectionId,
  BlogRecord,
  CourseRecord,
  EnquiryRecord,
  GalleryRecord,
  MediaAssetRecord,
  ResourceRecord,
  TestimonialRecord,
  ToastItem,
} from '../types/admin';
import {
  formatFileSize,
  paginateList,
  slugifyText,
} from '../utils/adminLogic';

type ManagedSection = Exclude<AdminSectionId, 'overview' | 'topics'>;

interface ModuleManagerPageProps {
  section: ManagedSection;
  blogs: BlogRecord[];
  setBlogs: React.Dispatch<React.SetStateAction<BlogRecord[]>>;
  courses: CourseRecord[];
  setCourses: React.Dispatch<React.SetStateAction<CourseRecord[]>>;
  resources: ResourceRecord[];
  setResources: React.Dispatch<React.SetStateAction<ResourceRecord[]>>;
  gallery: GalleryRecord[];
  setGallery: React.Dispatch<React.SetStateAction<GalleryRecord[]>>;
  testimonials: TestimonialRecord[];
  setTestimonials: React.Dispatch<React.SetStateAction<TestimonialRecord[]>>;
  enquiries: EnquiryRecord[];
  setEnquiries: React.Dispatch<React.SetStateAction<EnquiryRecord[]>>;
  media: MediaAssetRecord[];
  setMedia: React.Dispatch<React.SetStateAction<MediaAssetRecord[]>>;
  onToast: (toast: Omit<ToastItem, 'id'>) => void;
}

interface GenericRecord {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  meta: string;
  detail: string;
  status: string;
  updatedAt: string;
  thumbnail?: string;
  extraLabel: string;
  extraValue: string;
}

const SECTION_META: Record<
  ManagedSection,
  {
    singular: string;
    titleLabel: string;
    titlePlaceholder: string;
    statuses: string[];
    primaryFieldLabel: string;
    categoryLabel: string;
    categoryPlaceholder: string;
    metaLabel: string;
    metaPlaceholder: string;
    detailLabel: string;
    detailPlaceholder: string;
    guidelineNote: string;
    allowImageUpload: boolean;
    allowDocumentUpload: boolean;
  }
> = {
  blogs: {
    singular: 'Blog Post',
    titleLabel: 'Blog Title',
    titlePlaceholder: 'e.g., RHEL 9 NetworkManager nmcli Lab Guide',
    statuses: ['All', 'Published', 'Draft'],
    primaryFieldLabel: 'Category',
    categoryLabel: 'Category',
    categoryPlaceholder: 'e.g., Linux, Networking, Cloud',
    metaLabel: 'Read Time',
    metaPlaceholder: 'e.g., 6 min read',
    detailLabel: 'Summary / Excerpt',
    detailPlaceholder: 'Brief summary shown on the blog index card…',
    guidelineNote:
      'Add a clear title, SEO slug, author, and cover image (max 5 MB, 16:9 recommended).',
    allowImageUpload: true,
    allowDocumentUpload: false,
  },
  courses: {
    singular: 'Course Track',
    titleLabel: 'Course Title',
    titlePlaceholder: 'e.g., Red Hat RHCSA & Enterprise Linux',
    statuses: ['All', 'Active', 'Scheduled', 'Draft'],
    primaryFieldLabel: 'Track',
    categoryLabel: 'Technology Track',
    categoryPlaceholder: 'e.g., Linux Systems, Cisco Networking',
    metaLabel: 'Next Batch Date',
    metaPlaceholder: 'YYYY-MM-DD',
    detailLabel: 'Course Overview / Lab Outline',
    detailPlaceholder: 'Key modules, hands-on rack labs, and certification focus…',
    guidelineNote:
      'Include course code, duration, delivery mode, next batch date, and thumbnail (max 5 MB).',
    allowImageUpload: true,
    allowDocumentUpload: false,
  },
  resources: {
    singular: 'Resource / Note',
    titleLabel: 'Resource / Note Title',
    titlePlaceholder: 'e.g., RHCSA Exam Commands & Cheat Sheet',
    statuses: ['All', 'Published', 'Draft'],
    primaryFieldLabel: 'Subject',
    categoryLabel: 'Subject / Track',
    categoryPlaceholder: 'e.g., Red Hat Linux (RHEL), Cisco CCNA',
    metaLabel: 'File Type',
    metaPlaceholder: 'PDF, DOCX, Lab Topology, Cheat Sheet',
    detailLabel: 'Description / Study Notes',
    detailPlaceholder: 'Describe what learners get inside this downloadable file…',
    guidelineNote:
      'Upload PDF, DOCX, PPTX, TXT, PKT, or ZIP study notes up to 5 MB per file.',
    allowImageUpload: false,
    allowDocumentUpload: true,
  },
  gallery: {
    singular: 'Gallery Photo',
    titleLabel: 'Photo Title',
    titlePlaceholder: 'e.g., Weekend CCNA Switch Rack Lab',
    statuses: ['All', 'Published', 'Draft'],
    primaryFieldLabel: 'Category',
    categoryLabel: 'Gallery Category',
    categoryPlaceholder: 'Lab Session',
    metaLabel: 'Dimensions',
    metaPlaceholder: 'e.g., 1200 × 896',
    detailLabel: 'Photo Caption',
    detailPlaceholder: 'Short caption shown under the gallery image…',
    guidelineNote:
      'Upload crisp JPG, PNG, or WebP lab photos up to 5 MB each.',
    allowImageUpload: true,
    allowDocumentUpload: false,
  },
  testimonials: {
    singular: 'Testimonial',
    titleLabel: 'Student Name',
    titlePlaceholder: 'e.g., Kalyani Bachhav',
    statuses: ['All', 'Published', 'Draft'],
    primaryFieldLabel: 'Course Track',
    categoryLabel: 'Course Track',
    categoryPlaceholder: 'e.g., CCNA & Security, RHCSA Linux',
    metaLabel: 'Job Role',
    metaPlaceholder: 'e.g., Jr. Network Engineer',
    detailLabel: 'Student Feedback Quote',
    detailPlaceholder: 'Learner feedback about training and placement support…',
    guidelineNote:
      'Upload a square portrait photo (max 5 MB) with student role, company, and verified quote.',
    allowImageUpload: true,
    allowDocumentUpload: false,
  },
  enquiries: {
    singular: 'Enquiry',
    titleLabel: 'Learner Name',
    titlePlaceholder: 'e.g., Rohan Deshmukh',
    statuses: ['All', 'New', 'Read', 'Replied'],
    primaryFieldLabel: 'Interest',
    categoryLabel: 'Course Interest',
    categoryPlaceholder: 'e.g., Red Hat Linux (RHEL), AWS Cloud',
    metaLabel: 'Phone Number',
    metaPlaceholder: 'e.g., +91 98230 00000',
    detailLabel: 'Enquiry Message / Follow-up Notes',
    detailPlaceholder: 'Batch preference, questions, or counsellor notes…',
    guidelineNote:
      'Log contact phone, email, channel, and status to track learner follow-ups.',
    allowImageUpload: false,
    allowDocumentUpload: false,
  },
  media: {
    singular: 'Media File',
    titleLabel: 'Asset Title',
    titlePlaceholder: 'e.g., Cisco Rack Topology Lab Photo',
    statuses: ['All', 'Active', 'Archived'],
    primaryFieldLabel: 'Folder',
    categoryLabel: 'Library Folder',
    categoryPlaceholder: 'Lab Photos',
    metaLabel: 'File & Size',
    metaPlaceholder: 'Auto-filled from upload',
    detailLabel: 'Asset Notes',
    detailPlaceholder: 'Optional note about where this asset is used…',
    guidelineNote:
      'Upload images (JPG/PNG/WebP) or PDF/study documents — strict 5 MB max per file.',
    allowImageUpload: true,
    allowDocumentUpload: true,
  },
};

export function ModuleManagerPage({
  section,
  blogs,
  setBlogs,
  courses,
  setCourses,
  resources,
  setResources,
  gallery,
  setGallery,
  testimonials,
  setTestimonials,
  enquiries,
  setEnquiries,
  media,
  setMedia,
  onToast,
}: ModuleManagerPageProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);

  const [viewing, setViewing] = useState<GenericRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GenericRecord | null>(null);

  // Common form state
  const [fTitle, setFTitle] = useState('');
  const [fCategory, setFCategory] = useState('');
  const [fMeta, setFMeta] = useState('');
  const [fDetail, setFDetail] = useState('');
  const [fStatus, setFStatus] = useState('Published');
  const [fImage, setFImage] = useState('');
  const [fImageName, setFImageName] = useState('');
  const [fError, setFError] = useState<string | null>(null);

  // Module-specific additional fields
  const [fSlug, setFSlug] = useState('');
  const [fAuthor, setFAuthor] = useState('Arvind Thevar');
  const [fFeatured, setFFeatured] = useState(false);

  const [fCourseCode, setFCourseCode] = useState('');
  const [fCourseDuration, setFCourseDuration] = useState('8 Weeks');
  const [fCourseMode, setFCourseMode] =
    useState<CourseRecord['mode']>('Classroom & Online');
  const [fCourseEnrolled, setFCourseEnrolled] = useState(15);

  const [fResourceFileType, setFResourceFileType] =
    useState<ResourceRecord['fileType']>('PDF');
  const [fDocs, setFDocs] = useState<UploadedDocItem[]>([]);

  const [fGalleryCategory, setFGalleryCategory] =
    useState<GalleryRecord['category']>('Lab Session');

  const [fCompany, setFCompany] = useState('');

  const [fEmail, setFEmail] = useState('');
  const [fChannel, setFChannel] =
    useState<EnquiryRecord['channel']>('Website Form');

  const [fMediaKind, setFMediaKind] = useState<'image' | 'document'>('image');
  const [fMediaFolder, setFMediaFolder] =
    useState<MediaAssetRecord['folder']>('Lab Photos');

  const meta = SECTION_META[section];

  const normalizedRecords: GenericRecord[] = useMemo(() => {
    switch (section) {
      case 'blogs':
        return blogs.map((b) => ({
          id: b.id,
          title: b.title,
          subtitle: `/${b.slug}`,
          category: b.category,
          meta: b.readTime,
          detail: b.summary,
          status: b.status,
          updatedAt: b.updatedAt,
          thumbnail: b.coverImage,
          extraLabel: 'Author & Visibility',
          extraValue: `${b.author}${b.featured ? ' · Featured' : ''}`,
        }));
      case 'courses':
        return courses.map((c) => ({
          id: c.id,
          title: c.title,
          subtitle: `${c.code} · ${c.duration}`,
          category: c.track,
          meta: `Next: ${c.nextBatch}`,
          detail: c.summary,
          status: c.status,
          updatedAt: c.updatedAt,
          thumbnail: c.coverImage,
          extraLabel: 'Mode & Enrolled',
          extraValue: `${c.mode} · ${c.enrolled} learners`,
        }));
      case 'resources':
        return resources.map((r) => ({
          id: r.id,
          title: r.title,
          subtitle: r.fileName,
          category: r.subject,
          meta: `${r.fileType} · ${r.fileSize}`,
          detail: r.summary,
          status: r.status,
          updatedAt: r.updatedAt,
          extraLabel: 'Downloads',
          extraValue: `${r.downloads} downloads`,
        }));
      case 'gallery':
        return gallery.map((g) => ({
          id: g.id,
          title: g.title,
          subtitle: g.dimensions,
          category: g.category,
          meta: g.dimensions,
          detail: g.caption,
          status: g.status,
          updatedAt: g.uploadedAt,
          thumbnail: g.imageUrl,
          extraLabel: 'Caption',
          extraValue: g.caption,
        }));
      case 'testimonials':
        return testimonials.map((t) => ({
          id: t.id,
          title: t.studentName,
          subtitle: `${t.role} · ${t.company}`,
          category: t.track,
          meta: t.company,
          detail: t.quote,
          status: t.status,
          updatedAt: t.updatedAt,
          thumbnail: t.avatarUrl,
          extraLabel: 'Featured',
          extraValue: t.featured ? 'Featured on website' : 'Standard',
        }));
      case 'enquiries':
        return enquiries.map((e) => ({
          id: e.id,
          title: e.name,
          subtitle: e.email,
          category: e.interest,
          meta: `${e.channel} · ${e.phone}`,
          detail: e.message,
          status: e.status,
          updatedAt: e.receivedAt,
          extraLabel: 'Phone',
          extraValue: e.phone,
        }));
      case 'media':
        return media.map((m) => ({
          id: m.id,
          title: m.title,
          subtitle: m.fileName,
          category: m.folder,
          meta: `${m.mimeType} · ${m.size}`,
          detail: `Stored in ${m.folder} (${m.fileName})`,
          status: m.status,
          updatedAt: m.uploadedAt,
          thumbnail: m.mimeType.startsWith('Image') ? m.previewUrl : undefined,
          extraLabel: 'Asset Path',
          extraValue: m.previewUrl,
        }));
    }
  }, [
    section,
    blogs,
    courses,
    resources,
    gallery,
    testimonials,
    enquiries,
    media,
  ]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return normalizedRecords.filter((rec) => {
      if (statusFilter !== 'All' && rec.status !== statusFilter) return false;
      if (!q) return true;
      return [rec.title, rec.subtitle, rec.category, rec.meta, rec.detail]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [normalizedRecords, search, statusFilter]);

  const paginated = useMemo(
    () => paginateList(filtered, page, 5),
    [filtered, page]
  );

  const openCreateForm = () => {
    setEditingId(null);
    setFTitle('');
    setFCategory('');
    setFMeta('');
    setFDetail('');
    setFStatus(meta.statuses[1] ?? 'Published');
    setFImage('');
    setFImageName('');
    setFSlug('');
    setFAuthor('Arvind Thevar');
    setFFeatured(false);
    setFCourseCode(`TRK-${Math.floor(100 + Math.random() * 899)}`);
    setFCourseDuration('8 Weeks');
    setFCourseMode('Classroom & Online');
    setFCourseEnrolled(15);
    setFResourceFileType('PDF');
    setFDocs([]);
    setFGalleryCategory('Lab Session');
    setFCompany('');
    setFEmail('');
    setFChannel('Website Form');
    setFMediaKind('image');
    setFMediaFolder('Lab Photos');
    setFError(null);
    setFormOpen(true);
  };

  const openEditForm = (rec: GenericRecord) => {
    setEditingId(rec.id);
    setFTitle(rec.title);
    setFCategory(rec.category);
    setFMeta(rec.meta);
    setFDetail(rec.detail);
    setFStatus(rec.status);
    setFImage(rec.thumbnail ?? '');
    setFImageName(rec.subtitle || 'asset.jpg');
    setFDocs([]);
    setFError(null);

    if (section === 'blogs') {
      const found = blogs.find((b) => b.id === rec.id);
      if (found) {
        setFSlug(found.slug);
        setFAuthor(found.author);
        setFFeatured(found.featured);
        setFMeta(found.readTime);
        setFImage(found.coverImage);
        setFImageName(`${found.slug}.jpg`);
      }
    } else if (section === 'courses') {
      const found = courses.find((c) => c.id === rec.id);
      if (found) {
        setFCourseCode(found.code);
        setFCourseDuration(found.duration);
        setFCourseMode(found.mode);
        setFCourseEnrolled(found.enrolled);
        setFMeta(found.nextBatch);
        setFImage(found.coverImage);
        setFImageName(`${found.code.toLowerCase()}.jpg`);
      }
    } else if (section === 'resources') {
      const found = resources.find((r) => r.id === rec.id);
      if (found) {
        setFResourceFileType(found.fileType);
        setFDocs([
          {
            id: `existing-${found.id}`,
            name: found.fileName,
            type: 'application/pdf',
            sizeBytes: 420 * 1024,
            uploadedAt: found.updatedAt,
          },
        ]);
      }
    } else if (section === 'gallery') {
      const found = gallery.find((g) => g.id === rec.id);
      if (found) {
        setFGalleryCategory(found.category);
        setFMeta(found.dimensions);
        setFImage(found.imageUrl);
        setFImageName(`${slugifyText(found.title) || 'gallery'}.jpg`);
      }
    } else if (section === 'testimonials') {
      const found = testimonials.find((t) => t.id === rec.id);
      if (found) {
        setFMeta(found.role);
        setFCompany(found.company);
        setFFeatured(found.featured);
        setFImage(found.avatarUrl);
        setFImageName(`${slugifyText(found.studentName) || 'student'}.jpg`);
      }
    } else if (section === 'enquiries') {
      const found = enquiries.find((e) => e.id === rec.id);
      if (found) {
        setFEmail(found.email);
        setFMeta(found.phone);
        setFChannel(found.channel);
      }
    } else if (section === 'media') {
      const found = media.find((m) => m.id === rec.id);
      if (found) {
        setFMediaFolder(found.folder);
        const isDoc = found.mimeType === 'Document / PDF';
        setFMediaKind(isDoc ? 'document' : 'image');
        if (isDoc) {
          setFDocs([
            {
              id: `existing-media-${found.id}`,
              name: found.fileName,
              type: 'application/pdf',
              sizeBytes: 512 * 1024,
              url: found.previewUrl,
              uploadedAt: found.uploadedAt,
            },
          ]);
        } else {
          setFImage(found.previewUrl);
          setFImageName(found.fileName);
        }
      }
    }

    setFormOpen(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!fTitle.trim() || fTitle.trim().length < 2) {
      setFError(`Please enter a valid ${meta.titleLabel.toLowerCase()}.`);
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const id = editingId ?? `${section}-${Date.now()}`;

    if (section === 'blogs') {
      const next: BlogRecord = {
        id,
        title: fTitle.trim(),
        slug: slugifyText(fSlug || fTitle) || 'blog-post',
        category: fCategory.trim() || 'Infrastructure',
        author: fAuthor.trim() || 'Arvind Thevar',
        readTime: fMeta.trim() || '5 min read',
        status: fStatus === 'Published' ? 'Published' : 'Draft',
        featured: fFeatured,
        coverImage:
          fImage || '/assets/images/cisco_network_lab_1795164486189.jpg',
        summary: fDetail.trim() || 'Sample blog summary entry.',
        updatedAt: today,
      };
      setBlogs((prev) =>
        editingId ? prev.map((b) => (b.id === id ? next : b)) : [next, ...prev]
      );
    } else if (section === 'courses') {
      const next: CourseRecord = {
        id,
        title: fTitle.trim(),
        code:
          fCourseCode.trim() || `TRK-${Math.floor(100 + Math.random() * 899)}`,
        track: fCategory.trim() || 'IT Infrastructure',
        duration: fCourseDuration.trim() || '8 Weeks',
        mode: fCourseMode,
        nextBatch: fMeta.trim().replace(/^Next:\s*/i, '') || '2026-05-01',
        enrolled: Math.max(0, Number(fCourseEnrolled) || 0),
        status:
          fStatus === 'Active' || fStatus === 'Scheduled' ? fStatus : 'Draft',
        coverImage:
          fImage || '/assets/images/linux_rhel_lab_1795164484674.jpg',
        summary: fDetail.trim() || 'Sample course outline.',
        updatedAt: today,
      };
      setCourses((prev) =>
        editingId ? prev.map((c) => (c.id === id ? next : c)) : [next, ...prev]
      );
    } else if (section === 'resources') {
      const existing = editingId
        ? resources.find((r) => r.id === editingId)
        : undefined;
      const uploadedDoc = fDocs[0];
      const next: ResourceRecord = {
        id,
        title: fTitle.trim(),
        subject: fCategory.trim() || 'Red Hat Linux (RHEL)',
        fileType: fResourceFileType,
        fileName:
          uploadedDoc?.name ||
          existing?.fileName ||
          `${slugifyText(fTitle) || 'study-note'}.pdf`,
        fileSize: uploadedDoc
          ? formatFileSize(uploadedDoc.sizeBytes)
          : existing?.fileSize || '410 KB',
        downloads: existing?.downloads ?? 0,
        status: fStatus === 'Published' ? 'Published' : 'Draft',
        updatedAt: today,
        summary: fDetail.trim() || 'Sample study resource note.',
      };
      setResources((prev) =>
        editingId ? prev.map((r) => (r.id === id ? next : r)) : [next, ...prev]
      );
    } else if (section === 'gallery') {
      const next: GalleryRecord = {
        id,
        title: fTitle.trim(),
        category: fGalleryCategory,
        imageUrl:
          fImage || '/assets/images/corporate_it_workshop_1795164484663.jpg',
        dimensions: fMeta.trim() || '1200 × 896',
        status: fStatus === 'Published' ? 'Published' : 'Draft',
        uploadedAt: today,
        caption: fDetail.trim() || 'Lab training session snapshot.',
      };
      setGallery((prev) =>
        editingId ? prev.map((g) => (g.id === id ? next : g)) : [next, ...prev]
      );
    } else if (section === 'testimonials') {
      const next: TestimonialRecord = {
        id,
        studentName: fTitle.trim(),
        role: fMeta.trim() || 'Network Engineer',
        company: fCompany.trim() || 'IT Services Pvt. Ltd.',
        track: fCategory.trim() || 'Linux & Networking',
        avatarUrl: fImage || '/assets/students/kalyani_bachhav.jpg',
        quote: fDetail.trim() || 'Sample learner feedback.',
        featured: fFeatured,
        status: fStatus === 'Published' ? 'Published' : 'Draft',
        updatedAt: today,
      };
      setTestimonials((prev) =>
        editingId ? prev.map((t) => (t.id === id ? next : t)) : [next, ...prev]
      );
    } else if (section === 'enquiries') {
      const next: EnquiryRecord = {
        id,
        name: fTitle.trim(),
        email:
          fEmail.trim() || `${slugifyText(fTitle) || 'learner'}@example.com`,
        phone: fMeta.trim() || '+91 98230 00000',
        interest: fCategory.trim() || 'Red Hat Linux (RHEL)',
        channel: fChannel,
        message: fDetail.trim() || 'Enquiry note logged from admin dashboard.',
        status:
          fStatus === 'New' || fStatus === 'Read' || fStatus === 'Replied'
            ? fStatus
            : 'Read',
        receivedAt: `${today} 10:00`,
      };
      setEnquiries((prev) =>
        editingId
          ? prev.map((enq) => (enq.id === id ? next : enq))
          : [next, ...prev]
      );
    } else if (section === 'media') {
      const uploadedDoc = fDocs[0];
      const isDoc = fMediaKind === 'document';
      const fileName = isDoc
        ? uploadedDoc?.name || `${slugifyText(fTitle) || 'document'}.pdf`
        : fImageName || `${slugifyText(fTitle) || 'asset'}.jpg`;
      const isPng = fileName.toLowerCase().endsWith('.png');
      const next: MediaAssetRecord = {
        id,
        title: fTitle.trim(),
        fileName,
        mimeType: isDoc
          ? 'Document / PDF'
          : isPng
            ? 'Image / PNG'
            : 'Image / JPEG',
        size: isDoc && uploadedDoc ? formatFileSize(uploadedDoc.sizeBytes) : '640 KB',
        folder: fMediaFolder,
        previewUrl: isDoc
          ? uploadedDoc?.url || `/assets/materials/${fileName}`
          : fImage || '/assets/images/aws_cloud_infra_1795164482369.jpg',
        status: fStatus === 'Archived' ? 'Archived' : 'Active',
        uploadedAt: today,
      };
      setMedia((prev) =>
        editingId ? prev.map((m) => (m.id === id ? next : m)) : [next, ...prev]
      );
    }

    onToast({
      tone: 'success',
      title: editingId ? `${meta.singular} updated` : `${meta.singular} added`,
      description: fTitle.trim(),
    });
    setFormOpen(false);
    setEditingId(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    if (section === 'blogs') setBlogs((p) => p.filter((x) => x.id !== id));
    if (section === 'courses') setCourses((p) => p.filter((x) => x.id !== id));
    if (section === 'resources')
      setResources((p) => p.filter((x) => x.id !== id));
    if (section === 'gallery') setGallery((p) => p.filter((x) => x.id !== id));
    if (section === 'testimonials')
      setTestimonials((p) => p.filter((x) => x.id !== id));
    if (section === 'enquiries')
      setEnquiries((p) => p.filter((x) => x.id !== id));
    if (section === 'media') setMedia((p) => p.filter((x) => x.id !== id));

    onToast({
      tone: 'success',
      title: `${meta.singular} deleted`,
      description: deleteTarget.title,
    });
    setDeleteTarget(null);
  };

  const columns: TableColumn<GenericRecord>[] = [
    {
      key: 'title',
      header: meta.singular,
      render: (rec) => (
        <div className="flex items-center gap-3">
          {rec.thumbnail && (
            <img
              src={rec.thumbnail}
              alt={rec.title}
              referrerPolicy="no-referrer"
              className="h-10 w-12 shrink-0 rounded-lg border border-[#E2E8F0] object-cover"
            />
          )}
          <div className="min-w-0 max-w-[290px]">
            <p className="truncate font-semibold text-[#0B1736]">{rec.title}</p>
            <p className="truncate text-xs text-[#64748B]">{rec.subtitle}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: meta.primaryFieldLabel,
      render: (rec) => (
        <span className="text-xs font-medium text-[#334155]">
          {rec.category}
        </span>
      ),
    },
    {
      key: 'meta',
      header: meta.metaLabel,
      render: (rec) => (
        <span className="text-xs text-[#475569] tabular-nums">{rec.meta}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (rec) => <StatusBadge status={rec.status} />,
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      align: 'right',
      render: (rec) => (
        <span className="text-xs text-[#64748B] tabular-nums">
          {rec.updatedAt}
        </span>
      ),
    },
  ];

  const cardPrimaryFields: CardField<GenericRecord>[] = [
    { label: meta.primaryFieldLabel, render: (r) => r.category },
    { label: meta.metaLabel, render: (r) => r.meta },
    { label: 'Updated', render: (r) => r.updatedAt },
    { label: 'Details', render: (r) => r.extraValue },
  ];

  const cardExpandedFields: CardField<GenericRecord>[] = [
    { label: 'Summary / Notes', render: (r) => r.detail },
  ];

  const actions: RowAction<GenericRecord>[] = [
    {
      id: 'view',
      label: 'View',
      onClick: (rec) => {
        if (section === 'enquiries' && rec.status === 'New') {
          setEnquiries((prev) =>
            prev.map((e) => (e.id === rec.id ? { ...e, status: 'Read' } : e))
          );
        }
        setViewing(rec);
      },
    },
    {
      id: 'edit',
      label: 'Edit',
      onClick: openEditForm,
    },
    {
      id: 'delete',
      label: 'Delete',
      destructive: true,
      onClick: (rec) => setDeleteTarget(rec),
    },
  ];

  const inputClass =
    'mt-1.5 min-h-[44px] w-full min-w-0 rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-sm text-[#0B1736] placeholder:text-[#94A3B8] focus:border-[#145BFF] focus:outline-none';
  const selectClass =
    'mt-1.5 min-h-[44px] w-full min-w-0 appearance-none rounded-xl border border-[#E2E8F0] bg-white py-2 pr-9 pl-3.5 text-sm text-[#0B1736] focus:border-[#145BFF] focus:outline-none';

  return (
    <div className="space-y-4">
      {/* Search, Filter & Add Bar (Zero Overflow on 320px+ Mobile) */}
      <div
        data-testid="module-toolbar-card"
        className="flex flex-col gap-2.5 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4"
      >
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#64748B]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={`Search ${meta.singular.toLowerCase()}s…`}
            aria-label={`Search ${meta.singular}s`}
            className="min-h-[44px] w-full min-w-0 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] py-2 pr-3 pl-10 text-sm text-[#0B1736] placeholder:text-[#64748B] focus:border-[#145BFF] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0 sm:items-center">
          <div className="relative w-full min-w-0 sm:w-40">
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="min-h-[44px] w-full min-w-0 appearance-none rounded-xl border border-[#E2E8F0] bg-white py-2 pr-9 pl-3 text-sm text-[#0B1736] focus:border-[#145BFF] focus:outline-none"
            >
              {meta.statuses.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All statuses' : st}
                </option>
              ))}
            </select>
            <ChevronRight
              className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 rotate-90 text-[#64748B]"
              aria-hidden="true"
            />
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex min-h-[44px] w-full min-w-0 items-center justify-center gap-1.5 rounded-xl bg-[#145BFF] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0F4AD6] sm:w-auto"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Add {meta.singular}</span>
          </button>
        </div>
      </div>

      {/* Adaptive Table-to-Card View */}
      <ResponsiveDataView
        items={paginated.items}
        emptyTitle={`No ${meta.singular.toLowerCase()}s found`}
        emptyDescription="Adjust your search or status filter, or add a new sample entry."
        emptyActionLabel={`Add ${meta.singular}`}
        onEmptyAction={openCreateForm}
        columns={columns}
        getCardTitle={(r) => r.title}
        getCardSubtitle={(r) => r.subtitle}
        getCardStatus={(r) => r.status}
        getCardThumbnail={(r) => r.thumbnail}
        cardPrimaryFields={cardPrimaryFields}
        cardExpandedFields={cardExpandedFields}
        actions={actions}
        currentPage={paginated.currentPage}
        totalPages={paginated.totalPages}
        totalItems={paginated.totalItems}
        startIndex={paginated.startIndex}
        endIndex={paginated.endIndex}
        onPageChange={setPage}
      />

      {/* Mobile-First Scrollable Detail View Modal */}
      <MobileModalShell
        open={Boolean(viewing)}
        title={viewing?.title ?? ''}
        subtitle={viewing?.subtitle}
        titleId="record-view-title"
        maxWidthClass="sm:max-w-lg"
        onClose={() => setViewing(null)}
        headerBadge={viewing ? <StatusBadge status={viewing.status} /> : null}
        footer={
          viewing ? (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="min-h-[44px] w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#0B1736] hover:bg-[#F5F7FC] sm:w-auto"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = viewing;
                  setViewing(null);
                  openEditForm(target);
                }}
                className="min-h-[44px] w-full rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 text-sm font-semibold text-[#145BFF] hover:bg-[#DBEAFE] sm:w-auto"
              >
                Edit
              </button>
              {section === 'enquiries' && viewing.status !== 'Replied' && (
                <button
                  type="button"
                  onClick={() => {
                    setEnquiries((prev) =>
                      prev.map((e) =>
                        e.id === viewing.id ? { ...e, status: 'Replied' } : e
                      )
                    );
                    onToast({
                      tone: 'success',
                      title: 'Enquiry marked as Replied',
                      description: viewing.title,
                    });
                    setViewing(null);
                  }}
                  className="min-h-[44px] w-full rounded-xl bg-[#145BFF] px-4 text-sm font-semibold text-white hover:bg-[#0F4AD6] sm:w-auto"
                >
                  Mark as Replied
                </button>
              )}
            </div>
          ) : null
        }
      >
        {viewing && (
          <div className="space-y-4">
            {viewing.thumbnail && (
              <img
                src={viewing.thumbnail}
                alt={viewing.title}
                referrerPolicy="no-referrer"
                className="aspect-[16/9] w-full rounded-xl border border-[#E2E8F0] object-cover"
              />
            )}

            <dl className="grid grid-cols-1 gap-3 rounded-xl bg-[#F5F7FC] p-3.5 text-xs min-[360px]:grid-cols-2">
              <div className="min-w-0">
                <dt className="text-[#64748B]">{meta.primaryFieldLabel}</dt>
                <dd className="mt-0.5 break-words font-semibold text-[#0B1736]">
                  {viewing.category}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[#64748B]">{meta.metaLabel}</dt>
                <dd className="mt-0.5 break-words font-semibold text-[#0B1736]">
                  {viewing.meta}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[#64748B]">{viewing.extraLabel}</dt>
                <dd className="mt-0.5 break-words font-semibold text-[#0B1736]">
                  {viewing.extraValue}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[#64748B]">Updated</dt>
                <dd className="mt-0.5 font-semibold text-[#0B1736] tabular-nums">
                  {viewing.updatedAt}
                </dd>
              </div>
            </dl>

            <p className="text-sm leading-relaxed text-[#334155]">
              {viewing.detail}
            </p>
          </div>
        )}
      </MobileModalShell>

      {/* Mobile-First Scrollable Create / Edit Sheet Modal */}
      <MobileModalShell
        open={formOpen}
        title={editingId ? `Edit ${meta.singular}` : `New ${meta.singular}`}
        subtitle={`Manage ${meta.singular.toLowerCase()} details and attachments.`}
        titleId="module-form-title"
        maxWidthClass="sm:max-w-xl"
        onClose={() => setFormOpen(false)}
        asForm
        onFormSubmit={handleSave}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="min-h-[44px] w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#475569] hover:bg-[#F5F7FC] sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] w-full rounded-xl bg-[#145BFF] px-5 text-sm font-semibold text-white hover:bg-[#0F4AD6] sm:w-auto"
            >
              {editingId ? 'Save Changes' : `Create ${meta.singular}`}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Guideline Note */}
          <div className="flex items-start gap-2.5 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF]/70 px-3.5 py-2.5 text-xs leading-relaxed text-[#1E3A8A]">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#145BFF]" />
            <span>{meta.guidelineNote}</span>
          </div>

          {fError && (
            <p
              role="alert"
              className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2.5 text-xs font-medium text-[#B91C1C]"
            >
              {fError}
            </p>
          )}

          {/* Primary Title / Name */}
          <div>
            <label
              htmlFor="mod-title"
              className="block text-sm font-semibold text-[#0B1736]"
            >
              {meta.titleLabel} <span className="text-[#DC2626]">*</span>
            </label>
            <input
              id="mod-title"
              type="text"
              value={fTitle}
              placeholder={meta.titlePlaceholder}
              onChange={(e) => {
                const val = e.target.value;
                setFTitle(val);
                if (section === 'blogs' && !editingId) {
                  setFSlug(slugifyText(val));
                }
                setFError(null);
              }}
              className={inputClass}
            />
          </div>

          {/* Section-specific top fields */}
          {section === 'blogs' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="mod-blog-slug"
                  className="block text-sm font-semibold text-[#0B1736]"
                >
                  URL Slug
                </label>
                <input
                  id="mod-blog-slug"
                  type="text"
                  inputMode="url"
                  value={fSlug}
                  placeholder="rhel-9-nmcli-guide"
                  onChange={(e) => setFSlug(slugifyText(e.target.value))}
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label
                  htmlFor="mod-blog-author"
                  className="block text-sm font-semibold text-[#0B1736]"
                >
                  Author
                </label>
                <input
                  id="mod-blog-author"
                  type="text"
                  value={fAuthor}
                  placeholder="Arvind Thevar"
                  onChange={(e) => setFAuthor(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {section === 'courses' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="mod-course-code"
                  className="block text-sm font-semibold text-[#0B1736]"
                >
                  Course Code
                </label>
                <input
                  id="mod-course-code"
                  type="text"
                  value={fCourseCode}
                  placeholder="e.g., RHCSA-01"
                  onChange={(e) => setFCourseCode(e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label
                  htmlFor="mod-course-duration"
                  className="block text-sm font-semibold text-[#0B1736]"
                >
                  Duration
                </label>
                <input
                  id="mod-course-duration"
                  type="text"
                  value={fCourseDuration}
                  placeholder="e.g., 8 Weeks"
                  onChange={(e) => setFCourseDuration(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="mod-course-mode"
                  className="block text-sm font-semibold text-[#0B1736]"
                >
                  Delivery Mode
                </label>
                <div className="relative">
                  <select
                    id="mod-course-mode"
                    value={fCourseMode}
                    onChange={(e) =>
                      setFCourseMode(e.target.value as CourseRecord['mode'])
                    }
                    className={selectClass}
                  >
                    <option value="Classroom & Online">Classroom & Online</option>
                    <option value="Online Live">Online Live</option>
                    <option value="Corporate Workshop">Corporate Workshop</option>
                  </select>
                  <ChevronRight
                    className="pointer-events-none absolute top-1/2 right-3 mt-0.5 h-4 w-4 -translate-y-1/2 rotate-90 text-[#64748B]"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="mod-course-enrolled"
                  className="block text-sm font-semibold text-[#0B1736]"
                >
                  Enrolled Learners
                </label>
                <input
                  id="mod-course-enrolled"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={fCourseEnrolled}
                  onChange={(e) =>
                    setFCourseEnrolled(Math.max(0, Number(e.target.value) || 0))
                  }
                  className={`${inputClass} tabular-nums`}
                />
              </div>
            </div>
          )}

          {section === 'enquiries' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="mod-enq-email"
                  className="block text-sm font-semibold text-[#0B1736]"
                >
                  Email Address
                </label>
                <input
                  id="mod-enq-email"
                  type="email"
                  value={fEmail}
                  placeholder="learner@example.com"
                  onChange={(e) => setFEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="mod-enq-channel"
                  className="block text-sm font-semibold text-[#0B1736]"
                >
                  Enquiry Channel
                </label>
                <div className="relative">
                  <select
                    id="mod-enq-channel"
                    value={fChannel}
                    onChange={(e) =>
                      setFChannel(e.target.value as EnquiryRecord['channel'])
                    }
                    className={selectClass}
                  >
                    <option value="Website Form">Website Form</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Phone Call">Phone Call</option>
                  </select>
                  <ChevronRight
                    className="pointer-events-none absolute top-1/2 right-3 mt-0.5 h-4 w-4 -translate-y-1/2 rotate-90 text-[#64748B]"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Category / Folder + Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="mod-category"
                className="block text-sm font-semibold text-[#0B1736]"
              >
                {meta.categoryLabel}
              </label>
              {section === 'gallery' ? (
                <div className="relative">
                  <select
                    id="mod-category"
                    value={fGalleryCategory}
                    onChange={(e) =>
                      setFGalleryCategory(
                        e.target.value as GalleryRecord['category']
                      )
                    }
                    className={selectClass}
                  >
                    <option value="Lab Session">Lab Session</option>
                    <option value="Corporate Training">Corporate Training</option>
                    <option value="Network Rack">Network Rack</option>
                    <option value="Workspace">Workspace</option>
                  </select>
                  <ChevronRight
                    className="pointer-events-none absolute top-1/2 right-3 mt-0.5 h-4 w-4 -translate-y-1/2 rotate-90 text-[#64748B]"
                    aria-hidden="true"
                  />
                </div>
              ) : section === 'media' ? (
                <div className="relative">
                  <select
                    id="mod-category"
                    value={fMediaFolder}
                    onChange={(e) =>
                      setFMediaFolder(
                        e.target.value as MediaAssetRecord['folder']
                      )
                    }
                    className={selectClass}
                  >
                    <option value="Lab Photos">Lab Photos</option>
                    <option value="Student Portraits">Student Portraits</option>
                    <option value="Study PDFs">Study PDFs</option>
                    <option value="Brand Assets">Brand Assets</option>
                  </select>
                  <ChevronRight
                    className="pointer-events-none absolute top-1/2 right-3 mt-0.5 h-4 w-4 -translate-y-1/2 rotate-90 text-[#64748B]"
                    aria-hidden="true"
                  />
                </div>
              ) : (
                <input
                  id="mod-category"
                  type="text"
                  value={fCategory}
                  placeholder={meta.categoryPlaceholder}
                  onChange={(e) => setFCategory(e.target.value)}
                  className={inputClass}
                />
              )}
            </div>

            <div>
              <label
                htmlFor="mod-status"
                className="block text-sm font-semibold text-[#0B1736]"
              >
                Status
              </label>
              <div className="relative">
                <select
                  id="mod-status"
                  value={fStatus}
                  onChange={(e) => setFStatus(e.target.value)}
                  className={selectClass}
                >
                  {meta.statuses
                    .filter((s) => s !== 'All')
                    .map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                </select>
                <ChevronRight
                  className="pointer-events-none absolute top-1/2 right-3 mt-0.5 h-4 w-4 -translate-y-1/2 rotate-90 text-[#64748B]"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {/* Meta field (specialized per module) */}
          {section === 'resources' ? (
            <div>
              <label
                htmlFor="mod-resource-type"
                className="block text-sm font-semibold text-[#0B1736]"
              >
                Resource File Type
              </label>
              <div className="relative">
                <select
                  id="mod-resource-type"
                  value={fResourceFileType}
                  onChange={(e) =>
                    setFResourceFileType(
                      e.target.value as ResourceRecord['fileType']
                    )
                  }
                  className={selectClass}
                >
                  <option value="PDF">PDF Document</option>
                  <option value="DOCX">Word Document (DOCX)</option>
                  <option value="Lab Topology">Lab Topology (.pkt / .zip)</option>
                  <option value="Cheat Sheet">Cheat Sheet</option>
                </select>
                <ChevronRight
                  className="pointer-events-none absolute top-1/2 right-3 mt-0.5 h-4 w-4 -translate-y-1/2 rotate-90 text-[#64748B]"
                  aria-hidden="true"
                />
              </div>
            </div>
          ) : section === 'testimonials' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="mod-meta"
                  className="block text-sm font-semibold text-[#0B1736]"
                >
                  Job Role
                </label>
                <input
                  id="mod-meta"
                  type="text"
                  value={fMeta}
                  placeholder={meta.metaPlaceholder}
                  onChange={(e) => setFMeta(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="mod-company"
                  className="block text-sm font-semibold text-[#0B1736]"
                >
                  Company / Employer
                </label>
                <input
                  id="mod-company"
                  type="text"
                  value={fCompany}
                  placeholder="e.g., Matrix Smart Technologies"
                  onChange={(e) => setFCompany(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          ) : section === 'media' ? (
            <div>
              <span className="block text-sm font-semibold text-[#0B1736]">
                Upload Asset Type
              </span>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFMediaKind('image')}
                  className={`min-h-[44px] rounded-xl border px-3 text-xs font-semibold transition-colors ${
                    fMediaKind === 'image'
                      ? 'border-[#145BFF] bg-[#EFF6FF] text-[#145BFF]'
                      : 'border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F5F7FC]'
                  }`}
                >
                  Image (JPG / PNG / WebP)
                </button>
                <button
                  type="button"
                  onClick={() => setFMediaKind('document')}
                  className={`min-h-[44px] rounded-xl border px-3 text-xs font-semibold transition-colors ${
                    fMediaKind === 'document'
                      ? 'border-[#145BFF] bg-[#EFF6FF] text-[#145BFF]'
                      : 'border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F5F7FC]'
                  }`}
                >
                  Document / PDF
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label
                htmlFor="mod-meta"
                className="block text-sm font-semibold text-[#0B1736]"
              >
                {meta.metaLabel}
              </label>
              <input
                id="mod-meta"
                type={
                  section === 'courses'
                    ? 'date'
                    : section === 'enquiries'
                      ? 'tel'
                      : 'text'
                }
                value={fMeta}
                placeholder={meta.metaPlaceholder}
                onChange={(e) => setFMeta(e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          {/* Featured checkbox for Blogs and Testimonials */}
          {(section === 'blogs' || section === 'testimonials') && (
            <label className="flex min-h-[44px] cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] px-3.5 py-2.5">
              <div>
                <p className="text-sm font-semibold text-[#0B1736]">
                  Featured on Website
                </p>
                <p className="text-xs text-[#64748B]">
                  Pin this {meta.singular.toLowerCase()} in highlighted landing
                  sections.
                </p>
              </div>
              <input
                type="checkbox"
                checked={fFeatured}
                onChange={(e) => setFFeatured(e.target.checked)}
                className="h-5 w-5 shrink-0 rounded border-[#CBD5E1] accent-[#145BFF]"
              />
            </label>
          )}

          {/* Summary / Notes */}
          <div>
            <label
              htmlFor="mod-detail"
              className="block text-sm font-semibold text-[#0B1736]"
            >
              {meta.detailLabel}
            </label>
            <textarea
              id="mod-detail"
              rows={3}
              value={fDetail}
              placeholder={meta.detailPlaceholder}
              onChange={(e) => setFDetail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] p-3.5 text-sm text-[#0B1736] placeholder:text-[#94A3B8] focus:border-[#145BFF] focus:outline-none"
            />
          </div>

          {/* 5 MB File Upload Fields (Images and/or Documents) */}
          {section === 'resources' && (
            <DocumentUploadList
              label="Upload Resource / Study Note File"
              helperText="PDF, DOCX, PPTX, TXT, PKT, or ZIP · Max 5 MB"
              multiple={false}
              files={fDocs}
              onAddFiles={(items) => setFDocs(items.slice(0, 1))}
              onRemoveFile={(id) =>
                setFDocs((prev) => prev.filter((item) => item.id !== id))
              }
              onReplaceFile={(id, replacement) =>
                setFDocs((prev) =>
                  prev.map((item) => (item.id === id ? replacement : item))
                )
              }
            />
          )}

          {section === 'media' &&
            (fMediaKind === 'image' ? (
              <ImageUploadZone
                label="Upload Image Asset"
                helperText="JPG, PNG, WebP, or GIF · Max 5 MB"
                valueUrl={fImage}
                fileName={fImageName}
                onChange={(url, name) => {
                  setFImage(url);
                  setFImageName(name);
                }}
                onRemove={() => {
                  setFImage('');
                  setFImageName('');
                }}
              />
            ) : (
              <DocumentUploadList
                label="Upload PDF / Document Asset"
                helperText="PDF, DOCX, PPTX, TXT, PKT, or ZIP · Max 5 MB"
                multiple={false}
                files={fDocs}
                onAddFiles={(items) => setFDocs(items.slice(0, 1))}
                onRemoveFile={(id) =>
                  setFDocs((prev) => prev.filter((item) => item.id !== id))
                }
                onReplaceFile={(id, replacement) =>
                  setFDocs((prev) =>
                    prev.map((item) => (item.id === id ? replacement : item))
                  )
                }
              />
            ))}

          {section !== 'media' && meta.allowImageUpload && (
            <ImageUploadZone
              label={
                section === 'testimonials'
                  ? 'Student Portrait Photo'
                  : 'Cover / Thumbnail Image'
              }
              helperText={
                section === 'testimonials'
                  ? 'JPG, PNG, or WebP · Max 5 MB · Square portrait recommended'
                  : 'JPG, PNG, or WebP · Max 5 MB · Recommended 16:9'
              }
              valueUrl={fImage}
              fileName={fImageName}
              onChange={(url, name) => {
                setFImage(url);
                setFImageName(name);
              }}
              onRemove={() => {
                setFImage('');
                setFImageName('');
              }}
            />
          )}
        </div>
      </MobileModalShell>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete ${meta.singular.toLowerCase()}?`}
        description={
          deleteTarget
            ? `Remove "${deleteTarget.title}" from the frontend mock workspace?`
            : ''
        }
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
