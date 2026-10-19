// dibujo.js
import {
    Juego, COLOR_FONDO, COLOR_TEXTO, COLOR_TITULO,
    COLOR_TEXTO_BOTON, COLOR_BOTON, COLOR_BOTON_HOVER,
} from './juego.js';
import {
    POSICIONES_CASILLAS, ALTO_BARRA_SUP, ALTO_BARRA_INF,
    MAX_JUGADORES, COLORES_JUGADORES,
} from './config.js';

function medirTexto(ctx, texto, fuente) {
    ctx.font = fuente;
    return ctx.measureText(texto).width;
}

function dibujarTexto(ctx, texto, x, y, fuente, color, centrado = false) {
    ctx.font = fuente;
    ctx.fillStyle = color;
    ctx.textBaseline = 'alphabetic';
    const m = ctx.measureText(texto);
    const alto = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    const offsetY = m.actualBoundingBoxAscent - alto / 2;
    const yAjust = y + offsetY;
    if (centrado) {
        const ancho = ctx.measureText(texto).width;
        ctx.fillText(texto, x - ancho / 2, yAjust);
    } else {
        ctx.fillText(texto, x, yAjust);
    }
}

// -------------------------------------------------
// Pantalla de input
// -------------------------------------------------
Juego.prototype.dibujarInputNombres = function() {
    const ctx = this.ctx;
    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, 0, this.anchoPantalla, this.altoPantalla);

    const centroX = Math.floor(this.anchoPantalla / 2);
    const esc = this.escala;
    const fuenteTitulo = `${this.tamanoFuenteGrande}px Junegull`;
    const fuenteInput  = `${this.tamanoFuenteInput}px Junegull`;

    dibujarTexto(ctx, "Carrera al compás", centroX,
                 Math.floor(60 * esc),
                 fuenteTitulo, COLOR_TITULO, true);
    dibujarTexto(ctx, "Ingresá los nombres (2 a 6 jugadores).",
                 centroX, Math.floor(110 * esc),
                 fuenteInput, '#ffffff', true);

    const ahora = Date.now();
    if (ahora - this.ultimoParpadeo > 500) {
        this.mostrarCursor = !this.mostrarCursor;
        this.ultimoParpadeo = ahora;
    }

    for (let i = 0; i < MAX_JUGADORES; i++) {
        const rect = this.rectInput(i);
        const colorJ = COLORES_JUGADORES[i];

        // Etiqueta
        dibujarTexto(ctx, `Jugador ${i + 1}:`,
                     rect.x - Math.floor(140 * esc),
                     rect.y + Math.floor(rect.h / 2),
                     fuenteInput, colorJ);

        // Caja
        ctx.strokeStyle = (this.ingresandoNombre === i) ? '#c8c8c8' : '#505050';
        ctx.lineWidth = (this.ingresandoNombre === i) ? 3 : 2;
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

        // Texto
        dibujarTexto(ctx, this.nombres[i],
                     rect.x + Math.floor(15 * esc),
                     rect.y + Math.floor(rect.h / 2),
                     fuenteInput, colorJ);

        // Cursor
        if (this.ingresandoNombre === i && this.mostrarCursor) {
            const anchoTexto = medirTexto(ctx, this.nombres[i], fuenteInput);
            ctx.strokeStyle = colorJ;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(rect.x + Math.floor(15 * esc) + anchoTexto + 2,
                       rect.y + Math.floor(8 * esc));
            ctx.lineTo(rect.x + Math.floor(15 * esc) + anchoTexto + 2,
                       rect.y + rect.h - Math.floor(8 * esc));
            ctx.stroke();
        }
    }

    dibujarTexto(ctx, "Presioná ENTER para comenzar.",
                 centroX, this.altoPantalla - Math.floor(50 * esc),
                 fuenteInput, '#c8c8c8', true);

    if (this.imgBaa) {
        const escalaBaa = 0.4 * esc;
        const anchoBaa = Math.floor(this.imgBaa.width  * escalaBaa);
        const altoBaa  = Math.floor(this.imgBaa.height * escalaBaa);
        ctx.drawImage(this.imgBaa,
                      this.anchoPantalla - anchoBaa - Math.floor(20 * esc),
                      this.altoPantalla - altoBaa  - Math.floor(20 * esc),
                      anchoBaa, altoBaa);
    }
};

