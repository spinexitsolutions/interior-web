// Editor schemas for every collection & singleton in the CMS.
import { Field, linkFields, opt } from './fields';

export interface CollectionDef {
  key: string;
  label: string;
  singular: string;
  icon: string;
  titleField: string;
  subtitleField?: string;
  imageField?: string;
  slugFrom?: string;
  publicPath?: (item: any) => string;
  fields: Field[];
  sortable?: boolean;
}

const status: Field = { name: 'status', label: 'Status', type: 'select', options: opt('published', 'draft'), half: true };
const slug: Field = { name: 'slug', label: 'Slug (URL)', type: 'text', half: true, help: 'Lowercase, dashes. Leave empty to generate from title.' };

export const COLLECTIONS: CollectionDef[] = [
  {
    key: 'products',
    label: 'Products',
    singular: 'Product',
    icon: '◐',
    titleField: 'name',
    subtitleField: 'category',
    imageField: 'images',
    slugFrom: 'name',
    sortable: true,
    publicPath: (p) => `/collection/${p.slug}`,
    fields: [
      { name: 'name', label: 'Name', type: 'text', half: true },
      slug,
      { name: 'category', label: 'Category', type: 'ref', collection: 'categories', half: true },
      { name: 'price', label: 'Price', type: 'number', half: true },
      { name: 'tagline', label: 'Tagline', type: 'text' },
      { name: 'description', label: 'Description', type: 'markdown' },
      { name: 'designer', label: 'Designer', type: 'text', half: true },
      { name: 'leadTime', label: 'Lead time', type: 'text', half: true },
      { name: 'dimensions', label: 'Dimensions (cm)', type: 'group', fields: [{ name: 'w', label: 'Width', type: 'number', half: true }, { name: 'd', label: 'Depth', type: 'number', half: true }, { name: 'h', label: 'Height', type: 'number', half: true }] },
      { name: 'materials', label: 'Materials', type: 'tags' },
      { name: 'model', label: 'Built-in 3D model', type: 'model', half: true, help: 'Used when no .glb is uploaded.' },
      { name: 'modelUrl', label: 'Custom 3D model (.glb)', type: 'file', accept: '.glb,.gltf', half: true, help: 'Name materials "upholstery", "wood", "metal" or "stone" to enable recolouring.' },
      { name: 'usdzUrl', label: 'iOS AR file (.usdz, optional)', type: 'file', accept: '.usdz', half: true },
      { name: 'arEnabled', label: 'Enable AR “view in your room”', type: 'boolean', half: true },
      { name: 'variants', label: 'Colour / material variants', type: 'list', itemLabel: 'name', fields: [{ name: 'name', label: 'Name', type: 'text', half: true }, { name: 'color', label: 'Colour', type: 'color', half: true }, { name: 'slot', label: 'Applies to', type: 'select', options: opt('upholstery', 'wood', 'metal', 'stone', 'accent'), half: true }] },
      { name: 'images', label: 'Images', type: 'images' },
      { name: 'featured', label: 'Featured', type: 'boolean', half: true },
      { name: 'inShowroom', label: 'Place in VR showroom', type: 'boolean', half: true },
      status,
    ],
  },
  {
    key: 'categories',
    label: 'Categories',
    singular: 'Category',
    icon: '▦',
    titleField: 'name',
    imageField: 'image',
    slugFrom: 'name',
    sortable: true,
    publicPath: (c) => `/collection?category=${c.slug}`,
    fields: [
      { name: 'name', label: 'Name', type: 'text', half: true },
      slug,
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'image', label: 'Image', type: 'image' },
    ],
  },
  {
    key: 'projects',
    label: 'Projects',
    singular: 'Project',
    icon: '▤',
    titleField: 'title',
    subtitleField: 'location',
    imageField: 'cover',
    slugFrom: 'title',
    sortable: true,
    publicPath: (p) => `/projects/${p.slug}`,
    fields: [
      { name: 'title', label: 'Title', type: 'text', half: true },
      slug,
      { name: 'location', label: 'Location', type: 'text', half: true },
      { name: 'year', label: 'Year', type: 'text', half: true },
      { name: 'area', label: 'Area', type: 'text', half: true },
      { name: 'type', label: 'Type', type: 'text', half: true, placeholder: 'Residence, Hospitality…' },
      { name: 'cover', label: 'Cover image', type: 'image' },
      { name: 'summary', label: 'Summary', type: 'textarea' },
      { name: 'body', label: 'Story', type: 'markdown' },
      { name: 'gallery', label: 'Gallery', type: 'images' },
      { name: 'featured', label: 'Featured', type: 'boolean', half: true },
      status,
    ],
  },
  {
    key: 'posts',
    label: 'Journal',
    singular: 'Post',
    icon: '✎',
    titleField: 'title',
    subtitleField: 'date',
    imageField: 'cover',
    slugFrom: 'title',
    publicPath: (p) => `/journal/${p.slug}`,
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      slug,
      { name: 'date', label: 'Date', type: 'date', half: true },
      { name: 'author', label: 'Author', type: 'text', half: true },
      { name: 'tags', label: 'Tags', type: 'tags' },
      { name: 'cover', label: 'Cover', type: 'image' },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
      { name: 'body', label: 'Body', type: 'markdown' },
      status,
    ],
  },
  {
    key: 'testimonials',
    label: 'Testimonials',
    singular: 'Testimonial',
    icon: '“',
    titleField: 'name',
    subtitleField: 'role',
    imageField: 'avatar',
    sortable: true,
    fields: [
      { name: 'quote', label: 'Quote', type: 'textarea' },
      { name: 'name', label: 'Name', type: 'text', half: true },
      { name: 'role', label: 'Role / place', type: 'text', half: true },
      { name: 'avatar', label: 'Avatar', type: 'image' },
    ],
  },
];

