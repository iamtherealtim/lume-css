# Lume CSS

A minimal, open-source CSS library for thoughtful interfaces.

Lume ships a polished component set, design-token-based theming, dark mode, utility helpers, and practical docs/demo apps you can use as implementation references.

## What’s Included

- `dist/lume.css` + `dist/lume.min.css` — distributable CSS artifacts
- `dist/core.css`, `dist/components.css`, `dist/utilities.css`, `dist/a11y.css`, `dist/responsive.css` — optional modular CSS entrypoints
- `dist/lume.js` — optional lightweight behavior helper for `.is-open` patterns
- `lume.css` — core framework styles (tokens, base, components, utilities)
- `lume.js` — source runtime helper mirrored into `dist/lume.js`
- `src/` — modular source CSS files used to build bundle + partial outputs
- `docs/lume-showcase.html` — full visual showcase of all components
- `docs/lume-docs.html` — detailed documentation with copy-ready snippets
- `docs/admin-demo/` — realistic multi-page admin interface built with Lume

## Quick Start

### Option 1: CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lume-css/dist/lume.min.css" />
```

### Option 2: Local file

```html
<link rel="stylesheet" href="./lume.css" />
```

## Use The Whole Library

Use one CSS bundle (and optional JS helper) for fastest setup:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lume-css/dist/lume.min.css" />
<script defer src="https://cdn.jsdelivr.net/npm/lume-css/dist/lume.js"></script>
```

Or in npm-based projects:

```css
@import "lume-css/lume.css";
```

## Use Only Parts Of The Library

Import only the modules your product needs:

```css
@import "lume-css/core.css";
@import "lume-css/components.css";
@import "lume-css/utilities.css";
```

You can also include `a11y.css` and `responsive.css` explicitly when you want those layers separately.

## JavaScript Behavior

Lume ships an optional runtime helper at `dist/lume.js` for interactive patterns.

```html
<script defer src="https://cdn.jsdelivr.net/npm/lume-css/dist/lume.js"></script>
```

Supported helpers:

- `[data-lume-toggle]` + `data-lume-target="#id"` for modal/drawer/dropdown toggling
- `[data-lume-open]` / `[data-lume-close]` + `data-lume-target="#id"`
- `[data-lume-dismiss="toast"]` (or `.lume-toast-close`) for toast removal
- Escape key closes open modal/drawer/dropdown states

Utilities are now strictly namespaced (`lume-*`) to avoid class collisions in host applications.

## Build Workflow

- `npm run split:css` — regenerate modular source files in `src/` from the monolithic source
- `npm run build:css` — bundle `src/lume.css` into `lume.css` + `dist/*` outputs and publish modular files

## No-Flicker Startup (Recommended)

Use this pattern in your app shell for stable first paint (theme + icon hydration):

```html
<script>
  document.documentElement.setAttribute('data-ui-init', 'pending');
  try {
    const savedTheme = localStorage.getItem('lume-theme');
    if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
  } catch (_) {}
</script>
<link rel="stylesheet" href="./lume.css" />
<script defer src="https://unpkg.com/lucide@latest"></script>
```

And include this CSS guard in your app stylesheet:

```css
html[data-ui-init="pending"] body { visibility: hidden; }
```

Core + extended patterns include:

- Buttons, Forms, Cards, Badges, Alerts, Tables
- Modal, Tooltip, Tabs, Accordion, Dropdown
- Progress, Avatar, Toast, Breadcrumb, Pagination, Skeleton
- Callout, List Group, Stat, Empty State, Stepper, Drawer, Kbd

## Accessibility & UX

- Focus-visible outlines for interactive controls
- Reduced-motion handling for animations
- Dark mode via `html[data-theme="dark"]`
- First-paint stability pattern documented in `docs/lume-docs.html`

## Repo Structure

```text
.
├── dist/
│   ├── a11y.css
│   ├── components.css
│   ├── core.css
│   ├── lume.css
│   ├── lume.js
│   └── lume.min.css
│   ├── responsive.css
│   └── utilities.css
├── src/
│   ├── a11y.css
│   ├── components.css
│   ├── core.css
│   ├── lume.css
│   ├── responsive.css
│   └── utilities.css
├── scripts/
│   ├── build-css.mjs
│   └── split-css.mjs
├── docs/
│   ├── index.html
│   ├── lume-docs.html
│   ├── lume-showcase.html
│   ├── lume.css
│   ├── lume.js
│   ├── lume-logo.png
│   └── admin-demo/
│       ├── admin-demo.css
│       ├── admin-demo.js
│       └── *.html
├── lume.css
├── lume.js
├── CHANGELOG.md
├── CONTRIBUTING.md
└── README.md
```

## License

MIT — see `LICENSE`.

## Contributing

See `CONTRIBUTING.md` for contribution workflow and PR checklist.
