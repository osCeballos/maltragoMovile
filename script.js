/**
 * script.js — Lógica principal de Mal Trago
 *
 * Estructura:
 *  1. Estado global (gameState)
 *  2. Constantes y configuración
 *  3. Pantalla de inicio
 *  4. Inicialización del estado y transición
 *  5. Pantalla de juego – render
 *  6. Cartas – reparto e interacción
 *  7. Pociones y muerte
 *  8. Popup de reto (hechizos)
 *  9. Conjuros persistentes
 *  10. Popup de ajustes
 *  11. Utilidades de UI (toast, log, aria-live)
 *  12. Persistencia (localStorage)
 *  13. PWA (Service Worker + install prompt)
 *  14. Arranque
 */

'use strict';

/* ============================================================
   1. ESTADO GLOBAL
   ============================================================ */

/** @type {object} Estado centralizado de la partida */
let gameState = {
  playerName: '',
  selectedGoblinId: null,
  potions: 1,
  antidotes: 1,
  isDead: false,
  activeSpells: [],      // conjuros S persistentes: [{id, titulo, texto}]
  currentCards: [],      // cartas en mano: [{type:'good'|'bad', revealed:boolean}]
  log: [],               // historial de eventos
};

/* ============================================================
   2. CONSTANTES Y CONFIGURACIÓN
   ============================================================ */

const MAX_POTIONS   = 5;   // máximo pociones acumulables (diseño de juego)
const MAX_ANTIDOTES = 1;   // máximo antídotos — siempre 1 (reglas)
const INITIAL_POTIONS    = 1;
const INITIAL_ANTIDOTES  = 1;

// Categorías de hechizos (para etiquetas en el popup)
const CATEGORY_LABELS = {
  A:     '☠️ Riesgo Propio',
  B:     '⚔️ Ataque',
  C:     '🌍 Global',
  D:     '🤡 Rasgo',
  S:     '✨ Conjuro',
  BONUS: '🎁 Bonus',
};

/* ============================================================
   3. PANTALLA DE INICIO
   ============================================================ */

/**
 * Genera la cuadrícula 3×3 de goblins en el DOM.
 * Usa delegación de eventos en el contenedor.
 */
function inicializarSelectorGoblins() {
  const grid = document.getElementById('goblin-grid');
  grid.innerHTML = '';

  GOBLINS_DATA.forEach((goblin) => {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'goblin-cell';
    cell.id = `goblin-cell-${goblin.id}`;
    cell.setAttribute('role', 'radio');
    cell.setAttribute('aria-checked', 'false');
    cell.setAttribute('aria-label', goblin.nombre);
    cell.dataset.goblinId = goblin.id;

    const img = document.createElement('img');
    img.src = goblin.asset;
    img.alt = ''; // decorativa; el aria-label del botón la describe
    img.width  = 90;
    img.height = 90;
    img.loading = 'lazy';

    cell.appendChild(img);
    grid.appendChild(cell);
  });

  // Delegación de eventos: un solo listener en el contenedor
  grid.addEventListener('click', (e) => {
    const cell = e.target.closest('.goblin-cell');
    if (!cell) return;
    seleccionarGoblin(Number(cell.dataset.goblinId));
  });
}

/**
 * Marca el goblin seleccionado y muestra su información.
 * @param {number} id — id del goblin seleccionado
 */
function seleccionarGoblin(id) {
  const goblin = GOBLINS_DATA.find((g) => g.id === id);
  if (!goblin) return;

  gameState.selectedGoblinId = id;

  // Actualizar visual de todas las celdas
  document.querySelectorAll('.goblin-cell').forEach((cell) => {
    const isSelected = Number(cell.dataset.goblinId) === id;
    cell.classList.toggle('selected', isSelected);
    cell.setAttribute('aria-checked', isSelected ? 'true' : 'false');
  });

  // Mostrar info del goblin (sin etiquetas de rasgos)
  const infoEl = document.getElementById('goblin-info');
  infoEl.innerHTML = `
    <span class="goblin-info-desc">${goblin.descripcion}</span>
  `;

  anunciarLiveRegion(`Goblin seleccionado.`);
}

/* ============================================================
   4. INICIALIZACIÓN DEL ESTADO Y TRANSICIÓN
   ============================================================ */

