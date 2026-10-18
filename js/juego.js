// juego.js
import {
    ANCHO_PANTALLA, ALTO_PANTALLA,
    ALTO_BARRA_SUP, ALTO_BARRA_INF,
    POSICIONES_CASILLAS, ULTIMA_CASILLA, CASILLA_LLEGADA,
    CASILLAS_DESAFIO, CASILLAS_PERDER_TURNO,
    CASILLAS_RETROCEDER, CASILLAS_AVANZAR,
    ARCHIVO_TABLERO,
    MAX_JUGADORES, COLORES_JUGADORES,
    IMG_DADO, IMG_BOTON_AYUDA, IMG_BOTON_RESET,
    IMG_BOTON_LANZAR, IMG_BOTON_PASAR, IMG_BAA, IMG_FONDO_DESAFIO,
} from './config.js';
import { DESAFIOS } from './desafios.js';

// Colores generales
export const COLOR_FONDO       = '#282828';
export const COLOR_BOTON       = '#464646';
export const COLOR_BOTON_HOVER = '#646464';
export const COLOR_TEXTO_BOTON = '#ffffff';
export const COLOR_TEXTO       = '#ffffff';
export const COLOR_TITULO      = '#ffffc8';
export const COLOR_JUGADOR1    = COLORES_JUGADORES[0];
export const COLOR_JUGADOR2    = COLORES_JUGADORES[1];

// -------------------------------------------------
// Boton
// -------------------------------------------------
export class Boton {
    constructor(x, y, ancho, alto, texto,
                imagen = null,
                color = COLOR_BOTON,
                colorHover = COLOR_BOTON_HOVER) {
        this.x = x; this.y = y;
        this.ancho = ancho; this.alto = alto;
        this.texto = texto;
        this.imagen = imagen;
        this.color = color;
        this.colorHover = colorHover;
        this.activo = true;
        this.visible = true;
    }
    estaSobre(mx, my) {
        return mx >= this.x && mx <= this.x + this.ancho &&
               my >= this.y && my <= this.y + this.alto;
    }
    click(mx, my) {
        return this.activo && this.visible && this.estaSobre(mx, my);
    }
}

// -------------------------------------------------
// Juego
// -------------------------------------------------
export class Juego {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.anchoPantalla = ANCHO_PANTALLA;
        this.altoPantalla  = ALTO_PANTALLA;
        this.escala = 1;

        // Nombres de los 6 posibles jugadores (arrancan vacíos)
        this.nombres = ['', '', '', '', '', ''];
        
        this.nombresIngresados = false;
        this.ingresandoNombre = 0;   // 0..5 = índice; -1 = ninguno
        this.ultimoParpadeo = 0;
        this.mostrarCursor = true;

        // Partida
        this.partida = null;

        // Mensajes
        this.mensaje = "";
        this.tiempoMensaje = 0;
        this.mensajeColor = COLOR_TEXTO;

        // Carteles
        this.mostrarAyuda = false;
        this.mostrarDesafio = false;
        this.desafioActual = null;
        this.desafioJugador = null;

        // Imágenes
        this.imgTableroOriginal = null;
        this.imgTablero = null;
        this.imgBaa = null;
        this.imgDado = [];           // 6 imágenes
        this.imgBotonAyuda = null;
        this.imgBotonReset = null;
        this.imgBotonLanzar = null;
        this.imgBotonPasar = null;
        this.imgFondoDesafio = null;

        // Sonidos
        this.sonidoWin = null;
        this.sonidoClic = null;
        this.sonidoError = null;
        this.sonidoCoin = null;
        this.musicaFondo = null;
        this.sonidoDado = null;
        this.sonidoRetroceder = null;
        this.sonidoAvanzar    = null;

        // Fuentes
        this.tamanoFuente = 20;
        this.tamanoFuenteGrande = 48;
        this.tamanoFuenteInput = 28;
        this.tamanoFuenteChica = 16;
        this.tamanoFuentePregunta = 32;

        // Botones
        this.botones = [];
        this.botonLanzar = null;
        this.botonAyuda = null;
        this.botonReiniciar = null;
        this.botonVF_Verdadero = null;
        this.botonVF_Falso = null;

        // Mouse
        this.mouseX = 0;
        this.mouseY = 0;
        this.mousePresionado = false;

