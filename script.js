/* ===== SHIZO JS ===== */
const pages = [...document.querySelectorAll('.page')];
pages.forEach(sec=>{
  const bg = sec.getAttribute('data-bg');
  if(bg) sec.style.backgroundImage = `url(${bg})`;
});

const calmToggle = document.getElementById('calmToggle');
if(calmToggle){
  calmToggle.addEventListener('click',()=>{
    const on = document.body.classList.toggle('calm');
    calmToggle.setAttribute('aria-pressed', String(on));
  });
}

/* Runaway button behavior */
function makeRunaway(btn){
  /* MOBILE ENABLED: runaway also on phones/tablets */
  let isSmall = false;
  try{
    isSmall = window.matchMedia('(max-width: 1024px)').matches || window.matchMedia('(pointer: coarse)').matches;
  }catch(_){ isSmall = false; }
let boundsEl = btn.closest('.content') || document.body;
  const margin = 16;
  function randomize(){
    const r = boundsEl.getBoundingClientRect();
    const bx = Math.random()*(r.width - btn.offsetWidth - margin*2) + margin;
    const by = Math.random()*(r.height - btn.offsetHeight - margin*2) + margin;
    btn.style.setProperty('transform', `translate(${Math.round(bx - btn.offsetLeft)}px, ${Math.round(by - btn.offsetTop)}px)`, 'important');
  }
  btn.addEventListener('mouseenter', ()=>{
    if(!document.body.classList.contains('calm')){
      randomize();
    }
  });
  btn.addEventListener('click',(e)=>{
    if(!document.body.classList.contains('calm')){
      e.preventDefault();
      confetti(btn);
    }else{
      openBuy();
    }
  });

  /* Mobile/tablet: make it flee on touch or pointer down */
  if(isSmall){
    const flee = (e)=>{
      if(document.body.classList.contains('calm')) return; // in calm mode allow pressing
      try{ e.preventDefault(); }catch(_){}
      randomize();
    };
    btn.addEventListener('touchstart', flee, {passive:false});
    btn.addEventListener('pointerdown', (e)=>{
      try{
        if(window.matchMedia('(pointer: coarse)').matches) flee(e);
      }catch(_){ /* noop */ }
    }, {passive:false});
  }
}
document.querySelectorAll('.btn-buy.runaway').forEach(makeRunaway);

/* Whitepaper */
function openWhite(){
  document.getElementById('whitepaperModal').classList.add('show');
  setupWhitepaperCanvas();
}
function closeModals(){
  const w = document.getElementById('whitepaperModal');
  const wasWhiteOpen = !!(w && w.classList.contains('show'));
  document.querySelectorAll('.modal').forEach(m=>m.classList.remove('show'));
  teardownWhitepaperCanvas();
  }
document.querySelectorAll('#whitepaper1').forEach(b=>b.addEventListener('click', openWhite));
document.querySelectorAll('.modal-close').forEach(b=>b.addEventListener('click', closeModals));
document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeModals() });

/* Buy real modal */
function openBuy(){
  const m = document.getElementById('buyModal');
  if(m) m.classList.add('show');
}

