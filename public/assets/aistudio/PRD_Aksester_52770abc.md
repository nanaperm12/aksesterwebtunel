# Product Requirements Document (PRD)

# Aksester --- Platform SaaS Web Tunnel & Port Tunnel

**Versi dokumen:** 1.0\
**Tanggal:** 21 Oktober 2026\
**Status:** Draft rancangan untuk MVP\
**Nama produk:** Aksester\
**Domain contoh:** `aksester.us` (placeholder; domain dan DNS harus
dikonfirmasi sebelum produksi)

------------------------------------------------------------------------

## 1. Ringkasan Produk

Aksester adalah platform SaaS yang memungkinkan pelanggan
mempublikasikan layanan yang berjalan pada komputer atau server milik
mereka melalui internet, tanpa harus membuka port masuk pada jaringan
lokal pelanggan.

Aksester menyediakan dua layanan utama:

1.  **Web Tunnel** --- memublikasikan layanan HTTP/HTTPS lokal melalui
    hostname HTTPS, misalnya `tokosaya.aksester.us` atau custom domain
    pelanggan seperti `app.tokosaya.com`.
2.  **Port Tunnel** --- meneruskan koneksi TCP/UDP melalui endpoint
    publik dan port yang dialokasikan Aksester, misalnya
    `aksester.us:2006`.

Platform memiliki dashboard pelanggan, paket berlangganan, invoice,
pencatatan pembayaran, proses aktivasi/suspend otomatis, agent untuk
Windows dan Linux, serta dashboard admin.

MVP menggunakan Linux gateway, FRP, Caddy, Node.js/Express, React/Vite,
SQLite, dan worker untuk pekerjaan latar belakang. DNS authoritative
milik Aksester sendiri tidak diperlukan pada MVP; DNS dapat dikelola
melalui provider DNS eksternal.

## 2. Visi dan Tujuan

### 2.1 Visi

Menyediakan layanan tunnel yang mudah digunakan, aman, terukur, dan
dapat ditagihkan sebagai layanan berlangganan untuk developer, pemilik
usaha kecil, teknisi, dan pengguna yang perlu mengakses layanan lokal
dari internet.

### 2.2 Tujuan MVP

-   Pelanggan dapat membuat akun dan memilih paket.
-   Pelanggan dapat mendaftarkan agent pada komputer/server target.
-   Pelanggan dapat membuat Web Tunnel ke layanan loopback pada mesin
    yang sama.
-   Pelanggan dapat membuat Port Tunnel TCP dan, jika dukungan teknis
    serta kebijakan firewall telah tervalidasi, UDP.
-   Pelanggan dapat menggunakan subdomain bawaan Aksester.
-   Pelanggan paket yang memenuhi syarat dapat menautkan custom domain
    milik sendiri.
-   Sistem dapat memverifikasi DNS dan mengelola sertifikat TLS untuk
    custom domain.
-   Sistem dapat menerbitkan invoice, mencatat pembayaran, dan
    mengaktifkan atau menangguhkan layanan sesuai status langganan.
-   Admin dapat mengelola paket, pengguna, tunnel, domain, job
    provisioning, dan audit log.

### 2.3 Bukan tujuan MVP

-   Menjadi DNS recursive resolver atau authoritative DNS provider
    penuh.
-   Mengelola router MikroTik/PPPoE pelanggan.
-   Meneruskan koneksi ke sembarang perangkat LAN.
-   Remote shell, remote desktop, atau eksekusi perintah pada komputer
    pelanggan.
-   Multi-region gateway dan failover lintas wilayah.
-   Streaming video berbandwidth tinggi atau CDN.
-   Membuat tunnel VPN full-device seperti WireGuard komersial.
-   Integrasi otomatis dengan semua registrar/DNS provider.
-   Jaminan SLA enterprise sebelum infrastruktur dan observability siap.

## 3. Persona dan Kebutuhan Pengguna

### 3.1 Pengguna Free

Ingin menguji layanan atau memublikasikan aplikasi kecil dengan biaya
nol. Membutuhkan subdomain Aksester dan kuota terbatas.

### 3.2 Pengguna Personal/Developer

Membutuhkan URL HTTPS untuk development, demo, webhook testing,
dashboard perangkat, atau aplikasi pribadi.

### 3.3 Pemilik Usaha

Memiliki domain sendiri dan ingin memublikasikan aplikasi lokal, panel
administrasi, atau website dari server miliknya.

### 3.4 Administrator Aksester

Mengelola paket, kuota, pengguna, penyalahgunaan, pembayaran, gateway,
dan status provisioning.

## 4. Ruang Lingkup Produk

### 4.1 Web Tunnel

-   Memublikasikan layanan HTTP lokal.
-   Endpoint bawaan: `<slug>.aksester.us`.
-   Target MVP dibatasi ke `127.0.0.1` atau loopback IPv4/IPv6 pada
    mesin tempat agent berjalan.
-   Port target dikonfigurasi pelanggan, misalnya `80`, `3000`, atau
    `8080`.
-   HTTPS diterminasi di public gateway menggunakan Caddy atau reverse
    proxy setara.
