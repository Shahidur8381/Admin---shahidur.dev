export interface PersonalInfo {
  id?: number;
  name: string;
  title: string;
  email: string;
  salam: string;
  salamMeaning: string;
  roles: string[];
  aboutIntro: string;
  portrait: string;
  resumeUrl?: string;
}

export interface NavLink {
  id: number;
  navId: string;
  title: string;
  sortOrder: number;
  showOnHomepage?: boolean;
}

export interface WhatIBuilt {
  id: number;
  number: string;
  title: string;
  description: string;
  tech: string;
  iconType: string;
  isPrimary: boolean;
  showOnHomepage: boolean;
  sortOrder?: number;
}

export interface Education {
  id: number;
  title: string;
  institution: string;
  result: string;
  date: string;
  icon: string;
  image?: string | null;
  description: string;
  expectedGraduationYear?: number | null;
  showOnHomepage: boolean;
  sortOrder?: number;
}

export interface Experience {
  id: number;
  slug: string;
  title: string;
  companyName: string;
  date: string;
  icon: string;
  iconBg: string;
  image?: string | null;
  points: string[];
  showOnHomepage: boolean;
  sortOrder?: number;
}

export interface ProjectTag {
  name: string;
  color: string;
}

export interface Project {
  id: number;
  slug: string;
  name: string;
  category?: string;
  description: string;
  tags: ProjectTag[];
  image: string;
  sourceCodeLink: string;
  liveDemoLink?: string | null;
  showOnHomepage: boolean;
  sortOrder?: number;
}

export interface Testimonial {
  id: number;
  testimonial: string;
  name: string;
  designation: string;
  company: string;
  image: string;
  showOnHomepage: boolean;
  sortOrder?: number;
}

export interface SocialLink {
  id: number;
  platform: string;
  label: string;
  url: string;
  icon?: string;
  showInContact: boolean;
  showInFooter: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface PortfolioData {
  personal: PersonalInfo;
  navLinks: NavLink[];
  whatIBuilt: WhatIBuilt[];
  education: Education[];
  experiences: Experience[];
  projects: Project[];
  testimonials: Testimonial[];
  socialLinks?: SocialLink[];
}

export type ModuleType =
  | "projects"
  | "experiences"
  | "education"
  | "what-i-built"
  | "testimonials"
  | "nav-links"
  | "social-links";
