(() => {
  const canvas = document.getElementById('overlay');
  const ctx    = canvas.getContext('2d');

  const W = window.innerWidth;
  const H = window.innerHeight;

  canvas.width  = W;
  canvas.height = H;

  // Each circle must grow from near-center to the farthest screen corner.
  const MAX_R    = Math.ceil(Math.sqrt(W * W + H * H));
  const DURATION = 50000; // ms for each circle to reach full size

  // Five circles clustered around the viewport center with small offsets.
  // Staggered delays produce the cascading burst effect.
  const cx = W / 2;
  const cy = H / 2;
  const circles = [
    { x: cx - 0.05 * W, y: cy - 0.07 * H, delay: 0   },
    { x: cx + 0.07 * W, y: cy - 0.04 * H, delay: 130 },
    { x: cx + 0.01 * W, y: cy + 0.06 * H, delay: 250 },
    { x: cx - 0.08 * W, y: cy + 0.05 * H, delay: 370 },
    { x: cx + 0.06 * W, y: cy + 0.09 * H, delay: 490 },
  ];

  const radii = circles.map(() => 0);

  // Fast start, gentle finish — gives the reveal a punchy, modern feel
  function easeOutExpo(t) {
    return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  const startTime = performance.now();

  function tick(now) {
    let allDone = true;

    for (let i = 0; i < circles.length; i++) {
      const elapsed = now - startTime - circles[i].delay;
      if (elapsed <= 0) { allDone = false; continue; }

      const t  = Math.min(elapsed / DURATION, 1);
      radii[i] = easeOutExpo(t) * MAX_R;
      if (t < 1) allDone = false;
    }

    // Fill canvas black, then erase circles with destination-out.
    // Overlapping circles naturally union — erased pixels stay erased.
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < circles.length; i++) {
      if (radii[i] <= 0) continue;
      ctx.beginPath();
      ctx.arc(circles[i].x, circles[i].y, radii[i], 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    if (allDone) {
      canvas.classList.add('done');
      canvas.addEventListener('transitionend', () => canvas.remove(), { once: true });
    } else {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
})();
