/**
 * goblins.js — Datos de los 9 goblins seleccionables
 *
 * Cada goblin tiene:
 *  id          {number}   — identificador (1–9)
 *  nombre      {string}   — nombre del personaje goblin
 *  descripcion {string}   — descripción breve del personaje
 *  rasgos      {string[]} — array de rasgos físicos (usados por hechizos D01–D05)
 *                           Valores posibles: 'gorro', 'gafas', 'cuernos', 'bocaAbierta', 'tirantes'
 *  asset       {string}   — ruta relativa al archivo de imagen
 */

const GOBLINS_DATA = [
  {
    id: 1,
    nombre: "Grak el Atolondrado",
    descripcion: "Un goblin impulsivo que siempre actúa antes de pensar. Sus cuernos son su orgullo... y su perdición.",
    rasgos: ['cuernos', 'bocaAbierta'],
    asset: 'Assets/Goblins/goblin1.png',
  },
  {
    id: 2,
    nombre: "Mij el Chapucero",
    descripcion: "Lleva gorro, tirantes y una sonrisa de oreja a oreja. Siempre tiene un plan... que nunca funciona.",
    rasgos: ['gorro', 'cuernos', 'tirantes', 'bocaAbierta'],
    asset: 'Assets/Goblins/goblin2.png',
  },
  {
    id: 3,
    nombre: "Vrex la Gruñona",
    descripcion: "De pocas palabras y mirada penetrante. Sus cuernos retorcidos inspiran respeto (y algo de miedo).",
    rasgos: ['cuernos'],
    asset: 'Assets/Goblins/goblin3.png',
  },
  {
    id: 4,
    nombre: "Blix el Glotón",
    descripcion: "Nunca rechaza una bebida. Siempre tiene la boca abierta, esperando el siguiente trago.",
    rasgos: ['bocaAbierta'],
    asset: 'Assets/Goblins/goblin4.png',
  },
  {
    id: 5,
    nombre: "Snark la Astuta",
    descripcion: "Seria y calculadora. Su gorra de cuero oculta más secretos de los que parece.",
    rasgos: ['gorro'],
    asset: 'Assets/Goblins/goblin5.png',
  },
  {
    id: 6,
    nombre: "Zog el Miope",
    descripcion: "Sin sus gafas no ve ni la mano delante de su cara, pero tiene un olfato increíble para los líos.",
    rasgos: ['gafas', 'bocaAbierta'],
    asset: 'Assets/Goblins/goblin6.png',
  },
  {
    id: 7,
    nombre: "Trix la Embaucadora",
    descripcion: "Sus cuernos afilados y su boca siempre abierta la delatan. Nadie confía en ella... con razón.",
    rasgos: ['cuernos', 'bocaAbierta'],
    asset: 'Assets/Goblins/goblin7.png',
  },
  {
    id: 8,
    nombre: "Fung el Elegante",
    descripcion: "Viste con tirantes de cuero como si fuera a una gala. En realidad huele a taberna barata.",
    rasgos: ['tirantes'],
    asset: 'Assets/Goblins/goblin8.png',
  },
  {
    id: 9,
    nombre: "Krix la Chiflada",
    descripcion: "Lleva unas gafas que encontró en un cubo de basura. Ve el mundo de un modo muy... peculiar.",
    rasgos: ['gafas'],
    asset: 'Assets/Goblins/goblin9.png',
  },
];
