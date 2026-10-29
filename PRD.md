# Product Requirements Document (PRD)

# Aksester — Platform SaaS Web Tunnel & Port Tunnel

**Versi dokumen:** 1.0  
**Tanggal:** 21 Oktober 2026  
**Status:** Draft rancangan untuk MVP  
**Nama produk:** Aksester  
**Domain contoh:** `aksester.us` (placeholder; domain dan DNS harus dikonfirmasi sebelum produksi)

------------------------------------------------------------------------

## 1. Ringkasan Produk

Aksester adalah platform SaaS yang memungkinkan pelanggan mempublikasikan layanan yang berjalan pada komputer atau server milik mereka melalui internet, tanpa harus membuka port masuk pada jaringan lokal pelanggan.

Aksester menyediakan dua layanan utama:

1. **Web Tunnel** — memublikasikan layanan HTTP/HTTPS lokal melalui hostname HTTPS, misalnya `tokosaya.aksester.us` atau custom domain pelanggan seperti `app.tokosaya.com`.
2. **Port Tunnel** — meneruskan koneksi TCP/UDP melalui endpoint publik dan port yang dialokasikan Aksester, misalnya `aksester.us:2006`.

Platform memiliki dashboard pelanggan, paket berlangganan, invoice, pencatatan pembayaran, proses aktivasi/suspend otomatis, agent untuk Windows dan Linux, serta dashboard admin.

MVP menggunakan Linux gateway, FRP, Caddy, Node.js/Express, React/Vite, SQLite, dan worker untuk pekerjaan latar belakang. DNS authoritative milik Aksester sendiri tidak diperlukan pada MVP; DNS dapat dikelola melalui provider DNS eksternal.

---

## 2. Visi dan Tujuan

### 2.1 Visi
Menyediakan layanan tunnel yang mudah digunakan, aman, terukur, dan dapat ditagihkan sebagai layanan berlangganan untuk developer, pemilik usaha kecil, teknisi, dan pengguna yang perlu mengakses layanan lokal dari internet.

### 2.2 Tujuan MVP
- Pelanggan dapat membuat akun dan memilih paket.
- Pelanggan dapat mendaftarkan agent pada komputer/server target.
- Pelanggan dapat membuat Web Tunnel ke layanan loopback pada mesin yang sama.
- Pelanggan dapat membuat Port Tunnel TCP dan, jika dukungan teknis serta kebijakan firewall telah tervalidasi, UDP.
- Pelanggan dapat menggunakan subdomain bawaan Aksester.
- Pelanggan paket yang memenuhi syarat dapat menautkan custom domain milik sendiri.
- Sistem dapat memverifikasi DNS dan mengelola sertifikat TLS untuk custom domain.
- Sistem dapat menerbitkan invoice, mencatat pembayaran, dan mengaktifkan atau menangguhkan layanan sesuai status langganan.
- Admin dapat mengelola paket, pengguna, tunnel, domain, job provisioning, dan audit log.

### 2.3 Bukan tujuan MVP
- Menjadi DNS recursive resolver atau authoritative DNS provider penuh.
- Mengelola router MikroTik/PPPoE pelanggan.
- Meneruskan koneksi ke sembarang perangkat LAN.
- Remote shell, remote desktop, atau eksekusi perintah pada komputer pelanggan.
- Multi-region gateway dan failover lintas wilayah.
- Streaming video berbandwidth tinggi atau CDN.
- Membuat tunnel VPN full-device seperti WireGuard komersial.
- Integrasi otomatis dengan semua registrar/DNS provider.
- Jaminan SLA enterprise sebelum infrastruktur dan observability siap.

---

## 3. Persona dan Kebutuhan Pengguna

### 3.1 Pengguna Free
Ingin menguji layanan atau memublikasikan aplikasi kecil dengan biaya nol. Membutuhkan subdomain Aksester dan kuota terbatas.

### 3.2 Pengguna Personal/Developer
Membutuhkan URL HTTPS untuk development, demo, webhook testing, dashboard perangkat, atau aplikasi pribadi.

### 3.3 Pemilik Usaha
Memiliki domain sendiri dan ingin memublikasikan aplikasi lokal, panel administrasi, atau website dari server miliknya.

### 3.4 Administrator Aksester
Mengelola paket, kuota, pengguna, penyalahgunaan, pembayaran, gateway, dan status provisioning.