        // Escala del tablero
        this.escalaTablero = 1;
        this.offsetTableroX = 0;
        this.offsetTableroY = 0;
        this.anchoTableroDib = 0;
        this.altoTableroDib  = 0;

        // Dado
        this.ultimoDado = null;  // 1..6
        this.animandoDado = false;
        this.tiempoInicioDado = 0;
        this.dadoMostrado = 1;

        // Desafíos
        this.mazoDesafios = [];

        this.volverAInput = false;

        // Animación del dado
        this.animandoDado = false;
        this.tiempoInicioDado = 0;
        this.dadoMostrado = 1;        // cara visible mientras anima
        this.ultimoDado = null;       // resultado final

        // Animación de movimiento
        this.animandoFicha = false;
        this.casillaAnimActual = 0;   // casilla que se está mostrando
        this.casillaAnimDestino = 0;
        this.jugadorAnimIdx = -1;     // índice del jugador que se mueve
        this.tiempoProxPaso = 0;      // timestamp del próximo paso
        this.pasoDuracion = 400;      // ms por casilla
        this.movimientoEsEspecial = false;

        // Desafío en curso
        this.mostrarDesafio = false;     // ya lo tenés
        this.desafioActual = null;       // ya lo tenés
        this.resultadoDesafio = null;    // 'correcto' | 'incorrecto' | null
        this.tiempoResultadoDesafio = 0;
    }

    async cargarRecursos() {
        const fontFace = new FontFace('Junegull', 'url(fonts/junegull.ttf)');
        await fontFace.load();
        document.fonts.add(fontFace);

        this.imgTableroOriginal = await this.cargarImagen(ARCHIVO_TABLERO);
        this.imgBaa = await this.cargarImagen(IMG_BAA);
        this.imgBotonAyuda  = await this.cargarImagen(IMG_BOTON_AYUDA);
        this.imgBotonReset  = await this.cargarImagen(IMG_BOTON_RESET);
        this.imgBotonLanzar = await this.cargarImagen(IMG_BOTON_LANZAR);
        this.imgBotonPasar  = await this.cargarImagen(IMG_BOTON_PASAR);
        this.imgFondoDesafio = await this.cargarImagen(IMG_FONDO_DESAFIO);

        // Imágenes del dado
        this.imgDado = [];
        for (const src of IMG_DADO) {
            this.imgDado.push(await this.cargarImagen(src));
        }

        this.sonidoWin   = new Audio('sonidos/win.mp3');
        this.sonidoClic  = new Audio('sonidos/clic.mp3');
        this.sonidoError = new Audio('sonidos/error.mp3');
        this.sonidoCoin  = new Audio('sonidos/coin.mp3');
        this.musicaFondo = new Audio('sonidos/loop.mp3');
        this.sonidoDado  = new Audio('sonidos/dado.mp3');
        this.sonidoRetroceder = new Audio('sonidos/retroceder.mp3');
        this.sonidoAvanzar    = new Audio('sonidos/avanzar.mp3');
        this.musicaFondo.loop = true;
    }

    cargarImagen(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
            img.src = src;
        });
    }

    reproducirSonido(a) {
        if (!a) return;
        try { a.currentTime = 0; a.play().catch(() => {}); } catch (e) {}
    }
    iniciarMusica() { if (this.musicaFondo) this.musicaFondo.play().catch(() => {}); }
    detenerMusica() {
        if (this.musicaFondo) { this.musicaFondo.pause(); this.musicaFondo.currentTime = 0; }
    }

    // -------------------------------------------------
    // Escalado
    // -------------------------------------------------
    recalcularTamanos() {
        const escalaX = this.anchoPantalla / ANCHO_PANTALLA;
        const escalaY = this.altoPantalla  / ALTO_PANTALLA;
        this.escala = Math.min(escalaX, escalaY);

        this.tamanoFuente        = Math.max(12, Math.floor(22 * this.escala));
        this.tamanoFuenteGrande  = Math.max(16, Math.floor(42 * this.escala));
        this.tamanoFuenteInput   = Math.max(14, Math.floor(28 * this.escala));
        this.tamanoFuenteChica   = Math.max(10, Math.floor(16 * this.escala));
        this.tamanoFuentePregunta= Math.max(16, Math.floor(32 * this.escala));

        // Calcular espacio disponible para el tablero
        if (this.imgTableroOriginal) {
            const anchoImg = this.imgTableroOriginal.width;
            const altoImg  = this.imgTableroOriginal.height;

            const altoBarraSup = Math.floor(ALTO_BARRA_SUP * this.escala);
            const altoBarraInf = Math.floor(ALTO_BARRA_INF * this.escala);
            const margen = Math.floor(10 * this.escala);

            const disponibleAncho = this.anchoPantalla - margen * 2;
            const disponibleAlto  = this.altoPantalla - altoBarraSup - altoBarraInf - margen * 2;

            this.escalaTablero = Math.min(
                disponibleAncho / anchoImg,
                disponibleAlto  / altoImg
            );

            this.anchoTableroDib = anchoImg * this.escalaTablero;
            this.altoTableroDib  = altoImg  * this.escalaTablero;

            this.offsetTableroX = Math.floor((this.anchoPantalla - this.anchoTableroDib) / 2);
            this.offsetTableroY = altoBarraSup + margen
                + Math.floor((disponibleAlto - this.altoTableroDib) / 2);

            //this.imgTablero = this.escalarImagen(
            //    this.imgTableroOriginal,
            //    Math.floor(this.anchoTableroDib),
            //    Math.floor(this.altoTableroDib)
            //);
        }
    }

    escalarImagen(img, ancho, alto) {
        const c = document.createElement('canvas');
        c.width = ancho;
        c.height = alto;
        const cx = c.getContext('2d');
        cx.imageSmoothingEnabled = true;
        cx.imageSmoothingQuality = 'high';
        cx.drawImage(img, 0, 0, ancho, alto);
        return c;
    }

    tableroA_canvas(pos) {
        return {
            x: this.offsetTableroX + pos.x * this.escalaTablero,
            y: this.offsetTableroY + pos.y * this.escalaTablero
        };
    }

    coordPantallaA_Juego(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (clientX - rect.left) * (this.canvas.width  / rect.width);
        const y = (clientY - rect.top ) * (this.canvas.height / rect.height);
        return [x, y];
    }

    // -------------------------------------------------
    // Botones
    // -------------------------------------------------
    crearBotones() {
        this.botones = [];
        const esc = this.escala;
        const centroX = Math.floor(this.anchoPantalla / 2);

        // --- Barra superior ---
        const altoBarraSup = Math.floor(ALTO_BARRA_SUP * esc);
        const altoBotonSup = Math.floor(60 * esc);   // alto máximo del botón
        const margenIcono  = Math.floor(15 * esc);

        // Ayuda: mantener proporción original
        let anchoAyuda = altoBotonSup;
        if (this.imgBotonAyuda) {
            const ratio = this.imgBotonAyuda.width / this.imgBotonAyuda.height;
            anchoAyuda = Math.floor(altoBotonSup * ratio);
        }
        this.botonAyuda = new Boton(
            margenIcono,
            Math.floor((altoBarraSup - altoBotonSup) / 2),
            anchoAyuda, altoBotonSup,
            "AYUDA", this.imgBotonAyuda
        );
        this.botones.push(this.botonAyuda);

        // Reiniciar: mantener proporción original
        let anchoReiniciar = altoBotonSup;
        if (this.imgBotonReset) {
            const ratio = this.imgBotonReset.width / this.imgBotonReset.height;
            anchoReiniciar = Math.floor(altoBotonSup * ratio);
        }
        this.botonReiniciar = new Boton(
            this.anchoPantalla - anchoReiniciar - margenIcono,
            Math.floor((altoBarraSup - altoBotonSup) / 2),
            anchoReiniciar, altoBotonSup,
            "REINICIAR", this.imgBotonReset
        );
        this.botones.push(this.botonReiniciar);

        // --- Barra inferior ---
        const altoBarraInf = Math.floor(ALTO_BARRA_INF * esc);
        const yBarraInf = this.altoPantalla - altoBarraInf;

        // Botón TIRAR DADO (un poco a la izquierda del centro, para dejar lugar al dado)
        const anchoLanzar = Math.floor(200 * esc);
        const altoLanzar  = Math.floor(60 * esc);
        const desplazamientoIzq = Math.floor(50 * esc);  // ← cuánto correrlo
        this.botonLanzar = new Boton(
            centroX - Math.floor(anchoLanzar / 2) - desplazamientoIzq,
            yBarraInf + Math.floor((altoBarraInf - altoLanzar) / 2),
            anchoLanzar, altoLanzar,
            "TIRAR DADO", this.imgBotonLanzar
        );
        this.botones.push(this.botonLanzar);

        // --- Botones V/F del desafío (por fuera de la tarjeta, debajo) ---
        const anchoModal = Math.floor(800 * esc);
        const altoModal  = Math.floor(400 * esc);
        const xModal = Math.floor((this.anchoPantalla - anchoModal) / 2);
        const yModal = Math.floor((this.altoPantalla  - altoModal ) / 2);

        const anchoVF = Math.floor(200 * esc);
        const altoVF  = Math.floor(60  * esc);
        const sepVF   = Math.floor(30  * esc);
        const margenDebajo = Math.floor(25 * esc);
        const yVF = yModal + altoModal + margenDebajo;
        const centroXModal = xModal + Math.floor(anchoModal / 2);

        this.botonVF_Verdadero = new Boton(
            centroXModal - anchoVF - Math.floor(sepVF / 2),
            yVF,
            anchoVF, altoVF, "VERDADERO", null,
            '#32c832', '#3ce03c'
        );
        this.botonVF_Falso = new Boton(
            centroXModal + Math.floor(sepVF / 2),
            yVF,
            anchoVF, altoVF, "FALSO", null,
            '#c83232', '#e03c3c'
        );
    }

    actualizarBotones() {
        if (!this.partida) {
            if (this.botonLanzar) this.botonLanzar.activo = false;
            return;
        }
        const bloqueado = this.partida.terminada
            || this.mostrarDesafio
            || this.animandoDado
            || this.animandoFicha
            || (this.resultadoDesafio !== null);
        this.botonLanzar.activo = !bloqueado;
        this.botonReiniciar.activo = true;
        this.botonAyuda.activo = true;
    }

    // -------------------------------------------------
    // Input de nombres (6 cajas)
    // -------------------------------------------------
    iniciarPartida() {
        // Tomar solo los nombres no vacíos, con su color original
        const nombresFinales = [];
        for (let i = 0; i < MAX_JUGADORES; i++) {
            const n = this.nombres[i].trim();
            if (n) {
                nombresFinales.push({
                    nombre: n,
                    color: COLORES_JUGADORES[i],
                });
            }
        }

        // Si hay menos de 2, completar con "Jugador 1" y "Jugador 2"
        // (usando los colores de las posiciones libres que sigan disponibles)
        if (nombresFinales.length < 2) {
            const usados = nombresFinales.length;
            for (let i = usados; i < 2; i++) {
                nombresFinales.push({
                    nombre: `Jugador ${i + 1}`,
                    color: COLORES_JUGADORES[i],
                });
            }
        }

        // Máximo 6
        if (nombresFinales.length > MAX_JUGADORES) {
            nombresFinales.length = MAX_JUGADORES;
        }

        this.nombresIngresados = true;

        // Sorteo del orden
        const orden = nombresFinales.map((_, i) => i);
        for (let i = orden.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [orden[i], orden[j]] = [orden[j], orden[i]];
        }

        this.partida = {
            jugadores: nombresFinales,
            orden: orden,
            turnoOrdenIdx: 0,
            posiciones: nombresFinales.map(() => 0),
            terminada: false,
            ganador: null,
            pierdeTurno: nombresFinales.map(() => false),
        };

        const primero = this.partida.jugadores[orden[0]];
        this.mensaje = `¡Empieza ${primero.nombre}!`;
        this.tiempoMensaje = Date.now();
        this.mensajeColor = primero.color;

        this.mazoDesafios = [...DESAFIOS];
        for (let i = this.mazoDesafios.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.mazoDesafios[i], this.mazoDesafios[j]] =
            [this.mazoDesafios[j], this.mazoDesafios[i]];
        }

        this.actualizarBotones();
    }

    jugadorActual() {
        if (!this.partida) return null;
        return this.partida.jugadores[this.partida.orden[this.partida.turnoOrdenIdx]];
    }
    indiceJugadorActual() {
        if (!this.partida) return -1;
        return this.partida.orden[this.partida.turnoOrdenIdx];
    }

    // -------------------------------------------------
    // Teclado
    // -------------------------------------------------
    procesarTeclaInput(evento) {
        if (evento.key === 'Enter') {
            // ENTER en cualquier momento inicia el juego
            this.iniciarPartida();
            return false;
        } else if (evento.key === 'Tab') {
            // Tab / Shift+Tab para navegar entre cajas
            evento.preventDefault();
            if (evento.shiftKey) {
                this.ingresandoNombre =
                    (this.ingresandoNombre - 1 + MAX_JUGADORES) % MAX_JUGADORES;
            } else {
                this.ingresandoNombre =
                    (this.ingresandoNombre + 1) % MAX_JUGADORES;
            }
            return true;
        } else if (evento.key === 'Backspace') {
            if (this.ingresandoNombre >= 0) {
                this.nombres[this.ingresandoNombre] =
                    this.nombres[this.ingresandoNombre].slice(0, -1);
            }
        } else if (evento.key.length === 1) {
            if (this.ingresandoNombre >= 0) {
                this.nombres[this.ingresandoNombre] += evento.key;
            }
        }
        return true;
    }

    procesarClickInput(x, y) {
        for (let i = 0; i < MAX_JUGADORES; i++) {
            const rect = this.rectInput(i);
            if (x >= rect.x && x <= rect.x + rect.w &&
                y >= rect.y && y <= rect.y + rect.h) {
                this.ingresandoNombre = i;
                return;
            }
        }
    }

    rectInput(i) {
        const esc = this.escala;
        const centroX = Math.floor(this.anchoPantalla / 2);
        const altoCaja = Math.floor(50 * esc);
        const anchoCaja = Math.floor(350 * esc);
        const sep = Math.floor(12 * esc);
        const totalAlto = MAX_JUGADORES * altoCaja + (MAX_JUGADORES - 1) * sep;
        const yInicio = Math.floor((this.altoPantalla - totalAlto) / 2) + Math.floor(40 * esc);
        return {
            x: centroX - Math.floor(anchoCaja / 2),
            y: yInicio + i * (altoCaja + sep),
            w: anchoCaja,
            h: altoCaja
        };
    }

    // -------------------------------------------------
    // Click de juego
    // -------------------------------------------------
    procesarClickJuego(x, y) {
        if (this.mostrarDesafio) {
            if (this.botonVF_Verdadero.click(x, y)) this.responderDesafio(true);
            else if (this.botonVF_Falso.click(x, y)) this.responderDesafio(false);
            return;
        }
        if (this.botonLanzar.click(x, y)) { this.lanzarDado(); return; }
        if (this.botonReiniciar.click(x, y)) { this.reiniciarPartida(); return; }
        if (this.botonAyuda.click(x, y)) { this.mostrarAyuda = !this.mostrarAyuda; return; }
    }

    procesarTeclaJuego(evento) {
        if (this.mostrarAyuda && evento.key === 'Enter') {
            this.mostrarAyuda = false;
        }
        return true;
    }

    // -------------------------------------------------
    // Placeholders (Etapa 3+)
    // -------------------------------------------------
    lanzarDado() {
        if (this.animandoDado || this.animandoFicha) return;
        if (!this.partida || this.partida.terminada) return;
        if (this.mostrarDesafio) return;

        this.reproducirSonido(this.sonidoDado);
        this.animandoDado = true;
        this.tiempoInicioDado = Date.now();
        this.dadoMostrado = 1;
        this.ultimoDado = null;
        this.actualizarBotones();
    }
    responderDesafio() {
        this.mostrarDesafio = false;
        this.actualizarBotones();
    }
    reiniciarPartida() {
        this.partida = null;
        this.nombresIngresados = false;
        this.ingresandoNombre = 0;
        this.nombres = ['', '', '', '', '', ''];
        this.mostrarDesafio = false;
        this.mostrarAyuda = false;
        this.desafioActual = null;
        this.mensaje = "";
        this.ultimoDado = null;
        this.animandoDado = false;
        this.animandoFicha = false;
        this.jugadorAnimIdx = -1;
        this.volverAInput = true;
        this.actualizarBotones();
        this.movimientoEsEspecial = false;
        this.resultadoDesafio = null;
        this.desafioJugador = null;
        this.iniciarMusica();
    }

    actualizarAnimaciones() {
        const ahora = Date.now();

        // --- Animación del dado ---
        if (this.animandoDado) {
            const transcurrido = ahora - this.tiempoInicioDado;
            const DURACION_DADO = 500;

            if (transcurrido < DURACION_DADO) {
                // Cambiar la cara cada 60ms
                const cara = 1 + Math.floor((transcurrido / 60) % 6);
                this.dadoMostrado = cara;
            } else {
                // Terminó: definir resultado
                this.ultimoDado = 1 + Math.floor(Math.random() * 6);
                this.dadoMostrado = this.ultimoDado;
                this.animandoDado = false;
                //this.reproducirSonido(this.sonidoCoin);

                this.mensaje = `¡Sacaste ${this.ultimoDado}!`;
                this.tiempoMensaje = Date.now();
                const j = this.jugadorActual();
                this.mensajeColor = j.color;

                // Arrancar movimiento
                this.iniciarMovimiento(this.ultimoDado);
            }
            return;
        }

        // --- Animación de la ficha ---
        if (this.animandoFicha) {
            if (ahora >= this.tiempoProxPaso) {
                const paso = (this.casillaAnimActual < this.casillaAnimDestino) ? +1 : -1;

                if ((paso > 0 && this.casillaAnimActual < this.casillaAnimDestino) ||
                    (paso < 0 && this.casillaAnimActual > this.casillaAnimDestino)) {
                    this.casillaAnimActual += paso;
                    this.partida.posiciones[this.jugadorAnimIdx] = this.casillaAnimActual;

                    if (this.casillaAnimActual !== this.casillaAnimDestino) {
                        this.tiempoProxPaso = ahora + this.pasoDuracion;
                    } else {
                        // Llegó al destino
                        this.animandoFicha = false;
                        if (this.movimientoEsEspecial) {
                            // Fin de un retroceso/avance especial: no aplicar otra casilla especial
                            this.movimientoEsEspecial = false;
                            this.finalizarTurno();
                        } else {
                            this.finalizarMovimiento();
                        }
                    }
                }
            }
        }
    }

    iniciarMovimiento(pasos) {
        const idx = this.indiceJugadorActual();
        const posActual = this.partida.posiciones[idx];
        const posDestino = Math.min(posActual + pasos, ULTIMA_CASILLA + 1); // 41 = llegada

        if (posDestino === posActual) {
            // No se mueve (raro, pero por las dudas)
            this.finalizarTurno();
            return;
        }

        this.animandoFicha = true;
        this.jugadorAnimIdx = idx;
        this.casillaAnimActual = posActual;
        this.casillaAnimDestino = posDestino;
        this.tiempoProxPaso = Date.now() + 800;   // primer paso casi inmediato
        this.actualizarBotones();
    }

    finalizarMovimiento() {
        const idx = this.jugadorAnimIdx;
        const pos = this.partida.posiciones[idx];

        // ¿Llegó?
        if (pos >= CASILLA_LLEGADA) {
            this.partida.terminada = true;
            this.partida.ganador = this.partida.jugadores[idx];
            this.reproducirSonido(this.sonidoWin);
            this.mensaje = `¡${this.partida.ganador.nombre} GANÓ!`;
            this.tiempoMensaje = Date.now();
            this.mensajeColor = this.partida.ganador.color;
            this.actualizarBotones();
            return;
        }

        // Aplicar casilla especial (sin encadenamiento)
        // Pausa para que el jugador vea dónde cayó, después aplicar la casilla especial
        const PAUSA_ANTES_DE_ESPECIAL = 600; // ms
        setTimeout(() => {
            // Verificar que la partida siga activa (por si reiniciaron)
            if (!this.partida || this.partida.terminada) return;
            this.aplicarCasillaEspecial(idx, pos);
        }, PAUSA_ANTES_DE_ESPECIAL);
    }

    finalizarTurno() {
        const n = this.partida.orden.length;

        // Avanzar al siguiente en el orden
        this.partida.turnoOrdenIdx =
            (this.partida.turnoOrdenIdx + 1) % n;

        // Saltear turnos a los que pierden
        let intentos = 0;
        while (this.partida.pierdeTurno[this.partida.orden[this.partida.turnoOrdenIdx]]
               && intentos < n) {
            const idx = this.partida.orden[this.partida.turnoOrdenIdx];
            this.partida.pierdeTurno[idx] = false;   // ya cumplió el castigo
            this.partida.turnoOrdenIdx = (this.partida.turnoOrdenIdx + 1) % n;
            intentos++;
        }

        this.actualizarBotones();
    }

    aplicarCasillaEspecial(idx, pos) {
        // pos es la casilla donde cayó (1..40)
        const jugador = this.partida.jugadores[idx];

        // --- PERDÉS UN TURNO ---
        if (CASILLAS_PERDER_TURNO.includes(pos)) {
            this.partida.pierdeTurno[idx] = true;
            this.mensaje = `${jugador.nombre} pierde el próximo turno`;
            this.tiempoMensaje = Date.now();
            this.mensajeColor = jugador.color;
            this.reproducirSonido(this.sonidoError);
            // Dar tiempo a leer el mensaje antes de pasar turno
            setTimeout(() => {
                if (!this.partida || this.partida.terminada) return;
                this.finalizarTurno();
            }, 900);
            return;
        }

        // --- RETROCEDÉ 5 ---
        if (CASILLAS_RETROCEDER[pos] !== undefined) {
            const destino = CASILLAS_RETROCEDER[pos];
            this.mensaje = `${jugador.nombre} retrocede a la casilla ${destino}`;
            this.tiempoMensaje = Date.now();
            this.mensajeColor = jugador.color;
            this.reproducirSonido(this.sonidoRetroceder);
            this.moverEspecial(idx, destino, false);
            return;
        }

        // --- AVANZÁ 5 ---
        if (CASILLAS_AVANZAR[pos] !== undefined) {
            const destino = CASILLAS_AVANZAR[pos];
            this.mensaje = `${jugador.nombre} avanza a la casilla ${destino}`;
            this.tiempoMensaje = Date.now();
            this.mensajeColor = jugador.color;
            this.reproducirSonido(this.sonidoAvanzar);
            this.moverEspecial(idx, destino, true);
            return;
        }

        // --- DESAFÍO (Etapa 5) ---
        if (CASILLAS_DESAFIO.includes(pos)) {
            this.iniciarDesafio(idx);
            return;
        }

        // --- Casilla común: pasar turno ---
        this.finalizarTurno();
    }

    moverEspecial(idx, destino, haciaAdelante) {
        const posActual = this.partida.posiciones[idx];

        this.animandoFicha = true;
        this.jugadorAnimIdx = idx;
        this.casillaAnimActual = posActual;
        this.casillaAnimDestino = destino;
        this.movimientoEsEspecial = true;    // flag para saber que es un movimiento secundario
        this.tiempoProxPaso = Date.now() + 300;
        this.actualizarBotones();
    }

    iniciarDesafio(idx) {
        // Sacar carta del mazo (sin reposición)
        this.desafioActual = this.sacarCartaDesafio();
        this.desafioJugador = idx;
        this.mostrarDesafio = true;
        this.resultadoDesafio = null;
        this.actualizarBotones();
    }

    sacarCartaDesafio() {
        // Si el mazo se vació, rebarajar todas las cartas
        if (this.mazoDesafios.length === 0) {
            this.mazoDesafios = [...DESAFIOS];
            for (let i = this.mazoDesafios.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.mazoDesafios[i], this.mazoDesafios[j]] =
                [this.mazoDesafios[j], this.mazoDesafios[i]];
            }
        }
        return this.mazoDesafios.pop();
    }

    responderDesafio(esVerdadero) {
        if (!this.desafioActual) return;

        const correcto = (esVerdadero === this.desafioActual.respuesta);

        // Cerrar modal
        this.mostrarDesafio = false;

        // Mostrar cartel de resultado
        this.resultadoDesafio = correcto ? 'correcto' : 'incorrecto';
        this.tiempoResultadoDesafio = Date.now();

        // Reproducir sonido
        this.reproducirSonido(correcto ? this.sonidoCoin : this.sonidoError);

        // Después de un rato, continuar
        const DURACION_RESULTADO = 1200;
        setTimeout(() => {
            if (!this.partida || this.partida.terminada) return;
            this.resultadoDesafio = null;

            if (correcto) {
                // Vuelve a tirar: no pasa turno
                this.actualizarBotones();
            } else {
                // Falla: pasa turno
                this.finalizarTurno();
            }
        }, DURACION_RESULTADO);
    }
}