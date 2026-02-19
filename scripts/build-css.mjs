import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');
const distDir = path.join(rootDir, 'dist');
const docsDir = path.join(rootDir, 'docs');

async function bundleFromEntry(entryPath) {
  const entry = await readFile(entryPath, 'utf8');
  const lines = entry.split(/\r?\n/);
  const chunks = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const importMatch = trimmed.match(/^@import\s+['\"](.+?)['\"];?$/);
    if (!importMatch) continue;

    const importPath = path.resolve(path.dirname(entryPath), importMatch[1]);
    const css = await readFile(importPath, 'utf8');
    chunks.push(css.trimEnd());
  }

  return `${chunks.join('\n\n')}\n`;
}

async function run() {
  const entryPath = path.join(srcDir, 'lume.css');
  const fullCss = await bundleFromEntry(entryPath);

  await mkdir(distDir, { recursive: true });
  await mkdir(docsDir, { recursive: true });

  await writeFile(path.join(rootDir, 'lume.css'), fullCss, 'utf8');
  await writeFile(path.join(distDir, 'lume.css'), fullCss, 'utf8');
  await writeFile(path.join(distDir, 'lume.min.css'), fullCss, 'utf8');
  await writeFile(path.join(docsDir, 'lume.css'), fullCss, 'utf8');

  await copyFile(path.join(rootDir, 'lume.js'), path.join(distDir, 'lume.js'));
  await copyFile(path.join(rootDir, 'lume.js'), path.join(docsDir, 'lume.js'));
  await copyFile(path.join(rootDir, 'lume-logo.png'), path.join(docsDir, 'lume-logo.png'));

  const partialFiles = ['core.css', 'components.css', 'utilities.css', 'a11y.css', 'responsive.css'];
  for (const file of partialFiles) {
    await copyFile(path.join(srcDir, file), path.join(distDir, file));
  }

  console.log('Build complete: lume.css, dist/* assets, docs runtime assets, and partial CSS files.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
