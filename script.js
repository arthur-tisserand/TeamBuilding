/* =========================================================
   TeamBuilding – Enquête dans Nancy
   Tout ce qui se personnalise est dans les sections
   CONFIG, STEPS et QUIZ. Le reste n'a pas besoin d'être modifié.
   ========================================================= */

/* ---------------------------------------------------------
   CONFIG
   --------------------------------------------------------- */
const CONFIG = {
  // false = on ne vérifie pas la position GPS (à utiliser tant que les
  // coordonnées ne sont pas relevées sur place).
  // true  = l'équipe doit être près du lieu pour envoyer sa photo.
  REQUIRE_GPS: false,

  // Ajouter ?test=1 à l'adresse pour ignorer le GPS (répétition, démo, dépannage)
  TEST_MODE: new URLSearchParams(location.search).has('test'),

  // Ajouter ?calibrer=1 pour afficher l'outil de relevé des coordonnées GPS
  CALIBRATE: new URLSearchParams(location.search).has('calibrer'),

  // Adresse d'un serveur qui reçoit les photos (POST, champs : team, teamName,
  // step, photo). Laisser vide = les photos restent sur le téléphone.
  UPLOAD_URL: '',

  STORAGE_KEY: 'nancy-teambuilding-v1',

  // Cadre de la carte (doit couvrir tous les lieux)
  BOUNDS: { latMin: 48.672, latMax: 48.702, lngMin: 6.160, lngMax: 6.196 },
  MAP_W: 640,
  MAP_H: 800
};

/* ---------------------------------------------------------
   BLASONS (intégrés au script : aucun fichier image à héberger)
   Pour utiliser vos propres images, remplacez ces deux lignes par
   un chemin, par exemple : 'img/mon-blason.png'
   --------------------------------------------------------- */
const BLASON_BOURGOGNE = 'data:image/svg+xml;utf8,' + encodeURIComponent("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 240\" width=\"200\" height=\"240\" role=\"img\" aria-label=\"Blason du duc de Bourgogne\"><defs><clipPath id=\"shield\"><path d=\"M10 10 H190 V110 C190 170 150 210 100 232 C50 210 10 170 10 110 Z\"/></clipPath></defs><g clip-path=\"url(#shield)\"><rect width=\"200\" height=\"240\" fill=\"#e6b93a\"/><g transform=\"rotate(45 100 120)\" fill=\"#1f4fa0\"><rect x=\"-200\" y=\"-35\" width=\"600\" height=\"52\"/><rect x=\"-200\" y=\"69\" width=\"600\" height=\"52\"/><rect x=\"-200\" y=\"173\" width=\"600\" height=\"52\"/></g><path d=\"M10 10 H190 V110 C190 170 150 210 100 232 C50 210 10 170 10 110 Z\" fill=\"none\" stroke=\"#c0282d\" stroke-width=\"22\"/></g><path d=\"M10 10 H190 V110 C190 170 150 210 100 232 C50 210 10 170 10 110 Z\" fill=\"none\" stroke=\"#2b2b2b\" stroke-width=\"3\"/></svg>");
const BLASON_LORRAINE  = 'data:image/svg+xml;utf8,' + encodeURIComponent("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 240\" width=\"200\" height=\"240\" role=\"img\" aria-label=\"Blason du duc de Lorraine\"><defs><clipPath id=\"shield\"><path d=\"M10 10 H190 V110 C190 170 150 210 100 232 C50 210 10 170 10 110 Z\"/></clipPath><path id=\"aleria\" d=\"M0 -11 L4 -4 L13 -7 L8 2 L11 11 L0 6 L-11 11 L-8 2 L-13 -7 L-4 -4 Z\"/></defs><g clip-path=\"url(#shield)\"><rect width=\"200\" height=\"240\" fill=\"#e6b93a\"/><g transform=\"rotate(45 100 120)\"><rect x=\"-200\" y=\"92\" width=\"600\" height=\"56\" fill=\"#c0282d\"/><g fill=\"#ffffff\" stroke=\"#8a8a8a\" stroke-width=\"1\"><use href=\"#aleria\" x=\"35\" y=\"120\"/><use href=\"#aleria\" x=\"100\" y=\"120\"/><use href=\"#aleria\" x=\"165\" y=\"120\"/></g></g></g><path d=\"M10 10 H190 V110 C190 170 150 210 100 232 C50 210 10 170 10 110 Z\" fill=\"none\" stroke=\"#2b2b2b\" stroke-width=\"3\"/></svg>");

