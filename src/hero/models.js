/* ------------------------------------------------------------------ *
 *  The five looks in the hero row.
 *
 *  `photo` is optional. Drop a file at public/models/<name> and it
 *  fades in over the drawn figure with no code change; if the file
 *  isn't there the request fails quietly and the drawing stays.
 * ------------------------------------------------------------------ */

export const MODELS = [
  {
    id: 'mika',
    name: 'MIKA',
    look: 'LOOK 01',
    colourway: 'ACID POP',
    note: 'Heavyweight fleece, hands where they belong.',
    photo: 'models/01.jpg',
    card: '#ff2e88',
    offset: -14, scale: 1.00, rot: -1.2,
    figure: {
      pose: 'kangaroo', hoodie: '#ff2e88', pants: '#232232', shoes: '#f2f0ff',
      skin: '#c98c63', hairStyle: 'crop', hairTone: '#1b1522'
    }
  },
  {
    id: 'rue',
    name: 'RUE',
    look: 'LOOK 02',
    colourway: 'CYBER LIME',
    note: 'Cut boxy. Worn boxier.',
    photo: 'models/02.jpg',
    card: '#c6ff00',
    offset: 12, scale: 1.05, rot: 0.8,
    figure: {
      pose: 'relaxed', hoodie: '#c6ff00', pants: '#3a4a6b', shoes: '#efeade',
      skin: '#8d5a3b', hairStyle: 'curls', hairTone: '#140f1c'
    }
  },
  {
    id: 'ozzy',
    name: 'OZZY',
    look: 'LOOK 03',
    colourway: 'ULTRAVIOLET',
    note: 'Hood up. Conversation over.',
    photo: 'models/03.jpg',
    card: '#6a00ff',
    offset: -22, scale: 0.97, rot: -0.4,
    figure: {
      pose: 'hips', hoodie: '#6a00ff', pants: '#d9d2c4', shoes: '#f6f4ff',
      skin: '#e8b58c', hairStyle: 'long', hairTone: '#3a2318', hoodUp: true
    }
  },
  {
    id: 'sena',
    name: 'SENA',
    look: 'LOOK 04',
    colourway: 'VOID BLACK',
    note: 'The one that goes with everything.',
    photo: 'models/04.jpg',
    card: '#7d76a0',
    offset: 6, scale: 1.02, rot: 1.6,
    figure: {
      pose: 'folded', hoodie: '#1c1c26', pants: '#4a4456', shoes: '#e9e6f5',
      skin: '#5f3a25', hairStyle: 'bun', hairTone: '#0e0a14'
    }
  },
  {
    id: 'kaz',
    name: 'KAZ',
    look: 'LOOK 05',
    colourway: 'TOXIC CYAN',
    note: 'Takes up room. On purpose.',
    photo: 'models/05.jpg',
    card: '#00e5ff',
    offset: -8, scale: 1.08, rot: -1.8,
    figure: {
      pose: 'wide', hoodie: '#00e5ff', pants: '#2b2b38', shoes: '#ffffff',
      skin: '#f0c9a8', hairStyle: 'crop', hairTone: '#6b4a2a'
    }
  }
];
