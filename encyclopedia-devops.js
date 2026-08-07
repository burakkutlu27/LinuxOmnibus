/* DevOps · Cloud · Security komut ansiklopedisi genişletmesi */
(function () {
    const extra = [
        // Docker / container
        { cmd: 'docker build', cat: 'Geliştirme', en: 'Docker Build', tr: 'İmaj oluştur', origin: 'Dockerfil’an katmanlı imaj üretir.', example: 'docker build -t app:1.0 .', tip: 'Cache için sıralama önemli', aliases: ['imaj build', 'dockerfile derle'] },
        { cmd: 'docker compose', cat: 'Geliştirme', en: 'Docker Compose', tr: 'Çok servisli stack', origin: 'compose = birleştir. YAML ile multi-container.', example: 'docker compose up -d', aliases: ['compose ayağa', 'stack başlat'] },
        { cmd: 'docker exec', cat: 'Geliştirme', en: 'Docker Exec', tr: 'Konteynerde komut çalıştır', origin: 'running container içine gir/çalıştır.', example: 'docker exec -it web sh', aliases: ['konteynere gir'] },
        { cmd: 'docker logs', cat: 'Geliştirme', en: 'Docker Logs', tr: 'Konteyner logları', origin: 'stdout/stderr akışı.', example: 'docker logs -f --tail 100 web', aliases: ['konteyner log'] },
        { cmd: 'docker system prune', cat: 'Geliştirme', en: 'Docker Prune', tr: 'Kullanılmayanları temizle', origin: 'disk kurtarma — dikkatli kullan.', example: 'docker system prune -af', tip: 'Volume silmez (ayrıca -v)', aliases: ['docker temizlik', 'konteyner disk'] },
        { cmd: 'podman', cat: 'Geliştirme', en: 'Podman', tr: 'Daemonless konteyner', origin: 'pod + man; rootless dostu Docker alternatifi.', example: 'podman run --rm -it alpine', aliases: ['rootless container'] },
        { cmd: 'buildah', cat: 'Geliştirme', en: 'Buildah', tr: 'OCI imaj inşa', origin: 'build + ah; Dockerfil’ız da build.', example: 'buildah bud -t app .' },
        { cmd: 'skopeo', cat: 'Geliştirme', en: 'Skopeo', tr: 'İmaj kopyala/incele', origin: 'registr’er arası kopya, inspect.', example: 'skopeo inspect docker://nginx:alpine' },
        { cmd: 'trivy', cat: 'Güvenlik', en: 'Trivy', tr: 'İmaj/FS CVE tarama', origin: 'Aqu’ın scanne’; C’a yaygın.', example: 'trivy image nginx:alpine', aliases: ['imaj tarama', 'cve tara'] },
        { cmd: 'grype', cat: 'Güvenlik', en: 'Grype', tr: 'Zafiyet tara', origin: 'Anchore scanner.', example: 'grype dir:.' },
        { cmd: 'cosign', cat: 'Güvenlik', en: 'Cosign', tr: 'İmaj imzala / doğrula', origin: 'Sigstore imzalama.', example: 'cosign verify ghcr.io/org/app:1', aliases: ['imaj imza'] },
        { cmd: 'syft', cat: 'Güvenlik', en: 'Syft', tr: 'SBOM üret', origin: 'Software Bill of Materials.', example: 'syft packages dir:. -o spdx-json', aliases: ['sbom'] },

        // Kubernetes
        { cmd: 'kubectl get', cat: 'Geliştirme', en: 'Kubectl Get', tr: 'Kaynakları listele', origin: 'K8s API GET.', example: 'kubectl get pods -A', aliases: ['pod listele', 'k8s bak'] },
        { cmd: 'kubectl describe', cat: 'Geliştirme', en: 'Kubectl Describe', tr: 'Detay + events', origin: 'teşhisin kalbi: Events.', example: 'kubectl describe pod mypod', aliases: ['pod events'] },
        { cmd: 'kubectl logs', cat: 'Geliştirme', en: 'Kubectl Logs', tr: 'Pod logları', origin: 'container stdout.', example: 'kubectl logs -f deploy/myapp --tail=100', aliases: ['pod log'] },
        { cmd: 'kubectl apply', cat: 'Geliştirme', en: 'Kubectl Apply', tr: 'Bildirimsel uygula', origin: 'declarative create/update.', example: 'kubectl apply -f manifest.yaml', aliases: ['yaml uygula'] },
        { cmd: 'kubectl rollout', cat: 'Geliştirme', en: 'Kubectl Rollout', tr: 'Yayın / geri al', origin: 'Deployment rollout yönetimi.', example: 'kubectl rollout undo deploy/myapp', aliases: ['rollback k8s', 'yayını geri al'] },
        { cmd: 'kubectl exec', cat: 'Geliştirme', en: 'Kubectl Exec', tr: 'Pod içinde komut', origin: 'docker exec benzeri.', example: 'kubectl exec -it POD -- sh' },
        { cmd: 'kubectl port-forward', cat: 'Geliştirme', en: 'Port Forward', tr: 'Yerel porta yönlendir', origin: 'debug için tunnel.', example: 'kubectl port-forward svc/db 5432:5432', aliases: ['k8s tunnel'] },
        { cmd: 'kubectl top', cat: 'Geliştirme', en: 'Kubectl Top', tr: 'CPU/mem kullanımı', origin: 'metrics-server gerekir.', example: 'kubectl top nodes' },
        { cmd: 'kubectl config', cat: 'Geliştirme', en: 'Kubeconfig', tr: 'Bağlam / küme seç', origin: 'kubeconfig context yönetimi.', example: 'kubectl config use-context prod', aliases: ['context değiştir'] },
        { cmd: 'helm', cat: 'Geliştirme', en: 'Helm', tr: 'K8s paket yöneticisi', origin: 'chart = paket; release = kurulum.', example: 'helm upgrade --install app ./chart -n app', aliases: ['helm chart'] },
        { cmd: 'helmfile', cat: 'Geliştirme', en: 'Helmfile', tr: 'Çok chart orkestrasyon', origin: 'helm releases as code.', example: 'helmfile apply' },
        { cmd: 'k9s', cat: 'Geliştirme', en: 'K9s', tr: 'Terminal K8s UI', origin: 'interaktif küme gezgini.', example: 'k9s', aliases: ['k8s tui'] },
        { cmd: 'stern', cat: 'Geliştirme', en: 'Stern', tr: 'Çok pod log tail', origin: 'multi-pod log aggregator.', example: 'stern myapp -n prod' },

        // CI/CD & GitOps
        { cmd: 'gh', cat: 'Geliştirme', en: 'GitHub CLI', tr: 'GitHub komut satırı', origin: 'PR, Actions, release...', example: 'gh pr create --fill', aliases: ['github cli', 'pr aç'] },
        { cmd: 'gh run', cat: 'Geliştirme', en: 'GH Actions Run', tr: 'Workflow koşuları', origin: 'Actions run list/watch.', example: 'gh run watch', aliases: ['actions izle'] },
        { cmd: 'glab', cat: 'Geliştirme', en: 'GitLab CLI', tr: 'GitLab komut satırı', origin: 'g’in GitLab karşılığı.', example: 'glab ci view' },
        { cmd: 'argocd', cat: 'Geliştirme', en: 'Argo CD CLI', tr: 'GitOps senkron', origin: 'declarative CD for K8s.', example: 'argocd app sync myapp', aliases: ['gitops sync'] },
        { cmd: 'flux', cat: 'Geliştirme', en: 'Flux', tr: 'GitOps araç seti', origin: 'CNCF GitOps toolkit.', example: 'flux get kustomizations', aliases: ['flux cd'] },

        // Terraform / Ansible
        { cmd: 'terraform', cat: 'Geliştirme', en: 'Terraform', tr: 'Altyapı kodu (plan/apply)', origin: 'HashiCorp IaC; OpenTofu forku da var.', example: 'terraform plan', aliases: ['altyapı kod', 'iac plan'] },
        { cmd: 'tofu', cat: 'Geliştirme', en: 'OpenTofu', tr: 'Açık Terraform forku', origin: 'open + tofu.', example: 'tofu apply' },
        { cmd: 'terraform state', cat: 'Geliştirme', en: 'TF State', tr: 'State incele / taşı', origin: 'kaynak kimlik haritası.', example: 'terraform state list', tip: 'Pro’a dikkat', aliases: ['tf state'] },
        { cmd: 'tflint', cat: 'Geliştirme', en: 'TFLint', tr: 'Terraform lint', origin: 'statik analiz.', example: 'tflint' },
        { cmd: 'checkov', cat: 'Güvenlik', en: 'Checkov', tr: 'IaC güvenlik tarama', origin: 'policy as code scanner.', example: 'checkov -d .', aliases: ['iac scan'] },
        { cmd: 'ansible', cat: 'Geliştirme', en: 'Ansible', tr: 'Yapılandırma otomasyonu', origin: 'agentless SSH otomasyon.', example: 'ansible all -m ping', aliases: ['ansible ping'] },
        { cmd: 'ansible-playbook', cat: 'Geliştirme', en: 'Ansible Playbook', tr: 'Playbook çalıştır', origin: 'YAML senaryo motoru.', example: 'ansible-playbook -i inv site.yml', aliases: ['playbook'] },
        { cmd: 'ansible-vault', cat: 'Güvenlik', en: 'Ansible Vault', tr: 'Secret şifrele', origin: 'playbook secre’erini encrypt.', example: 'ansible-vault edit secrets.yml' },
        { cmd: 'packer', cat: 'Geliştirme', en: 'Packer', tr: 'İmaj şablonu oluştur', origin: 'machine image as code.', example: 'packer build image.pkr.hcl' },

        // Observability
        { cmd: 'promtool', cat: 'Sistem', en: 'Prometheus Tool', tr: 'PromQL / config test', origin: 'Prometheus yardımcı.', example: 'promtool check config prometheus.yml' },
        { cmd: 'amtool', cat: 'Sistem', en: 'Alertmanager Tool', tr: 'Alert yönet', origin: 'silence/inhibit CLI.', example: 'amtool silence query' },
        { cmd: 'curl metrics', cat: 'Sistem', en: 'Scrape Metrics', tr: 'Metrik endpoint bak', origin: 'Prometheus exposition format.', example: 'curl -s localhost:9100/metrics | head', aliases: ['metrics bak'] },

        // SSH / network ops
        { cmd: 'ssh-keygen', cat: 'Güvenlik', en: 'SSH Keygen', tr: 'SSH anahtarı üret', origin: 'key generation.', example: 'ssh-keygen -t ed25519 -C "ben@host"', aliases: ['ssh anahtar üret'] },
        { cmd: 'ssh-copy-id', cat: 'Güvenlik', en: 'SSH Copy ID', tr: 'Açık anahtarı sunucuya koy', origin: 'authorized_key’ ekler.', example: 'ssh-copy-id user@host', aliases: ['şifresiz ssh'] },
        { cmd: 'ssh-add', cat: 'Güvenlik', en: 'SSH Add', tr: 'Anahtarı agen’ ekle', origin: 'ssh-agen’ private key.', example: 'ssh-add ~/.ssh/id_ed25519' },
        { cmd: 'scp', cat: 'Ağ', en: 'Secure Copy', tr: 'Güvenli dosya kopyala', origin: 'SSH üzerinden cp.', example: 'scp file host:/tmp/', aliases: ['uzaktan kopyala'] },
        { cmd: 'sftp', cat: 'Ağ', en: 'SSH FTP', tr: 'Etkileşimli güvenli transfer', origin: 'FTP benzeri SSH oturumu.', example: 'sftp user@host' },
        { cmd: 'rsync', cat: 'Ağ', en: 'Remote Sync', tr: 'Akıllı senkron', origin: 'delta transfer; deploy dostu.', example: 'rsync -avz ./dist/ host:/var/www/', aliases: ['senkronize et', 'deploy kopyala'] },
        { cmd: 'ProxyJump', cat: 'Ağ', en: 'SSH ProxyJump', tr: 'Bastion üzerinden atla', origin: 'ssh -J jump target', example: 'ssh -J bastion user@internal', aliases: ['jump host', 'bastion'] },

        // Hardening / blue team
        { cmd: 'fail2ban-client', cat: 'Güvenlik', en: 'Fail2ban', tr: 'Ban listesi yönet', origin: 'brute-force engelleme.', example: 'sudo fail2ban-client status sshd', aliases: ['fail2ban', 'ip ban'] },
        { cmd: 'ufw', cat: 'Güvenlik', en: 'Uncomplicated Firewall', tr: 'Basit firewall', origin: 'Ubuntu dostu nft/iptables sarmalayıcı.', example: 'sudo ufw allow 22/tcp', aliases: ['firewall aç'] },
        { cmd: 'firewall-cmd', cat: 'Güvenlik', en: 'Firewalld', tr: 'Firewalld kontrol', origin: 'RHEL ailesi firewall.', example: 'sudo firewall-cmd --list-all' },
        { cmd: 'nft', cat: 'Güvenlik', en: 'Nftables', tr: 'Modern netfilter CLI', origin: 'iptables halefi.', example: 'sudo nft list ruleset', aliases: ['nftables'] },
        { cmd: 'ausearch', cat: 'Güvenlik', en: 'Audit Search', tr: 'Audit log ara', origin: 'auditd kayıt sorgusu.', example: 'sudo ausearch -m USER_LOGIN -ts recent', aliases: ['audit ara'] },
        { cmd: 'aureport', cat: 'Güvenlik', en: 'Audit Report', tr: 'Audit özet rapor', origin: 'auditd raporları.', example: 'sudo aureport -l' },
        { cmd: 'aide', cat: 'Güvenlik', en: 'AIDE', tr: 'Dosya bütünlük denetimi', origin: 'Advanced Intrusion Detection Environment.', example: 'sudo aide --check', aliases: ['file integrity'] },
        { cmd: 'lynis', cat: 'Güvenlik', en: 'Lynis', tr: 'Host hardening audit', origin: 'güvenlik puanlama aracı.', example: 'sudo lynis audit system', aliases: ['hardening audit'] },
        { cmd: 'getenforce', cat: 'Güvenlik', en: 'Get Enforce', tr: 'SELinux durumu', origin: 'Enforcing/Permissive/Disabled.', example: 'getenforce', aliases: ['selinux durum'] },
        { cmd: 'aa-status', cat: 'Güvenlik', en: 'AppArmor Status', tr: 'AppArmor profilleri', origin: 'Ubuntu MAC durumu.', example: 'sudo aa-status' },
        { cmd: 'capsh', cat: 'Güvenlik', en: 'Capability Shell', tr: 'Capability incele', origin: 'linux capabilities debug.', example: 'capsh --print' },

        // TLS / certs
        { cmd: 'openssl s_client', cat: 'Güvenlik', en: 'OpenSSL Client', tr: 'TLS el sıkışması test', origin: 'sertifika/zincir debug.', example: 'openssl s_client -connect host:443 -servername host', aliases: ['tls test', 'sertifika bak'] },
        { cmd: 'openssl x509', cat: 'Güvenlik', en: 'OpenSSL X509', tr: 'Sertifika oku', origin: 'PEM/DER parse.', example: 'openssl x509 -in cert.pem -noout -dates -subject', aliases: ['cert oku', 'sertifika tarihi'] },
        { cmd: 'certbot', cat: 'Güvenlik', en: 'Certbot', tr: 'Le’ Encrypt istemci', origin: 'ACME client.', example: 'sudo certbot renew --dry-run', aliases: ['lets encrypt', 'sertifika yenile'] },
        { cmd: 'mkcert', cat: 'Güvenlik', en: 'mkcert', tr: 'Yerel güvenilir cert', origin: 'dev için local CA.', example: 'mkcert localhost 127.0.0.1' },
        { cmd: 'step', cat: 'Güvenlik', en: 'Smallstep CLI', tr: 'Internal CA / cert', origin: 'PKI otomasyon.', example: 'step certificate inspect cert.pem' },

        // Storage extras
        { cmd: 'ncdu', cat: 'Disk', en: 'NCurses Du', tr: 'İnteraktif disk kullanım', origin: 'du + ncurses UI.', example: 'sudo ncdu /', aliases: ['disk gez', 'büyük klasör'] },
        { cmd: 'lsblk -f', cat: 'Disk', en: 'LSBLK Filesystems', tr: 'FS + UUID ağacı', origin: 'mount teşhisi.', example: 'lsblk -f' },
        { cmd: 'findmnt', cat: 'Disk', en: 'Find Mount', tr: 'Mount ağacını göster', origin: 'util-linux; fstab debug.', example: 'findmnt /' },
        { cmd: 'lvextend', cat: 'Disk', en: 'LV Extend', tr: 'Logical volume büyüt', origin: 'LVM resize.', example: 'sudo lvextend -L +10G /dev/vg0/root', aliases: ['disk büyüt lvm'] },
        { cmd: 'xfs_growfs', cat: 'Disk', en: 'XFS Grow', tr: 'XFS dosya sistemi büyüt', origin: 'mounted XFS expand.', example: 'sudo xfs_growfs /' },
        { cmd: 'resize2fs', cat: 'Disk', en: 'Resize Ext', tr: 'ext FS büyüt/küçült', origin: 'ext3/4 resize.', example: 'sudo resize2fs /dev/vg0/root' },
        { cmd: 'smartctl', cat: 'Disk', en: 'SMART CTL', tr: 'Disk sağlık SMART', origin: 'smartmontools.', example: 'sudo smartctl -a /dev/sda', aliases: ['disk sağlığı'] },
        { cmd: 'iotop', cat: 'Disk', en: 'IO Top', tr: 'Disk I/O süreçleri', origin: 'to’n I/O hali.', example: 'sudo iotop -o', aliases: ['disk yavaş'] },
        { cmd: 'iostat', cat: 'Disk', en: 'IO Stat', tr: 'I/O istatistik', origin: 'sysstat paketi.', example: 'iostat -xz 1' },

        // Scripting helpers
        { cmd: 'shellcheck', cat: 'Geliştirme', en: 'ShellCheck', tr: 'Bash script lint', origin: 'statik analiz — prod öncesi şart.', example: 'shellcheck script.sh', aliases: ['bash lint'] },
        { cmd: 'flock', cat: 'Sistem', en: 'File Lock', tr: 'Dosya kilidi ile çalıştır', origin: 'cron çakışmasını önler.', example: 'flock -n /tmp/job.lock -c ./job.sh', aliases: ['cron kilit'] },
        { cmd: 'timeout', cat: 'Sistem', en: 'Timeout', tr: 'Süre sınırı koy', origin: 'komut N s’e bitmezse öldür.', example: 'timeout 30s ./slow.sh' },
        { cmd: 'watch', cat: 'Sistem', en: 'Watch', tr: 'Komutu periyodik tekrarla', origin: 'canlı izleme.', example: 'watch -n 1 "df -h"', aliases: ['canlı izle'] },

        // Cloud CLIs (brief)
        { cmd: 'aws', cat: 'Geliştirme', en: 'AWS CLI', tr: 'Amazon Web Services CLI', origin: 'cloud API komut satırı.', example: 'aws s3 ls', aliases: ['aws s3'] },
        { cmd: 'gcloud', cat: 'Geliştirme', en: 'Google Cloud CLI', tr: 'GCP komut satırı', origin: 'Google Cloud SDK.', example: 'gcloud compute instances list' },
        { cmd: 'az', cat: 'Geliştirme', en: 'Azure CLI', tr: 'Azure komut satırı', origin: 'Microsoft Azure.', example: 'az account show' },
    ];

    window.COMMANDS = (window.COMMANDS || []).concat(extra);

    Object.assign(window.SEARCH_PHRASES || (window.SEARCH_PHRASES = {}), {
        'docker kur': ['docker', 'docker run'],
        'imaj oluştur': ['docker build'],
        'compose': ['docker compose'],
        'pod bak': ['kubectl get', 'kubectl describe'],
        'kubernete': ['kubectl get', 'helm'],
        'yayını geri al': ['kubectl rollout'],
        'altyapı kodla': ['terraform', 'tofu'],
        'playbook çalıştır': ['ansible-playbook', 'ansible'],
        'sertifika süresi': ['openssl x509', 'certbot'],
        'tls kontrol': ['openssl s_client'],
        'ssh anahtar': ['ssh-keygen', 'ssh-copy-id'],
        'bastion': ['ProxyJump', 'ssh'],
        'diski büyüt': ['lvextend', 'resize2fs', 'xfs_growfs'],
        'büyük dosya bul': ['du', 'ncdu'],
        'cve tara': ['trivy', 'grype'],
        'sbom': ['syft'],
        'gitops': ['argocd', 'flux'],
        'hardening tara': ['lynis', 'aide'],
        'selinux': ['getenforce'],
        'pipeline': ['gh run', 'glab'],
        'secret şifrele': ['ansible-vault', 'sops'],
        'metrik': ['curl metrics', 'promtool'],
        'i/o yavaş': ['iotop', 'iostat'],
        'script kontrol': ['shellcheck'],
        'aws': ['aws'],
        'bulut': ['aws', 'gcloud', 'az'],
    });

    // kategorileri yenile + aliases
    window.CMD_CATEGORIES = ['Tümü', ...Array.from(new Set((window.COMMANDS || []).map(c => c.cat)))];
    const byCmd = {};
    Object.entries(window.SEARCH_PHRASES || {}).forEach(([phrase, cmds]) => {
        (cmds || []).forEach(cmd => {
            if (!byCmd[cmd]) byCmd[cmd] = [];
            byCmd[cmd].push(phrase);
        });
    });
    (window.COMMANDS || []).forEach(c => {
        const extraA = byCmd[c.cmd] || [];
        c.aliases = Array.from(new Set([...(c.aliases || []), ...extraA, c.tr]));
    });
})();
