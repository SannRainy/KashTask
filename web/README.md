# KashTask Web

Aplikasi web modern personal produktivitas *offline-first* berbasis **React 18**, **TypeScript** (strict mode), **Vite**, **Zustand**, dan **IndexedDB**.

---

## Tautan Deployment

Aplikasi ini dideploy secara otomatis via CI/CD GitHub Actions:
- **GitHub Pages**: [https://sannrainy.github.io/KashTask/](https://sannrainy.github.io/KashTask/)
- **Vercel**: [https://kashtask.vercel.app](https://kashtask.vercel.app)

---

## Fitur Utama

- **To-Do List (Tasks)**: Pengelolaan tugas dengan status `todo`/`done`, tenggat waktu (*due date*), catatan, dan filter/sorting.
- **Eisenhower Matrix**: Matriks 2×2 (DO, SCHEDULE, DELEGATE, ELIMINATE) dengan fitur *drag-and-drop* interaktif menggunakan `@dnd-kit` (mendukung pointer, touch, dan keyboard).
- **Habit Tracker**: Pelacakan kebiasaan harian (*daily*) maupun mingguan (*weekdays*) lengkap dengan kalkulasi *streak* (berjalan & rekor terpanjang) serta visualisasi strip 7 hari.
- **Productivity Statistics**: Ringkasan produktivitas mingguan & bulanan dengan visualisasi grafik batang SVG kustom dan *heatmap* kalender tanpa dependensi chart eksternal.
- **Desain & Tema**: Sistem design token terpusat, mendukung tema `light`, `dark`, dan `system` tanpa *flicker* saat refresh (*anti-flash inline script*).
- **Kepemilikan Data Penuh**: Fitur Ekspor & Impor JSON cadangan data lokal (skema tervalidasi Zod) dengan pilihan *merge* atau *replace*, serta opsi hapus permanen data.
- **PWA & Offline Penuh**: Ditenagai oleh `vite-plugin-pwa` dan Workbox, aplikasi dapat diinstal (*standalone*) dan berfungsi 100% tanpa sambungan internet, dilengkapi prompt pembaruan (*Update Available*).
- **Aksesibilitas (WCAG AA)**: Seluruh komponen dan halaman diaudit menggunakan `axe-core`, dilengkapi navigasi keyboard lengkap (`n` untuk tugas baru, `g` lalu `t/m/h/s` untuk navigasi, `?` untuk bantuan pintasan).

---

## Arsitektur: 4 Zona × 4 Lapis

KashTask Web dirancang dengan aturan pemisahan dependensi yang ketat dan ditegakkan oleh aturan linting `eslint-plugin-boundaries`.

### 1. Empat Zona Dependensi Horizontal
Aliran impor hanya diperbolehkan satu arah:
$$\text{app} \longrightarrow \text{features} \longrightarrow \text{shared} \longrightarrow \text{core}$$

- **`src/app`**: Bootstrap aplikasi, layout shell responsif (sidebar desktop & bottom nav mobile), routing berbasis *lazy-loading*, *error boundary*, dan dialog pintasan keyboard.
- **`src/features`**: Fitur independen berorientasi domain:
  - `tasks`: Manajemen tugas to-do.
  - `matrix`: Papan kuadran Eisenhower dan logika *drag & drop*.
  - `habits`: Pelacakan kebiasaan dan kalkulasi konsistensi/streak.
  - `stats`: Analisis produktivitas dan metrik visual.
  - `settings`: Preferensi tema, hari awal minggu, dan ekspor/impor data.
- **`src/shared`**: Komponen UI generik (`Button`, `Dialog`, `Input`, `Checkbox`, `Toast`, `EmptyState`, `ThemeToggle`) dan utilitas umum yang bebas logika bisnis domain.
- **`src/core`**: Fondasi infrastruktur sistem:
  - `core/storage`: Abstraksi adapter penyimpanan (`IndexedDbAdapter`, `LocalStorageAdapter`, `MemoryAdapter`) dan *migration runner*.
  - `core/theme`: Design tokens, variabel CSS, dan pengatur tema.
  - `core/clock`: Penyedia waktu yang dapat diinjeksi (*clock injection*) untuk determinisme pengujian.
  - `core/id`: Generator ID kanonikal ULID (26 karakter Base32 Crockford).

### 2. Empat Lapis Vertikal di Tiap Fitur
Setiap fitur dipecah menjadi 4 layer terstruktur:
$$\text{ui} \longrightarrow \text{logic} \longrightarrow \text{data} \longrightarrow \text{models}$$

- **`models`**: Definisi tipe TypeScript, skema validasi Zod, dan kontrak antarmuka repositori (*repository interface*). Bersih tanpa impor layer lain.
- **`data`**: Implementasi repositori konkret di atas penyimpanan `core/storage`.
- **`logic`**: Fungsi domain murni (*pure functions*) dan *state store* Zustand yang berinteraksi dengan repositori melalui injeksi dependensi.
- **`ui`**: Komponen tampilan React. Layer UI dilarang mengimpor layer `data` secara langsung.

---

## Panduan Menjalankan Proyek

### Prasyarat
- Node.js versi 20+
- pnpm versi 9+

### Instalasi Dependensi
```bash
cd web
pnpm install
```

### Menjalankan Server Pengembangan (Dev)
```bash
pnpm dev
```
Aplikasi akan aktif di `http://localhost:5173`. Di mode dev, katalog komponen UI Kit dapat diakses di `/dev/components`.

### Build Produksi
```bash
pnpm build
```
Hasil build statis tersimpan di direktori `web/dist/` beserta *service worker* dan aset PWA.

### Menjalankan Preview Hasil Build
```bash
pnpm preview
```

---

## Daftar Script

| Script | Deskripsi |
|---|---|
| `pnpm dev` | Menjalankan server pengembangan Vite lokal dengan HMR |
| `pnpm build` | Memeriksa tipe statis TypeScript lalu kompilasi produksi Vite |
| `pnpm lint` | Memeriksa gaya kode dan batasan arsitektur via ESLint (`--max-warnings 0`) |
| `pnpm typecheck` | Menjalankan validasi tipe TypeScript ketat (`tsc --noEmit`) |
| `pnpm test` | Menjalankan seluruh test suite unit, integrasi, dan audit a11y via Vitest |
| `pnpm format` | Menyeragamkan format kode berkas `.ts`, `.tsx`, `.css`, dan `.json` dengan Prettier |

---

## Pintasan Keyboard Global

- <kbd>n</kbd> : Membuka form pembuatan tugas baru
- <kbd>g</kbd> lalu <kbd>t</kbd> : Berpindah ke halaman **Tasks**
- <kbd>g</kbd> lalu <kbd>m</kbd> : Berpindah ke papan **Matrix**
- <kbd>g</kbd> lalu <kbd>h</kbd> : Berpindah ke pelacak **Habits**
- <kbd>g</kbd> lalu <kbd>s</kbd> : Berpindah ke halaman **Stats**
- <kbd>?</kbd> : Membuka dialog bantuan pintasan keyboard
- <kbd>Esc</kbd> : Menutup dialog yang aktif
