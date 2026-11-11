# arkinsauce

Two links, centered on a warm white page. Fragment Mono, plain HTML and CSS,
and no browser JavaScript or package dependencies.

## Development

Use Node.js 24 (`nvm use` if you use nvm). No install step is needed.

```sh
npm run dev
```

Open http://localhost:4321. Refresh the browser after edits.

## Build and preview

```sh
npm run build
npm run preview
```

Deploy the contents of `dist/` to any static host. The site works at a domain
root or under a subdirectory. It needs no server runtime or environment variables.

## Structure

- `src/index.html` — page, metadata, and destinations.
- `src/styles.css` — type, color, spacing, and focus states.
- `scripts/` — local server and static build using Node.js built-ins.

Add pages and assets under `src/`; the build copies them into `dist/`.
Keep shared visual values in the CSS custom properties. A framework can be
introduced when the site needs reusable templates or interactive components.

Fragment Mono is served by [Google Fonts](https://fonts.google.com/specimen/Fragment+Mono)
under the SIL Open Font License. The page falls back to the system monospace
font if the font service is unavailable.
