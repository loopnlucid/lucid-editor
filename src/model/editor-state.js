(() => {
  "use strict";

  const {
    CAMERA_LIMITS,
    DEFAULT_CAMERA_START,
    DEFAULT_LAYERS,
    DEFAULT_LEVEL_BOUNDS,
    DEFAULT_LEVEL_SETTINGS,
    DEFAULT_LIBRARY_ITEMS,
    DEFAULT_OPEN_SECTIONS,
    DEFAULT_PROJECT_SETTINGS,
    EDITOR_VERSION,
    GRID_SIZE,
    LOGIC_LABELS,
    LOGIC_STYLE_MAP,
    PROJECT_SCHEMA_VERSION,
  } = window.LucidEditor.config;
  const {
    deepClone,
    getBoundsFromPoints,
    isFiniteNumber,
    toAbsolutePoints,
    toNumberOrFallback,
  } = window.LucidEditor.utils;

  function getNextCounterValue(items, prefix) {
    const values = items
      .map((item) => String(item.id || ""))
      .map((id) => (id.startsWith(prefix) ? Number(id.slice(prefix.length)) : 0))
      .filter((value) => Number.isFinite(value));

    return (values.length ? Math.max(...values) : 0) + 1;
  }

  function cloneLayers() {
    return deepClone(DEFAULT_LAYERS);
  }

  function normalizeAnimations(animations) {
    if (!animations || typeof animations !== "object") return {};

    const result = {};
    for (const [name, anim] of Object.entries(animations)) {
      if (!anim || typeof anim !== "object") continue;
      result[name] = {
        startFrame: Math.max(0, Math.round(toNumberOrFallback(anim.startFrame, 0))),
        frameCount: Math.max(1, Math.round(toNumberOrFallback(anim.frameCount, 1))),
        fps: Math.max(1, toNumberOrFallback(anim.fps, 12)),
        loop: anim.loop !== false,
      };
    }
    return result;
  }

  function normalizeHitbox(hitbox) {
    if (!hitbox || typeof hitbox !== "object") return null;
    return {
      x: toNumberOrFallback(hitbox.x, 0),
      y: toNumberOrFallback(hitbox.y, 0),
      w: toNumberOrFallback(hitbox.w, toNumberOrFallback(hitbox.width, 1)),
      h: toNumberOrFallback(hitbox.h, toNumberOrFallback(hitbox.height, 1)),
    };
  }

  function normalizeLibraryItem(item) {
    const type = item.type || inferLegacyLibraryType(item);
    const isSprite = type === "sprite";

    // Fuer Sprites ist die native Groesse die Frame-Groesse des Sheets.
    const frameWidth = toNumberOrFallback(
      item.frameWidth,
      toNumberOrFallback(item.size?.w, toNumberOrFallback(item.size?.width, 96))
    );
    const frameHeight = toNumberOrFallback(
      item.frameHeight,
      toNumberOrFallback(item.size?.h, toNumberOrFallback(item.size?.height, 96))
    );

    const normalized = {
      id: item.id,
      type,
      group: item.group || item.category || (type === "sprite" ? "Sprites" : "Grafik"),
      label: item.label || item.name || item.id,
      description: item.description || "",
      tags: Array.isArray(item.tags) ? item.tags.slice() : [],
      color: item.color || "#6ea3cf",
      size: {
        w: isSprite ? frameWidth : toNumberOrFallback(item.size?.w, toNumberOrFallback(item.size?.width, 96)),
        h: isSprite ? frameHeight : toNumberOrFallback(item.size?.h, toNumberOrFallback(item.size?.height, 96)),
      },
      pivot: item.pivot ? {
        x: toNumberOrFallback(item.pivot.x, 0.5),
        y: toNumberOrFallback(item.pivot.y, 1),
      } : (type === "sprite" ? { x: 0.5, y: 1 } : { x: 0, y: 0 }),
      role: item.role || null,
      defaultState: item.defaultState || "idle",
      capabilities: Array.isArray(item.capabilities) ? item.capabilities.slice() : [],
    };

    if (isSprite) {
      normalized.sheet = item.sheet || item.spriteSheet || null;
      normalized.frameWidth = frameWidth;
      normalized.frameHeight = frameHeight;
      normalized.animations = normalizeAnimations(item.animations);
      normalized.hitbox = normalizeHitbox(item.hitbox);
    }

    return normalized;
  }

  function inferLegacyLibraryType(item) {
    if (item.kind === "actor" || item.kind === "animated") return "sprite";
    if (item.kind === "collision" || item.kind === "trigger" || item.kind === "logic") return "logic";
    return "graphic";
  }

  function inferLogicType(entity, item) {
    const explicit = entity.properties?.logicType;
    if (explicit && LOGIC_LABELS[explicit]) return explicit;

    const source = `${entity.libraryItemId || ""} ${item?.label || ""} ${entity.name || ""}`.toLowerCase();
    if (source.includes("spawn")) return "spawn";
    if (source.includes("checkpoint")) return "checkpoint";
    if (source.includes("hazard")) return "hazard";
    if (source.includes("ladder")) return "ladder";
    if (source.includes("one-way") || source.includes("einbahn")) return "one-way";
    return "solid";
  }

  function createLibraryEntity(item, payload) {
    return {
      id: payload.id,
      type: item.type,
      libraryItemId: item.id,
      name: payload.name || item.label,
      x: toNumberOrFallback(payload.x, 0),
      y: toNumberOrFallback(payload.y, 0),
      layerId: payload.layerId,
      visible: payload.visible !== false,
      locked: payload.locked === true,
      order: toNumberOrFallback(payload.order, 0),
      properties: {
        ...(payload.properties || {}),
      },
    };
  }

  function createLogicEntity(payload) {
    const shape = payload.properties?.shape || "rect";

    return {
      id: payload.id,
      type: "logic",
      libraryItemId: payload.libraryItemId || null,
      name: payload.name || LOGIC_LABELS[payload.properties?.logicType || "solid"] || "Logic",
      x: toNumberOrFallback(payload.x, 0),
      y: toNumberOrFallback(payload.y, 0),
      layerId: payload.layerId,
      visible: payload.visible !== false,
      locked: payload.locked === true,
      order: toNumberOrFallback(payload.order, 0),
      properties: {
        logicType: payload.properties?.logicType || "solid",
        shape,
        width: shape === "rect" ? toNumberOrFallback(payload.properties?.width, GRID_SIZE * 4) : undefined,
        height: shape === "rect" ? toNumberOrFallback(payload.properties?.height, GRID_SIZE * 2) : undefined,
        points: shape === "polygon" ? deepClone(payload.properties?.points || []) : undefined,
        ...(payload.properties || {}),
      },
    };
  }

  function createStarterLevel(libraryItems) {
    const layers = cloneLayers();
    const byId = Object.fromEntries(libraryItems.map((item) => [item.id, item]));
    const playLayerId = layers.find((layer) => layer.id === "layer-play")?.id || layers[0].id;
    const midLayerId = layers.find((layer) => layer.id === "layer-midground")?.id || layers[0].id;
    const foregroundLayerId = layers.find((layer) => layer.id === "layer-foreground")?.id || layers[0].id;

    const entities = [
      createLibraryEntity(byId["graphic-tree-oak-01"], {
        id: "entity-1",
        layerId: midLayerId,
        x: -620,
        y: 120,
        order: 0,
      }),
      createLibraryEntity(byId["graphic-rock-cluster-01"], {
        id: "entity-2",
        layerId: foregroundLayerId,
        x: 380,
        y: 238,
        order: 0,
      }),
      createLibraryEntity(byId["sprite-hero-main"], {
        id: "entity-3",
        layerId: playLayerId,
        x: -160,
        y: 320,
        order: 1,
      }),
      createLibraryEntity(byId["sprite-torch-01"], {
        id: "entity-4",
        layerId: foregroundLayerId,
        x: 230,
        y: 286,
        order: 1,
      }),
      createLogicEntity({
        id: "entity-5",
        layerId: playLayerId,
        x: -960,
        y: 360,
        order: 2,
        properties: {
          logicType: "solid",
          shape: "rect",
          width: 1920,
          height: 180,
        },
      }),
      createLogicEntity({
        id: "entity-6",
        layerId: playLayerId,
        x: -260,
        y: 232,
        order: 3,
        properties: {
          logicType: "solid",
          shape: "rect",
          width: 260,
          height: 48,
        },
      }),
      createLogicEntity({
        id: "entity-7",
        layerId: playLayerId,
        x: -160,
        y: 320,
        order: 4,
        name: "Spawn",
        properties: {
          logicType: "spawn",
          shape: "point",
        },
      }),
    ];

    return {
      id: "level-1",
      name: "Startwiese",
      description: "",
      version: 1,
      active: true,
      tags: ["prototype", "slice"],
      order: 0,
      background: "#10202b",
      bounds: deepClone(DEFAULT_LEVEL_BOUNDS),
      cameraStart: deepClone(DEFAULT_CAMERA_START),
      thumbnail: null,
      settings: deepClone(DEFAULT_LEVEL_SETTINGS),
      layers,
      entities,
    };
  }

  function buildRuntimeState(levels) {
    const allLayers = levels.flatMap((level) => level.layers);
    const allEntities = levels.flatMap((level) => level.entities);

    return {
      counters: {
        level: getNextCounterValue(levels, "level-"),
        layer: getNextCounterValue(allLayers, "layer-"),
        entity: getNextCounterValue(allEntities, "entity-"),
      },
      histories: Object.fromEntries(levels.map((level) => [level.id, { undo: [], redo: [] }])),
    };
  }

  function createInitialState() {
    const library = deepClone(DEFAULT_LIBRARY_ITEMS).map(normalizeLibraryItem);
    const starterLevel = createStarterLevel(library);

    return {
      schemaVersion: PROJECT_SCHEMA_VERSION,
      version: EDITOR_VERSION,
      meta: {
        projectName: "Lucid Editor Demo",
        lastSavedAt: null,
      },
      projectSettings: deepClone(DEFAULT_PROJECT_SETTINGS),
      library,
      startLevelId: starterLevel.id,
      levels: [starterLevel],
      editorState: {
        activeWorkspace: "level-editor",
        navCollapsed: true,
        leftPanelCollapsed: false,
        rightPanelCollapsed: false,
        activeTool: "select",
        activeLevelId: starterLevel.id,
        activeLayerId: starterLevel.layers.find((layer) => layer.id === "layer-play")?.id || starterLevel.layers[0].id,
        selectedEntityIds: [],
        selectedLibraryItemId: library[0]?.id || null,
        expandedLibraryItemId: library[0]?.id || null,
        libraryQuery: "",
        camera: {
          x: starterLevel.cameraStart.x,
          y: starterLevel.cameraStart.y,
          zoom: 1,
        },
        openSections: deepClone(DEFAULT_OPEN_SECTIONS),
        // Zwei Farben fuer das Transparenz-Schachbrett im Sprite-Editor.
        spriteChecker: { a: "#6b7280", b: "#454b52" },
        statusMessage: "Level-Editor-Shell bereit. Waehle ein Werkzeug oder platziere ein Library-Item.",
      },
      runtime: buildRuntimeState([starterLevel]),
    };
  }

  function normalizeLayer(layer, index) {
    return {
      id: layer.id || `layer-${index + 1}`,
      name: layer.name || `Ebene ${index + 1}`,
      visible: layer.visible !== false,
      locked: layer.locked === true,
      parallax: toNumberOrFallback(layer.parallax, 1),
      order: toNumberOrFallback(layer.order, index),
    };
  }

  function normalizeEntity(entity, libraryItems, orderIndex = 0) {
    const libraryItem = getLibraryItem({ library: libraryItems }, entity.libraryItemId);
    const explicitType = entity.type || libraryItem?.type || inferLegacyLibraryType(libraryItem || {});
    const base = {
      id: entity.id || `entity-${orderIndex + 1}`,
      type: explicitType,
      libraryItemId: entity.libraryItemId || null,
      name: entity.name || libraryItem?.label || entity.id || "Entity",
      x: toNumberOrFallback(entity.x, 0),
      y: toNumberOrFallback(entity.y, 0),
      layerId: entity.layerId,
      visible: entity.visible !== false,
      locked: entity.locked === true,
      order: toNumberOrFallback(entity.order, orderIndex),
      properties: deepClone(entity.properties || {}),
    };

    if (base.type === "logic" || (libraryItem && libraryItem.type === "logic")) {
      const logicType = inferLogicType(base, libraryItem);
      const shape = base.properties.shape || (logicType === "spawn" ? "point" : (Array.isArray(base.properties.points) ? "polygon" : "rect"));

      if (shape === "rect") {
        base.properties.width = toNumberOrFallback(
          base.properties.width,
          toNumberOrFallback(entity.w, libraryItem?.size?.w || GRID_SIZE * 4)
        );
        base.properties.height = toNumberOrFallback(
          base.properties.height,
          toNumberOrFallback(entity.h, libraryItem?.size?.h || GRID_SIZE * 2)
        );
      }

      if (shape === "polygon") {
        base.properties.points = deepClone(base.properties.points || []);
      }

      base.type = "logic";
      base.properties.logicType = logicType;
      base.properties.shape = shape;
      return base;
    }

    return base;
  }

  function normalizeLevel(level, libraryItems, index = 0) {
    const layers = Array.isArray(level.layers) && level.layers.length
      ? level.layers.map(normalizeLayer).sort((left, right) => left.order - right.order)
      : cloneLayers();

    const layerIds = new Set(layers.map((layer) => layer.id));
    const fallbackLayerId = layers.find((layer) => layer.id === "layer-play")?.id || layers[0]?.id || null;

    const entities = Array.isArray(level.entities)
      ? level.entities
        .map((entity, entityIndex) => normalizeEntity(entity, libraryItems, entityIndex))
        .filter((entity) => {
          if (layerIds.has(entity.layerId)) return true;
          entity.layerId = fallbackLayerId;
          return Boolean(entity.layerId);
        })
      : [];

    return {
      id: level.id || `level-${index + 1}`,
      name: level.name || `Level ${index + 1}`,
      description: level.description || "",
      version: toNumberOrFallback(level.version, 1),
      active: level.active !== false,
      tags: Array.isArray(level.tags) ? level.tags.slice() : [],
      order: toNumberOrFallback(level.order, index),
      background: level.background || "#10202b",
      bounds: {
        x: toNumberOrFallback(level.bounds?.x, DEFAULT_LEVEL_BOUNDS.x),
        y: toNumberOrFallback(level.bounds?.y, DEFAULT_LEVEL_BOUNDS.y),
        width: toNumberOrFallback(level.bounds?.width, DEFAULT_LEVEL_BOUNDS.width),
        height: toNumberOrFallback(level.bounds?.height, DEFAULT_LEVEL_BOUNDS.height),
      },
      cameraStart: {
        x: toNumberOrFallback(level.cameraStart?.x, DEFAULT_CAMERA_START.x),
        y: toNumberOrFallback(level.cameraStart?.y, DEFAULT_CAMERA_START.y),
      },
      thumbnail: level.thumbnail || null,
      settings: {
        ...deepClone(DEFAULT_LEVEL_SETTINGS),
        ...(level.settings || {}),
      },
      layers,
      entities,
    };
  }

  function migrateLegacySnapshot(snapshot) {
    const library = (Array.isArray(snapshot.libraryItems) && snapshot.libraryItems.length
      ? snapshot.libraryItems
      : DEFAULT_LIBRARY_ITEMS).map(normalizeLibraryItem);

    const level = normalizeLevel({
      id: "level-1",
      name: "Migriertes Level",
      background: "#10202b",
      bounds: deepClone(DEFAULT_LEVEL_BOUNDS),
      cameraStart: {
        x: toNumberOrFallback(snapshot.camera?.x, DEFAULT_CAMERA_START.x),
        y: toNumberOrFallback(snapshot.camera?.y, DEFAULT_CAMERA_START.y),
      },
      settings: deepClone(DEFAULT_LEVEL_SETTINGS),
      layers: snapshot.layers,
      entities: snapshot.entities,
    }, library, 0);

    if (snapshot.spawn) {
      level.entities.push(createLogicEntity({
        id: `entity-${level.entities.length + 1}`,
        layerId: level.layers.find((layer) => layer.id === "layer-play")?.id || level.layers[0].id,
        x: toNumberOrFallback(snapshot.spawn.x, 0),
        y: toNumberOrFallback(snapshot.spawn.y, 0),
        order: level.entities.length,
        name: "Spawn",
        properties: {
          logicType: "spawn",
          shape: "point",
        },
      }));
    }

    return {
      schemaVersion: PROJECT_SCHEMA_VERSION,
      version: EDITOR_VERSION,
      meta: {
        projectName: snapshot.meta?.projectName || "Migriertes Projekt",
        lastSavedAt: snapshot.meta?.lastSavedAt || null,
      },
      projectSettings: deepClone(DEFAULT_PROJECT_SETTINGS),
      library,
      startLevelId: level.id,
      levels: [level],
      editorState: {
        activeWorkspace: "level-editor",
        navCollapsed: true,
        leftPanelCollapsed: false,
        rightPanelCollapsed: false,
        activeTool: "select",
        activeLevelId: level.id,
        activeLayerId: snapshot.activeLayerId || level.layers.find((layer) => layer.visible)?.id || level.layers[0].id,
        selectedEntityIds: snapshot.selectedEntityId ? [snapshot.selectedEntityId] : [],
        selectedLibraryItemId: snapshot.selectedLibraryItemId || library[0]?.id || null,
        expandedLibraryItemId: snapshot.selectedLibraryItemId || library[0]?.id || null,
        libraryQuery: "",
        camera: {
          x: toNumberOrFallback(snapshot.camera?.x, level.cameraStart.x),
          y: toNumberOrFallback(snapshot.camera?.y, level.cameraStart.y),
          zoom: toNumberOrFallback(snapshot.camera?.zoom, 1),
        },
        openSections: {
          ...deepClone(DEFAULT_OPEN_SECTIONS),
          ...(snapshot.ui?.openSections || {}),
        },
        statusMessage: "Legacy-Projekt geladen und auf das neue Levelmodell migriert.",
      },
      runtime: buildRuntimeState([level]),
    };
  }

  function createStateFromSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== "object") {
      return createInitialState();
    }

    if (!Array.isArray(snapshot.levels)) {
      return migrateLegacySnapshot(snapshot);
    }

    const library = (Array.isArray(snapshot.library) && snapshot.library.length
      ? snapshot.library
      : DEFAULT_LIBRARY_ITEMS).map(normalizeLibraryItem);

    const levels = snapshot.levels.map((level, index) => normalizeLevel(level, library, index));
    const activeLevelId = levels.some((level) => level.id === snapshot.editorState?.activeLevelId)
      ? snapshot.editorState.activeLevelId
      : levels.find((level) => level.active)?.id || levels[0]?.id || null;
    const activeLevel = levels.find((level) => level.id === activeLevelId) || levels[0] || null;
    const activeLayerId = activeLevel?.layers.some((layer) => layer.id === snapshot.editorState?.activeLayerId)
      ? snapshot.editorState.activeLayerId
      : activeLevel?.layers.find((layer) => layer.visible)?.id || activeLevel?.layers[0]?.id || null;
    const selectedEntityId = snapshot.editorState?.selectedEntityId || snapshot.editorState?.selectedEntityIds?.[0] || null;

    return {
      schemaVersion: toNumberOrFallback(snapshot.schemaVersion, PROJECT_SCHEMA_VERSION),
      version: snapshot.version || EDITOR_VERSION,
      meta: {
        projectName: snapshot.meta?.projectName || "Lucid Editor Projekt",
        lastSavedAt: snapshot.meta?.lastSavedAt || null,
      },
      projectSettings: {
        ...deepClone(DEFAULT_PROJECT_SETTINGS),
        ...(snapshot.projectSettings || {}),
      },
      library,
      startLevelId: levels.some((level) => level.id === snapshot.startLevelId)
        ? snapshot.startLevelId
        : levels.find((level) => level.active)?.id || levels[0]?.id || null,
      levels,
      editorState: {
        activeWorkspace: "level-editor",
        navCollapsed: snapshot.editorState?.navCollapsed !== false,
        leftPanelCollapsed: snapshot.editorState?.leftPanelCollapsed === true,
        rightPanelCollapsed: snapshot.editorState?.rightPanelCollapsed === true,
        activeTool: "select",
        activeLevelId,
        activeLayerId,
        selectedEntityIds: selectedEntityId ? [selectedEntityId] : [],
        selectedLibraryItemId: library.some((item) => item.id === snapshot.editorState?.selectedLibraryItemId)
          ? snapshot.editorState.selectedLibraryItemId
          : library[0]?.id || null,
        expandedLibraryItemId: library.some((item) => item.id === snapshot.editorState?.selectedLibraryItemId)
          ? snapshot.editorState.selectedLibraryItemId
          : library[0]?.id || null,
        libraryQuery: "",
        camera: {
          x: toNumberOrFallback(snapshot.editorState?.camera?.x, activeLevel?.cameraStart.x || DEFAULT_CAMERA_START.x),
          y: toNumberOrFallback(snapshot.editorState?.camera?.y, activeLevel?.cameraStart.y || DEFAULT_CAMERA_START.y),
          zoom: toNumberOrFallback(snapshot.editorState?.camera?.zoom, 1),
        },
        openSections: {
          ...deepClone(DEFAULT_OPEN_SECTIONS),
          ...(snapshot.editorState?.openSections || {}),
        },
        statusMessage: "Projekt geladen.",
      },
      runtime: buildRuntimeState(levels),
    };
  }

  function getLevelById(state, levelId) {
    return state.levels.find((level) => level.id === levelId) || null;
  }

  function getActiveLevel(state) {
    return getLevelById(state, state.editorState.activeLevelId);
  }

  function getLayerFromLevel(level, layerId) {
    return level?.layers.find((layer) => layer.id === layerId) || null;
  }

  function getActiveLayer(state) {
    return getLayerFromLevel(getActiveLevel(state), state.editorState.activeLayerId);
  }

  function getLibraryItem(state, libraryItemId) {
    return state.library.find((item) => item.id === libraryItemId) || null;
  }

  function getSelectedLibraryItem(state) {
    return getLibraryItem(state, state.editorState.selectedLibraryItemId);
  }

  function getSelectedEntities(state) {
    const level = getActiveLevel(state);
    if (!level) return [];
    const selectedIds = new Set(state.editorState.selectedEntityIds || []);
    return level.entities.filter((entity) => selectedIds.has(entity.id));
  }

  function getPrimarySelectedEntity(state) {
    return getSelectedEntities(state)[0] || null;
  }

  function getEntityPresentation(state, entity) {
    const item = entity.libraryItemId ? getLibraryItem(state, entity.libraryItemId) : null;

    if (entity.type === "logic" || item?.type === "logic") {
      const logicType = inferLogicType(entity, item);
      const style = LOGIC_STYLE_MAP[logicType] || LOGIC_STYLE_MAP.solid;
      const shape = entity.properties?.shape || (logicType === "spawn" ? "point" : (Array.isArray(entity.properties?.points) ? "polygon" : "rect"));

      if (shape === "point") {
        return {
          entityType: "logic",
          logicType,
          shape,
          label: entity.name || LOGIC_LABELS[logicType] || "Logic",
          item,
          color: style.stroke,
          fill: style.fill,
          bounds: {
            x: entity.x - 12,
            y: entity.y - 12,
            width: 24,
            height: 24,
          },
          anchor: { x: entity.x, y: entity.y },
        };
      }

      if (shape === "polygon") {
        const absolutePoints = toAbsolutePoints(entity.x, entity.y, entity.properties?.points || []);
        const bounds = getBoundsFromPoints(absolutePoints);

        return {
          entityType: "logic",
          logicType,
          shape,
          label: entity.name || LOGIC_LABELS[logicType] || "Logic",
          item,
          color: style.stroke,
          fill: style.fill,
          points: absolutePoints,
          bounds,
          anchor: { x: entity.x, y: entity.y },
        };
      }

      const width = toNumberOrFallback(entity.properties?.width, item?.size?.w || GRID_SIZE * 4);
      const height = toNumberOrFallback(entity.properties?.height, item?.size?.h || GRID_SIZE * 2);

      return {
        entityType: "logic",
        logicType,
        shape: "rect",
        label: entity.name || LOGIC_LABELS[logicType] || "Logic",
        item,
        color: style.stroke,
        fill: style.fill,
        bounds: {
          x: entity.x,
          y: entity.y,
          width,
          height,
        },
        anchor: { x: entity.x, y: entity.y },
      };
    }

    const width = toNumberOrFallback(entity.properties?.width, item?.size?.w || GRID_SIZE * 2);
    const height = toNumberOrFallback(entity.properties?.height, item?.size?.h || GRID_SIZE * 2);
    const pivot = item?.type === "sprite"
      ? {
        x: toNumberOrFallback(item.pivot?.x, 0.5),
        y: toNumberOrFallback(item.pivot?.y, 1),
      }
      : { x: 0, y: 0 };

    return {
      entityType: item?.type || entity.type || "graphic",
      logicType: null,
      shape: "rect",
      label: entity.name || item?.label || "Entity",
      item,
      color: item?.color || "#6ea3cf",
      fill: `${item?.color || "#6ea3cf"}33`,
      bounds: {
        x: entity.x - width * pivot.x,
        y: entity.y - height * pivot.y,
        width,
        height,
      },
      anchor: {
        x: entity.x,
        y: entity.y,
      },
      pivot,
    };
  }

  function getEntityBounds(state, entity) {
    return getEntityPresentation(state, entity).bounds;
  }

  function canPlaceOnActiveLayer(state) {
    const layer = getActiveLayer(state);
    if (!layer) return { ok: false, reason: "Keine aktive Ebene vorhanden." };
    if (!layer.visible) return { ok: false, reason: "Aktiver Layer ist nicht sichtbar." };
    if (layer.locked) return { ok: false, reason: "Aktiver Layer ist gesperrt." };
    return { ok: true, layer };
  }

  function instantiateSelectedLibraryItem(state, position) {
    const level = getActiveLevel(state);
    const item = getSelectedLibraryItem(state);
    if (!level || !item) return null;

    const order = level.entities
      .filter((entity) => entity.layerId === state.editorState.activeLayerId)
      .reduce((highest, entity) => Math.max(highest, toNumberOrFallback(entity.order, 0)), -1) + 1;

    return createLibraryEntity(item, {
      id: `entity-${state.runtime.counters.entity++}`,
      layerId: state.editorState.activeLayerId,
      x: position.x,
      y: position.y,
      order,
    });
  }

  function createLogicRectFromBounds(state, bounds, logicType = "solid") {
    const level = getActiveLevel(state);
    if (!level) return null;

    const order = level.entities
      .filter((entity) => entity.layerId === state.editorState.activeLayerId)
      .reduce((highest, entity) => Math.max(highest, toNumberOrFallback(entity.order, 0)), -1) + 1;

    return createLogicEntity({
      id: `entity-${state.runtime.counters.entity++}`,
      layerId: state.editorState.activeLayerId,
      x: bounds.x,
      y: bounds.y,
      order,
      properties: {
        logicType,
        shape: "rect",
        width: bounds.width,
        height: bounds.height,
      },
    });
  }

  function createLogicPolygonFromPoints(state, points, logicType = "solid") {
    const level = getActiveLevel(state);
    if (!level || !Array.isArray(points) || points.length < 3) return null;

    const order = level.entities
      .filter((entity) => entity.layerId === state.editorState.activeLayerId)
      .reduce((highest, entity) => Math.max(highest, toNumberOrFallback(entity.order, 0)), -1) + 1;
    const polygonData = window.LucidEditor.utils.toRelativePoints(points);

    return createLogicEntity({
      id: `entity-${state.runtime.counters.entity++}`,
      layerId: state.editorState.activeLayerId,
      x: polygonData.x,
      y: polygonData.y,
      order,
      properties: {
        logicType,
        shape: "polygon",
        points: polygonData.points,
      },
    });
  }

  function clampCamera(camera) {
    return {
      x: toNumberOrFallback(camera?.x, 0),
      y: toNumberOrFallback(camera?.y, 0),
      zoom: Math.max(CAMERA_LIMITS.minZoom, Math.min(CAMERA_LIMITS.maxZoom, toNumberOrFallback(camera?.zoom, 1))),
    };
  }

  window.LucidEditor.model = {
    canPlaceOnActiveLayer,
    clampCamera,
    createInitialState,
    createLogicPolygonFromPoints,
    createLogicRectFromBounds,
    createStateFromSnapshot,
    getActiveLayer,
    getActiveLevel,
    getEntityBounds,
    getEntityPresentation,
    getLayerFromLevel,
    getLevelById,
    getLibraryItem,
    getPrimarySelectedEntity,
    getSelectedEntities,
    getSelectedLibraryItem,
    instantiateSelectedLibraryItem,
    isFiniteNumber,
  };
})();
