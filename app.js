// ---- SINGLETON GUARD (evita doble init si se incluye 2 veces por error) ----
if (window.__LS_INIT__) {
  console.warn('[LS] app.js ya estaba inicializado; ignoro este segundo include.');
}
window.__LS_INIT__ = true;

// ===== Versión =====
var APP_VERSION = 13.9;
console.log('[LS] app.js cargado v' + APP_VERSION);

// ===== Helpers cache-busting y normalización Imgur =====
function withBust(url){
  if (!/^https?:/i.test(url)) return url;
  return url + (url.includes('?') ? '&' : '?') + 'v=' + Date.now();
}
function fixImgur(url){
  try{
    if (typeof url !== 'string') return url;
    if (!url.startsWith('http')) return url;
    var u = new URL(url);
    if (u.hostname === 'imgur.com') {
      u.hostname = 'i.imgur.com';
      if (!/\.(jpg|jpeg|png|webp|gif)$/i.test(u.pathname)) {
        u.pathname = u.pathname.replace(/\/?$/, '.jpg');
      }
      return u.toString();
    }
    return url;
  }catch(_){ return url; }
}

// ===== Detección de entorno =====
const WEB = !window.gmod; // true en sv_loadingurl/Pages

// ===== CONFIG ÚNICO =====
var CONFIG = {
  accent: '#39b4ff',
  accent2: '#9ee8ff',
  forceTitle: "Quantum Pulse",

  slides: [
    [ withBust(fixImgur('https://imgur.com/u0sY7Kw.jpg')), 'asset://garrysmod/materials/loadscreen/bg9.jpg'  ],
    [ withBust(fixImgur('https://imgur.com/mxKjk67.jpg')), 'asset://garrysmod/materials/loadscreen/bg10.jpg' ],
    [ withBust(fixImgur('https://imgur.com/UXUWJEf.jpg')), 'asset://garrysmod/materials/loadscreen/bg11.jpg' ],
    [ withBust(fixImgur('https://imgur.com/XqGC5S3.jpg')), 'asset://garrysmod/materials/loadscreen/bg12.jpg' ],
    [ withBust(fixImgur('https://imgur.com/2W4STLA.jpg')), 'asset://garrysmod/materials/loadscreen/bg13.jpg' ],
    [ withBust(fixImgur('https://imgur.com/9rfDLhM.jpg')), 'asset://garrysmod/materials/loadscreen/bg1.jpg'  ],
    [ withBust(fixImgur('https://imgur.com/en0VJuK.jpg')), 'asset://garrysmod/materials/loadscreen/bg2.jpg'  ],
    [ withBust(fixImgur('https://imgur.com/Nq8cPAb.jpg')), 'asset://garrysmod/materials/loadscreen/bg3.jpg'  ],
    [ withBust(fixImgur('https://imgur.com/inLLgan.jpg')), 'asset://garrysmod/materials/loadscreen/bg4.jpg'  ],
    [ withBust(fixImgur('https://imgur.com/MlbbVX0.jpg')), 'asset://garrysmod/materials/loadscreen/bg5.jpg'  ],
    [ withBust(fixImgur('https://imgur.com/j0PwnEn.jpg')), 'asset://garrysmod/materials/loadscreen/bg6.jpg'  ],
    [ withBust(fixImgur('https://imgur.com/KZU3bUJ.jpg')), 'asset://garrysmod/materials/loadscreen/bg7.jpg'  ],
    [ withBust(fixImgur('https://imgur.com/Q9bBCcd.jpg')), 'asset://garrysmod/materials/loadscreen/bg8.jpg'  ],
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

  // 🎵 Música: WEB usa .ogg y .mp3; GMod usa .wav
const WEB = !window.gmod;

// 🎵 Playlist (loop)
music: {
  enabled: true,
  // En web: servir desde tu host (OGG/MP3). En GMod: usar WAV locales vía asset://
  list: WEB
    ? ['/sound/loadscreen/music.ogg', '/sound/loadscreen/music.mp3']
    : ['asset://garrysmod/sound/loadscreen/music.wav',
       'asset://garrysmod/sound/loadscreen/tema2.wav'],
  src: WEB ? '/sound/loadscreen/music.ogg'
           : 'asset://garrysmod/sound/loadscreen/music.wav',
  volume: 0.65
}

// ===== CSS vars =====
var root = document.documentElement;
root.style.setProperty('--accent', CONFIG.accent);
root.style.setProperty('--accent2', CONFIG.accent2);
root.style.setProperty('--fade', CONFIG.fadeMs + 'ms');

// ===== Helpers =====
function safeMoney(n){
  var v = isFinite(Number(n)) ? Number(n) : 0;
  try { return new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', minimumFractionDigits:0 }).format(v); }
  catch(e){ return '$ ' + Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
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
    var url = fixImgur(candidates[i++]);
    var test = new Image();
    test.onload = function(){
      console.log('[LS] OK img', url, test.width + 'x' + test.height);
      el.style.backgroundImage = 'url("' + url + '")';
    };
    test.onerror = function(){
      console.warn('[LS] FAIL img', url, '→ siguiente…');
      tryNext();
    };
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
function nextSlide(){
  if (!els.length) return;
  if (els[slideIdx]) els[slideIdx].classList.remove('active');
  slideIdx = (slideIdx + 1) % els.length;
  if (els[slideIdx]) els[slideIdx].classList.add('active');
}
setInterval(nextSlide, CONFIG.holdMs);

// ===== PROGRESS =====
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

// ===== Tips (render + rotación) =====
var tipsEl=document.getElementById('tips');
if (tipsEl){
  var items=[];
  for(i=0;i<CONFIG.tips.length;i++){
    var b=document.createElement('div');
    b.className='tip';
    b.textContent=CONFIG.tips[i];
    tipsEl.appendChild(b);
    items.push(b);
  }
  if (items.length){
    var ti=0;
    items[0].classList.add('is-show');
    setInterval(function(){
      items[ti].classList.remove('is-show');
      ti=(ti+1)%items.length;
      items[ti].classList.add('is-show');
    }, 6000);
  }
}

// ===== Logo robusto =====
;(function setLogo(){
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
      var bust = url + (url.indexOf('?') === -1 ? '?v=' : '&v=') + Date.now();
      el.src = bust;
    };
    test.onerror = tryNext;
    test.src = url;
  }
  tryNext();
})();

// ===== Título =====
function _applyTitle(srcHostname){
  var h1 = document.getElementById('title');
  var hasForce = (CONFIG.forceTitle !== null && CONFIG.forceTitle !== undefined);
  var title = hasForce ? String(CONFIG.forceTitle)
                       : (srcHostname || (h1 && h1.textContent) || 'QUANTUM PULSE');
  if (h1) h1.textContent = title;
  document.title = title + ' — Pantalla de Carga';
}
_applyTitle();
document.documentElement.classList.add('is-ready');

// ===== AUDIO =====
var muteBtn = document.getElementById('mute');
var audio = document.getElementById('bgm');

(function setupAudio(){
  if (!CONFIG.music.enabled){ if (muteBtn) muteBtn.style.display='none'; return; }
  if (!audio){ console.error('[LS] Falta <audio id="bgm">'); if (muteBtn) muteBtn.style.display='none'; return; }

  // pistas
  var list = Array.isArray(CONFIG.music.list) && CONFIG.music.list.length
    ? CONFIG.music.list.slice()
    : [ CONFIG.music.src || (WEB ? '/sound/loadscreen/music.ogg' : 'asset://garrysmod/sound/loadscreen/music.wav') ];

  // atributos que ayudan en móviles/navegadores
  audio.autoplay = true;
  audio.playsInline = true;
  audio.preload = 'auto';

  function setTypeByExt(src){
    var t = '';
    if (/\.ogg(\?|$)/i.test(src)) t = 'audio/ogg';
    else if (/\.mp3(\?|$)/i.test(src)) t = 'audio/mpeg';
    else if (/\.wav(\?|$)/i.test(src)) t = 'audio/wav';
    if (t) { audio.setAttribute('type', t); } else { audio.removeAttribute('type'); }
  }

  var idx = 0;

  function load(i){
    var src = list[i % list.length];
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    setTypeByExt(src);
    audio.setAttribute('src', src);
    audio.load();
    console.log('[LS] Audio src →', src, '| type=', audio.getAttribute('type') || '(auto)');
  }

  function startFrom(i){
    idx = (i % list.length + list.length) % list.length;
    load(idx);
    audio.muted = false;
    audio.volume = (CONFIG.music.volume != null) ? CONFIG.music.volume : 0.65;
    audio.loop = false; // queremos ended → siguiente pista
    var p = audio.play();
    if (p && p.catch) p.catch(()=>{});
  }

  function showGate(){
    if (document.getElementById('audio-gate')) return;
    var gate = document.createElement('div');
    gate.id = 'audio-gate';
    gate.className = 'audio-gate';
    gate.innerHTML = '<div class="gate-card"><div class="gate-title">Activar música</div><div class="gate-sub">Tu navegador bloqueó el autoplay. Tocá el botón para habilitar el audio.</div><button id="gate-btn" class="btn gate-btn">Reproducir</button></div>';
    document.body.appendChild(gate);
    var btn = gate.querySelector('#gate-btn');
    btn.addEventListener('click', function(){
      startFrom(idx);
      setTimeout(function(){ gate.remove(); }, 50);
    });
  }

  function hideGate(){
    var g = document.getElementById('audio-gate');
    if (g) g.remove();
  }

  audio.addEventListener('ended', function(){
    idx = (idx + 1) % list.length;
    startFrom(idx);
  });

  audio.addEventListener('error', function(){
    console.warn('[LS] Audio error en', audio.currentSrc || '(sin src)', '→ intento siguiente');
    idx = (idx + 1) % list.length;
    load(idx);
  });

  // primer intento
  startFrom(0);

  // manejo del bloqueo de autoplay
  (audio.play() || Promise.reject()).then(()=>{
    audio.muted = false;
    hideGate();
    console.log('[LS] Autoplay OK');
  }).catch(()=>{
    console.warn('[LS] Autoplay bloqueado — se mostrará gate');
    showGate();
    function kick(){ startFrom(idx); window.removeEventListener('pointerdown', kick); window.removeEventListener('keydown', kick); hideGate(); }
    window.addEventListener('pointerdown', kick, {once:true});
    window.addEventListener('keydown',     kick, {once:true});
  });

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

  // Avatar fallback
  var aimg = document.getElementById('avatar');
  if (aimg && (!aimg.getAttribute('data-external') || !aimg.src)){
    var letter = nick.charAt(0).toUpperCase();
    var cvs = document.createElement('canvas'); cvs.width = cvs.height = 128;
    var ctx = cvs.getContext('2d');
    ctx.fillStyle = 'rgba(20,28,38,1)'; ctx.fillRect(0,0,128,128);
    var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent');
    ctx.fillStyle = accent && accent.trim ? accent.trim() : CONFIG.accent;
    ctx.beginPath(); ctx.arc(64,64,54,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 64px MontserratX, Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(letter, 64, 70);
    aimg.src = cvs.toDataURL('image/png');
  }
};

window.onGMODTick = function(data){
  var t = Math.max(0, Number((data && data.session) || 0));
  var h = Math.floor(t/3600), m = Math.floor((t%3600)/60);
  var timeEl=document.getElementById('st-time'); if(timeEl) timeEl.textContent = h + ' hs y ' + m + ' m';
};

// ===== Avatar Steam =====
window.onAvatar = function(url){
  try{
    var img = document.getElementById('avatar');
    if (!img) return;
    var bust = (url.indexOf('?') === -1) ? (url + '?v=' + Date.now()) : (url + '&v=' + Date.now());
    img.crossOrigin = 'anonymous';
    img.src = bust;
    img.setAttribute('data-external','1');
  }catch(e){ console.warn('[LS] onAvatar error:', e && e.message); }
};

// ===== FX =====
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
      var p=parts[i];
      p.x+=p.vx; p.y+=p.vy;
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

// --- Debug: tecla N para siguiente slide ---
window.addEventListener('keydown', function(ev){
  if (ev.key && ev.key.toLowerCase() === 'n' && typeof nextSlide === 'function') nextSlide();
});

// === Playtime total (persistente) ===
window.__QP_BASE_TOTAL__ = 0;
window.onPlaytime = function(totalSeconds) {
  try {
    if (isFinite(totalSeconds)) {
      window.__QP_BASE_TOTAL__ = Math.max(0, Number(totalSeconds) || 0);
      if (typeof window.__QP_SESSION_SEC__ === 'number') {
        updateTimeStat(window.__QP_BASE_TOTAL__ + window.__QP_SESSION_SEC__);
      } else {
        updateTimeStat(window.__QP_BASE_TOTAL__);
      }
    }
  } catch (e) { console.warn('[LS] onPlaytime error:', e && e.message); }
};

function updateTimeStat(totalSec) {
  var h = Math.floor(totalSec/3600), m = Math.floor((totalSec%3600)/60);
  var timeEl = document.getElementById('st-time');
  if (timeEl) timeEl.textContent = h + ' hs y ' + m + ' m';
}

window.onGMODTick = function (data) {
  var t = Math.max(0, Number((data && data.session) || 0));
  window.__QP_SESSION_SEC__ = t;
  updateTimeStat((window.__QP_BASE_TOTAL__ || 0) + t);
};

