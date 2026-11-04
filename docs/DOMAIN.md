# Kontrak Domain Bersama: KashTask

Dokumen ini mendefinisikan spesifikasi formal kontrak data model, aturan bisnis turunan (*derived rules*), format pertukaran data JSON, dan standarisasi manipulasi waktu yang berlaku identik untuk platform **Web** (`web/`) dan **Mobile** (`mobile/`).

---

## 1. Definisi Entitas Data

### A. Task (Tugas)
Entitas tugas merepresentasikan satu item pekerjaan dalam to-do list dan matriks Eisenhower.

| Properti | Tipe | Wajib / Opsional | Keterangan & Validasi |
|---|---|---|---|
| `id` | `string` (ULID) | Wajib | 26 karakter kanonikal ULID (Universal Unique Lexicographically Sortable Identifier). |
| `title` | `string` | Wajib | Panjang 1–120 karakter, spasi di awal/akhir dipotong (*trimmed*), tidak boleh kosong. |
| `notes` | `string` | Opsional | Penjelasan detail atau catatan tambahan tugas (teks bebas). |
| `urgent` | `boolean` | Wajib | Menandakan apakah tugas memiliki urgensi tinggi / mendesak. |
| `important` | `boolean` | Wajib | Menandakan apakah tugas memiliki signifikansi / nilai penting tinggi. |
| `status` | `'todo' \| 'done'` | Wajib | Status pengerjaan tugas. Nilai awal adalah `'todo'`. |
| `dueDate` | `string` (YYYY-MM-DD) | Opsional | Tanggal tenggat waktu dalam kalender lokal (format `YYYY-MM-DD`). |
| `order` | `number` | Wajib | Angka bulat / floating untuk menentukan urutan visual (*manual ordering*) dalam daftar atau kuadran. |
| `createdAt` | `string` (ISO 8601 UTC) | Wajib | Waktu pembuatan tugas, contoh: `2026-11-04T10:00:00.000Z`. |
| `updatedAt` | `string` (ISO 8601 UTC) | Wajib | Waktu terakhir tugas diubah. |
| `completedAt` | `string` (ISO 8601 UTC) | Opsional | Diisi timestamp UTC saat status berubah menjadi `'done'`. `null`/`undefined` jika `'todo'`. |

#### Logika Kuadran Eisenhower (Derived Quadrant)
Kuadran **TIDAK DISIMPAN** sebagai kolom tersendiri di database, melainkan diturunkan (*derived*) secara fungsional murni dari kombinasi `urgent` dan `important`:

$$\text{Quadrant} = f(\text{urgent}, \text{important})$$

- $\text{urgent} = \text{true} \;\land\; \text{important} = \text{true} \implies \mathbf{DO}$ (Kuadran 1)
- $\text{urgent} = \text{false} \;\land\; \text{important} = \text{true} \implies \mathbf{SCHEDULE}$ (Kuadran 2)
- $\text{urgent} = \text{true} \;\land\; \text{important} = \text{false} \implies \mathbf{DELEGATE}$ (Kuadran 3)
- $\text{urgent} = \text{false} \;\land\; \text{important} = \text{false} \implies \mathbf{ELIMINATE}$ (Kuadran 4)

---

### B. Habit (Kebiasaan)
Entitas kebiasaan yang dilacak secara berkala oleh pengguna.

| Properti | Tipe | Wajib / Opsional | Keterangan & Validasi |
|---|---|---|---|
| `id` | `string` (ULID) | Wajib | 26 karakter kanonikal ULID. |
| `name` | `string` | Wajib | Nama kebiasaan (1–100 karakter, *trimmed*). |
| `frequency` | `HabitFrequency` | Wajib | Pola keberulangan kebiasaan: `'daily'` atau larik hari `weekdays` (`0–6`, di mana `0 = Sunday`, `1 = Monday`, ..., `6 = Saturday`). |
| `reminderTime` | `string` (HH:mm) | Opsional | Waktu pengingat harian lokal format 24-jam (`00:00` sampai `23:59`). |
| `colorKey` | `string` | Wajib | Token identifier palet tema warna (misal: `'coral'`, `'emerald'`, `'indigo'`, `'amber'`). |
| `createdAt` | `string` (ISO 8601 UTC) | Wajib | Waktu pembuatan kebiasaan. |
| `archivedAt` | `string` (ISO 8601 UTC) | Opsional | Timestamp pengarsipan kebiasaan. Jika bernilai null/undefined, statusnya aktif. |

Definisi tipe frekuensi:
```typescript
type HabitFrequency = 
  | { type: 'daily' }
  | { type: 'weekdays'; days: number[] }; // days berisi integer unik 0..6
```

---

### C. HabitLog (Catatan Eksekusi Kebiasaan)
Entitas log yang mencatat bahwa suatu kebiasaan telah diselesaikan pada tanggal tertentu.

