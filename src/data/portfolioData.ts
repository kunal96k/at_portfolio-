export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  items: string[];
}

export interface ExpertiseDomain {
  number: string;
  title: string;
  description: string;
}

export interface CorporatePartner {
  organization: string;
  program: string;
  location?: string;
}

export interface PhilosophyStep {
  number: string;
  title: string;
  description: string;
}

export interface WhyLearnPoint {
  number: string;
  title: string;
  description: string;
}

export interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

export interface ProjectItem {
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  coverImage: string;
  featured: boolean;
  year: string;
  industry: string;
  client: string;
  duration: string;
  problem: string[];
  solution: string[];
  challenge: string[];
  summary: string[];
  galleryImages: string[];
}

export interface StudentTestimonialItem {
  id: string;
  name: string;
  role?: string;
  course: string;
  quote: string;
  photo: string;
  isCustom?: boolean;
}

export interface FaqItem {
  number: string;
  question: string;
  answer: string;
}

export interface BlogSection {
  heading: string;
  body: string;
  images?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  coverImage: string;
  mostViewed?: boolean;
  sections: BlogSection[];
}

export interface TrainingBatch {
  id: string;
  title: string;
  category: 'Linux' | 'Networking' | 'Cloud';
  batchDate: string;
  batchTime: string;
  mode: string;
  summary: string;
  modules: string[];
  coverImage: string;
  isCustom?: boolean;
}

export interface StudyResource {
  id: string;
  title: string;
  sectionType: 'Notes' | 'Lab Sections';
  domain: string;
  summary: string;
  topics: string[];
  fileUrl: string;
  fileName: string;
  fileType: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  category: 'Training' | 'Labs' | 'Infrastructure';
  image: string;
  caption: string;
}

export const ASSETS = {
  avatar: '/assets/aistudio/image_e26475f0.png',
  portraitFront: '/assets/aistudio/image_e26475f0.png',
  portraitBackWorkspace: '/src/assets/images/infra_workspace_vertical_1795164486330.jpg',
  creatorLogo: '/assets/aistudio/image_e26475f0.png',
  aboutStudio1: '/src/assets/images/hands_on_troubleshooting_1795164485759.jpg',
  aboutStudio2: '/src/assets/images/infra_workspace_vertical_1795164486330.jpg',
  aboutStudio3: '/src/assets/images/corporate_it_workshop_1795164484663.jpg',
  courseLinux: '/src/assets/images/linux_rhel_lab_1795164484674.jpg',
  courseCisco: '/src/assets/images/cisco_network_lab_1795164486189.jpg',
  courseAws: '/src/assets/images/aws_cloud_infra_1795164482369.jpg',
  courseCorporate: '/src/assets/images/corporate_it_workshop_1795164484663.jpg',
  courseTroubleshooting: '/src/assets/images/hands_on_troubleshooting_1795164485759.jpg',
};

export const PROFILE = {
  name: 'Arvind Thevar',
  roleTitle: 'IT Trainer & IT Infrastructure Professional',
  heroEyebrow: 'IT Trainer & IT Infrastructure Professional · 15+ Years',
  heroLeft: 'ARVIND',
  heroRight: 'THEVAR',
  heroTagline: 'Real infrastructure. Real labs. Real careers.',
  heroIntro1:
    'I am Arvind Thevar, an IT Trainer and IT Infrastructure Professional with more than 15 years of experience in the IT industry. I have spent my career building, managing and troubleshooting enterprise infrastructure, and I now bring that real-world experience into the training room.',
  heroIntro2:
    'I help students, freshers, working professionals and aspiring engineers master Linux, Cisco networking, Windows Server, virtualization and cloud through practical, lab-driven training that prepares them for real IT environments.',
  aboutTagline: 'Experience you can learn from, not just read about.',
  aboutSummary:
    'I am an IT Trainer and IT Infrastructure Professional with more than 15 years of hands-on experience in the IT industry—building, managing and troubleshooting Linux and Windows servers, enterprise networks, virtualization platforms and cloud infrastructure.',
  aboutParagraphs: [
    'I am an IT Trainer and IT Infrastructure Professional with more than 15 years of hands-on experience in the IT industry. My career has been built on the technologies that keep businesses running: Linux and Windows servers, enterprise networks, virtualization platforms and, increasingly, the cloud.',
    'Over these years I have worked on server deployments, network design and configuration, system administration, performance tuning and day-to-day troubleshooting in live production environments. I have seen what happens when a server goes down at the worst possible moment, and I know the skills an engineer needs to bring it back up with confidence.',
    'That experience shapes everything I teach. I do not train from slides alone. My sessions are built around live labs, real configurations and the kind of problems engineers actually face at work. Every concept is connected to a practical task, and every task is connected to a real job role.',
    'My learners include college students, freshers starting their careers, working professionals moving into infrastructure roles, and engineers preparing for certifications such as RHEL, CCNA and CCNP. I also work with organisations that want to upskill their IT teams with structured, job-focused training.',
    'What drives me is simple. I enjoy watching a learner go from "I don\'t know where to start" to "I configured it, broke it and fixed it myself." That shift in confidence is what turns a student into a professional, and it is what I aim to deliver in every batch I teach.',
  ],
  missionTagline: 'Building the next generation of IT infrastructure professionals.',
  missionParagraphs: [
    'My mission is to develop skilled, confident and industry-ready IT professionals. I want every learner who trains with me to understand technology deeply, apply it practically and solve real problems without hesitation.',
    'By combining more than 15 years of industrial experience with structured, hands-on training, I aim to close the gap between classroom learning and workplace expectations. I believe that the right guidance can change the direction of a career, and I am committed to providing that guidance to every student, professional and organisation I work with.',
  ],
  phone: '+91 88888 29652',
  phoneHref: 'tel:+918888829652',
  whatsappNumber: '8888829652',
  email: 'arvindthaver@gmail.com',
  officeAddress:
    "Office No-2, First Floor, Kanchawala Avenue, College Rd, above Viju's Dabeli, near BYK College, Kulkarni Baug, Nashik, Maharashtra 422005, India",
  officeMapUrl:
    'https://www.google.com/maps/search/?api=1&query=Office+No-2,+First+Floor,+Kanchawala+Avenue,+College+Rd,+near+BYK+College,+Kulkarni+Baug,+Nashik,+Maharashtra+422005,+India',
  socials: [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/arvind-thevar-9a87719a/',
      id: 'linkedin' as const,
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/arvindthevar?fqnt=Y2t3YWY3Mm9pdjJr',
      id: 'instagram' as const,
    },
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/arvind.thevar.90',
      id: 'facebook' as const,
    },
    {
      label: 'WhatsApp',
      href: 'https://wa.me/918888829652',
      id: 'whatsapp' as const,
    },
  ],
};

