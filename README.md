# KashTask

KashTask adalah aplikasi produktivitas personal *offline-first* yang mengintegrasikan tiga pilar utama manajemen diri: **To-Do List**, **Eisenhower Matrix** (pemetaan prioritas otomatis), dan **Habit Tracker**. Dirancang tanpa backend, KashTask menyimpan seluruh data secara lokal pada perangkat pengguna dengan privasi penuh, performa instan, dan kemampuan ekspor/impor JSON lintas platform.

Repositori ini merupakan monorepo yang menaungi dua platform klien:
- **`web/`**: Web application modern berbasis React 18, TypeScript, dan IndexedDB.
- **`mobile/`**: Mobile application lintas platform (Android/iOS) berbasis Flutter dan Drift (SQLite).

---

## Fitur Utama

1. **To-Do List Terintegrasi**: Pengelolaan tugas harian dengan tenggat waktu, catatan, dan penandaan status selesai yang cepat.
2. **Eisenhower Matrix Otomatis**: Kuadran diturunkan secara otomatis dari atribut *Urgent* dan *Important*:
   - **DO** (Urgent + Important): Selesaikan segera.
   - **SCHEDULE** (Not Urgent + Important): Jadwalkan waktu pengerjaan.
   - **DELEGATE** (Urgent + Not Important): Delegasikan atau tangani dengan cepat.
   - **ELIMINATE** (Not Urgent + Not Important): Hapus atau kurangi.
3. **Habit Tracker**: Pelacakan kebiasaan harian (*daily*) atau hari tertentu (*weekdays*) dengan visualisasi *streak* konsistensi dan pengingat lokal.
4. **Offline-First & Tanpa Backend**: Seluruh data tersimpan di penyimpanan lokal perangkat (IndexedDB di web, SQLite/Drift di mobile). Tidak memerlukan akun, koneksi internet, maupun server eksternal.
5. **Portabilitas Data**: Fitur ekspor dan impor cadangan data dalam format JSON standar yang kompatibel penuh antara Web dan Mobile.

---

## Roadmap Pengembangan

- [x] **Fase 0 — Inisialisasi Fondasi & Kontrak Arsitektur**
  - Inisialisasi repositori, konfigurasi tooling (`.editorconfig`, `.gitignore`).
  - Penetapan aturan agen AI (`AGENTS.md`).
  - Dokumentasi spesifikasi produk (`docs/PRODUCT.md`), kontrak domain bersama (`docs/DOMAIN.md`), dan panduan arsitektur (`docs/ARCHITECTURE.md`).
- [ ] **Fase 1 — Web Application MVP (`web/`)**
  - Setup Vite + React 18 + TypeScript strict + pnpm.
  - Implementasi layer `core` (IndexedDB schema via `idb`, clock provider, ULID generator).
  - Implementasi modul `tasks`, `matrix` (drag & drop via `@dnd-kit`), `habits`, `stats`, dan `settings` (Zustand).
  - Skema validasi Zod untuk ekspor/impor JSON.
  - Unit test logika domain murni (kuadran, streak, statistik) via Vitest.
- [ ] **Fase 2 — Mobile Application MVP (`mobile/`)**
  - Setup Flutter stable + Riverpod + go_router.
  - Implementasi layer `core` database via Drift (SQLite) dan notifikasi lokal.
  - Implementasi UI dan logic untuk modul tugas, matriks kuadran, habit tracker, dan statistik (fl_chart).
  - Fitur ekspor/impor berkas JSON lokal.
  - Unit test logika domain via `flutter_test`.
- [ ] **Fase 3 — Polishing, Aksesibilitas & Portabilitas**
  - Pengujian interoperabilitas ekspor/impor antar platform (Web ↔ Mobile).
  - Penyempurnaan responsivitas, dark/light theme, dan aksesibilitas keyboard/screen reader.
  - Audit performa offline dan konsistensi UX.

---

## Struktur Monorepo

```text
KashTask/
├── AGENTS.md             # Pedoman & aturan kerja untuk agent/engineer
├── README.md             # Ringkasan proyek dan roadmap utama
├── docs/                 # Dokumentasi arsitektur dan spesifikasi produk
│   ├── ARCHITECTURE.md   # Arsitektur 4 zona, 4 lapis, stack, dan verifikasi
│   ├── DOMAIN.md         # Kontrak data model bersama Web & Mobile
│   └── PRODUCT.md        # User stories, ruang lingkup MVP, dan non-goals
├── web/                  # Aplikasi Web (React 18, TypeScript, Vite)
└── mobile/               # Aplikasi Mobile (Flutter, Dart)
```

---

## Pedoman & Dokumentasi

Sebelum memulai pengembangan fitur atau berkontribusi, pelajari dokumen rujukan berikut:
- [AGENTS.md](AGENTS.md): Aturan kerja sesi agent, konvensi git/commit, dan kepatuhan arsitektur.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): Panduan arsitektur 4 zona & 4 lapis, pembagian dependensi, dan aturan verifikasi.
- [docs/DOMAIN.md](docs/DOMAIN.md): Kontrak skema data entitas (Task, Habit, HabitLog, Settings) serta format JSON ekspor/impor.
- [docs/PRODUCT.md](docs/PRODUCT.md): Spesifikasi produk, user stories, ruang lingkup MVP, dan batasan non-goals.
