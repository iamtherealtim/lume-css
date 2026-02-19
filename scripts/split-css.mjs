import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const sourcePath = path.join(rootDir, 'lume.css');
const srcDir = path.join(rootDir, 'src');

const SECTION_REGEX = /\/\*\s*=+\s*\n([\s\S]*?)\n\s*=+\s*\*\//g;

function categoryFor(title) {
  if (
    title.includes('CUSTOM PROPERTIES') ||
    title.includes('DARK MODE') ||
    title.includes('BASE RESET') ||
    title.includes('TYPOGRAPHY') ||
    title.includes('GRID / LAYOUT')
  ) {
    return 'core';
  }

  if (title.includes('UTILITY CLASSES') || title.includes('EXTENDED UTILITIES')) {
    return 'utilities';
  }

  if (title.includes('FOCUS-VISIBLE STYLES') || title.includes('REDUCED MOTION')) {
    return 'a11y';
  }

  if (title.includes('RESPONSIVE BREAKPOINTS')) {
    return 'responsive';
  }

  return 'components';
}

function ensureTrailingNewline(text) {
  return text.endsWith('\n') ? text : `${text}\n`;
}

async function run() {
  const raw = await readFile(sourcePath, 'utf8');
  const matches = [...raw.matchAll(SECTION_REGEX)];

  if (matches.length === 0) {
    throw new Error('No section headers found in lume.css');
  }

  const bucket = {
    core: [],
    components: [],
    utilities: [],
    a11y: [],
    responsive: []
  };

  const preface = raw.slice(0, matches[0].index).trim();
  if (preface) {
    bucket.core.push(preface);
  }

  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index];
    const next = matches[index + 1];
    const sectionStart = current.index;
    const sectionEnd = next ? next.index : raw.length;
    const section = raw.slice(sectionStart, sectionEnd).trim();
    const title = current[1]
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean)
      ?.toUpperCase() || '';
    const category = categoryFor(title);
    bucket[category].push(section);
  }

  await mkdir(srcDir, { recursive: true });

  const files = [
    ['core.css', bucket.core],
    ['components.css', bucket.components],
    ['utilities.css', bucket.utilities],
    ['a11y.css', bucket.a11y],
    ['responsive.css', bucket.responsive]
  ];

  for (const [fileName, sections] of files) {
    const out = ensureTrailingNewline(`${sections.join('\n\n')}`);
    await writeFile(path.join(srcDir, fileName), out, 'utf8');
  }

  const entry = [
    '@import "./core.css";',
    '@import "./components.css";',
    '@import "./utilities.css";',
    '@import "./a11y.css";',
    '@import "./responsive.css";',
    ''
  ].join('\n');

  await writeFile(path.join(srcDir, 'lume.css'), entry, 'utf8');

  console.log('Split complete: src/core.css, src/components.css, src/utilities.css, src/a11y.css, src/responsive.css');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