// -------------------------------------------------
// Botones
// -------------------------------------------------
Juego.prototype.dibujarBoton = function(boton) {
    if (!boton || !boton.visible) return;
    const ctx = this.ctx;

    if (boton.imagen) {
        // Imagen del botón (con opacidad reducida si está deshabilitado)
        ctx.save();
        if (!boton.activo) {
            ctx.globalAlpha = 0.4;
        }
        ctx.drawImage(boton.imagen, boton.x, boton.y, boton.ancho, boton.alto);
        ctx.restore();

        // Texto encima de la imagen
        if (boton.texto) {
            const fuente = `${Math.floor(26 * this.escala)}px Junegull`;
            const colorTexto = boton.activo ? COLOR_TEXTO_BOTON : '#808080';
            const offsetX = Math.floor(2 * this.escala);
            const offsetY = Math.floor(3 * this.escala);
            dibujarTexto(ctx, boton.texto,
                         boton.x + boton.ancho / 2 - offsetX,
                         boton.y + boton.alto / 2 - offsetY,
                         fuente, colorTexto, true);
        }
    } else {
        // Botón sin imagen: rectángulo de color con texto
        const sobre = boton.estaSobre(this.mouseX, this.mouseY);
        ctx.fillStyle = boton.activo
            ? (sobre ? boton.colorHover : boton.color)
            : '#2a2a2a';
        ctx.fillRect(boton.x, boton.y, boton.ancho, boton.alto);
        ctx.strokeStyle = '#969696';
        ctx.lineWidth = 2;
        ctx.strokeRect(boton.x, boton.y, boton.ancho, boton.alto);

        if (boton.texto) {
            const fuente = `${Math.floor(24 * this.escala)}px Junegull`;
            const colorTexto = boton.activo ? COLOR_TEXTO_BOTON : '#808080';
            dibujarTexto(ctx, boton.texto,
                         boton.x + boton.ancho / 2,
                         boton.y + boton.alto / 2,
                         fuente, colorTexto, true);
        }
    }
};

Juego.prototype.dibujarBotones = function() {
    for (const b of this.botones) this.dibujarBoton(b);
};

// -------------------------------------------------
// Tablero + fichas
// -------------------------------------------------
Juego.prototype.dibujarTablero = function() {
    const ctx = this.ctx;
    if (this.imgTableroOriginal) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(this.imgTableroOriginal,
                      this.offsetTableroX, this.offsetTableroY,
                      this.anchoTableroDib, this.altoTableroDib);
    }
};

Juego.prototype.dibujarFichasJugadores = function() {
    if (!this.partida) return;
    const ctx = this.ctx;

    const radio = Math.max(10, Math.floor(16 * this.escala));
    const fuenteInicial = `${Math.max(10, Math.floor(16 * this.escala))}px Junegull`;

    // Agrupar por casilla para calcular offset
    const grupos = {};
    for (let i = 0; i < this.partida.posiciones.length; i++) {
        const c = this.partida.posiciones[i];
        if (!grupos[c]) grupos[c] = [];
        grupos[c].push(i);
    }

    for (const casillaIdx in grupos) {
        const indices = grupos[casillaIdx];
        const pos = POSICIONES_CASILLAS[Number(casillaIdx)];
        if (!pos) continue;
        const p = this.tableroA_canvas(pos);

        // Si hay varias fichas en la misma casilla, distribuir en círculo
        const N = indices.length;
        for (let k = 0; k < N; k++) {
            const i = indices[k];
            let ox = 0, oy = 0;
            if (N > 1) {
                const ang = (2 * Math.PI * k) / N - Math.PI / 2;
                const dist = radio * 0.9;
                ox = Math.cos(ang) * dist;
                oy = Math.sin(ang) * dist;
            }
            const cx = p.x + ox;
            const cy = p.y + oy;
            const jugador = this.partida.jugadores[i];

            ctx.beginPath();
            ctx.arc(cx, cy, radio, 0, Math.PI * 2);
            ctx.fillStyle = jugador.color;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Inicial
            dibujarTexto(ctx, jugador.nombre.charAt(0).toUpperCase(),
                         cx, cy,
                         fuenteInicial, '#ffffff', true);
        }
    }
};

