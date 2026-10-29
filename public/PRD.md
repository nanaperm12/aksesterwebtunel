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
- **Tunnel engine:** FRP (`frps` di gateway dan `frpc` di agent).
- **Reverse proxy:** Caddy untuk HTTPS otomatis dan routing Web Tunnel.
- **Agent:** aplikasi pengelola FRP untuk Windows dan Linux.
- **DNS:** wildcard record untuk domain bawaan Aksester melalui provider DNS; DNS pelanggan tetap dikelola oleh provider mereka.
- **Payment gateway:** adapter terisolasi.
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

---

## 7. Model Data SQLite (PRD 13)

### `users`
- `id`, `email`, `password_hash`, `name`, `role`, `status`, `created_at`, `updated_at`

### `plans`
- `id`, `code`, `name`, `price_amount`, `max_web_tunnels`, `max_port_tunnels`, `max_agents`, `max_custom_domains`, `is_active`

### `subscriptions`
- `id`, `user_id`, `plan_id`, `status`, `current_period_start`, `current_period_end`

### `invoices`
- `id`, `user_id`, `subscription_id`, `invoice_number`, `amount`, `status`, `due_at`, `paid_at`

### `payments` & `payment_events`
- `id`, `invoice_id`, `provider`, `amount`, `signature_valid`, `status`

### `agents` & `agent_enrollment_tokens`
- `id`, `user_id`, `name`, `platform`, `agent_version`, `status`, `last_seen_at`

### `tunnels`
- `id`, `user_id`, `agent_id`, `type`, `name`, `status`, `local_host`, `local_port`, `protocol`, `subdomain`, `public_port`

### `custom_domains`
- `id`, `user_id`, `tunnel_id`, `hostname`, `verification_token`, `status`, `tls_status`

### `provisioning_jobs`
- `id`, `job_type`, `resource_type`, `resource_id`, `status`, `attempts`

### `audit_logs`
- `id`, `actor_user_id`, `action`, `resource_type`, `resource_id`, `ip_redacted`, `created_at`

---
**Akhir dokumen PRD Aksester v1.0**