/* ---------------------------------------------------------
   ÉTAPES DU JEU (dans l'ordre)
   - type "photo" : l'équipe envoie une photo pour débloquer l'indice
   - type "quiz"  : l'équipe répond au quiz (voir QUIZ plus bas)
   - geo: true    : le lieu apparaît sur la carte (lat, lng, radius en mètres)
   - clue         : l'indice. Soit { all: {...} } identique pour les deux équipes,
                    soit { 1: {...}, 2: {...} } propre à chaque équipe.
                    Un indice peut contenir : title, text, code, image, alt
   ⚠ Coordonnées marquées « à vérifier » : approximatives. Relevez-les sur
   place avec l'outil ?calibrer=1 avant de passer REQUIRE_GPS à true.
   --------------------------------------------------------- */
const STEPS = [
  {
    id: 'realisation', type: 'photo', geo: false,
    name: 'Votre réalisation',
    title: 'Envoyez la photo de votre réalisation',
    hint: "Prenez en photo la réalisation de votre équipe. Cette photo débloque votre premier indice.",
    clue: {
      1: { title: 'Une devise', text: "« Point n'est besoin d'espérer pour entreprendre… »" },
      2: { title: 'Une devise', text: "« … ni de réussir pour persévérer. »" }
    }
  },
  {
    id: 'obelisque', type: 'photo', geo: true,
    name: "L'obélisque", lat: 48.6944, lng: 6.1766, radius: 80,
    title: "Trouvez l'obélisque",
    hint: "Prenez une photo de l'obélisque.",
    clue: {
      1: { title: 'Un message codé', code: '13 - 15 - 18 - 20  /  5 - 14  /  A - D - G - G' },
      2: { title: 'Une clé de lecture', text: '[À COMPLÉTER : la clé de lecture de l\'équipe 2]' }
    }
  },
  {
    id: 'excelsior', type: 'photo', geo: true,
    name: "Brasserie Excelsior", lat: 48.6906, lng: 6.1745, radius: 100,   // à vérifier
    title: "La fresque de l'Excelsior",
    hint: "Rendez-vous à l'Excelsior et photographiez la partie de la fresque qui vous a été indiquée.",
    clue: { all: { title: 'Une confidence', text: '« Une faim de loup »' } }
  },
  {
    id: 'dombasle', type: 'photo', geo: true,
    name: 'Place Dombasle', lat: 48.6895, lng: 6.1865, radius: 100,     // à vérifier
    title: 'La statue de Mathieu de Dombasle',
    hint: "Trouvez la statue de Christophe Mathieu de Dombasle et prenez-la en photo.",
    clue: { all: { title: 'Une devise gravée', text: "« Je l'ay emprins »" } }
  },
  {
    id: 'etoile', type: 'photo', geo: true,
    name: 'Place Stanislas', lat: 48.6936, lng: 6.1833, radius: 90,
    title: "L'étoile de la place Stanislas",
    hint: "Trouvez l'étoile de la place Stanislas et photographiez-la.",
    clue: {
      1: { title: 'Un blason', image: BLASON_BOURGOGNE, alt: 'Blason du duc de Bourgogne' },
      2: { title: 'Un blason', image: BLASON_LORRAINE,  alt: 'Blason du duc de Lorraine' }
    }
  },
  {
    id: 'plaque', type: 'photo', geo: true,
    name: 'Plaque 1477', lat: 48.6795, lng: 6.1858, radius: 100,         // à vérifier
    title: 'La plaque 1477',
    hint: "Rendez-vous à la plaque 1477 et photographiez-la.",
    clue: { all: { title: 'La victime', text: 'Bravo, vous avez trouvé la victime : Charles le Téméraire, mort ici.' } }
  },
  {
    id: 'quiz', type: 'quiz', geo: false,
    name: 'Le quiz',
    title: 'Le quiz',
    hint: "Répondez correctement à toutes les questions pour obtenir le dernier indice.",
    clue: { all: { title: 'Un rendez-vous', text: '« Rendez-vous au musée des Beaux-Arts. »' } }
  },
  {
    id: 'musee', type: 'photo', geo: true,
    name: 'Musée des Beaux-Arts', labelUp: true, lat: 48.6938, lng: 6.1829, radius: 120,
    title: 'Au musée des Beaux-Arts',
    hint: "Retrouvez-vous au musée, mettez vos indices en commun et trouvez le tableau. Photographiez-le pour valider la fin du jeu.",
    clue: { all: { title: 'Enquête résolue', text: "Vous avez trouvé le tableau. L'enquête est terminée." } }
  }
];

