import { cp, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, '_site');
await mkdir(path.join(output, 'references', 'research'), { recursive: true });
for (const name of ['index.html', 'style.css', 'script.js', 'annotations.js', 'progress.js', 'translations.js', 'i18n.js']) {
  await copyFile(path.join(root, name), path.join(output, name));
}
await cp(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
await copyFile(path.join(root, 'references/research/measles-study.pdf'), path.join(output, 'references/research/measles-study.pdf'));
console.log('GitHub Pages website prepared in _site/');
