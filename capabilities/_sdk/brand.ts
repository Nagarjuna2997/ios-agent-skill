// A stable accent color derived from the bundle identifier, shared by the
// launch screen and app icon so a new app looks consistent before it has a brand.
export function brandHue(seed: string): number {
  let hash = 7;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return hash % 360;
}

export function hsl(h: number, s: number, l: number): string {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/** WCAG relative luminance of a #RRGGBB color. */
export function luminance(hex: string): number {
  const channel = (offset: number) => {
    const v = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

/** WCAG contrast ratio between two #RRGGBB colors (1 to 21). */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * The color with hue h and saturation s closest to lightness `start` that
 * reaches `ratio` against `against`, moving darker or lighter.
 */
export function readable(h: number, s: number, start: number, against: string, direction: "darker" | "lighter", ratio = 4.5): string {
  for (let l = start; l >= 0 && l <= 100; l += direction === "darker" ? -1 : 1) {
    const color = hsl(h, s, l);
    if (contrast(color, against) >= ratio) return color;
  }
  return direction === "darker" ? "#000000" : "#FFFFFF";
}