-   Routing hostname diarahkan ke tunnel yang terdaftar.
-   Mendukung subdomain dipilih, diedit, dan dicek ketersediaannya.
-   Perubahan hostname tidak mengubah identitas internal tunnel, riwayat
    invoice, atau subscription.
-   Custom domain tersedia sesuai entitlement paket.

### 4.2 Port Tunnel

-   Endpoint publik berupa hostname gateway dan port publik yang
    dialokasikan, misalnya `aksester.us:2006`.
-   Pemetaan ke target loopback pada mesin agent.
-   TCP merupakan prioritas MVP.
-   UDP hanya diaktifkan setelah uji end-to-end, dokumentasi protokol,
    pembatasan abuse, dan pengalokasian port UDP terpisah atau mekanisme
    yang jelas.
-   Port tidak boleh bentrok dengan port layanan internal gateway.
-   Rentang port publik ditentukan dalam konfigurasi deployment, bukan
    hard-coded dalam aplikasi.
-   Port Tunnel tidak menjanjikan dukungan semua protokol aplikasi
    sebelum diuji.

### 4.3 Custom Domain

-   Pelanggan dapat menambahkan hostname milik sendiri, misalnya
    `app.tokosaya.com`.
-   Aksester menampilkan instruksi record DNS yang dibutuhkan.
-   Kepemilikan diverifikasi dengan TXT token unik sebelum domain aktif.
-   Sistem memeriksa konflik domain global; satu hostname hanya dapat
    dimiliki satu tunnel/akun pada satu waktu.
-   Setelah verifikasi, gateway mengarahkan hostname ke Web Tunnel
    terkait.
-   Sertifikat TLS diterbitkan dan diperpanjang otomatis melalui
    mekanisme ACME yang didukung.
-   Status ditampilkan: `pending_dns`, `pending_verification`,
    `pending_tls`, `active`, `error`, `disabled`.
-   Domain yang dilepas harus segera dicabut dari routing dan antrean
    pembaruan konfigurasi.
-   Domain root/apex hanya didukung jika konfigurasi DNS pelanggan
    menyediakan A/AAAA ke gateway atau fitur ALIAS/ANAME/flattening yang
    kompatibel. CNAME untuk subdomain lebih sederhana.
-   MVP tidak mengubah DNS pelanggan secara otomatis. Integrasi API
    provider seperti Cloudflare adalah pengembangan lanjutan.

### 4.4 Akun, Paket, Billing

-   Registrasi/login dan pengelolaan profil.
-   Katalog paket, kuota, harga, durasi, status.
-   Subscription dan invoice.
-   Catatan pembayaran dan webhook payment gateway.
-   Verifikasi signature webhook, idempotensi, dan pencatatan event.
-   Masa tenggang pembayaran jika dikonfigurasi.
-   Suspend dan resume otomatis berdasarkan status langganan.
-   Admin dapat melakukan koreksi dengan audit log.

## 5. Model Paket dan Kuota

Harga di bawah hanya contoh untuk simulasi bisnis, bukan harga final.
Harga final harus ditetapkan setelah mengukur biaya bandwidth, IP
publik, CPU, penyimpanan log, biaya payment gateway, dan dukungan
pelanggan.

  ---------------------------------------------------------------------------
  Paket               Harga   Web Tunnel  Port Tunnel        Agent Custom
               contoh/bulan                                        Domain
  ---------- -------------- ------------ ------------ ------------ ----------
  Free                  Rp0            1            1            1 Tidak

  Basic            Rp25.000            3            3            2 Kuota
                                                                   terbatas

  Pro              Rp59.000           10           10            5 Kuota
                                                                   lebih
                                                                   besar

  Business        Rp149.000           30           30           10 Kuota
                                                                   lebih
                                                                   besar
  ---------------------------------------------------------------------------

### 5.1 Aturan kuota

-   Kuota menghitung tunnel yang dibuat/dialokasikan, bukan hanya tunnel
    yang sedang online.
-   Tunnel berstatus aktif, offline, atau suspended tetap mengonsumsi
    kuota sampai dihapus atau dibebaskan menurut kebijakan.
-   Penghapusan tunnel harus jelas konsekuensinya dan memerlukan
    konfirmasi jika ada custom domain atau data konfigurasi terkait.
-   Kuota agent, custom domain, koneksi bersamaan, bandwidth, dan
    transfer data adalah batas yang berbeda.
-   Jangan menampilkan batas bandwidth sebagai fitur yang berlaku
    sebelum enforcement teknis benar-benar diterapkan.
-   Paket Free dirancang sebagai paket tanpa biaya yang berkelanjutan,
    kecuali keputusan bisnis selanjutnya menetapkan masa trial.
    Kebijakan penggunaan wajar dan batas sumber daya tetap diperlukan.
-   Jika kuota berubah pada tengah periode langganan, aturan transisi
    harus ditentukan: mempertahankan tunnel yang sudah ada, meminta
    pengurangan, atau menangguhkan tunnel tertentu. Jangan menghapus
    data otomatis tanpa pemberitahuan.

### 5.2 Konfigurasi paket

