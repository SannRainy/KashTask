# Panduan Arsitektur: KashTask

Dokumen ini memaparkan fondasi arsitektur, pemilihan teknologi (*tech stack*), prinsip pembagian zona dan lapisan dependensi, struktur direktori monorepo, serta tata cara verifikasi kode untuk aplikasi **KashTask**.

---

## 1. Tech Stack Resmi

Arsitektur dirancang untuk menjamin performa tinggi, keandalan luring (*offline-first*), serta kebersihan batas dependensi.

### Web Application (`web/`)
- **Build Tool & Package Manager**: [Vite](https://vitejs.dev/) + [pnpm](https://pnpm.io/)
- **UI Library & Bahasa**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (`strict: true`)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Routing**: [React Router](https://reactrouter.com/)
- **Interaksi Drag & Drop**: [@dnd-kit](https://dndkit.com/) (untuk pengelolaan matriks kuadran)
- **Penyimpanan Lokal**: [idb](https://github.com/jakearchibald/idb) (abstraksi modern IndexedDB)
- **Validasi Data**: [zod](https://zod.dev/) (validasi kontrak model dan berkas impor/ekspor JSON)
- **Testing**: [Vitest](https://vitest.dev/) + [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/)
- **Styling**: CSS Modules + CSS Custom Properties (Variables) untuk sistem token tema

### Mobile Application (`mobile/`)
- **Framework & SDK**: [Flutter](https://flutter.dev/) (channel stable)
- **State Management**: [Riverpod](https://riverpod.dev/)
- **Routing**: [go_router](https://pub.dev/packages/go_router)
- **Penyimpanan Lokal / Database**: [Drift](https://drift.simonbinder.eu/) (SQLite typesafe ORM)
- **Notifikasi Lokal**: [flutter_local_notifications](https://pub.dev/packages/flutter_local_notifications) + [timezone](https://pub.dev/packages/timezone)
- **Visualisasi Data / Grafik**: [fl_chart](https://pub.dev/packages/fl_chart)
- **Testing**: `flutter_test` + integration test harness bawaan Flutter

---

## 2. Prinsip & Aturan Arsitektur

### A. 4 Zona Arsitektur (Aliran Dependensi Horizontal)
Aplikasi diorganisasikan ke dalam 4 zona berjenjang dengan aliran dependensi satu arah:

$$\mathbf{app} \longrightarrow \mathbf{features} \longrightarrow \mathbf{shared} \longrightarrow \mathbf{core}$$

```
+---------------------------------------------------------------------------------+
|                                     app                                         |
|                 (bootstrap, routing, providers, shell layout)                   |
+---------------------------------------------------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                                  features                                       |
|                  (tasks, matrix, habits, stats, settings)                       |
+---------------------------------------------------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                                   shared                                        |
|              (komponen UI & util generik TANPA logika domain)                   |
+---------------------------------------------------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                                    core                                         |
|        (storage/database, clock provider, id generator, theme tokens, etc.)     |
+---------------------------------------------------------------------------------+
```

#### Aturan Dependensi Antar-Zona:
1. **Import HANYA diperbolehkan mengarah ke kanan (ke bawah)**:
   - `app` dapat mengimpor dari `features`, `shared`, dan `core`.
   - `features` dapat mengimpor dari `shared` dan `core`.
   - `shared` hanya dapat mengimpor dari `core`.
   - `core` tidak boleh mengimpor apa pun dari zona lain (*zero outward dependency*).
2. **Dilarang keras melakukan circular import** atau import mengarah ke kiri (misalnya `core` mengimpor `shared`, atau `shared` mengimpor `features`).

---

### B. Batasan Antar-Fitur & Public API
- Ruang lingkup fitur resmi: `tasks`, `matrix`, `habits`, `stats`, `settings`.
- Antar-fitur **hanya boleh berkomunikasi melalui Public API (`index` / barrel export)**.
- **Deep import dilarang keras**.
  - Contoh benar:
    ```typescript
    import { Task, useTaskStore } from '@/features/tasks';
    ```
  - Contoh dilarang:
    ```typescript
    import { taskRepository } from '@/features/tasks/data/taskRepository';
    import { TaskCard } from '@/features/tasks/ui/TaskCard';
    ```

---

### C. 4 Lapis di Tiap Fitur (Aliran Dependensi Vertikal)
Di dalam masing-masing folder fitur, kode dipisahkan secara tegas ke dalam 4 lapisan:

$$\mathbf{ui} \longrightarrow \mathbf{logic} \longrightarrow \mathbf{data} \longrightarrow \mathbf{models}$$

1. **`models`**:
   - Mendefinisikan tipe entitas domain, skema validasi, value objects, dan antarmuka repositori (*repository interface*).
   - **Aturan**: Lapis `models` murni, mandiri, dan **tidak mengimpor apa pun** dari lapis `data`, `logic`, maupun `ui`.
2. **`data`**:
   - Berisi implementasi konkret dari antarmuka repositori yang didefinisikan di `models`, mapper data lokal, dan pemanggilan ke driver storage/database.
   - **Aturan**: **Hanya lapis `data` yang menyentuh `core/storage` atau `core/database`**.
3. **`logic`**:
   - Pengelola state dan orchestrator proses bisnis (Zustand store pada web, Riverpod notifier / use cases pada mobile).
   - **Aturan**: Lapis `logic` menerima implementasi repository melalui **injeksi dependensi** (berdasarkan antarmuka di `models`), bukan membuat instance konkret secara hardcoded.
4. **`ui`**:
   - Komponen tampilan, presentasi visual, formulir, dan interaksi pengguna.
   - **Aturan**: **Lapis `ui` tidak boleh mengimpor lapis `data` secara langsung**. Seluruh pembacaan data dan pengiriman aksi wajib melalui lapis `logic`.

---

### D. Logika Domain Murni (Pure Functions)
- Logika kalkulasi bisnis bersifat independen dari platform dan diwujudkan sebagai **fungsi murni (*pure functions*)**:
  - Penentuan kuadran Eisenhower berdasarkan kombinasi `urgent` dan `important`.
  - Kalkulasi *streak* habit (memeriksa kontinuitas hari/weekdays).
  - Agregasi metrik dan statistik produktivitas.
- Karakteristik fungsi murni:
  - Input sama selalu menghasilkan output sama.
  - Bebas *side effect* (tidak menulis ke storage, tidak mengubah variabel global).
  - Wajib memiliki cakupan unit test komprehensif.
- **Injeksi Waktu**: Seluruh fungsi yang memerlukan tanggal atau waktu hari ini **wajib menerima parameter clock** (`() => Date` di TS, `DateTime Function()` di Dart).

---

## 3. Struktur Direktori Monorepo

```text
KashTask/
├── .editorconfig
├── .gitignore
├── AGENTS.md
├── README.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DOMAIN.md
│   └── PRODUCT.md
├── web/
│   ├── .gitkeep
│   └── src/
│       ├── app/
│       │   ├── router/
│       │   ├── providers/
│       │   └── layout/
│       ├── features/
│       │   ├── tasks/
│       │   │   ├── index.ts              # Public API barrel export
│       │   │   ├── models/               # Types, Zod schemas, Repository interface
│       │   │   ├── data/                 # IndexedDB repository implementation
│       │   │   ├── logic/                # Zustand stores & pure domain functions
│       │   │   └── ui/                   # TaskList, TaskItem, TaskForm
│       │   ├── matrix/
│       │   │   ├── index.ts
│       │   │   ├── models/
│       │   │   ├── data/
│       │   │   ├── logic/
│       │   │   └── ui/
│       │   ├── habits/
│       │   │   ├── index.ts
│       │   │   ├── models/
│       │   │   ├── data/
│       │   │   ├── logic/
│       │   │   └── ui/
│       │   ├── stats/
│       │   │   ├── index.ts
│       │   │   ├── models/
│       │   │   ├── data/
│       │   │   ├── logic/
│       │   │   └── ui/
│       │   └── settings/
│       │       ├── index.ts
│       │       ├── models/
│       │       ├── data/
│       │       ├── logic/
│       │       └── ui/
│       ├── shared/
│       │   ├── ui/                       # Button, Modal, Input, Badge (generic)
│       │   └── utils/                    # Generic string/format helpers
│       └── core/
│           ├── storage/                  # IndexedDB database initialization & migration
│           ├── clock/                    # Clock abstraction & injection
│           ├── id/                       # ULID generator
│           ├── theme/                    # CSS variables token definitions
│           └── notifications/            # Web Notification API wrapper
└── mobile/
    ├── .gitkeep
    └── lib/
        ├── app/
        │   ├── router/
        │   ├── providers/
        │   └── shell/
        ├── features/
        │   ├── tasks/
        │   │   ├── tasks.dart            # Public API library export
        │   │   ├── models/
        │   │   ├── data/
        │   │   ├── logic/
        │   │   └── ui/
        │   ├── matrix/
        │   ├── habits/
        │   ├── stats/
        │   └── settings/
        ├── shared/
        │   ├── ui/
        │   └── utils/
        └── core/
            ├── database/                 # Drift tables & database connection
            ├── clock/                    # Clock provider
            ├── id/                       # ULID generator
            ├── theme/                    # Flutter ThemeData & ColorTokens
            └── notifications/            # flutter_local_notifications wrapper
```

---

## 4. Cara Memverifikasi Batasan Arsitektur

Untuk memastikan tidak terjadi pelanggaran arsitektur, verifikasi dijalankan dengan mekanisme berikut:

### 1. Verifikasi Web (`web/`)
- **Lint & Aturan Boundary**:
  - Konfigurasi ESLint menggunakan `eslint-plugin-import` dengan `no-restricted-paths`:
    - Memblokir impor dari `core` ke zona mana pun.
    - Memblokir impor dari `shared` ke `features` atau `app`.
    - Memblokir impor dari `features` ke `app`.
    - Memblokir impor lapis `ui` ke lapis `data`.
    - Memblokir impor lapis `models` ke lapis mana pun dalam fitur.
    - Memblokir deep import antar-fitur (`features/*/*` dilarang selain via barrel root `features/*`).
- **Pengecekan Tipe**:
  - `pnpm --filter web typecheck` (`tsc --noEmit`) dijalankan dengan mode strict.
- **Unit Test**:
  - `pnpm --filter web test` (Vitest) menguji fungsi murni dan store logic secara terisolasi.

### 2. Verifikasi Mobile (`mobile/`)
- **Analisis Statis Dart**:
  - File `analysis_options.yaml` dikonfigurasi dengan aturan ketat (`analyzer: language, strong-mode`) dan pustaka pendukung verifikasi layer seperti custom lint rules.
- **Pengecekan Struktur**:
  - Tidak ada import file internal feature dari fitur lain selain file export utama (`features/<feature>/<feature>.dart`).
- **Unit Test**:
  - `flutter test` memverifikasi seluruh fungsi kalkulasi murni, model mapping, dan state notifier logic.

### 3. Pipeline Verifikasi Lengkap
Setiap branch harus dapat menjalankan:
```bash
# Web verification
cd web && pnpm lint && pnpm typecheck && pnpm test && pnpm build

# Mobile verification
cd mobile && flutter analyze && flutter test && flutter build
```
Seluruh pemeriksaan wajib **hijau (exit code 0)** sebelum commit dibuat.