---

## 4. Ruang Lingkup Produk

### 4.1 Web Tunnel
- Memublikasikan layanan HTTP lokal.
- Endpoint bawaan: `<slug>.aksester.us`.
- Target MVP dibatasi ke `127.0.0.1` atau loopback IPv4/IPv6 pada mesin tempat agent berjalan.
- Port target dikonfigurasi pelanggan, misalnya `80`, `3000`, atau `8080`.
- HTTPS diterminasi di public gateway menggunakan Caddy atau reverse proxy setara.
- Routing hostname diarahkan ke tunnel yang terdaftar.
- Mendukung subdomain dipilih, diedit, dan dicek ketersediaannya.
- Perubahan hostname tidak mengubah identitas internal tunnel, riwayat invoice, atau subscription.
- Custom domain tersedia sesuai entitlement paket.

### 4.2 Port Tunnel
- Endpoint publik berupa hostname gateway dan port publik yang dialokasikan, misalnya `aksester.us:2006`.
- Pemetaan ke target loopback pada mesin agent.
- TCP merupakan prioritas MVP.
- UDP hanya diaktifkan setelah uji end-to-end, dokumentasi protokol, pembatasan abuse, dan pengalokasian port UDP terpisah atau mekanisme yang jelas.
- Port tidak boleh bentrok dengan port layanan internal gateway.
- Rentang port publik ditentukan dalam konfigurasi deployment, bukan hard-coded dalam aplikasi.
- Port Tunnel tidak menjanjikan dukungan semua protokol aplikasi sebelum diuji.

### 4.3 Custom Domain
- Pelanggan dapat menambahkan hostname milik sendiri, misalnya `app.tokosaya.com`.
- Aksester menampilkan instruksi record DNS yang dibutuhkan.
- Kepemilikan diverifikasi dengan TXT token unik sebelum domain aktif.
- Sistem memeriksa konflik domain global; satu hostname hanya dapat dimiliki satu tunnel/akun pada satu waktu.
- Setelah verifikasi, gateway mengarahkan hostname ke Web Tunnel terkait.
- Sertifikat TLS diterbitkan dan diperpanjang otomatis melalui mekanisme ACME yang didukung.
- Status ditampilkan: `pending_dns`, `pending_verification`, `pending_tls`, `active`, `error`, `disabled`.
- Domain yang dilepas harus segera dicabut dari routing dan antrean pembaruan konfigurasi.
- Domain root/apex hanya didukung jika konfigurasi DNS pelanggan menyediakan A/AAAA ke gateway atau fitur ALIAS/ANAME/flattening yang kompatibel. CNAME untuk subdomain lebih sederhana.
- MVP tidak mengubah DNS pelanggan secara otomatis. Integrasi API provider seperti Cloudflare adalah pengembangan lanjutan.

### 4.4 Akun, Paket, Billing
- Registrasi/login dan pengelolaan profil.
- Katalog paket, kuota, harga, durasi, status.
- Subscription dan invoice.
- Catatan pembayaran dan webhook payment gateway.
- Verifikasi signature webhook, idempotensi, dan pencatatan event.
- Masa tenggang pembayaran jika dikonfigurasi.
- Suspend dan resume otomatis berdasarkan status langganan.
- Admin dapat melakukan koreksi dengan audit log.

---

## 5. Model Paket dan Kuota

Harga di bawah adalah rancangan baseline untuk MVP:

| Paket | Harga contoh/bulan | Web Tunnel | Port Tunnel | Agent | Custom Domain |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Free** | Rp0 | 1 | 1 | 1 | Tidak |
| **Basic** | Rp25.000 | 3 | 3 | 2 | Kuota terbatas (1) |
| **Pro** | Rp59.000 | 10 | 10 | 5 | Kuota lebih besar (3) |
| **Business** | Rp149.000 | 30 | 30 | 10 | Kuota lebih besar (10) |

