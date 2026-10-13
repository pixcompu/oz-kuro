// Oz's sticker album ("Oz en todas sus formas"). The page builds the album from this list,
// so adding a pose is: run tools/album/add-to-album.sh on the photo (see tools/album/README.md),
// then paste the entry it prints here and fill in the names.
//   type          leave it out for a cut-out sticker; 'photo' for a regular photo (e.g. you with Oz),
//                 shown as a print with a white border
//   src           the image (stickers: WebP with transparency)
//   width/height  its pixel size, so the page reserves the space before it loads
//   name          the sticker's name in the album, in both languages
//   alt           description for the close-up view and screen readers, in both languages
//   date          optional, 'YYYY-MM-DD': when the photo was taken. Shown as "Capturado el …" in the
//                 close-up; the album lists the newest first, and poses without a date go last
//   tags          what the pose shows; meant for filtering the album later
const GALLERY = [
  {
    src: 'assets/img/oz2.webp', width: 632, height: 900,
    name: { es: 'Modo sofá', en: 'Couch mode' },
    alt: { es: 'Oz recostado, mirando de reojo', en: 'Oz lounging, side-eyeing the camera' },
    tags: ['lounging'],
  },
  {
    src: 'assets/img/oz4.webp', width: 813, height: 900,
    name: { es: 'Panza trampa', en: 'Belly trap' },
    alt: { es: 'Oz panza arriba', en: 'Oz belly up' },
    tags: ['belly-up'],
  },
  {
    src: 'assets/img/oz5.webp', width: 769, height: 900,
    name: { es: 'Estiramiento olímpico', en: 'Olympic stretch' },
    alt: { es: 'Oz estirado en el piso', en: 'Oz stretched out on the floor' },
    date: '2026-08-07',
    tags: ['stretching'],
  },
  {
    src: 'assets/img/oz7.webp', width: 900, height: 397,
    name: { es: 'Modo cazador', en: 'Hunter mode' },
    alt: { es: 'Oz echado de lado, listo para atacar', en: 'Oz lying on his side, ready to pounce' },
    tags: ['ambush'],
  },
];

// Slots per album page (keep it a multiple of 4, one row = 4). Poses fill the pages in order; the
// last page's empty slots show a "?" until a pose fills them, and a new page appears once a pose no longer fits.
const ALBUM_SIZE = 8;
