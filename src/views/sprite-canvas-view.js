(() => {
  "use strict";

  // Ab diesem Zoom (Bildpixel : Bildschirmpixel) legt sich ein feiner
  // Pixelraster ueber das Sheet (wie in Photoshop auf Pixelebene).
  const PIXEL_GRID_MIN_ZOOM = 8;
  const HANDLE_TOLERANCE = 7;
  const HANDLE_SIZE = 4;
  // Alpha-Schwelle, ab der ein Pixel als "Inhalt" (nicht transparent) gilt.
  const ALPHA_THRESHOLD = 10;
  // Kantenlaenge einer Schachbrett-Kachel in Bildschirmpixeln (zoomunabhaengig,
  // wie der Transparenz-Hintergrund in Photoshop).
  const CHECKER_SIZE = 8;
  const DEFAULT_CHECKER = { a: "#6b7280", b: "#454b52" };

  // Zeichnet ein zweifarbiges Schachbrett in den Bereich [x,y,w,h] (Bildschirm-
  // koordinaten). Dient als Transparenz-Hintergrund hinter Sprites.
  function drawCheckerboard(ctx, x, y, w, h, colorA, colorB) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = colorA;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = colorB;
    const startCol = Math.floor(x / CHECKER_SIZE);
    const startRow = Math.floor(y / CHECKER_SIZE);
    const endCol = Math.ceil((x + w) / CHECKER_SIZE);
    const endRow = Math.ceil((y + h) / CHECKER_SIZE);
    for (let row = startRow; row < endRow; row += 1) {
      for (let col = startCol; col < endCol; col += 1) {
        if ((row + col) % 2 === 0) continue;
        ctx.fillRect(col * CHECKER_SIZE, row * CHECKER_SIZE, CHECKER_SIZE, CHECKER_SIZE);
      }
    }
    ctx.restore();
  }

  // Canvas-Ansicht des Sprite-Editors. Haelt mehrere Quell-Sheets, zeigt das
  // aktive an und erkennt Frames darin ueber rote Rahmen (portiert aus dem
  // Python-Sprite-Mapper). Die zu zeichnenden Frame-Boxen liefert der
  // Controller (Frames der aktiven Animation, gefiltert aufs aktive Sheet).
  // Werkzeuge: "pick" markiert/bearbeitet bestehende Frames (Einfachklick =
  // auswaehlen + Griffe; Doppelklick = auf roten Rahmen bzw. transparenten
  // Inhalt einrasten, togglet zwischen beiden); "draw" zieht neue Frames auf.
  class SpriteCanvasView {
    constructor(canvas, callbacks) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.callbacks = callbacks || {};
      this.viewport = { width: 1, height: 1, dpr: 1 };

      this.sheets = new Map(); // id -> { image, pixels, width, height }
      this.activeSheetId = null;
      this.frames = [];
      this.camera = { x: 0, y: 0, zoom: 1 };
      this.drag = null;
      this.tool = "pick"; // pick | draw | pan | zoom
      this.selectedFrameId = null;
      this.drawPreview = null;
      this.checker = { ...DEFAULT_CHECKER };

      this.handleResize = this.handleResize.bind(this);
      this.handleMouseDown = this.handleMouseDown.bind(this);
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleMouseUp = this.handleMouseUp.bind(this);
      this.handleDoubleClick = this.handleDoubleClick.bind(this);
      this.handleWheel = this.handleWheel.bind(this);

      window.addEventListener("resize", this.handleResize);
      window.addEventListener("mousemove", this.handleMouseMove);
      window.addEventListener("mouseup", this.handleMouseUp);
      this.canvas.addEventListener("mousedown", this.handleMouseDown);
      this.canvas.addEventListener("dblclick", this.handleDoubleClick);
      this.canvas.addEventListener("wheel", this.handleWheel, { passive: false });
      this.canvas.addEventListener("contextmenu", (event) => event.preventDefault());

      if (typeof ResizeObserver !== "undefined") {
        this.resizeObserver = new ResizeObserver(() => this.handleResize());
        this.resizeObserver.observe(this.canvas);
      }
      this.handleResize();
    }

    handleResize() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.viewport = { width: rect.width || 1, height: rect.height || 1, dpr };
      this.canvas.width = Math.round(this.viewport.width * dpr);
      this.canvas.height = Math.round(this.viewport.height * dpr);
      this.render();
    }

    activeSheet() {
      return this.activeSheetId ? this.sheets.get(this.activeSheetId) || null : null;
    }

    getSheetImage(sheetId) {
      return this.sheets.get(sheetId)?.image || null;
    }

    addSheet(id, image) {
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;

      let pixels = null;
      const off = document.createElement("canvas");
      off.width = width;
      off.height = height;
      const offCtx = off.getContext("2d");
      offCtx.drawImage(image, 0, 0);
      try {
        pixels = offCtx.getImageData(0, 0, width, height).data;
      } catch (error) {
        this.callbacks.onPixelAccessError?.();
      }

      this.sheets.set(id, { image, pixels, width, height });
      return { width, height, hasPixels: Boolean(pixels) };
    }

    setActiveSheet(id) {
      this.activeSheetId = this.sheets.has(id) ? id : null;
      this.fitToView();
      this.render();
    }

    removeSheet(id) {
      this.sheets.delete(id);
      if (this.activeSheetId === id) this.activeSheetId = null;
    }

    setFrames(frames) {
      this.frames = frames || [];
      // Auswahl aufloesen, wenn der Frame (z. B. nach Sheet-/Animationswechsel)
      // nicht mehr Teil der sichtbaren Frames ist.
      if (this.selectedFrameId && !this.frames.some((frame) => frame.id === this.selectedFrameId)) {
        this.selectedFrameId = null;
      }
      this.render();
    }

    setSelectedFrame(id) {
      this.selectedFrameId = id || null;
      this.render();
    }

    setCheckerboard(a, b) {
      this.checker = { a: a || DEFAULT_CHECKER.a, b: b || DEFAULT_CHECKER.b };
    }

    setTool(tool) {
      this.tool = tool;
      this.updateCursor();
    }

    updateCursor() {
      if (this.drag?.type === "pan") { this.canvas.style.cursor = "grabbing"; return; }
      if (this.tool === "pan") this.canvas.style.cursor = "grab";
      else if (this.tool === "zoom") this.canvas.style.cursor = "ew-resize";
      else if (this.tool === "draw") this.canvas.style.cursor = "crosshair";
      else this.canvas.style.cursor = "default";
    }

    resetZoom() {
      this.fitToView();
      this.render();
    }

    fitToView() {
      const sheet = this.activeSheet();
      if (!sheet) return;
      const zoom = Math.min(this.viewport.width / sheet.width, this.viewport.height / sheet.height) * 0.9;
      this.camera = { x: sheet.width / 2, y: sheet.height / 2, zoom: zoom || 1 };
    }

    imageToScreen(x, y) {
      return {
        x: (x - this.camera.x) * this.camera.zoom + this.viewport.width / 2,
        y: (y - this.camera.y) * this.camera.zoom + this.viewport.height / 2,
      };
    }

    screenToImage(x, y) {
      return {
        x: (x - this.viewport.width / 2) / this.camera.zoom + this.camera.x,
        y: (y - this.viewport.height / 2) / this.camera.zoom + this.camera.y,
      };
    }

    getScreenPoint(event) {
      const rect = this.canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    render() {
      const { ctx, viewport } = this;
      ctx.setTransform(viewport.dpr, 0, 0, viewport.dpr, 0, 0);
      ctx.clearRect(0, 0, viewport.width, viewport.height);
      ctx.fillStyle = "#0b1216";
      ctx.fillRect(0, 0, viewport.width, viewport.height);

      const sheet = this.activeSheet();
      if (!sheet) return;

      const topLeft = this.imageToScreen(0, 0);
      const drawW = sheet.width * this.camera.zoom;
      const drawH = sheet.height * this.camera.zoom;

      // Transparenz-Schachbrett hinter das Sheet legen (nur ueber der Sheet-
      // Flaeche, aussenrum bleibt der dunkle Editor-Hintergrund).
      drawCheckerboard(ctx, topLeft.x, topLeft.y, drawW, drawH, this.checker.a, this.checker.b);

      ctx.imageSmoothingEnabled = this.camera.zoom < 1;
      ctx.drawImage(sheet.image, topLeft.x, topLeft.y, drawW, drawH);
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.lineWidth = 1;
      ctx.strokeRect(topLeft.x, topLeft.y, drawW, drawH);

      this.drawPixelGrid(sheet);

      this.frames.forEach((frame, index) => {
        const p = this.imageToScreen(frame.x, frame.y);
        const w = frame.w * this.camera.zoom;
        const h = frame.h * this.camera.zoom;
        ctx.strokeStyle = "rgba(110,163,207,0.95)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(p.x, p.y, w, h);
        ctx.fillStyle = "rgba(110,163,207,0.12)";
        ctx.fillRect(p.x, p.y, w, h);

        const label = String(index + 1);
        ctx.fillStyle = "rgba(8,13,17,0.75)";
        ctx.fillRect(p.x, p.y, 18, 15);
        ctx.fillStyle = "#dfe8ee";
        ctx.font = '11px "Segoe UI", sans-serif';
        ctx.fillText(label, p.x + 4, p.y + 11);
      });

      // Auswahl hervorheben: im Auswaehlen-Werkzeug mit Griffen (bearbeitbar),
      // im Zeichnen-Werkzeug nur als Umriss (dort wird nicht bearbeitet).
      const selected = this.getSelectedFrame();
      if (selected) this.drawFrameSelection(selected, this.tool === "pick");

      // Laufende Aufziehvorschau eines neuen Frames.
      if (this.drawPreview) {
        const a = this.imageToScreen(
          Math.min(this.drawPreview.x0, this.drawPreview.x1),
          Math.min(this.drawPreview.y0, this.drawPreview.y1)
        );
        const w = Math.abs(this.drawPreview.x1 - this.drawPreview.x0) * this.camera.zoom;
        const h = Math.abs(this.drawPreview.y1 - this.drawPreview.y0) * this.camera.zoom;
        ctx.save();
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = "rgba(240,203,99,0.95)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(a.x, a.y, w, h);
        ctx.restore();
      }
    }

    // Feiner Pixelraster auf Bildpixel-Grenzen, nur ab hohem Zoom und nur im
    // sichtbaren Sheet-Bereich (aus Performancegruenden begrenzt).
    drawPixelGrid(sheet) {
      if (this.camera.zoom < PIXEL_GRID_MIN_ZOOM) return;
      const { ctx, viewport } = this;

      const tl = this.screenToImage(0, 0);
      const br = this.screenToImage(viewport.width, viewport.height);
      const x0 = Math.max(0, Math.floor(tl.x));
      const y0 = Math.max(0, Math.floor(tl.y));
      const x1 = Math.min(sheet.width, Math.ceil(br.x));
      const y1 = Math.min(sheet.height, Math.ceil(br.y));
      if (x1 <= x0 || y1 <= y0) return;

      const top = this.imageToScreen(x0, y0);
      const bottom = this.imageToScreen(x1, y1);

      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = x0; x <= x1; x += 1) {
        const sx = Math.round(this.imageToScreen(x, 0).x) + 0.5;
        ctx.moveTo(sx, top.y);
        ctx.lineTo(sx, bottom.y);
      }
      for (let y = y0; y <= y1; y += 1) {
        const sy = Math.round(this.imageToScreen(0, y).y) + 0.5;
        ctx.moveTo(top.x, sy);
        ctx.lineTo(bottom.x, sy);
      }
      ctx.stroke();
      ctx.restore();
    }

    getSelectedFrame() {
      return this.selectedFrameId
        ? this.frames.find((frame) => frame.id === this.selectedFrameId) || null
        : null;
    }

    frameScreenRect(frame) {
      const p = this.imageToScreen(frame.x, frame.y);
      return { x: p.x, y: p.y, w: frame.w * this.camera.zoom, h: frame.h * this.camera.zoom };
    }

    frameHandles(frame) {
      const r = this.frameScreenRect(frame);
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      return [
        ["nw", r.x, r.y], ["n", cx, r.y], ["ne", r.x + r.w, r.y],
        ["e", r.x + r.w, cy], ["se", r.x + r.w, r.y + r.h], ["s", cx, r.y + r.h],
        ["sw", r.x, r.y + r.h], ["w", r.x, cy],
      ].map(([dir, x, y]) => ({ dir, x, y }));
    }

    drawFrameSelection(frame, withHandles) {
      const ctx = this.ctx;
      const r = this.frameScreenRect(frame);
      ctx.save();
      ctx.strokeStyle = "rgba(240,203,99,0.95)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      if (withHandles) {
        ctx.fillStyle = "#f4f7f9";
        ctx.strokeStyle = "#0b1418";
        ctx.lineWidth = 1;
        this.frameHandles(frame).forEach((handle) => {
          ctx.beginPath();
          ctx.rect(handle.x - HANDLE_SIZE, handle.y - HANDLE_SIZE, HANDLE_SIZE * 2, HANDLE_SIZE * 2);
          ctx.fill();
          ctx.stroke();
        });
      }
      ctx.restore();
    }

    pickFrameHandle(point) {
      const frame = this.getSelectedFrame();
      if (!frame) return null;
      for (const handle of this.frameHandles(frame)) {
        if (Math.abs(point.x - handle.x) <= HANDLE_TOLERANCE && Math.abs(point.y - handle.y) <= HANDLE_TOLERANCE) {
          return handle.dir;
        }
      }
      return null;
    }

    handleCursor(dir) {
      if (dir === "nw" || dir === "se") return "nwse-resize";
      if (dir === "ne" || dir === "sw") return "nesw-resize";
      if (dir === "n" || dir === "s") return "ns-resize";
      return "ew-resize";
    }

    // Oberster (zuletzt gezeichneter) Frame, der den Bildpunkt enthaelt.
    frameAtImagePoint(img) {
      for (let i = this.frames.length - 1; i >= 0; i -= 1) {
        const f = this.frames[i];
        if (img.x >= f.x && img.x <= f.x + f.w && img.y >= f.y && img.y <= f.y + f.h) return f;
      }
      return null;
    }

    // Neue Bounds beim Ziehen eines Griffs; rastet auf ganze Bildpixel.
    computeFrameResize(orig, dir, img) {
      const minSize = 1;
      let left = orig.x;
      let top = orig.y;
      let right = orig.x + orig.w;
      let bottom = orig.y + orig.h;
      const ix = Math.round(img.x);
      const iy = Math.round(img.y);

      if (dir.includes("w")) left = Math.min(ix, right - minSize);
      if (dir.includes("e")) right = Math.max(ix, left + minSize);
      if (dir.includes("n")) top = Math.min(iy, bottom - minSize);
      if (dir.includes("s")) bottom = Math.max(iy, top + minSize);

      return { x: left, y: top, w: right - left, h: bottom - top };
    }

    clampRectToSheet(rect) {
      const sheet = this.activeSheet();
      if (!sheet) return rect;
      const x = Math.max(0, Math.min(rect.x, sheet.width - 1));
      const y = Math.max(0, Math.min(rect.y, sheet.height - 1));
      const w = Math.max(1, Math.min(rect.w, sheet.width - x));
      const h = Math.max(1, Math.min(rect.h, sheet.height - y));
      return { x, y, w, h };
    }

    // Position begrenzen, ohne die Groesse zu aendern (fuers Verschieben).
    clampPosToSheet(x, y, w, h) {
      const sheet = this.activeSheet();
      if (!sheet) return { x, y, w, h };
      const nx = Math.max(0, Math.min(x, Math.max(0, sheet.width - w)));
      const ny = Math.max(0, Math.min(y, Math.max(0, sheet.height - h)));
      return { x: nx, y: ny, w, h };
    }

    rectEquals(a, b) {
      return Boolean(a && b && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h);
    }

    // Bounding-Box des sichtbaren Inhalts (nicht transparent, nicht rot)
    // innerhalb einer Region in Bildkoordinaten. Liefert die aeussere Kante des
    // Sprites bzw. null, wenn die Region vollstaendig leer ist.
    contentBoundsWithin(region) {
      const sheet = this.activeSheet();
      if (!sheet || !sheet.pixels) return null;
      const rx0 = Math.max(0, Math.floor(region.x));
      const ry0 = Math.max(0, Math.floor(region.y));
      const rx1 = Math.min(sheet.width, Math.ceil(region.x + region.w));
      const ry1 = Math.min(sheet.height, Math.ceil(region.y + region.h));
      const px = sheet.pixels;
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      for (let y = ry0; y < ry1; y += 1) {
        for (let x = rx0; x < rx1; x += 1) {
          const i = (y * sheet.width + x) * 4;
          if (px[i + 3] <= ALPHA_THRESHOLD) continue;
          if (px[i] > 200 && px[i + 1] < 60 && px[i + 2] < 60) continue; // rote Rahmen ignorieren
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }

      if (maxX < minX) return null;
      return { x: minX, y: minY, w: (maxX - minX) + 1, h: (maxY - minY) + 1 };
    }

    // Suchregion fuers Einrasten am Inhalt: bevorzugt das rote Feld um den
    // Frame (voller Sprite), sonst der Frame leicht vergroessert.
    contentSnapBox(frame) {
      const redCell = this.detectFrameAt(frame.x + frame.w / 2, frame.y + frame.h / 2);
      const region = redCell || { x: frame.x - 8, y: frame.y - 8, w: frame.w + 16, h: frame.h + 16 };
      return this.contentBoundsWithin(region);
    }

    // Nur die bewegten Kanten an den Inhalts-Rand einrasten (Toleranz in
    // Bildschirmpixeln, zoomabhaengig umgerechnet).
    snapRectEdgesToBox(rect, dir, box) {
      if (!box) return rect;
      const t = Math.max(2, Math.round(8 / this.camera.zoom));
      let left = rect.x;
      let top = rect.y;
      let right = rect.x + rect.w;
      let bottom = rect.y + rect.h;
      const bl = box.x;
      const bt = box.y;
      const br = box.x + box.w;
      const bb = box.y + box.h;

      if (dir.includes("w") && Math.abs(left - bl) <= t) left = bl;
      if (dir.includes("e") && Math.abs(right - br) <= t) right = br;
      if (dir.includes("n") && Math.abs(top - bt) <= t) top = bt;
      if (dir.includes("s") && Math.abs(bottom - bb) <= t) bottom = bb;

      return { x: left, y: top, w: Math.max(1, right - left), h: Math.max(1, bottom - top) };
    }

    // ---- Rot-Erkennung (auf dem aktiven Sheet) ----
    isRed(x, y) {
      const sheet = this.activeSheet();
      if (!sheet || !sheet.pixels || x < 0 || y < 0 || x >= sheet.width || y >= sheet.height) return false;
      const i = (y * sheet.width + x) * 4;
      return sheet.pixels[i] > 200 && sheet.pixels[i + 1] < 60 && sheet.pixels[i + 2] < 60;
    }

    scanForRed(x, y, dx, dy) {
      const sheet = this.activeSheet();
      if (!sheet) return null;
      while (x >= 0 && y >= 0 && x < sheet.width && y < sheet.height) {
        if (this.isRed(x, y)) return { x, y };
        x += dx;
        y += dy;
      }
      return null;
    }

    detectFrameAt(imgX, imgY) {
      const sheet = this.activeSheet();
      if (!sheet || !sheet.pixels) return null;
      const x = Math.floor(imgX);
      const y = Math.floor(imgY);
      if (this.isRed(x, y)) return null;

      const left = this.scanForRed(x, y, -1, 0);
      const right = this.scanForRed(x, y, 1, 0);
      const top = this.scanForRed(x, y, 0, -1);
      const bottom = this.scanForRed(x, y, 0, 1);
      if (!left || !right || !top || !bottom) return null;

      const fx = left.x + 1;
      const fy = top.y + 1;
      const fw = right.x - fx;
      const fh = bottom.y - fy;
      if (fw < 2 || fh < 2) return null;
      return { x: fx, y: fy, w: fw, h: fh };
    }

    detectAllFrames() {
      const sheet = this.activeSheet();
      if (!sheet || !sheet.pixels) return [];
      const found = [];
      const seen = new Set();
      const stride = 6;

      for (let y = 0; y < sheet.height; y += stride) {
        for (let x = 0; x < sheet.width; x += stride) {
          if (this.isRed(x, y)) continue;
          const rect = this.detectFrameAt(x, y);
          if (!rect) continue;
          const key = `${rect.x}:${rect.y}:${rect.w}:${rect.h}`;
          if (seen.has(key)) continue;
          seen.add(key);
          found.push(rect);
        }
      }
      found.sort((a, b) => (a.y - b.y) || (a.x - b.x));
      return found;
    }

    // ---- Interaktion ----
    handleMouseDown(event) {
      if (!this.activeSheet()) return;
      const point = this.getScreenPoint(event);

      // Pan: mittlere/rechte Maustaste, Shift oder aktives Pan-Werkzeug.
      const forcePan = event.button === 1 || event.button === 2 || event.shiftKey || this.tool === "pan";
      if (forcePan) {
        this.drag = { type: "pan", startX: point.x, startY: point.y, camX: this.camera.x, camY: this.camera.y };
        this.canvas.style.cursor = "grabbing";
        return;
      }

      if (event.button !== 0) return;

      // Zoom-Werkzeug: horizontal ziehen (wie im Level-Editor).
      if (this.tool === "zoom") {
        this.drag = { type: "zoom", startX: point.x, anchor: point, startCamera: { ...this.camera } };
        return;
      }

      // Zeichnen-Werkzeug: ausschliesslich neue Frames aufziehen.
      if (this.tool === "draw") {
        const imgPt = this.screenToImage(point.x, point.y);
        this.selectedFrameId = null;
        this.drawPreview = { x0: imgPt.x, y0: imgPt.y, x1: imgPt.x, y1: imgPt.y };
        this.drag = { type: "frame-draw" };
        this.render();
        return;
      }

      // Auswaehlen-Werkzeug: bestehende Frames markieren, verschieben und ueber
      // Griffe anpassen. (Doppelklick rastet auf roten Rahmen / Inhalt ein.)
      const dir = this.pickFrameHandle(point);
      if (dir) {
        const frame = this.getSelectedFrame();
        this.callbacks.onFrameEditStart?.();
        this.drag = { type: "frame-resize", dir, id: frame.id, orig: { x: frame.x, y: frame.y, w: frame.w, h: frame.h }, snapBox: this.contentSnapBox(frame), changed: false };
        return;
      }

      const imgPt = this.screenToImage(point.x, point.y);
      const hit = this.frameAtImagePoint(imgPt);
      if (hit) {
        this.selectedFrameId = hit.id;
        this.callbacks.onFrameEditStart?.();
        this.drag = { type: "frame-move", id: hit.id, orig: { x: hit.x, y: hit.y, w: hit.w, h: hit.h }, startImg: imgPt, changed: false };
        this.render();
        return;
      }

      // Leere Flaeche: Auswahl aufheben.
      if (this.selectedFrameId) {
        this.selectedFrameId = null;
        this.render();
      }
    }

    handleMouseMove(event) {
      const point = this.getScreenPoint(event);

      if (!this.drag) {
        // Hover-Cursor: im Auswaehlen-Werkzeug Griff -> Resize, Frame -> Move.
        if (this.activeSheet()) {
          if (this.tool === "pick") {
            const dir = this.pickFrameHandle(point);
            if (dir) this.canvas.style.cursor = this.handleCursor(dir);
            else this.canvas.style.cursor = this.frameAtImagePoint(this.screenToImage(point.x, point.y)) ? "move" : "default";
          } else if (this.tool === "draw") {
            this.canvas.style.cursor = "crosshair";
          }
        }
        return;
      }

      if (this.drag.type === "frame-resize") {
        const img = this.screenToImage(point.x, point.y);
        let rect = this.computeFrameResize(this.drag.orig, this.drag.dir, img);
        rect = this.snapRectEdgesToBox(rect, this.drag.dir, this.drag.snapBox);
        rect = this.clampRectToSheet(rect);
        this.drag.changed = true;
        this.callbacks.onUpdateFrame?.(this.drag.id, rect);
        return;
      }

      if (this.drag.type === "frame-move") {
        const img = this.screenToImage(point.x, point.y);
        const dx = Math.round(img.x - this.drag.startImg.x);
        const dy = Math.round(img.y - this.drag.startImg.y);
        const rect = this.clampPosToSheet(this.drag.orig.x + dx, this.drag.orig.y + dy, this.drag.orig.w, this.drag.orig.h);
        if (dx !== 0 || dy !== 0) this.drag.changed = true;
        this.callbacks.onUpdateFrame?.(this.drag.id, rect);
        return;
      }

      if (this.drag.type === "frame-draw") {
        const img = this.screenToImage(point.x, point.y);
        this.drawPreview.x1 = img.x;
        this.drawPreview.y1 = img.y;
        this.render();
        return;
      }

      if (this.drag.type === "zoom") {
        const factor = Math.exp(-(point.x - this.drag.startX) * 0.01);
        const nextZoom = Math.max(0.05, Math.min(20, this.drag.startCamera.zoom * factor));
        const sc = this.drag.startCamera;
        const anchor = this.drag.anchor;
        const imgX = (anchor.x - this.viewport.width / 2) / sc.zoom + sc.x;
        const imgY = (anchor.y - this.viewport.height / 2) / sc.zoom + sc.y;
        this.camera.zoom = nextZoom;
        this.camera.x = imgX - (anchor.x - this.viewport.width / 2) / nextZoom;
        this.camera.y = imgY - (anchor.y - this.viewport.height / 2) / nextZoom;
        this.render();
        return;
      }

      this.camera.x = this.drag.camX - (point.x - this.drag.startX) / this.camera.zoom;
      this.camera.y = this.drag.camY - (point.y - this.drag.startY) / this.camera.zoom;
      this.render();
    }

    handleMouseUp() {
      if (!this.drag) return;
      const drag = this.drag;
      this.drag = null;

      if (drag.type === "frame-resize" || drag.type === "frame-move") {
        this.callbacks.onFrameEditEnd?.(drag.changed === true);
        this.updateCursor();
        return;
      }

      if (drag.type === "frame-draw") {
        const preview = this.drawPreview;
        this.drawPreview = null;
        if (preview) {
          const rect = this.clampRectToSheet({
            x: Math.round(Math.min(preview.x0, preview.x1)),
            y: Math.round(Math.min(preview.y0, preview.y1)),
            w: Math.round(Math.abs(preview.x1 - preview.x0)),
            h: Math.round(Math.abs(preview.y1 - preview.y0)),
          });
          if (rect.w >= 2 && rect.h >= 2) {
            const id = this.callbacks.onCreateFrame?.(rect);
            if (id) this.selectedFrameId = id;
          }
        }
        this.updateCursor();
        this.render();
        return;
      }

      this.updateCursor();
    }

    // Doppelklick im Auswaehlen-Werkzeug: rastet den Frame an dieser Stelle auf
    // den roten Rahmen. Ein weiterer Doppelklick auf denselben Frame togglet auf
    // den transparenten Inhalt (Auto-Crop) und beim naechsten Mal wieder zurueck.
    handleDoubleClick(event) {
      if (this.tool !== "pick" || !this.activeSheet()) return;
      const point = this.getScreenPoint(event);
      const img = this.screenToImage(point.x, point.y);

      const red = this.detectFrameAt(img.x, img.y);
      if (!red) { this.callbacks.onDetectMiss?.(); return; }
      const content = this.contentBoundsWithin(red);

      // Ein Frame gehoert zu diesem roten Feld, wenn er vollstaendig darin liegt.
      // So findet der Doppelklick den vorhandenen Frame auch, wenn er bereits auf
      // den (kleineren) Inhalt gecroppt ist und der Klick im transparenten Rand
      // landet — dadurch entstehen keine Duplikate.
      const belongs = (f) => Boolean(f
        && f.x >= red.x && f.y >= red.y
        && f.x + f.w <= red.x + red.w && f.y + f.h <= red.y + red.h);

      const frame = this.frames.find(belongs) || null;

      // Toggle: aktuell exakt der rote Rahmen -> auf Inhalt, sonst -> roter Rahmen.
      const target = (frame && content && this.rectEquals(frame, red)) ? content : red;

      if (frame) {
        this.selectedFrameId = frame.id;
        this.callbacks.onFrameEditStart?.();
        this.callbacks.onUpdateFrame?.(frame.id, target);
        this.callbacks.onFrameEditEnd?.(true);
      } else {
        const id = this.callbacks.onCreateFrame?.(target);
        if (id) this.selectedFrameId = id;
        this.render();
      }
    }

    handleWheel(event) {
      if (!this.activeSheet()) return;
      event.preventDefault();
      const point = this.getScreenPoint(event);
      const before = this.screenToImage(point.x, point.y);
      const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
      this.camera.zoom = Math.max(0.05, Math.min(20, this.camera.zoom * factor));
      const after = this.screenToImage(point.x, point.y);
      this.camera.x += before.x - after.x;
      this.camera.y += before.y - after.y;
      this.render();
    }
  }

  // Loop-Vorschau in der Sidebar. Spielt die uebergebenen Frames endlos ab;
  // jeder Frame kann aus einem anderen Sheet stammen, daher wird das Bild ueber
  // resolveImage(sheetId) aufgeloest.
  class SpritePreviewView {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.viewport = { width: 1, height: 1, dpr: 1 };
      this.frames = [];
      this.resolveImage = () => null;
      this.fps = 12;
      this.checker = { ...DEFAULT_CHECKER };

      this.handleResize = this.handleResize.bind(this);
      window.addEventListener("resize", this.handleResize);
      if (typeof ResizeObserver !== "undefined") {
        this.resizeObserver = new ResizeObserver(() => this.handleResize());
        this.resizeObserver.observe(this.canvas);
      }
      this.handleResize();

      if (typeof requestAnimationFrame !== "undefined") {
        const loop = (now) => {
          this.draw(now);
          this.rafId = requestAnimationFrame(loop);
        };
        this.rafId = requestAnimationFrame(loop);
      }
    }

    handleResize() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.viewport = { width: rect.width || 1, height: rect.height || 1, dpr };
      this.canvas.width = Math.round(this.viewport.width * dpr);
      this.canvas.height = Math.round(this.viewport.height * dpr);
    }

    setSource(frames, resolveImage, fps) {
      this.frames = Array.isArray(frames) ? frames : [];
      this.resolveImage = typeof resolveImage === "function" ? resolveImage : () => null;
      this.fps = Math.max(1, fps || 12);
    }

    setCheckerboard(a, b) {
      this.checker = { a: a || DEFAULT_CHECKER.a, b: b || DEFAULT_CHECKER.b };
    }

    draw(now) {
      const { ctx, viewport } = this;
      ctx.setTransform(viewport.dpr, 0, 0, viewport.dpr, 0, 0);
      ctx.clearRect(0, 0, viewport.width, viewport.height);
      // Transparenz-Schachbrett als Hintergrund der Vorschau.
      drawCheckerboard(ctx, 0, 0, viewport.width, viewport.height, this.checker.a, this.checker.b);
      if (!this.frames.length) return;

      const index = Math.floor((now || 0) / (1000 / this.fps)) % this.frames.length;
      const frame = this.frames[index];
      const image = frame && this.resolveImage(frame.sheetId);
      if (!frame || !image) return;

      const scale = Math.min(viewport.width / frame.w, viewport.height / frame.h) * 0.9;
      const drawW = frame.w * scale;
      const drawH = frame.h * scale;
      const dx = (viewport.width - drawW) / 2;
      const dy = (viewport.height - drawH) / 2;

      ctx.imageSmoothingEnabled = scale < 1;
      ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h, dx, dy, drawW, drawH);
    }
  }

  window.LucidEditor.views = window.LucidEditor.views || {};
  window.LucidEditor.views.SpriteCanvasView = SpriteCanvasView;
  window.LucidEditor.views.SpritePreviewView = SpritePreviewView;
})();
