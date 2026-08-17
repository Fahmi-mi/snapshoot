import { readdirSync, readFileSync, writeFileSync, existsSync, statSync, openSync, readSync, closeSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const EXAMPLES_DIR = join(ROOT, 'assets', 'examples');
const CONFIG_PATH = join(EXAMPLES_DIR, 'examples.json');
const OUTPUT_PATH = join(ROOT, 'js', 'examples.generated.js');

const THEMES = ['retro', 'funky'];
const MANIFEST_NOTE = [
  'Contoh strip tidak memakai font apa pun karena gambarnya sudah jadi. Pengaturan font caption ada di assets/frames/frames.json.',
  'id dan name diambil dari nama berkas. Ubah name di sini kalau mau judul kartu yang lain.',
  'frame dan filter adalah teks bebas yang tampil sebagai keterangan di bawah kartu, boleh dikosongkan.',
  'Kunci ini ditulis ulang otomatis oleh tools/sync-examples.mjs.'
];
const STRIP_RATIO = 600 / 1800;
const RATIO_TOLERANCE = 0.02;
const SIZE_WARN = 400 * 1024;
const SUPPORTED = /\.(png|jpe?g)$/i;
const SKIP = /^_|dummy|template/i;

function readHead(path, length) {
  const buffer = Buffer.alloc(length);
  const fd = openSync(path, 'r');
  const read = readSync(fd, buffer, 0, length, 0);
  closeSync(fd);
  return buffer.subarray(0, read);
}

function readPngSize(buffer) {
  if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function readJpegSize(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xFF || buffer[1] !== 0xD8) return null;
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xFF) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    const isSize = marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC;
    if (isSize) return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
    offset += 2 + length;
  }
  return null;
}

function readSize(path) {
  const buffer = readHead(path, 65536);
  return /\.png$/i.test(path) ? readPngSize(buffer) : readJpegSize(buffer);
}

function toId(file) {
  return file.replace(/\.[^.]+$/, '').replace(/^(strip|contoh|example)-/i, '').toLowerCase();
}

function toName(id) {
  return id.split('-').map(function (part) {
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join(' ');
}

function scanTheme(theme) {
  const dir = join(EXAMPLES_DIR, theme);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(function (file) { return SUPPORTED.test(file) && !SKIP.test(file); })
    .sort();
}

function unsupportedFiles(theme) {
  const dir = join(EXAMPLES_DIR, theme);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(function (file) {
    return !/^\./.test(file) && !SUPPORTED.test(file) && !SKIP.test(file);
  });
}

function loadConfig() {
  if (!existsSync(CONFIG_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  } catch (error) {
    console.error('examples.json tidak bisa dibaca: ' + error.message);
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
    entries.push({ id: id, name: toName(id), file: file, frame: '', filter: '' });
    report.added.push(theme + '/' + file);
  });

  unsupportedFiles(theme).forEach(function (file) {
    report.warnings.push(theme + '/' + file + ' dilewati, pakai format png atau jpg');
  });

  entries.forEach(function (entry) {
    const path = join(EXAMPLES_DIR, theme, entry.file);
    const size = readSize(path);
    const bytes = statSync(path).size;

    if (!size) {
      report.warnings.push(theme + '/' + entry.file + ' ukurannya tidak terbaca, cek berkasnya');
    } else {
      const ratio = size.width / size.height;
      if (Math.abs(ratio - STRIP_RATIO) > RATIO_TOLERANCE) {
        report.warnings.push(theme + '/' + entry.file + ' berukuran ' + size.width + '×' + size.height +
          ', rasionya bukan 1:3 seperti strip Snapshoot');
      }
    }

    if (bytes > SIZE_WARN) {
      report.warnings.push(theme + '/' + entry.file + ' berukuran ' + Math.round(bytes / 1024) +
        'KB, simpan ulang sebagai jpg supaya galerinya ringan');
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
      src: 'assets/examples/' + theme + '/' + entry.file,
      frame: entry.frame || '',
      filter: entry.filter || ''
    };
  });
});

writeFileSync(CONFIG_PATH, JSON.stringify(Object.assign({ _catatan: MANIFEST_NOTE }, nextConfig), null, 2) + '\n');
writeFileSync(OUTPUT_PATH,
  '// Dibuat otomatis oleh tools/sync-examples.mjs. Jangan diedit manual.\n' +
  'const examplesByTheme = ' + JSON.stringify(generated, null, 2) + ';\n');

report.added.forEach(function (item) { console.log('+ ' + item); });
report.removed.forEach(function (item) { console.log('- ' + item); });
report.warnings.forEach(function (item) { console.log('! ' + item); });

THEMES.forEach(function (theme) {
  if (!nextConfig[theme].length) console.log('! tema ' + theme + ' belum punya contoh strip');
});

console.log(
  'Selesai: ' + report.added.length + ' ditambah, ' + report.removed.length + ' dihapus, ' +
  report.kept + ' tetap. Daftar ditulis ke js/examples.generated.js'
);

if (report.added.length) {
  console.log('Contoh baru belum punya keterangan frame dan filter, isi di assets/examples/examples.json');
}