/**
 * Lee goblin, valida, crea gameState y pasa a pantalla de juego.
 * Llamado por el botón "Empezar".
 */
function comenzarJuego() {
  if (!gameState.selectedGoblinId) {
    mostrarToast('Elige un goblin antes de empezar 🧌');
    return;
  }

  // Inicializar estado
  gameState.playerName     = '';
  gameState.potions        = INITIAL_POTIONS;
  gameState.antidotes      = INITIAL_ANTIDOTES;
  gameState.isDead         = false;
  gameState.activeSpells   = [];
  gameState.currentCards   = [];
  gameState.log            = [];

  guardarEstado();
  repartirCartas('inicio');
  renderizarPantallaJuego();
  mostrarPantalla('screen-game');
}

/**
 * Muestra u oculta las pantallas con clases CSS.
 * @param {string} screenId — id del elemento a mostrar
 */
function mostrarPantalla(screenId) {
  document.querySelectorAll('.screen').forEach((s) => {
    s.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}



/* ============================================================
   5. PANTALLA DE JUEGO – RENDER
   ============================================================ */

/**
 * Pinta todos los elementos de la pantalla de juego
 * con los datos actuales de gameState.
 */
function renderizarPantallaJuego() {
  // HUD
  document.getElementById('hud-potions-count').textContent = gameState.potions;

  // Avatar del goblin
  actualizarAvatarGoblin();

  // Cartas
  renderizarCartas();

  // Conjuros activos
  renderizarConjurosActivos();

  // Estado del botón Retos / Revivir
  actualizarBotonesJuego();
}

/**
 * Actualiza el avatar del goblin (vivo o muerto).
 */
function actualizarAvatarGoblin() {
  const avatar = document.getElementById('goblin-avatar');
  const deadMsg = document.getElementById('dead-message');
  const gameScreen = document.getElementById('screen-game');

  if (gameState.isDead) {
    // Goblin muerto: imagen en escala de grises vía CSS + mensaje
    const goblin = GOBLINS_DATA.find((g) => g.id === gameState.selectedGoblinId);
    if (goblin) {
      avatar.src = goblin.asset; // misma imagen, filtro CSS la pone en gris
    }
    avatar.classList.add('dead');
    deadMsg.classList.add('visible');
    gameScreen.classList.add('goblin-dead');
    gameScreen.classList.remove('goblin-revived');
  } else {
    const goblin = GOBLINS_DATA.find((g) => g.id === gameState.selectedGoblinId);
    if (goblin) {
      avatar.src = goblin.asset;
      avatar.alt = `${goblin.nombre} — tu goblin`;
    }
    avatar.classList.remove('dead');
    deadMsg.classList.remove('visible');
    gameScreen.classList.remove('goblin-dead');
  }
}

/**
 * Actualiza el estado de los botones Retos / Revivir.
 */
function actualizarBotonesJuego() {
  const btnReto   = document.getElementById('btn-reto');
  const btnRevive = document.getElementById('btn-revive');

  if (gameState.isDead) {
    btnReto.setAttribute('aria-disabled', 'true');
    btnReto.disabled = true;
    btnRevive.classList.add('visible');
  } else {
    btnReto.setAttribute('aria-disabled', 'false');
    btnReto.disabled = false;
    btnRevive.classList.remove('visible');
  }
}

/* ============================================================
   6. CARTAS – REPARTO E INTERACCIÓN
   ============================================================ */

/**
 * Mezcla un array en sitio usando Fisher-Yates.
 * @param {Array} arr
 */
function mezclar(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Genera el mazo de mano y actualiza gameState.currentCards.
 * @param {'inicio'|'repos'} fase
 */
function repartirCartas(fase) {
  let cartas;
  if (fase === 'inicio') {
    // 4 cartas: 3 buenas, 1 mala
    cartas = ['good', 'good', 'good', 'bad'];
  } else {
    // 3 cartas: 2 buenas, 1 mala
    cartas = ['good', 'good', 'bad'];
  }

  mezclar(cartas);
  gameState.currentCards = cartas.map((type) => ({ type, revealed: false }));
  addLog(`Se reparten ${cartas.length} cartas nuevas.`);
  guardarEstado();
  renderizarCartas();
}

/**
 * Renderiza las ranuras de cartas en el DOM.
 */
function renderizarCartas() {
  const area = document.getElementById('cards-area');
  area.innerHTML = '';

  if (gameState.isDead) return; // muerto no ve cartas

  gameState.currentCards.forEach((carta, index) => {
    const slot = document.createElement('div');
    slot.className = 'card-slot';
    if (carta.revealed) slot.classList.add('revealed');
    slot.setAttribute('role', 'button');
    slot.setAttribute('tabindex', carta.revealed ? '-1' : '0');
    slot.setAttribute('aria-label', carta.revealed
      ? (carta.type === 'good' ? 'Poción segura' : 'Poción envenenada')
      : `Carta ${index + 1} — toca para revelar`
    );
    slot.id = `card-slot-${index}`;
    slot.dataset.index = index;

    const inner = document.createElement('div');
    inner.className = 'card-inner';
    if (carta.revealed) inner.classList.add('flipped');

    // Cara trasera (reverso de carta)
    const back = document.createElement('div');
    back.className = 'card-face card-back';
    back.setAttribute('aria-hidden', 'true');

    // Cara delantera (resultado)
    const front = document.createElement('div');
    front.className = `card-face card-front ${carta.type}`;
    front.setAttribute('aria-hidden', 'true');

    inner.appendChild(back);
    inner.appendChild(front);
    slot.appendChild(inner);

    // Evento táctil solo si no está revelada
    if (!carta.revealed) {
      slot.addEventListener('click', () => seleccionarCarta(index));
      // Soporte de teclado (Enter / Space)
      slot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          seleccionarCarta(index);
        }
      });
    }

    area.appendChild(slot);
  });
}

