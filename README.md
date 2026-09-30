# mayak-art.group

Website of MAYAK art group. Plain HTML + one CSS file, no build step.

```
index.html              homepage (wordmark + project grid)
about.html              statement + contact
projects/*.html         one page per project
css/style.css           all styling (colors & fonts at the top)
images/<project>/       images per project
media/                  self-hosted audio / short video loops
js/site.js              keeps the text column in view on split-layout pages (optional polish)
snippets.html           copy-paste blocks for project pages (not linked, not indexed)
404.html                "page not found"
CNAME                   custom domain for GitHub Pages
```

## Preview locally

```bash
python3 -m http.server 8420
```

Then open http://localhost:8420.

## Replace the placeholders

Search the files for `PLACEHOLDER`. That covers the texts, email, Instagram link, video
links and image alt texts. The images in `images/` are placeholder SVGs, so replace them
with your own photos and update the `src` in the HTML to match.

## Add a project

1. Copy an existing project page, e.g. `projects/the-lighthouse-of-now-here.html` → `projects/new-name.html`.
2. Choose the layout on the `<body>` tag:
   - `layout-story`: big hero image, title, facts column + content column
   - `layout-split`: text fixed on the left, images scroll on the right
3. Edit the `<title>`, meta description, `og:` tags, title, facts and intro. For the link
   preview image, add a 1200×630 JPG to `images/og/` and point `og:image` at it.
4. Build the content from the blocks in `snippets.html` (text, image, image pair,
   video, loop, audio, embed, links).
5. Put images in `images/new-name/`.
6. Add a tile at the **top** of the grid in `index.html` (newest first; snippet at the bottom of `snippets.html`).

## Images

Export images at about **2000px** on the long side (covers: 1600×1200, 4:3), JPG quality ~80.
On a Mac, this resizes every JPG in a folder into `web/` (built-in `sips`):

```bash
mkdir -p web && sips -Z 2000 *.jpg --out web/
```

For galleries, also make small previews (800px) in a `thumbs/` folder next to the photos,
use the preview in `src` and link the full photo:

```bash
mkdir -p thumbs && sips -Z 800 -s formatOptions 75 *.jpg --out thumbs/
```

Phone photos often contain GPS location. Resizing with `sips` keeps it, so strip it before
publishing, or ask Claude to prepare the photos. The ones in this repo are already clean.

Set `width` and `height` on each `<img>` to the image's real size. Every image needs an `alt`
text describing it.

## After changing the CSS

Pages load the stylesheet as `css/style.css?v=2`. When you change `style.css`, bump the number
in every page (e.g. `?v=3`) so visitors' browsers fetch the new version instead of a cached one:

```bash
sed -i '' 's/style\.css?v=[0-9]*/style.css?v=3/' *.html projects/*.html
```

## Changing the header or footer

The header and footer are repeated in every page between the `<!-- HEADER START -->` /
`<!-- FOOTER START -->` comments. Change them in all pages. Pages in `projects/` use `../`
in their links.
