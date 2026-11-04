# Spesifikasi Produk: KashTask

Dokumen ini mendefinisikan visi produk, kebutuhan pengguna, batasan ruang lingkup (*scope*) MVP, serta batasan eksplisit yang tidak dikerjakan (*non-goals*) untuk aplikasi **KashTask**.

---

## 1. Visi & Nilai Utama Produk

**KashTask** adalah instrumen produktivitas personal *offline-first* yang menyatukan daftar tugas (*to-do list*), matriks prioritas Eisenhower, dan pelacak kebiasaan (*habit tracker*) ke dalam satu alur kerja terpadu yang cepat, privat, dan tanpa hambatan.

### Nilai Utama
1. **Privasi & Kepemilikan Data Mutlak**: Seluruh data tersimpan secara lokal di perangkat pengguna. Tidak ada data yang dikirimkan ke server eksternal mana pun.
2. **Kinerja Instan & Keandalan Offline**: Aplikasi dapat dibuka dan digunakan seketika tanpa koneksi internet, tanpa *loading screen* berbasis jaringan, dan tanpa risiko *service outage*.
3. **Kejelasan Prioritas Otomatis**: Menghilangkan kebingungan "apa yang harus dikerjakan selanjutnya" dengan otomatisasi pemetaan prioritas berbasis matriks Eisenhower.
4. **Portabilitas Terbuka**: Pengguna bebas memindahkan atau mencadangkan datanya kapan saja melalui berkas JSON standar yang kompatibel lintas platform (Web dan Mobile).

---

## 2. Persona Pengguna

- **Profesional / Pekerja Lepas Mandiri**: Membutuhkan sistem pengorganisasian tugas harian yang cepat untuk membedakan antara hal yang mendesak (*urgent*) dan hal yang bernilai strategis tinggi (*important*).
- **Individu yang Sadar Privasi**: Pengguna yang enggan mendaftarkan email, nomor telepon, atau mengunggah jadwal pribadi mereka ke cloud pihak ketiga.
- **Pembangun Kebiasaan (Habit Builder)**: Ingin melacak konsistensi rutinitas harian sederhana tanpa terdistraksi oleh fitur *gamification* yang berlebihan.

---

## 3. User Stories

### A. Pengelolaan Tugas (Tasks)
- **US-T1**: Sebagai pengguna, saya dapat menambahkan tugas baru dengan cepat (judul 1–120 karakter, catatan opsional, tanggal jatuh tempo opsional, dan penanda *urgent* / *important*) sehingga agenda saya tercatat rapi.
- **US-T2**: Sebagai pengguna, saya dapat menandai tugas sebagai selesai (*done*) atau mengembalikannya ke belum selesai (*todo*) dengan satu ketukan/klik.
- **US-T3**: Sebagai pengguna, saya dapat mengedit judul, catatan, tanggal jatuh tempo, dan prioritas tugas yang telah dibuat.
- **US-T4**: Sebagai pengguna, saya dapat menghapus tugas yang sudah tidak relevan.
- **US-T5**: Sebagai pengguna, saya dapat melihat daftar tugas terurut berdasarkan urutan manual (*order*) atau tanggal jatuh tempo.

### B. Matriks Eisenhower (Matrix)
- **US-M1**: Sebagai pengguna, saya dapat melihat pembagian tugas ke dalam 4 kuadran prioritas secara otomatis berdasarkan kombinasi *urgent* dan *important*:
  - **Q1 - DO**: Urgent & Important (krisis, tenggat mendesak).
  - **Q2 - SCHEDULE**: Not Urgent & Important (pengembangan diri, perencanaan strategis).
  - **Q3 - DELEGATE**: Urgent & Not Important (interupsi, tugas administratif mendesak).
  - **Q4 - ELIMINATE**: Not Urgent & Not Important (aktivitas distraksi).
- **US-M2**: Sebagai pengguna, saya dapat memindahkan tugas antar-kuadran (melalui *drag-and-drop* pada Web atau pengubah status/tindakan cepat pada Mobile) yang secara otomatis memperbarui status *urgent* dan *important* tugas tersebut.
- **US-M3**: Sebagai pengguna, saya dapat menyusun ulang urutan prioritas tugas di dalam kuadran yang sama.

