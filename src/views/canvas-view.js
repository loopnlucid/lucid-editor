(() => {
  "use strict";

  const {
    CAMERA_LIMITS,
    GRID_MAJOR_FACTOR,
    GRID_SIZE,
  } = window.LucidEditor.config;
  const {
    clamp,
    isTextInputElement,
    pointInPolygon,
  } = window.LucidEditor.utils;
  const {
    canPlaceOnActiveLayer,
    getActiveLayer,
    getActiveLevel,
    getEntityPresentation,
    getLibraryItem,
    getSelectedEntities,
  } = window.LucidEditor.model;
  const spriteService = window.LucidEditor.services.sprites;

  class CanvasView {
    constructor(canvas, callbacks) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.callbacks = callbacks;
      this.viewport = { width: 0, height: 0, dpr: 1 };
      this.state = null;
      this.drag = null;
      this.spacePan = false;
      this.draftPolygonPoints = [];
      this.animationTimeMs = 0;
      this.lastAnimationSignature = null;
      this.animationFrameId = null;

      this.handleResize = this.handleResize.bind(this);
      this.handleMouseDown = this.handleMouseDown.bind(this);
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleMouseUp = this.handleMouseUp.bind(this);
      this.handleDoubleClick = this.handleDoubleClick.bind(this);
      this.handleWheel = this.handleWheel.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.handleKeyUp = this.handleKeyUp.bind(this);

      window.addEventListener("resize", this.handleResize);
      window.addEventListener("keydown", this.handleKeyDown);
      window.addEventListener("keyup", this.handleKeyUp);
      this.canvas.addEventListener("mousedown", this.handleMouseDown);
      window.addEventListener("mousemove", this.handleMouseMove);
      window.addEventListener("mouseup", this.handleMouseUp);
      this.canvas.addEventListener("dblclick", this.handleDoubleClick);
      this.canvas.addEventListener("wheel", this.handleWheel, { passive: false });
      this.canvas.addEventListener("contextmenu", (event) => event.preventDefault());

      // Die Canvas wird bei jeder tatsaechlichen Groessenaenderung neu
      // vermessen, nicht nur bei window-resize. Damit bleiben Zeichnung
      // (viewport) und Maus-Hit-Testing zuverlaessig deckungsgleich,
      // auch wenn Layout-Aenderungen wie eingeklappte Navigation oder
      // Sidebars die Canvas-Breite/-Hoehe veraendern.
      if (typeof ResizeObserver !== "undefined") {
        this.resizeObserver = new ResizeObserver(() => this.handleResize());
        this.resizeObserver.observe(this.canvas);
      }

      this.handleResize();
      this.startAnimationLoop();
    }

    // Zentraler Animations-Ticker fuer alle sichtbaren Sprites. Es wird nur
    // dann neu gezeichnet, wenn sich mindestens ein Sprite-Frame tatsaechlich
    // aendert – dadurch laeuft das Rendering mit der Sprite-FPS statt konstant
    // mit 60 Hz, und bei rein statischen Szenen gar nicht.
    startAnimationLoop() {
      if (typeof requestAnimationFrame === "undefined") return;

      const step = (now) => {
        this.animationTimeMs = now;

        if (this.state && this.state.editorState.activeWorkspace === "level-editor") {
          const signature = this.computeAnimationSignature(this.state);
          if (signature !== null && signature !== this.lastAnimationSignature) {
            this.lastAnimationSignature = signature;
            this.render(this.state);
          }
        }

        this.animationFrameId = requestAnimationFrame(step);
      };

      this.animationFrameId = requestAnimationFrame(step);
    }

    getSpriteAnimation(item) {
      if (!item || item.type !== "sprite" || !item.animations) return null;
      return item.animations[item.defaultState] || Object.values(item.animations)[0] || null;
    }

    getSpriteFrameIndex(anim, timeMs) {
      const frameDurationMs = 1000 / Math.max(1, anim.fps);
      const raw = Math.floor(timeMs / frameDurationMs);
      if (anim.loop) return ((raw % anim.frameCount) + anim.frameCount) % anim.frameCount;
      return Math.min(anim.frameCount - 1, Math.max(0, raw));
    }

    computeAnimationSignature(state) {
      const level = getActiveLevel(state);
      if (!level || !spriteService) return null;

      let signature = "";
      let hasAnimated = false;

      for (const entity of level.entities) {
        if (entity.type !== "sprite" || entity.visible === false) continue;

        const layer = level.layers.find((candidate) => candidate.id === entity.layerId);
        if (!layer || !layer.visible) continue;

        const item = entity.libraryItemId ? getLibraryItem(state, entity.libraryItemId) : null;
        if (!item || !item.sheet || !spriteService.getSheet(item.sheet)) continue;

        const anim = this.getSpriteAnimation(item);
        if (!anim || anim.frameCount <= 1) continue;

        signature += `${entity.id}:${this.getSpriteFrameIndex(anim, this.animationTimeMs)}|`;
        hasAnimated = true;
      }

      return hasAnimated ? signature : null;
    }

    handleResize() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      this.viewport = {
        width: rect.width || 1,
        height: rect.height || 1,
        dpr,
      };

      this.canvas.width = Math.round(this.viewport.width * dpr);
      this.canvas.height = Math.round(this.viewport.height * dpr);

      if (this.state) this.render(this.state);
    }

    render(state) {
      this.state = state;
      const { ctx, viewport } = this;

      ctx.setTransform(viewport.dpr, 0, 0, viewport.dpr, 0, 0);
      ctx.clearRect(0, 0, viewport.width, viewport.height);

      this.drawBackground(state);
      this.drawGrid(state);
      this.drawEntities(state);
      this.drawDrafts(state);
      this.drawShapeHandles(state);
      this.refreshCursor();
    }

    refreshCursor() {
      if (!this.state) return;

      if (this.drag?.type === "shape-edit") {
        this.canvas.style.cursor = this.drag.cursor || "default";
        return;
      }

      if (this.drag?.type === "pan" || this.drag?.type === "move") {
        this.canvas.style.cursor = "grabbing";
        return;
      }

      const tool = this.state.editorState.activeTool;
      const placementState = canPlaceOnActiveLayer(this.state);

      if ((tool === "rectangle" || tool === "polygon") && !placementState.ok) {
        this.canvas.style.cursor = "not-allowed";
        return;
      }

      if (tool === "pan" || this.spacePan) {
        this.canvas.style.cursor = "grab";
        return;
      }

      if (tool === "move") {
        this.canvas.style.cursor = "move";
        return;
      }

      if (tool === "zoom") {
        this.canvas.style.cursor = "ew-resize";
        return;
      }

      if (tool === "rectangle" || tool === "polygon") {
        this.canvas.style.cursor = "crosshair";
        return;
      }

      this.canvas.style.cursor = "default";
    }

    drawBackground(state) {
      const level = getActiveLevel(state);
      const ctx = this.ctx;

      ctx.fillStyle = "#091116";
      ctx.fillRect(0, 0, this.viewport.width, this.viewport.height);

      if (!level) return;

      const topLeft = this.worldToScreen(level.bounds.x, level.bounds.y, state.editorState.camera, 1);
      const width = level.bounds.width * state.editorState.camera.zoom;
      const height = level.bounds.height * state.editorState.camera.zoom;

      ctx.save();
      ctx.fillStyle = level.background || "#10202b";
      ctx.fillRect(topLeft.x, topLeft.y, width, height);
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1.25;
      ctx.strokeRect(topLeft.x, topLeft.y, width, height);
      ctx.restore();
    }

    drawGrid(state) {
      const ctx = this.ctx;
      const camera = state.editorState.camera;
      const minorStep = GRID_SIZE * camera.zoom;
      const majorStep = minorStep * GRID_MAJOR_FACTOR;
      const offsetX = (-camera.x * camera.zoom + this.viewport.width / 2) % minorStep;
      const offsetY = (-camera.y * camera.zoom + this.viewport.height / 2) % minorStep;

      ctx.save();

      if (minorStep >= 14) {
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;
        for (let x = offsetX; x < this.viewport.width; x += minorStep) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, this.viewport.height);
          ctx.stroke();
        }
        for (let y = offsetY; y < this.viewport.height; y += minorStep) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(this.viewport.width, y);
          ctx.stroke();
        }
      }

      if (majorStep >= 10) {
        const majorOffsetX = (-camera.x * camera.zoom + this.viewport.width / 2) % majorStep;
        const majorOffsetY = (-camera.y * camera.zoom + this.viewport.height / 2) % majorStep;
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        for (let x = majorOffsetX; x < this.viewport.width; x += majorStep) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, this.viewport.height);
          ctx.stroke();
        }
        for (let y = majorOffsetY; y < this.viewport.height; y += majorStep) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(this.viewport.width, y);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    drawEntities(state) {
      const level = getActiveLevel(state);
      if (!level) return;

      const selectedIds = new Set(state.editorState.selectedEntityIds || []);
      const layers = level.layers.slice().sort((left, right) => left.order - right.order);

      layers.forEach((layer) => {
        if (!layer.visible) return;

        level.entities
          .filter((entity) => entity.layerId === layer.id && entity.visible !== false)
          .slice()
          .sort((left, right) => left.order - right.order)
          .forEach((entity) => this.drawEntity(state, layer, entity, selectedIds.has(entity.id)));
      });
    }

    drawEntity(state, layer, entity, isSelected) {
      const presentation = getEntityPresentation(state, entity);
      const ctx = this.ctx;

      ctx.save();

      if (presentation.shape === "point") {
        const screen = this.worldToScreen(presentation.anchor.x, presentation.anchor.y, state.editorState.camera, layer.parallax);
        ctx.fillStyle = presentation.color;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#071015";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#071015";
        ctx.font = '11px "Segoe UI", sans-serif';
        ctx.fillText("Spawn", screen.x + 12, screen.y + 4);
        if (isSelected) {
          ctx.strokeStyle = "#e5ecef";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(screen.x, screen.y, 14, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
        return;
      }

      if (presentation.shape === "polygon") {
        const screenPoints = presentation.points.map((point) => this.worldToScreen(point.x, point.y, state.editorState.camera, layer.parallax));
        if (screenPoints.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
          screenPoints.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
          ctx.closePath();
          ctx.fillStyle = presentation.fill;
          ctx.strokeStyle = presentation.color;
          ctx.lineWidth = 2;
          ctx.fill();
          ctx.stroke();

          if (isSelected) {
            ctx.strokeStyle = "#e5ecef";
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      } else {
        const topLeft = this.worldToScreen(presentation.bounds.x, presentation.bounds.y, state.editorState.camera, layer.parallax);
        const width = presentation.bounds.width * state.editorState.camera.zoom;
        const height = presentation.bounds.height * state.editorState.camera.zoom;

        const drewSprite = this.drawSpriteFrame(entity, presentation, topLeft, width, height);

        if (!drewSprite) {
          ctx.fillStyle = presentation.fill;
          ctx.strokeStyle = presentation.color;
          ctx.lineWidth = presentation.entityType === "logic" ? 2 : 1.5;
          ctx.fillRect(topLeft.x, topLeft.y, width, height);
          ctx.strokeRect(topLeft.x, topLeft.y, width, height);

          if (presentation.entityType !== "logic") {
            ctx.fillStyle = `${presentation.color}55`;
            ctx.fillRect(topLeft.x + 6, topLeft.y + 6, Math.max(18, width - 12), Math.max(18, height - 12));
          }
        }

        if (isSelected) {
          ctx.strokeStyle = "#e5ecef";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(topLeft.x - 2, topLeft.y - 2, width + 4, height + 4);
        }

        if (!drewSprite) {
          ctx.fillStyle = "rgba(5,10,13,0.62)";
          ctx.fillRect(topLeft.x, topLeft.y, width, Math.min(22, height));
          ctx.fillStyle = "#f1f5f7";
          ctx.font = '11px "Segoe UI", sans-serif';
          ctx.fillText(presentation.label, topLeft.x + 6, topLeft.y + 15);
        }
      }

      ctx.restore();
    }

    // Zeichnet den aktuellen Animationsframe eines Sprites aus seinem Sheet.
    // Liefert false, wenn kein Sprite-Frame gezeichnet werden konnte (dann
    // uebernimmt drawEntity die Platzhalter-Darstellung).
    drawSpriteFrame(entity, presentation, topLeft, width, height) {
      if (presentation.entityType !== "sprite" || !spriteService) return false;

      const item = presentation.item;
      if (!item || !item.sheet) return false;

      const image = spriteService.requestSheet(item.sheet);
      if (!image || !image.width) return false;

      const anim = this.getSpriteAnimation(item);
      if (!anim) return false;

      const frameWidth = item.frameWidth || item.size.w;
      const frameHeight = item.frameHeight || item.size.h;
      const columns = Math.max(1, Math.floor(image.width / frameWidth));
      const globalFrame = anim.startFrame + this.getSpriteFrameIndex(anim, this.animationTimeMs);
      const sourceX = (globalFrame % columns) * frameWidth;
      const sourceY = Math.floor(globalFrame / columns) * frameHeight;

      const ctx = this.ctx;
      ctx.save();
      if (entity.properties?.flip === true) {
        ctx.translate(topLeft.x + width, topLeft.y);
        ctx.scale(-1, 1);
        ctx.drawImage(image, sourceX, sourceY, frameWidth, frameHeight, 0, 0, width, height);
      } else {
        ctx.drawImage(image, sourceX, sourceY, frameWidth, frameHeight, topLeft.x, topLeft.y, width, height);
      }
      ctx.restore();

      return true;
    }

    drawDrafts(state) {
      const ctx = this.ctx;
      const level = getActiveLevel(state);
      const layer = getActiveLayer(state);
      if (!level || !layer) return;

      if (this.drag?.type === "rect-preview") {
        const preview = this.getNormalizedWorldRect(this.drag.worldStart, this.drag.worldCurrent);
        const topLeft = this.worldToScreen(preview.x, preview.y, state.editorState.camera, layer.parallax);
        ctx.save();
        ctx.strokeStyle = "rgba(240, 203, 99, 0.95)";
        ctx.fillStyle = "rgba(240, 203, 99, 0.16)";
        ctx.setLineDash([8, 6]);
        ctx.lineWidth = 2;
        ctx.fillRect(topLeft.x, topLeft.y, preview.width * state.editorState.camera.zoom, preview.height * state.editorState.camera.zoom);
        ctx.strokeRect(topLeft.x, topLeft.y, preview.width * state.editorState.camera.zoom, preview.height * state.editorState.camera.zoom);
        ctx.restore();
      }

      if (this.draftPolygonPoints.length) {
        const screenPoints = this.draftPolygonPoints.map((point) => this.worldToScreen(point.x, point.y, state.editorState.camera, layer.parallax));
        ctx.save();
        ctx.strokeStyle = "rgba(240, 203, 99, 0.95)";
        ctx.fillStyle = "rgba(240, 203, 99, 0.22)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
        screenPoints.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
        ctx.stroke();
        screenPoints.forEach((point, index) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, index === 0 ? 5 : 4, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }
    }

    // Liefert die einzelne, direkt auf der Canvas formbearbeitbare Auswahl
    // (Rechteck-Entities wie Sprites/Grafiken/Logic-Zonen sowie Polygon-
    // Logic-Zonen) auf einem sichtbaren, entsperrten Layer. Andernfalls null.
    getEditableSelection(state) {
      const tool = state.editorState.activeTool;
      if (tool !== "select" && tool !== "move") return null;

      const selected = getSelectedEntities(state);
      if (selected.length !== 1) return null;

      const entity = selected[0];
      if (entity.locked) return null;

      const presentation = getEntityPresentation(state, entity);
      if (presentation.shape !== "rect" && presentation.shape !== "polygon") return null;

      const level = getActiveLevel(state);
      const layer = level?.layers.find((candidate) => candidate.id === entity.layerId) || null;
      if (!layer || layer.locked || !layer.visible) return null;

      return { entity, layer, presentation };
    }

    getShapeHandles(context, camera) {
      const { layer, presentation } = context;
      const parallax = layer.parallax;

      if (presentation.shape === "polygon") {
        return presentation.points.map((point, index) => ({
          kind: "vertex",
          index,
          screen: this.worldToScreen(point.x, point.y, camera, parallax),
        }));
      }

      const topLeft = this.worldToScreen(presentation.bounds.x, presentation.bounds.y, camera, parallax);
      const width = presentation.bounds.width * camera.zoom;
      const height = presentation.bounds.height * camera.zoom;

      return [
        ["nw", topLeft.x, topLeft.y],
        ["n", topLeft.x + width / 2, topLeft.y],
        ["ne", topLeft.x + width, topLeft.y],
        ["e", topLeft.x + width, topLeft.y + height / 2],
        ["se", topLeft.x + width, topLeft.y + height],
        ["s", topLeft.x + width / 2, topLeft.y + height],
        ["sw", topLeft.x, topLeft.y + height],
        ["w", topLeft.x, topLeft.y + height / 2],
      ].map(([dir, x, y]) => ({ kind: "rect", dir, screen: { x, y } }));
    }

    pickShapeHandle(state, screenX, screenY) {
      const context = this.getEditableSelection(state);
      if (!context) return null;

      const handles = this.getShapeHandles(context, state.editorState.camera);
      const tolerance = 7;

      for (const handle of handles) {
        if (Math.abs(screenX - handle.screen.x) <= tolerance && Math.abs(screenY - handle.screen.y) <= tolerance) {
          return { context, handle };
        }
      }

      return null;
    }

    getHandleCursor(handle) {
      if (handle.kind === "vertex") return "grab";
      const dir = handle.dir;
      if (dir === "nw" || dir === "se") return "nwse-resize";
      if (dir === "ne" || dir === "sw") return "nesw-resize";
      if (dir === "n" || dir === "s") return "ns-resize";
      return "ew-resize";
    }

    updateHoverCursor(point) {
      const handleHit = this.pickShapeHandle(this.state, point.x, point.y);
      if (handleHit) {
        this.canvas.style.cursor = this.getHandleCursor(handleHit.handle);
        return;
      }
      this.refreshCursor();
    }

    drawShapeHandles(state) {
      const context = this.getEditableSelection(state);
      if (!context) return;

      const handles = this.getShapeHandles(context, state.editorState.camera);
      const ctx = this.ctx;
      const size = 4;

      ctx.save();
      ctx.fillStyle = "#e5ecef";
      ctx.strokeStyle = "#0b1418";
      ctx.lineWidth = 1.5;
      handles.forEach((handle) => {
        ctx.beginPath();
        ctx.rect(handle.screen.x - size, handle.screen.y - size, size * 2, size * 2);
        ctx.fill();
        ctx.stroke();
      });
      ctx.restore();
    }

    computeResizedBounds(origin, dir, world, keepAspect = false) {
      const minSize = 8;
      let left = origin.x;
      let top = origin.y;
      let right = origin.x + origin.width;
      let bottom = origin.y + origin.height;

      if (dir.includes("w")) left = Math.min(world.x, right - minSize);
      if (dir.includes("e")) right = Math.max(world.x, left + minSize);
      if (dir.includes("n")) top = Math.min(world.y, bottom - minSize);
      if (dir.includes("s")) bottom = Math.max(world.y, top + minSize);

      let width = right - left;
      let height = bottom - top;

      // Bei Eckgriffen (zwei Richtungen) das Seitenverhaeltnis halten und
      // die Groesse am gegenueberliegenden, fixen Eckpunkt neu ausrichten.
      if (keepAspect && dir.length === 2 && origin.width > 0 && origin.height > 0) {
        const aspect = origin.width / origin.height;
        if (width / aspect >= height) height = width / aspect;
        else width = height * aspect;
        if (dir.includes("w")) left = right - width;
        if (dir.includes("n")) top = bottom - height;
      }

      return {
        x: Math.round(left),
        y: Math.round(top),
        width: Math.round(width),
        height: Math.round(height),
      };
    }

    worldToScreen(x, y, camera, parallax = 1) {
      return {
        x: (x - camera.x * parallax) * camera.zoom + this.viewport.width / 2,
        y: (y - camera.y * parallax) * camera.zoom + this.viewport.height / 2,
      };
    }

    screenToWorld(screenX, screenY, camera, parallax = 1) {
      return {
        x: (screenX - this.viewport.width / 2) / camera.zoom + camera.x * parallax,
        y: (screenY - this.viewport.height / 2) / camera.zoom + camera.y * parallax,
      };
    }

    getScreenPoint(event) {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    }

    getNormalizedWorldRect(start, end) {
      const left = Math.min(start.x, end.x);
      const top = Math.min(start.y, end.y);
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);

      return {
        x: Math.round(left),
        y: Math.round(top),
        width: Math.max(1, Math.round(width)),
        height: Math.max(1, Math.round(height)),
      };
    }

    pickEntity(screenX, screenY) {
      if (!this.state) return null;
      const level = getActiveLevel(this.state);
      if (!level) return null;

      const layers = level.layers.slice().sort((left, right) => right.order - left.order);

      for (const layer of layers) {
        if (!layer.visible || layer.locked) continue;

        const entities = level.entities
          .filter((entity) => entity.layerId === layer.id && entity.visible !== false && entity.locked !== true)
          .slice()
          .sort((left, right) => right.order - left.order);

        for (const entity of entities) {
          const presentation = getEntityPresentation(this.state, entity);

          if (presentation.shape === "point") {
            const screen = this.worldToScreen(presentation.anchor.x, presentation.anchor.y, this.state.editorState.camera, layer.parallax);
            if (Math.hypot(screenX - screen.x, screenY - screen.y) <= 12) return { entity, layer };
            continue;
          }

          if (presentation.shape === "polygon") {
            const polygonPoints = presentation.points.map((point) => this.worldToScreen(point.x, point.y, this.state.editorState.camera, layer.parallax));
            if (polygonPoints.length >= 3 && pointInPolygon({ x: screenX, y: screenY }, polygonPoints)) {
              return { entity, layer };
            }
            continue;
          }

          const topLeft = this.worldToScreen(presentation.bounds.x, presentation.bounds.y, this.state.editorState.camera, layer.parallax);
          const width = presentation.bounds.width * this.state.editorState.camera.zoom;
          const height = presentation.bounds.height * this.state.editorState.camera.zoom;

          if (screenX >= topLeft.x && screenX <= topLeft.x + width && screenY >= topLeft.y && screenY <= topLeft.y + height) {
            return { entity, layer };
          }
        }
      }

      return null;
    }

    startPanDrag(point) {
      this.drag = {
        type: "pan",
        startX: point.x,
        startY: point.y,
        cameraX: this.state.editorState.camera.x,
        cameraY: this.state.editorState.camera.y,
      };
      this.refreshCursor();
    }

    startShapeEdit(point, handleHit) {
      const { context, handle } = handleHit;

      this.callbacks.onShapeEditStart(context.entity.id);

      this.drag = {
        type: "shape-edit",
        shape: context.presentation.shape,
        dir: handle.dir || null,
        index: handle.index ?? null,
        parallax: context.layer.parallax,
        cursor: this.getHandleCursor(handle),
        // Sprites/Grafiken proportional skalieren (Eckgriffe), damit das
        // Frame-Seitenverhaeltnis nicht verzerrt. Logic-Zonen bleiben frei.
        keepAspect: context.presentation.entityType !== "logic",
        origBounds: { ...context.presentation.bounds },
        origPoints: context.presentation.points
          ? context.presentation.points.map((entry) => ({ ...entry }))
          : null,
        changed: false,
      };

      this.refreshCursor();
    }

    handleMouseDown(event) {
      if (!this.state) return;
      const point = this.getScreenPoint(event);
      const activeTool = this.state.editorState.activeTool;
      const activeLayer = getActiveLayer(this.state);
      const forcePan = event.button === 1 || this.spacePan || activeTool === "pan";

      if (forcePan) {
        this.startPanDrag(point);
        return;
      }

      if (event.button !== 0) return;

      if (activeTool === "zoom") {
        this.drag = {
          type: "zoom",
          startX: point.x,
          anchor: point,
          startZoom: this.state.editorState.camera.zoom,
          startCamera: { ...this.state.editorState.camera },
        };
        this.refreshCursor();
        return;
      }

      if (activeTool === "rectangle") {
        if (!activeLayer) return;
        const world = this.screenToWorld(point.x, point.y, this.state.editorState.camera, activeLayer.parallax);
        this.drag = {
          type: "rect-preview",
          worldStart: world,
          worldCurrent: world,
        };
        this.refreshCursor();
        return;
      }

      if (activeTool === "polygon") {
        if (!activeLayer) return;
        const world = this.screenToWorld(point.x, point.y, this.state.editorState.camera, activeLayer.parallax);
        this.draftPolygonPoints.push({ x: Math.round(world.x), y: Math.round(world.y) });
        this.render(this.state);
        return;
      }

      if (activeTool === "select" || activeTool === "move") {
        const handleHit = this.pickShapeHandle(this.state, point.x, point.y);
        if (handleHit) {
          this.startShapeEdit(point, handleHit);
          return;
        }
      }

      const hit = this.pickEntity(point.x, point.y);

      if (activeTool === "move") {
        if (!hit) {
          this.callbacks.onSelectEntity(null, { mode: "replace" });
          return;
        }

        const selectedIds = new Set(this.state.editorState.selectedEntityIds || []);
        if (!selectedIds.has(hit.entity.id)) {
          this.callbacks.onSelectEntity(hit.entity.id, { mode: "replace" });
        }

        const entities = getSelectedEntities(this.state);
        const dragSelectionIds = entities.length ? entities.map((entity) => entity.id) : [hit.entity.id];
        this.callbacks.onSelectionMoveStart(dragSelectionIds);
        this.drag = {
          type: "move",
          startX: point.x,
          startY: point.y,
          changed: false,
        };
        this.refreshCursor();
        return;
      }

      if (hit) {
        this.callbacks.onSelectEntity(hit.entity.id, { mode: event.shiftKey ? "toggle" : "replace" });
        return;
      }

      this.callbacks.onSelectEntity(null, { mode: "replace" });
    }

    handleMouseMove(event) {
      if (!this.state) return;
      const point = this.getScreenPoint(event);

      if (!this.drag) {
        this.updateHoverCursor(point);
        return;
      }

      if (this.drag.type === "shape-edit") {
        const world = this.screenToWorld(point.x, point.y, this.state.editorState.camera, this.drag.parallax);

        if (this.drag.shape === "polygon") {
          const nextPoints = this.drag.origPoints.map((entry, index) => (
            index === this.drag.index
              ? { x: Math.round(world.x), y: Math.round(world.y) }
              : entry
          ));
          this.drag.changed = true;
          this.callbacks.onShapeEditPolygon(nextPoints);
        } else {
          const bounds = this.computeResizedBounds(this.drag.origBounds, this.drag.dir, world, this.drag.keepAspect);
          this.drag.changed = true;
          this.callbacks.onShapeEditRect(bounds);
        }
        return;
      }

      if (this.drag.type === "pan") {
        this.callbacks.onUpdateCamera({
          x: this.drag.cameraX - (point.x - this.drag.startX) / this.state.editorState.camera.zoom,
          y: this.drag.cameraY - (point.y - this.drag.startY) / this.state.editorState.camera.zoom,
          zoom: this.state.editorState.camera.zoom,
        });
        return;
      }

      if (this.drag.type === "move") {
        const delta = {
          x: Math.round((point.x - this.drag.startX) / this.state.editorState.camera.zoom),
          y: Math.round((point.y - this.drag.startY) / this.state.editorState.camera.zoom),
        };
        this.drag.changed = this.drag.changed || delta.x !== 0 || delta.y !== 0;
        this.callbacks.onSelectionMove(delta);
        return;
      }

      if (this.drag.type === "rect-preview") {
        const activeLayer = getActiveLayer(this.state);
        if (!activeLayer) return;
        this.drag.worldCurrent = this.screenToWorld(point.x, point.y, this.state.editorState.camera, activeLayer.parallax);
        this.render(this.state);
        return;
      }

      if (this.drag.type === "zoom") {
        const deltaX = point.x - this.drag.startX;
        const factor = Math.exp(-deltaX * 0.01);
        const nextZoom = clamp(this.drag.startZoom * factor, CAMERA_LIMITS.minZoom, CAMERA_LIMITS.maxZoom);
        const nextCamera = this.getZoomedCameraAtPoint(this.drag.anchor, nextZoom, this.drag.startCamera);
        this.callbacks.onUpdateCamera(nextCamera);
      }
    }

    handleMouseUp() {
      if (!this.state || !this.drag) return;

      if (this.drag.type === "shape-edit") {
        this.callbacks.onShapeEditEnd(this.drag.changed === true);
      }

      if (this.drag.type === "move") {
        this.callbacks.onSelectionMoveEnd(this.drag.changed === true);
      }

      if (this.drag.type === "rect-preview") {
        const rect = this.getNormalizedWorldRect(this.drag.worldStart, this.drag.worldCurrent);
        if (rect.width >= 6 && rect.height >= 6) {
          this.callbacks.onCreateLogicRect(rect);
        }
      }

      this.drag = null;
      this.refreshCursor();
      this.render(this.state);
    }

    handleDoubleClick() {
      if (!this.state) return;
      if (this.state.editorState.activeTool !== "polygon") return;
      this.finishDraftPolygon();
    }

    handleWheel(event) {
      if (!this.state) return;

      // Zoom laeuft ueber das reine Mausrad (konsistent zum Sprite-Editor).
      event.preventDefault();
      const point = this.getScreenPoint(event);
      const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
      const nextZoom = clamp(this.state.editorState.camera.zoom * factor, CAMERA_LIMITS.minZoom, CAMERA_LIMITS.maxZoom);
      const nextCamera = this.getZoomedCameraAtPoint(point, nextZoom, this.state.editorState.camera);
      this.callbacks.onUpdateCamera(nextCamera);
    }

    getZoomedCameraAtPoint(screenPoint, nextZoom, sourceCamera) {
      const before = this.screenToWorld(screenPoint.x, screenPoint.y, sourceCamera, 1);
      const after = this.screenToWorld(screenPoint.x, screenPoint.y, { ...sourceCamera, zoom: nextZoom }, 1);

      return {
        x: sourceCamera.x + (before.x - after.x),
        y: sourceCamera.y + (before.y - after.y),
        zoom: nextZoom,
      };
    }

    finishDraftPolygon() {
      if (this.draftPolygonPoints.length < 3) return;
      this.callbacks.onCreateLogicPolygon(this.draftPolygonPoints.slice());
      this.draftPolygonPoints = [];
      this.render(this.state);
    }

    cancelDrafts() {
      const hadDraft = this.draftPolygonPoints.length > 0 || this.drag?.type === "rect-preview";
      this.draftPolygonPoints = [];
      if (this.drag?.type === "rect-preview" || this.drag?.type === "zoom") {
        this.drag = null;
      }
      if (hadDraft && this.state) this.render(this.state);
    }

    handleKeyDown(event) {
      if (isTextInputElement(event.target)) return;

      if (event.code === "Space" && !this.spacePan) {
        this.spacePan = true;
        this.refreshCursor();
        event.preventDefault();
      }

      if (event.key === "Enter" && this.state?.editorState.activeTool === "polygon") {
        this.finishDraftPolygon();
      }

      if (event.key === "Escape") {
        this.cancelDrafts();
      }
    }

    handleKeyUp(event) {
      if (event.code === "Space") {
        this.spacePan = false;
        this.refreshCursor();
      }
    }

    getCanvasCenterWorld(state, parallax = 1) {
      return this.screenToWorld(this.viewport.width / 2, this.viewport.height / 2, state.editorState.camera, parallax);
    }
  }

  window.LucidEditor.views = window.LucidEditor.views || {};
  window.LucidEditor.views.CanvasView = CanvasView;
})();
