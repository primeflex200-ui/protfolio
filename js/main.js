// main.js — GSAP timeline + IntersectionObserver reveals
// Use only opacity and transform for animations (GPU friendly)

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  // HERO TIMELINE
  const tl = gsap.timeline({defaults:{ease:'power3.out'}});

  // overlay fade in
  tl.to('.overlay', {duration:0.8, opacity:1});

  // staggered reveal of hero elements (y = 15 -> 0)
  tl.from('.hero-name', {duration:0.8, y:15, opacity:0}, '-=0.3');
  tl.from('.hero-role', {duration:0.7, y:12, opacity:0}, '-=0.55');
  tl.from('.hero-statement', {duration:0.8, y:12, opacity:0}, '-=0.55');
  tl.from('.hero-support', {duration:0.7, y:10, opacity:0}, '-=0.55');

  // CTAs: fade+scale from 0.95
  tl.from('.hero-ctas .btn', {duration:0.7, opacity:0, scale:0.95, stagger:0.08}, '-=0.4');

  // IntersectionObserver for sections (About, Skills, Projects, Experience, Contact)
  const reveals = document.querySelectorAll('.reveal');
  const obsOptions = {root:null,rootMargin:'0px 0px -80px 0px',threshold:0.12};

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        // add active class for CSS transition
        entry.target.classList.add('active');

        // small GSAP nudge for better control (opacity & y)
        gsap.fromTo(entry.target, {y:18, opacity:0}, {duration:0.7, y:0, opacity:1, ease:'power3.out'});

        obs.unobserve(entry.target);
      }
    });
  }, obsOptions);

  reveals.forEach(r => observer.observe(r));

  // Improve perceived performance for video: if video fails, keep overlay visible
  // If a video exists keep old behavior; otherwise proceed with canvas background
  const video = document.querySelector('.hero-video');
  if(video){
    video.addEventListener('error', () => {
      gsap.to('.overlay', {duration:0.4, opacity:1});
    });
  }

  // --- Canvas Beams Background (vanilla, GPU-friendly) ---
  const canvas = document.getElementById('beams-canvas');
  if(canvas) {
    const ctx = canvas.getContext('2d');
    let W = 0; let H = 0; let rafId = null;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.width = Math.floor(canvas.clientWidth * dpr);
      H = canvas.height = Math.floor(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // beam objects
    const beams = [];
    const BEAM_COUNT = 14;

    function initBeams() {
      beams.length = 0;
      const colors = [
        {r:138, g:43, b:226},   // blue-violet
        {r:75, g:0, b:130},     // indigo
        {r:230, g:57, b:70},    // red (brand color)
        {r:255, g:20, b:147},   // deep pink
        {r:0, g:191, b:255},    // deep sky blue
        {r:148, g:0, b:211},    // dark violet
        {r:255, g:105, b:180}   // hot pink
      ];
      for(let i=0;i<BEAM_COUNT;i++){
        const bw = 2 + Math.random() * 6; // visual width
        const bh = 120 + Math.random() * 420; // height
        const color = colors[Math.floor(Math.random() * colors.length)];
        beams.push({
          x: Math.random(),
          y: Math.random(),
          width: bw,
          height: bh,
          speed: 0.02 + Math.random()*0.06,
          color: color,
          alpha: 0.15 + Math.random()*0.35,
          skew: -0.12 + Math.random()*0.24
        });
      }
    }

    function draw(delta) {
      // fade background slightly to create trailing glow
      ctx.clearRect(0,0,canvas.width,canvas.height);
      // subtle vignette background with purple tint (keeps text readable)
      ctx.fillStyle = 'rgba(5,0,15,0.4)';
      ctx.fillRect(0,0,canvas.clientWidth, canvas.clientHeight);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      for(const b of beams){
        b.x += b.speed * delta * 0.06;
        if(b.x > 1.6) b.x = -0.6 - Math.random()*0.2;

        // compute actual coords
        const cx = (b.x * (canvas.clientWidth + b.width*60)) - b.width*30;
        const cy = canvas.clientHeight * (0.45 + (b.y - 0.5) * 0.15);

        // create gradient for beam soft edges with vibrant colors
        const g = ctx.createLinearGradient(cx, cy - b.height/2, cx + b.skew * b.height, cy + b.height/2);
        const {r, g:green, b:blue} = b.color;
        g.addColorStop(0, `rgba(${r},${green},${blue},${b.alpha * 0.0})`);
        g.addColorStop(0.35, `rgba(${r},${green},${blue},${b.alpha * 0.6})`);
        g.addColorStop(0.5, `rgba(${r},${green},${blue},${b.alpha})`);
        g.addColorStop(0.65, `rgba(${r},${green},${blue},${b.alpha * 0.6})`);
        g.addColorStop(1, `rgba(${r},${green},${blue},${b.alpha * 0.0})`);

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(cx, cy, b.width*12, b.height/2, b.skew, 0, Math.PI*2);
        ctx.fill();
      }

      ctx.restore();
    }

    let last = performance.now();
    function loop(now){
      const delta = now - last;
      last = now;
      draw(delta);
      rafId = requestAnimationFrame(loop);
    }

    // init/responsive
    function start(){
      resize();
      initBeams();
      last = performance.now();
      if(rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(loop);
    }

    window.addEventListener('resize', () => {
      // debounce resize
      clearTimeout(canvas._rs);
      canvas._rs = setTimeout(() => { resize(); }, 120);
    });

    // start after small delay so layout is ready
    setTimeout(start, 120);
  }

  // Small accessible enhancement: keyboard focus visible on first tab
  let userTabbing = false;
  window.addEventListener('keydown', (e) => {
    if(e.key === 'Tab'){
      userTabbing = true;document.body.classList.add('user-tabbing');
    }
  });
});
