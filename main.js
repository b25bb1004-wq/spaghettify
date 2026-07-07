// main.js — transparent click-through overlay + screen capture plumbing.
// v2: the hole gravitationally lenses the actual screen behind it.

const {
  app, BrowserWindow, screen, powerMonitor, globalShortcut,
  session, desktopCapturer, ipcMain,
} = require("electron");
const fs = require("fs");
const path = require("path");

let win = null;

// work-accumulator persistence: renderer state survives quits/restarts
// (localStorage flushes lazily and loses writes on abrupt exit)
const statePath = () => path.join(app.getPath("userData"), "bh_state.json");
ipcMain.handle("bh-load", () => {
  try { return JSON.parse(fs.readFileSync(statePath(), "utf8")); } catch (_) { return null; }
});
ipcMain.on("bh-save", (_e, a) => {
  try { fs.writeFileSync(statePath(), JSON.stringify({ a, t: Date.now() })); } catch (_) {}
});

function createWindow() {
  const { bounds } = screen.getPrimaryDisplay();

  win = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    transparent: true,
    frame: false,
    hasShadow: false,
    resizable: false,
    movable: false,
    focusable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: `${__dirname}/preload.js`,
      contextIsolation: true,
    },
  });

  // clicks fall through
  win.setIgnoreMouseEvents(true);

  // CRITICAL: exclude this window from screen capture, or the hole
  // would capture itself and lens its own image recursively.
  win.setContentProtection(true);

  win.setAlwaysOnTop(true, "screen-saver");
  if (process.platform !== "win32") {
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true }); // macOS/Linux only
  }

  win.loadFile("index.html");

  // system-wide idle seconds -> renderer, 1 Hz
  setInterval(() => {
    if (win && !win.isDestroyed()) {
      win.webContents.send("idle", powerMonitor.getSystemIdleTime());
    }
  }, 1000);
}

app.whenReady().then(() => {
  if (process.platform === "darwin" && app.dock) app.dock.hide();

  // When the renderer asks for display media, hand it the primary screen
  // directly — no OS picker dialog.
  session.defaultSession.setDisplayMediaRequestHandler(
    (request, callback) => {
      desktopCapturer.getSources({ types: ["screen"] }).then((sources) => {
        if (sources.length > 0) {
          callback({ video: sources[0] });
        } else {
          callback({}); // deny -> renderer falls back to overlay-only mode
        }
      }).catch((err) => {
        // No Screen Recording permission (grant in System Settings, then
        // relaunch). Deny cleanly so the renderer falls back instead of
        // hanging on an unhandled rejection.
        console.warn("Screen capture unavailable:", err.message);
        callback({});
      });
    },
    { useSystemPicker: false }
  );

  createWindow();

  globalShortcut.register("CommandOrControl+Shift+B", () => {
    if (!win) return;
    win.isVisible() ? win.hide() : win.show();
  });
  // deploy: summon the hole at full size on demand (toggle)
  globalShortcut.register("CommandOrControl+Shift+D", () => {
    if (win && !win.isDestroyed()) {
      win.show();
      win.webContents.send("deploy");
    }
  });
  globalShortcut.register("CommandOrControl+Shift+Q", () => app.quit());
});

app.on("will-quit", () => globalShortcut.unregisterAll());
app.on("window-all-closed", () => app.quit());