/* Absurd buttons */
document.getElementById('roadmad1').addEventListener('click', (e)=>{
  // Mobile/Tablet: chaotic scroll down to page3, then back to page1
  let isSmall=false;
  try{ isSmall = window.matchMedia('(max-width: 1024px)').matches || window.matchMedia('(pointer: coarse)').matches; }catch(_){}
  if(isSmall){
    try{ e.preventDefault(); e.stopImmediatePropagation(); }catch(_){}
    const p1 = document.getElementById('page1');
    const p3 = document.getElementById('page3');
    if(!(p1 && p3)) return;
    const jitter = ()=> (Math.random()-0.5)*40;
    const targetDown = p3.getBoundingClientRect().top + window.pageYOffset;
    let steps=0;
    const down = setInterval(()=>{
      const y = window.pageYOffset;
      const delta = targetDown - y;
      const move = delta*0.28 + jitter();
      window.scrollTo({ top: y + move, behavior:'auto' });
      if(Math.abs(delta) < 24 || steps++ > 42){ clearInterval(down); setTimeout(upPhase, 260); }
    }, 60);
    function upPhase(){
      const targetUp = p1.getBoundingClientRect().top + window.pageYOffset;
      let steps2=0;
      const up = setInterval(()=>{
        const y2 = window.pageYOffset;
        const delta2 = targetUp - y2;
        const move2 = delta2*0.30 + jitter();
        window.scrollTo({ top: y2 + move2, behavior:'auto' });
        if(Math.abs(delta2) < 20 || steps2++ > 46){ clearInterval(up); }
      }, 60);
    }
    return false;
  }

  // Desktop: keep original playful sine scroll
  let i=0;
  const id = setInterval(()=>{
    window.scrollTo({ top: (Math.sin(i/4)+1)/2 * (document.body.scrollHeight - innerHeight), behavior: 'smooth' });
    if(i++>40) clearInterval(id);
  }, 180);
});

document.getElementById('btnNoise').addEventListener('click', ()=>{ makeItLoud(); });

function makeItLoud(){
  const section = document.getElementById('page2');
  section.classList.add('loud');
  noiseFlash(12000);
  // play scream
  if(!window._scream){ window._scream = new Audio('assets/scream.mp3'); }
  const a = window._scream;
  try{ a.currentTime = 0; }catch(e){}
  a.play();
  clearTimeout(window._loudTimer);
  const end = ()=>{ section.classList.remove('loud'); };
  a.onended = end;
  window._loudTimer = setTimeout(()=>{ try{ a.pause(); }catch(e){} end(); }, 12000);
}


/* Simple confetti */
function confetti(anchor){
  const n=24, box = anchor.getBoundingClientRect();
  for(let i=0;i<n;i++){
    const piece=document.createElement('i');
    piece.className='confetti';
    piece.style.setProperty('--x', (box.left+box.width/2)+'px');
    piece.style.setProperty('--y', (box.top)+'px');
    piece.style.left = `calc(var(--x))`;
    piece.style.top = `calc(var(--y))`;
    document.body.appendChild(piece);
    setTimeout(()=>piece.remove(), 1200);
  }
}

/* Tiny noise flash overlay */
function noiseFlash(ms=800){
  const o = document.createElement('div');
  o.className='noiseflash';
  document.body.appendChild(o);
  setTimeout(()=>o.remove(), ms);
}

/* Parallax tilt for sprites */
document.addEventListener('pointermove', (e)=>{
  const cx = innerWidth/2, cy = innerHeight/2;
  const dx = (e.clientX - cx)/cx, dy = (e.clientY - cy)/cy;
  document.querySelectorAll('.sprite').forEach(img=>{
    const flip = img.classList.contains('flipx') ? ' scaleX(-1)' : '';
    img.style.transform = `translate(${dx*6}px, ${dy*4}px) rotate(${dx*2}deg)` + flip;
  });
});


/* Populate initial backgrounds */
pages.forEach(sec=>{
  const bg = sec.getAttribute('data-bg');
  if(bg) sec.style.backgroundImage = `url(${bg})`;
});

/* === Whitepaper drawing with random phrases === */
let paperCanvas=null, paperCtx=null, scribbleTimer=null, fadeTimer=null, resizeObs=null, drawing=false, lastX=0, lastY=0;

const phrases = [
  "math is a social construct",
  "buy? maybe.",
  "gravity is a hater",
  "HODL-ish",
  "white paper, black thoughts",
  "tongue economics",
  "panic later",
  "roadmad.exe",
  "shizo was here",
  "logic optional"
];