/**
 * Bandera para evitar dobles toques durante la animación.
 */
let isRevealing = false;

/**
 * Revela la carta en la ranura indicada.
 * @param {number} index
 */
function seleccionarCarta(index) {
  if (isRevealing) return;
  const carta = gameState.currentCards[index];
  if (!carta || carta.revealed) return;

  isRevealing = true;
  carta.revealed = true;

  // Animación de volteo
  const inner = document.getElementById(`card-slot-${index}`)?.querySelector('.card-inner');
  if (inner) {
    inner.classList.add('flipped');
    document.getElementById(`card-slot-${index}`).classList.add('revealed');
    document.getElementById(`card-slot-${index}`).setAttribute('tabindex', '-1');
  }

  // Aplicar efecto con delay para que la animación sea visible
  setTimeout(() => {
    aplicarEfectoCarta(carta.type);
    guardarEstado();

    // Comprobar si quedan cartas sin revelar
    setTimeout(() => {
      comprobarFinCartas();
      isRevealing = false;
    }, 600);
  }, 600);
}

/**
 * Aplica el efecto según el tipo de carta.
 * @param {'good'|'bad'} tipo
 */
function aplicarEfectoCarta(tipo) {
  if (tipo === 'good') {
    // La propia carta ya muestra visualmente el resultado — sin toast
    addLog('Poción segura... por esta vez 💚');
  } else {
    addLog('¡Poción envenenada! 💀');
    perderPocion();
  }
  updateUI();
}

/**
 * Comprueba si se han revelado todas las cartas;
 * si es así, repone después de una pequeña pausa.
 */
function comprobarFinCartas() {
  const sinRevelar = gameState.currentCards.filter((c) => !c.revealed);
  if (sinRevelar.length === 0) {
    addLog('Mano vacía — repartiendo nuevas cartas...');
    setTimeout(() => repartirCartas('repos'), 500);
  }
}

/* ============================================================
   7. POCIONES Y MUERTE
   ============================================================ */

/**
 * Descuenta 1 poción.
 * Muerte cuando llega a -1: 0 significa "sin pociones pero vivo".
 */
function perderPocion() {
  gameState.potions--;
  addLog(`Pierdes 1 poción. Te quedan ${gameState.potions}.`);

  // Shake en el icono de pociones
  const icon = document.getElementById('hud-potions');
  icon.classList.remove('shake');
  void icon.offsetWidth; // Force reflow para reiniciar animación
  icon.classList.add('shake');
  icon.addEventListener('animationend', () => icon.classList.remove('shake'), { once: true });

  document.getElementById('hud-potions-count').textContent = gameState.potions;
  anunciarLiveRegion(`Pierdes una poción. Te quedan ${gameState.potions} pociones.`);

  // Morir solo cuando llega a -1 (0 = vivo sin pociones)
  if (gameState.potions < 0) {
    matarGoblin();
  }
}

