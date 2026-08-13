# Snapshoot — Project Specification

## 1. Ringkasan proyek

**Snapshoot** adalah website photobooth virtual yang memungkinkan pengguna mengambil foto langsung dari browser (webcam), menerapkan filter warna, memilih frame dekoratif, dan mengunduh hasilnya dalam bentuk strip foto — mirip mesin photobooth fisik, tapi sepenuhnya online dan gratis.

**Target pengguna:** anak muda yang ingin foto bareng teman secara online (dari HP atau laptop) untuk dibagikan ke media sosial.

## 2. Batasan teknis (constraints)

- **100% client-side.** Tidak ada backend, tidak ada database, tidak ada sistem akun/login.
- **Stack:** HTML, CSS, JavaScript murni. Tidak pakai framework (React, Vue, dll) kecuali disepakati lain.
- **Hosting:** GitHub Pages (static hosting, otomatis HTTPS).
- **Tidak ada penyimpanan riwayat foto** di server — semua proses (capture, filter, compositing, download) terjadi di memori browser pengguna saat itu juga.
- Fitur yang butuh backend (galeri publik, leaderboard, akun user) **di luar scope MVP** — dicatat di bagian "Future considerations" kalau nanti mau dikembangkan.

## 3. Alur pengguna (user flow)

Alur linear, 5 halaman/step:

```
Landing page → Pilih frame → Capture foto → Pilih filter → Hasil (download/share)
```

Filter sengaja ditaruh **setelah** capture: dengan begitu tiap pilihan filter bisa ditampilkan langsung di atas foto milik user sendiri, bukan di atas gambar contoh — jadi keputusannya jauh lebih jelas.

### 3.1 Landing page
- Hero section: headline, sedikit copy penjelasan, preview visual strip foto (statis/ilustrasi)
- Tombol utama: **"Mulai Foto"** → lanjut ke halaman pilih frame
- Tidak perlu login atau isi data apapun

### 3.2 Pilih frame
- Grid pilihan varian frame (minimal 3 varian, direkomendasikan lebih untuk variasi)
- Tiap opsi ditampilkan sebagai **preview strip foto utuh** (bukan cuma potongan border), supaya user tahu persis hasil akhirnya akan terlihat seperti apa
- Setelah pilih, lanjut ke halaman capture

### 3.3 Capture foto
- Akses kamera lewat `getUserMedia` (butuh HTTPS — sudah terpenuhi otomatis oleh GitHub Pages)
- Live preview kamera ditampilkan apa adanya (tanpa filter), karena filter baru dipilih di langkah berikutnya
- Countdown timer sebelum tiap jepretan (misal 3-2-1)
- Indikator progres: berapa foto sudah diambil dari total yang dibutuhkan (**fixed 4 foto per strip untuk semua frame** — bukan variable per frame, demi konsistensi copy dan kesederhanaan implementasi)
- Tombol shutter besar, mudah di-tap dari HP
- Setelah semua foto terkumpul, otomatis lanjut ke halaman pilih filter

#### 3.3.1 State: izin kamera ditolak/belum diberikan

Ini adalah **state alternatif dari halaman capture**, muncul ketika `getUserMedia` promise reject (user menolak izin, atau belum pernah diberi izin sama sekali). Bukan halaman error generik — harus dirancang sebagai bagian dari flow, karena ini kemungkinan besar akan sering muncul (banyak user ragu kasih izin kamera ke website baru).

**Elemen yang perlu ada:**
- Icon yang menandakan kamera tidak aktif/diblokir
- Judul singkat, jelas: kamera belum diizinkan
- Body text yang menjelaskan **kenapa** butuh akses kamera, dan yang lebih penting — **penegasan privasi**: foto diproses di perangkat pengguna sendiri dan tidak diunggah ke mana pun (poin ini krusial karena Snapshoot memang 100% client-side — jujur dan konsisten dengan arsitektur teknisnya, bukan cuma copy generik)
- Kotak instruksi cara mengaktifkan izin kamera secara manual (klik ikon gembok di address bar → izin situs → kamera → izinkan → muat ulang halaman). Instruksi ini bisa sedikit berbeda tergantung browser, jadi buat copy yang cukup general atau deteksi browser untuk instruksi lebih spesifik jika worth the effort
- Tombol utama: **"Coba minta izin lagi"** — trigger ulang request `getUserMedia`
- Tombol sekunder (alternatif, bukan cuma retry): **"Unggah foto dari galeri"** — lihat 3.3.2

