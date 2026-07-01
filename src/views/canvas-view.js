(() => {
  "use strict";

  const { CAMERA_LIMITS, GRID_SIZE } = window.LucidEditor.config;
  const { clamp } = window.LucidEditor.utils;
  const { getLayer, getLibraryItem } = window.LucidEditor.model;

  class CanvasView {
    constructor(canvas, callbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.callbacks = callbacks;
    this.viewport = { width: 0, height: 0, dpr: 1 };
    this.state = null;
    this.drag = null;

    this.handleResize = this.handleResize.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
    this.handleWheel = this.handleWheel.bind(this);

    window.addEventListener("resize", this.handleResize);
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleMouseUp);
    this.canvas.addEventListener("dblclick", this.handleDoubleClick);
    this.canvas.addEventListener("wheel", this.handleWheel, { passive: false });
    this.canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    this.handleResize();
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

    this.drawBackground();
    this.drawGrid(state);
    this.drawLayers(state);
    this.drawSpawn(state);
    }

    drawBackground() {
    this.ctx.fillStyle = "#0f0f12";
    this.ctx.fillRect(0, 0, this.viewport.width, this.viewport.height);
    }

    drawGrid(state) {
    const ctx = this.ctx;
    const zoomStep = GRID_SIZE * state.camera.zoom;

    if (zoomStep < 10) return;

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;

    const offsetX = (-state.camera.x * state.camera.zoom + this.viewport.width / 2) % zoomStep;
    const offsetY = (-state.camera.y * state.camera.zoom + this.viewport.height / 2) % zoomStep;

    for (let x = offsetX; x < this.viewport.width; x += zoomStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.viewport.height);
      ctx.stroke();
    }

    for (let y = offsetY; y < this.viewport.height; y += zoomStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.viewport.width, y);
      ctx.stroke();
    }

    ctx.restore();
    }

    drawLayers(state) {
    state.layers.forEach((layer) => {
      if (!layer.visible) return;

      const layerEntities = state.entities.filter((entity) => entity.layerId === layer.id && entity.visible !== false);
      layerEntities.forEach((entity) => this.drawEntity(state, layer, entity));
    });
    }

    drawEntity(state, layer, entity) {
    const item = getLibraryItem(state, entity.libraryItemId);
    const { x, y } = this.worldToScreen(entity.x, entity.y, state.camera, layer.parallax);
    const width = entity.w * state.camera.zoom;
    const height = entity.h * state.camera.zoom;
    const ctx = this.ctx;

    if (width <= 1 || height <= 1) return;

    ctx.save();

    if (item?.kind === "trigger") {
      ctx.fillStyle = `${item.color}22`;
      ctx.strokeStyle = item.color;
      ctx.setLineDash([10, 8]);
      ctx.lineWidth = 2;
      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);
    } else if (item?.kind === "collision") {
      ctx.fillStyle = `${item.color}44`;
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2;
      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x, y, width, height);
    } else {
      ctx.fillStyle = item?.color || "#78a5a6";
      ctx.strokeStyle = "rgba(255,255,255,.35)";
      ctx.lineWidth = 1.5;
      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x, y, width, height);
    }

    if (entity.id === state.selectedEntityId) {
      ctx.strokeStyle = "#5b9bd5";
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
    }

    ctx.fillStyle = "rgba(0,0,0,.45)";
    ctx.fillRect(x, y, width, Math.min(20, height));
    ctx.fillStyle = "#f3f6f7";
    ctx.font = '11px "Segoe UI", sans-serif';
    ctx.fillText(item?.label || entity.name, x + 6, y + 14);

    ctx.restore();
    }

    drawSpawn(state) {
    const { x, y } = this.worldToScreen(state.spawn.x, state.spawn.y, state.camera, 1);
    const ctx = this.ctx;

    ctx.save();
    ctx.fillStyle = "#f1c453";
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#0e151a";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#0e151a";
    ctx.font = '11px "Segoe UI", sans-serif';
    ctx.fillText("S", x - 4, y + 4);
    ctx.restore();
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

    pickEntity(screenX, screenY) {
    if (!this.state) return null;

    for (let layerIndex = this.state.layers.length - 1; layerIndex >= 0; layerIndex -= 1) {
      const layer = this.state.layers[layerIndex];
      if (!layer.visible) continue;

      const entities = this.state.entities.filter((entity) => entity.layerId === layer.id && entity.visible !== false);
      for (let entityIndex = entities.length - 1; entityIndex >= 0; entityIndex -= 1) {
        const entity = entities[entityIndex];
        const topLeft = this.worldToScreen(entity.x, entity.y, this.state.camera, layer.parallax);
        const width = entity.w * this.state.camera.zoom;
        const height = entity.h * this.state.camera.zoom;

        if (screenX >= topLeft.x && screenX <= topLeft.x + width && screenY >= topLeft.y && screenY <= topLeft.y + height) {
          return { entity, layer };
        }
      }
    }

    return null;
    }

    handleMouseDown(event) {
    if (!this.state) return;
    const point = this.getScreenPoint(event);

    if (event.button === 1 || (event.button === 0 && event.shiftKey)) {
      this.drag = {
        type: "pan",
        startX: point.x,
        startY: point.y,
        cameraX: this.state.camera.x,
        cameraY: this.state.camera.y,
      };
      return;
    }

    if (event.button !== 0) return;

    const hit = this.pickEntity(point.x, point.y);
    if (hit) {
      const world = this.screenToWorld(point.x, point.y, this.state.camera, hit.layer.parallax);
      this.callbacks.onSelectEntity(hit.entity.id);
      this.drag = {
        type: "entity",
        entityId: hit.entity.id,
        layerId: hit.layer.id,
        offsetX: world.x - hit.entity.x,
        offsetY: world.y - hit.entity.y,
      };
      return;
    }

    this.callbacks.onSelectEntity(null);
    }

    handleMouseMove(event) {
    if (!this.state || !this.drag) return;
    const point = this.getScreenPoint(event);

    if (this.drag.type === "pan") {
      this.callbacks.onCameraChange({
        x: this.drag.cameraX - (point.x - this.drag.startX) / this.state.camera.zoom,
        y: this.drag.cameraY - (point.y - this.drag.startY) / this.state.camera.zoom,
        zoom: this.state.camera.zoom,
      });
      return;
    }

    if (this.drag.type === "entity") {
      const layer = getLayer(this.state, this.drag.layerId);
      if (!layer) return;

      const world = this.screenToWorld(point.x, point.y, this.state.camera, layer.parallax);
      this.callbacks.onMoveEntity(this.drag.entityId, {
        x: Math.round(world.x - this.drag.offsetX),
        y: Math.round(world.y - this.drag.offsetY),
      });
    }
    }

    handleMouseUp() {
    this.drag = null;
    }

    handleDoubleClick(event) {
    if (!this.state) return;
    const point = this.getScreenPoint(event);
    const activeLayer = getLayer(this.state, this.state.activeLayerId);
    const world = this.screenToWorld(point.x, point.y, this.state.camera, activeLayer?.parallax || 1);
    this.callbacks.onCanvasDoubleClick({
      x: Math.round(world.x),
      y: Math.round(world.y),
    });
    }

    handleWheel(event) {
    if (!this.state) return;
    event.preventDefault();

    const point = this.getScreenPoint(event);
    const before = this.screenToWorld(point.x, point.y, this.state.camera, 1);
    const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
    const zoom = clamp(this.state.camera.zoom * factor, CAMERA_LIMITS.minZoom, CAMERA_LIMITS.maxZoom);
    const after = this.screenToWorld(point.x, point.y, { ...this.state.camera, zoom }, 1);

    this.callbacks.onCameraChange({
      x: this.state.camera.x + (before.x - after.x),
      y: this.state.camera.y + (before.y - after.y),
      zoom,
    });
    }

    getCanvasCenterWorld(state, parallax = 1) {
    return this.screenToWorld(this.viewport.width / 2, this.viewport.height / 2, state.camera, parallax);
    }
  }

  window.LucidEditor.views = window.LucidEditor.views || {};
  window.LucidEditor.views.CanvasView = CanvasView;
})();
