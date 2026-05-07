import { APICategoryRepository } from "@/core/domain/repositories/api/api-category-repository";
import { StorePlaylistRepository } from "@/core/domain/repositories/store/store-playlist-repository";
import { FetchCategoryUseCase } from "@/core/domain/use-cases/category/fetch-category";
import { CreatePlaylistUseCase } from "@/core/domain/use-cases/playlist/create-playlist";
import { GetActivePlaylistUseCase } from "@/core/domain/use-cases/playlist/get-active-playlist";
import { CreatePlaylist, Credentials } from "@/shared/types";
import { BrowserWindow, app, ipcMain } from "electron";
import started from "electron-squirrel-startup";
import { fork } from "node:child_process";
import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { getSerieInfo, getSeriesCategory } from "./api/requests";
import { validateCredentials } from "./handler/authHandler";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    minWidth: 300,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    void mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  // Handler for CSP HTTP headers
  // session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  //   callback({
  //     responseHeaders: {
  //       ...details.responseHeaders,
  //       "Content-Security-Policy": [
  //         "default-src 'self'; script-src 'self'; style-src-elem 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com",
  //       ],
  //     },
  //   });
  // });

  ipcMain.handle("get-series-categories", async () => {
    const getActivePlaylist = new GetActivePlaylistUseCase(
      new StorePlaylistRepository(),
    );

    const { playlist: currentPlaylist } = await getActivePlaylist.execute({});

    if (!currentPlaylist) throw new Error("No active playlist");

    const { server, username, password } = currentPlaylist.credentials;

    const fetchCategory = new FetchCategoryUseCase(
      new APICategoryRepository(server, username, password),
    );

    const { categories } = await fetchCategory.execute({});

    return categories;
  });

  ipcMain.handle("get-series-category", (_event, categoryId: number) =>
    getSeriesCategory(categoryId),
  );

  ipcMain.handle("get-serie-info", (_event, serieId: number) =>
    getSerieInfo(serieId),
  );

  ipcMain.handle("auth:validate", (_event, credentials: Credentials) => {
    return validateCredentials(credentials);
  });

  // ipcMain.on("electron-store:get", (event, key: keyof StoreSchema) => {
  //   event.returnValue = store.get(key);
  // });

  // ipcMain.on("electron-store:set", (event, key: string, value: string) => {
  //   event.returnValue = store.set(key, value);
  // });

  // ipcMain.on("electron-store:get-playlists", (event) => {
  //   event.returnValue = store.get("playlists");
  // });

  // ipcMain.on("electron-store:append", (_event, key, value) => {
  //   store.appendToArray(key, value);
  // });

  // ipcMain.on("electron-store:clear", () => store.clear());

  ipcMain.handle(
    "playlist:create",
    (_event, { name, credentials }: CreatePlaylist) => {
      const playlistCreated = new CreatePlaylistUseCase(
        new StorePlaylistRepository(),
      ).execute({ name, credentials });

      console.log("playlist", playlistCreated);

      return playlistCreated;
    },
  );

  // const child = fork(path.join(__dirname, "streamParser.js"));

  // child.on("message", (message) => {
  //   console.log(message, "from child");
  // });

  // child.on("exit", (code) => {
  //   console.log("child exited with code", code);
  // });

  // fs.watch("./", (eventType, filename) => {
  //   console.log(`Event Name: ${eventType}`);
  //   console.log(`File Triggered: ${filename}`);
  // });

  // const getActivePlaylist = new GetActivePlaylistUseCase(
  //   new StorePlaylistRepository(),
  // );

  // const { playlist: currentPlaylist } = await getActivePlaylist.execute({});

  // if (currentPlaylist) {
  //   child.send(currentPlaylist.credentials);
  // }

  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
