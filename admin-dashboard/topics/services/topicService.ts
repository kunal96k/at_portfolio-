import { slugifyText } from '../../utils/adminLogic';
import type { Topic, TopicFormValues } from '../types/topic';

const STORAGE_KEY = 'arvind_admin_topics_v1';

export const SEED_TOPICS: Topic[] = [
  {
    id: 'topic-101',
    title: 'RHEL 9 Storage, Partitions & LVM Essentials',
    slug: 'rhel-9-storage-partitions-lvm-essentials',
    shortDescription:
      'Sample lab syllabus covering disk partitioning, physical volumes, volume groups, and safe XFS expansion on Linux servers.',
    detailedContent:
      'Sample Frontend Outline (Replace with final course text before production):\n\n1. Inspecting block devices with lsblk, blkid, and parted.\n2. Creating LVM physical volumes, volume groups, and logical volumes.\n3. Extending an active XFS filesystem without unmounting.\n4. Persisting mount points cleanly inside /etc/fstab and verifying with mount -a.',
    relatedCourse: 'Red Hat Linux (RHEL)',
    subject: 'Linux Storage Administration',
    coverImage: '/assets/images/linux_rhel_lab_1795164484674.jpg',
    coverImageName: 'linux_rhel_lab_1795164484674.jpg',
    tags: ['rhel-9', 'lvm', 'storage', 'xfs'],
    learningLevel: 'Intermediate',
    attachments: [
      {
        id: 'att-101-1',
        name: 'rhel-administration-notes.pdf',
        type: 'application/pdf',
        sizeBytes: 430080,
        url: '/study-materials/rhel-administration-notes.pdf',
        uploadedAt: '2026-03-14T10:15:00.000Z',
      },
      {
        id: 'att-101-2',
        name: 'linux-troubleshooting-lab-manual.pdf',
        type: 'application/pdf',
        sizeBytes: 399360,
        url: '/study-materials/linux-troubleshooting-lab-manual.pdf',
        uploadedAt: '2026-03-16T09:00:00.000Z',
      },
    ],
    displayOrder: 1,
    featured: true,
    status: 'Published',
    createdAt: '2026-02-18T09:30:00.000Z',
    updatedAt: '2026-03-19T14:20:00.000Z',
  },
  {
    id: 'topic-102',
    title: 'OSPF Multi-Area Routing & Neighbor Adjacencies',
    slug: 'ospf-multi-area-routing-neighbor-adjacencies',
    shortDescription:
      'Sample networking topic covering area 0 backbone design, router IDs, DR/BDR election, and common adjacency mismatches.',
    detailedContent:
      'Sample Frontend Outline (Replace with final course text before production):\n\n1. Reviewing OSPF packet types and neighbor state transitions.\n2. Configuring multi-area topologies with Area Border Routers.\n3. Diagnosing hello/dead timer, subnet mask, and authentication mismatches.\n4. Reading the LSDB and verifying inter-area routes in the routing table.',
    relatedCourse: 'Cisco CCNA & CCNP',
    subject: 'Enterprise Routing',
    coverImage: '/assets/images/cisco_network_lab_1795164486189.jpg',
    coverImageName: 'cisco_network_lab_1795164486189.jpg',
    tags: ['ospf', 'ccna', 'routing', 'cisco-ios'],
    learningLevel: 'Intermediate',
    attachments: [
      {
        id: 'att-102-1',
        name: 'cisco-ccna-ccnp-notes.pdf',
        type: 'application/pdf',
        sizeBytes: 522240,
        url: '/study-materials/cisco-ccna-ccnp-notes.pdf',
        uploadedAt: '2026-03-12T11:45:00.000Z',
      },
    ],
    displayOrder: 2,
    featured: true,
    status: 'Published',
    createdAt: '2026-02-22T11:00:00.000Z',
    updatedAt: '2026-03-18T16:10:00.000Z',
  },
  {
    id: 'topic-103',
    title: 'BGP Path Selection & Route Policy Verification',
    slug: 'bgp-path-selection-route-policy-verification',
    shortDescription:
      'Sample advanced routing lab guide walking through eBGP/iBGP peering, Local Preference, AS-Path prepending, and MED.',
    detailedContent:
      'Sample Frontend Outline (Replace with final course text before production):\n\n1. Establishing loopback-based iBGP and direct eBGP sessions.\n2. Controlling outbound path preference using Weight and Local Preference.\n3. Influencing inbound routing with AS-Path prepending and MED.\n4. Capturing and inspecting BGP tables during simulated link failovers.',
    relatedCourse: 'Cisco CCNA & CCNP',
    subject: 'BGP & Service Provider Routing',
    coverImage: '/assets/images/hands_on_troubleshooting_1795164485759.jpg',
    coverImageName: 'hands_on_troubleshooting_1795164485759.jpg',
    tags: ['bgp', 'ccnp', 'routing-policy'],
    learningLevel: 'Advanced',
    attachments: [
      {
        id: 'att-103-1',
        name: 'cisco-ios-fault-lab-guide.pdf',
        type: 'application/pdf',
        sizeBytes: 478208,
        url: '/study-materials/cisco-ios-fault-lab-guide.pdf',
        uploadedAt: '2026-03-10T15:30:00.000Z',
      },
    ],
    displayOrder: 3,
    featured: true,
    status: 'Published',
    createdAt: '2026-02-26T08:45:00.000Z',
    updatedAt: '2026-03-17T10:05:00.000Z',
  },
  {
    id: 'topic-104',
    title: 'AWS VPC Subnetting, Route Tables & NAT Gateways',
    slug: 'aws-vpc-subnetting-route-tables-nat-gateways',
    shortDescription:
      'Sample cloud architecture topic demonstrating public/private subnet design, route table associations, and outbound NAT routing.',
    detailedContent:
      'Sample Frontend Outline (Replace with final course text before production):\n\n1. Planning CIDR blocks across two Availability Zones.\n2. Attaching an Internet Gateway for public bastion subnets.\n3. Routing private application instances through a managed NAT Gateway.\n4. Validating traffic flow with Security Groups, NACLs, and VPC Flow Logs.',
    relatedCourse: 'AWS Cloud Infrastructure',
    subject: 'Cloud Networking',
    coverImage: '/assets/images/aws_cloud_infra_1795164482369.jpg',
    coverImageName: 'aws_cloud_infra_1795164482369.jpg',
    tags: ['aws', 'vpc', 'subnetting', 'cloud'],
    learningLevel: 'Beginner',
    attachments: [
      {
        id: 'att-104-1',
        name: 'virtualization-aws-lab-workbook.pdf',
        type: 'application/pdf',
        sizeBytes: 476160,
        url: '/study-materials/virtualization-aws-lab-workbook.pdf',
        uploadedAt: '2026-03-15T12:00:00.000Z',
      },
    ],
    displayOrder: 4,
    featured: false,
    status: 'Draft',
    createdAt: '2026-03-04T10:20:00.000Z',
    updatedAt: '2026-03-19T08:50:00.000Z',
  },
  {
    id: 'topic-105',
    title: 'Active Directory Forest, OUs & Group Policy Baseline',
    slug: 'active-directory-forest-ous-group-policy-baseline',
    shortDescription:
      'Sample enterprise Windows Server topic outlining domain controller promotion, OU hierarchy, and workstation security GPOs.',
    detailedContent:
      'Sample Frontend Outline (Replace with final course text before production):\n\n1. Promoting a primary Domain Controller and verifying DNS SRV records.\n2. Designing Organizational Units by department and server tier.\n3. Linking baseline Group Policy Objects and inspecting gpresult output.\n4. Delegating password reset permissions without granting Domain Admin.',
    relatedCourse: 'Windows Server & Active Directory',
    subject: 'Identity & Directory Services',
    coverImage: '/assets/images/corporate_it_workshop_1795164484663.jpg',
    coverImageName: 'corporate_it_workshop_1795164484663.jpg',
    tags: ['windows-server', 'active-directory', 'gpo'],
    learningLevel: 'Beginner',
    attachments: [
      {
        id: 'att-105-1',
        name: 'windows-server-aws-cloud-notes.pdf',
        type: 'application/pdf',
        sizeBytes: 412672,
        url: '/study-materials/windows-server-aws-cloud-notes.pdf',
        uploadedAt: '2026-03-08T13:15:00.000Z',
      },
    ],
    displayOrder: 5,
    featured: false,
    status: 'Published',
    createdAt: '2026-03-07T09:10:00.000Z',
    updatedAt: '2026-03-15T17:40:00.000Z',
  },
  {
    id: 'topic-106',
    title: 'SELinux Contexts, Booleans & Audit Log Triage',
    slug: 'selinux-contexts-booleans-audit-log-triage',
    shortDescription:
      'Sample Linux security topic focusing on enforcing mode troubleshooting using semanage, restorecon, and audit logs.',
    detailedContent:
      'Sample Frontend Outline (Replace with final course text before production):\n\n1. Checking SELinux modes and file/process security contexts.\n2. Restoring default directory labels with restorecon and semanage fcontext.\n3. Toggling persistent service booleans for web and file daemons.\n4. Reviewing AVC denials in /var/log/audit/audit.log.',
    relatedCourse: 'Red Hat Linux (RHEL)',
    subject: 'Linux Security',
    coverImage: '/assets/images/infra_workspace_vertical_1795164486330.jpg',
    coverImageName: 'infra_workspace_vertical_1795164486330.jpg',
    tags: ['selinux', 'security', 'rhel-9'],
    learningLevel: 'Advanced',
    attachments: [],
    displayOrder: 6,
    featured: false,
    status: 'Draft',
    createdAt: '2026-03-11T14:00:00.000Z',
    updatedAt: '2026-03-19T11:30:00.000Z',
  },
];

