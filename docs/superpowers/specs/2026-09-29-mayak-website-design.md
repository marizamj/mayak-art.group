# MAYAK art group website — design

Date: 2026-09-29
Domain: mayak-art.group

## Goal

A portfolio site for MAYAK art group: showcase a small number of art projects
(currently 2 finished + 1 in development, new ones added rarely), plus an About
page with a statement and contact info. English only.

## Decisions

- **Hand-written static site**: plain HTML and one CSS file. No JavaScript is
  needed (the beam is a CSS animation). No framework (no React), no build step,
  no static site generator.
- **Hosting**: GitHub repository, published with GitHub Pages (auto-deploy on
  push to `main`), custom domain mayak-art.group with HTTPS.
- **Content is edited by hand** in the HTML files; no CMS/admin UI.

## Visual style

"Dark with a bit of brutalist" (mockup option 2):

- Near-black night-sea background (`#07090d`), warm off-white text (`#e8e6df`),
  muted gray secondary text (`#9a988f`).
- Huge bold grotesk wordmark "MAYAK" (Helvetica Neue / system sans, weight 800,
  tight letter-spacing) spanning the page width.
- Thin grid lines in soft light-gray (`rgba(232,230,223,.22)`), not black.
- Small monospace labels for navigation, metadata and numbering (`01 — TITLE`).
- A lighthouse beam: a soft warm light cone (`rgba(255,226,150,~.2)`) that slowly
  sweeps across the homepage header. Disabled under `prefers-reduced-motion`.
- System fonts only (no web-font downloads).

All colors and fonts are CSS custom properties at the top of `style.css`.

## File structure

```
index.html                 homepage
about.html                 statement + contact
projects/<slug>.html       one page per project (incl. the in-development teaser)
css/style.css              all styles
images/<slug>/…            web-sized images (~2000px long edge, JPG/WebP)
media/…                    optional small self-hosted audio / short video loops
snippets.html              copy-paste reference for every media block (not linked from the site)
404.html                   not-found page (served by GitHub Pages)
CNAME                      mayak-art.group (for GitHub Pages)
.nojekyll                  serve files as-is on GitHub Pages
README.md                  how to add a project, edit text, publish
```

Header (top bar) and footer are duplicated in each page, wrapped in clearly
marked `<!-- HEADER START/END -->` / `<!-- FOOTER START/END -->` comments so
they are easy to find and update together.

## Pages

### Shared chrome
- **Top bar**: `MAYAK / ART GROUP` left (links home), `PROJECTS · ABOUT` right,
  monospace, thin rule below.
- **Footer**: contact email, social links, `© MAYAK art group`.

### Homepage (`index.html`)
1. Top bar.
2. Full-width "MAYAK" wordmark with the beam sweeping across it; thin rule below.
3. Project grid with thin rules between tiles: 3 columns desktop, 2 tablet,
   1 phone. Each tile: cover image + monospace label `01 — TITLE · YEAR`; whole
   tile links to the project page. Hover: image brightens slightly.
4. The in-development project's tile uses a diagonal-stripe pattern instead of
   an image and the label `03 — IN DEVELOPMENT`; it links to its teaser page.
5. Footer.

### Project pages (`projects/<slug>.html`)
Each page chooses its layout via a class on `<body>`:

- **`layout-story`** — hero image full width, then huge title, then a two-column
  area: narrow left "facts" column (year, medium, place, links) and a wide main
  column where content blocks stack in the chosen order.
- **`layout-split`** — left column fixed (sticky) with title, facts, text and
  links; right column scrolls through the media blocks.

Both collapse to a single column on phones (split: text first, then media).

Content blocks (each available as a snippet in `snippets.html`):
- Text (paragraphs, headings)
- Single image with optional caption
- Image pair (two side by side, stacked on phones)
- Video embed (Vimeo/YouTube iframe, 16:9 responsive)
- Self-hosted short video loop (`<video muted loop playsinline>`)
- Audio player (`<audio controls>` styled to match)
- Interactive embed (responsive iframe)
- Link list (press, venue, tickets) in monospace with `→`

Lazy-loading (`loading="lazy"`) on all images except the hero/first image.

### Teaser page (in-development project)
Uses `layout-story` with: title, an "IN DEVELOPMENT" label, one paragraph, and
optionally one sketch image. When the project launches, the same page is filled
in.

### About page (`about.html`)
Top bar, the statement in large readable type, then a contact block (email,
social links) in monospace separated by grid lines. Structured so members / CV
sections can be added later as further blocks.

## Content

Built first with clearly marked placeholder text and generated placeholder
images, so real content can be dropped in. Needed from MAYAK later: project
titles/years/mediums/places/texts, images, Vimeo/YouTube links, statement,
contact email, social links.

## JavaScript

The site uses no JavaScript of its own. The beam and hover effects are CSS.
Only third-party embeds (Vimeo/YouTube) run their own scripts.

## Accessibility & basics

- Semantic HTML (`header`, `nav`, `main`, `footer`), alt text on every image,
  visible focus styles, sufficient contrast on the dark background.
- `prefers-reduced-motion` stops the beam.
- Per-page `<title>`, meta description and Open Graph tags (title, description)
  so shared links look good. `og:image` is prepared but commented out until real
  1200×630 JPG preview images exist.
- Favicon.

## Deployment

1. Create a GitHub repo, push the site.
2. Enable GitHub Pages (deploy from `main`, root).
3. `CNAME` file with `mayak-art.group`; add DNS records at the domain registrar
   (A records to GitHub Pages IPs for the apex, CNAME for `www`); enable
   "Enforce HTTPS".
4. README documents this plus "how to add a project".

## Testing / verification before launch

- Every page checked at desktop (~1440px), tablet (~768px), phone (~375px).
- All internal links resolve; no console errors.
- Reduced-motion preference stops the beam.
- Images are web-sized (no multi-MB originals).

## Out of scope (for now)

Member profiles, CV/press lists, news, events, newsletter, shop, multiple
languages, CMS. The structure leaves room to add pages later.
