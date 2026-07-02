(() => {
  "use strict";

  const { PROJECT_SCHEMA_VERSION } = window.LucidEditor.config;
  const { deepClone } = window.LucidEditor.utils;

  function createProjectSnapshot(state) {
    const savedAt = new Date().toISOString();

    return {
      schemaVersion: PROJECT_SCHEMA_VERSION,
      version: state.version,
      meta: {
        ...deepClone(state.meta),
        lastSavedAt: savedAt,
      },
      projectSettings: deepClone(state.projectSettings),
      // The browser-only bridge still keeps inline library definitions until the
      // filesystem-backed manifest registry is implemented.
      library: deepClone(state.library),
      startLevelId: state.startLevelId,
      levels: deepClone(state.levels),
      editorState: {
        activeLevelId: state.editorState.activeLevelId,
        activeLayerId: state.editorState.activeLayerId,
        navCollapsed: state.editorState.navCollapsed === true,
        leftPanelCollapsed: state.editorState.leftPanelCollapsed === true,
        rightPanelCollapsed: state.editorState.rightPanelCollapsed === true,
        selectedEntityId: state.editorState.selectedEntityIds?.[0] || null,
        selectedLibraryItemId: state.editorState.selectedLibraryItemId,
        camera: deepClone(state.editorState.camera),
        openSections: deepClone(state.editorState.openSections),
      },
    };
  }

  function createProjectFilename(projectName) {
    const safeName = String(projectName || "lucid-editor-project")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return `${safeName || "lucid-editor-project"}.json`;
  }

  function downloadProject(state) {
    const snapshot = createProjectSnapshot(state);
    const json = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = createProjectFilename(snapshot.meta.projectName);
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
