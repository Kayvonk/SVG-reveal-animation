(() => {
  const overlay    = document.getElementById('overlay');
  const revealBg   = document.getElementById('reveal-bg');
  const svgCircles = [0, 1, 2, 3, 4].map(i => document.getElementById(`rc${i}`));

  const W = window.innerWidth;
  const H = window.innerHeight;

  const MAX_R    = Math.ceil(Math.sqrt(W * W + H * H));
  const DURATION = 50000;

  const cx = W / 2;
  const cy = H / 2;
  const circles = [
    { x: cx - 0.05 * W, y: cy - 0.07 * H, delay: 0   },
    { x: cx + 0.07 * W, y: cy - 0.04 * H, delay: 130 },
    { x: cx + 0.01 * W, y: cy + 0.06 * H, delay: 250 },
    { x: cx - 0.08 * W, y: cy + 0.05 * H, delay: 370 },
    { x: cx + 0.06 * W, y: cy + 0.09 * H, delay: 490 },
  ];

  revealBg.setAttribute('width', W);
  revealBg.setAttribute('height', H);

  circles.forEach((c, i) => {
    svgCircles[i].setAttribute('cx', c.x);
    svgCircles[i].setAttribute('cy', c.y);
    svgCircles[i].setAttribute('r', 0);
  });

  function easeOutExpo(t) {
    return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  const startTime = performance.now();

  function tick(now) {
    let allDone = true;

    for (let i = 0; i < circles.length; i++) {
      const elapsed = now - startTime - circles[i].delay;
      if (elapsed <= 0) { allDone = false; continue; }

      const t = Math.min(elapsed / DURATION, 1);
      svgCircles[i].setAttribute('r', easeOutExpo(t) * MAX_R);
      if (t < 1) allDone = false;
    }

    if (allDone) {
      overlay.classList.add('done');
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    } else {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
})();
