# Funciones del juego web – Goblins & Pociones

Documento que describe la estructura de pantallas, variables de estado y funciones principales del juego para móvil.  
Se complementa con `spells.md` (mazo de hechizos), `reglas.md`, `assets.md` y `reto_implementar.md`.

---

## 1. Pantallas y su composición

### 1.1 Pantalla de inicio
- **Selector de nombre**: input de texto para el jugador.
- **Selector de goblin**: cuadrícula 3×3 con imágenes de los goblins disponibles.
- **Información del goblin seleccionado**: nombre del goblin, breve descripción (se muestra debajo del selector).
- **Botón "Empezar"**: inicia la partida con el nombre y goblin elegidos.

### 1.2 Pantalla de juego principal
- **Datos del jugador**: nombre de usuario y nombre del goblin.
- **Pociones actuales**: icono de poción + número de pociones restantes.
- **Botón de ajustes**: acceso a configuración (sonido, salir, etc.).
- **Imagen del goblin**: avatar del goblin seleccionado. 
  - **Capa de ocultación parcial**: una imagen superpuesta (segundo fondo) que tapa la mitad inferior del goblin (efecto estético).
- **Zona de cartas**: 4 ranuras para cartas boca abajo.
  - El jugador puede tocar una carta para revelarla.
- **Botón grande de "Reto"**: al pulsarlo se abre la pantalla de reto (popup).
- **Indicador de estado de muerte/revivir**: si el goblin está muerto, se muestra un botón o mensaje para revivir (aparece cuando otro jugador cae, según reglas de hechizos).

### 1.3 Pantalla de reto (popup)
- **Fondo**: oscuro y desenfocado (efecto overlay).
- **Popup central** con:
  - Texto del reto (descripción del hechizo/acción a realizar).
  - En algunos casos, bonus o antídoto ganado.
  - Palabra o botón "Toca para continuar" que cierra el popup.
- **Cierre alternativo**: si se toca fuera del popup, se cierra.

---

## 2. Estado global del juego (gameState)

Se recomienda un objeto `gameState` que contenga:

