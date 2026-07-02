(() => {
  "use strict";

  const { EditorController } = window.LucidEditor.controllers;

  const controller = new EditorController({
    appShell: document.getElementById("appShell"),
    workspaceNav: document.getElementById("workspaceNav"),
    topToolbar: document.getElementById("topToolbar"),
    workspaceGrid: document.getElementById("workspaceGrid"),
    spriteWorkspace: document.getElementById("spriteWorkspace"),
    spritePanelLeft: document.getElementById("spritePanelLeft"),
    spritePanelRight: document.getElementById("spritePanelRight"),
    toggleSpriteLeftPanel: document.getElementById("toggleSpriteLeftPanel"),
    toggleSpriteRightPanel: document.getElementById("toggleSpriteRightPanel"),
    spriteStage: document.getElementById("spriteStage"),
    spriteCanvas: document.getElementById("spriteCanvas"),
    spriteOverlay: document.getElementById("spriteOverlay"),
    spriteSheetInput: document.getElementById("spriteSheetInput"),
    spriteAnimPanel: document.getElementById("spriteAnimPanel"),
    spriteAddAnim: document.getElementById("spriteAddAnim"),
    spritePreviewCanvas: document.getElementById("spritePreviewCanvas"),
    spritePreviewEmpty: document.getElementById("spritePreviewEmpty"),
    spriteFrameList: document.getElementById("spriteFrameList"),
    spriteFrameCount: document.getElementById("spriteFrameCount"),
    panelLeft: document.getElementById("panelLeft"),
    panelRight: document.getElementById("panelRight"),
    toggleLeftPanel: document.getElementById("toggleLeftPanel"),
    toggleRightPanel: document.getElementById("toggleRightPanel"),
    layersPanel: document.getElementById("layersPanel"),
    inspectorPanel: document.getElementById("inspectorPanel"),
    canvas: document.getElementById("editorCanvas"),
    canvasTitle: document.getElementById("canvasTitle"),
    canvasHint: document.getElementById("canvasHint"),
    statusBar: document.getElementById("statusBar"),
    projectFileInput: document.getElementById("projectFileInput"),
  });

  controller.init();
})();
