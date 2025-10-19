// ---- SINGLETON GUARD ----
if (window.__LS_INIT__) {
  console.warn('[LS] app.js ya estaba inicializado; ignoro este segundo include.');
}
window.__LS_INIT__ = true;

// ===== Versión =====
var APP_VERSION = 14.1;
console.log('[LS] app.js cargado v' + APP_VERSION);

// ===== Helper cache-busting para imágenes remotas =====
function withBust(url){
  if (!/^https?:/i.test(url)) return url;
  return url + (url.includes('?') ? '&' : '?') + 'v=' + Date.now();
}

// ===== CONFIG ÚNICO (editá acá nombres, tips, playlist, fondos) =====
var CONFIG = {
  accent: '#39b4ff',
  accent2: '#9ee8ff',

  // Título fijo (si querés usar el hostname del server, poné null)
  forceTitle: "Quantum Pulse",

  // Fondos: **usar dominio directo de Imgur** (i.imgur.com) + fallback local de GMod
  slides: [
    [ withBust('https://i.imgur.com/GJKhdJk.jpg'), 'asset://garrysmod/materials/loadscreen/bg1.jpg' ],
    [ withBust('https://i.imgur.com/0RgiH9t.jpg'), 'asset://garrysmod/materials/loadscreen/bg2.jpg' ],
    [ withBust('https://i.imgur.com/l0cwEYM.jpg'), 'asset://garrysmod/materials/loadscreen/bg3.jpg' ]
  ],
  shuffleSlides: true,
  holdMs: 20000,
  fadeMs: 1100,
  kenburnsEvery: 2,

  tips: [
    'Para solicitar un staff, puedes hacerlo utilizando @',
    'Utiliza !addons para acceder a nuestra colección principal',
    'Esperamos que disfrutes del servidor!',
    'Gracias por jugar en Quantum Pulse!',
    'Tu presencia vale mucho!'
  ],

  // 🎵 Playlist (loop)
  music: {
    enabled: true,
    list: [
      'asset://garrysmod/sound/loadscreen/music.wav',
      'asset://garrysmod/sound/loadscreen/tema2.wav'
    ],
    src: 'asset://garrysmod/sound/loadscreen/music.wav',
    volume: 0.65
  }
};

// ===== Adaptación según entorno (WEB vs GMod) =====
const WEB = !window.gmod; // en Pages true
(function adaptForEnv(){
  if (!WEB) return; // En GMod no tocamos rutas: siguen siendo asset://

  // Música liviana para web
  CONFIG.music = CONFIG.music || {};
  CONFIG.music.list = ['/sound/loadscreen/music.ogg']; // o .mp3
  if (CONFIG.music.volume == null) CONFIG.music.volume = 0.65;
})();

// ===== CSS variables =====
var root = document.documentElement;
root.style.setProperty('--accent', CONFIG.accent);
root.style.setProperty('--accent2', CONFIG.accent2);
root.style.setProperty('--fade', CONFIG.fadeMs + 'ms');