// Message affiché quand toutes les étapes sont validées
const FINALE = {
  title: 'Bravo, enquête terminée !',
  text: "Présentez-vous à l'animateur pour la conclusion de l'enquête."
};

/* ---------------------------------------------------------
   QUIZ (étape « quiz ») – questions d'exemple à remplacer
   answer = numéro de la bonne réponse, en partant de 0
   --------------------------------------------------------- */
const QUIZ = [
  { q: 'En quelle année est mort Charles le Téméraire ?',
    choices: ['1453', '1477', '1515'], answer: 1 },
  { q: 'Quel duc de Lorraine a vaincu Charles le Téméraire devant Nancy ?',
    choices: ['René II', 'Léopold', 'Charles III'], answer: 0 },
  { q: 'Quel roi a donné son nom à la plus célèbre place de Nancy ?',
    choices: ['Louis XV', 'Stanislas', 'Henri II'], answer: 1 }
];

/* Éléments décoratifs de la carte (approximatifs, non à l'échelle) */
const BASEMAP = {
  water: [[48.7020, 6.1905], [48.6965, 6.1935], [48.6905, 6.1925], [48.6825, 6.1895], [48.6740, 6.1855]],
  rail:  [[48.6890, 6.1660], [48.6899, 6.1737], [48.6915, 6.1800], [48.6935, 6.1885]],
  parks: [
    { lat: 48.6987, lng: 6.1858, rx: 44, ry: 34, label: 'La Pépinière' }
  ],
  streets: [
    { major: true, pts: [[48.6899, 6.1737], [48.6906, 6.1745], [48.6921, 6.1790], [48.6936, 6.1834]] },
    { major: true, pts: [[48.6936, 6.1834], [48.6949, 6.1834], [48.6957, 6.1834], [48.6966, 6.1822]] },
    { major: true, pts: [[48.6966, 6.1822], [48.6970, 6.1798], [48.6974, 6.1772]] },
    { pts: [[48.6936, 6.1834], [48.6925, 6.1845], [48.6915, 6.1875]] },
    { pts: [[48.6936, 6.1834], [48.6944, 6.1800], [48.6970, 6.1798]] },
    { pts: [[48.6936, 6.1834], [48.6890, 6.1850], [48.6840, 6.1855], [48.6795, 6.1858]] }
  ],
  squares: [
    { lat: 48.6936, lng: 6.1834, w: 30, h: 36, label: 'Place Stanislas' }
  ],
  labels: [
    { lat: 48.6892, lng: 6.1715, text: 'Gare' },
    { lat: 48.6800, lng: 6.1905, text: 'Canal' }
  ]
};

/* ---------------------------------------------------------
   ÉTAT
   --------------------------------------------------------- */
let state = loadState();
let pendingPhoto = null;   // { thumb, blob } de la photo en attente
let userPos = null;        // { lat, lng, acc }
let watchId = null;
let lastRevealedId = null;