### 5.1 Aturan kuota
- Kuota menghitung tunnel yang dibuat/dialokasikan, bukan hanya tunnel yang sedang online.
- Tunnel berstatus aktif, offline, atau suspended tetap mengonsumsi kuota sampai dihapus atau dibebaskan menurut kebijakan.
- Penghapusan tunnel harus jelas konsekuensinya dan memerlukan konfirmasi jika ada custom domain atau data konfigurasi terkait.
- Kuota agent, custom domain, koneksi bersamaan, bandwidth, dan transfer data adalah batas yang berbeda.
- Jangan menampilkan batas bandwidth sebagai fitur yang berlaku sebelum enforcement teknis benar-benar diterapkan.
- Paket Free dirancang sebagai paket tanpa biaya yang berkelanjutan, kecuali keputusan bisnis selanjutnya menetapkan masa trial.
- Jika kuota berubah pada tengah periode langganan, aturan transisi harus ditentukan: mempertahankan tunnel yang sudah ada, meminta pengurangan, atau menangguhkan tunnel tertentu. Jangan menghapus data otomatis tanpa pemberitahuan.

### 5.2 Konfigurasi paket
Setiap paket setidaknya memiliki:
- `max_web_tunnels`
- `max_port_tunnels`
- `max_agents`
- `max_custom_domains`
- `max_connections` (jika enforcement didukung)
- `bandwidth_limit_mbps` (hanya jika enforcement teruji)
- `monthly_transfer_gb` (opsional, bila pengukuran transfer tersedia)
- `price_amount` dalam integer rupiah
- `billing_period`
- `is_active`
- `features_json` atau tabel fitur terstruktur

Paket harus dikonfigurasi dari database/admin, bukan hard-coded pada frontend.

---

## 6. Arsitektur Teknis

### 6.1 Komponen
- **Frontend:** React + Vite.
- **Backend API:** Node.js + Express.
- **Database MVP:** SQLite dengan foreign keys, WAL, `busy_timeout`, backup, dan migrasi terkontrol.
- **Worker:** proses terpisah atau worker internal yang tahan restart untuk provisioning, expiry, retry, dan sinkronisasi konfigurasi.
- **Tunnel engine:** FRP (`frps` di gateway dan `frpc` di agent), setelah versi, mode autentikasi, dan kemampuan domain routing diuji.
- **Reverse proxy:** Caddy untuk HTTPS otomatis dan routing Web Tunnel.
- **Agent:** aplikasi pengelola FRP untuk Windows dan Linux.
- **DNS:** wildcard record untuk domain bawaan Aksester melalui provider DNS; DNS pelanggan tetap dikelola oleh provider mereka.
- **Payment gateway:** provider yang dipilih kemudian; adapter agar tidak mengikat seluruh billing pada satu provider.
- **Observability:** log terstruktur, metrik kesehatan, alert, dan audit log.

### 6.2 Diagram arsitektur

```text
Browser / Client
      |
      | DNS lookup
      v
DNS provider (Aksester wildcard / DNS pelanggan)
      |
      v
Public Gateway: 80/443
      |
      v
Caddy: TLS + hostname routing
      |
      v
Web routing integration
      |
      v
FRP tunnel path (internal/private)
      |
      v
Aksester Agent (outbound connection)
      |
      v
127.0.0.1:<local_port> pada mesin pelanggan
```

Port Tunnel:

```text
TCP client -> aksester.us:<allocated_port>
           -> FRP gateway mapping
           -> authenticated agent connection
           -> 127.0.0.1:<target_port>
```

### 6.3 Prinsip jaringan
- Hanya port publik yang diperlukan yang dibuka melalui firewall.
- Admin API FRP, dashboard internal, database, dan endpoint routing internal tidak boleh terbuka ke internet.
- Agent membuat koneksi keluar menuju gateway; tidak membutuhkan port masuk dari internet ke jaringan pelanggan.
- Web Tunnel hanya menargetkan loopback mesin yang menjalankan agent pada MVP.
- Port Tunnel juga dibatasi ke loopback untuk mengurangi risiko menjadi relay ke jaringan internal.
- IPv4/IPv6 harus diperlakukan konsisten dan divalidasi untuk mencegah bypass aturan loopback.
- Cegah port allocation race dengan unique constraint dan transaksi database.

---

## 7. DNS dan Domain

### 7.1 Domain bawaan Aksester
- Buat wildcard DNS `*.aksester.us` menuju gateway atau load balancer.
- Domain apex `aksester.us` dapat diarahkan ke halaman utama/dashboard sesuai kebutuhan.
- DNS wildcard hanya membawa request ke gateway; reverse proxy memilih tunnel berdasarkan HTTP Host/SNI dan konfigurasi aplikasi.
- Subdomain slug dinormalisasi ke lowercase dan hanya menerima karakter yang diizinkan.
- Sistem memblokir reserved names seperti `www`, `api`, `admin`, `status`, `mail`, dan nama sistem lainnya.