// -------------------------------------------------
// Barra superior
// -------------------------------------------------
Juego.prototype.dibujarBarraSuperior = function() {
    const ctx = this.ctx;
    const esc = this.escala;
    const alto = Math.floor(ALTO_BARRA_SUP * esc);

    // Fondo
    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, 0, this.anchoPantalla, alto);

    // Botones Ayuda (izq) y Reiniciar (der)
    this.dibujarBoton(this.botonAyuda);
    this.dibujarBoton(this.botonReiniciar);

    // Turno centrado
    if (this.partida && !this.partida.terminada) {
        const j = this.jugadorActual();
        const fuenteTurno = `${this.tamanoFuenteGrande}px Junegull`;
        dibujarTexto(ctx, `Turno: ${j.nombre}`,
                     this.anchoPantalla / 2,
                     Math.floor(alto / 2 - 4 * esc),
                     fuenteTurno, j.color, true);

        // Mensaje temporal debajo del turno (más chiquito)
        if (this.mensaje && (Date.now() - this.tiempoMensaje < 1500)) {
            const fuenteMsg = `${this.tamanoFuenteChica}px Junegull`;
            dibujarTexto(ctx, this.mensaje,
                         this.anchoPantalla / 2,
                         alto - Math.floor(10 * esc),
                         fuenteMsg, this.mensajeColor, true);
        }
    } else if (this.partida && this.partida.terminada) {
        // Ganador
        const fuenteTurno = `${this.tamanoFuenteGrande}px Junegull`;
        const ganador = this.partida.ganador;
        dibujarTexto(ctx, `¡${ganador.nombre} GANÓ!`,
                     this.anchoPantalla / 2,
                     Math.floor(alto / 2),
                     fuenteTurno, ganador.color, true);
    }
};

// -------------------------------------------------
// Barra inferior
// -------------------------------------------------
Juego.prototype.dibujarBarraInferior = function() {
    const ctx = this.ctx;
    const esc = this.escala;
    const alto = Math.floor(ALTO_BARRA_INF * esc);
    const y = this.altoPantalla - alto;

    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, y, this.anchoPantalla, alto);

    // Logo BAA (izq)
    if (this.imgBaa) {
        const escalaBaa = 0.25 * esc;
        const w = Math.floor(this.imgBaa.width  * escalaBaa);
        const h = Math.floor(this.imgBaa.height * escalaBaa);
        const subirLogo = Math.floor(6 * esc); // cuánto subirlo
        ctx.drawImage(this.imgBaa,
                      Math.floor(15 * esc),
                      y + Math.floor((alto - h) / 2) - subirLogo,
                      w, h);
    }

    // Dado + LANZAR (centro)
    if (this.botonLanzar) this.dibujarBoton(this.botonLanzar);

    // Dado al lado del botón (muestra la cara animada si está animando)
    const caraVisible = this.animandoDado
        ? this.dadoMostrado
        : this.ultimoDado;
    if (caraVisible && this.imgDado[caraVisible - 1]) {
        const tamDado = Math.floor(70 * esc);
        const xDado = this.botonLanzar.x + this.botonLanzar.ancho + Math.floor(15 * esc);
        const yDado = y + Math.floor((alto - tamDado) / 2);
        ctx.drawImage(this.imgDado[caraVisible - 1], xDado, yDado, tamDado, tamDado);
    }

    // Lista de jugadores (der) en el orden de turno
    if (this.partida) {
        const nJug = this.partida.orden.length;

        // Calcular tamaño de fuente y salto según cantidad
        let fuentePx;
        let salto;
        if (nJug <= 3) {
            fuentePx = Math.floor(18 * esc);
            salto    = Math.floor(24 * esc);
        } else if (nJug <= 4) {
            fuentePx = Math.floor(16 * esc);
            salto    = Math.floor(20 * esc);
        } else {
            fuentePx = Math.floor(13 * esc);
            salto    = Math.floor(15 * esc);
        }
        const fuente = `${fuentePx}px Junegull`;

        // Centrar verticalmente el bloque de nombres en la barra inferior
        const altoBloque = salto * nJug;
        const margenSup = Math.max(Math.floor(8 * esc),
            Math.floor((alto - altoBloque) / 2));

        const xLista = this.anchoPantalla - Math.floor(200 * esc);
        let yLista = y + margenSup;

        for (let k = 0; k < nJug; k++) {
            const idx = this.partida.orden[k];
            const j = this.partida.jugadores[idx];
            const esTurno = (k === this.partida.turnoOrdenIdx);
            const prefijo = esTurno ? '▶ ' : '   ';
            dibujarTexto(ctx, `${prefijo}${j.nombre}`,
                         xLista, yLista, fuente, j.color);
            yLista += salto;
        }
    }
};

