# FORMA Atelier — immersive furniture & interior website + CMS

A fully dynamic furniture / interior-design studio website with **real-time 3D**, **scroll-driven 3D animation**, **AR “view in your room”**, a **WebXR VR showroom**, and a complete **admin panel / CMS** that controls every page, section, product, colour, font and menu.

> **Hinglish summary:** Poori website admin panel se control hoti hai — pages, sections (drag & drop), products + 3D models, colours, fonts, typography, menu, footer, contact details, inquiries — sab kuch. 3D models scroll pe ghoomte hain, mobile pe AR se furniture apne room mein dekh sakte ho, aur VR headset (Quest / Vision Pro) ya browser mein virtual showroom mein ghoom sakte ho.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # set AUTH_SECRET + admin login
npm run dev                  # http://localhost:3000
```

- Website: `http://localhost:3000`
- Admin panel: `http://localhost:3000/admin`
- Default login: `admin@forma.studio` / `admin123` (from `.env.local` — **change it**, or change the password in Admin → Account)

> `npm run dev` is for editing code only — it compiles every page on first visit and runs unoptimised, so it feels slow. To actually use or demo the site, always run the production build:

```bash
npm run build
npm start          # http://localhost:3000
```

The CMS database is created on first boot at `data/db.json` (seeded with demo content). Uploaded files go to `data/uploads/`. Back up the `data/` folder (or mount it as a volume) — that is the whole site.

---

## What’s inside

### Public website
| Feature | Where |
|---|---|
| **3D hero** — live model rotates, dollies and floats with scroll + mouse | `components/sections/Hero3D.tsx` |
| **Exploded scroll story** — pinned section; the piece assembles part-by-part as you scroll | `components/sections/ScrollStory.tsx` |
| **Live 3D configurator** — switch fabrics/finishes on the model in real time | `components/sections/Configurator.tsx` |
| **AR “view in your room”** — `<model-viewer>`: WebXR, Android Scene Viewer, iOS Quick Look; QR code on desktop; recolours to the chosen variant | `components/site/ARViewer.tsx` |
| **VR showroom** — WebXR room furnished from the CMS; teleport + thumbstick locomotion in headsets, orbit + double-click-to-walk in browsers, day/evening mode, mixed-reality mode | `/showroom`, `components/three/Showroom.tsx` |
| Horizontal scroll collection rail with velocity skew | `CollectionRail.tsx` |
| Hover-reveal category list, bento project grid, stacked testimonial cards, word-by-word manifesto reveal, counters, parallax/clip-path image reveals, marquee | `components/sections/*` |
| Smooth inertia scroll (Lenis + GSAP), custom cursor with context labels, film grain, page-transition curtain | `components/site/Chrome.tsx` |
| Product pages: 3D/photo toggle, dimensions overlay, variants, AR + VR buttons, enquiry | `/collection/[slug]` |
| Collection with category filters & sorting, projects index with hover previews, journal | `/collection`, `/projects`, `/journal` |
| Contact form → saved to Admin → Inquiries (honeypot + rate limit) | `/contact`, `/api/inquiry` |

### Admin panel (`/admin`)
- **Pages & sections** — page builder with **20 section types**; add, drag-reorder, duplicate, hide/show, edit every field; live desktop/mobile preview; create new pages at any URL; SEO per page.
- **Theme & typography** — default is a clean modern sans look (Plus Jakarta Sans + Inter, forest-green accent); every colour, display/body/mono fonts (any Google Font), base size, type scale, weights, letter-spacing, line-height, label case, corner radius, button style, grain, cursor, smooth scroll, transitions. 5 presets + live preview.
- **Settings & navigation** — site name/logo, announcement bar, menu, header button, contact details, socials, footer columns & giant headline, SEO defaults, currency, show/hide prices.
- **Products** — price, dimensions, materials, designer, variants (colour per material slot), images, built-in 3D model **or upload your own `.glb`** (+ optional `.usdz`), AR toggle, “place in VR showroom” toggle, live 3D preview.
- **Categories, Projects, Journal, Testimonials** — full CRUD, drafts, featured flags, drag-to-reorder.
- **Media library** — drag & drop uploads (images, `.glb`, `.usdz`, video, PDF).
- **Inquiries** — read/unread, reply by email, CSV export.
- **Account & users** — change password, invite editors/admins, reset demo content.

### Performance
Heavy post-processing (ambient occlusion, tone mapping) only runs on the product page and VR showroom, and only on powerful devices (8+ CPU cores, 8 GB+ RAM, wide screen). Homepage 3D uses PBR materials + cheap contact shadows, a max pixel ratio of 1.5, and each canvas pauses when scrolled off-screen. The VR teaser on the homepage is a still image; the live room loads only on `/showroom`.

### Using your own 3D models
Upload a `.glb` on any product (or in a section’s “3D model” field). To make it recolourable by variants/configurator, name its materials `upholstery`, `wood`, `metal`, `stone` or `accent` in Blender before exporting. Keep files under ~10 MB (use Draco/mesh simplification) for fast mobile AR.

The 8 built-in models are generated procedurally (`src/lib/furniture/builders.ts`) and exported to `public/models/*.glb|*.usdz` by `npm run models`.

---

## Tech
Next.js 15 (App Router) · React 19 · three.js · @react-three/fiber + drei · @react-three/xr (WebXR) · Google `<model-viewer>` (AR) · GSAP + Lenis · JSON-file CMS store (swap `src/lib/db.ts` for Postgres/Mongo when needed) · JWT (jose) + bcrypt auth.

```
src/
  app/(site)/        public pages (home, [slug], collection, projects, journal, showroom)
  app/admin/         admin panel
  app/api/           CMS + auth + inquiry + upload APIs
  components/sections  all page-builder sections
  components/three     3D scenes, VR showroom
  components/admin     schema-driven form renderer, media picker…
  lib/sections.ts    section types & their editable fields
  lib/schemas.ts     collection, theme & settings schemas
  lib/seed.ts        demo content
```

Adding a new editable field is one line in `lib/sections.ts` / `lib/schemas.ts` — the admin form updates automatically.

## Environment variables
| Var | Purpose |
|---|---|
| `AUTH_SECRET` | Long random string used to sign admin sessions (**required in production**) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First admin account (used only when `data/db.json` is first created) |
| `DATA_DIR` | Where the database & uploads live (default `./data`) |
| `INSECURE_COOKIES=1` | Allow admin login over plain HTTP in production (not recommended) |

## Deployment notes
- Needs a Node server with a persistent disk (VPS, Railway, Render, Fly.io, Docker). Serverless hosts with read-only file systems need `src/lib/db.ts` swapped for a database and uploads moved to object storage.
- AR and VR need **HTTPS** (WebXR / camera access).
- `npm run models` regenerates the built-in GLB/USDZ files; `node scripts/render-images.mjs` (with `npm run dev` running) re-renders the demo photography from the 3D scenes in `src/app/lab/render` (dev-only route).