/**
 * Mata al goblin: cambia estado, actualiza UI.
 */
function matarGoblin() {
  gameState.isDead = true;
  gameState.currentCards = []; // ocultar cartas
  addLog('💀 ¡Tu goblin ha muerto!');
  anunciarLiveRegion('Tu goblin ha muerto. Esperando revivir.');
  guardarEstado();
  actualizarAvatarGoblin();
  renderizarCartas(); // limpia el área de cartas
  actualizarBotonesJuego();
}

/**
 * Revive al goblin: restaura estado y reparte cartas.
 * Se activa cuando otro jugador cae por un reto del jugador actual.
 */
function revivirGoblin() {
  gameState.isDead = false;
  // Conserva las pociones que tenía al morir (puede ser 0 o negativo)
  // Si estaba en -1, lo dejamos en 0 (muerto justo, revive sin pociones)
  if (gameState.potions < 0) gameState.potions = 0;
  addLog(`✨ ¡Has revivido! Tienes ${gameState.potions} poción(es).`);
  anunciarLiveRegion(`¡Has revivido! Tienes ${gameState.potions} pociones.`);
  guardarEstado();

  const gameScreen = document.getElementById('screen-game');
  gameScreen.classList.add('goblin-revived');
  gameScreen.classList.remove('goblin-dead');

  actualizarAvatarGoblin();
  actualizarBotonesJuego();
  document.getElementById('hud-potions-count').textContent = gameState.potions;
  repartirCartas('repos');
}

/* ============================================================
   8. POPUP DE RETO (HECHIZOS)
   ============================================================ */

/** Hechizo actualmente en el popup (para ejecutar al cerrar) */
let hechizoPendiente = null;

/**
 * Abre el popup de reto con un hechizo aleatorio.
 */
function abrirPopupReto() {
  if (gameState.isDead) return;

  // Selección aleatoria del mazo completo
  const hechizo = SPELLS_DECK[Math.floor(Math.random() * SPELLS_DECK.length)];
  hechizoPendiente = hechizo;

  // Rellenar contenido del popup
  document.getElementById('popup-reto-category').textContent =
    CATEGORY_LABELS[hechizo.categoria] ?? hechizo.categoria;

  document.getElementById('popup-reto-title').textContent = hechizo.titulo;
  document.getElementById('popup-reto-text').textContent  = hechizo.texto;

  const persistentNote = document.getElementById('popup-reto-persistent');
  if (hechizo.persistente) {
    persistentNote.hidden = false;
  } else {
    persistentNote.hidden = true;
  }

  // Mostrar popup con animación
  const overlay = document.getElementById('popup-reto');
  overlay.classList.add('visible');

  // El foco va al popup para accesibilidad
  document.getElementById('popup-reto-box').focus();

  addLog(`🎲 Hechizo: ${hechizo.titulo}`);
}

/**
 * Cierra el popup de reto y ejecuta el hechizo.
 */
function cerrarPopupReto() {
  const overlay = document.getElementById('popup-reto');
  overlay.classList.remove('visible');

  if (hechizoPendiente) {
    ejecutarHechizo(hechizoPendiente);
    hechizoPendiente = null;
  }
}

/**
 * Ejecuta la lógica del hechizo según su categoría e id.
 * @param {object} hechizo — entrada de SPELLS_DECK
 */
