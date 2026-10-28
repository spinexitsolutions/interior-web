// Every page is a stack of sections. Each section type declares its editable fields here;
// the admin page-builder renders forms from these and the site renders /components/sections/*.
import { Field, linkFields, opt } from './fields';

export interface SectionDef {
  type: string;
  label: string;
  description: string;
  icon: string;
  fields: Field[];
}

const tone: Field = { name: 'tone', label: 'Colour tone', type: 'select', options: opt('light', 'surface', 'dark', 'accent'), half: true };
const eyebrow: Field = { name: 'eyebrow', label: 'Eyebrow / label', type: 'text', half: true };
const title: Field = { name: 'title', label: 'Title', type: 'textarea', help: 'Wrap words in *asterisks* to render them in italic accent style. New lines are kept.' };

export const SECTION_DEFS: SectionDef[] = [
  {
    type: 'hero3d',
    label: 'Hero · 3D object',
    description: 'Full-screen hero with a live 3D model that rotates and drifts as the visitor scrolls.',
    icon: '◐',
    fields: [
      eyebrow,
      tone,
      title,
      { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { name: 'model', label: '3D model', type: 'model', half: true },
      { name: 'modelColor', label: 'Main upholstery colour', type: 'color', half: true },
      { name: 'primary', label: 'Primary button', type: 'group', fields: linkFields },
      { name: 'secondary', label: 'Secondary button', type: 'group', fields: linkFields },
      { name: 'meta', label: 'Corner meta lines', type: 'list', itemLabel: 'text', fields: [{ name: 'text', label: 'Text', type: 'text' }] },
    ],
  },
  {
    type: 'scrollStory',
    label: 'Scroll story · exploded 3D',
    description: 'Pinned section: the model assembles piece by piece while chapters of text scroll past.',
    icon: '⟡',
    fields: [
      eyebrow,
      tone,
      title,
      { name: 'model', label: '3D model', type: 'model' },
      { name: 'steps', label: 'Chapters', type: 'list', itemLabel: 'title', fields: [{ name: 'title', label: 'Title', type: 'text' }, { name: 'text', label: 'Text', type: 'textarea' }] },
    ],
  },
  {
    type: 'marquee',
    label: 'Marquee',
    description: 'Oversized scrolling type band that reacts to scroll velocity.',
    icon: '⇢',
    fields: [
      { name: 'items', label: 'Words / phrases', type: 'tags' },
      tone,
      { name: 'speed', label: 'Speed (seconds per loop)', type: 'number', half: true, min: 5, max: 120 },
    ],
  },
  {
    type: 'manifesto',
    label: 'Manifesto text',
    description: 'Large statement paragraph whose words light up as you scroll.',
    icon: '¶',
    fields: [eyebrow, tone, { name: 'text', label: 'Statement', type: 'textarea' }, { name: 'link', label: 'Link', type: 'group', fields: linkFields }],
  },
  {
    type: 'collectionRail',
    label: 'Collection rail',
    description: 'Horizontal scrolling rail of products driven by vertical scroll.',
    icon: '▭',
    fields: [
      eyebrow,
      tone,
      title,
      { name: 'source', label: 'Products to show', type: 'select', options: [{ label: 'Featured products', value: 'featured' }, { label: 'From a category', value: 'category' }, { label: 'All products', value: 'all' }], half: true },
      { name: 'category', label: 'Category (if source = category)', type: 'ref', collection: 'categories', half: true },
      { name: 'limit', label: 'Max products', type: 'number', half: true },
      { name: 'link', label: 'View all link', type: 'group', fields: linkFields },
    ],
  },
  {
    type: 'configurator',
    label: '3D configurator',
    description: 'Interactive 3D model with material swatches the visitor can switch live.',
    icon: '◎',
    fields: [
      eyebrow,
      tone,
      title,
      { name: 'text', label: 'Text', type: 'textarea' },
      { name: 'product', label: 'Product (optional, links + model)', type: 'ref', collection: 'products', half: true },
      { name: 'model', label: 'Or 3D model', type: 'model', half: true },
      { name: 'slot', label: 'Material slot to recolour', type: 'select', options: opt('upholstery', 'wood', 'metal', 'stone', 'accent'), half: true },
      { name: 'swatches', label: 'Swatches', type: 'list', itemLabel: 'name', fields: [{ name: 'name', label: 'Name', type: 'text', half: true }, { name: 'color', label: 'Colour', type: 'color', half: true }] },
    ],
  },
  {
    type: 'categoryGrid',
    label: 'Category grid',
    description: 'Asymmetric grid of product categories with hover reveal.',
    icon: '▦',
    fields: [eyebrow, tone, title],
  },
  {
    type: 'projectsBento',
    label: 'Projects bento',
    description: 'Editorial bento grid of featured interior projects.',
    icon: '▤',
    fields: [eyebrow, tone, title, { name: 'limit', label: 'Max projects', type: 'number', half: true }, { name: 'link', label: 'View all link', type: 'group', fields: linkFields }],
  },
  {
    type: 'arPromo',
    label: 'AR · View in your room',
    description: 'Promotes augmented reality: rotating model + QR/AR launch button.',
    icon: '⌖',
    fields: [
      eyebrow,
      tone,
      title,
      { name: 'text', label: 'Text', type: 'textarea' },
      { name: 'product', label: 'Product to launch in AR', type: 'ref', collection: 'products' },
      { name: 'buttonLabel', label: 'Button label', type: 'text', half: true },
      { name: 'points', label: 'Bullet points', type: 'list', itemLabel: 'text', fields: [{ name: 'text', label: 'Text', type: 'text' }] },
    ],
  },
  {
    type: 'vrPromo',
    label: 'VR showroom teaser',
    description: 'Window into the virtual showroom room with an enter button.',
    icon: '◰',
    fields: [eyebrow, tone, title, { name: 'text', label: 'Text', type: 'textarea' }, { name: 'image', label: 'Background image', type: 'image' }, { name: 'buttonLabel', label: 'Button label', type: 'text', half: true }],
  },
  {
    type: 'stats',
    label: 'Numbers',
    description: 'Counting statistics row.',
    icon: '#',
    fields: [tone, { name: 'items', label: 'Stats', type: 'list', itemLabel: 'label', fields: [{ name: 'value', label: 'Value', type: 'text', half: true }, { name: 'label', label: 'Label', type: 'text', half: true }] }],
  },
  {
    type: 'process',
    label: 'Process steps',
    description: 'Numbered steps with sticky title.',
    icon: '①',
    fields: [eyebrow, tone, title, { name: 'steps', label: 'Steps', type: 'list', itemLabel: 'title', fields: [{ name: 'title', label: 'Title', type: 'text' }, { name: 'text', label: 'Text', type: 'textarea' }] }],
  },
  {
    type: 'imageSplit',
    label: 'Image + text split',
    description: 'Parallax image beside text.',
    icon: '◧',
    fields: [
      eyebrow,
      tone,
      title,
      { name: 'text', label: 'Text', type: 'markdown' },
      { name: 'image', label: 'Image', type: 'image' },
      { name: 'reverse', label: 'Image on the right', type: 'boolean', half: true },
      { name: 'link', label: 'Link', type: 'group', fields: linkFields },
    ],
  },
  {
    type: 'gallery',
    label: 'Gallery',
    description: 'Staggered image gallery with parallax.',
    icon: '▥',
    fields: [eyebrow, tone, title, { name: 'images', label: 'Images', type: 'images' }],
  },
  {
    type: 'testimonials',
    label: 'Testimonials',
    description: 'Stacked quote cards (managed under Testimonials).',
    icon: '“',
    fields: [eyebrow, tone, title],
  },
  {
    type: 'journal',
    label: 'Journal posts',
    description: 'Latest journal articles.',
    icon: '✎',
    fields: [eyebrow, tone, title, { name: 'limit', label: 'Max posts', type: 'number', half: true }],
  },
  {
    type: 'faq',
    label: 'FAQ',
    description: 'Accordion of questions.',
    icon: '?',
    fields: [eyebrow, tone, title, { name: 'items', label: 'Questions', type: 'list', itemLabel: 'q', fields: [{ name: 'q', label: 'Question', type: 'text' }, { name: 'a', label: 'Answer', type: 'textarea' }] }],
  },
  {
    type: 'richText',
    label: 'Rich text',
    description: 'Free-form text (markdown).',
    icon: 'T',
    fields: [eyebrow, tone, title, { name: 'body', label: 'Body', type: 'markdown' }, { name: 'narrow', label: 'Narrow column', type: 'boolean', half: true }],
  },
  {
    type: 'contact',
    label: 'Contact / inquiry form',
    description: 'Contact details + inquiry form. Submissions land in Admin → Inquiries.',
    icon: '✉',
    fields: [eyebrow, tone, title, { name: 'text', label: 'Text', type: 'textarea' }, { name: 'subjects', label: 'Subject options', type: 'tags' }],
  },
  {
    type: 'cta',
    label: 'Call to action',
    description: 'Huge closing statement with button.',
    icon: '→',
    fields: [eyebrow, tone, title, { name: 'link', label: 'Button', type: 'group', fields: linkFields }],
  },
];

export const sectionDef = (type: string) => SECTION_DEFS.find((s) => s.type === type);
