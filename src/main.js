import './styles.css';
import { mountHero } from './hero/hero.js';

/* ------------------------------------------------------------------ *
 *  BANACLO — the line-up.
 *
 *  Nothing here is heavy: the hero is ordinary DOM plus one transform,
 *  so the page is interactive as soon as the module evaluates.
 * ------------------------------------------------------------------ */

const MARQUEE = [
  'FREE SHIPPING OVER $100',
  'HEAVYWEIGHT 480 GSM',
  'DROP 001 SELLS OUT FAST',
  'FIVE LOOKS, ONE HOODIE',
  'SCROLL TO MEET THE LINE-UP'
];

function mountMarquee() {
  const track = document.getElementById('marquee-track');
  if (!track) return;
  const line = MARQUEE.map((w) => `<span>${w}</span><i>&#10039;</i>`).join('');
  track.innerHTML = line + line;          // doubled, so the loop is seamless
}

const hero = mountHero();
mountMarquee();

document.getElementById('brand')?.addEventListener('click', (e) => {
  e.preventDefault();
  hero?.scrollToStage(0);
});

document.body.classList.add('is-live');

const loader = document.getElementById('loader');
document.getElementById('loader-bar').style.width = '100%';
loader.classList.add('is-gone');
setTimeout(() => { loader.hidden = true; }, 900);
