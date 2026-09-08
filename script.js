const q = (s, p=document) => p.querySelector(s);
const qa = (s, p=document) => [...p.querySelectorAll(s)];

q('#year').textContent = new Date().getFullYear();

const menuBtn = q('.menu-toggle');
const nav = q('.nav');
menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
qa('.nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {threshold: 0.12});
qa('.reveal').forEach(el => observer.observe(el));

const impact = q('.impact-strip');
let counted = false;
const countObserver = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting || counted) return;
  counted = true;
  qa('[data-count]').forEach(el => {
    const target = Number(el.dataset.count);
    const start = performance.now();
    const duration = 1200;
    function step(now){
      const p = Math.min((now-start)/duration, 1);
      const eased = 1 - Math.pow(1-p, 3);
      el.textContent = Math.floor(target * eased).toLocaleString();
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}, {threshold:.35});
countObserver.observe(impact);

// Subtle magnetic CTA
qa('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width/2) * .08;
    const y = (e.clientY - r.top - r.height/2) * .08;
    btn.style.transform = `translate(${x}px,${y}px)`;
  });
  btn.addEventListener('mouseleave', () => btn.style.transform = '');
});

// Lightweight animated constellation
const canvas = q('#network');
const ctx = canvas.getContext('2d');
let w=0,h=0,dpr=1,nodes=[];
function resize(){
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = window.innerWidth; h = window.innerHeight;
  canvas.width = w*dpr; canvas.height = h*dpr;
  canvas.style.width = w+'px'; canvas.style.height = h+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const count = Math.min(56, Math.max(24, Math.floor(w/28)));
  nodes = Array.from({length:count}, () => ({
    x:Math.random()*w,y:Math.random()*h,
    vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.18,
    r:Math.random()*1.3+.5
  }));
}
function draw(){
  ctx.clearRect(0,0,w,h);
  for(const n of nodes){
    n.x += n.vx; n.y += n.vy;
    if(n.x<0||n.x>w) n.vx*=-1;
    if(n.y<0||n.y>h) n.vy*=-1;
    ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
    ctx.fillStyle='rgba(123,198,255,.45)'; ctx.fill();
  }
  for(let i=0;i<nodes.length;i++){
    for(let j=i+1;j<nodes.length;j++){
      const a=nodes[i], b=nodes[j], dx=a.x-b.x, dy=a.y-b.y, d=Math.hypot(dx,dy);
      if(d<120){
        ctx.strokeStyle=`rgba(113,181,240,${(1-d/120)*.09})`;
        ctx.lineWidth=.6; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      }
    }
  }
  requestAnimationFrame(draw);
}
if (!matchMedia('(prefers-reduced-motion: reduce)').matches){
  resize(); draw(); addEventListener('resize', resize);
}
