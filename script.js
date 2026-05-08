const overlay = document.getElementById('overlay');
const circle  = document.getElementById('rc0');

circle.setAttribute('cx', innerWidth / 2);
circle.setAttribute('cy', innerHeight / 2);
document.getElementById('reveal-bg').setAttribute('width', innerWidth);
document.getElementById('reveal-bg').setAttribute('height', innerHeight);

circle.addEventListener('animationend', () => {
  overlay.style.opacity = '0';
  overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
});
