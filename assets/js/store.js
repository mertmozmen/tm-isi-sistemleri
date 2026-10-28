/* TM Isı Sistemleri — ortak veri deposu (site + yönetim paneli)
   DEMO MODU: veriler ziyaretçinin tarayıcısında tutulur (localStorage + görseller için IndexedDB).
   Teslimde yalnızca bu dosyadaki get/set/img* fonksiyonları gerçek bir API'ye (Supabase / PHP) bağlanır. */
(function () {
  const NS = 'tm_admin_';
  const MODE = 'demo';

  /* ---------- varsayılanlar ---------- */
  const CATS = [
    { id: 'kalorimetre', name: 'Kalorimetreler', art: 'heat-us', cover: 'assets/img/ortam/montaj.jpg', desc: 'Ultrasonik, mekanik ve büyük çaplı ısı sayaçları ile bireysel ısı paylaşımı.' },
    { id: 'su-sayaci', name: 'Su Sayaçları', art: 'water-cold', img: 'polimeter-soguk-su-sayaci', desc: 'Sıcak, soğuk, ultrasonik ve haberleşmeli su sayaçları.' },
    { id: 'okuma', name: 'Okuma Cihazları', art: 'converter', img: 'calmet-m250-konvertor', desc: 'M-Bus konvertörler ve merkezi okuma birimleri.' },
    { id: 'pompa', name: 'Pompa Sistemleri', art: 'pump-circ', img: 'wilo-flansli-sirkulasyon-pompasi', desc: 'Sirkülasyon pompası, hidrofor, dalgıç pompa ve ısı pompası.' },
    { id: 'vana', name: 'Vana ve Kontrol', art: 'valve3', img: 'caleffi-termostatik-karisim-vanasi', desc: 'Fark basınç, 3 yollu vana, termostat, kollektör ve emniyet ekipmanı.' },
    { id: 'tesisat', name: 'Tesisat Ürünleri', art: 'tank', img: 'wates-genlesme-tanki', desc: 'Genleşme tankı, rekor, conta, pil ve bağlantı elemanları.' }
  ];
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
  const FEATURED = ['calmet-ultrasonik-kalorimetre', 'digitermo-ultrasonik-kalorimetre', 'polimeter-lora-wan-su-sayaci', 'atlas-buyuk-olcekli-ultrasonik-kalorimetre', 'calmet-m250-konvertor', 'wilo-flansli-sirkulasyon-pompasi', 'aldea-isi-pompasi', 'atlas-3-yollu-vana-siemens-motor', 'caleffi-manometre', 'polimeter-sicak-su-sayaci'];
  const SETTINGS = {
    firma: 'TM Isı Sistemleri',
    tel1: '+90 530 216 38 00',
    tel2: '+90 530 182 18 22',
    wa: '+90 530 216 38 00',
    email: 'satis@tmisisistemleri.com',
    adres: 'Tacettin Veli Mah., Şht. Miralay Nazım Bey Blv. No:95/B, 38050 Melikgazi / Kayseri',
    instagram: 'tmisisistemleri',
    logo: ''
  };

  /* ---------- anahtar-değer ---------- */
  const mem = {};
  function get(k, d) {
    try { const v = localStorage.getItem(NS + k); if (v != null) return JSON.parse(v); } catch (e) { if (k in mem) return mem[k]; }
    return d;
  }
  function set(k, v) {
    mem[k] = v;
    try { localStorage.setItem(NS + k, JSON.stringify(v)); return true; } catch (e) { return false; }
  }
  function del(k) { delete mem[k]; try { localStorage.removeItem(NS + k); } catch (e) { } }

  /* ---------- görseller (IndexedDB) ---------- */
  let dbp;
  function db() {
    return dbp || (dbp = new Promise((res, rej) => {
      const r = indexedDB.open('tm-admin', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('img');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    }));
  }
  function tx(mode, fn) {
    return db().then(d => new Promise((res, rej) => {
      const t = d.transaction('img', mode), st = t.objectStore('img'), q = fn(st);
      t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error);
    }));
  }
  async function imgPut(dataUrl) {
    const id = 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    await tx('readwrite', s => s.put(dataUrl, id));
    return 'idb:' + id;
  }
  const cache = {};
  function imgGet(ref) {
    if (!ref || !ref.startsWith('idb:')) return Promise.resolve(ref);
    return cache[ref] || (cache[ref] = tx('readonly', s => s.get(ref.slice(4))).catch(() => ''));
  }
  // sayfadaki img[data-idb] öğelerinin kaynağını doldurur
  function hydrate(root) {
    (root || document).querySelectorAll('img[data-idb]').forEach(img => {
      imgGet(img.dataset.idb).then(u => { if (u) img.src = u; });
    });
  }
  // yüklenen dosyayı küçültüp dataURL'e çevirir (logo için PNG korunur)
  function readImage(file, max = 1100, keepPng = false) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onerror = () => rej(fr.error);
      fr.onload = () => {
        const im = new Image();
        im.onerror = () => rej(new Error('Görsel okunamadı'));
        im.onload = () => {
          const k = Math.min(1, max / Math.max(im.width, im.height));
          const c = document.createElement('canvas');
          c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
          const x = c.getContext('2d');
          if (!keepPng) { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }
          x.drawImage(im, 0, 0, c.width, c.height);
          res(keepPng ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', .86));
        };
        im.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  /* ---------- veri erişimi ---------- */
  function slug(s) {
    return String(s).replace(/İ/g, 'i').replace(/I/g, 'ı').toLocaleLowerCase('tr')
      .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  function defaultProducts() {
    const ph = window.TM_PHOTOS || {};
    return (window.TM_PRODUCTS || []).map(p => ({ ...p, photo: ph[p.id] ? 'assets/img/urunler/' + ph[p.id] : '', featured: FEATURED.includes(p.id), hidden: false }));
  }
  const api = {
    MODE, CATS, DESC, SETTINGS, get, set, del, slug, imgPut, imgGet, hydrate, readImage,
    products() { return get('products', null) || defaultProducts(); },
    saveProducts(list) { return set('products', list); },
    cats() { const o = get('cats', {}); return CATS.map(c => ({ ...c, ...(o[c.id] || {}) })); },
    settings() { return { ...SETTINGS, ...get('settings', {}) }; },
    texts() { return get('texts', {}); },
    images() { return get('images', {}); },
    requests() { return get('requests', []); },
    addRequest(r) { const l = api.requests(); l.unshift(r); set('requests', l.slice(0, 200)); },
    // ürünün metinleri (panelde düzenlenmediyse tip açıklaması)
    info(p) {
      const [d, f, use] = DESC[p.a] || DESC.valve;
      const isMeter = p.c === 'kalorimetre' || p.c === 'su-sayaci';
      return {
        desc: p.desc != null ? p.desc : d,
        feats: p.feats != null ? p.feats : f.map(x => x.replace('*', '')),
        use: p.use != null ? p.use : use,
        warranty: p.warranty != null ? p.warranty : (isMeter ? '5 yıl' : 'Üretici garantisi'),
        comm: p.comm != null ? p.comm : (f.some(x => x.includes('*')) ? 'Modele göre M-Bus / kablosuz seçenekleri' : '')
      };
    },
    resetAll() {
      ['products', 'cats', 'settings', 'texts', 'images', 'requests'].forEach(del);
      try { indexedDB.deleteDatabase('tm-admin'); } catch (e) { }
    }
  };
  window.TMStore = api;
})();