export const SERVICES: ServiceItem[] = [
  {
    id: 'linux-rhel',
    number: '1.',
    title: 'LINUX & RED HAT (RHEL)',
    items: [
      'Red Hat Enterprise Linux (RHEL) installation, configuration & RHCSA / RHCE preparation',
      'Users, permissions, storage, systemd services & shell scripting',
      'Daily system administration tasks & live Linux troubleshooting',
      'Server deployment, performance tuning & production reliability',
    ],
  },
  {
    id: 'cisco-networking',
    number: '2.',
    title: 'CISCO CCNA & CCNP',
    items: [
      'Networking fundamentals, IP addressing, subnetting, switching & routing',
      'Hands-on Cisco IOS configuration in real-world lab topologies',
      'Advanced routing & switching: OSPF, EIGRP, BGP & enterprise redundancy',
      'Network Security: Firewalls, ACLs, VPNs & secure device hardening',
    ],
  },
  {
    id: 'windows-cloud',
    number: '3.',
    title: 'WINDOWS SERVER & CLOUD',
    items: [
      'Windows Server Administration: Active Directory, DNS, DHCP & Group Policy',
      'File services, directory management & enterprise Microsoft workflows',
      'Cloud Computing concepts, service models & AWS Solutions Architect Associate',
      'Deploying, managing & migrating infrastructure workloads to the cloud',
    ],
  },
  {
    id: 'virtualization-infra',
    number: '4.',
    title: 'VIRTUALIZATION & INFRASTRUCTURE',
    items: [
      'Virtualization Technologies: VMs, hypervisors & virtual lab networks',
      'Server Infrastructure & Management: planning, deploying & monitoring',
      'Structured, step-by-step IT Infrastructure troubleshooting methodology',
      'Corporate & institutional team upskilling tailored to real job roles',
    ],
  },
];

export const EXPERTISE_DOMAINS: ExpertiseDomain[] = [
  {
    number: '01',
    title: 'Red Hat Enterprise Linux (RHEL)',
    description:
      'Install, configure and manage RHEL systems, with focused preparation for RHCSA and RHCE certification.',
  },
  {
    number: '02',
    title: 'Linux System Administration',
    description:
      'Users, permissions, storage, services, shell scripting and the daily tasks of a Linux administrator.',
  },
  {
    number: '03',
    title: 'Cisco CCNA',
    description:
      'Networking fundamentals, IP addressing, subnetting, switching, routing and Cisco IOS configuration.',
  },
  {
    number: '04',
    title: 'Cisco CCNP',
    description:
      'Advanced routing and switching, OSPF, EIGRP, BGP, redundancy and enterprise network design.',
  },
  {
    number: '05',
    title: 'Windows Server Administration',
    description:
      'Active Directory, DNS, DHCP, Group Policy, file services and Windows Server management.',
  },
  {
    number: '06',
    title: 'Cloud Computing',
    description:
      'Cloud concepts, service models, deploying and managing workloads, and migrating infrastructure to the cloud.',
  },
  {
    number: '07',
    title: 'Network Security',
    description:
      'Firewalls, ACLs, VPNs, secure device hardening and protecting networks against common threats.',
  },
  {
    number: '08',
    title: 'Virtualization Technologies',
    description:
      'Building and managing virtual machines, hypervisors and virtual networks in a lab environment.',
  },
  {
    number: '09',
    title: 'Server Infrastructure & Management',
    description:
      'Planning, deploying, monitoring and maintaining servers for reliability and performance.',
  },
  {
    number: '10',
    title: 'IT Infrastructure & Troubleshooting',
    description:
      'A structured, step-by-step method to diagnose and fix server, network and system issues fast.',
  },
];