### 7.2 Custom domain flow
1. Pelanggan memilih Web Tunnel dan memasukkan hostname.
2. Sistem memvalidasi format dan entitlement paket.
3. Sistem membuat token verifikasi acak dengan masa berlaku.
4. Dashboard menampilkan TXT record, misalnya `_aksester-verify.app.tokosaya.com`.
5. Worker memeriksa DNS menggunakan resolver yang dikonfigurasi.
6. Sistem memverifikasi token dan menandai domain terverifikasi.
7. Sistem memeriksa record pengarah (CNAME atau A/AAAA sesuai model).
8. Sistem mengonfigurasi routing dan meminta penerbitan TLS.
9. Pemeriksaan health dilakukan sebelum status `active`.
10. Kegagalan dicatat dan dapat dicoba ulang secara aman.

### 7.3 Keamanan custom domain
- Jangan aktifkan hostname hanya berdasarkan klaim pelanggan.
- Token verifikasi harus acak, memiliki expiry, dan dapat dirotasi.
- Domain yang sama tidak boleh terikat pada dua tenant.
- Perubahan DNS atau domain tidak boleh memungkinkan pelanggan mengakses tunnel tenant lain.
- Setelah domain dihapus, konfigurasi routing harus dicabut.
- Sertifikat dan private key tidak boleh ditampilkan kepada pengguna.
- Terapkan rate limit terhadap permintaan verifikasi dan penerbitan sertifikat.

---

## 8. Agent Pelanggan

### 8.1 Platform
- MVP target: Windows 10/11 x64 dan distro Linux umum dengan systemd.
- Packaging dan auto-update aman menjadi target bertahap; versi pertama dapat menggunakan installer/manual update yang ditandatangani atau checksum terverifikasi.

### 8.2 Pendaftaran agent
1. Pengguna login ke dashboard dan memilih "Tambah Agent".
2. Backend membuat enrollment token sekali pakai dengan masa berlaku pendek.
3. Pengguna memasukkan token pada installer/CLI agent.
4. Agent melakukan enrollment melalui HTTPS.
5. Backend menukar token menjadi kredensial agent jangka panjang yang dapat dicabut/dirotasi.
6. Token enrollment tidak dapat digunakan ulang.
7. Dashboard menampilkan nama, platform, versi, status, dan waktu terakhir terlihat.

### 8.3 Fungsi agent
- Menjaga koneksi keluar ke gateway.
- Menjalankan dan mengawasi FRP client.
- Reconnect otomatis dengan exponential backoff dan jitter.
- Melaporkan heartbeat dan status tunnel.
- Menyediakan service Windows dan systemd Linux.
- Menyimpan kredensial dengan izin file minimum dan tidak menulis rahasia ke log.
- Tidak menyediakan remote shell, arbitrary command execution, atau file browsing jarak jauh.
- Mengizinkan pelanggan menghapus/mencabut agent dari dashboard.
- Memvalidasi konfigurasi yang diterima; tidak menerima perintah shell dari backend.

### 8.4 Health dan status
- Status agent: `pending`, `online`, `offline`, `connecting`, `error`, `revoked`.
- Status tunnel: `draft`, `provisioning`, `active`, `offline`, `suspended`, `error`, `deleting`.

---

## 9. Dashboard Pelanggan

Menu utama:
- Ringkasan
- Web Tunnels
- Port Tunnels
- Custom Domains
- Agents
- Paket dan Langganan
- Invoice dan Pembayaran
- Aktivitas & Audit Log

---

## 10. Dashboard Admin

Fitur utama:
- Ringkasan pengguna, langganan, invoice, pembayaran, dan tunnel.
- CRUD paket serta pengaturan kuota dinamis.
- Pencarian pengguna dan detail akun.
- Suspend/resume akun atau tunnel dengan alasan wajib.
- Kelola domain, hostname, port allocation, dan gateway.
- Daftar provisioning jobs, jumlah retry, error terakhir, dan tombol retry aman.
- Riwayat webhook pembayaran dan hasil verifikasi signature HMAC SHA-256.
- Audit log aktivitas admin dan pelanggan dengan data tersanitasi.

