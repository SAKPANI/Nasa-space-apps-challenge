"""Procedural stand-ins for the ten EIC frames. Not NASA data."""

import math
import struct
import zlib
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "public" / "visuals"
W, H = 320, 180


def write_png(path: Path, pixels: bytes) -> None:
    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    raw = b"".join(b"\x00" + pixels[y * W * 3 : (y + 1) * W * 3] for y in range(H))
    ihdr = struct.pack(">IIBBBBB", W, H, 8, 2, 0, 0, 0)
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    )


def blank() -> bytearray:
    return bytearray(W * H * 3)


def put(buf: bytearray, x: int, y: int, color: tuple[int, int, int]) -> None:
    if 0 <= x < W and 0 <= y < H:
        i = (y * W + x) * 3
        buf[i : i + 3] = bytes(color)


def disc(buf: bytearray, cx: int, cy: int, r: int, color: tuple[int, int, int]) -> None:
    for y in range(cy - r, cy + r + 1):
        for x in range(cx - r, cx + r + 1):
            if (x - cx) ** 2 + (y - cy) ** 2 <= r * r:
                put(buf, x, y, color)


def caldwell() -> bytearray:
    buf = blank()
    for i, (x, y, r) in enumerate(((40, 90, 3), (70, 40, 2), (110, 100, 5), (160, 70, 2), (200, 120, 4), (250, 50, 3), (280, 100, 6), (140, 40, 2))):
        tone = 180 + (i * 9) % 70
        disc(buf, x, y, r, (tone, tone, 40))
    return buf


def nightlights() -> bytearray:
    buf = blank()
    for x in range(W):
        glow = int(20 + 180 * (x / W))
        for y in range(70, 120):
            if (x * 13 + y * 7) % 17 == 0:
                put(buf, x, y, (glow, glow, 80))
    return buf


def currents() -> bytearray:
    buf = blank()
    for y in range(H):
        for x in range(W):
            wave = math.sin(x / 18 + y / 10)
            heat = int(40 + (y / H) * 180)
            buf[(y * W + x) * 3 : (y * W + x) * 3 + 3] = bytes((20, int(80 + 80 * wave), heat))
    return buf


def aerosols() -> bytearray:
    buf = blank()
    for cx, cy, r, color in ((60, 80, 28, (30, 140, 220)), (140, 60, 24, (210, 80, 170)), (210, 100, 30, (230, 140, 40)), (270, 70, 18, (40, 180, 90))):
        disc(buf, cx, cy, r, color)
    return buf


def air() -> bytearray:
    buf = blank()
    for x in range(W):
        color = (40, 90, 160) if x < W / 3 else ((210, 170, 40) if x < 2 * W / 3 else (180, 50, 40))
        for y in range(40, 140):
            if (x + y) % 3:
                put(buf, x, y, color)
    return buf


def ocean() -> bytearray:
    buf = blank()
    for y in range(H):
        for x in range(W):
            band = int(30 + 140 * abs(math.sin(x / 12 + y / 30)))
            buf[(y * W + x) * 3 : (y * W + x) * 3 + 3] = bytes((10, 40 + band // 3, 80 + band // 2))
    return buf


def co2() -> bytearray:
    buf = blank()
    for y in range(H):
        for x in range(W):
            d = math.hypot(x - 200, y - 90) / 80
            v = max(0, min(255, int(255 * (1 - d))))
            buf[(y * W + x) * 3 : (y * W + x) * 3 + 3] = bytes((v, int(v * 0.45), 30))
    return buf


def lightning() -> bytearray:
    buf = blank()
    for x, y in ((30, 40), (80, 100), (90, 110), (150, 60), (210, 130), (260, 50), (300, 90)):
        disc(buf, x, y, 3, (245, 245, 210))
    return buf


def river() -> bytearray:
    buf = blank()
    for y in range(H):
        for x in range(W):
            band = abs((y - 20) - x * 0.35)
            if band < 18:
                shade = int(180 - band * 8)
                put(buf, x, y, (20, 80, shade))
    return buf


def forest() -> bytearray:
    buf = blank()
    for i, height in enumerate((40, 70, 110, 90, 140, 60, 100, 150, 80, 120)):
        x0 = 16 + i * 30
        color = (30, 80 + height // 2, 40)
        for x in range(x0, x0 + 16):
            for y in range(H - 20 - height, H - 20):
                put(buf, x, y, color)
    return buf


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    makers = {
        "caldwell.png": caldwell,
        "nightlights.png": nightlights,
        "currents.png": currents,
        "aerosols.png": aerosols,
        "air.png": air,
        "ocean.png": ocean,
        "co2.png": co2,
        "lightning.png": lightning,
        "river.png": river,
        "forest.png": forest,
    }
    for name, maker in makers.items():
        write_png(OUT / name, maker())
    print(f"{len(makers)} images in {OUT}")


if __name__ == "__main__":
    main()