export const collectionDef = (key: string) => COLLECTIONS.find((c) => c.key === key);

export const DISPLAY_FONTS = ['Plus Jakarta Sans', 'Inter', 'Manrope', 'Sora', 'Outfit', 'Urbanist', 'Instrument Serif', 'Fraunces', 'Gloock', 'Bodoni Moda', 'Playfair Display', 'DM Serif Display', 'Cormorant Garamond', 'Italiana', 'Young Serif', 'Syne', 'Unbounded', 'Bricolage Grotesque', 'Space Grotesk', 'Big Shoulders Display', 'Familjen Grotesk', 'Tenor Sans'];
export const BODY_FONTS = ['Inter', 'Bricolage Grotesque', 'Hanken Grotesk', 'Inter Tight', 'Manrope', 'DM Sans', 'Outfit', 'Plus Jakarta Sans', 'Work Sans', 'Space Grotesk', 'Figtree', 'Sora', 'Albert Sans'];
export const MONO_FONTS = ['Inter', 'Manrope', 'JetBrains Mono', 'IBM Plex Mono', 'Space Mono', 'DM Mono', 'Fragment Mono', 'Geist Mono'];

export const THEME_FIELDS: Field[] = [
  {
    name: 'colors',
    label: 'Colours',
    type: 'group',
    fields: [
      { name: 'bg', label: 'Background', type: 'color', half: true },
      { name: 'surface', label: 'Surface / cards', type: 'color', half: true },
      { name: 'ink', label: 'Text (ink)', type: 'color', half: true },
      { name: 'muted', label: 'Muted text', type: 'color', half: true },
      { name: 'line', label: 'Lines / borders', type: 'color', half: true },
      { name: 'accent', label: 'Accent', type: 'color', half: true },
      { name: 'accent2', label: 'Secondary accent', type: 'color', half: true },
      { name: 'inverseBg', label: 'Dark section background', type: 'color', half: true },
      { name: 'inverseInk', label: 'Dark section text', type: 'color', half: true },
    ],
  },
  {
    name: 'fonts',
    label: 'Fonts (any Google Font name works)',
    type: 'group',
    fields: [
      { name: 'display', label: 'Display / headings', type: 'font', fontRole: 'display', half: true },
      { name: 'body', label: 'Body', type: 'font', fontRole: 'body', half: true },
      { name: 'mono', label: 'Labels / mono', type: 'font', fontRole: 'mono', half: true },
      { name: 'displayItalic', label: 'Load italic for display font', type: 'boolean', half: true },
    ],
  },
  {
    name: 'typography',
    label: 'Typography',
    type: 'group',
    fields: [
      { name: 'baseSize', label: 'Base size (px)', type: 'number', half: true, min: 12, max: 22, step: 1 },
      { name: 'scale', label: 'Type scale ratio', type: 'number', half: true, min: 1.1, max: 1.7, step: 0.01 },
      { name: 'displayWeight', label: 'Display weight', type: 'number', half: true, min: 100, max: 900, step: 100 },
      { name: 'bodyWeight', label: 'Body weight', type: 'number', half: true, min: 100, max: 900, step: 100 },
      { name: 'letterSpacingDisplay', label: 'Heading letter-spacing (em)', type: 'number', half: true, min: -0.1, max: 0.2, step: 0.005 },
      { name: 'lineHeightBody', label: 'Body line-height', type: 'number', half: true, min: 1, max: 2.2, step: 0.05 },
      { name: 'uppercaseLabels', label: 'Uppercase labels', type: 'boolean', half: true },
    ],
  },
  {
    name: 'ui',
    label: 'Interface & motion',
    type: 'group',
    fields: [
      { name: 'radius', label: 'Corner radius (px)', type: 'number', half: true, min: 0, max: 40 },
      { name: 'buttonStyle', label: 'Button style', type: 'select', options: opt('pill', 'square', 'underline'), half: true },
      { name: 'grain', label: 'Film grain overlay', type: 'boolean', half: true },
      { name: 'customCursor', label: 'Custom cursor', type: 'boolean', half: true },
      { name: 'smoothScroll', label: 'Smooth (inertia) scroll', type: 'boolean', half: true },
      { name: 'pageTransitions', label: 'Page transition curtain', type: 'boolean', half: true },
    ],
  },
];

