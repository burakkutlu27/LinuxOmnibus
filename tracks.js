/* Hedefe yönelik kariyer / rol müfredatları */
window.TRACKS = [
    {
        id: 'sifirdan',
        title: 'Sıfırdan Linux',
        short: 'Başlangıç',
        color: 'cyan',
        icon: 'fa-seedling',
        who: 'Hiç terminal görmemiş veya Windows’tan geçenler.',
        outcome: 'Terminalde gezinir, dosya/izin/süreç okur, basit teşhis yaparsınız.',
        weeks: '2–4 hafta',
        phases: [
            { title: 'Zemin', desc: 'Korkuyu bırak, modeli kur', chapters: ['ch0', 'ch1', 'ch2'] },
            { title: 'Sistem dili', desc: 'Süreç, yetki, dizin', chapters: ['ch3', 'ch4', 'ch6', 'ch8'] },
            { title: 'İlk kriz', desc: 'Ağ + runbook girişi', chapters: ['ch10', 'ch11'] }
        ]
    },
    {
        id: 'devops',
        title: 'DevOps Mühendisi',
        short: 'DevOps',
        color: 'cyan',
        icon: 'fa-gears',
        who: 'Yazılımı build/deploy etmek, pipeline ve konteyner bilmek isteyenler.',
        outcome: 'Git → CI → imaj → K8s/Compose → IaC ile güvenli bir delivery hattı kurarsınız.',
        weeks: '8–12 hafta',
        phases: [
            { title: 'Linux omurgası', desc: 'Olmadan DevOps olmaz', chapters: ['ch0', 'ch1', 'ch2', 'ch3', 'ch4', 'ch12', 'ch13'] },
            { title: 'Teslimat', desc: 'Koddan ortama', chapters: ['ch23', 'ch15', 'ch17', 'ch16'] },
            { title: 'Altyapı kodu', desc: 'Tekrarlanabilir ortam', chapters: ['ch18', 'ch24', 'ch21'] },
            { title: 'İşletme', desc: 'Gözlem ve Day-2', chapters: ['ch19', 'ch22', 'ch11', 'ch25'] }
        ]
    },
    {
        id: 'sre',
        title: 'SRE / Platform',
        short: 'SRE',
        color: 'amber',
        icon: 'fa-server',
        who: 'Güvenilirlik, SLO, on-call ve iç platform düşünenler.',
        outcome: 'Kriz yönetir, SLO kurar, platform golden path ve GitOps ile ölçeklersiniz.',
        weeks: '10–14 hafta',
        phases: [
            { title: 'Ops kası', desc: 'Teşhis ve sistem', chapters: ['ch3', 'ch8', 'ch11', 'ch12', 'ch14', 'ch28', 'ch29'] },
            { title: 'Ölçek', desc: 'Konteyner filoları', chapters: ['ch15', 'ch16', 'ch27', 'ch22'] },
            { title: 'Gözlem', desc: 'Sinyal ve bütçe', chapters: ['ch19', 'ch33', 'ch17'] },
            { title: 'Day-2', desc: 'IR + kimlik + güvenlik', chapters: ['ch32', 'ch21', 'ch31', 'ch34'] }
        ]
    },
    {
        id: 'redhat',
        title: 'Red Hat / Sistem Yöneticisi',
        short: 'RHEL',
        color: 'red',
        icon: 'fa-redhat',
        who: 'RHEL/Rocky/Alma, kurumsal sunucu, RHCE tarzı yol.',
        outcome: 'SSH, LVM, systemd, SELinux, ağ, Ansible ile kurumsal Linux işletirsiniz.',
        weeks: '8–12 hafta',
        phases: [
            { title: 'Temel admin', desc: 'Günlük işletim', chapters: ['ch0', 'ch1', 'ch2', 'ch3', 'ch4', 'ch6', 'ch8'] },
            { title: 'Depolama & servis', desc: 'Disk ve unit’ler', chapters: ['ch14', 'ch5', 'ch28', 'ch12'] },
            { title: 'Kurumsal güvenlik', desc: 'SELinux + kimlik', chapters: ['ch30', 'ch31', 'ch20', 'ch21'] },
            { title: 'Otomasyon', desc: 'Ansible + ağ + performans', chapters: ['ch18', 'ch10', 'ch27', 'ch29', 'ch13'] }
        ]
    },
    {
        id: 'soc',
        title: 'SOC Analisti',
        short: 'SOC',
        color: 'green',
        icon: 'fa-shield-halved',
        who: 'SIEM, alert triyajı, blue team’e giriş.',
        outcome: 'Log okur, anomaly yakalar, IR adımlarını bilir, Linux host’u savunma gözüyle görür.',
        weeks: '8–10 hafta',
        phases: [
            { title: 'Linux okuryazarlığı', desc: 'Host’u anla', chapters: ['ch0', 'ch1', 'ch2', 'ch3', 'ch4', 'ch8'] },
            { title: 'Ağ & kimlik', desc: 'Trafik ve hesap', chapters: ['ch10', 'ch12', 'ch31', 'ch21'] },
            { title: 'Detect', desc: 'Sinyal ve hardening', chapters: ['ch19', 'ch20', 'ch30', 'ch33'] },
            { title: 'Respond', desc: 'Olay ve konteyner', chapters: ['ch32', 'ch11', 'ch34', 'ch9'] }
        ],
        kaliDeep: ['nmap', 'wireshark', 'responder']
    },
    {
        id: 'redteam',
        title: 'Red Team / Pentest',
        short: 'Red Team',
        color: 'red',
        icon: 'fa-user-secret',
        who: 'Yetkili lab’de saldırı zincirini öğrenmek isteyenler (etik zorunlu).',
        outcome: 'Recon → enum → exploit → privesc metodolojisi + kritik araçlarda derinlik.',
        weeks: '10–16 hafta',
        phases: [
            { title: 'Önkoşul Linux', desc: 'Araçtan önce sistem', chapters: ['ch0', 'ch1', 'ch2', 'ch3', 'ch4', 'ch10'] },
            { title: 'Güvenlik temeli', desc: 'Port, web, ağ', chapters: ['ch9', 'ch12', 'ch20', 'ch21'] },
            { title: 'Zincir', desc: 'AD ve privesc bilinci', chapters: ['ch31', 'ch30', 'ch34'] },
            { title: 'Operasyonel', desc: 'Rapor ve savunma farkındalığı', chapters: ['ch32', 'ch19', 'ch11'] }
        ],
        kaliDeep: ['nmap', 'burp', 'metasploit', 'sqlmap', 'hydra', 'hashcat', 'nuclei', 'bloodhound', 'impacket', 'linpeas-winpeas', 'responder', 'netexec']
    },
    {
        id: 'blueteam',
        title: 'Blue Team / Hardening',
        short: 'Blue Team',
        color: 'green',
        icon: 'fa-lock',
        who: 'Saldırı yüzeyini küçültmek, CIS/hardening uygulamak isteyenler.',
        outcome: 'Host’u sertleştirir, TLS/secret yönetir, tespit koyar, konteyner güvenliğini bilirsiniz.',
        weeks: '8–12 hafta',
        phases: [
            { title: 'Kontrol zemini', desc: 'Yetki ve servis', chapters: ['ch4', 'ch3', 'ch12', 'ch28'] },
            { title: 'Hardening', desc: 'MAC ve yüzey', chapters: ['ch20', 'ch30', 'ch21', 'ch5'] },
            { title: 'Detect & respond', desc: 'Gözlem + IR', chapters: ['ch19', 'ch33', 'ch32', 'ch11'] },
            { title: 'Modern iş yükü', desc: 'Konteyner / kimlik', chapters: ['ch34', 'ch31', 'ch15', 'ch16'] }
        ]
    },
    {
        id: 'cloud',
        title: 'Cloud Ops',
        short: 'Cloud',
        color: 'amber',
        icon: 'fa-cloud',
        who: 'AWS/GCP/Azure üzerinde Linux işletenler.',
        outcome: 'VM, IAM, SG, disk, imaj, IaC ve gözlem ile bulutta güvenli işletirsiniz.',
        weeks: '6–10 hafta',
        phases: [
            { title: 'Linux + SSH', desc: 'Uzak işletim', chapters: ['ch1', 'ch3', 'ch12', 'ch14'] },
            { title: 'Bulut gerçekleri', desc: 'Metadata, IAM, ağ', chapters: ['ch24', 'ch10', 'ch21', 'ch20'] },
            { title: 'Otomasyon', desc: 'IaC ve imaj', chapters: ['ch18', 'ch15', 'ch17', 'ch23'] },
            { title: 'Güvenilirlik', desc: 'Gözlem ve kriz', chapters: ['ch19', 'ch11', 'ch27', 'ch32'] }
        ]
    },
    {
        id: 'backend',
        title: 'Backend / Full-stack Ops',
        short: 'Backend',
        color: 'cyan',
        icon: 'fa-code',
        who: 'Kendi servisini Linux’ta ayağa kaldıran geliştiriciler.',
        outcome: 'Process, log, DB, Docker, temel deploy ve teşhis yaparsınız.',
        weeks: '4–8 hafta',
        phases: [
            { title: 'Geliştirici Linux’u', desc: 'Terminal ve dosya', chapters: ['ch1', 'ch2', 'ch6', 'ch7', 'ch13'] },
            { title: 'Servis & veri', desc: 'systemd, DB, ağ', chapters: ['ch3', 'ch28', 'ch26', 'ch10'] },
            { title: 'Paketin', desc: 'Git, Docker, CI', chapters: ['ch23', 'ch15', 'ch17', 'ch21'] },
            { title: 'Prod bilinci', desc: 'Log, kriz, güvenlik', chapters: ['ch8', 'ch19', 'ch11', 'ch20'] }
        ]
    }
];

window.TRACK_BY_ID = Object.fromEntries(window.TRACKS.map(t => [t.id, t]));
