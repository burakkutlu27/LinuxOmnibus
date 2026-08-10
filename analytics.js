(function () {
    var id = window.OMNIBUS_GA_ID;
    if (!id) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());

    function pagePath() {
        return location.pathname + location.search + location.hash;
    }

    function trackPage() {
        window.gtag('config', id, {
            page_path: pagePath(),
            page_title: document.title,
            anonymize_ip: true
        });
    }

    window.OmnibusAnalytics = { trackPage: trackPage };

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    s.onload = trackPage;
    document.head.appendChild(s);
})();