export const CORPORATE_PARTNERS: CorporatePartner[] = [
  {
    organization: 'RVR Edutech',
    program: 'CCNP Voice/Collaboration and CCNP Security',
  },
  {
    organization: 'Maharashtra Police Academy, Nashik',
    program: 'CCNA and Cyber Security',
  },
  {
    organization: 'Ashoka Buildcon, Nashik',
    program: 'Cyber Security',
  },
  {
    organization: 'IIHT, Mumbai',
    program: 'CCNA',
  },
  {
    organization: 'CMS Technologies',
    program: 'Microsoft (MCSE)',
  },
  {
    organization: 'SNJB College, Chandwad',
    program: 'CCNA',
  },
  {
    organization: 'Sandip Foundation (SITRC)',
    program: 'CCNA',
  },
  {
    organization: 'Government Polytechnic, Nashik',
    program: 'CCNA and Microsoft',
  },
];

export const TRAINING_PHILOSOPHY = {
  tagline: 'Understand the concept. Build it. Break it. Fix it.',
  intro: [
    'I believe theory only becomes skill when you apply it. Knowing what a routing protocol does is useful; configuring it, watching it fail and bringing it back is what makes you employable. My training bridges that gap by pairing every concept with the way it is used in real enterprise environments.',
    'After 15+ years in the industry, I know which topics matter most on the job, which mistakes engineers commonly make, and what interviewers actually test. I build my courses around those realities.',
  ],
  steps: [
    {
      number: '01.',
      title: 'Concept first, in plain language',
      description:
        'I explain the "why" before the "how," so you understand what you are configuring.',
    },
    {
      number: '02.',
      title: 'Step-by-step configuration',
      description: 'We implement each topic together in a live lab, one clear step at a time.',
    },
    {
      number: '03.',
      title: 'Real-world scenarios',
      description: 'Labs are based on industrial case studies, not textbook examples.',
    },
    {
      number: '04.',
      title: 'Live troubleshooting',
      description:
        'I introduce real faults into servers and networks so you learn to diagnose and fix them under pressure.',
    },
    {
      number: '05.',
      title: 'Practical assignments',
      description:
        'Industry-oriented tasks reinforce each module and build a portfolio of hands-on work.',
    },
    {
      number: '06.',
      title: 'Certification preparation',
      description:
        'Exam-focused practice for RHCSA, RHCE, CCNA, CCNP and related certifications.',
    },
    {
      number: '07.',
      title: 'Interview readiness',
      description: 'Mock interviews, common technical questions and guidance on presenting your skills.',
    },
    {
      number: '08.',
      title: 'Confidence to work independently',
      description:
        'By the end, you can walk into a real IT environment and contribute from day one.',
    },
  ] as PhilosophyStep[],
};

export const WHY_LEARN_ITEMS: WhyLearnPoint[] = [
  {
    number: '01',
    title: '15+ years of real industry experience',
    description:
      'You learn from someone who has managed production servers and enterprise networks, not just studied them.',
  },
  {
    number: '02',
    title: 'Hands-on, lab-based learning',
    description:
      'Most of your time is spent configuring, testing and troubleshooting in live lab environments.',
  },
  {
    number: '03',
    title: 'Linux, Windows and Cisco under one roof',
    description:
      'Get a complete infrastructure skill set, from servers to networks to cloud, instead of isolated topics.',
  },
  {
    number: '04',
    title: 'Troubleshooting skills employers value',
    description:
      'I teach a structured method for finding and fixing faults—the skill that separates good engineers from great ones.',
  },
  {
    number: '05',
    title: 'Certification-focused preparation',
    description: 'Clear, exam-oriented guidance for RHEL, CCNA, CCNP and related certifications.',
  },
  {
    number: '06',
    title: 'Interview and career guidance',
    description:
      'Mock interviews, technical Q&A practice and honest advice on building your IT career.',
  },
  {
    number: '07',
    title: 'Personal mentoring',
    description: 'I stay accessible to answer questions, clear doubts and guide you beyond the classroom.',
  },
];