// -------------------------------------------------
// Cartel de ayuda
// -------------------------------------------------
Juego.prototype.dibujarAyudaCartel = function() {
    if (!this.mostrarAyuda) return;
    const ctx = this.ctx;
    const esc = this.escala;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, this.anchoPantalla, this.altoPantalla);

    const anchoC = Math.floor(950 * esc);
    const altoC  = Math.floor(640 * esc);
    const x = Math.floor((this.anchoPantalla - anchoC) / 2);
    const y = Math.floor((this.altoPantalla  - altoC ) / 2);

    ctx.fillStyle = '#323232';
    ctx.fillRect(x, y, anchoC, altoC);
    ctx.strokeStyle = '#969696';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, anchoC, altoC);

    // Título
    const fuenteTitulo = `${this.tamanoFuenteGrande}px Junegull`;
    dibujarTexto(ctx, "Instrucciones",
                 this.anchoPantalla / 2, y + Math.floor(45 * esc),
                 fuenteTitulo, '#ffffff', true);

    // Línea separadora bajo el título
    ctx.strokeStyle = '#646464';
    ctx.beginPath();
    ctx.moveTo(x + Math.floor(30 * esc), y + Math.floor(75 * esc));
    ctx.lineTo(x + anchoC - Math.floor(30 * esc), y + Math.floor(75 * esc));
    ctx.stroke();

    // Instrucciones (letra más grande: 24px)
    const fuente = `${Math.floor(24 * esc)}px Junegull`;
    const lineas = [
        "1. Los jugadores comienzan en el casillero de SALIDA.",
        "2. El orden de turnos se sortea al inicio de la partida.",
        "3. Cada jugador tira el dado y avanza esa cantidad de casillas.",
        "4. Al caer en un casillero especial deberás hacer lo que indique el tablero.",
        "5. Si caés en un casillero DESAFÍO deberás responder una pregunta.",
        "   Si acertás, volvés a tirar.",
        "6. Gana quien llega primero a la LLEGADA, sin importar si te pasás.",
    ];
    let yl = y + Math.floor(115 * esc);
    for (const l of lineas) {
        dibujarTexto(ctx, l, x + Math.floor(35 * esc), yl, fuente, '#dcdcdc');
        yl += Math.floor(34 * esc);
    }

    // Línea separadora antes de créditos
    const yLineaCreditos = y + altoC - Math.floor(130 * esc);
    ctx.strokeStyle = '#646464';
    ctx.beginPath();
    ctx.moveTo(x + Math.floor(30 * esc), yLineaCreditos);
    ctx.lineTo(x + anchoC - Math.floor(30 * esc), yLineaCreditos);
    ctx.stroke();

    // Créditos
    const fuenteCreditos = `${Math.floor(18 * esc)}px Junegull`;
    const creditos = [
        "Territorio de Juegos - Escuelas en Foco Matemática",
        "Coordinación general: Gloria Rodríguez",
        "Diseño y desarrollo: Andrea Pallai y Ernesto López",
    ];
    let yc = yLineaCreditos + Math.floor(28 * esc);
    for (const l of creditos) {
        dibujarTexto(ctx, l, this.anchoPantalla / 2, yc,
                     fuenteCreditos, '#ffffc8', true);
        yc += Math.floor(24 * esc);
    }

    // Instrucción de cierre
    const fuenteCerrar = `${Math.floor(16 * esc)}px Junegull`;
    dibujarTexto(ctx, "Presioná ENTER para cerrar",
                 this.anchoPantalla / 2,
                 y + altoC - Math.floor(15 * esc),
                 fuenteCerrar, '#969696', true);
};