function setupWhitepaperCanvas(){
  const host = document.querySelector('.whitepaper .paper');
  if(!host || paperCanvas) return;
  paperCanvas = document.createElement('canvas');
  paperCanvas.className = 'paper-canvas';
  paperCanvas.style.width = '100%';
  paperCanvas.style.height = '100%';
  paperCanvas.style.display = 'block';
  host.appendChild(paperCanvas);
  paperCtx = paperCanvas.getContext('2d');

  const fit = ()=>{
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = host.getBoundingClientRect();
    paperCanvas.width = Math.max(1, Math.floor(r.width*dpr));
    paperCanvas.height = Math.max(1, Math.floor(r.height*dpr));
    paperCtx.setTransform(dpr,0,0,dpr,0,0); // reset scale (using CSS pixel units)
  };
  fit();
  // observe resize
  resizeObs = new ResizeObserver(fit);
  resizeObs.observe(host);

  // draw helpers
  const start = (x,y)=>{ drawing=true; lastX=x; lastY=y; };
  const draw = (x,y)=>{
    if(!drawing) return;
    paperCtx.lineCap='round';
    paperCtx.lineJoin='round';
    paperCtx.strokeStyle='#111';
    paperCtx.lineWidth=2.5 + Math.random()*1.5;
    paperCtx.beginPath();
    paperCtx.moveTo(lastX,lastY);
    paperCtx.lineTo(x,y);
    paperCtx.stroke();
    lastX=x; lastY=y;
  };
  const stop = ()=>{ drawing=false; };

  paperCanvas.addEventListener('pointerdown', e=>{
    paperCanvas.setPointerCapture(e.pointerId);
    start(e.offsetX, e.offsetY);
  });
  paperCanvas.addEventListener('pointermove', e=> draw(e.offsetX, e.offsetY));
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>paperCanvas.addEventListener(ev, stop));

  // scribble random phrases periodically
  const scribble = ()=>{
    if(!paperCtx) return;
    const r = paperCanvas.getBoundingClientRect();
    const x = 20 + Math.random()*(r.width-240);
    const y = 40 + Math.random()*(r.height-40);
    paperCtx.save();
    paperCtx.fillStyle = '#444';
    paperCtx.globalAlpha = 0.75;
    paperCtx.translate(x,y);
    paperCtx.rotate((Math.random()-.5)*0.08);
    paperCtx.font = 'bold 22px "Bangers", system-ui, sans-serif';
    paperCtx.fillText(phrases[Math.floor(Math.random()*phrases.length)], 0, 0);
    paperCtx.restore();
  };
  scribbleTimer = setInterval(scribble, 2200);

  // gentle auto-erase (fades all marks)
  fadeTimer = setInterval(()=>{
    paperCtx.save();
    paperCtx.globalCompositeOperation = 'source-over';
    paperCtx.fillStyle = 'rgba(255,255,255,0.06)';
    paperCtx.fillRect(0,0,paperCanvas.width, paperCanvas.height);
    paperCtx.restore();
  }, 120);
}

function teardownWhitepaperCanvas(){
  if(scribbleTimer){ clearInterval(scribbleTimer); scribbleTimer=null; }
  if(fadeTimer){ clearInterval(fadeTimer); fadeTimer=null; }
  if(resizeObs){ try{ resizeObs.disconnect(); }catch(_){} resizeObs=null; }
  if(paperCanvas && paperCanvas.parentNode){ paperCanvas.parentNode.removeChild(paperCanvas); }
  paperCanvas=null; paperCtx=null;
}



