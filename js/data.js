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
    'howto.badge': 'Panduan',
    'howto.title': 'Cara pakai Snapshoot',
    'howto.sub': 'Empat langkah dari layar ini sampai strip fotomu tersimpan.',
    'howto.note': 'Tidak bisa memakai kamera? Saat izin ditolak atau perangkatmu tidak punya kamera, Snapshoot menawarkan jalur unggah: pilih empat foto dari galeri, sisanya berjalan sama persis.',
    'frames.badge': 'Galeri',
    'frames.title': 'Semua frame',
    'frames.sub': 'Semua frame yang tersedia untuk tema Retro. Ganti tema di halaman depan untuk melihat set milik tema Funky.',
    'examples.badge': 'Contoh',
    'examples.title': 'Contoh strip',
    'examples.sub': 'Hasil asli dari Snapshoot, lengkap dengan frame dan filter yang dipakai.',
    'examples.emptyTitle': 'Belum ada contoh',
    'examples.emptyText': 'Contoh strip akan muncul di halaman ini begitu ditambahkan ke galeri.',
    'about.badge': 'Tentang',
    'about.title': 'Tentang Snapshoot',
    'about.sub': 'Photobooth yang seluruhnya berjalan di perangkatmu sendiri.',
    'hero.kicker': 'no ribet, no install :)',
    'hero.title': 'Foto bareng,<br><span>dari mana aja.</span>',
    'hero.sub': 'Empat jepretan, satu strip. Pilih frame, foto dulu, lalu atur filternya sebelum diunduh.',
    'hero.cta': 'Mulai Foto',
    'hero.ghost': 'Lihat contoh strip',
    'filter.step': 'Langkah 3 dari 3',
    'filter.title': 'Pilih filter kamu',
    'filter.sub': 'Setiap pilihan langsung tampil di fotomu sendiri.',
    'filter.next': 'Lihat hasil',
    'frame.step': 'Langkah 1 dari 3',
    'frame.title': 'Pilih frame strip',
    'frame.sub': 'Frame menempel di seluruh strip, termasuk area caption.',
    'frame.next': 'Ke kamera',
    'capture.panel': 'Strip kamu',
    'capture.hint': 'menyalakan kamera…',
    'capture.next': 'Lanjut',
    'denied.head': 'Kamera',
    'denied.title': 'Kamera belum diizinkan',
    'denied.text': 'Snapshoot butuh akses kamera untuk mengambil foto. Foto tetap diproses di perangkat kamu dan tidak diunggah ke mana pun.',
    'denied.unsupported': 'Browser ini belum mendukung akses kamera. Kamu tetap bisa bikin strip dengan mengunggah 4 foto dari galeri. Semuanya diproses di perangkat kamu dan tidak diunggah ke mana pun.',
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
    'howto.badge': 'Panduan',
    'howto.title': 'Cara pakai!',
    'howto.sub': 'Empat langkah, dari layar ini sampai strip fotomu jadi.',
    'howto.note': 'Kamera nggak bisa dipakai? Kalau izinnya ditolak atau perangkatmu memang nggak punya kamera, tinggal unggah empat foto dari galeri. Sisanya sama persis!',
    'frames.badge': 'Galeri',
    'frames.title': 'Semua frame!',
    'frames.sub': 'Semua frame yang tersedia buat tema Funky. Ganti tema di halaman depan buat lihat set punya tema Retro.',
    'examples.badge': 'Contoh',
    'examples.title': 'Contoh strip!',
    'examples.sub': 'Hasil asli dari Snapshoot, lengkap sama frame dan filter yang dipakai.',
    'examples.emptyTitle': 'Belum ada contoh',
    'examples.emptyText': 'Contoh stripnya bakal muncul di halaman ini begitu ditambahkan ke galeri.',
    'about.badge': 'Tentang',
    'about.title': 'Tentang Snapshoot',
    'about.sub': 'Photobooth yang jalan sepenuhnya di perangkatmu sendiri.',
    'hero.kicker': 'no ribet, no install :)',
    'hero.title': 'Foto bareng,<br><span>di mana aja!</span>',
    'hero.sub': 'Empat jepretan, satu strip. Pilih frame, foto dulu, terus atur filternya sebelum diunduh.',
    'hero.cta': 'Mulai Foto',
    'hero.ghost': 'Lihat contoh',
    'filter.step': 'Langkah 3 dari 3',
    'filter.title': 'Pilih filter!',
    'filter.sub': 'Tiap pilihan langsung nempel di foto kamu sendiri.',
    'filter.next': 'Lihat hasil!',
    'frame.step': 'Langkah 1 dari 3',
    'frame.title': 'Pilih frame!',
    'frame.sub': 'Frame nempel di seluruh strip, termasuk area caption.',
    'frame.next': 'Ke kamera',
    'capture.panel': 'Strip kamu',
    'capture.hint': 'menyalakan kamera…',
    'capture.next': 'Lanjut!',
    'denied.head': 'Kamera',
    'denied.title': 'Kamera belum<br>diizinkan',
    'denied.text': 'Snapshoot butuh akses kamera buat ambil foto. Semua foto diproses di perangkat kamu dan nggak diunggah ke mana pun.',
    'denied.unsupported': 'Browser ini belum mendukung akses kamera. Kamu tetap bisa bikin strip dengan mengunggah 4 foto dari galeri. Semuanya diproses di perangkat kamu dan nggak diunggah ke mana pun.',
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