export const ABOUT_STATS: StatItem[] = [
  { value: 15, suffix: '+', label: 'Years of Industry Experience' },
  { value: 10, suffix: '', label: 'Core Training Domains' },
  { value: 8, suffix: '', label: 'Institutional & Corporate Partners' },
];

export const PROJECTS: ProjectItem[] = [
  {
    slug: 'rhel-rhcsa-rhce-lab-track',
    title: 'Red Hat Enterprise Linux (RHEL) Lab Track',
    category: 'Linux & Server Admin',
    shortDescription:
      'Hands-on RHEL administration covering installation, storage, users, permissions, systemd services, shell scripting and RHCSA / RHCE exam preparation.',
    coverImage: '/src/assets/images/linux_rhel_lab_1795164484674.jpg',
    featured: true,
    year: 'Active Track',
    industry: 'Enterprise Linux Infrastructure',
    client: 'Students, Freshers & IT Teams',
    duration: 'Lab-Driven Cohort',
    problem: [
      'Many learners study Linux commands from slides without ever deploying, configuring or recovering a real Red Hat Enterprise Linux server.',
      'In live production environments, administrators must manage permissions, storage volumes, services and boot recovery under time pressure.',
    ],
    solution: [
      'Every topic begins with the "why" in plain language, followed by step-by-step live lab implementation on RHEL systems.',
      'Learners practice real system administration tasks, shell scripting and exam-focused scenarios aligned with RHCSA and RHCE objectives.',
    ],
    challenge: [
      'Transitioning learners from memorizing syntax to diagnosing real faults independently requires deliberate fault-injection exercises.',
    ],
    summary: [
      'Builds complete day-one confidence in Red Hat Enterprise Linux administration, daily operations and structured troubleshooting.',
    ],
    galleryImages: [
      '/src/assets/images/linux_rhel_lab_1795164484674.jpg',
      '/src/assets/images/hands_on_troubleshooting_1795164485759.jpg',
    ],
  },
  {
    slug: 'cisco-ccna-ccnp-enterprise-networking',
    title: 'Cisco CCNA & CCNP Enterprise Networking',
    category: 'Cisco Networking',
    shortDescription:
      'From IP addressing, subnetting and Cisco IOS switching/routing to advanced OSPF, EIGRP, BGP, redundancy and enterprise network security.',
    coverImage: '/src/assets/images/cisco_network_lab_1795164486189.jpg',
    featured: true,
    year: 'Active Track',
    industry: 'Enterprise Routing & Switching',
    client: 'Engineers & Institutional Batches',
    duration: 'Lab-Driven Cohort',
    problem: [
      'Understanding routing protocols in theory does not prepare engineers for misconfigured links, routing loops or enterprise redundancy failures.',
    ],
    solution: [
      'Step-by-step Cisco IOS configuration labs covering subnetting, switching, routing, OSPF, EIGRP, BGP, firewalls, ACLs and VPN hardening.',
      'Live fault-injection labs teach learners to trace, isolate and restore network connectivity methodically.',
    ],
    challenge: [
      'Connecting foundational CCNA networking concepts directly to multi-router CCNP enterprise topologies and security requirements.',
    ],
    summary: [
      'Equips networking aspirants and working engineers with practical Cisco IOS fluency, certification readiness and real troubleshooting discipline.',
    ],
    galleryImages: [
      '/src/assets/images/cisco_network_lab_1795164486189.jpg',
      '/src/assets/images/hands_on_troubleshooting_1795164485759.jpg',
    ],
  },
  {
    slug: 'aws-solutions-architect-cloud-labs',
    title: 'AWS Solutions Architect & Cloud Computing',
    category: 'Cloud Computing',
    shortDescription:
      'Practical training in cloud concepts, service models, deploying and managing AWS workloads, and migrating on-premises infrastructure to the cloud.',
    coverImage: '/src/assets/images/aws_cloud_infra_1795164482369.jpg',
    featured: true,
    year: 'Active Track',
    industry: 'Cloud & Hybrid Infrastructure',
    client: 'Aspiring Cloud & Infra Engineers',
    duration: 'Lab-Driven Cohort',
    problem: [
      'Traditional server and network administrators need a practical bridge to deploy, secure and migrate real infrastructure workloads onto cloud platforms.',
    ],
    solution: [
      'Combines foundational Linux, networking and virtualization knowledge with Amazon Web Services Solutions Architect Associate architecture labs.',
    ],
    challenge: [
      'Ensuring learners understand underlying networking, identity and server fundamentals so cloud architectures remain secure and reliable.',
    ],
    summary: [
      'Prepares learners to architect, deploy and troubleshoot resilient AWS and hybrid cloud environments.',
    ],
    galleryImages: [
      '/src/assets/images/aws_cloud_infra_1795164482369.jpg',
      '/src/assets/images/linux_rhel_lab_1795164484674.jpg',
    ],
  },
  {
    slug: 'corporate-institutional-training-programs',
    title: 'Corporate & Institutional Training Delivery',
    category: 'Corporate & Institutional',
    shortDescription:
      'Specialised CCNA, CCNP Voice/Security, Cyber Security and Microsoft (MCSE) training delivered for government bodies, enterprises and colleges.',
    coverImage: '/src/assets/images/corporate_it_workshop_1795164484663.jpg',
    featured: true,
    year: 'Verified Programs',
    industry: 'Government, Corporate & Education',
    client: '8 Named Organisations & Colleges',
    duration: 'Custom Workshops & Batches',
    problem: [
      'Organisations and technical colleges require structured, job-focused infrastructure and security training grounded in live production reality.',
    ],
    solution: [
      'Delivered tailored programmes for RVR Edutech, Maharashtra Police Academy (Nashik), Ashoka Buildcon (Nashik), IIHT (Mumbai), CMS Technologies, SNJB College (Chandwad), Sandip Foundation (SITRC) and Government Polytechnic (Nashik).',
    ],
    challenge: [
      'Adapting deep enterprise networking, Cyber Security and Microsoft infrastructure tracks to diverse learner backgrounds while maintaining hands-on rigor.',
    ],
    summary: [
      'Proven classroom and institutional delivery focused on practical skills, device hardening and operational confidence.',
    ],
    galleryImages: [
      '/src/assets/images/corporate_it_workshop_1795164484663.jpg',
      '/src/assets/images/cisco_network_lab_1795164486189.jpg',
    ],
  },
];

