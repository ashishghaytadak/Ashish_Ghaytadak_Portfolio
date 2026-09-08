/* ─ Utilities ─ */
const q  = (s,p=document) => p.querySelector(s);
const qa = (s,p=document) => [...p.querySelectorAll(s)];

/* ─ Year ─ */
q('#year').textContent = new Date().getFullYear();

/* ─ Mobile nav ─ */
const menuBtn = q('.menu-toggle');
const nav = q('.nav');
menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
qa('.nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

/* ─ Cursor glow ─ */
const glow = document.createElement('div');
glow.className = 'cursor-glow';
document.body.appendChild(glow);
let mx = -999, my = -999;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function moveCursor(){
  glow.style.left = mx + 'px';
  glow.style.top  = my + 'px';
  requestAnimationFrame(moveCursor);
})();

/* ─ Scroll reveal ─ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
qa('.reveal').forEach(el => revealObs.observe(el));

/* ─ Counter animation ─ */
const impact = q('.impact-strip');
let counted = false;
const countObs = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting || counted) return;
  counted = true;
  qa('[data-count]').forEach(el => {
    const target = Number(el.dataset.count);
    const start  = performance.now();
    const dur    = 1600;
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.floor(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}, { threshold: 0.3 });
if (impact) countObs.observe(impact);

/* ─ Magnetic buttons ─ */
qa('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width  / 2) * 0.1;
    const y = (e.clientY - r.top  - r.height / 2) * 0.1;
    btn.style.transform = `translate(${x}px,${y}px)`;
  });
  btn.addEventListener('mouseleave', () => btn.style.transform = '');
});

/* ─ Typewriter on hero h1 ─ */
(function initTypewriter() {
  const gradSpan = q('.gradient-text');
  if (!gradSpan) return;
  const phrases = [
    'fast, scalable, secure & intelligent.',
    'Apex-powered & automatable.',
    'integrated & enterprise-ready.',
    'AI-driven with Agentforce.',
  ];
  let pi = 0, ci = 0, deleting = false;
  const full = gradSpan.textContent;
  phrases[0] = full; // keep original first

  function type() {
    const phrase = phrases[pi];
    if (!deleting) {
      gradSpan.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) {
        setTimeout(() => { deleting = true; type(); }, 2600);
        return;
      }
    } else {
      gradSpan.textContent = phrase.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
      }
    }
    setTimeout(type, deleting ? 38 : 68);
  }
  setTimeout(type, 1800);
})();

/* ─ Holographic tilt on cards ─ */
qa('.glass').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const xc = r.left + r.width  / 2;
    const yc = r.top  + r.height / 2;
    const rx = (e.clientY - yc) / r.height * -10;
    const ry = (e.clientX - xc) / r.width  *  10;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
    const dx = (e.clientX - r.left) / r.width  * 100;
    const dy = (e.clientY - r.top)  / r.height * 100;
    card.style.setProperty('--mx', dx + '%');
    card.style.setProperty('--my', dy + '%');
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ══════════════════════════════════════════
   PREMIUM CANVAS — particle constellation
   with mouse interaction + colour cycling
══════════════════════════════════════════ */
const canvas = q('#network');
const ctx    = canvas.getContext('2d');
let W = 0, H = 0, dpr = 1, nodes = [], mouse = { x: -9999, y: -9999 };

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W   = window.innerWidth;
  H   = window.innerHeight;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(80, Math.max(36, Math.floor(W / 22)));
  nodes = Array.from({ length: count }, (_, i) => ({
    x:    Math.random() * W,
    y:    Math.random() * H,
    vx:   (Math.random() - .5) * .22,
    vy:   (Math.random() - .5) * .22,
    r:    Math.random() * 1.6 + .5,
    hue:  200 + Math.random() * 80,   // blue → violet range
    life: Math.random() * Math.PI * 2, // phase offset
  }));
}

document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

let tick = 0;
function draw() {
  tick++;
  ctx.clearRect(0, 0, W, H);

  for (const n of nodes) {
    /* gentle mouse repulsion */
    const dx = n.x - mouse.x, dy = n.y - mouse.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 130) {
      const force = (130 - dist) / 130 * 0.35;
      n.vx += (dx / dist) * force;
      n.vy += (dy / dist) * force;
    }

    /* damping */
    n.vx *= 0.99; n.vy *= 0.99;

    n.x += n.vx; n.y += n.vy;
    if (n.x < 0 || n.x > W) n.vx *= -1;
    if (n.y < 0 || n.y > H) n.vy *= -1;

    /* pulsing brightness */
    n.life += 0.012;
    const alpha = 0.3 + 0.25 * Math.sin(n.life);
    const hue   = n.hue + Math.sin(tick * 0.004 + n.life) * 25;

    /* draw node */
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue},90%,72%,${alpha})`;
    ctx.fill();

    /* inner glow */
    const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
    grad.addColorStop(0, `hsla(${hue},90%,80%,${alpha * .4})`);
    grad.addColorStop(1, `hsla(${hue},90%,80%,0)`);
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  /* draw edges */
  const CONNECT_DIST = 140;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d  = Math.hypot(dx, dy);
      if (d < CONNECT_DIST) {
        const t   = 1 - d / CONNECT_DIST;
        const hue = (a.hue + b.hue) / 2 + Math.sin(tick * 0.003) * 20;
        ctx.strokeStyle = `hsla(${hue},85%,68%,${t * 0.13})`;
        ctx.lineWidth   = t * 1.2;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(draw);
}

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  resize();
  draw();
  addEventListener('resize', resize);
}
