/* ------------------------------------------------------------------ *
 *  Parametric lookbook figures.
 *
 *  These are placeholders with a job: stand in a row wearing a hoodie
 *  and trousers until real photography arrives. Drop a file into
 *  public/models/ and it fades in over the top of the drawing — see
 *  models.js. Everything here is one <svg> string per figure, built from
 *  a stick skeleton that gets fleshed out with tapered limb paths.
 * ------------------------------------------------------------------ */

const W = 260;
const H = 780;
const MID = W / 2;

const mirror = ([x, y]) => [W - x, y];
const mirrorPts = (pts) => pts.map(mirror);

/** Smooth polyline: quadratics through the interior points. */
function smooth(pts) {
  if (pts.length < 3) return pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [cx, cy] = pts[i];
    const [nx, ny] = pts[i + 1];
    d += ` Q${cx} ${cy} ${(cx + nx) / 2} ${(cy + ny) / 2}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L${last[0]} ${last[1]}`;
}

/**
 * A limb with real thickness: walk the skeleton offsetting by half the
 * width along each point's normal, then come back down the other side.
 * Widths taper, which is what makes a sleeve look like a sleeve.
 */
function limb(pts, widths) {
  const normals = pts.map((p, i) => {
    const a = pts[Math.max(i - 1, 0)];
    const b = pts[Math.min(i + 1, pts.length - 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    return [-dy / len, dx / len];
  });
  const left = pts.map((p, i) => [p[0] + normals[i][0] * widths[i] / 2, p[1] + normals[i][1] * widths[i] / 2]);
  const right = pts.map((p, i) => [p[0] - normals[i][0] * widths[i] / 2, p[1] - normals[i][1] * widths[i] / 2]);
  return `${smooth(left)} ${smooth(right.slice().reverse()).replace('M', 'L')} Z`;
}

/** Limb plus domed joints at each end — without these the shoulder is a cut. */
function limbCapped(pts, widths, fill, extra = '') {
  const a = pts[0], b = pts[pts.length - 1];
  return `<g fill="${fill}"${extra}>
    <circle cx="${a[0]}" cy="${a[1]}" r="${widths[0] / 2}"/>
    <path d="${limb(pts, widths)}"/>
    <circle cx="${b[0]}" cy="${b[1]}" r="${widths[widths.length - 1] / 2}"/>
  </g>`;
}

/** A sneaker pointing left (-1) or right (+1). */
function shoe([x, y], d, fill) {
  return `<path d="M${x - d * 26} ${y + 4} L${x + d * 8} ${y + 4}
    Q${x + d * 36} ${y + 8} ${x + d * 38} ${y + 22}
    Q${x + d * 39} ${y + 30} ${x + d * 28} ${y + 30}
    L${x - d * 26} ${y + 30} Q${x - d * 34} ${y + 30} ${x - d * 33} ${y + 18} Z" fill="${fill}"/>
    <path d="M${x - d * 33} ${y + 24} L${x + d * 38} ${y + 24} Q${x + d * 39} ${y + 30} ${x + d * 28} ${y + 30}
    L${x - d * 26} ${y + 30} Q${x - d * 34} ${y + 30} ${x - d * 33} ${y + 24} Z" fill="#000" opacity="0.28"/>`;
}

const cap = ([x, y], r, fill) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;

/* ------------------------------- poses ------------------------------- */
/* Every pose is just elbow/wrist and knee/ankle coordinates. */

export const POSES = {
  // both hands buried in the kangaroo pocket
  kangaroo: {
    arm: [[178, 188], [208, 296], [156, 348]],
    leg: [[112, 420], [106, 580], [104, 700]],
    stance: 1, hands: false
  },
  // arms hanging, weight shifted
  relaxed: {
    arm: [[180, 188], [206, 300], [202, 392]],
    leg: [[114, 420], [113, 582], [118, 702]],
    stance: 1, hands: true
  },
  // hands on hips, elbows out
  hips: {
    arm: [[180, 188], [234, 282], [188, 366]],
    leg: [[112, 420], [106, 580], [102, 700]],
    stance: 1.05, hands: true
  },
  // arms folded across the chest
  folded: {
    arm: [[180, 190], [206, 286], [102, 306]],
    armAlt: [[80, 190], [56, 292], [160, 318]],
    leg: [[110, 420], [109, 582], [112, 702]],
    stance: 0.92, hands: true
  },
  // wide stance, one arm swung out
  wide: {
    arm: [[180, 186], [226, 282], [246, 376]],
    leg: [[116, 420], [124, 578], [134, 698]],
    stance: 1.3, hands: true
  }
};

/* ------------------------------- hair -------------------------------- */

function hair(style, tone) {
  switch (style) {
    case 'crop':
      return `<path d="M96 88 Q98 46 130 44 Q162 46 164 88 Q150 62 130 62 Q110 62 96 88 Z" fill="${tone}"/>`;
    case 'curls':
      return [[104, 60, 17], [130, 48, 20], [156, 60, 17], [98, 82, 14], [162, 82, 14]]
        .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${tone}"/>`).join('');
    case 'long':
      return `<path d="M94 84 Q92 44 130 42 Q168 44 166 84 L170 176 Q152 166 152 118 Q140 64 130 64 Q120 64 108 118 Q108 166 90 176 Z" fill="${tone}"/>`;
    case 'bun':
      return `<circle cx="130" cy="34" r="19" fill="${tone}"/>
              <path d="M97 86 Q99 48 130 46 Q161 48 163 86 Q150 64 130 64 Q110 64 97 86 Z" fill="${tone}"/>`;
    default:
      return '';
  }
}

/* ------------------------------ the figure ---------------------------- */

let uid = 0;

export function buildFigure({
  hoodie = '#ff2e88',
  pants = '#232232',
  shoes = '#f2f0ff',
  skin = '#c98c63',
  hairTone = '#1b1522',
  hairStyle = 'crop',
  pose = 'pocket',
  hoodUp = false,
  lean = 0
} = {}) {
  const id = `f${uid++}`;
  const P = POSES[pose] || POSES.pocket;

  const armR = P.arm;
  const armL = P.armAlt ? P.armAlt : mirrorPts(P.arm);
  const armW = [52, 41, 32];

  const legR = P.leg.map(([x, y]) => [MID + (x - MID) * P.stance, y]);
  const legL = mirrorPts(P.leg).map(([x, y]) => [MID + (x - MID) * P.stance, y]);
  const legW = [62, 50, 42];

  const shoeR = legR[2];
  const shoeL = legL[2];

  // Torso: rounded shoulders, straight drop, slight A-line to a cropped hem.
  const body = `M63 194 Q65 172 94 167 L166 167 Q195 172 197 194
                L201 404 Q202 420 198 432 L62 432 Q58 420 59 404 Z`;
  const hemBand = `M60 406 L200 406 Q203 420 199 434 L61 434 Q57 420 60 406 Z`;

  // Hood at rest: a roll of cloth sitting behind the head and shoulders.
  const hoodDown = `M78 188 Q64 138 96 126 Q130 113 164 126 Q196 138 182 188
                    Q156 169 130 169 Q104 169 78 188 Z`;

  // Hood up: full shell with the face read out of the opening.
  const hoodUpShell = `M72 194 Q64 76 130 62 Q196 76 188 194 Q166 170 130 170 Q94 170 72 194 Z`;
  const faceHole = `M101 78 Q130 62 159 78 L166 148 Q130 172 94 148 Z`;

  const cuff = (pt) => `<circle cx="${pt[0]}" cy="${pt[1]}" r="17" fill="${hoodie}"/>
      <circle cx="${pt[0]}" cy="${pt[1]}" r="17" fill="#000" opacity="0.24"/>`;

  const arms = `${limbCapped(armL, armW, hoodie)}
    <path d="${limb(armL, armW)}" fill="url(#${id}-shade)" opacity="0.7"/>
    ${limbCapped(armR, armW, hoodie)}
    <path d="${limb(armR, armW)}" fill="url(#${id}-shade)" opacity="0.7"/>
    ${cuff(armR[2])}${cuff(armL[2])}
    ${P.hands ? cap([armR[2][0], armR[2][1] + 15], 14, skin) + cap([armL[2][0], armL[2][1] + 15], 14, skin) : ''}`;

  const pocket = `<path d="M88 312 L172 312 Q178 314 178 322 L174 384 L86 384 L82 322 Q82 314 88 312 Z"
    fill="${hoodie}"/><path d="M88 312 L172 312 Q178 314 178 322 L174 384 L86 384 L82 322 Q82 314 88 312 Z"
    fill="#000" opacity="0.18"/>`;

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="${id}-shade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#000" stop-opacity="0.32"/>
      <stop offset="45%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0.13"/>
    </linearGradient>
    <radialGradient id="${id}-shadow">
      <stop offset="0%" stop-color="#000" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="${id}-face"><path d="${faceHole}"/></clipPath>
  </defs>

  <ellipse cx="${MID}" cy="742" rx="84" ry="14" fill="url(#${id}-shadow)"/>

  <g transform="rotate(${lean} ${MID} ${H})">
    <!-- hood at rest sits behind everything -->
    ${hoodUp ? '' : `<path d="${hoodDown}" fill="${hoodie}"/><path d="${hoodDown}" fill="#000" opacity="0.3"/>`}

    <!-- head -->
    ${hoodUp ? '' : hair(hairStyle, hairTone)}
    <ellipse cx="${MID}" cy="94" rx="30" ry="40" fill="${skin}"/>
    <path d="M115 120 L145 120 L145 154 Q130 162 115 154 Z" fill="${skin}"/>
    <path d="M115 120 L145 120 L145 154 Q130 162 115 154 Z" fill="#000" opacity="0.2"/>

    <!-- trousers -->
    ${limbCapped(legR, legW, pants)}
    ${limbCapped(legL, legW, pants)}
    <path d="${limb(legR, legW)}" fill="url(#${id}-shade)" opacity="0.45"/>
    <path d="${limb(legL, legW)}" fill="url(#${id}-shade)" opacity="0.45"/>
    ${shoe(shoeR, 1, shoes)}
    ${shoe(shoeL, -1, shoes)}

    <!-- body -->
    <path d="${body}" fill="${hoodie}"/>
    <path d="${body}" fill="url(#${id}-shade)"/>
    <path d="${hemBand}" fill="#000" opacity="0.26"/>
    <path d="M74 250 Q80 300 74 350" stroke="#000" stroke-opacity="0.13" stroke-width="7" fill="none"/>
    <path d="M186 268 Q180 320 186 366" stroke="#000" stroke-opacity="0.10" stroke-width="6" fill="none"/>

    <!-- hands in the pocket means the pocket covers the cuffs -->
    ${P.hands ? pocket + arms : arms + pocket}

    <!-- drawstrings -->
    <path d="M117 168 Q113 226 119 282" stroke="#f6f4ff" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M145 168 Q149 230 141 286" stroke="#f6f4ff" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${cap([119, 286], 4.5, '#cfcde0')}${cap([141, 290], 4.5, '#cfcde0')}

    ${hoodUp ? `<path d="${hoodUpShell}" fill="${hoodie}"/>
                <path d="${hoodUpShell}" fill="url(#${id}-shade)"/>
                <path d="${faceHole}" fill="#000" opacity="0.5"/>
                <ellipse cx="${MID}" cy="100" rx="30" ry="40" fill="${skin}" clip-path="url(#${id}-face)"/>` : ''}
  </g>
</svg>`;
}