export const FAQS: FaqItem[] = [
  {
    number: '1.',
    question: 'WHICH COURSES AND DOMAINS DO YOU TEACH?',
    answer:
      'I deliver hands-on training across 10 core infrastructure domains: Red Hat Enterprise Linux (RHEL / RHCSA & RHCE), Linux System Administration, Cisco CCNA, Cisco CCNP, Windows Server Administration, Cloud Computing (including AWS Solutions Architect Associate), Network Security, Virtualization Technologies, Server Infrastructure & Management, and IT Infrastructure Troubleshooting.',
  },
  {
    number: '2.',
    question: 'HOW IS YOUR TRAINING DIFFERENT FROM SLIDE-BASED COURSES?',
    answer:
      'My philosophy is simple: Understand the concept. Build it. Break it. Fix it. Sessions are built around live labs, real configurations, industrial case studies and live fault troubleshooting—not just slides.',
  },
  {
    number: '3.',
    question: 'WHO CAN JOIN YOUR TRAINING BATCHES?',
    answer:
      'My learners include college students, freshers starting their IT careers, working professionals moving into infrastructure roles, engineers preparing for RHEL, CCNA, CCNP or AWS certifications, and organisations upskilling their IT teams.',
  },
  {
    number: '4.',
    question: 'DO YOU COVER CERTIFICATION AND INTERVIEW PREPARATION?',
    answer:
      'Yes. Every track includes exam-focused practice for certifications such as RHCSA, RHCE, CCNA and CCNP, along with mock interviews, common technical Q&A practice and career guidance.',
  },
  {
    number: '5.',
    question: 'DO YOU CONDUCT CORPORATE AND COLLEGE TRAINING?',
    answer:
      'Yes. I have delivered specialised programmes for organisations, government bodies and colleges including RVR Edutech, Maharashtra Police Academy (Nashik), Ashoka Buildcon (Nashik), IIHT (Mumbai), CMS Technologies, SNJB College (Chandwad), Sandip Foundation (SITRC) and Government Polytechnic (Nashik).',
  },
  {
    number: '6.',
    question: 'HOW CAN I BOOK A FREE CONSULTATION OR CHECK UPCOMING BATCHES?',
    answer:
      'You can explore upcoming batches on the Upcoming Training page, reach out through the contact form below, email arvindthaver@gmail.com, or call / WhatsApp directly at +91 88888 29652.',
  },
];