// -------------------------------------------------
// Modal de desafío
// -------------------------------------------------
Juego.prototype.dibujarDesafio = function() {
    if (!this.mostrarDesafio || !this.desafioActual) return;
    const ctx = this.ctx;
    const esc = this.escala;

    // Fondo oscuro de toda la pantalla
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.anchoPantalla, this.altoPantalla);

    // Dimensiones de la tarjeta (2:1 para no deformar fondo.png)
    const anchoModal = Math.floor(800 * esc);
    const altoModal  = Math.floor(400 * esc);
    const xModal = Math.floor((this.anchoPantalla - anchoModal) / 2);
    const yModal = Math.floor((this.altoPantalla  - altoModal ) / 2);

    // 1) Fondo de la tarjeta
    if (this.imgFondoDesafio) {
        ctx.drawImage(this.imgFondoDesafio, xModal, yModal, anchoModal, altoModal);
    } else {
        ctx.fillStyle = '#323232';
        ctx.fillRect(xModal, yModal, anchoModal, altoModal);
        ctx.strokeStyle = '#969696';
        ctx.lineWidth = 3;
        ctx.strokeRect(xModal, yModal, anchoModal, altoModal);
    }

    // 2) Rectángulo blanco centrado: 60% del ancho de la tarjeta
    const anchoRect = Math.floor(anchoModal * 0.6);
    const altoRect  = Math.floor(altoModal  * 0.7);
    const xRect = xModal + Math.floor((anchoModal - anchoRect) / 2);
    const yRect = yModal + Math.floor((altoModal  - altoRect ) / 2);

    // Sombra suave + blanco
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 8 * esc;
    ctx.shadowOffsetY = 2 * esc;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.97)';
    ctx.fillRect(xRect, yRect, anchoRect, altoRect);
    ctx.restore();

    // Borde fino del rectángulo blanco
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = Math.max(1, Math.floor(2 * esc));
    ctx.strokeRect(xRect, yRect, anchoRect, altoRect);

    // Título con el nombre del jugador
    const fuenteJug = `${this.tamanoFuenteGrande}px Junegull`;
    const jugador = this.partida.jugadores[this.desafioJugador];
    dibujarTexto(ctx, `Desafío para ${jugador.nombre}`,
                 this.anchoPantalla / 2,
                 yModal - Math.floor(20 * esc),
                 fuenteJug, jugador.color, true);

    // 3) Pregunta dentro del rectángulo blanco (en negro)
    const fuentePreg = `${this.tamanoFuentePregunta}px Junegull`;
    const maxAnchoTexto = anchoRect - Math.floor(40 * esc);
    const palabras = this.desafioActual.pregunta.split(' ');
    const lineas = [];
    let act = "";
    for (const p of palabras) {
        const prueba = act ? act + " " + p : p;
        if (medirTexto(ctx, prueba, fuentePreg) > maxAnchoTexto && act) {
            lineas.push(act);
            act = p;
        } else {
            act = prueba;
        }
    }
    if (act) lineas.push(act);

    const altoLinea = Math.floor(this.tamanoFuentePregunta * 1.25);
    const altoTotalTexto = lineas.length * altoLinea;
    let yTexto = yRect + Math.floor((altoRect - altoTotalTexto) / 2) + Math.floor(altoLinea / 2);

    for (const l of lineas) {
        dibujarTexto(ctx, l,
                     xRect + Math.floor(anchoRect / 2),
                     yTexto,
                     fuentePreg, '#111111', true);
        yTexto += altoLinea;
    }

    // 4) Botones V/F (por fuera de la tarjeta, debajo)
    this.dibujarBoton(this.botonVF_Verdadero);
    this.dibujarBoton(this.botonVF_Falso);
};

// -------------------------------------------------
// Dibujo completo
// -------------------------------------------------
Juego.prototype.dibujarJuego = function() {
    const ctx = this.ctx;
    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, 0, this.anchoPantalla, this.altoPantalla);

    this.dibujarTablero();
    this.dibujarFichasJugadores();
    this.dibujarBarraSuperior();
    this.dibujarBarraInferior();
    this.dibujarAyudaCartel();
    this.dibujarDesafio();
    this.dibujarResultadoDesafio();
};

Juego.prototype.dibujarResultadoDesafio = function() {
    if (!this.resultadoDesafio) return;
    const ctx = this.ctx;
    const esc = this.escala;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, this.anchoPantalla, this.altoPantalla);

    const texto = this.resultadoDesafio === 'correcto' ? '¡CORRECTO!' : 'INCORRECTO';
    const color = this.resultadoDesafio === 'correcto' ? '#32c832' : '#e03c3c';

    const fuente = `${this.tamanoFuenteGrande * 1.4}px Junegull`;

    // Sombra para que resalte
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 15 * esc;
    ctx.shadowOffsetY = 4 * esc;
    dibujarTexto(ctx, texto,
                 this.anchoPantalla / 2,
                 this.altoPantalla  / 2,
                 fuente, color, true);
    ctx.restore();
};