Setiap paket setidaknya memiliki: - `max_web_tunnels` -
`max_port_tunnels` - `max_agents` - `max_custom_domains` -
`max_connections` (jika enforcement didukung) - `bandwidth_limit_mbps`
(hanya jika enforcement teruji) - `monthly_transfer_gb` (opsional, bila
pengukuran transfer tersedia) - `price_amount` dalam integer rupiah -
`billing_period` - `is_active` - `features_json` atau tabel fitur
terstruktur

Paket harus dikonfigurasi dari database/admin, bukan hard-coded pada
frontend.

## 6. Arsitektur Teknis

### 6.1 Komponen

-   **Frontend:** React + Vite.
-   **Backend API:** Node.js + Express.
-   **Database MVP:** SQLite dengan foreign keys, WAL, `busy_timeout`,
    backup, dan migrasi terkontrol.
-   **Worker:** proses terpisah atau worker internal yang tahan restart
    untuk provisioning, expiry, retry, dan sinkronisasi konfigurasi.
-   **Tunnel engine:** FRP (`frps` di gateway dan `frpc` di agent),
    setelah versi, mode autentikasi, dan kemampuan domain routing diuji.
-   **Reverse proxy:** Caddy untuk HTTPS otomatis dan routing Web
    Tunnel.
-   **Agent:** aplikasi pengelola FRP untuk Windows dan Linux.
-   **DNS:** wildcard record untuk domain bawaan Aksester melalui
    provider DNS; DNS pelanggan tetap dikelola oleh provider mereka.
-   **Payment gateway:** provider yang dipilih kemudian; adapter agar
    tidak mengikat seluruh billing pada satu provider.
-   **Observability:** log terstruktur, metrik kesehatan, alert, dan
    audit log.

### 6.2 Diagram arsitektur

``` text
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

``` text
TCP client -> aksester.us:<allocated_port>
           -> FRP gateway mapping
           -> authenticated agent connection
           -> 127.0.0.1:<target_port>