#### 3.3.2 Fitur tambahan: upload foto dari galeri (fallback tanpa kamera)

Ini fitur baru yang perlu ditambahkan ke scope — bukan cuma penanganan error, tapi **jalur alternatif penuh** untuk user yang tidak bisa/tidak mau kasih izin kamera (termasuk device tanpa kamera, atau browser yang tidak mendukung `getUserMedia`).

- **Jumlah foto yang diupload: fixed 4, mengikuti jumlah slot frame yang sudah ditetapkan (lihat 3.3 & 5.3.1) — bukan lagi opsi terbuka.** User perlu upload tepat 4 foto (satu per satu atau sekaligus lewat `<input type="file" accept="image/*" multiple>` dengan validasi jumlah) sebelum bisa lanjut ke proses compositing. Ini konsisten dengan keputusan bahwa semua frame di kedua tema punya tepat 4 slot foto — jalur upload tidak boleh punya aturan jumlah yang berbeda dari jalur capture kamera
- Perlakukan tiap foto yang diupload sebagai pengganti satu "jepretan" — jadi alur progresnya (1 dari 4, 2 dari 4, dst) tetap konsisten dengan flow capture normal, cuma sumber gambarnya beda (file yang diupload, bukan frame dari video stream)
- Sediakan validasi yang jelas kalau user upload kurang atau lebih dari 4 foto (misal disable tombol lanjut sampai tepat 4 foto terkumpul, dengan indikator progres yang sama seperti di halaman capture kamera)
- Setelah foto terkumpul (baik dari kamera maupun upload, atau kombinasi keduanya), lanjut ke proses compositing yang sama seperti biasa (lihat 5.3) — filter dan frame tetap diterapkan dengan cara yang sama
- Foto yang diupload tetap diproses sepenuhnya di browser (canvas), tidak dikirim ke server manapun — konsisten dengan prinsip privasi yang disebutkan di 3.3.1

### 3.4 Pilih filter
- Grid pilihan filter warna (contoh: Vintage, Hitam-Putih, Warna Cerah — jumlah dan nama final ditentukan saat desain)
- Tiap kartu menampilkan **foto pertama hasil jepretan user** dengan filter tersebut sudah diterapkan, bukan gambar contoh — inilah alasan langkah ini ditaruh setelah capture
- Filter diterapkan lewat CSS `filter` untuk preview, tapi untuk hasil akhir (export) filter diterapkan lewat manipulasi pixel canvas (lihat bagian 5.2)
- Setelah pilih, lanjut ke halaman hasil. User bisa balik ganti filter tanpa kehilangan progres (state disimpan di JS, bukan re-load halaman)

### 3.5 Halaman hasil
- Preview strip foto final: 4 foto tersusun + frame yang dipilih + filter yang diterapkan, semua sudah di-composite jadi satu gambar (lihat bagian 5.3)
- Tombol **Download** — unduh strip foto sebagai file gambar (PNG)
- Tombol **Share** — pakai Web Share API kalau didukung browser/device (umumnya lebih konsisten di mobile daripada desktop; sediakan fallback "download lalu share manual" untuk browser yang tidak mendukung)
- Opsi untuk mulai ulang ("Ambil foto lagi") kembali ke landing page atau langsung ke capture

## 4. Sistem tema (dual theme)

Website punya **2 tema visual** yang bisa dipilih pengguna — bukan cuma satu desain tetap.

