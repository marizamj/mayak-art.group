# mayak-art.group

Website of MAYAK art group. Plain HTML + one CSS file, no build step.

```
index.html              homepage (wordmark + project grid)
about.html              statement + contact
projects/*.html         one page per project
css/style.css           all styling (colors & fonts at the top)
images/<project>/       images per project
media/                  self-hosted audio / short video loops
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

1. Copy an existing project page, e.g. `projects/project-one.html` → `projects/new-name.html`.
2. Choose the layout on the `<body>` tag:
   - `layout-story`: big hero image, title, facts column + content column
   - `layout-split`: text fixed on the left, images scroll on the right
3. Edit the `<title>`, meta description, `og:` tags, title, facts and intro.
4. Build the content from the blocks in `snippets.html` (text, image, image pair,
   video, loop, audio, embed, links).
5. Put images in `images/new-name/`.
6. Add a tile to the grid in `index.html` (snippet at the bottom of `snippets.html`).

## Images

Export images at about **2000px** on the long side (covers: 1600×1200, 4:3), JPG quality ~80.
On a Mac, this resizes every JPG in a folder into `web/` (built-in `sips`):

```bash
mkdir -p web && sips -Z 2000 *.jpg --out web/
```

Set `width` and `height` on each `<img>` to the image's real size. Every image needs an `alt`
text describing it.

## Changing the header or footer

The header and footer are repeated in every page between the `<!-- HEADER START -->` /
`<!-- FOOTER START -->` comments. Change them in all pages. Pages in `projects/` use `../`
in their links.

## Publishing (GitHub Pages)

1. Create a repository on GitHub and push this folder to it.
2. On GitHub, go to **Settings → Pages**. Set Source to *Deploy from a branch*, then pick branch `main` and folder `/ (root)`.
3. Set **Custom domain** to `mayak-art.group` (the `CNAME` file already contains it).
4. At your domain registrar, set the DNS records:

   | Type  | Name  | Value                   |
   |-------|-------|-------------------------|
   | A     | @     | 185.199.108.153         |
   | A     | @     | 185.199.109.153         |
   | A     | @     | 185.199.110.153         |
   | A     | @     | 185.199.111.153         |
   | AAAA  | @     | 2606:50c0:8000::153     |
   | AAAA  | @     | 2606:50c0:8001::153     |
   | AAAA  | @     | 2606:50c0:8002::153     |
   | AAAA  | @     | 2606:50c0:8003::153     |
   | CNAME | www   | `<your-username>.github.io` |

5. When the DNS check passes (minutes to a few hours), tick **Enforce HTTPS**.
6. Recommended: verify the domain under your GitHub account's **Settings → Pages → Verified domains**
   so nobody else can claim it.

After that, every `git push` to `main` updates the live site within a minute or two.