function loadFromStorage(): Topic[] {
  if (typeof window === 'undefined') return SEED_TOPICS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_TOPICS;
    const parsed = JSON.parse(raw) as Topic[];
    if (!Array.isArray(parsed) || parsed.length === 0) return SEED_TOPICS;
    return parsed;
  } catch {
    return SEED_TOPICS;
  }
}

function saveToStorage(topics: Topic[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
  } catch {
    // Ignore storage quota issues in mock frontend mode
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export const topicService = {
  async listTopics(): Promise<Topic[]> {
    await wait(160);
    return loadFromStorage();
  },

  async createTopic(values: TopicFormValues): Promise<Topic> {
    await wait(200);
    const topics = loadFromStorage();
    const now = new Date().toISOString();
    const created: Topic = {
      id: `topic-${Date.now()}`,
      title: values.title.trim(),
      slug: slugifyText(values.slug || values.title),
      shortDescription: values.shortDescription.trim(),
      detailedContent: values.detailedContent.trim(),
      relatedCourse: values.relatedCourse.trim(),
      subject: values.subject.trim() || 'General Track',
      coverImage: values.coverImage || '/assets/images/linux_rhel_lab_1795164484674.jpg',
      coverImageName: values.coverImageName || 'cover-image.jpg',
      tags: values.tags,
      learningLevel: values.learningLevel,
      attachments: values.attachments,
      displayOrder: values.displayOrder,
      featured: values.featured,
      status: values.status,
      createdAt: now,
      updatedAt: now,
    };
    const next = [created, ...topics];
    saveToStorage(next);
    return created;
  },

  async updateTopic(id: string, values: TopicFormValues): Promise<Topic> {
    await wait(180);
    const topics = loadFromStorage();
    const existing = topics.find((t) => t.id === id);
    if (!existing) {
      throw new Error('Topic record could not be found.');
    }
    const updated: Topic = {
      ...existing,
      title: values.title.trim(),
      slug: slugifyText(values.slug || values.title),
      shortDescription: values.shortDescription.trim(),
      detailedContent: values.detailedContent.trim(),
      relatedCourse: values.relatedCourse.trim(),
      subject: values.subject.trim() || existing.subject,
      coverImage: values.coverImage || existing.coverImage,
      coverImageName: values.coverImageName || existing.coverImageName,
      tags: values.tags,
      learningLevel: values.learningLevel,
      attachments: values.attachments,
      displayOrder: values.displayOrder,
      featured: values.featured,
      status: values.status,
      updatedAt: new Date().toISOString(),
    };
    const next = topics.map((t) => (t.id === id ? updated : t));
    saveToStorage(next);
    return updated;
  },

  async patchTopic(
    id: string,
    patch: Partial<Pick<Topic, 'featured' | 'status' | 'displayOrder'>>
  ): Promise<Topic> {
    await wait(120);
    const topics = loadFromStorage();
    const existing = topics.find((t) => t.id === id);
    if (!existing) {
      throw new Error('Topic record could not be found.');
    }
    const updated: Topic = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    const next = topics.map((t) => (t.id === id ? updated : t));
    saveToStorage(next);
    return updated;
  },

  async deleteTopic(id: string): Promise<void> {
    await wait(150);
    const topics = loadFromStorage();
    const next = topics.filter((t) => t.id !== id);
    saveToStorage(next);
  },

  async resetDemoTopics(): Promise<Topic[]> {
    await wait(140);
    saveToStorage(SEED_TOPICS);
    return SEED_TOPICS;
  },
};
