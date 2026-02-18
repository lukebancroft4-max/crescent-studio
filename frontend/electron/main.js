import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let backendProcess = null;
let mainWindow = null;

const isDev = !app.isPackaged;
const BACKEND_PORT = 8000;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;

function getBackendCommand() {
  if (isDev) {
    const venvPython = path.join(
      __dirname,
      "..",
      "..",
      "backend",
      ".venv",
      "bin",
      "python"
    );
    return {
      cmd: venvPython,
      args: ["-m", "uvicorn", "main:app", "--port", String(BACKEND_PORT)],
      cwd: path.join(__dirname, "..", "..", "backend"),
    };
  }

  const backendDir = path.join(process.resourcesPath, "backend");
  const executable = path.join(backendDir, "crescent-backend");
  return { cmd: executable, args: [], cwd: backendDir };
}

function startBackend() {
  const { cmd, args, cwd } = getBackendCommand();

  backendProcess = spawn(cmd, args, {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      CRESCENT_OUTPUT_DIR: isDev
        ? undefined
        : path.join(app.getPath("userData"), "output"),
    },
  });

  backendProcess.stdout.on("data", (data) => {
    console.log(`[backend] ${data.toString().trim()}`);
  });

  backendProcess.stderr.on("data", (data) => {
    console.error(`[backend] ${data.toString().trim()}`);
  });

  backendProcess.on("close", (code) => {
    console.log(`[backend] exited with code ${code}`);
    backendProcess = null;
  });
}

function waitForBackend(retries = 30, interval = 500) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    function check() {
      attempts++;
      http
        .get(`${BACKEND_URL}/api/status`, (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else if (attempts < retries) {
            setTimeout(check, interval);
          } else {
            reject(new Error("Backend not ready"));
          }
        })
        .on("error", () => {
          if (attempts < retries) {
            setTimeout(check, interval);
          } else {
            reject(new Error("Backend not reachable"));
          }
        });
    }

    check();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: "Crescent Studio",
    backgroundColor: "#0D0D0D",
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

// IPC handlers
ipcMain.handle("dialog:openFile", async (_, options) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: options?.filters || [
      { name: "Audio", extensions: ["wav", "mp3", "flac", "ogg"] },
    ],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("plugins:scan", async (_, extraDirs) => {
  // Delegate to backend API
  const res = await fetch(`${BACKEND_URL}/api/plugins/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ extra_dirs: extraDirs || [] }),
  });
  return res.json();
});

ipcMain.handle("shell:openOutputDir", async () => {
  const outputDir = isDev
    ? path.join(__dirname, "..", "..", "output")
    : path.join(app.getPath("userData"), "output");
  await shell.openPath(outputDir);
});

// App lifecycle
app.whenReady().then(async () => {
  startBackend();

  try {
    await waitForBackend();
  } catch (err) {
    console.error("Failed to start backend:", err.message);
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("before-quit", () => {
  if (backendProcess) {
    backendProcess.kill("SIGTERM");
    backendProcess = null;
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