export const BLOGS: BlogPost[] = [
  {
    slug: 'build-it-break-it-fix-it-training-methodology',
    title: 'Understand the Concept. Build It. Break It. Fix It.',
    category: 'Training Philosophy',
    date: 'Infrastructure Guide',
    excerpt:
      'Why theory alone never prepares engineers for production outages—and how live fault-injection labs turn IT learners into confident professionals.',
    coverImage: '/src/assets/images/hands_on_troubleshooting_1795164485759.jpg',
    mostViewed: true,
    sections: [
      {
        heading: '1. Concept First, in Plain Language',
        body: 'Before typing a single command on a router or Linux host, engineers need to understand the "why" behind the configuration. Explaining protocols, directory services and storage layers in plain language creates a mental model that holds up during real outages.',
      },
      {
        heading: '2. Step-by-Step Live Lab Implementation',
        body: 'Knowing what a routing protocol does is useful; configuring it in a live lab, watching how interfaces and tables behave, and validating every change step by step is where practical skill begins.',
        images: ['/src/assets/images/corporate_it_workshop_1795164484663.jpg'],
      },
      {
        heading: '3. Live Faults & Structured Troubleshooting',
        body: 'Introducing real faults into servers and networks teaches learners to diagnose root causes calmly under pressure—moving from "I don\'t know where to start" to "I configured it, broke it and fixed it myself."',
      },
    ],
  },
  {
    slug: 'preparing-for-rhcsa-rhce-on-rhel',
    title: 'Practical Roadmap to Red Hat Enterprise Linux (RHCSA & RHCE)',
    category: 'Linux & RHEL',
    date: 'Study Guide',
    excerpt:
      'Core skills every aspiring Linux administrator must master: users, permissions, storage, systemd services, shell scripting and structured recovery.',
    coverImage: '/src/assets/images/linux_rhel_lab_1795164484674.jpg',
    sections: [
      {
        heading: '1. Core RHEL System Administration',
        body: 'Start with clean installation, user and group permissions, partition and LVM storage management, systemd service control and firewall configuration on Red Hat Enterprise Linux.',
      },
      {
        heading: '2. Automation & Daily Operations',
        body: 'Combine shell scripting, scheduled jobs and repeatable configuration habits to handle daily Linux administration tasks accurately and prepare for performance-based RHCSA and RHCE exams.',
      },
    ],
  },
  {
    slug: 'from-ccna-fundamentals-to-ccnp-enterprise-routing',
    title: 'From Cisco CCNA Fundamentals to CCNP Enterprise Networks',
    category: 'Cisco Networking',
    date: 'Networking Guide',
    excerpt:
      'How IP addressing, subnetting and Cisco IOS switching lay the foundation for OSPF, EIGRP, BGP, redundancy and secure network design.',
    coverImage: '/src/assets/images/cisco_network_lab_1795164486189.jpg',
    sections: [
      {
        heading: '1. Mastering Subnetting & Switching',
        body: 'Strong CCNA fundamentals—IP addressing, VLANs, trunking and Cisco IOS CLI fluency—make every advanced enterprise protocol easier to design and troubleshoot.',
      },
      {
        heading: '2. Enterprise Routing & Network Security',
        body: 'Scaling to CCNP means designing redundant topologies with OSPF, EIGRP and BGP while securing infrastructure with firewalls, ACLs, VPNs and device hardening.',
      },
    ],
  },
  {
    slug: 'bridging-on-prem-servers-to-aws-cloud',
    title: 'Bridging On-Premises Servers & Virtualization to AWS Cloud',
    category: 'Cloud & Servers',
    date: 'Cloud Guide',
    excerpt:
      'Why hands-on experience with Linux, Windows Server, networking and hypervisors gives you a decisive advantage when architecting AWS workloads.',
    coverImage: '/src/assets/images/aws_cloud_infra_1795164482369.jpg',
    sections: [
      {
        heading: '1. Infrastructure Fundamentals Power the Cloud',
        body: 'Cloud computing builds directly on virtualization, TCP/IP routing, DNS, Linux/Windows server administration and security policies. Understanding those layers makes AWS architecture intuitive.',
      },
      {
        heading: '2. Deploying & Migrating Workloads Safely',
        body: 'Through practical labs, learners connect on-premises infrastructure thinking with AWS Solutions Architect Associate design patterns for reliability, security and scalability.',
      },
    ],
  },
];

export const INITIAL_UPCOMING_BATCHES: TrainingBatch[] = [
  {
    id: 'redhat-linux-batch',
    title: 'Red Hat Linux (RHEL)',
    category: 'Linux',
    batchDate: 'Date to be announced (Editable below)',
    batchTime: 'Weekday / Weekend Slots',
    mode: 'Live Lab-Driven Training',
    summary:
      'Install, configure and manage Red Hat Enterprise Linux systems with practical Linux System Administration and focused preparation for RHCSA and RHCE certification.',
    modules: [
      'RHEL Installation, Users, Groups & Permissions',
      'Storage Management, Services & System Administration',
      'Shell Scripting & Live Troubleshooting Labs',
      'RHCSA & RHCE Exam-Focused Practical Preparation',
    ],
    coverImage: '/src/assets/images/linux_rhel_lab_1795164484674.jpg',
  },
  {
    id: 'cisco-ccna-batch',
    title: 'Cisco Certified Network Associate (CCNA)',
    category: 'Networking',
    batchDate: 'Date to be announced (Editable below)',
    batchTime: 'Weekday / Weekend Slots',
    mode: 'Live Lab-Driven Training',
    summary:
      'Master networking fundamentals, IP addressing, subnetting, switching, routing, Cisco IOS configuration and practical fault troubleshooting.',
    modules: [
      'Networking Fundamentals, IP Addressing & Subnetting',
      'Enterprise Switching, VLANs & Cisco IOS CLI',
      'Routing Protocols, ACLs & Network Security Basics',
      'Live Network Troubleshooting, CCNA Prep & Mock Interviews',
    ],
    coverImage: '/src/assets/images/cisco_network_lab_1795164486189.jpg',
  },
  {
    id: 'aws-saa-batch',
    title: 'Amazon Web Services Solutions Architect Associate (AWS)',
    category: 'Cloud',
    batchDate: 'Date to be announced (Editable below)',
    batchTime: 'Weekday / Weekend Slots',
    mode: 'Live Lab-Driven Training',
    summary:
      'Learn cloud concepts, service models, deploying and managing AWS workloads, and migrating enterprise infrastructure to the cloud with hands-on labs.',
    modules: [
      'Cloud Concepts, IAM & Core AWS Networking (VPC)',
      'Compute, Storage & Resilient Workload Deployment',
      'Security Hardening, Monitoring & High Availability',
      'Infrastructure Migration & Solutions Architect Exam Prep',
    ],
    coverImage: '/src/assets/images/aws_cloud_infra_1795164482369.jpg',
  },
];

