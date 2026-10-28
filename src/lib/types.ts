// Core content types for the CMS. Everything the public site renders comes from these.

export type Status = 'published' | 'draft';

export interface Link {
  label: string;
  href: string;
}

export interface Theme {
  colors: {
    bg: string;
    surface: string;
    ink: string;
    muted: string;
    line: string;
    accent: string;
    accent2: string;
    inverseBg: string;
    inverseInk: string;
  };
  fonts: {
    display: string;
    body: string;
    mono: string;
    displayItalic: boolean;
  };
  typography: {
    baseSize: number; // px
    scale: number; // modular scale ratio
    displayWeight: number;
    bodyWeight: number;
    letterSpacingDisplay: number; // em
    lineHeightBody: number;
    uppercaseLabels: boolean;
  };
  ui: {
    radius: number; // px
    grain: boolean;
    customCursor: boolean;
    smoothScroll: boolean;
    pageTransitions: boolean;
    buttonStyle: 'pill' | 'square' | 'underline';
  };
}

export interface Settings {
  siteName: string;
  logoText: string;
  logoImage: string;
  tagline: string;
  announcement: { enabled: boolean; text: string; href: string };
  nav: Link[];
  headerCta: Link;
  contact: { email: string; phone: string; address: string; hours: string; mapUrl: string };
  socials: Link[];
  footer: { headline: string; note: string; columns: { title: string; links: Link[] }[] };
  seo: { title: string; description: string; ogImage: string };
  currency: string;
  showPrices: boolean;
}

export interface Variant {
  name: string;
  color: string;
  slot: string; // material slot to recolor: upholstery | wood | metal | stone
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string; // category slug
  price: number;
  tagline: string;
  description: string;
  dimensions: { w: number; d: number; h: number };
  materials: string[];
  designer: string;
  leadTime: string;
  model: string; // procedural model key
  modelUrl: string; // uploaded .glb (overrides procedural)
  usdzUrl: string; // optional iOS Quick Look file
  variants: Variant[];
  images: string[];
  featured: boolean;
  inShowroom: boolean;
  arEnabled: boolean;
  status: Status;
  order: number;
  createdAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  order: number;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  location: string;
  year: string;
  area: string;
  type: string;
  cover: string;
  gallery: string[];
  summary: string;
  body: string;
  featured: boolean;
  status: Status;
  order: number;
  createdAt: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  body: string;
  author: string;
  date: string;
  tags: string[];
  status: Status;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatar: string;
  order: number;
}

export interface Section {
  id: string;
  type: string;
  enabled: boolean;
  data: Record<string, any>;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  sections: Section[];
  status: Status;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  product: string;
  read: boolean;
  createdAt: string;
}

export interface Media {
  id: string;
  filename: string;
  url: string;
  mime: string;
  size: number;
  alt: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'admin' | 'editor';
  createdAt: string;
}

export interface Database {
  theme: Theme;
  settings: Settings;
  pages: Page[];
  products: Product[];
  categories: Category[];
  projects: Project[];
  posts: Post[];
  testimonials: Testimonial[];
  inquiries: Inquiry[];
  media: Media[];
  users: User[];
}

export type CollectionKey =
  | 'pages'
  | 'products'
  | 'categories'
  | 'projects'
  | 'posts'
  | 'testimonials'
  | 'inquiries'
  | 'media'
  | 'users';

export type SingletonKey = 'theme' | 'settings';
