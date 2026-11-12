# arkinsauce

Two links and a Poolsuite FM play/pause control, centered on a warm white page.
Fragment Mono, plain HTML and CSS, a small audio controller, and no package
dependencies.

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

For Vercel, `vercel.json` sets the build command to `npm run build` and the
output directory to `dist`. Node.js is pinned to major version 24.

## Structure

- `src/index.html` — page, metadata, and destinations.
- `src/styles.css` — type, color, spacing, and focus states.
- `src/radio.js` — the Poolsuite FM play/pause button.
- `scripts/` — local server and static build using Node.js built-ins.

Add pages and assets under `src/`; the build copies them into `dist/`.
Keep shared visual values in the CSS custom properties. A framework can be
introduced when the site needs reusable templates or interactive components.

## Radio

Poolsuite FM uses the live MP3 stream at
`https://s5.radio.co/sc9cb59935/listen`. Audio starts only after pressing play;
pause disconnects from the stream, and the next play reconnects live. The only
visible radio control is a button that switches between play and pause icons.
Playback requires JavaScript, an available stream, and an internet connection.

Fragment Mono is served by [Google Fonts](https://fonts.google.com/specimen/Fragment+Mono)
under the SIL Open Font License. The page falls back to the system monospace
font if the font service is unavailable.
