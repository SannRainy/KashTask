# AGENTS.md

Dokumen ini merupakan panduan dan kontrak kerja wajib yang **harus dibaca dan ditaati oleh setiap AI agent atau perekayasa perangkat lunak (engineer)** pada setiap sesi kerja sebelum melakukan perubahan kode atau berkas dalam repositori **KashTask**.

---

## 1. Alur Kerja Git & Aturan Percabangan

1. **Satu Tugas = Satu Branch = Satu Commit**:
   - Setiap tugas dikerjakan dalam branch terisolasi dengan pola penamaan: `feat/<kode>-<slug>` (contoh: `feat/p01-task-crud`, `feat/p02-eisenhower-matrix`).
   - Setiap branch hanya berisi tepat **satu commit** akhir yang merangkum keseluruhan tugas tersebut.
2. **Conventional Commits**:
   - Pesan commit wajib menggunakan format *Conventional Commits* dalam **Bahasa Inggris**:
     ```text
     <type>(<scope>): <short description in imperative mood>

     [optional body explaining details or justification for dependencies]

     [optional footer(s)]
     ```
   - Pilihan `type`: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.
3. **Peringatan Keras Git Push**:
   - **Agent TIDAK PERNAH menjalankan perintah `git push`**. Seluruh operasi sinkronisasi remote diserahkan kepada pengguna (user).

---

## 2. Standar Kualitas Wajib Sebelum Commit

Sebelum commit dibuat, pastikan seluruh tahapan verifikasi kualitas berikut **berstatus hijau (sukses tanpa kegagalan)**:
- **Lint**: Pemeriksaan gaya kode dan aturan statis (ESLint pada web, `flutter analyze` pada mobile).
- **Typecheck / Analyze**: Pengecekan tipe statis ketat tanpa kesalahan (TypeScript `tsc --noEmit` pada web, analyzer pada mobile).
- **Test**: Seluruh unit test dan integration test harus lolos 100% (Vitest pada web, `flutter test` pada mobile).
- **Build**: Proses kompilasi dan build produksi harus berhasil tanpa galat (`pnpm build` pada web, `flutter build` pada mobile).

---

## 3. Batasan Dependensi & Lingkup Berkas

1. **Daftar Stack Resmi**:
   - **Web**: Vite, React 18, TypeScript (strict mode), pnpm, Zustand, React Router, `@dnd-kit`, `idb`, `zod`, Vitest + React Testing Library, CSS Modules + CSS Variables.
   - **Mobile**: Flutter stable, Riverpod, `go_router`, `Drift` (SQLite), `flutter_local_notifications`, `timezone`, `fl_chart`.
2. **Larangan Penambahan Dependensi**:
   - Dilarang menambahkan *package* atau pustaka (*dependency*) di luar daftar stack resmi di atas, **kecuali** terdapat alasan teknis krusial yang dituliskan secara eksplisit pada bagian pesan *commit body*.
3. **Pembatasan Lingkup Berkas**:
   - Dilarang memodifikasi berkas yang berada di luar lingkup tugas yang sedang dikerjakan. Jaga *diff* commit tetap ramping dan fokus.

---

## 4. Konvensi Bahasa

- **Identifier Kode & Teks UI**:
  - Semua nama variabel, fungsi, kelas, antarmuka (*interface*), berkas kode, nama properti schema, dan teks antarmuka pengguna (UI copy / label / error message) **wajib menggunakan Bahasa Inggris**.
- **Dokumentasi Proyek**:
  - Berkas dokumentasi (`README.md`, `AGENTS.md`, seluruh berkas di folder `docs/`, serta catatan arsitektural) **ditulis dalam Bahasa Indonesia**.

---

## 5. Aturan Arsitektur Wajib

Aturan berikut berlaku absolut di kedua klien (`web/` dan `mobile/`):

### A. 4 Zona Arsitektur (Aliran Dependensi Horizontal)
Aplikasi dibagi menjadi 4 zona bertingkat:
$$\text{app} \longrightarrow \text{features} \longrightarrow \text{shared} \longrightarrow \text{core}$$

- **`app`**: Bootstrap aplikasi, konfigurasi routing global, root providers/state wrappers, layout shell global.
- **`features`**: Modul fungsional independen berorientasi domain pengguna (`tasks`, `matrix`, `habits`, `stats`, `settings`).
- **`shared`**: Komponen UI generik (Button, Modal, Input, Card), helper/utilitas umum yang **bebas dari logika domain KashTask**.
- **`core`**: Abstraksi infrastruktur dasar (storage/database engine, clock/time provider, generator ID/ULID, theme tokens, notification service).
- **Aturan Import Zona**:
  - **Import HANYA diperbolehkan mengarah ke kanan**.
  - `app` boleh mengimpor dari `features`, `shared`, dan `core`.
  - `features` boleh mengimpor dari `shared` dan `core`.
  - `shared` hanya boleh mengimpor dari `core`.
  - `core` dilarang mengimpor apa pun dari zona lain (*zero outward dependency*).
  - Dilarang keras melakukan impor siklik (*circular dependencies*) atau impor mengarah ke kiri.

### B. Batasan Antar-Fitur
- Modul fitur resmi: `tasks`, `matrix`, `habits`, `stats`, `settings`.
- Komunikasi antar-fitur **hanya diperbolehkan melalui Public API (`index` / barrel export)** dari fitur yang bersangkutan.
- **Deep import dilarang keras**. Contoh:
  - Diperbolehkan: `import { Task } from '@/features/tasks';`
  - Dilarang: `import { TaskRepository } from '@/features/tasks/data/taskRepository';`

### C. 4 Lapis di Tiap Fitur (Aliran Dependensi Vertikal)
Setiap fitur dipecah menjadi 4 lapis berstruktur:
$$\text{ui} \longrightarrow \text{logic} \longrightarrow \text{data} \longrightarrow \text{models}$$

- **`models`**: Definisi entitas data, tipe/skema validasi, dan kontrak antarmuka repositori (*repository interface*). Lapis ini **murni dan tidak mengimpor apa pun dari lapis lain** di dalam fitur.
- **`data`**: Implementasi repositori dan mapper data. **Hanya lapis data yang diperbolehkan menyentuh storage/database pada `core`**.
- **`logic`**: Pengatur alur kerja aplikasi (Zustand store pada web, Riverpod notifier pada mobile, use cases). Menerima kontrak repository melalui **injeksi dependensi**.
- **`ui`**: Komponen presentasi dan tampilan visual. **Lapis `ui` tidak boleh mengimpor lapis `data` secara langsung**; seluruh interaksi data wajib melalui `logic`.

### D. Logika Domain Murni (Pure Domain Logic)
- Seluruh logika kalkulasi domain harus diwujudkan sebagai **fungsi murni (*pure functions*)** tanpa *side effect*, meliputi:
  - Penentuan Kuadran Eisenhower (*urgent* + *important* $\rightarrow$ DO, SCHEDULE, DELEGATE, ELIMINATE).
  - Kalkulasi *streak* dan konsistensi habit.
  - Perhitungan metrik dan statistik produktivitas.
- Setiap fungsi domain murni **wajib memiliki unit test komprehensif**.
- **Aturan Injeksi Waktu**: Fungsi yang membutuhkan informasi tanggal/waktu wajib menerima parameter `clock` (fungsi/antarmuka penyuplai waktu) untuk menjamin kemudahan pengujian dan determinisme tanpa manipulasi waktu global.
