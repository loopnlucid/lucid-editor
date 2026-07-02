(() => {
  "use strict";

  const {
    AREA_LOGIC_TYPES,
    LOGIC_LABELS,
    POINT_LOGIC_TYPES,
  } = window.LucidEditor.config;
  const { escapeHtml, groupBy, renderIcon } = window.LucidEditor.utils;
  const {
    getActiveLayer,
    getActiveLevel,
    getEntityPresentation,
    getLibraryItem,
    getPrimarySelectedEntity,
    getSelectedEntities,
    getSelectedLibraryItem,
  } = window.LucidEditor.model;

  // Liefert das inline-Style fuer die Library-Vorschau. Fuer Sprites mit
  // geladenem Sheet wird der erste Frame der Default-Animation seitenrichtig
  // (ohne Verzerrung) als Ausschnitt gezeigt, sonst die Typfarbe.
  function librarySwatchStyle(item) {
    if (item.type === "sprite" && item.sheet) {
      const sprites = window.LucidEditor.services?.sprites;
      const image = sprites?.requestSheet(item.sheet);
      if (image && image.naturalWidth) {
        const box = 52;
        const frameWidth = item.frameWidth || item.size.w;
        const frameHeight = item.frameHeight || item.size.h;
        const columns = Math.max(1, Math.floor(image.naturalWidth / frameWidth));
        const anim = item.animations?.[item.defaultState] || Object.values(item.animations || {})[0] || null;
        const frame = anim ? anim.startFrame : 0;
        const col = frame % columns;
        const row = Math.floor(frame / columns);
        const scale = Math.min(box / frameWidth, box / frameHeight);
        const backgroundWidth = image.naturalWidth * scale;
        const backgroundHeight = image.naturalHeight * scale;
        const posX = -col * frameWidth * scale;
        const posY = -row * frameHeight * scale;
        return `background-image:url('${escapeHtml(item.sheet)}');background-repeat:no-repeat;`
          + `background-size:${backgroundWidth}px ${backgroundHeight}px;`
          + `background-position:${posX}px ${posY}px;background-color:transparent;`;
      }
    }
    return `background:${escapeHtml(item.color)};`;
  }

  function renderSection(title, key, body, isOpen, { sub = false, actions = "" } = {}) {
    return `
      <details class="section${sub ? " is-sub" : ""}" data-section="${key}" ${isOpen ? "open" : ""}>
        <summary>
          ${renderIcon("chevron", "section-chevron")}
          <span class="section-title">${escapeHtml(title)}</span>
          ${actions ? `<span class="section-actions">${actions}</span>` : ""}
        </summary>
        ${body}
      </details>
    `;
  }

  function renderInfoSection(state) {
    const selectedEntities = getSelectedEntities(state);

    if (!selectedEntities.length) return "";

    if (selectedEntities.length > 1) {
      return renderSection("Info", "info", `
        <div class="section-body">
          <div class="empty-state">${selectedEntities.length} Elemente markiert. Detaillierte Objektinfos erscheinen bei Einzelauswahl.</div>
        </div>
      `, state.editorState.openSections.info);
    }

    const entity = selectedEntities[0];
    const level = getActiveLevel(state);
    const layer = level?.layers.find((candidate) => candidate.id === entity.layerId) || null;
    const presentation = getEntityPresentation(state, entity);
    const bounds = presentation.bounds;
    const badges = [
      entity.locked ? '<span class="badge is-danger">locked</span>' : "",
      entity.visible === false ? '<span class="badge is-muted">hidden</span>' : "",
      `<span class="badge is-accent">${escapeHtml(presentation.entityType)}</span>`,
      presentation.logicType ? `<span class="badge">${escapeHtml(presentation.logicType)}</span>` : "",
    ].filter(Boolean).join("");

    return renderSection("Info", "info", `
      <div class="section-body">
        <div class="badge-row">${badges}</div>

        <div class="info-grid" style="margin-top:12px;">
          <div class="field">
            <span>ID</span>
            <code>${escapeHtml(entity.id)}</code>
          </div>
          <div class="field">
            <span>Ebene</span>
            <code>${escapeHtml(layer?.name || entity.layerId)}</code>
          </div>
          <div class="field">
            <span>Position</span>
            <code>${Math.round(entity.x)}, ${Math.round(entity.y)}</code>
          </div>
          <div class="field">
            <span>Bounds</span>
            <code>${Math.round(bounds.width)} x ${Math.round(bounds.height)}</code>
          </div>
          ${presentation.item ? `
            <div class="field full">
              <span>Quelle</span>
              <code>${escapeHtml(presentation.item.label)}</code>
            </div>
          ` : `
            <div class="field full">
              <span>Typischer Kontext</span>
              <code>${escapeHtml(LOGIC_LABELS[presentation.logicType] || "Logic")}</code>
            </div>
          `}
        </div>
      </div>
    `, state.editorState.openSections.info);
  }

  function renderLayerOptions(state, selectedLayerId) {
    const level = getActiveLevel(state);
    return level.layers.map((layer) => `
      <option value="${layer.id}" ${layer.id === selectedLayerId ? "selected" : ""}>${escapeHtml(layer.name)}</option>
    `).join("");
  }

  function renderLogicTypeOptions(shape, currentType) {
    const options = shape === "point" ? POINT_LOGIC_TYPES : AREA_LOGIC_TYPES;
    return options.map((logicType) => `
      <option value="${logicType}" ${logicType === currentType ? "selected" : ""}>${escapeHtml(LOGIC_LABELS[logicType])}</option>
    `).join("");
  }

  function renderPropertiesSection(state) {
    const selectedEntities = getSelectedEntities(state);

    if (!selectedEntities.length) return "";

    if (selectedEntities.length > 1) {
      return renderSection("Eigenschaften", "properties", `
        <div class="section-body">
          <div class="empty-state">Mehrfachauswahl ist fuer Bulk-Edits noch nicht freigeschaltet.</div>
          <div class="button-row">
            <button class="action-button danger" type="button" id="deleteSelectionButton">Auswahl loeschen</button>
          </div>
        </div>
      `, state.editorState.openSections.properties);
    }

    const entity = getPrimarySelectedEntity(state);
    const presentation = getEntityPresentation(state, entity);

    return renderSection("Eigenschaften", "properties", `
      <div class="section-body">
        <div class="field-grid">
          <label class="field full">
            <span>Name</span>
            <input type="text" name="entity-name" value="${escapeHtml(entity.name)}" data-entity-field="name" />
          </label>
          <label class="field">
            <span>X</span>
            <input type="number" name="entity-x" value="${entity.x}" data-entity-field="x" />
          </label>
          <label class="field">
            <span>Y</span>
            <input type="number" name="entity-y" value="${entity.y}" data-entity-field="y" />
          </label>
          <label class="field full">
            <span>Ebene</span>
            <select name="entity-layer" data-entity-field="layerId">${renderLayerOptions(state, entity.layerId)}</select>
          </label>
        </div>

        <div class="field-grid" style="margin-top:12px;">
          <label class="toggle-row">
            <span>Sichtbar</span>
            <input type="checkbox" name="entity-visible" ${entity.visible !== false ? "checked" : ""} data-entity-field="visible" />
          </label>
          <label class="toggle-row">
            <span>Gesperrt</span>
            <input type="checkbox" name="entity-locked" ${entity.locked === true ? "checked" : ""} data-entity-field="locked" />
          </label>
        </div>

        ${presentation.entityType === "logic" ? `
          <div class="field-grid" style="margin-top:12px;">
            <label class="field full">
              <span>Logic-Typ</span>
              <select name="logic-type" data-logic-field="logicType">
                ${renderLogicTypeOptions(presentation.shape, presentation.logicType)}
              </select>
            </label>
            ${presentation.shape === "rect" ? `
              <label class="field">
                <span>Breite</span>
                <input type="number" min="1" name="logic-width" value="${entity.properties.width}" data-logic-field="width" />
              </label>
              <label class="field">
                <span>Hoehe</span>
                <input type="number" min="1" name="logic-height" value="${entity.properties.height}" data-logic-field="height" />
              </label>
            ` : ""}
          </div>
          ${presentation.shape === "polygon" ? `
            <div class="meta-card" style="margin-top:12px;">
              <div class="stats-row"><span>Punkte</span><strong>${entity.properties.points?.length || 0}</strong></div>
              <div class="section-note" style="margin-top:8px;">Polygonpunkte lassen sich direkt auf der Canvas an den Griffen verschieben (Werkzeug Markieren oder Verschieben).</div>
            </div>
          ` : ""}
        ` : `
          <div class="meta-card" style="margin-top:12px;">
            <div class="stats-row"><span>Typ</span><strong>${escapeHtml(presentation.entityType)}</strong></div>
            <div class="stats-row"><span>Quelle</span><strong>${escapeHtml(presentation.item?.label || "-")}</strong></div>
            <div class="stats-row"><span>Pivot</span><strong>${escapeHtml(presentation.entityType === "sprite" ? "unten mittig" : "oben links")}</strong></div>
          </div>
        `}

        <div class="button-row">
          <button class="action-button danger" type="button" id="deleteSelectionButton">Auswahl loeschen</button>
        </div>
      </div>
    `, state.editorState.openSections.properties);
  }

  function renderLibrarySection(state) {
    const selectedItem = getSelectedLibraryItem(state);
    const libraryQuery = state.editorState.libraryQuery?.trim().toLowerCase() || "";
    const visibleItems = state.library.filter((item) => {
      if (!libraryQuery) return true;
      return [item.label, item.description, ...(item.tags || [])]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(libraryQuery));
    });
    const groupedItems = groupBy(visibleItems, (item) => item.group || item.type);

    return renderSection("Library", "library", `
      <div class="section-body">
        <div class="library-search">
          <label class="field">
            <span>Suche</span>
            <input type="search" name="library-search" value="${escapeHtml(state.editorState.libraryQuery || "")}" placeholder="Label, Beschreibung oder Tags" id="librarySearchInput" />
          </label>
        </div>

        <div class="library-list">
          ${visibleItems.length ? Object.entries(groupedItems).map(([groupName, items]) => `
            <section>
              <div class="section-label" style="margin-bottom:8px;">${escapeHtml(groupName)}</div>
              ${items.map((item) => {
                const isSelected = item.id === state.editorState.selectedLibraryItemId;
                const isExpanded = item.id === state.editorState.expandedLibraryItemId;
                const classes = [
                  "library-item",
                  isSelected ? "is-selected" : "",
                  isExpanded ? "is-expanded" : "",
                ].filter(Boolean).join(" ");

                return `
                  <article class="${classes}">
                    <button
                      class="library-item-header"
                      type="button"
                      data-select-library-item="${item.id}"
                      data-toggle-library-item="${item.id}"
                    >
                      <span class="library-swatch" style="${librarySwatchStyle(item)}"></span>
                      <span class="library-copy">
                        <strong>${escapeHtml(item.label)}</strong>
                      </span>
                    </button>

                    ${isExpanded ? `
                      <div class="library-item-body">
                        <div class="pill-row">
                          ${(item.tags || []).map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join("") || '<span class="pill">keine Tags</span>'}
                        </div>
                        <p class="section-note">${escapeHtml(item.description || "Keine Beschreibung hinterlegt.")}</p>
                        <div class="stats-row"><span>Groesse</span><strong>${item.size.w} x ${item.size.h}</strong></div>
                        <div class="stats-row"><span>Faehigkeiten</span><strong>${escapeHtml((item.capabilities || []).join(", ") || "keine")}</strong></div>
                        <div class="button-row">
                          <button class="action-button" type="button" data-place-library-item="${item.id}">In sichtbarem Ausschnitt platzieren</button>
                        </div>
                      </div>
                    ` : ""}
                  </article>
                `;
              }).join("")}
            </section>
          `).join("") : '<div class="empty-state">Keine Library-Items fuer diese Suche gefunden.</div>'}
        </div>

        ${selectedItem ? `
          <div class="meta-card" style="margin-top:12px;">
            <div class="stats-row"><span>Ausgewaehlt</span><strong>${escapeHtml(selectedItem.label)}</strong></div>
            <div class="stats-row"><span>Aktive Ebene</span><strong>${escapeHtml(getActiveLayer(state)?.name || "Keine")}</strong></div>
          </div>
        ` : ""}
      </div>
    `, state.editorState.openSections.library);
  }

  function renderLevelSettingsSection(state) {
    const level = getActiveLevel(state);
    const sections = state.editorState.openSections;

    const metaBody = `
      <div class="section-body">
        <div class="meta-card" style="margin-bottom:12px;">
          <div class="stats-row"><span>Projekt</span><strong>${escapeHtml(state.meta.projectName)}</strong></div>
        </div>
        <div class="field-grid">
          <label class="field full">
            <span>Levelname</span>
            <input type="text" name="level-name" value="${escapeHtml(level.name)}" data-level-group="level" data-level-field="name" />
          </label>
          <label class="field full">
            <span>Beschreibung</span>
            <input type="text" name="level-description" value="${escapeHtml(level.description || "")}" data-level-group="level" data-level-field="description" />
          </label>
          <label class="field">
            <span>Version</span>
            <input type="number" min="1" name="level-version" value="${level.version}" data-level-group="level" data-level-field="version" />
          </label>
          <label class="toggle-row">
            <span>Aktiv</span>
            <input type="checkbox" name="level-active" ${level.active !== false ? "checked" : ""} data-level-group="level" data-level-field="active" />
          </label>
        </div>
      </div>
    `;

    const boundsBody = `
      <div class="section-body">
        <div class="field-grid compact">
          <label class="field">
            <span>X</span>
            <input type="number" name="bounds-x" value="${level.bounds.x}" data-level-group="bounds" data-level-field="x" />
          </label>
          <label class="field">
            <span>Y</span>
            <input type="number" name="bounds-y" value="${level.bounds.y}" data-level-group="bounds" data-level-field="y" />
          </label>
          <label class="field">
            <span>Breite</span>
            <input type="number" min="1" name="bounds-width" value="${level.bounds.width}" data-level-group="bounds" data-level-field="width" />
          </label>
          <label class="field">
            <span>Hoehe</span>
            <input type="number" min="1" name="bounds-height" value="${level.bounds.height}" data-level-group="bounds" data-level-field="height" />
          </label>
        </div>
      </div>
    `;

    const cameraBody = `
      <div class="section-body">
        <div class="field-grid compact">
          <label class="field">
            <span>Start X</span>
            <input type="number" name="camera-start-x" value="${level.cameraStart.x}" data-level-group="cameraStart" data-level-field="x" />
          </label>
          <label class="field">
            <span>Start Y</span>
            <input type="number" name="camera-start-y" value="${level.cameraStart.y}" data-level-group="cameraStart" data-level-field="y" />
          </label>
        </div>
      </div>
    `;

    const backgroundBody = `
      <div class="section-body">
        <label class="field">
          <span>Farbwert</span>
          <input type="color" name="level-background" value="${escapeHtml(level.background || "#10202b")}" data-level-group="level" data-level-field="background" />
        </label>
      </div>
    `;

    const generalBody = `
      <div class="section-body">
        <div class="field-grid">
          <label class="field">
            <span>Gravity</span>
            <input type="number" name="settings-gravity" value="${level.settings.gravity ?? ""}" placeholder="Projekt-Default" data-level-group="settings" data-level-field="gravity" />
          </label>
          <label class="field">
            <span>Camera Mode</span>
            <input type="text" name="settings-camera-mode" value="${escapeHtml(level.settings.cameraMode || "")}" data-level-group="settings" data-level-field="cameraMode" />
          </label>
          <label class="field full">
            <span>Musik</span>
            <input type="text" name="settings-music" value="${escapeHtml(level.settings.music || "")}" data-level-group="settings" data-level-field="music" />
          </label>
        </div>
      </div>
    `;

    const body = `
      <div class="section-body is-group">
        ${renderSection("Meta", "levelMeta", metaBody, sections.levelMeta, { sub: true })}
        ${renderSection("Bounds", "levelBounds", boundsBody, sections.levelBounds, { sub: true })}
        ${renderSection("Camera", "levelCamera", cameraBody, sections.levelCamera, { sub: true })}
        ${renderSection("Background", "levelBackground", backgroundBody, sections.levelBackground, { sub: true })}
        ${renderSection("Settings", "levelGeneral", generalBody, sections.levelGeneral, { sub: true })}
      </div>
    `;

    return renderSection("Level Settings", "levelSettings", body, sections.levelSettings);
  }

  function bindSectionToggles(root, actions) {
    root.querySelectorAll("details[data-section]").forEach((detailsNode) => {
      detailsNode.addEventListener("toggle", () => {
        actions.onToggleSection(detailsNode.dataset.section, detailsNode.open);
      });
    });
  }

  function renderInspectorPanel(root, state, actions) {
    root.innerHTML = `
      <div class="sidebar-stack">
        ${renderInfoSection(state)}
        ${renderPropertiesSection(state)}
        ${renderLibrarySection(state)}
        ${renderLevelSettingsSection(state)}
      </div>
    `;

    bindSectionToggles(root, actions);

    root.querySelectorAll("[data-select-library-item]").forEach((node) => {
      node.addEventListener("click", () => {
        const itemId = node.dataset.selectLibraryItem;
        actions.onSelectLibraryItem(itemId);
        actions.onToggleLibraryItem(itemId);
      });
      node.addEventListener("dblclick", () => actions.onPlaceLibraryItem(node.dataset.selectLibraryItem));
    });

    root.querySelectorAll("[data-place-library-item]").forEach((node) => {
      node.addEventListener("click", () => actions.onPlaceLibraryItem(node.dataset.placeLibraryItem));
    });

    root.querySelector("#librarySearchInput")?.addEventListener("input", (event) => {
      actions.onUpdateLibraryQuery(event.target.value);
    });

    root.querySelectorAll("[data-entity-field]").forEach((node) => {
      const eventName = node.type === "checkbox" ? "change" : "change";
      node.addEventListener(eventName, () => {
        const value = node.type === "checkbox" ? String(node.checked) : node.value;
        actions.onUpdateSelectedEntity(node.dataset.entityField, value);
      });
    });

    root.querySelectorAll("[data-logic-field]").forEach((node) => {
      node.addEventListener("change", () => {
        actions.onUpdateSelectedLogic(node.dataset.logicField, node.value);
      });
    });

    root.querySelectorAll("[data-level-group][data-level-field]").forEach((node) => {
      const eventName = node.type === "checkbox" ? "change" : "change";
      node.addEventListener(eventName, () => {
        const value = node.type === "checkbox" ? String(node.checked) : node.value;
        actions.onUpdateLevelField(node.dataset.levelGroup, node.dataset.levelField, value);
      });
    });

    root.querySelectorAll("#deleteSelectionButton").forEach((node) => {
      node.addEventListener("click", actions.onDeleteSelectedEntities);
    });
  }

  window.LucidEditor.views = window.LucidEditor.views || {};
  window.LucidEditor.views.renderInspectorPanel = renderInspectorPanel;
})();
