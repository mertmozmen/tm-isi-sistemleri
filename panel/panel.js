/* TM Isı Sistemleri — yönetim paneli */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const S = window.TMStore;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = id => `<svg><use href="#${id}"/></svg>`;
  const view = $('[data-view]');
  const ART = { kalorimetre: 'heat-us', 'su-sayaci': 'water-cold', okuma: 'converter', pompa: 'pump-circ', vana: 'valve', tesisat: 'fitting' };
  const PAGES = [['index', 'Anasayfa'], ['kurumsal', 'Kurumsal'], ['urunler', 'Ürünler'], ['teklif', 'Teklif İste'], ['sss', 'S.S.S'], ['iletisim', 'İletişim']];

  /* ---------- yardımcılar ---------- */
  let toastT;
  function toast(msg) {
    const t = $('.toast'); $('span', t).textContent = msg; t.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 2200);
  }
  function openModal(m) { m.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
  function closeModal(m) { m.classList.remove('is-open'); document.body.style.overflow = ''; }
  document.addEventListener('click', e => { const c = e.target.closest('[data-close]'); if (c) closeModal(c.closest('.modal')); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.modal.is-open').forEach(closeModal); });
  function confirmBox(title, text, okLabel = 'Onayla') {
    const m = $('#confirm');
    $('[data-cf-title]', m).textContent = title; $('[data-cf-text]', m).textContent = text;
    const ok = $('[data-cf-ok]', m); ok.textContent = okLabel;
    openModal(m);
    return new Promise(res => {
      ok.onclick = () => { closeModal(m); res(true); };
      $$('[data-close]', m).forEach(b => b.onclick = () => res(false));
    });
  }
  // site köküne göre yol (panel bir alt klasörde)
  const src = p => !p ? '' : (p.startsWith('idb:') || p.startsWith('data:') || /^https?:/.test(p)) ? p : '../' + p;
  function imgTag(ref, alt = '', cls = '') {
    if (!ref) return `<span class="ph ${cls}"><svg><use href="#i-mark"/></svg></span>`;
    if (ref.startsWith('idb:')) return `<img class="${cls}" data-idb="${ref}" alt="${esc(alt)}">`;
    return `<img class="${cls}" src="${esc(src(ref))}" alt="${esc(alt)}" loading="lazy">`;
  }
  const fmtDate = iso => { const d = new Date(iso); return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }) + ' · ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }); };
  const digits = v => { let d = String(v || '').replace(/\D/g, ''); if (d.startsWith('0')) d = '90' + d.slice(1); else if (d.length === 10) d = '90' + d; return d; };

  /* ---------- giriş ---------- */
  const AUTH = 'tm_panel_ok';
  const pass = () => S.get('password', 'tm2026');
  function enter() { $('#login').hidden = true; $('#app').hidden = false; route(); unread(); }
  $('#loginForm').addEventListener('submit', e => {
    e.preventDefault();
    if ($('#pw').value === pass()) { try { sessionStorage.setItem(AUTH, '1'); } catch (er) { } enter(); }
    else { $('#loginErr').hidden = false; $('#pw').select(); }
  });
  $('[data-logout]').addEventListener('click', () => { try { sessionStorage.removeItem(AUTH); } catch (er) { } location.hash = ''; location.reload(); });

  /* ---------- yönlendirme ---------- */
  const VIEWS = { genel: ['Genel bakış', genel], urunler: ['Ürünler', urunler], kategoriler: ['Kategoriler', kategoriler], duzenleyici: ['Sayfa düzenleyici', duzenleyici], ayarlar: ['Site ayarları', ayarlar], talepler: ['Talepler', talepler] };
  function route() {
    const k = (location.hash.slice(1) || 'genel').split('?')[0];
    const [title, fn] = VIEWS[k] || VIEWS.genel;
    $('[data-title]').textContent = title;
    $$('[data-nav]').forEach(a => a.classList.toggle('is-on', a.dataset.nav === (VIEWS[k] ? k : 'genel')));
    $$('.modal.is-open').forEach(closeModal);
    view.className = 'pn-view pn-view--' + k;
    fn(); S.hydrate(view); scrollTo(0, 0);
  }
  addEventListener('hashchange', () => { if (!$('#app').hidden) route(); });
  function unread() {
    const n = S.requests().filter(r => !r.okundu).length, b = $('[data-unread]');
    b.textContent = n; b.hidden = !n;
  }

  /* ---------- genel bakış ---------- */
  function genel() {
    const P = S.products(), R = S.requests();
    const card = (n, l, href, ic) => `<a class="pn-stat" href="${href}"><span class="pn-stat__ic">${icon(ic)}</span><b>${n}</b><span>${l}</span></a>`;
    view.innerHTML = `
      <div class="pn-stats">
        ${card(P.filter(p => !p.hidden).length, 'Yayındaki ürün', '#urunler', 'i-box')}
        ${card(P.filter(p => p.featured && !p.hidden).length, 'Öne çıkan ürün', '#urunler', 'i-star')}
        ${card(R.filter(r => !r.okundu).length, 'Okunmamış talep', '#talepler', 'i-inbox')}
        ${card(S.cats().length, 'Ürün kategorisi', '#kategoriler', 'i-folder')}
      </div>
      <div class="pn-grid2">
        <section class="pn-card">
          <h2>Hızlı işlemler</h2>
          <div class="pn-quick">
            <a href="#urunler?yeni"><span>${icon('i-plus')}</span><b>Yeni ürün ekle</b><small>Fotoğraf, açıklama ve kategoriyle</small></a>
            <a href="#duzenleyici"><span>${icon('i-edit')}</span><b>Sayfa yazılarını düzenle</b><small>Siteye tıklayıp yerinde değiştirin</small></a>
            <a href="#ayarlar"><span>${icon('i-phone')}</span><b>İletişim bilgileri</b><small>Telefon, WhatsApp, e-posta, adres</small></a>
            <a href="#ayarlar"><span>${icon('i-cog')}</span><b>Logoyu değiştir</b><small>Sitenin tamamında güncellenir</small></a>
          </div>
        </section>
        <section class="pn-card">
          <h2>Son talepler</h2>
          ${R.length ? `<ul class="pn-mini">${R.slice(0, 4).map(r => `<li><a href="#talepler"><b>${esc(r.fields['Şirket / firma ya da site adı'] || r.fields['Adınız soyadınız'] || 'Talep')}</b><span>${r.tur === 'teklif' ? 'Teklif talebi' : 'İletişim formu'} · ${fmtDate(r.tarih)}</span></a>${r.okundu ? '' : '<em>Yeni</em>'}</li>`).join('')}</ul>` : `<p class="pn-empty">Henüz talep yok. Sitedeki teklif ve iletişim formlarından gelen talepler burada listelenir.</p>`}
          <a class="btn btn--sm btn--ghost" href="#talepler">Tüm talepler ${icon('i-arrow')}</a>
        </section>
      </div>
      <section class="pn-card pn-note">
        <div>${icon('i-info')}</div>
        <div><b>Demo modu</b><p>Bu tanıtım sürümünde yaptığınız değişiklikler yalnızca bu tarayıcıda saklanır ve siteyi bu cihazdan açtığınızda görünür. Canlı sürümde tüm değişiklikler sunucuya kaydedilir ve tüm ziyaretçilere anında yansır.</p></div>
        <button class="btn btn--sm btn--ghost pn-danger" type="button" data-reset-all>${icon('i-undo')} Tüm değişiklikleri sıfırla</button>
      </section>`;
    $('[data-reset-all]', view).onclick = async () => {
      if (await confirmBox('Tüm değişiklikler sıfırlansın mı?', 'Ürünler, kategoriler, metinler, görseller, ayarlar ve talepler ilk haline döner. Bu işlem geri alınamaz.', 'Sıfırla')) {
        S.resetAll(); toast('Tüm değişiklikler sıfırlandı'); unread(); route();
      }
    };
  }

  /* ---------- ürünler ---------- */
  const uState = { q: '', c: '' };
  function urunler() {
    const cats = S.cats();
    view.innerHTML = `
      <div class="pn-bar">
        <div class="search"><svg><use href="#i-search"/></svg><input type="search" placeholder="Ürün veya marka ara…" value="${esc(uState.q)}" data-uq></div>
        <select class="pn-select" data-uc><option value="">Tüm kategoriler</option>${cats.map(c => `<option value="${c.id}" ${uState.c === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
        <span class="pn-bar__sp"></span>
        <button class="btn btn--sm" type="button" data-new>${icon('i-plus')} Yeni ürün</button>
      </div>
      <div class="pn-card pn-table" data-utable></div>`;
    const draw = () => {
      const norm = s => String(s).toLocaleLowerCase('tr');
      const P = S.products(), q = norm(uState.q.trim());
      const list = P.filter(p => (!uState.c || p.c === uState.c) && (!q || norm(p.t + ' ' + p.bn).includes(q)));
      const cn = Object.fromEntries(cats.map(c => [c.id, c.name]));
      $('[data-utable]').innerHTML = `
        <div class="pn-tr pn-th"><span></span><span>Ürün</span><span>Kategori</span><span>Öne çıkan</span><span>Yayında</span><span></span></div>
        ${list.map(p => `<div class="pn-tr ${p.hidden ? 'is-off' : ''}" data-id="${p.id}">
          <span class="pn-thumb">${imgTag(p.photo, p.t)}</span>
          <span class="pn-name"><b>${esc(p.t)}</b><small>${esc(p.bn)}</small></span>
          <span class="pn-cat">${esc(cn[p.c] || '')}</span>
          <span><button type="button" class="pn-star ${p.featured ? 'is-on' : ''}" data-feat title="Öne çıkan">${icon('i-star')}</button></span>
          <span><button type="button" class="pn-switch ${p.hidden ? '' : 'is-on'}" data-vis role="switch" aria-checked="${!p.hidden}" title="Sitede göster"><i></i></button></span>
          <span class="pn-acts"><button type="button" class="btn btn--sm btn--ghost" data-edit>${icon('i-edit')} Düzenle</button></span>
        </div>`).join('') || '<p class="pn-empty">Aramanıza uygun ürün yok.</p>'}
        <div class="pn-tfoot">${list.length} ürün listeleniyor</div>`;
      S.hydrate(view);
    };
    draw();
    let qt; $('[data-uq]').addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => { uState.q = e.target.value; draw(); }, 150); });
    $('[data-uc]').addEventListener('change', e => { uState.c = e.target.value; draw(); });
    $('[data-new]').onclick = () => editProduct(null, draw);
    $('[data-utable]').addEventListener('click', e => {
      const row = e.target.closest('[data-id]'); if (!row) return;
      const id = row.dataset.id, P = S.products(), p = P.find(x => x.id === id);
      if (e.target.closest('[data-feat]')) { p.featured = !p.featured; S.saveProducts(P); toast(p.featured ? 'Öne çıkanlara eklendi' : 'Öne çıkanlardan çıkarıldı'); draw(); }
      else if (e.target.closest('[data-vis]')) { p.hidden = !p.hidden; S.saveProducts(P); toast(p.hidden ? 'Ürün gizlendi' : 'Ürün yayında'); draw(); }
      else if (e.target.closest('[data-edit]') || e.target.closest('.pn-name') || e.target.closest('.pn-thumb')) editProduct(id, draw);
    });
    if (location.hash.includes('yeni')) { history.replaceState(null, '', '#urunler'); editProduct(null, draw); }
  }

  function editProduct(id, done) {
    const m = $('#pEdit'), f = $('#pForm'), P = S.products();
    const isNew = !id;
    const p = isNew ? { id: '', t: '', b: '', bn: '', c: uState.c || 'kalorimetre', a: '', photo: '', featured: false, hidden: false } : { ...P.find(x => x.id === id) };
    const inf = isNew ? { desc: '', feats: [], use: '', warranty: '', comm: '' } : S.info(p);
    $('[data-pe-title]', m).textContent = isNew ? 'Yeni ürün' : 'Ürünü düzenle';
    f.c.innerHTML = S.cats().map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
    $('#brandList').innerHTML = [...new Set(P.map(x => x.bn).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr')).map(b => `<option value="${esc(b)}">`).join('');
    f.t.value = p.t; f.bn.value = p.bn === 'Genel' ? '' : p.bn; f.c.value = p.c;
    f.desc.value = inf.desc; f.feats.value = inf.feats.join('\n'); f.use.value = inf.use; f.warranty.value = inf.warranty; f.comm.value = inf.comm;
    f.featured.checked = !!p.featured; f.visible.checked = !p.hidden;
    let photo = p.photo || '';
    const box = $('[data-pimg]', m);
    const showImg = () => { box.innerHTML = imgTag(photo, p.t); S.hydrate(box); };
    showImg();
    $('[data-pfile]', m).value = '';
    $('[data-pfile]', m).onchange = async e => {
      const file = e.target.files[0]; if (!file) return;
      try { photo = await S.imgPut(await S.readImage(file, 1100)); showImg(); } catch (er) { toast('Görsel yüklenemedi'); }
    };
    $('[data-pimg-rm]', m).onclick = () => { photo = ''; showImg(); };
    $('[data-pdel]', m).hidden = isNew;
    $('[data-pdel]', m).onclick = async () => {
      if (!(await confirmBox('Ürün silinsin mi?', `“${p.t}” katalogdan kaldırılacak.`, 'Sil'))) return;
      S.saveProducts(S.products().filter(x => x.id !== id)); toast('Ürün silindi'); done();
    };
    f.onsubmit = e => {
      e.preventDefault();
      const t = f.t.value.trim(); if (!t) { f.t.focus(); f.t.closest('.field').classList.add('err'); return; }
      const bn = f.bn.value.trim() || 'Genel';
      const out = {
        ...p, t, bn, b: bn === 'Genel' ? '' : S.slug(bn), c: f.c.value, a: p.a || ART[f.c.value] || 'valve', photo,
        desc: f.desc.value.trim(), feats: f.feats.value.split('\n').map(x => x.trim()).filter(Boolean),
        use: f.use.value.trim(), warranty: f.warranty.value.trim(), comm: f.comm.value.trim(),
        featured: f.featured.checked, hidden: !f.visible.checked
      };
      const list = S.products();
      if (isNew) {
        let base = S.slug(t) || 'urun', nid = base, i = 2;
        while (list.some(x => x.id === nid)) nid = base + '-' + i++;
        out.id = nid; list.unshift(out);
      } else list[list.findIndex(x => x.id === id)] = out;
      if (!S.saveProducts(list)) { toast('Kaydedilemedi: tarayıcı depolama alanı dolu'); return; }
      closeModal(m); toast(isNew ? 'Ürün eklendi' : 'Değişiklikler kaydedildi'); done();
    };
    f.addEventListener('input', e => e.target.closest('.field')?.classList.remove('err'));
    openModal(m); setTimeout(() => f.t.focus(), 60);
  }

  /* ---------- kategoriler ---------- */
  function kategoriler() {
    const cats = S.cats(), P = S.products();
    view.innerHTML = `<p class="pn-lead">Anasayfadaki ürün grubu kartlarını ve katalog filtrelerini buradan düzenleyebilirsiniz.</p>
      <div class="pn-cats">${cats.map((c, i) => `
        <form class="pn-card pn-catcard" data-cat="${c.id}">
          <div class="pn-catimg">${imgTag(c.photo || (i === 0 ? c.cover : 'assets/img/urunler/' + c.img + '.jpg'), c.name)}
            <label class="pn-catimg__btn">${icon('i-upload')} Görseli değiştir<input type="file" accept="image/*" hidden data-cfile></label></div>
          <div class="field"><label>Kategori adı</label><input name="name" value="${esc(c.name)}" required></div>
          <div class="field"><label>Kısa açıklama</label><textarea name="desc" rows="2">${esc(c.desc)}</textarea></div>
          <div class="pn-catfoot"><small>${P.filter(p => p.c === c.id).length} ürün</small><button class="btn btn--sm" type="submit">Kaydet</button></div>
        </form>`).join('')}</div>`;
    const over = () => S.get('cats', {});
    $$('[data-cat]', view).forEach(fm => {
      const id = fm.dataset.cat;
      fm.onsubmit = e => {
        e.preventDefault();
        const o = over(); o[id] = { ...(o[id] || {}), name: fm.name.value.trim() || S.CATS.find(c => c.id === id).name, desc: fm.desc.value.trim() };
        S.set('cats', o); toast('Kategori kaydedildi');
      };
      $('[data-cfile]', fm).onchange = async e => {
        const file = e.target.files[0]; if (!file) return;
        try {
          const data = await S.readImage(file, 1400), ref = await S.imgPut(data);
          const o = over(); o[id] = { ...(o[id] || {}), photo: ref }; S.set('cats', o);
          $('.pn-catimg img, .pn-catimg .ph', fm).outerHTML = `<img src="${data}" alt="">`;
          toast('Kategori görseli güncellendi');
        } catch (er) { toast('Görsel yüklenemedi'); }
      };
    });
  }

  /* ---------- sayfa düzenleyici ---------- */
  const edState = { page: 'index', mob: false };
  function duzenleyici() {
    view.innerHTML = `
      <div class="pn-bar">
        <select class="pn-select" data-epage>${PAGES.map(([k, l]) => `<option value="${k}" ${edState.page === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <div class="pn-seg"><button type="button" data-dev="0" class="${edState.mob ? '' : 'is-on'}">${icon('i-desk')} Masaüstü</button><button type="button" data-dev="1" class="${edState.mob ? 'is-on' : ''}">${icon('i-mob')} Telefon</button></div>
        <span class="pn-bar__sp"></span>
        <button class="btn btn--sm btn--ghost" type="button" data-ereset>${icon('i-undo')} Bu sayfayı ilk haline döndür</button>
        <a class="btn btn--sm btn--ghost" data-eopen target="_blank" rel="noopener">${icon('i-ext')} Yeni sekmede aç</a>
      </div>
      <div class="pn-hint">${icon('i-info')}<span><b>Değiştirmek istediğiniz yazıya tıklayın</b> ve yazın; dışarı tıkladığınızda ya da Enter'a bastığınızda otomatik kaydedilir. <b>Fotoğraflara tıklayarak</b> yenisini yükleyebilirsiniz. Ürünleri “Ürünler”, iletişim bilgilerini “Site ayarları” bölümünden düzenleyin.</span></div>
      <div class="pn-frame ${edState.mob ? 'is-mob' : ''}"><iframe title="Sayfa önizleme" data-eframe></iframe><div class="pn-frame__load">Sayfa yükleniyor…</div></div>`;
    const fr = $('[data-eframe]'), wrap = $('.pn-frame');
    const load = () => {
      wrap.classList.add('is-loading');
      fr.src = `../${edState.page}.html?edit=1`;
      $('[data-eopen]').href = `../${edState.page}.html`;
    };
    fr.onload = () => wrap.classList.remove('is-loading');
    $('[data-epage]').onchange = e => { edState.page = e.target.value; load(); };
    $$('[data-dev]').forEach(b => b.onclick = () => { edState.mob = b.dataset.dev === '1'; $$('[data-dev]').forEach(x => x.classList.toggle('is-on', x === b)); wrap.classList.toggle('is-mob', edState.mob); });
    $('[data-ereset]').onclick = async () => {
      const label = PAGES.find(p => p[0] === edState.page)[1];
      if (!(await confirmBox(`${label} sayfası ilk haline dönsün mü?`, 'Bu sayfada yaptığınız metin değişiklikleri geri alınır.', 'Geri al'))) return;
      const t = S.texts(); Object.keys(t).forEach(k => { if (k.startsWith(edState.page + ':')) delete t[k]; }); S.set('texts', t);
      toast('Sayfa ilk haline döndü'); load();
    };
    load();
  }
  addEventListener('message', e => {
    if (e.origin !== location.origin || !e.data || !e.data.tm) return;
    if (e.data.type === 'saved') toast(`${e.data.what} kaydedildi`);
    if (e.data.type === 'error') toast(e.data.msg);
  });

  /* ---------- ayarlar ---------- */
  function ayarlar() {
    const st = S.settings();
    view.innerHTML = `
      <form class="pn-card pn-settings" data-sform novalidate>
        <h2>İletişim bilgileri</h2>
        <p class="pn-lead">Buradaki bilgiler sitenin üst şeridinde, alt bölümünde, iletişim sayfasında, WhatsApp düğmelerinde ve formlarda otomatik güncellenir.</p>
        <div class="form-grid">
          <div class="field"><label for="s-tel1">Ana telefon</label><input id="s-tel1" name="tel1" type="tel" value="${esc(st.tel1)}"></div>
          <div class="field"><label for="s-tel2">İkinci telefon</label><input id="s-tel2" name="tel2" type="tel" value="${esc(st.tel2)}"></div>
          <div class="field"><label for="s-wa">WhatsApp numarası</label><input id="s-wa" name="wa" type="tel" value="${esc(st.wa)}"></div>
          <div class="field"><label for="s-mail">E-posta</label><input id="s-mail" name="email" type="email" value="${esc(st.email)}"></div>
          <div class="field full"><label for="s-adr">Adres</label><textarea id="s-adr" name="adres" rows="2">${esc(st.adres)}</textarea></div>
          <div class="field"><label for="s-ig">Instagram kullanıcı adı</label><input id="s-ig" name="instagram" value="${esc(st.instagram)}"></div>
          <div class="field"><label for="s-firma">Firma adı</label><input id="s-firma" name="firma" value="${esc(st.firma)}"></div>
        </div>
        <div class="pn-form__acts"><span></span><button class="btn" type="submit">Bilgileri kaydet</button></div>
      </form>
      <section class="pn-card pn-logo">
        <h2>Logo</h2>
        <p class="pn-lead">Yüklediğiniz logo sitenin menüsünde, alt bölümünde ve sayfa geçiş animasyonunda kullanılır. Şeffaf zeminli PNG önerilir.</p>
        <div class="pn-logo__row">
          <div class="pn-logo__prev" data-lprev></div>
          <div class="pn-imgacts">
            <label class="btn btn--sm btn--navy">${icon('i-upload')} Logo yükle<input type="file" accept="image/*" hidden data-lfile></label>
            <button class="btn btn--sm btn--ghost" type="button" data-lrm>Varsayılan logoya dön</button>
          </div>
        </div>
      </section>
      <form class="pn-card pn-settings" data-pwform>
        <h2>Panel şifresi</h2>
        <div class="form-grid">
          <div class="field"><label for="s-pw1">Yeni şifre</label><input id="s-pw1" type="password" autocomplete="new-password" minlength="4"></div>
          <div class="field"><label for="s-pw2">Yeni şifre (tekrar)</label><input id="s-pw2" type="password" autocomplete="new-password"></div>
        </div>
        <div class="pn-form__acts"><span></span><button class="btn btn--ghost" type="submit">Şifreyi değiştir</button></div>
      </form>`;
    const prev = () => {
      const s2 = S.settings(), box = $('[data-lprev]');
      box.innerHTML = s2.logo ? `<img data-idb="${s2.logo}" alt="Logo">` : `<span class="pn-deflogo"><svg class="mark" style="color:#E11B38"><use href="#i-mark"/></svg><span><b>TM</b><small>Isı Sistemleri</small></span></span>`;
      S.hydrate(box);
    };
    prev();
    $('[data-sform]').onsubmit = e => {
      e.preventDefault();
      const f = e.target, D = S.SETTINGS, o = S.get('settings', {});
      let bad = null;
      ['tel1', 'tel2', 'wa'].forEach(k => { const d = digits(f[k].value); const ok = !f[k].value.trim() || d.length === 12; f[k].closest('.field').classList.toggle('err', !ok); if (!ok && !bad) bad = f[k]; });
      const mailOk = !f.email.value.trim() || /^\S+@\S+\.\S+$/.test(f.email.value); f.email.closest('.field').classList.toggle('err', !mailOk); if (!mailOk && !bad) bad = f.email;
      if (bad) { bad.focus(); toast('Lütfen işaretli alanları kontrol edin'); return; }
      ['tel1', 'tel2', 'wa', 'email', 'adres', 'instagram', 'firma'].forEach(k => {
        const v = f[k].value.trim().replace(/^@/, '');
        if (!v || v === D[k]) delete o[k]; else o[k] = v;
      });
      S.set('settings', o); toast('İletişim bilgileri kaydedildi');
    };
    $('[data-lfile]').onchange = async e => {
      const file = e.target.files[0]; if (!file) return;
      try { const ref = await S.imgPut(await S.readImage(file, 600, true)); const o = S.get('settings', {}); o.logo = ref; S.set('settings', o); prev(); toast('Logo güncellendi'); }
      catch (er) { toast('Logo yüklenemedi'); }
    };
    $('[data-lrm]').onclick = () => { const o = S.get('settings', {}); delete o.logo; S.set('settings', o); prev(); toast('Varsayılan logo kullanılıyor'); };
    $('[data-pwform]').onsubmit = e => {
      e.preventDefault();
      const a = $('#s-pw1').value, b = $('#s-pw2').value;
      if (a.length < 4) { toast('Şifre en az 4 karakter olmalı'); return; }
      if (a !== b) { toast('Şifreler eşleşmiyor'); return; }
      S.set('password', a); e.target.reset(); toast('Panel şifresi değiştirildi');
    };
  }

  /* ---------- talepler ---------- */
  function talepler() {
    const R = S.requests();
    view.innerHTML = R.length ? `<div class="pn-reqs">${R.map(r => {
      const f = r.fields || {};
      const name = f['Yetkili kişi'] || f['Adınız soyadınız'] || '';
      const firm = f['Şirket / firma ya da site adı'] || '';
      const tel = f['Telefon'] || '', mail = f['E-posta'] || '';
      const rows = Object.entries(f).filter(([k]) => !['Yetkili kişi', 'Adınız soyadınız', 'Şirket / firma ya da site adı', 'Telefon', 'E-posta'].includes(k));
      return `<article class="pn-card pn-req ${r.okundu ? '' : 'is-new'}" data-rid="${r.id}">
        <header><span class="pn-tag ${r.tur === 'teklif' ? 'is-red' : ''}">${r.tur === 'teklif' ? 'Teklif talebi' : 'İletişim formu'}</span>${r.okundu ? '' : '<em>Yeni</em>'}<time>${fmtDate(r.tarih)}</time></header>
        <h3>${esc(firm || name || 'İsimsiz talep')}</h3>
        ${firm && name ? `<p class="pn-muted">${esc(name)}</p>` : ''}
        <dl>${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
        ${r.liste ? `<div class="pn-reqlist"><b>Teklif listesi</b><pre>${esc(r.liste)}</pre></div>` : ''}
        <footer>
          ${tel ? `<a class="btn btn--sm btn--navy" href="tel:+${digits(tel)}">${icon('i-phone')} ${esc(tel)}</a><a class="btn btn--sm btn--wa" href="https://wa.me/${digits(tel)}" target="_blank" rel="noopener">${icon('i-wa')} WhatsApp</a>` : ''}
          ${mail ? `<a class="btn btn--sm btn--ghost" href="mailto:${esc(mail)}">${icon('i-mail')} ${esc(mail)}</a>` : ''}
          <span class="pn-bar__sp"></span>
          <button class="btn btn--sm btn--ghost pn-danger" type="button" data-rdel>${icon('i-trash')} Sil</button>
        </footer>
      </article>`;
    }).join('')}</div>` : `<div class="pn-card pn-emptybox">${icon('i-inbox')}<h2>Henüz talep yok</h2><p>Sitedeki teklif ve iletişim formlarından gelen talepler burada listelenir.</p><a class="btn btn--sm btn--ghost" href="../teklif.html" target="_blank" rel="noopener">${icon('i-ext')} Teklif formunu aç</a></div>`;
    view.onclick = async e => {
      const d = e.target.closest('[data-rdel]'); if (!d) return;
      const id = d.closest('[data-rid]').dataset.rid;
      if (!(await confirmBox('Talep silinsin mi?', 'Bu talep listeden kalıcı olarak kaldırılır.', 'Sil'))) return;
      S.set('requests', S.requests().filter(r => r.id !== id)); toast('Talep silindi'); unread(); talepler();
    };
    // görüntülenince okundu say
    if (R.some(r => !r.okundu)) setTimeout(() => { S.set('requests', S.requests().map(r => ({ ...r, okundu: true }))); unread(); }, 1500);
  }

  /* ---------- başlat ---------- */
  let ok = false; try { ok = sessionStorage.getItem(AUTH) === '1'; } catch (er) { }
  if (ok) enter(); else setTimeout(() => $('#pw').focus(), 50);
})();
