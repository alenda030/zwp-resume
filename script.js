/* ===================== 载入动画 ===================== */
function initReveal(){
  var loader = document.getElementById('loader');
  if (loader) loader.classList.add('done');
}
// 不等大图加载：DOM 就绪后尽快显示，window.load 只作为兜底
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(initReveal, 400); });
} else {
  setTimeout(initReveal, 400);
}
window.addEventListener('load', initReveal);
document.body.style.overflow = 'hidden';

/* ===================== 3D 进入入口 ===================== */
(function(){
  var es = document.getElementById('enterScreen');
  var btn = document.getElementById('enterBtn');
  if (!es) return;
  var entered = false;
  function enter(){
    if (entered) return; entered = true;
    es.classList.add('left');
    document.body.style.overflow = '';
    playHero();
    setTimeout(function(){ es.style.display = 'none'; }, 950);
  }
  if (btn) btn.addEventListener('click', enter);
})();


/* ===================== Hero 文字入场 ===================== */
function playHero() {
  if (window.gsap) {
    gsap.to('.hero-title .word', {
      y: 0, duration: 1, ease: 'power4.out', stagger: 0.09
    });
    gsap.to('.hero .reveal', {
      opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .12, delay: .3,
      onStart(){ document.querySelectorAll('.hero .reveal').forEach(e=>e.style.transform='none'); }
    });
  } else {
    document.querySelectorAll('.hero-title .word').forEach(w => w.style.transform = 'none');
    document.querySelectorAll('.hero .reveal').forEach(e => e.classList.add('in'));
  }
}

/* ===================== 自定义光标 ===================== */
(function(){
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot) return;
  let rx=0, ry=0, dx=0, dy=0;
  window.addEventListener('mousemove', e => {
    dx = e.clientX; dy = e.clientY;
    dot.style.transform = `translate(${dx}px,${dy}px) translate(-50%,-50%)`;
  });
  function loop(){
    rx += (dx - rx) * .18; ry += (dy - ry) * .18;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  }
  loop();
  document.querySelectorAll('a,button,.magnetic,.deck-card,.resume-card,.skill-tags span,.bubble,.work-head').forEach(el=>{
    el.addEventListener('mouseenter',()=>ring.classList.add('hover'));
    el.addEventListener('mouseleave',()=>ring.classList.remove('hover'));
  });
})();

/* ===================== 滚动进度 + 顶栏 ===================== */
const progress = document.getElementById('scrollProgress');
const topbar = document.getElementById('topbar');
window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (window.scrollY / h * 100) + '%';
  topbar.classList.toggle('scrolled', window.scrollY > 40);
  updateNav();
});

/* ===================== 侧边导航高亮 ===================== */
const sections = [...document.querySelectorAll('main section[id]')];
const dots = [...document.querySelectorAll('.nav-dot')];
const topLinks = [...document.querySelectorAll('.topnav a')];
function updateNav(){
  const y = window.scrollY + window.innerHeight * 0.4;
  let cur = sections[0].id;
  sections.forEach(s => { if (s.offsetTop <= y) cur = s.id; });
  dots.forEach(d => d.classList.toggle('active', d.getAttribute('href') === '#' + cur));
  topLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
}

/* ===================== 滚动揭示 ===================== */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => {
  if (!el.closest('.hero')) io.observe(el);
});

