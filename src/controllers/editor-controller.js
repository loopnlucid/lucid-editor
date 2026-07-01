(() => {
  "use strict";

  const {
    createInitialState,
    createStateFromSnapshot,
    getLayer,
    getSelectedEntity,
    getSelectedLibraryItem,
    instantiateSelectedLibraryItem,
  } = window.LucidEditor.model;
  const {
    downloadProject,
    readProjectFile,
  } = window.LucidEditor.services.persistence;
  const {
    renderLayersPanel,
    renderInspectorPanel,
    CanvasView,
  } = window.LucidEditor.views;

  class EditorController {
    constructor(elements) {
      this.elements = elements;
      this.state = createInitialState();
      this.canvasView = new CanvasView(elements.canvas, {
        onSelectEntity: (entityId) => this.selectEntity(entityId),
        onMoveEntity: (entityId, position) => this.moveEntity(entityId, position),
        onCanvasDoubleClick: (position) => this.placeSelectedLibraryItem(position),
        onCameraChange: (camera) => this.updateCamera(camera),
      });
    }

  init() {
    this.bindChrome();
    this.render();
  }

  bindChrome() {
    this.elements.placeItemButton.addEventListener("click", () => this.placeSelectedLibraryItemAtCenter());
    this.elements.saveProjectButton.addEventListener("click", () => this.saveProject());
    this.elements.loadProjectButton.addEventListener("click", () => this.openLoadDialog());
    this.elements.resetCameraButton.addEventListener("click", () => this.resetCamera());
    this.elements.projectFileInput.addEventListener("change", (event) => this.loadProject(event));
  }

  render() {
    renderLayersPanel(this.elements.layersPanel, this.state, {
      onAddLayer: () => this.addLayer(),
      onSelectLayer: (layerId) => this.selectLayer(layerId),
      onToggleLayerVisibility: (layerId) => this.toggleLayerVisibility(layerId),
      onToggleLayerLock: (layerId) => this.toggleLayerLock(layerId),
      onUpdateLayer: (layerId, patch) => this.updateLayer(layerId, patch),
    });

    renderInspectorPanel(this.elements.inspectorPanel, this.state, {
      onToggleSection: (section, isOpen) => this.toggleSection(section, isOpen),
      onSelectLibraryItem: (libraryItemId) => this.selectLibraryItem(libraryItemId),
      onPlaceSelectedLibraryItem: () => this.placeSelectedLibraryItemAtCenter(),
      onDeleteSelectedEntity: () => this.deleteSelectedEntity(),
      onUpdateSelectedEntity: (field, rawValue) => this.updateSelectedEntityField(field, rawValue),
      onUpdateProjectName: (value) => this.updateProjectName(value),
      onSaveProject: () => this.saveProject(),
      onLoadProject: () => this.openLoadDialog(),
      onUpdateSpawn: (field, rawValue) => this.updateSpawn(field, rawValue),
    });

    this.elements.statusBar.textContent = this.state.ui.statusMessage;
    this.canvasView.render(this.state);
  }

  setStatus(message) {
    this.state.ui.statusMessage = message;
  }

  selectLayer(layerId) {
    if (!getLayer(this.state, layerId)) return;
    this.state.activeLayerId = layerId;
    this.setStatus(`Aktive Ebene: ${getLayer(this.state, layerId).name}`);
    this.render();
  }

  addLayer() {
    const nextNumber = this.state.counters.layer++;
    const newLayer = {
      id: `layer-${nextNumber}`,
      name: `Ebene ${nextNumber}`,
      type: "midground",
      parallax: 1,
      visible: true,
      locked: false,
    };

    this.state.layers.push(newLayer);
    this.state.activeLayerId = newLayer.id;
    this.setStatus(`Neue Ebene angelegt: ${newLayer.name}`);
    this.render();
  }

  toggleLayerVisibility(layerId) {
    const layer = getLayer(this.state, layerId);
    if (!layer) return;
    layer.visible = !layer.visible;
    this.setStatus(`${layer.name}: Sichtbarkeit ${layer.visible ? "aktiv" : "aus"}`);
    this.render();
  }

  toggleLayerLock(layerId) {
    const layer = getLayer(this.state, layerId);
    if (!layer) return;
    layer.locked = !layer.locked;
    this.setStatus(`${layer.name}: ${layer.locked ? "gesperrt" : "freigegeben"}`);
    this.render();
  }

  updateLayer(layerId, patch) {
    const layer = getLayer(this.state, layerId);
    if (!layer) return;

    if (patch.type) layer.type = patch.type;
    if (Number.isFinite(patch.parallax)) layer.parallax = patch.parallax;

    this.setStatus(`${layer.name} aktualisiert.`);
    this.render();
  }

  toggleSection(section, isOpen) {
    if (this.state.ui.openSections[section] === isOpen) return;
    this.state.ui.openSections[section] = isOpen;
    this.render();
  }

  selectLibraryItem(libraryItemId) {
    this.state.selectedLibraryItemId = libraryItemId;
    const item = getSelectedLibraryItem(this.state);
    this.setStatus(`Library-Item ausgewaehlt: ${item?.label || libraryItemId}`);
    this.render();
  }

  getActiveLayerForPlacement() {
    const layer = getLayer(this.state, this.state.activeLayerId);
    if (!layer) {
      this.setStatus("Keine aktive Ebene vorhanden.");
      this.render();
      return null;
    }

    if (layer.locked) {
      this.setStatus(`Ebene ${layer.name} ist gesperrt.`);
      this.render();
      return null;
    }

    if (!layer.visible) {
      this.setStatus(`Ebene ${layer.name} ist nicht sichtbar.`);
      this.render();
      return null;
    }

    return layer;
  }

  placeSelectedLibraryItemAtCenter() {
    const layer = this.getActiveLayerForPlacement();
    if (!layer) return;
    const center = this.canvasView.getCanvasCenterWorld(this.state, layer.parallax);
    this.placeSelectedLibraryItem({ x: Math.round(center.x), y: Math.round(center.y) });
  }

  placeSelectedLibraryItem(position) {
    const layer = this.getActiveLayerForPlacement();
    if (!layer) return;

    const entity = instantiateSelectedLibraryItem(this.state, position);
    if (!entity) {
      this.setStatus("Es ist kein Library-Item ausgewaehlt.");
      this.render();
      return;
    }

    entity.layerId = layer.id;
    this.state.entities.push(entity);
    this.state.selectedEntityId = entity.id;
    this.setStatus(`Instanz platziert: ${entity.name}`);
    this.render();
  }

  selectEntity(entityId) {
    this.state.selectedEntityId = entityId;
    this.setStatus(entityId ? `Instanz ausgewaehlt: ${getSelectedEntity(this.state)?.name || entityId}` : "Auswahl aufgehoben.");
    this.render();
  }

  moveEntity(entityId, position) {
    const entity = this.state.entities.find((candidate) => candidate.id === entityId);
    if (!entity) return;

    entity.x = position.x;
    entity.y = position.y;
    this.setStatus(`Instanz verschoben: ${entity.name}`);
    this.render();
  }

  updateSelectedEntityField(field, rawValue) {
    const entity = getSelectedEntity(this.state);
    if (!entity) return;

    if (field === "name" || field === "layerId") {
      entity[field] = rawValue;
    } else {
      const numericValue = Number(rawValue);
      if (!Number.isFinite(numericValue)) return;
      entity[field] = numericValue;
    }

    this.setStatus(`Eigenschaften aktualisiert: ${entity.name}`);
    this.render();
  }

  deleteSelectedEntity() {
    const entity = getSelectedEntity(this.state);
    if (!entity) return;

    this.state.entities = this.state.entities.filter((candidate) => candidate.id !== entity.id);
    this.state.selectedEntityId = null;
    this.setStatus(`Instanz geloescht: ${entity.name}`);
    this.render();
  }

  updateProjectName(value) {
    this.state.meta.projectName = value || "Lucid Editor Projekt";
    this.setStatus(`Projektname gesetzt: ${this.state.meta.projectName}`);
    this.render();
  }

  updateSpawn(field, rawValue) {
    const numericValue = Number(rawValue);
    if (!Number.isFinite(numericValue)) return;
    this.state.spawn[field] = numericValue;
    this.setStatus("Spawn aktualisiert.");
    this.render();
  }

  updateCamera(camera) {
    this.state.camera = camera;
    this.render();
  }

  resetCamera() {
    this.state.camera = { x: 0, y: 0, zoom: 1 };
    this.setStatus("Kamera zurueckgesetzt.");
    this.render();
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
      this.setStatus(`Projekt geladen: ${this.state.meta.projectName}`);
      this.render();
    } catch (error) {
      this.setStatus(`Fehler beim Laden: ${error.message}`);
      this.render();
    } finally {
      event.target.value = "";
    }
  }
  }

  window.LucidEditor.controllers = window.LucidEditor.controllers || {};
  window.LucidEditor.controllers.EditorController = EditorController;
})();
