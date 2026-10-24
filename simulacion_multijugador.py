"""
Simula N partidas de "Carrera de desafíos" con M jugadores.
- Cada tirada dura 30 segundos.
- Cada desafío (acertado o no) dura 2 minutos (120 s).
- Cada desafío tiene 50% de probabilidad de acierto.
- Si acierta: vuelve a tirar (no pasa turno).
- Si falla: pasa turno.
- Si cae en "perdés turno": se saltea el próximo turno.
- Si cae en "retrocedé 5" o "avanzá 5": se mueve sin encadenar.
- Gana el primero en llegar a la LLEGADA (41) o pasarse.
Mide la duración promedio de una partida (en segundos y en minutos).
"""
import random
from collections import Counter

# --- Tablero ---
CASILLAS_DESAFIO      = [4, 10, 15, 23, 26, 30, 35, 39]
CASILLAS_PERDER_TURNO = [7, 13, 19, 37]
CASILLAS_RETROCEDER   = { 21: 16, 34: 29 }
CASILLAS_AVANZAR      = { 9: 14, 28: 33 }

CASILLA_LLEGADA = 41

# --- Tiempos (segundos) ---
DURACION_TIRADA    = 30
DURACION_DESAFIO   = 120
PROB_ACIERTO       = 0.5

# --- Una partida con M jugadores ---
def jugar_partida(n_jugadores):
    """
    Devuelve la duración total de la partida en segundos.
    """
    posiciones = [0] * n_jugadores
    pierde_turno = [False] * n_jugadores
    turno = 0
    duracion = 0
    ganador = None

    while ganador is None:
        idx = turno

        # Si este jugador pierde el turno, se saltea
        if pierde_turno[idx]:
            pierde_turno[idx] = False
            turno = (turno + 1) % n_jugadores
            continue

        # Tirar el dado
        duracion += DURACION_TIRADA
        tirada = random.randint(1, 6)
        nueva_pos = min(posiciones[idx] + tirada, CASILLA_LLEGADA)

        # Aplicar casilla especial (sin encadenar)
        if nueva_pos >= CASILLA_LLEGADA:
            posiciones[idx] = CASILLA_LLEGADA
            ganador = idx
        elif nueva_pos in CASILLAS_DESAFIO:
            # Desafío: dura 2 minutos, 50% acierto
            duracion += DURACION_DESAFIO
            if random.random() < PROB_ACIERTO:
                # Acierta: se queda en la casilla y vuelve a tirar
                # (no pasa turno)
                posiciones[idx] = nueva_pos
                continue
            else:
                # Falla: se queda en la casilla y pasa turno
                posiciones[idx] = nueva_pos
        elif nueva_pos in CASILLAS_PERDER_TURNO:
            posiciones[idx] = nueva_pos
            pierde_turno[idx] = True
        elif nueva_pos in CASILLAS_RETROCEDER:
            posiciones[idx] = CASILLAS_RETROCEDER[nueva_pos]
        elif nueva_pos in CASILLAS_AVANZAR:
            posiciones[idx] = CASILLAS_AVANZAR[nueva_pos]
        else:
            posiciones[idx] = nueva_pos

        # Pasar al siguiente turno (salvo que haya ganado)
        if ganador is None:
            turno = (turno + 1) % n_jugadores

    return duracion


# --- Simulación ---
def simular(n_partidas, n_jugadores):
    duraciones = []
    for _ in range(n_partidas):
        duraciones.append(jugar_partida(n_jugadores))

    media_seg = sum(duraciones) / len(duraciones)
    min_seg = min(duraciones)
    max_seg = max(duraciones)

    # Convertir a minutos y segundos para leer más cómodo
    def fmt(seg):
        m = int(seg // 60)
        s = int(seg % 60)
        return f"{m} min {s} s"

    print("=" * 60)
    print(f"SIMULACIÓN: {n_partidas} partidas con {n_jugadores} jugadores")
    print("=" * 60)
    print(f"  Duración promedio: {media_seg:.1f} s  ({fmt(media_seg)})")
    print(f"  Duración mínima:   {min_seg:.1f} s  ({fmt(min_seg)})")
    print(f"  Duración máxima:   {max_seg:.1f} s  ({fmt(max_seg)})")
    print(f"  En minutos:        {media_seg / 60:.2f} min")
    print()

    # Distribución (agrupada por minuto)
    print("  Distribución (por minuto):")
    conteo = Counter(int(d // 60) for d in duraciones)
    for m in sorted(conteo.keys()):
        print(f"    {m:2d} min: {conteo[m]:5d} partidas")
    print()


if __name__ == "__main__":
    # Configurá acá:
    N_PARTIDAS = 1000
    M_JUGADORES = 2       # 2 a 6

    simular(N_PARTIDAS, M_JUGADORES)