```javascript
gameState = {
  playerName: '',
  selectedGoblinId: '',
  potions: number,          // pociones actuales
  antidotes: number,        // antídotos (opcional)
  isDead: boolean,          // si el goblin está muerto
  activeSpells: [],         // conjuros persistentes activos (id, titulo, texto)
  currentCards: [],         // array de cartas en mano [{type: 'good'|'bad', id}, ...]
  graveyard: [],            // jugadores muertos (si hay multijugador)
  log: []                   // historial de mensajes
}
---

## 3. Mecánicas principales

### 3.1 Cartas de la mano
- **Reparto inicial**: al empezar la partida se reparten 4 cartas → 3 buenas, 1 mala.
- **Reposición automática**: cuando el jugador se queda sin cartas (tras seleccionarlas todas), se le reponen 3 cartas → 2 buenas, 1 mala.
- **Efecto de seleccionar carta**:
  - Si la carta es buena: nada ocurre (solo se descarta).
  - Si la carta es mala y el jugador tiene pociones > 0: pierde 1 poción.
  - Si la carta es mala y el jugador no tiene pociones: el goblin muere (ver 3.3).

### 3.2 Botón de reto (hechizos)
- Al pulsarlo se selecciona un hechizo aleatorio del mazo `SPELLS_DECK` (definido en `spells.js`).
- Se muestra el popup con el título y la descripción del hechizo (y en su caso el bonus).
- El jugador o el grupo realiza la acción indicada.
- Si el hechizo es de tipo persistente, se añade a `activeSpells` y se muestra un indicador en la interfaz.
- Si el hechizo otorga antídotos (BONUS01), se incrementa el contador correspondiente.
- Algunos hechizos pueden implicar que otro jugador muere; si eso ocurre y el jugador actual está muerto, se aplica la mecánica de revivir (ver 3.3).

### 3.3 Muerte y resurrección
- **Muerte**: cuando el goblin se queda sin pociones y selecciona una carta mala (o por efecto de un hechizo que indique "muerte directa", según reglas del juego de mesa).
- **Estado de muerto**:
  - La imagen del goblin se sustituye por un goblin muerto genérico (asset `goblin_muerto.png`).
  - Se ocultan las cartas y el botón de reto se desactiva o se reemplaza por un botón/mensaje de "Esperando revivir".
- **Revivir**:
  - Si un jugador muerto mata a otro mediante un reto (por ejemplo, un hechizo que obligue a otro a beber y ese otro se quede sin pociones), el jugador revive automáticamente.
  - Al revivir: se restaura la imagen del goblin seleccionado originalmente, se restablece su estado `isDead = false`, y puede seguir jugando (normalmente con alguna poción o sin, según reglas).
  - Mientras está muerto, no puede seleccionar cartas pero sí puede recibir efectos que le hagan revivir.
- **Gestión visual**:
  - Función `actualizarAvatarGoblin()` que alterna entre el goblin vivo y el muerto según el estado.

---

## 4. Listado de funciones por ámbito

### 4.1 Pantalla de inicio
| Función | Descripción |
| --- | --- |
| `inicializarSelectorGoblins()` | Carga la cuadrícula 3x3 con los goblins disponibles y asigna evento de clic. |
| `seleccionarGoblin(id)` | Almacena el goblin elegido y muestra su información (nombre, descripción). |
| `validarNombre(nombre)` | Verifica que el nombre no esté vacío (y cumpla requisitos). |
| `comenzarJuego()` | Guarda nombre + goblin, inicializa estado, reparte cartas iniciales y carga la pantalla de juego. |

### 4.2 Pantalla de juego
| Función | Descripción |
| --- | --- |
| `renderizarPantallaJuego()` | Pinta todos los elementos: nombre, pociones, goblin, cartas, botones. |
| `actualizarPociones(cantidad)` | Modifica el contador de pociones y refresca UI. |
| `repartirCartas()` | Genera el mazo de mano según fase (inicio: 4 cartas [3B,1M]; reposición: 3 cartas [2B,1M]) y las muestra. |
| `seleccionarCarta(indice)` | Revela la carta en la ranura indicada. Aplica lógica de pérdida de poción/muerte. |
| `aplicarEfectoCarta(tipo)` | Si es buena no hace nada, si es mala llama a `perderPocion()`. |
| `perderPocion()` | Desc cuenta 1 poción; si llega a 0 activa `matarGoblin()`. |
| `matarGoblin()` | Cambia estado a muerto, actualiza imagen, oculta cartas, habilita opción de revivir (si aplica). |
| `revivirGoblin()` | Restaura goblin original, estado vivo, y reinicia mano (si procede). |
| `comprobarFinCartas()` | Si el array de cartas está vacío, llama a `repartirCartas()`. |

### 4.3 Pantalla de reto (popup)
| Función | Descripción |
| --- | --- |
| `abrirPopupReto()` | Selecciona hechizo aleatorio, construye el contenido y muestra el popup. |
| `cerrarPopupReto()` | Oculta el popup y reactiva la pantalla de juego. |
| `ejecutarHechizo(hechizo)` | Ejecuta la acción del hechizo (usando la misma lógica que `execute` de `spells.js`, adaptada al juego). Si es persistente, lo agrega al estado. |
| `agregarConjuro(conjuro)` | Añade conjuro activo al jugador (usado por hechizos S01-S11). |
| `agregarAntidoto(cantidad)` | Suma antídotos (llamado por BONUS01 u otros). |

### 4.4 Lógica de hechizos (integración con spells.js)
El mazo `SPELLS_DECK` ya contiene las definiciones con `id`, `titulo`, `texto`, `persistent` y `execute(ctx)`.

`execute` recibe un contexto (`ctx`) que en la versión web deberá tener acceso a:
- `addLog(mensaje)`: añadir entrada al log visual.
- `updateUI()`: refrescar pantalla.
- `agregarConjuro(conjuro)`: activar conjuros persistentes.
- `agregarAntidoto(n)`: modificar antídotos.

Por tanto, se deberá crear un objeto `ctx` adecuado antes de invocar `execute`.

### 4.5 Utilidades de UI
| Función | Descripción |
| --- | --- |
| `addLog(texto)` | Añade un mensaje al historial de la partida (visible en pantalla). |
| `updateUI()` | Vuelve a renderizar la pantalla de juego con los datos actuales de `gameState`. |
| `mostrarNotificacion(mensaje)` | Muestra un pequeño toast o aviso temporal. |

### 4.6 Gestión de estado visual del goblin
| Función | Descripción |
| --- | --- |
| `actualizarAvatarGoblin()` | Si `isDead` es `true`, carga la imagen `goblin_muerto.png`; si no, carga la imagen del goblin seleccionado (con el overlay si se desea). |
| `toggleOverlayGoblin()` | Controla la capa que tapa la mitad inferior del goblin (puede ser estática o animada). |

### 4.7 Menú del juego (Ajustes)
| Función | Descripción |
| --- | --- |
| `guardarEstado()` | Guarda el `gameState` en el `localStorage` para persistir la partida si se recarga o cierra la página. |
| `cargarEstado()` | Comprueba si hay una partida guardada en `localStorage` al iniciar y la restaura. |
| `reiniciarPartida()` | Borra el estado actual (y el `localStorage`) y devuelve al jugador a la pantalla de inicio. |
| `instalarPWA()` | Maneja el evento `beforeinstallprompt` para ofrecer al usuario instalar el juego como aplicación web progresiva (PWA). |

---

## 5. Flujo simplificado de la partida
1. **Inicio** → nombre + goblin → `comenzarJuego()`.
2. **Juego activo**:
   - Se muestran 4 cartas.
   - El jugador elige una → si es mala pierde poción (si tiene) o muere.
   - Si se queda sin cartas → reponer 3 cartas.
   - El botón "Reto" muestra un hechizo aleatorio, que puede afectar al jugador o a otros, causar muertes o revivir.
3. **Muerte** → cambio visual, espera.
4. **Resurrección** → Si otro jugador muere por un reto lanzado por este jugador → revive.
5. **Victoria/Derrota** → definido por las reglas del juego de mesa (último goblin en pie, etc.).

---

*Documento preparado para ser interpretado por una IA junto con los assets, reglas y el mazo de hechizos.*