function freshState() { return { teamNo: 0, teamName: '', done: [], photos: {} }; }

function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (raw) return Object.assign(freshState(), JSON.parse(raw));
  } catch (e) { /* stockage indisponible */ }
  return freshState();
}
function saveState() {
  try { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state)); }
  catch (e) {
    // quota dépassé : on garde la progression sans les photos
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(Object.assign({}, state, { photos: {} })));
    } catch (e2) { /* ignoré */ }
  }
}

/* ---------------------------------------------------------
   OUTILS
   --------------------------------------------------------- */
const $ = (id) => document.getElementById(id);
const SVG_NS = 'http://www.w3.org/2000/svg';

function svg(tag, attrs = {}, parent) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(el);
  return el;
}

function project(lat, lng) {
  const b = CONFIG.BOUNDS;
  return {
    x: ((lng - b.lngMin) / (b.lngMax - b.lngMin)) * CONFIG.MAP_W,
    y: ((b.latMax - lat) / (b.latMax - b.latMin)) * CONFIG.MAP_H
  };
}

function distanceM(lat1, lng1, lat2, lng2) {
  const R = 6371000, rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad, dLng = (lng2 - lng1) * rad;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function currentStep() { return STEPS[state.done.length] || null; }

// Indice de l'étape pour l'équipe en cours
function clueFor(step) {
  return step.clue[state.teamNo] || step.clue.all || { title: 'Indice', text: '' };
}

function openDialog(d) {
  if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
}

// Construit le contenu d'un indice (texte, code, image) dans un conteneur
function fillClue(container, clue) {
  container.innerHTML = '';
  if (clue.text) {
    const p = document.createElement('p');
    p.className = 'text';
    p.textContent = clue.text;
    container.appendChild(p);
  }
  if (clue.code) {
    const c = document.createElement('p');
    c.className = 'clue-code';
    c.textContent = clue.code;
    container.appendChild(c);
  }
  if (clue.image) {
    const img = document.createElement('img');
    img.className = 'clue-img';
    img.src = clue.image;
    img.alt = clue.alt || '';
    container.appendChild(img);
  }
}

/* ---------------------------------------------------------
   CARTE
   --------------------------------------------------------- */
const mapEl = $('map');
let layerBase, layerRoute, layerPins, layerUser;

function initMap() {
  mapEl.innerHTML = '';
  layerBase  = svg('g', {}, mapEl);
  layerRoute = svg('g', {}, mapEl);
  layerPins  = svg('g', {}, mapEl);
  layerUser  = svg('g', {}, mapEl);
  drawBase();
}

function pathFromPts(pts) {
  return pts.map((p, i) => {
    const { x, y } = project(p[0], p[1]);
    return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }).join(' ');
}

function drawBase() {
  BASEMAP.parks.forEach(p => {
    const { x, y } = project(p.lat, p.lng);
    svg('ellipse', { cx: x, cy: y, rx: p.rx, ry: p.ry, class: 'm-park' }, layerBase);
    if (p.label) {
      const t = svg('text', { x, y: y - p.ry - 8, class: 'm-label', 'text-anchor': 'middle' }, layerBase);
      t.textContent = p.label;
    }
  });
  svg('path', { d: pathFromPts(BASEMAP.water), class: 'm-water' }, layerBase);
  svg('path', { d: pathFromPts(BASEMAP.rail), class: 'm-rail' }, layerBase);
  BASEMAP.streets.forEach(s =>
    svg('path', { d: pathFromPts(s.pts), class: 'm-street' + (s.major ? ' major' : '') }, layerBase));
  BASEMAP.squares.forEach(s => {
    const { x, y } = project(s.lat, s.lng);
    svg('rect', { x: x - s.w / 2, y: y - s.h / 2, width: s.w, height: s.h, rx: 3, class: 'm-square' }, layerBase);
  });
  BASEMAP.labels.forEach(l => {
    const { x, y } = project(l.lat, l.lng);
    const t = svg('text', { x, y, class: 'm-label', 'text-anchor': 'middle' }, layerBase);
    t.textContent = l.text;
  });
  const c = svg('g', { transform: 'translate(40 60)' }, layerBase);
  svg('path', { d: 'M0 -26 L7 6 L0 0 L-7 6 Z', class: 'm-compass' }, c);
  const n = svg('text', { x: 0, y: -32, class: 'm-compass-text' }, c);
  n.textContent = 'N';
}

function renderMap() {
  layerRoute.innerHTML = '';
  layerPins.innerHTML = '';

  // Seules les étapes « geo » apparaissent sur la carte
  const geoDone = STEPS.filter(s => s.geo && state.done.includes(s.id));
  const cur = currentStep();
  const next = cur && cur.geo ? cur : null;

  if (geoDone.length > 1) {
    svg('path', { d: pathFromPts(geoDone.map(s => [s.lat, s.lng])), class: 'm-route' }, layerRoute);
  }
  if (next && geoDone.length) {
    const last = geoDone[geoDone.length - 1];
    svg('path', { d: pathFromPts([[last.lat, last.lng], [next.lat, next.lng]]), class: 'm-route m-route-next' }, layerRoute);
  }

  const visible = next ? geoDone.concat(next) : geoDone;
  visible.forEach((s) => {
    const isNext = next && s.id === next.id;
    const { x, y } = project(s.lat, s.lng);
    const g = svg('g', { class: isNext ? 'm-pin-next' : 'm-pin-done', transform: `translate(${x} ${y})` }, layerPins);
    const inner = svg('g', {}, g);
    if (s.id === lastRevealedId) inner.setAttribute('class', 'm-pin-appear');

    if (isNext) svg('circle', { r: 16, class: 'm-pulse' }, inner);
    svg('circle', { r: 16, class: 'm-pin-bg' }, inner);
    const num = svg('text', { class: 'm-pin-num' }, inner);
    num.textContent = isNext ? '?' : String(STEPS.indexOf(s) + 1);

    const label = svg('text', { y: s.labelUp ? -26 : 34, class: 'm-pin-label' }, inner);
    label.textContent = s.name;
  });
  lastRevealedId = null;

  renderUserDot();
}

function renderUserDot() {
  layerUser.innerHTML = '';
  if (!userPos) return;
  const b = CONFIG.BOUNDS;
  if (userPos.lat < b.latMin || userPos.lat > b.latMax || userPos.lng < b.lngMin || userPos.lng > b.lngMax) return;
  const { x, y } = project(userPos.lat, userPos.lng);
  svg('circle', { cx: x, cy: y, r: 20, class: 'm-user-ring' }, layerUser);
  svg('circle', { cx: x, cy: y, r: 7,  class: 'm-user-dot' }, layerUser);
}

/* ---------------------------------------------------------
   GÉOLOCALISATION
   --------------------------------------------------------- */
function setGps(text, cls) {
  const el = $('gpsStatus');
  el.textContent = text;
  el.className = 'gps-status' + (cls ? ' ' + cls : '');
}

function startWatch() {
  if (!('geolocation' in navigator)) { setGps('GPS indisponible', 'is-off'); return; }
  if (watchId !== null) return;
  setGps('Recherche de votre position…');
  watchId = navigator.geolocation.watchPosition(
    (p) => {
      userPos = { lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy };
      setGps(`Position active (±${Math.round(userPos.acc)} m)`, 'is-on');
      renderUserDot();
      renderDistance();
    },
    (err) => {
      watchId = null;
      setGps(err.code === 1 ? 'Position refusée' : 'Position introuvable', 'is-off');
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
  );
}

function getPositionOnce() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('unsupported'));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy }),
      reject,
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  });
}

