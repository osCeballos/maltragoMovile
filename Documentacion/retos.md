# Mazo de Hechizos – Goblins & Pociones

Conversión del archivo `spells.js` a formato estructurado para alimentar una IA.

---

## ☠️ Riesgo Propio (A)
| ID  | Título                  | Descripción                                                                 | Persistente |
|-----|-------------------------|-----------------------------------------------------------------------------|-------------|
| A01 | ¡Bebes Tú!             | Voltea y bebe 1 de tus pociones.                                            | No          |
| A03 | La Cata de la Bruja    | Bebe 1 poción; si usas antídoto lo recuperas.                               | No          |

---

## ⚔️ Ataque (B)
| ID  | Título                  | Descripción                                                                 | Persistente |
|-----|-------------------------|-----------------------------------------------------------------------------|-------------|
| B01 | Bebe tu Derecha        | El jugador de tu derecha bebe 1 poción.                                     | No          |
| B02 | Bebe tu Izquierda      | El jugador de tu izquierda bebe 1 poción.                                   | No          |
| B03 | ¡Tú Mismo!             | Elige a un goblin vivo: bebe 1 poción.                                      | No          |
| B04 | Venganza Ciega         | Señala al azar: el elegido bebe.                                            | No          |

---

## 🌍 Global (C)
| ID  | Título                  | Descripción                                                                 | Persistente |
|-----|-------------------------|-----------------------------------------------------------------------------|-------------|
| C01 | Ronda de Chupitos      | Todos los goblins vivos beben 1 poción.                                     | No          |
| C02 | Asamblea Goblin        | El más votado bebe 1 poción.                                                | No          |

---

## 🤡 Rasgos (D)
| ID  | Título                  | Descripción                                                                 | Persistente |
|-----|-------------------------|-----------------------------------------------------------------------------|-------------|
| D01 | Moda Mortal: Gorros    | Goblins con gorro beben.                                                    | No          |
| D02 | Moda Mortal: Gafas     | Goblins con gafas beben.                                                    | No          |
| D03 | Anatomía: Cuernos      | Goblins con cuernos beben.                                                  | No          |
| D04 | Boca Abierta           | Goblins con boca abierta beben.                                             | No          |
| D05 | Tirantes               | El goblin con tirantes bebe.                                                | No          |

---

## ✨ Conjuros (S) – Persistentes
| ID  | Título                  | Descripción                                                                                     | Persistente |
|-----|-------------------------|-------------------------------------------------------------------------------------------------|-------------|
| S01 | Conjuro Zalerozo        | Hablar con Z; fallo = beber.                                                                    | Sí          |
| S02 | Conjuro Pulgares        | Prohibido usar pulgares.                                                                        | Sí          |
| S03 | Conjuro del Eco         | Todo se dice dos veces.                                                                         | Sí          |
| S04 | Conjuro del Silencio    | Prohibido hablar.                                                                               | Sí          |
| S05 | Nombres Prohibidos      | No usar nombres reales.                                                                         | Sí          |
| S06 | Conjuro T-Rex           | Codos pegados al cuerpo.                                                                        | Sí          |
| S07 | Conjuro de la Mirada    | Contacto visual = beber.                                                                        | Sí          |
| S08 | Tratamiento Real        | Hablar con títulos.                                                                             | Sí          |
| S09 | Risa Mortal             | No reírse.                                                                                      | Sí          |
| S10 | Chiquitín               | Usar diminutivos.                                                                               | Sí          |
| S11 | Grandote                | Usar aumentativos.                                                                              | Sí          |

---

## 🎁 Bonus
| ID      | Título              | Descripción                                                              | Persistente |
|---------|---------------------|--------------------------------------------------------------------------|-------------|
| BONUS01 | Regalo de la Casa   | Ganas 1 antídoto inmediatamente.                                         | No          |