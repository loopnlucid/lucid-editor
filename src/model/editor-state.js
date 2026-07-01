(() => {
  "use strict";

  const {
    DEFAULT_LAYERS,
    DEFAULT_LIBRARY_ITEMS,
    DEFAULT_OPEN_SECTIONS,
    PROJECT_SCHEMA_VERSION,
  } = window.LucidEditor.config;
  const { deepClone } = window.LucidEditor.utils;

  function createEntityFromItem(item, { id, layerId, x, y, name, properties = {} }) {
  return {
    id,
    libraryItemId: item.id,
    layerId,
    name: name || item.label,
    x,
    y,
    w: item.size.w,
    h: item.size.h,
    rotation: 0,
    visible: true,
    properties: {
      ...(item.defaultProperties || {}),
      ...properties,
    },
  };
  }

  function getNextCounterValue(items, prefix) {
  const values = items
    .map((item) => String(item.id || ""))
    .map((id) => id.startsWith(prefix) ? Number(id.slice(prefix.length)) : 0)
    .filter((value) => Number.isFinite(value));

  return (values.length ? Math.max(...values) : 0) + 1;
  }

  function createStarterEntities(layers, libraryItems) {
  const byId = Object.fromEntries(libraryItems.map((item) => [item.id, item]));
  const midgroundLayerId = layers.find((layer) => layer.type === "midground")?.id || layers[0].id;
  const playLayerId = layers.find((layer) => layer.type === "play")?.id || layers[0].id;
  const foregroundLayerId = layers.find((layer) => layer.type === "foreground")?.id || layers[0].id;

  return [
    createEntityFromItem(byId["tree-oak-01"], { id: "entity-1", layerId: midgroundLayerId, x: -240, y: 50 }),
    createEntityFromItem(byId["solid-block"], { id: "entity-2", layerId: playLayerId, x: -120, y: 220 }),
    createEntityFromItem(byId["hero-main"], { id: "entity-3", layerId: playLayerId, x: 30, y: 130 }),
    createEntityFromItem(byId["torch-animated"], { id: "entity-4", layerId: foregroundLayerId, x: 260, y: 60 }),
  ];
  }

  function createInitialState() {
  const layers = deepClone(DEFAULT_LAYERS);
  const libraryItems = deepClone(DEFAULT_LIBRARY_ITEMS);
  const entities = createStarterEntities(layers, libraryItems);
  const activeLayerId = layers.find((layer) => layer.type === "play")?.id || layers[0].id;

  return {
    meta: {
      projectName: "Lucid Editor Prototype",
      schemaVersion: PROJECT_SCHEMA_VERSION,
      lastSavedAt: null,
    },
    layers,
    activeLayerId,
    libraryItems,
    selectedLibraryItemId: libraryItems[0]?.id || null,
    selectedEntityId: entities[0]?.id || null,
    entities,
    spawn: { x: 180, y: 220 },
    camera: { x: 0, y: 0, zoom: 1 },
    ui: {
      openSections: deepClone(DEFAULT_OPEN_SECTIONS),
      statusMessage: "Neues Lucid-Editor-Projekt initialisiert.",
    },
    counters: {
      layer: getNextCounterValue(layers, "layer-"),
      entity: getNextCounterValue(entities, "entity-"),
    },
  };
  }

  function createStateFromSnapshot(snapshot) {
  const libraryItems = Array.isArray(snapshot.libraryItems) && snapshot.libraryItems.length
    ? deepClone(snapshot.libraryItems)
    : deepClone(DEFAULT_LIBRARY_ITEMS);

  const layers = Array.isArray(snapshot.layers) && snapshot.layers.length
    ? deepClone(snapshot.layers)
    : deepClone(DEFAULT_LAYERS);

  const entities = Array.isArray(snapshot.entities) ? deepClone(snapshot.entities) : [];
  const activeLayerId = layers.some((layer) => layer.id === snapshot.activeLayerId)
    ? snapshot.activeLayerId
    : layers.find((layer) => layer.type === "play")?.id || layers[0]?.id || null;

  return {
    meta: {
      projectName: snapshot.meta?.projectName || "Lucid Editor Projekt",
      schemaVersion: snapshot.meta?.schemaVersion || PROJECT_SCHEMA_VERSION,
      lastSavedAt: snapshot.meta?.lastSavedAt || null,
    },
    layers,
    activeLayerId,
    libraryItems,
    selectedLibraryItemId: libraryItems.some((item) => item.id === snapshot.selectedLibraryItemId)
      ? snapshot.selectedLibraryItemId
      : libraryItems[0]?.id || null,
    selectedEntityId: entities.some((entity) => entity.id === snapshot.selectedEntityId)
      ? snapshot.selectedEntityId
      : null,
    entities,
    spawn: snapshot.spawn || { x: 180, y: 220 },
    camera: snapshot.camera || { x: 0, y: 0, zoom: 1 },
    ui: {
      openSections: {
        ...deepClone(DEFAULT_OPEN_SECTIONS),
        ...(snapshot.ui?.openSections || {}),
      },
      statusMessage: "Projekt geladen.",
    },
    counters: {
      layer: snapshot.counters?.layer || getNextCounterValue(layers, "layer-"),
      entity: snapshot.counters?.entity || getNextCounterValue(entities, "entity-"),
    },
  };
  }

  function getLayer(state, layerId) {
    return state.layers.find((layer) => layer.id === layerId) || null;
  }

  function getSelectedEntity(state) {
    return state.entities.find((entity) => entity.id === state.selectedEntityId) || null;
  }

  function getLibraryItem(state, libraryItemId) {
    return state.libraryItems.find((item) => item.id === libraryItemId) || null;
  }

  function getSelectedLibraryItem(state) {
    return getLibraryItem(state, state.selectedLibraryItemId);
  }

  function instantiateSelectedLibraryItem(state, { x, y }) {
    const item = getSelectedLibraryItem(state);
    if (!item) return null;

    return createEntityFromItem(item, {
      id: `entity-${state.counters.entity++}`,
      layerId: state.activeLayerId,
      x,
      y,
    });
  }

  window.LucidEditor.model = {
    createInitialState,
    createStateFromSnapshot,
    getLayer,
    getSelectedEntity,
    getLibraryItem,
    getSelectedLibraryItem,
    instantiateSelectedLibraryItem,
  };
})();