// Distance entre l'équipe et le lieu à trouver
function renderDistance() {
  const step = currentStep();
  const el = $('distance');
  if (!step || !step.geo || !userPos) { el.textContent = ''; return; }
  const d = Math.round(distanceM(userPos.lat, userPos.lng, step.lat, step.lng));
  el.textContent = d < 1000 ? `Vous êtes à environ ${d} m du lieu.` : `Vous êtes à environ ${(d / 1000).toFixed(1)} km du lieu.`;
}

/* ---------------------------------------------------------
   PHOTO
   --------------------------------------------------------- */
function scaled(img, max) {
  const s = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * s);
  c.height = Math.round(img.height * s);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c;
}

// Renvoie une miniature (affichée dans le carnet) et, si l'envoi est activé,
// une version allégée de la photo à envoyer au serveur
function processPhoto(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const thumb = scaled(img, 480).toDataURL('image/jpeg', 0.72);
      if (!CONFIG.UPLOAD_URL) { URL.revokeObjectURL(url); resolve({ thumb, blob: null }); return; }
      scaled(img, 1280).toBlob((blob) => { URL.revokeObjectURL(url); resolve({ thumb, blob }); }, 'image/jpeg', 0.8);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image')); };
    img.src = url;
  });
}

async function uploadPhoto(step) {
  if (!CONFIG.UPLOAD_URL) return true;
  const fd = new FormData();
  fd.append('team', String(state.teamNo));
  fd.append('teamName', state.teamName);
  fd.append('step', step.id);
  fd.append('photo', pendingPhoto.blob, step.id + '.jpg');
  const res = await fetch(CONFIG.UPLOAD_URL, { method: 'POST', body: fd });
  return res.ok;
}

