const LANG_KEY = 'oz-lang';

const translations = {
  en: {
    title: 'Oz · the mascot',
    description: 'Oz is a black cat with yellow eyes, an ambush expert and guardian of his blue castle.',
    language: 'Language',
    hello: 'Hi,', im: "I'm",
    tagline: 'Official mascot. Ambush expert. Bites just a little (usually).',
    chomp: 'chomp!',
    factsTitle: 'Spec sheet',
    factsIntro: 'Everything you need to know before getting close.',
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
    galleryIntro: 'Sitting, stretching, belly up or curled into a ball.',
    galleryHint: 'Tap Oz to hear him meow.',
    bellyUpVideo: 'Video: Oz playing belly up',
    watching: "He's watching you on his page.",
    footer: 'Made with love (and a few bites).',
    altCap: 'Oz biting a black cap',
    altLounging: 'Oz lounging, side-eyeing the camera',
    altSitting: 'Oz sitting like a person, legs stretched out',
    altBellyUp: 'Oz belly up',
    altStretched: 'Oz stretched out on the floor',
    altPounce: 'Oz lying on his side, ready to pounce'
  }
};

const description = document.querySelector('meta[name=description]');

// Spanish lives in the HTML; capture it on load so we can switch back to it.
translations.es = { title: document.title, description: description.content };
document.querySelectorAll('[data-i18n]').forEach(el => translations.es[el.dataset.i18n] = el.textContent);
document.querySelectorAll('[data-i18n-alt]').forEach(el => translations.es[el.dataset.i18nAlt] = el.alt);
document.querySelectorAll('[data-i18n-aria]').forEach(el => translations.es[el.dataset.i18nAria] = el.getAttribute('aria-label'));

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

const meow = new Audio('assets/audio/meow.mp3');
meow.preload = 'auto';
function playMeow() {
  meow.currentTime = 0;
  meow.play().catch(() => {});
}

// Every sticker in the gallery meows when tapped.
document.querySelectorAll('.meow').forEach(sticker => sticker.addEventListener('click', () => {
  playMeow();
  sticker.classList.remove('meowing');
  void sticker.offsetWidth; // restart the wiggle on repeated taps
  sticker.classList.add('meowing');
}));
document.querySelectorAll('.meow').forEach(sticker => sticker.addEventListener('animationend', () => sticker.classList.remove('meowing')));

// Reduced motion: videos wait for a tap and Oz stops peeking.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduceMotion) {
  document.querySelectorAll('video').forEach(v => { v.removeAttribute('autoplay'); v.pause(); v.controls = true; });
} else {
  // Just like the real Oz: he shows up when you least expect it.
  const ambush = document.querySelector('.ambush');
  const corners = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
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
  const pawAttack = (x, y) => {
    const paw = pawTemplate.content.firstElementChild.cloneNode(true);
    paw.style.left = `${Math.min(Math.max(x, 70), document.documentElement.clientWidth - 70)}px`;
    paw.style.top = `${y}px`;
    document.body.append(paw);
    setTimeout(() => paw.remove(), 1500);
  };
  castle.addEventListener('click', e => {
    playMeow();
    const box = castle.getBoundingClientRect();
    const fromPointer = e.detail > 0; // keyboard "clicks" have no pointer position
    pawAttack(fromPointer ? e.pageX : box.left + scrollX + box.width / 2,
              fromPointer ? e.pageY : box.top + scrollY + box.height / 2);
  });
  castle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); castle.click(); }
  });
}
