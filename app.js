/* Linux Omnibus — uygulama motoru */
(function () {
    const READ_KEY = 'linux-omnibus-read';
    const THEME_KEY = 'linux-omnibus-theme';
    const TRACK_KEY = 'linux-omnibus-track';
    const INTERVIEW_KNOWN_KEY = 'linux-omnibus-interview-known';
    const QUIZ_KEY = 'linux-omnibus-quiz';
    const EXPORT_KEYS = [READ_KEY, THEME_KEY, TRACK_KEY, INTERVIEW_KNOWN_KEY, QUIZ_KEY];
    const LEGACY_KEYS = {
        [READ_KEY]: 'linux-bible-read',
        [THEME_KEY]: 'linux-bible-theme',
        [TRACK_KEY]: 'linux-bible-track',
        [INTERVIEW_KNOWN_KEY]: 'linux-bible-interview-known'
    };
    const SPECIAL_ROUTES = ['encyclopedia', 'kali', 'roadmap', 'tracks', 'interview'];
    const DEFAULT_TITLE = 'Linux Omnibus - Linux|DevOps|Siber Güvenlik Eğitimi';
    const DEFAULT_DESC = 'Ücretsiz Türkçe Linux müfredatı: terminalden Docker, Kubernetes, CI/CD, Ansible ve hardening’e. DevOps, SRE ve güvenlik kariyerine job-ready hazırlık — 35 bölüm, quiz ve mülakat.';
    const CANONICAL_ORIGIN = 'https://linuxomnibus.burakkutlu.com';
    const ROUTE_RE = /^(tracks|roadmap|encyclopedia|kali|interview|ch\d+)$/i;
    const LAZY_SCRIPTS = {
        encyclopedia: ['encyclopedia.js', 'encyclopedia-more.js', 'encyclopedia-devops.js'],
        kali: ['kali-arsenal.js', 'kali-deep.js'],
        interview: ['interview.js']
    };
    const PAGE_SEO = {
        tracks: {
            title: 'Hedef Yollar: DevOps, SRE, Linux Müfredatı | Omnibus',
            description: 'DevOps, SRE, SOC ve Red Team için Türkçe Linux hedef yolları: haftalık ders planı, kimler için, bölüm sayısı, mülakat hazırlığı. 9 kariyer yolunda job-ready müfredat.'
        },
        roadmap: {
            title: 'Tüm Müfredat — 35 Bölüm Linux Yol Haritası | Omnibus',
            description: 'Sıfırdan terminalden Docker, Kubernetes, CI/CD, Ansible, hardening ve Kali’ye: 35 bölümlük Türkçe Linux müfredat haritası, ders ilerlemesi ve bölüm bazlı okundu takibi.'
        },
        encyclopedia: {
            title: 'Komut Ansiklopedisi — Linux DevOps | Omnibus',
            description: 'Türkçe Linux komut ansiklopedisi: terminal, dosya, süreç, ağ, Docker, Kubernetes ve Ansible araçları. ~570 komut, örnek kullanım, TR karşılık ve kısa ipuçları.'
        },
        kali: {
            title: 'Kali Arsenal — Penetrasyon Test Araçları | Omnibus',
            description: 'Kali Linux araç kataloğu ve derin eğitim: Nmap, Burp Suite, Metasploit, Wireshark, SQLmap ve resmi kali-tools metapaketleri. Lab ortamı için Türkçe rehber.'
        },
        interview: {
            title: 'Mülakat — Linux DevOps Güvenlik Soruları | Omnibus',
            description: 'Linux, DevOps, Docker, Kubernetes ve siber güvenlik mülakat soruları. Kariyer yoluna göre filtre, seviye seçimi ve Türkçe antrenman modu ile mülakat hazırlığı.'
        }
    };

    function storageGet(key) {
        try {
            let v = localStorage.getItem(key);
            if (v != null) return v;
            const legacy = LEGACY_KEYS[key];
            if (!legacy) return null;
            v = localStorage.getItem(legacy);
            if (v != null) {
                localStorage.setItem(key, v);
                return v;
            }
            return null;
        } catch { return null; }
    }
    function storageSet(key, value) {
        try { localStorage.setItem(key, value); } catch { /* ignore */ }
    }
    function storageRemove(key) {
        try { localStorage.removeItem(key); } catch { /* ignore */ }
    }

    const state = {
        chapterId: null,
        level: 'baslangic',
        query: '',
        trackId: null,
        interview: {
            track: 'auto',
            level: 'all',
            source: 'all',
            mode: 'practice',
            order: [],
            idx: 0,
            revealed: false
        }
    };

    function $(sel, root) { return (root || document).querySelector(sel); }
    function $all(sel, root) { return [...(root || document).querySelectorAll(sel)]; }

    function getTrackId() {
        if (state.trackId) return state.trackId;
        return storageGet(TRACK_KEY) || null;
    }
    function setTrackId(id) {
        state.trackId = id || null;
        if (id) storageSet(TRACK_KEY, id);
        else storageRemove(TRACK_KEY);
    }
    function currentTrack() {
        const id = getTrackId();
        return id && window.TRACK_BY_ID ? window.TRACK_BY_ID[id] : null;
    }
    function trackChapterIds(track) {
        if (!track) return null;
        const ids = [];
        (track.phases || []).forEach(p => (p.chapters || []).forEach(id => {
            if (!ids.includes(id)) ids.push(id);
        }));
        return ids;
    }
    function trackLessonIds(track) {
        const chIds = trackChapterIds(track) || [];
        const ids = [];
        chIds.forEach(cid => {
            const ch = (window.BIBLE || []).find(c => c.id === cid);
            if (!ch) return;
            ['baslangic', 'orta', 'ileri'].forEach(lv => {
                (ch.levels[lv] || []).forEach(l => ids.push(l.id));
            });
        });
        (track.kaliDeep || []).forEach(kid => ids.push('kali-deep:' + kid));
        return ids;
    }

    function getRead() {
        try { return new Set(JSON.parse(storageGet(READ_KEY) || '[]')); }
        catch { return new Set(); }
    }
    function saveRead(set) {
        storageSet(READ_KEY, JSON.stringify([...set]));
        updateProgress();
    }
    function markRead(lessonId) {
        const s = getRead();
        s.add(lessonId);
        saveRead(s);
    }

    function getQuizScores() {
        try { return JSON.parse(storageGet(QUIZ_KEY) || '{}'); }
        catch { return {}; }
    }
    function saveQuizScore(lessonId, payload) {
        const all = getQuizScores();
        all[lessonId] = payload;
        storageSet(QUIZ_KEY, JSON.stringify(all));
    }

    function exportProgress() {
        const data = {};
        EXPORT_KEYS.forEach(k => {
            const v = storageGet(k);
            if (v != null) data[k] = v;
        });
        return {
            version: 1,
            app: 'linux-omnibus',
            exportedAt: new Date().toISOString(),
            data
        };
    }

    function importProgress(payload) {
        if (!payload || typeof payload !== 'object') throw new Error('Geçersiz dosya');
        const data = payload.data && typeof payload.data === 'object' ? payload.data : payload;
        let n = 0;
        EXPORT_KEYS.forEach(k => {
            if (data[k] == null) return;
            storageSet(k, typeof data[k] === 'string' ? data[k] : JSON.stringify(data[k]));
            n++;
        });
        if (!n) throw new Error('İçe aktarılacak veri yok');
        state.trackId = getTrackId();
        const theme = storageGet(THEME_KEY);
        if (theme === 'light' || theme === 'dark') applyTheme(theme === 'light');
        renderSidebar();
        updateProgress();
        applyRouteFromHash();
        return n;
    }

    function setupExportImport() {
        $('#export-progress')?.addEventListener('click', () => {
            const blob = new Blob([JSON.stringify(exportProgress(), null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'linux-omnibus-progress.json';
            a.click();
            URL.revokeObjectURL(a.href);
        });
        $('#import-progress')?.addEventListener('click', () => $('#import-progress-file')?.click());
        $('#import-progress-file')?.addEventListener('change', async (e) => {
            const file = e.target.files && e.target.files[0];
            e.target.value = '';
            if (!file) return;
            try {
                const text = await file.text();
                const n = importProgress(JSON.parse(text));
                alert('İçe aktarıldı: ' + n + ' alan. İlerleme, tema, yol, mülakat ve quiz skorları güncellendi.');
            } catch (err) {
                alert('İçe aktarma başarısız: ' + (err && err.message ? err.message : 'bilinmeyen hata'));
            }
        });
    }

    function allLessonIds() {
        const track = currentTrack();
        if (track) return trackLessonIds(track);
        const ids = [];
        (window.BIBLE || []).forEach(ch => {
            ['baslangic', 'orta', 'ileri'].forEach(lv => {
                (ch.levels[lv] || []).forEach(l => ids.push(l.id));
            });
        });
        (window.KALI_DEEP || []).forEach(m => ids.push('kali-deep:' + m.id));
        return ids;
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const abs = src.startsWith('/') || src.startsWith('http') ? src : (appMountPath().replace(/\/?$/, '/') + src);
            if (document.querySelector(`script[src="${abs}"]`) || document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const el = document.createElement('script');
            el.src = abs;
            el.defer = true;
            el.onload = () => resolve();
            el.onerror = () => reject(new Error('Script yüklenemedi: ' + abs));
            document.body.appendChild(el);
        });
    }

    async function ensureRouteScripts(routeId) {
        const bundle = LAZY_SCRIPTS[routeId];
        if (!bundle) return;
        await Promise.all(bundle.map(loadScript));
    }

    function chapterSeo(ch) {
        const base = `${ch.num}. ${ch.title} — Türkçe Linux DevOps Dersi | Omnibus`;
        return {
            title: base.length <= 60 ? base : `${ch.num}. ${ch.title} — Linux Omnibus Dersi`.slice(0, 60),
            description: (plainText(ch.intro || '') || `${ch.title} — Linux Omnibus Türkçe dersi, quiz ve mülakat köşesi.`).slice(0, 160)
        };
    }

    function updateProgress() {
        const all = allLessonIds();
        const read = getRead();
        const n = all.filter(id => read.has(id)).length;
        const pct = all.length ? Math.round((n / all.length) * 100) : 0;
        const fill = $('#progress-fill');
        const label = $('#progress-label');
        const total = $('#progress-total');
        if (fill) {
            fill.value = pct;
            fill.setAttribute('aria-valuenow', String(pct));
        }
        if (label) label.textContent = n;
        if (total) total.textContent = all.length;
        const trackLabel = $('#track-label');
        if (trackLabel) {
            const t = currentTrack();
            trackLabel.textContent = t ? ('Yol: ' + t.short) : 'Tüm müfredat';
        }
    }

    const GROUP_LABELS = {
        temel: 'Temel',
        sistem: 'Sistem & Ağ',
        devops: 'DevOps & Bulut',
        guvenlik: 'Güvenlik & SOC',
        ops: 'Operasyon'
    };

    function chapterGroup(ch) {
        if (ch.group) return ch.group;
        const id = ch.id;
        if (['ch0','ch1','ch2'].includes(id)) return 'temel';
        if (['ch9','ch19','ch20','ch21','ch30','ch31','ch34'].includes(id)) return 'guvenlik';
        if (['ch11','ch22','ch32'].includes(id)) return 'ops';
        if (['ch15','ch16','ch17','ch18','ch23','ch24','ch25'].includes(id)) return 'devops';
        return 'sistem';
    }

    const TRACK_COLORS = {
        cyan: 'text-term-cyan border-term-cyan/30 bg-term-cyan/10',
        amber: 'text-term-amber border-term-amber/30 bg-term-amber/10',
        red: 'text-term-red border-term-red/30 bg-term-red/10',
        green: 'text-term-green border-term-green/30 bg-term-green/10'
    };

    function renderSidebar() {
        const nav = $('#sidebar-nav');
        if (!nav || !window.BIBLE) return;
        const track = currentTrack();
        const activeNav = state.chapterId;
        let chapters = '';

        if (track) {
            chapters += `<div class="px-5 mb-2">
                <div class="rounded-lg border ${TRACK_COLORS[track.color] || TRACK_COLORS.cyan} px-3 py-2">
                    <p class="text-[10px] uppercase tracking-widest opacity-80">Aktif yol</p>
                    <p class="text-xs font-semibold mt-0.5">${track.title}</p>
                    <button type="button" id="clear-track" class="text-[10px] mt-1.5 underline opacity-80 hover:opacity-100">Tüm müfredata dön</button>
                </div>
            </div>`;
            (track.phases || []).forEach((phase, pi) => {
                chapters += `<div class="px-5 mt-3 mb-1.5 text-[10px] font-semibold text-[var(--muted)] uppercase tracking-widest">${pi + 1}. ${phase.title}</div>`;
                (phase.chapters || []).forEach(cid => {
                    const ch = window.BIBLE.find(c => c.id === cid);
                    if (!ch) return;
                    chapters += `
                    <button type="button" data-nav="${ch.id}" class="nav-btn w-full text-left px-5 py-2.5 text-xs flex gap-2.5 items-start text-[var(--muted)] hover:bg-white/5">
                        <span class="font-mono text-term-cyan/80 w-6 shrink-0">${ch.num}</span>
                        <span>
                            <span class="block leading-snug">${ch.title}</span>
                            <span class="block text-[10px] opacity-70 mt-0.5">${ch.subtitle || ''}</span>
                        </span>
                    </button>`;
                });
            });
            if (track.kaliDeep && track.kaliDeep.length) {
                chapters += `<div class="px-5 mt-3 mb-1.5 text-[10px] font-semibold text-term-red uppercase tracking-widest">Kali derin</div>
                <button type="button" data-nav="kali" class="nav-btn w-full text-left px-5 py-2.5 text-xs flex gap-2.5 items-start text-[var(--muted)] hover:bg-white/5">
                    <span class="font-mono text-term-red w-6 shrink-0">K</span>
                    <span><span class="block leading-snug">Önerilen araçlar (${track.kaliDeep.length})</span>
                    <span class="block text-[10px] opacity-70 mt-0.5">Derin eğitim sekmesi</span></span>
                </button>`;
            }
        } else {
            const order = ['temel', 'sistem', 'devops', 'guvenlik', 'ops'];
            const byGroup = {};
            window.BIBLE.forEach(ch => {
                const g = chapterGroup(ch);
                (byGroup[g] || (byGroup[g] = [])).push(ch);
            });
            order.forEach(g => {
                const list = byGroup[g];
                if (!list || !list.length) return;
                chapters += `<div class="px-5 mt-3 mb-1.5 text-[10px] font-semibold text-[var(--muted)] uppercase tracking-widest">${GROUP_LABELS[g] || g}</div>`;
                chapters += list.map(ch => `
                <button type="button" data-nav="${ch.id}" class="nav-btn w-full text-left px-5 py-2.5 text-xs flex gap-2.5 items-start text-[var(--muted)] hover:bg-white/5">
                    <span class="font-mono text-term-cyan/80 w-6 shrink-0">${ch.num}</span>
                    <span>
                        <span class="block leading-snug">${ch.title}</span>
                        <span class="block text-[10px] opacity-70 mt-0.5">${ch.subtitle || ''}</span>
                    </span>
                </button>`).join('');
            });
        }

        const encycl = `
            <div class="px-5 mt-4 mb-2 text-[10px] font-semibold text-[var(--muted)] uppercase tracking-widest">Referans</div>
            <button type="button" data-nav="tracks" class="nav-btn w-full text-left px-5 py-2.5 text-xs flex gap-2.5 items-start text-[var(--muted)] hover:bg-white/5">
                <span class="font-mono text-term-green w-6 shrink-0">◎</span>
                <span>
                    <span class="block leading-snug">Hedef Yollar</span>
                    <span class="block text-[10px] opacity-70 mt-0.5">DevOps · SOC · RHEL · Red Team…</span>
                </span>
            </button>
            <button type="button" data-nav="interview" class="nav-btn w-full text-left px-5 py-2.5 text-xs flex gap-2.5 items-start text-[var(--muted)] hover:bg-white/5">
                <span class="font-mono text-term-amber w-6 shrink-0">?</span>
                <span>
                    <span class="block leading-snug">Mülakat Antrenmanı</span>
                    <span class="block text-[10px] opacity-70 mt-0.5">Rol bazlı soru · kart pratik</span>
                </span>
            </button>
            <button type="button" data-nav="roadmap" class="nav-btn w-full text-left px-5 py-2.5 text-xs flex gap-2.5 items-start text-[var(--muted)] hover:bg-white/5">
                <span class="font-mono text-term-cyan w-6 shrink-0">#</span>
                <span>
                    <span class="block leading-snug">Tüm Müfredat</span>
                    <span class="block text-[10px] opacity-70 mt-0.5">Konu haritası</span>
                </span>
            </button>
            <button type="button" data-nav="encyclopedia" class="nav-btn w-full text-left px-5 py-2.5 text-xs flex gap-2.5 items-start text-[var(--muted)] hover:bg-white/5">
                <span class="font-mono text-term-amber w-6 shrink-0">⌘</span>
                <span>
                    <span class="block leading-snug">Komut Ansiklopedisi</span>
                    <span class="block text-[10px] opacity-70 mt-0.5">Köken · TR karşılık · örnek</span>
                </span>
            </button>
            <button type="button" data-nav="kali" class="nav-btn w-full text-left px-5 py-2.5 text-xs flex gap-2.5 items-start text-[var(--muted)] hover:bg-white/5">
                <span class="font-mono text-term-red w-6 shrink-0">K</span>
                <span>
                    <span class="block leading-snug">Kali Arsenal</span>
                    <span class="block text-[10px] opacity-70 mt-0.5">Derin eğitim · tam katalog</span>
                </span>
            </button>`;
        nav.innerHTML = chapters + encycl;
        nav.querySelectorAll('[data-nav]').forEach(btn => {
            btn.addEventListener('click', () => navTo(btn.dataset.nav));
            btn.classList.toggle('nav-item-active', btn.dataset.nav === activeNav);
        });
        $('#clear-track')?.addEventListener('click', e => {
            e.stopPropagation();
            setTrackId(null);
            renderSidebar();
            updateProgress();
            navTo('tracks');
        });
    }

    /** Uygulama kök yolu (/ veya /repo/); bilinen rota segmenti çıkarılır */
    function appMountPath() {
        try {
            const u = new URL(location.href);
            if (u.protocol !== 'http:' && u.protocol !== 'https:') return '/';
            let path = u.pathname.replace(/\/index\.html$/i, '/');
            path = path.replace(/\/(tracks|roadmap|encyclopedia|kali|interview|ch\d+)\/?$/i, '/');
            if (!path.endsWith('/')) {
                const i = path.lastIndexOf('/');
                path = i >= 0 ? path.slice(0, i + 1) : '/';
            }
            return path || '/';
        } catch { /* ignore */ }
        return '/';
    }

    function siteBaseUrl() {
        try {
            const u = new URL(location.href);
            if (u.protocol === 'http:' || u.protocol === 'https:') {
                return u.origin + appMountPath();
            }
        } catch { /* ignore */ }
        return CANONICAL_ORIGIN + '/';
    }

    function hrefFor(id, level) {
        const mount = appMountPath();
        let path = mount + encodeURIComponent(id);
        if (level && level !== 'baslangic' && !SPECIAL_ROUTES.includes(id)) {
            path += '?level=' + encodeURIComponent(level);
        }
        return path;
    }

    function plainText(html) {
        const d = document.createElement('div');
        d.innerHTML = html || '';
        return (d.textContent || '').replace(/\s+/g, ' ').trim();
    }

    function setMetaContent(selector, value, attr) {
        const el = document.querySelector(selector);
        if (el) el.setAttribute(attr || 'content', value);
    }

    function updateDocumentMeta(pageId, chapter, fallbackDesc) {
        let fullTitle = DEFAULT_TITLE;
        let desc = fallbackDesc || DEFAULT_DESC;
        if (PAGE_SEO[pageId]) {
            fullTitle = PAGE_SEO[pageId].title;
            desc = PAGE_SEO[pageId].description;
        } else if (chapter) {
            const seo = chapterSeo(chapter);
            fullTitle = seo.title;
            desc = seo.description;
        }
        desc = desc.slice(0, 160);
        document.title = fullTitle;
        setMetaContent('meta[name="description"]', desc);
        setMetaContent('meta[property="og:title"]', fullTitle);
        setMetaContent('meta[property="og:description"]', desc);
        setMetaContent('meta[name="twitter:title"]', fullTitle);
        setMetaContent('meta[name="twitter:description"]', desc);

        const base = siteBaseUrl();
        let canonical = base.replace(/\/?$/, '/');
        if (pageId) {
            canonical = base.replace(/\/?$/, '/') + pageId;
            if (state.level && state.level !== 'baslangic' && !SPECIAL_ROUTES.includes(pageId)) {
                canonical += '?level=' + encodeURIComponent(state.level);
            }
        }
        setMetaContent('link[rel="canonical"]', canonical, 'href');
        setMetaContent('meta[property="og:url"]', canonical);
    }

    function injectCourseSyllabus() {
        if (!window.BIBLE || !window.BIBLE.length) return;
        if (document.getElementById('omnibus-syllabus-ld')) return;
        const base = CANONICAL_ORIGIN + '/';
        const data = {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Linux Omnibus müfredat bölümleri',
            numberOfItems: window.BIBLE.length,
            itemListElement: window.BIBLE.map((ch, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                item: {
                    '@type': 'Course',
                    name: `${ch.num}. ${ch.title}`,
                    description: plainText(ch.intro || '').slice(0, 200),
                    url: `${base}${encodeURIComponent(ch.id)}`,
                    isAccessibleForFree: true,
                    inLanguage: 'tr'
                }
            }))
        };
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.id = 'omnibus-syllabus-ld';
        s.textContent = JSON.stringify(data);
        document.head.appendChild(s);
    }

    /** Path birincil (/tracks); ?p= ve #hash eski yer imleri için okunur */
    function setHash(id, level) {
        const url = new URL(location.href);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            url.searchParams.set('p', id);
            if (level && level !== 'baslangic' && !SPECIAL_ROUTES.includes(id)) {
                url.searchParams.set('level', level);
            } else {
                url.searchParams.delete('level');
            }
            const parts = [id];
            if (level && level !== 'baslangic' && !SPECIAL_ROUTES.includes(id)) parts.push(level);
            url.hash = parts.join('/');
            const next = url.pathname + url.search + url.hash;
            const cur = location.pathname + location.search + location.hash;
            if (cur !== next) history.replaceState(null, '', next);
            return;
        }
        const mount = appMountPath();
        url.pathname = (mount.replace(/\/?$/, '/') + id).replace(/\/+/g, '/');
        url.searchParams.delete('p');
        if (level && level !== 'baslangic' && !SPECIAL_ROUTES.includes(id)) {
            url.searchParams.set('level', level);
        } else {
            url.searchParams.delete('level');
        }
        url.hash = '';
        const next = url.pathname + url.search;
        const cur = location.pathname + location.search;
        if (cur !== next) history.replaceState(null, '', next);
    }

    function parseHash() {
        const params = new URLSearchParams(location.search);
        let id = null;
        let level = params.get('level') || undefined;

        const mount = appMountPath();
        let path = location.pathname;
        if (mount !== '/' && path.toLowerCase().startsWith(mount.toLowerCase())) {
            path = path.slice(mount.length - 1);
        }
        const seg = path.replace(/^\/+|\/+$/g, '').split('/')[0] || '';
        if (seg && ROUTE_RE.test(seg)) id = seg;

        if (!id) id = params.get('p');
        if (!id) {
            const raw = (location.hash || '').replace(/^#/, '').trim();
            if (raw) {
                const parts = raw.split('/');
                id = parts[0];
                if (!level) level = parts[1];
            }
        }
        return id ? { id, level } : null;
    }

    async function navTo(id, opts) {
        opts = opts || {};
        await ensureRouteScripts(id);
        state.chapterId = id;
        if (opts.level) state.level = opts.level;
        else if (!opts.keepLevel) state.level = 'baslangic';
        if (!opts.keepQuery) {
            state.cmdCat = 'Tümü';
            state.kaliCat = 'all';
        }
        $all('.nav-btn').forEach(b => b.classList.toggle('nav-item-active', b.dataset.nav === id));

        let metaChapter = null;

        if (id === 'encyclopedia') {
            $('#current-section-title').textContent = 'Komut Ansiklopedisi';
            renderEncyclopedia(opts.query);
        } else if (id === 'kali') {
            $('#current-section-title').textContent = 'Kali Arsenal';
            renderKaliArsenal(opts.query);
        } else if (id === 'roadmap') {
            $('#current-section-title').textContent = 'Tüm Müfredat';
            renderRoadmap();
        } else if (id === 'tracks') {
            $('#current-section-title').textContent = 'Hedef Yollar';
            renderTracks();
        } else if (id === 'interview') {
            $('#current-section-title').textContent = 'Mülakat Antrenmanı';
            renderInterview();
        } else {
            const ch = window.BIBLE.find(c => c.id === id);
            if (ch) {
                $('#current-section-title').textContent = `${ch.num}. ${ch.title}`;
                metaChapter = ch;
            }
            renderChapter();
        }

        if (!opts.skipHash) setHash(id, state.level);
        updateDocumentMeta(id, metaChapter);
        window.OmnibusAnalytics?.trackPage?.();
        if (!opts.skipScroll) $('main')?.scrollTo({ top: 0, behavior: opts.instant ? 'auto' : 'smooth' });
        closeMobile();
    }

    function levelLabel(lv) {
        return { baslangic: 'Başlangıç', orta: 'Orta', ileri: 'İleri' }[lv] || lv;
    }

    function renderLesson(lesson, level) {
        const read = getRead().has(lesson.id);
        const steps = (lesson.steps || []).map((s, i) => `
            <li class="flex gap-3 mb-3">
                <span class="step-num">${i + 1}</span>
                <div class="prose-book text-[0.95rem] flex-1">${s}</div>
            </li>
        `).join('');

        const cmds = (lesson.commands || []).map(c => {
            const cmdText = typeof c === 'string' ? c : c.cmd;
            const note = typeof c === 'string' ? '' : (c.note || '');
            return `<div class="mb-2 group/cmd relative pr-8">
                <div><span class="text-gray-500">$</span> <span class="cmd-text">${escapeHtml(cmdText)}</span></div>
                ${note ? `<div class="text-gray-500 text-[10px] mt-0.5 pl-3">${escapeHtml(note)}</div>` : ''}
                <button type="button" class="copy-cmd absolute right-0 top-0 text-[10px] text-gray-500 hover:text-term-cyan px-1.5 py-0.5 rounded border border-transparent hover:border-card-border" data-copy="${escapeAttr(cmdText)}" title="Kopyala">⎘</button>
            </div>`;
        }).join('');

        const mistakes = (lesson.mistakes || []).map(m => `<li class="mb-1.5">${m}</li>`).join('');
        const interview = (lesson.interview || []).map(q => `
            <div class="depth-card rounded-lg overflow-hidden mb-2">
                <button type="button" class="acc-toggle w-full flex justify-between items-center p-3.5 text-left text-xs font-semibold">
                    <span>${q.q}</span>
                    <svg class="icon icon-sm icon-chevron text-[var(--muted)]" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.7 8.7a1 1 0 0 1 1.4 0L12 12.6l3.9-3.9a1 1 0 1 1 1.4 1.4l-4.6 4.6a1 1 0 0 1-1.4 0L6.7 10.1a1 1 0 0 1 0-1.4z"/></svg>
                </button>
                <div class="acc-body px-3.5 pb-3.5 text-xs text-[var(--muted)] border-t border-card-border leading-relaxed">${q.a}</div>
            </div>
        `).join('');

        return `
        <article class="topic-card depth-card rounded-lg p-5 sm:p-7 mb-6 border-l-[3px] ${level === 'baslangic' ? 'border-term-cyan' : level === 'orta' ? 'border-term-amber' : 'border-term-red'}"
                 data-cmd="${escapeAttr(lesson.search || '')}" data-tags="${escapeAttr(lesson.tags || '')}" data-lesson="${lesson.id}">
            <div class="flex flex-wrap items-center gap-2 mb-3">
                <span class="tag-badge ${level === 'baslangic' ? 'bg-term-cyan/10 text-term-cyan border border-term-cyan/25' : level === 'orta' ? 'bg-term-amber/10 text-term-amber border border-term-amber/25' : 'bg-term-red/10 text-term-red border border-term-red/25'}">${levelLabel(level)}</span>
                ${read ? '<span class="tag-badge bg-term-green/10 text-term-green border border-term-green/25">Okundu</span>' : ''}
            </div>
            <h3 class="text-xl font-semibold text-[var(--text)] tracking-tight mb-3">${lesson.title}</h3>
            ${lesson.hook ? `<p class="text-sm text-term-cyan/90 font-medium mb-4">${lesson.hook}</p>` : ''}

            <div class="prose-book">${(lesson.body || []).map(p => `<p>${p}</p>`).join('')}</div>

            ${(lesson.callouts || []).map(c => `
                <div class="callout ${c.type || ''}">
                    <p class="text-xs font-semibold text-[var(--text)] mb-1 font-sans">${c.title}</p>
                    <div class="prose-book text-[0.95rem]">${c.text}</div>
                </div>
            `).join('')}

            ${steps ? `<h4 class="font-sans text-sm font-semibold mt-6 mb-3 text-[var(--text)]">Adım adım</h4><ol class="list-none pl-0">${steps}</ol>` : ''}

            ${cmds ? `
                <h4 class="font-sans text-sm font-semibold mt-6 mb-2 text-[var(--text)]">Terminalde dene</h4>
                <div class="terminal-box p-3.5 rounded font-mono text-[11px] text-gray-300 space-y-1">${cmds}</div>
            ` : ''}

            ${lesson.kernel ? `
                <div class="grid sm:grid-cols-2 gap-3 mt-5">
                    <div class="p-3.5 rounded border border-card-border">
                        <p class="font-sans text-xs font-semibold text-term-amber mb-1.5">Kernel / arkada ne olur?</p>
                        <div class="prose-book text-[0.9rem]">${lesson.kernel}</div>
                    </div>
                    <div class="p-3.5 rounded border border-card-border">
                        <p class="font-sans text-xs font-semibold text-term-green mb-1.5">Gerçek hayatta hangi krizi çözer?</p>
                        <div class="prose-book text-[0.9rem]">${lesson.crisis || '—'}</div>
                    </div>
                </div>
            ` : ''}

            ${mistakes ? `
                <h4 class="font-sans text-sm font-semibold mt-6 mb-2 text-[var(--text)]">Sık yapılan hatalar</h4>
                <ul class="prose-book text-[0.95rem] list-disc pl-5">${mistakes}</ul>
            ` : ''}

            ${lesson.exercise ? `
                <div class="callout ok mt-5">
                    <p class="text-xs font-semibold text-[var(--text)] mb-1 font-sans">Alıştırma</p>
                    <div class="prose-book text-[0.95rem]">${lesson.exercise}</div>
                </div>
            ` : ''}

            ${lesson.widget === 'chmod' ? renderChmodWidget() : ''}
            ${lesson.widget === 'cron' ? renderCronWidget() : ''}
            ${lesson.widget === 'fhs' ? renderFhsWidget() : ''}
            ${lesson.widget === 'cidr' ? renderCidrWidget() : ''}
            ${lesson.widget === 'docker' ? renderDockerWidget() : ''}

            ${renderQuizBlock(lesson)}

            ${interview ? `
                <h4 class="font-sans text-sm font-semibold mt-8 mb-3 text-[var(--text)]">Senior Mülakat Köşesi</h4>
                ${interview}
            ` : ''}

            <div class="mt-6 pt-4 border-t border-card-border flex justify-between items-center">
                <button type="button" class="mark-read text-xs px-3 py-1.5 rounded border border-card-border hover:border-term-cyan text-[var(--muted)]" data-mark="${lesson.id}">
                    ${read ? '✓ Okundu işaretli' : 'Okundu olarak işaretle'}
                </button>
            </div>
        </article>`;
    }

    function renderQuizBlock(lesson) {
        const items = lesson.quiz || [];
        if (!items.length) return '';
        const prev = getQuizScores()[lesson.id];
        const prevLabel = prev
            ? `<span class="tag-badge bg-term-green/10 text-term-green border border-term-green/25">${prev.correct}/${prev.total} son skor</span>`
            : '';
        const qs = items.map((item, qi) => {
            const choices = (item.choices || []).map((c, ci) => `
                <label class="quiz-choice flex gap-2 items-start p-2.5 rounded border border-card-border cursor-pointer hover:border-term-cyan/50 text-xs">
                    <input type="radio" class="mt-0.5 shrink-0" name="quiz-${escapeAttr(lesson.id)}-${qi}" value="${ci}">
                    <span>${escapeHtml(c)}</span>
                </label>
            `).join('');
            return `
            <div class="quiz-item mb-4" data-qi="${qi}" data-answer="${item.answer}" data-explain="${escapeAttr(item.explain || '')}">
                <p class="text-xs font-semibold text-[var(--text)] mb-2 font-sans">${qi + 1}. ${escapeHtml(item.q)}</p>
                <div class="space-y-1.5">${choices}</div>
                <p class="quiz-feedback hidden mt-2 text-xs leading-relaxed"></p>
            </div>`;
        }).join('');
        return `
        <div class="quiz-block mt-8 p-4 rounded border border-card-border" data-quiz-lesson="${escapeAttr(lesson.id)}" data-quiz-total="${items.length}">
            <div class="flex flex-wrap items-center gap-2 mb-3">
                <h4 class="font-sans text-sm font-semibold text-[var(--text)]">Mini Quiz</h4>
                ${prevLabel}
            </div>
            <p class="text-xs text-[var(--muted)] mb-4">Okuduklarını pekiştir — cevapları seçip kontrol et.</p>
            ${qs}
            <div class="flex flex-wrap gap-2 items-center mt-2">
                <button type="button" class="quiz-check text-xs px-3 py-1.5 rounded border border-term-cyan/40 text-term-cyan hover:bg-term-cyan/10 font-semibold">Cevapları kontrol et</button>
                <button type="button" class="quiz-reset text-xs px-3 py-1.5 rounded border border-card-border text-[var(--muted)]">Sıfırla</button>
                <span class="quiz-score text-xs text-[var(--muted)]"></span>
            </div>
        </div>`;
    }

    function renderChmodWidget() {
        return `
        <div class="mt-6 p-4 rounded border border-card-border bg-[var(--term-bg)]">
            <h4 class="font-sans text-sm font-semibold mb-1">Canlı Yetki Hesaplayıcı</h4>
            <p class="text-xs text-[var(--muted)] mb-4">755 yazın veya kutuları işaretleyin → <code class="text-term-cyan">rwxr-xr-x</code></p>
            <div class="flex flex-wrap gap-4 items-end mb-4">
                <label class="text-xs"><span class="text-[var(--muted)]">Oktal</span>
                    <input id="octal-input" type="text" value="0755" maxlength="4"
                           class="mt-1 block w-24 bg-card-dark border border-card-border rounded px-2 py-1.5 font-mono text-term-cyan outline-none focus:border-term-cyan">
                </label>
                <div class="font-mono text-xs space-y-1">
                    <div>Sembolik: <span id="lab-sym" class="text-term-green">-rwxr-xr-x</span></div>
                    <div>Oktal: <span id="lab-oct" class="text-term-cyan">0755</span></div>
                    <div>Bitwise: <span id="lab-bin" class="text-term-amber text-[10px]">000 111 101 101</span></div>
                    <code id="lab-cmd" class="text-term-green block">chmod 0755 script.sh</code>
                </div>
            </div>
            <div class="table-scroll">
            <table class="w-full text-xs font-mono">
                <thead><tr class="text-[var(--muted)] text-left"><th class="py-2">Bit</th><th>User</th><th>Group</th><th>Other</th><th>Özel</th></tr></thead>
                <tbody>
                    <tr><td class="py-1.5 text-[var(--muted)]">r (4)</td>
                        <td><input type="checkbox" data-p="u4" checked></td><td><input type="checkbox" data-p="g4" checked></td><td><input type="checkbox" data-p="o4" checked></td>
                        <td><label class="flex gap-1 items-center"><input type="checkbox" data-p="suid"> SUID</label></td></tr>
                    <tr><td class="py-1.5 text-[var(--muted)]">w (2)</td>
                        <td><input type="checkbox" data-p="u2" checked></td><td><input type="checkbox" data-p="g2"></td><td><input type="checkbox" data-p="o2"></td>
                        <td><label class="flex gap-1 items-center"><input type="checkbox" data-p="sgid"> SGID</label></td></tr>
                    <tr><td class="py-1.5 text-[var(--muted)]">x (1)</td>
                        <td><input type="checkbox" data-p="u1" checked></td><td><input type="checkbox" data-p="g1" checked></td><td><input type="checkbox" data-p="o1" checked></td>
                        <td><label class="flex gap-1 items-center"><input type="checkbox" data-p="sticky"> Sticky</label></td></tr>
                </tbody>
            </table>
            </div>
        </div>`;
    }

    function renderCronWidget() {
        return `
        <div class="mt-6 p-4 rounded border border-card-border">
            <h4 class="font-sans text-sm font-semibold mb-3">Cron Builder</h4>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <label>Dakika<select id="cron-min" class="cron-field mt-1 w-full bg-[var(--term-bg)] border border-card-border rounded px-2 py-1.5 font-mono"></select></label>
                <label>Saat<select id="cron-hour" class="cron-field mt-1 w-full bg-[var(--term-bg)] border border-card-border rounded px-2 py-1.5 font-mono"></select></label>
                <label>Gün<select id="cron-dom" class="cron-field mt-1 w-full bg-[var(--term-bg)] border border-card-border rounded px-2 py-1.5 font-mono"></select></label>
                <label>Ay<select id="cron-mon" class="cron-field mt-1 w-full bg-[var(--term-bg)] border border-card-border rounded px-2 py-1.5 font-mono"></select></label>
                <label>Hafta<select id="cron-dow" class="cron-field mt-1 w-full bg-[var(--term-bg)] border border-card-border rounded px-2 py-1.5 font-mono"></select></label>
            </div>
            <div class="terminal-box p-3 rounded mt-3 font-mono text-[11px]">
                <span id="cron-expr" class="text-term-cyan">15 2 * * *</span>
                <span class="text-gray-500"> /usr/local/bin/backup.sh</span>
                <p id="cron-human" class="text-gray-400 mt-2 font-sans text-[11px]"></p>
            </div>
        </div>`;
    }

    function renderFhsWidget() {
        return `
        <div class="mt-6 p-4 rounded border border-card-border">
            <h4 class="font-sans text-sm font-semibold mb-3">İnteraktif FHS Haritası</h4>
            <div class="grid grid-cols-3 sm:grid-cols-4 gap-2" id="fhs-grid"></div>
            <div id="fhs-detail" class="terminal-box p-3 rounded mt-3 text-xs text-gray-300">Bir dizin seçin…</div>
        </div>`;
    }

    function renderCidrWidget() {
        return `
        <div class="mt-6 p-4 rounded border border-card-border bg-[var(--term-bg)] cidr-widget">
            <h4 class="font-sans text-sm font-semibold mb-1">CIDR Hesaplayıcı</h4>
            <p class="text-xs text-[var(--muted)] mb-4">Örn. <code class="text-term-cyan">192.168.1.0/24</code> — ağ, broadcast, kullanılabilir host aralığı.</p>
            <label class="text-xs block mb-3"><span class="text-[var(--muted)]">CIDR</span>
                <input type="text" class="cidr-input mt-1 block w-full max-w-xs bg-card-dark border border-card-border rounded px-2 py-1.5 font-mono text-term-cyan outline-none focus:border-term-cyan" value="192.168.1.0/24">
            </label>
            <div class="cidr-out terminal-box p-3 rounded font-mono text-[11px] text-gray-300 space-y-1"></div>
        </div>`;
    }

    function renderDockerWidget() {
        return `
        <div class="mt-6 p-4 rounded border border-card-border docker-widget">
            <h4 class="font-sans text-sm font-semibold mb-1">docker run Builder</h4>
            <p class="text-xs text-[var(--muted)] mb-4">Bayrakları seç → kopyalanabilir komut üret.</p>
            <div class="grid sm:grid-cols-2 gap-3 text-xs mb-3">
                <label>İmaj
                    <input type="text" class="docker-image mt-1 w-full bg-[var(--term-bg)] border border-card-border rounded px-2 py-1.5 font-mono" value="nginx:alpine">
                </label>
                <label>Konteyner adı
                    <input type="text" class="docker-name mt-1 w-full bg-[var(--term-bg)] border border-card-border rounded px-2 py-1.5 font-mono" value="web">
                </label>
                <label>Host port
                    <input type="text" class="docker-host-port mt-1 w-full bg-[var(--term-bg)] border border-card-border rounded px-2 py-1.5 font-mono" value="8080">
                </label>
                <label>Konteyner port
                    <input type="text" class="docker-ctr-port mt-1 w-full bg-[var(--term-bg)] border border-card-border rounded px-2 py-1.5 font-mono" value="80">
                </label>
            </div>
            <div class="flex flex-wrap gap-3 text-xs mb-3">
                <label class="flex gap-1.5 items-center"><input type="checkbox" class="docker-detach" checked> -d (arka plan)</label>
                <label class="flex gap-1.5 items-center"><input type="checkbox" class="docker-rm" checked> --rm</label>
                <label class="flex gap-1.5 items-center"><input type="checkbox" class="docker-port" checked> -p port map</label>
            </div>
            <div class="terminal-box p-3 rounded font-mono text-[11px] flex justify-between gap-2 items-start">
                <code class="docker-cmd text-term-green break-all">docker run --rm -d -p 8080:80 --name web nginx:alpine</code>
                <button type="button" class="docker-copy shrink-0 text-[10px] text-gray-500 hover:text-term-cyan px-1.5 py-0.5 rounded border border-transparent hover:border-card-border" title="Kopyala">⎘</button>
            </div>
        </div>`;
    }

    function escapeHtml(s) {
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }
    function escapeAttr(s) {
        return String(s).replace(/"/g, '&quot;');
    }

    function renderChapter() {
        const box = $('#content-container');
        const ch = window.BIBLE.find(c => c.id === state.chapterId);
        if (!box || !ch) return;

        const levels = ['baslangic', 'orta', 'ileri'].filter(lv => (ch.levels[lv] || []).length);
        const q = state.query.trim().toLowerCase();

        let html = `
            <header class="mb-8 border-b border-card-border pb-6">
                <span class="tag-badge bg-term-cyan/10 text-term-cyan border border-term-cyan/25">Bölüm ${ch.num}</span>
                <h1 class="text-2xl font-semibold mt-3 text-[var(--text)]">${ch.title}</h1>
                <p class="prose-book mt-3 text-base">${ch.intro}</p>
                ${ch.who ? `<p class="text-xs text-[var(--muted)] mt-3 font-sans">Bu bölüm kimler için: ${ch.who}</p>` : ''}
            </header>
            <div class="flex gap-4 border-b border-card-border mb-6" id="level-tabs">
                ${levels.map(lv => `<button type="button" data-level="${lv}" class="tab-btn pb-2 text-xs text-[var(--muted)] ${lv === state.level ? 'active' : ''}">${levelLabel(lv)}</button>`).join('')}
            </div>
            <div id="search-empty" class="hidden text-center text-[var(--muted)] py-10">Bu bölümde aramayla eşleşen ders yok. Tüm kitapta aramayı deneyin veya filtreyi temizleyin.</div>
            <div id="lessons-root"></div>
            ${ch.chapterInterview ? `
                <section class="mt-10">
                    <h3 class="text-lg font-semibold mb-3">Senior Mülakat Köşesi · Bölüm ${ch.num}</h3>
                    ${ch.chapterInterview.map(q => `
                        <div class="depth-card rounded-lg overflow-hidden mb-2">
                            <button type="button" class="acc-toggle w-full flex justify-between items-center p-4 text-left text-sm font-semibold">
                                <span>${q.q}</span>
                                <svg class="icon icon-sm icon-chevron text-[var(--muted)]" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.7 8.7a1 1 0 0 1 1.4 0L12 12.6l3.9-3.9a1 1 0 1 1 1.4 1.4l-4.6 4.6a1 1 0 0 1-1.4 0L6.7 10.1a1 1 0 0 1 0-1.4z"/></svg>
                            </button>
                            <div class="acc-body px-4 pb-4 text-xs text-[var(--muted)] border-t border-card-border leading-relaxed">${q.a}</div>
                        </div>
                    `).join('')}
                </section>
            ` : ''}
        `;
        box.innerHTML = html;

        $('#level-tabs')?.querySelectorAll('[data-level]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.level = btn.dataset.level;
                setHash(state.chapterId, state.level);
                renderChapter();
            });
        });

        const root = $('#lessons-root');
        let shown = 0;

        if (q) {
            // search across all levels in chapter
            levels.forEach(lv => {
                (ch.levels[lv] || []).forEach(lesson => {
                    const hay = (lesson.title + ' ' + (lesson.search || '') + ' ' + (lesson.tags || '') + ' ' + (lesson.body || []).join(' ')).toLowerCase();
                    if (hay.includes(q)) {
                        root.insertAdjacentHTML('beforeend', renderLesson(lesson, lv));
                        shown++;
                    }
                });
            });
            $('#search-empty')?.classList.toggle('hidden', shown > 0);
        } else {
            const list = ch.levels[state.level] || [];
            list.forEach(lesson => {
                root.insertAdjacentHTML('beforeend', renderLesson(lesson, state.level));
                shown++;
            });
        }

        bindLessonUi();

        const track = currentTrack();
        const orderIds = track ? trackChapterIds(track) : window.BIBLE.map(c => c.id);
        const idx = orderIds.indexOf(ch.id);
        const prev = idx > 0 ? window.BIBLE.find(c => c.id === orderIds[idx - 1]) : null;
        const next = idx >= 0 && idx < orderIds.length - 1 ? window.BIBLE.find(c => c.id === orderIds[idx + 1]) : null;
        box.insertAdjacentHTML('beforeend', `
            <nav class="mt-12 pt-6 border-t border-card-border flex flex-wrap gap-3 justify-between text-xs">
                ${prev ? `<button type="button" class="chap-nav px-3 py-2 rounded border border-card-border hover:border-term-cyan text-[var(--muted)]" data-nav="${prev.id}">← ${prev.num}. ${prev.title}</button>` : '<span></span>'}
                ${next ? `<button type="button" class="chap-nav px-3 py-2 rounded border border-card-border hover:border-term-cyan text-[var(--muted)]" data-nav="${next.id}">${next.num}. ${next.title} →</button>` : '<span></span>'}
            </nav>`);
        $all('.chap-nav', box).forEach(btn => btn.addEventListener('click', () => navTo(btn.dataset.nav)));
    }

    function bindLessonUi() {
        $all('.copy-cmd').forEach(btn => {
            btn.addEventListener('click', async () => {
                const text = btn.dataset.copy || '';
                try {
                    await navigator.clipboard.writeText(text);
                    btn.textContent = '✓';
                    setTimeout(() => { btn.textContent = '⎘'; }, 1200);
                } catch {
                    btn.textContent = '!';
                    setTimeout(() => { btn.textContent = '⎘'; }, 1200);
                }
            });
        });
        $all('.acc-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const body = btn.nextElementSibling;
                body.classList.toggle('open');
                btn.setAttribute('aria-expanded', body.classList.contains('open'));
            });
        });
        $all('[data-mark]').forEach(btn => {
            btn.addEventListener('click', () => {
                markRead(btn.dataset.mark);
                renderChapter();
            });
        });
        bindQuizUi();
        setupPermCalculator();
        setupCronBuilder();
        setupFhsMap();
        setupCidrWidgets();
        setupDockerWidgets();
    }

    function bindQuizUi() {
        $all('.quiz-block').forEach(block => {
            const lessonId = block.dataset.quizLesson;
            const total = +block.dataset.quizTotal || 0;
            const scoreEl = block.querySelector('.quiz-score');
            const check = () => {
                let correct = 0;
                $all('.quiz-item', block).forEach(item => {
                    const answer = +item.dataset.answer;
                    const picked = item.querySelector('input[type=radio]:checked');
                    const fb = item.querySelector('.quiz-feedback');
                    const explain = item.dataset.explain || '';
                    $all('.quiz-choice', item).forEach((lab, i) => {
                        lab.classList.remove('border-term-green', 'border-term-red', 'bg-term-green/10', 'bg-term-red/10');
                        if (i === answer) lab.classList.add('border-term-green', 'bg-term-green/10');
                    });
                    if (!picked) {
                        if (fb) {
                            fb.classList.remove('hidden', 'text-term-green');
                            fb.classList.add('text-term-amber');
                            fb.textContent = 'Bu soruyu cevaplamadın. Doğru seçenek yeşil işaretli.';
                        }
                        return;
                    }
                    const idx = +picked.value;
                    const ok = idx === answer;
                    if (ok) correct++;
                    const wrongLab = picked.closest('.quiz-choice');
                    if (!ok && wrongLab) wrongLab.classList.add('border-term-red', 'bg-term-red/10');
                    if (fb) {
                        fb.classList.remove('hidden');
                        fb.classList.toggle('text-term-green', ok);
                        fb.classList.toggle('text-term-red', !ok);
                        fb.textContent = (ok ? 'Doğru. ' : 'Yanlış. ') + explain;
                    }
                });
                if (scoreEl) scoreEl.textContent = `Skor: ${correct} / ${total}`;
                saveQuizScore(lessonId, { correct, total, at: new Date().toISOString() });
                if (correct === total && total > 0) markRead(lessonId);
            };
            const reset = () => {
                $all('input[type=radio]', block).forEach(r => { r.checked = false; });
                $all('.quiz-choice', block).forEach(lab => {
                    lab.classList.remove('border-term-green', 'border-term-red', 'bg-term-green/10', 'bg-term-red/10');
                });
                $all('.quiz-feedback', block).forEach(fb => {
                    fb.classList.add('hidden');
                    fb.textContent = '';
                });
                if (scoreEl) scoreEl.textContent = '';
            };
            block.querySelector('.quiz-check')?.addEventListener('click', check);
            block.querySelector('.quiz-reset')?.addEventListener('click', reset);
        });
    }

    function ipv4ToInt(parts) {
        return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
    }
    function intToIpv4(n) {
        return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
    }

    function setupCidrWidgets() {
        $all('.cidr-widget').forEach(box => {
            const input = box.querySelector('.cidr-input');
            const out = box.querySelector('.cidr-out');
            if (!input || !out) return;
            const update = () => {
                const raw = (input.value || '').trim();
                const m = raw.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
                if (!m) {
                    out.innerHTML = '<span class="text-term-red">Geçerli CIDR girin (örn. 10.0.0.0/8).</span>';
                    return;
                }
                const octets = [+m[1], +m[2], +m[3], +m[4]];
                const prefix = +m[5];
                if (octets.some(o => o > 255) || prefix > 32) {
                    out.innerHTML = '<span class="text-term-red">Oktet 0–255, prefix 0–32 olmalı.</span>';
                    return;
                }
                const mask = prefix === 0 ? 0 : ((0xFFFFFFFF << (32 - prefix)) >>> 0);
                const ip = ipv4ToInt(octets);
                const network = (ip & mask) >>> 0;
                const broadcast = (network | (~mask >>> 0)) >>> 0;
                const hostCount = prefix >= 31 ? (prefix === 32 ? 1 : 2) : (broadcast - network - 1);
                const first = prefix >= 31 ? network : network + 1;
                const last = prefix >= 31 ? broadcast : broadcast - 1;
                out.innerHTML = `
                    <div>Ağ: <span class="text-term-cyan">${intToIpv4(network)}/${prefix}</span></div>
                    <div>Maske: <span class="text-term-amber">${intToIpv4(mask)}</span> <span class="text-gray-500">(${prefix} bit)</span></div>
                    <div>Broadcast: <span class="text-term-cyan">${intToIpv4(broadcast)}</span></div>
                    <div>Host aralığı: <span class="text-term-green">${intToIpv4(first)} – ${intToIpv4(last)}</span></div>
                    <div class="text-gray-500">Kullanılabilir host ≈ ${hostCount}</div>`;
            };
            input.addEventListener('input', update);
            update();
        });
    }

    function setupDockerWidgets() {
        $all('.docker-widget').forEach(box => {
            const cmdEl = box.querySelector('.docker-cmd');
            const update = () => {
                const image = (box.querySelector('.docker-image')?.value || 'nginx:alpine').trim() || 'nginx:alpine';
                const name = (box.querySelector('.docker-name')?.value || '').trim();
                const hp = (box.querySelector('.docker-host-port')?.value || '8080').trim();
                const cp = (box.querySelector('.docker-ctr-port')?.value || '80').trim();
                const parts = ['docker', 'run'];
                if (box.querySelector('.docker-rm')?.checked) parts.push('--rm');
                if (box.querySelector('.docker-detach')?.checked) parts.push('-d');
                if (box.querySelector('.docker-port')?.checked && hp && cp) parts.push('-p', `${hp}:${cp}`);
                if (name) parts.push('--name', name);
                parts.push(image);
                if (cmdEl) cmdEl.textContent = parts.join(' ');
            };
            $all('input', box).forEach(el => el.addEventListener('input', update));
            $all('input[type=checkbox]', box).forEach(el => el.addEventListener('change', update));
            box.querySelector('.docker-copy')?.addEventListener('click', async (e) => {
                const btn = e.currentTarget;
                const text = cmdEl?.textContent || '';
                try {
                    await navigator.clipboard.writeText(text);
                    btn.textContent = '✓';
                    setTimeout(() => { btn.textContent = '⎘'; }, 1200);
                } catch {
                    btn.textContent = '!';
                    setTimeout(() => { btn.textContent = '⎘'; }, 1200);
                }
            });
            update();
        });
    }

    let syncingOctal = false;
    function toBin(v) { return v.toString(2).padStart(3, '0'); }
    function p(name) { return $(`[data-p="${name}"]`)?.checked; }

    function calcPerms() {
        if (!$('#lab-oct')) return;
        const u = (p('u4')?4:0)+(p('u2')?2:0)+(p('u1')?1:0);
        const g = (p('g4')?4:0)+(p('g2')?2:0)+(p('g1')?1:0);
        const o = (p('o4')?4:0)+(p('o2')?2:0)+(p('o1')?1:0);
        const suid = p('suid')?4:0, sgid = p('sgid')?2:0, sticky = p('sticky')?1:0;
        const special = suid+sgid+sticky;
        const oct = `${special}${u}${g}${o}`;
        const uSym = (p('u4')?'r':'-')+(p('u2')?'w':'-')+(p('u1')?(suid?'s':'x'):(suid?'S':'-'));
        const gSym = (p('g4')?'r':'-')+(p('g2')?'w':'-')+(p('g1')?(sgid?'s':'x'):(sgid?'S':'-'));
        const oSym = (p('o4')?'r':'-')+(p('o2')?'w':'-')+(p('o1')?(sticky?'t':'x'):(sticky?'T':'-'));
        $('#lab-oct').textContent = oct.padStart(4,'0');
        $('#lab-sym').textContent = '-'+uSym+gSym+oSym;
        $('#lab-bin').textContent = `${toBin(special)} ${toBin(u)} ${toBin(g)} ${toBin(o)}`;
        $('#lab-cmd').textContent = `chmod ${oct.padStart(4,'0')} script.sh`;
        if (!syncingOctal && $('#octal-input')) $('#octal-input').value = oct.padStart(4,'0');
    }

    function setupPermCalculator() {
        if (!$('#octal-input')) return;
        $all('[data-p]').forEach(el => el.addEventListener('change', calcPerms));
        $('#octal-input').addEventListener('input', () => {
            const digits = $('#octal-input').value.replace(/\D/g,'').slice(-4);
            if (!digits) return;
            const padded = digits.padStart(4,'0');
            const sp = +padded[0]||0, u=+padded[1]||0, g=+padded[2]||0, o=+padded[3]||0;
            syncingOctal = true;
            const set = (n, on) => { const el = $(`[data-p="${n}"]`); if (el) el.checked = on; };
            set('suid', !!(sp&4)); set('sgid', !!(sp&2)); set('sticky', !!(sp&1));
            set('u4',!!(u&4)); set('u2',!!(u&2)); set('u1',!!(u&1));
            set('g4',!!(g&4)); set('g2',!!(g&2)); set('g1',!!(g&1));
            set('o4',!!(o&4)); set('o2',!!(o&2)); set('o1',!!(o&1));
            calcPerms();
            syncingOctal = false;
        });
        calcPerms();
    }

    function fillSelect(sel, opts) {
        sel.innerHTML = opts.map(([v,l]) => `<option value="${v}">${l}</option>`).join('');
    }

    function setupCronBuilder() {
        const min = $('#cron-min');
        if (!min) return;
        const star = [['*','Her (*)']];
        fillSelect(min, star.concat([...Array(60)].map((_,i)=>[String(i),String(i)])));
        fillSelect($('#cron-hour'), star.concat([...Array(24)].map((_,i)=>[String(i),String(i)])));
        fillSelect($('#cron-dom'), star.concat([...Array(31)].map((_,i)=>[String(i+1),String(i+1)])));
        fillSelect($('#cron-mon'), star.concat([...Array(12)].map((_,i)=>[String(i+1),String(i+1)])));
        fillSelect($('#cron-dow'), star.concat([['0','Paz'],['1','Pzt'],['2','Sal'],['3','Çar'],['4','Per'],['5','Cum'],['6','Cmt']]));
        min.value = '15'; $('#cron-hour').value = '2';
        const update = () => {
            const expr = `${min.value} ${$('#cron-hour').value} ${$('#cron-dom').value} ${$('#cron-mon').value} ${$('#cron-dow').value}`;
            $('#cron-expr').textContent = expr;
            const parts = [];
            parts.push(min.value==='*'?'her dakika':`dakika ${min.value}`);
            parts.push($('#cron-hour').value==='*'?'her saat':`saat ${$('#cron-hour').value}`);
            $('#cron-human').textContent = 'Çalışır: ' + parts.join(', ') + '.';
        };
        $all('.cron-field').forEach(el => el.addEventListener('change', update));
        update();
    }

    const FHS = {
        '/': 'Dosya sistemi kökü. Windows’taki “C:\\” gibi düşünün — her şey buradan dallanır.',
        '/bin': 'Temel komutlar (ls, cp…). Çoğu modern distro’da /usr/bin ile birleşik.',
        '/boot': 'Açılış dosyaları: kernel, initramfs, GRUB.',
        '/dev': 'Cihaz dosyaları. Disk, klavye, null — hepsi dosya gibi görünür.',
        '/etc': 'Sistem yapılandırması. “Ayarlar klasörü”.',
        '/home': 'Kullanıcıların kişisel klasörleri (Belgelerim benzeri).',
        '/lib': 'Paylaşımlı kütüphaneler ve kernel modülleri.',
        '/lost+found': 'Disk onarımı (fsck) sonrası kurtarılan parçalar.',
        '/mnt': 'Geçici bağlama (mount) noktası.',
        '/media': 'USB vb. otomatik mount.',
        '/opt': 'Üçüncü parti yazılımlar.',
        '/proc': 'Sanal FS — süreç ve kernel bilgisi. Diskte değil, RAM’de üretilir.',
        '/root': 'root kullanıcısının evi (/home altında değildir).',
        '/usr': 'Kullanıcı yazılımlarının büyük kısmı.',
        '/sbin': 'Yönetim komutları (ağ, disk…).',
        '/var': 'Değişken veri: log, e-posta kuyruğu, cache, veritabanı dosyaları.',
        '/sys': 'sysfs — donanım/kernel nesneleri.',
        '/tmp': 'Geçici dosyalar; sticky bit ile korunur.'
    };

    function setupFhsMap() {
        const grid = $('#fhs-grid');
        if (!grid) return;
        grid.innerHTML = '';
        Object.keys(FHS).forEach(path => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'fhs-node text-left font-mono text-[11px] px-2 py-2 rounded border border-card-border';
            btn.textContent = path;
            btn.addEventListener('click', () => {
                grid.querySelectorAll('.fhs-node').forEach(n => n.classList.remove('active'));
                btn.classList.add('active');
                $('#fhs-detail').innerHTML = `<span class="text-term-cyan">${path}</span><br><span class="text-gray-400 font-sans">${FHS[path]}</span>`;
            });
            grid.appendChild(btn);
        });
    }

    function normTr(s) {
        return String(s || '')
            .toLowerCase()
            .replace(/ı/g, 'i').replace(/İ/g, 'i')
            .replace(/ğ/g, 'g').replace(/ü/g, 'u')
            .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function cmdsFromPhrases(ql) {
        const nq = normTr(ql);
        const hit = new Set();
        if (!nq) return hit;
        Object.entries(window.SEARCH_PHRASES || {}).forEach(([phrase, cmds]) => {
            const np = normTr(phrase);
            if (!np) return;
            if (nq.includes(np) || np.includes(nq)) {
                cmds.forEach(c => hit.add(c));
            }
        });
        // kök / günlük dil
        if (/yeniden.*baslat|baslatma|\brestart\b/.test(nq)) {
            ['reboot', 'systemctl reboot', 'shutdown'].forEach(c => hit.add(c));
        }
        if (/\bkapat(ma|mak)?\b|\bpower\s*off\b|\bgucu kes/.test(nq)) {
            ['shutdown', 'poweroff', 'halt', 'systemctl poweroff'].forEach(c => hit.add(c));
        }
        return hit;
    }

    function commandMatches(c, ql) {
        if (!ql) return true;
        const nq = normTr(ql);
        const hay = normTr([
            c.cmd, c.en, c.tr, c.origin, c.tip, c.example, c.cat,
            ...(c.aliases || [])
        ].join(' '));
        if (hay.includes(nq)) return true;
        // kelime kelime: tüm anlamlı kelimeler hay'de geçsin
        const words = nq.split(' ').filter(w => w.length >= 3);
        if (words.length >= 2 && words.every(w => hay.includes(w))) return true;
        // phrase → komut eşlemesi
        const fromPhrase = cmdsFromPhrases(ql);
        if (fromPhrase.has(c.cmd)) return true;
        return false;
    }

    function filterCommands(q, cat) {
        const ql = (q || '').trim().toLowerCase();
        return (window.COMMANDS || []).filter(c => {
            if (cat && cat !== 'Tümü' && c.cat !== cat) return false;
            return commandMatches(c, ql);
        });
    }

    function filterKaliTools(q, catId) {
        const ql = (q || '').trim().toLowerCase();
        const nq = normTr(ql);
        return (window.KALI_TOOLS_FLAT || []).filter(t => {
            if (catId && catId !== 'all' && t.category !== catId) return false;
            if (!nq) return true;
            const hay = normTr([
                t.name, t.tr, t.what, t.example, t.categoryTitle, t.meta, t.phase,
                ...(t.aliases || [])
            ].join(' '));
            if (hay.includes(nq)) return true;
            const words = nq.split(' ').filter(w => w.length >= 3);
            if (words.length >= 2 && words.every(w => hay.includes(w))) return true;
            // phrase map may point to tool names
            const fromPhrase = cmdsFromPhrases(ql);
            if (fromPhrase.has(t.name)) return true;
            return false;
        });
    }

    function kaliCardHtml(t) {
        return `
            <article class="depth-card rounded-lg p-4 sm:p-5">
                <div class="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <code class="text-term-red font-mono text-base font-semibold">${escapeHtml(t.name)}</code>
                    <span class="tag-badge bg-term-red/10 text-term-red border border-term-red/25">${escapeHtml(t.categoryTitle || '')}</span>
                </div>
                <p class="text-sm font-medium text-[var(--text)] mb-1">${escapeHtml(t.tr)}</p>
                <p class="prose-book text-[0.95rem] mb-3">${escapeHtml(t.what)}</p>
                <div class="flex flex-wrap gap-2 text-[10px] text-[var(--muted)] mb-2 font-mono">
                    ${t.phase ? `<span class="border border-card-border rounded px-1.5 py-0.5">${escapeHtml(t.phase)}</span>` : ''}
                    ${t.osi ? `<span class="border border-card-border rounded px-1.5 py-0.5">OSI ${escapeHtml(t.osi)}</span>` : ''}
                    ${t.meta ? `<span class="border border-card-border rounded px-1.5 py-0.5">${escapeHtml(t.meta)}</span>` : ''}
                </div>
                <div class="terminal-box p-2.5 rounded font-mono text-[11px] text-gray-300">
                    <span class="text-gray-500">$</span> ${escapeHtml(t.example)}
                </div>
            </article>`;
    }

    function paintKaliGrid(q) {
        const cat = state.kaliCat || 'all';
        const list = filterKaliTools(q, cat);
        const count = $('#kali-count');
        const grid = $('#kali-grid');
        if (count) count.textContent = list.length + ' araç';
        if (!grid) return;
        grid.innerHTML = list.length
            ? list.map(kaliCardHtml).join('')
            : `<p class="text-center text-[var(--muted)] py-10">Eşleşen Kali aracı yok.</p>`;
        $all('.kali-cat').forEach(btn => {
            const on = btn.dataset.kcat === cat;
            btn.className = `kali-cat px-2.5 py-1 rounded text-[10px] font-semibold border ${on ? 'bg-term-red/15 border-term-red text-term-red' : 'border-card-border text-[var(--muted)]'}`;
        });
    }

    function renderKaliDeepList(q) {
        const root = $('#kali-deep-root');
        if (!root || !window.KALI_DEEP) return;
        const nq = normTr(q || '');
        const list = window.KALI_DEEP.filter(d => {
            if (!nq) return true;
            const hay = normTr([d.name, d.title, d.why, d.what, d.rank, ...(d.when || []), ...(d.mistakes || [])].join(' '));
            return hay.includes(nq) || nq.split(' ').filter(w => w.length >= 3).every(w => hay.includes(w));
        });
        if (!list.length) {
            root.innerHTML = `<p class="text-center text-[var(--muted)] py-8">Derin eğitimde eşleşme yok. Katalog sekmesine bakın.</p>`;
            return;
        }
        root.innerHTML = list.map(d => {
            const deepId = 'kali-deep:' + d.id;
            const read = getRead().has(deepId);
            const steps = (d.how || []).map(s => `<li class="mb-1.5">${s}</li>`).join('');
            const when = (d.when || []).map(s => `<li class="mb-1">${s}</li>`).join('');
            const lab = (d.lab || []).map((s, i) => `
                <li class="flex gap-3 mb-2.5">
                    <span class="step-num">${i + 1}</span>
                    <span class="prose-book text-[0.95rem] flex-1">${s}</span>
                </li>`).join('');
            const cmds = (d.commands || []).map(c => `
                <div class="mb-2 group/cmd relative pr-8">
                    <div class="font-mono text-[11px] text-term-cyan"><span class="text-gray-500">$</span> ${escapeHtml(c.cmd)}</div>
                    <div class="text-[10px] text-[var(--muted)] pl-3 mt-0.5">${escapeHtml(c.why)}</div>
                    <button type="button" class="copy-cmd absolute right-0 top-0 text-[10px] text-gray-500 hover:text-term-cyan px-1.5 py-0.5" data-copy="${escapeAttr(c.cmd)}" title="Kopyala">⎘</button>
                </div>`).join('');
            const mistakes = (d.mistakes || []).map(m => `<li class="mb-1.5">${m}</li>`).join('');
            const interview = (d.interview || []).map(qa => `
                <div class="depth-card rounded-lg overflow-hidden mb-2">
                    <button type="button" class="acc-toggle w-full flex justify-between items-center p-3 text-left text-xs font-semibold">
                        <span>${escapeHtml(qa.q)}</span>
                        <svg class="icon icon-sm icon-chevron text-[var(--muted)]" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.7 8.7a1 1 0 0 1 1.4 0L12 12.6l3.9-3.9a1 1 0 1 1 1.4 1.4l-4.6 4.6a1 1 0 0 1-1.4 0L6.7 10.1a1 1 0 0 1 0-1.4z"/></svg>
                    </button>
                    <div class="acc-body px-3 pb-3 text-xs text-[var(--muted)] border-t border-card-border leading-relaxed">${escapeHtml(qa.a)}</div>
                </div>`).join('');
            return `
            <article class="depth-card rounded-lg p-5 sm:p-7 mb-6 border-l-[3px] border-term-red" data-deep="${escapeAttr(d.id)}">
                <div class="flex flex-wrap gap-2 mb-2">
                    <span class="tag-badge bg-term-red/10 text-term-red border border-term-red/25">Derin Eğitim</span>
                    <span class="tag-badge bg-card-border text-[var(--muted)]">${escapeHtml(d.rank || '')}</span>
                    ${read ? '<span class="tag-badge bg-term-green/10 text-term-green border border-term-green/25">Okundu</span>' : ''}
                </div>
                <h3 class="text-xl font-semibold text-[var(--text)] mb-1">${escapeHtml(d.title)}</h3>
                <p class="text-xs font-mono text-term-cyan mb-4">${escapeHtml(d.name)}</p>

                <div class="callout mb-4">
                    <p class="text-xs font-semibold text-[var(--text)] mb-1 font-sans">Neden bu kadar önemli?</p>
                    <div class="prose-book text-[0.95rem]">${escapeHtml(d.why)}</div>
                </div>

                <h4 class="font-sans text-sm font-semibold text-[var(--text)] mb-2">Ne işe yarar?</h4>
                <div class="prose-book text-[0.95rem] mb-5">${escapeHtml(d.what)}</div>

                <h4 class="font-sans text-sm font-semibold text-[var(--text)] mb-2">Nasıl çalışır?</h4>
                <ol class="prose-book text-[0.95rem] list-decimal pl-5 mb-5">${steps}</ol>

                <h4 class="font-sans text-sm font-semibold text-[var(--text)] mb-2">Ne zaman kullanılır?</h4>
                <ul class="prose-book text-[0.95rem] list-disc pl-5 mb-5">${when}</ul>

                <h4 class="font-sans text-sm font-semibold text-[var(--text)] mb-2">Kurulum</h4>
                <div class="terminal-box p-3 rounded font-mono text-[11px] text-gray-300 whitespace-pre mb-5">${escapeHtml(d.install || '')}</div>

                <h4 class="font-sans text-sm font-semibold text-[var(--text)] mb-3">Lab — adım adım</h4>
                <ol class="list-none pl-0 mb-5">${lab}</ol>

                <h4 class="font-sans text-sm font-semibold text-[var(--text)] mb-2">Ezberlenecek komutlar (nedenleriyle)</h4>
                <div class="terminal-box p-3.5 rounded mb-5">${cmds}</div>

                <div class="grid sm:grid-cols-2 gap-3 mb-5">
                    <div class="p-3.5 rounded border border-card-border">
                        <p class="font-sans text-xs font-semibold text-term-amber mb-1.5">Sık yapılan hatalar</p>
                        <ul class="prose-book text-[0.9rem] list-disc pl-4">${mistakes}</ul>
                    </div>
                    <div class="p-3.5 rounded border border-card-border">
                        <p class="font-sans text-xs font-semibold text-term-green mb-1.5">Blue team / SOC notu</p>
                        <div class="prose-book text-[0.9rem]">${escapeHtml(d.blue || '')}</div>
                    </div>
                </div>

                ${interview ? `<h4 class="font-sans text-sm font-semibold text-[var(--text)] mb-2">Mülakat köşesi</h4>${interview}` : ''}

                <div class="mt-6 pt-4 border-t border-card-border">
                    <button type="button" class="mark-read text-xs px-3 py-1.5 rounded border border-card-border hover:border-term-cyan text-[var(--muted)]" data-mark="${escapeAttr(deepId)}">
                        ${read ? '✓ Okundu işaretli' : 'Okundu olarak işaretle'}
                    </button>
                </div>
            </article>`;
        }).join('');

        root.querySelectorAll('.acc-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const body = btn.nextElementSibling;
                body.classList.toggle('open');
                btn.setAttribute('aria-expanded', body.classList.contains('open'));
            });
        });
        root.querySelectorAll('.copy-cmd').forEach(btn => {
            btn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(btn.dataset.copy || '');
                    btn.textContent = '✓';
                    setTimeout(() => { btn.textContent = '⎘'; }, 1200);
                } catch { /* ignore */ }
            });
        });
        root.querySelectorAll('[data-mark]').forEach(btn => {
            btn.addEventListener('click', () => {
                markRead(btn.dataset.mark);
                renderKaliDeepList(state.query || $('#kali-filter')?.value || '');
            });
        });
    }

    function setKaliMode(mode) {
        state.kaliMode = mode;
        const deep = $('#kali-deep-panel');
        const catalog = $('#kali-catalog-panel');
        if (deep) deep.classList.toggle('hidden', mode !== 'deep');
        if (catalog) catalog.classList.toggle('hidden', mode !== 'catalog');
        $all('.kali-mode-btn').forEach(b => {
            const on = b.dataset.mode === mode;
            b.className = `kali-mode-btn px-3 py-1.5 rounded text-xs font-semibold border ${on ? 'bg-term-red/15 border-term-red text-term-red' : 'border-card-border text-[var(--muted)]'}`;
        });
        if (mode === 'deep') renderKaliDeepList(state.query || $('#kali-filter')?.value || '');
        else paintKaliGrid(state.query || $('#kali-filter')?.value || '');
    }

    function renderKaliArsenal(filterQ) {
        const box = $('#content-container');
        if (!box || !window.KALI_ARSENAL) {
            if (box) box.innerHTML = '<p class="text-term-red p-8">kali-arsenal.js yüklenemedi.</p>';
            return;
        }
        const q = filterQ != null ? filterQ : (state.query || '');
        state.query = q;
        if (!state.kaliMode) state.kaliMode = 'deep';
        const cats = window.KALI_ARSENAL.categories || [];

        if ($('#kali-grid') && $('#kali-filter') && state.chapterId === 'kali') {
            const inp = $('#kali-filter');
            if (inp && inp.value !== q) inp.value = q;
            if (state.kaliMode === 'deep') renderKaliDeepList(q);
            else paintKaliGrid(q);
            return;
        }

        const total = (window.KALI_TOOLS_FLAT || []).length;
        const deepN = (window.KALI_DEEP || []).length;
        box.innerHTML = `
            <header class="mb-6 border-b border-card-border pb-5">
                <span class="tag-badge bg-term-red/10 text-term-red border border-term-red/25">Kali Linux</span>
                <h1 class="text-2xl font-semibold mt-3 text-[var(--text)]">Kali Arsenal</h1>
                <p class="prose-book mt-3 text-base">
                    Önce <strong>Derin Eğitim</strong> ile en kritik araçları öğrenin (ne işe yarar, nasıl çalışır, lab).
                    Sonra <strong>Tam Katalog</strong> ile resmi metapaketlerdeki yüzlerce aracı tarayın.
                </p>
                <div class="callout danger mt-4">
                    <p class="text-xs font-semibold text-[var(--text)] mb-1 font-sans">Yasal uyarı</p>
                    <div class="prose-book text-[0.95rem]">${escapeHtml(window.KALI_ARSENAL.warning)}</div>
                </div>
                <p class="text-xs text-[var(--muted)] mt-3 font-sans">${deepN} derin ders · ${total} katalog aracı · ${cats.length} metapaket kategorisi</p>
            </header>

            <div class="flex flex-wrap gap-2 mb-4">
                <button type="button" data-mode="deep" class="kali-mode-btn px-3 py-1.5 rounded text-xs font-semibold border">Derin Eğitim</button>
                <button type="button" data-mode="catalog" class="kali-mode-btn px-3 py-1.5 rounded text-xs font-semibold border">Tam Katalog</button>
            </div>

            <div class="sticky top-[52px] z-10 py-2 mb-4 bg-term-bg/95 backdrop-blur-sm border-b border-card-border">
                <input type="text" id="kali-filter" value="${escapeAttr(q)}" placeholder="Ara: nmap, sql injection, wifi, mitm, hash…"
                       class="w-full bg-card-dark border border-card-border rounded-md px-3 py-2 text-xs font-mono outline-none focus:border-term-red text-[var(--text)] mb-2">
                <div id="kali-cat-bar" class="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto scroll-custom ${state.kaliMode === 'deep' ? 'hidden' : ''}">
                    <button type="button" data-kcat="all" class="kali-cat px-2.5 py-1 rounded text-[10px] font-semibold border bg-term-red/15 border-term-red text-term-red">Tümü</button>
                    ${cats.map(c => `
                        <button type="button" data-kcat="${escapeAttr(c.id)}"
                            class="kali-cat px-2.5 py-1 rounded text-[10px] font-semibold border border-card-border text-[var(--muted)]">${escapeHtml(c.trTitle || c.title)}</button>
                    `).join('')}
                </div>
            </div>

            <div id="kali-deep-panel" class="${state.kaliMode === 'deep' ? '' : 'hidden'}">
                <p class="text-xs text-[var(--muted)] mb-4">Install satırından ötesi: mantık, lab, hatalar, blue team, mülakat.</p>
                <div id="kali-deep-root"></div>
            </div>

            <div id="kali-catalog-panel" class="${state.kaliMode === 'catalog' ? '' : 'hidden'}">
                <div class="callout mb-4">
                    <p class="text-xs font-semibold text-[var(--text)] mb-1 font-sans">Kurulum (metapaket)</p>
                    <pre class="font-mono text-[11px] text-[var(--muted)] whitespace-pre-wrap m-0">${escapeHtml(window.KALI_ARSENAL.installHint)}</pre>
                </div>
                <p id="kali-count" class="text-xs text-[var(--muted)] mb-3"></p>
                <div id="kali-grid" class="space-y-3"></div>
            </div>
        `;

        $all('.kali-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const bar = $('#kali-cat-bar');
                if (bar) bar.classList.toggle('hidden', btn.dataset.mode === 'deep');
                setKaliMode(btn.dataset.mode);
            });
        });
        $('#kali-filter')?.addEventListener('input', e => {
            state.query = e.target.value;
            const g = $('#globalSearch');
            if (g) g.value = e.target.value;
            if (state.kaliMode === 'deep') renderKaliDeepList(e.target.value);
            else paintKaliGrid(e.target.value);
        });
        $all('.kali-cat').forEach(btn => {
            btn.addEventListener('click', () => {
                state.kaliCat = btn.dataset.kcat;
                paintKaliGrid(state.query || $('#kali-filter')?.value || '');
            });
        });
        setKaliMode(state.kaliMode || 'deep');
    }


    function cmdCardHtml(c) {
        return `
            <article class="depth-card rounded-lg p-4 sm:p-5" data-cmd-card>
                <div class="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <code class="text-term-cyan font-mono text-base font-semibold">${escapeHtml(c.cmd)}</code>
                    <span class="tag-badge bg-card-border/80 text-[var(--muted)]">${escapeHtml(c.cat)}</span>
                </div>
                <div class="grid sm:grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                        <span class="text-[var(--muted)] font-sans">İngilizce açılım</span>
                        <p class="text-[var(--text)] font-medium mt-0.5">${escapeHtml(c.en)}</p>
                    </div>
                    <div>
                        <span class="text-[var(--muted)] font-sans">Türkçe karşılık</span>
                        <p class="text-[var(--text)] font-medium mt-0.5">${escapeHtml(c.tr)}</p>
                    </div>
                </div>
                <div class="callout mb-3">
                    <p class="text-xs font-semibold text-[var(--text)] mb-1 font-sans">İsim nereden geliyor?</p>
                    <p class="prose-book text-[0.95rem] m-0">${escapeHtml(c.origin)}</p>
                </div>
                <div class="terminal-box p-2.5 rounded font-mono text-[11px] text-gray-300 mb-2">
                    <span class="text-gray-500">$</span> ${escapeHtml(c.example)}
                </div>
                ${c.tip ? `<p class="text-xs text-[var(--muted)] leading-relaxed"><span class="text-term-amber font-semibold">İpucu:</span> ${escapeHtml(c.tip)}</p>` : ''}
                ${(c.aliases && c.aliases.length) ? `<p class="text-[10px] text-[var(--muted)] mt-2 leading-relaxed"><span class="font-semibold text-[var(--text)]">Ayrıca şöyle aranır:</span> ${escapeHtml([...new Set(c.aliases)].slice(0, 8).join(' · '))}</p>` : ''}
            </article>`;
    }

    function paintCmdGrid(q) {
        const cat = state.cmdCat || 'Tümü';
        const list = filterCommands(q, cat);
        const count = $('#cmd-count');
        const grid = $('#cmd-grid');
        if (count) count.textContent = list.length + ' sonuç';
        if (!grid) return;
        grid.innerHTML = list.length
            ? list.map(cmdCardHtml).join('')
            : `<p class="text-center text-[var(--muted)] py-10">Eşleşen komut yok.</p>`;
        $all('.cmd-cat').forEach(btn => {
            const on = btn.dataset.cat === cat;
            btn.className = `cmd-cat px-2.5 py-1 rounded text-[10px] font-semibold border ${on ? 'bg-term-cyan/15 border-term-cyan text-term-cyan' : 'border-card-border text-[var(--muted)]'}`;
        });
    }

    function chapterProgress(chId) {
        const read = getRead();
        const ch = (window.BIBLE || []).find(c => c.id === chId);
        if (!ch) return { done: 0, total: 0, pct: 0 };
        let total = 0, done = 0;
        ['baslangic', 'orta', 'ileri'].forEach(lv => {
            (ch.levels[lv] || []).forEach(l => {
                total++;
                if (read.has(l.id)) done++;
            });
        });
        return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
    }

    function getInterviewKnown() {
        try { return new Set(JSON.parse(storageGet(INTERVIEW_KNOWN_KEY) || '[]')); }
        catch { return new Set(); }
    }
    function saveInterviewKnown(set) {
        storageSet(INTERVIEW_KNOWN_KEY, JSON.stringify([...set]));
    }
    function markInterviewKnown(id, known) {
        const s = getInterviewKnown();
        if (known) s.add(id); else s.delete(id);
        saveInterviewKnown(s);
    }

    function collectInterviewPool() {
        const pool = [];
        const seen = new Set();

        (window.INTERVIEW_EXTRA || []).forEach(item => {
            if (!item || !item.q || seen.has(item.id)) return;
            seen.add(item.id);
            pool.push({
                id: item.id,
                q: item.q,
                a: item.a,
                level: item.level || 'orta',
                tag: item.tag || 'Banka',
                tracks: item.tracks || [],
                source: 'banka',
                from: 'Mülakat bankası'
            });
        });

        (window.BIBLE || []).forEach(ch => {
            ['baslangic', 'orta', 'ileri'].forEach(lv => {
                (ch.levels[lv] || []).forEach(lesson => {
                    (lesson.interview || []).forEach((qa, i) => {
                        const id = `lesson:${lesson.id}:${i}`;
                        if (seen.has(id)) return;
                        seen.add(id);
                        pool.push({
                            id, q: qa.q, a: qa.a, level: lv, tag: ch.title,
                            tracks: [], source: 'ders',
                            from: `${ch.num}. ${ch.title} · ${lesson.title}`,
                            chapterId: ch.id
                        });
                    });
                });
            });
            (ch.chapterInterview || []).forEach((qa, i) => {
                const id = `chapter:${ch.id}:${i}`;
                if (seen.has(id)) return;
                seen.add(id);
                pool.push({
                    id, q: qa.q, a: qa.a, level: 'orta', tag: ch.title,
                    tracks: [], source: 'ders',
                    from: `${ch.num}. ${ch.title} · bölüm`,
                    chapterId: ch.id
                });
            });
        });

        (window.KALI_DEEP || []).forEach(d => {
            (d.interview || []).forEach((qa, i) => {
                const id = `kali:${d.id}:${i}`;
                if (seen.has(id)) return;
                seen.add(id);
                pool.push({
                    id, q: qa.q, a: qa.a, level: 'ileri', tag: d.name || 'Kali',
                    tracks: ['redteam', 'soc'], source: 'kali',
                    from: `Kali · ${d.title || d.name}`
                });
            });
        });

        return pool;
    }

    function tracksForChapter(chapterId) {
        const out = [];
        (window.TRACKS || []).forEach(t => {
            const ids = [];
            (t.phases || []).forEach(p => (p.chapters || []).forEach(c => ids.push(c)));
            if (ids.includes(chapterId)) out.push(t.id);
        });
        return out;
    }

    function filterInterviewPool() {
        const iv = state.interview;
        let trackId = iv.track;
        if (trackId === 'auto') trackId = getTrackId() || 'all';

        return collectInterviewPool().filter(item => {
            if (iv.source !== 'all' && item.source !== iv.source) return false;
            if (iv.level !== 'all' && item.level !== iv.level) return false;
            if (trackId && trackId !== 'all') {
                let tracks = item.tracks || [];
                if (item.chapterId) tracks = tracks.concat(tracksForChapter(item.chapterId));
                if (item.source === 'banka' && tracks.length && !tracks.includes(trackId)) return false;
                if (item.source === 'ders' && item.chapterId) {
                    const tchs = tracksForChapter(item.chapterId);
                    if (tchs.length && !tchs.includes(trackId)) return false;
                }
                if (item.source === 'kali') {
                    const t = window.TRACK_BY_ID && window.TRACK_BY_ID[trackId];
                    const kd = (t && t.kaliDeep) || [];
                    const kid = (item.id || '').split(':')[1];
                    if (tracks.length && !tracks.includes(trackId) && !(kid && kd.includes(kid))) return false;
                }
            }
            return true;
        });
    }

    function shuffleInterviewOrder(pool) {
        const known = getInterviewKnown();
        const ids = pool.map(p => p.id);
        // Unknown first, then shuffle within groups
        const unk = ids.filter(id => !known.has(id));
        const kn = ids.filter(id => known.has(id));
        const shuf = arr => {
            const a = arr.slice();
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        };
        state.interview.order = shuf(unk).concat(shuf(kn));
        state.interview.idx = 0;
        state.interview.revealed = false;
    }

    function renderInterview() {
        const box = $('#content-container');
        if (!box) return;
        const iv = state.interview;
        if (!iv.track) iv.track = 'auto';
        if (!iv.mode) iv.mode = 'practice';

        const pool = filterInterviewPool();
        if (!iv.order.length || iv._poolKey !== `${iv.track}|${iv.level}|${iv.source}|${pool.length}`) {
            shuffleInterviewOrder(pool);
            iv._poolKey = `${iv.track}|${iv.level}|${iv.source}|${pool.length}`;
        }
        // Drop stale ids
        iv.order = iv.order.filter(id => pool.some(p => p.id === id));
        pool.forEach(p => { if (!iv.order.includes(p.id)) iv.order.push(p.id); });
        if (iv.idx >= iv.order.length) iv.idx = 0;

        const known = getInterviewKnown();
        const knownInPool = pool.filter(p => known.has(p.id)).length;
        const byId = Object.fromEntries(pool.map(p => [p.id, p]));
        const current = byId[iv.order[iv.idx]];

        const trackOpts = [
            { id: 'auto', label: 'Aktif yol / Tümü' },
            { id: 'all', label: 'Tüm sorular' },
            ...(window.TRACKS || []).map(t => ({ id: t.id, label: t.short }))
        ];

        let html = `
            <header class="mb-6 border-b border-card-border pb-6">
                <span class="tag-badge bg-term-amber/10 text-term-amber border border-term-amber/25">MÜLAKAT</span>
                <h1 class="text-2xl font-semibold mt-3 text-[var(--text)]">Mülakat Antrenmanı</h1>
                <p class="prose-book mt-3 text-base">Ayrı bir pratik alanı: rol filtreli sorular, kart modu, bildiklerimi ayır. Derslerdeki Senior köşeleri de buraya akar.</p>
                <p class="text-xs text-[var(--muted)] mt-3 font-sans">${pool.length} soru · ${knownInPool} işaretli “biliyorum”</p>
            </header>

            <div class="flex flex-wrap gap-2 mb-4">
                <button type="button" data-iv-mode="practice" class="iv-mode px-3 py-1.5 rounded text-xs font-semibold border ${iv.mode === 'practice' ? 'bg-term-amber/15 border-term-amber text-term-amber' : 'border-card-border text-[var(--muted)]'}">Kart antrenmanı</button>
                <button type="button" data-iv-mode="list" class="iv-mode px-3 py-1.5 rounded text-xs font-semibold border ${iv.mode === 'list' ? 'bg-term-amber/15 border-term-amber text-term-amber' : 'border-card-border text-[var(--muted)]'}">Liste</button>
            </div>

            <div class="depth-card rounded-lg p-4 mb-6 space-y-3">
                <div>
                    <p class="text-[10px] uppercase tracking-widest text-[var(--muted)] mb-1.5">Yol</p>
                    <div class="flex flex-wrap gap-1.5" id="iv-tracks">
                        ${trackOpts.map(o => `
                            <button type="button" data-iv-track="${o.id}" class="iv-track px-2.5 py-1 rounded text-[10px] font-semibold border ${iv.track === o.id ? 'bg-term-cyan/15 border-term-cyan text-term-cyan' : 'border-card-border text-[var(--muted)]'}">${escapeHtml(o.label)}</button>
                        `).join('')}
                    </div>
                </div>
                <div class="flex flex-wrap gap-4">
                    <div>
                        <p class="text-[10px] uppercase tracking-widest text-[var(--muted)] mb-1.5">Seviye</p>
                        <div class="flex flex-wrap gap-1.5">
                            ${[['all','Tümü'],['baslangic','Başlangıç'],['orta','Orta'],['ileri','İleri']].map(([id,l]) => `
                                <button type="button" data-iv-level="${id}" class="iv-level px-2.5 py-1 rounded text-[10px] font-semibold border ${iv.level === id ? 'bg-term-cyan/15 border-term-cyan text-term-cyan' : 'border-card-border text-[var(--muted)]'}">${l}</button>
                            `).join('')}
                        </div>
                    </div>
                    <div>
                        <p class="text-[10px] uppercase tracking-widest text-[var(--muted)] mb-1.5">Kaynak</p>
                        <div class="flex flex-wrap gap-1.5">
                            ${[['all','Hepsi'],['banka','Banka'],['ders','Dersler'],['kali','Kali']].map(([id,l]) => `
                                <button type="button" data-iv-source="${id}" class="iv-source px-2.5 py-1 rounded text-[10px] font-semibold border ${iv.source === id ? 'bg-term-cyan/15 border-term-cyan text-term-cyan' : 'border-card-border text-[var(--muted)]'}">${l}</button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>`;

        if (!pool.length) {
            html += `<p class="text-center text-[var(--muted)] py-12">Bu filtreyle soru yok. Yolu veya kaynağı genişlet.</p>`;
            box.innerHTML = html;
            bindInterviewChrome();
            return;
        }

        if (iv.mode === 'practice') {
            const n = iv.order.length;
            const pos = n ? iv.idx + 1 : 0;
            const isKnown = current && known.has(current.id);
            html += `
            <div class="depth-card rounded-lg p-5 sm:p-7 border-l-[3px] border-term-amber mb-4">
                <div class="flex flex-wrap gap-2 mb-3">
                    <span class="tag-badge bg-term-amber/10 text-term-amber border border-term-amber/25">${pos} / ${n}</span>
                    ${current ? `<span class="tag-badge border border-card-border text-[var(--muted)]">${escapeHtml(levelLabel(current.level))}</span>` : ''}
                    ${current ? `<span class="tag-badge border border-card-border text-[var(--muted)]">${escapeHtml(current.tag)}</span>` : ''}
                    ${isKnown ? '<span class="tag-badge bg-term-green/10 text-term-green border border-term-green/25">Biliyorum</span>' : ''}
                </div>
                ${current ? `
                    <p class="text-[10px] text-[var(--muted)] mb-3 font-mono">${escapeHtml(current.from)}</p>
                    <h3 class="text-lg sm:text-xl font-semibold text-[var(--text)] leading-snug mb-5">${escapeHtml(current.q)}</h3>
                    ${iv.revealed ? `
                        <div class="callout ok mb-5">
                            <p class="text-xs font-semibold text-[var(--text)] mb-1 font-sans">Örnek cevap</p>
                            <div class="prose-book text-[0.95rem]">${escapeHtml(current.a)}</div>
                        </div>
                    ` : `
                        <button type="button" id="iv-reveal" class="w-full sm:w-auto px-4 py-2.5 rounded border border-term-amber/40 bg-term-amber/10 text-term-amber text-xs font-semibold mb-5">Cevabı göster</button>
                    `}
                    <div class="flex flex-wrap gap-2 pt-2 border-t border-card-border">
                        <button type="button" id="iv-know" class="px-3 py-2 rounded text-xs font-semibold border border-term-green/40 text-term-green hover:bg-term-green/10">${isKnown ? '✓ Biliyorum' : 'Biliyorum'}</button>
                        <button type="button" id="iv-again" class="px-3 py-2 rounded text-xs font-semibold border border-term-red/40 text-term-red hover:bg-term-red/10">Tekrar et</button>
                        <button type="button" id="iv-next" class="px-3 py-2 rounded text-xs font-semibold border border-term-cyan/40 text-term-cyan hover:bg-term-cyan/10 ml-auto">Sonraki →</button>
                        <button type="button" id="iv-prev" class="px-3 py-2 rounded text-xs border border-card-border text-[var(--muted)]">← Önceki</button>
                        <button type="button" id="iv-shuffle" class="px-3 py-2 rounded text-xs border border-card-border text-[var(--muted)]">Karıştır</button>
                    </div>
                ` : `<p class="text-[var(--muted)]">Soru yüklenemedi.</p>`}
            </div>
            <p class="text-[11px] text-[var(--muted)]">İpucu: Cevabı kendi cümlelerinle sesli söyle, sonra aç. “Biliyorum” havuzu sona iter.</p>`;
        } else {
            html += `<div class="space-y-2 mb-8">`;
            pool.forEach(item => {
                const k = known.has(item.id);
                html += `
                <div class="depth-card rounded-lg overflow-hidden">
                    <button type="button" class="acc-toggle w-full flex justify-between items-start gap-3 p-4 text-left">
                        <span>
                            <span class="flex flex-wrap gap-1.5 mb-1.5">
                                <span class="tag-badge border border-card-border text-[var(--muted)]">${escapeHtml(levelLabel(item.level))}</span>
                                <span class="tag-badge border border-card-border text-[var(--muted)]">${escapeHtml(item.tag)}</span>
                                ${k ? '<span class="tag-badge bg-term-green/10 text-term-green border border-term-green/25">Biliyorum</span>' : ''}
                            </span>
                            <span class="text-sm font-semibold text-[var(--text)]">${escapeHtml(item.q)}</span>
                            <span class="block text-[10px] text-[var(--muted)] mt-1 font-mono">${escapeHtml(item.from)}</span>
                        </span>
                        <svg class="icon icon-sm icon-chevron text-[var(--muted)] mt-1 shrink-0" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.7 8.7a1 1 0 0 1 1.4 0L12 12.6l3.9-3.9a1 1 0 1 1 1.4 1.4l-4.6 4.6a1 1 0 0 1-1.4 0L6.7 10.1a1 1 0 0 1 0-1.4z"/></svg>
                    </button>
                    <div class="acc-body px-4 pb-4 text-xs text-[var(--muted)] border-t border-card-border leading-relaxed">
                        ${escapeHtml(item.a)}
                        <div class="mt-3">
                            <button type="button" class="iv-toggle-known text-[10px] underline" data-qid="${escapeAttr(item.id)}" data-known="${k ? '0' : '1'}">${k ? 'Biliyorum işaretini kaldır' : 'Biliyorum olarak işaretle'}</button>
                        </div>
                    </div>
                </div>`;
            });
            html += `</div>`;
        }

        box.innerHTML = html;
        bindInterviewChrome();
        bindInterviewPractice(pool);
    }

    function bindInterviewChrome() {
        $all('.iv-mode').forEach(btn => btn.addEventListener('click', () => {
            state.interview.mode = btn.dataset.ivMode;
            state.interview.revealed = false;
            renderInterview();
        }));
        $all('.iv-track').forEach(btn => btn.addEventListener('click', () => {
            state.interview.track = btn.dataset.ivTrack;
            state.interview.order = [];
            state.interview.revealed = false;
            renderInterview();
        }));
        $all('.iv-level').forEach(btn => btn.addEventListener('click', () => {
            state.interview.level = btn.dataset.ivLevel;
            state.interview.order = [];
            state.interview.revealed = false;
            renderInterview();
        }));
        $all('.iv-source').forEach(btn => btn.addEventListener('click', () => {
            state.interview.source = btn.dataset.ivSource;
            state.interview.order = [];
            state.interview.revealed = false;
            renderInterview();
        }));
        $all('.acc-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const body = btn.nextElementSibling;
                body.classList.toggle('open');
                btn.setAttribute('aria-expanded', body.classList.contains('open'));
            });
        });
        $all('.iv-toggle-known').forEach(btn => {
            btn.addEventListener('click', () => {
                markInterviewKnown(btn.dataset.qid, btn.dataset.known === '1');
                renderInterview();
            });
        });
    }

    function bindInterviewPractice(pool) {
        const iv = state.interview;
        if (iv.mode !== 'practice') return;
        const current = pool.find(p => p.id === iv.order[iv.idx]);

        $('#iv-reveal')?.addEventListener('click', () => { iv.revealed = true; renderInterview(); });
        $('#iv-next')?.addEventListener('click', () => {
            iv.idx = (iv.idx + 1) % Math.max(iv.order.length, 1);
            iv.revealed = false;
            renderInterview();
        });
        $('#iv-prev')?.addEventListener('click', () => {
            iv.idx = (iv.idx - 1 + iv.order.length) % Math.max(iv.order.length, 1);
            iv.revealed = false;
            renderInterview();
        });
        $('#iv-shuffle')?.addEventListener('click', () => {
            shuffleInterviewOrder(pool);
            iv._poolKey = `${iv.track}|${iv.level}|${iv.source}|${pool.length}`;
            renderInterview();
        });
        $('#iv-know')?.addEventListener('click', () => {
            if (!current) return;
            markInterviewKnown(current.id, true);
            // move to end
            iv.order = iv.order.filter(id => id !== current.id).concat([current.id]);
            iv.revealed = false;
            // stay on next unknown
            renderInterview();
        });
        $('#iv-again')?.addEventListener('click', () => {
            if (!current) return;
            markInterviewKnown(current.id, false);
            iv.revealed = false;
            iv.idx = (iv.idx + 1) % Math.max(iv.order.length, 1);
            renderInterview();
        });
    }

    function activateTrack(trackId, startFirst) {
        setTrackId(trackId);
        renderSidebar();
        updateProgress();
        const track = currentTrack();
        if (startFirst && track) {
            const first = track.phases?.[0]?.chapters?.[0];
            if (first) {
                navTo(first);
                return;
            }
        }
        navTo('tracks');
    }

    function renderTracks() {
        const box = $('#content-container');
        if (!box) return;
        const active = currentTrack();
        const read = getRead();

        let html = `
            <header class="mb-8 border-b border-card-border pb-6">
                <span class="tag-badge bg-term-green/10 text-term-green border border-term-green/25">KARİYER YOLLARI</span>
                <h1 class="text-2xl font-semibold mt-3 text-[var(--text)]">Hedefe yönelik Linux ve DevOps müfredatı</h1>
                <p class="prose-book mt-3 text-base">DevOps mühendisi, SRE, sistem yöneticisi, SOC analisti veya Red Team hedefin için rolünü seç — sidebar o yola göre sıralanır, ilerleme çubuğu yalnızca bu yoldaki Linux derslerini sayar. Docker, Kubernetes, hardening ve Kali modülleri kariyer yoluna göre filtrelenir.</p>
            </header>
            <div class="grid gap-3 mb-10">`;

        (window.TRACKS || []).forEach(t => {
            const ids = trackLessonIds(t);
            const done = ids.filter(id => read.has(id)).length;
            const pct = ids.length ? Math.round(done / ids.length * 100) : 0;
            const on = active && active.id === t.id;
            const chCount = trackChapterIds(t).length;
            html += `
            <article class="depth-card rounded-lg p-5 ${on ? 'border-term-cyan' : ''}">
                <div class="flex flex-wrap items-start gap-3 justify-between">
                    <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap gap-2 items-center mb-2">
                            <span class="tag-badge border ${TRACK_COLORS[t.color] || TRACK_COLORS.cyan}">${escapeHtml(t.short)}</span>
                            ${on ? '<span class="tag-badge bg-term-cyan/15 text-term-cyan border border-term-cyan/30">Aktif</span>' : ''}
                            <span class="text-[10px] font-mono text-[var(--muted)]">${escapeHtml(t.weeks || '')}</span>
                        </div>
                        <h3 class="text-lg font-semibold text-[var(--text)]">${escapeHtml(t.title)}</h3>
                        <p class="text-xs text-[var(--muted)] mt-1.5 leading-relaxed"><span class="text-[var(--text)] font-medium">Kimler:</span> ${escapeHtml(t.who)}</p>
                        <p class="text-xs text-[var(--muted)] mt-1 leading-relaxed"><span class="text-[var(--text)] font-medium">Çıktı:</span> ${escapeHtml(t.outcome)}</p>
                        <p class="text-[10px] font-mono text-[var(--muted)] mt-2">${chCount} bölüm · ${ids.length} ders · ${done}/${ids.length} okundu</p>
                        <progress class="track-progress w-full mt-2" max="100" value="${pct}" aria-label="İlerleme ${pct}%"></progress>
                    </div>
                    <div class="flex flex-col gap-2 shrink-0">
                        <button type="button" data-activate="${t.id}" class="px-3 py-2 rounded text-xs font-semibold border border-term-cyan/40 bg-term-cyan/10 text-term-cyan hover:bg-term-cyan/20">
                            ${on ? 'Yola devam et' : 'Bu yolu seç'}
                        </button>
                        <button type="button" data-iv-track-go="${t.id}" class="px-3 py-2 rounded text-xs border border-term-amber/40 text-term-amber hover:bg-term-amber/10">Mülakat</button>
                        <button type="button" data-detail="${t.id}" class="px-3 py-2 rounded text-xs border border-card-border text-[var(--muted)] hover:border-term-cyan">Detay</button>
                    </div>
                </div>
                <div id="track-detail-${t.id}" class="hidden mt-4 pt-4 border-t border-card-border space-y-3"></div>
            </article>`;
        });

        html += `</div>
            <section class="mt-10 pt-8 border-t border-card-border prose-book text-sm space-y-4">
                <h2 class="text-lg font-semibold text-[var(--text)] font-sans">Linux dersleri, bölümler ve mülakat hazırlığı</h2>
                <p>Her kariyer yolu haftalık tempo, <strong>kimler</strong> için uygun olduğu, beklenen <strong>çıktı</strong>, kapsanan <strong>bölüm</strong> ve <strong>ders</strong> sayısı ile listelenir. Bir yolu seçtiğinizde sidebar yalnızca o yoldaki Linux içeriğini gösterir; okuduğunuz dersler ilerleme çubuğuna yansır.</p>
                <p>DevOps mühendisi, SRE, Red Hat sistem yöneticisi, SOC analisti, Red Team, Cloud Ops ve sıfırdan Linux yollarının her biri Docker, Kubernetes, hardening veya Kali modüllerini rolünüze göre filtreler. Yol kartındaki <strong>Mülakat</strong> düğmesi o track’e özel soru setine götürür.</p>
                <h2 class="text-lg font-semibold text-[var(--text)] font-sans">İlgili Linux Omnibus bölümleri</h2>
                <ul class="list-disc pl-5 space-y-1 text-[var(--muted)] font-sans text-xs">
                    <li><a href="/roadmap" class="text-term-cyan underline underline-offset-2">Tüm müfredat</a> — 35 bölümlük tam Linux · DevOps · güvenlik haritası</li>
                    <li><a href="/encyclopedia" class="text-term-cyan underline underline-offset-2">Komut ansiklopedisi</a> — ~570 komut, TR karşılık ve örnekler</li>
                    <li><a href="/interview" class="text-term-cyan underline underline-offset-2">Mülakat antrenmanı</a> — Linux, DevOps ve güvenlik soruları</li>
                    <li><a href="/kali" class="text-term-cyan underline underline-offset-2">Kali Arsenal</a> — penetrasyon test araç kataloğu</li>
                    <li><a href="/ch0" class="text-term-cyan underline underline-offset-2">Linux nedir?</a> — müfredata giriş dersi</li>
                </ul>
            </section>
            <p class="text-xs text-[var(--muted)] mt-6">Tüm konuları serbest dolaşmak için <a href="/roadmap" class="underline text-term-cyan">Tüm Müfredat</a> haritasına bak veya <button type="button" id="goto-roadmap" class="underline text-term-cyan">haritayı aç</button>.</p>`;
        box.innerHTML = html;

        $all('[data-activate]').forEach(btn => {
            btn.addEventListener('click', () => activateTrack(btn.dataset.activate, true));
        });
        $all('[data-iv-track-go]').forEach(btn => {
            btn.addEventListener('click', () => {
                setTrackId(btn.dataset.ivTrackGo);
                state.interview.track = btn.dataset.ivTrackGo;
                state.interview.order = [];
                renderSidebar();
                updateProgress();
                navTo('interview');
            });
        });
        $all('[data-detail]').forEach(btn => {
            btn.addEventListener('click', () => {
                const tid = btn.dataset.detail;
                const panel = $(`#track-detail-${tid}`);
                if (!panel) return;
                const open = !panel.classList.contains('hidden');
                if (open) {
                    panel.classList.add('hidden');
                    panel.innerHTML = '';
                    return;
                }
                const t = window.TRACK_BY_ID[tid];
                if (!t) return;
                panel.innerHTML = (t.phases || []).map((p, i) => {
                    const rows = (p.chapters || []).map(cid => {
                        const ch = window.BIBLE.find(c => c.id === cid);
                        if (!ch) return '';
                        const pr = chapterProgress(cid);
                        return `<button type="button" data-goto="${cid}" class="track-go w-full text-left flex justify-between gap-2 py-1.5 text-xs hover:text-term-cyan">
                            <span><span class="font-mono text-term-cyan/80">${ch.num}</span> ${ch.title}</span>
                            <span class="font-mono text-[10px] text-[var(--muted)]">${pr.done}/${pr.total}</span>
                        </button>`;
                    }).join('');
                    return `<div>
                        <p class="text-xs font-semibold text-[var(--text)]">${i + 1}. ${escapeHtml(p.title)}</p>
                        <p class="text-[10px] text-[var(--muted)] mb-1">${escapeHtml(p.desc || '')}</p>
                        ${rows}
                    </div>`;
                }).join('') + ((t.kaliDeep && t.kaliDeep.length) ? `
                    <div class="callout danger">
                        <p class="text-xs font-semibold mb-1 font-sans">Kali derin önerisi</p>
                        <p class="text-xs text-[var(--muted)]">${t.kaliDeep.map(escapeHtml).join(' · ')}</p>
                        <button type="button" data-goto="kali" class="track-go mt-2 text-xs text-term-red underline">Kali Arsenal’e git</button>
                    </div>` : '');
                panel.classList.remove('hidden');
                $all('.track-go', panel).forEach(b => b.addEventListener('click', () => {
                    if (b.dataset.goto === 'kali') {
                        if (!currentTrack() || currentTrack().id !== tid) setTrackId(tid);
                        renderSidebar();
                        updateProgress();
                        navTo('kali');
                    } else {
                        if (!currentTrack() || currentTrack().id !== tid) {
                            setTrackId(tid);
                            renderSidebar();
                            updateProgress();
                        }
                        navTo(b.dataset.goto);
                    }
                }));
            });
        });
        $('#goto-roadmap')?.addEventListener('click', () => navTo('roadmap'));
    }

    function renderRoadmap() {
        const box = $('#content-container');
        if (!box) return;
        const groups = [
            { id: 'temel', tip: 'Temel', desc: 'İşletim sistemi, terminal, dosya — her şeyin zemini.' },
            { id: 'sistem', tip: 'Sistem & Ağ', desc: 'Süreç, yetki, disk, SSH, scripting, ağ teşhisi.' },
            { id: 'devops', tip: 'DevOps & Bulut', desc: 'Konteyner, K8s, CI/CD, IaC, Git, bulut Linux.' },
            { id: 'guvenlik', tip: 'Güvenlik & SOC', desc: 'Pentest temeli, hardening, TLS, gözlemlenebilirlik.' },
            { id: 'ops', tip: 'Operasyon', desc: 'Kriz runbook, platform, Day-2.' }
        ];
        let html = `
            <header class="mb-8 border-b border-card-border pb-6">
                <span class="tag-badge bg-term-cyan/10 text-term-cyan border border-term-cyan/25">KONU HARİTASI</span>
                <h1 class="text-2xl font-semibold mt-3 text-[var(--text)]">Tüm Müfredat</h1>
                <p class="prose-book mt-3 text-base">Rol bazlı gitmek için <button type="button" id="goto-tracks" class="underline text-term-green">Hedef Yollar</button>’ı kullan. Burada tüm bölümler konu grubuna göre listelenir.</p>
                <p class="text-xs text-[var(--muted)] mt-3 font-sans">${window.BIBLE.length} bölüm · ${(window.COMMANDS||[]).length} komut · ${(window.KALI_DEEP||[]).length} Kali derin</p>
            </header>`;
        groups.forEach(g => {
            const chs = window.BIBLE.filter(c => chapterGroup(c) === g.id);
            if (!chs.length) return;
            html += `<section class="mb-8"><h3 class="text-sm font-semibold text-term-cyan mb-1">${g.tip}</h3>
                <p class="text-xs text-[var(--muted)] mb-3">${g.desc}</p><div class="space-y-2">`;
            chs.forEach(ch => {
                const pr = chapterProgress(ch.id);
                html += `<button type="button" data-goto="${ch.id}" class="roadmap-go depth-card w-full text-left rounded-lg p-3.5 hover:border-term-cyan">
                    <div class="flex justify-between gap-3 items-baseline">
                        <span class="font-mono text-[10px] text-term-cyan">${ch.num}</span>
                        <span class="flex-1 text-sm font-semibold text-[var(--text)]">${ch.title}</span>
                        <span class="text-[10px] font-mono text-[var(--muted)]">${pr.done}/${pr.total}</span>
                    </div>
                    <p class="text-[11px] text-[var(--muted)] mt-1">${ch.subtitle||''}</p>
                    <progress class="roadmap-progress w-full mt-2" max="100" value="${pr.pct}" aria-label="Bölüm ilerlemesi ${pr.pct}%"></progress>
                </button>`;
            });
            html += `</div></section>`;
        });
        html += `<section class="mb-8"><h3 class="text-sm font-semibold text-term-amber mb-2">Referans</h3>
            <div class="flex flex-wrap gap-2">
                <button type="button" data-goto="encyclopedia" class="roadmap-go px-3 py-2 rounded border border-card-border text-xs hover:border-term-amber">Komut Ansiklopedisi</button>
                <button type="button" data-goto="kali" class="roadmap-go px-3 py-2 rounded border border-card-border text-xs hover:border-term-red">Kali Arsenal</button>
            </div></section>`;
        box.innerHTML = html;
        $all('.roadmap-go').forEach(btn => btn.addEventListener('click', () => navTo(btn.dataset.goto)));
        $('#goto-tracks')?.addEventListener('click', () => navTo('tracks'));
    }

    function renderEncyclopedia(filterQ) {
        const box = $('#content-container');
        if (!box) return;
        const q = filterQ != null ? filterQ : (state.query || '');
        state.query = q;
        const cat = state.cmdCat || 'Tümü';
        const cats = window.CMD_CATEGORIES || ['Tümü'];

        // Already on encyclopedia shell — only refresh grid (keeps input focus)
        if ($('#cmd-grid') && $('#cmd-filter') && state.chapterId === 'encyclopedia') {
            const inp = $('#cmd-filter');
            if (inp && inp.value !== q) inp.value = q;
            paintCmdGrid(q);
            return;
        }

        box.innerHTML = `
            <header class="mb-6 border-b border-card-border pb-5">
                <span class="tag-badge bg-term-amber/10 text-term-amber border border-term-amber/25">Referans</span>
                <h1 class="text-2xl font-semibold mt-3 text-[var(--text)]">Komut Ansiklopedisi</h1>
                <p class="prose-book mt-3 text-base">
                    Linux komutlarının çoğu İngilizce kelimelerin veya kısaltmaların kısasıdır.
                    Burada her komutun <strong>açılımı</strong>, <strong>Türkçe karşılığı</strong> ve ismin <strong>nereden geldiği</strong> var — ezberlemek yerine anlamayı hedefler.
                </p>
                <p class="text-xs text-[var(--muted)] mt-2 font-sans">${(window.COMMANDS || []).length} komut · anlık filtre</p>
            </header>
            <div class="sticky top-[52px] z-10 py-2 mb-4 bg-term-bg/95 backdrop-blur-sm border-b border-card-border">
                <input type="text" id="cmd-filter" value="${escapeAttr(q)}" placeholder="Komut, Türkçe anlam veya köken ara (örn: kopyala, concatenate, disk)…"
                       class="w-full bg-card-dark border border-card-border rounded-md px-3 py-2 text-xs font-mono outline-none focus:border-term-cyan text-[var(--text)] mb-2">
                <div class="flex flex-wrap gap-1.5" id="cmd-cats">
                    ${cats.map(c => `
                        <button type="button" data-cat="${escapeAttr(c)}"
                            class="cmd-cat px-2.5 py-1 rounded text-[10px] font-semibold border ${c === cat ? 'bg-term-cyan/15 border-term-cyan text-term-cyan' : 'border-card-border text-[var(--muted)]'}">${c}</button>
                    `).join('')}
                </div>
            </div>
            <p id="cmd-count" class="text-xs text-[var(--muted)] mb-3"></p>
            <div id="cmd-grid" class="space-y-3"></div>
        `;

        paintCmdGrid(q);

        $('#cmd-filter')?.addEventListener('input', e => {
            state.query = e.target.value;
            const gSearch = $('#globalSearch');
            if (gSearch) gSearch.value = e.target.value;
            paintCmdGrid(e.target.value);
        });
        $all('.cmd-cat').forEach(btn => {
            btn.addEventListener('click', () => {
                state.cmdCat = btn.dataset.cat;
                paintCmdGrid(state.query || $('#cmd-filter')?.value || '');
            });
        });
    }

    function globalSearch(q) {
        state.query = q;
        if (!q.trim()) {
            if (state.chapterId === 'encyclopedia') renderEncyclopedia('');
            else if (state.chapterId === 'kali') renderKaliArsenal('');
            else renderChapter();
            return;
        }
        const ql = q.trim().toLowerCase();
        const lessonHits = [];
        window.BIBLE.forEach(ch => {
            ['baslangic','orta','ileri'].forEach(lv => {
                (ch.levels[lv]||[]).forEach(lesson => {
                    const hay = (lesson.title+' '+(lesson.search||'')+' '+(lesson.tags||'')+' '+(lesson.body||[]).join(' ')).toLowerCase();
                    if (hay.includes(ql)) lessonHits.push({ ch, lesson, lv });
                });
            });
        });
        const cmdHits = filterCommands(q, 'Tümü');
        const kaliHits = filterKaliTools(q, 'all');

        const box = $('#content-container');
        if (!lessonHits.length && !cmdHits.length && !kaliHits.length) {
            box.innerHTML = `<p class="text-center text-[var(--muted)] py-16">“${escapeHtml(q)}” için sonuç yok.</p>`;
            $('#current-section-title').textContent = 'Arama';
            updateDocumentMeta('Arama', `“${q}” için Linux Omnibus arama sonucu.`);
            return;
        }
        $('#current-section-title').textContent = `Arama: ${q}`;
        updateDocumentMeta(`Arama: ${q}`, `Linux Omnibus’ta “${q}” araması — ders, komut ve Kali sonuçları.`);
        $all('.nav-btn').forEach(b => b.classList.remove('nav-item-active'));

        let html = `<header class="mb-6"><h1 class="text-xl font-semibold">Arama sonuçları</h1>
            <p class="text-xs text-[var(--muted)] mt-1">${lessonHits.length} ders · ${cmdHits.length} komut · ${kaliHits.length} Kali aracı</p></header>`;

        if (kaliHits.length) {
            html += `<h3 class="text-sm font-semibold mb-2 text-term-red">Kali Arsenal</h3><div class="space-y-2 mb-8">`;
            html += kaliHits.slice(0, 30).map(t => `
                <button type="button" class="kali-hit depth-card w-full text-left rounded-lg p-3 hover:border-term-red" data-goto-kali="${escapeAttr(t.name)}">
                    <div class="flex flex-wrap gap-2 items-baseline">
                        <code class="text-term-red font-mono font-semibold">${escapeHtml(t.name)}</code>
                        <span class="text-xs text-[var(--muted)]">${escapeHtml(t.tr)}</span>
                    </div>
                    <p class="text-[11px] text-[var(--muted)] mt-1">${escapeHtml(t.what).slice(0, 140)}${t.what.length > 140 ? '…' : ''}</p>
                </button>
            `).join('');
            html += `</div>`;
        }

        if (cmdHits.length) {
            html += `<h3 class="text-sm font-semibold mb-2 text-term-amber">Komut Ansiklopedisi</h3><div class="space-y-2 mb-8">`;
            html += cmdHits.slice(0, 40).map(c => `
                <button type="button" class="cmd-hit depth-card w-full text-left rounded-lg p-3 hover:border-term-cyan" data-goto-cmd="${escapeAttr(c.cmd)}">
                    <div class="flex flex-wrap gap-2 items-baseline">
                        <code class="text-term-cyan font-mono font-semibold">${escapeHtml(c.cmd)}</code>
                        <span class="text-xs text-[var(--muted)]">${escapeHtml(c.tr)}</span>
                    </div>
                    <p class="text-[11px] text-[var(--muted)] mt-1">${escapeHtml(c.en)} — ${escapeHtml(c.origin).slice(0, 120)}${c.origin.length > 120 ? '…' : ''}</p>
                </button>
            `).join('');
            html += `</div>`;
        }
        if (lessonHits.length) {
            html += `<h3 class="text-sm font-semibold mb-2">Dersler</h3><div id="lessons-root"></div>`;
        }
        box.innerHTML = html;
        $all('[data-goto-kali]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.query = btn.dataset.gotoKali;
                const g = $('#globalSearch');
                if (g) g.value = btn.dataset.gotoKali;
                state.chapterId = null;
                navTo('kali');
                renderKaliArsenal(btn.dataset.gotoKali);
            });
        });
        $all('[data-goto-cmd]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.query = btn.dataset.gotoCmd;
                const g = $('#globalSearch');
                if (g) g.value = btn.dataset.gotoCmd;
                state.chapterId = null;
                navTo('encyclopedia');
                renderEncyclopedia(btn.dataset.gotoCmd);
            });
        });
        const root = $('#lessons-root');
        if (root) {
            lessonHits.forEach(h => {
                root.insertAdjacentHTML('beforeend', `
                    <p class="text-[10px] font-mono text-[var(--muted)] mb-1 mt-4">${h.ch.num}. ${h.ch.title} · ${levelLabel(h.lv)}</p>
                ` + renderLesson(h.lesson, h.lv));
            });
            bindLessonUi();
        }
    }

    function applyTheme(light) {
        const root = document.documentElement;
        root.classList.toggle('light', light);
        root.classList.toggle('dark', !light);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = light ? '#F7F5F0' : '#0B0E14';
        const icon = $('#theme-icon');
        if (icon) {
            // Show the destination theme (sun → light, moon → dark)
            icon.innerHTML = light
                ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
                : '<path d="M12 3a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1zm0 15a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1zm9-6a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1zM4 12a1 1 0 0 1-1 1H2a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1zm13.66-6.66a1 1 0 0 1 0 1.41l-.71.71a1 1 0 0 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0zm-9.9 9.9a1 1 0 0 1 0 1.41l-.71.71a1 1 0 1 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0zm9.9 1.41a1 1 0 0 1-1.41 0l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41zM6.34 6.34a1 1 0 0 1-1.41 0l-.71-.71A1 1 0 0 1 5.63 4.22l.71.71a1 1 0 0 1 0 1.41zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/>';
            icon.setAttribute('aria-hidden', 'true');
        }
        const toggle = $('#theme-toggle');
        if (toggle) {
            toggle.title = light ? 'Koyu moda geç' : 'Açık moda geç';
            toggle.setAttribute('aria-label', light ? 'Koyu moda geç' : 'Açık moda geç');
        }
    }

    function setupTheme() {
        const saved = storageGet(THEME_KEY);
        const preferLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        applyTheme(saved ? saved === 'light' : preferLight);
        $('#theme-toggle')?.addEventListener('click', () => {
            const light = !document.documentElement.classList.contains('light');
            applyTheme(light);
            storageSet(THEME_KEY, light ? 'light' : 'dark');
        });
    }

    async function applyRouteFromHash() {
        const parsed = parseHash();
        if (!parsed || !parsed.id) {
            await navTo('tracks', { instant: true });
            return;
        }
        const { id, level } = parsed;
        if (SPECIAL_ROUTES.includes(id)) {
            await navTo(id, { instant: true });
            return;
        }
        const ch = window.BIBLE.find(c => c.id === id);
        if (!ch) {
            await navTo(window.BIBLE[0].id, { instant: true });
            return;
        }
        const lv = (level && ch.levels[level]) ? level : 'baslangic';
        await navTo(id, { level: lv, keepLevel: true, instant: true });
    }

    function openMobile() {
        $('#sidebar')?.classList.add('open');
        $('#sidebar-overlay')?.classList.add('show');
        $('#open-sidebar')?.setAttribute('aria-expanded', 'true');
    }
    function closeMobile() {
        $('#sidebar')?.classList.remove('open');
        $('#sidebar-overlay')?.classList.remove('show');
        $('#open-sidebar')?.setAttribute('aria-expanded', 'false');
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!window.BIBLE) {
            $('#content-container').innerHTML = '<p class="text-term-red p-8">content.js yüklenemedi. index.html ile aynı klasörde olduğundan emin olun.</p>';
            return;
        }
        state.cmdCat = 'Tümü';
        state.trackId = getTrackId();
        injectCourseSyllabus();
        renderSidebar();
        updateProgress();
        setupTheme();
        setupExportImport();
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').catch(() => { /* offline opsiyonel */ });
        }
        $('#open-sidebar')?.addEventListener('click', openMobile);
        $('#sidebar-overlay')?.addEventListener('click', closeMobile);
        window.addEventListener('hashchange', () => applyRouteFromHash());
        window.addEventListener('popstate', () => applyRouteFromHash());
        document.addEventListener('keydown', e => {
            if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const tag = (e.target && e.target.tagName) || '';
                if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
                e.preventDefault();
                $('#globalSearch')?.focus();
            }
            if (e.key === 'Escape') {
                const gs = $('#globalSearch');
                if (document.activeElement === gs) {
                    gs.blur();
                    if (gs.value) {
                        gs.value = '';
                        state.query = '';
                        applyRouteFromHash();
                    }
                }
                closeMobile();
            }
        });
        let t;
        $('#globalSearch')?.addEventListener('input', e => {
            clearTimeout(t);
            t = setTimeout(() => {
                if (!e.target.value.trim()) {
                    state.query = '';
                    navTo(state.chapterId || window.BIBLE[0].id, { keepLevel: true });
                } else if (state.chapterId === 'encyclopedia') {
                    state.query = e.target.value;
                    renderEncyclopedia(e.target.value);
                } else if (state.chapterId === 'kali') {
                    state.query = e.target.value;
                    renderKaliArsenal(e.target.value);
                } else {
                    globalSearch(e.target.value);
                }
            }, 180);
        });
        applyRouteFromHash();
    });

    window.LinuxOmnibus = { navTo, renderEncyclopedia, applyRouteFromHash };
    window.LinuxBible = window.LinuxOmnibus; // geriye uyumluluk
})();
