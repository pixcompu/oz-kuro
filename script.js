const LANG_KEY = 'oz-lang';

const translations = {
  en: {
    title: 'Oz Kuro',
    description: 'Oz is a black cat with yellow eyes, an ambush expert and guardian of his blue castle.',
    language: 'Language',
    hello: 'Hi,', im: "I'm",
    tagline: 'Official mascot. Ambush expert. Bites just a little (usually).',
    chomp: 'chomp!',
    purrSound: 'purrr…',
    factsTitle: 'Meet Oz',
    factsIntro: 'Few words, many ambushes.',
    coat: 'Coat', coatText: 'All black, full ninja mode.',
    eyes: 'Eyes', eyesText: "Yellow. They're watching you.",
    hobby: 'Hobby', hobbyText: 'Surprise attacks at any time of day.',
    bite: 'Bite', biteText: 'Gentle… most of the time.',
    castleTitle: "Oz's blue castle",
    castleText: "It's small, it's blue, and it's his. Oz guards it day and night, and if you get too close, you'll find out.",
    castleWarning: "⚠ Don't get too close",
    castleVideo: 'Video: Oz guarding his blue castle',
    castleTouch: "Get close to Oz's castle",
    galleryTitle: 'Oz in all his forms',
    galleryIntro: 'Some stickers missing… Oz is still posing (when he feels like it).',
    galleryHint: 'Tap a sticker to see it up close.',
    albumTitle: 'Official album',
    slotSoon: 'Coming soon',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    zoomReset: 'Reset zoom',
    mute: 'Mute sounds',
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    albumPages: 'Album pages',
    prevPage: 'Previous page',
    nextPage: 'Next page',
    close: 'Close',
    prevSticker: 'Previous sticker',
    nextSticker: 'Next sticker',
    purrHint: 'Tap Oz to make him purr (and again to stop).',
    bellyUpVideo: 'Video: Oz playing belly up',
    beforeYouGo: 'Before you go…',
    toTop: 'Back to top',
    watching: "He's watching you on his page.",
    watchingIntro: 'Even if you close the tab, Oz knows you were here.',
    poseHint: 'Tap the video to catch his best pose.',
    poseCam: "Catch one of Oz's poses",
    footer: 'Made with love (and a few bites) by',
    github: "Felix's GitHub profile",
    altCap: 'Oz biting a black cap',
    altLoaf: 'Oz loafing in front of the computer, staring at the camera'
  }
};

const description = document.querySelector('meta[name=description]');

// Spanish lives in the HTML; capture it on load so we can switch back to it.
translations.es = { title: document.title, description: description.content };
document.querySelectorAll('[data-i18n]').forEach(el => translations.es[el.dataset.i18n] = el.textContent);
document.querySelectorAll('[data-i18n-alt]').forEach(el => translations.es[el.dataset.i18nAlt] = el.alt);
document.querySelectorAll('[data-i18n-aria]').forEach(el => translations.es[el.dataset.i18nAria] = el.getAttribute('aria-label'));

// Sticker album, built from gallery.js one page at a time: ALBUM_SIZE numbered slots per page, poses
// first, then empty "?" slots. A pose is a cut-out sticker or, with type: 'photo', a regular photo
// shown as a print. Names and descriptions get translation keys so they follow the language switch.
const albumSlots = document.querySelector('.album-slots');
const albumPager = document.querySelector('.album-pager');
const pageNumbers = albumPager.querySelector('.album-page-numbers');
const albumPages = Math.max(1, Math.ceil(GALLERY.length / ALBUM_SIZE));
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let albumPage = 0;
// Newest first: poses with a date go in descending order, undated ones keep their order at the end.
GALLERY.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
// "1 de enero de 2000" / "January 1, 2000"; dates are calendar days, so read them as UTC (no timezone shift).
const longDate = (iso, locale) =>
  new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
GALLERY.forEach((pose, i) => {
  translations.es[`poseName${i}`] = pose.name.es;
  translations.es[`poseAlt${i}`] = pose.alt.es;
  translations.en[`poseName${i}`] = pose.name.en;
  translations.en[`poseAlt${i}`] = pose.alt.en;
  if (pose.date) {
    translations.es[`poseDate${i}`] = `Capturado el ${longDate(pose.date, 'es-MX')}`;
    translations.en[`poseDate${i}`] = `Captured on ${longDate(pose.date, 'en-US')}`;
  }
});
translations.es.slotSoon = 'Por descubrir';   // only exists once the album is drawn, so it's set here
document.querySelector('.album-count').textContent = `${GALLERY.length}/${albumPages * ALBUM_SIZE}`;

