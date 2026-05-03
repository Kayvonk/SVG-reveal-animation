# SVG Reveal Animation

A page reveal animation that uncovers content through expanding circular holes in a black overlay.

Deployed Link: https://kayvonk.github.io/SVG-reveal-animation/

---

## How It Looks

When the page loads, a solid black layer covers everything. Five circles — clustered near the center of the screen — begin to grow outward in quick succession, punching transparent holes through the black layer. As the holes grow and overlap, the black recedes naturally, revealing the page content underneath. Once the circles are large enough to cover the entire screen, the black overlay fades out and is removed from the page.

---

## File Overview

| File | Role |
|---|---|
| `index.html` | Page shell — content, the SVG overlay, and the mask definition |
| `style.css` | Positions the SVG overlay full-screen; defines the fade-out transition |
| `script.js` | Self-executing animation — owns the render loop, timing, easing, and cleanup |

---

## How the Animation Works

### The Black Layer

The overlay is an `<svg>` element stretched to cover the entire screen. Inside it sits a single black rectangle that fills the SVG from edge to edge:

```html
<svg id="overlay">
  ...
  <rect width="100%" height="100%" fill="black" mask="url(#reveal)"/>
</svg>
```

On its own, this rectangle would simply cover the entire page. What makes it behave like an overlay with holes is the `mask` attribute.

---

### What Is an SVG Mask?

An SVG mask is a hidden definition that tells the browser which parts of an element to show and which to hide. You can think of it like a stencil placed over the black rectangle:

- **White areas** in the mask = show that part of the element (the rectangle stays black)
- **Black areas** in the mask = hide that part of the element (the rectangle becomes transparent — a hole)

The mask used here starts as a solid white rectangle covering the entire screen, with five black circles on top of it:

```html
<mask id="reveal" maskUnits="userSpaceOnUse">
  <rect id="reveal-bg" fill="white"/>   <!-- show the overlay everywhere -->
  <circle id="rc0" fill="black"/>       <!-- punch a hole here -->
  <circle id="rc1" fill="black"/>
  ...
</mask>
```

At the start, all five circles have a radius of zero — they're invisible — so the mask is entirely white and the black overlay covers the whole page. As the circles grow, their black areas in the mask grow with them, making those regions of the overlay transparent. The page content underneath shows through the holes.

Where circles overlap, their holes simply merge. The browser handles this naturally — a transparent region is transparent, no matter how many circles contributed to it.

---

### No Per-Frame Drawing

Unlike a canvas-based approach, nothing is redrawn every frame. The browser keeps the SVG mask in memory and re-evaluates it automatically. The only thing JavaScript does each frame is update the `r` (radius) attribute on each circle:

```js
svgCircle.setAttribute('r', currentRadius);
```

That single attribute change is enough for the browser to recompose the entire effect on the GPU.

---

### Five Circles, Staggered in Time

Five circles are defined, all starting near the center of the screen with slight positional offsets. Each circle has a `delay` — a number of milliseconds to wait before it starts growing:

| Circle | Delay |
|---|---|
| 1 | 0 ms |
| 2 | 130 ms |
| 3 | 250 ms |
| 4 | 370 ms |
| 5 | 490 ms |

Every frame, each circle's current radius is calculated from how much time has passed since it started:

```js
elapsed = now - startTime - circle.delay
t       = clamp(elapsed / DURATION, 0, 1)
radius  = easeOutExpo(t) * MAX_R
```

`t` is a number between 0 and 1 representing how far through the animation the circle is (0 = just started, 1 = finished). The staggered delays mean the circles don't all start at once, creating a rapid cascading burst that gives the reveal a sense of momentum.

---

### Easing: `easeOutExpo`

```js
function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
```

Without easing, a circle growing at a constant speed would feel mechanical. This function takes the raw progress `t` (0 to 1) and curves it so that:

- **The circle starts fast** — it expands quickly in the first moments
- **Then slows down** — growth decelerates smoothly as it approaches full size

The result feels punchy and natural rather than robotic.

---

### Max Radius = Viewport Diagonal

```js
MAX_R = Math.ceil(Math.sqrt(W * W + H * H))
```

Each circle grows until its radius equals the diagonal length of the screen — the distance from one corner to the opposite corner. This is the longest possible distance from any point near the center to any edge of the screen. Using this as the maximum radius guarantees that every circle will fully cover every corner by the time the animation ends, regardless of where the circle's center sits.

---

## Completion Sequence

Once all five circles have reached their maximum size, the animation ends in two stages:

1. **Fade out** — the `.done` class is added to the SVG, which triggers a CSS `opacity: 0` transition over 2 seconds.
2. **Remove from the page** — once the fade finishes, the SVG element is deleted from the DOM entirely. An invisible element still occupies memory, so removing it keeps things clean.

---

## Key Design Decisions

| Decision | Reason |
|---|---|
| SVG `<mask>` instead of canvas | The browser composites the mask on the GPU — no per-frame redrawing in JavaScript |
| White background + black circles in the mask | White = keep, black = hole; this is how SVG masks are designed to work |
| Viewport diagonal as `MAX_R` | Guarantees full-screen coverage regardless of where circles are centered |
| Staggered delays (~130 ms apart) | Creates a cascading burst effect from a single region |
| `performance.now()` for timing | Precise timing that stays consistent across different frame rates |
| DOM removal after fade | Prevents an invisible SVG from consuming memory after the animation |
| IIFE encapsulation | All animation state is private — nothing leaks into the global scope |
