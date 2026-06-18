/**
 * spells.js — Mazo completo de hechizos de Mal Trago
 *
 * Categorías:
 *  A  — Riesgo propio (el jugador actual bebe)
 *  B  — Ataque (otro jugador bebe)
 *  C  — Global (todos beben)
 *  D  — Rasgos (beben quienes tengan el rasgo físico)
 *  S  — Conjuros persistentes (reglas que quedan activas)
 *  BONUS — Beneficios
 *
 * Cada entrada:
 *  id         {string}   — identificador único
 *  titulo     {string}   — nombre del hechizo
 *  texto      {string}   — descripción a mostrar en el popup
 *  categoria  {string}   — 'A'|'B'|'C'|'D'|'S'|'BONUS'
 *  persistente{boolean}  — si el hechizo queda activo tras lanzarse
 *  rasgo      {string|null} — solo para categoría D: nombre del rasgo relevante
 */

const SPELLS_DECK = [
  // ─────────────────────────────────────────────
  //  ☠️  A — Riesgo Propio
  // ─────────────────────────────────────────────
  {
    id: 'A01',
    titulo: '¡Bebes Tú!',
    texto: 'Voltea y bebe 1 de tus pociones.',
    categoria: 'A',
    persistente: false,
    rasgo: null,
  },
  {
    id: 'A03',
    titulo: 'La Cata de la Bruja',
    texto: 'Bebe 1 poción. Si usas un antídoto, lo recuperas después.',
    categoria: 'A',
    persistente: false,
    rasgo: null,
  },

  // ─────────────────────────────────────────────
  //  ⚔️  B — Ataque
  // ─────────────────────────────────────────────
  {
    id: 'B01',
    titulo: 'Bebe tu Derecha',
    texto: 'El jugador a tu derecha bebe 1 poción.',
    categoria: 'B',
    persistente: false,
    rasgo: null,
  },
  {
    id: 'B02',
    titulo: 'Bebe tu Izquierda',
    texto: 'El jugador a tu izquierda bebe 1 poción.',
    categoria: 'B',
    persistente: false,
    rasgo: null,
  },
  {
    id: 'B03',
    titulo: '¡Tú Mismo!',
    texto: 'Elige a un goblin vivo: ese jugador bebe 1 poción.',
    categoria: 'B',
    persistente: false,
    rasgo: null,
  },
  {
    id: 'B04',
    titulo: 'Venganza Ciega',
    texto: 'Señala al azar: el goblin elegido bebe 1 poción sin saber cuál.',
    categoria: 'B',
    persistente: false,
    rasgo: null,
  },

  // ─────────────────────────────────────────────
  //  🌍  C — Global
  // ─────────────────────────────────────────────
  {
    id: 'C01',
    titulo: 'Ronda de Chupitos',
    texto: '¡Todos los goblins vivos beben 1 poción ahora mismo!',
    categoria: 'C',
    persistente: false,
    rasgo: null,
  },
  {
    id: 'C02',
    titulo: 'Asamblea Goblin',
    texto: 'Votad: el goblin más votado bebe 1 poción.',
    categoria: 'C',
    persistente: false,
    rasgo: null,
  },

  // ─────────────────────────────────────────────
  //  🤡  D — Rasgos físicos
  // ─────────────────────────────────────────────
  {
    id: 'D01',
    titulo: 'Moda Mortal: Gorros',
    texto: 'Los goblins que lleven gorro beben 1 poción.',
    categoria: 'D',
    persistente: false,
    rasgo: 'gorro',
  },
  {
    id: 'D02',
    titulo: 'Moda Mortal: Gafas',
    texto: 'Los goblins que lleven gafas beben 1 poción.',
    categoria: 'D',
    persistente: false,
    rasgo: 'gafas',
  },
  {
    id: 'D03',
    titulo: 'Anatomía: Cuernos',
    texto: 'Los goblins con cuernos beben 1 poción.',
    categoria: 'D',
    persistente: false,
    rasgo: 'cuernos',
  },
  {
    id: 'D04',
    titulo: 'Boca Abierta',
    texto: 'Los goblins con la boca abierta beben 1 poción.',
    categoria: 'D',
    persistente: false,
    rasgo: 'bocaAbierta',
  },
  {
    id: 'D05',
    titulo: 'Tirantes',
    texto: 'El goblin con tirantes bebe 1 poción.',
    categoria: 'D',
    persistente: false,
    rasgo: 'tirantes',
  },

  // ─────────────────────────────────────────────
  //  ✨  S — Conjuros persistentes
  // ─────────────────────────────────────────────
  {
    id: 'S01',
    titulo: 'Conjuro Zalerozo',
    texto: 'Todos deben hablar con Z en lugar de S. ¡Quien falle, bebe!',
    categoria: 'S',
    persistente: true,
    rasgo: null,
  },
  {
    id: 'S02',
    titulo: 'Conjuro Pulgares',
    texto: 'Prohibido usar los pulgares. ¡Quien los use, bebe!',
    categoria: 'S',
    persistente: true,
    rasgo: null,
  },
  {
    id: 'S03',
    titulo: 'Conjuro del Eco',
    texto: 'Todo lo que se diga debe repetirse dos veces. ¡Quien olvide repetir, bebe!',
    categoria: 'S',
    persistente: true,
    rasgo: null,
  },
  {
    id: 'S04',
    titulo: 'Conjuro del Silencio',
    texto: 'Prohibido hablar. Solo gestos. ¡Quien hable, bebe!',
    categoria: 'S',
    persistente: true,
    rasgo: null,
  },
  {
    id: 'S05',
    titulo: 'Nombres Prohibidos',
    texto: 'Prohibido usar los nombres reales de los jugadores. ¡Quien lo haga, bebe!',
    categoria: 'S',
    persistente: true,
    rasgo: null,
  },
  {
    id: 'S06',
    titulo: 'Conjuro T-Rex',
    texto: 'Todos deben mantener los codos pegados al cuerpo. ¡Quien los separe, bebe!',
    categoria: 'S',
    persistente: true,
    rasgo: null,
  },
  {
    id: 'S07',
    titulo: 'Conjuro de la Mirada',
    texto: 'Contacto visual directo entre dos jugadores = ambos beben.',
    categoria: 'S',
    persistente: true,
    rasgo: null,
  },
  {
    id: 'S08',
    titulo: 'Tratamiento Real',
    texto: 'Hay que dirigirse a los demás usando títulos nobiliarios. ¡Quien olvide el título, bebe!',
    categoria: 'S',
    persistente: true,
    rasgo: null,
  },
  {
    id: 'S09',
    titulo: 'Risa Mortal',
    texto: 'Prohibido reírse. ¡Quien ría, bebe!',
    categoria: 'S',
    persistente: true,
    rasgo: null,
  },
  {
    id: 'S10',
    titulo: 'Chiquitín',
    texto: 'Todos deben usar diminutivos al hablar. ¡Quien olvide, bebe!',
    categoria: 'S',
    persistente: true,
    rasgo: null,
  },
  {
    id: 'S11',
    titulo: 'Grandote',
    texto: 'Todos deben usar aumentativos al hablar. ¡Quien olvide, bebe!',
    categoria: 'S',
    persistente: true,
    rasgo: null,
  },

  // ─────────────────────────────────────────────
  //  🎁  BONUS
  // ─────────────────────────────────────────────
  {
    id: 'BONUS01',
    titulo: 'Regalo de la Casa',
    texto: '¡La taberna te invita! Ganas 1 antídoto inmediatamente.',
    categoria: 'BONUS',
    persistente: false,
    rasgo: null,
  },
];