function poseImage(pose, i, t) {
  const img = document.createElement('img');
  Object.assign(img, { className: pose.type === 'photo' ? 'album-photo' : 'sticker', src: pose.src, width: pose.width,
                       height: pose.height, loading: 'lazy', draggable: false, alt: t[`poseAlt${i}`] });
  img.dataset.i18nAlt = `poseAlt${i}`;
  return img;
}

function renderAlbumPage(page, direction = 0) {
  albumPage = Math.min(Math.max(page, 0), albumPages - 1);
  const t = translations[document.documentElement.lang];
  albumSlots.replaceChildren();
  for (let s = 0; s < ALBUM_SIZE; s++) {
    const i = albumPage * ALBUM_SIZE + s, pose = GALLERY[i];
    const slot = document.createElement('li');
    slot.className = pose ? 'album-slot' : 'album-slot empty';
    const name = document.createElement('span');
    name.className = 'album-name';
    if (pose) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = pose.type === 'photo' ? 'album-sticker is-photo' : 'album-sticker';
      button.dataset.pose = i;
      button.append(poseImage(pose, i, t));
      name.textContent = t[`poseName${i}`];
      name.dataset.i18n = `poseName${i}`;
      slot.append(button, name);
    } else {
      const mystery = document.createElement('span');
      mystery.className = 'album-mystery';
      mystery.setAttribute('aria-hidden', 'true');
      mystery.append(document.getElementById('album-silhouette').content.cloneNode(true), '?');
      name.textContent = t.slotSoon;
      name.dataset.i18n = 'slotSoon';
      slot.append(mystery, name);
    }
    albumSlots.append(slot);
  }
  pageNumbers.querySelectorAll('button').forEach((b, n) => {
    if (n === albumPage) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  albumPager.querySelector('.album-page-prev').disabled = albumPage === 0;
  albumPager.querySelector('.album-page-next').disabled = albumPage === albumPages - 1;
  if (direction && !reducedMotion()) {   // slide the new page in from the side you're heading to
    albumSlots.classList.remove('turn-next', 'turn-prev');
    void albumSlots.offsetWidth;
    albumSlots.classList.add(direction > 0 ? 'turn-next' : 'turn-prev');
  }
}

// Page controls: ‹ 1 2 3 › to jump straight to a page, or swipe the album sideways. Hidden with one page.
albumPager.hidden = albumPages < 2;
for (let n = 0; n < albumPages; n++) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = n + 1;
  b.addEventListener('click', () => { if (n !== albumPage) goToPage(n); });
  pageNumbers.append(b);
}
// The controls sit under the album, so on a long (phone) page bring the new page's top back into view.
function goToPage(n) {
  renderAlbumPage(n, n > albumPage ? 1 : -1);
  const album = document.querySelector('.album');
  if (album.getBoundingClientRect().top < 0) album.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
}
albumPager.querySelector('.album-page-prev').addEventListener('click', () => goToPage(albumPage - 1));
albumPager.querySelector('.album-page-next').addEventListener('click', () => goToPage(albumPage + 1));
let pageSwipe = null, pageSwiped = false;
albumSlots.addEventListener('pointerdown', e => { pageSwipe = { x: e.clientX, y: e.clientY }; });
albumSlots.addEventListener('pointerup', e => {
  if (!pageSwipe || albumPages < 2) return;
  const dx = e.clientX - pageSwipe.x, dy = e.clientY - pageSwipe.y;
  pageSwipe = null;
  if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;   // not a sideways swipe
  const next = albumPage + (dx < 0 ? 1 : -1);
  if (next < 0 || next >= albumPages) return;
  pageSwiped = true;   // the click that follows the swipe shouldn't open a sticker
  renderAlbumPage(next, dx < 0 ? 1 : -1);
});
renderAlbumPage(0);

function setLanguage(lang) {
  const t = translations[lang];
  document.documentElement.lang = lang;
  document.title = t.title;
  description.content = t.description;
  document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t[el.dataset.i18n]);
  document.querySelectorAll('[data-i18n-alt]').forEach(el => el.alt = t[el.dataset.i18nAlt]);
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t[el.dataset.i18nAria]));
  document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));
  try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
}