function ejecutarHechizo(hechizo) {
  const ctx = {
    addLog,
    updateUI,
    agregarConjuro,
    agregarAntidoto,
    perderPocion,
  };

  switch (hechizo.id) {
    // — A: Riesgo propio (afectan al jugador actual) —
    case 'A01':
      ctx.perderPocion();
      break;

    case 'A03':
      // Bebe 1 poción; si usa antídoto, lo recupera
      ctx.perderPocion();
      if (gameState.antidotes > 0) {
        gameState.antidotes++;
        addLog('Cata de la Bruja: usas antídoto y lo recuperas.');
      }
      break;

    // — B: Ataques (físico multijugador, la descripción ya se mostró en el popup) —
    case 'B01':
    case 'B02':
    case 'B03':
    case 'B04':
      addLog(`⚔️ ${hechizo.titulo}`);
      break;

    // — C: Global (la descripción ya se mostró en el popup) —
    case 'C01':
    case 'C02':
      addLog(`🌍 ${hechizo.titulo}`);
      break;

    // — D: Rasgos físicos del goblin —
    case 'D01':
    case 'D02':
    case 'D03':
    case 'D04':
    case 'D05':
      ejecutarHechizoDRasgo(hechizo);
      break;

    // — S: Conjuros persistentes —
    case 'S01': case 'S02': case 'S03': case 'S04': case 'S05':
    case 'S06': case 'S07': case 'S08': case 'S09': case 'S10':
    case 'S11':
      ctx.agregarConjuro(hechizo);
      break;

    // — BONUS —
    case 'BONUS01':
      ctx.agregarAntidoto(1);
      break;

    default:
      addLog(`Hechizo desconocido: ${hechizo.id}`);
  }

  ctx.updateUI();
  guardarEstado();
}

/**
 * Ejecuta un hechizo de categoría D comparando el rasgo con el goblin activo.
 * @param {object} hechizo
 */
function ejecutarHechizoDRasgo(hechizo) {
  const goblin = GOBLINS_DATA.find((g) => g.id === gameState.selectedGoblinId);
  if (!goblin) return;

  const tieneRasgo = goblin.rasgos.includes(hechizo.rasgo);
  if (tieneRasgo) {
    addLog(`🤡 ${hechizo.titulo}: ¡Tu goblin tiene ese rasgo! Pierdes 1 poción.`);
    // El popup ya mostró el hechizo; el efecto de la pocion se
    // verá en el contador del HUD — sin toast adicional.
    perderPocion();
  } else {
    addLog(`🤡 ${hechizo.titulo}: Tu goblin está a salvo.`);
  }
}

/* ============================================================
   9. CONJUROS PERSISTENTES
   ============================================================ */

/**
 * Añade un conjuro persistente al estado y actualiza la UI.
 * @param {object} conjuro — {id, titulo, texto}
 */
function agregarConjuro(conjuro) {
  // Evitar duplicados
  const yaExiste = gameState.activeSpells.some((s) => s.id === conjuro.id);
  if (yaExiste) {
    addLog(`${conjuro.titulo} ya estaba activo — sin cambios.`);
    return;
  }
  gameState.activeSpells.push({ id: conjuro.id, titulo: conjuro.titulo, texto: conjuro.texto });
  addLog(`✨ Conjuro activado: ${conjuro.titulo}`);
  renderizarConjurosActivos();
  guardarEstado();
}

/**
 * Renderiza los chips de conjuros activos en la barra superior.
 */
function renderizarConjurosActivos() {
  const bar = document.getElementById('active-spells-bar');
  bar.innerHTML = '';

  gameState.activeSpells.forEach((conjuro) => {
    const chip = document.createElement('span');
    chip.className = 'spell-chip';
    chip.textContent = conjuro.titulo;
    chip.setAttribute('title', conjuro.texto);
    bar.appendChild(chip);
  });
}

/**
 * Suma antídotos al jugador (tope: MAX_ANTIDOTES).
 * @param {number} cantidad
 */
function agregarAntidoto(cantidad) {
  const anterior = gameState.antidotes;
  gameState.antidotes = Math.min(MAX_ANTIDOTES, gameState.antidotes + cantidad);
  const ganados = gameState.antidotes - anterior;
  if (ganados > 0) {
    addLog(`🎁 Ganas ${ganados} antídoto(s). Total: ${gameState.antidotes}.`);
  } else {
    addLog('Ya tienes el máximo de antídotos.');
  }
}

/* ============================================================
   10. POPUP DE AJUSTES
   ============================================================ */

function abrirAjustes() {
  document.getElementById('popup-settings').classList.add('visible');
}

function cerrarAjustes() {
  document.getElementById('popup-settings').classList.remove('visible');
  // Devolver foco al botón que lo abrió
  document.getElementById('btn-settings').focus();

  // Restablecer botón de reinicio si quedó en estado de confirmación
  const btn = document.getElementById('btn-restart');
  if (btn && btn.classList.contains('confirm-active')) {
    clearTimeout(Number(btn.dataset.timeoutId));
    btn.classList.remove('confirm-active');
    btn.innerHTML = btn.dataset.originalText || '🔄 Reiniciar partida';
  }
}

