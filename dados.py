"""
Genera assets/dado_1.png ... dado_6.png
Uso: python generar_dados.py
Requiere: pillow (pip install pillow)
"""
from PIL import Image, ImageDraw
import os

# Configuración
TAM = 200          # tamaño en px
MARGEN = 14        # margen del borde
COLOR_FONDO   = (250, 250, 245, 255)   # blanco hueso
COLOR_BORDE   = (60, 60, 60, 255)      # gris oscuro
COLOR_PUNTO   = (30, 30, 30, 255)      # casi negro
RADIO_ESQUINA = 28                     # esquinas redondeadas
RADIO_PUNTO   = 13
PADDING = 8

os.makedirs("assets", exist_ok=True)

# Posiciones de los puntos para cada cara (en fracciones 0..1 del área interna)
PUNTOS = {
    1: [(0.5, 0.5)],
    2: [(0.28, 0.28), (0.72, 0.72)],
    3: [(0.28, 0.28), (0.5, 0.5), (0.72, 0.72)],
    4: [(0.28, 0.28), (0.72, 0.28), (0.28, 0.72), (0.72, 0.72)],
    5: [(0.28, 0.28), (0.72, 0.28), (0.5, 0.5), (0.28, 0.72), (0.72, 0.72)],
    6: [(0.28, 0.25), (0.72, 0.25), (0.28, 0.5), (0.72, 0.5), (0.28, 0.75), (0.72, 0.75)],
}

for cara, posiciones in PUNTOS.items():
    img = Image.new("RGBA", (TAM, TAM), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Fondo redondeado
    draw.rounded_rectangle(
        [MARGEN, MARGEN, TAM - MARGEN, TAM - MARGEN],
        radius=RADIO_ESQUINA,
        fill=COLOR_FONDO,
        outline=COLOR_BORDE,
        width=4,
    )

    # Puntos
    area_x0 = MARGEN + RADIO_PUNTO + PADDING
    area_y0 = MARGEN + RADIO_PUNTO + PADDING
    area_x1 = TAM - MARGEN - RADIO_PUNTO - PADDING
    area_y1 = TAM - MARGEN - RADIO_PUNTO - PADDING

    for fx, fy in posiciones:
        cx = area_x0 + (area_x1 - area_x0) * fx
        cy = area_y0 + (area_y1 - area_y0) * fy
        draw.ellipse(
            [cx - RADIO_PUNTO, cy - RADIO_PUNTO,
             cx + RADIO_PUNTO, cy + RADIO_PUNTO],
            fill=COLOR_PUNTO,
        )

    ruta = f"assets/dado_{cara}.png"
    img.save(ruta)
    print(f"✔ {ruta}")

print("Listo.")