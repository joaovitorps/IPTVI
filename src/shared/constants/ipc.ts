export const IPC = {
  PLAYLIST: {
    ACTIVATE: "playlist:activate",
    VALIDATE: "playlist:validate",
    FETCH: "playlist:fetch",
    CREATE: "playlist:create",
    UPDATE: "playlist:update",
    DELETE: "playlist:delete",
  },
  CATEGORY: {
    FETCH: "category:fetch",
  },
  SERIE: {
    GET_BY_ID: "serie:get-by-id",
    FETCH_BY_CATEGORY_ID: "serie:fetch-by-category-id",
  },
  STREAM_SERVER: {
    START: "stream-server:start",
    STOP: "stream-server:stop",
    STATUS: "stream-server:status",
  },
  STORE: {
    GET: "electron-store:get",
    SET: "electron-store:set",
  },
};
