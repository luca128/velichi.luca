/* site.js — banner cookies + Google Analytics (doar după acord) + video lightbox */
(function () {
  // 1) Pune aici ID-ul tău GA4 (ex: 'G-ABC123XYZ'). Cât timp e gol, nu se încarcă nimic.
  var GA_ID = '';

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function loadGA() {
    if (!GA_ID || window.__gaLoaded) return;
    window.__gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }
  // Evenimente de conversie (apar în GA4 dacă e activ)
  window.trackEvent = function (name, params) {
    if (window.gtag) gtag('event', name, params || {});
  };

  function banner() {
    if (get('cookie_consent')) { if (get('cookie_consent') === 'accepted') loadGA(); return; }
    var b = document.createElement('div');
    b.id = 'cookie-banner';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Acord cookie-uri');
    b.innerHTML =
      '<p>Folosim cookie-uri de analiză doar dacă ești de acord. ' +
      '<a href="cookies.html">Află mai multe</a></p>' +
      '<div class="cb-btns"><button type="button" data-c="refused">Refuz</button>' +
      '<button type="button" data-c="accepted" class="cb-ok">Accept</button></div>';
    var css = document.createElement('style');
    css.textContent =
      '#cookie-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:560px;margin:0 auto;' +
      'background:rgba(10,10,20,.97);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.12);border-radius:14px;' +
      'padding:14px 18px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;box-shadow:0 10px 40px rgba(0,0,0,.5)}' +
      '#cookie-banner p{color:#cbd5e1;font-size:.85rem;margin:0;flex:1;min-width:200px;line-height:1.5}' +
      '#cookie-banner a{color:#93c5fd;text-decoration:underline}' +
      '#cookie-banner .cb-btns{display:flex;gap:10px}' +
      '#cookie-banner button{padding:8px 18px;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:transparent;color:#94a3b8;font-size:.83rem;font-weight:500;cursor:pointer;font-family:inherit}' +
      '#cookie-banner .cb-ok{border:none;background:#2563eb;color:#fff;font-weight:600}' +
      '@media(max-width:768px){#cookie-banner{bottom:84px}}';
    document.head.appendChild(css);
    document.body.appendChild(b);
    b.addEventListener('click', function (e) {
      var v = e.target.getAttribute && e.target.getAttribute('data-c');
      if (!v) return;
      set('cookie_consent', v);
      b.remove();
      if (v === 'accepted') loadGA();
    });
  }

  // Lightbox video (pagini cu .js-video)
  function lightbox() {
    var items = document.querySelectorAll('.js-video');
    if (!items.length) return;
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = '<div class="lightbox-inner"><button type="button" class="lightbox-close" aria-label="Închide">✕</button><iframe title="Testimonial video" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe></div>';
    document.body.appendChild(lb);
    var frame = lb.querySelector('iframe');
    function close() { frame.src = ''; lb.classList.remove('open'); document.body.style.overflow = ''; }
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lightbox-close')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    items.forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var id = el.getAttribute('data-yt');
        lb.querySelector('.lightbox-inner').classList.toggle('vertical', el.getAttribute('data-vertical') === '1');
        frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
        window.trackEvent('video_play', { video_id: id });
      });
    });
  }

  // Click-uri pe WhatsApp / telefon / email = lead-uri în GA4
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (h.indexOf('wa.me') > -1) window.trackEvent('contact_whatsapp');
    else if (h.indexOf('tel:') === 0) window.trackEvent('contact_telefon');
    else if (h.indexOf('mailto:') === 0) window.trackEvent('contact_email');
    else if (h.indexOf('calendly.com') > -1) window.trackEvent('calendly_click');
  });

  function init() { banner(); lightbox(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
