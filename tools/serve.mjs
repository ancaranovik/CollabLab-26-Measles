import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'));
const port = Number(process.argv[2] || 4173);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8'
};

function isWithinRoot(filePath) {
  const relativePath = path.relative(root, filePath);
  return relativePath === '' || (relativePath !== '..' && !relativePath.startsWith(`..${path.sep}`) && !path.isAbsolute(relativePath));
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end(message);
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('Provide a port between 1 and 65535.');
}

const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.setHeader('Allow', 'GET, HEAD');
    sendText(response, 405, 'Method not allowed');
    return;
  }

  try {
    const requestPath = decodeURIComponent((request.url || '/').split('?')[0]);
    const segments = requestPath.replaceAll('\\', '/').split('/');
    if (segments.some(segment => segment.startsWith('.') || segment.includes(':')) || requestPath.includes('\0')) {
      sendText(response, 403, 'Forbidden');
      return;
    }

    let filePath = path.resolve(root, ...segments.filter(Boolean));
    if (!isWithinRoot(filePath)) {
      sendText(response, 403, 'Forbidden');
      return;
    }
    if ((await stat(filePath)).isDirectory()) filePath = path.join(filePath, 'index.html');
    filePath = await realpath(filePath);
    if (!isWithinRoot(filePath) || path.relative(root, filePath).split(path.sep).some(segment => segment.startsWith('.'))) {
      sendText(response, 403, 'Forbidden');
      return;
    }
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      sendText(response, 404, 'Not found');
      return;
    }
    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': fileStat.size,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    });
    if (request.method === 'HEAD') response.end();
    else createReadStream(filePath).on('error', () => response.destroy()).pipe(response);
  } catch (error) {
    sendText(response, error instanceof URIError ? 400 : 404, error instanceof URIError ? 'Bad request' : 'Not found');
  }
});

server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use.` : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`Milestone 1: http://127.0.0.1:${port}\nPress Ctrl+C to stop.`));
