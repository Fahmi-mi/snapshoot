import { readdirSync, readFileSync, writeFileSync, existsSync, openSync, readSync, closeSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FRAMES_DIR = join(ROOT, 'assets', 'frames');
const CONFIG_PATH = join(FRAMES_DIR, 'frames.json');
const OUTPUT_PATH = join(ROOT, 'js', 'frames.generated.js');

const THEMES = ['retro', 'funky'];
const CANVAS = { width: 600, height: 1800 };
const SKIP = /^_|dummy|template/i;

const DEFAULT_CAPTION = {
  retro: { text: 'SNAPSHOOT · {date}', font: '600 44px "Caveat", cursive', color: '#2B2320', y: 1722 },
  funky: { text: 'SNAPSHOOT · {date}', font: '34px "Lilita One", sans-serif', color: '#1C1C1E', y: 1722, letterSpacing: 2 }
};

function readPngSize(path) {
  const buffer = Buffer.alloc(24);
  const fd = openSync(path, 'r');
  const read = readSync(fd, buffer, 0, 24, 0);
  closeSync(fd);
  if (read < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function toId(file) {
  return file.replace(/\.png$/i, '').replace(/^frame-/, '');
}

function toName(id) {
  return id.split('-').map(function (part) {
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join(' ');
}

function scanTheme(theme) {
  const dir = join(FRAMES_DIR, theme);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(function (file) { return /\.png$/i.test(file) && !SKIP.test(file); })
    .sort();
}

function loadConfig() {
  if (!existsSync(CONFIG_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  } catch (error) {
    console.error('frames.json tidak bisa dibaca: ' + error.message);
    process.exit(1);
  }
}

const config = loadConfig();
const report = { added: [], removed: [], kept: 0, warnings: [] };
const nextConfig = {};

THEMES.forEach(function (theme) {
  const files = scanTheme(theme);
  const existing = Array.isArray(config[theme]) ? config[theme] : [];
  const entries = [];

  existing.forEach(function (entry) {
    if (files.indexOf(entry.file) > -1) {
      entries.push(entry);
      report.kept += 1;
    } else {
      report.removed.push(theme + '/' + entry.file);
    }
  });

  files.forEach(function (file) {
    if (entries.some(function (entry) { return entry.file === file; })) return;
    const id = toId(file);
    entries.push({ id: id, name: toName(id), file: file, caption: Object.assign({}, DEFAULT_CAPTION[theme]) });
    report.added.push(theme + '/' + file);
  });

  entries.forEach(function (entry) {
    const size = readPngSize(join(FRAMES_DIR, theme, entry.file));
    if (!size) {
      report.warnings.push(theme + '/' + entry.file + ' bukan PNG yang valid');
    } else if (size.width !== CANVAS.width || size.height !== CANVAS.height) {
      report.warnings.push(theme + '/' + entry.file + ' berukuran ' + size.width + '×' + size.height +
        ', seharusnya ' + CANVAS.width + '×' + CANVAS.height + ' — posisi slot foto akan meleset');
    }
  });

  const ids = entries.map(function (entry) { return entry.id; });
  ids.forEach(function (id, index) {
    if (ids.indexOf(id) !== index) report.warnings.push('id ganda di tema ' + theme + ': ' + id);
  });

  nextConfig[theme] = entries;
});

const generated = {};
THEMES.forEach(function (theme) {
  generated[theme] = nextConfig[theme].map(function (entry) {
    return {
      id: entry.id,
      name: entry.name,
      src: 'assets/frames/' + theme + '/' + entry.file,
      caption: entry.caption
    };
  });
});

writeFileSync(CONFIG_PATH, JSON.stringify(nextConfig, null, 2) + '\n');
writeFileSync(OUTPUT_PATH,
  '// Dibuat otomatis oleh tools/sync-frames.mjs. Jangan diedit manual.\n' +
  'const framesByTheme = ' + JSON.stringify(generated, null, 2) + ';\n');

report.added.forEach(function (item) { console.log('+ ' + item); });
report.removed.forEach(function (item) { console.log('- ' + item); });
report.warnings.forEach(function (item) { console.log('! ' + item); });

THEMES.forEach(function (theme) {
  if (!nextConfig[theme].length) console.log('! tema ' + theme + ' tidak punya frame sama sekali');
});

console.log(
  'Selesai: ' + report.added.length + ' ditambah, ' + report.removed.length + ' dihapus, ' +
  report.kept + ' tetap. Daftar ditulis ke js/frames.generated.js'
);

if (report.added.length) {
  console.log('Frame baru memakai caption default — cek warna dan posisinya di assets/frames/frames.json');
}