function reiniciarPartida() {
  const btn = document.getElementById('btn-restart');
  if (!btn) return;

  if (!btn.classList.contains('confirm-active')) {
    // Primer toque: activar estado de confirmación
    btn.classList.add('confirm-active');
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = '⚠️ ¿Seguro? Pulsa de nuevo';

    // Desactivar confirmación tras 3 segundos de inactividad
    btn.dataset.timeoutId = setTimeout(() => {
      btn.classList.remove('confirm-active');
      btn.innerHTML = btn.dataset.originalText || '🔄 Reiniciar partida';
    }, 3000);
  } else {
    // Segundo toque: realizar el reinicio
    clearTimeout(Number(btn.dataset.timeoutId));
    btn.classList.remove('confirm-active');
    btn.innerHTML = btn.dataset.originalText || '🔄 Reiniciar partida';

    limpiarEstado();
    cerrarAjustes();
    mostrarPantalla('screen-start');
  }
}

/* ============================================================
   11. UTILIDADES DE UI
   ============================================================ */

/**
 * Actualiza la interfaz completa con el estado actual.
 */
function updateUI() {
  document.getElementById('hud-potions-count').textContent = gameState.potions;
  actualizarBotonesJuego();
  renderizarConjurosActivos();
}

/**
 * Añade un mensaje al log de la partida.
 * @param {string} texto
 */
function addLog(texto) {
  gameState.log.push({ ts: Date.now(), msg: texto });
  // Limitar a los últimos 50 mensajes
  if (gameState.log.length > 50) {
    gameState.log.shift();
  }
}

/**
 * mostrarToast — DESHABILITADO.
 * Se mantiene la firma para compatibilidad con cualquier llamada residual,
 * pero no hace absolutamente nada.
 */
// eslint-disable-next-line no-unused-vars
function mostrarToast(_msg, _dur) { /* no-op: toasts eliminados */ }

/**
 * Anuncia texto a lectores de pantalla vía aria-live.
 * @param {string} texto
 */
function anunciarLiveRegion(texto) {
  const region = document.getElementById('live-region');
  region.textContent = '';
  // Pequeño delay para que el navegador detecte el cambio
  requestAnimationFrame(() => {
    region.textContent = texto;
  });
}

/* ============================================================
   12. PERSISTENCIA (localStorage)
   ============================================================ */

const STORAGE_KEY = 'maltrago_state';

/**
 * Guarda el estado actual en localStorage.
 */
function guardarEstado() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  } catch (e) {
    // localStorage no disponible (modo privado, cuota llena)
    console.warn('No se pudo guardar el estado:', e);
  }
}

/**
 * Carga el estado guardado en localStorage, si existe.
 * @returns {boolean} true si había estado guardado
 */
function cargarEstado() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const estado = JSON.parse(raw);
    // Validación mínima
    if (!estado.selectedGoblinId) return false;
    gameState = estado;
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Limpia el estado (para reiniciar la partida).
 */
function limpiarEstado() {
  gameState = {
    playerName: '',
    selectedGoblinId: null,
    potions: INITIAL_POTIONS,
    antidotes: INITIAL_ANTIDOTES,
    isDead: false,
    activeSpells: [],
    currentCards: [],
    log: [],
  };
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) { /* noop */ }

  // Limpiar inputs y selecciones visuales de la pantalla de inicio

  document.querySelectorAll('.goblin-cell').forEach((cell) => {
    cell.classList.remove('selected');
    cell.setAttribute('aria-checked', 'false');
  });

  const infoEl = document.getElementById('goblin-info');
  if (infoEl) {
    infoEl.innerHTML = '<p class="goblin-info-empty">Toca un goblin para ver su información</p>';
  }
}

/* ============================================================
   13. PWA — SERVICE WORKER E INSTALL PROMPT
   ============================================================ */

/** Evento de instalación PWA capturado */
let deferredInstallPrompt = null;

function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.register('./sw.js')
    .then((reg) => {
      console.log('Service Worker registrado con éxito:', reg.scope);
    })
    .catch((err) => {
      console.warn('Service Worker no registrado:', err);
    });
}


