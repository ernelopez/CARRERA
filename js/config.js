// config.js
export const ARCHIVO_TABLERO = 'assets/tablero.png';

export const ANCHO_PANTALLA = 1200;
export const ALTO_PANTALLA  = 750;

// Barras fijas (en px lógicos)
export const ALTO_BARRA_SUP = 80;
export const ALTO_BARRA_INF = 100;

// 42 posiciones: [0] = SALIDA, [1..40] = casillas, [41] = LLEGADA
export const POSICIONES_CASILLAS = [
    { x: 796,  y: 756  },  // 0  SALIDA
    { x: 796,  y: 1157 },  // 1
    { x: 1133, y: 1345 },  // 2
    { x: 1454, y: 1162 },  // 3
    { x: 1785, y: 1354 },  // 4  DESAFÍO
    { x: 2107, y: 1171 },  // 5
    { x: 2428, y: 1354 },  // 6
    { x: 2750, y: 1166 },  // 7  PERDÉS TURNO
    { x: 3071, y: 1345 },  // 8
    { x: 3398, y: 1162 },  // 9  AVANZÁ 5
    { x: 3724, y: 1354 },  // 10 DESAFÍO
    { x: 4041, y: 1171 },  // 11
    { x: 4372, y: 1354 },  // 12
    { x: 4694, y: 1537 },  // 13 PERDÉS TURNO
    { x: 4709, y: 1918 },  // 14
    { x: 4367, y: 2106 },  // 15 DESAFÍO
    { x: 4046, y: 1918 },  // 16
    { x: 3719, y: 2111 },  // 17
    { x: 3393, y: 1928 },  // 18
    { x: 3071, y: 2101 },  // 19 PERDÉS TURNO
    { x: 2750, y: 1933 },  // 20
    { x: 2428, y: 2106 },  // 21 RETROCEDÉ 5 → 16
    { x: 2102, y: 1928 },  // 22
    { x: 1781, y: 2101 },  // 23 DESAFÍO
    { x: 1454, y: 1923 },  // 24
    { x: 1123, y: 2106 },  // 25
    { x: 806,  y: 1918 },  // 26 DESAFÍO
    { x: 480,  y: 2101 },  // 27
    { x: 475,  y: 2482 },  // 28 AVANZÁ 5 → 33
    { x: 801,  y: 2660 },  // 29
    { x: 1142, y: 2848 },  // 30 DESAFÍO
    { x: 1454, y: 2660 },  // 31
    { x: 1776, y: 2858 },  // 32
    { x: 2107, y: 2670 },  // 33
    { x: 2424, y: 2843 },  // 34 RETROCEDÉ 5 → 29
    { x: 2760, y: 2680 },  // 35 DESAFÍO
    { x: 3081, y: 2863 },  // 36
    { x: 3408, y: 2660 },  // 37 PERDÉS TURNO
    { x: 3729, y: 2853 },  // 38
    { x: 4051, y: 2665 },  // 39 DESAFÍO
    { x: 4372, y: 2853 },  // 40
    { x: 4362, y: 3241 },  // 41 LLEGADA
];

//export const CASILLAS_DESAFIO = [1, 2, 3, 4, 5, 6]
export const CASILLAS_DESAFIO      = [4, 10, 15, 23, 26, 30, 35, 39];
export const CASILLAS_PERDER_TURNO = [7, 13, 19, 37];
export const CASILLAS_RETROCEDER   = { 21: 16, 34: 29 };
export const CASILLAS_AVANZAR      = { 9: 14, 28: 33 };
export const CASILLAS_DESAFIO_ESPECIAL = [3, 8, 12, 18, 24, 29, 31, 36];

export const ULTIMA_CASILLA = 40;
export const CASILLA_LLEGADA = 41;

// Jugadores
export const MAX_JUGADORES = 6;
export const COLORES_JUGADORES = [
    '#c86464', // 1 rojo
    '#6496dc', // 2 azul
    '#64c864', // 3 verde
    '#e0c832', // 4 amarillo
    '#c864dc', // 5 violeta
    '#e09632', // 6 naranja
];

// Assets
export const IMG_DADO = [
    'assets/dado_1.png',
    'assets/dado_2.png',
    'assets/dado_3.png',
    'assets/dado_4.png',
    'assets/dado_5.png',
    'assets/dado_6.png',
];
export const IMG_BOTON_AYUDA    = 'assets/boton_ayuda.png';
export const IMG_BOTON_RESET    = 'assets/boton_reset.png';
export const IMG_BOTON_LANZAR   = 'assets/boton_lanzar.png';
export const IMG_BOTON_PASAR    = 'assets/boton_pasar.png';
export const IMG_BAA            = 'assets/BAA2.png';
export const IMG_FONDO_DESAFIO = 'assets/fondo.png';

export const DURACION_MENSAJE_MS = 2500;