# Iubenda Fallback for Webflow

Custom fallback overlay for iframes blocked by Iubenda's per-script consent gating
(YouTube, Vimeo, Google Maps, etc.). Replaces blank/blocked embeds with a styled
consent prompt that auto-removes itself once the visitor accepts — no page reload.

## Files

| File | Purpose |
| --- | --- |
| `iubenda-fallback.css` | Styles for the overlay (light gray, rounded, centered) |
| `iubenda-fallback.js` | Detects blocked iframes, renders the overlay, removes it on consent |
| `webflow-import.html` | Copy-paste snippets for Webflow Custom Code |

## Deploy on Vercel

1. Push this repo to GitHub.
2. In Vercel: **Add New → Project → Import** the repo.
3. Framework Preset: **Other**. No build command, no output directory.
4. Deploy. Vercel serves the files at the project root, e.g.:
   - `https://<your-project>.vercel.app/iubenda-fallback.css`
   - `https://<your-project>.vercel.app/iubenda-fallback.js`

Pushes to `main` redeploy automatically.

## Add to Webflow

Open **Project Settings → Custom Code** and replace `<your-project>` with your
Vercel domain.

### Head Code

```html
<link rel="stylesheet" href="https://<your-project>.vercel.app/iubenda-fallback.css">
```

### Footer Code

```html
<script defer src="https://<your-project>.vercel.app/iubenda-fallback.js"></script>
```

Publish the site. The script auto-detects every iframe Iubenda has blocked
(`iframe[data-suppressedsrc]`) and renders the overlay on top of it.

## How it works

- **Detection:** queries `iframe[data-suppressedsrc]` — the marker Iubenda sets on
  iframes whose `src` it has stripped.
- **Overlay:** absolute-positioned over the iframe (parent forced to
  `position: relative` if static), `z-index: 999` so clicks and text selection
  hit the overlay, not the iframe.
- **Accept button:** calls `_iub.cs.api.consentGiven()` directly. One click
  grants consent — Iubenda restores the iframe `src`.
- **Auto-remove:** a per-iframe `MutationObserver` watches the `src` attribute.
  When Iubenda restores it, the overlay removes itself. No page reload.
- **Late-loaded embeds:** a body `MutationObserver` (debounced 100ms) catches
  iframes added after initial page load.

## Customization

- **Copy:** edit the German strings in `buildWrapper()` inside
  `iubenda-fallback.js` (title, description, button label).
- **Color / radius / typography:** edit `iubenda-fallback.css`. The overlay
  inherits `font-family` from the page.
- **Icon:** swap the `PADLOCK_SVG` constant at the top of the JS file for any
  inline SVG.

## Cache busting

Browsers and Vercel's edge cache static assets aggressively. After a deploy,
append a query param to bust the cache during testing:

```html
<link rel="stylesheet" href="https://<your-project>.vercel.app/iubenda-fallback.css?v=9">
<script defer src="https://<your-project>.vercel.app/iubenda-fallback.js?v=9"></script>
```

Bump the `v` value on every release.
