# diabetologie-am-lietzensee.de

Static, multilingual (de / en / ru) website of the diabetology practice
Dr. med. Regina Nadolny, Berlin-Charlottenburg.

- **Content editors:** see [`content/README.md`](content/README.md).
- Stack: SvelteKit 3 (Svelte 5, fully prerendered, `csr = false` → zero client JS),
  paraglide-js 2 (URL strategy: German at `/`, English `/en/…`, Russian `/ru/…`),
  @sveltejs/enhanced-img, adapter-static.

```sh
pnpm install
pnpm dev          # development server
pnpm check        # svelte-check
pnpm lint         # prettier + eslint
pnpm test:unit -- --run
pnpm test:e2e     # builds, previews and runs Playwright + axe accessibility checks
pnpm build        # static site in build/
```

## Deployment

Upload the contents of `build/` to any static web host. Every page is a folder with an
`index.html` (`/kontakt/` → `kontakt/index.html`). `404.html` is the not-found page (Apache:
`ErrorDocument 404 /404.html`). Old URLs such as `/kontakt.html` redirect to the new pages.

## Structure

```
content/                 editable content (Markdown + YAML)
messages/                UI strings per language (paraglide)
src/app.css              design tokens + base styles
src/lib/server/content.ts  build-time content loader (marked + yaml)
src/lib/images.ts        enhanced-img lookup by file name
src/lib/components/      Header, Footer, OpeningHours, NoticeBanner, …
src/routes/              pages, sitemap.xml, legacy redirects
e2e/                     Playwright tests
```