- **Tema 1 — Retro minimalis:** clean, banyak white space, warna warm/vintage, elemen dekoratif secukupnya
- **Tema 2 — Funky maximalist:** padat, penuh elemen dekoratif (huruf besar background, doodle, checker pattern, dot texture, bintang), tapi teks dan CTA tetap harus mudah dibaca dan di-tap

### 4.1 Implementasi teknis

Gunakan CSS custom property + atribut `data-theme` di elemen `<html>`:

```html
<html data-theme="retro">
```

```css
:root, [data-theme="retro"] {
  --bg: #F7EFE1;
  --primary: #D96B45;
  --font-display: 'Fredoka', sans-serif;
  --radius-btn: 14px;
  /* dst — lihat token lengkap di file design system */
}

[data-theme="funky"] {
  --bg: #FFFFFF;
  --primary: #FF1F8F;
  --font-display: 'Lilita One', sans-serif;
  --radius-btn: 30px;
  /* dst */
}
```

Semua komponen (button, card, strip foto, dll) memakai markup HTML yang **sama**, cukup reference CSS variable ini — jangan duplikasi halaman per tema.

### 4.2 Elemen dekoratif khusus tema Funky

Tema Funky punya elemen tambahan yang tidak ada di tema Retro (huruf raksasa background, bintang-bintang, checker/dot pattern). Elemen ini tetap ada di HTML tapi disembunyikan/ditampilkan lewat CSS tergantung tema aktif:

```css
.funky-decor { display: none; }
[data-theme="funky"] .funky-decor { display: block; }
```

### 4.3 Simpan pilihan tema

```js
// simpan waktu user pilih tema
localStorage.setItem('snapshoot-theme', 'funky');

// baca pas halaman dibuka — taruh di <head>, sebelum CSS lain di-load,
// supaya tidak ada flash tema salah sepersekian detik (FOUC)
// default kunjungan pertama (belum ada localStorage): tema Funky
const saved = localStorage.getItem('snapshoot-theme') || 'funky';
document.documentElement.setAttribute('data-theme', saved);
```

Sediakan toggle/switch UI **hanya di landing page** — bukan di semua halaman. Keputusan ini disengaja: karena tiap tema punya set aset frame PNG yang berbeda (lihat 5.3), mengizinkan ganti tema di tengah alur (misal saat sudah di halaman pilih frame atau capture) akan bikin pilihan frame yang sudah dibuat jadi tidak valid lagi. Dengan toggle hanya di landing page, user menentukan tema dulu sebelum masuk ke alur, dan tidak ada state di tengah jalan yang perlu di-reset atau ditangani sebagai edge case.

Kalau user ingin ganti tema setelah masuk ke alur, mereka perlu kembali ke landing page dulu (misal lewat tombol back atau logo).

### 4.4 Font loading

Total ada 4 font family (2 per tema — 1 display + 1 body per tema, ditambah font kondensasi/aksen tertentu di beberapa varian desain). Untuk MVP, load semua font sekaligus di awal (jumlahnya kecil, tidak akan terasa lambat). Optimasi lazy-load font non-aktif bisa jadi improvement lanjutan.

### 4.5 Referensi desain

File design system detail (warna, tipografi, komponen) untuk masing-masing tema **sudah dibuat terpisah** dan tidak perlu direplikasi di sini — akan digunakan langsung sebagai referensi visual saat proses UI mockup (dikerjakan manual oleh pemilik proyek, bukan bagian dari scope Claude Code ini).

## 5. Mekanisme teknis inti

### 5.1 Capture foto dari webcam

- `navigator.mediaDevices.getUserMedia({ video: true })` untuk akses kamera
- Video stream ditampilkan di elemen `<video>` sebagai live preview
- Saat shutter ditekan (atau countdown selesai), frame video saat itu digambar ke `<canvas>` lewat `canvasContext.drawImage(videoElement, 0, 0, width, height)`
- Ulangi untuk tiap foto dalam satu sesi (default 4 foto)

### 5.2 Menerapkan filter