/* === Custom SHIZO cursor follow (enhanced with Reverse Mouse) === */
(function(){
  // Visual cursor
  const c = document.createElement('div');
  c.className = 'custom-cursor';
  document.body.appendChild(c);

  // State
  let ax = null, ay = null;    // actual pointer last position
  let sx = window.innerWidth/2, sy = window.innerHeight/2; // simulated cursor position
  let reverseOn = false;
  window.__getReverseMouse = () => reverseOn;
  
window.__setReverseMouse = (on) => { 
  reverseOn = !!on; 
  const btn = document.getElementById('btnReverseMouse');
  if(btn){ btn.setAttribute('aria-pressed', String(reverseOn)); btn.classList.toggle('active', reverseOn); }
  // Globally hide the native cursor when reverse is ON to avoid double-cursor effect
  let styleTag = document.getElementById('rm-hide-cursor');
  if(reverseOn){
    if(!styleTag){
      styleTag = document.createElement('style');
      styleTag.id = 'rm-hide-cursor';
      styleTag.textContent = `*{cursor: none !important;}`;
      document.head.appendChild(styleTag);
    }
  }else{
    if(styleTag) styleTag.remove();
  }
};

  // Follow logic
  addEventListener('pointermove', e=>{
    if(ax === null){ ax = e.clientX; ay = e.clientY; sx = e.clientX; sy = e.clientY; }
    const nx = e.clientX, ny = e.clientY;
    const dx = nx - ax, dy = ny - ay;
    if(reverseOn){
      sx -= dx; sy -= dy;
    }else{
      sx = nx; sy = ny;
    }
    ax = nx; ay = ny;
    // clamp to viewport
    sx = Math.max(0, Math.min(innerWidth-1, sx));
    sy = Math.max(0, Math.min(innerHeight-1, sy));
    c.style.transform = `translate(${sx-10}px, ${sy-10}px)`;
  }, {passive:true});

  // Redirect clicks to the simulated cursor location when reversed
  const redirect = (evt)=>{
    if(!reverseOn) return;
    
    // Allow toggling off by clicking the button itself (do not redirect those clicks)
    try{
      if(evt.target && (evt.target.id === 'btnReverseMouse' || (evt.target.closest && evt.target.closest('#btnReverseMouse')))){
        return; // let the native button handler run
      }
    }catch(_){}
// Prevent the default click at the real pointer
    evt.stopPropagation();
    evt.preventDefault();
    const el = document.elementFromPoint(sx, sy);
    if(el){
      // Brief visual feedback
      el.classList.add('click-glow');
      setTimeout(()=>el.classList.remove('click-glow'), 150);
      // Synthesize a click
      el.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true, clientX:sx, clientY:sy}));
    }
  };
  addEventListener('click', redirect, true);
  addEventListener('pointerdown', redirect, true);

  // Hook button if present
  const hookBtn = ()=>{
    const btn = document.getElementById('btnReverseMouse');
    if(!btn) return;
    btn.addEventListener('click', (e)=>{
      // Toggle reverse mode
      window.__setReverseMouse(!reverseOn);
      // Little confetti if available in project
      try{ if(typeof confetti === 'function') confetti(btn); }catch(_){}
    });
  };
  if(document.readyState === 'loading'){
    addEventListener('DOMContentLoaded', hookBtn, {once:true});
  }else{
    hookBtn();
  }
})();

/* === Flip sprite on page2 when moving left->right === */
(function(){
  const spr = document.querySelector('#page2 .sprite');
  if(!spr) return;
  let last = null;
  setInterval(()=>{
    const cur = parseFloat(getComputedStyle(spr).left) || 0;
    if(last !== null){
      if(cur > last + 0.2){ spr.classList.add('flipx'); }       // moving right -> mirror
      else if(cur < last - 0.2){ spr.classList.remove('flipx'); } // moving left -> normal
    }
    last = cur;
  }, 120);
})();


