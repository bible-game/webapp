
export function darkenHexColor(hex: string, factor: number): string {
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }

  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  r = Math.max(0, Math.floor(r * factor));
  g = Math.max(0, Math.floor(g * factor));
  b = Math.max(0, Math.floor(b * factor));

  const toHex = (c: number) => `0${c.toString(16)}`.slice(-2);

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToHSLA(H: any, a = 1.0) {
  // Convert hex to RGB first
  let r: any = 0,
      g: any = 0,
      b: any = 0;
  if (H.length === 4) {
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length === 7) {
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r, g, b),
      cmax = Math.max(r, g, b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return {h, l, s, a}
}

export function average(color1: any,color2: any): any{
  const avg  = function(a: any,b: any){ return (a+b)/2; },
      t16  = function(c: any){ return parseInt((''+c).replace('#',''),16) },
      hex  = function(c: any){ const t = (c>>0).toString(16);
        return t.length == 2 ? t : '0' + t },
      hex1 = t16(color1),
      hex2 = t16(color2),
      r    = function(hex: any){ return hex >> 16 & 0xFF},
      g    = function(hex: any){ return hex >> 8 & 0xFF},
      b    = function(hex: any){ return hex & 0xFF};
  return '#' + hex(avg(r(hex1), r(hex2)))
      + hex(avg(g(hex1), g(hex2)))
      + hex(avg(b(hex1), b(hex2)));
}