/* ===================== 照片叠放 · 拖动/点击切换 ===================== */
(function(){
  const deck = document.getElementById('photoDeck');
  if (!deck) return;
  const cards = [...deck.querySelectorAll('.deck-card')];
  let order = cards.map((_, i) => i);   // order[0] = 最前面
  const poses = [
    { x: 0,   y: 0,   r: 0,  s: 1,    z: 30, o: 1 },
    { x: 22,  y: 16,  r: 5,  s: .94,  z: 20, o: 1 },
    { x: 44,  y: 32,  r: 10, s: .88,  z: 10, o: 1 }
  ];
  function render(anim = true){
    order.forEach((cardIdx, pos) => {
      const c = cards[cardIdx];
      const p = poses[Math.min(pos, poses.length - 1)];
      c.style.transition = anim ? '' : 'none';
      c.style.transform = `translate(${p.x}px,${p.y}px) rotate(${p.r}deg) scale(${p.s})`;
      c.style.zIndex = p.z;
      c.style.opacity = p.o;
    });
  }
  function cycle(){ order.push(order.shift()); render(); }
  render(false);

  // 拖拽 & 点击
  let startX = 0, dragging = false, moved = false;
  function down(e){
    dragging = true; moved = false;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
  }
  function move(e){
    if (!dragging) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    const d = x - startX;
    if (Math.abs(d) > 5) moved = true;
    const front = cards[order[0]];
    front.style.transition = 'none';
    front.style.transform = `translate(${d}px, ${Math.abs(d)*0.05}px) rotate(${d*0.04}deg)`;
  }
  function up(e){
    if (!dragging) return;
    dragging = false;
    const front = cards[order[0]];
    front.style.transition = '';
    const x = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX);
    const d = x - startX;
    if (Math.abs(d) > 70){
      // 甩出去再回到最后
      front.style.transform = `translate(${d>0?400:-400}px, 60px) rotate(${d>0?24:-24}deg)`;
      setTimeout(cycle, 260);
    } else if (!moved){
      cycle();           // 轻点也切换
    } else {
      render();          // 回弹
    }
  }
  deck.addEventListener('mousedown', down);
  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', up);
  deck.addEventListener('touchstart', down, {passive:true});
  deck.addEventListener('touchmove', move, {passive:true});
  deck.addEventListener('touchend', up);
})();