document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLanguage(b.dataset.lang)));
try { if (localStorage.getItem(LANG_KEY) === 'en') setLanguage('en'); } catch (e) {}

// Sound on/off: one switch for every sound on the page, remembered like the language. Sounds ask
// soundAllowed() first; while muted they stay quiet (animations still run) and the switch shakes.
const SOUND_KEY = 'oz-sound';
const soundToggle = document.querySelector('.sound-toggle');
const toast = document.querySelector('.toast');
let muted = false, toastTimer = 0, nudgeTimer = 0;
try { muted = localStorage.getItem(SOUND_KEY) === 'off'; } catch (e) {}
soundToggle.setAttribute('aria-pressed', muted);
translations.es.soundOn = 'Sonido activado';   // only shown from script, so the Spanish lives here
translations.es.soundOff = 'Sonido desactivado';
// The notice sits just under the switch, right edges lined up so its tail points at the icon.
function placeToast() {
  const r = soundToggle.getBoundingClientRect();
  toast.style.top = `${r.bottom + 12}px`;
  toast.style.right = `${document.documentElement.clientWidth - r.right}px`;
}
function showToast(text) {
  toast.textContent = text;
  placeToast();
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}
addEventListener('scroll', () => { if (toast.classList.contains('show')) placeToast(); }, { passive: true });
function soundAllowed() {
  if (!muted) return true;
  soundToggle.classList.remove('nudge');
  void soundToggle.offsetWidth; // restart the shake on repeated tries
  soundToggle.classList.add('nudge');
  clearTimeout(nudgeTimer);   // a timer, not animationend: with reduced motion there's no animation to end
  nudgeTimer = setTimeout(() => soundToggle.classList.remove('nudge'), 500);
  return false;
}
soundToggle.addEventListener('click', () => {
  muted = !muted;
  soundToggle.setAttribute('aria-pressed', muted);
  try { localStorage.setItem(SOUND_KEY, muted ? 'off' : 'on'); } catch (e) {}
  if (muted) {
    stopPurr();
    [meow, oiia, shutter].forEach(a => a.pause());
  } else if (purrOn) {
    audio();
    startPurr(); // Oz was already purring silently: let it be heard
  }
  showToast(translations[document.documentElement.lang][muted ? 'soundOff' : 'soundOn']);
});
// Once the top bar scrolls out of view, the switch sticks to the top-right corner.
new IntersectionObserver(([entry]) => soundToggle.classList.toggle('stuck', !entry.isIntersecting))
  .observe(document.querySelector('.topbar'));

const meow = new Audio('assets/audio/meow.mp3');
meow.preload = 'auto';
function playMeow() {
  if (!soundAllowed()) return;
  meow.currentTime = 0;
  meow.play().catch(() => {});
}