export const INITIAL_STUDENT_TESTIMONIALS: StudentTestimonialItem[] = [
  {
    id: 'placed-kalyani-bachhav',
    name: 'Kalyani Bachhav',
    role: 'Matrix Smart Technologies Pvt. Ltd. | Jr. Technical Executive',
    course: 'Linux & Network Security',
    quote:
      "Arvind Sir's live troubleshooting labs completely transformed how I approach real IT infrastructure. Building servers, intentionally breaking configurations, and fixing them step by step gave me the confidence to clear my technical interviews and start strong as a Jr. Technical Executive.",
    photo: '/assets/students/kalyani_bachhav.jpg',
  },
  {
    id: 'placed-chetana-sonawane',
    name: 'Chetana Sonawane',
    role: 'Matrix Smart Technologies Pvt. Ltd. | Jr. Technical Executive',
    course: 'Red Hat Linux (RHEL) & Windows Server',
    quote:
      'Every session was hands-on from day one—no memorizing slides. Learning Linux administration, Windows Server, and structured fault diagnosis from a practitioner with 15+ years in production environments helped me transition smoothly into my role at Matrix Smart Technologies.',
    photo: '/assets/students/chetana_sonawane.jpg',
  },
  {
    id: 'placed-tejas-thakur',
    name: 'Tejas Thakur',
    role: 'Cloud Armour IT Consultancy Pvt. Ltd. | Jr. Network Engineer',
    course: 'Cisco CCNA & Enterprise Networking',
    quote:
      "Subnetting, VLANs, OSPF, and ACL troubleshooting finally clicked during Arvind Sir's live Cisco IOS lab topologies. The real-world fault scenarios and mock interview sessions prepared me directly for day-one responsibilities as a Jr. Network Engineer.",
    photo: '/assets/students/tejas_thakur.jpg',
  },
];

