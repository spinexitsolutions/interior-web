import 'server-only';
import { readDb } from './db';
import type { Product } from './types';

const published = <T extends { status?: string }>(list: T[]) => list.filter((x) => x.status !== 'draft');
const byOrder = <T extends { order?: number }>(a: T, b: T) => (a.order ?? 0) - (b.order ?? 0);

export const getTheme = () => readDb().theme;
export const getSettings = () => readDb().settings;
export const getPage = (slug: string) => published(readDb().pages).find((p) => p.slug === slug);
export const getProducts = () => published(readDb().products).sort(byOrder);
export const getProduct = (slug: string) => getProducts().find((p) => p.slug === slug);
export const getCategories = () => [...readDb().categories].sort(byOrder);
export const getProjects = () => published(readDb().projects).sort(byOrder);
export const getProject = (slug: string) => getProjects().find((p) => p.slug === slug);
export const getPosts = () => published(readDb().posts).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
export const getPost = (slug: string) => getPosts().find((p) => p.slug === slug);
export const getTestimonials = () => [...readDb().testimonials].sort(byOrder);

/** Data bundle handed to sections so they can resolve references (products, projects…). */
export function getSectionContext() {
  return {
    products: getProducts(),
    categories: getCategories(),
    projects: getProjects(),
    posts: getPosts(),
    testimonials: getTestimonials(),
    settings: getSettings(),
  };
}
export type SectionContext = ReturnType<typeof getSectionContext>;

/** Shape of a product passed to client 3D components. */
export function productModel(p: Product) {
  return { slug: p.slug, name: p.name, model: p.model, modelUrl: p.modelUrl, usdzUrl: p.usdzUrl, variants: p.variants, arEnabled: p.arEnabled, dimensions: p.dimensions };
}
