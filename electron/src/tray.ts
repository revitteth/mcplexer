import { app, Menu, nativeImage, Tray } from "electron";
import path from "node:path";
import fs from "node:fs";
import { getMainWindow } from "./main.js";

type TrayStatus = "running" | "stopped" | "starting";

let tray: Tray | null = null;

const ASSETS_DIR = path.join(__dirname, "..", "assets");

function loadIcon(filename: string): Electron.NativeImage {
  const iconPath = path.join(ASSETS_DIR, filename);
  if (fs.existsSync(iconPath)) {
    return nativeImage.createFromPath(iconPath);
  }
  // Return empty image when asset file is missing
  return nativeImage.createEmpty();
}

function getTrayIcon(status: TrayStatus): Electron.NativeImage {
  if (process.platform === "darwin") {
    // macOS: use template image — the OS handles dark/light mode
    const icon = loadIcon("iconTemplate.png");
    icon.setTemplateImage(true);
    return icon;
  }

  // Other platforms: color-coded icons by status
  const iconMap: Record<TrayStatus, string> = {
    running: "icon-green.png",
    stopped: "icon-red.png",
    starting: "icon-yellow.png",
  };
  return loadIcon(iconMap[status]);
}

function buildContextMenu(): Electron.Menu {
  return Menu.buildFromTemplate([
    {
      label: "Show Window",
      click: () => {
        const win = getMainWindow();
        win?.show();
        win?.focus();
      },
    },
    {
      label: "Restart Server",
      click: () => {
        console.log("[mcplexer:tray] Restart not implemented");
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
  ]);
}

function tooltipForStatus(status: TrayStatus): string {
  const labels: Record<TrayStatus, string> = {
    running: "MCPlexer \u2014 Running",
    stopped: "MCPlexer \u2014 Stopped",
    starting: "MCPlexer \u2014 Starting",
  };
  return labels[status];
}

export function initTray(): void {
  if (tray !== null) {
    return;
  }

  const icon = getTrayIcon("stopped");
  tray = new Tray(icon);
  tray.setToolTip(tooltipForStatus("stopped"));
  tray.setContextMenu(buildContextMenu());

  tray.on("click", () => {
    const win = getMainWindow();
    win?.show();
    win?.focus();
  });
}

export function setTrayStatus(status: TrayStatus): void {
  if (tray === null) {
    return;
  }
  tray.setImage(getTrayIcon(status));
  tray.setToolTip(tooltipForStatus(status));
}
