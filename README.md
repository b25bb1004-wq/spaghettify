# Spaghettify 🕳️

A black hole that floats over your **entire screen** — Warp, Cursor, YouTube,
NotebookLM, anything. Work too long without a break and it appears, roaming
the screen and gravitationally lensing whatever's behind it. It grows while
you're active (system-wide keyboard/mouse, any app) and starts releasing you
after 90 seconds of quiet. Clicks pass straight through it.

It's a stretch alarm: when the hole shows up, stand up before it spaghettifies
your spine.

Inspired by [s0xDk/ghostty-blackhole](https://github.com/s0xDk/ghostty-blackhole),
which lives inside the terminal. This is the desktop-wide cousin — and because
Electron has memory, it uses a real work accumulator instead of the wall-clock
approximation the stateless shader was forced into.

## Run it

Needs Node 18+.

```
npm install
npm start
```

A tiny hole appears and starts drifting. Work for a while and it grows;
walk away and it lets you go.

## Controls

- `Cmd/Ctrl + Shift + B` — hide / show the hole
- `Cmd/Ctrl + Shift + D` — deploy: summon the hole now at natural size; it grows
  for 10 minutes (your stretch break), then retracts. Press again to dismiss early.
- `Cmd/Ctrl + Shift + Q` — quit

(The window is click-through and unfocusable, so global shortcuts are the
only way to talk to it.)

## Knobs

Top of `index.html`:

| knob | default | meaning |
|---|---|---|
| `WORK_MIN` | 55 | minutes of activity to reach full size |
| `APPEAR_MIN` | 30 | minutes of continuous work before the hole appears at all |
| `DEPLOY_MIN` | 10 | stretch alarm length: minutes to grow from natural size to full |
| `IDLE_GRACE` | 90 | seconds of quiet before shrinking starts |
| `IDLE_FADE` | 1800 | idle seconds to drain a full accumulator (also applies to time offline) |
| `MAX_FRAC` | 0.16 | max shadow radius vs screen |

Shader look (disk size, inclination, Doppler strength, ring) — constants at
the top of the fragment shader in `index.html`.

## Pixel bending (v2)

The hole now **gravitationally lenses your actual screen**. It captures the
display, feeds it to the shader as the background sky, and bends every nearby
pixel with the point-mass lens equation (source = image − θ_E²·p/|p|²).
Your YouTube video stretches into arcs near the ring; rays inside the
critical radius go black. The overlay excludes itself from capture
(`setContentProtection`) so it never lenses its own image.

**macOS permission**: on first run, grant **Screen Recording** to the app
(System Settings → Privacy & Security → Screen Recording → enable
Electron/Blackhole Overlay), then quit (Cmd+Shift+Q) and `npm start` again.
Windows needs no permission.

If capture is denied, it falls back to v1 behavior (hole composited on top,
no bending).

## Honest limits

- ~1 frame of capture latency: during fast scrolling the lensed region can
  trail the real screen very slightly.
- Primary display only in v1.
- macOS native-fullscreen video spaces are occasionally stubborn about
  overlays; if the hole vanishes over a fullscreen app, use maximized
  windows instead, or toggle with Cmd+Shift+B.
