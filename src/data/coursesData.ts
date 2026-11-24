export interface TrainingCourse {
  slug: string;
  title: string;
  shortTitle: string;
  badge: string;
  certification: string;
  experienceLevel: string;
  durationEstimate: string;
  prerequisites: string;
  heroHeadline: string;
  summary: string;
  targetAudience: string[];
  learningOutcomes: {
    moduleNumber: string;
    moduleTitle: string;
    topics: string[];
  }[];
  labHighlights: string[];
  relatedCourseSlugs: string[];
  faq: {
    question: string;
    answer: string;
  }[];
}

export const TRAINING_COURSES: TrainingCourse[] = [
  {
    slug: 'rhel-linux',
    title: 'Red Hat Enterprise Linux (RHEL) Training | RHCSA & RHCE',
    shortTitle: 'Red Hat Linux (RHEL)',
    badge: 'Linux System Administration',
    certification: 'Red Hat Certified System Administrator (RHCSA EX200) & RHCE (EX294)',
    experienceLevel: 'Beginner to Advanced',
    durationEstimate: 'Hands-on cohort with daily live lab sessions (inquire for batch timing)',
    prerequisites: 'Basic computer literacy and enthusiasm to work with command-line environments.',
    heroHeadline: 'Master Enterprise Linux Administration with Real Production Scenarios',
    summary:
      'Comprehensive, lab-driven Red Hat Enterprise Linux training in Nashik and online. Move beyond theoretical slides with live terminal implementation covering installation, storage management (LVM), user administration, permissions, systemd services, Bash shell scripting, firewall rules, and structured server recovery.',
    targetAudience: [
      'Engineering students, BCA/MCA graduates, and freshers starting an IT infrastructure career',
      'Desktop support and IT helpdesk technicians wanting to transition to Linux Systems Administration',
      'Working systems engineers preparing for official Red Hat RHCSA (EX200) and RHCE (EX294) exams',
      'Cloud and DevOps engineers needing strong foundational Linux CLI fluency and automation skills',
    ],
    learningOutcomes: [
      {
        moduleNumber: '01',
        moduleTitle: 'RHEL Installation, CLI Fluency & File Management',
        topics: [
          'Installing Red Hat Enterprise Linux (RHEL 9) in virtualized and bare-metal environments',
          'Bash shell navigation, command syntax, standard input/output redirection and piping',
          'Linux file hierarchy (FHS), hard and soft symbolic links, and text processing with grep, awk and sed',
          'System documentation, man pages, info docs and offline command reference habits',
        ],
      },
      {
        moduleNumber: '02',
        moduleTitle: 'User, Group, Security & Permission Architecture',
        topics: [
          'Local user and group management, password aging policies and shadow file structure',
          'Standard Linux file permissions (rwx), numeric modes, umask defaults and special permissions (SUID, SGID, Sticky Bit)',
          'POSIX Access Control Lists (ACLs) using getfacl and setfacl for granular file permissions',
          'Sudoers configuration, administrative delegation and auditing with journalctl',
        ],
      },
      {
        moduleNumber: '03',
        moduleTitle: 'Storage, Partitioning, File Systems & LVM',
        topics: [
          'MBR and GPT partitioning schemes using fdisk and gdisk',
          'File system creation (XFS and ext4), persistent mounting via /etc/fstab and UUID identification',
          'Logical Volume Management (LVM): Physical Volumes (PV), Volume Groups (VG), Logical Volumes (LV) and online expansion',
          'Swap space allocation, file-based swap and storage performance monitoring',
        ],
      },
      {
        moduleNumber: '04',
        moduleTitle: 'systemd Service Control, Networking & Boot Recovery',
        topics: [
          'Managing systemd services, targets, sockets and timers using systemctl',
          'Network configuration with nmcli, nmtui, static IP assignment, DNS resolution and routing tables',
          'System log inspection with journalctl, rsyslog configuration and log rotation',
          'Troubleshooting boot stages, rescue mode, emergency targets and forgotten root password resets',
        ],
      },
      {
        moduleNumber: '05',
        moduleTitle: 'Firewall, SELinux Basics & Shell Scripting Automation',
        topics: [
          'Managing firewalld zones, permanent port rules, rich rules and packet filtering',
          'SELinux fundamentals: enforcing vs permissive modes, context verification and boolean toggles',
          'Writing reliable Bash shell scripts: variables, conditionals, loops and automated health checks',
          'Performance-based RHCSA and RHCE mock lab practicals under timed examination conditions',
        ],
      },
    ],
    labHighlights: [
      'Multi-VM RHEL lab environment replicating production server infrastructure',
      'Deliberate fault-injection scenarios: broken fstab, corrupted permissions and network isolation',
      'Live LVM volume expansion under simulated database storage pressure',
      'Direct one-on-one lab guidance from Arvind Thevar (15+ years enterprise IT training experience)',
    ],
    relatedCourseSlugs: ['cisco-ccna-ccnp', 'aws-solutions-architect', 'windows-server'],
    faq: [
      {
        question: 'Does this RHEL course cover RHCSA exam objectives?',
        answer:
          'Yes. The curriculum is mapped directly to official Red Hat RHCSA (EX200) performance-based objectives, emphasizing hands-on terminal tasks rather than multiple-choice theory.',
      },
      {
        question: 'Can I join as a complete beginner with no prior Linux experience?',
        answer:
          'Yes. We begin with core computing concepts and Linux fundamentals in plain language before advancing to storage, networking, and system automation.',
      },
      {
        question: 'Where are the training batches conducted?',
        answer:
          'In-person batches are conducted at our Nashik training center (Kanchawala Avenue, College Road, near BYK College). Interactive live online batches are also available for remote students.',
      },
    ],
  },
  {
    slug: 'cisco-ccna-ccnp',
    title: 'Cisco CCNA & CCNP Enterprise Networking Training',
    shortTitle: 'Cisco CCNA & CCNP',
    badge: 'Enterprise Networking',
    certification: 'Cisco Certified Network Associate (CCNA 200-301) & CCNP Enterprise (350-401 ENCOR)',
    experienceLevel: 'Foundational to Professional',
    durationEstimate: 'Hands-on cohort with hardware and packet simulator labs',
    prerequisites: 'Basic understanding of computer concepts; no prior networking knowledge required.',
    heroHeadline: 'Build, Configure & Secure Enterprise Networks from Ground Zero',
    summary:
      'In-depth Cisco networking training covering IP addressing, IPv4/IPv6 subnetting, Cisco IOS CLI navigation, VLAN segmentation, inter-VLAN routing, OSPF, EIGRP, BGP, Spanning Tree Protocol (STP), First Hop Redundancy (HSRP), access control lists (ACLs), Network Address Translation (NAT), and device security hardening.',
    targetAudience: [
      'Network engineering aspirants preparing for the Cisco CCNA 200-301 or CCNP Enterprise certification',
      'System administrators responsible for managing switches, routers, and corporate connectivity',
      'IT support professionals wanting to move into NOC (Network Operations Center) and network support roles',
      'Telecommunications and electronics students building career-ready networking and security skills',
    ],
    learningOutcomes: [
      {
        moduleNumber: '01',
        moduleTitle: 'Network Fundamentals, IP Addressing & Subnetting',
        topics: [
          'OSI and TCP/IP protocol reference models, encapsulation, de-encapsulation and PDUs',
          'Binary math, IPv4 classes, CIDR notation, and rapid VLSM subnetting calculations',
          'IPv6 address architecture, address types (unicast, multicast, anycast) and SLAAC auto-configuration',
          'Cisco IOS modes: User EXEC, Privileged EXEC, Global Configuration and interface sub-modes',
        ],
      },
      {
        moduleNumber: '02',
        moduleTitle: 'Switching Technologies, VLANs & Spanning Tree',
        topics: [
          'Ethernet frame operations, MAC address tables and switch forwarding mechanisms',
          'VLAN configuration, access ports, 802.1Q trunking and DTP negotiation',
          'Inter-VLAN routing using Router-on-a-Stick (ROAS) and Layer 3 Multi-Layer Switches (SVI)',
          'Spanning Tree Protocol (STP 802.1D), Rapid PVST+ (802.1w), PortFast and BPDU Guard protection',
        ],
      },
      {
        moduleNumber: '03',
        moduleTitle: 'Routing Technologies: Static, OSPF & Enterprise Dynamic Routing',
        topics: [
          'Routing table logic, longest prefix match, administrative distance and metric calculation',
          'Static routes, default routes and floating static backup routes',
          'Open Shortest Path First (OSPFv2/OSPFv3): neighbor states, DR/BDR election and single/multi-area design',
          'EIGRP fundamentals and intro to Border Gateway Protocol (BGP) for enterprise edge connectivity',
        ],
      },
      {
        moduleNumber: '04',
        moduleTitle: 'IP Services: DHCP, DNS, NAT & High Availability',
        topics: [
          'DHCP server, DHCP relay agent (ip helper-address) and client configuration',
          'Network Address Translation (NAT): Static NAT, Dynamic NAT and Port Address Translation (PAT/Overload)',
          'First Hop Redundancy Protocols: Hot Standby Router Protocol (HSRP) and VRRP configuration',
          'NTP synchronization, SNMP monitoring and Syslog analysis across multi-router topologies',
        ],
      },
      {
        moduleNumber: '05',
        moduleTitle: 'Network Security, Access Control Lists & Device Hardening',
        topics: [
          'Standard and Extended IPv4 Access Control Lists (ACLs) with protocol and port filtering',
          'Cisco device hardening: encrypted passwords, SSH access, login banners and AAA basics',
          'Port Security on switch ports: static MACs, sticky learning and violation shutdown modes',
          'Virtual Private Networks (VPNs): site-to-site IPsec tunnels and remote access concepts',
        ],
      },
    ],
    labHighlights: [
      'Multi-switch and multi-router rack topologies for live hands-on CLI configuration',
      'Fault-injection exercises: routing loops, VLAN trunk mismatches and duplex/speed negotiation errors',
      'End-to-end packet flow tracing using Wireshark captures alongside Cisco terminal logs',
      'Direct mentorship from Arvind Thevar, covering 15+ years of real network troubleshooting',
    ],
    relatedCourseSlugs: ['rhel-linux', 'aws-solutions-architect', 'virtualization-cloud'],
    faq: [
      {
        question: 'What hardware or simulators are used in the CCNA labs?',
        answer:
          'Training utilizes physical Cisco switches/routers alongside enterprise-grade network simulation environments (Cisco Packet Tracer, GNS3, and EVE-NG) to ensure students build muscle memory on real Cisco IOS commands.',
      },
      {
        question: 'Does this course prepare me for the latest CCNA 200-301 exam?',
        answer:
          'Yes. The syllabus reflects the latest 200-301 domains, including network fundamentals, network access, IP connectivity, IP services, security fundamentals, and automation fundamentals.',
      },
    ],
  },
  {
    slug: 'aws-solutions-architect',
    title: 'AWS Solutions Architect & Cloud Computing Training',
    shortTitle: 'AWS Solutions Architect',
    badge: 'Cloud Infrastructure',
    certification: 'AWS Certified Solutions Architect – Associate (SAA-C03)',
    experienceLevel: 'Intermediate',
    durationEstimate: 'Hands-on cloud architecture cohort with real AWS management console labs',
    prerequisites: 'Foundational knowledge of Linux administration, TCP/IP networking or virtualization.',
    heroHeadline: 'Design, Deploy & Scale Secure Resilient Cloud Infrastructure on AWS',
    summary:
      'Practical AWS cloud architecture training designed specifically for infrastructure engineers. Connect traditional on-premises networking, Linux administration, and storage knowledge with Amazon Web Services: VPC networking, EC2 compute instances, S3 object storage, EBS block volumes, RDS databases, IAM security governance, and auto-scaling multi-AZ resilience.',
    targetAudience: [
      'Systems administrators and network engineers transitioning their on-premises skill set to cloud platforms',
      'IT professionals aiming for the AWS Certified Solutions Architect – Associate (SAA-C03) credential',
      'Developers wanting a deep architectural understanding of cloud compute, networking, and security primitives',
      'Freshers and IT graduates seeking high-demand cloud infrastructure roles',
    ],
    learningOutcomes: [
      {
        moduleNumber: '01',
        moduleTitle: 'Cloud Concepts, Global Infrastructure & IAM Security',
        topics: [
          'Cloud computing service models (IaaS, PaaS, SaaS) and deployment models',
          'AWS Global Infrastructure: Regions, Availability Zones (AZs), and Edge Locations',
          'Identity and Access Management (IAM): users, groups, custom policies, roles, and MFA security',
          'AWS Organizations, Service Control Policies (SCPs), and multi-account governance fundamentals',
        ],
      },
      {
        moduleNumber: '02',
        moduleTitle: 'Virtual Private Cloud (VPC) & Cloud Networking Architecture',
        topics: [
          'Custom VPC creation, public and private subnet design, CIDR blocks, and Internet Gateways',
          'Route tables, NAT Gateways for secure outbound internet access, and Elastic IPs',
          'Security Groups (stateful) and Network ACLs (stateless) multi-layered perimeter defense',
          'VPC Peering, AWS Transit Gateway concepts, and Site-to-Site VPN connections to on-premises data centers',
        ],
      },
      {
        moduleNumber: '03',
        moduleTitle: 'Elastic Compute Cloud (EC2) & Storage Services',
        topics: [
          'Launching, sizing, and managing Amazon EC2 instances (Linux and Windows)',
          'SSH key pair authentication, user data boot scripts, and custom AMI creation',
          'Elastic Block Store (EBS) volumes: gp3, io2, snapshots, encryption, and lifecycle policies',
          'Amazon Simple Storage Service (S3): storage classes, bucket policies, lifecycle transitions, and versioning',
        ],
      },
      {
        moduleNumber: '04',
        moduleTitle: 'High Availability, Scalability & Load Balancing',
        topics: [
          'Application Load Balancers (ALB) and Network Load Balancers (NLB): target groups and health checks',
          'Auto Scaling Groups (ASG): launch templates, dynamic scaling policies, and self-healing fleets',
          'Multi-AZ architectures: designing for zero single points of failure',
          'Route 53 DNS routing policies: simple, weighted, latency-based, and failover health checks',
        ],
      },
      {
        moduleNumber: '05',
        moduleTitle: 'Databases, Monitoring, Cost Governance & Well-Architected Framework',
        topics: [
          'Amazon Relational Database Service (RDS): Multi-AZ deployments, read replicas, and backup policies',
          'Amazon CloudWatch metrics, alarms, logs, and AWS CloudTrail audit logging',
          'AWS Well-Architected Framework: Operational Excellence, Security, Reliability, Performance, and Cost Optimization',
          'Mock SAA-C03 exam scenario evaluations and architectural review sessions',
        ],
      },
    ],
    labHighlights: [
      'Deploying a secure, production-grade 3-tier VPC with public web tiers and private database tiers',
      'Configuring auto-scaling Linux web fleets behind an Application Load Balancer with live traffic load tests',
      'Simulating on-premises to AWS server backup and snapshot restoration workflows',
      'Step-by-step cost monitoring and Free-Tier safety practices throughout all exercises',
    ],
    relatedCourseSlugs: ['rhel-linux', 'cisco-ccna-ccnp', 'windows-server'],
    faq: [
      {
        question: 'Do I need prior coding knowledge to learn AWS Solutions Architect?',
        answer:
          'No coding or programming is required. The Solutions Architect track focuses on systems engineering, cloud architecture, networking, security policies, and resource management.',
      },
      {
        question: 'Does this course prepare me for the SAA-C03 certification?',
        answer:
          'Yes. All architectural domains and scenario-based exam questions aligned with the official AWS SAA-C03 blueprint are thoroughly analyzed in practical labs.',
      },
    ],
  },
  {
    slug: 'windows-server',
    title: 'Windows Server Administration & Active Directory Training',
    shortTitle: 'Windows Server Administration',
    badge: 'Microsoft Infrastructure',
    certification: 'Windows Server Enterprise Administration (Active Directory, DNS, Group Policy)',
    experienceLevel: 'Foundational to Intermediate',
    durationEstimate: 'Hands-on enterprise systems cohort with multi-domain lab setups',
    prerequisites: 'Basic knowledge of PC hardware, operating systems, and basic networking concepts.',
    heroHeadline: 'Deploy, Secure & Administer Corporate Microsoft Infrastructure',
    summary:
      'Comprehensive Windows Server enterprise training focusing on production administration: Active Directory Domain Services (AD DS) installation and forest design, Domain Name System (DNS), Dynamic Host Configuration Protocol (DHCP), Group Policy Objects (GPOs), file and share security permissions, user rights delegation, and server security hardening.',
    targetAudience: [
      'Desktop support and IT administrators looking to manage centralized corporate Windows domains',
      'System administrators responsible for user provisioning, group policies, and enterprise file servers',
      'Fresh graduates seeking roles as Windows Server Administrators, Systems Support Engineers, or Infrastructure Analysts',
    ],
    learningOutcomes: [
      {
        moduleNumber: '01',
        moduleTitle: 'Windows Server Installation, Roles & Core Services',
        topics: [
          'Windows Server editions, clean deployment, post-install configuration, and server naming conventions',
          'Server Manager navigation, Role-Based administration, and PowerShell administration basics',
          'Storage spaces, disk initialization, NTFS formatting, and share permissions vs NTFS security permissions',
          'Network adapter teaming, static IPv4 assignment, and firewall management',
        ],
      },
      {
        moduleNumber: '02',
        moduleTitle: 'Active Directory Domain Services (AD DS) Architecture',
        topics: [
          'Installing and configuring Active Directory Domain Controller and promoting domain servers',
          'Forests, Trees, Domains, and Organizational Units (OUs) hierarchical design',
          'User account provisioning, security groups (Global, Domain Local, Universal), and password policies',
          'Read-Only Domain Controllers (RODC) and delegating administrative authority safely',
        ],
      },
      {
        moduleNumber: '03',
        moduleTitle: 'Enterprise DNS, DHCP & Name Resolution',
        topics: [
          'Active Directory-integrated DNS zones, forward and reverse lookup zones, and resource records (A, CNAME, PTR, SRV)',
          'DNS forwarders, root hints, cache management, and troubleshooting resolution failures',
          'DHCP scope creation, exclusion ranges, reservations, lease renewal cycles, and DHCP failover redundancy',
          'Integrating DHCP with Active Directory DNS dynamic record updates',
        ],
      },
      {
        moduleNumber: '04',
        moduleTitle: 'Group Policy Objects (GPOs) & Centralized Management',
        topics: [
          'Group Policy Processing Order (LSDOU): Local, Site, Domain, and Organizational Unit',
          'Configuring desktop restrictions, drive mappings, software deployment, and script execution via GPOs',
          'Group Policy inheritance, Enforced settings, Block Inheritance, and WMI filtering',
          'Troubleshooting policy application with gpupdate, gpresult, and Resultant Set of Policy (RSoP)',
        ],
      },
      {
        moduleNumber: '05',
        moduleTitle: 'File Services, Backup, Disaster Recovery & Security Hardening',
        topics: [
          'Distributed File System (DFS) Namespaces and Replication for high availability file shares',
          'Windows Server Backup configuration, bare-metal backups, and Active Directory backup procedures',
          'Disaster recovery: authoritative and non-authoritative Active Directory restore techniques',
          'Server hardening: auditing logon events, disabling legacy protocols, and Windows Defender Firewall rules',
        ],
      },
    ],
    labHighlights: [
      'Multi-server domain environment with primary domain controllers, secondary controllers, and client workstations',
      'Simulated corporate staff onboarding and offboarding workflows with automated Group Policies',
      'Disaster recovery scenario: restoring a crashed Active Directory controller and verifying database consistency',
      'Guidance grounded in 15+ years of practical IT systems administration experience by Arvind Thevar',
    ],
    relatedCourseSlugs: ['rhel-linux', 'cisco-ccna-ccnp', 'aws-solutions-architect'],
    faq: [
      {
        question: 'Is this training relevant for hybrid cloud and Microsoft Azure environments?',
        answer:
          'Yes. Most enterprises operate hybrid environments where Azure AD (Entra ID) and cloud workloads connect directly to on-premises Windows Server Active Directory and DNS.',
      },
      {
        question: 'Will I get hands-on experience with real domain controllers?',
        answer:
          'Yes. Every student builds and administers their own virtualized domain controller, joins client PCs, configures Group Policies, and troubleshoots server services directly.',
      },
    ],
  },
  {
    slug: 'virtualization-cloud',
    title: 'Virtualization & IT Infrastructure Troubleshooting Training',
    shortTitle: 'Virtualization & Infrastructure',
    badge: 'Infrastructure Engineering',
    certification: 'Enterprise Virtualization, Hypervisors & Systematic Troubleshooting',
    experienceLevel: 'Foundational to Intermediate',
    durationEstimate: 'Lab-driven practical track with live fault-injection modules',
    prerequisites: 'Familiarity with server operating systems (Linux or Windows) and fundamental networking.',
    heroHeadline: 'Architect Virtual Lab Environments & Master Systematic Fault Isolation',
    summary:
      'Learn how modern data centers and enterprise IT departments operate virtualized infrastructure. Cover hypervisor deployment (Type-1 bare metal and Type-2 hosted), virtual switches and networks, VM provisioning, resource allocation, snapshots, backup workflows, and Arvind Thevar\'s proven "Build It. Break It. Fix It." troubleshooting methodology.',
    targetAudience: [
      'Systems engineers and IT support professionals responsible for server virtual environments',
      'Engineers preparing to set up complex home/work labs for CCNA, Red Hat, or Cloud certification practice',
      'Technical support specialists who want a repeatable, structured framework for resolving complex outages',
    ],
    learningOutcomes: [
      {
        moduleNumber: '01',
        moduleTitle: 'Virtualization Architectures & Hypervisor Fundamentals',
        topics: [
          'Type-1 bare-metal hypervisors vs Type-2 hosted hypervisors: architecture, performance, and use cases',
          'CPU virtualization extensions (Intel VT-x, AMD-V), memory overcommit, and hardware requirements',
          'Deploying and configuring hypervisor platforms for enterprise labs and development workloads',
          'Virtual hardware specifications: virtual CPUs, memory reservations, virtual disks, and controllers',
        ],
      },
      {
        moduleNumber: '02',
        moduleTitle: 'Virtual Networking & Storage Management',
        topics: [
          'Virtual switches (vSwitch), port groups, and uplink adapter teaming',
          'Bridged, Host-Only, and NAT virtual networking modes and VLAN trunking inside hypervisors',
          'Thin provisioning vs Thick provisioning for virtual disks and storage allocation best practices',
          'Snapshot management: differential disk behavior, performance impact, and safe rollback strategies',
        ],
      },
      {
        moduleNumber: '03',
        moduleTitle: 'VM Provisioning, Cloning, Templates & Migration',
        topics: [
          'Building standardized base image templates for Linux and Windows Server virtual machines',
          'Linked clones vs full clones: speed, storage savings, and practical management',
          'Exporting and importing Open Virtualization Format (OVF/OVA) packages across platforms',
          'Resource monitoring: diagnosing CPU ready time, memory ballooning, and disk I/O bottlenecks',
        ],
      },
      {
        moduleNumber: '04',
        moduleTitle: 'The "Build It. Break It. Fix It." Troubleshooting Methodology',
        topics: [
          'Step-by-step diagnostic model: Define the problem, gather symptoms, eliminate possibilities, isolate root cause',
          'Top-down vs bottom-up troubleshooting across the 7-layer OSI model',
          'Tracing connectivity failures methodically: ping, traceroute, netstat, ss, and tcpdump/Wireshark captures',
          'Reading system logs, kernel dmesg outputs, and event viewer entries accurately under pressure',
        ],
      },
      {
        moduleNumber: '05',
        moduleTitle: 'Real Production Outage Case Studies & Recovery Drills',
        topics: [
          'Diagnosing network IP conflicts, rogue DHCP servers, and switch loop broadcast storms',
          'Recovering corrupted file systems, missing bootloaders, and misconfigured firewall zones',
          'Simulated disaster scenarios with timed fault isolation drills',
          'Post-incident documentation, root cause analysis (RCA) reporting, and preventative hardening',
        ],
      },
    ],
    labHighlights: [
      'Full virtualized data center setup configured by each student from scratch',
      'Realistic production fault injections where the instructor breaks lab systems unannounced',
      'Real-world packet analysis drills isolating latency, packet loss, and dropped frames',
      'Direct, unfiltered practical guidance from Arvind Thevar (15+ years training IT professionals)',
    ],
    relatedCourseSlugs: ['rhel-linux', 'cisco-ccna-ccnp', 'aws-solutions-architect'],
    faq: [
      {
        question: 'How does this troubleshooting course differ from generic computer repair courses?',
        answer:
          'This course is specifically focused on enterprise server, networking, and virtualization infrastructure—troubleshooting corporate switches, routing tables, systemd daemons, directory services, and hypervisor stacks rather than basic desktop maintenance.',
      },
      {
        question: 'Can I use these virtualization skills to build my own training labs at home?',
        answer:
          'Yes. A major outcome of this track is teaching students how to architect and maintain complex multi-node testing labs on their own PCs and servers for lifelong technical practice.',
      },
    ],
  },
];

export function getCourseBySlug(slug: string): TrainingCourse | undefined {
  return TRAINING_COURSES.find((c) => c.slug === slug);
}
