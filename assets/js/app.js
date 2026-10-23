/* TM Isı Sistemleri — site davranışları */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const P = window.TM_PRODUCTS || [];
  const PHOTOS = window.TM_PHOTOS || {};
  const byId = Object.fromEntries(P.map(p => [p.id, p]));
  const WA = '905302163800';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = (id) => `<svg><use href="#${id}"/></svg>`;

  const CATS = [
    { id: 'kalorimetre', name: 'Kalorimetreler', art: 'heat-us', desc: 'Ultrasonik, mekanik ve büyük çaplı ısı sayaçları ile bireysel ısı paylaşımı.' },
    { id: 'su-sayaci', name: 'Su Sayaçları', art: 'water-cold', desc: 'Sıcak, soğuk, ultrasonik ve haberleşmeli su sayaçları.' },
    { id: 'okuma', name: 'Okuma Cihazları', art: 'converter', desc: 'M-Bus konvertörler ve merkezi okuma birimleri.' },
    { id: 'pompa', name: 'Pompa Sistemleri', art: 'pump-circ', desc: 'Sirkülasyon pompası, hidrofor, dalgıç pompa ve ısı pompası.' },
    { id: 'vana', name: 'Vana ve Kontrol', art: 'valve3', desc: 'Fark basınç, 3 yollu vana, termostat, kollektör ve emniyet ekipmanı.' },
    { id: 'tesisat', name: 'Tesisat Ürünleri', art: 'tank', desc: 'Genleşme tankı, rekor, conta, pil ve bağlantı elemanları.' }
  ];
  const catName = Object.fromEntries(CATS.map(c => [c.id, c.name]));

  // Ürün tipine göre açıklama (model bazlı teknik değer uydurmadan, genel ve doğru bilgiler)
  const DESC = {
    'heat-us': ['Hareketli parçası olmayan ultrasonik ölçüm prensibiyle ısı tüketimini uzun yıllar kararlı şekilde ölçer. Merkezi ısıtmalı binalarda daire girişine monte edilerek bireysel ısı paylaşımı sağlar.', ['Ultrasonik ölçüm', 'Hareketli parça yok', 'Düşük debide hassas', 'Uzaktan okumaya uygun*'], 'Daire tipi ısı paylaşımı'],
    'heat-mech': ['Kanatlı (türbin) debi ölçümüne dayanan, ekonomik ve kanıtlanmış ısı sayacı. Gidiş-dönüş sıcaklık sensörleriyle tüketilen enerjiyi hesaplar.', ['Mekanik ölçüm', 'Ekonomik çözüm', 'Kolay montaj'], 'Daire tipi ısı paylaşımı'],
    'heat-flange': ['Büyük çaplı hatlar için flanşlı gövdeli ultrasonik ısı sayacı. Kazan dairesi, bina girişi, blok ve ticari tesislerde toplam enerji tüketimini ölçer.', ['Ultrasonik ölçüm', 'Flanşlı bağlantı', 'Büyük debi', 'Ayrı hesaplayıcı ünite'], 'Kazan dairesi / ticari tesis'],
    'water-hot': ['Sıcak su hattı için yüksek sıcaklığa dayanıklı malzemeyle üretilen su sayacı. Kırmızı işaretiyle soğuk su sayacından kolayca ayrılır.', ['Sıcak su', 'Mekanik sayaç', 'Okunaklı mekanik gösterge'], 'Sıcak kullanım suyu'],
    'water-cold': ['Şebeke suyu tüketimini hacim (m³) cinsinden ölçen soğuk su sayacı. Konut ve iş yerlerinde güvenilir ölçüm sağlar.', ['Soğuk su', 'Mekanik sayaç', 'Okunaklı mekanik gösterge'], 'Konut / iş yeri'],
    'water-us': ['Ultrasonik prensiple çalışan, hareketli parçası olmayan su sayacı. Düşük debilerde de hassas ölçüm sunar.', ['Ultrasonik ölçüm', 'Dijital ekran', 'Hareketli parça yok'], 'Konut / iş yeri'],
    'water-radio': ['Haberleşme modüllü su sayacı; okuma verisini kablolu/kablosuz ağ üzerinden göndererek dairelere girmeden merkezi okuma sağlar.', ['Uzaktan okuma', 'Merkezi sisteme bağlanır', 'Sıcak / soğuk su'], 'Uzaktan okumalı binalar'],
    'converter': ['Bina içindeki ısı ve su sayaçlarından M-Bus hattı üzerinden veri toplayan konvertör / okuma birimi. Tüm sayaçların merkezi olarak okunmasını sağlar.', ['M-Bus', 'Merkezi okuma', 'Çoklu sayaç'], 'Bina okuma sistemi'],
    'pump-circ': ['Kalorifer ve sıcak su devrelerinde suyun dolaşımını sağlayan sirkülasyon pompası. Frekans kontrollü modeller ihtiyaca göre devir ayarlayarak enerji tasarrufu sağlar.', ['Isıtma devresi', 'Dişli (rakorlu) bağlantı', 'Sessiz çalışma'], 'Isıtma / sıcak su devresi'],
    'pump-flange': ['Merkezi sistemler ve büyük tesisler için flanşlı bağlantılı sirkülasyon pompası.', ['Flanşlı bağlantı', 'Yüksek debi', 'Merkezi sistem'], 'Merkezi ısıtma / soğutma'],
    'pump-twin': ['İki pompa gövdesini tek gövdede birleştiren ikiz sirkülasyon pompası; yedekli ya da paralel çalışma ile kesintisiz dolaşım sağlar.', ['İkiz gövde', 'Yedekli çalışma', 'Flanşlı bağlantı'], 'Merkezi sistem'],
    'pump-booster': ['Şebeke basıncının yetersiz kaldığı yerlerde suyu istenen basınçta ileten hidrofor / basınçlandırma sistemi.', ['Basınçlandırma', 'Basınç tankı', 'Otomatik çalışma'], 'Bina su tesisatı'],
    'pump-sub': ['Kuyu, depo ve drenaj uygulamaları için suya daldırılarak çalışan dalgıç pompa.', ['Dalgıç tip', 'Kuyu / depo', 'Drenaj'], 'Kuyu / depo / drenaj'],
    'pump-solar': ['Güneş enerjili sıcak su sistemlerinde kollektör devresinin sirkülasyonu için kullanılan pompa.', ['Güneş enerjisi devresi', 'Sirkülasyon'], 'Güneş enerjili sistemler'],
    'heatpump': ['Havadaki ısıyı kullanarak yüksek verimle ısıtma ve sıcak su üreten ısı pompası.', ['Yüksek verim', 'Isıtma + sıcak su', 'Yenilenebilir enerji'], 'Konut / ticari ısıtma'],
    'valve3': ['Isıtma devrelerinde akış yönünü veya karışımı kontrol eden motorlu vana çözümleri. Otomasyon sistemleriyle birlikte çalışır.', ['Motorlu kontrol', 'Otomasyon uyumlu', 'Isıtma devresi'], 'Isıtma kontrolü'],
    'valve': ['Isıtma ve su tesisatlarında basınç, debi ve sıcaklık kontrolü için kullanılan vana ve emniyet ekipmanı.', ['Tesisat kontrolü', 'Pirinç gövde', 'Uzun ömür'], 'Isıtma / su tesisatı'],
    'thermostat': ['Ortam sıcaklığını ayarlayarak ısıtma sistemini kontrol eden oda termostatı; konforu artırır, gereksiz tüketimi azaltır.', ['Sıcaklık kontrolü', 'Enerji tasarrufu', 'Kolay kullanım'], 'Ev / ofis'],
    'manifold': ['Yerden ısıtma ve dağıtım tesisatlarında devreleri tek noktadan dağıtıp toplayan kollektör.', ['Çok devreli', 'Debi ayarı', 'Yerden ısıtma'], 'Yerden ısıtma'],
    'gauge': ['Tesisat basıncını anlık izlemek için kullanılan manometre.', ['Basınç göstergesi', 'Tesisat izleme'], 'Isıtma / su tesisatı'],
    'station': ['Daireye gelen ısıtma ve sıcak su devresini tek kompakt ünitede toplayan ısı istasyonu; sayaç bağlantısına uygundur.', ['Kompakt ünite', 'Isıtma + sıcak su', 'Sayaç bağlantısı'], 'Daire tipi ısı dağıtımı'],
    'macerator': ['Bodrum, banyo ve şebekeye kot farkı olan alanlarda atık suyu öğüterek / pompalayarak tahliye eden cihaz.', ['Atık su tahliyesi', 'Kompakt', 'Kolay montaj'], 'Bodrum / banyo'],
    'vent': ['Tesisatta biriken havayı otomatik olarak tahliye ederek verimli ve sessiz çalışma sağlar.', ['Otomatik hava atma', 'Pirinç gövde'], 'Isıtma tesisatı'],
    'tank': ['Isıtma ve su tesisatlarında genleşen suyu karşılayarak basıncı dengede tutan genleşme tankı.', ['Basınç dengesi', 'Membranlı', 'Isıtma / sıhhi su'], 'Isıtma / su tesisatı'],
    'battery': ['Isı ve su sayaçları için yedek pil.', ['Sayaç uyumlu'], 'Sayaç bakımı'],
    'gasket': ['Sayaç ve vana bağlantılarında sızdırmazlık için conta grupları.', ['Sızdırmazlık', 'Farklı ölçüler'], 'Tesisat bağlantıları'],
    'fitting': ['Sayaç, pompa ve tank bağlantıları için rekor, redüksiyon ve bağlantı elemanları.', ['Pirinç', 'Farklı çaplar'], 'Tesisat bağlantıları']
  };
  const isMeter = p => p.c === 'kalorimetre' || p.c === 'su-sayaci';

  /* ---------- teklif listesi (localStorage) ---------- */
  const KEY = 'tm_teklif_v1';
  const cart = {
    get() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return this._m || []; } },
    set(v) { this._m = v; try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { } badge(); document.dispatchEvent(new Event('cart')); },
    has(id) { return this.get().some(x => x.id === id); },
    toggle(id) { const v = this.get(); const i = v.findIndex(x => x.id === id); if (i > -1) v.splice(i, 1); else v.push({ id, q: 1 }); this.set(v); return i === -1; },
    qty(id, q) { this.set(this.get().map(x => x.id === id ? { ...x, q: Math.max(1, q) } : x)); }
  };
  function badge() {
    const n = cart.get().length;
    $$('[data-cart-n]').forEach(el => { el.textContent = n; el.classList.toggle('has', n > 0); });
  }
  let toastT;
  function toast(msg) {
    const t = $('.toast'); if (!t) return;
    $('span', t).textContent = msg; t.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 2600);
  }
  function addFeedback(id) {
    const on = cart.toggle(id);
    toast(on ? 'Teklif listesine eklendi' : 'Listeden çıkarıldı');
    $$('.cart-btn').forEach(b => { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); });
    return on;
  }

  /* ---------- görsel ---------- */
  function visual(p) {
    if (PHOTOS[p.id]) return `<img src="assets/img/urunler/${PHOTOS[p.id]}" alt="${esc(p.t)}" loading="lazy">`;
    return TMArt.svg(p.a, { title: p.t });
  }
  function card(p, i = 0) {
    const on = cart.has(p.id);
    return `<article class="card anim-gate enter" style="animation-delay:${Math.min(i, 12) * 40}ms" data-open="${p.id}" tabindex="0" aria-label="${esc(p.t)}">
      <div class="card__art"><span class="card__tag">${esc(catName[p.c])}</span>${visual(p)}
        <button class="card__add ${on ? 'is-on' : ''}" type="button" data-add="${p.id}" aria-label="Teklif listesine ekle">${icon(on ? 'i-check' : 'i-plus')}</button></div>
      <div class="card__body"><span class="card__brand">${esc(p.bn)}</span><span class="card__t">${esc(p.t)}</span>
        <span class="card__meta">Detayları gör ${icon('i-arrow')}</span></div>
    </article>`;
  }
  function syncAddButtons() {
    $$('[data-add]').forEach(b => { const on = cart.has(b.dataset.add); b.classList.toggle('is-on', on); b.innerHTML = icon(on ? 'i-check' : 'i-plus'); });
  }
  document.addEventListener('cart', syncAddButtons);

  /* ---------- görünürlük döngüsü (IO yerine kaydırma tabanlı: gizli panelde de çalışır) ---------- */
  let ticking = false;
  function vis() {
    ticking = false;
    const h = innerHeight;
    $$('.rv:not(.is-in), .rv-x:not(.is-in), [data-steps]:not(.is-in)').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < h * 0.9 && r.bottom > 0) el.classList.add('is-in');
    });
    $$('.anim-gate').forEach(el => {
      const r = el.getBoundingClientRect();
      el.classList.toggle('is-live', r.top < h + 100 && r.bottom > -100);
    });
    $$('[data-to]:not(.done), [data-count]:not(.done)').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < h * 0.9 && r.bottom > 0) countUp(el);
    });
    const hd = $('.header'); if (hd) hd.classList.toggle('is-solid', scrollY > 30);
  }
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(vis); } };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);

  function countUp(el) {
    el.classList.add('done');
    const to = parseInt(el.dataset.to || el.textContent, 10);
    const t0 = performance.now(), d = 1400;
    const step = t => { const k = Math.min(1, (t - t0) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* ---------- ortak ---------- */
  function common() {
    $$('[data-art]').forEach(el => { el.innerHTML = TMArt.svg(el.dataset.art, {}); });
    $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
    const dr = $('#drawer');
    $$('[data-drawer-open]').forEach(b => b.addEventListener('click', () => { dr.classList.add('is-open'); dr.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }));
    $$('[data-drawer-close], #drawer nav a').forEach(b => b.addEventListener('click', () => { dr.classList.remove('is-open'); dr.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }));
    const brands = new Set(P.map(p => p.b).filter(Boolean));
    $$('[data-count="products"]').forEach(el => el.dataset.to = P.length);
    $$('[data-count="brands"]').forEach(el => el.dataset.to = brands.size);
    badge();
  }

  /* ---------- modal yardımcıları ---------- */
  let lastFocus;
  function openModal(m) { lastFocus = document.activeElement; m.classList.add('is-open'); document.body.style.overflow = 'hidden'; setTimeout(() => $('.modal__close', m)?.focus(), 50); }
  function closeModal(m) { m.classList.remove('is-open'); document.body.style.overflow = ''; lastFocus?.focus?.(); }
  document.addEventListener('click', e => { const c = e.target.closest('[data-close]'); if (c) closeModal(c.closest('.modal')); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.modal.is-open').forEach(m => { closeModal(m); if (m.id === 'pmodal') setParam('urun', null); }); });

  /* ---------- anasayfa ---------- */
  function home() {
    const mq = $('[data-marquee]');
    if (mq) {
      const names = [...new Map(P.filter(p => p.b).map(p => [p.b, p.bn])).values()];
      const row = names.map(n => `<a class="marquee__item" href="urunler.html?marka=${encodeURIComponent(P.find(p => p.bn === n).b)}">${esc(n)}</a>`).join('');
      mq.innerHTML = row + row;
    }
    const cats = $('[data-cats]');
    if (cats) cats.innerHTML = CATS.map((c, i) => {
      const n = P.filter(p => p.c === c.id).length;
      return `<a class="cat rv anim-gate ${i === 0 ? 'cat--feature' : i === CATS.length - 1 ? 'cat--wide' : ''}" style="--d:${i}" href="urunler.html?kat=${c.id}">
        <div class="cat__art">${TMArt.svg(c.art, {})}</div>
        <div class="cat__body"><div><span class="cat__n">${String(i + 1).padStart(2, '0')} · ${n} ürün</span><h3>${c.name}</h3><p>${c.desc}</p></div><span class="cat__go">${icon('i-arrow')}</span></div></a>`;
    }).join('');
    const rail = $('[data-rail]');
    if (rail) {
      rail.innerHTML = rail.dataset.featured.split(',').map(id => byId[id]).filter(Boolean).map((p, i) => card(p, i).replace('data-open=', 'data-link=')).join('');
      rail.addEventListener('click', e => {
        const a = e.target.closest('[data-add]'); if (a) { e.stopPropagation(); addFeedback(a.dataset.add); return; }
        const c = e.target.closest('[data-link]'); if (c) go('urunler.html?urun=' + c.dataset.link);
      });
      rail.addEventListener('scroll', req, { passive: true });
      const by = () => rail.querySelector('.card').offsetWidth + 18;
      $('[data-rail-prev]')?.addEventListener('click', () => rail.scrollBy({ left: -by(), behavior: 'smooth' }));
      $('[data-rail-next]')?.addEventListener('click', () => rail.scrollBy({ left: by(), behavior: 'smooth' }));
    }
    // canlı kalorimetre verisi
    let kwh = 48213, t = 0;
    const live = () => {
      t += 1;
      const sup = 70 + Math.sin(t / 3) * 0.6, ret = 52.4 + Math.sin(t / 4 + 1) * 0.7, kw = 0.6 * 1.163 * (sup - ret);
      kwh += kw / 60;
      $$('[data-live="sup"]').forEach(el => el.textContent = sup.toFixed(1) + (el.closest('.readout') ? '°C' : '°'));
      $$('[data-live="ret"]').forEach(el => el.textContent = ret.toFixed(1) + (el.closest('.readout') ? '°C' : '°'));
      $$('[data-live="kw"]').forEach(el => el.textContent = kw.toFixed(1) + ' kW');
      $$('[data-live="kwh"]').forEach(el => el.textContent = Math.floor(kwh));
    };
    if ($('[data-live]') && !matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(live, 1200);
  }

  /* ---------- katalog ---------- */
  function setParam(k, v) {
    const u = new URL(location.href);
    if (v) u.searchParams.set(k, v); else u.searchParams.delete(k);
    history.replaceState(null, '', u);
  }
  function catalog() {
    const grid = $('[data-grid]'); if (!grid) return;
    const q0 = new URLSearchParams(location.search);
    const st = { kat: q0.get('kat') || '', marka: q0.get('marka') || '', q: q0.get('q') || '' };
    const qIn = $('[data-q]'); qIn.value = st.q;
    const norm = s => s.toLocaleLowerCase('tr').replace(/[ıi̇]/g, 'i').normalize('NFD').replace(/[̀-ͯ]/g, '');

    $('[data-fcats]').innerHTML = [{ id: '', name: 'Tüm ürünler', art: 'heat-mech' }, ...CATS].map(c =>
      `<button class="f-cat" type="button" data-kat="${c.id}"><span class="ico">${TMArt.svg(c.art, {})}</span>${c.name}<em>${c.id ? P.filter(p => p.c === c.id).length : P.length}</em></button>`).join('');
    const brands = [...new Map(P.filter(p => p.b).map(p => [p.b, p.bn])).entries()].sort((a, b) => a[1].localeCompare(b[1], 'tr'));
    $('[data-fbrands]').innerHTML = `<button class="pill" type="button" data-marka="">Tümü</button>` + brands.map(([k, n]) => `<button class="pill" type="button" data-marka="${k}">${esc(n)}</button>`).join('');

    function render() {
      const qq = norm(st.q.trim());
      const list = P.filter(p => (!st.kat || p.c === st.kat) && (!st.marka || p.b === st.marka) && (!qq || norm(p.t + ' ' + p.bn + ' ' + catName[p.c]).includes(qq)));
      grid.innerHTML = list.map(card).join('');
      $('[data-empty]').classList.toggle('is-on', !list.length);
      $('[data-count-line]').innerHTML = `<b>${list.length}</b> ürün`;
      $$('[data-kat]').forEach(b => b.classList.toggle('is-on', b.dataset.kat === st.kat));
      // seçili kategoride bulunan markaları göster
      const avail = new Set(P.filter(p => !st.kat || p.c === st.kat).map(p => p.b));
      $$('[data-marka]').forEach(b => { b.classList.toggle('is-on', b.dataset.marka === st.marka); b.hidden = b.dataset.marka && !avail.has(b.dataset.marka); });
      const chips = [];
      if (st.kat) chips.push(['kat', catName[st.kat]]);
      if (st.marka) chips.push(['marka', (brands.find(b => b[0] === st.marka) || [, st.marka])[1]]);
      if (st.q) chips.push(['q', '“' + st.q + '”']);
      $('[data-chips]').innerHTML = chips.map(([k, l]) => `<button type="button" data-unset="${k}">${esc(l)}</button>`).join('');
      setParam('kat', st.kat); setParam('marka', st.marka); setParam('q', st.q);
      req();
    }
    document.addEventListener('click', e => {
      const k = e.target.closest('[data-kat]'); if (k) { st.kat = k.dataset.kat; if (st.marka && !P.some(p => p.c === st.kat && p.b === st.marka) && st.kat) st.marka = ''; render(); }
      const m = e.target.closest('[data-marka]'); if (m) { st.marka = m.dataset.marka; render(); }
      const u = e.target.closest('[data-unset]'); if (u) { st[u.dataset.unset] = ''; if (u.dataset.unset === 'q') qIn.value = ''; render(); }
      if (e.target.closest('[data-reset]')) { st.kat = st.marka = st.q = ''; qIn.value = ''; render(); }
    });
    let qt; qIn.addEventListener('input', () => { clearTimeout(qt); qt = setTimeout(() => { st.q = qIn.value; render(); }, 160); });

    const fl = $('#filters');
    $('[data-filter-open]')?.addEventListener('click', () => fl.classList.add('is-open'));
    $('[data-filter-close]')?.addEventListener('click', () => { fl.classList.remove('is-open'); scrollTo({ top: grid.getBoundingClientRect().top + scrollY - 140, behavior: 'smooth' }); });

    // ürün detayı
    const m = $('#pmodal');
    function open(id) {
      const p = byId[id]; if (!p) return;
      const [d, f, use] = DESC[p.a] || DESC.valve;
      $('[data-pm-art]', m).innerHTML = visual(p);
      $('[data-pm-brand]', m).textContent = p.bn;
      $('[data-pm-title]', m).textContent = p.t;
      $('[data-pm-desc]', m).textContent = d;
      $('[data-pm-feat]', m).innerHTML = f.map(x => `<li>${esc(x.replace('*', ''))}</li>`).join('');
      $('[data-pm-spec]', m).innerHTML = [
        ['Kategori', catName[p.c]], ['Marka', p.bn], ['Kullanım', use],
        ['Montaj', 'Uzman ekibimizce yapılır'], ['Garanti', isMeter(p) ? '5 yıl' : 'Üretici garantisi'],
        ...(f.some(x => x.includes('*')) ? [['Haberleşme', 'Modele göre M-Bus / kablosuz seçenekleri']] : [])
      ].map(([k, v]) => `<li><span>${k}</span><b>${esc(v)}</b></li>`).join('');
      const add = $('[data-pm-add]', m);
      const sync = () => { const on = cart.has(id); add.innerHTML = `${icon(on ? 'i-check' : 'i-plus')} <span>${on ? 'Listede — teklif al' : 'Teklif listesine ekle'}</span>`; add.classList.toggle('btn--navy', on); };
      sync();
      add.onclick = () => { if (cart.has(id)) { location.href = 'teklif.html'; return; } addFeedback(id); sync(); };
      $('[data-pm-wa]', m).href = `https://wa.me/${WA}?text=${encodeURIComponent('Merhaba, "' + p.t + '" ürünü hakkında bilgi ve fiyat almak istiyorum.')}`;
      openModal(m); setParam('urun', id);
    }
    grid.addEventListener('click', e => {
      const a = e.target.closest('[data-add]'); if (a) { e.stopPropagation(); addFeedback(a.dataset.add); return; }
      const c = e.target.closest('[data-open]'); if (c) open(c.dataset.open);
    });
    grid.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('[data-open]')) open(e.target.dataset.open); });
    m.addEventListener('click', e => { if (e.target.closest('[data-close]')) setParam('urun', null); });
    render();
    if (q0.get('urun')) open(q0.get('urun'));
  }

  /* ---------- formlar ---------- */
  function summary(form) {
    const fd = new FormData(form), L = [];
    const lab = el => (form.querySelector(`label[for="${el.id}"]`)?.textContent || el.name).replace('*', '').trim();
    $$('input[name]:not([type=hidden]):not([type=file]):not([name=website]), select[name], textarea[name]', form).forEach(el => {
      if (el.type === 'checkbox') { if (el.checked) L.push('Montaj dahil fiyat: Evet'); return; }
      if (el.value.trim()) L.push(`${lab(el)}: ${el.value.trim()}`);
    });
    const list = fd.get('liste'); if (list) L.push('\nTeklif listesi:\n' + list);
    return L.join('\n');
  }
  function validate(form) {
    let ok = true, first;
    $$('[required]', form).forEach(el => {
      const bad = !el.value.trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value));
      el.closest('.field').classList.toggle('err', bad);
      if (bad && !first) first = el; ok = ok && !bad;
    });
    if (first) { first.focus(); toast('Lütfen zorunlu alanları doldurun'); }
    return ok;
  }
  function sentView(body, ok, text, subject) {
    const wa = `https://wa.me/${WA}?text=${encodeURIComponent(subject + '\n\n' + text)}`;
    const mail = `mailto:satis@tmisisistemleri.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    body.innerHTML = ok
      ? `<div class="ok">${icon('i-check')}</div><h3 id="sent-title">Talebiniz alındı</h3><p>En kısa sürede, en geç 24 saat içinde size dönüş yapacağız. Acil durumlar için bizi arayabilirsiniz.</p><a class="btn btn--block" href="tel:+905302163800">${icon('i-phone')} 0530 216 38 00</a>`
      : `<div class="ok" style="background:var(--red-soft);color:var(--red)">${icon('i-doc')}</div><h3 id="sent-title">Talebiniz hazır</h3><p>Form şu an doğrudan iletilemedi. Aşağıdan tek dokunuşla WhatsApp ya da e-posta ile gönderebilirsiniz; bilgileriniz otomatik doldurulur.</p>
         <div style="display:grid;gap:10px"><a class="btn btn--wa" href="${wa}" target="_blank" rel="noopener">${icon('i-wa')} WhatsApp ile gönder</a><a class="btn btn--navy" href="${mail}">${icon('i-mail')} E-posta ile gönder</a><button class="btn btn--ghost" type="button" data-copy>${icon('i-copy')} Metni kopyala</button></div>`;
    const cp = $('[data-copy]', body);
    if (cp) cp.onclick = () => navigator.clipboard?.writeText(subject + '\n\n' + text).then(() => toast('Kopyalandı'));
  }
  function bindForm(form, subject, after) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validate(form)) return;
      if (form.website?.value) return;
      const btn = $('[data-submit]') || $('[type=submit]', form);
      btn.disabled = true; btn.style.opacity = .7;
      const text = summary(form);
      let ok = false;
      try {
        const fd = new FormData(form); fd.append('_tur', form.dataset.form);
        const r = await fetch('gonder.php', { method: 'POST', body: fd });
        ok = r.ok && (await r.json()).ok === true;
      } catch (err) { ok = false; }
      btn.disabled = false; btn.style.opacity = '';
      const m = $('#sentModal');
      sentView($('[data-sent-body]', m), ok, text, subject);
      openModal(m);
      if (ok) { form.reset(); after && after(); }
    });
    form.addEventListener('input', e => e.target.closest('.field')?.classList.remove('err'));
  }

  function quote() {
    const form = $('#quoteForm'); if (!form) return;
    const ql = $('[data-qlist]'), lf = $('[data-list-field]');
    function draw() {
      const v = cart.get().filter(x => byId[x.id]);
      lf.value = v.map(x => `• ${byId[x.id].t} — ${x.q} adet`).join('\n');
      ql.innerHTML = v.length ? v.map(x => {
        const p = byId[x.id];
        return `<div class="qitem anim-gate is-live"><span class="ico">${visual(p)}</span><div><b>${esc(p.t)}</b><small>${esc(p.bn)} · ${esc(catName[p.c])}</small></div>
          <div class="qty"><button type="button" data-dq="${p.id}" data-d="-1" aria-label="Azalt">−</button><input type="number" min="1" value="${x.q}" data-qin="${p.id}" aria-label="Adet"><button type="button" data-dq="${p.id}" data-d="1" aria-label="Arttır">+</button></div>
          <button class="rm" type="button" data-rm="${p.id}">Kaldır</button></div>`;
      }).join('') : `<div class="qempty">Listeniz boş. Katalogdan ürün ekleyebilir ya da formu doğrudan doldurabilirsiniz.</div>`;
      // liste varsa ürün alanlarını kolaylaştır
      const urun = $('#f-urun'), mk = $('#f-miktar'), kat = $('#f-kat');
      urun.required = mk.required = kat.required = !v.length;
      $$('.field label i', urun.closest('.panel')).forEach(i => i.style.visibility = v.length ? 'hidden' : '');
    }
    ql.addEventListener('click', e => {
      const d = e.target.closest('[data-dq]'); if (d) { const x = cart.get().find(y => y.id === d.dataset.dq); cart.qty(x.id, x.q + +d.dataset.d); }
      const r = e.target.closest('[data-rm]'); if (r) cart.toggle(r.dataset.rm);
    });
    ql.addEventListener('change', e => { const i = e.target.closest('[data-qin]'); if (i) cart.qty(i.dataset.qin, parseInt(i.value, 10) || 1); });
    document.addEventListener('cart', draw);
    draw();
    // dosyalar
    const drop = $('[data-drop]'), fin = $('[data-files]'), fl = $('[data-file-list]');
    const showFiles = () => {
      const files = [...fin.files], size = files.reduce((s, f) => s + f.size, 0);
      if (size > 10 * 1024 * 1024) { toast('Toplam dosya boyutu 10 MB\'ı aşamaz'); fin.value = ''; fl.innerHTML = ''; return; }
      fl.innerHTML = files.map(f => `<button type="button" data-unfile>${esc(f.name)}</button>`).join('');
    };
    fin.addEventListener('change', showFiles);
    fl.addEventListener('click', () => { fin.value = ''; fl.innerHTML = ''; });
    ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('is-over'); }));
    drop.addEventListener('drop', e => { fin.files = e.dataTransfer.files; showFiles(); });
    bindForm(form, 'Teklif Talebi — TM Isı Sistemleri', () => { cart.set([]); fl.innerHTML = ''; });
  }

  function contact() {
    const form = $('#contactForm'); if (form) bindForm(form, 'İletişim Formu — TM Isı Sistemleri');
  }

  function faqNav() {
    const links = $$('[data-faq-nav] a'); if (!links.length) return;
    addEventListener('scroll', () => {
      let cur = links[0];
      links.forEach(a => { const s = $(a.getAttribute('href')); if (s && s.getBoundingClientRect().top < 200) cur = a; });
      links.forEach(a => a.classList.toggle('is-on', a === cur));
    }, { passive: true });
  }

  /* ---------- sayfa geçişi (3D logo) ---------- */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function go(href) {
    if (reduced) { location.href = href; return; }
    try { sessionStorage.setItem('tm_pt', '1'); } catch (e) { }
    document.documentElement.classList.add('pt-out');
    setTimeout(() => { location.href = href; }, 600);
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || !/(\.html|\/)$/.test(u.pathname)) return;
    if (u.pathname === location.pathname && u.search === location.search) return; // aynı sayfa / çapa
    e.preventDefault();
    go(u.href);
  });
  addEventListener('pageshow', e => { if (e.persisted) document.documentElement.classList.remove('pt-out', 'pt-enter'); });
  if (document.documentElement.classList.contains('pt-enter')) setTimeout(() => document.documentElement.classList.remove('pt-enter'), 1100);
  window.TMgo = go;

  common(); home(); catalog(); quote(); contact(); faqNav();
  vis();
  setTimeout(vis, 300);
})();
