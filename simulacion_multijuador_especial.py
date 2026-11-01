"""
Simula N partidas de "Carrera al compás" con M jugadores.
Reglas incluidas:
- Dado normal (1-6), avance casilla por casilla.
- Casillas de DESAFÍO (4, 10, 15, 23, 26, 30, 35, 39): 50% acierto.
  Si acierta -> vuelve a tirar. Si falla -> pasa turno.
- Casillas PERDÉS TURNO (7, 13, 19, 37): se saltea el próximo turno.
- Casillas RETROCEDÉ 5 (21, 34) y AVANZÁ 5 (9, 28): mueven sin encadenar.
- Casillas DESAFÍO ESPECIAL (3, 8, 12, 18, 24, 29, 31, 36):
    * Acierta y es primero (incluye empates): no pasa nada.
    * Acierta y no es primero: tira dado; TODOS los primeros retroceden.
    * Falla y es último (incluye empates): no pasa nada.
    * Falla y no es último: tira dado; solo él retrocede.
    * En todos los casos, después pasa turno.
- Gana el primero en llegar a la LLEGADA (41) o pasarse.
"""
import random
from collections import Counter

# ============================================================
# PARÁMETROS AJUSTABLES
# ============================================================
N_PARTIDAS   = 1000     # cuántas partidas simular
M_JUGADORES  = 2        # de 2 a 6

TIEMPO_TIRADA   = 5    # segundos por tirada de dado
TIEMPO_DESAFIO  = 15   # segundos por desafío (normal o especial)
PROB_ACIERTO    = 0.75   # probabilidad de acertar un desafío

# ============================================================
# TABLERO (no tocar salvo que cambien las reglas)
# ============================================================
CASILLAS_DESAFIO          = [4, 10, 15, 23, 26, 30, 35, 39]
CASILLAS_DESAFIO_ESPECIAL = [3, 8, 12, 18, 24, 29, 31, 36]
CASILLAS_PERDER_TURNO     = [7, 13, 19, 37]
CASILLAS_RETROCEDER       = { 21: 16, 34: 29 }
CASILLAS_AVANZAR          = { 9: 14, 28: 33 }
CASILLA_LLEGADA = 41


# ============================================================
# UNA PARTIDA
# ============================================================
def jugar_partida(n_jugadores):
    posiciones    = [0] * n_jugadores
    pierde_turno  = [False] * n_jugadores
    turno         = 0
    duracion      = 0
    ganador       = None

    while ganador is None:
        idx = turno

        # Saltear turno si corresponde
        if pierde_turno[idx]:
            pierde_turno[idx] = False
            turno = (turno + 1) % n_jugadores
            continue

        # --- Tirada ---
        duracion += TIEMPO_TIRADA
        tirada = random.randint(1, 6)
        nueva_pos = min(posiciones[idx] + tirada, CASILLA_LLEGADA)

        # --- Llegada ---
        if nueva_pos >= CASILLA_LLEGADA:
            posiciones[idx] = CASILLA_LLEGADA
            ganador = idx
            continue

        # --- Desafío normal ---
        if nueva_pos in CASILLAS_DESAFIO:
            duracion += TIEMPO_DESAFIO
            posiciones[idx] = nueva_pos
            if random.random() < PROB_ACIERTO:
                # Acierta: se queda y vuelve a tirar
                continue
            else:
                # Falla: pasa turno
                pass

        # --- Desafío especial ---
        elif nueva_pos in CASILLAS_DESAFIO_ESPECIAL:
            duracion += TIEMPO_DESAFIO
            posiciones[idx] = nueva_pos
            correcto = random.random() < PROB_ACIERTO

            max_pos = max(posiciones)
            min_pos = min(posiciones)

            if correcto:
                # Si es primero, no pasa nada
                if posiciones[idx] != max_pos:
                    # Tira dado: todos los primeros retroceden
                    duracion += TIEMPO_TIRADA
                    valor = random.randint(1, 6)
                    for i, p in enumerate(posiciones):
                        if p == max_pos:
                            posiciones[i] = max(0, p - valor)
            else:
                # Si es último, no pasa nada
                if posiciones[idx] != min_pos:
                    # Tira dado: solo él retrocede
                    duracion += TIEMPO_TIRADA
                    valor = random.randint(1, 6)
                    posiciones[idx] = max(0, posiciones[idx] - valor)

            # Pasa turno (en ambos casos)

        # --- Perdés turno ---
        elif nueva_pos in CASILLAS_PERDER_TURNO:
            posiciones[idx] = nueva_pos
            pierde_turno[idx] = True

        # --- Retrocedé 5 ---
        elif nueva_pos in CASILLAS_RETROCEDER:
            posiciones[idx] = CASILLAS_RETROCEDER[nueva_pos]

        # --- Avanzá 5 ---
        elif nueva_pos in CASILLAS_AVANZAR:
            posiciones[idx] = CASILLAS_AVANZAR[nueva_pos]

        # --- Casilla común ---
        else:
            posiciones[idx] = nueva_pos

        # Pasar turno si no ganó
        if ganador is None:
            turno = (turno + 1) % n_jugadores

    return duracion


# ============================================================
# SIMULACIÓN
# ============================================================
def simular(n_partidas, n_jugadores):
    duraciones = [jugar_partida(n_jugadores) for _ in range(n_partidas)]

    media   = sum(duraciones) / len(duraciones)
    minimo  = min(duraciones)
    maximo  = max(duraciones)

    def fmt(seg):
        m = int(seg // 60)
        s = int(seg % 60)
        return f"{m} min {s} s"

    print("=" * 60)
    print(f"SIMULACIÓN: {n_partidas} partidas con {n_jugadores} jugadores")
    print("=" * 60)
    print(f"  Duración promedio: {media:.1f} s  ({fmt(media)})")
    print(f"  Duración mínima:   {minimo:.1f} s  ({fmt(minimo)})")
    print(f"  Duración máxima:   {maximo:.1f} s  ({fmt(maximo)})")
    print(f"  En minutos:        {media / 60:.2f} min")
    print()

    # Distribución agrupada por minuto
    print("  Distribución (por minuto):")
    conteo = Counter(int(d // 60) for d in duraciones)
    for m in sorted(conteo.keys()):
        print(f"    {m:2d} min: {conteo[m]:5d} partidas")
    print()


if __name__ == "__main__":
    # Para probar varios M de una:
    for m in [2, 3, 4, 5, 6]:
        simular(N_PARTIDAS, m)
        print()