// Album close-up: tapping a pose peels it up a little, meows, and opens it big with its name and
// description. Arrows, ← → keys or a swipe move through every page; ✕, Esc or a tap outside close it.
const albumView = document.querySelector('.album-view');
const viewImg = albumView.querySelector('img');
const viewName = albumView.querySelector('#album-view-name');
const viewAlt = albumView.querySelector('.album-view-alt');
const viewDate = albumView.querySelector('.album-view-date');
let viewing = 0;
function showPose(i) {
  viewing = (i + GALLERY.length) % GALLERY.length;
  const pose = GALLERY[viewing], t = translations[document.documentElement.lang];
  Object.assign(viewImg, { className: pose.type === 'photo' ? 'album-photo' : 'sticker', src: pose.src, width: pose.width,
                           height: pose.height, alt: t[`poseAlt${viewing}`] });
  viewImg.dataset.i18nAlt = `poseAlt${viewing}`;
  resetZoom();
  viewName.textContent = t[`poseName${viewing}`];
  viewName.dataset.i18n = `poseName${viewing}`; // keeps the open view in step with the language switch
  viewAlt.textContent = t[`poseAlt${viewing}`];
  viewAlt.dataset.i18n = `poseAlt${viewing}`;
  // "Capturado el …" only when the pose has a date
  viewDate.hidden = !pose.date;
  if (pose.date) {
    viewDate.textContent = t[`poseDate${viewing}`];
    viewDate.dataset.i18n = `poseDate${viewing}`;
  } else {
    delete viewDate.dataset.i18n;
  }
}
['.album-prev', '.album-next'].forEach(s => albumView.querySelector(s).classList.toggle('is-hidden', GALLERY.length < 2));
albumSlots.addEventListener('click', e => {
  if (pageSwiped) { pageSwiped = false; return; }
  const sticker = e.target.closest('.album-sticker');
  if (!sticker || albumView.open) return;
  playMeow();
  sticker.classList.add('peeling');
  const open = () => { sticker.classList.remove('peeling'); showPose(+sticker.dataset.pose); albumView.showModal(); };
  reducedMotion() ? open() : setTimeout(open, 220);
});
albumView.querySelector('.album-close').addEventListener('click', () => albumView.close());
// Back in the album, show the page of the last pose you looked at.
albumView.addEventListener('close', () => {
  const page = Math.floor(viewing / ALBUM_SIZE);
  if (page !== albumPage) renderAlbumPage(page, page > albumPage ? 1 : -1);
});
albumView.querySelector('.album-prev').addEventListener('click', () => showPose(viewing - 1));
albumView.querySelector('.album-next').addEventListener('click', () => showPose(viewing + 1));
let swiped = false;
albumView.addEventListener('click', e => {
  if (swiped) { swiped = false; return; } // a swipe that ends outside the card isn't a tap on the backdrop
  if (e.target === albumView) albumView.close();
});
albumView.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') showPose(viewing - 1);
  if (e.key === 'ArrowRight') showPose(viewing + 1);
  if (e.key === '+' || e.key === '=') zoomBy(ZOOM_STEP);
  if (e.key === '-') zoomBy(-ZOOM_STEP);
  if (e.key === '0') resetZoom(true);
});
let swipeFrom = null;
albumView.addEventListener('pointerdown', e => { swipeFrom = e.clientX; });
albumView.addEventListener('pointerup', e => {
  if (swipeFrom === null || GALLERY.length < 2) return;
  const dx = e.clientX - swipeFrom;
  swipeFrom = null;
  if (zoom > 1 || pinched) return;   // dragging a zoomed photo or pinching isn't a swipe to the next one
  if (Math.abs(dx) > 50) { swiped = true; showPose(viewing + (dx < 0 ? 1 : -1)); }
});

// Zoom in the close-up: − / + buttons and keys, double-click or double-tap, pinch (touch or trackpad),
// and drag to look around once zoomed. The picture always covers the box: it can't be dragged off.
const photoBox = albumView.querySelector('.album-view-photo');
const zoomLevel = albumView.querySelector('.zoom-level');
const ZOOM_MIN = 1, ZOOM_MAX = 4, ZOOM_STEP = 0.5;
let zoom = 1, panX = 0, panY = 0, pinched = false;
function applyZoom(smooth) {
  // How far the picture may move: half of what sticks out of the box at this zoom.
  const maxX = Math.max(0, (viewImg.offsetWidth * zoom - photoBox.clientWidth) / 2);
  const maxY = Math.max(0, (viewImg.offsetHeight * zoom - photoBox.clientHeight) / 2);
  panX = Math.min(maxX, Math.max(-maxX, panX));
  panY = Math.min(maxY, Math.max(-maxY, panY));
  viewImg.classList.toggle('smooth', !!smooth && !reducedMotion());
  viewImg.style.transform = zoom === 1 ? '' : `translate(${panX}px, ${panY}px) scale(${zoom})`;
  photoBox.classList.toggle('zoomed', zoom > 1);
  zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
  albumView.querySelector('.zoom-out').disabled = zoom <= ZOOM_MIN;
  albumView.querySelector('.zoom-in').disabled = zoom >= ZOOM_MAX;
  albumView.querySelector('.zoom-reset').disabled = zoom === 1;
}
// Zoom to `next`, keeping the point at (fx, fy) — relative to the box's centre — where it is on screen.
function setZoom(next, fx = 0, fy = 0, smooth = true) {
  next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
  const k = next / zoom;
  panX = fx - k * (fx - panX);
  panY = fy - k * (fy - panY);
  zoom = next;
  if (zoom === 1) panX = panY = 0;
  applyZoom(smooth);
}
const zoomBy = step => setZoom(Math.round((zoom + step) / ZOOM_STEP) * ZOOM_STEP);
function resetZoom(smooth = false) { zoom = 1; panX = panY = 0; applyZoom(smooth); }
const fromCentre = (x, y) => { const r = photoBox.getBoundingClientRect(); return [x - r.left - r.width / 2, y - r.top - r.height / 2]; };
albumView.querySelector('.zoom-in').addEventListener('click', () => zoomBy(ZOOM_STEP));
albumView.querySelector('.zoom-out').addEventListener('click', () => zoomBy(-ZOOM_STEP));
albumView.querySelector('.zoom-reset').addEventListener('click', () => resetZoom(true));
albumView.addEventListener('close', () => resetZoom());

