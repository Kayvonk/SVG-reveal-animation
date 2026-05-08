const overlay = document.getElementById('overlay');
const circle  = document.getElementById('rc0');


circle.addEventListener('animationend', () => {
  overlay.style.opacity = '0';
  overlay.remove();
});