| Properti | Tipe | Wajib / Opsional | Keterangan & Validasi |
|---|---|---|---|
| `habitId` | `string` (ULID) | Wajib | Relasi foreign-key ke entitas `Habit.id`. |
| `date` | `string` (YYYY-MM-DD) | Wajib | Tanggal penyelesaian menurut kalender lokal perangkat saat aksi dilakukan. |

#### Batasan Integritas Unik:
- **Kunci Unik Komposit**: `(habitId, date)` harus unik di tingkat database / penyimpanan.
- Satu kebiasaan hanya dapat memiliki maksimal 1 (satu) pencatatan pada tanggal kalender yang sama.

---

### D. Settings (Preferensi Pengguna)
Entitas konfigurasi aplikasi lokal.

| Properti | Tipe | Nilai Default | Keterangan & Validasi |
|---|---|---|---|
| `theme` | `'system' \| 'light' \| 'dark'` | `'system'` | Mode tampilan visual aplikasi. |
| `weekStartsOn` | `0 \| 1` | `1` (Senin) | Konfigurasi awal kalender mingguan: `0` untuk Minggu (*Sunday*), `1` untuk Senin (*Monday*). |
| `remindersEnabled` | `boolean` | `true` | Sakelar izin pengingat lokal (notifikasi). |

---

## 2. Kontrak Ekspor & Impor Cadangan Data (JSON Schema)

Format berkas pertukaran data JSON dirancang agar dapat diekspor dari Web dan diimpor ke Mobile (atau sebaliknya) tanpa inkonsistensi:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "app": "kashtask",
  "schemaVersion": 1,
  "exportedAt": "2026-11-04T10:00:00.000Z",
  "tasks": [
    {
      "id": "01HARC4K1M9K7Z2P7N00W8J4Q1",
      "title": "Finalize Q4 strategic review",
      "notes": "Discuss OKR achievements with the team",
      "urgent": false,
      "important": true,
      "status": "todo",
      "dueDate": "2026-11-10",
      "order": 1,
      "createdAt": "2026-11-04T09:00:00.000Z",
      "updatedAt": "2026-11-04T09:30:00.000Z",
      "completedAt": null
    }
  ],
  "habits": [
    {
      "id": "01HARC5B0Q8A4T5V9B11C2D3E4",
      "name": "Drink 2L Water",
      "frequency": { "type": "daily" },
      "reminderTime": "08:00",
      "colorKey": "blue",
      "createdAt": "2026-11-01T00:00:00.000Z",
      "archivedAt": null
    }
  ],
  "habitLogs": [
    {
      "habitId": "01HARC5B0Q8A4T5V9B11C2D3E4",
      "date": "2026-11-04"
    }
  ],
  "settings": {
    "theme": "system",
    "weekStartsOn": 1,
    "remindersEnabled": true
  }
}
```

### Validasi Impor
1. Nilai properti `app` harus tepat bernilai `"kashtask"`.
2. Properti `schemaVersion` harus bernilai integer yang didukung (saat ini versi `1`).
3. Seluruh relasi referensial diverifikasi: setiap `habitLog.habitId` harus memiliki kecocokan dengan `habits[].id`.
4. Jika berkas tidak valid, operasi impor dibatalkan secara atomik tanpa merusak basis data lokal yang ada.

---

## 3. Standarisasi Waktu & Aturan Injeksi Clock

Untuk mencegah *timezone shifting bugs* yang umum terjadi saat bekerja secara offline:

1. **Format Tanggal Kalender (Date Only)**:
   - Nilai tanggal seperti `dueDate` pada `Task` dan `date` pada `HabitLog` **selalu disimpan sebagai string lokal `YYYY-MM-DD`** (contoh: `"2026-11-04"`).
   - Dilarang menyimpan tanggal kalender dalam format timestamp UTC penuh karena pergeseran zona waktu saat perjalanan dapat memindahkan hari secara tidak diinginkan.
2. **Format Waktu Jam (Time Only)**:
   - Waktu pengingat (`reminderTime`) disimpan sebagai string waktu 24-jam format `HH:mm` (contoh: `"19:30"`).
3. **Format Timestamp Audit (Timestamp with Timezone)**:
   - `createdAt`, `updatedAt`, `completedAt`, `archivedAt`, dan `exportedAt` disimpan sebagai string ISO 8601 UTC lengkap dengan penanda `Z` (contoh: `"2026-11-04T09:58:15.000Z"`).
4. **Prinsip Injeksi Clock untuk Logika Domain**:
   - Dilarang memanggil `new Date()` (TypeScript) atau `DateTime.now()` (Dart) langsung di dalam fungsi kalkulasi bisnis (seperti perhitungan streak, status keterlambatan tugas/overdue, statistik).
   - Seluruh fungsi bisnis yang bergantung pada waktu **wajib menerima parameter fungsi clock** yang dapat diinjeksi:
     - TypeScript: `type Clock = () => Date;`
     - Dart: `typedef Clock = DateTime Function();`
   - Hal ini memastikan unit test dapat menyimulasikan pergantian hari, tahun kabisat, dan akhir pekan secara deterministik tanpa ketergantungan pada jam sistem operasi mesin uji.
