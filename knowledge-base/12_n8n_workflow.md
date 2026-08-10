# AUTOMORA BUSINESS CONSULTANT AI
## Knowledge Base
### Document 12 — n8n Workflow
Version: 1.0
Status: DRAFT

---

# 1. Tujuan Dokumen

Dokumen ini menentukan alur kerja teknis AutoMora Business Consultant AI menggunakan n8n.

n8n bertugas mengatur aliran pesan, mengambil Knowledge Base yang diperlukan, mengirim konteks kepada AI, menerima respons AI, dan meneruskan respons kepada calon klien.

---

# 2. Arsitektur Dasar

Alur utama:

Calon Klien
↓
WhatsApp
↓
WhatsApp API
↓
n8n
↓
Knowledge Base
↓
AI
↓
Analisis & Response
↓
n8n
↓
WhatsApp
↓
Calon Klien

Jika membutuhkan Business Consultant:

AI
↓
Escalation
↓
Ringkasan Percakapan
↓
Tim AutoMora
↓
Business Consultant

---

# 3. Peran n8n

n8n bertugas sebagai automation layer.

n8n tidak menentukan sendiri solusi bisnis.

Keputusan mengenai:

- Pemahaman kebutuhan.
- Analisis masalah.
- Rekomendasi layanan.
- Otomatisasi Sesuai Kebutuhan.
- Escalation.

ditentukan berdasarkan Knowledge Base dan instruksi AI.

---

# 4. Pesan Masuk

Ketika calon klien mengirim pesan:

1. WhatsApp menerima pesan.
2. Pesan diteruskan ke webhook.
3. n8n menerima data pesan.
4. n8n mengidentifikasi percakapan.
5. n8n mengambil konteks percakapan.
6. n8n mengambil Knowledge Base yang diperlukan.
7. n8n mengirim konteks kepada AI.

---

# 5. Identitas Percakapan

Setiap percakapan harus memiliki identitas yang dapat digunakan untuk mempertahankan konteks.

Minimal diperlukan:

- ID percakapan.
- Nomor WhatsApp.
- Waktu pesan.
- Isi pesan.
- Riwayat percakapan yang relevan.

---

# 6. Context Management

AI harus menerima konteks yang diperlukan agar tidak mengulang pertanyaan.

Konteks dapat mencakup:

- Pesan sebelumnya.
- Informasi calon klien.
- Masalah yang telah disebutkan.
- Kebutuhan yang telah diketahui.
- Layanan yang telah dibahas.
- Status escalation.

n8n bertugas mengambil dan meneruskan konteks tersebut kepada AI.

---

# 7. Knowledge Base

Knowledge Base AutoMora terdiri dari:

01 — Company Profile
02 — Brand Guideline
03 — Services
04 — Product Knowledge
05 — Business Problems
06 — Recommendation Engine
07 — Conversation Flow
08 — Escalation Rules
09 — FAQ
10 — AI Personality
11 — Prompt System
12 — n8n Workflow

AI harus menggunakan dokumen yang relevan terhadap percakapan.

---

# 8. Pemrosesan AI

n8n mengirimkan kepada AI:

- Instruksi sistem.
- Knowledge Base yang diperlukan.
- Riwayat percakapan.
- Pesan terbaru calon klien.

AI kemudian menghasilkan respons.

---

# 9. Respons AI

Respons AI harus dikembalikan ke n8n.

n8n kemudian meneruskan respons kepada WhatsApp.

Calon klien menerima respons seolah-olah sedang berkomunikasi dengan AutoMora.

---

# 10. Status Percakapan

Percakapan dapat memiliki status:

### ACTIVE_AI

AI masih menangani percakapan.

### NEEDS_CONSULTANT

Kebutuhan membutuhkan Business Consultant.

### WAITING_CONSULTANT

Percakapan telah diteruskan kepada tim dan menunggu penanganan.

### HUMAN_ACTIVE

Business Consultant sedang menangani percakapan.

### CLOSED

Percakapan selesai.

---

# 11. Escalation Workflow

Jika AI menentukan escalation diperlukan:

AI
↓
Menentukan alasan escalation
↓
Membuat ringkasan
↓
Mengubah status menjadi NEEDS_CONSULTANT
↓
Meneruskan informasi kepada tim AutoMora
↓
Menunggu Business Consultant

---

# 12. Ringkasan Escalation

Ringkasan harus mencakup:

Nama:
Nama usaha/perusahaan:
Bidang usaha:

Masalah:
Proses saat ini:
Dampak:
Kebutuhan:

Solusi yang direkomendasikan:

Alasan escalation:

Informasi tambahan:

---

# 13. Human Handoff

Ketika Business Consultant mengambil alih:

Status percakapan berubah menjadi:

HUMAN_ACTIVE

AI tidak boleh mengirim respons otomatis yang bertentangan dengan percakapan Business Consultant.

---

# 14. Kembali ke AI

Jika percakapan dikembalikan kepada AI oleh sistem atau Business Consultant, AI dapat kembali menangani percakapan berdasarkan status dan konteks terbaru.

AI harus mempertahankan konteks percakapan.

---

# 15. Error Handling

Jika AI gagal memberikan respons:

n8n tidak boleh mengirim pesan kosong kepada calon klien.

Gunakan pesan fallback yang natural:

> Maaf, kami sedang mengalami kendala dalam memproses pesan Anda.
>
> Kami akan membantu melanjutkan percakapan sesegera mungkin.

Jika memungkinkan, arahkan kepada tim AutoMora.

---

# 16. Knowledge Base Tidak Tersedia

Jika Knowledge Base gagal dimuat:

AI tidak boleh mengarang informasi.

n8n harus mencatat error dan, jika memungkinkan, meneruskan percakapan kepada Business Consultant.

---

# 17. AI Tidak Mengetahui Jawaban

Jika AI tidak memiliki informasi yang diperlukan:

AI harus mengikuti Escalation Rules.

Jangan membuat jawaban berdasarkan asumsi.

---

# 18. Logging

Sistem harus menyimpan informasi yang diperlukan untuk:

- Riwayat percakapan.
- Status percakapan.
- Hasil analisis.
- Rekomendasi.
- Escalation.
- Error.

Logging tidak boleh menyimpan informasi yang tidak diperlukan.

---

# 19. Keamanan

Data percakapan harus diperlakukan sebagai informasi bisnis yang perlu dijaga.

n8n tidak boleh membagikan data percakapan kepada pihak yang tidak memiliki kewenangan.

Knowledge Base internal tidak boleh dikirim kepada calon klien.

---

# 20. Prinsip Workflow

n8n mengatur proses.

AI memahami dan menganalisis percakapan.

Knowledge Base memberikan pengetahuan AutoMora.

Business Consultant menangani kebutuhan yang membutuhkan manusia.

---

# 21. Alur Utama

Pesan Masuk
↓
Webhook
↓
Identifikasi Percakapan
↓
Ambil Context
↓
Ambil Knowledge Base
↓
AI Processing
↓
Decision
├── Continue AI
│      ↓
│   Response
│      ↓
│   WhatsApp
│
└── Escalation
       ↓
   Summary
       ↓
   Business Consultant