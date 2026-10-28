// Initial content written to data/db.json on first boot. Everything here is editable in the admin.
import type { Database, Section } from './types';

const now = () => new Date().toISOString();
let n = 0;
const sid = () => `s${(++n).toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const sec = (type: string, data: Record<string, any>): Section => ({ id: sid(), type, enabled: true, data });

const img = (name: string) => `/images/seed/${name}.jpg`;

const SEED_IMAGES = [
  ...['lune-chair', 'arc-sofa', 'halo-lamp', 'mono-table', 'strata-sideboard', 'orb-table', 'kova-armchair', 'nest-bed'].map((k) => `product-${k}`),
  ...['seating', 'tables', 'lighting', 'storage', 'bedroom'].map((k) => `cat-${k}`),
  ...[1, 2, 3, 4, 5, 6].map((n) => `project-${n}`),
  ...[1, 2, 3, 4].map((n) => `post-${n}`),
  'studio-1',
  'studio-2',
];

export function seedDatabase(): Omit<Database, 'users'> {
  const t = now();
  return {
    theme: {
      colors: {
        bg: '#f3f3f0',
        surface: '#ffffff',
        ink: '#0e1012',
        muted: '#6a6f74',
        line: '#dcdedb',
        accent: '#23564a',
        accent2: '#0e1012',
        inverseBg: '#0e1012',
        inverseInk: '#f3f3f0',
      },
      fonts: { display: 'Plus Jakarta Sans', body: 'Inter', mono: 'Inter', displayItalic: false },
      typography: { baseSize: 16, scale: 1.333, displayWeight: 600, bodyWeight: 400, letterSpacingDisplay: -0.045, lineHeightBody: 1.6, uppercaseLabels: true },
      ui: { radius: 14, grain: false, customCursor: true, smoothScroll: true, pageTransitions: true, buttonStyle: 'pill' },
    },
    settings: {
      siteName: 'FORMA Atelier',
      logoText: 'FORMA',
      logoImage: '',
      tagline: 'Sculptural furniture & interiors, made to be lived in.',
      announcement: { enabled: true, text: 'New — place any piece in your room with AR. Try it on your phone →', href: '/collection' },
      nav: [
        { label: 'Collection', href: '/collection' },
        { label: 'Projects', href: '/projects' },
        { label: 'Showroom VR', href: '/showroom' },
        { label: 'Journal', href: '/journal' },
        { label: 'Studio', href: '/studio' },
      ],
      headerCta: { label: 'Book a consultation', href: '/contact' },
      contact: {
        email: 'hello@forma.studio',
        phone: '+91 98200 12345',
        address: '14 Kala Ghoda Lane, Fort\nMumbai 400001, India',
        hours: 'Tue — Sun · 11:00 — 19:00',
        mapUrl: 'https://maps.google.com/?q=Kala+Ghoda+Mumbai',
      },
      socials: [
        { label: 'Instagram', href: 'https://instagram.com' },
        { label: 'Pinterest', href: 'https://pinterest.com' },
        { label: 'Behance', href: 'https://behance.net' },
        { label: 'LinkedIn', href: 'https://linkedin.com' },
      ],
      footer: {
        headline: 'Let’s shape\n*your* space.',
        note: '© FORMA Atelier. Designed & made in India.',
        columns: [
          { title: 'Explore', links: [{ label: 'Collection', href: '/collection' }, { label: 'Projects', href: '/projects' }, { label: 'VR Showroom', href: '/showroom' }, { label: 'Journal', href: '/journal' }] },
          { title: 'Studio', links: [{ label: 'About', href: '/studio' }, { label: 'Services', href: '/studio#process' }, { label: 'Contact', href: '/contact' }] },
        ],
      },
      seo: {
        title: 'FORMA Atelier — Sculptural furniture & interiors',
        description: 'Explore furniture in 3D, place it in your room with AR, and walk our virtual showroom. Interior design studio based in Mumbai.',
        ogImage: img('project-1'),
      },
      currency: '₹',
      showPrices: true,
    },
    categories: [
      { id: 'c1', slug: 'seating', name: 'Seating', description: 'Lounge chairs, sofas and armchairs shaped around the body.', image: img('cat-seating'), order: 1 },
      { id: 'c2', slug: 'tables', name: 'Tables', description: 'Dining, side and coffee tables in stone and solid wood.', image: img('cat-tables'), order: 2 },
      { id: 'c3', slug: 'lighting', name: 'Lighting', description: 'Floor and pendant lights that sculpt the evening.', image: img('cat-lighting'), order: 3 },
      { id: 'c4', slug: 'storage', name: 'Storage', description: 'Sideboards and cabinets with fluted, tactile fronts.', image: img('cat-storage'), order: 4 },
      { id: 'c5', slug: 'bedroom', name: 'Bedroom', description: 'Beds and quiet pieces for rest.', image: img('cat-bedroom'), order: 5 },
    ],
    products: [
      {
        id: 'p1', slug: 'lune-lounge-chair', name: 'Lune Lounge Chair', category: 'seating', price: 148000,
        tagline: 'A crescent of comfort, hand-upholstered in bouclé.',
        description: 'The **Lune** wraps you in a single continuous curve. A solid walnut base carries a hand-upholstered shell in heavy Italian bouclé, finished with a loose seat cushion that softens with use.\n\n- Hand-upholstered in our Mumbai atelier\n- FSC-certified solid walnut legs\n- Removable, dry-cleanable cushion cover',
        dimensions: { w: 76, d: 72, h: 102 }, materials: ['Bouclé', 'Solid walnut', 'High-resilience foam'], designer: 'Aanya Mehra', leadTime: '6 — 8 weeks',
        model: 'lune-chair', modelUrl: '', usdzUrl: '',
        variants: [
          { name: 'Oat bouclé', color: '#c9b79c', slot: 'upholstery' },
          { name: 'Clay', color: '#b4532a', slot: 'upholstery' },
          { name: 'Moss', color: '#5c6b4a', slot: 'upholstery' },
          { name: 'Ink', color: '#2a2a2e', slot: 'upholstery' },
        ],
        images: [img('product-lune-chair')], featured: true, inShowroom: true, arEnabled: true, status: 'published', order: 1, createdAt: t,
      },
      {
        id: 'p2', slug: 'arc-sofa', name: 'Arc Sofa', category: 'seating', price: 325000,
        tagline: 'Low, deep and generous — a sofa for long conversations.',
        description: 'Three deep feather-wrapped seats sit on a floating oak plinth. The **Arc** is designed low to the ground for a relaxed, grounded posture.',
        dimensions: { w: 230, d: 95, h: 78 }, materials: ['Linen blend', 'Smoked oak', 'Feather-wrap foam'], designer: 'Studio FORMA', leadTime: '8 — 10 weeks',
        model: 'arc-sofa', modelUrl: '', usdzUrl: '',
        variants: [
          { name: 'Sage linen', color: '#8a8f7a', slot: 'upholstery' },
          { name: 'Sand', color: '#d6c7ad', slot: 'upholstery' },
          { name: 'Rust', color: '#9c4a2a', slot: 'upholstery' },
          { name: 'Charcoal', color: '#3b3a38', slot: 'upholstery' },
        ],
        images: [img('product-arc-sofa')], featured: true, inShowroom: true, arEnabled: true, status: 'published', order: 2, createdAt: t,
      },
      {
        id: 'p3', slug: 'halo-floor-lamp', name: 'Halo Floor Lamp', category: 'lighting', price: 64000,
        tagline: 'A single brass gesture, ending in light.',
        description: 'A hand-bent brass arc rises from a honed travertine base and bows into a softly glowing dome.',
        dimensions: { w: 120, d: 44, h: 200 }, materials: ['Brushed brass', 'Travertine', 'Opal diffuser'], designer: 'Kabir Rao', leadTime: '4 weeks',
        model: 'halo-lamp', modelUrl: '', usdzUrl: '',
        variants: [
          { name: 'Brass', color: '#b08d57', slot: 'metal' },
          { name: 'Blackened steel', color: '#2a2826', slot: 'metal' },
          { name: 'Chrome', color: '#c8c8c8', slot: 'metal' },
        ],
        images: [img('product-halo-lamp')], featured: true, inShowroom: true, arEnabled: true, status: 'published', order: 3, createdAt: t,
      },
      {
        id: 'p4', slug: 'mono-dining-table', name: 'Mono Dining Table', category: 'tables', price: 210000,
        tagline: 'A turned pedestal under a travertine moon.',
        description: 'A lathe-turned solid wood pedestal holds a 130cm round top in honed travertine. Seats six comfortably.',
        dimensions: { w: 130, d: 130, h: 76 }, materials: ['Travertine', 'Solid teak'], designer: 'Aanya Mehra', leadTime: '10 weeks',
        model: 'mono-table', modelUrl: '', usdzUrl: '',
        variants: [
          { name: 'Travertine', color: '#e3dccf', slot: 'stone' },
          { name: 'Nero marble', color: '#2b2a28', slot: 'stone' },
          { name: 'Rosso', color: '#8e4b3c', slot: 'stone' },
        ],
        images: [img('product-mono-table')], featured: true, inShowroom: true, arEnabled: true, status: 'published', order: 4, createdAt: t,
      },
      {
        id: 'p5', slug: 'strata-sideboard', name: 'Strata Sideboard', category: 'storage', price: 186000,
        tagline: 'Forty-four flutes, one quiet rhythm.',
        description: 'A solid wood body wrapped in hand-routed flutes, topped with a slab of nero marble and lifted on blackened steel blades.',
        dimensions: { w: 180, d: 45, h: 81 }, materials: ['Walnut veneer', 'Nero marble', 'Blackened steel'], designer: 'Studio FORMA', leadTime: '8 weeks',
        model: 'strata-sideboard', modelUrl: '', usdzUrl: '',
        variants: [
          { name: 'Walnut', color: '#7a5134', slot: 'wood' },
          { name: 'Bleached oak', color: '#cdb58f', slot: 'wood' },
          { name: 'Ebonised', color: '#24201c', slot: 'wood' },
        ],
        images: [img('product-strata-sideboard')], featured: false, inShowroom: true, arEnabled: true, status: 'published', order: 5, createdAt: t,
      },
      {
        id: 'p6', slug: 'orb-side-table', name: 'Orb Side Table', category: 'tables', price: 38000,
        tagline: 'Glazed terracotta, balanced on a sphere.',
        description: 'A hand-thrown terracotta orb in a satin glaze, finished with a pale lacquered top.',
        dimensions: { w: 56, d: 56, h: 54 }, materials: ['Glazed terracotta', 'Lacquered ash'], designer: 'Kabir Rao', leadTime: '3 weeks',
        model: 'orb-table', modelUrl: '', usdzUrl: '',
        variants: [
          { name: 'Terracotta', color: '#b4532a', slot: 'stone' },
          { name: 'Olive glaze', color: '#5f6a45', slot: 'stone' },
          { name: 'Chalk', color: '#e8e2d6', slot: 'stone' },
        ],
        images: [img('product-orb-table')], featured: true, inShowroom: true, arEnabled: true, status: 'published', order: 6, createdAt: t,
      },
      {
        id: 'p7', slug: 'kova-armchair', name: 'Kova Armchair', category: 'seating', price: 112000,
        tagline: 'Plump and square, floating on steel sled runners.',
        description: 'A modernist block of comfort, upholstered in wool and lifted on tubular steel runners.',
        dimensions: { w: 84, d: 80, h: 76 }, materials: ['Wool felt', 'Powder-coated steel'], designer: 'Studio FORMA', leadTime: '6 weeks',
        model: 'kova-armchair', modelUrl: '', usdzUrl: '',
        variants: [
          { name: 'Terracotta wool', color: '#b4532a', slot: 'upholstery' },
          { name: 'Bone', color: '#e6dccb', slot: 'upholstery' },
          { name: 'Forest', color: '#2f3b2c', slot: 'upholstery' },
        ],
        images: [img('product-kova-armchair')], featured: false, inShowroom: true, arEnabled: true, status: 'published', order: 7, createdAt: t,
      },
      {
        id: 'p8', slug: 'nest-bed', name: 'Nest Bed', category: 'bedroom', price: 268000,
        tagline: 'A padded headboard that curves around sleep.',
        description: 'Solid wood frame, generous upholstered headboard and a low profile designed for calm bedrooms.',
        dimensions: { w: 195, d: 215, h: 105 }, materials: ['Linen', 'Solid walnut'], designer: 'Aanya Mehra', leadTime: '8 weeks',
        model: 'nest-bed', modelUrl: '', usdzUrl: '',
        variants: [
          { name: 'Ecru linen', color: '#d8cdbb', slot: 'upholstery' },
          { name: 'Dusk', color: '#6e6a74', slot: 'upholstery' },
          { name: 'Ochre', color: '#c08a3e', slot: 'upholstery' },
        ],
        images: [img('product-nest-bed')], featured: false, inShowroom: false, arEnabled: true, status: 'published', order: 8, createdAt: t,
      },
    ],
    projects: [
      { id: 'pr1', slug: 'malabar-hill-residence', title: 'Malabar Hill Residence', location: 'Mumbai', year: '2025', area: '4,200 sq ft', type: 'Residence', cover: img('project-1'), gallery: [img('project-2'), img('project-3')], summary: 'A sea-facing apartment re-imagined around light, lime plaster and low, sculptural furniture.', body: 'The brief was simple: **slow the city down**. We stripped the apartment back to its concrete frame and rebuilt it in lime plaster, travertine and smoked oak.\n\nEvery piece of furniture was designed in-house, scaled to the long horizontal views of the Arabian Sea.', featured: true, status: 'published', order: 1, createdAt: t },
      { id: 'pr2', slug: 'amber-courtyard-house', title: 'Amber Courtyard House', location: 'Jaipur', year: '2024', area: '6,800 sq ft', type: 'Residence', cover: img('project-2'), gallery: [img('project-4'), img('project-1')], summary: 'A haveli-inspired family home with a terracotta palette and a sunken courtyard lounge.', body: 'Built around a central courtyard, the house uses **terracotta, sandstone and hand-loomed textiles** from Rajasthan.', featured: true, status: 'published', order: 2, createdAt: t },
      { id: 'pr3', slug: 'kiln-cafe', title: 'Kiln Café & Bar', location: 'Bengaluru', year: '2024', area: '2,100 sq ft', type: 'Hospitality', cover: img('project-3'), gallery: [img('project-5'), img('project-2')], summary: 'A ceramic-studio café where every table and lamp was made for the space.', body: 'Kiln celebrates the craft of clay — custom **Orb** tables in eight glazes punctuate a warm, plastered room.', featured: true, status: 'published', order: 3, createdAt: t },
      { id: 'pr4', slug: 'quiet-studio-loft', title: 'Quiet Studio Loft', location: 'Goa', year: '2023', area: '1,600 sq ft', type: 'Workspace', cover: img('project-4'), gallery: [img('project-6'), img('project-3')], summary: 'An architect’s loft with fluted oak storage and a single sculptural lamp.', body: 'A calm, monastic workspace with built-in **Strata** storage along one long wall.', featured: true, status: 'published', order: 4, createdAt: t },
      { id: 'pr5', slug: 'monsoon-villa', title: 'Monsoon Villa', location: 'Alibaug', year: '2023', area: '5,400 sq ft', type: 'Residence', cover: img('project-5'), gallery: [img('project-1'), img('project-6')], summary: 'A weekend villa that opens completely to the rain.', body: 'Deep verandas, low sofas and **washable linen** everywhere.', featured: true, status: 'published', order: 5, createdAt: t },
      { id: 'pr6', slug: 'the-reading-room', title: 'The Reading Room', location: 'Delhi', year: '2022', area: '900 sq ft', type: 'Hospitality', cover: img('project-6'), gallery: [img('project-4'), img('project-5')], summary: 'A members’ library lounge in olive, walnut and brass.', body: 'Twelve **Lune** chairs, each in a different bouclé, arranged around a single round table.', featured: false, status: 'published', order: 6, createdAt: t },
    ],
    posts: [
      { id: 'po1', slug: 'designing-for-the-monsoon', title: 'Designing for the monsoon', excerpt: 'Materials that breathe, fabrics that forgive, and why we love lime plaster.', cover: img('post-1'), body: '## Breathable by design\n\nIndian homes face months of humidity. We choose **lime plaster, solid wood and natural linens** because they move with the season instead of fighting it.\n\n## Our rules\n\n- Avoid MDF in coastal homes\n- Choose performance linen over velvet\n- Lift furniture off the floor', author: 'Aanya Mehra', date: '2025-08-12', tags: ['Materials', 'Guides'], status: 'published', createdAt: t },
      { id: 'po2', slug: 'how-to-use-ar-before-you-buy', title: 'How to try furniture in your room with AR', excerpt: 'A two-minute guide to placing any FORMA piece in your home using just your phone.', cover: img('post-2'), body: '## No app required\n\nOpen any product page on your phone and tap **View in your room**. Your camera opens, and the piece appears at true scale.\n\n1. Point your phone at the floor\n2. Move slowly until the floor is detected\n3. Drag to place, pinch to rotate', author: 'Studio FORMA', date: '2025-07-02', tags: ['AR', 'Guides'], status: 'published', createdAt: t },
      { id: 'po3', slug: 'the-return-of-the-curve', title: 'The return of the curve', excerpt: 'Why soft, rounded silhouettes are defining the next decade of interiors.', cover: img('post-3'), body: 'After a decade of hard lines, the curve is back — and it is here to stay.', author: 'Kabir Rao', date: '2025-05-20', tags: ['Trends'], status: 'published', createdAt: t },
      { id: 'po4', slug: 'inside-our-atelier', title: 'Inside our atelier', excerpt: 'Meet the twelve craftspeople who build every piece by hand.', cover: img('post-4'), body: 'Our Mumbai workshop is where every frame is joined, every cushion stuffed and every seam checked twice.', author: 'Studio FORMA', date: '2025-03-14', tags: ['Craft'], status: 'published', createdAt: t },
    ],
    testimonials: [
      { id: 't1', quote: 'They didn’t decorate our home — they slowed it down. Every room feels like an exhale.', name: 'Ritika & Arjun S.', role: 'Malabar Hill Residence', avatar: '', order: 1 },
      { id: 't2', quote: 'Being able to place the Arc sofa in our living room with AR before ordering sealed the deal.', name: 'Neha Kapoor', role: 'Client, Pune', avatar: '', order: 2 },
      { id: 't3', quote: 'The craftsmanship is extraordinary. Our café guests ask about the tables every single day.', name: 'Vikram Iyer', role: 'Founder, Kiln Café', avatar: '', order: 3 },
    ],
    pages: [
      {
        id: 'home', slug: 'home', title: 'Home', seoTitle: '', seoDescription: '', status: 'published', createdAt: t,
        sections: [
          sec('hero3d', {
            eyebrow: 'Atelier of objects & interiors', tone: 'light',
            title: 'Furniture that\n*holds* the light.',
            subtitle: 'Sculptural pieces, made by hand in Mumbai. Spin them in 3D, place them in your room with AR, then walk our virtual showroom.',
            model: 'lune-chair', modelColor: '#c9b79c',
            primary: { label: 'Explore the collection', href: '/collection' },
            secondary: { label: 'Enter VR showroom', href: '/showroom' },
            meta: [{ text: 'N° 01 — Lune Lounge Chair' }, { text: '19.0760° N, 72.8777° E' }, { text: 'Scroll to rotate' }],
          }),
          sec('marquee', { items: ['Hand-made', 'Sculptural', 'Lime & stone', 'View in AR', 'Walk in VR', 'Since 2014'], tone: 'dark', speed: 30 }),
          sec('manifesto', {
            eyebrow: '(The studio)', tone: 'light',
            text: 'We design rooms the way a sculptor carves stone — removing everything that isn’t essential until only calm, light and touch remain. Every object is drawn, joined and upholstered by hand, then made to be lived with for generations.',
            link: { label: 'Meet the studio', href: '/studio' },
          }),
          sec('scrollStory', {
            eyebrow: 'Anatomy of a chair', tone: 'dark',
            title: 'Built in *layers*,\nmade to last.',
            model: 'lune-chair',
            steps: [
              { title: '01 — The frame', text: 'Solid walnut legs, joined with hidden mortise and tenon — no screws, no shortcuts.' },
              { title: '02 — The shell', text: 'A steam-bent ply shell gives the Lune its crescent embrace.' },
              { title: '03 — The softness', text: 'Three densities of foam, wrapped in feather and hand-upholstered bouclé.' },
              { title: '04 — The finish', text: 'Every seam is hand-checked and signed by the maker before it leaves the atelier.' },
            ],
          }),
          sec('collectionRail', { eyebrow: 'The collection', tone: 'light', title: 'Objects for\n*slow* living', source: 'featured', category: '', limit: 8, link: { label: 'View all pieces', href: '/collection' } }),
          sec('configurator', {
            eyebrow: 'Make it yours', tone: 'surface',
            title: 'Choose your *fabric*.\nSee it instantly.',
            text: 'Every piece is made to order. Switch upholstery in real time and see exactly how it falls on the form.',
            product: 'arc-sofa', model: 'arc-sofa', slot: 'upholstery',
            swatches: [
              { name: 'Sage linen', color: '#8a8f7a' },
              { name: 'Sand', color: '#d6c7ad' },
              { name: 'Rust', color: '#9c4a2a' },
              { name: 'Charcoal', color: '#3b3a38' },
              { name: 'Ochre', color: '#c08a3e' },
            ],
          }),
          sec('categoryGrid', { eyebrow: 'Browse by room', tone: 'light', title: 'Five families\nof *objects*' }),
          sec('arPromo', {
            eyebrow: 'Augmented reality', tone: 'accent',
            title: 'See it in\n*your* room.',
            text: 'No app needed. Open any piece on your phone and place it on your floor at true scale — walk around it, look underneath, check it fits.',
            product: 'orb-side-table', buttonLabel: 'Try AR now',
            points: [{ text: 'Works on iPhone (Quick Look) & Android (Scene Viewer)' }, { text: 'True-to-life scale, to the centimetre' }, { text: 'Switch colours before you place' }],
          }),
          sec('projectsBento', { eyebrow: 'Selected projects', tone: 'light', title: 'Rooms we’ve\n*shaped*', limit: 5, link: { label: 'All projects', href: '/projects' } }),
          sec('vrPromo', {
            eyebrow: 'Virtual reality', tone: 'dark',
            title: 'Walk our\n*showroom*\nfrom anywhere.',
            text: 'Step inside a full-scale virtual gallery with a VR headset — or explore it right in your browser. Every piece is placed in a real room.',
            buttonLabel: 'Enter the showroom',
          }),
          sec('stats', { tone: 'light', items: [{ value: '240+', label: 'Homes designed' }, { value: '12', label: 'Master craftspeople' }, { value: '11', label: 'Years in Mumbai' }, { value: '100%', label: 'Made by hand' }] }),
          sec('testimonials', { eyebrow: 'Kind words', tone: 'surface', title: 'From the people\nwho *live* with it' }),
          sec('journal', { eyebrow: 'Journal', tone: 'light', title: 'Notes from\nthe *atelier*', limit: 3 }),
          sec('cta', { eyebrow: 'Start a project', tone: 'dark', title: 'Let’s design\nsomething *quiet*.', link: { label: 'Book a consultation', href: '/contact' } }),
        ],
      },
      {
        id: 'studio', slug: 'studio', title: 'Studio', seoTitle: 'The Studio — FORMA Atelier', seoDescription: 'An interior design studio and furniture atelier in Mumbai.', status: 'published', createdAt: t,
        sections: [
          sec('manifesto', { eyebrow: '(About)', tone: 'light', text: 'FORMA is an interior architecture studio and furniture atelier founded in Mumbai in 2014. We work slowly, with natural materials and with the hands of twelve master craftspeople.', link: { label: '', href: '' } }),
          sec('imageSplit', { eyebrow: 'Our story', tone: 'surface', title: 'Made by *hand*,\nnot by catalogue.', text: 'We began as a two-person workshop making chairs for friends. Today we design entire homes, hotels and cafés — but every chair is still built the same way.\n\nWe believe furniture should be **sculptural enough to admire**, comfortable enough to forget.', image: img('studio-1'), reverse: false, link: { label: 'See our projects', href: '/projects' } }),
          sec('stats', { tone: 'dark', items: [{ value: '2014', label: 'Founded' }, { value: '240+', label: 'Projects' }, { value: '38', label: 'Original designs' }, { value: '6', label: 'Cities' }] }),
          sec('process', {
            eyebrow: 'How we work', tone: 'light', title: 'From first sketch\nto *final* cushion',
            steps: [
              { title: 'Listen', text: 'A long conversation in your space about how you live, cook, read and rest.' },
              { title: 'Draw', text: 'Hand sketches, mood boards and a full 3D walkthrough you can view in VR.' },
              { title: 'Make', text: 'Furniture is built to order in our atelier while the site is prepared.' },
              { title: 'Style', text: 'We install, place and style every object — down to the last vase.' },
            ],
          }),
          sec('gallery', { eyebrow: 'The atelier', tone: 'light', title: 'Inside the *workshop*', images: [img('studio-2'), img('project-3'), img('studio-1'), img('project-6')] }),
          sec('faq', {
            eyebrow: 'Questions', tone: 'surface', title: 'Good to *know*',
            items: [
              { q: 'Do you take projects outside Mumbai?', a: 'Yes — we work across India and the Middle East. Furniture ships worldwide.' },
              { q: 'Can I customise dimensions?', a: 'Almost every piece can be resized and made in any of our 60+ fabrics.' },
              { q: 'How does AR work?', a: 'Open a product on your phone and tap “View in your room”. It works on modern iPhones and Android phones without any app.' },
              { q: 'Do I need a VR headset for the showroom?', a: 'No. The showroom works in any browser; a headset (Quest, Vision Pro) makes it fully immersive.' },
            ],
          }),
          sec('cta', { eyebrow: 'Work with us', tone: 'accent', title: 'Tell us about\n*your* space.', link: { label: 'Start a conversation', href: '/contact' } }),
        ],
      },
      {
        id: 'contact', slug: 'contact', title: 'Contact', seoTitle: 'Contact — FORMA Atelier', seoDescription: 'Book a consultation or visit our Mumbai showroom.', status: 'published', createdAt: t,
        sections: [
          sec('contact', { eyebrow: 'Contact', tone: 'light', title: 'Let’s talk\nabout *your* space.', text: 'Tell us a little about your project — we usually reply within one working day.', subjects: ['Interior design project', 'Furniture order', 'Trade / architects', 'Press', 'Something else'] }),
          sec('faq', {
            eyebrow: 'Before you write', tone: 'surface', title: 'Frequently *asked*',
            items: [
              { q: 'What is your minimum project size?', a: 'For full interiors we usually start at one complete room. Furniture can be ordered individually.' },
              { q: 'Can I visit the showroom?', a: 'Yes — our Kala Ghoda showroom is open Tuesday to Sunday. Or walk it in VR any time.' },
            ],
          }),
        ],
      },
    ],
    inquiries: [
      { id: 'i1', name: 'Priya Shah', email: 'priya@example.com', phone: '+91 99000 11111', subject: 'Furniture order', message: 'Hi! Is the Arc Sofa available in a 2-seater size? We loved it in AR.', product: 'arc-sofa', read: false, createdAt: t },
    ],
    media: SEED_IMAGES.map((name, i) => ({ id: `m${i + 1}`, filename: `${name}.jpg`, url: img(name), mime: 'image/jpeg', size: 0, alt: '', createdAt: t })),
  };
}