export const SETTINGS_FIELDS: Field[] = [
  { name: 'siteName', label: 'Site name', type: 'text', half: true },
  { name: 'logoText', label: 'Logo text', type: 'text', half: true },
  { name: 'logoImage', label: 'Logo image (optional, replaces text)', type: 'image' },
  { name: 'tagline', label: 'Tagline', type: 'text' },
  { name: 'announcement', label: 'Announcement bar', type: 'group', fields: [{ name: 'enabled', label: 'Show', type: 'boolean', half: true }, { name: 'text', label: 'Text', type: 'text' }, { name: 'href', label: 'Link', type: 'url' }] },
  { name: 'nav', label: 'Main navigation', type: 'list', itemLabel: 'label', fields: linkFields },
  { name: 'headerCta', label: 'Header button', type: 'group', fields: linkFields },
  {
    name: 'contact',
    label: 'Contact details',
    type: 'group',
    fields: [
      { name: 'email', label: 'Email', type: 'text', half: true },
      { name: 'phone', label: 'Phone', type: 'text', half: true },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'hours', label: 'Opening hours', type: 'text' },
      { name: 'mapUrl', label: 'Map link', type: 'url' },
    ],
  },
  { name: 'socials', label: 'Social links', type: 'list', itemLabel: 'label', fields: linkFields },
  {
    name: 'footer',
    label: 'Footer',
    type: 'group',
    fields: [
      { name: 'headline', label: 'Giant footer headline', type: 'textarea' },
      { name: 'note', label: 'Small print', type: 'text' },
      { name: 'columns', label: 'Link columns', type: 'list', itemLabel: 'title', fields: [{ name: 'title', label: 'Column title', type: 'text' }, { name: 'links', label: 'Links', type: 'list', itemLabel: 'label', fields: linkFields }] },
    ],
  },
  { name: 'seo', label: 'SEO defaults', type: 'group', fields: [{ name: 'title', label: 'Title', type: 'text' }, { name: 'description', label: 'Description', type: 'textarea' }, { name: 'ogImage', label: 'Share image', type: 'image' }] },
  { name: 'currency', label: 'Currency symbol / code', type: 'text', half: true },
  { name: 'showPrices', label: 'Show prices', type: 'boolean', half: true },
];

export const PAGE_META_FIELDS: Field[] = [
  { name: 'title', label: 'Page title', type: 'text', half: true },
  { name: 'slug', label: 'Slug (use "home" for the homepage)', type: 'text', half: true },
  { name: 'seoTitle', label: 'SEO title', type: 'text', half: true },
  status,
  { name: 'seoDescription', label: 'SEO description', type: 'textarea' },
];
