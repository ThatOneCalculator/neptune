import { createStore as createIdbStore, set as idbSet, get as idbGet } from "idb-keyval";
import { store } from "voby";

export function appendStyle(style) {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = style;

  document.head.appendChild(styleTag);

  return (newStyle) => {
    if (newStyle == undefined) return document.head.removeChild(styleTag);

    styleTag.innerHTML = newStyle;
  };
}

export const neptuneIdbStore = createIdbStore("__NEPTUNE_IDB_STORAGE", "__NEPTUNE_IDB_STORAGE");

// store.on appears to not work upon isArray being true. This makes me a very sad toonlink.
export function createPersistentObject(id, isArray = false) {
  // This is fucking moronic. But fine, we'll do this dumb shit just for you.
  const persistentObject = store(isArray ? { value: [] } : {});

  store.on(persistentObject, () => {
    idbSet(id, store.unwrap(persistentObject), neptuneIdbStore);
  });

  return [
    isArray ? persistentObject.value : persistentObject,
    new Promise((res) =>
      idbGet(id, neptuneIdbStore).then((obj) => {
        store.reconcile(persistentObject, obj ?? (isArray ? { value: [] } : {}));
        res();
      }),
    ),
  ];
}

export const parseManifest = (manifest) => {
  try {
    if (typeof manifest == "string")
      manifest = JSON.parse(manifest.slice(manifest.indexOf("/*") + 2, manifest.indexOf("*/")));
  } catch {
    throw "Failed to parse manifest!";
  }

  if (!["name", "author", "description"].every((i) => typeof manifest[i] === "string"))
    throw "Manifest doesn't contain required properties!";

  return manifest;
};

export const getMediaURLFromID = (id, path = "/1280x1280.jpg") =>
  "https://resources.tidal.com/images/" + id.split("-").join("/") + path;
