import { createReadStream } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL(`../${process.argv[2] ?? 'src'}/`, import.meta.url));
const port = Number(process.env.PORT ?? 4321);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

try {
  await access(resolve(root, 'index.html'));
} catch {
  console.error('Site files not found. Run npm run build before previewing.');
  process.exit(1);
}

const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let path = resolve(root, `.${pathname}`);

    if (path !== resolve(root) && !path.startsWith(root.endsWith(sep) ? root : root + sep)) {
      response.writeHead(403).end('Forbidden');
      return;
    }

    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    const info = await stat(path);
    response.writeHead(200, {
      'Content-Type': types[extname(path)] ?? 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });

    if (request.method === 'HEAD') response.end();
    else await pipeline(createReadStream(path), response);
  } catch (error) {
    if (response.headersSent) response.destroy();
    else if (error instanceof URIError) response.writeHead(400).end('Bad request');
    else response.writeHead(404).end('Not found');
  }
});

server.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Local: http://localhost:${port}`);
});
