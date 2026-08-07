/* Linux Omnibus — genişletilmiş müfredat (DevOps · Güvenlik · Sistem) */
(function () {
    if (!window.BIBLE) window.BIBLE = [];

    const MORE = [

/* ========== 12 SSH ========== */
{
    id: 'ch12', num: '12', title: 'SSH ve Uzaktan Yönetim',
    subtitle: 'Dünyanın öbür ucundaki sunucu',
    group: 'sistem',
    who: 'Sunucuya bağlanacak herkes — junior’dan on-call’a.',
    intro: 'SSH (Secure Shell), Linux dünyasının kapı anahtarıdır. Parola ile "şanslı bağlantı" değil; anahtar, config, jump host ve oturum hijacking farkındalığı ile profesyonel uzaktan yönetim öğrenirsiniz.',
    levels: {
        baslangic: [
            {
                id: 'ch12-b1',
                title: 'SSH nedir? İlk bağlantı',
                hook: 'Tarayıcı yok, masaüstü yok — sadece güvenli bir tünel.',
                tags: 'ssh uzak sunucu bağlantı',
                search: 'ssh bağlan uzak sunucu',
                body: [
                    '<strong>SSH</strong>, şifreli bir oturum açar: komutlarınız ve çıktınız ağda düz metin gitmez. Tipik kullanım: <code>ssh kullanici@sunucu</code>.',
                    'İlk seferde "host key fingerprint" sorulur — sunucunun kimlik kartıdır. Bu parmak izini güvenilir kanaldan doğrulamazsanız MITM riski vardır.',
                    'Port varsayılanı 22’dir. Prod’da çoğu ekip non-standard port + fail2ban/firewall kullanır; ama güvenlik "gizli port"tan değil, anahtar ve erişim politikasından gelir.'
                ],
                steps: [
                    'Lab VM’in IP’sini öğrenin (<code>ip a</code>).',
                    'Host makineden: <code>ssh kullanici@IP</code>',
                    'Fingerprint’i kabul edin (lab’de). Prod’da doğrulayın.'
                ],
                commands: [
                    { cmd: 'ssh user@192.168.56.10', note: 'İlk bağlantı' },
                    { cmd: 'ssh -p 2222 user@host', note: 'Farklı port' },
                    { cmd: 'exit', note: 'Oturumu kapat' }
                ],
                mistakes: [
                    'Fingerprint’i okumadan yes demek (özellikle public Wi-Fi).',
                    'Root ile SSH’ı açık bırakıp parola kabul etmek.'
                ],
                exercise: 'Kendi lab’inizde SSH ile giriş yapıp <code>hostname</code> ve <code>uptime</code> çalıştırın.',
                interview: [
                    { q: 'SSH neden Telnet’ten üstündür?', a: 'Telnet düz metindir; parola ve komutlar dinlenebilir. SSH kimlik doğrulama + şifreleme + bütünlük sağlar.' }
                ]
            },
            {
                id: 'ch12-b2',
                title: 'Parola yerine SSH anahtarı',
                hook: 'Anahtar = kilit + anahtarlık. Parola her seferinde kapıyı çalmak gibidir.',
                tags: 'ssh-keygen authorized_keys',
                search: 'ssh key anahtar ssh-keygen',
                body: [
                    '<code>ssh-keygen</code> bir <strong>özel</strong> ve <strong>açık</strong> anahtar üretir. Özel anahtar sizin cihazda kalır; açık anahtar sunucudaki <code>~/.ssh/authorized_keys</code> dosyasına eklenir.',
                    'Modern varsayılan: Ed25519. Eski uyumluluk için RSA 4096 hâlâ görülür. Özel anahtarı asla e-posta/chat ile göndermeyin.',
                    'Passphrase ile özel anahtarı şifreleyin — laptop çalınırsa anahtar tek başına yetmez.'
                ],
                commands: [
                    { cmd: 'ssh-keygen -t ed25519 -C "ben@laptop"', note: 'Anahtar üret' },
                    { cmd: 'ssh-copy-id user@host', note: 'Açık anahtarı sunucuya koy' },
                    { cmd: 'cat ~/.ssh/id_ed25519.pub', note: 'Açık anahtarı gör' }
                ],
                callouts: [
                    { type: 'danger', title: 'Kritik', text: '<code>id_ed25519</code> (özel) dosya izni 600 olmalı. 644 veya paylaşımlı disk = felaket.' }
                ],
                kernel: 'SSH, kimlik doğrulama sonrası her kanal için şifreli oturum kurar; agent forwarding dikkatli kullanılmalı.',
                crisis: 'Parola brute-force logları şişiyor — anahtar zorunlu + PasswordAuthentication no.'
            }
        ],
        orta: [
            {
                id: 'ch12-o1',
                title: '~/.ssh/config — insan gibi bağlanmak',
                tags: 'ssh config ProxyJump',
                search: 'ssh config alias jump host bastion',
                body: [
                    'Her seferinde uzun komut yazmak yerine <code>~/.ssh/config</code> ile alias tanımlarsınız: <code>ssh prod-api</code>.',
                    '<strong>ProxyJump / bastion</strong>: özel ağa doğrudan çıkamazsınız; önce jump host’a, oradan hedefe. Bu, kurumsal ağların standart modelidir.',
                    'Ayrıca <code>ServerAliveInterval</code> ile idle kesilmelerini azaltır, farklı IdentityFile ile hesapları ayırırsınız.'
                ],
                commands: [
                    { cmd: 'printf "Host lab\\n  HostName 192.168.56.10\\n  User ubuntu\\n  IdentityFile ~/.ssh/id_ed25519\\n" >> ~/.ssh/config', note: 'Örnek alias' },
                    { cmd: 'ssh lab', note: 'Alias ile bağlan' },
                    { cmd: 'scp ./app.tgz lab:/tmp/', note: 'Dosya kopyala' },
                    { cmd: 'rsync -avz ./dist/ lab:/var/www/app/', note: 'Senkron deploy' }
                ],
                mistakes: [
                    'Tüm sunuculara aynı anahtar + agent forwarding her yerde — lateral movement rüyası.',
                    'config dosyasında yanlış Indent/Host sırası.'
                ],
                exercise: 'İki host için config yazın; birine ProxyJump ekleyin (veya simüle edin).'
            },
            {
                id: 'ch12-o2',
                title: 'sshd_config sertleştirme',
                tags: 'sshd hardening PermitRootLogin',
                search: 'sshd_config hardening root login',
                body: [
                    'Sunucu tarafı: <code>/etc/ssh/sshd_config</code>. Minimum: <code>PermitRootLogin no</code>, <code>PasswordAuthentication no</code>, <code>PubkeyAuthentication yes</code>, gerekirse <code>AllowUsers</code>.',
                    'Değişiklikten sonra <code>sshd -t</code> ile sözdizimi test edin; sonra reload. Yanlış config ile kendini kilitlemek klasik P1’dir — cloud serial console hazır tutun.',
                    'Fail2ban veya nftables rate-limit brute-force’u keser; ama anahtar zorunluluğu asıl kontroldür.'
                ],
                commands: [
                    { cmd: 'sudo sshd -t', note: 'Config test' },
                    { cmd: 'sudo systemctl reload ssh', note: 'Debian/Ubuntu' },
                    { cmd: 'sudo ss -tlnp | grep :22', note: 'SSH dinliyor mu?' }
                ],
                crisis: 'sshd reload sonrası kimse giremiyor — console’dan düzelt, AllowUsers typo kontrol et.'
            }
        ],
        ileri: [
            {
                id: 'ch12-i1',
                title: 'Certificate, CA ve ephemeral erişim',
                tags: 'ssh certificate short-lived ca',
                search: 'ssh certificate ca vault teleport',
                body: [
                    'Büyük ölçekte her sunucuya kullanıcı anahtarı kopyalamak ölçeklenmez. <strong>SSH certificate</strong> modeli: kısa ömürlü sertifika imzalayan bir CA; sunucular CA’ya güvenir.',
                    'Teleport, Boundary, Vault SSH secret engine gibi araçlar bu modeli ürünleştirir: audit log, time-box erişim, onay akışı.',
                    'Senior farkı: "anahtar yönetimi bir kimlik problemidir" demek — dosya kopyalama problemi değil.'
                ],
                interview: [
                    { q: 'SSH agent forwarding ne zaman tehlikelidir?', a: 'Bastion’da compromised oturum, agent socket üzerinden başka hedeflere sizin adınıza bağlanabilir. Mümkünse ProxyJump + kısa ömürlü cert tercih edin; ForwardAgent’ı default açmayın.' },
                    { q: 'Prod SSH erişimini nasıl tasarlarısın?', a: 'IdP SSO → kısa ömürlü credential → bastion/mesh → host’ta root yok, sudo komut bazlı → tüm oturumlar audit.' }
                ],
                kernel: 'SSH protokolü transport + auth + connection katmanlarından oluşur; port forwarding (Local/Remote/Dynamic) ayrı kanallar açar.'
            }
        ]
    },
    chapterInterview: [
        { q: 'İlk günden bir junior’a SSH için ne emredersin?', a: 'Ed25519 anahtar, passphrase, PasswordAuthentication kapalı, root SSH yok, config alias, asla özel anahtarı paylaşma.' }
    ]
},

/* ========== 13 BASH ========== */
{
    id: 'ch13', num: '13', title: 'Bash Scripting',
    subtitle: 'Tekrarlayan işi otomatikleştir',
    group: 'sistem',
    who: 'Komut bilen, script yazamayanlar — ve script yazıp prod’u yakanlar.',
    intro: 'Shell scripting DevOps’un yapıştırıcısıdır. Bu bölüm "çalışan script" ile "güvenli, okunabilir, hata toleranslı script" farkını öğretir.',
    levels: {
        baslangic: [
            {
                id: 'ch13-b1',
                title: 'İlk script: shebang, chmod, argüman',
                hook: 'Bir dosyaya yazdığınız komutlar = program.',
                tags: 'bash script shebang',
                search: 'bash script shebang chmod +x',
                body: [
                    'İlk satır <code>#!/usr/bin/env bash</code> (shebang) hangi yorumlayıcının çalışacağını söyler.',
                    '<code>chmod +x script.sh</code> sonrası <code>./script.sh</code> ile çalıştırırsınız. Argümanlar: <code>$1</code>, <code>$2</code>, <code>$@</code>.',
                    'Değişken: <code>NAME="linux"</code> — <strong>eşittir etrafında boşluk yok</strong>. Kullanırken <code>"$NAME"</code> tırnaklayın (kelime bölünmesi/glob riski).'
                ],
                commands: [
                    { cmd: "printf '%s\\n' '#!/usr/bin/env bash' 'echo Merhaba \"$1\"' > hello.sh", note: 'Script oluştur' },
                    { cmd: 'chmod +x hello.sh && ./hello.sh Dünya', note: 'Çalıştır' }
                ],
                mistakes: [
                    '<code>cd $DIR</code> — boşluklu yolda patlar; <code>cd "$DIR"</code> kullanın.',
                    'Windows’tan kopyalanmış CRLF satır sonu → <code>bad interpreter</code>.'
                ],
                exercise: 'İki argüman alıp toplayan (veya birleştiren) mini script yazın.'
            }
        ],
        orta: [
            {
                id: 'ch13-o1',
                title: 'if, exit kodu, set -euo pipefail',
                tags: 'bash set -e pipefail',
                search: 'bash set -euo pipefail if',
                body: [
                    'Her komutun exit kodu vardır. <code>if cmd; then ...; fi</code> bunu kullanır. <code>$?</code> son koddur.',
                    'Profesyonel iskelet: <code>set -euo pipefail</code> — hata olunca çık, tanımsız değişkeni yakala, pipe’ta ilk hatayı gör.',
                    '<code>set -e</code> her yerde sihir değildir (if içinde vs.); yine de "sessizce yanlış devam" felaketini azaltır.'
                ],
                commands: [
                    { cmd: "cat > safe.sh <<'EOF'\n#!/usr/bin/env bash\nset -euo pipefail\nFILE=${1:?dosya ver}\n[[ -f \"$FILE\" ]] || { echo yok; exit 1; }\nwc -l \"$FILE\"\nEOF", note: 'Güvenli iskelet' }
                ],
                callouts: [
                    { type: 'ok', title: 'Okunabilirlik', text: 'Fonksiyon kullanın, sihirli one-liner’ı README’ye yazın, script’i insan okusun.' }
                ],
                interview: [
                    { q: 'Neden pipefail?', a: 'Pipeline’da sağdaki komut (ör. grep no-match) 0 dönebilir; soldaki hata yutulur. pipefail ilk non-zero’yu yüzeye çıkarır.' }
                ]
            },
            {
                id: 'ch13-o2',
                title: 'Döngü, dizi, log ve kilit dosyası',
                tags: 'bash loop flock cron',
                search: 'bash for while flock',
                body: [
                    '<code>for f in *.log; do ...; done</code> ve <code>while read -r line; do ...; done < file</code> günlük işlerdir.',
                    'Cron’da çakışan job’lar için <code>flock</code> ile kilit alın. Log’a timestamp yazın; stdout/stderr’i ayırın.',
                    'Idempotency: script iki kez çalışınca da güvenli olsun (mkdir -p, test -f, sistem durumunu kontrol).'
                ],
                commands: [
                    { cmd: 'flock -n /tmp/backup.lock -c "/usr/local/bin/backup.sh"', note: 'Çakışmayı engelle' },
                    { cmd: 'date -Is >> /var/log/myjob.log', note: 'ISO timestamp' }
                ],
                crisis: 'Cron her dakika patlayan script disk doldurdu — rate limit + logrotate + flock.'
            }
        ],
        ileri: [
            {
                id: 'ch13-i1',
                title: 'Trap, temizlik ve güvenli geçici dosya',
                tags: 'bash trap mktemp',
                search: 'bash trap mktemp cleanup',
                body: [
                    '<code>trap cleanup EXIT</code> ile geçici dizinleri silin. <code>mktemp -d</code> kullanın; <code>/tmp/foo</code> tahmin edilebilir isim güvenlik açığıdır.',
                    'Kullanıcı girdisini asla <code>eval</code> etmeyin. Komut enjeksiyonu shell’in klasik zaafıdır.',
                    'Büyük otomasyonda Bash’ten Ansible/Python’a geçiş zamanını bilin — Bash yapıştırıcıdır, uygulama framework’ü değildir.'
                ],
                commands: [
                    { cmd: "TMP=$(mktemp -d); trap 'rm -rf \"$TMP\"' EXIT; echo iş \"$TMP\"", note: 'Güvenli temp' }
                ],
                interview: [
                    { q: 'Script’te secret nasıl taşınmaz?', a: 'Argüman/env log’a düşer. Vault/SOPS/cloud secret manager; en kötü ihtimalle 600 permission dosya + process list dikkatı.' }
                ]
            }
        ]
    },
    chapterInterview: [
        { q: 'Prod’a bash script koyma checklist’in?', a: 'set -euo pipefail, tırnaklar, mktemp+trap, flock, dry-run modu, log, idempotent, shellcheck, code review.' }
    ]
},

/* ========== 14 STORAGE ========== */
{
    id: 'ch14', num: '14', title: 'Disk, LVM ve Dosya Sistemleri',
    subtitle: 'Disk doldu — şimdi ne?',
    group: 'sistem',
    who: 'df -h gören ama LVM/mount bilmeyenler.',
    intro: 'Disk doluluğu en sık P1’lerden biridir. Blok cihaz → partition/LVM → filesystem → mount → inode zincirini bilmeden doğru teşhis imkânsızdır.',
    levels: {
        baslangic: [
            {
                id: 'ch14-b1',
                title: 'Blok cihaz, partition, mount',
                hook: 'Disk bir dosya değildir — ama Linux onu dosya gibi gösterir.',
                tags: 'disk lsblk mount df',
                search: 'lsblk mount df disk dolu',
                body: [
                    '<code>lsblk</code> ağacı gösterir: disk → partition → (belki LVM) → mount noktası.',
                    '<code>df -h</code> dosya sistemi doluluğu; <code>df -i</code> inode. Küçük dosya bombasında alan boşken inode biter.',
                    'Mount: bir dosya sistemini dizin ağacına bağlamak. <code>/etc/fstab</code> kalıcı mount tarifesidir — yanlış satır boot’u kırar.'
                ],
                commands: [
                    { cmd: 'lsblk -f', note: 'Disk + FS + UUID' },
                    { cmd: 'df -hT', note: 'Doluluk + tip' },
                    { cmd: 'df -i', note: 'Inode' },
                    { cmd: 'findmnt /', note: 'Root nasıl mount?' }
                ],
                exercise: 'Lab’de df ve lsblk çıktısını yan yana okuyup hangi partition’ın /var olduğunu bulun.',
                crisis: '/ dolu → SSH bile bozulabilir (tmp’ye yazılamaz). Önce büyük log/docker’ı bul.'
            }
        ],
        orta: [
            {
                id: 'ch14-o1',
                title: 'du ile suçluyu bulmak',
                tags: 'du ncdu disk kullanım',
                search: 'du disk kullanım büyük dosya',
                body: [
                    '<code>du -xh --max-depth=1 /var | sort -h</code> klasör klasör şişmeyi gösterir. Silmeden önce: açık handle ile silinmiş dosya (<code>lsof +L1</code>) alanı geri vermez — süreci restart edin.',
                    'Docker: overlay2 ve volume’ler sessizce /var’ı yer. journald: <code>journalctl --vacuum-size=200M</code>.',
                    'Silme politikası: önce rotate/compress, sonra sil; prod’da kanıtsız log imhası audit sorunudur.'
                ],
                commands: [
                    { cmd: 'sudo du -xh --max-depth=1 /var 2>/dev/null | sort -h | tail', note: 'En şişkin' },
                    { cmd: 'sudo journalctl --disk-usage', note: 'Journal boyutu' },
                    { cmd: 'sudo lsof +L1 2>/dev/null | head', note: 'Silinmiş ama açık' }
                ]
            },
            {
                id: 'ch14-o2',
                title: 'LVM: PV, VG, LV büyütmek',
                tags: 'lvm resize2fs xfs_growfs',
                search: 'lvm extend lvextend resize',
                body: [
                    'LVM: fiziksel volume (PV) → volume group (VG) → logical volume (LV). LV’yi büyütmek genelde: disk ekle → pvcreate → vgextend → lvextend → filesystem grow.',
                    'ext4: <code>resize2fs</code>. xfs: <code>xfs_growfs</code> (mount varken). Küçültmek çok daha riskli ve çoğu prod’da yapılmaz.',
                    'Snapshot LVM ile alınabilir; ama performans ve COW davranışını bilin.'
                ],
                commands: [
                    { cmd: 'sudo vgs; sudo lvs; sudo pvs', note: 'LVM özeti' },
                    { cmd: 'sudo lvextend -L +10G /dev/vg0/root', note: 'LV büyüt' },
                    { cmd: 'sudo resize2fs /dev/vg0/root', note: 'ext4 büyüt' }
                ],
                callouts: [
                    { type: 'warn', title: 'Cloud', text: 'AWS/GCP’te önce volume’u hypervisor’da büyütün, sonra OS içinde lsblk ile görünce extend edin.' }
                ]
            }
        ],
        ileri: [
            {
                id: 'ch14-i1',
                title: 'fstab, UUID, bind mount ve NFS',
                tags: 'fstab uuid nfs',
                search: 'fstab uuid nfs mount',
                body: [
                    'fstab’da cihaz yolundan çok <strong>UUID</strong> kullanın — disk sırası değişebilir. <code>nofail</code>, <code>_netdev</code> network FS için kritik seçeneklerdir.',
                    'Bind mount: bir dizini başka yere bağlar (container volume, chroot senaryoları). NFS: uzak paylaşım; latency ve lock semantiği lokal disk gibi değildir.',
                    'RAID/mdadm ve ZFS/Btrfs ayrı evrenlerdir; "yedek RAID değildir" cümlesini ezberleyin.'
                ],
                interview: [
                    { q: 'Disk full runbook’un ilk 5 adımı?', a: '1) df -h ve df -i 2) du ile top dizin 3) docker/journal/log 4) açık silinmiş dosyalar 5) geçici rahatlama + kalıcı kapasite/retention kararı.' }
                ]
            }
        ]
    },
    chapterInterview: [
        { q: 'Inode nedir, neden biter?', a: 'Her dosya bir inode harcar. Milyonlarca küçük dosya (mail queue, session, cache) alanı bırakmadan inode’u tüketir.' }
    ]
},

/* ========== 15 DOCKER ========== */
{
    id: 'ch15', num: '15', title: 'Docker ve Konteynerler',
    subtitle: '"Benim makinemde çalışıyordu" dönemi bitsin',
    group: 'devops',
    who: 'Uygulamayı sunucuya "kurmak" zorunda kalan herkes.',
    intro: 'Konteyner, proses izolasyonudur (namespace + cgroup) — küçük VM değildir. Docker ile imaj, container, volume, network ve güvenli temel pratikleri öğrenirsiniz.',
    levels: {
        baslangic: [
            {
                id: 'ch15-b1',
                title: 'Konteyner vs VM — zihinsel model',
                hook: 'Aynı kernel’i paylaşırlar; hipervizör değil, izolasyon.',
                tags: 'docker konteyner namespace',
                search: 'docker nedir konteyner vm fark',
                body: [
                    'VM: kendi kernel’i olan ağır misafir. Konteyner: host kernel’ini paylaşan izole proses ağacı. Bu yüzden daha hızlı ve daha yoğun.',
                    '<strong>Image</strong> = katmanlı şablon. <strong>Container</strong> = image’dan çalışan örnek. <strong>Registry</strong> = image deposu (Docker Hub, GHCR, ECR...).',
                    'Linux’ta Docker Engine (veya containerd/podman) bu yaşam döngüsünü yönetir.'
                ],
                callouts: [
                    { type: 'warn', title: 'Güvenlik', text: 'Container "root" host’ta da etkili olabilir (özellikle privileged). Least privilege ve user namespace önemli.' }
                ],
                interview: [
                    { q: 'Konteyner VM midir?', a: 'Hayır. Kernel paylaşılır; izolasyon namespace (pid, net, mnt, uts, ipc, user) ve cgroup kaynak limitleri ile sağlanır.' }
                ]
            },
            {
                id: 'ch15-b2',
                title: 'İlk container: run, ps, logs, exec',
                tags: 'docker run ps logs',
                search: 'docker run nginx logs exec',
                body: [
                    '<code>docker run</code> imajı çeker (yoksa) ve çalıştırır. <code>-d</code> arka plan, <code>-p 8080:80</code> port map, <code>--name</code> isim.',
                    'Teşhis: <code>docker ps</code>, <code>docker logs</code>, <code>docker exec -it ... bash</code>.',
                    'Temizlik: <code>docker rm</code>, kullanılmayan imajlar için <code>docker image prune</code> — disk krizinin sık nedeni.'
                ],
                commands: [
                    { cmd: 'docker run --rm -d -p 8080:80 --name web nginx:alpine', note: 'Nginx ayağa' },
                    { cmd: 'curl -I localhost:8080', note: 'Test' },
                    { cmd: 'docker logs web --tail 50', note: 'Log' },
                    { cmd: 'docker exec -it web sh', note: 'İçeri gir' },
                    { cmd: 'docker stop web', note: 'Durdur' }
                ],
                exercise: 'nginx’i çalıştırıp tarayıcı/curl ile görün, log’a bakın, stop edin.',
                crisis: 'Port already allocated — ss -tlnp ile kim tutuyor bul.'
            }
        ],
        orta: [
            {
                id: 'ch15-o1',
                title: 'Dockerfile: katman, cache, küçük imaj',
                tags: 'dockerfile multi-stage',
                search: 'dockerfile best practice multi-stage',
                body: [
                    'Dockerfile talimatları katman üretir. Sık değişen satırlar alta; bağımlılık cache’i üstte tutulur.',
                    '<strong>Multi-stage build</strong>: derleme aşaması ayrı, runtime aşaması minimal (distroless/alpine). Attack surface ve boyut düşer.',
                    'Root dışı USER, healthcheck, read-only rootfs ve secret’ı image’a <code>ENV</code> ile gömmemek temel kurallardır.'
                ],
                commands: [
                    { cmd: 'docker build -t myapp:1.0 .', note: 'Build' },
                    { cmd: 'docker history myapp:1.0', note: 'Katmanlar' },
                    { cmd: 'docker images', note: 'Boyutlara bak' }
                ],
                mistakes: [
                    'COPY . . ile .env ve .git’i image’a almak.',
                    'latest tag ile prod deploy — unreproducible.'
                ]
            },
            {
                id: 'ch15-o2',
                title: 'Compose, volume ve network',
                tags: 'docker compose volume network',
                search: 'docker compose volume network',
                body: [
                    'Compose birden fazla servisi (app + db + redis) tek dosyada tanımlar. Geliştirme ve küçük prod’lar için güçlüdür.',
                    'Volume: kalıcı veri. Bind mount: host dizini. Network: servisler birbirini DNS adıyla bulur.',
                    'Prod’da tek host Compose yerine çoğu ekip Swarm/K8s’e geçer — ama Compose bilmek hâlâ değerlidir.'
                ],
                commands: [
                    { cmd: 'docker compose up -d', note: 'Stack ayağa' },
                    { cmd: 'docker compose logs -f app', note: 'Takip' },
                    { cmd: 'docker compose down', note: 'Yık (volume dikkat)' }
                ]
            }
        ],
        ileri: [
            {
                id: 'ch15-i1',
                title: 'Güvenlik: rootless, scan, runtime',
                tags: 'docker security trivy seccomp',
                search: 'docker security rootless trivy',
                body: [
                    'Image tarama (Trivy/Grype), base image pinleme, SBOM, imzalı imaj (cosign) modern tedarik zinciri pratikleridir.',
                    'Runtime: drop capabilities, no-new-privileges, seccomp/AppArmor, non-root. <code>--privileged</code> neredeyse "VM ver" demektir.',
                    'Docker socket’i konteynere mount etmek = host root. CI runner güvenliğinde klasik tuzak.'
                ],
                interview: [
                    { q: 'Container breakout nedir?', a: 'İzolasyon zafiyetiyle host’a veya başka konteynere kaçış. Kernel exploit, yanlış mount, privileged mode sık vektörlerdir.' }
                ],
                kernel: 'cgroup v2 CPU/memory limit; overlayfs katmanları; netns ile sanal ethernet çifti.'
            }
        ]
    },
    chapterInterview: [
        { q: 'Neden konteyner kullanırız?', a: 'Tutarlı runtime, hızlı paketleme, yoğunluk, imaj immutability ve ortamlar arası parity — sihirli güvenlik değil.' }
    ]
},

/* ========== 16 KUBERNETES ========== */
{
    id: 'ch16', num: '16', title: 'Kubernetes Temelleri',
    subtitle: 'Konteynerleri filo gibi yönet',
    group: 'devops',
    who: 'Docker bilen, "orchestration" duyan herkes.',
    intro: 'Kubernetes (K8s) konteynerleri schedule eder, self-heal eder, servis keşfi ve ölçekleme sağlar. API + etcd + controller döngüsü zihinsel modeldir.',
    levels: {
        baslangic: [
            {
                id: 'ch16-b1',
                title: 'Pod, Deployment, Service — üçlü',
                hook: 'Pod = en küçük birim. Deployment = istediğin sayıda Pod. Service = sabit kapı.',
                tags: 'kubernetes pod deployment service',
                search: 'kubernetes pod deployment service nedir',
                body: [
                    '<strong>Pod</strong>: bir veya birkaç konteyner + paylaşımlı network namespace. Direkt Pod yönetmek yerine çoğu zaman Deployment kullanırsınız.',
                    '<strong>Deployment</strong>: replica sayısı, rolling update, rollback. <strong>Service</strong>: Pod IP’leri değişse de ClusterIP/NodePort/LB ile sabit erişim.',
                    'Her şey API objesidir; YAML/JSON ile tanımlanır. <code>kubectl</code> API’nin CLI’sıdır.'
                ],
                commands: [
                    { cmd: 'kubectl get nodes', note: 'Küme ayakta mı?' },
                    { cmd: 'kubectl get pods -A', note: 'Tüm pod’lar' },
                    { cmd: 'kubectl apply -f deploy.yaml', note: 'Bildirimsel uygula' },
                    { cmd: 'kubectl rollout status deploy/myapp', note: 'Yayın durumu' }
                ],
                exercise: 'kind/minikube ile lokal küme kurup nginx Deployment+Service uygulayın.'
            }
        ],
        orta: [
            {
                id: 'ch16-o1',
                title: 'ConfigMap, Secret, Probe, Resource',
                tags: 'configmap secret probe limits',
                search: 'kubernetes configmap secret liveness readiness',
                body: [
                    'ConfigMap/Secret ile config’i imajdan ayırın. Secret etcd’de base64’tür — şifreleme ve RBAC şart; gerçek secret yönetimi için external secrets/Vault düşünün.',
                    'Readiness: trafiğe hazır mı? Liveness: ölü mü, restart et? Yanlış probe = restart storm.',
                    'requests/limits olmadan bir Pod node’u boğabilir. QoS sınıflarını bilin.'
                ],
                commands: [
                    { cmd: 'kubectl describe pod POD', note: 'Events altın madeni' },
                    { cmd: 'kubectl logs POD -c CONTAINER --tail=100', note: 'Log' },
                    { cmd: 'kubectl top pods', note: 'Metrik (metrics-server)' }
                ],
                crisis: 'CrashLoopBackOff — describe events + logs; çoğunlukla config, izin, probe veya OOM.'
            },
            {
                id: 'ch16-o2',
                title: 'Ingress, DNS ve namespace',
                tags: 'ingress namespace dns',
                search: 'kubernetes ingress namespace',
                body: [
                    'Namespace izolasyon birimi (RBAC + resource quota). Ingress/HTTPRoute dış HTTP’yi Service’lere yönlendirir.',
                    'CoreDNS küme içi isim çözümler. NetworkPolicy ile pod-to-pod trafiği kısıtlanır (CNI desteklemeli).',
                    'Senior bakış: varsayılan "herkes herkese konuşur" tehlikelidir.'
                ],
                commands: [
                    { cmd: 'kubectl get ingress -A', note: 'Giriş noktaları' },
                    { cmd: 'kubectl get netpol -A', note: 'Ağ politikaları' }
                ]
            }
        ],
        ileri: [
            {
                id: 'ch16-i1',
                title: 'RBAC, control plane ve troubleshooting zihniyeti',
                tags: 'rbac etcd scheduler',
                search: 'kubernetes rbac etcd troubleshooting',
                body: [
                    'API Server + etcd + scheduler + controller-manager = control plane. Worker: kubelet + runtime.',
                    'RBAC: Role/ClusterRole + binding. CI service account’lara cluster-admin vermek klasik felakettir.',
                    'Teşhis sırası: Deployment → ReplicaSet → Pod → Node → Events → logs → previous container → networking.'
                ],
                interview: [
                    { q: 'Rolling update sırasında downtime nasıl önlenir?', a: 'maxUnavailable/maxSurge, readiness probe, PodDisruptionBudget, bağlantı drain (preStop/terminationGrace).' },
                    { q: 'etcd neden kritik?', a: 'Küme state’inin kaynağıdır. Yedek ve şifreleme olmadan felaket kurtarma yoktur.' }
                ]
            }
        ]
    },
    chapterInterview: [
        { q: 'K8s ne zaman overkill?', a: 'Tek sunucu, tek app, küçük ekip — Compose/VM yeterli olabilir. Karmaşıklık maliyeti gerçek bir maliyettir.' }
    ]
},

/* ========== 17 CI/CD ========== */
{
    id: 'ch17', num: '17', title: 'CI/CD Pipeline',
    subtitle: 'Commit’ten prod’a güvenli yol',
    group: 'devops',
    who: 'Manuel deploy yorgunluğu çekenler.',
    intro: 'CI (Continuous Integration) her değişikliği otomatik doğrular. CD (Delivery/Deployment) paketi ortamlar boyunca ilerletir. Amaç hız değil; güvenilir hız.',
    levels: {
        baslangic: [
            {
                id: 'ch17-b1',
                title: 'CI nedir? İlk pipeline iskeleti',
                hook: '"Benim laptopumda geçti" artık kapıda kesilir.',
                tags: 'ci github actions gitlab',
                search: 'ci cd pipeline github actions',
                body: [
                    'Tipik CI: checkout → bağımlılık → lint/test → build artifact/image → tarama. Her PR’da çalışır.',
                    'GitHub Actions, GitLab CI, Jenkins... sözdizimi farklı, fikir aynı: event → job → step → artifact.',
                    'Pipeline da koddur — review edilir, pin’lenir, secret sızdırmaz.'
                ],
                steps: [
                    'Repoda .github/workflows/ci.yml (veya .gitlab-ci.yml) oluşturun.',
                    'Push’ta test çalıştırın.',
                    'Kırmızı pipeline’ı merge etmeyin — sosyal sözleşme.'
                ],
                mistakes: [
                    'Secret’ı YAML’a gömmek.',
                    'latest base image + unpinned action versiyonları.'
                ],
                exercise: 'Boş bir repo’da sadece `echo hello` yapan bir workflow yazıp çalıştırın.'
            }
        ],
        orta: [
            {
                id: 'ch17-o1',
                title: 'Artifact, ortamlar ve onay kapıları',
                tags: 'artifact staging production approval',
                search: 'cd staging production approval gate',
                body: [
                    'Aynı artifact (imaj digest) staging’den prod’a ilerlemeli — "prod’da yeniden build" anti-pattern’dir.',
                    'Environment protection: required reviewer, wait timer, branch kısıtı. Feature flag ile release’i deploy’dan ayırın.',
                    'Database migration’ları geri alınabilir tasarlayın (expand/contract).'
                ],
                callouts: [
                    { type: 'ok', title: '12-factor ipucu', text: 'Config env’den, secret vault’tan, imaj immutable tag/digest ile.' }
                ],
                crisis: 'Yanlış env’e deploy — freeze, rollback aynı digest’e, change window ve erişim review.'
            },
            {
                id: 'ch17-o2',
                title: 'Supply chain: SBOM, imza, bağımlılık',
                tags: 'sbom cosign dependabot',
                search: 'sbom cosign supply chain ci',
                body: [
                    'Bağımlılık bot’ları (Dependabot/Renovate), lockfile, image scan, SBOM ve imza (cosign) tedarik zincirini sertleştirir.',
                    'CI runner güvenliği: self-hosted runner’lar network’ünüzdedir; fork PR’larda secret vermeyin.',
                    'OIDC ile cloud’a kısa ömürlü credential — uzun ömürlü access key’leri pipeline’dan çıkarın.'
                ],
                interview: [
                    { q: 'CI’da secret nasıl verilir?', a: 'Platform secret store + maskeli log + OIDC/federation; echo ile debug yok; pull_request’ten fork’a secret yok.' }
                ]
            }
        ],
        ileri: [
            {
                id: 'ch17-i1',
                title: 'DORA metrikleri ve progressive delivery',
                tags: 'dora canary blue-green',
                search: 'dora metrics canary blue green',
                body: [
                    'DORA: deployment frequency, lead time, change fail rate, MTTR. Pipeline bu metrikleri iyileştirmek içindir.',
                    'Blue/green ve canary ile riski trafik dilimine yayın. Otomatik rollback metrik eşiğine bağlanır.',
                    'Senior: "daha çok deploy" değil "daha güvenli feedback loop" satarsınız.'
                ],
                interview: [
                    { q: 'Trunk-based vs long-lived branch?', a: 'Trunk-based kısa ömürlü branch + feature flag ile entegrasyonu erken tutar; uzun lived branch merge cehennemi yaratır.' }
                ]
            }
        ]
    },
    chapterInterview: [
        { q: 'CI ile CD farkı?', a: 'CI her değişikliği entegre/test eder. CD paketi otomatik veya onaylı şekilde ortamlara taşır. Continuous Deployment her green build’i prod’a basar; Delivery’de kapı vardır.' }
    ]
},

/* ========== 18 IAC ========== */
{
    id: 'ch18', num: '18', title: 'Ansible ve Terraform',
    subtitle: 'Altyapıyı kodla tarif et',
    group: 'devops',
    who: 'SSH ile tek tek sunucu gezenler.',
    intro: 'Terraform (veya OpenTofu) bulut kaynaklarını bildirir. Ansible yapılandırma ve orkestrasyon yapar. İkisi rakip değil; farklı katmanlar.',
    levels: {
        baslangic: [
            {
                id: 'ch18-b1',
                title: 'IaC fikri: snowflake sunucu öldü',
                hook: 'Elle kurulan sunucu belgelenemez; kodlanan sunucu çoğaltılır.',
                tags: 'iac ansible terraform',
                search: 'iac ansible terraform nedir',
                body: [
                    '<strong>Snowflake server</strong>: yıllarca elle dokunulmuş, kimsenin yeniden kuramadığı makine. IaC bunu öldürmeyi hedefler.',
                    'Terraform: VPC, VM, LB, DNS — provider API’sine CRUD. State dosyası gerçek dünya ile drift’i yönetir.',
                    'Ansible: SSH/WinRM ile paket, dosya, servis — agentless yapılandırma. Idempotent modüller altındır.'
                ],
                interview: [
                    { q: 'Ansible mı Terraform mı?', a: 'Kaynak provisioning ≈ Terraform. OS içi config/app deploy ≈ Ansible (veya cloud-init + imaj). Birçok ekip ikisini birlikte kullanır.' }
                ]
            },
            {
                id: 'ch18-b2',
                title: 'Ansible: inventory, playbook, modul',
                tags: 'ansible playbook inventory',
                search: 'ansible playbook inventory ad-hoc',
                body: [
                    'Inventory host listesidir. Playbook YAML senaryodur. Modül (apt, copy, service) işi yapar.',
                    'Ad-hoc: <code>ansible all -m ping</code>. Asıl güç playbook + rol + vault.',
                    'Check mode (<code>--check</code>) dry-run benzeri; her modül mükemmel desteklemez.'
                ],
                commands: [
                    { cmd: 'ansible all -i inventory.ini -m ping', note: 'Bağlantı test' },
                    { cmd: 'ansible-playbook -i inventory.ini site.yml --check', note: 'Dry-run' },
                    { cmd: 'ansible-playbook -i inventory.ini site.yml', note: 'Uygula' }
                ],
                exercise: 'Tek host inventory ile nginx kuran 10 satırlık playbook yazın.'
            }
        ],
        orta: [
            {
                id: 'ch18-o1',
                title: 'Terraform: plan, apply, state',
                tags: 'terraform plan state',
                search: 'terraform plan apply state',
                body: [
                    '<code>terraform plan</code> diff gösterir; <code>apply</code> uygular. State gerçek kaynak ID’lerini tutar — kaybolursa Terraform "yeniden yaratayım" sanabilir.',
                    'Remote state (S3+DynamoDB, Terraform Cloud, GCS) + locking şart. Secret’ı state’e yazmamaya çalışın (hassas output dikkat).',
                    'Modül ile tekrar kullanılabilir bloklar; workspace/environment ayrımı bilinçli olmalı.'
                ],
                commands: [
                    { cmd: 'terraform init', note: 'Provider indir' },
                    { cmd: 'terraform plan -out=tf.plan', note: 'Plan' },
                    { cmd: 'terraform apply tf.plan', note: 'Uygula' }
                ],
                mistakes: [
                    'State’i git’e commitlemek.',
                    'Elle console’dan kaynak silip state’i unutmak (veya tersi).'
                ],
                crisis: 'Yanlış workspace apply — state backup + import/untaint prosedürü, erişim kilidi.'
            },
            {
                id: 'ch18-o2',
                title: 'Idempotency, drift ve GitOps sınırı',
                tags: 'drift gitops',
                search: 'infrastructure drift gitops',
                body: [
                    'Drift: gerçek dünya koddan saptı. Düzenli plan/apply veya reconciler (Crossplane, Config Connector, Ansible cron) gerekir.',
                    'GitOps: Git desired state; agent (Argo CD/Flux) kümenin gerçek state’ini yaklaştırır.',
                    'Değişiklik PR ile gelir — "SSH ile hotfix" borcu hemen koda geri yazılmalıdır.'
                ]
            }
        ],
        ileri: [
            {
                id: 'ch18-i1',
                title: 'Policy as code ve güvenli IaC',
                tags: 'opa sentinel tflint checkov',
                search: 'opa checkov tflint policy as code',
                body: [
                    'tflint/Checkov/tfsec ile statik analiz; OPA/Conftest ile "public S3 yasak" gibi kurallar CI’da kırılır.',
                    'Least privilege cloud rolü, ayrı plan/apply rolleri, break-glass hesabı.',
                    'Senior: IaC hızı kadar blast radius’u da tasarlar.'
                ],
                interview: [
                    { q: 'terraform destroy ne zaman?', a: 'Ephemeral lab/env için. Prod’da nadiren ve korumalı; çoğu kaynak prevent_destroy ve retention politikası ister.' }
                ]
            }
        ]
    },
    chapterInterview: [
        { q: 'State neden kutsal?', a: 'Kaynak kimlik haritasıdır. Bozulursa duplicate, silme veya yönetilemeyen kaynak üretir. Remote + lock + backup zorunlu.' }
    ]
},

/* ========== 19 OBSERVABILITY ========== */
{
    id: 'ch19', num: '19', title: 'Gözlemlenebilirlik',
    subtitle: 'Log · Metrik · Trace',
    group: 'guvenlik',
    who: '"Bir şeyler yavaş" ticket’ı alan herkes.',
    intro: 'Observability, sistemin dışardan sorulabilir olmasıdır. Üç sütun: log, metrik, distributed trace. Alert yorgunluğu olmadan sinyal üretmek sanattır.',
    levels: {
        baslangic: [
            {
                id: 'ch19-b1',
                title: 'Log nedir, nereye bakarız?',
                hook: 'Önce uygulama log’u, sonra sistem, sonra altyapı.',
                tags: 'log journalctl observability',
                search: 'log journalctl greplog gözlem',
                body: [
                    'Uygulama: stdout/stderr (12-factor) veya dosya. Sistem: journald/syslog. Erişim: nginx access, auth.log.',
                    'Yapılandırılmış log (JSON) aramayı ve alarmı kolaylaştırır. Correlation id / request id şarttır.',
                    'Saklama: hot/warm/cold. Her şeyi forever tutmak hem pahalı hem KVKK/GDPR riski.'
                ],
                commands: [
                    { cmd: 'journalctl -u nginx -n 100 --no-pager', note: 'Servis log' },
                    { cmd: 'journalctl -p err -S "-1h"', note: 'Son 1 saat hata' },
                    { cmd: 'tail -F /var/log/nginx/access.log', note: 'Canlı takip' }
                ]
            }
        ],
        orta: [
            {
                id: 'ch19-o1',
                title: 'Metrik ve Prometheus modeli',
                tags: 'prometheus grafana metric',
                search: 'prometheus grafana metrik',
                body: [
                    'Metrik: sayısal zaman serisi (CPU, latency p99, queue depth). Prometheus pull model + etiket (label) boyutu.',
                    'RED (Rate, Errors, Duration) ve USE (Utilization, Saturation, Errors) yöntemleri neyi ölçeceğini söyler.',
                    'Grafana dashboard "güzel" değil "karar verdiren" olmalı. Alert: belirti (symptom) bazlı — "disk > 90%" değil sadece "müşteri hata oranı" da.'
                ],
                commands: [
                    { cmd: 'curl -s localhost:9090/api/v1/query?query=up | head', note: 'Prometheus API örnek' },
                    { cmd: 'uptime; free -h; df -h', note: 'Host’ta kaba sinyal' }
                ],
                crisis: 'Alert storm — inhibit/silence, gruplama, runbook linki, ownership.'
            },
            {
                id: 'ch19-o2',
                title: 'Tracing ve yavaşlık avı',
                tags: 'opentelemetry trace latency',
                search: 'opentelemetry tracing latency',
                body: [
                    'Distributed trace bir isteğin servisler arası yolculuğunu span’lerle çizer. "Hangi servis 800ms yedi?" sorusunun cevabıdır.',
                    'OpenTelemetry modern standarttır. Sampling stratejisi maliyeti kontrol eder.',
                    'Profiling (pyroscope/pprof) CPU/memory hot path bulur — metrik "nerede", profil "neden yavaş kod".'
                ]
            }
        ],
        ileri: [
            {
                id: 'ch19-i1',
                title: 'SLO, error budget ve on-call',
                tags: 'slo sla error budget',
                search: 'slo error budget on-call',
                body: [
                    'SLI ölçülür, SLO hedef konur, error budget ihlalde feature freeze/güçlü odak tetikler.',
                    'İyi alert: actionable, nadir, anlaşılır. Runbook zorunlu. Blameless postmortem öğrenmeyi kurumlaştırır.',
                    'Gözlemlenebilirlik güvenlikle kesişir: audit log, anomali, tespit (detect) NIST fonksiyonu.'
                ],
                interview: [
                    { q: 'Latency mi saturation mı bakarsın?', a: 'Kullanıcı etkisi latency/error; kaynak tarafı saturation/utilization. İkisini bağlayan hipotez kurarsın.' }
                ]
            }
        ]
    },
    chapterInterview: [
        { q: 'Monitoring ile observability farkı?', a: 'Monitoring bilinen soruları sorar (dashboard/alert). Observability bilinmeyenleri araştırmaya yetecek telemetriyi sağlar.' }
    ]
},

/* ========== 20 HARDENING ========== */
{
    id: 'ch20', num: '20', title: 'Hardening ve Blue Team',
    subtitle: 'Saldırı yüzeyini küçült',
    group: 'guvenlik',
    who: 'Sunucu kurup "güvenli mi?" diye soranlar; SOC’a gidenler.',
    intro: 'Offense araçlarını anlamak defense için gereklidir. Bu bölüm yama, kullanıcı, servis, ağ, audit ve detection temellerini Blue Team gözüyle işler.',
    levels: {
        baslangic: [
            {
                id: 'ch20-b1',
                title: 'Saldırı yüzeyi envanteri',
                hook: 'Açık olan her port bir kapıdır.',
                tags: 'hardening attack surface',
                search: 'hardening saldırı yüzeyi port',
                body: [
                    'Ne çalışıyor? <code>ss -tulnp</code>. Kim dinliyor? Hangi paketler kurulu? Hangi kullanıcılar login olabilir?',
                    'Gereksiz paket/servis kaldırılır (veya hiç kurulmaz). Minimal imaj = minimal CVE yüzeyi.',
                    'Güncelleme politikası: unattended-upgrades / dnf-automatic; kritik CVE için acil pencere.'
                ],
                commands: [
                    { cmd: 'sudo ss -tulnp', note: 'Dinleyen portlar' },
                    { cmd: 'systemctl list-units --type=service --state=running', note: 'Çalışan servisler' },
                    { cmd: 'apt list --upgradable 2>/dev/null | head', note: 'Bekleyen yamalar' }
                ],
                callouts: [
                    { type: 'danger', title: 'Etik', text: 'Bu teknikler yalnızca sahip olduğunuz veya yazılı izinli sistemlerde.' }
                ]
            },
            {
                id: 'ch20-b2',
                title: 'Hesap, sudo ve SSH kilidi',
                tags: 'hardening sudo ssh',
                search: 'hardening sudo ssh fail2ban',
                body: [
                    'Paylaşılan root yok. Bireysel hesap + sudo. Boş parola yok. Eski kullanıcı disable.',
                    'SSH: key only, root login no, gerekirse AllowUsers. MFA/bastion üst katman.',
                    'fail2ban/sshguard brute-force’u yavaşlatır; asıl çözüm anahtar + ağ kısıtı.'
                ],
                commands: [
                    { cmd: 'sudo grep -E "^(PermitRootLogin|PasswordAuthentication)" /etc/ssh/sshd_config', note: 'SSH politika' },
                    { cmd: 'sudo awk -F: \'$3>=1000{print $1}\' /etc/passwd', note: 'İnsan kullanıcılar' }
                ]
            }
        ],
        orta: [
            {
                id: 'ch20-o1',
                title: 'Firewall, TLS ve servis ayrımı',
                tags: 'nftables tls firewall',
                search: 'firewall nftables tls hardening',
                body: [
                    'Host firewall default deny. Sadece gereken IP/port. Cloud SG + host firewall birlikte.',
                    'Yönetim düzlemini (SSH, DB admin) ayrı security group / bastion arkasına alın.',
                    'TLS her yerde; eski protokol/cipher kapat. HSTS ve doğru sertifika zinciri.'
                ],
                commands: [
                    { cmd: 'sudo nft list ruleset 2>/dev/null | head -50', note: 'Kurallar' },
                    { cmd: 'sudo ufw status verbose 2>/dev/null', note: 'UFW varsa' }
                ]
            },
            {
                id: 'ch20-o2',
                title: 'Auditd, file integrity, detection',
                tags: 'auditd aide falco',
                search: 'auditd aide falco detection',
                body: [
                    'auditd kritik dosya/komutları kaydeder. AIDE/Tripwire bütünlük. Runtime: Falco (özellikle K8s).',
                    'Central log (SIEM): auth failures, yeni cron, yeni SUID, beklenmeyen outbound.',
                    'Blue Team döngüsü: prevent → detect → respond → recover. Sadece prevent yetmez.'
                ],
                commands: [
                    { cmd: 'sudo ausearch -m USER_LOGIN -ts recent 2>/dev/null | tail', note: 'Login audit' },
                    { cmd: 'find /usr/bin -perm -4000 -type f 2>/dev/null', note: 'SUID envanteri' }
                ],
                crisis: 'Şüpheli cron + bilinmeyen SSH key — hesap freeze, key rotate, timeline çıkar, image’den rebuild.'
            }
        ],
        ileri: [
            {
                id: 'ch20-i1',
                title: 'SELinux/AppArmor, capability, seccomp',
                tags: 'selinux apparmor capability',
                search: 'selinux apparmor seccomp capability',
                body: [
                    'MAC (Mandatory Access Control): SELinux/AppArmor DAC’ın üstüne politika koyar. "Disabled" prod anti-pattern’dir; sorunları learn/permissive ile çözüp enforcing’e dönün.',
                    'Linux capabilities root’u parçalar (NET_BIND_SERVICE vs). seccomp syscall filtresi konteynerde yaygındır.',
                    'CIS Benchmark / STIGs kontrol listesi sunar; körü körüne değil risk bazlı uygulayın.'
                ],
                interview: [
                    { q: 'Defense in depth nedir?', a: 'Tek kontrol yetmez: ağ + kimlik + host + uygulama + tespit + yedek katmanları birbirinin açıklarını telafi eder.' },
                    { q: 'Incident’te ilk izolasyon?', a: 'Ağ segmentasyonu / credential revoke / host quarantine — kanıtı bozmadan (volatile memory varsa önce topla).' }
                ]
            }
        ]
    },
    chapterInterview: [
        { q: 'Patch yönetimi stratejin?', a: 'Envanter + CVE triyajı (CVSS ≠ risk) + test ortamı + canary + rollback + acil out-of-band kanal.' }
    ]
},

/* ========== 21 TLS ========== */
{
    id: 'ch21', num: '21', title: 'TLS, Sertifika ve Gizli Yönetimi',
    subtitle: 'Şifreleme operasyonel iştir',
    group: 'guvenlik',
    who: '"Certificate expired" alarmı gören herkes.',
    intro: 'TLS sadece kilit ikonu değildir: kimlik, bütünlük, gizlilik. Sertifika yaşam döngüsü, ACME, mTLS ve secret yönetimi modern platformun omurgasıdır.',
    levels: {
        baslangic: [
            {
                id: 'ch21-b1',
                title: 'Sertifika zinciri sıfırdan',
                hook: 'Tarayıcı neden yeşil/gri/kırmızı der?',
                tags: 'tls certificate ca',
                search: 'tls sertifika ca zincir',
                body: [
                    'Sunucu sertifikası bir CA tarafından imzalanır. İstemci güvendiği kök CA’lara bakarak zinciri doğrular.',
                    'Self-signed lab için tamam; prod’da public CA (Let’s Encrypt) veya kurumsal private CA.',
                    'CN/SAN eşleşmesi, süre, revocation (CRL/OCSP) doğrulama parçalarıdır.'
                ],
                commands: [
                    { cmd: 'openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null | openssl x509 -noout -dates -subject', note: 'Uzak cert özeti' },
                    { cmd: 'echo | openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -ext subjectAltName', note: 'SAN' }
                ],
                crisis: 'Cert expired — trafik kopar. Monitoring (30/14/7 gün kala) + otomatik yenileme.'
            }
        ],
        orta: [
            {
                id: 'ch21-o1',
                title: 'Let’s Encrypt / ACME ve yenileme',
                tags: 'acme certbot lego',
                search: 'lets encrypt certbot acme',
                body: [
                    'ACME protokolü domain sahipliğini kanıtlatıp cert verir. certbot/lego/caddy otomatikleştirir.',
                    'HTTP-01 vs DNS-01: wildcard için DNS gerekir. Yenileme cron/systemd timer ile; reload nginx/caddy unutulmamalı.',
                    'Private anahtar 600; yedeklenmeli ama geniş paylaşılmamalı.'
                ],
                commands: [
                    { cmd: 'sudo certbot certificates', note: 'Mevcut cert’ler' },
                    { cmd: 'sudo certbot renew --dry-run', note: 'Yenileme testi' }
                ]
            },
            {
                id: 'ch21-o2',
                title: 'Secret management: env’den Vault’a',
                tags: 'vault sops sealed-secrets',
                search: 'vault sops secret management',
                body: [
                    '.env git’e gitmez. SOPS/age ile şifreli dosya, Vault/cloud SM ile dinamik secret, K8s’te sealed-secrets/ESO.',
                    'Rotasyon: sızdırıldığını varsay; TTL kısa tut. Audit: kim secret okudu.',
                    'CI log maskeleme ve fork PR izolasyonu şart.'
                ],
                mistakes: [
                    'Docker image içine secret bake etmek.',
                    'Tek uzun ömürlü AWS key’i tüm pipeline’larda paylaşmak.'
                ]
            }
        ],
        ileri: [
            {
                id: 'ch21-i1',
                title: 'mTLS, pinning ve tehdit modeli',
                tags: 'mtls certificate pinning',
                search: 'mtls pinning tls threat',
                body: [
                    'mTLS her iki tarafı da cert ile doğrular — service mesh (Istio/Linkerd) ve bankacılık API’lerinde yaygın.',
                    'Pinning dikkatli kullanılmalı; yanlış pin outage üretir. Spiffe/Spire kimlikleri modern yön.',
                    'Tehdit: yanlış CA trust store, algoritma zayıflığı, plaintext fallback, truncated validation.'
                ],
                interview: [
                    { q: 'TLS terminate nerede yapılır?', a: 'Edge LB, ingress veya app. Her katmanda kimlik/şifreleme ihtiyacı farklıdır; "LB’de bitsin" her zaman doğru değildir (zero-trust).' }
                ]
            }
        ]
    },
    chapterInterview: [
        { q: 'Cert yenileme P1 olmasın diye ne yaparsın?', a: 'Otomatik ACME, 30 gün alert, staging test, calendar drift check, runbook, tek kişiye bağlı süreç yok.' }
    ]
},

/* ========== 22 PLATFORM ========== */
{
    id: 'ch22', num: '22', title: 'Platform, GitOps ve Day-2',
    subtitle: 'Takımları hızlandıran katman',
    group: 'ops',
    who: 'DevOps’tan platform engineering’e geçenler.',
    intro: 'Platform engineering, her takımın aynı tekerleği yeniden icat etmesini engeller: altın yollar, self-service, güvenli default’lar. Day-2: kurduktan sonra yaşatmak.',
    levels: {
        baslangic: [
            {
                id: 'ch22-b1',
                title: 'İç geliştirici platformu (IDP) fikri',
                hook: 'Her ekibe "K8s YAML yaz" demek ölçeklenmez.',
                tags: 'platform engineering idp',
                search: 'platform engineering developer portal',
                body: [
                    'Golden path: onaylı şablonlarla (Backstage, cookiecutter, terraform module) takımlar self-service alır.',
                    'Platform ekibi ürün gibi düşünür: kullanıcı = geliştirici; SLO = "PR’dan staging’e süre".',
                    'Güvenlik sola kayar (shift-left): tarama ve politika CI’da, ama developer UX’i kırılmaz.'
                ],
                interview: [
                    { q: 'DevOps ile Platform farkı?', a: 'DevOps kültür/pratiktir. Platform engineering bu pratikleri ürünleştirilmiş self-service ile ölçekler.' }
                ]
            }
        ],
        orta: [
            {
                id: 'ch22-o1',
                title: 'GitOps ile Continuous Reconciliation',
                tags: 'argocd flux gitops',
                search: 'argocd flux gitops',
                body: [
                    'Git desired state kaynağıdır. Argo CD/Flux küme state’ini Git’e yaklaştırır. Drift görünür olur.',
                    'PR = değişiklik; onay = progressive sync. Hotfix borcu Git’e geri yazılır.',
                    'Secret’ları düz Git’e koymayın — sealed/SOPS/ESO.'
                ],
                commands: [
                    { cmd: 'kubectl get applications -n argocd 2>/dev/null', note: 'Argo app’ler' },
                    { cmd: 'flux get kustomizations 2>/dev/null', note: 'Flux durum' }
                ]
            },
            {
                id: 'ch22-o2',
                title: 'Day-2: yedek, upgrade, kapasite',
                tags: 'day2 backup upgrade capacity',
                search: 'day 2 operations backup upgrade',
                body: [
                    'Kurmak Day-0/1’dir. Day-2: yedek test (restore denemeden yedek yok sayılır), sürüm upgrade, kapasite planı, cost control.',
                    'Chaos/game day ile runbook’ları canlı tutun. Bağımlılık envanteri (SBOM + servis haritası) şart.',
                    'Teknik borç kuyruğu platform backlog’unun bir parçasıdır.'
                ],
                crisis: 'Cluster upgrade yarım kaldı — surge node, PDB, canary control plane, rollback notu.'
            }
        ],
        ileri: [
            {
                id: 'ch22-i1',
                title: 'FinOps, multi-tenant ve güvenli self-service',
                tags: 'finops multi-tenant quota',
                search: 'finops quota multi-tenant platform',
                body: [
                    'Kaynak quota, network policy, PodSecurity/PSS, image allow-list self-service’i güvenli kılar.',
                    'FinOps: etiketleme, idle kaynak, rightsizing, spot/preemptible bilinçli kullanım.',
                    'Senior platform: "hayır" demez; güvenli "evet" yolunu tasarlar.'
                ],
                interview: [
                    { q: 'İç platform başarısını nasıl ölçersin?', a: 'Time-to-first-deploy, change fail rate, self-service oranı, ticket azalması, güvenlik kontrol coverage, developer satisfaction.' }
                ]
            }
        ]
    },
    chapterInterview: [
        { q: 'Neden her şeyi tek cluster’a koymayız?', a: 'Blast radius, regülasyon, sürüm bağımsızlığı, noisy neighbor. Trade-off: maliyet ve operasyon karmaşıklığı.' }
    ]
},

/* ========== 23 GIT ========== */
{
    id: 'ch23', num: '23', title: 'Git — İşbirliği ve Değişim Kontrolü',
    subtitle: 'Commit’ten code review’a',
    group: 'devops',
    who: 'Ops, DevOps ve platform — kodu ve altyapıyı birlikte değiştirenler.',
    intro: 'Git sadece "kod kaydetmek" değildir: işbirliği, denetlenebilir değişiklik, rollback ve config-as-code’un omurgasıdır. Commit’ten review’a, bisect’ten imzalı commit’e kadar ops’un günlük silahları burada.',
    levels: {
        baslangic: [
            {
                id: 'ch23-b1',
                title: 'Clone, commit, branch — üç temel hareket',
                hook: 'Repoyu kopyala, değişikliği kaydet, işi izole et.',
                tags: 'git clone commit branch',
                search: 'git clone commit branch checkout',
                body: [
                    '<code>git clone</code> uzak repoyu lokal’e alır. Çalışma alanı + staging (<code>git add</code>) + commit geçmişi üç katmandır.',
                    'Commit: anlamlı, atomik değişiklik. Branch: paralel iş hattı — feature/bugfix/hotfix. <code>main</code>/<code>master</code> korunur; iş branch’te yapılır.',
                    'Ops’ta da aynı model: Terraform, Ansible, Helm chart hepsi Git’te yaşar. "Sunucuda elle düzelttim" = drift.'
                ],
                steps: [
                    '<code>git clone</code> ile lab repo alın.',
                    'Yeni branch: <code>git switch -c fix/readme</code>',
                    'Değiştir → <code>git add</code> → <code>git commit</code> → <code>git push -u origin HEAD</code>'
                ],
                commands: [
                    { cmd: 'git clone https://example.com/ops-config.git', note: 'Uzak repo kopyala' },
                    { cmd: 'git status; git log --oneline -5', note: 'Durum ve kısa geçmiş' },
                    { cmd: 'git switch -c feature/nginx-tune', note: 'Yeni branch' },
                    { cmd: 'git add -p && git commit -m "tune: nginx worker_connections"', note: 'Parça ekle + commit' }
                ],
                mistakes: [
                    'Her şeyi tek devasa commit’e yığmak — review ölür.',
                    '<code>git add .</code> ile secret/.env’i yanlışlıkla stage etmek.'
                ],
                exercise: 'Boş bir dizinde <code>git init</code>, iki commit, bir branch oluşturup aralarında geçiş yapın.',
                interview: [
                    { q: 'Working tree, index, HEAD farkı?', a: 'Working tree dosyalar; index (staging) bir sonraki commit adayı; HEAD mevcut commit işaretçisidir.' }
                ]
            },
            {
                id: 'ch23-b2',
                title: 'Push, pull, remote — uzak ile senkron',
                hook: 'Lokal geçmiş tek başına yetmez; ekip remote’ta buluşur.',
                tags: 'git push pull remote fetch',
                search: 'git push pull fetch remote origin',
                body: [
                    '<code>origin</code> tipik uzak addır. <code>git fetch</code> indirir ama birleştirmez; <code>git pull</code> fetch + merge/rebase yapar.',
                    'Push öncesi <code>git status</code> ve kısa <code>git log</code> alışkanlığı conflict’i erken yakalar.',
                    'Protected branch: force-push ve doğrudan main’e commit yasak — PR zorunlu.'
                ],
                commands: [
                    { cmd: 'git remote -v', note: 'Uzak adresler' },
                    { cmd: 'git fetch origin', note: 'Güncelle, birleştirme' },
                    { cmd: 'git pull --rebase origin main', note: 'Çek + rebase (tercih ekibe göre)' }
                ],
                callouts: [
                    { type: 'warn', title: 'Force push', text: '<code>--force</code> paylaşılan branch’te geçmişi siler. Gerekirse <code>--force-with-lease</code> kullanın.' }
                ],
                exercise: 'İki clone simüle edin: birinde commit push, diğerinde pull ile alın.'
            },
            {
                id: 'ch23-b3',
                title: 'Diff, stash ve geri alma temelleri',
                hook: '"Ne değişti?" ve "şimdilik kenara koy" günlük ihtiyaçtır.',
                tags: 'git diff stash restore reset',
                search: 'git diff stash restore soft reset',
                body: [
                    '<code>git diff</code> unstaged; <code>git diff --staged</code> commit adayı. Review öncesi kendi diff’inizi okuyun.',
                    '<code>git stash</code> yarım işi kenara alır. <code>git restore</code> dosyayı HEAD’e döndürür (dikkat: kayıp).',
                    'Commit’i düzeltmek: henüz push edilmediyse <code>--amend</code>; push edildiyse yeni commit tercih edilir.'
                ],
                commands: [
                    { cmd: 'git diff', note: 'Working tree farkı' },
                    { cmd: 'git stash push -m "wip nginx"', note: 'Kenara koy' },
                    { cmd: 'git restore --source=HEAD -- path/file', note: 'Dosyayı geri al' }
                ],
                mistakes: [
                    'Push edilmiş commit’i amend + force-push — ekip history bozulur.',
                    'stash’i unutup kaybetmek; <code>git stash list</code> alışkanlığı.'
                ]
            }
        ],
        orta: [
            {
                id: 'ch23-o1',
                title: 'Merge vs rebase — ne zaman hangisi?',
                hook: 'İkisi de "birleştirir"; tarihçe ve çatışma hikâyesi farklıdır.',
                tags: 'git merge rebase conflict',
                search: 'git merge vs rebase conflict',
                body: [
                    '<strong>Merge</strong>: birleştirme commit’i bırakır; tarihçe "ne zaman birleştik"i korur. Güvenli default birçok ekipte.',
                    '<strong>Rebase</strong>: commit’leri başka tabana yeniden yazar; doğrusal geçmiş. Paylaşılmış branch’te rebase = force-push riski.',
                    'Conflict: her iki yanda aynı satır. Çöz → <code>git add</code> → merge/rebase devam. "Theirs/ours" anlamını merge vs rebase’te karıştırmayın.'
                ],
                commands: [
                    { cmd: 'git merge feature/x', note: 'Merge ile birleştir' },
                    { cmd: 'git rebase main', note: 'Feature’ı main üzerine taşı' },
                    { cmd: 'git rebase --abort', note: 'Rebase’den vazgeç' }
                ],
                callouts: [
                    { type: 'info', title: 'Kural', text: 'Public/shared branch: merge. Kendi feature branch’iniz: rebase serbest (ekip sözleşmesine göre).' }
                ],
                interview: [
                    { q: 'Rebase ne zaman tehlikelidir?', a: 'Başkalarının üzerine commit attığı branch’te geçmişi yeniden yazmak; force-push ve kayıp commit riski.' }
                ]
            },
            {
                id: 'ch23-o2',
                title: 'Bisect, blame ve suçsuz teşhis',
                hook: 'Regresyonu commit’e indirgemek — tahmin değil bilim.',
                tags: 'git bisect blame log',
                search: 'git bisect blame annotate regresyon',
                body: [
                    '<code>git bisect</code> binary search ile "iyi" ve "kötü" commit arasında suçu bulur. Script’lenebilir (<code>git bisect run</code>).',
                    '<code>git blame</code> satırın hangi commit’ten geldiğini gösterir — "kim yazdı" değil "hangi değişiklik"; blameless kültür.',
                    '<code>git log -S</code> / <code>-G</code> ile kod parçası tarihçesi; ops config drift’inde altın madeni.'
                ],
                commands: [
                    { cmd: 'git bisect start; git bisect bad; git bisect good v1.2.0', note: 'Bisect başlat' },
                    { cmd: 'git blame -L 40,60 nginx.conf', note: 'Satır tarihçesi' },
                    { cmd: 'git log -S "worker_connections" --oneline', note: 'Pickaxe arama' }
                ],
                crisis: 'Prod’da dün bozuldu, yüzlerce commit — bisect + bilinen iyi tag ile daraltın.',
                exercise: 'Bilerek bozuk bir commit zinciri kurup bisect ile bulun.'
            },
            {
                id: 'ch23-o3',
                title: 'Hooks ve Conventional Commits',
                hook: 'Otomasyon kapıda; commit mesajı da API’dir.',
                tags: 'git hooks conventional commits husky',
                search: 'git hooks pre-commit conventional commits',
                body: [
                    'Hook’lar: <code>pre-commit</code> (lint/secret scan), <code>commit-msg</code> (mesaj formatı), <code>pre-push</code> (test). Client-side kolay bypass edilir — asıl kapı CI’dır.',
                    'Conventional Commits: <code>feat:</code>, <code>fix:</code>, <code>chore:</code>, <code>ci:</code>… Changelog ve semver otomasyonu besler.',
                    'Ops repolarında da aynı disiplin: <code>fix(terraform):</code> sg rule drift düzeltmesi okunabilir geçmiş demektir.'
                ],
                commands: [
                    { cmd: 'ls .git/hooks', note: 'Örnek hook şablonları' },
                    { cmd: 'echo "#!/bin/sh\\ngrep -qE \'^(feat|fix|chore|ci)(\\\\(.+\\\\))?: \' \\"\\$1\\" || exit 1" > .git/hooks/commit-msg', note: 'Basit commit-msg örneği (lab)' }
                ],
                mistakes: [
                    'Sadece local hook’a güvenip CI’da secret scan atlamak.',
                    'Anlamsız mesajlar: "update", "fix2", "asdf".'
                ]
            }
        ],
        ileri: [
            {
                id: 'ch23-i1',
                title: 'İmzalı commit ve doğrulanmış yazarlık',
                hook: 'Commit’in kimden geldiği iddia değil, kriptografik kanıt olabilir.',
                tags: 'git signed commit gpg ssh signing',
                search: 'git commit signing gpg ssh signature',
                body: [
                    'GPG veya SSH ile commit/tag imzalama: <code>git commit -S</code>. GitHub/GitLab "Verified" rozeti.',
                    'Kurumsal: zorunlu signed commit + protected branch. Çalınmış PAT ile sahte commit zorlaşır (tamamen engellemez — anahtar yönetimi şart).',
                    'Tag imzası release bütünlüğü için kritik; container/image imzasıyla (cosign) aynı zihinsel model.'
                ],
                commands: [
                    { cmd: 'git config user.signingkey ~/.ssh/id_ed25519.pub', note: 'SSH signing key (örnek)' },
                    { cmd: 'git config commit.gpgsign true', note: 'Otomatik imza' },
                    { cmd: 'git log --show-signature -1', note: 'İmzayı doğrula' }
                ],
                interview: [
                    { q: 'Signed commit neyi garanti etmez?', a: 'Kodun doğru veya güvenli olduğunu değil; belirli anahtarla imzalandığını. Anahtar çalınırsa imza da çöker.' }
                ]
            },
            {
                id: 'ch23-i2',
                title: 'Trunk-based development ve kısa ömürlü branch',
                hook: 'Uzun yaşayan branch = birleşme cehennemi ve gizli drift.',
                tags: 'trunk-based trunk based short-lived branch',
                search: 'trunk based development feature flag',
                body: [
                    'Trunk-based: sık küçük entegrasyon main’e. Feature flag ile yarım iş prod’a kod olarak girebilir, davranış kapalı kalır.',
                    'GitFlow ağırdır; ops/config repolarında çoğu zaman overkill. Kısa PR, zorunlu review, yeşil CI.',
                    'Senior işaret: "branch stratejisi araç değil, teslimat ve risk politikasıdır."'
                ],
                callouts: [
                    { type: 'info', title: 'Ops notu', text: 'Infra PR’ları da küçük olsun: tek SG kuralı ≠ tüm VPC redesign aynı PR’da.' }
                ],
                crisis: 'İki haftalık feature branch, 40 conflict — küçük PR’lara böl, pair rebase, flag ile kes.'
            },
            {
                id: 'ch23-i3',
                title: 'Ops’ta config-as-code ve Git gerçeği',
                hook: 'Sunucu gerçeği değil; Git desired state’tir — ya da hiçbiri değildir.',
                tags: 'config as code gitops infrastructure',
                search: 'config as code gitops ansible terraform',
                body: [
                    'Ansible playbook, Terraform, Kubernetes manifest, nginx conf şablonları Git’te versioned olmalı. Hotfix sonrası PR ile geri yazın.',
                    'CODEOWNERS, required review, path-based koruma: <code>prod/</code> için kıdemli onay. Secret: SOPS/sealed secrets — düz YAML’da parola yok.',
                    'Audit: "kim ne zaman prod SG’yi açtı?" cevabı Git log + CI deploy kaydıdır; SSH history tek başına yetmez.'
                ],
                commands: [
                    { cmd: 'git log --follow -- prod/terraform/sg.tf', note: 'Dosya tarihçesi' },
                    { cmd: 'git show HEAD:ansible/nginx.yml | head', note: 'Belirli revizyon içeriği' }
                ],
                interview: [
                    { q: 'Config-as-code’un başarısız sinyali?', a: 'Prod’da elle değişiklik + Git’e yazmama; drift ve "çalışan bilinmeyen" birikir.' }
                ],
                kernel: 'Git nesneleri content-addressable (blob/tree/commit); bozulma hash ile yakalanır — yedek ve fsck unutulmamalı.'
            }
        ]
    },
    chapterInterview: [
        { q: 'Neden ops Git bilmeli?', a: 'Altyapı ve config artık kod; işbirliği, rollback, review ve audit Git üzerinden yürür. SSH’ta "düzeltmek" ölçeklenmez.' }
    ]
},

/* ========== 24 CLOUD LINUX ========== */
{
    id: 'ch24', num: '24', title: 'Bulut’ta Linux',
    subtitle: 'VM, metadata, IAM, disk',
    group: 'devops',
    who: 'DC’den buluta geçen sysadmin ve cloud’da Linux işleten herkes.',
    intro: 'Bulut VM’i "uzak bir Linux" gibi görünür ama metadata servisi, IAM, security group, ephemeral disk ve faturalama modeli bare metal’den farklıdır. Bu bölüm cloud’da Linux’u güvenli ve ucuz işletmenin temellerini verir.',
    levels: {
        baslangic: [
            {
                id: 'ch24-b1',
                title: 'Cloud VM vs bare metal — zihinsel model',
                hook: 'Aynı kernel ailesi; farklı sahiplik, ağ ve hata modeli.',
                tags: 'cloud vm bare metal iaas',
                search: 'cloud vm vs bare metal iaas',
                body: [
                    'IaaS VM: hipervizör üstünde sanal donanım. Siz OS ve üstünü yönetirsiniz; fiziksel rack, PSU, çoğu ağ fabric sağlayıcıda.',
                    'Snapshot, image, recreate: "tamir et" yerine "yeniden bas" kültürü. Immutable image + cloud-init = tekrarlanabilirlik.',
                    'Noisy neighbor, credit CPU (burstable), live migration — performans varsayımlarınız DC’den farklı olabilir.'
                ],
                steps: [
                    'Sağlayıcıda küçük bir Linux VM açın (Ubuntu/Debian).',
                    'SSH ile bağlanıp <code>lscpu</code>, <code>lsblk</code>, <code>ip a</code> inceleyin.',
                    'Instance type/size dokümanında vCPU ve network limit’e bakın.'
                ],
                mistakes: [
                    'Cloud’u sadece "kiralık VPS" sanıp IAM/metadata’yı yok saymak.',
                    'Tek AZ’de "yüksek erişilebilirlik" sanmak.'
                ],
                exercise: 'Aynı image ile iki VM açıp hostname ve instance-id farkını not edin.',
                interview: [
                    { q: 'Lift-and-shift’in tuzağı?', a: 'Eski monolit VM’i olduğu gibi taşımak; autoscale, managed disk, IAM fırsatlarını kaçırmak ve maliyeti şişirmek.' }
                ]
            },
            {
                id: 'ch24-b2',
                title: 'cloud-init — ilk boot otomasyonu',
                hook: 'Yeni VM doğduğu anda kullanıcı, paket, SSH anahtarı hazır olmalı.',
                tags: 'cloud-init userdata first boot',
                search: 'cloud-init userdata yaml',
                body: [
                    'cloud-init user-data ile hostname, paket, dosya, runcmd, SSH key enjekte eder. Image + userdata = fabrika ayarı.',
                    'Idempotent düşünün: yeniden create’te aynı sonuca yakınsın. Secret’ı userdata düz metninde uzun süre tutmayın — instance metadata’da kalabilir.',
                    '<code>/var/log/cloud-init.log</code> ve <code>cloud-init status</code> ilk teşhis adresidir.'
                ],
                commands: [
                    { cmd: 'cloud-init status --long 2>/dev/null || true', note: 'cloud-init durumu' },
                    { cmd: 'sudo cat /var/log/cloud-init-output.log | tail -n 50', note: 'Boot çıktısı' },
                    { cmd: 'ls /etc/cloud/cloud.cfg.d/', note: 'Config parçaları' }
                ],
                callouts: [
                    { type: 'warn', title: 'Userdata', text: 'Userdata içinde API key bırakmak klasik sızıntıdır; IMDS + rol tercih edin.' }
                ]
            },
            {
                id: 'ch24-b3',
                title: 'Disk tipleri: kalıcı vs ephemeral',
                hook: 'Yeniden başlatınca kaybolan disk — sürpriz olmamalı.',
                tags: 'ebs ephemeral instance store disk',
                search: 'ephemeral disk ebs instance store',
                body: [
                    'Kalıcı volume (EBS vb.): VM silinse de yaşayabilir; snapshot/backup modeli net olmalı.',
                    'Ephemeral / instance store: hıza iyi, dayanıklılığa kötü — cache, scratch. Stop/terminate ile veri gider.',
                    'Root volume şifreleme, büyütme (<code>growpart</code>/<code>resize2fs</code>) ve IOPS limiti cloud’a özgüdür.'
                ],
                commands: [
                    { cmd: 'lsblk -f', note: 'Blok cihazlar' },
                    { cmd: 'df -hT', note: 'Dosya sistemi kullanımı' },
                    { cmd: 'sudo findmnt /', note: 'Root mount kaynağı' }
                ],
                mistakes: [
                    'Prod veritabanını ephemeral diske koymak.',
                    'Snapshot’ı test etmeden "yedek var" demek.'
                ],
                crisis: 'Instance recreate sonrası data yok — volume detach/attach ve snapshot restore runbook’u çalıştırın.'
            }
        ],
        orta: [
            {
                id: 'ch24-o1',
                title: 'Instance metadata ve SSRF tuzağı',
                hook: '169.254.169.254 dost değilse düşmandır.',
                tags: 'imds metadata ssrf 169.254.169.254',
                search: 'instance metadata service ssrf imdsv2',
                body: [
                    'IMDS: instance’a kimlik, userdata, geçici kimlik bilgisi verir. Uygulama SSRF ile metadata’ya giderse rol çalınır.',
                    'IMDSv2 (session token / hop limit) zorunlu kılın. Firewall’da uygulama’nın metadata’ya ihtiyacı yoksa kesmeyi düşünün.',
                    'Teşhis: <code>curl</code> ile token almadan v1’in cevap verip vermediğini lab’de kontrol edin (prod’da dikkat).'
                ],
                commands: [
                    { cmd: 'curl -s -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" -X PUT http://169.254.169.254/latest/api/token', note: 'IMDSv2 token (AWS örnek)' },
                    { cmd: 'curl -s http://169.254.169.254/latest/meta-data/ 2>/dev/null | head', note: 'v1 açık mı? (lab)' }
                ],
                callouts: [
                    { type: 'danger', title: 'SSRF', text: 'Kullanıcı kontrollü URL fetch eden her servis IMDS’i hedef alabilir. Allow-list + IMDSv2 şart.' }
                ],
                crisis: 'Şüpheli outbound + anormal API çağrıları — rol credential rotate, IMDSv2 enforce, SSRF vektörünü kapat.'
            },
            {
                id: 'ch24-o2',
                title: 'IAM rolleri vs uzun ömürlü anahtarlar',
                hook: 'Access key dosyada = ileride incident ticket’ı.',
                tags: 'iam role access key instance profile',
                search: 'iam role vs access key instance profile',
                body: [
                    'Instance/service’e rol (instance profile / managed identity) bağlayın; SDK metadata’dan geçici credential alsın.',
                    'Uzun ömürlü access key: laptop, CI, eski script — sızıntı yüzeyi geniş. Mümkünse yasaklayın veya kısa TTL + rotation.',
                    'En az yetki: S3 read-only rolü ile EC2 full admin aynı değildir. Privilege boundary ve conditional policy öğrenin.'
                ],
                mistakes: [
                    'AMI veya Git’e <code>AKIA...</code> gömmek.',
                    'Tek "god role" ile tüm filoyu çalıştırmak.'
                ],
                interview: [
                    { q: 'Neden rol key’den iyidir?', a: 'Geçici, otomatik rotate, diske yazılmaz, audit’te instance’a bağlıdır; çalınırsa TTL sınırlıdır.' }
                ]
            },
            {
                id: 'ch24-o3',
                title: 'Security group vs host firewall',
                hook: 'İki katman; ikisi de "açık 22" deyince aynı hatayı yapabilir.',
                tags: 'security group nacl iptables nftables',
                search: 'security group vs iptables firewall',
                body: [
                    'Security group / cloud firewall: hypervisor/API seviyesinde stateful filtre. Host’ta iptables/nftables/firewalld ayrı katmandır.',
                    'Sadece SG’ye güvenmek: OS içi lateral veya yanlış NSG/NACL ile şaşırma. Sadece host firewall: cloud konsolundan gelen trafiği unutmak.',
                    'Egress kontrolü çoğu ekipte zayıf kalır — C2 ve data exfil burada yürür. Default deny + gerekli çıkış.'
                ],
                commands: [
                    { cmd: 'sudo nft list ruleset 2>/dev/null | head -n 40', note: 'Host firewall' },
                    { cmd: 'ss -tulpn', note: 'Dinleyen portlar' }
                ],
                exercise: 'Lab’de SG’de 80 açık, host’ta 80 drop — hangisi kazanır gözlemleyin (sağlayıcıya göre SG önce keser).'
            }
        ],
        ileri: [
            {
                id: 'ch24-i1',
                title: 'Managed identity ve workload kimliği',
                hook: 'İnsan SSH anahtarı ölçeklenmez; iş yükü kimliği ölçeklenir.',
                tags: 'managed identity workload identity oidc',
                search: 'managed identity workload identity oidc federation',
                body: [
                    'Managed identity / workload identity: VM, pod veya CI’nın bulut API’sine anahtarsız gitmesi. OIDC federation ile GitHub Actions → cloud rol.',
                    'Kubernetes’te IRSA / Workload Identity benzeri modeller secret dosyasını öldürür.',
                    'Senior: her pipeline ve her VM için ayrı kimlik + dar policy; break-glass hesabı ayrı ve auditenir.'
                ],
                interview: [
                    { q: 'CI’da cloud’a nasıl güvenli çıkılır?', a: 'OIDC federation ile kısa ömürlü rol varsaymak; uzun access key saklamamak; environment protection rules.' }
                ]
            },
            {
                id: 'ch24-i2',
                title: 'Maliyet bilinci (FinOps) Linux işletirken',
                hook: 'Unutulan disk ve idle VM, sessiz bütçe yangınıdır.',
                tags: 'finops cost idle ebs snapshot',
                search: 'finops cloud cost idle instance',
                body: [
                    'Rightsizing: vCPU/memory fiili kullanıma göre. Burstable credit bitince sürpriz yavaşlama.',
                    'Orphan EBS, eski snapshot, idle Load Balancer, NAT gateway trafiği — Linux’ta <code>df</code> temiz olsa da fatura şişer.',
                    'Etiketleme (owner, env, service) olmadan maliyet tahsisi imkânsız. Schedule ile lab kapatma alışkanlığı.'
                ],
                commands: [
                    { cmd: 'uptime; nproc; free -h', note: 'Kaba rightsizing sinyali' },
                    { cmd: 'lsblk; df -h', note: 'Disk gerçekten kullanılıyor mu?' }
                ],
                callouts: [
                    { type: 'info', title: 'Alışkanlık', text: 'Her create’in yanında destroy/TTL notu; tag’siz kaynak = şüpheli kaynak.' }
                ],
                crisis: 'Aylık fatura 3× — idle instance, unattached volume, data transfer ve yanlış region kopyalarını tara.'
            },
            {
                id: 'ch24-i3',
                title: 'Bulut Linux sertleştirme özeti',
                hook: 'Aynı CIS disiplini; buluta özgü kontroller eklenir.',
                tags: 'cloud hardening imds encryption ssh',
                search: 'cloud linux hardening imds disk encryption',
                body: [
                    'Disk encryption at rest, IMDSv2, dar SG, SSH key veya certificate, otomatik yama kanalı (SSM/osconfig), agent ile inventory.',
                    'Serial/console erişimi break-glass için; günlük SSH yerine SSM Session Manager / OS Login düşünün.',
                    'Image pipeline: bakımlı golden image + CIS benzeri baseline; snowflake VM yasak.'
                ],
                kernel: 'Virtio disk/net, hypervisor clock, steal time (<code>steal</code> in top/mpstat) — cloud performans teşhisinde host’tan farklı sinyaller.',
                interview: [
                    { q: 'İlk 5 cloud Linux kontrolün?', a: 'IMDSv2, disk encryption, least-privilege rol, dar ingress/egress, patch + golden image.' }
                ]
            }
        ]
    },
    chapterInterview: [
        { q: 'Bulutta Linux bilmek neden yetmez "sadece SSH"?', a: 'Metadata, IAM, SG, disk yaşam döngüsü ve maliyet modeli OS bilgisinin üstüne biner; güvenlik ve para burada kaybedilir.' }
    ]
},

/* ========== 25 PYTHON OPS ========== */
{
    id: 'ch25', num: '25', title: 'Python ile Operasyon',
    subtitle: 'Ops script’lerinden API’ye',
    group: 'devops',
    who: 'Bash’ten büyüyen otomasyon yazan ops, SRE ve platform mühendisleri.',
    intro: 'Python ops’ta "her şeyi yeniden yaz" aracı değil; JSON/API, hata işleme ve yeniden kullanılabilir script’lerde Bash’in bittiği yerde devreye girer. venv’den subprocess’e, requests’ten paketlemeye kadar üretimde güvenli Python alışkanlıkları.',
    levels: {
        baslangic: [
            {
                id: 'ch25-b1',
                title: 'Neden ops’ta Python?',
                hook: 'Metin boru hattı yetmez; yapı ve API gerekir.',
                tags: 'python ops automation scripting',
                search: 'why python for ops automation',
                body: [
                    'Bash harika glue’dur: pipeline, tek satır, hızlı teşhis. JSON iç içe alan, HTTP retry, tip kontrolü ve test yazınca Python daha okunur ve güvenli olur.',
                    'Ops Python’u "web framework" değildir: küçük CLI, inventory dönüştürücü, API istemcisi, log parser. Stdlib + az bağımlılık tercih edilir.',
                    'Ekip standardı: aynı linter/format, secret’ı koda gömmeme, dry-run bayrağı. "Çalıştı benim makinemde" ops’ta kabul edilmez.'
                ],
                steps: [
                    '<code>python3 --version</code> ile runtime’ı doğrulayın.',
                    'Küçük bir görevi Bash ve Python ile yan yana yazıp okunabilirliği karşılaştırın.',
                    'Repoda <code>scripts/</code> veya <code>ops/</code> dizini ve README kuralı koyun.'
                ],
                mistakes: [
                    'Her <code>for</code> döngüsünü Python’a taşımak — gereksiz karmaşa.',
                    'Sistem Python’una global <code>pip install</code> ile saldırmak.'
                ],
                interview: [
                    { q: 'Bash mi Python mu?', a: 'Kısa pipe ve tek seferlik shell → Bash; JSON/API, hata sınıfları, test ve paylaşım → Python.' }
                ]
            },
            {
                id: 'ch25-b2',
                title: 'venv ve pip — izole ortam',
                hook: 'Global site-packages = yarın kırılan araç zinciri.',
                tags: 'venv pip virtualenv requirements',
                search: 'python venv pip requirements.txt',
                body: [
                    '<code>python3 -m venv .venv</code> proje/script setine özel interpreter + paket ağacı verir. Aktive etmeden <code>.venv/bin/python</code> ile de çalıştırabilirsiniz.',
                    '<code>pip install</code> sürüm pin’li <code>requirements.txt</code> veya lock dosyası ile. Prod host’ta "en son sürüm çek" sürprizidir.',
                    'CI ve laptop aynı constraint’i paylaşmalı. Sistem paketleri (<code>apt install python3-...</code>) ile pip’i karıştırmayın.'
                ],
                commands: [
                    { cmd: 'python3 -m venv .venv', note: 'Sanal ortam oluştur' },
                    { cmd: 'source .venv/bin/activate  # Windows: .venv\\Scripts\\activate', note: 'Aktive et' },
                    { cmd: 'python -m pip install --upgrade pip && pip install requests', note: 'pip ile paket' },
                    { cmd: 'pip freeze > requirements.txt', note: 'Pin listesi (lab)' }
                ],
                callouts: [
                    { type: 'warn', title: 'sudo pip', text: '<code>sudo pip install</code> sistem Python’unu kirletir ve OS paketlerini bozabilir. venv veya kullanıcı/izolasyon kullanın.' }
                ],
                exercise: 'Boş dizinde venv açıp <code>requests</code> kurun; <code>which python</code> venv’i göstermeli.'
            },
            {
                id: 'ch25-b3',
                title: 'argparse ile gerçek CLI script',
                hook: 'Hardcoded hostname’li script paylaşılmaz.',
                tags: 'argparse cli argparse python script',
                search: 'python argparse cli ops script',
                body: [
                    '<code>argparse</code> bayrak, alt komut ve yardım metni verir. <code>--dry-run</code>, <code>--host</code>, <code>--verbose</code> ops CLI’nin minimum setidir.',
                    '<code>if __name__ == "__main__"</code> ile import edilebilir fonksiyon + CLI girişi ayırın. Exit kodu: 0 başarı, sıfır dışı hata — monitoring bunu okur.',
                    'Kullanıcıya net hata: stack trace’i log’a, özet mesajı stderr’e. Secret’ı argv’de taşımayın (process list’te görünür).'
                ],
                commands: [
                    { cmd: 'python3 script.py --help', note: 'CLI yardım' },
                    { cmd: 'python3 script.py --host db01 --dry-run', note: 'Güvenli deneme' }
                ],
                steps: [
                    '<code>ArgumentParser</code> ile zorunlu <code>--host</code> ekleyin.',
                    '<code>--dry-run</code> true iken yan etki yapmayın.',
                    '<code>sys.exit(1)</code> ile hata kodunu döndürün.'
                ],
                mistakes: [
                    'Positional arg ile 10 parametre — okunmaz; named flag kullanın.',
                    'Help metni yazmamak — 3 ay sonra siz de unutursunuz.'
                ]
            }
        ],
        orta: [
            {
                id: 'ch25-o1',
                title: 'subprocess — dış komutları güvenli çağırma',
                hook: 'Shell=True + kullanıcı girdisi = uzaktan komut infazı.',
                tags: 'subprocess run shell=True check',
                search: 'python subprocess run ops',
                body: [
                    '<code>subprocess.run([...], check=True, capture_output=True, text=True)</code> tercih edilen modern API’dir. Argümanları liste geçin; string birleştirip shell’e vermeyin.',
                    'Timeout koyun: takılan <code>ssh</code>/<code>curl</code> worker’ı sonsuza kilitlemesin. stdout/stderr’i log’layın; hassas çıktıyı maskeleyin.',
                    'Bash pipeline’ı Python içinde yeniden icat etmeyin — gerekirse güvenilir tek komut + Python parse.'
                ],
                commands: [
                    { cmd: 'python3 -c "import subprocess; print(subprocess.run([\'uname\',\'-a\'], capture_output=True, text=True).stdout)"', note: 'Liste ile güvenli çağrı' }
                ],
                callouts: [
                    { type: 'danger', title: 'shell=True', text: 'Kullanıcı veya ticket alanını string’e yapıştırıp <code>shell=True</code> çalıştırmak klasik RCE vektörüdür.' }
                ],
                crisis: 'Otomasyon beklenmedik host’ta komut çalıştırdı — dry-run, allow-list host, audit log ve secret rotate.'
            },
            {
                id: 'ch25-o2',
                title: 'requests ile API otomasyonu',
                hook: 'Cloud ve ticketing artık CLI değil, HTTP sözleşmesi.',
                tags: 'requests http api bearer retry',
                search: 'python requests api ops automation',
                body: [
                    '<code>requests</code> ile GET/POST, header, timeout. Her çağrıda <code>timeout=</code> şart; yoksa thread asılı kalır.',
                    'Auth: env’den token (<code>os.environ</code>), koda gömülü key yasak. 401/403/429/5xx için bilinçli retry (sadece idempotent GET’te agresif).',
                    '<code>resp.raise_for_status()</code> + JSON parse. Pagination ve rate limit header’larını okuyun; thrash etmeyin.'
                ],
                commands: [
                    { cmd: 'python3 -c "import os,requests; r=requests.get(\'https://httpbin.org/get\', timeout=10); print(r.status_code)"', note: 'Basit GET + timeout' }
                ],
                mistakes: [
                    'Token’ı Git’e commit etmek.',
                    'Timeout’suz requests + sınırsız retry = self-DoS.'
                ],
                interview: [
                    { q: 'API script’te ilk 3 güvenlik kuralı?', a: 'Secret env/vault’ta; timeout; en az yetkili token + audit.' }
                ]
            },
            {
                id: 'ch25-o3',
                title: 'Log parse: satır satır, bellek bilinci',
                hook: 'Gigabayt log’u <code>readlines()</code> ile okumak OOM’dur.',
                tags: 'log parse regex jsonlines python',
                search: 'python parse logs regex json',
                body: [
                    'Dosyayı satır satır iterate edin. JSON log’da <code>json.loads</code> satır başı; düz metinde derlenmiş <code>re</code> deseni.',
                    'Çıktı: sayaç, top N IP, error budget — tüm ham log’u yeniden yazmak değil. Büyük dosyada önce <code>zgrep</code>/<code>jq</code> ile daraltmak da meşrudur.',
                    'Timezone ve multiline stack trace tuzakları: format sözleşmesini bilin; bozuk satırı yutmayıp sayın.'
                ],
                commands: [
                    { cmd: 'python3 -c "import sys; n=0\nfor line in open(\'/var/log/syslog\', errors=\'replace\'):\n n+=1\nprint(n)"', note: 'Satır say (örnek yol)' }
                ],
                exercise: 'Küçük bir access.log’da status 5xx sayan 20 satırlık script yazın.',
                callouts: [
                    { type: 'info', title: 'Hibrit', text: 'Önce shell ile filtrele, sonra Python ile aggregasyon — ikisini de kullanmak utanç değil.' }
                ]
            }
        ],
        ileri: [
            {
                id: 'ch25-i1',
                title: 'Paketleme ve dağıtım (ops gözü)',
                hook: 'Script paylaşılmazsa tek kişilik borçtur.',
                tags: 'pyproject packaging entrypoint wheel',
                search: 'python packaging pyproject.toml ops tool',
                body: [
                    'Küçük iç araç: <code>pyproject.toml</code> + console entry point veya tek dosya + <code>pipx</code>/venv. Sürüm numarası ve changelog ops için de geçerlidir.',
                    'Bağımlılığı minimize edin: stdlib yetiyorsa ek paket eklemeyin. Air-gapped ortamda wheel/cache planı şart.',
                    'Senior: tool’u image veya config repo ile birlikte version’layın; "sunucuda kopyala yapıştır .py" drift üretir.'
                ],
                interview: [
                    { q: 'Ops aracını nasıl dağıtırsın?', a: 'Pin’li paket veya imaj; entrypoint; semver; secret’sız config; CI’da test.' }
                ]
            },
            {
                id: 'ch25-i2',
                title: 'Bash mı Python mı — ne zaman hangisi?',
                hook: 'Yanlış araç seçimi bakım maliyetidir.',
                tags: 'bash vs python ops tradeoff',
                search: 'when not to use bash vs python ops',
                body: [
                    'Bash’te kal: paket kur, servis restart, tek seferlik find/grep, basit cron, POSIX’te taşınabilir ince sarmalayıcı.',
                    'Python’a geç: iç içe JSON, REST/gRPC istemcisi, birden fazla hata yolu, birim test, paylaşılan kütüphane, Windows+Linux aynı mantık.',
                    'Anti-pattern: Python’dan <code>os.system</code> ile uzun Bash romanı; veya 200 satır Bash’te JSON parser. Hibrit: Bash çağırır, Python işler.'
                ],
                mistakes: [
                    'Tüm runbook’u tek dil fanatizmine kilitlemek.',
                    'Python ile <code>cd && rm -rf</code> zinciri yazıp shell’in netliğini kaybetmek.'
                ],
                callouts: [
                    { type: 'info', title: 'Kural', text: 'Okuyan kişi 6 ay sonra sizsiniz. En az sürpriz dilini seçin.' }
                ],
                interview: [
                    { q: 'Python kullanmama gerekçen?', a: 'Tek pipeline, bağımlılık istemeyen acil müdahale, veya zaten doğru çalışan kısa shell.' }
                ]
            },
            {
                id: 'ch25-i3',
                title: 'Üretimde Python ops hijyeni',
                hook: 'Çalışan script ≠ güvenli ve gözlemlenebilir script.',
                tags: 'python ops production logging idempotent',
                search: 'python ops production best practices',
                body: [
                    'Idempotent hedefleyin: aynı komut iki kez güvenli. Kilit dosyası / lease ile çakışan cron’ları önleyin.',
                    'Yapısal log (JSON satır), correlation id, metrik: süre, başarı/hata. Sessiz <code>except:</code> yasak.',
                    'Type hint + <code>ruff</code>/<code>pytest</code> küçük olsa da ROI yüksek. Privilege: script’i root’suz çalıştırın; gerekirse tek komuta sudo.'
                ],
                crisis: 'Cron script yarım kaldı ve state bozdu — kilidi temizle, dry-run ile devam, alert’i script exit koduna bağla.'
            }
        ]
    },
    chapterInterview: [
        { q: 'Ops Python’unda ilk prensipler?', a: 'venv + pin, timeout’lu I/O, shell=True’suz subprocess, secret’sız repo, dry-run ve anlamlı exit kodu.' }
    ]
},

/* ========== 26 DATABASE OPS ========== */
{
    id: 'ch26', num: '26', title: 'Linux’ta Veritabanı Operasyonu',
    subtitle: 'PostgreSQL · backup · bağlantı',
    group: 'sistem',
    who: 'Linux üzerinde PostgreSQL/Redis işleten sysadmin, SRE ve on-call mühendisleri.',
    intro: 'Veritabanı incident’lerinin çoğu SQL bilgisinden değil; bağlantı limiti, disk, yedek ve "kim bağlanıyor?" körlüğünden çıkar. Bu bölüm psql, rol, dump/restore, bağlantı, yavaş sorgu farkındalığı ve Redis’e ops gözüyle bakar.',
    levels: {
        baslangic: [
            {
                id: 'ch26-b1',
                title: 'Kurulum ve psql ile bağlantı',
                hook: 'Önce local socket; sonra host/port/SSL.',
                tags: 'postgresql psql install connect',
                search: 'postgresql install psql connect linux',
                body: [
                    'Paket veya konteyner ile PostgreSQL ayağa kalkar; sizin işiniz servis, data directory, dinleme adresi ve auth. <code>psql</code> birincil teşhis istemcisidir.',
                    'Bağlantı: yerel peer/socket vs <code>host</code> + şifre/SSL. <code>PGHOST</code>/<code>PGUSER</code>/<code>PGDATABASE</code> env alışkanlığı script’leri sadeleştirir.',
                    '<code>\\conninfo</code>, <code>\\l</code>, <code>\\dt</code> ile "gerçekten doğru instance mı?" doğrulayın — yanlış host’a migrate klasik felakettir.'
                ],
                commands: [
                    { cmd: 'sudo systemctl status postgresql', note: 'Servis durumu' },
                    { cmd: 'psql -U postgres -c \'SELECT version();\'', note: 'Sürüm doğrula' },
                    { cmd: 'psql -h 127.0.0.1 -U app -d appdb -c \'\\conninfo\'', note: 'TCP ile bağlan' }
                ],
                steps: [
                    'Lab’de PostgreSQL kurup <code>psql</code> ile bağlanın.',
                    '<code>SHOW data_directory;</code> ve dinlenen portu not edin.',
                    'Yanlış DB’ye bağlanmamak için prompt’ta db adını görün.'
                ],
                mistakes: [
                    '<code>listen_addresses = \'*\'</code> + zayıf şifre = internete açık DB.',
                    'Prod’a VPN’siz doğrudan 5432 açmak.'
                ]
            },
            {
                id: 'ch26-b2',
                title: 'Rol ve grant temelleri',
                hook: 'Uygulama "superuser" ile bağlanıyorsa ileride pişmanlık.',
                tags: 'postgresql role grant privilege',
                search: 'postgresql roles grants basics',
                body: [
                    'Rol ≈ kullanıcı/grup. LOGIN, CREATEDB, superuser ayrı ayrı düşünülür. Uygulama rolü: sadece kendi şema/tablosuna ihtiyaç duyduğu haklar.',
                    '<code>GRANT</code>/<code>REVOKE</code> ve default privilege’lar migration sonrası "permission denied" kaynağıdır. Owner ≠ grant alan rol karışıklığı sık görülür.',
                    'İnsan erişimi: kişisel rol veya IdP; paylaşılan "admin" şifresi audit’i öldürür.'
                ],
                commands: [
                    { cmd: 'psql -c \'\\du\'', note: 'Roller listesi' },
                    { cmd: 'psql -d appdb -c \'\\dp\'', note: 'Tablo ACL’leri' }
                ],
                callouts: [
                    { type: 'warn', title: 'Least privilege', text: 'Migration kullanıcısı ile runtime kullanıcısını ayırın; runtime DROP TABLE bilmesin.' }
                ],
                interview: [
                    { q: 'App rolüne ne vermezsin?', a: 'SUPERUSER, CREATEROLE, gereksiz BYPASSRLS ve başka tenant şemalarına ALL.' }
                ]
            },
            {
                id: 'ch26-b3',
                title: 'dump ve restore — yedek kası',
                hook: 'Yedek restore edilmediyse yedek değildir.',
                tags: 'pg_dump pg_restore backup',
                search: 'pg_dump pg_restore postgresql backup',
                body: [
                    '<code>pg_dump</code> mantıksal yedek; custom/directory format restore esnekliği verir. Büyük DB’de paralel dump/restore ve disk alanı planı şart.',
                    'Restore denemesi staging’de düzenli yapılmalı. Ownership, extension ve rol bağımlılıkları dump’ta eksik kalabilir.',
                    'WAL arşiv / PITR ayrı katmandır; sadece nightly dump "her noktaya dönüş" değildir. RPO/RTO’yu net yazın.'
                ],
                commands: [
                    { cmd: 'pg_dump -Fc -f appdb.dump appdb', note: 'Custom format dump' },
                    { cmd: 'pg_restore -d appdb_new --exit-on-error appdb.dump', note: 'Restore (lab)' },
                    { cmd: 'pg_dumpall -g -f roles.sql', note: 'Global roller (dikkat)' }
                ],
                exercise: 'Küçük DB dump alıp ayrı bir database’e restore edin; satır sayısını karşılaştırın.',
                crisis: 'Yedek dosyası var ama restore fail — staging’de aynı komutu çalıştırıp extension/owner hatalarını düzeltin.'
            }
        ],
        orta: [
            {
                id: 'ch26-o1',
                title: 'Bağlantı limitleri ve pool',
                hook: 'max_connections dolunca uygulama "DB öldü" der.',
                tags: 'max_connections pgbouncer pool',
                search: 'postgresql max_connections pgbouncer',
                body: [
                    'Her bağlantı bellek yer. <code>max_connections</code> yüksek tutmak çözüm değil; connection pool (PgBouncer) çoğu web app için zorunludur.',
                    'Teşhis: <code>pg_stat_activity</code> — idle in transaction, bekleyen, kim çoğaltıyor? App side pool + DB side pool çift katman tuzağına dikkat.',
                    'OS: <code>ss</code>/<code>ulimit</code> ve systemd limit’leri de bağlantıyı kesebilir — sadece Postgres’e bakmayın.'
                ],
                commands: [
                    { cmd: 'psql -c \'SHOW max_connections;\'', note: 'Üst sınır' },
                    { cmd: 'psql -c \'SELECT count(*), state FROM pg_stat_activity GROUP BY 2;\'', note: 'Bağlantı durumları' },
                    { cmd: 'ss -tnp | grep 5432 | wc -l', note: 'OS tarafı TCP' }
                ],
                mistakes: [
                    'Her pod’a pool_size=50 vermek — replica başına yüzlerce bağlantı.',
                    'Idle in transaction’ı görmezden gelmek.'
                ],
                crisis: 'too many connections — idle oturumları temizle, pool’u düşür, geçici max_connections artırırken bellek hesabı yap.'
            },
            {
                id: 'ch26-o2',
                title: 'Yavaş sorgu farkındalığı',
                hook: 'CPU %90 çoğu zaman "kötü plan + eksik index".',
                tags: 'pg_stat_statements explain analyze slow query',
                search: 'postgresql slow query explain analyze',
                body: [
                    '<code>pg_stat_statements</code> (açıksa) toplam süre/çağrı gösterir. Anlık için <code>pg_stat_activity</code> + <code>wait_event</code>.',
                    '<code>EXPLAIN (ANALYZE, BUFFERS)</code> planı doğrular — prod’da dikkatli; uzun ANALYZE yük bindir. Seq scan + büyük tablo = kırmızı bayrak.',
                    'Ops rolü: geliştiriciye kanıt taşımak (sorgu, süre, plan); körlemesine <code>VACUUM FULL</code> veya restart ilk adım olmamalı.'
                ],
                commands: [
                    { cmd: 'psql -c "SELECT pid, now()-query_start AS dur, state, left(query,80) FROM pg_stat_activity WHERE state <> \'idle\' ORDER BY 2 DESC LIMIT 10;"', note: 'Uzun süren oturumlar' }
                ],
                callouts: [
                    { type: 'info', title: 'Lock', text: 'Yavaşlık bazen CPU değil lock wait’tir — <code>wait_event_type</code> okuyun.' }
                ],
                interview: [
                    { q: 'İlk yavaşlık checklist?', a: 'Connections, locks, disk/IO, hot query + EXPLAIN, recent deploy/migration.' }
                ]
            },
            {
                id: 'ch26-o3',
                title: 'Redis — ops için temel',
                hook: 'Cache değilse de "tek instance bellek" riski aynıdır.',
                tags: 'redis ops memory persistence',
                search: 'redis basics for linux ops',
                body: [
                    'Redis: bellek içi veri yapısı; session/cache/queue. Ops: bellek tavanı, eviction policy, persistence (RDB/AOF) ve bağlanan istemci sayısı.',
                    '<code>INFO</code>, <code>MEMORY</code>, slowlog — teşhis seti. maxmemory yoksa OOM killer host’u vurabilir.',
                    'Prod’da açık <code>FLUSHALL</code> ve şifresiz bind 0.0.0.0 klasik kazalar. Auth + ağ politikası + ayrı instance roller.'
                ],
                commands: [
                    { cmd: 'redis-cli INFO memory | head', note: 'Bellek özeti' },
                    { cmd: 'redis-cli INFO clients', note: 'İstemci sayısı' },
                    { cmd: 'redis-cli SLOWLOG GET 5', note: 'Yavaş komutlar' }
                ],
                mistakes: [
                    'Redis’i tek kaynak gerçeği sanıp yedeksiz kritik veri yazmak.',
                    'maxmemory’siz "cache" = host OOM.'
                ]
            }
        ],
        ileri: [
            {
                id: 'ch26-i1',
                title: 'Incident: sorun veritabanı mı?',
                hook: 'App 500 atınca herkes Postgres’e bakmasın — ama bazen gerçekten o.',
                tags: 'database incident runbook oncall',
                search: 'database incident response postgresql',
                body: [
                    'Sinyal üçgeni: app latency/error, DB CPU/IO/connections/locks, altyapı (disk full, network). Tek metrik ile suçlama yapmayın.',
                    'İlk dakikalar: yazılabilir mi (<code>SELECT 1</code>), disk (<code>df</code>), connection saturation, uzun transaction, replication lag. Değişiklik penceresi: deploy/migration?',
                    'Mitigasyon sırası: zararlı sorguyu öldür / pool throttle / read replica’ya kaydır / feature flag — kör restart son çare (recovery ve bağlantı fırtınası).'
                ],
                steps: [
                    'Health: <code>psql -c \'SELECT 1\'</code> ve disk doluluğu.',
                    '<code>pg_stat_activity</code> + locks özeti.',
                    'App tarafı error budget ve son deploy’u doğrula.'
                ],
                crisis: 'Disk %100 — WAL/temp şişmesi: acil büyüme veya güvenli temizlik runbook; asla rastgele data file silmeyin.',
                interview: [
                    { q: 'DB restart öncesi ne sorarsın?', a: 'Bağlantı/lock/disk/replication durumu ve restart’ın traffic storm yaratıp yaratmayacağı; önce semptomu kes.' }
                ]
            },
            {
                id: 'ch26-i2',
                title: 'Yedek, replica ve Day-2 disiplini',
                hook: 'Single primary + test edilmemiş dump = tek nokta felaket.',
                tags: 'replica wal backup day2 postgresql',
                search: 'postgresql replica backup day 2 ops',
                body: [
                    'Streaming replica okuma ölçeği ve failover adayıdır; uygulama connection string ve failover prosedürü yazılı olmadan "HA var" demeyin.',
                    'Backup: dump + (mümkünse) PITR; restore drill takvimi. Object storage’a giden yedeklerin şifreleme ve retention politikası.',
                    'Day-2: vacuum/analyze sağlığı, bloat farkındalığı, major upgrade prova, extension uyumu. Monitoring: lag, dead tuples, connection, disk forecast.'
                ],
                callouts: [
                    { type: 'danger', title: 'Failover', text: 'Split-brain’ten korkun: fencing ve tek primary garantisi olmadan iki yazıcı = veri kaybı.' }
                ],
                interview: [
                    { q: 'RPO/RTO’yu nasıl kanıtlarsın?', a: 'Düzenli restore ve failover tatbikatı ile; dokümandaki sayı değil, ölçülen süre.' }
                ]
            }
        ]
    },
    chapterInterview: [
        { q: 'Linux’ta DB ops’un omurgası?', a: 'Güvenli erişim, ölçülmüş bağlantı, yedek+restore tatbikatı, yavaş sorgu/lock teşhisi ve incident’te kanıta dayalı mitigasyon.' }
    ]
},

/* ========== 27 İLERİ AĞ / LB ========== */
{
    id: 'ch27', num: '27', title: 'İleri Ağ ve Yük Dengeleme',
    subtitle: 'VIP · HAProxy · keepalived',
    group: 'sistem',
    who: 'Birden fazla backend’i ayakta tutan sysadmin, SRE ve platform ekipleri.',
    intro: 'Tek sunucu bittiğinde trafik VIP, load balancer ve health check ile dağılır. Bu bölüm TCP keepalive, conntrack, HAProxy/nginx LB temelleri, sticky session tradeoff’ları, keepalived/VRRP fikri, DNS round-robin sınırları ve 502/504 teşhisini işler.',
    levels: {
        baslangic: [
            {
                id: 'ch27-b1',
                title: 'TCP keepalive — bağlantı canlı mı?',
                hook: 'Idle TCP "öldü" sanılır; firewall sessizce state siler.',
                tags: 'tcp keepalive idle timeout',
                search: 'tcp keepalive linux net.ipv4.tcp_keepalive',
                body: [
                    '<strong>TCP keepalive</strong>, uzun süre sessiz kalan bağlantıda karşı tarafın hâlâ orada olduğunu yoklayan probe’lardır. Uygulama katmanı heartbeat’i ile karıştırmayın — biri kernel/TCP, diğeri protokol.',
                    'LB, NAT ve stateful firewall idle timeout’ları keepalive’den kısa olabilir; "bazen kopuyor" şikâyeti çoğu zaman buradan çıkar.',
                    'Sysctl: <code>tcp_keepalive_time</code>, <code>_intvl</code>, <code>_probes</code>. App/LB tarafında da idle timeout’ları bilinçli hizalayın.'
                ],
                commands: [
                    { cmd: 'sysctl net.ipv4.tcp_keepalive_time net.ipv4.tcp_keepalive_intvl net.ipv4.tcp_keepalive_probes', note: 'Kernel keepalive' },
                    { cmd: 'ss -tno | head', note: 'Timer / keepalive ipucu' }
                ],
                mistakes: [
                    'Sadece sysctl değiştirip LB idle timeout’unu unutmak.',
                    'Keepalive’i "bağlantıyı sonsuza kadar açık tutar" sanmak.'
                ],
                interview: [
                    { q: 'Neden VPN arkasında SSH düşer?', a: 'Ortadaki NAT/firewall idle state’i siler; ServerAliveInterval veya TCP keepalive süreyi kısaltır.' }
                ]
            },
            {
                id: 'ch27-b2',
                title: 'conntrack — state tablosu',
                hook: 'NAT ve firewall "hatırlamak" zorunda; tablo dolunca yeni akış ölür.',
                tags: 'conntrack nf_conntrack nat',
                search: 'conntrack table full linux nat',
                body: [
                    '<strong>conntrack</strong>, netfilter’ın bağlantı durumu tablosudur: SNAT/DNAT, firewall state, bazen LB hairpin buraya yaslanır.',
                    'Semptom: rastgele timeout, "connection reset", dmesg’de <code>nf_conntrack: table full</code>. Çözüm körce hashsize artırmak değil; kısa ömürlü bağlantı fırtınası ve timeout’ları da incelemek.',
                    '<code>conntrack -L</code> / <code>ss</code> ile kim çoğaltıyor görün; ephemeral port tükenmesi ayrı ama sık kardeş problemdir.'
                ],
                commands: [
                    { cmd: 'sudo sysctl net.netfilter.nf_conntrack_count net.netfilter.nf_conntrack_max', note: 'Doluluk' },
                    { cmd: 'sudo conntrack -C 2>/dev/null || cat /proc/sys/net/netfilter/nf_conntrack_count', note: 'Anlık kayıt' },
                    { cmd: 'dmesg | grep -i conntrack | tail', note: 'Table full izi' }
                ],
                crisis: 'table full — max/hash ayarı + timeout + bağlantı sızıntısı (app pool, health check aşırı agresif).',
                callouts: [
                    { type: 'warn', title: 'Konteyner', text: 'Host conntrack tüm pod trafiğini paylaşabilir; yoğun kube-node’da limit planı şart.' }
                ]
            },
            {
                id: 'ch27-b3',
                title: 'DNS round-robin sınırları',
                hook: 'Birden fazla A kaydı ≠ gerçek yük dengeleme.',
                tags: 'dns round-robin ttl load balancing',
                search: 'dns round robin limits load balancing',
                body: [
                    'DNS RR istemciye sırayla/karışık IP verir; health check bilmez, hasta sunucuyu çıkarmaz, sticky/session bilmez.',
                    'TTL uzunsa failover yavaştır; TTL kısaysa resolver cache ve istemci davranışı yine tutarsızdır. Birçok istemci ilk IP’ye yapışır.',
                    'Prod’da asıl iş: VIP + LB (veya anycast/service mesh). DNS RR lab ve kaba dağıtım içindir — SLA vaadi değil.'
                ],
                commands: [
                    { cmd: 'dig +short example.com A', note: 'Birden fazla A?' },
                    { cmd: 'getent ahostsv4 example.com', note: 'Sistem çözüm sırası' }
                ],
                mistakes: [
                    'DNS RR ile "HA yaptık" deyip health’siz IP bırakmak.',
                    'TTL=0 umudu — istemci ve ara cache yine tutar.'
                ]
            }
        ],
        orta: [
            {
                id: 'ch27-o1',
                title: 'HAProxy / nginx LB temelleri',
                hook: 'Tek VIP, arkada N sağlıklı backend.',
                tags: 'haproxy nginx load balancer reverse proxy',
                search: 'haproxy nginx load balancer basics',
                body: [
                    '<strong>L4</strong> (TCP) vs <strong>L7</strong> (HTTP): TCP hızlı ve genel; HTTP host/path, header, retry ve daha zengin health verir.',
                    'HAProxy klasik yüksek performanslı LB; nginx reverse proxy + upstream ile de LB yapar. Ortak model: frontend (bind) → backend pool → server satırları.',
                    'X-Forwarded-For / PROXY protocol olmadan uygulama gerçek istemci IP’sini göremez — log ve rate-limit bozulur.'
                ],
                commands: [
                    { cmd: 'haproxy -c -f /etc/haproxy/haproxy.cfg', note: 'Config sözdizimi' },
                    { cmd: 'nginx -t', note: 'nginx config test' },
                    { cmd: 'ss -tlnp | grep -E \':80|:443|:8404\'', note: 'LB dinliyor mu?' }
                ],
                steps: [
                    'Lab’de iki backend + bir LB ile /health yayınlayın.',
                    'Bir backend’i durdurup trafiğin diğerine kaydığını doğrulayın.',
                    'Access log’da hangi upstream’e gittiğini görün.'
                ],
                interview: [
                    { q: 'L4 mü L7 mi?', a: 'TLS passthrough veya non-HTTP için L4; path bazlı routing, header, uygulama health için L7.' }
                ]
            },
            {
                id: 'ch27-o2',
                title: 'Health check — hasta üyeyi çıkar',
                hook: 'Check yoksa LB kör dağıtır.',
                tags: 'health check active passive rise fall',
                search: 'load balancer health check rise fall',
                body: [
                    '<strong>Active check</strong>: LB periyodik HTTP/TCP probe atar. <strong>Passive</strong>: gerçek trafik hatalarından öğrenir. İkisi birlikte sık kullanılır.',
                    'rise/fall eşikleri flapping’i önler. Check path’i iş kuralını yansıtmalı: <code>/</code> 200 dönüp DB down ise yanıltıcıdır — <code>/ready</code> ayrı olsun.',
                    'Aşırı agresif check conntrack ve backend’i yorar; çok yavaş check failover’ı geciktirir. Timeout/interval bilimi.'
                ],
                commands: [
                    { cmd: 'curl -sS -o /dev/null -w \'%{http_code}\\n\' http://127.0.0.1:8080/ready', note: 'Readiness doğrula' },
                    { cmd: 'curl -sS http://127.0.0.1:8404/stats | head', note: 'HAProxy stats (örnek)' }
                ],
                callouts: [
                    { type: 'info', title: 'Kubernetes', text: 'readinessProbe ≈ pool’dan çıkar; livenessProbe restart — karıştırmayın.' }
                ],
                mistakes: [
                    'Health endpoint’in her zaman 200 dönmesi (yanlış pozitif).',
                    'Check’i authentication’lı private path’e bağlayıp LB’yi sürekli fail etmek.'
                ]
            },
            {
                id: 'ch27-o3',
                title: 'Sticky session tradeoff’ları',
                hook: 'Aynı kullanıcı hep aynı sunucuya — kolay ama kırılgan.',
                tags: 'sticky session affinity cookie balance',
                search: 'sticky session load balancer tradeoffs',
                body: [
                    'Session affinity (cookie, source IP hash) state’i tek backend’de tutar; ölçek ve failover zorlaşır — o sunucu gidince oturum ölür.',
                    'Tercih edilen model: state’i dışarıda tut (Redis, JWT, DB). Sticky geçici köprüdür, mimari hedef değil.',
                    'Source IP hash NAT arkasında tek IP’ye yığılır; cookie affinity L7 ister. Dağılım adaleti vs operasyonel riski bilinçli seçin.'
                ],
                mistakes: [
                    'Sticky + uzun drain olmadan deploy = toplu logout.',
                    'IP hash ile "eşit yük" beklemek (kurumsal NAT).'
                ],
                interview: [
                    { q: 'Sticky ne zaman kabul edilir?', a: 'Legacy app state’i local tutuyorsa kısa vadede; uzun vadede externalize + sticky’yi kaldır.' }
                ]
            }
        ],
        ileri: [
            {
                id: 'ch27-i1',
                title: 'keepalived ve VRRP fikri',
                hook: 'VIP tek makinede ölmesin diye master/backup yarışı.',
                tags: 'keepalived vrrp vip floating ip',
                search: 'keepalived vrrp floating vip',
                body: [
                    '<strong>VRRP</strong> ile keepalived bir <strong>floating VIP</strong> için master seçer; master düşünce backup VIP’i üstlenir. LB process’inden ayrı bir HA katmanıdır.',
                    'Kritik: split-brain (iki master) ve fencing. Cloud’da çoğu zaman native LB / failover IP API’si VRRP’nin yerini alır — aynı fikri farklı API ile.',
                    'notify script’leri ile "VIP bende" anında servis başlat/durdur veya route duyurusu yapılır; race condition test edilmeli.'
                ],
                commands: [
                    { cmd: 'ip -br addr show', note: 'VIP hangi host’ta?' },
                    { cmd: 'systemctl status keepalived', note: 'keepalived durumu' },
                    { cmd: 'journalctl -u keepalived -n 50 --no-pager', note: 'Transition log' }
                ],
                crisis: 'İki node VIP reklam ediyor — VRRP auth/network partition; hemen çakışmayı kes, ARP/komşu tablosunu doğrula.',
                callouts: [
                    { type: 'danger', title: 'Güvenlik', text: 'VRRP multicast/unicast’i kimsenin spoof edememesi için auth ve izolasyon şart.' }
                ]
            },
            {
                id: 'ch27-i2',
                title: '502 / 504 teşhisi',
                hook: 'Kullanıcı "site öldü" der; aslında proxy upstream’e kızgındır.',
                tags: 'http 502 504 bad gateway timeout',
                search: 'troubleshoot 502 504 haproxy nginx',
                body: [
                    '<strong>502 Bad Gateway</strong>: proxy upstream’den geçersiz/boş yanıt aldı (process down, crash, yanlış port, TLS mismatch). <strong>504 Gateway Timeout</strong>: upstream süre içinde cevap vermedi.',
                    'Zincir: DNS → VIP/LB → upstream IP:port → app listen → app latency (DB/lock). Her hop’ta <code>curl -v</code> ve LB log (upstream status, timing).',
                    'conntrack full, backlog dolu, thread pool bitmiş, slow upstream — hepsi 504 üretebilir. Sadece "app restart" ile başlamayın; kanıt toplayın.'
                ],
                steps: [
                    'LB’den backend’e doğrudan <code>curl</code> (Host header ile).',
                    'Backend <code>ss -tlnp</code> ve app log / journal.',
                    'Timeout değerlerini (proxy vs app vs DB) karşılaştırın.'
                ],
                commands: [
                    { cmd: 'curl -sS -o /dev/null -w \'%{http_code} time=%{time_total}\\n\' http://backend:8080/ready', note: 'Upstream latency' },
                    { cmd: 'journalctl -u nginx -u haproxy -n 100 --no-pager', note: 'Proxy hata izi' }
                ],
                interview: [
                    { q: '502 ile 504 ayrımı?', a: '502 = upstream yanıtı yok/bozuk; 504 = yanıt gecikti. İlkinde dinleme/crash, ikincisinde yavaş bağımlılık veya düşük timeout.' }
                ]
            },
            {
                id: 'ch27-i3',
                title: 'LB incident runbook zihniyeti',
                hook: 'Trafiği körlemesine kesmek yerine semptomu izole et.',
                tags: 'load balancer incident drain runbook',
                search: 'load balancer incident response drain',
                body: [
                    'Sıra: kapsam (tek AZ mi, tüm VIP mi?) → LB stats (backend UP/DOWN, queue) → bir backend’e bypass curl → ağ/conntrack → app.',
                    'Mitigasyon: hasta üyeyi disable/drain, capacity ekle, feature flag, geçici timeout gevşetmesi (bilinçli). VIP’i rastgele başka host’a taşımak son çare.',
                    'Postmortem’de health check kalitesi, deploy drain süresi ve sticky bağımlılığı mutlaka sorulsun.'
                ],
                exercise: 'Lab’de bir backend’i kill edip LB stats’ta DOWN görünceye kadar süreyi ölçün; fall eşiğini tartışın.'
            }
        ]
    },
    chapterInterview: [
        { q: 'İyi bir LB tasarımının omurgası?', a: 'Doğru katman (L4/L7), dürüst health check, state’i dışarıda tutma, VIP/HA planı ve 502/504 için hop-hop teşhis disiplini.' }
    ]
},

/* ========== 28 SYSTEMD TIMER ========== */
{
    id: 'ch28', num: '28', title: 'systemd Timer ve Servis Derinliği',
    subtitle: 'cron’dan modern zamanlamaya',
    group: 'sistem',
    who: 'cron’u bırakıp unit dosyasıyla düşünen sysadmin ve platform mühendisleri.',
    intro: 'systemd sadece "servis başlatıcı" değildir: timer, socket, hardening ve journal ile modern Linux’un operasyon omurgasıdır. Bu bölüm unit tipleri, timer vs cron, OnCalendar, Persistent, koruma direktifleri, socket activation ve systemctl/journalctl ile debug’ı işler.',
    levels: {
        baslangic: [
            {
                id: 'ch28-b1',
                title: 'Unit tiplerine genel bakış',
                hook: '.service sadece buzdağının görünen kısmı.',
                tags: 'systemd unit types service timer socket',
                search: 'systemd unit types overview',
                body: [
                    'Sık görülenler: <code>.service</code> (süreç), <code>.timer</code> (zamanlama), <code>.socket</code> (dinleme/aktivasyon), <code>.mount</code>, <code>.target</code> (gruplama), <code>.path</code> (dosya olayı).',
                    'Her unit bir birim dosyasıdır (<code>/etc/systemd/system</code> override için). <code>systemctl cat</code> birleşik görünümü verir.',
                    'Bağımlılık dili: <code>After=</code>, <code>Requires=</code>, <code>Wants=</code>, <code>PartOf=</code> — "ne zaman" ile "zorunlu mu" ayrılır.'
                ],
                commands: [
                    { cmd: 'systemctl --type=service --state=running | head', note: 'Çalışan servisler' },
                    { cmd: 'systemctl list-units --type=timer', note: 'Timer’lar' },
                    { cmd: 'systemctl cat ssh.service | head -n 40', note: 'Birleşik unit' }
                ],
                interview: [
                    { q: 'target nedir?', a: 'Çoğu zaman bir senkron noktası/grup (multi-user.target); servis değil, bağımlılık grafiğinin düğümü.' }
                ]
            },
            {
                id: 'ch28-b2',
                title: 'Timer vs cron',
                hook: 'Aynı iş: periyodik komut — farklı operasyon modeli.',
                tags: 'systemd timer vs cron',
                search: 'systemd timer vs cron',
                body: [
                    'cron: crontab satırı, mail ile çıktı geleneği, kullanıcı bağlamı klasik. systemd timer: unit olarak log, bağımlılık, cgroup, restart politikası ve hardening ile aynı dil.',
                    'Timer bir <code>.timer</code> + tetiklediği <code>.service</code> çiftidir. Servisi elle de çalıştırabilirsiniz — zamanlama ile iş mantığı ayrılır.',
                    'Migrasyon: basit gece job’ları timer’a alırken <code>User=</code>, çalışma dizini ve environment’ı bilinçli taşıyın.'
                ],
                commands: [
                    { cmd: 'systemctl list-timers --all | head', note: 'Son/sonraki çalıştırma' },
                    { cmd: 'crontab -l 2>/dev/null; ls /etc/cron.* 2>/dev/null | head', note: 'Eski dünya' }
                ],
                mistakes: [
                    'Hem cron hem timer ile aynı job’u çift çalıştırmak.',
                    'Timer’ı enable edip service’i unutmak (veya tersi).'
                ],
                callouts: [
                    { type: 'info', title: 'Ne zaman cron?', text: 'Çok eski gömülü sistemler veya bilinçli olarak cron-only politika; yeni sunucuda timer tercih edilir.' }
                ]
            },
            {
                id: 'ch28-b3',
                title: 'OnCalendar — takvim ifadesi',
                hook: 'cron alanlarından daha okunur zaman dili.',
                tags: 'OnCalendar systemd timer calendar',
                search: 'systemd OnCalendar examples',
                body: [
                    '<code>OnCalendar=</code> insan diline yakın ifadeler kullanır: <code>daily</code>, <code>Mon *-*-* 03:00:00</code>, <code>hourly</code>. Doğrulama: <code>systemd-analyze calendar</code>.',
                    'Monotonic alternatifler: <code>OnBootSec=</code>, <code>OnUnitActiveSec=</code> — "boot’tan N sonra" veya "son çalışmadan N sonra".',
                    'Timezone: sistem saatine dikkat (UTC vs local). Yaz saatı geçişlerinde takvim job’ları şaşırtabilir — kritik işlerde UTC düşünün.'
                ],
                commands: [
                    { cmd: 'systemd-analyze calendar \'Mon *-*-* 03:00:00\'', note: 'İfadeyi doğrula' },
                    { cmd: 'systemctl list-timers', note: 'NEXT sütununa bak' }
                ],
                exercise: 'Hafta içi 04:30’da çalışan bir oneshot service + timer yazıp <code>list-timers</code> ile NEXT’i doğrulayın.',
                steps: [
                    '<code>myjob.service</code> (Type=oneshot) oluşturun.',
                    '<code>myjob.timer</code> içinde OnCalendar tanımlayın.',
                    '<code>systemctl enable --now myjob.timer</code>'
                ]
            }
        ],
        orta: [
            {
                id: 'ch28-o1',
                title: 'Persistent=true — kaçırılan vuruş',
                hook: 'Makine kapalıyken saat geçtiyse job unutulsun mu?',
                tags: 'Persistent systemd timer catch-up',
                search: 'systemd timer Persistent=true',
                body: [
                    '<code>Persistent=true</code> ile timer, kapalı/askıdayken kaçan takvim vuruşunu boot sonrası telafi etmeye çalışır (catch-up). Yedekleme gibi "mutlaka olsun" işler için sık açılır.',
                    'Yan etki: uzun downtime sonrası boot’ta ağır job birikmesi. <code>RandomizedDelaySec=</code> sürü halinde aynı anda kalkmayı yumuşatır.',
                    'Catch-up istemiyorsanız Persistent bırakmayın; "sadece o saatte ayaktaysa çalış" modeli net olsun.'
                ],
                commands: [
                    { cmd: 'systemctl cat apt-daily.timer 2>/dev/null | head -n 30', note: 'Distro örneği' },
                    { cmd: 'systemctl show apt-daily.timer -p Persistent -p LastTriggerUSec', note: 'Özellikler' }
                ],
                mistakes: [
                    'Persistent + uzun süren job + sık takvim = bindirme (overlap); <code>RefuseManualStart</code> / locking düşünün.',
                    'Catch-up’ın "tüm kaçan günleri teker teker" çalıştıracağını sanmak — genelde bir tetikleme telafisidir.'
                ]
            },
            {
                id: 'ch28-o2',
                title: 'Hardening direktifleri',
                hook: 'Servis root olsa bile kafesi küçült.',
                tags: 'ProtectSystem NoNewPrivileges hardening systemd',
                search: 'systemd ProtectSystem NoNewPrivileges',
                body: [
                    '<code>ProtectSystem=</code> (strict/full), <code>ProtectHome=</code>, <code>PrivateTmp=</code>, <code>NoNewPrivileges=</code>, <code>CapabilityBoundingSet=</code>, <code>ReadWritePaths=</code> — saldırı yüzeyini unit dosyasından keser.',
                    'Aşırı sertleştirme servisi kırar: yazması gereken path’i ReadOnly bırakmak klasik. <code>systemd-analyze security</code> skor ve öneri verir.',
                    'Least privilege: önce <code>User=</code> ile düşür, sonra filesystem ve capability kafesini sık. "Root + ProtectSystem" tek başına yetmez ama önemlidir.'
                ],
                commands: [
                    { cmd: 'systemd-analyze security ssh.service | head', note: 'Güvenlik özeti' },
                    { cmd: 'systemctl cat nginx.service | grep -E \'^Protect|^NoNew|^Private|^User\'', note: 'Mevcut kafes' }
                ],
                callouts: [
                    { type: 'warn', title: 'Drop-in', text: 'Vendor dosyasını direkt edit etmeyin; <code>/etc/systemd/system/foo.service.d/override.conf</code> kullanın.' }
                ],
                interview: [
                    { q: 'NoNewPrivileges neyi keser?', a: 'Exec sonrası privilege yükseltme (setuid vb.) yollarını engellemeye yardım eder; tek başına sandbox değildir.' }
                ]
            },
            {
                id: 'ch28-o3',
                title: 'Socket activation fikri',
                hook: 'Önce socket dinler; süreç ihtiyaçta uyanır.',
                tags: 'systemd socket activation',
                search: 'systemd socket activation idea',
                body: [
                    '<code>.socket</code> unit’i port/path’i systemd’ye dinletir; bağlantı gelince ilgili <code>.service</code> başlar (veya fd devralır). Avantaj: sıralama, tem bellek, paralel açılış.',
                    'inetd/xinetd geleneğinin modern hali. <code>Accept=</code> true/false modeli (servis başına bağlantı vs tek daemon) seçimi kritiktir.',
                    'Debug: socket active mi, service neden start olmadı, permission on socket file — üçlü bakın.'
                ],
                commands: [
                    { cmd: 'systemctl list-sockets --all | head', note: 'Socket listesi' },
                    { cmd: 'systemctl status cups.socket 2>/dev/null | head', note: 'Örnek socket' }
                ],
                mistakes: [
                    'Hem socket hem service’in aynı portu kendi başına dinlemesi (çakışma).',
                    'Socket enable, service mask — sessiz "bağlanamıyorum".'
                ]
            }
        ],
        ileri: [
            {
                id: 'ch28-i1',
                title: 'Debug: systemctl ve journalctl',
                hook: 'failed kırmızı; asıl hikaye journal’da.',
                tags: 'systemctl journalctl debug systemd',
                search: 'debug systemd service journalctl systemctl',
                body: [
                    '<code>systemctl status</code> özet + son log satırlarıdır. <code>journalctl -u unit -b</code> bu boot; <code>-n</code>, <code>--since</code>, <code>-o verbose</code> derinleştirir.',
                    'Sık komutlar: <code>reset-failed</code>, <code>daemon-reload</code> (unit değişince), <code>cat</code>, <code>show</code>, <code>list-dependencies</code>. Exit code ve <code>Result=</code> alanını okuyun.',
                    '<code>systemd-analyze blame/critical-chain</code> boot gecikmesi içindir; runtime failure’da journal + strace nadiren.'
                ],
                commands: [
                    { cmd: 'systemctl status myjob.service --no-pager', note: 'Anlık durum' },
                    { cmd: 'journalctl -u myjob.service -n 100 --no-pager', note: 'Servis log' },
                    { cmd: 'systemctl reset-failed myjob.service', note: 'failed bayrağını temizle' }
                ],
                steps: [
                    'Unit’i değiştir → <code>daemon-reload</code>.',
                    '<code>start</code> / <code>restart</code> → <code>status</code>.',
                    'Hata varsa <code>journalctl -u … -xe</code> ile kanıt topla.'
                ],
                crisis: 'daemon-reload unutuldu — eski unit çalışıyor gibi görünür; önce reload, sonra restart.'
            },
            {
                id: 'ch28-i2',
                title: 'Timer ve servis tuzakları',
                hook: 'enable ≠ istediğin kullanıcı ≠ istediğin env.',
                tags: 'systemd timer pitfalls Type=oneshot',
                search: 'systemd timer troubleshooting oneshot',
                body: [
                    '<code>Type=oneshot</code> + <code>RemainAfterExit=yes</code> "başarılı bitti" state’i için sık gerekir; aksi halde bağımlılar şaşırabilir.',
                    'User timer (<code>systemctl --user</code>) linger olmadan logout’ta ölür. Sistem timer’ı root/unit User= ile netleştirin.',
                    'Çakışan job: <code>flock</code> veya <code>systemd-run</code> yerine unit’te tek instance (<code>Conflicts=</code> / script lock). Failures: <code>OnFailure=</code> ile alert unit.'
                ],
                commands: [
                    { cmd: 'systemctl show myjob.service -p Type -p Result -p ExecMainStatus -p User', note: 'Teşhis alanları' },
                    { cmd: 'journalctl -u myjob.timer -u myjob.service --since \'1 day ago\' --no-pager', note: 'Timer+service birlikte' }
                ],
                interview: [
                    { q: 'Timer çalışıyor görünüyor ama iş yok?', a: 'list-timers NEXT/LAST, service Result, Persistent, User/env ve oneshot kalıntı state’ini kontrol et.' }
                ],
                exercise: 'Kasıtlı bozuk ExecStart ile timer kurun; journal’dan exit kodunu bulup düzeltin.'
            },
            {
                id: 'ch28-i3',
                title: 'Operasyonel disiplin: drop-in ve revert',
                hook: 'Vendor unit’i yakmadan özelleştir.',
                tags: 'systemd drop-in override edit revert',
                search: 'systemctl edit drop-in override',
                body: [
                    '<code>systemctl edit foo.service</code> drop-in açar; <code>edit --full</code> kopyayı getirir (dikkat: upgrade birleşimi). <code>revert</code> yereli temizler.',
                    'Değişiklik penceresi: edit → reload → restart → status/journal → metrik. Mask, disable’dan serttir — bilerek kullanın.',
                    'IaC: unit dosyalarını paket/ansible ile yönetin; sunucuda "bir kerelik" edit drift üretir.'
                ],
                commands: [
                    { cmd: 'systemctl edit --full --force myjob.service', note: 'Lab: tam unit (dikkat)' },
                    { cmd: 'systemctl revert myjob.service', note: 'Yerel override temizle' }
                ],
                callouts: [
                    { type: 'danger', title: 'mask', text: '<code>mask</code> symlink’i /dev/null’a bağlar; enable ile geri gelmez — <code>unmask</code> gerekir.' }
                ]
            }
        ]
    },
    chapterInterview: [
        { q: 'Neden cron yerine systemd timer?', a: 'Aynı journal/cgroup/hardening dili, bağımlılık ve Persistent/catch-up; servis ile zamanlama ayrılır, operasyon tek araç setine iner.' }
    ]
},

/* ========== 29 PERFORMANCE ========== */
{
    id: 'ch29', num: '29', title: 'Performance Tuning',
    subtitle: 'CPU, bellek, I/O — ölç, sonra dokun',
    group: 'sistem',
    who: 'Yavaşlık ticket’ı alan sysadmin, SRE ve platform mühendisleri.',
    intro: 'Performans sihirli sysctl listesi değildir: önce darboğazı (CPU, bellek, disk, ağ, kilit) kanıtla, sonra en ucuz müdahaleyi yap. Bu bölüm top/vmstat/iostat, niceness, perf/bpftrace girişi, bilinçli sysctl farkındalığı ve flamegraph fikrini işler — cargo-cult ayar kopyalamadan.',
    levels: {
        baslangic: [
            {
                id: 'ch29-b1',
                title: 'Darboğazı sınıflandır: CPU / bellek / I/O',
                hook: 'Yavaş = tek kelime. Teşhis dört eksen ister.',
                tags: 'performance bottleneck cpu memory io',
                search: 'linux performance bottleneck cpu memory disk',
                body: [
                    'Klasik ayrım: <strong>CPU bound</strong> (hesap), <strong>memory pressure</strong> (RAM/swap), <strong>I/O wait</strong> (disk), <strong>network/latency</strong> (RTT, kuyruk). Yanlış eksene "tune" etmek zaman kaybıdır.',
                    'İlk bakış: yük (<code>uptime</code>/<code>loadavg</code>), kim koşuyor (<code>top</code>/<code>pidstat</code>), bellek (<code>free -h</code>), disk (<code>iostat</code>), ağ (<code>ss</code>/RTT). Load yüksek ≠ mutlaka CPU; uninterruptible sleep (D state) I/O hikâyesidir.',
                    'Senior refleks: önce uygulama semptomu (p99 latency, queue depth), sonra host metrikleri — "CPU %80, demek sysctl" zincirini kırın.'
                ],
                steps: [
                    'Semptomu yazın: hangi endpoint, hangi saat, hangi host.',
                    '<code>uptime</code>, <code>free -h</code>, <code>iostat -xz 1 3</code> ile eksen seçin.',
                    'Tek süreç şüphesinde <code>pidstat -u -r -d 1</code>.'
                ],
                commands: [
                    { cmd: 'uptime; nproc', note: 'Load vs çekirdek sayısı' },
                    { cmd: 'free -h; swapon --show', note: 'RAM ve swap' },
                    { cmd: 'iostat -xz 1 3', note: 'Disk util / await' }
                ],
                mistakes: [
                    'Load 4 görüp 4 çekirdekli makinede "yanıyor" sanmak (bağlama göre normal olabilir).',
                    'Swap kullanılıyor diye hemen swappiness=0 — asıl soru neden bellek yetmiyor.'
                ],
                interview: [
                    { q: 'iowait yüksek ne demek?', a: 'CPU’lar I/O tamamlanmasını bekliyor; süreçler disk/NFS tarafında takılı olabilir. Daha fazla CPU eklemek genelde çözmez.' }
                ]
            },
            {
                id: 'ch29-b2',
                title: 'top, vmstat, iostat — okuma disiplini',
                hook: 'Araç çok; sütun seçimi az ve net olmalı.',
                tags: 'top vmstat iostat sar',
                search: 'top vmstat iostat linux performans',
                body: [
                    '<code>top</code>/<code>htop</code>: %us/%sy/%wa/%st (steal — VM’de kritik), süreç sıralaması. <code>vmstat 1</code>: r (runnable), b (blocked), si/so (swap in/out), wa.',
                    '<code>iostat -xz</code>: <code>await</code>, <code>%util</code>, <code>avgqu-sz</code> — yüksek util + yüksek await = doymuş veya yavaş cihaz. NVMe’de util yorumu klasik HDD’den farklıdır; kuyruk ve latency’ye bakın.',
                    'Trend için <code>sar</code> / node exporter. Tek anlık screenshot ile "tune PR" açmayın; olay penceresini yakalayın.'
                ],
                commands: [
                    { cmd: 'vmstat 1 5', note: 'r/b, swap, wa' },
                    { cmd: 'top -b -n 1 | head -n 20', note: 'Anlık özet' },
                    { cmd: 'pidstat -u 1 3', note: 'Süreç CPU' }
                ],
                callouts: [
                    { type: 'info', title: 'Steal time', text: 'Cloud’da %st yüksekse komşu gürültüsü veya credit bitmesi olabilir — guest sysctl yetmez.' }
                ],
                exercise: 'Lab’de <code>dd</code> ile disk yükü üretip vmstat’ta b/wa ve iostat’ta await değişimini gözlemleyin.'
            },
            {
                id: 'ch29-b3',
                title: 'Niceness ve öncelik — kibarca paylaşmak',
                hook: 'Tüm süreçler eşit doğmaz; batch iş foreground’u boğmamalı.',
                tags: 'nice renice ionice priority',
                search: 'nice renice ionice linux',
                body: [
                    '<code>nice</code>/<code>renice</code>: CPU scheduler’a "ne kadar nazik" sinyali (−20 acil … +19 arka plan). Root olmadan genelde sadece yükseltebilirsiniz (daha nice).',
                    '<code>ionice</code> I/O sınıfı (idle/best-effort/realtime) — yedekleme <code>dd</code>’sinin latency’yi ezmesini yumuşatır. CFS ve cgroup limitleri (CPUQuota) modern dünyada nice’tan sık daha etkilidir.',
                    'Prod’da "renice ile kurtardık" geçici bandajdır; kalıcı çözüm: cgroup, ayrı queue, rate limit veya kapasite.'
                ],
                commands: [
                    { cmd: 'nice -n 10 tar czf /tmp/bak.tgz /var/log', note: 'Düşük öncelikli arşiv' },
                    { cmd: 'renice -n 5 -p $(pgrep -n backup || echo 1)', note: 'Örnek renice' },
                    { cmd: 'ionice -c3 nice -n 15 gzip -c big.bin > big.bin.gz', note: 'Idle I/O + nice' }
                ],
                mistakes: [
                    'Kritik DB sürecini +19 yapmak.',
                    'Container’da sadece host nice ile yetinmek — cgroup limit’i asıl kapıdır.'
                ]
            }
        ],
        orta: [
            {
                id: 'ch29-o1',
                title: 'Bellek: cache, pressure, OOM',
                hook: 'free’de "available" okuyun; cached ≠ boşa harcanmış.',
                tags: 'memory cache reclaim oom pressure',
                search: 'linux memory available cache oom',
                body: [
                    'Linux boş RAM’i page cache yapar; bu iyidir. <code>available</code> reclaim edilebilir + boş’u yansıtır. "Cached’i düşürmek için echo 3 > drop_caches" prod’da nadiren doğru ilaçtır — benchmark kirletir, gerçek workload’u maskeler.',
                    'Pressure: PSI (<code>/proc/pressure</code>), thrashing (sürekli si/so), OOM killer. OOM’da dmesg/journal’daki victim’i okuyun; limit (cgroup memory.max) mi host mu ayrıştırın.',
                    'Uygulama: heap/RSS büyümesi vs page cache. Java/Go için runtime metrikleri olmadan "sysctl vm.*" gezmeyin.'
                ],
                commands: [
                    { cmd: 'grep -E \'MemTotal|MemAvailable|Cached|Swap\' /proc/meminfo', note: 'Ham bellek' },
                    { cmd: 'cat /proc/pressure/memory 2>/dev/null || true', note: 'PSI memory' },
                    { cmd: 'dmesg -T | grep -i oom | tail', note: 'OOM izi' }
                ],
                crisis: 'OOM loop — service restart fırtınası: memory limit, leak ve traffic surge’ü ayır; drop_caches ile "düzelttim" deme.'
            },
            {
                id: 'ch29-o2',
                title: 'I/O yolu: filesystem, scheduler, kuyruk',
                hook: 'Disk %util kırmızı; hangi katman suçlu?',
                tags: 'io scheduler filesystem fsync latency',
                search: 'linux io scheduler fsync iostat',
                body: [
                    'Uygulama fsync/fsync yoğunluğu, filesystem (ext4/xfs), device mapper, hypervisor disk, volume IOPS tavanı — zinciri atlamayın. "noop/mq-deadline değiştirince düzelir" çoğu cloud volume’da sınırlı etkidir.',
                    'Küçük rastgele yazma vs sıralı okuma farklı profil üretir. DB için commit latency; log shipper için sequential write.',
                    'Ölç: uygulama p99, <code>iostat</code>, cihaz queue, cloud monitoring (burst credit). Sonra mount seçeneği veya volume tipi konuşun.'
                ],
                commands: [
                    { cmd: 'lsblk -o NAME,TYPE,SIZE,ROTA,SCHED,MOUNTPOINT', note: 'Scheduler ve tip' },
                    { cmd: 'findmnt -o TARGET,FSTYPE,OPTIONS /', note: 'Mount seçenekleri' }
                ],
                interview: [
                    { q: 'Neden lab’de hızlı, prod’da yavaş disk?', a: 'Paylaşımlı volume, IOPS/throughput limiti, noisy neighbor, senkron replikasyon veya uzak NFS RTT farkı.' }
                ]
            },
            {
                id: 'ch29-o3',
                title: 'sysctl farkındalığı — cargo-cult yasağı',
                hook: 'Blog’dan kopyalanan 40 satır net.core.* felaketi.',
                tags: 'sysctl tuning somaxconn tcp_tw',
                search: 'sysctl tuning best practices caution',
                body: [
                    'sysctl güçlüdür: somaxconn, backlog, ephemeral port aralığı, swappiness, dirty ratios… Ama her knob bir trade-off’tur ve kernel sürümü/default’ları değişir.',
                    'Kural: (1) semptomu ölç, (2) ilgili metriği göster (drop, orphan, alloc fail), (3) tek değişkendene dokun, (4) rollback planı. "Internet checklist"ini körlemesine uygulamayın — özellikle <code>tcp_tw_recycle</code> gibi ölü/tehlikeli efsaneler.',
                    'Kalıcılık: <code>/etc/sysctl.d/</code>. Container’da bir kısmı host’tan miras; pod içinde sandığınız "tune" görünmeyebilir.'
                ],
                commands: [
                    { cmd: 'sysctl net.core.somaxconn net.ipv4.ip_local_port_range', note: 'Sık bakılanlar' },
                    { cmd: 'sysctl -a 2>/dev/null | wc -l', note: 'Knob sayısı (korkutucu)' }
                ],
                callouts: [
                    { type: 'danger', title: 'Cargo-cult', text: 'Başkasının 10 Gbps ayarını 1 vCPU burstable VM’e yapıştırmayın; kanıt olmadan prod sysctl PR’si açmayın.' }
                ],
                mistakes: [
                    'TIME_WAIT görünce panikle tw_* açmak.',
                    'swappiness=0’ı evrensel "best practice" sanmak.'
                ]
            }
        ],
        ileri: [
            {
                id: 'ch29-i1',
                title: 'perf ve bpftrace — nerede zaman gidiyor?',
                hook: 'CPU %90; hangi fonksiyon? Tahmin etme, örnekle.',
                tags: 'perf bpftrace profiling on-cpu',
                search: 'perf top bpftrace linux profiling',
                body: [
                    '<code>perf top</code>/<code>perf record</code> + <code>report</code>: on-CPU örnekleme; semboller için debuginfo/frame pointer önemli. Kısa süreli, prod’da overhead bilinçli tutulmalı.',
                    '<code>bpftrace</code>: dinamik sorular — syscall latency, tek probe ile "kim open atıyor". BCC/bpftrace araçları gözlem için; kalıcı agent yerine soru odaklı kullanın.',
                    'Off-CPU (kilit, I/O bekleme) ayrı hikâyedir; sadece on-CPU flamegraph "neden bekliyor?"u kaçırabilir.'
                ],
                commands: [
                    { cmd: 'perf top -n 30 2>/dev/null || echo \'perf yetkisi/kernel gerekli\'', note: 'Canlı CPU örnekleri' },
                    { cmd: 'bpftrace -e \'tracepoint:syscalls:sys_enter_openat { @[comm]=count(); }\' 2>/dev/null | head', note: 'Örnek sorgu (lab)' }
                ],
                kernel: 'perf_events ve eBPF ile kernel/userspace örnekleme; CAP_SYS_ADMIN / unprivileged bpf politikaları dağıtıma göre değişir.',
                interview: [
                    { q: 'perf mi strace mi?', a: 'strace her syscall’u pahalı izler; prod’da dikkat. perf örnekler; bpftrace hedefli. Önce hafif gözlem.' }
                ]
            },
            {
                id: 'ch29-i2',
                title: 'Flamegraph fikri',
                hook: 'Yığınları ateş dilimine çevir; geniş = sıcak.',
                tags: 'flamegraph stack collapse profiling',
                search: 'flamegraph perf Brendan Gregg',
                body: [
                    'Flamegraph: x ekseni alfabetik yığınlar (zaman sırası değil), genişlik örnek oranını gösterir. Ortak prefix birleşir — "hangi çağrı yolu CPU yiyor?" sorusuna görsel cevap.',
                    'Üretim hattı kabaca: örnekle (perf) → stack’leri collapse et → SVG. Continuous profiling (Pyroscope, Parca) aynı fikri sürekli yapar.',
                    'Yorum disiplini: optimize edilen yol gerçekten kritik path mi? %5’lik kozmetik fonksiyonu parlatmak p99’u kurtarmaz.'
                ],
                steps: [
                    'Kısa bir CPU yoğun iş yükü oluşturun (lab).',
                    '<code>perf record -F 99 -g -- sleep 30</code> benzeri örnek alın.',
                    'Rapor/flamegraph’ta en geniş dilimleri okuyun.'
                ],
                exercise: 'Bir sıkıştırma veya hash işi profilleyip en pahalı kullanıcı/kernel çerçevesini not edin.',
                callouts: [
                    { type: 'info', title: 'Sembol', text: 'İsimsiz hex adresler = eksik debug sembolü veya stripped binary; önce sembol, sonra optimizasyon.' }
                ]
            },
            {
                id: 'ch29-i3',
                title: 'Tuning oyun kitabı: hipotez → deney → geri al',
                hook: 'Değişiklik bir bilim deneyidir, din değildir.',
                tags: 'performance methodology USE RED',
                search: 'performance methodology USE method rollback',
                body: [
                    'USE (Utilization, Saturation, Errors) kaynaklar için; RED/Golden signals servisler için. Hipotez cümlesi yazın: "await yüksek çünkü volume IOPS tavanı; kanıt iostat+cloud metric; deney daha büyük volume; başarı p99 < X".',
                    'Tek değişken, süre sınırlı, metrik dashboard, rollback. Değişikliği IaC/sysctl.d ile izlenebilir kılın.',
                    'En ucuz kazanımlar sık sık: N+1 sorgu, eksik indeks, unbounded concurrency, senkron log, yanlış region — kernel’den önce uygulama.'
                ],
                crisis: 'Cuma gecesi "tuning sprint" — freeze politikası: kanıt yoksa sadece mitigasyon (scale out, traffic shed), kalıcı knob pazartesi.',
                interview: [
                    { q: 'İlk 15 dakikada ne yaparsın?', a: 'Etki ve eksen (CPU/mem/IO/net), regressiyon/change penceresi, top consumer, geri alınabilir mitigasyon; sysctl turu değil.' }
                ]
            }
        ]
    },
    chapterInterview: [
        { q: 'Performans tuning’de kıdemli farkı ne?', a: 'Ölçüm ve darboğaz sınıflandırması önce; flamegraph/perf ile kanıt; sysctl ve nice’ı bilinçli, geri alınabilir deney olarak kullanmak — blog listesini cargo-cult etmemek.' }
    ]
},

/* ========== 30 SELINUX APPARMOR ========== */
{
    id: 'ch30', num: '30', title: 'SELinux ve AppArmor',
    subtitle: 'MAC: izin root’tan sonra da biter',
    group: 'guvenlik',
    who: 'Denying AVC log’u görenler; "SELinux bozuyor, kapatalım" diyen ekipleri düzeltenler.',
    intro: 'DAC (user/group/chmod) yetmez: root olan süreç de her şeyi yapabilmemeli. SELinux ve AppArmor zorunlu erişim kontrolü (MAC) ile etiket/profil üzerinden sınır çizer. Bu bölüm model, getenforce, context, denial teşhisi ve "neden disable etmeyiz" disiplinini öğretir.',
    levels: {
        baslangic: [
            {
                id: 'ch30-b1',
                title: 'MAC modeli: DAC’tan sonrası',
                hook: 'chmod 777 ve root — MAC hâlâ "hayır" diyebilir.',
                tags: 'MAC DAC SELinux AppArmor mandatory access',
                search: 'SELinux AppArmor MAC vs DAC',
                body: [
                    '<strong>DAC</strong>: sahip/izin bitleri; süreç etkili UID ile hareket eder. <strong>MAC</strong>: politika motoru ek kural uygular — etiket (SELinux) veya profil yolu (AppArmor).',
                    'RHEL ailesi ve klonlarda SELinux yaygın; Ubuntu/SLES tarafında AppArmor sık. İkisi aynı ihtiyaca farklı dil: type enforcement vs path-based profiler.',
                    'Amaç: breakout ve lateral damage’i küçültmek. Web shell alsanız bile "httpd_t sadece bu dosya türlerine yazar" gibi sınırlar hayat kurtarır.'
                ],
                interview: [
                    { q: 'Root MAC’i ezer mi?', a: 'Çoğu policy’de root bile domain/context kurallarına tabi; unconfined veya permissive istisnalar bilinçli gevşetmedir, "root her şey" değildir.' }
                ],
                callouts: [
                    { type: 'info', title: 'Dağıtım', text: 'Hangi MAC’in aktif olduğunu varsaymayın; ölçün. Konteynerde runtime + host politikası katmanlanır.' }
                ]
            },
            {
                id: 'ch30-b2',
                title: 'SELinux: getenforce, setenforce, modlar',
                hook: 'Enforcing / Permissive / Disabled — üç farklı evren.',
                tags: 'getenforce setenforce enforcing permissive',
                search: 'getenforce setenforce SELinux modes',
                body: [
                    '<code>getenforce</code> / <code>sestatus</code>: Enforcing (engeller), Permissive (loglar, engellemez), Disabled (kapalı — genelde reboot/config).',
                    'Geçici teşhis: <code>setenforce 0</code> (permissive) sorunun MAC olup olmadığını ayırır — bu kalıcı çözüm değildir. Kalıcı disable (<code>/etc/selinux/config</code>) audit ve compliance’te kırmızı bayraktır.',
                    'Paket kurulumundan sonra context restore (<code>restorecon</code>) unutulursa "izin var ama SELinux red" klasiktir.'
                ],
                commands: [
                    { cmd: 'getenforce; sestatus 2>/dev/null || true', note: 'SELinux durumu' },
                    { cmd: 'ls -Z /var/www 2>/dev/null | head', note: 'Dosya context (-Z)' },
                    { cmd: 'id -Z 2>/dev/null || true', note: 'Süreç/kullanıcı context' }
                ],
                mistakes: [
                    'İlk denial’da SELinux’u Disabled yapmak.',
                    'Permissive’de bırakıp "düzeldi" sanmak — engel yoktur, sadece log.'
                ],
                exercise: 'Lab VM’de sestatus çıktısını not edin; Enforcing ise bir servisin <code>ps -eZ | head</code> domain’lerine bakın.'
            },
            {
                id: 'ch30-b3',
                title: 'AppArmor: profiller ve aa-status',
                hook: 'Yol bazlı profil: bu binary şuralara dokunabilir.',
                tags: 'AppArmor aa-status complain enforce',
                search: 'AppArmor aa-status complain enforce',
                body: [
                    'AppArmor profilleri genelde <code>/etc/apparmor.d/</code> altındadır. <code>aa-status</code>: enforce vs complain. Complain ≈ SELinux permissive benzeri öğrenme/log modu.',
                    'Yükleme: <code>apparmor_parser</code>, paket postinst. Docker/Podman + host AppArmor birlikte okunmalı — konteyner profili ayrı katman olabilir.',
                    'Teşhis: <code>dmesg</code>/journal’da <code>apparmor="DENIED"</code>; hangi profil, hangi operasyon, hangi path.'
                ],
                commands: [
                    { cmd: 'aa-status 2>/dev/null | head -n 40', note: 'Profil özeti' },
                    { cmd: 'ls /etc/apparmor.d 2>/dev/null | head', note: 'Profil dosyaları' }
                ],
                callouts: [
                    { type: 'warn', title: 'Complain tuzağı', text: 'Complain’de bırakılan prod profili "güvenlik varmış gibi" hissi verir; enforce’a taşıyın.' }
                ]
            }
        ],
        orta: [
            {
                id: 'ch30-o1',
                title: 'SELinux context: kullanıcı, rol, type',
                hook: 'ls -Z satırı rastgele süs değil; type enforcement anahtarı.',
                tags: 'SELinux context chcon restorecon semanage',
                search: 'SELinux context restorecon semanage fcontext',
                body: [
                    'Dosya etiketi: user:role:type:level (MLS). Çoğu admin işi <strong>type</strong> üzerinedir (<code>httpd_sys_content_t</code> vb.). Süreç domain’i (<code>httpd_t</code>) hangi type’lara yazabilir politikada yazılır.',
                    '<code>chcon</code> geçici; asıl kalıcı eşleme <code>semanage fcontext</code> + <code>restorecon</code>. Content’i <code>/srv/foo</code>’ya taşıyıp context’siz bırakmak 403/permission dansı üretir.',
                    'Boolean’lar (<code>getsebool</code>/<code>setsebool</code>): hazır gevşetme anahtarları (ör. network connect). Yine bilinçli ve kalıcı (<code>-P</code>) kullanın.'
                ],
                commands: [
                    { cmd: 'ls -Z /var/www/html 2>/dev/null | head', note: 'Content type' },
                    { cmd: 'ps -eZ | grep -E \'httpd|nginx|sshd\' | head', note: 'Domain örnekleri' },
                    { cmd: 'getsebool -a 2>/dev/null | head', note: 'Boolean listesi' }
                ],
                mistakes: [
                    'Sadece chmod 644 ile yetinmek; context yanlış kalmak.',
                    'chcon ile düzeltip reboot/restorecon sonrası şaşırmak.'
                ]
            },
            {
                id: 'ch30-o2',
                title: 'Denial okuma: ausearch, audit2why, journal',
                hook: 'Log’daki scontext/tcontext cümleyi çözer.',
                tags: 'ausearch audit2why AVC denied',
                search: 'SELinux AVC denial ausearch audit2why',
                body: [
                    'SELinux AVC denial’ları audit log’dadır. <code>ausearch -m AVC -ts recent</code>, <code>journalctl</code> _SELINUX_CONTEXT veya "denied". <code>audit2why</code>/<code>audit2allow</code> yorum ve modül önerir — körlemesine allow modülü güvenlik borcudur.',
                    'Önce sorun: yanlış context mi, eksik boolean mu, gerçekten yeni izin mi? Çoğu "policy bug" aslında admin’in dosyayı yanlış type ile koymasıdır.',
                    'AppArmor’da benzer akış: denied satırı → profil satırı (path + izin r/w/k) → complain’de test → enforce.'
                ],
                commands: [
                    { cmd: 'sudo ausearch -m AVC -ts recent 2>/dev/null | tail -n 40', note: 'Son AVC’ler' },
                    { cmd: 'sudo journalctl -k -b | grep -iE \'denied|avc|apparmor\' | tail', note: 'Kernel/journal izleri' }
                ],
                steps: [
                    'Denial’ı kopyalayın (scontext, tcontext, tclass, permission).',
                    'Dosya path’inde <code>ls -Z</code>; beklenen type mi?',
                    'Boolean veya fcontext ile düzeltin; audit2allow’u son çare tutun.'
                ],
                crisis: 'Deploy sonrası servis start olmuyor — setenforce 0 ile ayır; denial varsa context/boolean düzelt, disable etme.'
            },
            {
                id: 'ch30-o3',
                title: 'Ne zaman (ve nasıl) gevşetilir?',
                hook: 'Geçici permissive ≠ politikayı çöpe atmak.',
                tags: 'SELinux permissive domain troubleshooting',
                search: 'SELinux permissive domain not disable',
                body: [
                    'Teşhis penceresi: global permissive veya tek domain permissive (<code>semanage permissive -a</code>) — kapsamı dar tutun, süre sınırlayın, ticket’a yazın.',
                    'Kalıcı çözüm sırası: doğru fcontext → boolean → (nadiren) dar local module → vendor bug raporu. "setenforce 0" runbook adımı olmamalı.',
                    'Automation: image bake sırasında restorecon; Ansible’da file module <code>seuser</code>/<code>serole</code>/<code>setype</code> farkındalığı.'
                ],
                callouts: [
                    { type: 'danger', title: 'Disabled', text: 'SELINUX=disabled sonrası yeniden enforcing’e dönmek bazen full relabel ister; "geçici kapalı" maliyeti yüksektir.' }
                ],
                interview: [
                    { q: 'Neden disable önermezsin?', a: 'MAC breakout maliyetini düşürür; compliance ve savunma derinliği kaybı; çoğu olay yanlış etiketle çözülür, kapamak kök nedeni gizler.' }
                ]
            }
        ],
        ileri: [
            {
                id: 'ch30-i1',
                title: 'Konteyner ve MAC birlikte',
                hook: 'Container escape hikâyelerinde etiket/profil sessiz kahraman.',
                tags: 'container SELinux AppArmor Podman Docker',
                search: 'container SELinux label AppArmor profile',
                body: [
                    'SELinux: konteyner süreçleri genelde <code>container_t</code> benzeri domain; volume mount’larda <code>:Z</code>/<code>:z</code> etiket yeniden yazımı (Podman/Docker) bilinçli kullanılmalı — yanlış Z host içeriğini bozar.',
                    'AppArmor: runtime default profili + özel profil. Kubernetes’te AppArmor annotation / securityContext; SPOD/policy as code ekipleri burayı IaC’ler.',
                    'Debug: host enforcing mi, runtime privileged mi, volume label mi — üç soru.'
                ],
                commands: [
                    { cmd: 'podman run --help 2>/dev/null | grep -i security | head || docker info 2>/dev/null | grep -i security | head', note: 'Runtime güvenlik ipuçları' }
                ],
                mistakes: [
                    '--privileged + MAC’i fiilen delmek sonra "neden escape oldu" diye sormak.',
                    'Her volume’a körlemesine :Z.'
                ]
            },
            {
                id: 'ch30-i2',
                title: 'Politika modülü ve dar allow — son çare',
                hook: 'audit2allow -M her denial için = delik delik politika.',
                tags: 'audit2allow semodule policy module',
                search: 'audit2allow semodule SELinux local policy',
                body: [
                    'Gerçekten yeni ihtiyaç varsa: dar allow (tek type, tek permission class), modül adı ve gerekçe, Git’e commit, review. <code>semodule -l</code> ile local modülleri envanterleyin.',
                    'Dontaudit ve sessizleşen denial’lar teşhisi körleştirir — bilinçli kullanın.',
                    'AppArmor’da profil satırı eklemek de aynı disiplin: minimum path, minimum izin, test, enforce.'
                ],
                commands: [
                    { cmd: 'sudo semodule -l 2>/dev/null | tail', note: 'Yüklü modüller' }
                ],
                exercise: 'Lab’de kasıtlı yanlış context ile bir denial üretin; restorecon ile düzeltip audit2allow’a ihtiyaç kalmadığını gösterin.',
                interview: [
                    { q: 'audit2allow çıktısını aynen basmak neden kötü?', a: 'Gereğinden geniş izin üretebilir; kök neden (yanlış label) maskelenir; saldırı yüzeyi büyür.' }
                ]
            },
            {
                id: 'ch30-i3',
                title: 'Operasyonel politika: asla "SELinux kapalı" standardı',
                hook: 'Gold image enforcing doğmalı; istisna ticket’lı olmalı.',
                tags: 'SELinux compliance gold image',
                search: 'SELinux enforcing gold image compliance',
                body: [
                    'Standart: Enforcing + relabel sağlıklı image. İstisna: vendor binary belgelenmiş uyumsuzluk — o zaman dar permissive domain veya vendor fix, global disable değil.',
                    'Gözlemlenebilirlik: denial rate alert (ani spike = saldırı veya bozuk deploy). CI’da smoke: servis start + kritik path under enforcing.',
                    'Eğitim: "SELinux bozdu" → "hangi AVC?" kültürüne çevirin. Aynı şey AppArmor DENIED için geçerli.'
                ],
                crisis: 'Acil hotfix penceresinde bile disable yerine kısa süreli permissive + sonrası relabel/boolean planı yazın.',
                callouts: [
                    { type: 'info', title: 'Kanıt', text: 'Postmortem’de getenforce çıktısı ve denial örneği olmadan "SELinux suçu" kabul etmeyin.' }
                ]
            }
        ]
    },
    chapterInterview: [
        { q: 'SELinux denial geldi, ilk üç adım?', a: 'getenforce; AVC’yi oku (scontext/tcontext); ls -Z / restorecon veya boolean ile düzelt. setenforce 0 sadece teşhis; disable değil.' }
    ]
},

/* ========== 31 IDENTITY LDAP AD SSO ========== */
{
    id: 'ch31', num: '31', title: 'Kimlik: LDAP, AD, SSO',
    subtitle: 'Sunucudaki kullanıcı artık dizinden gelir',
    group: 'guvenlik',
    who: 'Fleet’e lokal user açmaktan vazgeçen ops; SSO isteyen platform ekipleri.',
    intro: 'Ölçekte /etc/passwd kopyalamak ölmez: LDAP/Active Directory, SSSD, Kerberos ve SSO ile merkezi kimlik gelir. Bu bölüm Linux’un domaine katılma fikrini, sssd’yi, ops için Kerberos temellerini ve service account disiplinini işler — IdP’yi "sihir" sanmadan.',
    levels: {
        baslangic: [
            {
                id: 'ch31-b1',
                title: 'Merkezi kimlik neden var?',
                hook: '50 sunucuda aynı kullanıcıyı elle açmak = drift ve yetim hesap.',
                tags: 'LDAP AD identity centralization',
                search: 'LDAP Active Directory Linux identity',
                body: [
                    '<strong>LDAP</strong>: dizin protokolü (kullanıcı, grup, öznitelik). <strong>Active Directory</strong>: Microsoft’un LDAP + Kerberos + politika dünyası; kurumsal fiili standart.',
                    'Linux tarafı: PAM/NSS üzerinden "login kim, grupları kim" sorularını dizin/SSSD’ye devreder. Home, sudo, SSH anahtarı da merkezi veya yarı-merkezi yönetilebilir.',
                    'SSO (Single Sign-On): bir IdP oturumu ile çok uygulamaya — sunucu SSH’ı için Teleport/Boundary/cert modeli; web için OIDC/SAML. Hepsi "kimlik kaynağı" etrafında döner.'
                ],
                interview: [
                    { q: 'Lokal user ne zaman hâlâ doğru?', a: 'Break-glass/root acil hesabı, bootstrap, dizinin erişilemediği out-of-band console — sınırlı, audit’li ve nadir.' }
                ],
                mistakes: [
                    'Dizin çökünce herkesin içeri girememesi için break-glass planı olmamak.',
                    'Service hesabını kişisel kullanıcı gibi paylaşımlı parola ile yönetmek.'
                ]
            },
            {
                id: 'ch31-b2',
                title: 'Linux join domain fikri',
                hook: 'Makine hesabı + güven ilişkisi; sadece "LDAP bind" değil.',
                tags: 'realm join adcli net ads domain',
                search: 'realm join linux active directory',
                body: [
                    'Domain join: host bir machine account ile realm’e kaydolur; Kerberos host principal’ları oluşur; SSSD/winbind kimlik çözer. Araçlar: <code>realm join</code>, <code>adcli</code>, eski <code>net ads join</code>.',
                    'Önkoşullar: DNS (doğru SRV/A), zaman senkronu (Kerberos saate duyarlı), firewall (Kerberos/LDAP portları), yetkili join hesabı.',
                    'Join sonrası: <code>id kullanici@domain</code>, <code>getent passwd</code>, SSH ile dizin kullanıcısı — bunları smoke test sayın.'
                ],
                steps: [
                    'DNS ve <code>timedatectl</code> doğruluğunu kontrol edin.',
                    'Lab’de realm discover / join akışını okuyun (gerçek AD olmadan bile doküman + paketleri tanıyın).',
                    'Join sonrası id/getent smoke test listesi yazın.'
                ],
                commands: [
                    { cmd: 'timedatectl status | head', note: 'Saat/NTP kritik' },
                    { cmd: 'realm list 2>/dev/null || true', note: 'Katılı spoiler realm' },
                    { cmd: 'getent passwd | tail', note: 'NSS’nin gördüğü kullanıcılar' }
                ],
                callouts: [
                    { type: 'warn', title: 'DNS', text: 'Yanlış resolver ile join "rastgele" kırılır; AD DC isimleri çözülmeli.' }
                ]
            },
            {
                id: 'ch31-b3',
                title: 'SSSD — kimlik önbelleği ve PAM/NSS yapıştırıcısı',
                hook: 'Dizin yavaş veya kısa kesik; login yine çalışabilmeli.',
                tags: 'sssd nss pam identity cache',
                search: 'sssd.conf Linux AD LDAP',
                body: [
                    '<strong>SSSD</strong> (System Security Services Daemon): kimlik sağlayıcıya bağlanır, sonucu cache’ler, NSS/PAM’e sunar. Offline kısa süre login, performans ve merkezi politika için omurga.',
                    '<code>/etc/sssd/sssd.conf</code> (izinler sıkı, genelde 600): domains, providers (ad/ldap/ipa), enum, ssh, sudo entegrasyonları. <code>sssctl</code> ile cache/invalidate teşhisi.',
                    'Rakip/yan yollar: winbind, nslcd — modern RHEL/Ubuntu kurumsal kurulumlarda SSSD sık tercih.'
                ],
                commands: [
                    { cmd: 'systemctl status sssd --no-pager 2>/dev/null | head', note: 'SSSD ayakta mı?' },
                    { cmd: 'sssctl domain-list 2>/dev/null || true', note: 'Domain listesi' }
                ],
                exercise: 'sssd.conf man sayfasında <code>cache_credentials</code> ve <code>entry_cache_timeout</code> anlamlarını not edin — outage senaryosu için.'
            }
        ],
        orta: [
            {
                id: 'ch31-o1',
                title: 'Kerberos ops temelleri',
                hook: 'TGT, keytab, saat kayması — üç klasik kırılma.',
                tags: 'kerberos kinit keytab ticket',
                search: 'kerberos kinit keytab linux ops',
                body: [
                    'Kerberos: parola yerine zamanlı ticket. <code>kinit</code> TGT alır; servisler service ticket ister. Host/service için <strong>keytab</strong> dosyası (parola yerine gizli anahtar materyali) — izin 600, dağıtımı secret yönetimi ile.',
                    'Saat kayması (> birkaç dakika) auth’u kırar — kronik "dün çalışıyordu". DNS reverse/forward uyumsuzluğu da SPN belasını doğurur.',
                    '<code>klist</code> mevcut ticket; <code>kdestroy</code> temizlik. SSH GSSAPI, NFS, HTTP SPNEGO aynı dilin türevleridir.'
                ],
                commands: [
                    { cmd: 'klist 2>/dev/null || echo \'ticket yok\'', note: 'Ticket önbelleği' },
                    { cmd: 'klist -k /etc/krb5.keytab 2>/dev/null | head', note: 'Host keytab (dikkatli)' }
                ],
                mistakes: [
                    'keytab’ı dünya-okunur bırakmak veya image’a gömmek.',
                    'NTP’siz VM clone’ları join edip "Kerberos bozuk" demek.'
                ],
                interview: [
                    { q: 'Password auth kapalı, GSSAPI fail — nereye bakarsın?', a: 'Saat, DNS/SPN, keytab princ listesi, krb5.conf realm, SSSD/journal kerberos satırları.' }
                ]
            },
            {
                id: 'ch31-o2',
                title: 'SSO ve Linux erişim modelleri',
                hook: 'Web SSO ≠ otomatik SSH SSO; köprüleri bilin.',
                tags: 'SSO OIDC SAML SSH short-lived',
                search: 'SSO Linux SSH OIDC SAML',
                body: [
                    'Uygulama SSO: SAML/OIDC ile IdP (Okta, Entra ID, Keycloak…). Linux host erişimi çoğu ekipte: IdP → kısa ömürlü SSH cert / PAM OIDC / bastion broker.',
                    'Klasik "AD şifresi ile her sunucuya SSH" ölçekte ve phishing’te zayıf kalır; MFA + time-box + audit isteyin.',
                    'Grup → erişim: AD/LDAP grubu = sudoers veya bastion role. Least privilege: admin grubu ≠ login olan herkes.'
                ],
                callouts: [
                    { type: 'info', title: 'IdP outage', text: 'SSO tek nokta riski: cache’li ticket, break-glass lokal ve durumu status page’de bilin.' }
                ],
                crisis: 'IdP down — yeni SSH cert yok; mevcut oturumlar ve break-glass ile sınırlı operasyon runbook’u.'
            },
            {
                id: 'ch31-o3',
                title: 'Service account disiplini',
                hook: 'app_user parolasını Slack’e yapıştırmak incident’tır.',
                tags: 'service account gMSA keytab secret',
                search: 'service account linux gMSA keytab',
                body: [
                    'İnsan hesabı ≠ servis hesabı. Servis: dar yetki, rotasyon, sahibi (team), envanter. Mümkünse gMSA / role / IRSA / instance profile benzeri "parolasız" modeller.',
                    'Linux’ta: dedicated UID, keytab veya vault-delivered secret, sudo yok veya komut-kırpık. CI deploy hesabı personal admin clone’u olmamalı.',
                    'Audit: nereye login oldu, hangi host’ta keytab var, son rotasyon. Ayrılan insan hesabını disable etmek yetmez — token/keytab avlayın.'
                ],
                mistakes: [
                    'Paylaşımlı "devops" AD kullanıcısı ile her automation.',
                    'Service account’a mailbox + interactive login bırakmak.'
                ],
                exercise: 'Bir lab servisi için: hesap adı, gerekli gruplar, secret saklama yeri, rotasyon süresi yazın (tek sayfa).'
            }
        ],
        ileri: [
            {
                id: 'ch31-i1',
                title: 'SSSD/AD kırılınca teşhis sırası',
                hook: 'id: no such user — panik yerine katman katman.',
                tags: 'sssd troubleshooting ad offline',
                search: 'sssd troubleshooting getent id AD',
                body: [
                    'Sıra: ağ/DNS/DC erişimi → saat → <code>systemctl status sssd</code> → <code>sssctl</code> online status → <code>getent</code>/<code>id</code> → PAM (SSH) ayrı mı NSS ayrı mı → journal’da sssd_*.',
                    'Cache şişmesi/bozulması: dikkatli invalidate. Enum kapalıysa <code>getent passwd</code> tam liste vermez — bu normal olabilir.',
                    'Join kopması: password/machine account expire, clone VM aynı machine account ile — duplicate identity cehennemi; generalize/sysprep benzeri disiplin.'
                ],
                commands: [
                    { cmd: 'journalctl -u sssd -n 80 --no-pager 2>/dev/null', note: 'SSSD log' },
                    { cmd: 'id nobody; getent hosts $(hostname -f) 2>/dev/null | head', note: 'NSS smoke' }
                ],
                steps: [
                    'DC’ye ping/TCP (ldap/kerberos) kontrol.',
                    'timedatectl + realm/sssd status.',
                    'Tek kullanıcı <code>id user@realm</code>; fail ise journal.'
                ]
            },
            {
                id: 'ch31-i2',
                title: 'Sudo, grup ve HBAC benzeri kontroller',
                hook: 'Dizinde var ≠ bu host’ta sudo.’',
                tags: 'sudo ldap hbac ipa group access',
                search: 'sudo ldap sssd hbac host access',
                body: [
                    'Kimlik çözülmesi ile yetki ayrılır: host’a login izni (HBAC/AllowGroups/sssd access provider) ve sudo kuralları (sudoers veya LDAP sudo).',
                    'FreeIPA/IdM HBAC; AD + SSSD simple allow groups; cloud IdP group → SSH CA principal. Model ne olursa olsun: "tüm domain users tüm prod" anti-pattern.',
                    'Değişiklik: grup üyeliği Git/IdP’te audit’li; sunucuda lokal sudoers drift’i yasak veya config management ile.'
                ],
                interview: [
                    { q: 'Contractor için erişim nasıl?', a: 'Zaman sınırlı grup/role, MFA, bastion, sudo dar, ayrılınca IdP disable + session/cert iptal.' }
                ]
            },
            {
                id: 'ch31-i3',
                title: 'Tasarım: insan, makine, servis kimlikleri',
                hook: 'Üçü aynı "user" kutusuna sıkıştırılmaz.',
                tags: 'identity architecture machine account workload identity',
                search: 'workload identity vs human identity linux',
                body: [
                    'İnsan: SSO + MFA + kısa oturum. Makine: domain join / device identity. Workload: cloud role, K8s SA, Vault AppRole — host’a gömülü uzun ömürlü parola değil.',
                    'Çok kaynaklı kimlik (LDAP + CI OIDC + cloud IAM) kaçınılmazdır; "kaynak gerçeği" (source of truth) ve joiner-mover-leaver sürecini yazın.',
                    'Senior teslimat: break-glass, IdP outage, keytab rotasyonu ve erişim review (quarterly) runbook’ları olmadan "AD’ye bindik" tamamlanmış sayılmaz.'
                ],
                callouts: [
                    { type: 'danger', title: 'Clone', text: 'Aynı machine account ile çoğaltılmış VM’ler kimlik ve Kerberos’u sessizce bozar — golden image stratejisine join’i bilerek koyun.' }
                ]
            }
        ]
    },
    chapterInterview: [
        { q: 'Linux filoyu AD’ye bağlarken omurga nedir?', a: 'DNS+NTP, realm join, SSSD/PAM/NSS, Kerberos keytab disiplini, grup bazlı erişim/sudo, break-glass ve service account’ların insan hesaplarından ayrılması.' }
    ]
},

/* ========== 32 INCIDENT RESPONSE ========== */
{
    id: 'ch32', num: '32', title: 'Incident Response Playbook',
    subtitle: 'Tespit → izolasyon → kurtarma',
    group: 'ops',
    who: 'On-call, SOC ile konuşan ops, "şüpheli host" ticket’ını ilk karşılayanlar.',
    intro: 'Kriz anında doğaçlama ölmez: triage, containment, kanıt zinciri ve iletişim önceden yazılı playbook ister. Bu bölüm Linux host’ta tespit → izolasyon → forensics farkındalığı → kurtarma kararını (temizle vs rebuild) ve tabletop disiplini işler — panik komutundan kanıta dayalı yanıta.',
    levels: {
        baslangic: [
            {
                id: 'ch32-b1',
                title: 'IR omurgası: tespit → triage → containment',
                hook: 'Önce "ne kadar kötü?", sonra "yayılmasın", en sonda "kök neden".',
                tags: 'incident response triage containment IR',
                search: 'incident response playbook linux triage',
                body: [
                    'Klasik akış: <strong>detect</strong> (alert/insan) → <strong>triage</strong> (severity, kapsam, sahte pozitif?) → <strong>contain</strong> (yayılmayı kes) → eradicate/recover → lessons learned. NIST/SANS dilini ezbere saymak değil; sırayı bozmamaktır.',
                    'Triage soruları: hangi host/hesap/servis? ilk görülen zaman? outbound C2 var mı? credential çalınma ihtimali? blast radius (aynı image, aynı anahtar, aynı VPC)?',
                    'Containment ≠ silmek: ağ kesme, credential rotate, süreç durdurma, account disable — kanıtı yok etmeden sınır çizmek.'
                ],
                steps: [
                    'Severity tanımını (P1–P3) playbook’a yazın; kriz anında tartışmayın.',
                    'İlk 15 dk checklist: kim etkilendi, kim bilgilenecek, hangi kanal.',
                    'Containment seçeneklerini (network / credential / process) önceden listeleyin.'
                ],
                interview: [
                    { q: 'Neden hemen reimage etmezsin?', a: 'Kanıt kaybı, yanlış host, ve "temiz" sanılan golden image hâlâ compromise vektörü olabilir. Önce kapsam + volatile kanıt, sonra bilinçli rebuild.' }
                ],
                callouts: [
                    { type: 'warn', title: 'Panik rm', text: '<code>rm -rf</code> / log wipe "temizlik" değildir; çoğu zaman evidence spoliation ve lateral iz kaybıdır.' }
                ]
            },
            {
                id: 'ch32-b2',
                title: 'İletişim: bridge, severity, tek doğru kaynak',
                hook: 'Teknik teşhis kadar "kim ne biliyor?" kritiktir.',
                tags: 'incident communication bridge status page',
                search: 'incident communication severity bridge',
                body: [
                    'Tek incident commander (veya net rol ayrımı): teknik lead ≠ müşteri iletişimi. Bridge/channel’da gürültüyü kesin; kararlar ve zaman damgalı durum tek yerde.',
                    'Severity önceden: kullanıcı etkisi, veri sızıntısı riski, regülasyon, yayılma. Yanlış P1 yorar; düşük severity’yi saklamak daha pahalıya patlar.',
                    'Dışarı: status page / müşteri notu sade ve doğru. İçeri: hipotez + kanıt + sonraki adım. Spekülasyonu "bilinmiyor" diye ayırın.'
                ],
                mistakes: [
                    'Herkesin aynı anda prod’da komut çalıştırması (çift müdahale).',
                    'Slack’te kanıt’sız suçlama; postmortem’i zehirler.'
                ],
                exercise: 'Sahte P1 için 5 satırlık iletişim taslağı yazın: etki, şu an ne yapıyoruz, sonraki update zamanı.'
            },
            {
                id: 'ch32-b3',
                title: 'Linux’ta şüphe göstergeleri (IOC farkındalığı)',
                hook: 'Malware "exe" değil; cron, SSH key, systemd, outbound.',
                tags: 'linux malware indicators IOC persistence',
                search: 'linux malware indicators cron ssh systemd',
                body: [
                    'Persistence klasik: <code>crontab</code>/<code>/etc/cron.*</code>, systemd unit/timer, <code>~/.ssh/authorized_keys</code>, shell rc (<code>.bashrc</code>), <code>ld.so.preload</code>, şüpheli SUID.',
                    'Davranış: beklenmeyen outbound, yeni dinleyen port, high CPU miner, beklenmeyen kullanıcı/<code>sudo</code> log’u, binary timestamp anomalisi, paket dışı binary <code>/tmp</code>/<code>/dev/shm</code>.',
                    'Kaynak: EDR/Falco/auditd alert, kullanıcı ihbarı, cloud anomaly (IMDS abuse). Tek gösterge ≠ kesin hüküm; korelasyon triage’dir.'
                ],
                commands: [
                    { cmd: 'who; last -n 20; w', note: 'Oturum ipuçları' },
                    { cmd: 'crontab -l; ls /etc/cron.* 2>/dev/null | head', note: 'Cron yüzeyi' },
                    { cmd: 'ss -tulpn | head', note: 'Dinleyen / bağlantı özeti' }
                ],
                crisis: 'Miner şüphesi — CPU pin, outbound pool, yeni systemd; freeze + kanıt, kör kill yetmeyebilir (watchdog).'
            }
        ],
        orta: [
            {
                id: 'ch32-o1',
                title: 'Containment pratikleri: ağ, kimlik, süreç',
                hook: 'Yayılmayı kes; kanıtı ve iş sürekliliğini bilinçli trade-off et.',
                tags: 'containment isolation network credential rotate',
                search: 'incident containment isolate host linux',
                body: [
                    'Ağ: security group / nftables ile egress kes (C2), veya host’u quarantine VLAN. "Ping kapatmak" yetmez; DNS ve 443 outbound sık kaçar.',
                    'Kimlik: şüpheli hesabı disable, SSH key/cert iptal, token/IAM rotate, bastion oturumlarını düşür. Aynı anahtarın filoda kopyası varsa containment host-local bitmez.',
                    'Süreç: şüpheli PID’i belgele (<code>ps</code>, <code>/proc/PID/exe</code>, cmdline) — hemen <code>kill -9</code> volatile’ı yakabilir; politika + volatile snapshot sırası playbook’ta yazılı olsun.'
                ],
                commands: [
                    { cmd: 'sudo ss -tpn | head', note: 'Aktif bağlantılar + süreç' },
                    { cmd: 'ls -l /proc/$(pgrep -n sshd)/exe 2>/dev/null', note: 'Örnek: exe yolu' },
                    { cmd: 'sudo nft list ruleset 2>/dev/null | head || sudo iptables -L -n | head', note: 'Host firewall durumu' }
                ],
                callouts: [
                    { type: 'info', title: 'Live vs freeze', text: 'Bazı ekipler memory image sonrası ağ keser; sıra tehdit modeline göre — yazın, ezbere değil.' }
                ]
            },
            {
                id: 'ch32-o2',
                title: 'Forensics temelleri: disk ve bellek farkındalığı',
                hook: 'Volatile önce; disk image sonra — sırayı ters çevirmeyin.',
                tags: 'forensics memory disk image volatile evidence',
                search: 'linux forensics memory dump disk image',
                body: [
                    'Volatile (RAM, ağ tablosu, çalışan süreç): reboot veya agresif kill ile kaybolur. Mümkünse memory capture (LiME, avcı EDR paketi, hypervisor snapshot) politikaya uygun alınır.',
                    'Disk: bit-bit image veya en azından kritik artefakt (auth.log, bash_history, cron, unit, binary hash). Yazma azaltın; monteli live incelemede overlay/ro düşünün.',
                    'Chain of custody: kim, ne zaman, hangi hash (SHA256), nerede saklandı. Mahkeme/regülasyon olmasa bile iç RCA için aynı disiplin faydalıdır.'
                ],
                commands: [
                    { cmd: 'date -u; hostname; uname -a', note: 'Zaman + kimlik damgası' },
                    { cmd: 'sha256sum /bin/bash /usr/bin/ssh 2>/dev/null | head', note: 'Bilinen binary hash örneği' },
                    { cmd: 'sudo journalctl --since \'1 hour ago\' -n 50 --no-pager', note: 'Son saat journal dilimi' }
                ],
                mistakes: [
                    'İnceleme sırasında paketi upgrade edip timeline’ı bozmak.',
                    'Kanıtı kişisel laptop’a scp edip paylaşılmış klasöre bırakmak (sızıntı²).'
                ]
            },
            {
                id: 'ch32-o3',
                title: 'Kanıt zinciri ve timeline',
                hook: 'Komut çıktısı + zaman + operatör = kullanılabilir kanıt.',
                tags: 'evidence chain timeline audit log',
                search: 'evidence chain of custody incident timeline',
                body: [
                    'Her adımı kaydedin: komut, stdout özeti, UTC zaman, kim çalıştırdı. Scripted collection (triage script) insan hatasını azaltır; yine de imza/hash.',
                    'Timeline: auth.log / secure, auditd, cloud trail, EDR, deploy event — tek log yetmez. Saat senkronu (NTP) yoksa timeline yalan söyler.',
                    'PII/secret kanıtta maskeleme politikası: ticket’a ham key yapıştırmayın; referans ID kullanın.'
                ],
                interview: [
                    { q: 'bash_history yeterli kanıt mı?', a: 'Hayır: eksik, manipüle edilebilir, tüm shell’leri kapsamaz. Destekleyici artefakt; tek başına hüküm değil.' }
                ],
                exercise: 'Lab’de 10 dakikalık sahte olay için UTC timeline tablosu çizin (3 olay + 2 hipotez).'
            }
        ],
        ileri: [
            {
                id: 'ch32-i1',
                title: 'Rebuild mi, temizle mi?',
                hook: 'Rootkit şüphesinde "antivirüs taradı, temiz" yetmez.',
                tags: 'rebuild reimage eradicate recovery',
                search: 'linux incident rebuild vs clean reimage',
                body: [
                    'Temizleme (eradication): bilinen IOC’leri kaldır, credential rotate, patch. Düşük güven / belirsiz rootkit / supply-chain şüphesinde <strong>rebuild</strong> (güvenilir image’dan) tercih edilir.',
                    'Rebuild checklist: volume’dan veri ayıkla (temiz bilinen yedekten), secret’ları eski host’tan kopyalama, aynı vulnerability ile geri gelme (patch + root cause).',
                    'İş sürekliliği: canary, DNS/VIP kesisi, RPO/RTO. "Hızlı geri açtık" ≠ "güvenli geri açtık".'
                ],
                callouts: [
                    { type: 'danger', title: 'Golden image', text: 'Compromise pipeline/image ise reimage aynı zehri basar — image provenance ve CI güvenliği IR’nin parçasıdır.' }
                ],
                crisis: 'Filo çapında aynı SSH key sızıntısı — tek host rebuild yetmez; anahtar filoda rotate + bastion audit.'
            },
            {
                id: 'ch32-i2',
                title: 'Tabletop ve game day',
                hook: 'Playbook raftadır; kas hafızası tatbikatta oluşur.',
                tags: 'tabletop exercise game day IR drill',
                search: 'incident response tabletop exercise linux',
                body: [
                    'Tabletop: senaryo kartı (ransomware semptomu, crypto miner, şüpheli outbound, insider). Roller, karar noktaları, iletişim — gerçek prod kırmadan.',
                    'Game day / chaos: kontrollü fault + IR birleşimi. Ölçüm: tespit süresi, containment süresi, kanıt kalitesi, iletişim netliği.',
                    'Çıktı: playbook PR’si, eksik log/alert, break-glass testi. Yılda bir "okuduk" yetmez; çeyreklik kısa tatbikat.'
                ],
                steps: [
                    'Bir senaryo seçin (ör. authorized_keys’e unknown key).',
                    'Triage + containment kararlarını süreli oynayın (25 dk).',
                    '3 aksiyon maddesi çıkarın (alert, runbook, erişim).'
                ],
                interview: [
                    { q: 'IR olgunluğu nasıl bakılır?', a: 'Yazılı severity, on-call rolleri, kanıt prosedürü, tabletop sıklığı, MTTD/MTTR trendi, postmortem aksiyon kapanış oranı.' }
                ]
            }
        ]
    },
    chapterInterview: [
        { q: 'Linux IR’de ilk altın kural?', a: 'Yayılmayı ve credential riskini keserken volatile kanıtı koru; iletişimi tek kanaldan yönet; rebuild kararını kapsam ve kök neden güvenine bağla.' }
    ]
},

/* ========== 33 eBPF MODERN GOZLEM ========== */
{
    id: 'ch33', num: '33', title: 'eBPF ve Modern Gözlem',
    subtitle: 'Kernel’den güvenli gözlem',
    group: 'sistem',
    who: 'perf/strace ile yetinmeyip "neden yavaş / kim syscall atıyor?" diyen sistem ve platform ekipleri.',
    intro: 'eBPF, kernel’de güvenli sandboxed programlarla gözlem ve (kontrollü) politika çalıştırmayı mümkün kılar — modül yazmadan. Bu bölüm eBPF fikri, bcc/bpftrace one-liner’ları, sürekli profiling, Falco/Tetragon farkındalığı ve güvenlik/limitleri işler; prod’da kör probe yağmurundan kaçınarak.',
    levels: {
        baslangic: [
            {
                id: 'ch33-b1',
                title: 'eBPF nedir? (modül değil, doğrulanmış program)',
                hook: 'Kernel’e C patch atmadan olay noktasına bağlanmak.',
                tags: 'eBPF BPF verifier kernel observability',
                search: 'what is eBPF linux observability',
                body: [
                    '<strong>eBPF</strong>: bytecode programları kernel’deki hook’lara (kprobe, tracepoint, XDP, cgroup…) eklenir. <strong>Verifier</strong> sonsuz döngü / illegal bellek erişimini reddeder — klasik kernel module’den daha sıkı güvenlik modeli.',
                    'Kullanım alanları: gözlem (latency, syscall, ağ), ağ (XDP/TC), güvenlik politikası (seccomp benzeri genişleme, runtime detection). Kullanıcı alanı: libbpf, BCC, bpftrace, Cilium, Pixie…',
                    'Gereksinim: yeterli kernel (genelde 4.x+/5.x özellikleri), çoğu iz için yetki (<code>CAP_BPF</code> / <code>CAP_PERFMON</code> / eski dünyada <code>CAP_SYS_ADMIN</code>), debugfs/tracefs.'
                ],
                interview: [
                    { q: 'Neden her şeyi kernel module ile yazmıyoruz?', a: 'Module panik/crash riski ve imza/dağıtım maliyeti yüksek. eBPF verifier + yükleme modeli gözlem için daha güvenli ve taşınabilir tooling ekosistemi sunar.' }
                ],
                callouts: [
                    { type: 'info', title: 'Gözlem ≠ rootkit', text: 'Aynı güç kötüye de kullanılabilir; unprivileged BPF kapatma ve imza politikaları dağıtıma göre ayarlanır.' }
                ]
            },
            {
                id: 'ch33-b2',
                title: 'bpftrace / BCC: soru odaklı one-liner',
                hook: 'Önce tek soru sor; kalıcı agent’ı sonra düşün.',
                tags: 'bpftrace bcc one-liner tracing',
                search: 'bpftrace bcc one-liners linux',
                body: [
                    '<code>bpftrace</code>: awk benzeri dinamik tracing dili — "kim openat atıyor?", "hangi syscall yavaş?". BCC: Python/C araç seti (biolatency, execsnoop, tcplife…).',
                    'Prod disiplini: süre sınırlı, CPU bütçesi bilinçli, mümkünse staging’de dene. Her probe maliyeti vardır; özellikle yüksek frekanslı tracepoint’ler.',
                    'strace ile fark: strace süreç başına ptrace ile pahalı; bpftrace örnekler/filtreler — doğru araç doğru soru.'
                ],
                commands: [
                    { cmd: 'bpftrace -e \'tracepoint:syscalls:sys_enter_openat { @[comm]=count(); }\' 2>/dev/null | head', note: 'openat sayımı (lab)' },
                    { cmd: 'bpftrace -l \'tracepoint:syscalls:sys_enter_*\' 2>/dev/null | head', note: 'Probe listesi örneği' },
                    { cmd: 'sudo execsnoop-bpfcc 2>/dev/null | head || echo \'BCC yoksa paket kur\'', note: 'exec snoop (BCC adları distroya göre)' }
                ],
                mistakes: [
                    'Prod’da filtresiz her syscall’u saatlerce saymak.',
                    'Çıktıyı ticket’a yapıştırıp PII/path secret temizlemek.'
                ],
                exercise: 'Lab’de bir openat one-liner ile en çok open yapan comm’u bulun; 30 sn sonra Ctrl-C.'
            }
        ],
        orta: [
            {
                id: 'ch33-o1',
                title: 'Sürekli profiling fikri',
                hook: 'Incident anında flamegraph aramak yerine her zaman düşük maliyetli örnekleme.',
                tags: 'continuous profiling flamegraph pyroscope parca',
                search: 'continuous profiling eBPF flamegraph',
                body: [
                    'Continuous profiling: CPU (ve bazen alloc) örneklerini sürekli toplayıp zaman içinde karşılaştır — regressiyon ve "sessiz" CPU hırsızı görünür.',
                    'eBPF tabanlı profiler’lar (Parca, Pyroscope agent’ları, Polar Signals…) simbolizasyon ve label (pod/service) ile platform’a oturur. Sampling rate = maliyet/çözünürlük trade-off.',
                    'perf hâlâ geçerli: tek seferlik derin dalış. Sürekli profil: trend ve kıyas. İkisi rakip değil; katman.'
                ],
                commands: [
                    { cmd: 'perf top -n 2>/dev/null | head || true', note: 'Anlık CPU hot path' },
                    { cmd: 'cat /proc/sys/kernel/perf_event_paranoid 2>/dev/null', note: 'perf/eBPF erişim sıkılığı' }
                ],
                callouts: [
                    { type: 'warn', title: 'Sembol', text: 'stripped binary + missing debuginfo = "unknown" dolu flamegraph; CI’da sembol stratejisi şart.' }
                ]
            },
            {
                id: 'ch33-o2',
                title: 'Falco / Tetragon: runtime güvenlik gözlemi',
                hook: 'Syscall ve process soyunu politika diline çevirmek.',
                tags: 'Falco Tetragon runtime security eBPF',
                search: 'Falco Tetragon eBPF kubernetes security',
                body: [
                    '<strong>Falco</strong>: kurallarla şüpheli davranış (shell in container, sensitive file, unexpected network). eBPF/modern probe sürücüleri ile kernel olaylarından beslenir.',
                    '<strong>Tetragon</strong> (Cilium): eBPF ile process/syscall/file/network gözlemi + enforcement seçenekleri; K8s identity ile zengin etiket.',
                    'Ops için: alert yorgunluğu gerçek düşmandır — kuralı ortamınıza göre daraltın, CI/CD "beklenen" exec’lerini allowlist’leyin, IR playbook’a bağlayın (ch32).'
                ],
                interview: [
                    { q: 'EDR ile Falco farkı?', a: 'Örtüşürler. Falco/Tetragon cloud-native/K8s-centric ve politika-as-code’a yakın; EDR host telemetri + vendor response. Birlikte veya bilinçli seçim.' }
                ]
            },
            {
                id: 'ch33-o3',
                title: 'Güvenlik sınırları ve operasyonel limitler',
                hook: 'Verifier her şeyi kurtarmaz; bütçe ve yetki sizi kurtarır.',
                tags: 'eBPF safety limits CAP_BPF unprivileged',
                search: 'eBPF safety limits production CAP_BPF',
                body: [
                    'Kernel verifier + memory/complexity limitleri kötü programı reddeder; yine de yüksek frekanslı probe CPU yakar, map bellek şişirir, yanlış kprobe kararsızlık riski taşır.',
                    'Unprivileged eBPF çoğu distroda kısıtlıdır — doğru olan budur. Prod agent’ları least privilege + imza + upgrade kanalı ile yönetin.',
                    'Kernel upgrade: BPF programları CO-RE/BTF ile taşınabilirlik kazanır; eski "her kernel’e özel derleme" acısı azalır ama test şart.'
                ],
                mistakes: [
                    'Geliştirici laptop’unda unprivileged BPF açıp aynı soft’u prod image’a taşımak.',
                    'XDP drop kuralını staging’siz prod edge’e basmak.'
                ]
            }
        ],
        ileri: [
            {
                id: 'ch33-i1',
                title: 'Ne zaman eBPF, ne zaman klasik araç?',
                hook: 'Her çivi eBPF çekici istemez.',
                tags: 'observability strategy perf strace eBPF',
                search: 'when to use eBPF vs perf strace',
                body: [
                    'Hızlı host teşhisi: <code>ps</code>, <code>ss</code>, <code>iostat</code>, metrik/dashboard. Derin CPU: perf. Hedefli "kim yaptı?": bpftrace. Filo/K8s runtime politika: Falco/Tetragon/Cilium.',
                    'Maliyet modeli yazın: sampling rate, map size, cardinality (pod başına seri). Observability bill + CPU overhead IR’den bağımsız risk.',
                    'Senior teslimat: runbook’ta "ilk 5 dk klasik, sonra hedefli BPF" — her on-call’ın bpftrace şiir yazması gerekmez.'
                ],
                kernel: 'tracepoint kararlı ABI’ye daha yakın; kprobe kırılgan olabilir. BTF/CO-RE modern dağıtım modelidir.',
                interview: [
                    { q: 'eBPF programı prod’u düşürür mü?', a: 'Verifier ciddi korur ama kaynak tüketimi ve hatalı networking programı (XDP) outage üretebilir. Canary, budget, rollback şart.' }
                ]
            },
            {
                id: 'ch33-i2',
                title: 'Platform’a gömülü gözlem mimarisi',
                hook: 'Laptop’ta one-liner ≠ kümede ürün.',
                tags: 'eBPF platform opentelemetry cilium',
                search: 'eBPF platform observability kubernetes OpenTelemetry',
                body: [
                    'Kümede: node agent DaemonSet, RBAC dar, seccomp/AppArmor uyumu, telemetry export (OTel). Kartinalite patlamasını label politikası ile kesin.',
                    'Ağ: Cilium Hubble benzeri eBPF görünürlük; güvenlik politikası ile aynı veri düzlemi — "gözlem için ayrı sidecar" zorunluluğu azalabilir.',
                    'Veri sınıflandırması: process args secret taşıyabilir; redact/collect politikası IR ve KVKK ile hizalı olsun.'
                ],
                callouts: [
                    { type: 'info', title: 'Bağımlılık', text: 'eBPF tooling kernel özelliklerine bağlıdır; node OS çeşitliliği = test matrisı. Bottlerocket/Talos gibi minimal OS’lerde destek matrisini okuyun.' }
                ]
            }
        ]
    },
    chapterInterview: [
        { q: 'eBPF’i tek cümlede?', a: 'Doğrulanmış kernel programlarıyla düşük maliyetli gözlem/politika; bcc/bpftrace ile soru sor, Falco/Tetragon ile runtime sinyal üret, limit ve yetkiyi bilerek kullan.' }
    ]
},

/* ========== 34 KONTEYNER POD GUVENLIGI ========== */
{
    id: 'ch34', num: '34', title: 'Konteyner ve Pod Güvenliği',
    subtitle: 'PSS · NetworkPolicy · supply chain',
    group: 'guvenlik',
    who: 'K8s’e workload alan platform/DevOps; "root container normal" diyen PR’ları durduranlar.',
    intro: 'Konteyner izolasyonu sihir değildir: capabilities, Pod Security, ağ politikası ve image zinciri birlikte güvenlik üretir. Bu bölüm PSS/PodSecurity, capability drop, NetworkPolicy default deny, image provenance, admission (OPA/Kyverno) fikri ve runtime tehditleri işler — YAML’da false sense of security’den çıkış.',
    levels: {
        baslangic: [
            {
                id: 'ch34-b1',
                title: 'Tehdit modeli: breakout, lateral, supply chain',
                hook: 'Pod içinde shell = oyun bitmedi; bazen yeni başladı.',
                tags: 'container threat model breakout supply chain',
                search: 'kubernetes container security threat model',
                body: [
                    'Üç eksen: (1) container escape / host abuse, (2) cluster içi lateral (API, metadata, diğer pod), (3) supply chain (zehirli image, bağımlılık, CI).',
                    'Varsayılanlar tarihsel olarak gevşekti: root, geniş capability, tüm pod’lar konuşur. PSS + NetworkPolicy + admission ile güvenli default ürünleştirilir.',
                    'Paylaşılan kernel gerçeği: VM kadar sert izolasyon beklemeyin; defense in depth (seccomp, drop caps, readOnlyRootFilesystem, user namespace) şart.'
                ],
                interview: [
                    { q: 'Konteyner VM midir?', a: 'Hayır — proses izolasyonu + cgroup/ns; kernel ortaktır. Güçlü sınır için gVisor/Kata veya ayrı node/VM katmanı düşünülür.' }
                ]
            },
            {
                id: 'ch34-b2',
                title: 'PSS / Pod Security: privileged’tan restricted’a',
                hook: 'Namespace etiketleri ile "bu sahada root yok".',
                tags: 'PodSecurity PSS restricted baseline privileged',
                search: 'Pod Security Standards PSS kubernetes',
                body: [
                    '<strong>Pod Security Standards</strong>: Privileged (gevşek), Baseline (bilinen tehlikeleri kes), Restricted (sert: non-root, drop ALL caps, seccomp…).',
                    'K8s Pod Security Admission: namespace etiketleri ile enforce/audit/warn. Eski PodSecurityPolicy (PSP) kalkmış sayılır; PSS + admission controller modern yol.',
                    'Migrasyon: önce warn/audit ile kırılacak workload’ları görün, sonra enforce. Platform golden template restricted’a yakın doğmalı.'
                ],
                commands: [
                    { cmd: 'kubectl get ns -L pod-security.kubernetes.io/enforce 2>/dev/null | head', note: 'PSS enforce etiketleri' },
                    { cmd: 'kubectl auth can-i use podsecurity/restricted 2>/dev/null || true', note: 'Ortamda API farkı olabilir' }
                ],
                mistakes: [
                    'Tek namespace’i Privileged bırakıp "geçici" demek — kalıcı borç.',
                    'Restricted’ı enforce edip CI’da aynı standardı uygulamamak (drift).'
                ]
            },
            {
                id: 'ch34-b3',
                title: 'Capabilities: ALL drop, gerekirse tek tek ekle',
                hook: 'root + CAP_SYS_ADMIN ≈ "konteyner tiyatrosu".',
                tags: 'linux capabilities drop ALL securityContext',
                search: 'kubernetes drop capabilities ALL',
                body: [
                    'Linux capabilities root gücünü parçalar. Konteynerde sık doğru model: <code>drop: ["ALL"]</code> sonra gerçekten gerekeni (ör. <code>NET_BIND_SERVICE</code>) eklemek.',
                    '<code>securityContext</code>: <code>runAsNonRoot</code>, <code>allowPrivilegeEscalation: false</code>, <code>readOnlyRootFilesystem: true</code>, seccompProfile RuntimeDefault.',
                    'HostPID/HostNetwork/HostPath: breakout ve bilgi sızıntısı otoyolu — istisna süreci ve admission ile kilitleyin.'
                ],
                commands: [
                    { cmd: 'kubectl explain pod.spec.containers.securityContext 2>/dev/null | head -n 30', note: 'API alanı özeti' }
                ],
                exercise: 'Bir Deployment YAML’ında drop ALL + runAsNonRoot + allowPrivilegeEscalation false taslağı yazın (lab).'
            }
        ],
        orta: [
            {
                id: 'ch34-o1',
                title: 'NetworkPolicy: default deny ve least traffic',
                hook: 'Namespace içi "herkes herkese" lateral movement rüyasıdır.',
                tags: 'NetworkPolicy default deny kubernetes CNI',
                search: 'kubernetes NetworkPolicy default deny',
                body: [
                    'NetworkPolicy (CNI desteklemeli: Calico, Cilium, …): pod seçici + ingress/egress kuralları. Varsayılan politika yoksa çoğu cluster’da tüm trafik açık.',
                    'Örüntü: namespace’de default-deny ingress (ve bilinçli egress), sonra label ile allow (frontend→backend:5432). DNS (kube-dns) egress unutulursa "her şey kırıldı" sanılır.',
                    'Policy-as-code: CI’da kuru doğrulama; boş podSelector tuzaklarını review checklist’e koyun.'
                ],
                commands: [
                    { cmd: 'kubectl get networkpolicy -A 2>/dev/null | head', note: 'Mevcut politikalar' },
                    { cmd: 'kubectl describe networkpolicy -n default 2>/dev/null | head -n 40', note: 'Örnek describe' }
                ],
                crisis: 'Yeni NetPol sonrası DNS/timeout — kube-dns ve metadata IP allow listesini kontrol et.',
                callouts: [
                    { type: 'warn', title: 'CNI', text: 'Policy yazmak yetmez; CNI enforcement yoksa YAML tiyatrodur. Cilium/Calico dokümanını doğrulayın.' }
                ]
            },
            {
                id: 'ch34-o2',
                title: 'Image provenance ve supply chain',
                hook: 'latest + public registry = bilinmeyen binary çalıştırmak.',
                tags: 'image provenance SBOM cosign supply chain',
                search: 'kubernetes image provenance cosign SBOM',
                body: [
                    'Sabit digest ile deploy (<code>image@sha256:…</code>); floating tag kaçın. Private registry + vulnerability scan (CI gate) + SBOM.',
                    'İmza: Cosign/Sigstore ile imzalı image; admission’da doğrula. Base image’ı kendi bakımlı golden base’e indirgeyin.',
                    'Build: least privilege CI, dependency pin, secret’ı layer’a bake etmeme. "Scan geçti" ≠ runtime trust; yine PSS/NetPol.'
                ],
                mistakes: [
                    'Prod’da <code>:latest</code> ve her node’un farklı digesti.',
                    'Sadece CVSS skoru ile gate; exploitability ve exposure yok saymak.'
                ],
                interview: [
                    { q: 'Tag mı digest mi?', a: 'Prod’da digest. Tag hareket eder; aynı deploy tekrarlanabilir ve audit edilebilir olmalı.' }
                ]
            },
            {
                id: 'ch34-o3',
                title: 'Admission: OPA/Gatekeeper ve Kyverno fikri',
                hook: 'PSS yetmezse politika motoruyla "cluster hukukunu" yazın.',
                tags: 'OPA Gatekeeper Kyverno admission controller',
                search: 'OPA Kyverno admission kubernetes policy',
                body: [
                    'Admission webhook: API sunucusuna gelen objeyi kabul/red/mutate. <strong>OPA/Gatekeeper</strong> (Rego), <strong>Kyverno</strong> (Kubernetes-native YAML politikası) yaygın.',
                    'Örnek politikalar: registry allowlist, zorunlu label, hostPath yasağı, resource limit zorunluluğu, immutable tag. Audit mode ile başlayın.',
                    'Operasyon: webhook outage = cluster yazma felci riski (fail open/closed trade-off). HA ve break-glass planı şart.'
                ],
                callouts: [
                    { type: 'info', title: 'Mutating vs validating', text: 'Mutating varsayılan ekler; validating kapıyı tutar. İkisini de bilinçli sıralayın.' }
                ]
            }
        ],
        ileri: [
            {
                id: 'ch34-i1',
                title: 'Runtime tehditleri: crypto, reverse shell, privilege path',
                hook: 'Build-time scan çalışan miner’ı görmez.',
                tags: 'runtime threats falco container escape',
                search: 'kubernetes runtime threats container escape',
                body: [
                    'Runtime: beklenmeyen process (shell, miner), sensitive mount yazma, privilege escalation denemesi, IMDS/credential theft, lateral scan.',
                    'Sinyal kaynakları: Falco/Tetragon/EDR, audit log, ağ anomalisi. IR: pod isolate (NetworkPolicy/cilium), credential rotate, node cordon — ch32 playbook ile birleştirin.',
                    'Escape sınıfları: privileged + hostPath, çekirdek exploit, yanlış volume; hardening kaçış yüzeyini küçültür ama sıfırlamaz.'
                ],
                commands: [
                    { cmd: 'kubectl get pods -A -o wide 2>/dev/null | head', note: 'Şüphe anında envanter' },
                    { cmd: 'kubectl top pods -A 2>/dev/null | head', note: 'CPU hırsızı ipucu' }
                ],
                crisis: 'Pod içinde reverse shell — anında NetPol deny egress, token iptal, node’u şüpheli işaretle, image digest kaydet.'
            },
            {
                id: 'ch34-i2',
                title: 'Çok katmanlı sertleştirme mimarisi',
                hook: 'Tek kontrol "secure" yazdırmaz; katmanlar yazar.',
                tags: 'defense in depth kubernetes security architecture',
                search: 'kubernetes defense in depth PSS networkpolicy',
                body: [
                    'Katmanlar: supply chain (imza/SBOM) → admission/PSS → securityContext/seccomp → NetworkPolicy/service mesh mTLS → runtime detection → node OS/MAC (SELinux/AppArmor).',
                    'Multi-tenant: namespace Isolation + quota + ayrı node pool hassas işler için. Secret: CSI driver / sealed; env’de uzun ömürlü key yok.',
                    'Senior ölçüt: restricted enforce oranı, NetPol coverage, imzasız image engel oranı, runtime alert’lerin MTTD’si — checklist değil metrik.'
                ],
                interview: [
                    { q: 'İlk hafta ne enforce edersin?', a: 'Baseline/PSS warn→enforce, registry allowlist, drop ALL template, default-deny NetPol + DNS allow; runtime alert’i IR’ye bağla.' }
                ]
            }
        ]
    },
    chapterInterview: [
        { q: 'Pod güvenliğinde minimum omurga?', a: 'PSS restricted’a yol, capability drop ALL, NetworkPolicy default deny, digest+imza/admission, runtime tespit — hepsi birlikte.' }
    ]
}

    ];

    window.BIBLE = window.BIBLE.concat(MORE);

    /* —— Mevcut ince bölümlere ek dersler —— */
    function addLessons(chapterId, level, lessons) {
        const ch = window.BIBLE.find(c => c.id === chapterId);
        if (!ch) return;
        ch.levels[level] = (ch.levels[level] || []).concat(lessons);
    }

    addLessons('ch10', 'baslangic', [{
        id: 'ch10-b2',
        title: 'DNS: isimden IP’ye',
        hook: "'Site açılmıyor' çoğu zaman DNS’tir.",
        tags: 'dns resolv dig',
        search: 'dns dig resolv.conf nslookup',
        body: [
            'Tarayıcı "google.com" yazınca önce IP gerekir. <code>/etc/resolv.conf</code> hangi DNS sunucusuna sorulacağını söyler (systemd-resolved yönetebilir).',
            '<code>dig</code> / <code>getent hosts</code> teşhis araçlarıdır. Yanlış DNS = rastgele timeout’lar.',
            'Corporate ortamlarda split-DNS ve VPN DNS sızıntısı klasik tuzaklardır.'
        ],
        commands: [
            { cmd: 'cat /etc/resolv.conf', note: 'Hangi resolver?' },
            { cmd: 'dig example.com +short', note: 'A kaydı' },
            { cmd: 'getent hosts example.com', note: 'NSS yoluyla çözüm' }
        ],
        crisis: 'Deploy sonrası servis isimleri çözülmüyor — CoreDNS/resolv ve search domain kontrol.'
    }]);

    addLessons('ch10', 'orta', [{
        id: 'ch10-o2',
        title: 'Routing ve traceroute zihniyeti',
        tags: 'ip route traceroute mtr',
        search: 'route traceroute mtr gateway',
        body: [
            '<code>ip route</code> varsayılan gateway’i gösterir. Paket "nereye gider?" sorusu buradan başlar.',
            '<code>traceroute</code>/<code>mtr</code> yol üzerindeki hop’ları gösterir — ama ICMP filtresi yolu "kırık" gösterebilir; yorum dikkat ister.',
            'Cloud’da çoğu "network sorunu" aslında security group / NACL / route table’dır.'
        ],
        commands: [
            { cmd: 'ip route show', note: 'Rotalar' },
            { cmd: 'ip neigh', note: 'ARP/neighbor' },
            { cmd: 'mtr -rwz example.com', note: 'Kombine ping+trace' }
        ]
    }]);

    addLessons('ch10', 'ileri', [{
        id: 'ch10-i2',
        title: 'TCP performans: latency, retransmission, MTU',
        tags: 'tcp mtu mss retransmission',
        search: 'mtu mss tcp retransmission',
        body: [
            'Yavaşlık CPU olmayabilir: packet loss, küçük pencere, DNS, TLS handshake, uzak RTT.',
            'MTU/MSS uyumsuzluğu (özellikle VPN/GRE) "bazı siteler açılmıyor" üretir. <code>ping -M do -s</code> ile path MTU test edilir.',
            '<code>ss -ti</code> retransmission ve RTT ipuçları verir.'
        ],
        commands: [
            { cmd: 'ss -s', note: 'Socket özeti' },
            { cmd: 'ss -ti dst :443 | head', note: 'TCP info' }
        ],
        interview: [
            { q: 'Connection timed out vs refused?', a: 'Refused: hedefte kimse dinlemiyor (RST). Timed out: paket düşüyor veya filtre sessizce yutuyor (DROP).' }
        ]
    }]);

    addLessons('ch11', 'orta', [{
        id: 'ch11-o2',
        title: 'Incident iletişim ve kanıt',
        tags: 'incident communication evidence',
        search: 'incident response iletişim kanıt',
        body: [
            'Teknik teşhis kadar iletişim kritiktir: kim bilgilenecek, ne sıklıkla, hangi kanal (bridge).',
            'Kanıt: timestamp’li komut çıktıları, change id, dashboard screenshot, log aralığı. Sonra silinen şeyler postmortem’i öldürür.',
            'Severity tanımı önceden yazılı olmalı — tartışma kriz anında yapılmaz.'
        ],
        exercise: 'Lab’de sahte P2 senaryosu yazın: etki, hipotez, komutlar, iletişim taslağı.'
    }]);

    addLessons('ch11', 'ileri', [{
        id: 'ch11-i2',
        title: 'Postmortem: blameless ve önleyici aksiyon',
        tags: 'postmortem blameless',
        search: 'postmortem blameless rca',
        body: [
            'Blameless: insan hatası sistem tasarımının semptomudur. "Kim?" değil "hangi kontrol eksikti?"',
            'Aksiyonlar SMART olmalı: owner, tarih, doğrulama. "Daha dikkatli olalım" aksiyon değildir.',
            'Error budget / SLO ihlali feature hızını geçici kısıtlayabilir — ürün ile SRE sözleşmesi.'
        ],
        interview: [
            { q: 'İyi bir RCA’nın parçaları?', a: 'Timeline, etki, tetikleyici, katkıda bulunan faktörler, kök neden(ler), ne işe yaradı, aksiyonlar, takip.' }
        ]
    }]);

    addLessons('ch3', 'ileri', [{
        id: 'ch3-i3',
        title: 'systemd unit yazmak (servis dosyası)',
        tags: 'systemd unit service',
        search: 'systemd unit yazmak service dosyası',
        body: [
            'Kendi uygulamanızı servis yapmak: <code>/etc/systemd/system/app.service</code> — Type, ExecStart, Restart, User, EnvironmentFile.',
            '<code>daemon-reload</code> unutulursa değişiklik görünmez. <code>journalctl -u app</code> teşhis.',
            'Security alanları: NoNewPrivileges, ProtectSystem, PrivateTmp — hardening ile kesişir.'
        ],
        commands: [
            { cmd: 'systemctl cat ssh', note: 'Mevcut unit’i oku' },
            { cmd: 'sudo systemctl daemon-reload', note: 'Unit cache yenile' },
            { cmd: 'sudo systemctl edit --full nginx', note: 'Override düzenle' }
        ],
        exercise: 'Basit bir sleep/loop script’ini systemd servisi yapıp enable edin.'
    }]);

    addLessons('ch5', 'ileri', [{
        id: 'ch5-i2',
        title: 'rsync, snapshot ve restore tatbikatı',
        tags: 'rsync snapshot restore drill',
        search: 'rsync snapshot restore tatbikat',
        body: [
            'Yedek aldım ≠ kurtarabilirim. Düzenli restore drill şarttır.',
            'rsync -aHAX --delete dikkatli kullanılır. Snapshot (LVM/ZFS/cloud) tutarlılık için app-aware olmalı (DB freeze).',
            '3-2-1: 3 kopya, 2 medya, 1 offsite. Ransomware’a karşı immutable/offline kopya.'
        ],
        commands: [
            { cmd: 'rsync -a --dry-run /data/ /mnt/backup/data/', note: 'Önce dry-run' },
            { cmd: 'rsync -aHAX /data/ /mnt/backup/data/', note: 'Gerçek senkron' }
        ],
        crisis: 'Backup var ama encryption key yok — key yönetimi yedek planının parçasıdır.'
    }]);

    addLessons('ch9', 'orta', [{
        id: 'ch9-o2',
        title: 'Lab metodolojisi: recon → enumerate → exploit → report',
        tags: 'pentest methodology lab',
        search: 'pentest metodoloji recon report',
        body: [
            'Kaotik araç çalıştırmak ≠ test. Metodoloji: kapsam → keşif → enumerasyon → zafiyet → (izinli) sömürü → post → rapor.',
            'Her adımda not: IP, port, servis, sürüm, kanıt screenshot, CVSS/iş etkisi.',
            'Blue Team için aynı zinciri tersine çevirin: log’da ne görünürdü?'
        ],
        callouts: [
            { type: 'danger', title: 'Kapsam', text: 'Yalnızca yazılı izinli hedefler. Bulut paylaşımlı lab’lerde de kurallara uyun.' }
        ],
        exercise: 'Kendi VM’inizde nmap ile açık port envanteri çıkarıp tabloya dökün.'
    }]);
})();
