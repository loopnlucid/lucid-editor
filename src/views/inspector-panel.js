(() => {
  "use strict";

  const { groupBy, escapeHtml } = window.LucidEditor.utils;
  const { getLayer, getSelectedEntity, getSelectedLibraryItem, getLibraryItem } = window.LucidEditor.model;

  function renderSelectionSection(state) {
    const entity = getSelectedEntity(state);

    if (!entity) {
      return `
      <div class="section-body">
        <div class="empty-state">
          Noch keine Instanz ausgewaehlt. Waehle ein Element auf der Canvas oder fuege eines aus der Library hinzu.
        </div>
      </div>
      `;
    }

    const layer = getLayer(state, entity.layerId);
    const item = getLibraryItem(state, entity.libraryItemId);

    return `
    <div class="section-body">
      <div class="field-grid">
        <label class="field full">
          <span>Name</span>
          <input type="text" value="${escapeHtml(entity.name)}" data-entity-field="name" />
        </label>

        <label class="field">
          <span>X</span>
          <input type="number" value="${entity.x}" data-entity-field="x" />
        </label>

        <label class="field">
          <span>Y</span>
          <input type="number" value="${entity.y}" data-entity-field="y" />
        </label>

        <label class="field">
          <span>Breite</span>
          <input type="number" min="1" value="${entity.w}" data-entity-field="w" />
        </label>

        <label class="field">
          <span>Hoehe</span>
          <input type="number" min="1" value="${entity.h}" data-entity-field="h" />
        </label>

        <label class="field full">
          <span>Ebene</span>
          <select data-entity-field="layerId">
            ${state.layers.map((optionLayer) => {
              const selected = optionLayer.id === entity.layerId ? "selected" : "";
              return `<option value="${optionLayer.id}" ${selected}>${escapeHtml(optionLayer.name)}</option>`;
            }).join("")}
          </select>
        </label>
      </div>

      <div class="divider"></div>

      <div class="meta-lines">
        <div class="field">
          <span>Library-Quelle</span>
          <code>${escapeHtml(item?.label || entity.libraryItemId)}</code>
        </div>
        <div class="field">
          <span>Aktuelle Ebene</span>
          <code>${escapeHtml(layer?.name || entity.layerId)}</code>
        </div>
      </div>

      <div class="pill-row">
        ${(item?.capabilities || []).map((capability) => `<span class="pill">${escapeHtml(capability)}</span>`).join("")}
      </div>

      <div class="button-row">
        <button class="button danger" type="button" id="deleteEntityButton">Instanz loeschen</button>
      </div>
    </div>
    `;
  }

  function renderLibrarySection(state) {
    const selectedItem = getSelectedLibraryItem(state);
    const groups = groupBy(state.libraryItems, (item) => item.category);

    return `
    <div class="section-body">
      <div class="library-groups">
        ${Object.entries(groups).map(([category, items]) => `
          <section class="library-group">
            <h4>${escapeHtml(category)}</h4>
            ${items.map((item) => `
              <button
                class="library-item ${item.id === state.selectedLibraryItemId ? "active" : ""}"
                type="button"
                data-select-library-item="${item.id}"
              >
                <span class="library-swatch" style="background:${item.color}"></span>
                <span class="library-copy">
                  <span class="library-title">
                    <strong>${escapeHtml(item.label)}</strong>
                    <span class="library-kind">${escapeHtml(item.kind)}</span>
                  </span>
                  <span class="library-description">${escapeHtml(item.description)}</span>
                </span>
              </button>
            `).join("")}
          </section>
        `).join("")}
      </div>

      ${selectedItem ? `
        <div class="divider"></div>
        <div class="field">
          <span>Ausgewaehltes Item</span>
          <code>${escapeHtml(selectedItem.label)}</code>
        </div>
        <div class="pill-row">
          ${selectedItem.capabilities.map((capability) => `<span class="pill">${escapeHtml(capability)}</span>`).join("")}
        </div>
        <div class="button-row">
          <button class="button" type="button" id="placeLibraryItemInSceneButton">Item jetzt auf Canvas platzieren</button>
        </div>
      ` : ""}
    </div>
    `;
  }

  function renderProjectSection(state) {
    return `
    <div class="section-body">
      <div class="field">
        <span>Projektname</span>
        <input type="text" value="${escapeHtml(state.meta.projectName)}" id="projectNameInput" />
      </div>

      <div class="stats-list">
        <div class="stat-line">
          <span>Ebenen</span>
          <strong>${state.layers.length}</strong>
        </div>
        <div class="stat-line">
          <span>Instanzen</span>
          <strong>${state.entities.length}</strong>
        </div>
        <div class="stat-line">
          <span>Library-Items</span>
          <strong>${state.libraryItems.length}</strong>
        </div>
        <div class="stat-line">
          <span>Zoom</span>
          <strong>${state.camera.zoom.toFixed(2)}</strong>
        </div>
      </div>

      <div class="field-grid">
        <label class="field">
          <span>Spawn X</span>
          <input type="number" value="${state.spawn.x}" data-spawn-field="x" />
        </label>
        <label class="field">
          <span>Spawn Y</span>
          <input type="number" value="${state.spawn.y}" data-spawn-field="y" />
        </label>
      </div>

      <div class="button-row">
        <button class="button" type="button" id="saveProjectPanelButton">Projekt speichern</button>
        <button class="button secondary" type="button" id="loadProjectPanelButton">Projekt laden</button>
      </div>
    </div>
    `;
  }

  function renderPlanningSection() {
    return `
    <div class="section-body">
      <div class="section-text">
        Dieser Restart trennt Model, Views, Controller und Persistenz. Die naechsten Schritte sind echte Asset-Previews,
        Trigger-Verhalten, Animationen, Engine-Adapter und ein robusteres Save-Format.
      </div>
    </div>
    `;
  }

  function renderInspectorPanel(root, state, actions) {
    const open = state.ui.openSections;

    root.innerHTML = `
    <div class="inspector-stack">
      <details class="inspector-section" data-section="selection" ${open.selection ? "open" : ""}>
        <summary>Auswahl</summary>
        ${renderSelectionSection(state)}
      </details>

      <details class="inspector-section" data-section="library" ${open.library ? "open" : ""}>
        <summary>Library</summary>
        ${renderLibrarySection(state)}
      </details>

      <details class="inspector-section" data-section="project" ${open.project ? "open" : ""}>
        <summary>Projekt</summary>
        ${renderProjectSection(state)}
      </details>

      <details class="inspector-section" data-section="planning" ${open.planning ? "open" : ""}>
        <summary>Planung</summary>
        ${renderPlanningSection()}
      </details>
    </div>
    `;

    root.querySelectorAll("details[data-section]").forEach((detailsNode) => {
      detailsNode.addEventListener("toggle", () => {
        actions.onToggleSection(detailsNode.dataset.section, detailsNode.open);
      });
    });

    root.querySelectorAll("[data-select-library-item]").forEach((node) => {
      node.addEventListener("click", () => actions.onSelectLibraryItem(node.dataset.selectLibraryItem));
    });

    root.querySelectorAll("[data-entity-field]").forEach((node) => {
      node.addEventListener("change", () => {
        actions.onUpdateSelectedEntity(node.dataset.entityField, node.value);
      });
    });

    root.querySelectorAll("[data-spawn-field]").forEach((node) => {
      node.addEventListener("change", () => {
        actions.onUpdateSpawn(node.dataset.spawnField, node.value);
      });
    });

    root.querySelector("#deleteEntityButton")?.addEventListener("click", actions.onDeleteSelectedEntity);
    root.querySelector("#placeLibraryItemInSceneButton")?.addEventListener("click", actions.onPlaceSelectedLibraryItem);
    root.querySelector("#projectNameInput")?.addEventListener("change", (event) => actions.onUpdateProjectName(event.target.value));
    root.querySelector("#saveProjectPanelButton")?.addEventListener("click", actions.onSaveProject);
    root.querySelector("#loadProjectPanelButton")?.addEventListener("click", actions.onLoadProject);
  }

  window.LucidEditor.views = window.LucidEditor.views || {};
  window.LucidEditor.views.renderInspectorPanel = renderInspectorPanel;
})();