// Pointers on the photo: one drags (when zoomed), two pinch; a quick second tap toggles 2.5× at that spot.
const pointers = new Map();
let drag = null, pinch = null, lastTap = null;
photoBox.addEventListener('dragstart', e => e.preventDefault());   // no drag-and-drop ghost image while panning
photoBox.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse') e.preventDefault();   // no image drag or text selection from a mouse press
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  try { photoBox.setPointerCapture(e.pointerId); } catch (err) {}   // keep following the pointer outside the box
  if (pointers.size === 1) {
    pinched = false;
    drag = { x: e.clientX, y: e.clientY, panX, panY, moved: false };
  } else if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom, mid: fromCentre((a.x + b.x) / 2, (a.y + b.y) / 2), panX, panY };
    pinched = true;
    drag = null;
  }
});
photoBox.addEventListener('pointermove', e => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch && pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    const [mx, my] = fromCentre((a.x + b.x) / 2, (a.y + b.y) / 2);
    zoom = pinch.zoom; panX = pinch.panX; panY = pinch.panY;
    setZoom(pinch.zoom * Math.hypot(a.x - b.x, a.y - b.y) / pinch.dist, pinch.mid[0], pinch.mid[1], false);
    panX += mx - pinch.mid[0]; panY += my - pinch.mid[1];   // and follow the fingers
    applyZoom(false);
  } else if (drag) {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.hypot(dx, dy) > 4) drag.moved = true;
    if (zoom > 1) {
      panX = drag.panX + dx; panY = drag.panY + dy;
      photoBox.classList.add('panning');
      applyZoom(false);
    }
  }
});
function endPointer(e) {
  pointers.delete(e.pointerId);
  photoBox.classList.remove('panning');
  if (pointers.size < 2) pinch = null;
  if (e.type !== 'pointerup' || pointers.size || pinched || !drag || drag.moved) { if (!pointers.size) drag = null; return; }
  const now = Date.now();
  if (lastTap && now - lastTap.time < 300 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 30) {
    zoom > 1 ? resetZoom(true) : setZoom(2.5, ...fromCentre(e.clientX, e.clientY));
    lastTap = null;
  } else {
    lastTap = { time: now, x: e.clientX, y: e.clientY };
  }
  drag = null;
}
photoBox.addEventListener('pointerup', endPointer);
photoBox.addEventListener('pointercancel', endPointer);
// Trackpad pinch arrives as a wheel event with ctrlKey; plain scrolling is left alone.
photoBox.addEventListener('wheel', e => {
  if (!e.ctrlKey) return;
  e.preventDefault();
  setZoom(zoom * Math.exp(-e.deltaY * 0.01), ...fromCentre(e.clientX, e.clientY), false);
}, { passive: false });

// Tap the cap photo and Oz purrs until you tap again. A tap ends with the finger lifted, which is
// when phones allow audio, so it works on the first try everywhere. Web Audio loops the clip
// without the gap an <audio loop> leaves around MP3s, and short fades keep start and stop click-free.
const purrButton = document.querySelector('.purr');
const PURR_FADE = 0.06;
const PURR_MAX_MS = 20000; // nobody should have to hunt for the off switch
const HEART_EVERY_MS = 3000;
const purrData = fetch('assets/audio/purr.mp3').then(r => r.arrayBuffer());
let audioCtx = null, purrBuffer = null, purring = null, purrOn = false, purrTimer = 0, heartTimer = 0;

function audio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
    purrData.then(data => audioCtx.decodeAudioData(data)).then(buffer => {
      purrBuffer = buffer;
      if (purrOn && !muted) startPurr();
    }).catch(() => {});
  }
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

