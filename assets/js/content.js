/* TM Isı Sistemleri — panelden gelen içerik değişiklikleri
   - Metinler: sayfadaki her yazı, orijinal metninden türetilen sabit bir anahtarla eşleşir (TMStore.texts)
   - Görseller: sayfadaki fotoğraflar orijinal yollarıyla eşleşir (TMStore.images)
   - Ayarlar: telefon, WhatsApp, e-posta, adres, Instagram ve logo sitenin her yerinde değiştirilir
   - Düzenleme modu: site panel içinde ?edit=1 ile açıldığında yazıya tıklayıp yerinde düzenleme */
(function () {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const SEL = 'h1,h2,h3,h4,p,summary,label,small,em,figcaption b,figcaption span,.eyebrow,.btn,.nav a,.drawer nav a,.topbar a,' +
    '.footer li,.footer h4,.footer__bottom span,.bullets b,.bullets span,.hero__bar b,.tile b,.person b,.person a,.stat > span,' +
    '.crumbs a,.crumbs span,.note span,.f-block h4,.qempty,.formula,.value .n,.big';
  const EXCL = '[data-grid],[data-rail],[data-cats],[data-fcats],[data-fbrands],[data-qlist],[data-marquee],[data-chips],' +
    '[data-count-line],[data-file-list],.modal,.pt,.toast,.mbar,.cart-btn,.wa-float,[data-sent-body],.brand,.stat b,.drop,.socials';
  const ALLOWED = { B: 1, STRONG: 1, I: 1, EM: 1, BR: 1, SPAN: 1, SMALL: 1 };

  function hash(t) { let h = 5381; for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
  const norm = t => t.replace(/\s+/g, ' ').trim();

  function sanitize(html) {
    const tp = document.createElement('template'); tp.innerHTML = html;
    (function walk(n) {
      [...n.childNodes].forEach(c => {
        if (c.nodeType === 3) return;
        if (c.nodeType !== 1 || !ALLOWED[c.tagName]) {
          if (c.nodeType === 1) { walk(c); c.replaceWith(...c.childNodes); } else c.remove();
          return;
        }
        const keep = c.tagName === 'SPAN' ? (c.getAttribute('class') || '').split(/\s+/).filter(x => ['serif', 'line', 'tx'].includes(x)).join(' ') : '';
        [...c.attributes].forEach(a => c.removeAttribute(a.name));
        if (keep) c.setAttribute('class', keep);
        walk(c);
      });
    })(tp.content);
    return tp.innerHTML.trim();
  }

  // ikon içeren öğelerde yalnızca yazı kısmını düzenlenebilir yap
  function textTarget(el) {
    const iconish = [...el.children].some(c => c.tagName === 'svg' || (c.tagName === 'I' && !c.textContent.trim()));
    if (!iconish) return [el];
    const out = [];
    [...el.childNodes].forEach(n => {
      if (n.nodeType === 3 && n.textContent.trim()) {
        const sp = document.createElement('span'); sp.className = 'tx'; sp.textContent = n.textContent.trim();
        n.replaceWith(sp); out.push(sp);
      } else if (n.nodeType === 1 && n.classList.contains('tx')) out.push(n);
    });
    return out;
  }

  // sayfadaki düzenlenebilir yazıları sabit anahtarlarıyla toplar
  function collect() {
    const page = document.body.dataset.page || 'sayfa';
    let cands = $$(SEL).filter(el => !el.closest(EXCL) && norm(el.textContent));
    cands = cands.filter(el => !cands.some(o => o !== el && el.contains(o)));
    const seen = {}, out = [];
    cands.forEach(el => textTarget(el).forEach(t => {
      const scope = t.closest('header,.topbar,footer,.drawer') ? 'g' : page;
      let k = scope + ':' + t.tagName.toLowerCase() + ':' + hash(norm(t.textContent));
      seen[k] = (seen[k] || 0) + 1; if (seen[k] > 1) k += '-' + seen[k];
      t.dataset.k = k; t._orig = t.innerHTML; out.push(t);
    }));
    return out;
  }
  function collectImages() {
    return $$('img[src]').filter(im => !im.closest(EXCL) && !im.closest('[data-pm-art]')).map(im => {
      im.dataset.ik = 'img:' + im.getAttribute('src'); im._orig = im.getAttribute('src'); return im;
    });
  }

  /* ---------- ayarlar: telefon / e-posta / adres / Instagram ---------- */
  function phoneForms(v, digits) {
    const d = digits(v); if (d.length !== 12) return null;
    const r = d.slice(2);
    return { d, intl: `+90 ${r.slice(0, 3)} ${r.slice(3, 6)} ${r.slice(6, 8)} ${r.slice(8)}`, local: `0${r.slice(0, 3)} ${r.slice(3, 6)} ${r.slice(6, 8)} ${r.slice(8)}` };
  }
  function applySettings(S, SET, digits) {
    const D = S.SETTINGS, textRep = [], hrefRep = [];
    const ph = (key) => {
      const o = phoneForms(D[key], digits), n = phoneForms(SET[key], digits);
      if (!o || !n || o.d === n.d) return;
      textRep.push([o.intl, n.intl], [o.local, n.local]);
      hrefRep.push([new RegExp('^tel:\\+' + o.d + '$'), 'tel:+' + n.d]);
      if (key === 'tel2') hrefRep.push([new RegExp('wa\\.me/' + o.d), 'wa.me/' + n.d]);
    };
    ph('tel1'); ph('tel2');
    const ow = digits(D.wa), nw = digits(SET.wa);
    if (nw && ow !== nw) hrefRep.push([new RegExp('wa\\.me/' + ow + '(?=[/?]|$)'), 'wa.me/' + nw]);
    if (SET.email && SET.email !== D.email) { textRep.push([D.email, SET.email]); hrefRep.push([new RegExp('^mailto:' + D.email.replace(/\./g, '\\.')), 'mailto:' + SET.email]); }
    if (SET.adres && SET.adres !== D.adres) textRep.push([D.adres, SET.adres]);
    if (SET.instagram && SET.instagram !== D.instagram) {
      const ni = SET.instagram.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '');
      textRep.push(['@' + D.instagram, '@' + ni]); hrefRep.push([new RegExp('instagram\\.com/' + D.instagram), 'instagram.com/' + ni]);
    }
    if (textRep.length) {
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n; while ((n = w.nextNode())) {
        let t = n.nodeValue, c = t;
        textRep.forEach(([a, b]) => { if (c.includes(a)) c = c.split(a).join(b); });
        if (c !== t) n.nodeValue = c;
      }
    }
    if (hrefRep.length) $$('a[href]').forEach(a => {
      let h = a.getAttribute('href'), c = h;
      hrefRep.forEach(([re, b]) => { c = c.replace(re, b); });
      if (c !== h) a.setAttribute('href', c);
    });
    if (SET.adres !== D.adres) $$('#harita iframe').forEach(f => { f.src = 'https://www.google.com/maps?q=' + encodeURIComponent(SET.adres) + '&output=embed'; });
    if (SET.logo) S.imgGet(SET.logo).then(u => {
      if (!u) return;
      $$('.brand').forEach(b => { b.innerHTML = `<img class="brand__img" src="${u}" alt="${SET.firma}">`; });
      $$('.pt__logo').forEach(b => { b.innerHTML = `<img class="pt__img" src="${u}" alt="">`; });
    });
  }

  /* ---------- düzenleme modu (panel içinde) ---------- */
  function editMode(S, texts, images, imgs) {
    const html = document.documentElement;
    html.classList.remove('pt-intro', 'pt-enter', 'pt-out');
    html.classList.add('tm-edit');
    $$('.rv,.rv-x,[data-steps]').forEach(el => el.classList.add('is-in'));
    const post = (msg) => { try { parent.postMessage(Object.assign({ tm: 1 }, msg), location.origin); } catch (e) { } };

    // bağlantılar ve formlar çalışmasın
    document.addEventListener('click', e => {
      const a = e.target.closest('a'); if (a) e.preventDefault();
    }, true);
    document.addEventListener('submit', e => e.preventDefault(), true);

    const save = (el) => {
      el.removeAttribute('contenteditable');
      const v = sanitize(el.innerHTML), k = el.dataset.k;
      const t = S.texts();
      if (v === sanitize(el._orig)) delete t[k]; else t[k] = v;
      S.set('texts', t);
      el.innerHTML = v;
      post({ type: 'saved', what: 'Metin' });
    };
    document.addEventListener('click', e => {
      const el = e.target.closest('[data-k]');
      if (!el || el.isContentEditable) return;
      e.preventDefault(); e.stopPropagation();
      el.setAttribute('contenteditable', 'true'); el.focus();
      const r = document.createRange(); r.selectNodeContents(el); r.collapse(false);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    }, true);
    document.addEventListener('focusout', e => { const el = e.target.closest && e.target.closest('[data-k][contenteditable]'); if (el) save(el); });
    document.addEventListener('keydown', e => {
      const el = e.target.closest && e.target.closest('[data-k][contenteditable]'); if (!el) return;
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); el.blur(); }
      if (e.key === 'Escape') { el.innerHTML = texts[el.dataset.k] || el._orig; el.blur(); }
    });
    document.addEventListener('paste', e => {
      if (!e.target.closest || !e.target.closest('[data-k][contenteditable]')) return;
      e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain'));
    });

    // görseller
    const fin = document.createElement('input'); fin.type = 'file'; fin.accept = 'image/*'; fin.hidden = true; document.body.appendChild(fin);
    let target = null;
    const pick = (im) => { target = im; fin.value = ''; fin.click(); };
    fin.addEventListener('change', async () => {
      const f = fin.files[0]; if (!f || !target) return;
      try {
        const data = await S.readImage(f, 1920);
        const ref = await S.imgPut(data);
        const m = S.images(); m[target.dataset.ik] = ref; S.set('images', m);
        target.src = data; post({ type: 'saved', what: 'Görsel' });
      } catch (err) { post({ type: 'error', msg: 'Görsel yüklenemedi' }); }
    });
    imgs.forEach(im => {
      if (im.closest('.hero__bg')) {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'tm-imgbtn';
        b.textContent = 'Arka plan görselini değiştir';
        b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); pick(im); });
        im.closest('.hero').appendChild(b);
      } else {
        im.classList.add('tm-img');
        im.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); pick(im); }, true);
      }
    });
    post({ type: 'ready', page: document.body.dataset.page });
  }

  window.TMContent = {
    apply({ S, SET, digits, EDIT }) {
      const texts = S.texts(), images = S.images();
      const els = collect();
      els.forEach(el => { const v = texts[el.dataset.k]; if (v != null) el.innerHTML = sanitize(v); });
      const imgs = collectImages();
      imgs.forEach(im => { const r = images[im.dataset.ik]; if (r) { if (r.startsWith('idb:')) { im.removeAttribute('src'); im.dataset.idb = r; } else im.src = r; } });
      applySettings(S, SET, digits);
      if (EDIT) editMode(S, texts, images, imgs);
    },
    sanitize
  };
})();