### C. Pelacak Kebiasaan (Habits)
- **US-H1**: Sebagai pengguna, saya dapat membuat kebiasaan baru dengan nama, frekuensi (harian atau hari-hari tertentu dalam seminggu), jam pengingat harian, dan label warna penanda.
- **US-H2**: Sebagai pengguna, saya dapat mencatat penyelesaian kebiasaan untuk hari ini (atau melihat riwayat hari sebelumnya) dengan satu kali sentuh.
- **US-H3**: Sebagai pengguna, saya dapat melihat jumlah hari beruntun (*streak*) saat ini dan *longest streak* untuk menjaga motivasi konsistensi.
- **US-H4**: Sebagai pengguna, saya dapat mengarsipkan kebiasaan lama tanpa menghapus riwayat pencapaian masa lalu.

### D. Statistik & Produktivitas (Stats)
- **US-S1**: Sebagai pengguna, saya dapat melihat ringkasan rasio penyelesaian tugas berdasarkan kuadran Eisenhower untuk mengevaluasi alokasi waktu saya.
- **US-S2**: Sebagai pengguna, saya dapat melihat visualisasi grafik mingguan/bulanan atas konsistensi kebiasaan saya.

### E. Pengaturan & Cadangan Data (Settings & Data Portability)
- **US-SET1**: Sebagai pengguna, saya dapat memilih preferensi tema antarmuka (*System*, *Light*, *Dark*).
- **US-SET2**: Sebagai pengguna, saya dapat menentukan hari pertama mingguan (Minggu atau Senin) sesuai preferensi kalender saya.
- **US-SET3**: Sebagai pengguna, saya dapat mengaktifkan atau menonaktifkan notifikasi pengingat lokal.
- **US-SET4**: Sebagai pengguna, saya dapat mengekspor seluruh data saya (Tasks, Habits, HabitLogs, Settings) ke dalam satu berkas format JSON.
- **US-SET5**: Sebagai pengguna, saya dapat mengimpor berkas JSON cadangan untuk memulihkan atau memindahkan data antar perangkat (misal: dari Web ke Mobile atau sebaliknya) secara aman dan terverifikasi.

---

## 4. Ruang Lingkup MVP (Minimum Viable Product)

| Fitur | MVP (Must-Have) | Fase Lanjutan (Nice-to-Have) |
|---|---|---|
| **Penyimpanan** | Offline lokal (IndexedDB pada Web, Drift SQLite pada Mobile) | Enkripsi cadangan data opsional |
| **Tasks** | CRUD lengkap, batas judul 1-120 karakter, notes, dueDate, status todo/done | Sub-tasks bertingkat, lampiran berkas |
| **Eisenhower** | 4 kuadran otomatis (Do, Schedule, Delegate, Eliminate), drag & drop web | Analisis AI untuk rekomendasi kuadran |
| **Habits** | Daily & Weekdays tracking, log harian unik, streak calculation | Target frekuensi majemuk (misal: 3x per minggu acak) |
| **Pengingat** | Notifikasi lokal perangkat (Mobile) & Browser notification (Web) | Pengingat berulang kompleks |
| **Statistik** | Rasio penyelesaian per kuadran & grafik tren streak mingguan | Ekspor laporan PDF |
| **Data Backup** | Ekspor & Impor JSON skema versi 1 dengan validasi integritas | Sinkronisasi P2P via WebRTC / QR code lokal |

---

## 5. Non-Goals (Batasan Eksplisit)

Untuk menjaga kesederhanaan, kecepatan pengembangan, dan jaminan privasi penuh, hal-hal berikut **secara sadar dan tegas dikecualikan dari cakupan KashTask**:

1. **Tanpa Akun Pengguna / Tanpa Autentikasi**:
   - Tidak ada pendaftaran (*registration*), masuk (*login*), reset password, OAuth (Google/Apple Sign-In), atau manajemen profil berbasis cloud. Aplikasi langsung siap pakai sejak detik pertama dibuka.
2. **Tanpa Sinkronisasi Cloud Otomatis (No Cloud Sync / No Backend)**:
   - Tidak ada database terpusat (Firebase, Supabase, PostgreSQL, AWS DynamoDB, dll.).
   - Tidak ada REST/GraphQL API server milik KashTask.
   - Pemindahan data dilakukan secara sadar oleh pengguna melalui mekanisme **Ekspor dan Impor berkas JSON lokal**.
3. **Tanpa Kolaborasi Multi-Pengguna (No Real-Time Collaboration)**:
   - Tidak ada fitur berbagi tugas (*shared lists*), penugasan anggota tim (*assignee*), komentar tim, atau sinkronisasi multi-perangkat secara instan. KashTask adalah ruang privat tunggal untuk satu individu.