- Preview real-time: CSS `filter` property diterapkan langsung ke elemen `<video>` (murah secara performa, cukup untuk preview)
- Hasil akhir/export: filter yang sama harus diterapkan lewat manipulasi pixel di canvas (misal lewat `ctx.filter` sebelum `drawImage`, atau manipulasi `ImageData` manual) — supaya filter benar-benar ikut ter-bake ke dalam gambar yang diexport, bukan cuma efek visual sementara

### 5.3 Compositing frame (proses inti photobooth)

Frame **bukan** border CSS tipis di sekeliling foto — frame adalah elemen dekoratif penuh (border, garis pemisah antar slot foto, area caption) yang diimplementasikan sebagai **file PNG transparan terpisah**, di-overlay di atas foto lewat canvas compositing.

**Urutan layer (bawah ke atas), semua digambar ke satu canvas yang sama:**

1. **Foto hasil capture** (sudah difilter) — digambar ke posisi slot masing-masing di canvas
2. **Frame overlay** — file PNG transparan digambar di atas semua foto. Bagian yang transparan di PNG inilah yang membuat foto "mengintip" dari balik frame
3. **Export final** — `canvas.toDataURL('image/png')` menghasilkan satu gambar composite siap didownload

**Aset yang dibutuhkan per frame:**
- File PNG transparan, ukuran harus konsisten antar semua varian frame (misal 400×1200px untuk strip 4 foto)
- **Jumlah foto per strip fixed di 4 untuk semua frame** — setiap frame PNG yang dibuat (di kedua tema) harus punya tepat 4 slot foto, tidak boleh berbeda-beda. Ini keputusan final, bukan variable per frame.
- Posisi/koordinat tiap slot foto di dalam frame harus didefinisikan di kode (supaya tahu di mana harus `drawImage()` tiap foto)

#### 5.3.1 Spesifikasi ukuran canvas & slot foto

**Ukuran canvas: 600 × 1800px** (rasio 1:3, mengikuti standar strip photobooth fisik 2×6 inci di 300 DPI). Ukuran ini dipilih karena setara resolusi cetak, jadi kalau nanti ada fitur cetak fisik, tidak perlu ubah resolusi.

**Wajib sama persis di kedua tema** (Retro & Funky) — supaya koordinat slot di kode JS cukup satu set, tidak perlu logic berbeda tergantung tema aktif. Yang boleh beda antar tema hanya gaya visual frame-nya, bukan ukuran canvas atau posisi slot.

Breakdown proporsi yang direkomendasikan (starting point, boleh disesuaikan asal total tetap pas 600×1800px dan konsisten di semua frame):

| Elemen | Ukuran |
|---|---|
| Margin atas | 40px |
| Margin kiri/kanan | 40px (masing-masing sisi) |
| Slot foto (per foto) | 520 × 383px |
| Jarak antar slot | 16px |
| Area caption (bawah) | ~180px |

**Rasio slot foto (520×383px ≈ 4:3) dipilih sengaja** — ini mendekati rasio umum hasil capture webcam. Kalau rasio slot dibuat jauh berbeda (misal persegi), foto hasil jepretan akan ter-crop signifikan supaya pas ke slot. Saat mendesain frame baru, usahakan proporsi slot foto tetap mendekati 4:3.

**Area caption** dialokasikan untuk teks seperti tanggal atau signature text (contoh dari copywriting: "SNAPSHOOT · 09.08.26") — pastikan ruang ini konsisten ada di semua varian frame, di kedua tema.

**Prinsip utama:** angka-angka di atas adalah starting point yang masuk akal, tapi begitu ditetapkan, harus dipakai konsisten di semua frame (kedua tema) — bukan berubah-ubah tiap frame baru dibuat.

**Menambah frame baru di kemudian hari:**
1. Upload PNG baru ke folder aset (misal `/assets/frames/nama-frame.png`)
2. Tambahkan satu entry baru ke array/daftar frame di JS:

```js
const frames = [
  { id: "vintage", name: "Vintage", src: "assets/frames/frame-vintage.png" },
  { id: "mono", name: "Mono", src: "assets/frames/frame-mono.png" },
  // tambah di sini
];
```

