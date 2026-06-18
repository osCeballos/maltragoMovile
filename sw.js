/**
 * sw.js — Service Worker de Mal Trago
 * Cachea todos los assets estáticos para funcionamiento offline.
 */

const CACHE_NAME = 'maltrago-v18';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './spells.js',
  './goblins.js',
  './manifest.json',
  // Fondos
  './Assets/Fondos/fndo_principal.png',
  './Assets/Fondos/fndo_cajas.png',
  './Assets/Fondos/fndo_nombrePersonaje.png',
  './Assets/Fondos/fndo_pociones.png',
  './Assets/Fondos/fndo_retos.png',
  // Botones
  './Assets/Botones/btn_fondoRetos.png',
  './Assets/Botones/btn_fondoAjustes.png',
  // Iconos
  './Assets/Iconos/carta.png',
  './Assets/Iconos/pocion.png',
  './Assets/Iconos/ajustes.png',
  './Assets/Iconos/reversaCartaCorazon.png',
  './Assets/Iconos/reversaCartaCalavera.png',
  // Goblins
  './Assets/Goblins/goblin1.png',
  './Assets/Goblins/goblin2.png',
  './Assets/Goblins/goblin3.png',
  './Assets/Goblins/goblin4.png',
  './Assets/Goblins/goblin5.png',
  './Assets/Goblins/goblin6.png',
  './Assets/Goblins/goblin7.png',
  './Assets/Goblins/goblin8.png',
  './Assets/Goblins/goblin9.png',
];

// Instalación: precachear todos los assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activación: limpiar caches antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first para assets estáticos
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
