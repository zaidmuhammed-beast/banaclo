/* Colourways. Each one repaints the garment *and* the room it stands in. */
export const COLORWAYS = [
  { id: 'acid',    name: 'ACID POP',      color: '#ff2e88', accent: '#14f195', pattern: 'solid',    bg: ['#120726', '#02030a', '#5a1b6b'] },
  { id: 'lime',    name: 'CYBER LIME',    color: '#c6ff00', accent: '#ff00c8', pattern: 'stripes',  bg: ['#0c1406', '#02030a', '#2d6b1b'] },
  { id: 'void',    name: 'VOID BLACK',    color: '#17171f', accent: '#ff4d00', pattern: 'gradient', bg: ['#0a0a10', '#010104', '#4a2a10'] },
  { id: 'gum',     name: 'BUBBLEGUM',     color: '#ff9ecb', accent: '#7c4dff', pattern: 'tiedye',   bg: ['#1a0a20', '#04030c', '#7a2b8a'] },
  { id: 'toxic',   name: 'TOXIC ORANGE',  color: '#ff5a00', accent: '#00e5ff', pattern: 'camo',     bg: ['#1c0c04', '#04020a', '#7a3a10'] },
  { id: 'ice',     name: 'ICE BLUE',      color: '#a9e4ff', accent: '#0033ff', pattern: 'solid',    bg: ['#061424', '#01030a', '#1b4a8a'] },
  { id: 'cream',   name: 'CREAM SODA',    color: '#f2e6cf', accent: '#c0603c', pattern: 'checker',  bg: ['#1a1408', '#05040a', '#6b4a1b'] },
  { id: 'violet',  name: 'ULTRAVIOLET',   color: '#6a00ff', accent: '#00ffb2', pattern: 'holo',     bg: ['#100628', '#02020c', '#5a1bff'] },
  { id: 'rust',    name: 'RUST STATIC',   color: '#8c3b1f', accent: '#ffd400', pattern: 'static',   bg: ['#180a06', '#04020a', '#7a3a10'] },
  { id: 'mint',    name: 'MINT CONDITION',color: '#7ef9c5', accent: '#ff2e88', pattern: 'gradient', bg: ['#05201a', '#01050a', '#1b8a6b'] }
];

export const PATTERN_LABELS = [
  { id: 'solid',    label: 'SOLID' },
  { id: 'gradient', label: 'DIP DYE' },
  { id: 'tiedye',   label: 'TIE DYE' },
  { id: 'camo',     label: 'CAMO' },
  { id: 'checker',  label: 'CHECKER' },
  { id: 'static',   label: 'STATIC' },
  { id: 'stripes',  label: 'RACER' },
  { id: 'holo',     label: 'HOLO' }
];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const BASE_PRICE = 128;

export const PRICE_MODIFIERS = {
  pattern: { solid: 0, gradient: 12, tiedye: 18, camo: 14, checker: 16, static: 22, stripes: 12, holo: 34 },
  size: { XS: 0, S: 0, M: 0, L: 0, XL: 6, XXL: 10 }
};