function showFeedback(msg, cls) {
  const f = $('feedback');
  f.textContent = msg;
  f.className = 'feedback' + (cls ? ' ' + cls : '');
}

function resetCapture() {
  pendingPhoto = null;
  $('photoInput').value = '';
  $('previewWrap').hidden = true;
  $('photoLabel').textContent = 'Prendre la photo';
  $('submitBtn').disabled = true;
  showFeedback('');
}

$('photoInput').addEventListener('change', async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showFeedback("Ce fichier n'est pas une image. Prenez une photo.", 'is-error');
    return;
  }
  try {
    pendingPhoto = await processPhoto(file);
    $('previewImg').src = pendingPhoto.thumb;
    $('previewWrap').hidden = false;
    $('submitBtn').disabled = false;
    $('photoLabel').textContent = 'Reprendre la photo';
    showFeedback('');
  } catch (err) {
    pendingPhoto = null;
    showFeedback('Impossible de lire cette photo. Réessayez.', 'is-error');
  }
});

/* ---------------------------------------------------------
   ENVOI DE LA PHOTO ET DÉBLOCAGE DE L'INDICE
   --------------------------------------------------------- */
$('submitBtn').addEventListener('click', async () => {
  const step = currentStep();
  if (!step || step.type !== 'photo' || !pendingPhoto) return;

  const btn = $('submitBtn');
  btn.disabled = true;

  try {
    // 1) Vérification de la position (seulement pour les étapes géolocalisées)
    if (step.geo && CONFIG.REQUIRE_GPS && !CONFIG.TEST_MODE) {
      showFeedback('Vérification de votre position…');
      let pos;
      try {
        pos = await getPositionOnce();
      } catch (err) {
        showFeedback('Position introuvable. Activez la localisation du téléphone, autorisez-la pour ce site, puis renvoyez la photo.', 'is-error');
        return;
      }
      userPos = pos; renderUserDot(); renderDistance();
      const d = distanceM(pos.lat, pos.lng, step.lat, step.lng);
      const tolerance = Math.min(pos.acc || 0, 60);
      if (d - tolerance > step.radius) {
        showFeedback(`Vous êtes à environ ${Math.round(d)} m du lieu. Rapprochez-vous puis reprenez la photo.`, 'is-error');
        return;
      }
    }

    // 2) Envoi éventuel de la photo au serveur
    if (CONFIG.UPLOAD_URL) {
      showFeedback('Envoi de la photo…');
      let ok = false;
      try { ok = await uploadPhoto(step); } catch (err) { ok = false; }
      if (!ok) {
        showFeedback("L'envoi a échoué. Vérifiez votre connexion puis réessayez.", 'is-error');
        return;
      }
    }

    unlockStep(step, pendingPhoto.thumb);
    resetCapture();
  } finally {
    btn.disabled = !pendingPhoto;
  }
});

