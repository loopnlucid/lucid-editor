(() => {
  "use strict";

  const {
    HISTORY_LIMIT,
    TOOL_DEFINITIONS,
    WORKSPACE_DEFINITIONS,
  } = window.LucidEditor.config;
  const {
    canPlaceOnActiveLayer,
    clampCamera,
    createInitialState,
    createLogicPolygonFromPoints,
    createLogicRectFromBounds,
    createStateFromSnapshot,
    getActiveLayer,
    getActiveLevel,
    getEntityPresentation,
    getLevelById,
    getPrimarySelectedEntity,
    getSelectedEntities,
    getSelectedLibraryItem,
    instantiateSelectedLibraryItem,
  } = window.LucidEditor.model;
  const {
    downloadProject,
    readProjectFile,
  } = window.LucidEditor.services.persistence;
  const {
    renderCanvasChrome,
    renderInspectorPanel,
    renderLayersPanel,
    renderSpriteAnimationsPanel,
    renderSpriteFrameList,
    renderSpriteOverlay,
    renderSpriteToolbar,
    renderStatusBar,
    renderToolbar,
    renderWorkspaceNavigation,
    CanvasView,
    SpriteCanvasView,
    SpritePreviewView,
  } = window.LucidEditor.views;
  const {
    deepClone,
    isTextInputElement,
    renderIcon,
    toNumberOrFallback,
    toRelativePoints,
  } = window.LucidEditor.utils;

  class EditorController {
    constructor(elements) {
      this.elements = elements;
      this.state = createInitialState();
      this.pendingLevelMove = null;
      this.pendingShapeEdit = null;
      this.canvasView = new CanvasView(elements.canvas, {
        onSelectEntity: (entityId, options) => this.selectEntity(entityId, options),
        onSelectionMoveStart: (entityIds) => this.beginSelectionMove(entityIds),
        onSelectionMove: (delta) => this.moveSelection(delta),
        onSelectionMoveEnd: (changed) => this.finishSelectionMove(changed),
        onShapeEditStart: (entityId) => this.beginShapeEdit(entityId),
        onShapeEditRect: (bounds) => this.updateShapeRect(bounds),
        onShapeEditPolygon: (points) => this.updateShapePolygon(points),
        onShapeEditEnd: (changed) => this.finishShapeEdit(changed),
        onCreateLogicRect: (bounds) => this.createLogicRectangle(bounds),
        onCreateLogicPolygon: (points) => this.createLogicPolygon(points),
        onUpdateCamera: (camera) => this.updateCamera(camera),
      });

      this.spriteDraft = {
        spriteName: "Neuer Sprite",
        sheets: [],
        activeSheetId: null,
        animations: [],
        activeAnimationId: null,
        pixelError: false,
        loading: false,
      };
      this.spriteSheetCounter = 1;
      this.spriteAnimCounter = 1;
      this.spriteFrameCounter = 1;
      this.spriteHistory = { undo: [], redo: [] };
      this.spriteTool = "pick";
      this.spriteCanvasView = new SpriteCanvasView(elements.spriteCanvas, {
        onAddFrame: (rect) => this.addSpriteFrame(rect),
        onDetectMiss: () => this.setStatusAndRefreshSprite("Kein roter Rahmen an dieser Stelle."),
        onPixelAccessError: () => { this.spriteDraft.pixelError = true; },
        onCreateFrame: (rect) => this.addSpriteFrameRect(rect),
        onFrameEditStart: () => this.beginSpriteFrameEdit(),
        onUpdateFrame: (id, rect) => this.updateSpriteFrameRect(id, rect),
        onFrameEditEnd: (changed) => this.finishSpriteFrameEdit(changed),
      });
      this.spritePreviewView = new SpritePreviewView(elements.spritePreviewCanvas);

      this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    init() {
      this.bindChrome();
      this.render();
    }

    bindChrome() {
      window.addEventListener("keydown", this.handleKeyDown);
      this.elements.projectFileInput.addEventListener("change", (event) => this.loadProject(event));
      this.elements.spriteSheetInput?.addEventListener("change", (event) => this.onSpriteSheetSelected(event));
      this.bindSpriteDropZone();
      if (this.elements.spriteAddAnim) this.elements.spriteAddAnim.innerHTML = renderIcon("plus");
      this.elements.spriteAddAnim?.addEventListener("click", (event) => {
        // Button sitzt in der Section-Summary: Klick darf die Section nicht auf-/zuklappen.
        event.preventDefault();
        event.stopPropagation();
        this.addSpriteAnimation();
      });
      this.elements.toggleLeftPanel?.addEventListener("click", () => this.togglePanel("left"));
      this.elements.toggleRightPanel?.addEventListener("click", () => this.togglePanel("right"));
      this.elements.toggleSpriteLeftPanel?.addEventListener("click", () => this.togglePanel("left"));
      this.elements.toggleSpriteRightPanel?.addEventListener("click", () => this.togglePanel("right"));

      // Wenn ein Sprite-Sheet fertig geladen ist, Canvas und Panels (Library-
      // Thumbnail) neu aufbauen, damit das Bild sofort erscheint.
      window.LucidEditor.services.sprites?.onReady(() => this.render());
    }

    render() {
      this.elements.appShell.classList.toggle("nav-collapsed", this.state.editorState.navCollapsed);
      this.renderPanelCollapse();

      renderWorkspaceNavigation(this.elements.workspaceNav, this.state, {
        onSelectWorkspace: (workspaceId) => this.selectWorkspace(workspaceId),
        onToggleNav: () => this.toggleNav(),
      });

      const isSprite = this.state.editorState.activeWorkspace === "sprite-editor";
      this.elements.workspaceGrid.hidden = isSprite;
      if (this.elements.spriteWorkspace) this.elements.spriteWorkspace.hidden = !isSprite;

      if (isSprite) {
        this.renderSpriteWorkspace();
        renderStatusBar(this.elements.statusBar, this.state);
      } else {
        this.renderLevelWorkspace();
      }
    }

    renderLevelWorkspace() {
      renderToolbar(this.elements.topToolbar, this.state, {
        canUndo: this.canUndo(),
        canRedo: this.canRedo(),
        onSelectTool: (toolId) => this.selectTool(toolId),
        onUndo: () => this.undo(),
        onRedo: () => this.redo(),
        onSaveProject: () => this.saveProject(),
        onLoadProject: () => this.openLoadDialog(),
        onResetZoom: () => this.resetZoom(),
      });

      renderLayersPanel(this.elements.layersPanel, this.state, {
        onToggleSection: (section, isOpen) => this.toggleSection(section, isOpen),
        onAddLayer: () => this.addLayer(),
        onDeleteLayer: () => this.deleteActiveLayer(),
        onSelectLayer: (layerId) => this.selectLayer(layerId),
        onToggleLayerVisibility: (layerId) => this.toggleLayerVisibility(layerId),
        onToggleLayerLock: (layerId) => this.toggleLayerLock(layerId),
        onUpdateLayer: (layerId, patch) => this.updateLayer(layerId, patch),
      });

      renderInspectorPanel(this.elements.inspectorPanel, this.state, {
        onToggleSection: (section, isOpen) => this.toggleSection(section, isOpen),
        onSelectLibraryItem: (libraryItemId) => this.selectLibraryItem(libraryItemId),
        onToggleLibraryItem: (libraryItemId) => this.toggleLibraryItem(libraryItemId),
        onUpdateLibraryQuery: (value) => this.updateLibraryQuery(value),
        onPlaceLibraryItem: (libraryItemId) => this.placeLibraryItemAtCenter(libraryItemId),
        onDeleteSelectedEntities: () => this.deleteSelectedEntities(),
        onUpdateSelectedEntity: (field, rawValue) => this.updateSelectedEntity(field, rawValue),
        onUpdateSelectedLogic: (field, rawValue) => this.updateSelectedLogic(field, rawValue),
        onUpdateLevelField: (group, field, rawValue) => this.updateLevelField(group, field, rawValue),
      });

      this.renderViewport();
    }

    renderSpriteWorkspace() {
      const checker = this.spriteCheckerColors();
      this.spriteCanvasView.setCheckerboard(checker.a, checker.b);
      this.spritePreviewView.setCheckerboard(checker.a, checker.b);

      renderSpriteToolbar(this.elements.topToolbar, this.spriteDraft, {
        tool: this.spriteTool,
        canUndo: this.spriteHistory.undo.length > 0,
        canRedo: this.spriteHistory.redo.length > 0,
        checker,
      }, {
        onSelectWorkspace: (workspaceId) => this.selectWorkspace(workspaceId),
        onLoadSheet: () => this.loadSpriteSheet(),
        onDetectAll: () => this.detectAllSpriteFrames(),
        onClearFrames: () => this.clearSpriteFrames(),
        onSelectSheet: (id) => this.selectSpriteSheet(id),
        onCloseSheet: (id) => this.closeSpriteSheet(id),
        onSelectTool: (tool) => this.selectSpriteTool(tool),
        onResetZoom: () => this.resetSpriteZoom(),
        onUndo: () => this.undoSprite(),
        onRedo: () => this.redoSprite(),
        onCreateSprite: () => this.createSpriteFromDraft(),
        onCheckerChange: (a, b) => this.setSpriteChecker(a, b),
      });
      renderSpriteOverlay(this.elements.spriteOverlay, this.spriteDraft);
      renderSpriteAnimationsPanel(this.elements.spriteAnimPanel, this.spriteDraft, {
        onSelectAnimation: (id) => this.selectSpriteAnimation(id),
        onRenameAnimation: (id, name) => this.renameSpriteAnimation(id, name),
        onSetAnimationFps: (id, value) => this.setSpriteAnimationFps(id, value),
        onSetAnimationLoop: (id, loop) => this.setSpriteAnimationLoop(id, loop),
        onDeleteAnimation: (id) => this.deleteSpriteAnimation(id),
      });
      renderSpriteFrameList(this.elements.spriteFrameList, this.elements.spriteFrameCount, this.spriteDraft, {
        onRemoveFrame: (id) => this.removeSpriteFrame(id),
        onReorderFrames: (fromId, toId, placeAfter) => this.reorderSpriteFrames(fromId, toId, placeAfter),
      });
      this.updateSpritePreview();
      this.spriteCanvasView.render();
    }

    getActiveSpriteAnimation() {
      return this.spriteDraft.animations.find((anim) => anim.id === this.spriteDraft.activeAnimationId) || null;
    }

    createSpriteAnimation() {
      const anim = {
        id: `anim-${this.spriteAnimCounter++}`,
        name: `Animation ${this.spriteDraft.animations.length + 1}`,
        fps: 12,
        loop: true,
        frames: [],
      };
      this.spriteDraft.animations.push(anim);
      this.spriteDraft.activeAnimationId = anim.id;
      return anim;
    }

    ensureActiveSpriteAnimation() {
      return this.getActiveSpriteAnimation() || this.createSpriteAnimation();
    }

    canvasFramesForActive() {
      const anim = this.getActiveSpriteAnimation();
      if (!anim) return [];
      return anim.frames.filter((frame) => frame.sheetId === this.spriteDraft.activeSheetId);
    }

    syncSpriteCanvas() {
      this.spriteCanvasView.setFrames(this.canvasFramesForActive());
    }

    updateSpritePreview() {
      const anim = this.getActiveSpriteAnimation();
      const frames = anim ? anim.frames : [];
      if (this.elements.spritePreviewEmpty) this.elements.spritePreviewEmpty.hidden = frames.length > 0;
      this.spritePreviewView.setSource(
        frames,
        (sheetId) => this.spriteCanvasView.getSheetImage(sheetId),
        anim ? anim.fps : 12
      );
    }

    // Undo/Redo des Sprite-Entwurfs (Animationen und Frames). Sheet-Aenderungen
    // (Laden/Schliessen) setzen die Historie zurueck, da sie Bildressourcen im
    // Canvas betreffen, die nicht Teil des serialisierbaren Entwurfs sind.
    snapshotSpriteDraft() {
      return deepClone(this.spriteDraft);
    }

    pushSpriteUndo() {
      this.spriteHistory.undo.push(this.snapshotSpriteDraft());
      if (this.spriteHistory.undo.length > HISTORY_LIMIT) this.spriteHistory.undo.shift();
      this.spriteHistory.redo = [];
    }

    resetSpriteHistory() {
      this.spriteHistory = { undo: [], redo: [] };
    }

    restoreSpriteDraft(snapshot) {
      snapshot.loading = false;
      this.spriteDraft = snapshot;
      this.spriteCanvasView.setActiveSheet(this.spriteDraft.activeSheetId);
      this.syncSpriteCanvas();
      this.render();
    }

    undoSprite() {
      const snapshot = this.spriteHistory.undo.pop();
      if (!snapshot) {
        this.setStatusAndRefreshSprite("Nichts zum Rueckgaengigmachen.");
        return;
      }
      this.spriteHistory.redo.push(this.snapshotSpriteDraft());
      this.restoreSpriteDraft(snapshot);
      this.setStatus("Undo ausgefuehrt.");
    }

    redoSprite() {
      const snapshot = this.spriteHistory.redo.pop();
      if (!snapshot) return;
      this.spriteHistory.undo.push(this.snapshotSpriteDraft());
      this.restoreSpriteDraft(snapshot);
      this.setStatus("Redo ausgefuehrt.");
    }

    renderViewport() {
      renderCanvasChrome(this.elements.canvasTitle, this.elements.canvasHint, this.state);
      renderStatusBar(this.elements.statusBar, this.state);
      this.canvasView.render(this.state);
    }

    setStatusAndRefreshSprite(message) {
      this.setStatus(message);
      renderStatusBar(this.elements.statusBar, this.state);
    }

    loadSpriteSheet() {
      this.elements.spriteSheetInput?.click();
    }

    selectSpriteTool(tool) {
      this.spriteTool = tool;
      this.spriteCanvasView.setTool(tool);
      this.render();
    }

    resetSpriteZoom() {
      this.spriteCanvasView.resetZoom();
      this.setStatusAndRefreshSprite("Ansicht zurueckgesetzt.");
    }

    // Farben des Transparenz-Schachbretts (mit Fallback fuer Alt-Snapshots).
    spriteCheckerColors() {
      const checker = this.state.editorState.spriteChecker;
      return {
        a: checker?.a || "#6b7280",
        b: checker?.b || "#454b52",
      };
    }

    setSpriteChecker(a, b) {
      const next = { a: a || "#6b7280", b: b || "#454b52" };
      this.state.editorState.spriteChecker = next;
      this.spriteCanvasView.setCheckerboard(next.a, next.b);
      this.spritePreviewView.setCheckerboard(next.a, next.b);
      // Kein voller Re-Render (haelt den Farbwaehler-Fokus); nur neu zeichnen.
      this.spriteCanvasView.render();
    }

    uniqueLibraryId(prefix, label) {
      const slug = String(label || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "sprite";
      const base = `${prefix}-${slug}`;
      if (!this.state.library.some((item) => item.id === base)) return base;
      let counter = 2;
      while (this.state.library.some((item) => item.id === `${base}-${counter}`)) counter += 1;
      return `${base}-${counter}`;
    }

    // Packt alle Animationen mit Frames in EIN Sheet (uniforme Framegroesse,
    // Frames pivot-gerecht in die Zelle skaliert) und liefert eine PNG-Data-URL
    // plus die Animations-Metadaten im Doku-Format.
    packSpriteSheet(animations, values) {
      const clamp01 = (value, fallback) => (Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback);
      const frameWidth = Math.max(1, Math.round(values.frameWidth));
      const frameHeight = Math.max(1, Math.round(values.frameHeight));
      const pivotX = clamp01(values.pivotX, 0.5);
      const pivotY = clamp01(values.pivotY, 1);

      const ordered = [];
      const animMeta = {};
      animations.forEach((anim) => {
        animMeta[anim.name] = { startFrame: ordered.length, frameCount: anim.frames.length, fps: anim.fps, loop: anim.loop };
        anim.frames.forEach((frame) => ordered.push(frame));
      });

      const total = ordered.length;
      const columns = Math.max(1, Math.ceil(Math.sqrt(total)));
      const rows = Math.ceil(total / columns);

      const canvas = document.createElement("canvas");
      canvas.width = columns * frameWidth;
      canvas.height = rows * frameHeight;
      const ctx = canvas.getContext("2d", { alpha: true });
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;

      ordered.forEach((frame, index) => {
        const image = this.spriteCanvasView.getSheetImage(frame.sheetId);
        if (!image) return;
        const col = index % columns;
        const row = Math.floor(index / columns);
        const cellX = col * frameWidth;
        const cellY = row * frameHeight;
        const scale = Math.min(frameWidth / frame.w, frameHeight / frame.h);
        const drawW = frame.w * scale;
        const drawH = frame.h * scale;
        // Pivot-Punkt des Frames auf den Pivot-Punkt der Zelle legen.
        const dx = cellX + pivotX * frameWidth - pivotX * drawW;
        const dy = cellY + pivotY * frameHeight - pivotY * drawH;
        ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h, dx, dy, drawW, drawH);
      });

      let dataUrl;
      try {
        dataUrl = canvas.toDataURL("image/png");
      } catch (error) {
        return null;
      }
      return { dataUrl, frameWidth, frameHeight, animations: animMeta, columns, total, pivotX, pivotY };
    }

    async createSpriteFromDraft() {
      const animations = this.spriteDraft.animations.filter((anim) => anim.frames.length);
      if (!animations.length) {
        this.setStatusAndRefreshSprite("Keine Frames zum Exportieren.");
        return;
      }

      let maxW = 1;
      let maxH = 1;
      animations.forEach((anim) => anim.frames.forEach((frame) => {
        maxW = Math.max(maxW, frame.w);
        maxH = Math.max(maxH, frame.h);
      }));

      const values = await window.LucidEditor.ui.prompt({
        title: "Sprite erstellen",
        confirmLabel: "Erstellen",
        fields: [
          { name: "label", label: "Name", type: "text", value: this.spriteDraft.spriteName || "Neuer Sprite", full: true },
          { name: "defaultState", label: "Standard-Animation", type: "select", value: animations[0].name, options: animations.map((anim) => ({ value: anim.name, label: anim.name })), full: true },
          { name: "frameWidth", label: "Frame-Breite", type: "number", value: maxW },
          { name: "frameHeight", label: "Frame-Hoehe", type: "number", value: maxH },
          { name: "pivotX", label: "Pivot X (0..1)", type: "number", step: 0.05, value: 0.5 },
          { name: "pivotY", label: "Pivot Y (0..1)", type: "number", step: 0.05, value: 1 },
        ],
      });
      if (!values) return;

      const packed = this.packSpriteSheet(animations, values);
      if (!packed) {
        this.setStatusAndRefreshSprite("Export fehlgeschlagen (Sheet nicht lesbar - bitte ueber den lokalen Server oeffnen).");
        return;
      }

      const label = String(values.label || "").trim() || "Neuer Sprite";
      const id = this.uniqueLibraryId("sprite", label);
      const defaultState = Object.prototype.hasOwnProperty.call(packed.animations, values.defaultState)
        ? values.defaultState
        : animations[0].name;

      this.state.library.push({
        id,
        type: "sprite",
        group: "Sprites",
        label,
        description: "Im Sprite-Editor erstellt.",
        tags: [],
        color: "#368fab",
        size: { w: packed.frameWidth, h: packed.frameHeight },
        frameWidth: packed.frameWidth,
        frameHeight: packed.frameHeight,
        sheet: packed.dataUrl,
        pivot: { x: packed.pivotX, y: packed.pivotY },
        role: "character",
        defaultState,
        animations: packed.animations,
        hitbox: null,
        capabilities: [],
      });

      // Neues Item auswaehlen und in den Level-Editor wechseln, wo die Library liegt.
      this.state.editorState.selectedLibraryItemId = id;
      this.state.editorState.expandedLibraryItemId = id;
      this.state.editorState.openSections.library = true;
      this.state.editorState.activeWorkspace = "level-editor";
      this.setStatus(`Sprite erstellt: ${label} (${packed.total} Frames)`);
      this.render();
      this.canvasView.handleResize();
    }

    onSpriteSheetSelected(event) {
      const file = event.target.files?.[0];
      event.target.value = "";
      this.loadSheetFromFile(file);
    }

    bindSpriteDropZone() {
      const stage = this.elements.spriteStage;
      if (!stage) return;

      const stop = (event) => { event.preventDefault(); event.stopPropagation(); };

      ["dragenter", "dragover"].forEach((type) => stage.addEventListener(type, (event) => {
        stop(event);
        if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
        stage.classList.add("is-drop-hover");
      }));

      ["dragleave", "dragend"].forEach((type) => stage.addEventListener(type, (event) => {
        stop(event);
        stage.classList.remove("is-drop-hover");
      }));

      stage.addEventListener("drop", (event) => {
        stop(event);
        stage.classList.remove("is-drop-hover");
        this.loadSheetFromFile(event.dataTransfer?.files?.[0]);
      });
    }

    loadSheetFromFile(file) {
      if (!file) return;
      if (!/^image\//.test(file.type || "") && !/\.png$/i.test(file.name || "")) {
        this.setStatusAndRefreshSprite("Bitte eine Bilddatei (PNG) laden.");
        return;
      }

      // Ladeanzeige sofort zeigen und Bedienung sperren.
      this.spriteDraft.loading = true;
      this.render();

      const url = URL.createObjectURL(file);
      const image = new Image();

      image.addEventListener("load", () => {
        // Zwei Frames warten, damit der Spinner sicher gezeichnet ist, bevor
        // das bei grossen Sheets synchron blockierende getImageData laeuft.
        const finish = () => {
          const id = `sheet-${this.spriteSheetCounter++}`;
          const info = this.spriteCanvasView.addSheet(id, image);
          this.spriteDraft.sheets.push({ id, name: file.name, width: info.width, height: info.height });
          this.spriteDraft.activeSheetId = id;
          this.spriteDraft.loading = false;
          if (!this.spriteDraft.animations.length) this.createSpriteAnimation();
          this.resetSpriteHistory();
          this.spriteCanvasView.setActiveSheet(id);
          this.syncSpriteCanvas();
          URL.revokeObjectURL(url);
          this.setStatus(`Sheet geladen: ${file.name} (${info.width} x ${info.height})`);
          this.render();
          this.spriteCanvasView.handleResize();
        };
        if (typeof requestAnimationFrame !== "undefined") {
          requestAnimationFrame(() => requestAnimationFrame(finish));
        } else {
          finish();
        }
      });

      image.addEventListener("error", () => {
        URL.revokeObjectURL(url);
        this.spriteDraft.loading = false;
        this.setStatus("Sheet konnte nicht geladen werden.");
        this.render();
      });

      image.src = url;
    }

    selectSpriteSheet(sheetId) {
      if (!this.spriteDraft.sheets.some((sheet) => sheet.id === sheetId)) return;
      this.spriteDraft.activeSheetId = sheetId;
      this.spriteCanvasView.setActiveSheet(sheetId);
      this.syncSpriteCanvas();
      this.render();
    }

    async closeSpriteSheet(sheetId) {
      const usedCount = this.spriteDraft.animations.reduce(
        (total, anim) => total + anim.frames.filter((frame) => frame.sheetId === sheetId).length, 0);
      if (usedCount > 0) {
        const confirmed = await window.LucidEditor.ui.confirm({
          title: "Sheet schliessen",
          message: `Dieses Sheet wird von ${usedCount} Frame(s) verwendet. Sheet schliessen und diese Frames entfernen?`,
          confirmLabel: "Schliessen",
          danger: true,
        });
        if (!confirmed) return;
      }

      this.spriteDraft.animations.forEach((anim) => {
        anim.frames = anim.frames.filter((frame) => frame.sheetId !== sheetId);
      });
      this.spriteDraft.sheets = this.spriteDraft.sheets.filter((sheet) => sheet.id !== sheetId);
      this.spriteCanvasView.removeSheet(sheetId);

      if (this.spriteDraft.activeSheetId === sheetId) {
        this.spriteDraft.activeSheetId = this.spriteDraft.sheets[0]?.id || null;
        this.spriteCanvasView.setActiveSheet(this.spriteDraft.activeSheetId);
      }
      this.resetSpriteHistory();
      this.syncSpriteCanvas();
      this.setStatus("Sheet geschlossen.");
      this.render();
    }

    addSpriteAnimation() {
      this.pushSpriteUndo();
      const anim = this.createSpriteAnimation();
      this.setStatus(`Animation angelegt: ${anim.name}`);
      this.syncSpriteCanvas();
      this.render();
    }

    selectSpriteAnimation(animId) {
      this.spriteDraft.activeAnimationId = animId;
      this.syncSpriteCanvas();
      this.render();
    }

    renameSpriteAnimation(animId, name) {
      const anim = this.spriteDraft.animations.find((candidate) => candidate.id === animId);
      if (!anim) return;
      this.pushSpriteUndo();
      anim.name = String(name || "").trim() || anim.name;
      this.render();
    }

    setSpriteAnimationFps(animId, value) {
      const anim = this.spriteDraft.animations.find((candidate) => candidate.id === animId);
      if (!anim) return;
      this.pushSpriteUndo();
      anim.fps = Math.max(1, Math.min(60, Math.round(Number(value) || anim.fps)));
      this.render();
    }

    setSpriteAnimationLoop(animId, loop) {
      const anim = this.spriteDraft.animations.find((candidate) => candidate.id === animId);
      if (!anim) return;
      this.pushSpriteUndo();
      anim.loop = loop === true;
      this.render();
    }

    async deleteSpriteAnimation(animId) {
      const anim = this.spriteDraft.animations.find((candidate) => candidate.id === animId);
      if (!anim) return;
      if (anim.frames.length) {
        const confirmed = await window.LucidEditor.ui.confirm({
          title: "Animation loeschen",
          message: `Animation "${anim.name}" mit ${anim.frames.length} Frames wirklich loeschen?`,
          confirmLabel: "Loeschen",
          danger: true,
        });
        if (!confirmed) return;
      }

      this.pushSpriteUndo();
      this.spriteDraft.animations = this.spriteDraft.animations.filter((candidate) => candidate.id !== animId);
      if (this.spriteDraft.activeAnimationId === animId) {
        this.spriteDraft.activeAnimationId = this.spriteDraft.animations[0]?.id || null;
      }
      this.syncSpriteCanvas();
      this.setStatus("Animation geloescht.");
      this.render();
    }

    addSpriteFrame(rect) {
      if (!this.spriteDraft.activeSheetId) return;
      this.pushSpriteUndo();
      const anim = this.ensureActiveSpriteAnimation();
      const sheetId = this.spriteDraft.activeSheetId;

      const existing = anim.frames.find((frame) =>
        frame.sheetId === sheetId && frame.x === rect.x && frame.y === rect.y && frame.w === rect.w && frame.h === rect.h);

      if (existing) {
        // Zweiter Klick auf dasselbe Sprite entfernt es wieder.
        anim.frames = anim.frames.filter((frame) => frame !== existing);
        this.setStatus(`Frame entfernt (${anim.frames.length}).`);
      } else {
        // Manuelle Auswahl behaelt die Klick-Reihenfolge (keine Positionssortierung).
        anim.frames.push({ id: `frame-${this.spriteFrameCounter++}`, sheetId, ...rect });
        this.setStatus(`Frame erfasst (${anim.frames.length}).`);
      }

      this.syncSpriteCanvas();
      this.render();
    }

    // Manuell mit dem Zeichnen-Werkzeug aufgezogener Frame. Gibt die neue
    // Frame-ID zurueck, damit die Canvas ihn direkt selektieren kann.
    addSpriteFrameRect(rect) {
      if (!this.spriteDraft.activeSheetId) return null;
      this.pushSpriteUndo();
      const anim = this.ensureActiveSpriteAnimation();
      const sheetId = this.spriteDraft.activeSheetId;
      const id = `frame-${this.spriteFrameCounter++}`;
      anim.frames.push({
        id,
        sheetId,
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        w: Math.max(1, Math.round(rect.w)),
        h: Math.max(1, Math.round(rect.h)),
      });
      this.setStatus(`Frame gezeichnet (${anim.frames.length}).`);
      this.syncSpriteCanvas();
      this.render();
      return id;
    }

    // Snapshot beim Start einer Griff-/Verschiebe-Bearbeitung merken; erst bei
    // tatsaechlicher Aenderung (finishSpriteFrameEdit) in die Historie legen.
    beginSpriteFrameEdit() {
      this.pendingSpriteEdit = this.snapshotSpriteDraft();
    }

    updateSpriteFrameRect(id, rect) {
      const anim = this.getActiveSpriteAnimation();
      if (!anim) return;
      const frame = anim.frames.find((entry) => entry.id === id);
      if (!frame) return;
      frame.x = Math.round(rect.x);
      frame.y = Math.round(rect.y);
      frame.w = Math.max(1, Math.round(rect.w));
      frame.h = Math.max(1, Math.round(rect.h));
      this.syncSpriteCanvas();
    }

    finishSpriteFrameEdit(changed) {
      if (changed && this.pendingSpriteEdit) {
        this.spriteHistory.undo.push(this.pendingSpriteEdit);
        if (this.spriteHistory.undo.length > HISTORY_LIMIT) this.spriteHistory.undo.shift();
        this.spriteHistory.redo = [];
        this.setStatus("Frame angepasst.");
      }
      this.pendingSpriteEdit = null;
      this.syncSpriteCanvas();
      this.render();
    }

    detectAllSpriteFrames() {
      if (!this.spriteDraft.activeSheetId) return;
      const rects = this.spriteCanvasView.detectAllFrames();
      if (!rects.length) {
        this.setStatusAndRefreshSprite("Keine rot umrandeten Frames gefunden.");
        return;
      }

      this.pushSpriteUndo();
      const anim = this.ensureActiveSpriteAnimation();
      const sheetId = this.spriteDraft.activeSheetId;
      let added = 0;
      rects.forEach((rect) => {
        const duplicate = anim.frames.some((frame) =>
          frame.sheetId === sheetId && frame.x === rect.x && frame.y === rect.y && frame.w === rect.w && frame.h === rect.h);
        if (!duplicate) {
          anim.frames.push({ id: `frame-${this.spriteFrameCounter++}`, sheetId, ...rect });
          added += 1;
        }
      });

      this.syncSpriteCanvas();
      this.setStatus(added ? `${added} Frames uebernommen.` : "Alle erkannten Frames waren bereits erfasst.");
      this.render();
    }

    clearSpriteFrames() {
      const anim = this.getActiveSpriteAnimation();
      if (!anim || !anim.frames.length) return;
      this.pushSpriteUndo();
      anim.frames = [];
      this.syncSpriteCanvas();
      this.setStatus("Frames der Animation geleert.");
      this.render();
    }

    removeSpriteFrame(frameId) {
      const anim = this.getActiveSpriteAnimation();
      if (!anim) return;
      this.pushSpriteUndo();
      anim.frames = anim.frames.filter((frame) => frame.id !== frameId);
      this.syncSpriteCanvas();
      this.render();
    }

    reorderSpriteFrames(fromId, toId, placeAfter = false) {
      const anim = this.getActiveSpriteAnimation();
      if (!anim) return;
      const frames = anim.frames;
      const fromIndex = frames.findIndex((frame) => frame.id === fromId);
      if (fromIndex === -1) return;

      this.pushSpriteUndo();
      const [moved] = frames.splice(fromIndex, 1);
      let insertAt = frames.findIndex((frame) => frame.id === toId);
      if (insertAt === -1) insertAt = frames.length;
      else if (placeAfter) insertAt += 1;
      frames.splice(insertAt, 0, moved);

      this.syncSpriteCanvas();
      this.render();
    }

    setStatus(message) {
      this.state.editorState.statusMessage = message;
    }

    getHistory(levelId = this.state.editorState.activeLevelId) {
      if (!this.state.runtime.histories[levelId]) {
        this.state.runtime.histories[levelId] = { undo: [], redo: [] };
      }
      return this.state.runtime.histories[levelId];
    }

    snapshotLevel(levelId = this.state.editorState.activeLevelId) {
      const level = getLevelById(this.state, levelId);
      return level ? deepClone(level) : null;
    }

    pushUndoSnapshot(levelId, snapshot) {
      if (!snapshot) return;
      const history = this.getHistory(levelId);
      history.undo.push(snapshot);
      if (history.undo.length > HISTORY_LIMIT) history.undo.shift();
      history.redo = [];
    }

    replaceLevel(levelId, nextLevel) {
      const levelIndex = this.state.levels.findIndex((level) => level.id === levelId);
      if (levelIndex === -1) return;
      this.state.levels[levelIndex] = deepClone(nextLevel);
      this.normalizeProjectAfterMutation();
    }

    normalizeProjectAfterMutation() {
      const activeLevel = getActiveLevel(this.state);
      if (!activeLevel) return;

      activeLevel.layers.sort((left, right) => left.order - right.order);
      activeLevel.entities.sort((left, right) => left.order - right.order);

      if (!activeLevel.layers.some((layer) => layer.id === this.state.editorState.activeLayerId)) {
        this.state.editorState.activeLayerId = activeLevel.layers.find((layer) => layer.visible)?.id || activeLevel.layers[0]?.id || null;
      }

      const validEntityIds = new Set(activeLevel.entities.map((entity) => entity.id));
      this.state.editorState.selectedEntityIds = (this.state.editorState.selectedEntityIds || []).filter((entityId) => validEntityIds.has(entityId));
      this.state.editorState.camera = clampCamera(this.state.editorState.camera);

      const startLevel = getLevelById(this.state, this.state.startLevelId);
      if (!startLevel || startLevel.active === false) {
        const fallbackLevel = this.state.levels.find((level) => level.active !== false) || activeLevel;
        if (fallbackLevel) {
          fallbackLevel.active = true;
          this.state.startLevelId = fallbackLevel.id;
        }
      }
    }

    commitLevelChange(statusMessage, mutator) {
      const activeLevel = getActiveLevel(this.state);
      if (!activeLevel) return;

      const beforeSnapshot = this.snapshotLevel(activeLevel.id);
      mutator(activeLevel);
      this.pushUndoSnapshot(activeLevel.id, beforeSnapshot);
      this.normalizeProjectAfterMutation();
      this.setStatus(statusMessage);
      this.render();
    }

    canUndo() {
      return this.getHistory().undo.length > 0;
    }

    canRedo() {
      return this.getHistory().redo.length > 0;
    }

    undo() {
      const activeLevel = getActiveLevel(this.state);
      if (!activeLevel) return;

      const history = this.getHistory(activeLevel.id);
      const snapshot = history.undo.pop();
      if (!snapshot) return;

      history.redo.push(this.snapshotLevel(activeLevel.id));
      this.replaceLevel(activeLevel.id, snapshot);
      this.setStatus("Undo ausgefuehrt.");
      this.render();
    }

    redo() {
      const activeLevel = getActiveLevel(this.state);
      if (!activeLevel) return;

      const history = this.getHistory(activeLevel.id);
      const snapshot = history.redo.pop();
      if (!snapshot) return;

      history.undo.push(this.snapshotLevel(activeLevel.id));
      this.replaceLevel(activeLevel.id, snapshot);
      this.setStatus("Redo ausgefuehrt.");
      this.render();
    }

    selectWorkspace(workspaceId) {
      const workspace = WORKSPACE_DEFINITIONS.find((candidate) => candidate.id === workspaceId);
      if (!workspace) return;

      if (!workspace.available) {
        this.setStatus(workspace.description);
        this.renderViewport();
        return;
      }

      this.state.editorState.activeWorkspace = workspaceId;
      this.setStatus(`Workspace aktiv: ${workspace.label}`);
      this.render();

      // Die jetzt sichtbar gewordene Canvas neu vermessen, damit Zeichnung
      // und Maus deckungsgleich sind (analog zum Panel-Einklappen).
      if (workspaceId === "sprite-editor") this.spriteCanvasView.handleResize();
      else this.canvasView.handleResize();
    }

    toggleNav() {
      this.state.editorState.navCollapsed = !this.state.editorState.navCollapsed;
      this.render();
      this.canvasView.handleResize();
    }

    renderPanelCollapse() {
      const leftCollapsed = this.state.editorState.leftPanelCollapsed === true;
      const rightCollapsed = this.state.editorState.rightPanelCollapsed === true;

      // Geteilte Collapse-Praeferenz fuer Level- und Sprite-Workspace, damit
      // sich beide Sidebars konsistent verhalten.
      [this.elements.panelLeft, this.elements.spritePanelLeft].forEach((node) => node?.classList.toggle("is-collapsed", leftCollapsed));
      [this.elements.panelRight, this.elements.spritePanelRight].forEach((node) => node?.classList.toggle("is-collapsed", rightCollapsed));
      [this.elements.workspaceGrid, this.elements.spriteWorkspace].forEach((node) => {
        node?.classList.toggle("left-collapsed", leftCollapsed);
        node?.classList.toggle("right-collapsed", rightCollapsed);
      });

      const leftIcon = leftCollapsed ? "expand" : "collapse";
      const rightIcon = rightCollapsed ? "collapse" : "expand";
      [this.elements.toggleLeftPanel, this.elements.toggleSpriteLeftPanel].forEach((node) => {
        if (!node) return;
        node.innerHTML = renderIcon(leftIcon);
        node.title = leftCollapsed ? "Linke Sidebar ausklappen" : "Linke Sidebar einklappen";
      });
      [this.elements.toggleRightPanel, this.elements.toggleSpriteRightPanel].forEach((node) => {
        if (!node) return;
        node.innerHTML = renderIcon(rightIcon);
        node.title = rightCollapsed ? "Rechte Sidebar ausklappen" : "Rechte Sidebar einklappen";
      });
    }

    togglePanel(side) {
      if (side === "left") {
        this.state.editorState.leftPanelCollapsed = !this.state.editorState.leftPanelCollapsed;
      } else {
        this.state.editorState.rightPanelCollapsed = !this.state.editorState.rightPanelCollapsed;
      }
      this.render();
      this.resizeActiveCanvas();
    }

    resizeActiveCanvas() {
      if (this.state.editorState.activeWorkspace === "sprite-editor") {
        this.spriteCanvasView.handleResize();
        this.spritePreviewView.handleResize();
      } else {
        this.canvasView.handleResize();
      }
    }

    selectTool(toolId) {
      const tool = TOOL_DEFINITIONS.find((candidate) => candidate.id === toolId);
      if (!tool) return;

      if (tool.available === false) {
        this.setStatus(tool.description);
        this.renderViewport();
        return;
      }

      if (this.state.editorState.activeTool !== toolId) {
        this.canvasView.cancelDrafts();
      }

      this.state.editorState.activeTool = toolId;
      this.setStatus(`Werkzeug aktiv: ${tool.label}`);
      this.render();
    }

    resetZoom() {
      this.state.editorState.camera = {
        ...this.state.editorState.camera,
        zoom: 1,
      };
      this.setStatus("Zoom auf 100% gesetzt.");
      this.renderViewport();
    }

    toggleSection(section, isOpen) {
      this.state.editorState.openSections[section] = isOpen;
    }

    selectLibraryItem(libraryItemId) {
      this.state.editorState.selectedLibraryItemId = libraryItemId;
      this.setStatus(`Library-Item ausgewaehlt: ${getSelectedLibraryItem(this.state)?.label || libraryItemId}`);
      this.render();
    }

    toggleLibraryItem(libraryItemId) {
      this.state.editorState.expandedLibraryItemId = this.state.editorState.expandedLibraryItemId === libraryItemId ? null : libraryItemId;
      this.render();
    }

    updateLibraryQuery(value) {
      this.state.editorState.libraryQuery = value;
      this.render();
    }

    getPlacementLayerOrReport() {
      const placementState = canPlaceOnActiveLayer(this.state);
      if (!placementState.ok) {
        this.setStatus(placementState.reason);
        this.renderViewport();
        return null;
      }
      return placementState.layer;
    }

    placeLibraryItemAtCenter(libraryItemId = null) {
      if (libraryItemId) {
        this.state.editorState.selectedLibraryItemId = libraryItemId;
        this.state.editorState.expandedLibraryItemId = libraryItemId;
      }

      const layer = this.getPlacementLayerOrReport();
      if (!layer) return;

      const item = getSelectedLibraryItem(this.state);
      if (!item) {
        this.setStatus("Kein Library-Item ausgewaehlt.");
        this.renderViewport();
        return;
      }

      const center = this.canvasView.getCanvasCenterWorld(this.state, layer.parallax);

      this.commitLevelChange(`Instanz platziert: ${item.label}`, (level) => {
        const entity = instantiateSelectedLibraryItem(this.state, {
          x: Math.round(center.x),
          y: Math.round(center.y),
        });
        if (!entity) return;
        level.entities.push(entity);
        this.state.editorState.selectedEntityIds = [entity.id];
        this.state.editorState.openSections.library = true;
        this.state.editorState.openSections.info = true;
        this.state.editorState.openSections.properties = true;
      });
    }

    addLayer() {
      const activeLevel = getActiveLevel(this.state);
      if (!activeLevel) return;

      this.commitLevelChange("Neue Ebene angelegt.", (level) => {
        const nextOrder = level.layers.reduce((highest, layer) => Math.max(highest, layer.order), -1) + 1;
        const layerId = `layer-${this.state.runtime.counters.layer++}`;
        const layer = {
          id: layerId,
          name: `Ebene ${nextOrder + 1}`,
          visible: true,
          locked: false,
          parallax: 1,
          order: nextOrder,
        };

        level.layers.push(layer);
        this.state.editorState.activeLayerId = layerId;
      });
    }

    async deleteActiveLayer() {
      const activeLevel = getActiveLevel(this.state);
      const activeLayer = getActiveLayer(this.state);
      if (!activeLevel || !activeLayer) return;

      if (activeLevel.layers.length <= 1) {
        this.setStatus("Die letzte Ebene kann nicht geloescht werden.");
        this.renderViewport();
        return;
      }

      const confirmed = await window.LucidEditor.ui.confirm({
        title: "Ebene loeschen",
        message: `Ebene "${activeLayer.name}" und alle zugeordneten Inhalte wirklich loeschen?`,
        confirmLabel: "Loeschen",
        danger: true,
      });
      if (!confirmed) return;

      this.commitLevelChange(`Ebene geloescht: ${activeLayer.name}`, (level) => {
        level.layers = level.layers.filter((layer) => layer.id !== activeLayer.id);
        level.entities = level.entities.filter((entity) => entity.layerId !== activeLayer.id);
        this.state.editorState.activeLayerId = level.layers.find((layer) => layer.visible)?.id || level.layers[0]?.id || null;
        this.state.editorState.selectedEntityIds = [];
      });
    }

    selectLayer(layerId) {
      const level = getActiveLevel(this.state);
      const layer = level?.layers.find((candidate) => candidate.id === layerId);
      if (!layer) return;

      if (!layer.visible) {
        this.setStatus("Unsichtbare Layer koennen nicht als Arbeitsebene aktiviert werden.");
        this.renderViewport();
        return;
      }

      this.state.editorState.activeLayerId = layerId;
      this.setStatus(`Aktive Ebene: ${layer.name}`);
      this.render();
    }

    toggleLayerVisibility(layerId) {
      const level = getActiveLevel(this.state);
      const layer = level?.layers.find((candidate) => candidate.id === layerId);
      if (!layer) return;

      this.commitLevelChange(`Layer ${layer.visible ? "ausgeblendet" : "eingeblendet"}: ${layer.name}`, (currentLevel) => {
        const currentLayer = currentLevel.layers.find((candidate) => candidate.id === layerId);
        currentLayer.visible = !currentLayer.visible;
      });
    }

    toggleLayerLock(layerId) {
      const level = getActiveLevel(this.state);
      const layer = level?.layers.find((candidate) => candidate.id === layerId);
      if (!layer) return;

      this.commitLevelChange(`Layer ${layer.locked ? "entsperrt" : "gesperrt"}: ${layer.name}`, (currentLevel) => {
        const currentLayer = currentLevel.layers.find((candidate) => candidate.id === layerId);
        currentLayer.locked = !currentLayer.locked;
      });
    }

    updateLayer(layerId, patch) {
      const level = getActiveLevel(this.state);
      const layer = level?.layers.find((candidate) => candidate.id === layerId);
      if (!layer) return;

      this.commitLevelChange(`Layer aktualisiert: ${layer.name}`, (currentLevel) => {
        const currentLayer = currentLevel.layers.find((candidate) => candidate.id === layerId);
        if (Number.isFinite(patch.parallax)) currentLayer.parallax = patch.parallax;
        if (Number.isFinite(patch.order)) currentLayer.order = Math.round(patch.order);
      });
    }

    selectEntity(entityId, { mode = "replace" } = {}) {
      const selectedIds = new Set(this.state.editorState.selectedEntityIds || []);

      if (!entityId) {
        this.state.editorState.selectedEntityIds = [];
        this.setStatus("Auswahl aufgehoben.");
        this.render();
        return;
      }

      if (mode === "toggle") {
        if (selectedIds.has(entityId)) {
          selectedIds.delete(entityId);
        } else {
          selectedIds.add(entityId);
        }
        this.state.editorState.selectedEntityIds = Array.from(selectedIds);
      } else {
        this.state.editorState.selectedEntityIds = [entityId];
      }

      if (this.state.editorState.selectedEntityIds.length) {
        this.state.editorState.openSections.info = true;
        this.state.editorState.openSections.properties = true;
      }

      const selectedCount = this.state.editorState.selectedEntityIds.length;
      this.setStatus(selectedCount > 1 ? `${selectedCount} Elemente markiert.` : `Auswahl: ${getPrimarySelectedEntity(this.state)?.name || entityId}`);
      this.render();
    }

    beginSelectionMove(entityIds) {
      const activeLevel = getActiveLevel(this.state);
      if (!activeLevel || !entityIds.length) return;

      const originalPositions = Object.fromEntries(
        activeLevel.entities
          .filter((entity) => entityIds.includes(entity.id))
          .map((entity) => [entity.id, { x: entity.x, y: entity.y }])
      );

      this.pendingLevelMove = {
        levelId: activeLevel.id,
        snapshot: this.snapshotLevel(activeLevel.id),
        entityIds: entityIds.slice(),
        originalPositions,
      };
    }

    moveSelection(delta) {
      if (!this.pendingLevelMove) return;

      const level = getActiveLevel(this.state);
      if (!level) return;

      level.entities.forEach((entity) => {
        const start = this.pendingLevelMove.originalPositions[entity.id];
        if (!start) return;
        entity.x = start.x + delta.x;
        entity.y = start.y + delta.y;
      });

      this.renderViewport();
    }

    finishSelectionMove(changed) {
      if (!this.pendingLevelMove) return;

      if (changed) {
        this.pushUndoSnapshot(this.pendingLevelMove.levelId, this.pendingLevelMove.snapshot);
        this.setStatus("Auswahl verschoben.");
      }

      this.pendingLevelMove = null;
      this.render();
    }

    beginShapeEdit(entityId) {
      const activeLevel = getActiveLevel(this.state);
      if (!activeLevel) return;

      this.pendingShapeEdit = {
        levelId: activeLevel.id,
        entityId,
        snapshot: this.snapshotLevel(activeLevel.id),
      };
    }

    getPendingShapeEntity() {
      if (!this.pendingShapeEdit) return null;
      const level = getActiveLevel(this.state);
      if (!level || level.id !== this.pendingShapeEdit.levelId) return null;
      const entity = level.entities.find((candidate) => candidate.id === this.pendingShapeEdit.entityId);
      return entity || null;
    }

    updateShapeRect(bounds) {
      const entity = this.getPendingShapeEntity();
      if (!entity) return;

      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));

      // Bei Sprites/Grafiken ist entity.x/y der Pivot-Anker, nicht die obere
      // linke Ecke. Deshalb den Anker aus den neuen Bounds + Pivot ableiten.
      const pivot = getEntityPresentation(this.state, entity).pivot || { x: 0, y: 0 };
      entity.x = Math.round(bounds.x + width * pivot.x);
      entity.y = Math.round(bounds.y + height * pivot.y);
      if (!entity.properties) entity.properties = {};
      entity.properties.width = width;
      entity.properties.height = height;
      this.renderViewport();
    }

    updateShapePolygon(absolutePoints) {
      const entity = this.getPendingShapeEntity();
      if (!entity || !Array.isArray(absolutePoints) || absolutePoints.length < 3) return;

      const relative = toRelativePoints(absolutePoints);
      entity.x = Math.round(relative.x);
      entity.y = Math.round(relative.y);
      entity.properties.points = relative.points.map((point) => ({
        x: Math.round(point.x),
        y: Math.round(point.y),
      }));
      this.renderViewport();
    }

    finishShapeEdit(changed) {
      if (!this.pendingShapeEdit) return;

      if (changed) {
        this.pushUndoSnapshot(this.pendingShapeEdit.levelId, this.pendingShapeEdit.snapshot);
        this.setStatus("Form angepasst.");
      }

      this.pendingShapeEdit = null;
      this.normalizeProjectAfterMutation();
      this.render();
    }

    createLogicRectangle(bounds) {
      const layer = this.getPlacementLayerOrReport();
      if (!layer) return;

      this.commitLevelChange("Rechteck-Zone angelegt.", (level) => {
        const entity = createLogicRectFromBounds(this.state, bounds);
        if (!entity) return;
        level.entities.push(entity);
        this.state.editorState.selectedEntityIds = [entity.id];
        this.state.editorState.openSections.info = true;
        this.state.editorState.openSections.properties = true;
      });
    }

    createLogicPolygon(points) {
      const layer = this.getPlacementLayerOrReport();
      if (!layer) return;

      this.commitLevelChange("Polygon-Zone angelegt.", (level) => {
        const entity = createLogicPolygonFromPoints(this.state, points);
        if (!entity) return;
        level.entities.push(entity);
        this.state.editorState.selectedEntityIds = [entity.id];
        this.state.editorState.openSections.info = true;
        this.state.editorState.openSections.properties = true;
      });
    }

    deleteSelectedEntities() {
      const selectedIds = new Set(this.state.editorState.selectedEntityIds || []);
      if (!selectedIds.size) return;

      this.commitLevelChange("Auswahl geloescht.", (level) => {
        level.entities = level.entities.filter((entity) => !selectedIds.has(entity.id));
        this.state.editorState.selectedEntityIds = [];
      });
    }

    updateSelectedEntity(field, rawValue) {
      const entity = getPrimarySelectedEntity(this.state);
      if (!entity) return;

      this.commitLevelChange(`Eigenschaften aktualisiert: ${entity.name}`, (level) => {
        const currentEntity = level.entities.find((candidate) => candidate.id === entity.id);
        if (!currentEntity) return;

        if (field === "name" || field === "layerId") {
          currentEntity[field] = rawValue;
          return;
        }

        if (field === "visible" || field === "locked") {
          currentEntity[field] = rawValue === "true";
          return;
        }

        const numericValue = Number(rawValue);
        if (Number.isFinite(numericValue)) {
          currentEntity[field] = Math.round(numericValue);
        }
      });
    }

    updateSelectedLogic(field, rawValue) {
      const entity = getPrimarySelectedEntity(this.state);
      if (!entity || entity.type !== "logic") return;

      this.commitLevelChange(`Logic aktualisiert: ${entity.name}`, (level) => {
        const currentEntity = level.entities.find((candidate) => candidate.id === entity.id);
        if (!currentEntity) return;

        if (field === "logicType") {
          currentEntity.properties.logicType = rawValue;
          currentEntity.name = rawValue === "spawn" ? "Spawn" : currentEntity.name;
          return;
        }

        const numericValue = Number(rawValue);
        if (Number.isFinite(numericValue)) {
          currentEntity.properties[field] = Math.max(1, Math.round(numericValue));
        }
      });
    }

    updateLevelField(group, field, rawValue) {
      const level = getActiveLevel(this.state);
      if (!level) return;

      this.commitLevelChange("Level Settings aktualisiert.", (currentLevel) => {
        if (group === "level") {
          if (field === "active") {
            const nextActive = rawValue === "true";
            if (!nextActive && this.state.startLevelId === currentLevel.id) {
              this.setStatus("Das Start-Level muss aktiv bleiben.");
              return;
            }
            currentLevel.active = nextActive;
            return;
          }

          if (field === "background") {
            currentLevel.background = rawValue || currentLevel.background;
            return;
          }

          if (field === "version") {
            currentLevel.version = Math.max(1, toNumberOrFallback(rawValue, currentLevel.version));
            return;
          }

          currentLevel[field] = rawValue;
          return;
        }

        if (group === "bounds") {
          currentLevel.bounds[field] = Math.round(toNumberOrFallback(rawValue, currentLevel.bounds[field]));
          return;
        }

        if (group === "cameraStart") {
          currentLevel.cameraStart[field] = Math.round(toNumberOrFallback(rawValue, currentLevel.cameraStart[field]));
          return;
        }

        if (group === "settings") {
          if (field === "gravity") {
            currentLevel.settings.gravity = rawValue === "" ? null : toNumberOrFallback(rawValue, currentLevel.settings.gravity);
            return;
          }
          currentLevel.settings[field] = rawValue;
        }
      });
    }

    updateCamera(camera) {
      this.state.editorState.camera = clampCamera(camera);
      this.renderViewport();
    }

    saveProject() {
      const savedAt = downloadProject(this.state);
      this.state.meta.lastSavedAt = savedAt;
      this.setStatus(`Projekt gespeichert: ${savedAt}`);
      this.render();
    }

    openLoadDialog() {
      this.elements.projectFileInput.click();
    }

    async loadProject(event) {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const snapshot = await readProjectFile(file);
        this.state = createStateFromSnapshot(snapshot);
        this.pendingLevelMove = null;
        this.pendingShapeEdit = null;
        this.setStatus(`Projekt geladen: ${this.state.meta.projectName}`);
        this.render();
      } catch (error) {
        this.setStatus(`Fehler beim Laden: ${error.message}`);
        this.renderViewport();
      } finally {
        event.target.value = "";
      }
    }

    handleKeyDown(event) {
      if (isTextInputElement(event.target)) return;

      const isSprite = this.state.editorState.activeWorkspace === "sprite-editor";

      // Undo/Redo gelten in beiden Workspaces.
      if (event.ctrlKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (isSprite) this.undoSprite(); else this.undo();
        return;
      }
      if (event.ctrlKey && event.key.toLowerCase() === "y") {
        event.preventDefault();
        if (isSprite) this.redoSprite(); else this.redo();
        return;
      }

      // Werkzeug-Kuerzel und Frame-Loeschen im Sprite-Editor; danach Schluss.
      if (isSprite) {
        if (event.key === "Delete" || event.key === "Backspace") {
          const id = this.spriteCanvasView.selectedFrameId;
          if (id) {
            event.preventDefault();
            this.removeSpriteFrame(id);
          }
          return;
        }
        if (!event.ctrlKey && !event.metaKey && !event.altKey) {
          const spriteTools = { v: "pick", m: "draw", h: "pan", z: "zoom" };
          const tool = spriteTools[event.key.toLowerCase()];
          if (tool) {
            event.preventDefault();
            this.selectSpriteTool(tool);
          }
        }
        return;
      }

      if (event.ctrlKey && event.key === "0") {
        event.preventDefault();
        this.resetZoom();
        return;
      }

      if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault();
        this.setStatus("Playtest ist vorbereitet, kommt aber nach dem Werkzeug- und Geometry-Block.");
        this.renderViewport();
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        this.deleteSelectedEntities();
        return;
      }

      if (event.key === "Escape") {
        this.canvasView.cancelDrafts();
        this.state.editorState.activeTool = "select";
        this.state.editorState.selectedEntityIds = [];
        this.setStatus("Neutraler Zustand wiederhergestellt.");
        this.render();
        return;
      }

      // Werkzeug-Kuerzel direkt aus den Tool-Definitionen ableiten.
      const mappedTool = TOOL_DEFINITIONS.find((tool) =>
        typeof tool.shortcut === "string" && tool.shortcut.length === 1 && tool.shortcut.toLowerCase() === event.key.toLowerCase());
      if (mappedTool) {
        event.preventDefault();
        this.selectTool(mappedTool.id);
      }
    }
  }

  window.LucidEditor.controllers = window.LucidEditor.controllers || {};
  window.LucidEditor.controllers.EditorController = EditorController;
})();