const howtoByTheme = {
  retro: [
    { title: 'Pilih frame', text: 'Tentukan bingkai strip yang paling kamu suka. Semua frame punya empat slot foto dengan ukuran yang sama.' },
    { title: 'Ambil empat foto', text: 'Kamera menyala di perangkatmu. Atur timer 3 detik, 5 detik, atau matikan, lalu tekan tombol besar di tengah. Ada foto yang kurang pas? Tombol ulang membuang satu foto terakhir saja, bukan seluruh sesi.' },
    { title: 'Pilih filter', text: 'Setelah keempat foto terkumpul, barulah filter dipilih. Tiap pilihan langsung ditampilkan di atas fotomu sendiri, jadi kamu tahu persis hasilnya.' },
    { title: 'Unduh atau bagikan', text: 'Keempat foto disusun bersama frame pilihanmu jadi satu berkas PNG. Simpan ke perangkat, atau bagikan lewat aplikasi lain kalau browsermu mendukung.' }
  ],
  funky: [
    { title: 'Pilih frame', text: 'Tentukan bingkai strip yang paling kamu suka. Semua frame punya empat slot foto dengan ukuran yang sama.' },
    { title: 'Jepret empat kali', text: 'Kamera nyala di perangkatmu. Atur timer 3 detik, 5 detik, atau matikan, terus tekan tombol besar di tengah. Ada foto yang gagal? Tombol ulang cuma buang satu foto terakhir, bukan semuanya.' },
    { title: 'Pilih filter', text: 'Baru setelah empat foto terkumpul, filternya dipilih. Tiap pilihan langsung nempel di fotomu sendiri, jadi kamu tahu persis hasilnya.' },
    { title: 'Unduh atau bagikan', text: 'Empat fotonya disusun bareng frame pilihanmu jadi satu berkas PNG. Simpan ke perangkat, atau bagikan lewat aplikasi lain kalau browsermu mendukung.' }
  ]
};

const aboutByTheme = {
  retro: {
    text: [
      'Snapshoot adalah photobooth virtual yang berjalan sepenuhnya di dalam browser. Ambil empat foto lewat kamera perangkatmu, pilih frame dan filter, lalu unduh hasilnya sebagai satu strip foto yang siap dibagikan.',
      'Semua proses terjadi di perangkatmu sendiri. Foto tidak pernah diunggah ke server mana pun, tidak ada akun yang perlu dibuat, dan tidak ada riwayat yang disimpan. Begitu halaman ditutup, semuanya ikut hilang.',
      'Proyek ini dibuat sebagai latihan membangun aplikasi web tanpa framework apa pun. Isinya hanya HTML, CSS, dan JavaScript, ditambah dua tema visual yang bisa ditukar kapan saja lewat tombol di halaman depan.'
    ],
    cards: [
      { title: 'Tanpa server', text: 'Kamera, filter, dan penyusunan strip semuanya dikerjakan browser.' },
      { title: 'Tanpa akun', text: 'Tidak perlu daftar atau mengisi data. Buka, foto, unduh.' },
      { title: 'Dua tema', text: 'Retro yang tenang atau Funky yang ramai. Tinggal pilih.' }
    ]
  },
  funky: {
    text: [
      'Snapshoot adalah photobooth virtual yang jalan sepenuhnya di dalam browser. Ambil empat foto lewat kamera perangkatmu, pilih frame dan filter, terus unduh hasilnya jadi satu strip foto yang siap dipamerkan.',
      'Semua prosesnya terjadi di perangkatmu sendiri. Fotonya nggak pernah diunggah ke server mana pun, nggak ada akun yang perlu dibuat, dan nggak ada riwayat yang disimpan. Begitu halaman ditutup, semuanya ikut hilang.',
      'Proyek ini dibuat sebagai latihan bikin aplikasi web tanpa framework apa pun. Isinya cuma HTML, CSS, dan JavaScript, plus dua tema visual yang bisa ditukar kapan aja lewat tombol di halaman depan.'
    ],
    cards: [
      { title: 'Tanpa server', text: 'Kamera, filter, dan penyusunan strip semuanya dikerjakan browser.' },
      { title: 'Tanpa akun', text: 'Nggak perlu daftar atau isi data. Buka, foto, unduh.' },
      { title: 'Dua tema', text: 'Retro yang kalem atau Funky yang ramai. Tinggal pilih.' }
    ]
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
