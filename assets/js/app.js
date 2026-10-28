/* TM Isı Sistemleri — site davranışları */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const S = window.TMStore;
  const SET = S.settings();
  const P = S.products().filter(p => !p.hidden);
  const byId = Object.fromEntries(P.map(p => [p.id, p]));
  const digits = v => { let d = String(v || '').replace(/\D/g, ''); if (d.startsWith('0')) d = '90' + d.slice(1); else if (d.length === 10) d = '90' + d; return d; };
  const WA = digits(SET.wa) || '905302163800';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = (id) => `<svg><use href="#${id}"/></svg>`;
  const EDIT = new URLSearchParams(location.search).has('edit') && window.parent !== window;

  const CATS = S.cats();
  const catName = Object.fromEntries(CATS.map(c => [c.id, c.name]));

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
    if (p.photo && p.photo.startsWith('idb:')) return `<img data-idb="${p.photo}" alt="${esc(p.t)}">`;
    if (p.photo) return `<img src="${esc(p.photo)}" alt="${esc(p.t)}" loading="lazy">`;
    return `<span class="ph"><svg><use href="#i-mark"/></svg><small>Görsel hazırlanıyor</small></span>`;
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

  function catImg(c, cover) {
    const cls = cover ? ' class="cat__cover"' : '';
    if (c.photo && c.photo.startsWith('idb:')) return `<img${cls} data-idb="${c.photo}" alt="">`;
    const src = c.photo || (cover && c.cover) || `assets/img/urunler/${c.img}.jpg`;
    return `<img${cls} src="${esc(src)}" alt="" loading="lazy">`;
  }

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
        <div class="cat__art">${catImg(c, i === 0)}</div>
        <div class="cat__body"><div><span class="cat__n">${String(i + 1).padStart(2, '0')} · ${n} ürün</span><h3>${esc(c.name)}</h3><p>${esc(c.desc)}</p></div><span class="cat__go">${icon('i-arrow')}</span></div></a>`;
    }).join('');
    const rail = $('[data-rail]');
    if (rail) {
      rail.innerHTML = P.filter(p => p.featured).map((p, i) => card(p, i).replace('data-open=', 'data-link=')).join('');
      rail.addEventListener('click', e => {
        const a = e.target.closest('[data-add]'); if (a) { e.stopPropagation(); addFeedback(a.dataset.add); return; }
        const c = e.target.closest('[data-link]'); if (c) go('urunler.html?urun=' + c.dataset.link);
      });
      rail.addEventListener('scroll', req, { passive: true });
      const by = () => rail.querySelector('.card').offsetWidth + 18;
      $('[data-rail-prev]')?.addEventListener('click', () => rail.scrollBy({ left: -by(), behavior: 'smooth' }));
      $('[data-rail-next]')?.addEventListener('click', () => rail.scrollBy({ left: by(), behavior: 'smooth' }));
    }
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
      `<button class="f-cat" type="button" data-kat="${c.id}">${c.name}<em>${c.id ? P.filter(p => p.c === c.id).length : P.length}</em></button>`).join('');
    const brands = [...new Map(P.filter(p => p.b).map(p => [p.b, p.bn])).entries()].sort((a, b) => a[1].localeCompare(b[1], 'tr'));
    $('[data-fbrands]').innerHTML = `<button class="pill" type="button" data-marka="">Tümü</button>` + brands.map(([k, n]) => `<button class="pill" type="button" data-marka="${k}">${esc(n)}</button>`).join('');

    function render() {
      const qq = norm(st.q.trim());
      const list = P.filter(p => (!st.kat || p.c === st.kat) && (!st.marka || p.b === st.marka) && (!qq || norm(p.t + ' ' + p.bn + ' ' + catName[p.c]).includes(qq)));
      grid.innerHTML = list.map(card).join(''); S.hydrate(grid);
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
      const inf = S.info(p);
      $('[data-pm-art]', m).innerHTML = visual(p);
      $('[data-pm-brand]', m).textContent = p.bn;
      $('[data-pm-title]', m).textContent = p.t;
      $('[data-pm-desc]', m).textContent = inf.desc;
      $('[data-pm-feat]', m).innerHTML = inf.feats.filter(Boolean).map(x => `<li>${esc(x)}</li>`).join('');
      $('[data-pm-spec]', m).innerHTML = [
        ['Kategori', catName[p.c]], ['Marka', p.bn], ['Kullanım', inf.use],
        ['Montaj', 'Uzman ekibimizce yapılır'], ['Garanti', inf.warranty],
        ...(inf.comm ? [['Haberleşme', inf.comm]] : [])
      ].filter(r => r[1]).map(([k, v]) => `<li><span>${k}</span><b>${esc(v)}</b></li>`).join('');
      const add = $('[data-pm-add]', m);
      const sync = () => { const on = cart.has(id); add.innerHTML = `${icon(on ? 'i-check' : 'i-plus')} <span>${on ? 'Listede — teklif al' : 'Teklif listesine ekle'}</span>`; add.classList.toggle('btn--navy', on); };
      sync();
      add.onclick = () => { if (cart.has(id)) { location.href = 'teklif.html'; return; } addFeedback(id); sync(); };
      $('[data-pm-wa]', m).href = `https://wa.me/${WA}?text=${encodeURIComponent('Merhaba, "' + p.t + '" ürünü hakkında bilgi ve fiyat almak istiyorum.')}`;
      S.hydrate(m); openModal(m); setParam('urun', id);
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
    const mail = `mailto:${SET.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    body.innerHTML = ok
      ? `<div class="ok">${icon('i-check')}</div><h3 id="sent-title">Talebiniz alındı</h3><p>En kısa sürede, en geç 24 saat içinde size dönüş yapacağız. Acil durumlar için bizi arayabilirsiniz.</p><a class="btn btn--block" href="tel:+${digits(SET.tel1)}">${icon('i-phone')} ${esc(SET.tel1)}</a>`
      : `<div class="ok" style="background:var(--red-soft);color:var(--red)">${icon('i-doc')}</div><h3 id="sent-title">Talebiniz kaydedildi</h3><p>Ekibimiz en kısa sürede size dönüş yapacak. Dilerseniz talebinizi aşağıdan WhatsApp ya da e-posta ile de hemen iletebilirsiniz; bilgileriniz otomatik doldurulur.</p>
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
      try {
        const fields = {};
        $$('input[name]:not([type=hidden]):not([type=file]):not([name=website]), select[name], textarea[name]', form).forEach(el => {
          if (el.type === 'checkbox') { if (el.checked) fields['Montaj dahil'] = 'Evet'; return; }
          const lab = (form.querySelector(`label[for="${el.id}"]`)?.textContent || el.name).replace('*', '').trim();
          if (el.value.trim()) fields[lab] = el.value.trim();
        });
        const list = form.querySelector('[data-list-field]')?.value;
        S.addRequest({ id: Date.now().toString(36), tur: form.dataset.form, tarih: new Date().toISOString(), fields, liste: list || '', okundu: false });
      } catch (err) { }
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
    if (EDIT) return;
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || !/(\.html|\/)$/.test(u.pathname)) return;
    if (u.pathname === location.pathname && u.search === location.search) return; // aynı sayfa / çapa
    e.preventDefault();
    go(u.href);
  });
  addEventListener('pageshow', e => { if (e.persisted) document.documentElement.classList.remove('pt-out', 'pt-enter', 'pt-intro'); });
  if (document.documentElement.classList.contains('pt-enter')) setTimeout(() => document.documentElement.classList.remove('pt-enter'), 1100);
  if (document.documentElement.classList.contains('pt-intro')) setTimeout(() => document.documentElement.classList.remove('pt-intro'), 2000);
  window.TMgo = go;

  TMContent.apply({ S, SET, digits, EDIT });
  common(); home(); catalog(); quote(); contact(); faqNav();
  S.hydrate();
  vis();
  setTimeout(vis, 300);
})();
