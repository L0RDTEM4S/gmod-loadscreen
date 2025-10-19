// ---- SINGLETON GUARD (evita doble init si se incluye 2 veces por error) ----
if (window.__LS_INIT__) {
  console.warn('[LS] app.js ya estaba inicializado; ignoro este segundo include.');
}
window.__LS_INIT__ = true;

// ===== Versión =====
var APP_VERSION = 13.6;
console.log('[LS] app.js cargado v' + APP_VERSION);

// ===== Helper cache-busting para imágenes remotas =====
function withBust(url){
  if (!/^https?:/i.test(url)) return url;
  return url + (url.includes('?') ? '&' : '?') + 'v=' + Date.now();
}

// ===== CONFIG ÚNICO (no dupliques este bloque) =====
var CONFIG = {
  accent: '#39b4ff',
  accent2: '#9ee8ff',

  // Título del servidor (fijo)
  forceTitle: "Quantum Pulse",

  // Fondos (ej.: 2 Imgur + fallback local)
  slides: [
    [ withBust('https://imgur.com/l0cwEYM.jpg'), 'asset://garrysmod/materials/loadscreen/bg1.jpg' ],
    [ withBust('https://imgur.com/K4RpwBm.jpg'), 'asset://garrysmod/materials/loadscreen/bg2.jpg' ],
    [ withBust('https://imgur.com/GJKhdJk.jpg'), '' ],
    // [ 'asset://garrysmod/materials/loadscreen/bg3.jpg' ],
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
      // 'asset://garrysmod/sound/loadscreen/tema3.wav'
    ],
    src: 'asset://garrysmod/sound/loadscreen/music.wav',
    volume: 0.65
  }
};

// ===== CSS variables =====
var root = document.documentElement;
root.style.setProperty('--accent', CONFIG.accent);
root.style.setProperty('--accent2', CONFIG.accent2);
root.style.setProperty('--fade', CONFIG.fadeMs + 'ms');

// ===== Helpers =====
function tryPlay(audio){
  var p; try { p = audio.play(); } catch(e){ return Promise.reject(e); }
  if (p && typeof p.then === 'function') return p;
  return Promise.resolve();
}
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
function nextSlide(){
  if (!els.length) return;
  if (els[slideIdx]) els[slideIdx].classList.remove('active');
  slideIdx = (slideIdx + 1) % els.length;
  if (els[slideIdx]) els[slideIdx].classList.add('active');
}
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
(function setLogo(){
  var el = document.getElementById('logo');
  if (!el) return;
  var candidates = [
    // 👇 Añadido para entorno web (repo estático)
    '/materials/loadscreen/logo.png',
    '/materials/loadscreen/logo.jpg',

    // Rutas GMod + fallbacks que ya tenías
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
      console.log('[LS] OK logo', url, test.width + 'x' + test.height);
    };
    test.onerror = function(){
      console.warn('[LS] FAIL logo', url, '→ siguiente…');
      tryNext();
    };
    console.log('[LS] TRY logo', url);
    test.src = url;
  }
  tryNext();
})();

// ===== Helper central de Título =====
function _applyTitle(srcHostname){
  var h1 = document.getElementById('title');
  var hasForce = (CONFIG.forceTitle !== null && CONFIG.forceTitle !== undefined);
  var title = hasForce ? String(CONFIG.forceTitle)
                       : (srcHostname || (h1 && h1.textContent) || 'QUANTUM PULSE');
  if (h1) h1.textContent = title;
  document.title = title + ' — Pantalla de Carga';
  console.log('[LS] Título aplicado →', title, '| forceTitle =', hasForce ? JSON.stringify(CONFIG.forceTitle) : '(null)');
}
// Aplicar al cargar (estado base)
_applyTitle();
// Hacer que todo entre con fade una vez listo el DOM
document.documentElement.classList.add('is-ready');

// ===== Música (WAV robusto con PLAYLIST) =====
var muteBtn = document.getElementById('mute');
var audio = document.getElementById('bgm');