/* ===================== 简历弹窗 ===================== */
(function(){
  const card = document.getElementById('resumeCard');
  const modal = document.getElementById('resumeModal');
  const close = document.getElementById('modalClose');
  if (!card || !modal) return;
  const open = () => { modal.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const hide = () => { modal.classList.remove('open'); document.body.style.overflow = ''; };
  card.addEventListener('click', open);
  close.addEventListener('click', hide);
  modal.querySelector('.modal-backdrop').addEventListener('click', hide);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
})();

/* ===================== 工作经历手风琴 ===================== */
document.querySelectorAll('.work-item .work-head').forEach(head => {
  head.addEventListener('click', () => {
    const item = head.closest('.work-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.work-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});
// 默认展开第一个
const firstWork = document.querySelector('.work-item');
if (firstWork) firstWork.classList.add('open');

/* ===================== 微信二维码展开 ===================== */
(function(){
  var wrap = document.querySelector('.wechat-wrap');
  var btn = document.getElementById('wechatBtn');
  if (!wrap || !btn) return;
  btn.addEventListener('click', function(e){
    e.stopPropagation();
    wrap.classList.toggle('open');
  });
  document.addEventListener('click', function(e){
    if (!wrap.contains(e.target)) wrap.classList.remove('open');
  });
})();

/* ===================== 磁吸按钮 ===================== */
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const mx = e.clientX - r.left - r.width / 2;
    const my = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${mx * 0.25}px, ${my * 0.35}px)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transform = ''; });
});

/* ===================== 兴趣气泡随机漂浮 ===================== */
document.querySelectorAll('.bubble').forEach((b, i) => {
  b.style.animation = `bfloat ${4 + i * 0.4}s ease-in-out ${i * 0.2}s infinite`;
});
const style = document.createElement('style');
style.textContent = '@keyframes bfloat{50%{transform:translateY(-10px)}}';
document.head.appendChild(style);

/* ===================== Hero 视差 blob ===================== */
window.addEventListener('mousemove', e => {
  const cx = (e.clientX / window.innerWidth - .5);
  const cy = (e.clientY / window.innerHeight - .5);
  const b1 = document.querySelector('.blob-1');
  const b2 = document.querySelector('.blob-2');
  if (b1) b1.style.marginLeft = cx * 30 + 'px';
  if (b2) b2.style.marginTop = cy * 30 + 'px';
});

/* ===================== 小红书作品轮播 + 点击放大 ===================== */
(function(){
  const car = document.getElementById('xhsCarousel');
  if (!car) return;
  const track = car.querySelector('.xhs-track');
  const slides = [...car.querySelectorAll('.xhs-slide')];
  const dotsBox = car.querySelector('.xhs-dots');
  let idx = 0;
  slides.forEach((_, i) => {
    const d = document.createElement('span');
    if (i === 0) d.classList.add('on');
    d.addEventListener('click', () => go(i));
    dotsBox.appendChild(d);
  });
  const dots = [...dotsBox.children];
  function go(i){
    idx = (i + slides.length) % slides.length;
    track.style.transform = `translateX(${-idx * 100}%)`;
    dots.forEach((d, k) => d.classList.toggle('on', k === idx));
  }
  car.querySelector('.prev').addEventListener('click', () => go(idx - 1));
  car.querySelector('.next').addEventListener('click', () => go(idx + 1));

  // 拖拽切换
  let sx = 0, drag = false, moved = false;
  const down = e => { drag = true; moved = false; sx = (e.touches ? e.touches[0].clientX : e.clientX); };
  const move = e => { if (drag && Math.abs((e.touches ? e.touches[0].clientX : e.clientX) - sx) > 6) moved = true; };
  const up = e => {
    if (!drag) return; drag = false;
    const dx = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX) - sx;
    if (dx < -50) go(idx + 1); else if (dx > 50) go(idx - 1);
  };
  track.addEventListener('mousedown', down); window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
  track.addEventListener('touchstart', down, {passive:true}); track.addEventListener('touchmove', move, {passive:true}); track.addEventListener('touchend', up);

  // 点击图片放大（未拖动时）
  const lb = document.getElementById('imgLightbox');
  const lbImg = document.getElementById('lightboxImg');
  slides.forEach(s => {
    const img = s.querySelector('img');
    img.addEventListener('click', () => {
      if (moved) return;
      lbImg.src = img.src;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
  const hideLb = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };
  document.getElementById('lightboxClose').addEventListener('click', hideLb);
  lb.querySelector('.modal-backdrop').addEventListener('click', hideLb);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hideLb(); });
})();

/* ===================== 顶栏证件照点击弹微信二维码 ===================== */
(function(){
  var photo = document.getElementById('brandPhoto');
  var lb = document.getElementById('imgLightbox');
  if (!photo || !lb) return;
  var lbImg = document.getElementById('lightboxImg');
  var open = function(){ lbImg.src = 'assets/wechat-qr.jpg'; lbImg.alt = '曾吴平 微信二维码'; lb.classList.add('open'); document.body.style.overflow = 'hidden'; };
  var hide = function(){ lb.classList.remove('open'); document.body.style.overflow = ''; };
  photo.style.cursor = 'pointer';
  photo.addEventListener('click', open);
  var closeBtn = document.getElementById('lightboxClose');
  if (closeBtn) closeBtn.addEventListener('click', hide);
  var bd = lb.querySelector('.modal-backdrop');
  if (bd) bd.addEventListener('click', hide);
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') hide(); });
})();

/* ===================== 安全兜底：确保所有内容最终可见 ===================== */
/* hero 的 reveal 依赖 window.load（会等大图加载），大图较慢时可能迟迟不显示；
   这里在脚本解析后 1.1s 强制显示全部 reveal 与关闭载入层，动画若已提前触发不受影响。 */
setTimeout(function(){
  document.querySelectorAll('.reveal').forEach(function(e){
    e.classList.add('in');
    e.style.opacity = '1';
    e.style.transform = 'none';
  });
  document.querySelectorAll('.hero-title .word').forEach(function(w){ w.style.transform = 'none'; });
  var loader = document.getElementById('loader');
  if (loader) loader.classList.add('done');
  document.body.style.overflow = '';
}, 1100);
