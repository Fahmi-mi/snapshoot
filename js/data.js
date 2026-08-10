const PHOTO_COUNT = 4;

const CANVAS_SIZE = { width: 600, height: 1800 };

const PHOTO_SLOTS = [
  { x: 40, y: 40, width: 520, height: 383 },
  { x: 40, y: 439, width: 520, height: 383 },
  { x: 40, y: 838, width: 520, height: 383 },
  { x: 40, y: 1237, width: 520, height: 383 }
];

const copyByTheme = {
  retro: {
    'nav.1': 'Cara pakai',
    'nav.2': 'Frame',
    'nav.3': 'Tentang',
    'nav.start': 'Mulai',
    'hero.kicker': 'no ribet, no install :)',
    'hero.title': 'Foto bareng,<br><span>dari mana aja.</span>',
    'hero.sub': 'Empat jepretan, satu strip. Pilih filter dan frame, lalu unduh langsung dari browser.',
    'hero.cta': 'Mulai Foto',
    'hero.ghost': 'Lihat contoh strip',
    'filter.step': 'Langkah 1 dari 3',
    'filter.title': 'Pilih filter kamu',
    'filter.sub': 'Bisa diganti kapan saja sebelum foto dimulai.',
    'filter.next': 'Lanjut',
    'frame.step': 'Langkah 2 dari 3',
    'frame.title': 'Pilih frame strip',
    'frame.sub': 'Frame menempel di seluruh strip, termasuk area caption.',
    'frame.next': 'Ke kamera',
    'capture.panel': 'Strip kamu',
    'capture.hint': 'menyalakan kamera…',
    'denied.head': 'Kamera',
    'denied.title': 'Kamera belum diizinkan',
    'denied.text': 'Snapshoot butuh akses kamera untuk mengambil foto. Foto tetap diproses di perangkat kamu dan tidak diunggah ke mana pun.',
    'denied.unsupported': 'Browser ini belum mendukung akses kamera. Kamu tetap bisa bikin strip dengan mengunggah 4 foto dari galeri — semuanya diproses di perangkat kamu dan tidak diunggah ke mana pun.',
    'denied.how': 'Cara mengaktifkan',
    'denied.retry': 'Coba minta izin lagi',
    'denied.upload': 'Unggah foto dari galeri',
    'upload.title': 'Unggah 4 foto',
    'upload.text': 'Pilih tepat 4 foto dari galeri. Semua diproses di perangkat kamu, tidak ada yang dikirim ke server.',
    'upload.pick': 'Pilih foto',
    'upload.back': 'Coba kamera lagi',
    'result.pill': 'Siap diunduh',
    'result.title': 'Strip kamu siap!',
    'result.detailLabel': 'Detail strip',
    'result.download': 'Unduh strip',
    'result.share': 'Bagikan',
    'result.again': 'Ulangi',
    'result.note': 'simpan, terus pamerin :)'
  },
  funky: {
    'nav.1': 'Cara pakai',
    'nav.2': 'Frame',
    'nav.3': 'Tentang',
    'nav.start': 'Mulai',
    'hero.kicker': 'no ribet, no install :)',
    'hero.title': 'Foto bareng,<br><span>di mana aja!</span>',
    'hero.sub': 'Empat jepretan, satu strip. Pilih filter, pilih frame, langsung unduh dari browser.',
    'hero.cta': 'Mulai Foto',
    'hero.ghost': 'Lihat contoh',
    'filter.step': 'Langkah 1 dari 3',
    'filter.title': 'Pilih filter!',
    'filter.sub': 'Warnanya bisa diganti kapan aja sebelum foto.',
    'filter.next': 'Lanjut',
    'frame.step': 'Langkah 2 dari 3',
    'frame.title': 'Pilih frame!',
    'frame.sub': 'Frame nempel di seluruh strip, termasuk area caption.',
    'frame.next': 'Ke kamera',
    'capture.panel': 'Strip kamu',
    'capture.hint': 'menyalakan kamera…',
    'denied.head': 'Kamera',
    'denied.title': 'Kamera belum<br>diizinkan',
    'denied.text': 'Snapshoot butuh akses kamera buat ambil foto. Semua foto diproses di perangkat kamu dan nggak diunggah ke mana pun.',
    'denied.unsupported': 'Browser ini belum mendukung akses kamera. Kamu tetap bisa bikin strip dengan mengunggah 4 foto dari galeri — semuanya diproses di perangkat kamu dan nggak diunggah ke mana pun.',
    'denied.how': 'Cara mengaktifkan',
    'denied.retry': 'Coba minta izin lagi',
    'denied.upload': 'Unggah foto dari galeri',
    'upload.title': 'Unggah 4 foto',
    'upload.text': 'Pilih tepat 4 foto dari galeri. Semua diproses di perangkat kamu, nggak ada yang dikirim ke server.',
    'upload.pick': 'Pilih foto',
    'upload.back': 'Coba kamera lagi',
    'result.pill': 'Siap tampil',
    'result.title': 'Strip kamu jadi!',
    'result.detailLabel': 'Detail strip',
    'result.download': 'Unduh strip',
    'result.share': 'Bagikan',
    'result.again': 'Ulangi',
    'result.note': 'simpan, terus pamerin :)'
  }
};

const filtersByTheme = {
  retro: [
    { id: 'original', name: 'Asli', cssFilter: 'none' },
    { id: 'vintage-warm', name: 'Vintage', cssFilter: 'sepia(0.35) contrast(1.05) saturate(0.85) brightness(1.02)' },
    { id: 'klasik-bw', name: 'Hitam Putih', cssFilter: 'grayscale(1) contrast(1.08) brightness(1.02)' },
    { id: 'soft-fade', name: 'Cerah', cssFilter: 'contrast(0.92) saturate(0.8) brightness(1.06)' },
    { id: 'sage', name: 'Sage', cssFilter: 'sepia(0.22) hue-rotate(-18deg) saturate(0.78) contrast(0.98) brightness(1.03)' },
    { id: 'sunset', name: 'Sunset', cssFilter: 'sepia(0.4) hue-rotate(-12deg) saturate(1.05) contrast(1.02) brightness(1.04)' }
  ],
  funky: [
    { id: 'original', name: 'Asli', cssFilter: 'none' },
    { id: 'pop-saturate', name: 'Pop', cssFilter: 'saturate(1.8) contrast(1.15) brightness(1.03)' },
    { id: 'sunset-blast', name: 'Sunset', cssFilter: 'saturate(1.5) hue-rotate(-14deg) contrast(1.12) brightness(1.05)' },
    { id: 'fresh', name: 'Fresh', cssFilter: 'saturate(1.5) hue-rotate(20deg) contrast(1.08) brightness(1.05)' },
    { id: 'neon-shift', name: 'Carnival', cssFilter: 'saturate(1.6) hue-rotate(12deg) contrast(1.12) brightness(1.03)' },
    { id: 'bold-mono', name: 'B&W', cssFilter: 'grayscale(1) contrast(1.3) brightness(1.02)' }
  ]
};