/**
 * Captura el evento beforeinstallprompt para mostrarlo en ajustes.
 */
function inicializarPWA() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    // Mostrar el botón de instalación en ajustes
    const btnInstall = document.getElementById('btn-install-pwa');
    if (btnInstall) {
      btnInstall.hidden = false;
    }
  });

  window.addEventListener('appinstalled', (e) => {
    deferredInstallPrompt = null;
    const btnInstall = document.getElementById('btn-install-pwa');
    if (btnInstall) {
      btnInstall.hidden = true;
    }
    console.log('PWA instalada con éxito.');
  });
}

/**
 * Activa el prompt de instalación de la PWA.
 * Si no está disponible el prompt nativo (iOS, file://, etc.), muestra un popup de instrucciones.
 */
function instalarPWA() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('El usuario aceptó la instalación de la PWA.');
      } else {
        console.log('El usuario rechazó la instalación de la PWA.');
      }
      deferredInstallPrompt = null;
      const btnInstall = document.getElementById('btn-install-pwa');
      if (btnInstall) {
        btnInstall.hidden = true;
      }
    });
  } else {
    // Si no está disponible el prompt nativo (iOS, Firefox, file://), mostramos el popup de instrucciones
    const popup = document.getElementById('popup-install-instructions');
    if (popup) {
      popup.classList.add('visible');
    }
  }
}

/* ============================================================
   14. ARRANQUE — DOMContentLoaded
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* — Inicializar selector de goblins — */
  inicializarSelectorGoblins();

  /* — Comprobar si hay partida guardada — */
  if (cargarEstado()) {
    const continuar = window.confirm(
      'Partida guardada encontrada. ¿Continuar?'
    );
    if (continuar) {
      renderizarPantallaJuego();
      mostrarPantalla('screen-game');
    } else {
      limpiarEstado();
    }
  }

  /* — Botón "Empezar" (pantalla de inicio) — */
  document.getElementById('btn-start-game').addEventListener('click', comenzarJuego);



  /* — Botón Retos — */
  document.getElementById('btn-reto').addEventListener('click', abrirPopupReto);

  /* — Popup de reto: cerrar al tocar el overlay o el recuadro — */
  document.getElementById('popup-reto').addEventListener('click', (e) => {
    // Cerrar si se toca el overlay o el box
    cerrarPopupReto();
  });

  /* — Escape cierra los popups — */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.getElementById('popup-reto').classList.contains('visible')) {
        cerrarPopupReto();
      }
      if (document.getElementById('popup-settings').classList.contains('visible')) {
        cerrarAjustes();
      }
      if (document.getElementById('popup-install-instructions')?.classList.contains('visible')) {
        document.getElementById('popup-install-instructions').classList.remove('visible');
      }
    }
  });

  /* — Botón ajustes — */
  document.getElementById('btn-settings').addEventListener('click', abrirAjustes);

  /* — Popup ajustes: cerrar al tocar overlay — */
  document.getElementById('popup-settings').addEventListener('click', (e) => {
    if (e.target === document.getElementById('popup-settings')) {
      cerrarAjustes();
    }
  });

  /* — Botones dentro del popup ajustes — */
  document.getElementById('btn-close-settings').addEventListener('click', cerrarAjustes);
  document.getElementById('btn-restart').addEventListener('click', reiniciarPartida);
  // btn-install-pwa eliminado

  /* — Botón revivir — */
  document.getElementById('btn-revive').addEventListener('click', revivirGoblin);

  /* — Popup de instrucciones de instalación — */
  const btnCloseInstall = document.getElementById('btn-close-install');
  if (btnCloseInstall) {
    btnCloseInstall.addEventListener('click', () => {
      document.getElementById('popup-install-instructions').classList.remove('visible');
    });
  }

  const popupInstall = document.getElementById('popup-install-instructions');
  if (popupInstall) {
    popupInstall.addEventListener('click', (e) => {
      if (e.target === popupInstall) {
        popupInstall.classList.remove('visible');
      }
    });
  }

  /* — Inicializar visibilidad del botón de instalación (botón eliminado) — */

  /* — PWA — */
  registrarServiceWorker();
  inicializarPWA();

});
