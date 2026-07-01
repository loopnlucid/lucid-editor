(() => {
  "use strict";

  const { EditorController } = window.LucidEditor.controllers;

  const controller = new EditorController({
    layersPanel: document.getElementById("layersPanel"),
    inspectorPanel: document.getElementById("inspectorPanel"),
    canvas: document.getElementById("editorCanvas"),
    statusBar: document.getElementById("statusBar"),
    placeItemButton: document.getElementById("placeItemButton"),
    saveProjectButton: document.getElementById("saveProjectButton"),
    loadProjectButton: document.getElementById("loadProjectButton"),
    resetCameraButton: document.getElementById("resetCameraButton"),
    projectFileInput: document.getElementById("projectFileInput"),
  });

  controller.init();
})();
