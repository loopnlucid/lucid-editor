(() => {
  "use strict";

  const { PROJECT_SCHEMA_VERSION } = window.LucidEditor.config;
  const { deepClone } = window.LucidEditor.utils;

  function createProjectSnapshot(state) {
    const savedAt = new Date().toISOString();

    return {
      meta: {
        ...deepClone(state.meta),
        schemaVersion: PROJECT_SCHEMA_VERSION,
        lastSavedAt: savedAt,
      },
      layers: deepClone(state.layers),
      activeLayerId: state.activeLayerId,
      libraryItems: deepClone(state.libraryItems),
      selectedLibraryItemId: state.selectedLibraryItemId,
      selectedEntityId: state.selectedEntityId,
      entities: deepClone(state.entities),
      spawn: deepClone(state.spawn),
      camera: deepClone(state.camera),
      ui: {
        openSections: deepClone(state.ui.openSections),
      },
      counters: deepClone(state.counters),
    };
  }

  function downloadProject(state) {
    const snapshot = createProjectSnapshot(state);
    const json = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "lucid-editor-project.json";
    anchor.click();

    setTimeout(() => URL.revokeObjectURL(url), 0);

    return snapshot.meta.lastSavedAt;
  }

  async function readProjectFile(file) {
    const text = await file.text();
    return JSON.parse(text);
  }

  window.LucidEditor.services = window.LucidEditor.services || {};
  window.LucidEditor.services.persistence = {
    createProjectSnapshot,
    downloadProject,
    readProjectFile,
  };
})();
