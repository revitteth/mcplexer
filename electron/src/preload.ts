import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("mcplexer", {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome,
  },
});
