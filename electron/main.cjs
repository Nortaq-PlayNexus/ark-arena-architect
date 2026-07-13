const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

const APP_NAME = "ARK Arena Architect";
const ALLOWED_EXTERNAL_PROTOCOLS = new Set(["https:", "mailto:"]);

function reportFatal(label, error) {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error(`[${APP_NAME}] ${label}: ${message}`);
}

process.on("uncaughtException", (error) => reportFatal("uncaughtException", error));
process.on("unhandledRejection", (reason) => reportFatal("unhandledRejection", reason));

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();

function focusPrimaryWindow() {
  const win = BrowserWindow.getAllWindows()[0];
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
}

if (gotLock) app.on("second-instance", focusPrimaryWindow);

function isAllowedExternalUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return ALLOWED_EXTERNAL_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    title: APP_NAME,
    width: 1400,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    show: false,
    backgroundColor: "#08111f",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      devTools: !app.isPackaged,
    },
  });

  win.once("ready-to-show", () => win.show());
  win.on("unresponsive", () => reportFatal("renderer unresponsive", new Error("Renderer stopped responding")));
  win.webContents.on("will-navigate", (event, url) => {
    if (url !== win.webContents.getURL()) event.preventDefault();
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedExternalUrl(url)) {
      void shell.openExternal(url).catch((error) => reportFatal("openExternal failed", error));
    }
    return { action: "deny" };
  });

  const indexHtml = path.join(__dirname, "..", "dist", "index.html");
  void win.loadFile(indexHtml).catch((error) => reportFatal("failed to load UI", error));
}

if (gotLock) {
  app.whenReady().then(() => {
    app.setAppUserModelId("com.arkarenaarchitect.desktop");
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
      else focusPrimaryWindow();
    });
  }).catch((error) => reportFatal("startup failed", error));

  app.on("web-contents-created", (_event, contents) => {
    contents.on("will-attach-webview", (event) => event.preventDefault());
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