/* ---------------------------------------------------------
   QUIZ
   --------------------------------------------------------- */
function renderQuiz() {
  const box = $('quizQuestions');
  if (box.dataset.ready) return;
  box.dataset.ready = '1';
  QUIZ.forEach((item, qi) => {
    const fs = document.createElement('fieldset');
    fs.className = 'suspects quiz-q';
    const lg = document.createElement('legend');
    lg.textContent = `${qi + 1}. ${item.q}`;
    fs.appendChild(lg);
    item.choices.forEach((choice, ci) => {
      const label = document.createElement('label');
      label.className = 'suspect';
      const input = document.createElement('input');
      input.type = 'radio'; input.name = 'q' + qi; input.value = String(ci);
      const span = document.createElement('span');
      span.textContent = choice;
      label.append(input, span);
      fs.appendChild(label);
    });
    box.appendChild(fs);
  });
}

$('quizForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const step = currentStep();
  if (!step || step.type !== 'quiz') return;
  const fb = $('quizFeedback');

  let good = 0, answered = 0;
  QUIZ.forEach((item, qi) => {
    const sel = document.querySelector(`input[name="q${qi}"]:checked`);
    if (sel) { answered++; if (Number(sel.value) === item.answer) good++; }
  });

  if (answered < QUIZ.length) {
    fb.textContent = 'Répondez à toutes les questions avant de valider.';
    fb.className = 'feedback is-error';
    return;
  }
  if (good < QUIZ.length) {
    fb.textContent = `${good} bonne(s) réponse(s) sur ${QUIZ.length}. Discutez-en en équipe et réessayez.`;
    fb.className = 'feedback is-error';
    return;
  }
  fb.textContent = '';
  unlockStep(step, null);
});

/* ---------------------------------------------------------
   DÉBLOCAGE
   --------------------------------------------------------- */
function unlockStep(step, thumb) {
  state.done.push(step.id);
  if (thumb) state.photos[step.id] = thumb;
  saveState();

  const next = currentStep();
  if (next && next.geo) lastRevealedId = next.id;

  renderAll();
  openClueDialog(step, next);
}

function openClueDialog(step, next) {
  $('clueDialogKicker').textContent = `Indice ${state.done.length} sur ${STEPS.length}`;
  const clue = clueFor(step);
  $('clueDialogTitle').textContent = clue.title || 'Indice';
  fillClue($('clueDialogBody'), clue);

  let msg;
  if (!next) msg = "Toutes les étapes sont validées. Bravo !";
  else if (next.geo) msg = "Un nouveau lieu vient d'apparaître sur la carte.";
  else if (next.type === 'quiz') msg = "Répondez au quiz pour obtenir l'indice suivant.";
  else msg = "Une nouvelle étape vous attend.";
  $('clueDialogNext').textContent = msg;

  openDialog($('clueDialog'));
}

/* ---------------------------------------------------------
   RENDU DE L'INTERFACE
   --------------------------------------------------------- */
function renderProgress() {
  const n = state.done.length, total = STEPS.length;
  $('progressText').textContent = `${n} / ${total} étapes`;
  $('progressBar').style.width = (n / total * 100) + '%';
  $('teamLabel').textContent = state.teamNo
    ? `Équipe ${state.teamNo}${state.teamName ? ' – ' + state.teamName : ''}`
    : 'Enquête dans les rues de Nancy';
}