```

Diagram tersebut adalah target arsitektur logis. Integrasi Caddy--FRP
untuk HTTP host routing wajib dibuktikan dengan proof-of-concept sebelum
produksi. Pilih satu pola yang konsisten, misalnya FRP HTTP virtual-host
routing dengan Caddy sebagai terminasi TLS/proxy ke endpoint internal
yang tidak dapat diakses publik, atau integrasi layer-4/proxy lain yang
diuji. Jangan menganggap konfigurasi berjalan hanya karena komponen
telah dipilih.

### 6.3 Prinsip jaringan

-   Hanya port publik yang diperlukan yang dibuka melalui firewall.
-   Admin API FRP, dashboard internal, database, dan endpoint routing
    internal tidak boleh terbuka ke internet.
-   Agent membuat koneksi keluar menuju gateway; tidak membutuhkan port
    masuk dari internet ke jaringan pelanggan.
-   Web Tunnel hanya menargetkan loopback mesin yang menjalankan agent
    pada MVP.
-   Port Tunnel juga dibatasi ke loopback untuk mengurangi risiko
    menjadi relay ke jaringan internal.
-   IPv4/IPv6 harus diperlakukan konsisten dan divalidasi untuk mencegah
    bypass aturan loopback.
-   Cegah port allocation race dengan unique constraint dan transaksi
    database.

## 7. DNS dan Domain

### 7.1 Domain bawaan Aksester

-   Buat wildcard DNS `*.aksester.us` menuju gateway atau load balancer.
-   Domain apex `aksester.us` dapat diarahkan ke halaman utama/dashboard
    sesuai kebutuhan.
-   DNS wildcard hanya membawa request ke gateway; reverse proxy memilih
    tunnel berdasarkan HTTP Host/SNI dan konfigurasi aplikasi.
-   Subdomain slug dinormalisasi ke lowercase dan hanya menerima
    karakter yang diizinkan.
-   Sistem memblokir reserved names seperti `www`, `api`, `admin`,
    `status`, `mail`, dan nama sistem lainnya.

### 7.2 Custom domain flow

1.  Pelanggan memilih Web Tunnel dan memasukkan hostname.
2.  Sistem memvalidasi format dan entitlement paket.
3.  Sistem membuat token verifikasi acak dengan masa berlaku.
4.  Dashboard menampilkan TXT record, misalnya
    `_aksester-verify.app.tokosaya.com`.
5.  Worker memeriksa DNS menggunakan resolver yang dikonfigurasi.
6.  Sistem memverifikasi token dan menandai domain terverifikasi.
7.  Sistem memeriksa record pengarah (CNAME atau A/AAAA sesuai model).
8.  Sistem mengonfigurasi routing dan meminta penerbitan TLS.
9.  Pemeriksaan health dilakukan sebelum status `active`.
10. Kegagalan dicatat dan dapat dicoba ulang secara aman.

### 7.3 Keamanan custom domain

-   Jangan aktifkan hostname hanya berdasarkan klaim pelanggan.
-   Token verifikasi harus acak, memiliki expiry, dan dapat dirotasi.
-   Domain yang sama tidak boleh terikat pada dua tenant.
-   Perubahan DNS atau domain tidak boleh memungkinkan pelanggan
    mengakses tunnel tenant lain.
-   Setelah domain dihapus, konfigurasi routing harus dicabut.
-   Sertifikat dan private key tidak boleh ditampilkan kepada pengguna.
-   Terapkan rate limit terhadap permintaan verifikasi dan penerbitan
    sertifikat.
-   Untuk Cloudflare proxy/orange-cloud atau provider serupa,
    dokumentasikan mode DNS yang didukung dan validasi alur TLS
    end-to-end.

## 8. Agent Pelanggan

### 8.1 Platform

-   MVP target: Windows 10/11 x64 dan distro Linux umum dengan systemd.
-   Packaging dan auto-update aman menjadi target bertahap; versi
    pertama dapat menggunakan installer/manual update yang
    ditandatangani atau checksum terverifikasi.

### 8.2 Pendaftaran agent

1.  Pengguna login ke dashboard dan memilih "Tambah Agent".
2.  Backend membuat enrollment token sekali pakai dengan masa berlaku
    pendek.
3.  Pengguna memasukkan token pada installer/CLI agent.
4.  Agent melakukan enrollment melalui HTTPS.
5.  Backend menukar token menjadi kredensial agent jangka panjang yang
    dapat dicabut/dirotasi.
6.  Token enrollment tidak dapat digunakan ulang.
7.  Dashboard menampilkan nama, platform, versi, status, dan waktu
    terakhir terlihat.

### 8.3 Fungsi agent

-   Menjaga koneksi keluar ke gateway.
-   Menjalankan dan mengawasi FRP client.
-   Reconnect otomatis dengan exponential backoff dan jitter.
-   Melaporkan heartbeat dan status tunnel.
-   Menyediakan service Windows dan systemd Linux.
-   Menyimpan kredensial dengan izin file minimum dan tidak menulis
    rahasia ke log.
-   Tidak menyediakan remote shell, arbitrary command execution, atau
    file browsing jarak jauh.
-   Mengizinkan pelanggan menghapus/mencabut agent dari dashboard.
-   Memvalidasi konfigurasi yang diterima; tidak menerima perintah shell
    dari backend.

### 8.4 Health dan status

Status agent: `pending`, `online`, `offline`, `connecting`, `error`,
`revoked`.

Status tunnel: `draft`, `provisioning`, `active`, `offline`,
`suspended`, `error`, `deleting`.

Heartbeat timeout harus dikonfigurasi. Status `online` berarti agent
terhubung, bukan bukti bahwa aplikasi lokal pasti sehat; health check
HTTP/TCP harus dipisahkan bila diterapkan.

## 9. Dashboard Pelanggan

Menu utama: - Ringkasan - Paket dan Langganan - Invoice dan Pembayaran -
Agents - Web Tunnels - Port Tunnels - Custom Domains - Aktivitas -
Profil dan keamanan

### 9.1 Ringkasan

Menampilkan paket aktif, sisa kuota, tunnel online/offline, status
langganan, invoice jatuh tempo, serta notifikasi penting.

### 9.2 Web Tunnel

-   Buat tunnel: pilih agent, nama, subdomain, target loopback, port
    lokal.
-   Cek ketersediaan subdomain secara real-time dan tetap memvalidasi
    ulang saat submit.
-   Edit nama, subdomain, dan port target.
-   Tampilkan URL HTTPS, status provisioning, status agent, dan waktu
    update.
-   Hapus dengan konfirmasi.
-   Hostname tidak menjadi primary key tunnel.

### 9.3 Port Tunnel

-   Buat tunnel: pilih agent, protokol yang tersedia, port target
    loopback.
-   Sistem mengalokasikan port publik secara atomik.
-   Port publik tidak dapat dipilih sembarang jika dapat menyebabkan
    konflik atau penyalahgunaan.
-   Tampilkan endpoint, protokol, target port lokal, dan status.
-   Perubahan alokasi port harus melewati provisioning dan validasi
    konflik.

### 9.4 Custom Domain

-   Tambah hostname.
-   Pilih tunnel Web.
-   Tampilkan record TXT dan CNAME/A yang dibutuhkan.
-   Tombol "Periksa DNS".
-   Tampilkan status verifikasi, DNS, TLS, dan routing.
-   Tombol retry untuk error yang aman dicoba ulang.
-   Hapus domain dengan konfirmasi dan pencabutan routing.

## 10. Dashboard Admin

Fitur: - Ringkasan pengguna, langganan, invoice, pembayaran, dan
tunnel. - CRUD paket serta pengaturan kuota. - Pencarian pengguna dan
detail akun. - Suspend/resume akun atau tunnel dengan alasan. - Kelola
domain, hostname, port allocation, dan gateway. - Daftar provisioning
jobs, jumlah retry, error terakhir, dan tombol retry aman. - Riwayat
webhook pembayaran dan hasil verifikasi signature. - Audit log aktivitas
admin dan pelanggan. - Pengaturan maintenance mode dan status layanan. -
Tindakan admin sensitif harus meminta konfirmasi dan menulis audit log.

Tidak boleh ada fitur admin yang mengeksekusi arbitrary shell command
dari browser.

## 11. Billing dan Siklus Langganan

### 11.1 Entitas

-   Plan
-   Subscription
-   Invoice
-   Payment
-   Payment event/webhook
-   Grace period policy
-   Provisioning job

### 11.2 Siklus pembayaran

1.  Pelanggan memilih paket.
2.  Backend membuat invoice dengan nomor unik dan nominal integer
    rupiah.
3.  Backend meminta instruksi pembayaran kepada payment gateway.
4.  Webhook masuk ke endpoint yang memverifikasi signature sesuai
    spesifikasi provider.
5.  Event dicatat secara idempotent menggunakan ID event/provider
    transaction ID.
6.  Jika pembayaran terverifikasi sukses, transaksi database memperbarui
    payment, invoice, dan subscription.
7.  Worker mengantrekan provisioning/resume secara idempotent.
8.  Dashboard menunjukkan status pembayaran dan layanan.
9.  Jika invoice jatuh tempo, sistem menerapkan grace period lalu
    menangguhkan layanan sesuai kebijakan.
10. Setelah pembayaran/pembaruan valid, sistem melakukan resume dan
    health check.

### 11.3 Aturan penting

-   Jangan mengaktifkan layanan hanya dari redirect browser setelah
    pembayaran.
-   Webhook harus diverifikasi secara kriptografis.
-   Tangani webhook duplikat, tidak berurutan, dan retry.
-   Simpan raw event yang diperlukan untuk audit dengan redaksi data
    sensitif.
-   Jangan menyimpan data kartu pembayaran.
-   Perubahan paket/prorata/refund harus ditentukan dalam kebijakan
    billing terpisah.
-   Semua timestamp disimpan UTC; UI menampilkan zona waktu
    pengguna/Indonesia sesuai kebutuhan.
-   Nilai uang disimpan sebagai integer rupiah, bukan floating point.

## 12. Status dan State Machine

### 12.1 Subscription

`pending_payment -> active -> past_due -> suspended -> active`\
Juga dapat berakhir sebagai `cancelled` atau `expired`.

Transisi harus memiliki aturan eksplisit dan tidak hanya mengandalkan
tampilan frontend.

### 12.2 Tunnel

`draft -> provisioning -> active -> suspended -> active`\
Jalur kegagalan: `provisioning -> error`; penghapusan:
`active/suspended/error -> deleting -> deleted`.

### 12.3 Custom domain

`pending_dns -> pending_verification -> pending_tls -> active`;
kegagalan dapat menjadi `error`. Domain yang dihapus harus keluar dari
routing meskipun cleanup sertifikat atau konfigurasi mengalami retry.

## 13. Model Data SQLite

Skema konseptual minimum:

### `users`

-   `id` (UUID/ULID, primary key)
-   `email` (unique)
-   `password_hash`
-   `name`
-   `role` (`customer`, `admin`)
-   `status`
-   `created_at`, `updated_at`

### `plans`

-   `id`
-   `code` (unique)
-   `name`
-   `price_amount`
-   `billing_period`
-   `max_web_tunnels`
-   `max_port_tunnels`
-   `max_agents`
-   `max_custom_domains`
-   `max_connections` (nullable jika belum ditegakkan)
-   `bandwidth_limit_mbps` (nullable jika belum ditegakkan)
-   `monthly_transfer_gb` (nullable jika belum ditegakkan)
-   `is_active`
-   `created_at`, `updated_at`

### `subscriptions`

-   `id`
-   `user_id`
-   `plan_id`
-   `status`
-   `current_period_start`, `current_period_end`
-   `grace_period_end`
-   `cancel_at_period_end`
-   `created_at`, `updated_at`

### `invoices`

-   `id`
-   `user_id`
-   `subscription_id`
-   `invoice_number` (unique)
-   `amount`
-   `currency`
-   `status`
-   `due_at`, `paid_at`
-   `created_at`, `updated_at`

### `payments`

-   `id`
-   `invoice_id`
-   `provider`
-   `provider_transaction_id`
-   `amount`
-   `status`
-   `paid_at`
-   `created_at`, `updated_at`
-   Unique constraint pada identifier transaksi provider yang sesuai.

### `payment_events`

-   `id`
-   `provider`
-   `provider_event_id`
-   `payload_redacted`
-   `signature_valid`
-   `processed_at`
-   `created_at`
-   Unique constraint pada kombinasi provider dan event ID jika provider
    menyediakan ID stabil.

### `agents`

-   `id`
-   `user_id`
-   `name`
-   `platform`
-   `agent_version`
-   `credential_hash` atau mekanisme penyimpanan secret yang aman
-   `status`
-   `last_seen_at`
-   `revoked_at`
-   `created_at`, `updated_at`

### `agent_enrollment_tokens`

-   `id`
-   `user_id`
-   `token_hash`
-   `expires_at`
-   `used_at`
-   `created_at`

### `tunnels`

-   `id`
-   `user_id`
-   `agent_id`
-   `type` (`web`, `port`)
-   `name`
-   `status`
-   `local_host` (server-side harus dipaksa ke loopback)
-   `local_port`
-   `protocol` (`http`, `tcp`, `udp` jika diaktifkan)
-   `subdomain` (nullable, unique bila tidak null)
-   `public_port` (nullable, unique sesuai protokol/rentang)
-   `created_at`, `updated_at`, `deleted_at`

### `custom_domains`

-   `id`
-   `user_id`
-   `tunnel_id`
-   `hostname` (unique setelah normalisasi)
-   `verification_token_hash`
-   `verification_expires_at`
-   `verified_at`
-   `tls_status`
-   `routing_status`
-   `status`
-   `created_at`, `updated_at`, `deleted_at`

### `provisioning_jobs`

-   `id`
-   `job_type`
-   `resource_type`
-   `resource_id`
-   `payload_json`
-   `status`
-   `attempts`
-   `next_attempt_at`
-   `last_error_redacted`
-   `created_at`, `updated_at`

### `audit_logs`

-   `id`
-   `actor_user_id`
-   `action`
-   `resource_type`
-   `resource_id`
-   `ip_redacted`
-   `metadata_redacted`
-   `created_at`

### 13.1 Aturan database

-   Aktifkan `PRAGMA foreign_keys=ON` pada setiap koneksi.
-   Gunakan WAL dan `busy_timeout` sesuai pola akses.
-   Terapkan unique constraints untuk email, slug, hostname, dan port.
-   Semua perubahan provisioning harus melalui job idempotent.
-   Untuk SQLite, gunakan transaksi singkat dan satu strategi antrean
    worker yang aman terhadap konkurensi.
-   Rencanakan migrasi ke PostgreSQL jika beban tulis, jumlah worker,
    atau kebutuhan high availability melampaui SQLite.

## 14. API Konseptual

Semua endpoint yang memerlukan autentikasi harus menerapkan
authorization per resource dan validasi input.

### Auth

-   `POST /api/auth/register`
-   `POST /api/auth/login`
-   `POST /api/auth/logout`
-   `GET /api/me`

### Plans dan billing

-   `GET /api/plans`
-   `GET /api/subscriptions/me`
-   `POST /api/subscriptions`
-   `GET /api/invoices`
-   `GET /api/invoices/:id`
-   `POST /api/invoices/:id/payment-intent`
-   `POST /api/webhooks/payments/:provider`

### Agent

-   `POST /api/agents/enrollment-token`
-   `POST /api/agents/enroll`
-   `GET /api/agents`
-   `DELETE /api/agents/:id`
-   `POST /api/agents/:id/rotate-credential`
-   `POST /api/agents/heartbeat`

### Tunnel

-   `GET /api/tunnels`
-   `POST /api/tunnels`
-   `GET /api/tunnels/:id`
-   `PATCH /api/tunnels/:id`
-   `DELETE /api/tunnels/:id`
-   `POST /api/tunnels/:id/retry-provisioning`

### Custom domain

-   `GET /api/custom-domains`
-   `POST /api/custom-domains`
-   `POST /api/custom-domains/:id/verify`
-   `POST /api/custom-domains/:id/retry`
-   `DELETE /api/custom-domains/:id`

### Admin

-   `GET /api/admin/overview`
-   `GET /api/admin/users`
-   `PATCH /api/admin/users/:id/status`
-   CRUD `/api/admin/plans`
-   `GET /api/admin/jobs`
-   `POST /api/admin/jobs/:id/retry`
-   `GET /api/admin/audit-logs`

API final harus mendokumentasikan skema request/response, error codes,
rate limits, dan idempotency behavior.

## 15. Keamanan

-   HTTPS wajib untuk dashboard, API, dan endpoint agent.
-   Password di-hash menggunakan algoritme modern seperti Argon2id atau
    bcrypt dengan konfigurasi kuat.
-   Session cookie `HttpOnly`, `Secure`, `SameSite` atau token pendek
    dengan refresh/rotasi yang dirancang aman.
-   Proteksi CSRF jika menggunakan cookie session.
-   Rate limit login, enrollment, DNS verification, dan endpoint
    sensitif.
-   RBAC dan ownership check pada setiap resource.
-   Enrollment token one-time, expiry pendek, disimpan dalam bentuk
    hash.
-   Kredensial agent dapat dicabut dan dirotasi.
-   Tidak ada shell command dari input pelanggan.
-   Jangan membuat konfigurasi FRP/Caddy dengan interpolasi string
    mentah yang tidak divalidasi.
-   Cegah SSRF: target lokal dipaksa loopback di backend, bukan
    dipercaya dari input klien.
-   Batasi request body, timeout, header, dan ukuran log.
-   Sanitasi log dan rahasia; jangan log token atau private key.
-   Firewall default-deny untuk port yang tidak dibutuhkan.
-   Pisahkan control plane, data plane, dan admin access sebisa mungkin.
-   Webhook payment signature diverifikasi dengan constant-time
    comparison bila sesuai.
-   Audit seluruh perubahan paket, billing, domain, port, suspend, dan
    resume.
-   Sediakan proses laporan abuse, rate limiting, dan pemutusan layanan
    yang melanggar kebijakan.

## 16. Abuse Prevention dan Kebijakan Penggunaan

Karena layanan tunnel dapat disalahgunakan, sebelum layanan publik
dibuka perlu tersedia: - Terms of Service dan Acceptable Use Policy. -
Larangan phishing, malware command-and-control, spam, distribusi konten
ilegal, pemindaian tanpa izin, dan aktivitas yang melanggar hukum. -
Mekanisme pelaporan abuse dan contact point. - Rate limits per akun,
agent, domain, port, IP, dan gateway. - Pembatasan koneksi serta
proteksi terhadap koneksi berlebihan. - Monitoring CPU, RAM, jumlah
sesi, bandwidth, packet loss, dan disk. - Prosedur suspend dan eskalasi
insiden. - Kebijakan retensi log yang proporsional dan diumumkan. -
Jangan menjanjikan bandwidth, uptime, atau SLA yang belum diukur.

## 17. Operasional dan Deployment

### 17.1 Server

-   Ubuntu Server LTS dengan update keamanan.
-   Firewall host dan/atau cloud firewall.
-   Caddy di port 80/443.
-   FRP gateway dengan autentikasi kuat dan versi terkelola.
-   Backend API, worker, dan SQLite di lingkungan terlindungi.
-   FRP admin/metrics hanya pada interface privat atau loopback dan
    dengan autentikasi.
-   SSH dibatasi berdasarkan kebutuhan operasional.
-   DNS wildcard dan record domain utama diuji sebelum launch.

### 17.2 Backup dan pemulihan

-   Backup SQLite konsisten menggunakan mekanisme SQLite backup atau
    prosedur yang aman terhadap WAL.
-   Backup terenkripsi dan disimpan di lokasi terpisah.
-   Uji restore berkala.
-   Jangan menyalin file database utama secara sembarang ketika sedang
    ada penulisan aktif tanpa prosedur yang benar.
-   Dokumentasikan Recovery Point Objective (RPO) dan Recovery Time
    Objective (RTO) yang realistis.

### 17.3 Monitoring

Minimal pantau: - Kesehatan API dan worker. - Status Caddy dan FRP. -
Agent online/offline. - Provisioning job yang gagal/tertunda. -
Penggunaan CPU, RAM, disk, koneksi, dan trafik. - Error
penerbitan/renewal TLS. - Kegagalan webhook. - Kapasitas port publik. -
Masa berlaku sertifikat gateway dan domain.

## 18. Non-Functional Requirements

-   **Reliability:** job dapat di-retry tanpa membuat resource duplikat.
-   **Security:** authorization per tenant dan isolasi tunnel.
-   **Performance:** dashboard/API tetap responsif pada target beban
    awal yang ditetapkan saat pengujian.
-   **Maintainability:** modul billing, provisioning, agent, dan domain
    dipisahkan.
-   **Observability:** error dapat ditelusuri menggunakan correlation
    ID.
-   **Backup:** prosedur restore diuji sebelum produksi.
-   **Compatibility:** agent diuji pada versi OS yang secara resmi
    didukung.
-   **Accessibility:** form memiliki label, pesan validasi, dan status
    yang jelas.
-   **Localization:** UI utama Bahasa Indonesia; format mata uang IDR.
-   **Time:** timestamp internal UTC.

Angka kapasitas dan SLA belum ditetapkan; perlu benchmark dan pengukuran
pada gateway yang sesungguhnya.

## 19. Kriteria Penerimaan MVP

### Akun dan billing

-   [ ] Pengguna dapat mendaftar, login, logout, dan melihat paket.
-   [ ] Invoice unik dibuat untuk subscription yang benar.
-   [ ] Webhook palsu atau signature invalid ditolak.
-   [ ] Webhook duplikat tidak menggandakan pembayaran atau
    perpanjangan.
-   [ ] Pembayaran valid mengantrekan aktivasi/resume satu kali secara
    efektif.

### Agent

-   [ ] Enrollment token memiliki expiry dan hanya dapat dipakai sekali.
-   [ ] Agent dapat reconnect setelah jaringan terputus.
-   [ ] Kredensial agent dapat dicabut.
-   [ ] Dashboard memperlihatkan status dan waktu heartbeat.

### Web Tunnel

-   [ ] Pelanggan dapat memilih subdomain dan mengecek ketersediaannya.
-   [ ] Sistem memeriksa ulang slug secara atomik ketika membuat tunnel.
-   [ ] Web Tunnel hanya mengakses loopback pada mesin agent.
-   [ ] HTTPS dan routing hostname bekerja end-to-end.
-   [ ] Mengubah subdomain tidak mengubah ID tunnel atau riwayat
    billing.

### Port Tunnel

-   [ ] Port publik dialokasikan tanpa konflik.
-   [ ] Tunnel TCP berhasil diuji end-to-end.
-   [ ] Port internal/admin tidak dapat diakses dari internet.
-   [ ] UDP baru dinyatakan siap jika pengujian khusus berhasil.

### Custom Domain

-   [ ] Domain tidak dapat aktif tanpa TXT verification.
-   [ ] Satu hostname tidak dapat diklaim oleh dua akun.
-   [ ] Status DNS/TLS/routing dapat dilihat pelanggan.
-   [ ] Domain yang dihapus tidak lagi diarahkan ke tunnel lama.
-   [ ] Renewal sertifikat diuji dan error tercatat.

### Paket dan suspend

-   [ ] Free dibatasi maksimal 1 Web Tunnel dan 1 Port Tunnel.
-   [ ] Kuota agent dan custom domain ditegakkan di backend.
-   [ ] Kuota tidak dapat dilewati dengan mengirim request API manual.
-   [ ] Layanan yang melewati kebijakan jatuh tempo disuspend sesuai
    grace period.
-   [ ] Setelah pembayaran valid, layanan dapat diaktifkan kembali.

### Operasional

-   [ ] Backup database dibuat dan restore diuji.
-   [ ] Provisioning job yang gagal dapat di-retry tanpa duplikasi.
-   [ ] Audit log mencatat tindakan sensitif.
-   [ ] Firewall dan port publik ditinjau sebelum launch.

## 20. Tahapan Pengembangan

### Fase 0 --- Validasi teknis

-   Uji FRP TCP loopback.
-   Uji routing HTTP virtual host melalui Caddy dan FRP.
-   Uji TLS/ACME untuk domain bawaan dan custom domain.
-   Uji isolasi agent dan kegagalan reconnect.
-   Putuskan konfigurasi final setelah proof-of-concept, bukan
    berdasarkan asumsi.

### Fase 1 --- Fondasi backend

-   Setup proyek Node.js/Express.
-   Migrasi SQLite.
-   Auth, RBAC, paket, subscription, invoice.
-   Admin minimal, audit log, konfigurasi environment.

### Fase 2 --- Tunnel engine

-   Agent enrollment dan credential lifecycle.
-   Provisioning job worker.
-   Create/update/delete Web Tunnel dan TCP Port Tunnel.
-   Monitoring status dan reconnect.

### Fase 3 --- DNS dan TLS

-   Wildcard DNS.
-   Subdomain availability.
-   Caddy routing integration.
-   Custom domain verification dan certificate automation.

### Fase 4 --- Billing automation

-   Integrasi payment gateway yang dipilih.
-   Webhook idempotency.
-   Expiry, grace period, suspend/resume.

### Fase 5 --- Agent dan rilis

-   Agent Windows dan Linux.
-   Installer/service management.
-   Dokumentasi pengguna.
-   Backup, monitoring, abuse process, security review.

### Fase 6 --- Penguatan dan pengembangan

-   Integrasi DNS provider API.
-   PostgreSQL saat dibutuhkan.
-   Multi-gateway, quota metering, analitik penggunaan.
-   Port UDP jika layak.
-   Kebijakan SLA berdasarkan pengukuran nyata.

## 21. Risiko dan Mitigasi

  -----------------------------------------------------------------------
  Risiko                  Dampak                  Mitigasi
  ----------------------- ----------------------- -----------------------
  Konfigurasi FRP--Caddy  Web Tunnel tidak dapat  Proof-of-concept
  tidak sesuai pola       diakses atau tidak aman sebelum implementasi
  routing                                         penuh

  Penyalahgunaan tunnel   IP gateway diblokir     AUP, rate limit,
                          atau kerugian           monitoring, abuse
                          operasional             response

  Kebocoran kredensial    Tunnel pelanggan        Token hash, rotasi,
  agent                   diambil alih            revocation, TLS

  Domain takeover         Trafik salah diarahkan  TXT verification,
                                                  uniqueness, cleanup

  Webhook ganda           Tagihan atau masa aktif Idempotency key dan
                          ganda                   transaksi

  Race condition alokasi  Konflik endpoint        Unique constraint dan
  port/slug                                       transaksi

  SQLite contention       API/job lambat          Worker terkontrol,
                                                  transaksi singkat,
                                                  migrasi bila perlu

  Gateway kehabisan       Gangguan untuk semua    Quota, monitoring,
  bandwidth               pelanggan               kapasitas dan rencana
                                                  scale

  Sertifikat gagal        Domain tidak dapat      Status transparan,
  diterbitkan             HTTPS                   retry, rate-limit,
                                                  panduan DNS
  -----------------------------------------------------------------------

## 22. Keputusan yang Masih Harus Dikonfirmasi

1.  Domain produksi dan DNS provider untuk Aksester.
2.  Harga final paket dan apakah Free permanen atau trial.
3.  Payment gateway yang digunakan.
4.  Apakah UDP masuk MVP atau hanya TCP.
5.  Kuota custom domain tiap paket.
6.  Grace period dan kebijakan suspend.
7.  Rentang port publik untuk Port Tunnel.
8.  Kebijakan transfer data/bandwidth dan metode enforcement.
9.  Detail pola teknis final FRP--Caddy setelah PoC.
10. Kebijakan privasi, retensi log, AUP, dan SLA.

## 23. Prinsip Keputusan Produk

-   Free: maksimal 1 Web Tunnel dan 1 Port Tunnel, dengan batas sumber
    daya yang jelas dan benar-benar ditegakkan.
-   Subdomain bawaan adalah cara termudah untuk mulai menggunakan
    Aksester.
-   Custom domain tidak membutuhkan DNS server milik Aksester pada MVP.
-   Domain pelanggan harus diverifikasi sebelum routing aktif.
-   HTTPS dan isolasi antar pelanggan merupakan persyaratan inti.
-   Port Tunnel, Web Tunnel, agent, dan custom domain memakai identitas
    internal terpisah.
-   Semua operasi provisioning harus dapat diulang dengan aman.
-   Fitur yang belum mempunyai enforcement teknis tidak boleh dipasarkan
    sebagai batas atau jaminan aktif.
-   Harga dalam dokumen adalah contoh, bukan keputusan bisnis final.

------------------------------------------------------------------------

**Akhir dokumen PRD Aksester v1.0**
