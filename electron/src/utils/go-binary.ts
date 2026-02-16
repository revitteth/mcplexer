import { app } from "electron";
import path from "node:path";

export function getGoBinaryPath(): string {
  const ext = process.platform === "win32" ? ".exe" : "";

  if (!app.isPackaged) {
    // Development: binary is at <project-root>/bin/mcplexer
    // app.getAppPath() returns <project-root>/electron
    return path.join(app.getAppPath(), "..", "bin", `mcplexer${ext}`);
  }

  // Production: binary is bundled in app resources
  return path.join(process.resourcesPath, "bin", `mcplexer${ext}`);
}