export const STUDY_RESOURCES: StudyResource[] = [
  {
    id: 'rhel-notes',
    title: 'Red Hat Enterprise Linux (RHEL) Administration Notes',
    sectionType: 'Notes',
    domain: 'Linux & RHEL',
    summary:
      'Structured study notes covering RHEL installation, user & permission management, storage configuration, systemd services and shell scripting.',
    topics: [
      'File system hierarchy, permissions & ACLs',
      'Storage partitioning, LVM & mounting workflows',
      'Managing systemd services & RHCSA / RHCE command reference',
    ],
    fileUrl: '/study-materials/rhel-administration-notes.pdf',
    fileName: 'rhel-administration-notes.pdf',
    fileType: 'PDF Study Notes · 100% Free',
  },
  {
    id: 'rhel-labs',
    title: 'Linux System Administration & Troubleshooting Lab Section',
    sectionType: 'Lab Sections',
    domain: 'Linux & RHEL',
    summary:
      'Hands-on lab tasks built around real server deployments, service configuration and live fault recovery exercises.',
    topics: [
      'Lab 01: Multi-user server setup & permission hardening',
      'Lab 02: Storage expansion, service automation & shell scripts',
      'Lab 03: Break-and-fix server boot & service troubleshooting',
    ],
    fileUrl: '/study-materials/linux-troubleshooting-lab-manual.pdf',
    fileName: 'linux-troubleshooting-lab-manual.pdf',
    fileType: 'PDF Lab Manual · 100% Free',
  },
  {
    id: 'cisco-notes',
    title: 'Cisco CCNA & CCNP Routing and Switching Notes',
    sectionType: 'Notes',
    domain: 'Cisco Networking',
    summary:
      'Plain-language reference notes covering IP addressing, subnetting, Cisco IOS CLI, OSPF, EIGRP, BGP, redundancy and network security.',
    topics: [
      'IPv4/IPv6 addressing & rapid subnetting guide',
      'Switching, VLANs, STP & inter-VLAN routing fundamentals',
      'OSPF, EIGRP, BGP, ACLs, VPNs & firewall hardening notes',
    ],
    fileUrl: '/study-materials/cisco-ccna-ccnp-notes.pdf',
    fileName: 'cisco-ccna-ccnp-notes.pdf',
    fileType: 'PDF Study Notes · 100% Free',
  },
  {
    id: 'cisco-labs',
    title: 'Cisco IOS Topology & Live Fault Troubleshooting Lab Section',
    sectionType: 'Lab Sections',
    domain: 'Cisco Networking',
    summary:
      'Step-by-step lab topologies where learners configure routers and switches from scratch, test failure states and restore enterprise networks.',
    topics: [
      'Lab 01: Branch-to-HQ switching & routing configuration',
      'Lab 02: Multi-area OSPF & redundancy failover testing',
      'Lab 03: Diagnosing broken ACLs, routing loops & VPN tunnels',
    ],
    fileUrl: '/study-materials/cisco-ios-fault-lab-guide.pdf',
    fileName: 'cisco-ios-fault-lab-guide.pdf',
    fileType: 'PDF Lab Guide · 100% Free',
  },
  {
    id: 'windows-cloud-notes',
    title: 'Windows Server, Virtualization & AWS Cloud Notes',
    sectionType: 'Notes',
    domain: 'Windows & Cloud',
    summary:
      'Concise study notes on Active Directory, DNS, DHCP, Group Policy, hypervisors and AWS Solutions Architect Associate cloud concepts.',
    topics: [
      'Active Directory Domain Services, DNS, DHCP & Group Policy',
      'Virtual machines, hypervisors & virtual network architecture',
      'Cloud service models, workload deployment & migration checklist',
    ],
    fileUrl: '/study-materials/windows-server-aws-cloud-notes.pdf',
    fileName: 'windows-server-aws-cloud-notes.pdf',
    fileType: 'PDF Study Notes · 100% Free',
  },
  {
    id: 'aws-virtualization-labs',
    title: 'Virtualization, Windows Server & AWS Cloud Lab Section',
    sectionType: 'Lab Sections',
    domain: 'Windows & Cloud',
    summary:
      'Practical lab assignments connecting local virtualized server environments with cloud infrastructure deployment and structured troubleshooting.',
    topics: [
      'Lab 01: Deploying Active Directory, DNS & DHCP in a virtual lab',
      'Lab 02: Building isolated virtual networks on a hypervisor',
      'Lab 03: Deploying & securing scalable workloads on AWS',
    ],
    fileUrl: '/study-materials/virtualization-aws-lab-workbook.pdf',
    fileName: 'virtualization-aws-lab-workbook.pdf',
    fileType: 'PDF Lab Workbook · 100% Free',
  },
];

export const GALLERY_ITEMS: GalleryPhoto[] = [
  {
    id: 'g-1',
    title: 'Arvind Thevar — IT Trainer & Infrastructure Professional',
    category: 'Training',
    image: '/assets/aistudio/image_e26475f0.png',
    caption: '15+ years of real-world IT infrastructure experience brought into hands-on training.',
  },
  {
    id: 'g-2',
    title: 'Enterprise Cisco Networking Rack & Lab',
    category: 'Labs',
    image: '/src/assets/images/cisco_network_lab_1795164486189.jpg',
    caption: 'Managed switches, routers and structured Ethernet patch cabling for live CCNA & CCNP topologies.',
  },
  {
    id: 'g-3',
    title: 'Corporate & Institutional IT Training Workshop',
    category: 'Training',
    image: '/src/assets/images/corporate_it_workshop_1795164484663.jpg',
    caption: 'Step-by-step live lab guidance: understand the concept, build it, break it, fix it.',
  },
  {
    id: 'g-4',
    title: 'Red Hat Enterprise Linux (RHEL) Server Lab',
    category: 'Infrastructure',
    image: '/src/assets/images/linux_rhel_lab_1795164484674.jpg',
    caption: 'Enterprise Linux server racks and administration workstation built for RHCSA & RHCE practice.',
  },
  {
    id: 'g-5',
    title: 'Hands-On Fault Injection & Troubleshooting Lab',
    category: 'Labs',
    image: '/src/assets/images/hands_on_troubleshooting_1795164485759.jpg',
    caption: 'Practical diagnostic assignments reinforcing every module for day-one job readiness.',
  },
  {
    id: 'g-6',
    title: 'AWS Cloud & Virtualization Architecture Desk',
    category: 'Infrastructure',
    image: '/src/assets/images/aws_cloud_infra_1795164482369.jpg',
    caption: 'Designing hybrid lab networks, hypervisor clusters and resilient AWS cloud architectures.',
  },
];