function renderMission() {
  const step = currentStep();
  const photoCard = $('mission'), quizCard = $('quizCard'), finale = $('finale');

  photoCard.hidden = quizCard.hidden = finale.hidden = true;

  if (!step) {
    $('finaleTitle').textContent = FINALE.title;
    $('finaleText').textContent = FINALE.text;
    finale.hidden = false;
    return;
  }

  const label = `Étape ${state.done.length + 1} sur ${STEPS.length}`;

  if (step.type === 'quiz') {
    $('quizStep').textContent = label;
    $('quizTitle').textContent = step.title;
    $('quizHint').textContent = step.hint;
    renderQuiz();
    quizCard.hidden = false;
    return;
  }

  $('missionStep').textContent = label;
  $('missionTitle').textContent = step.title;
  $('missionHint').textContent = step.hint;
  $('submitBtn').disabled = !pendingPhoto;
  photoCard.hidden = false;
  renderDistance();
}

function renderNotebook() {
  const list = $('clueList');
  list.innerHTML = '';
  if (!state.done.length) {
    const li = document.createElement('li');
    li.className = 'clue-empty';
    li.textContent = "Aucun indice pour l'instant. Trouvez la première étape et envoyez votre photo.";
    list.appendChild(li);
    return;
  }
  state.done.slice().reverse().forEach(id => {
    const s = STEPS.find(x => x.id === id);
    if (!s) return;
    const clue = clueFor(s);
    const li = document.createElement('li');
    li.className = 'clue';

    if (state.photos[id]) {
      const img = document.createElement('img');
      img.alt = `Photo prise : ${s.name}`;
      img.src = state.photos[id];
      li.appendChild(img);
    } else {
      li.classList.add('no-photo');
    }

    const box = document.createElement('div');
    const place = document.createElement('p'); place.className = 'place'; place.textContent = s.name;
    const h = document.createElement('h3'); h.textContent = clue.title || 'Indice';
    const body = document.createElement('div');
    fillClue(body, clue);
    box.append(place, h, body);

    li.appendChild(box);
    list.appendChild(li);
  });
}

function renderAll() {
  renderProgress();
  renderMission();
  renderNotebook();
  renderMap();
}

/* ---------------------------------------------------------
   OUTIL ORGANISATEUR : relevé des coordonnées (?calibrer=1)
   --------------------------------------------------------- */
$('calibBtn').addEventListener('click', async () => {
  const out = $('calibOut');
  out.textContent = 'Recherche de la position…';
  try {
    const p = await getPositionOnce();
    const txt = `lat: ${p.lat.toFixed(5)}, lng: ${p.lng.toFixed(5)}`;
    out.textContent = `${txt}  (précision ±${Math.round(p.acc)} m)`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(() => { out.textContent += ' – copié'; }).catch(() => {});
    }
  } catch (err) {
    out.textContent = 'Position introuvable. Activez la localisation puis réessayez.';
  }
});

/* ---------------------------------------------------------
   ÉVÉNEMENTS GÉNÉRAUX
   --------------------------------------------------------- */
$('locateBtn').addEventListener('click', startWatch);

$('resetBtn').addEventListener('click', () => {
  if (!confirm('Effacer la progression de cette équipe et recommencer ?')) return;
  try { localStorage.removeItem(CONFIG.STORAGE_KEY); } catch (e) { /* ignoré */ }
  location.reload();
});

// L'écran d'accueil ne peut pas être fermé sans choisir son équipe
$('introDialog').addEventListener('cancel', (e) => e.preventDefault());

$('introForm').addEventListener('submit', () => {
  const chosen = document.querySelector('input[name="team"]:checked');
  state.teamNo = chosen ? Number(chosen.value) : 1;
  state.teamName = $('teamName').value.trim() || `Équipe ${state.teamNo}`;
  saveState();
  renderAll();
});

/* ---------------------------------------------------------
   DÉMARRAGE
   --------------------------------------------------------- */
function init() {
  $('testBadge').hidden = !CONFIG.TEST_MODE;
  $('calib').hidden = !CONFIG.CALIBRATE;
  initMap();
  renderAll();
  if (!state.teamNo) openDialog($('introDialog'));
}
init();