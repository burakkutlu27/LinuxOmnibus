/* Kali — en kritik araçlar için derin eğitim (install’tan fazlası) */
window.KALI_DEEP = [
    {
        id: 'nmap',
        name: 'nmap',
        title: 'Nmap — Ağın X-Ray’i',
        rank: 'Top 1 · Her pentest / SOC’nin omurgası',
        why: 'Hedefi görmeden hiçbir şey yapamazsınız. Nmap “kim var, hangi kapı açık, arkasında ne servis dönüyor?” sorularının cevabıdır. Hem saldırgan hem savunmacı aynı dili konuşur.',
        what: 'Nmap (Network Mapper), paketler göndererek uzak host’ların ayakta olup olmadığını, TCP/UDP port durumunu, servis sürümünü ve (mümkünse) işletim sistemini tahmin eder. NSE (Nmap Scripting Engine) ile zafiyet imzası, brute, enum script’leri de çalıştırılabilir.',
        how: [
            'Siz bir tarama tipi seçersiniz (örn. -sS SYN, -sT connect, -sU UDP).',
            'Nmap hedef IP/port’lara özel paketler yollar; yanıt (SYN-ACK, RST, ICMP…) port durumunu belirler: open / closed / filtered.',
            '-sV ile “banner / probe” yaparak Apache 2.4.x gibi sürüm tahmini çıkarır.',
            '-sC veya --script ile NSE script’leri ek bilgi toplar (http-title, smb-os-discovery…).',
            'Çıktıyı -oA / -oX ile kaydedersiniz; rapor ve diğer araçlara girdi olur.'
        ],
        when: [
            'Kapsamdaki tüm host’ları keşfetmek (ping sweep / -sn)',
            'Web/API pentest’inden önce saldırı yüzeyini çıkarmak',
            'Firewall sonrası hangi portların sızdığını doğrulamak',
            'SOC: “şüpheli host’ta beklenmeyen dinleyici var mı?”'
        ],
        install: 'sudo apt install nmap\n# veya\nsudo apt install kali-tools-top10',
        lab: [
            'Lab VM’nizin IP’sini öğrenin (ip addr). Kendi makinenize tarama yapın — yasal ve güvenli.',
            'nmap -sn 192.168.x.0/24 ile kim ayakta bakın (kendi lab ağınız).',
            'nmap -sV -sC -p- -oA lab1 HEDEF — tüm TCP, sürüm + default script, çıktı kaydı.',
            'nmap --script vuln HEDEF — sadece izinli lab’de; gürültülü olabilir.',
            'Çıktıdaki open port’ları not edin: 22=SSH, 80/443=web, 445=SMB… Sonraki aracı buna göre seçin.'
        ],
        commands: [
            { cmd: 'nmap -sn 192.168.1.0/24', why: 'Host keşfi (port taramadan)' },
            { cmd: 'nmap -sS -p- --min-rate 1000 HEDEF', why: 'Hızlı SYN, tüm TCP (root gerekir)' },
            { cmd: 'nmap -sV -sC -oA scan HEDEF', why: 'Sürüm + default script + triple çıktı' },
            { cmd: 'nmap -sU --top-ports 20 HEDEF', why: 'Yaygın UDP portları' },
            { cmd: 'nmap -Pn -p 443 HEDEF', why: 'Ping engelli host’ta port kontrolü' }
        ],
        mistakes: [
            'İzinsiz internet taraması — yasal felaket ve ban.',
            '-p- + --script vuln’ü prod’da rastgele çalıştırmak; DoS/alarm üretir.',
            'filtered ile closed’ı aynı sanmak: filtered = engel/firewall olabilir.',
            'Çıktıyı kaydetmemek; sonra “hangi port açıktı?” diye kaybolmak.'
        ],
        blue: 'IDS/IPS Nmap imzalarını tanır (özellikle -sS yüksek hız). Savunmada: gereksiz port kapat, banner sadeleştir, honeypot ile gürültüyü yakala. Log’da “nmap” User-Agent olmaz; SYN anomali + sıralı port gezinme arayın.',
        interview: [
            { q: '-sS ile -sT farkı?', a: 'SYN half-open, CAP_NET_RAW/root ister, log’da daha az “completed connection”. Connect full handshake, unprivileged çalışır, daha gürültülü.' },
            { q: 'filtered ne demek?', a: 'Yanıt gelmedi veya ICMP unreachable/prohibit — genelde firewall/ACL. Port kapalı demek değildir.' }
        ]
    },
    {
        id: 'burp',
        name: 'burpsuite',
        title: 'Burp Suite — Web trafiğinin cerrah masası',
        rank: 'Top Web aracı',
        why: 'Modern uygulamaların yüzü HTTP(S). Burp olmadan parametre manipülasyonu, oturum, JWT, API testi körlemesine yapılır. Community edition bile kariyer için şart.',
        what: 'Burp Suite bir intercepting proxy’dir: tarayıcınızın HTTP(S) trafiği Burp üzerinden geçer; siz isteği durdurur, değiştirir, tekrar gönderirsiniz. Repeater, Intruder, Decoder, Comparer gibi laboratuvarlar içerir. Pro’da Scanner vardır.',
        how: [
            'Burp yerel proxy açar (varsayılan 127.0.0.1:8080).',
            'Tarayıcıyı bu proxy’ye yönlendirirsiniz; Burp CA sertifikasını tarayıcıya import ederek HTTPS’i de görebilirsiniz.',
            'Intercept On iken istek siz onaylayana kadar sunucuya gitmez — cerrahi müdahale anı.',
            'HTTP history tüm akışı saklar; ilginç isteği Repeater’a atıp parametreleri tek tek oynarsınız.',
            'Intruder ile wordlist/fuzz (IDOR, auth bypass denemeleri) yapılır.'
        ],
        when: [
            'Web / API pentest’inin tamamı',
            'Authentication, authorization, business logic testleri',
            'SQLi/XSS bulgusunu manuel doğrulama (otomatik araca kör güvenme)'
        ],
        install: 'sudo apt install burpsuite\n# Başlat: burpsuite\n# Tarayıcı proxy: 127.0.0.1:8080\n# CA: http://burpsuite → sertifikayı import et',
        lab: [
            'Burp’u açın, Temporary project → Next.',
            'Firefox/Chrome’da proxy’yi 127.0.0.1:8080 yapın (veya FoxyProxy).',
            'Burp CA’yı kurun; https://example.com açıp Proxy → HTTP history’de isteği görün.',
            'DVWA / Juice Shop / lokal lab uygulamasında login isteğini Intercept ile yakalayın.',
            'İsteği Repeater’a gönderin; bir parametreyi değiştirip Send — yanıtı okuyun.',
            'Basit IDOR: id=1 → id=2 deneyin. Yetkisiz veri geliyorsa bulgu.'
        ],
        commands: [
            { cmd: 'burpsuite', why: 'GUI’yi başlat' },
            { cmd: 'Proxy → Intercept → Intercept is on', why: 'Trafiği tut' },
            { cmd: 'Ctrl+R (Repeater’a gönder)', why: 'Manuel tekrar / manipülasyon' },
            { cmd: 'Intruder → Payloads → Simple list', why: 'Fuzz / brute (dikkatli rate)' }
        ],
        mistakes: [
            'CA kurmadan HTTPS’te “işe yaramıyor” sanmak.',
            'Intercept açık unutup her sitenin yavaşladığını düşünmek.',
            'Intruder’ı production login’e sınırsız ateşlemek → lockout / yasal sorun.',
            'Sadece Scanner’a güvenmek; business logic Burp’un manuel tarafındadır.'
        ],
        blue: 'WAF/log’da Burp User-Agent, anormal parametre mutasyonları, yüksek 401/403 oranı. CSP, rate-limit, server-side authorization her istekte.',
        interview: [
            { q: 'Burp ile ZAP farkı?', a: 'İkisi de intercepting proxy. Burp endüstride de facto; Pro scanner güçlü. ZAP tamamen açık kaynak ve otomasyona yatkın. İkisini de bilmek avantaj.' },
            { q: 'Repeater ne zaman Intruder’dan iyi?', a: 'Tek isteği derin anlamak, mantık hatası, birkaç değer denemek için Repeater. Büyük wordlist / pozisyon fuzz için Intruder.' }
        ]
    },
    {
        id: 'metasploit',
        name: 'metasploit-framework',
        title: 'Metasploit — Exploit orkestrası',
        rank: 'Exploitation standardı',
        why: 'Binlerce modül, standartlaşmış workflow (exploit → payload → session → post). “PoC’yi elle derleyip debug” yerine kontrollü doğrulama için kullanılır — her zaman kapsam dahilinde.',
        what: 'Metasploit Framework (MSF): exploit, auxiliary (tarama/brute), payload, encoder, post (oturum sonrası) modüllerini bir araya getirir. msfconsole ana arayüzdür. Meterpreter gelişmiş bellek-içi ajan payload’udur.',
        how: [
            'search ile modül bulunur; use ile seçilir.',
            'show options → RHOSTS, RPORT, LHOST… set edilir.',
            'check (varsa) zafiyeti doğrular; exploit / run çalıştırır.',
            'Başarılıysa session açılır; sessions -i N ile girilir.',
            'post modülleriyle hash dump, persistence, pivot (yetki ve kapsam!).'
        ],
        when: [
            'Bilinen CVE’nin lab’de doğrulanması',
            'Credential + public exploit zinciri',
            'CTF / pentest’te hızlı kanıt (screenshot + session)',
            'Post-ex öğrenimi (yalnızca izinli hedef)'
        ],
        install: 'sudo apt install metasploit-framework\n# İlk DB (opsiyonel):\nsudo msfdb init\nmsfconsole',
        lab: [
            'msfconsole açın; banner’ı görün.',
            'search type:exploit platform:linux — listeyi inceleyin (çalıştırmadan).',
            'use auxiliary/scanner/ssh/ssh_version → set RHOSTS lab_ip → run — zararsız keşif örneği.',
            'Metasploitable / bilerek zayıf lab VM kullanın; rastgele internet host’una ASLA.',
            'Başarılı session sonrası sysinfo, getuid gibi komutların ne anlama geldiğini not edin.',
            'İş bitince sessions -K ve kapsam dışı kalıntı bırakmayın (anlaşma gereği).'
        ],
        commands: [
            { cmd: 'msfconsole', why: 'Ana konsol' },
            { cmd: 'search eternalblue', why: 'Modül ara' },
            { cmd: 'use exploit/...; show options', why: 'Hedef parametreleri gör' },
            { cmd: 'set RHOSTS 10.0.0.5; set LHOST 10.0.0.1', why: 'Hedef ve callback IP' },
            { cmd: 'exploit; sessions -l', why: 'Çalıştır ve oturumları listele' }
        ],
        mistakes: [
            'LHOST’u yanlış IP yapmak → shell gelmez.',
            'Payload’u internete açık bırakmak (handler).',
            '“Exploit çalıştı = pentest bitti” — asıl iş etki analizi ve rapor.',
            'Izinsiz sistemde MSF — ağır suç.'
        ],
        blue: 'Meterpreter / Cobalt benzeri C2 trafiği, anomali process, LSASS erişimi. EDR, network egress filtre, patch yönetimi. Purple team’de aynı exploit’i kontrollü koşturup tespit edin.',
        interview: [
            { q: 'Exploit ile payload farkı?', a: 'Exploit zafiyeti tetikleyen kod yolu; payload zafiyet sonrası çalışmasını istediğiniz kod (shell, meterpreter). Ayırmak yeniden kullanım sağlar.' },
            { q: 'Bind shell vs reverse shell?', a: 'Bind: hedef port açar, siz bağlanırsınız (firewall zor). Reverse: hedef sizin LHOST:LPORT’unuza bağlanır (egress genelde daha kolay).' }
        ]
    },
    {
        id: 'sqlmap',
        name: 'sqlmap',
        title: 'SQLmap — SQL injection otomasyonu',
        rank: 'Web App #1 otomatik doğrulayıcı',
        why: 'SQLi hâlâ kritik bulgular listesinde. SQLmap tespit + DBMS fingerprint + data dump’ı hızlandırır; ama kör kullanmak false positive ve yıkım üretir.',
        what: 'SQLmap, verilen URL/form/cookie üzerinde SQL injection noktalarını dener (boolean, time, error, UNION, stacked). DBMS’i tanır; tablo/kolon listeler; --dump ile veri çeker; bazen OS shell (--os-shell) dener.',
        how: [
            'Enjekte edilebilir parametreyi (id=1*) veya Burp request dosyasını (-r) verirsiniz.',
            'SQLmap payload’ları gönderir; yanıttaki fark / gecikme / hata mesajına göre injection tipini çıkarır.',
            'Teknik seçilir (--technique=BTU…); WAF varsa tamper script’leri encoding uygular.',
            'Enumeration bayrakları (--dbs, --tables, --dump) adım adım veri çeker.',
            'Her adımda --batch otomatik “yes” der — lab’de rahat, prod kapsamda tehlikeli.'
        ],
        when: [
            'Manuel olarak SQLi şüphesi oluştuğunda doğrulama',
            'CTF / lab web challenge',
            'Kapsamda açıkça izin verilen injection testi'
        ],
        install: 'sudo apt install sqlmap\n# Burp’tan isteği kaydet → Right click → Save item',
        lab: [
            'DVWA’yı “Low” security yapın; SQL Injection sayfasını açın.',
            'Burp ile isteği yakalayıp req.txt kaydedin.',
            'sqlmap -r req.txt --batch -p id — sadece id parametresini test.',
            'Zafiyet çıkarsa: --dbs sonra -D dvwa --tables — dump’a acele etmeyin, önce raporlayın.',
            'Manuel olarak da \' OR \'1\'=\'1 deneyerek SQLmap sonucunu doğrulayın.'
        ],
        commands: [
            { cmd: 'sqlmap -u "http://lab/vuln.php?id=1" --batch', why: 'Temel tarama' },
            { cmd: 'sqlmap -r req.txt -p id --dbs', why: 'Burp request + DB listesi' },
            { cmd: 'sqlmap -r req.txt --technique=BT --tamper=space2comment', why: 'WAF’a takılınca teknik/tamper' },
            { cmd: 'sqlmap -r req.txt --current-user --is-dba', why: 'Hangi DB kullanıcısı / DBA mi?' }
        ],
        mistakes: [
            '--dump ile tüm müşteri verisini çekmek (kapsam/ etik ihlali + KVKK).',
            '--os-shell’i “acaba olur mu” diye prod’da denemek.',
            'False positive’i doğrulamadan raporlamak.',
            'Rate limit yokken uygulamayı kilitlemek.'
        ],
        blue: 'Prepared statements / ORM, WAF, anomali (sqlmap User-Agent, UNION SELECT gürültüsü), DB least privilege. Log’da aynı IP’den yüzlerce 500/timeout.',
        interview: [
            { q: 'Boolean-based ile time-based farkı?', a: 'Boolean: yanıt içeriği doğru/yanlış’a göre değişir. Time: SLEEP ile gecikme ölçülür; kör (blind) ve yavaştır.' },
            { q: 'SQLmap buldu — rapor nasıl yazılır?', a: 'Parametre, tip, kanıt isteği/yanıtı, etki (hangi tablolar), düzeltme (parameterized query). Dump içeriğini müşteri istemeden eklemeyin.' }
        ]
    },
    {
        id: 'hydra',
        name: 'hydra',
        title: 'Hydra — Çevrimiçi parola denemesi',
        rank: 'Online brute-force klasiği',
        why: 'Zayıf parola hâlâ en ucuz giriş bileti. Hydra SSH/FTP/HTTP form gibi servislere sözlük saldırısı yapar. Rate ve lockout bilmeden kullanmak hem etik hem operasyonel felakettir.',
        what: 'THC Hydra, çok protokol destekleyen paralel login cracker’dır. Kullanıcı listesi (-L) ve parola listesi (-P) ile hedefe kimlik doğrulama denemeleri gönderir; başarılı çifti yazdırır.',
        how: [
            'Modül seçilir: ssh, ftp, http-post-form, rdp…',
            'Paralel görevler (-t) ile denemeler hızlanır — çok yüksek t servisi düşürebilir.',
            'Başarılı auth bulununca satır basılır; -f ile ilk buluşta durdurabilirsiniz.',
            'HTTP form’da başarısızlık koşulu (F=Invalid) doğru verilmezse false positive yağar.'
        ],
        when: [
            'Lab’de bilerek zayıf hesap',
            'Password policy ihlali kanıtı (anlaşma dahilinde)',
            'CTF servis login'
        ],
        install: 'sudo apt install hydra hydra-gtk seclists\n# Wordlist: /usr/share/seclists/Passwords/... veya rockyou.txt',
        lab: [
            'Lab SSH’ında bilinen zayıf kullanıcı oluşturun (yalnızca lab!).',
            'Küçük bir pass.txt yazın (3-5 satır); rockyou’yu körlemesine basmayın.',
            'hydra -l user -P pass.txt ssh://LAB_IP -t 4 -f',
            'Başarıyı el ile ssh user@LAB_IP ile doğrulayın.',
            'HTTP form örneğini DVWA login üzerinde deneyin — failure string’i doğru ayarlayın.'
        ],
        commands: [
            { cmd: 'hydra -L users.txt -P pass.txt ssh://10.0.0.5 -t 4 -f', why: 'SSH spray, ilk hit’te dur' },
            { cmd: 'hydra -l admin -P rockyou.txt ftp://10.0.0.5', why: 'FTP (küçük listeden başla)' },
            { cmd: 'hydra -l admin -P p.txt 10.0.0.5 http-post-form "/login:user=^USER^&pass=^PASS^:F=Invalid"', why: 'HTTP form — F= başarısızlık metni' }
        ],
        mistakes: [
            'Prod’da rockyou.txt + yüksek -t → account lockout / DoS.',
            'http-post-form failure koşulunu yanlış vermek.',
            'Başarıyı doğrulamadan rapora yazmak.'
        ],
        blue: 'Fail2ban, MFA, lockout, anomali login hızı, GEO imkânsız seyahat. SSH’da key-only.',
        interview: [
            { q: 'Hydra ile John farkı?', a: 'Hydra online (servise karşı deneme). John/Hashcat offline (hash dosyasına karşı). Online daha yavaş ve gürültülü; offline CPU/GPU bound.' }
        ]
    },
    {
        id: 'hashcat-john',
        name: 'hashcat / john',
        title: 'Hashcat & John — Offline hash kırma',
        rank: 'Credential Access ikilisi',
        why: 'Dump alınan NTLM/sha512 hash’ler ancak kırılırsa “parola”ya dönüşür. GPU (Hashcat) ve kurallı CPU (John) tamamlayıcıdır.',
        what: 'John the Ripper ve Hashcat, hash’e karşı wordlist, mask, brute, rule saldırıları yapar. Hash tipi (-m / format) doğru seçilmezse saatler boşa gider. rockyou.txt klasik başlangıç sözlüğüdür.',
        how: [
            'Hash’i dosyaya koyarsınız; tipini hashid / hash-identifier ile tahmin edersiniz.',
            'Wordlist saldırısı: her kelimeyi hash’leyip karşılaştırır (salt varsa salt+word).',
            'Rule/mangling: Password1!, yazın varyasyonları.',
            'Mask (?d?d?d?d) belirli kalıpları dener.',
            'Hashcat GPU kullanır; John CPU + jumbo format zenginliğiyle parlaktır.'
        ],
        when: [
            'Lab’de /etc/shadow veya SAM hash’i elde ettikten sonra',
            'WPA handshake hash’i (22000) kırma',
            'CTF crypto/forensics'
        ],
        install: 'sudo apt install hashcat john hash-identifier wordlists\nsudo gzip -d /usr/share/wordlists/rockyou.txt.gz  # bir kez',
        lab: [
            'Lab kullanıcısı oluşturup bilinen parola verin; hash’i /etc/shadow’dan alın (root).',
            'hashid HASH_SATIRI ile tipi görün.',
            'john --wordlist=rockyou.txt --format=crypto hash.txt (formata göre).',
            'Aynı hash’i Hashcat -m ile deneyin (mod numarası dokümantasyondan).',
            'john --show hash.txt ile kırılanları listeleyin.'
        ],
        commands: [
            { cmd: 'hashid <hash>', why: 'Tip tahmini' },
            { cmd: 'john --wordlist=rockyou.txt hashes.txt', why: 'JtR wordlist' },
            { cmd: 'john --show hashes.txt', why: 'Kırılanları göster' },
            { cmd: 'hashcat -m 0 -a 0 hashes.txt rockyou.txt', why: 'MD5 örnek (tipi doğrula!)' },
            { cmd: 'hashcat -m 22000 handshake.hc22000 rockyou.txt', why: 'WPA hash örneği' }
        ],
        mistakes: [
            'Yanlış -m / format → “Exhausted” ama aslında yanlış mod.',
            'GPU driver yokken Hashcat’ten mucize beklemek.',
            'Kırılan gerçek kullanıcı parolasını public paste’lemek.'
        ],
        blue: 'Salted + yavaş KDF (bcrypt/argon2), parola manager, breach monitoring, LSASS koruması, Credential Guard.',
        interview: [
            { q: 'Neden bcrypt MD5’ten iyi?', a: 'Yavaş ve maliyet ayarlanabilir; GPU ile saniyede milyarlarca deneme zorlaşır. MD5 hızlıdır = ucuz brute.' }
        ]
    },
    {
        id: 'wireshark',
        name: 'wireshark',
        title: 'Wireshark — Paketleri gören göz',
        rank: 'Sniff / SOC / Network #1',
        why: '“Ağda ne oluyor?” sorusunun kanıtı pcap’tir. Pentest’te protokol anlayışı; SOC’ta incident kanıtı; DevOps’ta “TLS mi DNS mi?” ayrımı.',
        what: 'Wireshark, ağ arayüzünden (veya pcap dosyasından) kareleri yakalar; protokol ağacına ayırır (Ethernet→IP→TCP→TLS→HTTP…). Display filter ile iğneyi samanlıkta bulursunuz. tshark CLI kardeşidir.',
        how: [
            'Capture interface seçilir; promiscuous mode ile switch’te görmediğiniz trafiği yine göremezsiniz (SPAN/mirror gerekir).',
            'Her paket parse edilir; stream follow ile bir TCP oturumunun payload’ı birleştirilir.',
            'Display filter (http, dns, tcp.port==443) görüntülemeyi daraltır; capture filter (port 53) yakalamayı daraltır — ikisi farklıdır!',
            'TLS içeriği genelde şifreli kalır; SNI / sertifika / JA3 gibi metadata görünür. Decrypt için keylog gerekir.'
        ],
        when: [
            '“Site açılmıyor” — DNS mi TCP mi TLS mi?',
            'MITM / anomali trafiği inceleme',
            'Malware C2 şüphesi (SOC)',
            'Kendi exploit/scan’inizin gürültüsünü anlamak'
        ],
        install: 'sudo apt install wireshark tshark\n# Wireshark grubuna kullanıcı ekle (dumpcap):\nsudo usermod -aG wireshark $USER  # oturumu kapat-aç',
        lab: [
            'Wireshark’ı açın; loopback veya eth0 seçin.',
            'Terminalde ping 1.1.1.1 yapın; icmp filtresiyle paketleri görün.',
            'curl https://example.com — tls ve http (şifreli) katmanlarına bakın; Client Hello / SNI’yi bulun.',
            'Follow → TCP Stream deneyin.',
            'Aynı yakalamayı tshark -i eth0 -c 20 ile CLI’dan yapın.'
        ],
        commands: [
            { cmd: 'wireshark', why: 'GUI' },
            { cmd: 'tshark -i eth0 -Y dns -c 30', why: 'Sadece DNS, 30 paket' },
            { cmd: 'tcpdump -i eth0 -w lab.pcap port 80', why: 'Hafif yakala, sonra Wireshark’ta aç' },
            { cmd: 'Display filter: http.request.method == "POST"', why: 'POST’ları ayıkla' }
        ],
        mistakes: [
            'Capture filter ile display filter’ı karıştırmak.',
            'Switch ortasında SPAN olmadan “herkesi göreceğim” sanmak.',
            'Prod’da full packet capture + kişisel veri — saklama politikası.'
        ],
        blue: 'PCAP retention, Zeek/Suricata imzaları, TLS fingerprint, east-west trafik görünürlüğü.',
        interview: [
            { q: '3-way handshake paketleri?', a: 'SYN → SYN-ACK → ACK. Wireshark’ta tcp.flags.syn==1 && tcp.flags.ack==0 ilk SYN’i bulur.' }
        ]
    },
    {
        id: 'aircrack',
        name: 'aircrack-ng',
        title: 'Aircrack-ng — Wi-Fi laboratuvarı',
        rank: 'Kablosuz Top araç',
        why: 'Kablosuz hâlâ zayıf parola ve WPS ile düşüyor. Aircrack ailesi capture → handshake → crack zincirini öğretir. Yalnızca kendi lab AP’nizde!',
        what: 'airmon-ng (monitor mode), airodump-ng (trafik/handshake yakala), aireplay-ng (deauth vb.), aircrack-ng (WEP/WPA crack) paketidir. Modern pratikte handshake hashcat -m 22000’e de çevrilir.',
        how: [
            'Kart monitor moda alınır; kanal dinlenir.',
            'airodump BSSID/ESSID ve client’ları listeler; handshake için client trafiği beklenir.',
            'İsteğe bağlı deauth ile client yeniden bağlanır → EAPOL handshake yakalanır.',
            'Handshake dosyası wordlist ile aircrack veya hashcat’e verilir.',
            'WPS varsa reaver/bully/pixiewps ayrı yol (çoğu modern AP’de kapalı).'
        ],
        when: [
            'Kendi test AP’nizin parola politikasını kanıtlamak',
            'Kurumsal wireless pentest (yazılı kapsam)',
            'WPA3/PMF olan yerde sınırları öğrenmek'
        ],
        install: 'sudo apt install aircrack-ng hashcat wifite\n# Uyumlu USB Wi-Fi (monitor/injection destekli) gerekir',
        lab: [
            'Sadece kendi router’ınız / lab AP. Komşu Wi-Fi yasak.',
            'sudo airmon-ng check kill && sudo airmon-ng start wlan0',
            'sudo airodump-ng wlan0mon — kendi BSSID’nizi not edin.',
            'sudo airodump-ng -c KANAL --bssid BSSID -w capture wlan0mon',
            'Telefondan Wi-Fi’ye bağlanın/kopun; “WPA handshake” yazısını bekleyin.',
            'aircrack-ng -w rockyou.txt capture-01.cap — veya hcxpcapngtool ile 22000’e çevirip hashcat.'
        ],
        commands: [
            { cmd: 'sudo airmon-ng start wlan0', why: 'Monitor mode' },
            { cmd: 'sudo airodump-ng wlan0mon', why: 'Ağları listele' },
            { cmd: 'sudo airodump-ng -c 6 --bssid XX -w cap wlan0mon', why: 'Handshake yakala' },
            { cmd: 'aircrack-ng -w rockyou.txt cap-01.cap', why: 'Wordlist crack' }
        ],
        mistakes: [
            'Komşu ağa deauth — yasadışı ve zararlı.',
            'Monitor desteklemeyen kartla saatler harcamak.',
            'NetworkManager’ı öldürüp geri açmayı unutmak (airmon-ng check kill sonrası).'
        ],
        blue: 'WPA3, güçlü PSK/802.1X, WPS kapalı, Rogue AP tespiti, deauth anomalisi.',
        interview: [
            { q: 'Handshake neden lazım?', a: 'WPA-PSK’te 4-way handshake, parola türevini (PTK) doğrulamak için kriptografik malzeme sağlar; wordlist ile offline denenebilir. Parolanın kendisi havada düz gitmez.' }
        ]
    },
    {
        id: 'responder',
        name: 'responder',
        title: 'Responder — İç ağda isim zehirleme',
        rank: 'Internal pentest yıldızı',
        why: 'Windows ağlarında LLMNR/NBT-NS/mDNS sık açık kalır. Yanlış isim sorgusunu cevaplayıp NTLMv2 hash yakalamak klasik ve etkili bir vektördür — MFA/SMB signing yoksa altın değerinde.',
        what: 'Responder, sahte name resolution yanıtları göndererek kurbanın kimlik doğrulama denemesini kendi sahte servisine yönlendirir; NetNTLM hash’lerini loglar. Hash’ler Hashcat/John ile offline kırılabilir veya (koşullarda) relay edilir.',
        how: [
            'Kurban var olmayan bir hostname çözer (\\yanlisdosya).',
            'LLMNR/NBT-NS yayını dinleyen Responder “benim!” der.',
            'Kurban SMB/HTTP vs. ile bağlanmaya çalışır; NTLM challenge-response yakalanır.',
            'Hash dosyaya yazılır; wordlist ile kırılır veya ntlmrelayx ile aktarılır (ayrı araç/senaryo).'
        ],
        when: [
            'Internal AD pentest',
            'Segment’te “easy win” credential',
            'Purple team: LLMNR’nin kapatıldığını doğrulama'
        ],
        install: 'sudo apt install responder\n# Çalıştırma root + doğru arayüz ister',
        lab: [
            'İzole lab AD veya Windows VM + Kali aynı switch.',
            'sudo responder -I eth0 -wd  (Analyze/WPAD ayarlarını anlayarak kullanın)',
            'Windows’tan \\olmayanhost\\share dene veya tarayıcıda rastgele hostname.',
            'Kali’de yakalanan hash’i /usr/share/responder/logs altında bulun.',
            'Hashcat -m 5600 (NetNTLMv2) ile lab parolasını kırın.',
            'Savunma deneyi: LLMNR/NetBIOS’u kapatıp tekrar deneyin — hash gelmemeli.'
        ],
        commands: [
            { cmd: 'sudo responder -I eth0 -wd', why: 'Arayüzde dinle (lab)' },
            { cmd: 'sudo responder -I eth0 -A', why: 'Analyze mode — daha az müdahale' },
            { cmd: 'hashcat -m 5600 hash.txt rockyou.txt', why: 'NetNTLMv2 crack' }
        ],
        mistakes: [
            'Prod’da WPAD zehirleme ile trafik kesmek / lockout.',
            'Relay’i anlamadan “hash kırılmadı = işe yaramaz” demek.',
            'Yanlış interface (-I).'
        ],
        blue: 'LLMNR/NBT-NS disable, SMB signing, EPA, disable WPAD, Network access control, honeypot hostnames.',
        interview: [
            { q: 'NTLM relay nedir (kısa)?', a: 'Yakalanan auth’u kırılmadan başka servise iletmek. Signing/EPA/channel binding relay’i zorlaştırır.' }
        ]
    },
    {
        id: 'netexec',
        name: 'netexec',
        title: 'NetExec (nxc) — İç ağda hız',
        rank: 'CrackMapExec’in mirasçısı',
        why: 'AD ortamında “bu parola kaç yerde işe yarıyor?”, “admin share açık mı?”, “spray güvenli mi?” sorularına tek CLI’dan cevap. Modern internal pentest’in İsviçre çakısı.',
        what: 'NetExec (nxc), SMB/WinRM/LDAP/MSSQL… protokolleri üzerinden authentication, enumeration, komut çalıştırma ve spray yapan Python aracıdır. Eski CrackMapExec (CME) yerine geçer.',
        how: [
            'Protokol seçilir: nxc smb / winrm / ldap …',
            'Hedef CIDR veya dosya; -u -p veya -H (hash) ile kimlik verilir.',
            'Modüller paylaşım listeler, logged-on user, sam dump (yetki varsa) dener.',
            '--continue-on-success spray’de kilidi yönetmeye yardımcı olur.',
            'Başarı yeşil/çıktı ile görünür; sonra lateral hareket planlanır.'
        ],
        when: [
            'Credential doğrulama / password spray (anlaşma + rate!)',
            'SMB signing / null session keşfi',
            'Post-ex sonrası filoda aynı local admin pass var mı?'
        ],
        install: 'sudo apt install netexec\n# veya pipx ile güncel sürüm\nnxc --help',
        lab: [
            'Lab AD kurun veya GOAD / benzeri lab kullanın.',
            'nxc smb 10.0.0.0/24 — null/anon ne dönüyor bakın.',
            'Geçerli bir lab kullanıcısıyla: nxc smb IP -u user -p pass',
            'nxc smb IP -u user -p pass --shares',
            'Spray’i önce 2-3 parola ile sınırlayın; lockout politikasını öğrenin.'
        ],
        commands: [
            { cmd: 'nxc smb 10.10.10.0/24', why: 'Segment keşif' },
            { cmd: 'nxc smb IP -u u -p p --shares', why: 'Paylaşımlar' },
            { cmd: 'nxc smb IP -u u -H NTLMHASH', why: 'Pass-the-hash' },
            { cmd: 'nxc winrm IP -u u -p p -x whoami', why: 'WinRM komut (yetki!)' }
        ],
        mistakes: [
            'Domain-wide spray ile lockout fırtınası.',
            'Admin session dump’ını kapsam dışında çalıştırmak.',
            'CME komutlarını ezberleyip nxc syntax’ını güncellememek.'
        ],
        blue: 'LAPS, unique local admin, SMB signing, WinRM kısıtı, spray tespiti (aynı parola çok hesap), tiering.',
        interview: [
            { q: 'Password spray ile brute farkı?', a: 'Brute: bir hesap çok parola (lockout). Spray: çok hesap az/common parola (politikayı delmeye çalışır). Spray daha “doğal” görünür ama yine tespit edilir.' }
        ]
    },
    {
        id: 'nikto-wpscan',
        name: 'nikto / wpscan',
        title: 'Nikto & WPScan — Hızlı web yüzeyi',
        rank: 'Keşif hızlandırıcıları',
        why: 'İlk dakikalarda “acemi misconfig”leri yakarlar. Derin mantık hatası bulmazlar; ama eski Apache, backup dosyası, bilinen WP eklenti CVE’si için altın değerinde.',
        what: 'Nikto imza tabanlı web sunucu tarayıcısıdır. WPScan WordPress çekirdek/eklenti/tema/kullanıcı enumeration ve bilinen zafiyetlerle eşleştirme yapar.',
        how: [
            'Nikto hedefe bilinen tehlikeli path/header imzaları sorar; sonuçları listeler.',
            'WPScan REST/API ve bilinen konumlarla sürüm ve kullanıcı tahmin eder; opsiyonel API token ile CVE DB kullanır.',
            'İkisi de gürültülüdür; WAF tetikler. Bulguyu elle doğrulayın.'
        ],
        when: [
            'Web pentest kickoff',
            'WordPress kapsamı net ise',
            'Attack surface hygiene kontrolü'
        ],
        install: 'sudo apt install nikto wpscan\n# WPScan API (opsiyonel): wpscan.org token',
        lab: [
            'Lokal WordPress veya DVWA ayağa kaldırın.',
            'nikto -h http://LAB — çıktıdaki “interesting” satırları okuyun; hepsi exploit değildir.',
            'wpscan --url http://LAB --enumerate u,p — kullanıcı/eklenti enum.',
            'Bir bulguyu tarayıcıda elle açarak doğrulayın.',
            'False positive’leri not edin — rapor disiplinı.'
        ],
        commands: [
            { cmd: 'nikto -h http://10.0.0.5', why: 'Temel tarama' },
            { cmd: 'nikto -h https://LAB -ssl', why: 'HTTPS' },
            { cmd: 'wpscan --url http://LAB --enumerate u', why: 'Kullanıcı enum' },
            { cmd: 'wpscan --url http://LAB --api-token TOKEN', why: 'CVE DB ile zenginleştir' }
        ],
        mistakes: [
            'Nikto çıktısının tamamını “kritik zafiyet” diye raporlamak.',
            'WPScan enum ile kullanıcı login brute’u karıştırmak (ayrı adım, ayrı izin).'
        ],
        blue: 'Gereksiz eklenti sil, otomatik güncelle, xmlrpc kısıt, WAF, güvenlik header’ları, staging’i internete açma.',
        interview: [
            { q: 'Nikto neden yeterli değil?', a: 'İmza/misconfig odaklıdır; business logic, authZ, zincirleme saldırıları görmez. Burp manuel test şart.' }
        ]
    },
    {
        id: 'bettercap',
        name: 'bettercap',
        title: 'Bettercap — Modern MITM framework',
        rank: 'Sniff/Spoof yeni nesil',
        why: 'Ettercap’in modern, script’lenebilir hali. ARP spoof + HTTP/HTTPS proxy + net sniff tek çatıda. Lab’de MITM’i anlamak için birebir.',
        what: 'Bettercap; recon, spoofing, proxy, sniffer modülleri olan ağ saldırı framework’üdür. Caplet’lerle otomasyon yapılır.',
        how: [
            'Arayüz seçilir; ağdaki host’lar keşfedilir.',
            'ARP spoof ile kurban↔gateway arasına girilir (MITM).',
            'Sniffer/proxy trafik içeriğini (HTTP net; HTTPS zor) görmeye çalışır.',
            'DNS spoof ile sahte çözünürlük verilebilir.',
            'İş bitince spoof temizlenmezse ağ bozulur — restore önemli.'
        ],
        when: [
            'Lab’de MITM/protokol dinleme eğitimi',
            'Kablosuz/internal senaryolarda trafik analizi',
            'Purple team: ARP spoof tespiti'
        ],
        install: 'sudo apt install bettercap\nsudo bettercap -iface eth0',
        lab: [
            'İki VM + Kali izole lab (promisc/ARP için uygun sanallaştırma ayarı).',
            'sudo bettercap -iface eth0 → help → net.probe on → net.show',
            'set arp.spoof.targets KURBAN; arp.spoof on',
            'net.sniff on — HTTP lab sitesi trafiğini gözlemleyin.',
            'Bitince arp.spoof off ve ağın düzeldiğini doğrulayın.'
        ],
        commands: [
            { cmd: 'sudo bettercap -iface eth0', why: 'Başlat' },
            { cmd: 'net.probe on; net.show', why: 'Host keşfi' },
            { cmd: 'arp.spoof on', why: 'MITM (lab!)' },
            { cmd: 'net.sniff on', why: 'Paketleri göster' }
        ],
        mistakes: [
            'Kurumsal ağda “bir bakayım” spoof → outage.',
            'HTTPS’te düz metin göremeyince aracı suçlamak — TLS çalışıyordur.',
            'Spoof’u kapatmadan lab’den ayrılmak.'
        ],
        blue: 'Dynamic ARP inspection, port security, 802.1X, HTTPS HSTS, certificate pinning kritik uygulamalarda.',
        interview: [
            { q: 'ARP spoof nasıl çalışır?', a: 'Saldırgan sahte ARP yanıtlarıyla kurbanın gateway MAC’ini kendi MAC’i gibi yazar; trafik üzerinden akar (MITM).' }
        ]
    },
    {
        id: 'nuclei',
        name: 'nuclei',
        title: 'Nuclei — Template tabanlı zafiyet taraması',
        rank: 'ProjectDiscovery · Hızlı CVE/misconfig avcısı',
        why: 'Bilinen CVE, misconfig ve exposure’ları YAML template’lerle paralel tarar. Bug bounty ve pentest’te “yüzeyi hızlı elemek” için standart araç — ama gürültü ve false positive disiplini şart.',
        what: 'Nuclei, ProjectDiscovery’nin template-driven scanner’ıdır. Hedefe HTTP/TCP/DNS vs. istekleri gönderir; eşleşen template’ler bulgu üretir. Community ve özel template’ler kullanılabilir. Sadece yazılı kapsam ve izinli hedeflerde çalıştırın.',
        how: [
            'Hedef listesi (URL/host) ve template seti seçilir (-t veya -tags).',
            'Nuclei paralel worker’larla istek atar; matcher/extractor sonuçları ayıklar.',
            'Severity/tag ile filtreleyerek kritik bulgulara odaklanılır.',
            'Bulgu her zaman elle doğrulanır; template “hit” ≠ exploit kanıtı.',
            'Rate-limit ve scope dışı host’lara taşma engellenir.'
        ],
        when: [
            'Web/API attack surface hygiene',
            'Bilinen CVE’lerin kapsamlı hızlı taraması',
            'CI veya periyodik iç tarama (izinli)',
            'Bug bounty recon sonrası eleme'
        ],
        install: 'sudo apt install nuclei\n# veya go install / pd release\nnuclei -update-templates',
        lab: [
            'Sadece kendi lab’iniz veya açıkça izinli DVWA/Juice Shop benzeri hedef.',
            'nuclei -u http://LAB -tags misconfig,exposure — çıktıyı okuyun.',
            'Tek template ile: nuclei -u http://LAB -t path/to/template.yaml',
            'Bir “critical” bulguyu tarayıcıda/elle doğrulayın; false positive not edin.',
            'nuclei -l urls.txt -rate-limit 50 — gürültüyü bilinçli sınırlayın.',
            'Prod’a rastgele internet CIDR’ı atmayın — yasadışı ve etik dışıdır.'
        ],
        commands: [
            { cmd: 'nuclei -u https://LAB', why: 'Temel tek hedef tarama' },
            { cmd: 'nuclei -l urls.txt -tags cve,misconfig', why: 'Liste + etiket filtresi' },
            { cmd: 'nuclei -u https://LAB -severity critical,high', why: 'Öncelikli severity' },
            { cmd: 'nuclei -update-templates', why: 'Template DB güncelle' }
        ],
        mistakes: [
            'İzinsiz internet taraması — yasal/etik ihlal.',
            'Tüm hit’leri doğrulamadan “kritik zafiyet” diye raporlamak.',
            'Rate-limit’siz agresif tarama ile WAF/DoS etkisi.',
            'Eski template’lerle güncel CVE’yi kaçırdığını sanmak.'
        ],
        blue: 'Patch management, attack surface reduction, WAF/rate-limit, staging’i internete açmama, continuous nuclei benzeri savunma taraması (kendi varlıklarınız).',
        interview: [
            { q: 'Nuclei ile Nessus/OpenVAS farkı (kısa)?', a: 'Nuclei hafif, template/community odaklı ve CLI-first’tir; klasik scanner’lar daha geniş compliance/plugin ekosistemi sunar. Nuclei hız ve özelleştirmede öne çıkar; ikisi de “bulgu = exploit” demez.' }
        ]
    },
    {
        id: 'bloodhound',
        name: 'bloodhound / bloodhound-python / neo4j',
        title: 'BloodHound — AD saldırı yolu haritası',
        rank: 'Active Directory pathfinding kralı',
        why: 'AD’de “Domain Admin’e kaç hop?” sorusunu grafik teorisiyle cevaplar. ACL, grup üyeliği, session, trust ilişkilerini görselleştirir — red team ve AD hardening için vazgeçilmez. Sadece kendi lab / yazılı kapsam.',
        what: 'BloodHound, Neo4j graf DB üzerinde AD ilişkilerini modeller. bloodhound-python (veya SharpHound) collector LDAP/session verisi toplar; UI’da Shortest Path to Domain Admins gibi sorgular çalıştırılır. Yetkisiz domain’de collector çalıştırmak yasaktır.',
        how: [
            'Neo4j ayağa kalkar; BloodHound UI bağlanır.',
            'Collector (bloodhound-python / SharpHound) izinli domain’de enum yapar.',
            'JSON/zip ingest edilir; düğüm ve kenarlar graf’a yazılır.',
            'Cypher / hazır sorgularla saldırı yolları (ACL abuse, kerberoastable, path) bulunur.',
            'Bulgular raporlanır; blue team aynı graf ile hardening önceliği belirler.'
        ],
        when: [
            'Internal AD pentest / red team',
            'Domain hardening assessment',
            'Purple team: “en kısa yol” senaryoları',
            'GOAD / lab AD eğitimi'
        ],
        install: 'sudo apt install bloodhound neo4j\n# Collector: pipx install bloodhound\n# Neo4j’i başlatıp BloodHound’da bolt://localhost:7687 bağlayın',
        lab: [
            'İzole lab AD (GOAD vb.) — asla müşteri/prod domain’ine izinsiz collector.',
            'sudo neo4j start → BloodHound UI → varsayılan neo4j parolasını değiştirin.',
            'bloodhound-python -d LAB.LOCAL -u user -p pass -ns DC_IP -c All',
            'Üretilen zip/json’ı BloodHound’a Import edin.',
            '“Shortest Paths to Domain Admins” çalıştırın; yolu adım adım açıklayın.',
            'Bir ACL/edge’i (GenericAll, ForceChangePassword…) teorik olarak not edin — exploit’i kapsam dışıysa çalıştırmayın.'
        ],
        commands: [
            { cmd: 'sudo neo4j console', why: 'Graf DB (lab)' },
            { cmd: 'bloodhound-python -d LAB.LOCAL -u u -p p -ns DC_IP -c All', why: 'Collector' },
            { cmd: 'bloodhound', why: 'UI başlat (pakete göre)' }
        ],
        mistakes: [
            'Prod AD’de izinsiz SharpHound/bloodhound-python — yasal risk + gürültü.',
            'Graf’ı okumadan “Domain Admin lazım” deyip rastgele exploit denemek.',
            'Neo4j’i internete açık bırakmak (lab bile olsa risk).',
            'Eski CE vs. Community sürüm farkını karıştırmak.'
        ],
        blue: 'Tiering, privileged group hijyeni, ACL audit, local admin kısıtı, session hardening, BloodHound’u blue için de kullanarak yolu kırmak.',
        interview: [
            { q: 'BloodHound neden “path” gösterir?', a: 'AD nesneleri düğüm, haklar/üyelikler kenardır. Domain Admin’e giden kenar zinciri saldırı yoludur; en kısa yol pratik önceliği verir.' }
        ]
    },
    {
        id: 'impacket',
        name: 'impacket',
        title: 'Impacket — Windows protokol toolkit’i',
        rank: 'AD post-ex / protokol klasiği',
        why: 'SMB, RPC, LDAP üzerinden psexec, secretsdump, GetUserSPNs gibi işlemleri saf Python ile yapar. Credential elde ettikten sonra lateral movement ve kerberoasting lab’inin omurgası — kötüye kullanım için değil, yetkili test ve savunma anlayışı için.',
        what: 'Impacket, Windows ağ protokollerinin Python implementasyonudur. examples/ altında psexec.py (semi-interactive shell), secretsdump.py (SAM/LSA/NTDS dump — yetki gerekir), GetUserSPNs.py (Kerberoasting) gibi script’ler vardır. Yalnızca yazılı izin ve lab hedeflerinde kullanın.',
        how: [
            'Geçerli credential veya hash ile hedefe protokol oturumu açılır.',
            'psexec/smbexec/wmiexec ile (yetki varsa) uzaktan komut/shell denenir.',
            'secretsdump DCSync veya local SAM/LSA sırlarını çeker (yüksek yetki + tespit riski).',
            'GetUserSPNs SPN’li hesapların TGS’ini ister; hash offline kırılır (Kerberoasting).',
            'Her adım log üretir; blue team bunları avlar — OPSEC ve kapsam kritik.'
        ],
        when: [
            'AD lab / GOAD post-exploitation',
            'Kerberoasting eğitimi',
            'Pass-the-hash / admin share senaryoları (izinli)',
            'Purple team: DCSync ve psexec telemetrisi'
        ],
        install: 'sudo apt install python3-impacket\n# veya pipx install impacket\nimpacket-psexec -h',
        lab: [
            'Kendi lab AD + bir domain user/admin hesabı — izinsiz gerçek domain yasak.',
            'impacket-GetUserSPNs lab.local/user:pass -dc-ip DC_IP -request',
            'Çıkan hash’i Hashcat -m 13100 ile lab parolasında deneyin.',
            'Admin hash/parola ile: impacket-psexec lab.local/Admin@TARGET (lab VM).',
            'impacket-secretsdump lab.local/Admin@DC - sadece lab; NTDS dump prod’da felaket ve iz bırakır.',
            'Wireshark/EDR’da psexec ve DCSync imzalarını blue gözüyle inceleyin.'
        ],
        commands: [
            { cmd: 'impacket-GetUserSPNs lab.local/u:p -dc-ip DC -request', why: 'Kerberoasting' },
            { cmd: 'impacket-psexec lab.local/Admin@10.0.0.5', why: 'Uzaktan shell (yetki!)' },
            { cmd: 'impacket-secretsdump lab.local/Admin@DC', why: 'SAM/LSA/NTDS (lab only)' },
            { cmd: 'impacket-wmiexec lab.local/Admin@TARGET', why: 'WMI ile komut' }
        ],
        mistakes: [
            'Prod DC’de secretsdump / DCSync — yasal ve operasyonel felaket.',
            'psexec’i “zararsız enum” sanmak; servis oluşturur, çok gürültülüdür.',
            'Cleartext parolayı komut satırında history’ye gömmek.',
            'Kerberoast hash’ini internete sızdırmak.'
        ],
        blue: 'Protected Users, strong SPN passwords / gMSA, SMB signing, Privileged Access Workstations, DCSync/replication anomaly detection, psexec service creation alert.',
        interview: [
            { q: 'Kerberoasting nedir (kısa)?', a: 'SPN’li servis hesabı için TGS istenir; ticket’ın bir kısmı servis hesabı anahtarıyla şifrelidir ve offline kırılabilir. Uzun/random servis parolası veya gMSA ile zorlaşır.' }
        ]
    },
    {
        id: 'linpeas-winpeas',
        name: 'linpeas / winpeas',
        title: 'LinPEAS & WinPEAS — Privilege escalation enum',
        rank: 'Privesc checklist otomasyonu',
        why: 'Shell aldınız; root/SYSTEM’e giden yanlış permission, cron, token, service path var mı? PEAS suite yüzlerce kontrolü dakikalar içinde listeler. Exploit yazmaz — okumayı ve doğrulamayı siz yaparsınız. Sadece kendi lab / izinli pentest host’ları.',
        what: 'LinPEAS (Linux) ve WinPEAS (Windows), privilege escalation için sistem bilgisi, SUID, sudo, cron, credentials, services, token vs. tarayan enum script’leridir. Çıktı renk/severity ile önceliklendirilir. İzinsiz sistemde çalıştırmak ve veri sızdırmak yasaktır.',
        how: [
            'Hedef OS’e uygun PEAS binary/script aktarılır (scp, http.server lab’de).',
            'Çalıştırılır; stdout veya dosyaya log alınır.',
            'Kırmızı/yüksek bulgular (SUID, writable service, stored creds) elle doğrulanır.',
            'Uygun, kapsam içi privesc tekniği seçilir; gereksiz exploit denemeleri yapılmaz.',
            'Bulgular raporlanır; blue team aynı checklist ile hardening yapar.'
        ],
        when: [
            'CTF / HTB / lab privesc',
            'Pentest’te low-priv shell sonrası',
            'Purple team: “easy win” misconfig avı',
            'Image/hardening baseline kontrolü'
        ],
        install: 'git clone https://github.com/peass-ng/PEASS-ng\n# veya release’den linpeas.sh / winPEASx64.exe indirin\n# Kali’de sıkça /usr/share/peass altında',
        lab: [
            'Kendi Linux/Windows lab VM’iniz — başkasının sunucusuna izinsiz yüklemeyin.',
            'Linux: curl/linpeas.sh | sh veya chmod +x linpeas.sh && ./linpeas.sh',
            'Çıktıda SUID/sudo/cron satırlarını not edin; birini elle doğrulayın (find, sudo -l).',
            'Windows lab: winPEASx64.exe çalıştırın; AlwaysInstallElevated / service path / token’lara bakın.',
            'Bir bulguyu düzeltip (chmod, servis ACL) PEAS’i tekrar çalıştırın — yeşile döndüğünü görün.',
            'Çıktıyı güvenli saklayın; içinde parola/anahtar olabilir.'
        ],
        commands: [
            { cmd: './linpeas.sh', why: 'Linux privesc enum' },
            { cmd: './linpeas.sh -a', why: 'Daha kapsamlı (yavaş)' },
            { cmd: 'winPEASx64.exe', why: 'Windows privesc enum' },
            { cmd: 'sudo -l; find / -perm -4000 2>/dev/null', why: 'PEAS bulgusunu elle doğrula' }
        ],
        mistakes: [
            'PEAS çıktısının tamamını “exploit edildi” sanmak — çoğu bilgilendirme.',
            'Prod’da izinsiz çalıştırıp credential log’unu dışarı atmak.',
            'AV/EDR’nin winpeas’i yakalamasını “lab bozuk” sanmak — beklenen davranış.',
            'İlk kırmızı satıra körlemesine exploit; stabilite ve kapsamı unutmak.'
        ],
        blue: 'Least privilege, sudo/SUID audit, service ACL/path hardening, credential scrubbing, AppLocker/WDAC, düzenli PEAS benzeri self-assessment.',
        interview: [
            { q: 'LinPEAS exploit tool mudur?', a: 'Hayır; enumeration/checklist otomasyonudur. Zafiyeti işaret eder, sömürüyü otomatik yapmaz. Analist doğrular ve (izinliyse) privesc adımını seçer.' }
        ]
    }
];
