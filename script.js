const overlay = document.getElementById('overlay');
const circle  = document.getElementById('rc0');


circle.addEventListener('animationend', () => {
  overlay.remove();
});