// ===== Helpers =====
function safeMoney(n){
  var v = isFinite(Number(n)) ? Number(n) : 0;
  try {
    return new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', minimumFractionDigits:0 }).format(v);
  } catch(e){
    return '$ ' + Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}

// ===== SLIDES =====
var bg = document.getElementById('bg');
var slidesArr = CONFIG.slides.slice();
if (CONFIG.shuffleSlides) slidesArr.sort(function(){ return Math.random() - 0.5; });

function makeSlide(candidates, addKB){
  var el = document.createElement('div');
  el.className = 'bg-slide' + (addKB ? ' kenburns' : '');
  var i = 0;
  function tryNext(){
    while (i < candidates.length && !candidates[i]) i++;
    if (i >= candidates.length){
      console.error('[LS] FAIL img (todas) →', candidates.join(' | '));
      el.style.backgroundImage =
        'linear-gradient(135deg, rgba(57,180,255,.15), rgba(0,0,0,.35)), ' +
        'repeating-linear-gradient(45deg, rgba(255,255,255,.05), rgba(255,255,255,.05) 6px, transparent 6px, transparent 12px)';
      return;
    }
    var url = candidates[i++];
    var test = new Image();
    test.onload = function(){
      console.log('[LS] OK img', url, test.width + 'x' + test.height);
      el.style.backgroundImage = 'url("' + url + '")';
    };
    test.onerror = function(){
      console.warn('[LS] FAIL img', url, '→ siguiente…');
      tryNext();
    };
    console.log('[LS] TRY img', url);
    test.src = url;
  }
  tryNext();
  return el;
}
var els = [];
for (var i=0;i<slidesArr.length;i++){
  els.push(makeSlide(slidesArr[i], (i % CONFIG.kenburnsEvery) === 0));
}
for (i=0;i<els.length;i++){ bg.appendChild(els[i]); }
var slideIdx = 0;
if (els[0]) { els[0].classList.add('active'); els[0].style.opacity = '1'; }
function nextSlide(){ if (!els.length) return; els[slideIdx]?.classList.remove('active'); slideIdx = (slideIdx + 1) % els.length; els[slideIdx]?.classList.add('active'); }
setInterval(nextSlide, CONFIG.holdMs);

// ===== Barra decorativa (progress) =====
var bar=document.getElementById('bar'),
    pct=document.getElementById('pct'),
    loadingEl=document.getElementById('loading');
var P=0;(function tick(){
  P=Math.min(100,P+0.45);
  if(bar){ bar.style.width=P+'%'; }
  if(pct){ pct.textContent=Math.round(P)+'%'; }
  if(P<100){
    if(window.requestAnimationFrame) requestAnimationFrame(tick); else setTimeout(tick,16);
  } else if(loadingEl){
    loadingEl.textContent='CONECTANDO CON EL SERVIDOR...';
  }
})();

// ===== Tips (render) =====
var tipsEl=document.getElementById('tips');
if (tipsEl){
  for(var i=0;i<CONFIG.tips.length;i++){
    var b=document.createElement('div');
    b.className='tip';
    b.textContent=CONFIG.tips[i];
    tipsEl.appendChild(b);
  }
}

// ===== Logo robusto (WEB primero, luego GMod y fallback) =====
(function setLogo(){
  var el = document.getElementById('logo');
  if (!el) return;
  var candidates = [
    '/materials/loadscreen/logo.png',
    '/materials/loadscreen/logo.jpg',
    'asset://garrysmod/materials/loadscreen/logo.png',
    'asset://garrysmod/materials/loadscreen/logo.jpg',
    'asset://garrysmod/resource/loadscreen/img/logo.png',
    'asset://garrysmod/resource/loadscreen/img/logo.jpg',
    'img/logo.png',
    'img/logo.jpg'
  ];
  var i = 0;
  function tryNext(){
    if (i >= candidates.length){
      console.error('[LS] Logo no encontrado en rutas conocidas.');
      el.style.outline = '1px dashed rgba(255,255,255,.25)';
      el.style.outlineOffset = '4px';
      return;
    }
    var url = candidates[i++];
    var test = new Image();
    test.onload = function(){
      el.src = url + (url.indexOf('?') === -1 ? '?v=' : '&v=') + Date.now();
      console.log('[LS] OK logo', url, test.width + 'x' + test.height);
    };
    test.onerror = function(){ tryNext(); };
    test.src = url;
  }
  tryNext();
})();

// ===== Helper Título =====
function _applyTitle(srcHostname){
  var h1 = document.getElementById('title');
  var hasForce = (CONFIG.forceTitle !== null && CONFIG.forceTitle !== undefined);
  var title = hasForce ? String(CONFIG.forceTitle)
                       : (srcHostname || (h1 && h1.textContent) || 'QUANTUM PULSE');
  if (h1) h1.textContent = title;
  document.title = title + ' — Pantalla de Carga';
}
// Fade-in del DOM
document.documentElement.classList.add('is-ready');

// ===== Música (playlist + autoplay/mute) =====
var muteBtn = document.getElementById('mute');
var audio = document.getElementById('bgm');

(function setupAudio(){
  if (!CONFIG.music.enabled){ if (muteBtn) muteBtn.style.display='none'; return; }
  if (!audio){ console.error('[LS] Falta <audio id="bgm">'); if (muteBtn) muteBtn.style.display='none'; return; }

  var list = Array.isArray(CONFIG.music.list) && CONFIG.music.list.length
    ? CONFIG.music.list.slice()
    : [ CONFIG.music.src || (audio.getAttribute('src') || '/sound/loadscreen/music.ogg') ];

  var idx = 0;
  function load(i){
    var src = list[i % list.length];
    audio.pause();
    audio.removeAttribute('type');
    audio.removeAttribute('src');
    audio.load();
    audio.setAttribute('src', src);
    audio.load();
    console.log('[LS] Audio src →', src, ' / abs:', audio.src);
  }
  function startFrom(i){
    idx = (i % list.length + list.length) % list.length;
    load(idx);
    audio.muted = false;
    audio.volume = (CONFIG.music.volume != null) ? CONFIG.music.volume : 0.65;
    audio.loop = false;
    var p = audio.play();
    if (p && p.catch) p.catch(()=>{});
  }
  audio.addEventListener('ended', function(){ idx = (idx + 1) % list.length; startFrom(idx); });
  audio.addEventListener('error', function(){
    idx = (idx + 1) % list.length;
    load(idx);
  });

  startFrom(0);
  (audio.play() || Promise.reject()).then(()=>{ audio.muted = false; })
    .catch(()=>{ function kick(){ startFrom(idx); window.removeEventListener('pointerdown', kick); window.removeEventListener('keydown', kick); }
                 window.addEventListener('pointerdown', kick, {once:true});
                 window.addEventListener('keydown',     kick, {once:true}); });

  if (muteBtn){
    muteBtn.addEventListener('click', function(){
      if (audio.paused) {
        var target = (CONFIG.music.volume != null) ? CONFIG.music.volume : 0.65;
        audio.volume = 0.0;
        var p = audio.play(); if (p && p.catch) p.catch(()=>{});
        var t = setInterval(function(){
          audio.volume = Math.min(target, audio.volume + (target/12));
          if (audio.volume >= target) clearInterval(t);
        }, 100);
        muteBtn.textContent = '🔊 Música';
      } else {
        var t2 = setInterval(function(){
          audio.volume = Math.max(0, audio.volume - 1/12);
          if (audio.volume <= 0) { clearInterval(t2); audio.pause(); }
        }, 100);
        muteBtn.textContent = '🔈 Música';
      }
    });
  }
})();

/* ---------------------- AVATAR DE STEAM (ARREGLADO) ---------------------- */
/* Estrategia:
   1) Si Lua manda onAvatar(url) → usarlo con cache-bust (se ve siempre).
   2) Si todavía no llegó, mostrar inmediatamente un placeholder local
      (/materials/loadscreen/avatar.png) si existe.
   3) Si tampoco existe, generar una inicial con canvas (color acento).
*/

// intenta mostrar un placeholder local (si existe)
function tryLocalAvatarPlaceholder(imgEl, done){
  var candidates = [
    '/materials/loadscreen/avatar.png',
    '/materials/loadscreen/avatar.jpg',
    'img/avatar.png',
    'img/avatar.jpg'
  ];
  var i = 0;
  function tryNext(){
    if (i >= candidates.length){ if (done) done(false); return; }
    var url = candidates[i++];
    var test = new Image();
    test.onload = function(){
      imgEl.src = url + (url.indexOf('?') === -1 ? '?v=' : '&v=') + Date.now();
      if (done) done(true);
    };
    test.onerror = function(){ tryNext(); };
    test.src = url;
  }
  tryNext();
}

// genera un avatar con la inicial del nick
function paintInitialAvatar(imgEl, letter){
  var cvs = document.createElement('canvas'); cvs.width = cvs.height = 128;
  var ctx = cvs.getContext('2d');
  ctx.fillStyle = 'rgba(20,28,38,1)'; ctx.fillRect(0,0,128,128);
  var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent');
  ctx.fillStyle = accent && accent.trim ? accent.trim() : CONFIG.accent;
  ctx.beginPath(); ctx.arc(64,64,54,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 64px MontserratX, Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(letter, 64, 70);
  imgEl.src = cvs.toDataURL('image/png');
}

function ensureAvatarVisible(nick){
  var aimg = document.getElementById('avatar');
  if (!aimg) return;
  // si ya hay uno externo aplicado, no tocamos
  if (aimg.getAttribute('data-external') === '1') return;
  if (aimg.src && aimg.src.startsWith('data:')) return;

  // 1) probar placeholder local → si no hay, 2) dibujar inicial
  tryLocalAvatarPlaceholder(aimg, function(ok){
    if (!ok) {
      var letter = (nick||'J').charAt(0).toUpperCase();
      paintInitialAvatar(aimg, letter);
    }
  });
}

// ===== GMOD bridge =====
window.onGMOD = function(data){
  _applyTitle(data && data.hostname);

  var sub = document.getElementById('subtitle');
  if (sub) sub.textContent = 'Gamemode: ' + ((data && data.gm) || '—');

  var nick = (data && data.nick) || 'Jugador';
  var sid  = (data && data.sid) || '—';
  var map  = (data && data.map) || '—';
  var job  = (data && data.job) || '—';
  var money= (data && data.money);

  var nickEl=document.getElementById('pc-nick'); if(nickEl) nickEl.textContent = nick;
  var sidEl =document.getElementById('pc-sid');  if(sidEl)  sidEl.textContent  = sid;
  var mapEl =document.getElementById('st-map');  if(mapEl)  mapEl.textContent  = map;
  var jobEl =document.getElementById('st-rank'); if(jobEl)  jobEl.textContent  = job;
  var monEl =document.getElementById('st-money');if(monEl)  monEl.textContent  = safeMoney(money);

  // Garantizar que haya algo visible ya mismo
  ensureAvatarVisible(nick);
};

// Tick (solo sesión)
window.onGMODTick = function(data){
  var t = Math.max(0, Number((data && data.session) || 0));
  var h = Math.floor(t/3600), m = Math.floor((t%3600)/60);
  var timeEl=document.getElementById('st-time'); if(timeEl) timeEl.textContent = h + ' hs y ' + m + ' m';
};

// Avatar desde Lua (definitivo)
window.onAvatar = function(url){
  try{
    var img = document.getElementById('avatar');
    if (!img || !url) return;
    var bust = (url.indexOf('?') === -1) ? (url + '?v=' + Date.now()) : (url + '&v=' + Date.now());
    img.crossOrigin = 'anonymous';
    img.src = bust;
    img.setAttribute('data-external','1');
  }catch(e){ console.warn('[LS] onAvatar error:', e && e.message); }
};

// FX partículas (sutil)
(function(){
  var canvas = document.getElementById('fx');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);

  var N = 60, parts = [];
  for (var i=0; i<N; i++){
    parts.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, r: 1+Math.random()*2, a: .28+Math.random()*.25, vx: -0.12+Math.random()*0.24, vy: -0.12+Math.random()*0.24 });
  }
  function step(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (var i=0;i<parts.length;i++){
      var p=parts[i]; p.x+=p.vx; p.y+=p.vy;
      if (p.x < -12) p.x = canvas.width+12;
      if (p.x > canvas.width+12) p.x = -12;
      if (p.y < -12) p.y = canvas.height+12;
      if (p.y > canvas.height+12) p.y = -12;
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*8);
      g.addColorStop(0, 'rgba(57,180,255,'+p.a+')'); g.addColorStop(1, 'rgba(57,180,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r*8, 0, Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(step);
  }
  step();
})();