function startPurr() {
  if (!purrBuffer || purring) return;
  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();
  source.buffer = purrBuffer;
  source.loop = true;
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + PURR_FADE);
  source.connect(gain).connect(audioCtx.destination);
  source.start();
  purring = { source, gain };
}
function stopPurr() {
  if (!purring) return;
  const { source, gain } = purring, now = audioCtx.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(0, now + PURR_FADE);
  source.stop(now + PURR_FADE);
  purring = null;
}

// A little heart floats up from Oz's head; each one drifts and tilts a bit differently.
function spawnHeart() {
  const heart = document.createElement('span');
  heart.className = 'heart';
  heart.setAttribute('aria-hidden', 'true');
  heart.style.setProperty('--sway', `${Math.round(Math.random() * 40 - 20)}px`);
  heart.style.setProperty('--tilt', `${Math.round(Math.random() * 30 - 15)}deg`);
  heart.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 21C12 21 2 14.5 2 8.3 2 5.2 4.4 3 7.2 3 9.3 3 11 4.2 12 6 13 4.2 14.7 3 16.8 3 19.6 3 22 5.2 22 8.3 22 14.5 12 21 12 21Z"/></svg>';
  heart.addEventListener('animationend', () => heart.remove());
  purrButton.append(heart);
}

function setPurr(on) {
  if (on === purrOn || (on && !audio())) return;
  purrOn = on;
  purrButton.classList.toggle('purring', on);
  purrButton.setAttribute('aria-pressed', on);
  clearTimeout(purrTimer);
  clearInterval(heartTimer);
  if (on) {
    if (soundAllowed()) startPurr();
    spawnHeart();
    heartTimer = setInterval(spawnHeart, HEART_EVERY_MS);
    purrTimer = setTimeout(() => setPurr(false), PURR_MAX_MS);
  } else {
    stopPurr();
  }
}

purrButton.setAttribute('aria-pressed', 'false');
purrButton.addEventListener('click', () => setPurr(!purrOn));
// Stop when Oz scrolls out of view or the tab goes to the background.
new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) setPurr(false); }).observe(purrButton);
document.addEventListener('visibilitychange', () => { if (document.hidden) setPurr(false); });

// Tap the photo in "Meet Oz" and he does the "oiia" spin to the first 3 s of the meme sound.
// The spin starts when the sound actually starts, and taps are ignored until both are done.
const oiiaButton = document.querySelector('.facts-photo');
const oiia = new Audio('assets/audio/oiia.mp3');
oiia.preload = 'auto';
let oiiaBusy = false;
oiiaButton.addEventListener('click', () => {
  if (oiiaBusy) return;
  oiiaBusy = true;
  oiiaButton.setAttribute('aria-disabled', 'true');
  let started = false;
  const spin = () => {
    if (started) return;
    started = true;
    oiiaButton.classList.add('spinning');
    setTimeout(() => {
      oiiaButton.classList.remove('spinning');
      oiiaButton.removeAttribute('aria-disabled');
      oiiaBusy = false;
    }, 3000);
  };
  if (soundAllowed()) {
    oiia.currentTime = 0;
    oiia.play().then(spin, spin);
  } else {
    spin(); // still spins, just quietly
  }
  setTimeout(spin, 800); // don't wait forever if the sound is slow to load
});

