(() => {
  "use strict";

  // Laedt und cached Sprite-Sheets (PNG) anhand ihres Pfads. Ein Sheet wird
  // pro Pfad genau einmal geladen und von allen Instanzen desselben Sprites
  // geteilt. Wird ein Sheet fertig geladen, meldet der Service das per
  // Callback, damit die Canvas neu gezeichnet werden kann.
  const cache = new Map(); // path -> { image, status: "loading" | "ready" | "error" }
  const readyListeners = new Set();

  function notifyReady(path) {
    readyListeners.forEach((listener) => {
      try {
        listener(path);
      } catch (error) {
        // Ein fehlerhafter Listener darf die anderen nicht blockieren.
      }
    });
  }

  // Stoesst das Laden an (falls noetig) und liefert das Bild synchron nur,
  // wenn es bereits fertig geladen ist. Sonst null (Aufrufer zeichnet dann
  // einen Platzhalter und wird per onReady erneut aufgerufen).
  function requestSheet(path) {
    if (!path) return null;

    const existing = cache.get(path);
    if (existing) {
      return existing.status === "ready" ? existing.image : null;
    }

    const entry = { image: new Image(), status: "loading" };
    cache.set(path, entry);

    entry.image.addEventListener("load", () => {
      entry.status = "ready";
      notifyReady(path);
    });
    entry.image.addEventListener("error", () => {
      entry.status = "error";
    });
    entry.image.src = path;

    return null;
  }

  function getSheet(path) {
    const entry = cache.get(path);
    return entry && entry.status === "ready" ? entry.image : null;
  }

  function getStatus(path) {
    return cache.get(path)?.status || "idle";
  }

  function onReady(listener) {
    readyListeners.add(listener);
    return () => readyListeners.delete(listener);
  }

  window.LucidEditor = window.LucidEditor || {};
  window.LucidEditor.services = window.LucidEditor.services || {};
  window.LucidEditor.services.sprites = {
    requestSheet,
    getSheet,
    getStatus,
    onReady,
  };
})();
