/* Linux Omnibus — müfredat içeriği (sıfırdan uzmanlığa) */
window.BIBLE = [

/* ========== 00 GİRİŞ ========== */
{
    id: 'ch0', num: '00', title: 'Linux Nedir?',
    subtitle: 'Hiçbir şey bilmeden başla',
    who: 'Bilgisayarı kullanan ama Linux kelimesini ilk kez duyan herkes.',
    intro: 'Bu kitap bir komut listesi değildir. Sizi, ekranda siyah bir pencere gördüğünüzde paniklemeyen; “bu sistem neden böyle davrandı?” diye sorabilen birine dönüştürmek için yazıldı. Bu bölümde henüz komut ezberlemezsiniz — önce dünyayı anlarsınız.',
    levels: {
        baslangic: [
            {
                id: 'ch0-b1',
                title: 'Bilgisayar aslında ne yapar?',
                hook: 'Linux öğrenmeden önce: “işletim sistemi” ne demek?',
                tags: 'işletim sistemi kernel giriş',
                search: 'linux nedir işletim sistemi kernel',
                body: [
                    'Bilgisayarınızda donanım vardır: işlemci (CPU), bellek (RAM), disk, ağ kartı. Bunlar demir ve silikondur; Türkçe bilmezler. Donanıma “şu dosyayı oku”, “şu programı çalıştır” diyebilen yazılıma <strong>işletim sistemi</strong> denir.',
                    'İşletim sisteminin kalbine <strong>çekirdek (kernel)</strong> denir. Kernel, programların diske, ağa, belleğe güvenli ve adil şekilde erişmesini sağlar. Sizin gördüğünüz masaüstü, pencere, fare imleci ise kernel’in üstünde oturan katmanlardır.',
                    'Windows bir işletim sistemidir. macOS bir işletim sistemidir. <strong>Linux</strong> da bir işletim sistemi ailesidir — daha doğrusu: Linux, çekirdeğin adıdır; üzerine konan araçlarla (GNU, systemd, paket yöneticisi, masaüstü…) tam bir sistem oluşur. Bu yüzden “GNU/Linux” ifadesini duyarsınız.'
                ],
                callouts: [
                    { title: 'Basit benzetme', text: 'Donanım = araba motoru ve tekerlekler. Kernel = motor yönetim beyni. Sizin kullandığınız terminal veya masaüstü = direksiyon ve göstergeler.' }
                ],
                mistakes: [
                    '“Linux bir programdır” demek — hayır, çekirdek + ekosistemdir.',
                    '“Linux sadece hacker’lar içindir” — bankalar, bulut, telefonunuzun (Android) temeli Linux’tur.'
                ],
                exercise: 'Kendi bilgisayarınızda şunu sorun: Hangi işletim sistemini kullanıyorum? Windows / macOS / Linux? Cevabı yazın. Sonraki derste Linux’a nasıl gireceğinizi konuşacağız.',
                interview: [
                    { q: 'Kernel ile işletim sistemi farkı nedir?', a: 'Kernel, donanım ile yazılımlar arasındaki temel yöneticidir. “İşletim sistemi” genelde kernel + sistem kütüphaneleri + araçlar + kullanıcı arayüzü bütününü kasteder. Linux kelimesi dar anlamda sadece kernel’i ifade eder.' }
                ]
            },
            {
                id: 'ch0-b2',
                title: 'Neden Linux? Kimler kullanır?',
                hook: 'Bu kitap sizi “niye uğraşıyorum?” sorusuna net cevaplı bırakmalı.',
                tags: 'neden linux sunucu devops soc',
                search: 'neden linux sunucu bulut',
                body: [
                    'Dünyadaki web sitelerinin, bulut sunucularının ve konteynerların ezici çoğunluğu Linux üzerinde çalışır. Bir DevOps mühendisi, bir SOC analisti, bir sistem yöneticisi — gününün büyük kısmını Linux’ta geçirir.',
                    'Linux’un gücü üç şeyden gelir: <strong>açık kaynak</strong> (kodu okuyabilir, denetleyebilirsiniz), <strong>uzak yönetim</strong> (SSH ile dünyanın öbür ucundaki sunucuyu yönetirsiniz), <strong>otomasyon</strong> (her şey metin dosyası ve komutla kontrol edilebilir).',
                    'Bu kitap BTK Akademi Kali hattındaki pratik konuları da kapsar; ama hedefiniz yalnızca Kali menüsünü ezberlemek değil: herhangi bir Linux sunucuda kriz çözebilecek temeli kurmaktır.'
                ],
                callouts: [
                    { type: 'warn', title: 'Dağıtım (distro) nedir?', text: 'Ubuntu, Debian, Kali, RHEL, Rocky, Arch… Hepsi Linux çekirdeğini kullanır ama paketleri, varsayılan araçları ve felsefeleri farklıdır. Araba markaları gibi düşünün: hepsi araba, gösterge paneli farklı.' }
                ],
                exercise: 'Ubuntu, Kali ve “sunucu Linux” kelimelerini not edin. İleride Kali’yi güvenlik laboratuvarı; Ubuntu/Debian’ı öğrenme ve sunucu için kullanacağız.',
                kernel: 'Farklı distrolar aynı Linux kernel’ini (veya yakın sürümünü) kullanabilir; fark userspace’tedir: init sistemi, paket yöneticisi (apt/dnf), varsayılan servisler.',
                crisis: '“Prod’da RHEL var, ben sadece Ubuntu biliyorum” paniklerini azaltır — komutlar %80 ortaktır; farkları bilinçli öğrenirsiniz.'
            },
            {
                id: 'ch0-b3',
                title: 'Nasıl pratik yapacaksınız? (laboratuvar)',
                hook: 'Okumak yetmez. Kırabileceğiniz bir Linux şart.',
                tags: 'vm virtualbox wsl kali kurulum',
                search: 'virtualbox wsl kali kurulum laboratuvar',
                body: [
                    'Üç güvenli yol vardır: (1) <strong>Sanal makine</strong> — VirtualBox/VMware içine Ubuntu veya Kali kurun. Ana bilgisayarınız bozulmaz. (2) <strong>WSL2</strong> — Windows içinde Linux ortamı (başlangıç için çok rahat). (3) <strong>Bulut</strong> — ücretsiz/ucuz bir VPS.',
                    'Bu kitapta komutları <strong>kendi laboratuvarınızda</strong> yazmanızı bekliyoruz. Kopyala-yapıştır yetmez; parmak hafızası ve hata mesajı okuma kası şarttır.',
                    'Kali Linux, güvenlik araçları dolu bir dağıtımdır. İlk gün “ben hacker oldum” hissi vermemelidir — önce dosya, yetki, süreç ve log’u öğrenmeden araçlar tehlikelidir (hem etik hem teknik olarak).'
                ],
                callouts: [
                    { type: 'danger', title: 'Etik sınır', text: 'Başkasının sistemine izinsiz tarama veya saldırı yasaktır. Tüm güvenlik pratikleri yalnızca size ait veya yazılı izinli ortamlarda yapılır.' }
                ],
                steps: [
                    'Bir sanal makine veya WSL kurun.',
                    'İlk açılışta kullanıcı adı ve şifrenizi not edin (root ile normal kullanıcı farkını sonra öğreneceksiniz).',
                    'Terminal uygulamasını bulun ve açın — siyah/yeşil ekran sizi korkutmasın; bu sizin direksiyonunuz.'
                ],
                exercise: 'Terminali açıp sadece şunu yazın ve Enter’a basın: <code>whoami</code> — ekranda kullanıcı adınız çıkmalı. Çıktıysa laboratuvarınız hazır.'
            }
        ],
        orta: [
            {
                id: 'ch0-o1',
                title: 'Kullanıcı, root ve “süper güç”',
                tags: 'root sudo kullanıcı',
                search: 'root sudo uid',
                body: [
                    'Linux çok kullanıcılıdır. Herkesin bir <strong>kullanıcı adı</strong> ve sayısal kimliği (UID) vardır. <strong>root</strong> (UID 0) sistemin sahibi gibidir: her dosyayı okuyabilir, silebilir, servis durdurabilir.',
                    'Günlük işlerinizi root ile yapmak evde dinamitle böcek öldürmeye benzer. Bunun yerine normal kullanıcıyla çalışır, gerektiğinde <code>sudo</code> ile geçici yetki alırsınız.',
                    'İleride “yetki yükseltme (privilege escalation)” saldırılarını anlayabilmeniz için bu ayrımı iliklerinize işlemeniz gerekir.'
                ],
                commands: [
                    { cmd: 'whoami', note: 'Şu an hangi kullanıcıyım?' },
                    { cmd: 'id', note: 'UID, GID ve grup üyeliği' }
                ],
                kernel: 'Her süreç bir UID/GID ile çalışır. Kernel, dosya erişiminde bu kimlikleri inode izinleriyle karşılaştırır.',
                crisis: 'Yanlışlıkla root ile <code>rm -rf /</code> — felaket. Least privilege alışkanlığı kriz önler.',
                interview: [
                    { q: 'Neden günlük işlerde root kullanılmaz?', a: 'Hata ve malware etkisi maksimize olur. Ayrıca denetim (audit) ve sorumluluk için işlemler ayrı hesaplardan yapılmalıdır. sudo ile komut bazlı yetki verilir.' }
                ]
            }
        ],
        ileri: [
            {
                id: 'ch0-i1',
                title: 'User space vs Kernel space',
                tags: 'ring0 syscall',
                search: 'user space kernel space syscall',
                body: [
                    'Programlarınız <strong>user space</strong>’te koşar: sınırlı yetki, kendi bellek alanı. Donanıma dokunmak gerektiğinde <strong>system call (syscall)</strong> ile kernel’e rica ederler: dosya aç (<code>open</code>), oku (<code>read</code>), ağ gönder (<code>sendto</code>)…',
                    'Bu ayrım güvenlik ve kararlılığın temelidir. Bir web sunucusu çökerse genelde sadece o süreç ölür; kernel ayaktaysa makine yaşar. Kernel panic ise “beyin durdu” demektir.'
                ],
                commands: [
                    { cmd: 'strace -e openat ls /tmp', note: 'ls komutunun yaptığı open çağrılarını gör (ileri teşhis)' }
                ],
                kernel: 'CPU privilege ring: Ring 0 kernel, Ring 3 kullanıcı. Syscall geçişi context switch maliyetlidir — performans mühendisliği burada başlar.',
                crisis: '“Disk var ama uygulama göremiyor” — yetki mi, mount mu, namespace mi? Katmanı ayırmak root cause’u kısaltır.',
                interview: [
                    { q: 'Bir uygulamanın crash’i neden tüm sistemi düşürmez?', a: 'Process isolation ve virtual memory sayesinde user space hataları genelde o süreçle sınırlı kalır. Kernel bug’ı veya panic tüm sistemi etkiler.' }
                ]
            }
        ]
    },
    chapterInterview: [
        { q: 'Linux’u bir cümlede açıkla.', a: 'Linux, açık kaynak bir çekirdektir; üzerine konan GNU araçları ve dağıtım bileşenleriyle sunucudan telefona kadar her yerde çalışan bir işletim sistemi ailesi oluşturur.' }
    ]
},

/* ========== 01 TERMİNAL ========== */
{
    id: 'ch1', num: '01', title: 'Terminal ve Kabuk (Shell)',
    subtitle: 'Siyah ekrandan korkmamak',
    who: 'Daha önce hiç komut yazmamış olanlar.',
    intro: 'Terminal, Linux ile konuştuğunuz klavyeli penceredir. Grafik arayüz yokken (sunucularda çoğu zaman yoktur) tek yolunuz budur. Bu bölümde kabuğun ne olduğunu, komutun nasıl okunduğunu ve hata mesajının dostunuz olduğunu öğreneceksiniz.',
    levels: {
        baslangic: [
            {
                id: 'ch1-b1',
                title: 'Terminal, konsol, shell — aynı şey mi?',
                hook: 'Kelimeleri karıştırmadan başlayalım.',
                tags: 'terminal shell bash',
                search: 'terminal shell bash prompt',
                body: [
                    '<strong>Terminal</strong> (veya emülatör): metin girip çıktı gördüğünüz uygulama penceresidir.',
                    '<strong>Shell (kabuk)</strong>: yazdığınız satırı yorumlayan programdır. En yaygını <strong>Bash</strong> (Bourne Again Shell). Zsh, Fish de shell’dir.',
                    'Ekranda genelde şöyle bir şey görürsünüz: <code>kullanici@makine:~$</code> — buna <strong>prompt</strong> denir. Sizden komut beklediğini söyler. <code>$</code> çoğu zaman normal kullanıcı, <code>#</code> ise root demektir.'
                ],
                steps: [
                    'Terminali açın.',
                    'Prompt’u inceleyin: kullanıcı adınız ve makine adı oradadır.',
                    'Şunu yazıp Enter’a basın: <code>echo Merhaba</code> — shell, <code>echo</code> programını çalıştırır; ekrana yazar.'
                ],
                commands: [
                    { cmd: 'echo Merhaba Linux', note: 'Ekrana metin basar' },
                    { cmd: 'bash --version', note: 'Hangi bash sürümü?' },
                    { cmd: 'echo $SHELL', note: 'Varsayılan shell yolunuz' }
                ],
                mistakes: [
                    'Komutu yazıp Enter’a basmamak.',
                    'Türkçe karakter veya yanlış tırnak ile komutu bozmak.',
                    'Prompt’taki yazıyı komut sanmak — prompt’u tekrar yazmayın.'
                ],
                exercise: '<code>echo</code> ile kendi adınızı yazdırın. Sonra <code>date</code> yazın — tarih/saat gelmeli.',
                kernel: 'Shell, Enter’a basınca komutu parse eder, gerekirse yeni süreç <code>fork</code>+<code>exec</code> ile başlatır.',
                crisis: 'SSH ile sunucuya bağlandığınızda masaüstü yoktur; sadece shell vardır. Bu bölüm o anın panik atağını önler.'
            },
            {
                id: 'ch1-b2',
                title: 'Komut + argüman + seçenek (flag)',
                hook: 'Her satırın grameri vardır.',
                tags: 'argüman flag man',
                search: 'komut argüman seçenek flag man',
                body: [
                    'Tipik bir satır: <code>komut -seçenekler argümanlar</code>. Örnek: <code>ls -l /home</code>',
                    '<code>ls</code> = program (listele). <code>-l</code> = uzun format seçeneği. <code>/home</code> = hangi dizini listeleyeceği (argüman).',
                    'Kısa seçenekler genelde <code>-l</code>, uzunları <code>--all</code> şeklindedir. Birleştirebilirsiniz: <code>ls -la</code>.',
                    'Takıldığınızda en iyi dostunuz: <code>man komut</code> (manual). Çıkmak için <code>q</code>.'
                ],
                commands: [
                    { cmd: 'ls', note: 'Bulunduğunuz dizindeki isimler' },
                    { cmd: 'ls -l', note: 'Detaylı liste' },
                    { cmd: 'man ls', note: 'Kılavuz — q ile çık' }
                ],
                callouts: [
                    { title: 'İpucu', text: 'man sayfalarında <code>/kelime</code> ile arama yapabilir, <code>n</code> ile sonraki eşleşmeye gidebilirsiniz.' }
                ],
                exercise: '<code>man date</code> içinde “format” veya “%” geçen bir yeri bulun. Sonra <code>date +%F</code> deneyin.',
                kernel: 'Shell argv listesini oluşturur; program <code>main(argc, argv)</code> ile alır. Kernel sadece süreci başlatır — bayrakları program kendisi yorumlar.',
                crisis: 'Dokümantasyonsuz araçta panik yerine <code>man</code> / <code>--help</code> refleksi — gece 03:00 ticket’larında hayat kurtarır.'
            },
            {
                id: 'ch1-b3',
                title: 'Neredeyim? pwd, cd, ls',
                hook: 'Linux’ta kaybolmamak.',
                tags: 'pwd cd ls dizin',
                search: 'pwd cd ls dizin gezinme',
                body: [
                    'Linux’ta her şey bir <strong>dizin ağacı</strong> içindedir. En üst <code>/</code> (kök) dir. Sizin kişisel alanınız genelde <code>/home/kullaniciadi</code> altındadır. Prompt’taki <code>~</code> işareti “home dizinim” kısayoludur.',
                    '<code>pwd</code> = print working directory = “şu an neredeyim?”. <code>cd</code> = change directory = “git”. <code>ls</code> = list = “burada ne var?”.',
                    'Windows’taki klasör = Linux’ta dizin (directory). Aynı fikir, farklı kelime.'
                ],
                steps: [
                    '<code>pwd</code> ile konumunuza bakın.',
                    '<code>ls</code> ile içeriği görün.',
                    '<code>cd /</code> ile köke gidin, tekrar <code>ls</code> yapın — sistem klasörlerini göreceksiniz.',
                    '<code>cd</code> veya <code>cd ~</code> ile home’a dönün.'
                ],
                commands: [
                    'pwd',
                    'ls -la',
                    'cd /tmp',
                    'cd ~',
                    'cd ..'
                ],
                callouts: [
                    { title: 'Özel yollar', text: '<code>.</code> = burası, <code>..</code> = bir üst dizin, <code>~</code> = home, <code>/</code> = kök.' }
                ],
                mistakes: [
                    '<code>cd /home</code> yazıp kendi klasörünüze inmediğinizi sanmak.',
                    'Yolun başındaki <code>/</code>’i unutmak: <code>tmp</code> ile <code>/tmp</code> farklıdır (biri göreli, biri mutlak).'
                ],
                exercise: '<code>/var</code> dizinine gidip içeriğe bakın, sonra home’a dönün. Her adımda <code>pwd</code> alın.',
                kernel: '<code>cd</code> yeni program açmaz; shell kendi sürecinde <code>chdir()</code> syscall’ını çağırır. <code>pwd</code> çoğu zaman bu cwd’yi basar.',
                crisis: 'Script yanlış dizinde çalışınca “dosya yok” hataları — her zaman mutlak yol veya bilinçli <code>cd</code>.'
            }
        ],
        orta: [
            {
                id: 'ch1-o1',
                title: 'Çıktıyı yönlendirme ve boru hattı',
                tags: 'pipe redirection tee',
                search: 'pipe | > >> 2>&1 tee',
                body: [
                    'Komutlar ekrana yazar (stdout) ve hata basar (stderr). Bunları dosyaya veya başka komuta gönderebilirsiniz.',
                    '<code>&gt;</code> dosyaya yazar (üzerine yazar). <code>&gt;&gt;</code> sona ekler. <code>|</code> (pipe) bir komutun çıktısını diğerinin girdisi yapar.',
                    'Örnek düşünce: “log’u greple, sonucu dosyaya kaydet” — Linux’un süper gücü budur: küçük araçları zincirlemek.'
                ],
                commands: [
                    'echo merhaba > /tmp/a.txt',
                    'cat /tmp/a.txt',
                    'ls / | head -n 5',
                    'ls /yok 2> /tmp/hata.txt',
                    'dmesg | grep -i error | tee /tmp/err.txt'
                ],
                kernel: 'Pipe, kernel’de iki süreç arasında buffer’lı kanal oluşturur. Yönlendirme için dosya tanımlayıcıları (fd 0/1/2) yeniden bağlanır.',
                crisis: 'Dev log dosyasını editörle açmak yerine <code>grep|tail</code> ile daraltmak — sunucu RAM’ini kurtarır.',
                interview: [
                    { q: 'stdout ile stderr farkı?', a: 'stdout (fd 1) normal çıktı; stderr (fd 2) hata/uyarı. Ayrı tutulur ki çıktıyı dosyaya alırken hataları ekranda görebilin veya tersi: <code>2>&1</code> ile birleştirilir.' }
                ]
            },
            {
                id: 'ch1-o2',
                title: 'Geçmiş, tab tamamlama, Ctrl kısayolları',
                tags: 'history tab ctrl',
                search: 'history tab ctrl-c ctrl-r',
                body: [
                    'Yukarı ok = önceki komut. <code>Ctrl+R</code> = geçmişte arama. <code>Tab</code> = dosya/komut tamamlama. <code>Ctrl+C</code> = çalışan komutu iptal (SIGINT). <code>Ctrl+D</code> = shell’den çık (EOF).',
                    '<code>history</code> komutu geçmişi listeler — incident sonrası “ne yaptık?” sorusunun cevabıdır.'
                ],
                commands: ['history | tail -20', 'history | grep ssh'],
                crisis: 'Yanlış sunucuda komut çalıştırdınız — history ve audit log ile iz sürülür. Prod’da bilinçli olun.'
            }
        ],
        ileri: [
            {
                id: 'ch1-i1',
                title: 'Exit kodları ve güvenli script alışkanlığı',
                tags: 'exit code set -e',
                search: 'exit code $? set -euo pipefail',
                body: [
                    'Her komut bir <strong>çıkış kodu</strong> döner: 0 genelde başarı, sıfır dışı hata. <code>echo $?</code> son komutun kodunu gösterir.',
                    '<code>cmd1 && cmd2</code> → cmd1 başarılıysa cmd2. <code>cmd1 || cmd2</code> → cmd1 başarısızsa cmd2. Script’lerde <code>set -euo pipefail</code> hayat kurtarır.'
                ],
                commands: [
                    'true; echo $?',
                    'false; echo $?',
                    'false || echo yedek-plan'
                ],
                kernel: 'Süreç sonlandığında exit status kernel üzerinden parent’a iletilir (wait).',
                crisis: 'CI pipeline “yeşil” görünüp aslında sessizce başarısız adım — exit kodu kontrolü şart.',
                interview: [
                    { q: 'Neden pipefail gerekir?', a: 'Pipeline’da varsayılan olarak sadece son komutun exit kodu döner. Ortadaki grep fail olsa bile script devam edebilir. pipefail tüm zinciri hesaba katar.' }
                ]
            }
        ]
    }
},

/* ========== 02 DOSYA ========== */
{
    id: 'ch2', num: '02', title: 'Dosyalar, Metin ve İlk Araçlar',
    subtitle: 'Her şey dosyadır',
    who: 'pwd/cd bilen, içerik okumaya geçenler.',
    intro: 'Linux felsefesi: “her şey bir dosyadır” — disk dosyası, cihaz, hatta süreç bilgisi. Bu bölümde dosya oluşturma, okuma, kopyalama, silme ve metin içinde arama öğreneceksiniz.',
    levels: {
        baslangic: [
            {
                id: 'ch2-b1',
                title: 'Dosya oluşturmak ve okumak',
                tags: 'touch cat less mkdir',
                search: 'touch cat less mkdir dosya oluştur',
                body: [
                    '<code>touch dosya.txt</code> boş dosya oluşturur (veya zaman damgasını günceller). <code>mkdir klasor</code> dizin açar.',
                    'İçeriği görmek için: <code>cat</code> (hepsini basar — kısa dosyalar), <code>less</code> (sayfa sayfa — uzun log’lar; çıkış <code>q</code>).',
                    'Metin yazmak için şimdilik <code>nano</code> kullanacağız (Bölüm 06’da derinleşeceğiz): <code>nano not.txt</code> → yaz → Ctrl+O kaydet → Ctrl+X çık.'
                ],
                steps: [
                    'Home’da <code>mkdir -p ~/linux-kitap/bolum2</code> yapın.',
                    '<code>cd ~/linux-kitap/bolum2</code>',
                    '<code>nano ilk.txt</code> ile iki satır yazıp kaydedin.',
                    '<code>cat ilk.txt</code> ve <code>less ilk.txt</code> deneyin.'
                ],
                commands: [
                    'mkdir -p ~/linux-kitap/bolum2',
                    'touch ~/linux-kitap/bolum2/deneme.txt',
                    'cat ~/linux-kitap/bolum2/deneme.txt',
                    'less /etc/hosts'
                ],
                mistakes: [
                    '<code>cat</code> ile gigabaytlık log açmak — terminal kilitlenir gibi olur; <code>less</code> veya <code>tail</code> kullanın.',
                    'Dosya adında boşluk varsa tırnak kullanmayı unutmak: <code>"benim dosya.txt"</code>.'
                ],
                exercise: 'Kendi adınızı içeren bir dosya oluşturun. <code>wc -l</code> ile satır sayısını öğrenin.',
                kernel: 'Dosya oluşturmak inode + dizin girdisi demektir. <code>open</code>/<code>creat</code> syscall’ları VFS üzerinden filesystem sürücüsüne gider.',
                crisis: 'Config dosyasını bozmadan önce kopyasını alın: <code>cp sshd_config sshd_config.bak</code>.'
            },
            {
                id: 'ch2-b2',
                title: 'Kopyala, taşı, sil — geri dönüşüm kutusu yok',
                tags: 'cp mv rm',
                search: 'cp mv rm silme kopyalama',
                body: [
                    '<code>cp kaynak hedef</code> kopyalar. <code>mv</code> taşır veya yeniden adlandırır. <code>rm</code> siler.',
                    '<strong>Kritik uyarı:</strong> Klasik Linux’ta Recycle Bin yoktur. <code>rm</code> ile giden çoğu zaman gerçekten gider. Özellikle <code>rm -rf</code> (recursive + force) bir efsane felaket komutudur — yolu iki kez okuyun.',
                    'Dizin kopyalamak için <code>cp -r</code> gerekir.'
                ],
                commands: [
                    'cp ilk.txt ilk-yedek.txt',
                    'mv ilk-yedek.txt yedek.txt',
                    'rm yedek.txt',
                    'cp -r ~/linux-kitap/bolum2 /tmp/bolum2-kopya'
                ],
                callouts: [
                    { type: 'danger', title: 'Sakın', text: '<code>rm -rf /</code> veya yanlışlıkla <code>rm -rf /*</code> — sisteminizi yerle bir edebilir. Root ile asla denemeyin.' }
                ],
                exercise: 'Bir klasör oluşturup içine 3 dosya koyun, klasörü /tmp altına kopyalayın, orijinali silmeden önce listeyi doğrulayın.',
                kernel: '<code>unlink</code> dizin girdisini kaldırır; link sayısı 0 ve dosya açık değilse veri blokları serbest kalır.',
                crisis: 'Yanlış silinen config — yedek veya paket yeniden kurulumu; o yüzden Bölüm 05 yedekleme şart.'
            },
            {
                id: 'ch2-b3',
                title: 'Aramak: find ve grep',
                tags: 'find grep',
                search: 'find grep arama',
                body: [
                    '<code>grep</code> dosya <em>içinde</em> metin arar. <code>find</code> dosya <em>adına/özelliğine</em> göre sistemde gezinir.',
                    'Günlük hayatta: “şu hata log’da var mı?”, “şu config nerede?” — bu iki araç olmadan SysAdmin olunmaz.'
                ],
                commands: [
                    { cmd: 'grep -n root /etc/passwd', note: 'satır numarasıyla' },
                    { cmd: 'grep -R "PermitRootLogin" /etc/ssh/', note: 'dizinde özyinelemeli' },
                    { cmd: 'find /etc -name "*.conf" | head', note: 'adı .conf ile bitenler' }
                ],
                kernel: 'grep user space’te okur; find dizin dolaşımı için <code>getdents</code> kullanır.',
                crisis: 'Prod’da “ayar nerede?” — find/grep ile dakikalar içinde bulunur; ticket süresi kısalır.',
                interview: [
                    { q: 'grep -i ve -v ne işe yarar?', a: '-i büyük/küçük harf duyarsız; -v eşleşmeyen satırları gösterir (ters filtre).' }
                ]
            }
        ],
        orta: [
            {
                id: 'ch2-o1',
                title: 'head, tail, less — log okuma sanatı',
                tags: 'head tail log',
                search: 'head tail -f log',
                body: [
                    'Log dosyaları büyür. <code>head</code> başı, <code>tail</code> sonu gösterir. Canlı izlemek için <code>tail -f</code> (follow).',
                    'Incident sırasında klasik trio: <code>tail -n 100</code>, <code>grep</code>, <code>less +G</code> (sona git).'
                ],
                commands: [
                    'tail -n 50 /var/log/syslog 2>/dev/null || journalctl -n 50',
                    'tail -f /var/log/auth.log'
                ],
                crisis: 'Brute-force SSH denemeleri auth.log’da görünür — SOC analisti refleksi.'
            }
        ],
        ileri: [
            {
                id: 'ch2-i1',
                title: 'Inode, hard link, symlink',
                tags: 'inode symlink hardlink',
                search: 'inode hard link soft link symlink',
                body: [
                    'Dosya adı ≠ dosyanın kendisi. Diskteki gerçek kimlik <strong>inode</strong> numarasıdır. <strong>Hard link</strong> aynı inode’a ikinci isimdir. <strong>Symbolic link (symlink)</strong> başka bir yola işaret eden kısayoldur.',
                    'Symlink hedef silinirse kırılır (broken link). Hard link farklı dosya sistemlerine geçemez.'
                ],
                commands: [
                    'ln -s /etc/hosts ~/hosts-link',
                    'ls -l ~/hosts-link',
                    'stat /etc/hosts'
                ],
                kernel: 'Dizin girdisi (isim → inode). Symlink ayrı bir inode tipidir; path lookup sırasında takip edilir.',
                crisis: 'Deploy script’i symlink ile release değiştirir (atomic switch). Hard link kotası dolunca “disk var ama dosya yok” gibi tuhaflıklar.',
                interview: [
                    { q: 'Hard link ile symlink farkı?', a: 'Hard link aynı inode’u paylaşır; silince diğer isim veriye yetebilir. Symlink path tutar; cross-filesystem olur; hedef silinirse kırılır.' }
                ]
            }
        ]
    }
},

/* ========== 03 GNU/UNIX ========== */
{
    id: 'ch3', num: '03', title: 'GNU ve Unix Komutları',
    subtitle: 'Süreçler, sudo, SystemD',
    who: 'Temel gezinmeyi bilen; süreç ve servis yönetimine geçenler.',
    intro: 'Artık dosya gezebiliyorsunuz. Bu bölüm sizi “makinede ne çalışıyor, kim yetkili, boot’ta ne ayağa kalkıyor?” sorularına götürür — SysAdmin kapısı burasıdır.',
    levels: {
        baslangic: [
            {
                id: 'ch3-b1',
                title: 'Sisteme bakmak: whoami, hostname, uname, df, free',
                tags: 'uname df free',
                search: 'uname df free hostname',
                body: [
                    'Bir sunucuya ilk girdiğinizde harita çıkarın: Kimim? Hangi makine? Hangi kernel? Disk dolu mu? RAM var mı?',
                    'Bu “ilk 60 saniye” alışkanlığı her seviyede geçerlidir.'
                ],
                commands: [
                    'whoami; id',
                    'hostnamectl 2>/dev/null || hostname',
                    'uname -a',
                    'df -h',
                    'free -h',
                    'uptime'
                ],
                exercise: 'Laboratuvarınızda bu komutların çıktısını bir dosyaya yönlendirin: <code>uname -a > ~/makine-bilgi.txt</code>',
                kernel: '<code>uname</code> kernel sürümünü; <code>df</code> filesystem istatistiklerini; <code>free</code> mm alt sistem özetini okur.',
                crisis: 'Disk %100 → servis yazamaz, log atamaz. İlk bakışta <code>df -h</code>.'
            },
            {
                id: 'ch3-b2',
                title: 'Paket kurmak (apt) — program marketi',
                tags: 'apt paket',
                search: 'apt install paket',
                body: [
                    'Debian/Ubuntu/Kali ailesinde yazılımlar <strong>paket</strong> olarak gelir. <code>apt update</code> katalog yeniler, <code>apt install</code> kurar.',
                    'İnternetten rastgele <code>.sh | bash</code> çalıştırmak yerine paketi tercih edin — güncelleme ve güvenlik için.'
                ],
                commands: [
                    'sudo apt update',
                    'sudo apt install -y tree curl',
                    'tree -L 1 /etc'
                ],
                callouts: [
                    { type: 'warn', title: 'sudo isteyecek', text: 'Paket kurmak yetki ister. Şifreniz yazarken ekranda görünmez — normaldir.' }
                ],
                crisis: 'Eksik araç: <code>curl: command not found</code> — apt ile kurulur.'
            }
        ],
        orta: [
            {
                id: 'ch3-o1',
                title: 'Süreçler: ps, top, kill',
                tags: 'ps top kill süreç',
                search: 'ps top htop kill SIGTERM',
                body: [
                    'Çalışan her program bir <strong>süreç (process)</strong>tir ve bir <strong>PID</strong> numarası vardır. <code>ps</code> anlık fotoğraf, <code>top</code>/<code>htop</code> canlı izleme sunar.',
                    'Süreç durdurmak için sinyal gönderirsiniz: <code>kill PID</code> varsayılan SIGTERM (nazikçe kapan), <code>kill -9</code> SIGKILL (zorla — son çare).'
                ],
                commands: [
                    'ps aux --sort=-%mem | head',
                    'top',
                    'pgrep -a ssh',
                    'kill -15 <PID>'
                ],
                kernel: 'Süreçler <code>task_struct</code> ile temsil edilir. SIGKILL userspace’te yakalanamaz; kernel süreci bitirir.',
                crisis: 'CPU %100 runaway — önce süreç kim, sonra neden (strace/log), en son -9.',
                interview: [
                    { q: 'SIGTERM vs SIGKILL?', a: 'TERM yakalanabilir, graceful shutdown için önce o. KILL yakalanamaz; veri kaybı riski. systemd TimeoutStopSec sonrası KILL uygular.' }
                ]
            },
            {
                id: 'ch3-o2',
                title: 'sudo ve sudoers — geçici süper güç',
                tags: 'sudo visudo',
                search: 'sudo visudo sudoers',
                body: [
                    '<code>sudo komut</code> komutu belirli kurallara göre yükseltilmiş yetkiyle çalıştırır. Kurallar <code>/etc/sudoers</code> ve <code>/etc/sudoers.d/</code> altındadır.',
                    'Düzenleme için her zaman <code>visudo</code> kullanın — sözdizimi hatasında kilitlenmeyi önler.'
                ],
                commands: [
                    'sudo -l',
                    'sudo whoami',
                    'sudo visudo'
                ],
                callouts: [
                    { type: 'ok', title: 'İyi pratik', text: 'CI kullanıcısına full ALL yerine tek komut: <code>deploy ALL=(ALL) NOPASSWD: /bin/systemctl restart nginx</code>' }
                ],
                kernel: 'sudo setuid-root binary’dir; politika dosyasını okur, sonra hedef komutu uygun uid ile exec eder.',
                crisis: 'sudoers bozuldu → fiziksel/console erişim veya recovery mode şart. O yüzden visudo.'
            },
            {
                id: 'ch3-o3',
                title: 'Ardışık komutlar: ; && || ve job control',
                tags: 'job control bg fg',
                search: '&& || bg fg jobs',
                body: [
                    'Uzun süren komutu <code>Ctrl+Z</code> ile duraklatıp <code>bg</code> ile arka plana atabilirsiniz. <code>jobs</code> listeler, <code>fg</code> öne getirir.',
                    'Script ve one-liner’larda <code>&&</code> zinciri güvenli otomasyonun temelidir.'
                ],
                commands: [
                    'sleep 60 &',
                    'jobs',
                    'systemctl restart nginx && curl -I localhost'
                ]
            }
        ],
        ileri: [
            {
                id: 'ch3-i1',
                title: 'PID 1: Init’ten SystemD’ye',
                tags: 'systemd pid1 target',
                search: 'systemd pid 1 init runlevel target',
                body: [
                    'Kernel açıldıktan sonra ilk userspace süreci <strong>PID 1</strong> olur. Eskiden SysV <code>init</code> ve runlevel’lar vardı. Modern distrolarda <strong>systemd</strong> PID 1’dir: bağımlılık grafiği, paralel açılış, servis yönetimi, journal log.',
                    'Runlevel 3 ≈ <code>multi-user.target</code>, 5 ≈ <code>graphical.target</code>. Servisler <code>.service</code> unit dosyalarıdır.'
                ],
                commands: [
                    'ps -p 1 -o pid,comm,args',
                    'systemctl get-default',
                    'systemctl status ssh',
                    'systemctl list-units --failed',
                    'journalctl -u ssh -n 50 --no-pager'
                ],
                kernel: 'PID 1 orphan süreçleri evlat edinir. systemd ayrıca cgroup hiyerarşisini yönetir.',
                crisis: 'Boot’ta takılan servis, wrong default target, failed unit döngüsü — systemctl ve journalctl ile çözülür.',
                interview: [
                    { q: 'PID 1 ölürse ne olur?', a: 'Kernel userspace supervisory kaybını fatal sayar; sistem panic/reboot yoluna girer. PID 1 özeldir.' }
                ]
            },
            {
                id: 'ch3-i2',
                title: 'Kernel panic ve rescue',
                tags: 'panic rescue emergency',
                search: 'kernel panic rescue target emergency',
                body: [
                    'Kernel panic: çekirdek kendini güvende görmez. Nedenler: bozuk root FS, initramfs, sürücü, bazen OOM politikası.',
                    'Teşhis: önceki boot journal (<code>journalctl -b -1</code>), serial console, GRUB’dan <code>systemd.unit=rescue.target</code>.'
                ],
                commands: [
                    'journalctl -b -1 -p err..',
                    'dmesg -T | tail -100'
                ],
                crisis: 'Gece prod reboot loop — rescue + fsck + son değişiklik rollback.'
            }
        ]
    },
    chapterInterview: [
        { q: 'systemctl ile service farkı (eski)?', a: 'service çoğu yerde systemctl’e yönlendiren sarmalayıcıdır. Modern sistemlerde unit’leri systemctl ile yönetin; enable/disable, mask, edit --full gibi özellikler systemd’ye özgüdür.' }
    ]
},

/* ========== 04 YETKİ ========== */
{
    id: 'ch4', num: '04', title: 'Linux Yetkilendirme Modeli',
    subtitle: 'rwx’den SUID’e',
    who: 'Dosya gezen; “Permission denied” yiyen herkes.',
    intro: 'Linux güvenliğinin temeli dosya izinleridir. Bu bölümü bitirdiğinizde 755’in ne demek olduğunu ezberden değil anlayarak söyleyeceksiniz; SUID’in neden saldırganların gözdesi olduğunu da.',
    levels: {
        baslangic: [
            {
                id: 'ch4-b1',
                title: 'İzinler sıfırdan: r, w, x ne demek?',
                hook: 'Hiç duymadıysanız: her dosyanın bir “kim ne yapabilir?” etiketi vardır.',
                tags: 'rwx ls -l izin',
                search: 'rwx permission ls -l chmod başlangıç',
                body: [
                    '<code>ls -l</code> çıktısında solda şuna benzer bir şey görürsünüz: <code>-rw-r--r--</code>. İlk karakter dosya tipi (<code>-</code> dosya, <code>d</code> dizin). Sonraki 9 karakter üçlü üçlü: <strong>sahip (user)</strong>, <strong>grup</strong>, <strong>diğerleri (others)</strong>.',
                    '<strong>r</strong> = okuma, <strong>w</strong> = yazma, <strong>x</strong> = çalıştırma. Dizinde x = o dizine girebilme (traverse); r = içeriği listeleme.',
                    'Sayısal (oktal) karşılık: r=4, w=2, x=1. Toplayın: 7=rwx, 5=r-x, 6=rw-, 4=r--. Üç haneli yazılır: sahip-grup-diğer. <strong>755</strong> = sahip her şey, diğerleri oku+çalıştır.'
                ],
                steps: [
                    '<code>ls -l /etc/passwd /etc/shadow</code> karşılaştırın — shadow daha kısıtlıdır.',
                    'Kendi dosyanızda <code>ls -l</code> bakın.',
                    'Aşağıdaki hesaplayıcıda 644, 600, 755 deneyin.'
                ],
                commands: [
                    'ls -l /etc/passwd',
                    'ls -l ~/linux-kitap 2>/dev/null || ls -l ~'
                ],
                callouts: [
                    { title: 'Ezber değil tablo', text: '7=4+2+1, 6=4+2, 5=4+1, 4=4. Üç kez yan yana yazın: kullanıcı / grup / others.' }
                ],
                exercise: 'Bir dosya oluşturup sadece sizin okuyup yazabileceğiniz hale getirin (ipucu: 600).',
                kernel: 'Erişim denemelerinde VFS inode izinlerini ve LSM (SELinux/AppArmor) kurallarını kontrol eder; red → EACCES.',
                crisis: 'Web sunucusu dosyayı okuyamıyor — sahiplik www-data mi, izin 640 mı, SELinux mı?'
            }
        ],
        orta: [
            {
                id: 'ch4-o1',
                title: 'chmod, chown, umask',
                tags: 'chmod chown umask',
                search: 'chmod chown chgrp umask',
                body: [
                    '<code>chmod</code> izin değiştirir (sayısal veya sembolik: <code>chmod u+x script.sh</code>). <code>chown kullanıcı:grup</code> sahipliği değiştirir (genelde root gerekir).',
                    '<code>umask</code> yeni oluşturulan dosyalardan hangi bitlerin düşüleceğini belirler. umask 022 → dosyalar genelde 644.'
                ],
                commands: [
                    'chmod 644 dosya.txt',
                    'chmod u+x script.sh',
                    'sudo chown $USER:$USER dosya.txt',
                    'umask; umask 027'
                ],
                crisis: 'Secret .env 644 kalırsa diğer kullanıcılar okur — 600 yapın.',
                interview: [
                    { q: '644 mü 755 mi?', a: 'Kaynak/config dosyası genelde 644; çalıştırılabilir script/binary ve public dizinler 755. Gizli anahtarlar 600.' }
                ]
            }
        ],
        ileri: [
            {
                id: 'ch4-i1',
                title: 'SUID, SGID, Sticky Bit ve privesc',
                tags: 'SUID SGID sticky privesc',
                search: 'SUID SGID sticky privilege escalation',
                body: [
                    '<strong>SUID</strong>: binary, dosya sahibinin yetkisiyle çalışır. <code>passwd</code> root SUID’dir — şifre dosyasını güncelleyebilir.',
                    '<strong>SGID</strong>: benzer şekilde grup; dizinlerde yeni dosyalar grup miras alır. <strong>Sticky bit</strong>: <code>/tmp</code>’de sadece sahip silebilir.',
                    'Saldırganlar yazılabilir SUID, kötü sudoers, capability sızıntısı arar. Savunmacılar düzenli audit yapar.'
                ],
                commands: [
                    'find / -perm -4000 -type f 2>/dev/null | head',
                    'ls -l /usr/bin/passwd',
                    'chmod 1777 /tmp/shared 2>/dev/null || true'
                ],
                widget: 'chmod',
                kernel: 'exec sırasında credential geçici yükselir (SUID). Sticky dizinlerde silme için ek kontrol.',
                crisis: 'CTF/pentest’te privesc; prod’da beklenmeyen SUID → incident.',
                interview: [
                    { q: 'SUID audit’te ne ararsın?', a: 'Standart paket dışı path’ler, world-writable SUID, home/tmp altı, GTFOBins eşleşmeleri, sudo -l çıktısı.' }
                ]
            }
        ]
    },
    chapterInterview: [
        { q: 'ACL nedir, klasik rwx yetmezse?', a: 'POSIX ACL ile kullanıcı/grup bazlı ekstra izinler verilir (getfacl/setfacl). Paylaşımlı dizinlerde klasik üçlü yetmez.' }
    ]
},

/* ========== 05 YEDEK ========== */
{
    id: 'ch5', num: '05', title: 'Arşiv ve Yedekleme',
    subtitle: 'Kaybetmeden önce kopyala',
    who: 'İlk felaketini yaşamadan yedek öğrenmek isteyenler.',
    intro: 'Yedek yoksa felaket kurtarma bir dilektir. tar/gzip ile başlayıp cron otomasyonu ve DR (disaster recovery) kavramlarına çıkacağız.',
    levels: {
        baslangic: [
            {
                id: 'ch5-b1',
                title: 'Neden yedek? 3-2-1 kuralı',
                tags: 'yedek 3-2-1',
                search: 'yedekleme backup 3-2-1',
                body: [
                    'Disk bozulur, <code>rm</code> yanlış gider, ransomware şifreler, güncelleme bozar. Yedek, zaman makinenizdir.',
                    '<strong>3-2-1:</strong> 3 kopya, 2 farklı medya tipi, 1 kopya offsite (başka yerde). Test edilmemiş yedek yedek değildir.'
                ],
                exercise: 'Bugün bir klasörünüzü başka bir diske/buluta kopyalayın. Yarın geri yüklemeyi deneyin.',
                crisis: 'Prod DB silindi — restore drill yapılmamışsa RTO hayal olur.'
            },
            {
                id: 'ch5-b2',
                title: 'tar ve gzip — sıfırdan',
                tags: 'tar gzip',
                search: 'tar czvf gzip arşiv',
                body: [
                    '<code>tar</code> birçok dosyayı tek arşivde birleştirir (tape archive). <code>gzip</code> sıkıştırır. Birlikte: <code>tar -czvf arsiv.tar.gz klasor/</code>',
                    'Bayrakları kelime gibi okuyun: <strong>c</strong>reate, <strong>z</strong> gzip, <strong>v</strong>erbose, <strong>f</strong>ile. Açmak: <code>-xzvf</code> (extract).'
                ],
                commands: [
                    'tar -czvf /tmp/etc-mini.tar.gz /etc/hostname /etc/hosts',
                    'tar -tzvf /tmp/etc-mini.tar.gz',
                    'mkdir -p /tmp/restore && tar -xzvf /tmp/etc-mini.tar.gz -C /tmp/restore'
                ],
                kernel: 'Çok sayıda open/read/write; page cache şişebilir.',
                crisis: 'Yanlış config sonrası bilinen iyi kopyaya dönüş.'
            }
        ],
        orta: [
            {
                id: 'ch5-o1',
                title: 'Cron ile zamanlama — çalar saat',
                tags: 'cron crontab',
                search: 'cron crontab zamanlama',
                body: [
                    'Cron, “şu dakikada şu komutu çalıştır” demektir. Format: <code>dakika saat gün ay haftanın_günü komut</code>',
                    'Örnek: <code>15 2 * * *</code> = her gün 02:15. Ortam PATH’i kısıtlıdır — script’te tam yol kullanın.'
                ],
                commands: [
                    'crontab -e',
                    'crontab -l'
                ],
                widget: 'cron',
                crisis: 'Backup job sessizce fail — log’a yönlendirin: <code>>>/var/log/backup.log 2>&1</code>',
                interview: [
                    { q: 'Cron çalışmıyor checklist?', a: 'crond aktif mi, doğru kullanıcı crontab’ı, PATH, izinler, exit code, SELinux, DST, disk dolu mu.' }
                ]
            }
        ],
        ileri: [
            {
                id: 'ch5-i1',
                title: 'Backup script ve Disaster Recovery',
                tags: 'rsync RPO RTO',
                search: 'rsync disaster recovery RPO RTO backup script',
                body: [
                    '<strong>RPO</strong>: ne kadar veri kaybı tolere? (backup sıklığı). <strong>RTO</strong>: ne kadar sürede ayağa kalkmalı? (otomasyon + runbook).',
                    'İyi script: <code>set -euo pipefail</code>, tarih damgalı dosya, retention (eskiyi sil), mümkünse offsite <code>rsync</code>, ve <em>düzenli restore testi</em>.'
                ],
                commands: [
                    { cmd: 'rsync -aH --delete /etc/ /mnt/backup/etc-mirror/', note: 'örnek — hedefi iki kez kontrol edin' }
                ],
                crisis: 'Region down → DNS failover + son yedekten restore. Ayda bir drill yapmayan ekip yedek tutmuyordur.'
            }
        ]
    }
},

/* ========== 06 EDİTÖR ========== */
{
    id: 'ch6', num: '06', title: 'Dosya Düzenleyicileri',
    subtitle: 'Nano’dan Vim’e',
    who: 'SSH’ta config düzenleyecek herkes.',
    intro: 'Sunucuda VS Code yoktur. Nano ile güvenli başlayın; Vim ile hız kazanın.',
    levels: {
        baslangic: [
            {
                id: 'ch6-b1',
                title: 'Nano — korkmadan düzenle',
                tags: 'nano',
                search: 'nano editör',
                body: [
                    'Nano modeless’tir: yazarsınız. Altta kısayollar yazar: <code>^</code> = Ctrl. Kaydet: Ctrl+O, çık: Ctrl+X, ara: Ctrl+W.',
                    'İlk config değişikliğinizi nano ile yapın. Hız ikincildir; doğruluk birincildir.'
                ],
                commands: ['nano ~/.bashrc'],
                exercise: 'bashrc sonuna <code>alias ll=\'ls -la\'</code> ekleyin, kaydedip <code>source ~/.bashrc</code> yapın, <code>ll</code> deneyin.',
                crisis: '3 dakikada DNS satırı eklemek.'
            }
        ],
        orta: [
            {
                id: 'ch6-o1',
                title: 'Vi/Vim modları — zihinsel model',
                tags: 'vim normal insert',
                search: 'vim vi modlar yy dd p',
                body: [
                    'Vim bir “mod makinesi”dir. <strong>Normal</strong>: komut (hjkl ile gezin, dd sil). <strong>Insert</strong>: yazı (i/a/o ile gir, Esc ile çık). <strong>Visual</strong>: seç. <strong>Command-line</strong>: <code>:</code> ile.',
                    'Kaydet-çık: <code>:wq</code>. Kaydetmeden çık: <code>:q!</code>. Paniklediniz mi? Esc Esc Esc, sonra <code>:q!</code>.'
                ],
                commands: [
                    'vi /tmp/vim-deneme.txt'
                ],
                callouts: [
                    { title: 'İlk 8 tuş', text: 'h j k l gezin · i insert · Esc normal · yy kopyala · p yapıştır · :wq kaydet-çık · :q! vazgeç' }
                ],
                kernel: ':w → write/fsync ile inode güncellenir; buffer bellekdedir.',
                crisis: 'ssh üzerinden sshd_config düzeltmesi — yanlış syntax ile kilitlenmemek için önce yedek.'
            }
        ],
        ileri: [
            {
                id: 'ch6-i1',
                title: 'Regex değiştirme ve vimrc',
                tags: 'vim regex vimrc',
                search: 'vim %s regex vimrc',
                body: [
                    '<code>/%s</code> arama. <code>:%s/eski/yeni/gc</code> tüm dosyada değiştir (c = confirm). <code>~/.vimrc</code> ile kalıcı konfor: numara, indent, syntax.'
                ],
                commands: [
                    ':%s/PermitRootLogin yes/PermitRootLogin no/gc'
                ],
                crisis: 'Yüzlerce satırda URL değişimi — tek pass, confirm ile güvenli.'
            }
        ]
    }
},

/* ========== 07 EXEC ========== */
{
    id: 'ch7', num: '07', title: 'Yürütülebilirler ve Programlar',
    subtitle: 'PATH’ten GCC’ye',
    who: 'Script çalıştıracak ve “permission denied” çözecekler.',
    intro: 'Komut not found ile permission denied farklı hastalıklardır. Bu bölüm teşhisi öğretir.',
    levels: {
        baslangic: [
            {
                id: 'ch7-b1',
                title: 'Program nasıl bulunur? PATH ve ./',
                tags: 'PATH chmod +x',
                search: 'PATH ./ chmod +x which',
                body: [
                    'Shell, komut adını <code>PATH</code> değişkenindeki dizinlerde arar. <code>./script.sh</code> “bu dizindeki script” demektir — güvenlik için <code>.</code> genelde PATH’te değildir.',
                    'Script’in çalışması için hem okunabilir hem çalıştırılabilir olmalı: <code>chmod +x script.sh</code>. İlk satırda shebang: <code>#!/bin/bash</code> veya <code>#!/usr/bin/env python3</code>.'
                ],
                steps: [
                    'nano ile basit bir script yazın: echo Merhaba',
                    'chmod +x yapın',
                    './script.sh ile çalıştırın'
                ],
                commands: [
                    'echo $PATH',
                    'which python3',
                    'printf \'#!/bin/bash\\necho Merhaba\\n\' > /tmp/merhaba.sh',
                    'chmod +x /tmp/merhaba.sh',
                    '/tmp/merhaba.sh'
                ],
                mistakes: [
                    'chmod +x unutmak',
                    'Windows’tan gelen script’te CRLF satır sonu — <code>bash\\r</code> hatası'
                ],
                kernel: 'execve shebang okur, interpreter’ı yükler.',
                crisis: 'CI image’da PATH farklı → command not found.'
            }
        ],
        orta: [
            {
                id: 'ch7-o1',
                title: 'Python ve Perl çalıştırma',
                tags: 'python perl',
                search: 'python3 perl script',
                body: [
                    '<code>python3 script.py</code>, <code>perl script.pl</code>. Shebang’da <code>env</code> kullanmak çoklu sürüm ortamlarında taşınabilirlik sağlar.',
                    'Güvenlik: bilinmeyen script’i root ile çalıştırmayın.'
                ],
                commands: [
                    'python3 -c "print(2+2)"',
                    'perl -e \'print "ok\\n"\''
                ]
            }
        ],
        ileri: [
            {
                id: 'ch7-i1',
                title: 'GCC ile derleme ve bash otomasyon iskeleti',
                tags: 'gcc ldd make',
                search: 'gcc compile ldd bash set -e',
                body: [
                    'C kaynağı → gcc → ELF binary. <code>ldd</code> paylaşımlı kütüphane bağımlılıklarını gösterir.',
                    'Bash otomasyonda: <code>set -euo pipefail</code>, anlamlı log, idempotent adımlar.'
                ],
                commands: [
                    'printf \'#include <stdio.h>\\nint main(){puts("hi");}\\n\' > /tmp/hi.c',
                    'gcc -Wall -o /tmp/hi /tmp/hi.c && /tmp/hi',
                    'ldd /tmp/hi'
                ],
                crisis: 'glibc uyumsuz binary — ldd ve sürüm notları.',
                interview: [
                    { q: 'Statik vs dinamik link?', a: 'Statik bağımlılığı gömer, taşınabilir ama büyük. Dinamik .so kullanır; yamalar merkezi, LD_LIBRARY_PATH tuzağı vardır.' }
                ]
            }
        ]
    }
},

/* ========== 08 FHS ========== */
{
    id: 'ch8', num: '08', title: 'Dizin Yapısı ve Loglar',
    subtitle: 'FHS haritası + /proc gerçeği',
    who: '“Bu dosya nerede?” diye soran herkes.',
    intro: 'Filesystem Hierarchy Standard (FHS) Linux şehrinin imar planıdır. Log’lar ise şehrin güvenlik kamerası.',
    levels: {
        baslangic: [
            {
                id: 'ch8-b1',
                title: 'Kökten home’a — şehir turu',
                tags: 'fhs /etc /home /bin',
                search: 'fhs /bin /boot /dev /etc /home',
                body: [
                    '<code>/</code> kök. <code>/bin</code> temel komutlar. <code>/boot</code> açılış. <code>/dev</code> cihazlar. <code>/etc</code> ayarlar (çok yaşayacaksınız). <code>/home</code> kullanıcı evleri.',
                    'Windows’taki C:\\Users ≈ /home, C:\\Windows\\System32 benzeri parçalar /usr ve /bin altında dağınıktır — ezberleyin değil, haritalayın.'
                ],
                commands: ['ls /', 'ls /etc | head', 'ls /home'],
                exercise: '/etc altında “network” veya “ssh” geçen isimleri bulun.',
                crisis: 'sshd_config yolu: /etc/ssh/sshd_config — bilmek ticket kısaltır.'
            }
        ],
        orta: [
            {
                id: 'ch8-o1',
                title: 'lib, mnt, opt, proc — orta katman',
                tags: 'proc opt mnt',
                search: '/lib /proc /opt /mnt /media',
                body: [
                    '<code>/proc</code> özeldir: diskte gerçek dosya değil, kernel’in o an ürettiği bilgidir. <code>cat /proc/cpuinfo</code> donanımı “dosya gibi” okur.',
                    '<code>/opt</code> üçüncü parti, <code>/mnt</code>/<code>/media</code> bağlama noktaları, <code>/lost+found</code> fsck artıkları.'
                ],
                commands: ['head /proc/meminfo', 'ls /proc/self'],
                kernel: 'procfs: okuma anında callback ile string üretilir — klasik disk I/O değildir.'
            }
        ],
        ileri: [
            {
                id: 'ch8-i1',
                title: 'var/log, journald ve sanal FS’ler',
                tags: 'journalctl auth.log',
                search: 'journalctl /var/log /proc /sys',
                body: [
                    '<code>/var</code> değişen veri — log’lar burada şişer. systemd’li sistemlerde <code>journalctl</code> birincil araçtır. Klasik text: auth.log, syslog.',
                    '<code>/sys</code> ve <code>/proc</code> RAM/kernel kaynaklı sanal dosya sistemleridir.'
                ],
                commands: [
                    'journalctl -p err -n 30 --no-pager',
                    'journalctl -u ssh --since "1 hour ago"',
                    'df -h /var'
                ],
                widget: 'fhs',
                crisis: 'Disk dolu ama du tutarsız → silinmiş ama açık dosya (lsof +L1). Auth brute force → journal/auth.log.',
                interview: [
                    { q: '/proc dosya sistemi midir?', a: 'Evet, pseudo FS. Mount edilir ama kalıcı blok depolamaz; içerik kernel tarafından üretilir.' }
                ]
            }
        ]
    }
},

/* ========== 09 KALI ========== */
{
    id: 'ch9', num: '09', title: 'Kali ve Güvenlik Araçları',
    subtitle: 'Yetkili ortamda keşif',
    who: 'SOC, pentester adayı, savunmacı düşünen SysAdmin.',
    intro: 'Araçlar silahtır. Bu bölüm yalnızca yazılı izniniz olan laboratuvar ve kapsam için geçerlidir. Temel düşünceyi burada öğrenin; Kali’deki yüzlerce aracın tam listesi için sidebar’daki “Kali Arsenal” referansına bakın (resmi kali-tools-* metapaketleri).',
    levels: {
        baslangic: [
            {
                id: 'ch9-b1',
                title: 'Port nedir? Tarama nedir? (sıfırdan)',
                tags: 'port tcp ss',
                search: 'port tarama ss nmap başlangıç',
                body: [
                    'IP adres bir binanın adresi gibiydi; <strong>port</strong> da daire numarasıdır. 22 genelde SSH, 80 HTTP, 443 HTTPS. Servis o portta “dinler” (listen).',
                    'Kendi makinenizde önce <code>ss -tulpn</code> ile neyin açık olduğuna bakın. Dışarıya tarama = kapıları yoklamak — izinsiz yapmak yasaktır.',
                    'Temel araç: <code>nc -zv host port</code> veya kontrollü <code>nmap</code>.'
                ],
                commands: [
                    'ss -tulpn',
                    'nc -zv 127.0.0.1 22'
                ],
                callouts: [
                    { type: 'danger', title: 'Yasal uyarı', text: 'İzinsiz tarama ve sızma testi suçtur. Yalnızca kendi lab’iniz veya sözleşmeli kapsam.' }
                ],
                kernel: 'Dinleyen soket kernel networking stack’inde tutulur; SYN gelince accept kuyruğuna girer.',
                crisis: 'Shadow IT: unutulmuş Redis 6379 dünya’ya açık — keşif ile bulunur.'
            }
        ],
        orta: [
            {
                id: 'ch9-o1',
                title: 'Araç çantası: Nmap, Burp, Nikto, Wireshark, SQLmap',
                tags: 'nmap burp nikto wireshark sqlmap',
                search: 'nmap burpsuite nikto wireshark sqlmap kurulum',
                body: [
                    '<strong>Nmap</strong>: port/servis keşfi. <strong>Burp Suite</strong>: HTTP proxy ile isteği tut/değiştir. <strong>Nikto</strong>: web misconfig taraması. <strong>Wireshark</strong>: paketleri gör. <strong>SQLmap</strong>: SQL injection otomasyonu (yalnızca yetkili test).',
                    'Kali’de çoğu kurulu gelir; yoksa <code>apt install</code>.'
                ],
                commands: [
                    'sudo apt install -y nmap nikto sqlmap',
                    'nmap -sV -sC 127.0.0.1',
                    'nikto -h http://127.0.0.1'
                ],
                crisis: 'Pentest kickoff’ta asset inventory — nmap ile kapsam netleşir.'
            }
        ],
        ileri: [
            {
                id: 'ch9-i1',
                title: 'OSI katmanı, TCP analizi, SQLi ve bypass düşüncesi',
                tags: 'osi tcp sql injection waf',
                search: 'osi tcp wireshark sqlmap tamper bypass',
                body: [
                    'Nmap çoğunlukla L3/L4. Wireshark L2→L7 decode. Burp/Nikto L7 HTTP. SQLmap uygulama mantığı (L7).',
                    'TCP üçlü el sıkışma: SYN → SYN-ACK → ACK. Wireshark’ta retransmit ve TLS handshake süreleri performans/incident ipucu verir.',
                    'SQLmap: boolean/time/union teknikleri; WAF varsa encoding, comment, tamper script — ama önce manuel doğrulama. Blue team aynı imzaları arar.'
                ],
                commands: [
                    'nmap -sS -p- --min-rate 1000 <hedef>',
                    'sqlmap -u "http://lab/item?id=1" --batch --dbs'
                ],
                crisis: 'SOC: sqlmap user-agent + yüksek 404 + anomali sweep alarmı.',
                interview: [
                    { q: '-sS vs -sT?', a: 'SYN scan root/CAP_NET_RAW ister, handshake tamamlamaz. Connect scan unprivileged full handshake — daha gürültülü.' },
                    { q: 'TLS payload Wireshark’ta görünür mü?', a: 'Genelde hayır; handshake/SNI görülebilir. Decrypt için keylog veya termination noktası gerekir.' }
                ]
            }
        ]
    },
    chapterInterview: [
        { q: 'Pentest ile vulnerability scan farkı?', a: 'Scan çoğunlukla otomatik bulgu listesi üretir. Pentest senaryo, zincirleme exploit, iş etkisi ve manuel doğrulama içerir; rapor aksiyon odaklıdır.' }
    ]
},

/* ========== 10 AĞ ========== */
{
    id: 'ch10', num: '10', title: 'Ağ Temelleri (Linux’ta)',
    subtitle: 'IP, route, DNS, firewall',
    who: 'Sunucuya bağlanamayan / bağlanılan herkes.',
    intro: 'Komut bilmek yetmez; paket neden düştü bilmek gerekir. Bu bölüm Omnibus’u “sadece dosya kitabı” olmaktan çıkarır.',
    levels: {
        baslangic: [
            {
                id: 'ch10-b1',
                title: 'IP adresi ve arayüz — sıfırdan',
                tags: 'ip addr ping',
                search: 'ip addr ping dns',
                body: [
                    'Ağ arayüzü (eth0, ens33, wlan0) bir kapıdır. IP adresi o kapıya takılan numaradır. <code>ip addr</code> ile görürsünüz.',
                    '<code>ping</code> “oraya varabiliyor muyum?” diye ICMP gönderir. DNS isim → IP çevirir (<code>/etc/resolv.conf</code>, systemd-resolved).'
                ],
                commands: [
                    'ip addr',
                    'ip route',
                    'ping -c 3 1.1.1.1',
                    'cat /etc/resolv.conf'
                ],
                crisis: 'DNS bozuk: ping 1.1.1.1 olur, ping google.com olmaz.',
                interview: [
                    { q: 'Default gateway nedir?', a: 'Kendi alt ağınızda olmayan hedeflere trafiği ileten kapı (route tablosundaki default via).' }
                ]
            }
        ],
        orta: [
            {
                id: 'ch10-o1',
                title: 'ss, curl ve temel teşhis',
                tags: 'ss curl dig',
                search: 'ss curl dig traceroute',
                body: [
                    '<code>ss -tulpn</code> dinleyen portlar. <code>curl -I</code> HTTP başlığı. <code>dig</code>/<code>nslookup</code> DNS. <code>traceroute</code>/<code>mtr</code> yol.'
                ],
                commands: [
                    'ss -tulpn',
                    'curl -I https://example.com',
                    'dig example.com +short'
                ]
            }
        ],
        ileri: [
            {
                id: 'ch10-i1',
                title: 'firewalld/nftables/iptables’a bakış',
                tags: 'nftables iptables',
                search: 'iptables nftables firewall',
                body: [
                    'Netfilter kernel kancasıdır; iptables/nftables userspace arayüzüdür. Yanlış kural ile kendinizi SSH’dan kilitleyebilirsiniz — cloud console hazır tutun.',
                    'Politika: varsayılan deny, sadece gereken port allow.'
                ],
                commands: [
                    'sudo nft list ruleset 2>/dev/null | head',
                    'sudo iptables -L -n 2>/dev/null | head'
                ],
                crisis: 'Güvenlik grubu açık ama host firewall kapalı — çift katman kontrol.'
            }
        ]
    }
},

/* ========== 11 KRİZ ========== */
{
    id: 'ch11', num: '11', title: 'Kriz Anı Runbook’u',
    subtitle: 'Prod’da sakin kal',
    who: 'Mülakat ve nöbet için.',
    intro: 'Uzmanlık komut ezberi değil; doğru sırada soru sormaktır. Bu bölüm kitap boyunca öğrendiklerinizi bir teşhis akışına bağlar.',
    levels: {
        baslangic: [
            {
                id: 'ch11-b1',
                title: 'İlk 5 soru (hiçbir şey bilmiyormuş gibi)',
                tags: 'troubleshooting runbook',
                search: 'troubleshooting disk cpu memory',
                body: [
                    '1) Kullanıcı ne görüyor? (hata mesajı) 2) Ne zaman başladı? 3) Ne değişti? (deploy, config) 4) Tek makine mi tüm filo mu? 5) İş etkisi ne?',
                    'Sonra teknik: disk (<code>df -h</code>), bellek (<code>free -h</code>), CPU (<code>uptime</code>/<code>top</code>), servis (<code>systemctl status</code>), log (<code>journalctl</code>).'
                ],
                commands: [
                    'df -h; free -h; uptime',
                    'systemctl --failed',
                    'journalctl -p err..alert -n 50 --no-pager'
                ],
                exercise: 'Lab’de bilerek bir servisi durdurup bu checklist ile “bulun”.',
                crisis: 'P1 incident — iletişim + kanıt toplama + rollback kararı.'
            }
        ],
        orta: [
            {
                id: 'ch11-o1',
                title: 'Sık kriz kalıpları',
                tags: 'disk full oom port',
                search: 'disk full OOM connection refused',
                body: [
                    '<strong>Disk full:</strong> df, du, journal vacuum, log rotate. <strong>OOM:</strong> dmesg/oom_score, memory leak. <strong>Connection refused:</strong> servis down veya yanlış port. <strong>Timeout:</strong> firewall/DNS/yük.',
                    'Her kalıbın komut setini kendi cheatsheet’inize yazın.'
                ],
                crisis: 'Inode tükenmesi (df -i) — küçük dosya bombası.'
            }
        ],
        ileri: [
            {
                id: 'ch11-i1',
                title: 'Mülakat senaryosu: “Google’a enter’a bastığında ne olur?”',
                tags: 'mülakat tcp dns tls',
                search: 'mülakat dns tcp tls kernel',
                body: [
                    'DNS çözümleme → socket → TCP handshake → TLS → HTTP. Linux’ta: nsswitch/hosts, getaddrinfo, connect, şifreli yazma. Kernel paketleri netfilter’dan geçirir.',
                    'Cevabı katman katman verin; ezber paragraf değil mimari anlatın.'
                ],
                interview: [
                    { q: 'Prod’da yanlış deploy — ilk 3 aksiyon?', a: '1) Etkiyi ölç ve iletişimi aç 2) Trafiği/instance’ı sağlıklıya kaydır veya rollback 3) Kanıt topla (log, metrics, change id) sonra root cause.' }
                ]
            }
        ]
    },
    chapterInterview: [
        { q: 'Senior ile junior farkı nedir?', a: 'Junior komutu çalıştırır. Senior hipotez kurar, katmanı izole eder, yan etkiyi düşünür, kanıtla konuşur ve sistemi daha dayanıklı bırakır.' }
    ]
}

];