(function setupAudio(){
  if (!CONFIG.music.enabled){ if (muteBtn) muteBtn.style.display='none'; return; }
  if (!audio){ console.error('[LS] Falta <audio id="bgm">'); if (muteBtn) muteBtn.style.display='none'; return; }

  // --- Fuentes: usa list si existe; si no, cae a src ---
  var list = Array.isArray(CONFIG.music.list) && CONFIG.music.list.length
    ? CONFIG.music.list.slice()
    : [ CONFIG.music.src || (audio.getAttribute('src') || 'asset://garrysmod/sound/loadscreen/music.wav') ];

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
    audio.loop = false; // para que haga "ended" y pase al siguiente
    var p = audio.play();
    if (p && p.catch) p.catch(()=>{ /* autoplay bloqueado; se maneja abajo */ });
  }

  // Logs útiles
  audio.addEventListener('loadedmetadata', function(){ console.log('[LS] loadedmetadata OK. duration=', audio.duration); });
  audio.addEventListener('canplaythrough', function(){ console.log('[LS] canplaythrough'); });
  audio.addEventListener('error', function(){
    var e=audio.error, map={1:'ABORTED',2:'NETWORK',3:'DECODE',4:'SRC_NOT_SUPPORTED'};
    console.error('[LS] AUDIO ERROR code', e?e.code:'n/a', e?(map[e.code]||'UNKNOWN'):'UNKNOWN', '→', audio.currentSrc || '(sin src)');
    // Si falla esta pista, intento siguiente
    idx = (idx + 1) % list.length;
    load(idx);
  });

  // Al terminar una pista, pasa a la siguiente
  audio.addEventListener('ended', function(){
    idx = (idx + 1) % list.length;
    startFrom(idx);
  });

  // Intento autoplay; si se bloquea, arranca al clic/tecla
  startFrom(0);
  (audio.play() || Promise.reject()).then(()=>{
    audio.muted = false;
    console.log('[LS] Autoplay OK (playlist)');
  }).catch(()=>{
    console.warn('[LS] Autoplay bloqueado — clic/tecla para iniciar playlist');
    function kick(){ startFrom(idx); window.removeEventListener('pointerdown', kick); window.removeEventListener('keydown', kick); }
    window.addEventListener('pointerdown', kick, {once:true});
    window.addEventListener('keydown',     kick, {once:true});
  });

  // Botón Mute/Play
  if (muteBtn){
    muteBtn.addEventListener('click', function(){
      if (audio.paused) {
        var target = (CONFIG.music.volume != null) ? CONFIG.music.volume : 0.65;
        audio.volume = 0.0;
        var p = audio.play();
        if (p && p.catch) p.catch(()=>{});
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
  // Título (usa forceTitle si está)
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

  // Avatar fallback (inicial) si no llega onAvatar
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

// ===== Avatar de Steam (desde Lua) =====
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

// ===== FX partículas (sutil y en movimiento) =====
(function(){
  var canvas = document.getElementById('fx');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  var N = 60;
  var parts = [];
  for (var i=0; i<N; i++){
    parts.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      r: 1.0 + Math.random()*2.0,
      a: 0.28 + Math.random()*0.25,
      vx: (-0.12 + Math.random()*0.24),
      vy: (-0.12 + Math.random()*0.24)
    });
  }

  function step(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (var i=0;i<parts.length;i++){
      var p=parts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < -12) p.x = canvas.width+12;
      if (p.x > canvas.width+12) p.x = -12;
      if (p.y < -12) p.y = canvas.height+12;
      if (p.y > canvas.height+12) p.y = -12;

      var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*8);
      grad.addColorStop(0, 'rgba(57,180,255,'+p.a+')');
      grad.addColorStop(1, 'rgba(57,180,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r*8, 0, Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(step);
  }
  step();
})();

// --- Debug: tecla N para siguiente slide (podés borrar si no lo usás) ---
window.addEventListener('keydown', function(ev){
  if (ev.key && ev.key.toLowerCase() === 'n' && typeof nextSlide === 'function') nextSlide();
});

// === Playtime total (persistente) que manda el servidor ===
window.__QP_BASE_TOTAL__ = 0; // segundos persistentes (PData) enviados por sv_playtime.lua

// Server → JS: total persistente (en segundos). Lo guarda y refresca el stat.
window.onPlaytime = function(totalSeconds) {
  try {
    if (isFinite(totalSeconds)) {
      window.__QP_BASE_TOTAL__ = Math.max(0, Number(totalSeconds) || 0);
      // refresco inmediato del stat, sumando lo que ya llevamos de sesión si lo tenemos
      if (typeof window.__QP_SESSION_SEC__ === 'number') {
        updateTimeStat(window.__QP_BASE_TOTAL__ + window.__QP_SESSION_SEC__);
      } else {
        updateTimeStat(window.__QP_BASE_TOTAL__);
      }
    }
  } catch (e) { console.warn('[LS] onPlaytime error:', e && e.message); }
};

// Tu tick actual (sesión): guardamos la sesión en segundos y refrescamos con base+sesión
function updateTimeStat(totalSec) {
  var h = Math.floor(totalSec/3600), m = Math.floor((totalSec%3600)/60);
  var timeEl = document.getElementById('st-time');
  if (timeEl) timeEl.textContent = h + ' hs y ' + m + ' m';
}

// Si ya tenías window.onGMODTick, solo agrega estas 2 líneas:
window.onGMODTick = function (data) {
  var t = Math.max(0, Number((data && data.session) || 0)); // segundos de la sesión actual
  window.__QP_SESSION_SEC__ = t; // ← guardamos sesión
  updateTimeStat((window.__QP_BASE_TOTAL__ || 0) + t); // ← base persistente + sesión
};