Selama UI grid pemilihan frame di-render otomatis dari array ini (looping, bukan hardcode satu-satu), frame baru langsung muncul sebagai pilihan tanpa perlu ubah bagian lain.

**Proses tambah frame baru: manual, dijalankan lokal sebelum push.** Tidak perlu build script otomatis atau GitHub Actions untuk MVP ini — cukup edit array frame di JS secara manual tiap kali ada frame baru, lalu commit & push seperti biasa. Ini keputusan sadar demi kesederhanaan (satset, minim kemungkinan gagal), bukan keterbatasan teknis. Kalau nanti jumlah frame sudah banyak (puluhan) dan proses manual ini mulai terasa memberatkan, opsi upgrade ke build script lokal (dijalankan manual sebelum push) atau GitHub Actions (otomatis tiap push, tetap gratis untuk public repo) bisa dipertimbangkan — dicatat sebagai improvement opsional, bukan kebutuhan sekarang.

**Karena ada 2 tema visual**, dibutuhkan **2 set aset frame PNG terpisah** — satu set per tema (gaya visualnya beda: misal versi Retro pakai gaya roll film/sprocket hole, versi Funky pakai gaya lain sesuai tema). Array frame yang aktif mengikuti tema yang sedang dipilih user.

### 5.4 Download hasil

- `<a download="snapshoot-strip.png" href="[hasil canvas.toDataURL()]">` — trigger download murni di browser, tanpa request ke server manapun

### 5.5 Share

- Gunakan Web Share API: `navigator.share({ files: [...] })` untuk share gambar langsung (didukung baik di mobile, dukungan bervariasi di desktop)
- Sediakan fallback untuk browser yang tidak mendukung (misal tombol jadi "Download lalu share manual" atau tampilkan pesan yang sesuai)

## 6. Struktur data

### 6.1 Filter

Filter **berbeda per tema**, menyesuaikan identitas visual masing-masing — bukan satu set filter yang dipakai bersama. Nilai di bawah ini adalah hasil final penentuan awal (starting point yang sudah disepakati), boleh di-tweak sedikit saat testing langsung dengan kamera asli:

```js
const filtersByTheme = {
  retro: [
    { id: "original", name: "Tanpa Filter", cssFilter: "none" },
    { id: "vintage-warm", name: "Vintage Warm", cssFilter: "sepia(0.35) contrast(1.05) saturate(0.85) brightness(1.02)" },
    { id: "klasik-bw", name: "Klasik B&W", cssFilter: "grayscale(1) contrast(1.08) brightness(1.02)" },
    { id: "soft-fade", name: "Soft Fade", cssFilter: "contrast(0.92) saturate(0.8) brightness(1.06)" },
  ],
  funky: [
    { id: "original", name: "Tanpa Filter", cssFilter: "none" },
    { id: "pop-saturate", name: "Pop Saturate", cssFilter: "saturate(1.8) contrast(1.15) brightness(1.03)" },
    { id: "bold-mono", name: "Bold Mono", cssFilter: "grayscale(1) contrast(1.3) brightness(1.02)" },
    { id: "neon-shift", name: "Neon Shift", cssFilter: "saturate(1.6) hue-rotate(12deg) contrast(1.12) brightness(1.03)" },
  ],
};
```

**Setiap tema wajib punya opsi "Tanpa Filter"** (`cssFilter: "none"`) — ini penting karena identitas visual tema (retro vs funky) ditentukan oleh desain UI, warna, dan frame, bukan oleh filter warna foto. User yang suka tampilan tema tertentu tapi tidak ingin fotonya diedit warnanya harus tetap bisa dapat pengalaman tema itu secara utuh tanpa terpaksa pakai salah satu filter berwarna. Taruh opsi ini sebagai pilihan pertama di grid pemilihan filter (default/baseline), bukan diselipkan di tengah atau akhir.

