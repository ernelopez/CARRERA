"""
Simula muchas partidas de "Carrera de desafíos" con un solo jugador.
Guarda en simulación.txt:
  - Cantidad de caídas en casillas de DESAFÍO (histograma + estadísticas)
  - Cantidad de tiradas del dado por partida
  - Ranking de casillas de DESAFÍO
  - Ranking de otras casillas especiales
"""
import random
from collections import Counter
import matplotlib.pyplot as plt
import io

# --- Tablero ---
CASILLAS_DESAFIO      = [4, 10, 15, 23, 26, 30, 35, 39]
CASILLAS_PERDER_TURNO = [7, 13, 19, 37]
CASILLAS_RETROCEDER   = { 21: 16, 34: 29 }
CASILLAS_AVANZAR      = { 9: 14, 28: 33 }

CASILLA_LLEGADA = 41
ULTIMA_CASILLA  = 40

# --- Una partida ---
def jugar_partida():
    pos = 0
    tiradas = 0
    desafios = 0
    desafios_por_casilla = Counter()
    especiales_por_casilla = Counter()

    while pos < CASILLA_LLEGADA:
        tirada = random.randint(1, 6)
        tiradas += 1
        nueva_pos = min(pos + tirada, CASILLA_LLEGADA)

        if nueva_pos in CASILLAS_DESAFIO:
            desafios += 1
            desafios_por_casilla[nueva_pos] += 1
        elif nueva_pos in CASILLAS_PERDER_TURNO:
            especiales_por_casilla[nueva_pos] += 1
        elif nueva_pos in CASILLAS_RETROCEDER:
            especiales_por_casilla[nueva_pos] += 1
            nueva_pos = CASILLAS_RETROCEDER[nueva_pos]
        elif nueva_pos in CASILLAS_AVANZAR:
            especiales_por_casilla[nueva_pos] += 1
            nueva_pos = CASILLAS_AVANZAR[nueva_pos]

        pos = nueva_pos

    return {
        'tiradas': tiradas,
        'desafios': desafios,
        'desafios_por_casilla': desafios_por_casilla,
        'especiales_por_casilla': especiales_por_casilla,
    }

# --- Simulación completa ---
def simular(n_partidas=10000):
    # Acumuladores
    desafios_totales_por_partida = []   # una entrada por partida
    tiradas_totales = []
    desafios_por_casilla_total = Counter()
    especiales_por_casilla_total = Counter()

    for _ in range(n_partidas):
        r = jugar_partida()
        desafios_totales_por_partida.append(r['desafios'])
        tiradas_totales.append(r['tiradas'])
        desafios_por_casilla_total.update(r['desafios_por_casilla'])
        especiales_por_casilla_total.update(r['especiales_por_casilla'])

    # Preparar el archivo de texto
    buf = io.StringIO()

    def out(s=""):
        buf.write(s + "\n")

    out("=" * 65)
    out(f"SIMULACIÓN: {n_partidas} PARTIDAS DE UN SOLO JUGADOR")
    out("=" * 65)
    out()

    # ---------- 1) Desafíos por partida ----------
    out("--- CANTIDAD DE DESAFÍOS POR PARTIDA ---")
    media_des = sum(desafios_totales_por_partida) / len(desafios_totales_por_partida)
    out(f"  media: {media_des:.2f}")
    out(f"  mínimo: {min(desafios_totales_por_partida)}")
    out(f"  máximo: {max(desafios_totales_por_partida)}")
    out()

    conteo_des = Counter(desafios_totales_por_partida)
    out("  Distribución (desafíos -> partidas):")
    for v in sorted(conteo_des.keys()):
        out(f"    {v:2d} desafíos: {conteo_des[v]:6d} partidas")
    out()

    # Gráfico
    valores = sorted(conteo_des.keys())
    frecuencias = [conteo_des[v] for v in valores]
    plt.figure(figsize=(10, 5))
    plt.bar(valores, frecuencias, edgecolor='black')
    plt.xlabel("Cantidad de desafíos en una partida")
    plt.ylabel("Frecuencia (número de partidas)")
    plt.title(f"Histograma de desafíos ({n_partidas} partidas)")
    plt.xticks(valores)
    plt.grid(axis='y', alpha=0.3)
    plt.tight_layout()
    plt.savefig("histograma_desafios.png")
    plt.close()

    # ---------- 2) Tiradas por partida ----------
    out("--- CANTIDAD DE TIRADAS DEL DADO POR PARTIDA ---")
    media_t = sum(tiradas_totales) / len(tiradas_totales)
    out(f"  media: {media_t:.2f}")
    out(f"  mínimo: {min(tiradas_totales)}")
    out(f"  máximo: {max(tiradas_totales)}")
    out()

    conteo_t = Counter(tiradas_totales)
    out("  Distribución (tiradas -> partidas):")
    for v in sorted(conteo_t.keys()):
        out(f"    {v:3d} tiradas: {conteo_t[v]:6d} partidas")
    out()

    plt.figure(figsize=(10, 5))
    plt.bar(sorted(conteo_t.keys()),
            [conteo_t[v] for v in sorted(conteo_t.keys())],
            edgecolor='black')
    plt.xlabel("Cantidad de tiradas por partida")
    plt.ylabel("Frecuencia (número de partidas)")
    plt.title(f"Distribución de tiradas ({n_partidas} partidas)")
    plt.grid(axis='y', alpha=0.3)
    plt.tight_layout()
    plt.savefig("histograma_tiradas.png")
    plt.close()

    # ---------- 3) Ranking de casillas de DESAFÍO ----------
    out("--- RANKING DE CAÍDAS EN CASILLAS DE DESAFÍO ---")
    total_des = sum(desafios_por_casilla_total.values())
    out(f"  Total: {total_des} caídas en desafíos")
    for casilla, veces in sorted(desafios_por_casilla_total.items(),
                                 key=lambda x: (-x[1], x[0])):
        pct = 100 * veces / total_des if total_des else 0
        out(f"  Casilla {casilla:2d}: {veces:6d} caídas  ({pct:5.1f}%)")
    out()

    # ---------- 4) Ranking de otras casillas especiales ----------
    out("--- RANKING DE OTRAS CASILLAS ESPECIALES ---")
    total_esp = sum(especiales_por_casilla_total.values())
    out(f"  Total: {total_esp} caídas en especiales")
    for casilla, veces in sorted(especiales_por_casilla_total.items(),
                                 key=lambda x: (-x[1], x[0])):
        if casilla in CASILLAS_PERDER_TURNO:
            tipo = "PERDÉS TURNO"
        elif casilla in CASILLAS_RETROCEDER:
            tipo = f"RETROCEDÉ 5 -> {CASILLAS_RETROCEDER[casilla]}"
        elif casilla in CASILLAS_AVANZAR:
            tipo = f"AVANZÁ 5 -> {CASILLAS_AVANZAR[casilla]}"
        else:
            tipo = "?"
        pct = 100 * veces / total_esp if total_esp else 0
        out(f"  Casilla {casilla:2d} [{tipo:22s}]: {veces:6d} caídas  ({pct:5.1f}%)")
    out()

    # Guardar archivo
    with open("simulacion.txt", "w", encoding="utf-8") as f:
        f.write(buf.getvalue())

    # También mostrar en consola
    print(buf.getvalue())
    print("Resultados guardados en simulacion.txt")
    print("Gráficos guardados en histograma_desafios.png y histograma_tiradas.png")


if __name__ == "__main__":
    simular(10000)