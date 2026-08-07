# Linux Omnibus

Tek sayfalık, tarayıcıda çalışan Türkçe Linux müfredatı. Sunucu yok, build yok — `index.html` açıyorsun, okuyorsun.

Sıfırdan terminal kullanımından Docker/Kubernetes, hardening, SOC ve yetkili lab’de Kali araçlarına kadar uzanan bir yol haritası. Her bölüm başlangıç / orta / ileri katmanlarına ayrılmış; mülakat soruları ve kriz senaryoları derslerin içine gömülü.

## Çalıştırma

```bash
# seçenek 1 — dosyayı doğrudan aç
# index.html’e çift tıkla

# seçenek 2 — lokal sunucu (önerilen)
npx serve .
# veya: python -m http.server 8080
```

Ardından `http://localhost:3000` (veya seçtiğin port) → `index.html`.

İlk yüklemede CDN gerekir (Tailwind, Font Awesome, Google Fonts). Service worker bunları ve yerel JS’i önbelleğe alır; sonra çoğu içerik offline okunabilir. `file://` ile açınca PWA çalışmaz — lokal sunucu kullan.

## İçinde ne var?

### Müfredat — 35 bölüm

| # | Konu |
|---|------|
| 00–02 | Linux nedir, terminal, dosya/metin araçları |
| 03–04 | süreçler, paketler, systemd, izin modeli |
| 05–08 | yedekleme, editörler, PATH/derleme, FHS + log |
| 09–11 | Kali girişi, ağ temelleri, kriz runbook’u |
| 12–14 | SSH, bash scripting, disk/LVM |
| 15–18 | Docker, Kubernetes, CI/CD, Ansible/Terraform |
| 19–22 | gözlemlenebilirlik, hardening, TLS/secret, GitOps/Day-2 |
| 23–26 | Git, bulut Linux, Python ops, DB operasyonu |
| 27–29 | ileri ağ/LB, systemd derinliği, performans |
| 30–34 | SELinux/AppArmor, LDAP/AD/SSO, IR, eBPF, konteyner güvenliği |

### Hedef yollar (9 track)

Rolüne göre filtrelenmiş fazlar: Sıfırdan Linux, DevOps, SRE/Platform, Red Hat/Sysadmin, SOC, Red Team/Pentest, Blue Team/Hardening, Cloud Ops, Backend/Full-stack Ops.

### Komut ansiklopedisi

~570 komut: İngilizce köken, Türkçe karşılık, örnek, kısa tip. Gezinme, dosya, metin, yetki, süreç, ağ, paket, systemd, disk, Docker/K8s ve ops araçları.

### Kali Arsenal + derin dalışlar

Kategori bazlı araç envanteri (recon → exploit → forensics…) ve 16 araç için ayrı derin modül: Nmap, Burp, Metasploit, SQLmap, Hydra, Hashcat/John, Wireshark, Aircrack-ng, Responder, NetExec, Nikto/WPScan, Bettercap, Nuclei, BloodHound, Impacket, LinPEAS/WinPEAS.

### Mülakat bankası

~50 ekstra soru; track ve seviyeye göre süzülüyor. Ders içi interview bloklarıyla birlikte çalışıyor. “Biliyorum” işaretleri localStorage’da kalıyor.

### Diğer

- Global arama (`/` kısayolu)
- Okuma ilerlemesi (ders bazlı)
- Ders sonu **mini-quiz** (seçmeli sorular, skor localStorage’da; tam doğru → okundu)
- İnteraktif widget’lar: chmod, cron, FHS, **CIDR**, **docker run** builder
- İlerleme **dışa / içe aktar** (JSON: okunan dersler, tema, yol, mülakat “biliyorum”, quiz skorları)
- Açık/koyu tema
- Hash route ile yer imi (`#ch15/orta` gibi)
- **PWA / offline**: `manifest.webmanifest` + service worker — ilk ziyaretten sonra app shell ve CDN varlıkları önbelleğe alınır (HTTPS veya localhost gerekir)

## Dosya haritası

```
index.html              # kabuk + stiller
app.js                  # routing, sidebar, arama, render
content.js              # bölüm 00–11
content-more.js         # bölüm 12–34
tracks.js               # kariyer yolları
encyclopedia*.js        # komut ansiklopedisi
kali-arsenal.js         # araç kategorileri
kali-deep.js            # araç derin modülleri
interview.js            # mülakat soruları
manifest.webmanifest    # PWA manifest
sw.js                   # offline cache
LICENSE                 # MIT
```

İçerik düz JS dizilerinde (`window.BIBLE`, `window.COMMANDS`, …). Yeni bölüm eklemek = ilgili dosyaya obje push etmek.

Ders sonu quiz eklemek için lesson objesine:

```js
quiz: [
  { q: 'Soru?', choices: ['A', 'B', 'C', 'D'], answer: 1, explain: 'Kısa açıklama' }
]
```

`answer` doğru şıkkın 0-tabanlı indeksidir. Widget için `widget: 'chmod' | 'cron' | 'fhs' | 'cidr' | 'docker'`.

## Etik not

Güvenlik ve Kali içerikleri yalnızca kendi laboratuvarın veya yazılı izinli ortamlar içindir. İzinsiz tarama / sızma testi suçtur; müfredat da bunu açıkça söylüyor.

## Lisans

[MIT](LICENSE) — yazılım ve müfredat dosyaları bu lisans altındadır.