**Prinsip pembeda antar tema:** tema retro cenderung menurunkan contrast/saturate (kesan lembut, pudar, film lama), sementara tema funky menaikkan jauh di atas nilai normal (kesan tegas, berani, "meledak") — konsisten dengan kepribadian visual masing-masing tema yang sudah ditetapkan di section 4.

Ingat: nilai CSS filter ini dipakai untuk preview real-time (diterapkan ke elemen `<video>`), tapi untuk hasil export harus di-bake ke pixel canvas juga (lihat 5.2) — bukan cuma efek visual sementara yang hilang saat di-screenshot/export.

### 6.2 Frame
Lihat struktur di bagian 5.3. Idealnya array frame dipisah per tema, misal:
```js
const framesByTheme = {
  retro: [ /* array frame tema retro */ ],
  funky: [ /* array frame tema funky */ ],
};
```

### 6.3 State sesi capture
Data yang perlu disimpan selama satu sesi (di JS variable/state, tidak perlu persist ke storage kecuali untuk tema):
- Filter yang dipilih
- Frame yang dipilih
- Array hasil capture (foto ke-1 s.d. ke-N, dalam bentuk data image/canvas)
- Progres capture saat ini (misal 2 dari 4)

## 7. Struktur folder yang disarankan

```
/
├── index.html              (landing page)
├── filter.html              (atau single-page app dengan routing JS sederhana — didiskusikan saat development)
├── frame.html
├── capture.html
├── result.html
├── /assets
│   ├── /frames
│   │   ├── /retro          (set frame tema retro)
│   │   └── /funky           (set frame tema funky)
│   └── /images              (aset gambar lain, ilustrasi landing, dll)
├── /css
│   ├── theme-retro.css   (atau digabung jadi satu file dengan CSS variable, tergantung preferensi)
│   ├── theme-funky.css
│   └── main.css             (style umum, tidak tergantung tema)
└── /js
    ├── theme.js              (logic switch tema + localStorage)
    ├── camera.js             (logic getUserMedia + capture)
    ├── compositing.js        (logic canvas layering: filter + frame + export)
    └── main.js                (logic umum, state management alur)
```
*(Struktur ini adalah saran awal — bisa disesuaikan pendekatan single-page app vs multi-page HTML saat proses development di Claude Code.)*

## 8. Non-functional notes

- **HTTPS wajib** untuk akses kamera (`getUserMedia`) — otomatis terpenuhi di GitHub Pages, tidak perlu setup tambahan
- Prioritaskan **mobile-first**, karena target pengguna kemungkinan besar mengakses dari HP untuk foto bareng
- Tidak ada data pengguna yang dikirim/disimpan ke server manapun — seluruh proses murni di browser
- Perlu penanganan graceful kalau user menolak izin akses kamera (`getUserMedia` promise rejection) — lihat detail lengkap state ini di bagian 3.3.1, termasuk fallback upload dari galeri di 3.3.2. Ini bukan sekadar pesan error, tapi state UI penuh yang sudah dirancang.

## 9. Future considerations (di luar scope MVP)

Dicatat sebagai referensi kalau nanti proyek berkembang — **tidak perlu dikerjakan di tahap awal**:
- Galeri publik / feed foto dari pengguna lain (butuh backend + storage)
- Sistem akun untuk menyimpan riwayat strip foto
- Custom frame upload dari pengguna sendiri
- Filter tambahan berbasis pemrosesan gambar lebih kompleks (bukan cuma CSS filter sederhana)
- Leaderboard atau fitur sosial lainnya

## 10. Catatan tambahan untuk Claude Code

- Design system visual (warna, tipografi persis, komponen UI) untuk kedua tema **sudah difinalisasi secara terpisah oleh pemilik proyek** menggunakan Claude Design — dokumen ini fokus ke logika, struktur, dan mekanisme teknis, bukan detail visual pixel-perfect
- Saat development, ikuti struktur alur 5 halaman di atas, dan pastikan sistem tema (section 4) serta mekanisme compositing canvas (section 5.3) diimplementasikan sesuai deskripsi — ini dua bagian paling kritis dari proyek ini