// "Atrapa la pose": tap the goodbye video to freeze a frame and pop it out as an instant photo.
const poseCam = document.querySelector('.pose-cam');
const poseVideo = poseCam.querySelector('video');
const poses = document.querySelector('.poses');
const shutter = new Audio('assets/audio/camera.mp3');
shutter.preload = 'auto';
let poseCount = 0, posing = false;
function catchPose() {
  if (posing || poseVideo.readyState < 2) return; // nothing on screen yet to photograph
  posing = true;
  poseCount++;
  if (soundAllowed()) {
    shutter.currentTime = 0;
    shutter.play().catch(() => {});
  }

  // Square, centre-cropped frame, like instant film.
  const side = Math.min(poseVideo.videoWidth, poseVideo.videoHeight);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 320;
  canvas.getContext('2d').drawImage(poseVideo, (poseVideo.videoWidth - side) / 2, (poseVideo.videoHeight - side) / 2,
                                    side, side, 0, 0, 320, 320);
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', `Oz, pose ${poseCount}`);
  const photo = document.createElement('figure');
  photo.className = 'polaroid';
  photo.style.setProperty('--tilt', `${Math.round(Math.random() * 14 - 7)}deg`);
  const caption = document.createElement('figcaption');
  caption.textContent = `Pose #${poseCount}`;
  photo.append(canvas, caption);
  // Fill the next empty slot; when all are full, the oldest photo leaves and the rest shift over.
  const slot = poses.querySelector('.slot');
  if (slot) slot.replaceWith(photo);
  else { poses.firstElementChild.remove(); poses.append(photo); }

  // Fly out of the phone: measure where the photo lands, then start it at the phone's centre.
  const from = poseCam.getBoundingClientRect(), to = photo.getBoundingClientRect();
  photo.style.setProperty('--from-x', `${from.left + from.width / 2 - (to.left + to.width / 2)}px`);
  photo.style.setProperty('--from-y', `${from.top + from.height / 2 - (to.top + to.height / 2)}px`);
  photo.classList.add('fly');

  // Freeze for a beat with a flash, then carry on.
  const wasPlaying = !poseVideo.paused;
  poseVideo.pause();
  poseCam.classList.remove('snap');
  void poseCam.offsetWidth; // restart the flash on quick repeat shots
  poseCam.classList.add('snap');
  setTimeout(() => {
    if (wasPlaying) poseVideo.play().catch(() => {});
    posing = false;
  }, 450);
}
poseCam.addEventListener('click', catchPose);
poseCam.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); catchPose(); }
});

// The sleeping Oz in the footer takes you back to the top.
document.querySelector('.to-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
});

// Reduced motion: videos wait for a tap and Oz stops peeking.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduceMotion) {
  document.querySelectorAll('video').forEach(v => { v.removeAttribute('autoplay'); v.pause(); v.controls = true; });
} else {
  // Just like the real Oz: he shows up when you least expect it.
  const ambush = document.querySelector('.ambush');
  const corners = ['bottom-right', 'bottom-left', 'top-left'];   // top-right belongs to the sound switch
  const peek = () => {
    // Move to the new corner while hidden, without animating the jump.
    ambush.classList.add('switching');
    ambush.dataset.corner = corners[Math.floor(Math.random() * corners.length)];
    void ambush.offsetWidth;
    ambush.classList.remove('switching');
    ambush.classList.add('peeking');
    setTimeout(() => ambush.classList.remove('peeking'), 2200);
    setTimeout(peek, 15000 + Math.random() * 25000);
  };
  setTimeout(peek, 6000 + Math.random() * 8000);

  // Get too close to the castle and Oz swipes at you.
  const castle = document.querySelector('.castle-video');
  const pawTemplate = document.getElementById('paw-template');
  castle.setAttribute('role', 'button');
  castle.tabIndex = 0;
  const pawAttack = (x, y) => new Promise(resolve => {
    const paw = pawTemplate.content.firstElementChild.cloneNode(true);
    paw.style.left = `${Math.min(Math.max(x, 70), document.documentElement.clientWidth - 70)}px`;
    paw.style.top = `${y}px`;
    document.body.append(paw);
    setTimeout(() => { paw.remove(); resolve(); }, 1500);
  });
  const meowFinished = () => new Promise(resolve => {
    if (meow.paused) return resolve(); // also covers a meow the browser refused to play
    const done = () => { meow.removeEventListener('ended', done); meow.removeEventListener('pause', done); resolve(); };
    meow.addEventListener('ended', done);
    meow.addEventListener('pause', done);
  });
  // One swipe at a time: taps are ignored until the paw is gone and the meow has finished.
  let attacking = false;
  castle.addEventListener('click', e => {
    if (attacking) return;
    attacking = true;
    castle.setAttribute('aria-disabled', 'true');
    playMeow();
    const box = castle.getBoundingClientRect();
    const fromPointer = e.detail > 0; // keyboard "clicks" have no pointer position
    const swipe = pawAttack(fromPointer ? e.pageX : box.left + scrollX + box.width / 2,
                            fromPointer ? e.pageY : box.top + scrollY + box.height / 2);
    const safety = new Promise(resolve => setTimeout(resolve, 3000)); // never stay locked if audio stalls
    Promise.race([Promise.all([swipe, meowFinished()]), safety]).then(() => {
      attacking = false;
      castle.removeAttribute('aria-disabled');
    });
  });
  castle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); castle.click(); }
  });
}