---

## 11. Billing dan Siklus Langganan

### 11.1 Entitas
- Plan
- Subscription
- Invoice
- Payment
- Payment event / webhook
- Grace period policy
- Provisioning job

### 11.2 Siklus pembayaran
1. Pelanggan memilih paket.
2. Backend membuat invoice dengan nomor unik dan nominal integer rupiah.
3. Backend meminta instruksi pembayaran kepada payment gateway (QRIS / Virtual Account).
4. Webhook masuk ke endpoint yang memverifikasi signature.
5. Event dicatat secara idempotent menggunakan ID event/provider transaction ID.
6. Jika pembayaran terverifikasi sukses, transaksi database memperbarui payment, invoice, dan subscription.
7. Worker mengantrekan provisioning/resume secara idempotent.
8. Dashboard menunjukkan status pembayaran dan layanan.
9. Jika invoice jatuh tempo, sistem menerapkan grace period lalu menangguhkan layanan sesuai kebijakan.
10. Setelah pembayaran/pembaruan valid, sistem melakukan resume dan health check.

---

## 12. Model Data SQLite (PRD 13)

### `users`
- `id` (primary key)
- `email` (unique)
- `password_hash`
- `name`
- `role` (`customer`, `admin`)
- `status` (`active`, `suspended`)
- `created_at`, `updated_at`

### `plans`
- `id`
- `code` (unique)
- `name`
- `price_amount` (integer rupiah)
- `billing_period`
- `max_web_tunnels`
- `max_port_tunnels`
- `max_agents`
- `max_custom_domains`
- `max_connections`
- `bandwidth_limit_mbps`
- `monthly_transfer_gb`
- `is_active`
- `created_at`, `updated_at`

### `subscriptions`
- `id`
- `user_id`
- `plan_id`
- `status` (`active`, `pending_payment`, `past_due`, `suspended`, `cancelled`)
- `current_period_start`, `current_period_end`
- `grace_period_end`
- `cancel_at_period_end`
- `created_at`, `updated_at`

### `invoices`
- `id`
- `user_id`
- `subscription_id`
- `invoice_number` (unique)
- `amount` (integer rupiah)
- `currency` (`IDR`)
- `status` (`paid`, `unpaid`, `overdue`)
- `due_at`, `paid_at`
- `created_at`, `updated_at`

### `payments`
- `id`
- `invoice_id`
- `provider`
- `provider_transaction_id`
- `amount`
- `status`
- `paid_at`

### `payment_events`
- `id`
- `provider`
- `provider_event_id`
- `payload_redacted`
- `signature_valid`
- `processed_at`
- `created_at`

### `agents`
- `id`
- `user_id`
- `name`
- `platform` (`windows`, `linux`)
- `agent_version`
- `credential_hash`
- `status` (`online`, `offline`, `revoked`)
- `last_seen_at`
- `created_at`

### `agent_enrollment_tokens`
- `id`
- `user_id`
- `token_hash`
- `expires_at`
- `used_at`

### `tunnels`
- `id`
- `user_id`
- `agent_id`
- `type` (`web`, `port`)
- `name`
- `status` (`active`, `offline`, `suspended`, `error`)
- `local_host` (`127.0.0.1` loopback strictly enforced)
- `local_port`
- `protocol` (`http`, `tcp`, `udp`)
- `subdomain` (nullable, unique for web)
- `public_port` (nullable, unique for port)
- `created_at`, `updated_at`

### `custom_domains`
- `id`
- `user_id`
- `tunnel_id`
- `hostname` (unique)
- `verification_token`
- `status` (`pending_dns`, `pending_verification`, `pending_tls`, `active`, `error`, `disabled`)
- `tls_status`
- `routing_status`

### `provisioning_jobs`
- `id`
- `job_type`
- `resource_type`
- `resource_id`
- `payload_json`
- `status` (`completed`, `pending`, `failed`, `retrying`)
- `attempts`

### `audit_logs`
- `id`
- `actor_user_id`
- `action`
- `resource_type`
- `resource_id`
- `ip_redacted`
- `metadata_redacted`
- `created_at`

---
**Akhir dokumen PRD Aksester v1.0**