/* === Bouncing flyers on page1 === */
(function(){
  const page = document.getElementById('page1');
  if(!page) return;
  const container = document.createElement('div');
  container.className = 'flyers';
  page.appendChild(container);

  const sources = ['assets/fly-404.png','assets/fly-error.png','assets/fly-eye.png','assets/fly-tongue.png', 'assets/icon-twitter.png', 'assets/icon-dex.png', 'assets/icon-telegram.png'];

  const flyers = sources.map(src=>{
    const el = new Image();
    el.src = src;
    el.className = 'flyer';
    container.appendChild(el);
    return {
      el, x: Math.random()*innerWidth*0.6+20, y: Math.random()*innerHeight*0.5+20,
      vx: (Math.random()<.5?-1:1) * (1.2 + Math.random()*1.8),
      vy: (Math.random()<.5?-1:1) * (1.0 + Math.random()*1.6),
      rot: (Math.random()*40-20), spin: (Math.random()*.4 - .2),
      w: 120, h: 120, nextBlink: performance.now() + 6000 + Math.random()*4000, lastGhost: 0
    };
  });

  // Reveal after load for fade-in
  setTimeout(()=> flyers.forEach(f=>f.el.classList.add('show')), 300);

  function bounds(){
    const r = page.getBoundingClientRect();
    return { w: r.width, h: r.height };
  }

  function tick(t){
    const b = bounds();
    for(const f of flyers){
      // basic physics
      f.x += f.vx;
      f.y += f.vy;
      f.rot += f.spin;

      // edges/bounce
      const imgw = f.el.getBoundingClientRect().width || 120;
      const imgh = f.el.getBoundingClientRect().height || 120;
      const maxX = b.w - imgw - 6;
      const maxY = b.h - imgh - 6;
      if(f.x<6){ f.x=6; f.vx*=-1; }
      if(f.x>maxX){ f.x=maxX; f.vx*=-1; }
      if(f.y<6){ f.y=6; f.vy*=-1; }
      if(f.y>maxY){ f.y=maxY; f.vy*=-1; }

      // apply transform
      f.el.style.transform = `translate3d(${f.x}px, ${f.y}px, 0) rotate(${f.rot}deg)`;

      // leave ghost trail every 120ms
      if(t - f.lastGhost > 120){
        f.lastGhost = t;
        const g = f.el.cloneNode();
        g.classList.remove('flyer'); g.classList.add('ghost');
        const gx = (Math.random()*.8+0.2)*f.vx*14;
        const gy = (Math.random()*.8+0.2)*f.vy*14;
        g.style.setProperty('--gx', gx+'px');
        g.style.setProperty('--gy', gy+'px');
        g.style.setProperty('--grot', (f.spin*80).toFixed(2)+'deg');
        g.style.transform = `translate3d(${f.x}px, ${f.y}px,0) rotate(${f.rot}deg)`;
        container.appendChild(g);
        setTimeout(()=> g.remove(), 1100);
      }

      // blink (hide + respawn) every 6–10s
      if(t > f.nextBlink){
        f.el.classList.remove('show');
        setTimeout(()=>{
          // respawn at random edge with new velocity
          const side = Math.floor(Math.random()*4);
          if(side===0){ f.x=6; f.y=Math.random()*maxY; f.vx=Math.abs(f.vx); }
          if(side===1){ f.x=maxX; f.y=Math.random()*maxY; f.vx=-Math.abs(f.vx); }
          if(side===2){ f.x=Math.random()*maxX; f.y=6; f.vy=Math.abs(f.vy); }
          if(side===3){ f.x=Math.random()*maxX; f.y=maxY; f.vy=-Math.abs(f.vy); }
          f.nextBlink = t + 6000 + Math.random()*4000;
          f.el.classList.add('show');
        }, 900);
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* === FIXED FLYERS (canvas-based) on page1 === */
(function(){
  const page = document.getElementById('page1');
  if(!page) return;

  // remove old DOM flyers if they exist
  const old = page.querySelector('.flyers');
  if(old) old.remove();

  // canvas setup
  const canvas = document.createElement('canvas');
  canvas.className = 'flyers-canvas';
  page.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function fit(){
    const dpr = Math.min(2, window.devicePixelRatio||1);
    const r = page.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(r.width * dpr));
    canvas.height = Math.max(1, Math.floor(r.height * dpr));
    canvas.style.width = r.width + 'px';
    canvas.style.height = r.height + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  fit();
  new ResizeObserver(fit).observe(page);

  // load images
  const srcs = ['assets/fly-404.png','assets/fly-error.png','assets/fly-eye.png','assets/fly-tongue.png', 'assets/icon-twitter.png', 'assets/icon-dex.png', 'assets/icon-telegram.png'];
  const imgs = [];
  let loaded = 0;
  srcs.forEach(s=>{
    const im = new Image();
    im.onload = ()=>{ loaded++; };
    im.src = s; imgs.push(im);
  });

  function rand(a,b){ return a + Math.random()*(b-a); }
  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  const flyers = new Array(8).fill(0).map(()=>({
    img: pick(imgs),
    x: rand(40, canvas.clientWidth-140),
    y: rand(40, canvas.clientHeight-140),
    vx: (Math.random()<.5?-1:1) * rand(1.1, 2.2),
    vy: (Math.random()<.5?-1:1) * rand(0.9, 1.9),
    size: rand(82, 150),
    rot: rand(-20,20),
    spin: rand(-0.25,0.25),
    alpha: 0, target: 0.9,
    nextBlink: performance.now() + rand(5000, 9000)
  }));

  // fade/ghost trail params
  let lastT = performance.now();

  function loop(t){
    if(loaded < imgs.length){ requestAnimationFrame(loop); return; }

    const dt = Math.min(32, t - lastT); // ms
    lastT = t;

    // TRAIL: gently fade previous frame without darkening background
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; // erase ~8%
    ctx.fillRect(0,0,canvas.width, canvas.height);
    ctx.restore();

    // draw each flyer
    const W = canvas.clientWidth, H = canvas.clientHeight;
    for(const f of flyers){
      // appear/disappear automatic
      if(t > f.nextBlink){
        f.target = 0; // fade out
        if(f.alpha < 0.05){
          // respawn at an edge
          const side = Math.floor(Math.random()*4);
          if(side===0){ f.x=10; f.y=rand(10,H-10); f.vx = Math.abs(f.vx); }
          if(side===1){ f.x=W-10; f.y=rand(10,H-10); f.vx = -Math.abs(f.vx); }
          if(side===2){ f.x=rand(10,W-10); f.y=10; f.vy = Math.abs(f.vy); }
          if(side===3){ f.x=rand(10,W-10); f.y=H-10; f.vy = -Math.abs(f.vy); }
          f.size = rand(82,150);
          f.img = pick(imgs);
          f.target = 0.9;
          f.nextBlink = t + rand(5000, 9000);
        }
      }

      // motion
      f.x += f.vx;
      f.y += f.vy;
      f.rot += f.spin;

      // bounce limits
      const maxX = W - f.size - 6, maxY = H - f.size - 6;
      if(f.x < 6){ f.x = 6; f.vx *= -1; }
      if(f.x > maxX){ f.x = maxX; f.vx *= -1; }
      if(f.y < 6){ f.y = 6; f.vy *= -1; }
      if(f.y > maxY){ f.y = maxY; f.vy *= -1; }

      // alpha approach target
      f.alpha += (f.target - f.alpha) * 0.12;

      // draw
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, f.alpha));
      ctx.translate(f.x + f.size/2, f.y + f.size/2);
      ctx.rotate(f.rot * Math.PI/180);
      ctx.drawImage(f.img, -f.size/2, -f.size/2, f.size, f.size);
      ctx.restore();
    }

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();






/* === Persistent Reverse Scroll (enable on whitepaper close; disable on page2 button) === */
let _revScrollOn = false;
const _revWheelHandler = (e)=>{ window.scrollBy(0, -e.deltaY); e.preventDefault(); };

function enableReverseScroll(){
  if(_revScrollOn) return;
  _revScrollOn = true;
  addEventListener('wheel', _revWheelHandler, {passive:false});
}
function disableReverseScroll(){
  if(!_revScrollOn) return;
  _revScrollOn = false;
  removeEventListener('wheel', _revWheelHandler, {passive:false});
}

/* Close whitepaper by clicking outside inner panel */
(function(){
  const modal = document.getElementById('whitepaperModal');
  if(!modal) return;
  modal.addEventListener('click', (e)=>{
    if(e.target === modal){ closeModals(); }
  });
})();


/* === Copy contract + BUY (top bar) === */
(function(){
  const copyBtn = document.getElementById('copyContract');
  const codeEl = document.getElementById('contractAddress');
  if(copyBtn && codeEl){
    copyBtn.addEventListener('click', async ()=>{
      try{
        await navigator.clipboard.writeText(codeEl.textContent.trim());
        const old = copyBtn.textContent;
        copyBtn.textContent = 'COPIED!';
        copyBtn.classList.add('copied');
        setTimeout(()=>{ copyBtn.textContent = old; copyBtn.classList.remove('copied'); }, 900);
      }catch(e){
        // fallback
        const range = document.createRange(); range.selectNodeContents(codeEl);
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
        document.execCommand('copy'); sel.removeAllRanges();
        copyBtn.textContent = 'COPIED!';
        setTimeout(()=>{ copyBtn.textContent = 'COPY'; }, 900);
      }
    });
  }
})();




/* === ABOUT MEME: single-click split & vanish === */
(function(){
  const btn = document.getElementById('aboutMeme');
  if(!btn) return;
  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    if(btn.dataset.broken) return;
    btn.dataset.broken = '1';

    const rect = btn.getBoundingClientRect();
    const mkClone = (right=false)=>{
      const clone = btn.cloneNode(true);
      clone.removeAttribute('id');
      clone.style.position = 'fixed';
      clone.style.left = rect.left+'px';
      clone.style.top = rect.top+'px';
      clone.style.width = rect.width+'px';
      clone.style.height = rect.height+'px';
      clone.classList.add('btn-split');
      if(right) clone.classList.add('right');
      document.body.appendChild(clone);
      return clone;
    };
    const left = mkClone(false), right = mkClone(true);

    // hide and remove the original
    btn.style.visibility = 'hidden';
    setTimeout(()=>{ left.remove(); right.remove(); btn.remove(); }, 1150);
  });
})();


/* === ABOUT MEME (page3): single-click split & vanish === */
(function(){
  const btn = document.getElementById('aboutMeme3');
  if(!btn) return;
  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    if(btn.dataset.broken) return;
    btn.dataset.broken = '1';

    const rect = btn.getBoundingClientRect();
    const mkClone = (right=false)=>{
      const clone = btn.cloneNode(true);
      clone.removeAttribute('id');
      clone.style.position = 'fixed';
      clone.style.left = rect.left+'px';
      clone.style.top = rect.top+'px';
      clone.style.width = rect.width+'px';
      clone.style.height = rect.height+'px';
      clone.classList.add('btn-split');
      if(right) clone.classList.add('right');
      document.body.appendChild(clone);
      return clone;
    };
    const left = mkClone(false), right = mkClone(true);
    btn.style.visibility = 'hidden';
    setTimeout(()=>{ left.remove(); right.remove(); btn.remove(); }, 1150);
  });
})();



/* Smooth Exit to page1 (all devices) */
(function(){
  const exit = document.getElementById('exitBtn');
  if(!exit) return;
  const handler = (e)=>{
    try {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
      const p1 = document.getElementById('page1');
      if (p1 && typeof p1.scrollIntoView === 'function') {
        p1.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        const top = p1 ? (p1.getBoundingClientRect().top + window.pageYOffset) : 0;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      // Keep URL consistent after scroll
      setTimeout(()=>{
        try {
          if (location.hash !== '#page1') location.hash = '#page1';
        } catch(_) {}
      }, 450);
    } catch(_) {}
  };
  exit.addEventListener('click', handler, { capture: true, passive: false });
})();


/* === Random 10s logo burst on page1 === */
(function(){
  const logo = document.querySelector('#page1 .logo');
  if(!logo) return;
  /* MOBILE SAFE: skip logo burst on phones */
  try{ const m1=matchMedia('(max-width: 640px)').matches; const m2=matchMedia('(pointer: coarse)').matches; if(m1||m2) return; }catch(_){}
  let bursting = false;
  function burst(){
    if(bursting) return;
    bursting = true;
    const prev = logo.style.fontSize;
    const target = Math.max(24, Math.floor(window.innerHeight * 0.5)); // ~half screen
    logo.style.fontSize = target + 'px';
    setTimeout(()=>{
      logo.style.fontSize = prev || '';
      bursting = false;
    }, 1000); // return after 1s
  }
  // start after a random offset, then every 10s
  const startOffset = Math.floor(Math.random() * 10000);
  setTimeout(()=>{
    burst();
    setInterval(burst, 10000);
  }, startOffset);
})();
