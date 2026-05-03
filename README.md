# Canvas Reveal Animation

A page reveal animation that uncovers content through expanding circular holes in a black overlay.

---

## How It Looks

When the page loads, a solid black layer covers everything. Five circles — clustered near the center of the screen — begin to grow outward in quick succession, punching transparent holes through the black layer. Because the holes grow and overlap, the black recedes naturally, revealing the page content underneath. Once the circles are large enough to cover the entire screen, the black overlay fades out and is removed from the page.

---

## File Overview

| File | Role |
|---|---|
| `index.html` | Page shell — text content + the `<canvas id="overlay">` element |
| `style.css` | Positions the canvas as a fixed full-screen overlay; defines the `.done` fade-out transition |
| `script.js` | Self-executing animation — owns the render loop, timing, easing, and cleanup |

---

## How the Animation Works

### What Is the Canvas?

The `<canvas>` element is an HTML element that lets JavaScript draw graphics directly — shapes, images, colors — pixel by pixel. Think of it as a blank drawing surface sitting on top of your page. In this project, the canvas is stretched to cover the entire screen, and JavaScript draws on it every frame to produce the animation.

---

### The Black Layer With Growing Holes

To create the effect, two drawing steps happen back-to-back on every frame:

**Step 1 — Fill the entire canvas black.**

```js
ctx.globalCompositeOperation = 'source-over';
ctx.fillStyle = 'black';
ctx.fillRect(0, 0, W, H);
```

This paints a solid black rectangle over the whole canvas, hiding the page content underneath.

**Step 2 — Cut holes where the circles are.**

```js
ctx.globalCompositeOperation = 'destination-out';
// for each circle:
ctx.arc(x, y, radius, 0, Math.PI * 2);
ctx.fill();
```

Normally, drawing on a canvas adds paint on top of what's already there. The `destination-out` mode flips that: instead of adding color, drawing **removes** pixels, making them fully transparent. So each filled circle acts like a hole punch — it carves a see-through gap in the black layer, exposing the page content beneath.

Where two circles overlap, their holes simply merge. There's no special logic needed for this — transparent pixels are just transparent, regardless of how many circles contributed to them. As the circles grow frame by frame, the holes expand until the entire black layer is gone.

---

### The Render Loop

Animations on the web work by drawing a new frame many times per second — typically 60 times. Each frame is a complete redraw from scratch. `requestAnimationFrame` is the browser's built-in way to ask: "call this function the next time you're about to draw a frame."

`script.js` uses it to run this sequence repeatedly:

```
1. clearRect()                    — erase everything from the previous frame
2. fillRect() black               — paint the black layer fresh
3. destination-out circles        — cut holes at each circle's current size
4. check if animation is done     — if all circles are fully grown, start the fade-out
5. requestAnimationFrame(tick)    — schedule this same function to run again next frame
```

Redrawing everything from scratch each frame keeps the black layer and all circles perfectly in sync with wherever the animation is at that moment.

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

Each circle grows until its radius equals the diagonal length of the screen — the distance from one corner to the opposite corner. This is the longest possible distance from the center of the screen to any point on the screen. Using this as the maximum radius guarantees that every circle will fully cover every corner by the time the animation ends, even if a circle's center is slightly off-center.

---

## Completion Sequence

Once all five circles have reached their maximum size, the animation ends in two stages:

1. **Fade out** — the `.done` class is added to the canvas, which triggers a CSS `opacity: 0` transition over 2 seconds.
2. **Remove from the page** — once the fade finishes, the canvas element is deleted from the DOM entirely. An invisible element still consumes memory on the GPU, so removing it keeps things clean.

---

## Key Design Decisions

| Decision | Reason |
|---|---|
| `destination-out` instead of `clip-path` | Overlapping circle holes merge automatically — no geometry calculations needed |
| Viewport diagonal as `MAX_R` | Guarantees full-screen coverage regardless of where circles are centered |
| Staggered delays (~120 ms apart) | Creates a cascading burst effect from a single region |
| `performance.now()` for timing | Precise timing that stays consistent across different frame rates |
| DOM removal after fade | Prevents an invisible canvas from consuming GPU memory after the animation |
| IIFE encapsulation | All animation state is private — nothing leaks into the global scope |
