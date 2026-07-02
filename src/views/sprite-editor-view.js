(() => {
  "use strict";

  const { escapeHtml, renderIcon } = window.LucidEditor.utils;

  function getActiveAnimation(draft) {
    return draft.animations.find((anim) => anim.id === draft.activeAnimationId) || null;
  }

  function sheetIndexMap(draft) {
    const map = new Map();
    draft.sheets.forEach((sheet, index) => map.set(sheet.id, index + 1));
    return map;
  }

  // Obere Leiste: Sheet-Tabs, Werkzeuge (Pick/Pan/Zoom, wie im Level-Editor),
  // Undo/Redo, Sheet laden/erkennen/leeren, zurueck.
  function renderSpriteToolbar(root, draft, ui, actions) {
    const busy = Boolean(draft.loading);
    const activeAnim = getActiveAnimation(draft);
    const canDetect = draft.activeSheetId && !busy;
    const canClear = activeAnim && activeAnim.frames.length && !busy;
    const canCreate = draft.animations.some((anim) => anim.frames.length) && !busy;
    const checker = ui.checker || { a: "#6b7280", b: "#454b52" };

    const tabs = draft.sheets.map((sheet) => `
      <div class="sprite-tab ${sheet.id === draft.activeSheetId ? "is-active" : ""}" data-select-sheet="${sheet.id}" title="${escapeHtml(sheet.name)}">
        <span class="sprite-tab-name">${escapeHtml(sheet.name)}</span>
        <button class="sprite-tab-close" type="button" data-close-sheet="${sheet.id}" title="Sheet schliessen">×</button>
      </div>
    `).join("");

    const toolButton = (tool, icon, tip) => `
      <button class="tool-button ${ui.tool === tool ? "is-active" : ""}" type="button" data-sprite-tool="${tool}" title="${tip}">
        ${renderIcon(icon)}
      </button>
    `;

    root.innerHTML = `
      <div class="top-toolbar-main">
        <div class="toolbar-group">
          ${toolButton("pick", "select", "Auswaehlen (V): Frame anklicken zum Markieren und ueber Griffe anpassen (rastet am Inhalt ein); Doppelklick rastet auf roten Rahmen bzw. transparenten Inhalt (togglet); Entf loescht den markierten Frame")}
          ${toolButton("draw", "box-select", "Frame ziehen (M): neues Rechteck aufziehen; rastet auf Pixel")}
          ${toolButton("pan", "pan", "Pan (H): Ansicht mit gedrueckter Maus verschieben")}
          ${toolButton("zoom", "zoom", "Zoom (Z): horizontal ziehen zum Zoomen, Doppelklick setzt zurueck")}
        </div>
        <div class="toolbar-group">
          <button class="icon-button" type="button" id="spriteUndo" ${ui.canUndo ? "" : "disabled"} title="Rueckgaengig (Ctrl+Z)">
            ${renderIcon("undo")}
          </button>
          <button class="icon-button" type="button" id="spriteRedo" ${ui.canRedo ? "" : "disabled"} title="Wiederholen (Ctrl+Y)">
            ${renderIcon("redo")}
          </button>
        </div>
        <div class="toolbar-group">
          <button class="icon-button" type="button" id="spriteLoadSheet" ${busy ? "disabled" : ""} title="Sheet laden: weiteres Quell-PNG hinzufuegen">
            ${renderIcon("folder-open")}
          </button>
          <button class="icon-button" type="button" id="spriteDetectAll" ${canDetect ? "" : "disabled"} title="Frames erkennen: alle rot umrandeten Frames des aktiven Sheets in die aktive Animation uebernehmen">
            ${renderIcon("wand")}
          </button>
          <button class="icon-button is-danger" type="button" id="spriteClearFrames" ${canClear ? "" : "disabled"} title="Leeren: Frames der aktiven Animation entfernen">
            ${renderIcon("trash")}
          </button>
        </div>
        <div class="checker-stack" title="Transparenz-Hintergrund: zwei Farben fuers Schachbrett hinter Sheet und Vorschau">
          <input type="color" class="checker-swatch is-front" id="spriteCheckerA" value="${escapeHtml(checker.a)}" title="Schachbrett-Farbe 1" />
          <input type="color" class="checker-swatch" id="spriteCheckerB" value="${escapeHtml(checker.b)}" title="Schachbrett-Farbe 2" />
        </div>
        <button class="action-button" type="button" id="spriteCreate" ${canCreate ? "" : "disabled"} title="Sprite erstellen: alle Animationen in ein Sheet packen und als Library-Item speichern">
          ${renderIcon("save")}<span>Sprite erstellen</span>
        </button>
        <div class="sprite-tabs">${tabs}</div>
      </div>

      <div class="top-toolbar-meta">
        <button class="icon-button" type="button" id="spriteBackToLevel" title="Zurueck zum Level-Editor">
          ${renderIcon("level")}
        </button>
      </div>
    `;

    root.querySelectorAll("[data-select-sheet]").forEach((node) => {
      node.addEventListener("click", (event) => {
        if (event.target.closest("[data-close-sheet]")) return;
        actions.onSelectSheet(node.dataset.selectSheet);
      });
    });
    root.querySelectorAll("[data-close-sheet]").forEach((node) => {
      node.addEventListener("click", (event) => {
        event.stopPropagation();
        actions.onCloseSheet(node.dataset.closeSheet);
      });
    });
    root.querySelectorAll("[data-sprite-tool]").forEach((node) => {
      node.addEventListener("click", () => actions.onSelectTool(node.dataset.spriteTool));
      node.addEventListener("dblclick", () => {
        if (node.dataset.spriteTool === "zoom") actions.onResetZoom();
      });
    });
    root.querySelector("#spriteUndo")?.addEventListener("click", () => actions.onUndo());
    root.querySelector("#spriteRedo")?.addEventListener("click", () => actions.onRedo());
    root.querySelector("#spriteLoadSheet")?.addEventListener("click", () => actions.onLoadSheet());
    root.querySelector("#spriteDetectAll")?.addEventListener("click", () => actions.onDetectAll());
    root.querySelector("#spriteClearFrames")?.addEventListener("click", () => actions.onClearFrames());
    root.querySelector("#spriteCreate")?.addEventListener("click", () => actions.onCreateSprite());
    root.querySelector("#spriteBackToLevel")?.addEventListener("click", () => actions.onSelectWorkspace("level-editor"));

    const swatchA = root.querySelector("#spriteCheckerA");
    const swatchB = root.querySelector("#spriteCheckerB");
    const emitChecker = () => actions.onCheckerChange?.(swatchA?.value, swatchB?.value);
    // Angeklicktes Quadrat nach vorne holen (wie Vorder-/Hintergrundfarbe).
    const bringFront = (front) => {
      swatchA?.classList.toggle("is-front", front === swatchA);
      swatchB?.classList.toggle("is-front", front === swatchB);
    };
    [swatchA, swatchB].forEach((swatch) => {
      swatch?.addEventListener("pointerdown", () => bringFront(swatch));
      swatch?.addEventListener("input", emitChecker);
    });
  }

  function renderSpriteOverlay(root, draft) {
    if (draft.loading) {
      root.className = "sprite-overlay is-blocking";
      root.innerHTML = `<div class="sprite-loading"><div class="spinner"></div><span>Sheet wird geladen …</span></div>`;
      return;
    }

    root.className = "sprite-overlay";

    if (!draft.sheets.length) {
      root.innerHTML = `
        <div class="sprite-empty">
          <div class="sprite-empty-inner">
            ${renderIcon("sprite")}
            <strong>Kein Sprite-Sheet geladen</strong>
            <span>Ziehe ein rot umrandetes Mosaik-PNG auf die Flaeche oder lade es oben. Du kannst mehrere Sheets laden und daraus Animationen zusammenklicken.</span>
          </div>
        </div>
      `;
      return;
    }

    if (draft.pixelError) {
      root.innerHTML = `<div class="sprite-hint is-warning">Pixel des Sheets nicht lesbar. Bitte den Editor ueber den lokalen Server oeffnen (nicht per Doppelklick).</div>`;
      return;
    }

    const activeAnim = getActiveAnimation(draft);
    const name = activeAnim ? escapeHtml(activeAnim.name) : "—";
    root.innerHTML = `<div class="sprite-hint">Aktive Animation: <strong>${name}</strong>. Klick in eine Zelle erfasst den Frame (nochmal klicken entfernt ihn). Shift-Ziehen verschiebt, Mausrad zoomt.</div>`;
  }

  // Linke Sidebar: Liste der Animationen.
  function renderSpriteAnimationsPanel(root, draft, actions) {
    if (!draft.animations.length) {
      root.innerHTML = '<div class="empty-state">Noch keine Animation. Oben mit + anlegen und dann Frames anklicken.</div>';
      return;
    }

    root.innerHTML = `
      <div class="anim-list">
        ${draft.animations.map((anim) => `
          <article class="anim-card ${anim.id === draft.activeAnimationId ? "is-active" : ""}" data-select-anim="${anim.id}">
            <div class="anim-row">
              <input class="anim-name" type="text" value="${escapeHtml(anim.name)}" data-anim-name="${anim.id}" title="Animationsname" />
              <button class="icon-button is-danger" type="button" data-delete-anim="${anim.id}" title="Animation loeschen">
                ${renderIcon("trash")}
              </button>
            </div>
            <div class="anim-controls">
              <label class="field">
                <span>fps</span>
                <input type="number" min="1" max="60" step="1" value="${anim.fps}" data-anim-fps="${anim.id}" />
              </label>
              <label class="toggle-row anim-loop">
                <span>loop</span>
                <input type="checkbox" ${anim.loop ? "checked" : ""} data-anim-loop="${anim.id}" />
              </label>
              <span class="anim-count">${anim.frames.length} Frames</span>
            </div>
          </article>
        `).join("")}
      </div>
    `;

    root.querySelectorAll("[data-select-anim]").forEach((node) => {
      node.addEventListener("click", (event) => {
        if (event.target.closest("input, button, label")) return;
        actions.onSelectAnimation(node.dataset.selectAnim);
      });
    });
    root.querySelectorAll("[data-anim-name]").forEach((node) => {
      node.addEventListener("change", () => actions.onRenameAnimation(node.dataset.animName, node.value));
    });
    root.querySelectorAll("[data-anim-fps]").forEach((node) => {
      node.addEventListener("change", () => actions.onSetAnimationFps(node.dataset.animFps, node.value));
    });
    root.querySelectorAll("[data-anim-loop]").forEach((node) => {
      node.addEventListener("change", () => actions.onSetAnimationLoop(node.dataset.animLoop, node.checked));
    });
    root.querySelectorAll("[data-delete-anim]").forEach((node) => {
      node.addEventListener("click", (event) => {
        event.stopPropagation();
        actions.onDeleteAnimation(node.dataset.deleteAnim);
      });
    });
  }

  // Rechte Sidebar: Frames der aktiven Animation (mit Sheet-Marker, sortierbar).
  function renderSpriteFrameList(listRoot, countRoot, draft, actions) {
    const activeAnim = getActiveAnimation(draft);
    const frames = activeAnim ? activeAnim.frames : [];
    if (countRoot) countRoot.textContent = frames.length ? String(frames.length) : "";

    if (!draft.sheets.length) {
      listRoot.innerHTML = '<div class="empty-state">Noch kein Sheet geladen.</div>';
      return;
    }
    if (!activeAnim) {
      listRoot.innerHTML = '<div class="empty-state">Keine aktive Animation.</div>';
      return;
    }
    if (!frames.length) {
      listRoot.innerHTML = '<div class="empty-state">Keine Frames. "Frames erkennen" oder Zellen anklicken.</div>';
      return;
    }

    const sheetIndex = sheetIndexMap(draft);

    listRoot.innerHTML = frames.map((frame, index) => `
      <div class="frame-row" draggable="true" data-frame-id="${frame.id}" data-index="${index}">
        <span class="frame-grip">${renderIcon("move", "small")}</span>
        <span class="frame-index">${index + 1}</span>
        <span class="frame-sheet" title="Herkunfts-Sheet">S${sheetIndex.get(frame.sheetId) || "?"}</span>
        <span class="frame-dims">${frame.w} x ${frame.h}</span>
        <button class="icon-button is-danger" type="button" data-remove-frame="${frame.id}" title="Frame entfernen">
          ${renderIcon("trash")}
        </button>
      </div>
    `).join("");

    listRoot.querySelectorAll("[data-remove-frame]").forEach((node) => {
      node.addEventListener("click", () => actions.onRemoveFrame(node.dataset.removeFrame));
    });

    bindFrameDragAndDrop(listRoot, actions);
  }

  function bindFrameDragAndDrop(listRoot, actions) {
    let draggedId = null;

    listRoot.querySelectorAll(".frame-row").forEach((row) => {
      row.addEventListener("dragstart", (event) => {
        draggedId = row.dataset.frameId;
        row.classList.add("is-dragging");
        event.dataTransfer.effectAllowed = "move";
      });
      row.addEventListener("dragend", () => {
        row.classList.remove("is-dragging");
        listRoot.querySelectorAll(".frame-row").forEach((node) => node.classList.remove("is-drop-target"));
        draggedId = null;
      });
      row.addEventListener("dragover", (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        if (row.dataset.frameId !== draggedId) row.classList.add("is-drop-target");
      });
      row.addEventListener("dragleave", () => row.classList.remove("is-drop-target"));
      row.addEventListener("drop", (event) => {
        event.preventDefault();
        row.classList.remove("is-drop-target");
        const targetId = row.dataset.frameId;
        if (draggedId && targetId && draggedId !== targetId) {
          const rect = row.getBoundingClientRect();
          const placeAfter = (event.clientY - rect.top) > rect.height / 2;
          actions.onReorderFrames(draggedId, targetId, placeAfter);
        }
      });
    });
  }

  window.LucidEditor.views = window.LucidEditor.views || {};
  window.LucidEditor.views.renderSpriteToolbar = renderSpriteToolbar;
  window.LucidEditor.views.renderSpriteOverlay = renderSpriteOverlay;
  window.LucidEditor.views.renderSpriteAnimationsPanel = renderSpriteAnimationsPanel;
  window.LucidEditor.views.renderSpriteFrameList = renderSpriteFrameList;
})();
