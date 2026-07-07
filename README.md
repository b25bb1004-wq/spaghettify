# Spaghettify 🕳️

A black hole that floats over your **entire screen** — Warp, Cursor, YouTube,
NotebookLM, anything. Launch it and forget it: **30 minutes later it appears**,
roaming the screen and gravitationally lensing whatever's behind it, and spends
**10 minutes growing to full size** — your cue to stand up. Then it vanishes
and the cycle starts over. Clicks pass straight through it.

It's a stretch alarm: when the hole shows up, stand up before it spaghettifies
your spine.

Inspired by [s0xDk/ghostty-blackhole](https://github.com/s0xDk/ghostty-blackhole),
which lives inside the terminal. This is the desktop-wide cousin.

## Run it

Needs Node 18+. Works on macOS and Windows 10 (version 2004+) / 11.

```
npm install
npm start
```

macOS will ask for Screen Recording permission on first run — grant it in
System Settings and relaunch (without it you get the hole but no lensing).
Windows needs no permission; shortcuts use `Ctrl` instead of `Cmd`.

Nothing shows at first — that's normal. The hole arrives 30 minutes after
launch, grows for 10, then resets.

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
| `APPEAR_MIN` | 30 | minutes after launch until the hole appears |
| `GROW_MIN` | 10 | minutes of growth from starting size to max, then the cycle resets |
| `DEPLOY_MIN` | 10 | stretch alarm length (Cmd+Shift+D): minutes to grow to full |
| `MIN_R_PX` | 22 | shadow radius at first appearance |
| `MAX_FRAC` | 0.08 | max shadow radius vs screen (glowing disk reaches ~3.4× this) |

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
