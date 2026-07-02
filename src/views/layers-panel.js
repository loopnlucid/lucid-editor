(() => {
  "use strict";

  const { escapeHtml, renderIcon } = window.LucidEditor.utils;
  const { getActiveLevel } = window.LucidEditor.model;

  function countEntitiesByLayer(level, layerId) {
    return level.entities.filter((entity) => entity.layerId === layerId).length;
  }

  function bindSectionToggle(root, actions) {
    root.querySelectorAll("details[data-section]").forEach((detailsNode) => {
      detailsNode.addEventListener("toggle", () => {
        actions.onToggleSection?.(detailsNode.dataset.section, detailsNode.open);
      });
    });
  }

  // Aktions-Buttons liegen in der Section-Summary: Klicks duerfen die
  // Section nicht auf-/zuklappen, daher Default und Bubbling stoppen.
  function bindLayerActions(root, actions) {
    const bind = (selector, handler) => {
      root.querySelector(selector)?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        handler();
      });
    };

    bind("#addLayerButton", actions.onAddLayer);
    bind("#deleteLayerButton", actions.onDeleteLayer);
  }

  function renderLayersPanel(root, state, actions) {
    const level = getActiveLevel(state);
    const isOpen = state.editorState.openSections.layers !== false;

    const summary = `
      <summary>
        ${renderIcon("chevron", "section-chevron")}
        <span class="section-title">Ebenen</span>
        <span class="section-actions">
          <button class="icon-button" type="button" id="addLayerButton" title="Neue Ebene am Ende der Liste anlegen">
            ${renderIcon("plus")}
          </button>
          <button class="icon-button is-danger" type="button" id="deleteLayerButton" title="Aktive Ebene nach Bestaetigung entfernen">
            ${renderIcon("trash")}
          </button>
        </span>
      </summary>
    `;

    if (!level) {
      root.innerHTML = `
        <div class="sidebar-stack">
          <details class="section" data-section="layers" ${isOpen ? "open" : ""}>
            ${summary}
            <div class="section-body">
              <div class="empty-state">Kein aktives Level vorhanden.</div>
            </div>
          </details>
        </div>
      `;
      bindSectionToggle(root, actions);
      bindLayerActions(root, actions);
      return;
    }

    root.innerHTML = `
      <div class="sidebar-stack">
        <details class="section" data-section="layers" ${isOpen ? "open" : ""}>
          ${summary}
          <div class="section-body">
            <div class="layer-list">
              ${level.layers
            .slice()
            .sort((left, right) => left.order - right.order)
            .map((layer) => {
              const isActive = layer.id === state.editorState.activeLayerId;
              const entityCount = countEntitiesByLayer(level, layer.id);
              const classes = [
                "layer-card",
                isActive ? "is-active" : "",
                layer.visible ? "" : "is-hidden",
              ].filter(Boolean).join(" ");

              return `
                <article class="${classes}" data-select-layer="${layer.id}">
                  <div class="layer-row">
                    <div class="layer-name">${escapeHtml(layer.name)}</div>
                    <div class="layer-actions">
                      <button
                        class="icon-button"
                        type="button"
                        data-toggle-layer-visibility="${layer.id}"
                        title="${layer.visible ? "Layer ausblenden" : "Layer einblenden"}"
                      >
                        ${renderIcon(layer.visible ? "eye" : "eye-off")}
                      </button>
                      <button
                        class="icon-button"
                        type="button"
                        data-toggle-layer-lock="${layer.id}"
                        title="${layer.locked ? "Layer entsperren" : "Layer sperren"}"
                      >
                        ${renderIcon(layer.locked ? "lock" : "unlock")}
                      </button>
                    </div>
                  </div>

                  <div class="layer-meta">
                    <span>${escapeHtml(`Order ${layer.order}`)}</span>
                    <span>${escapeHtml(`${entityCount} Elemente`)}</span>
                    <span>${escapeHtml(layer.visible ? "sichtbar" : "hidden")}</span>
                    <span>${escapeHtml(layer.locked ? "locked" : "frei")}</span>
                  </div>

                  <div class="layer-controls">
                    <label class="field">
                      <span>Parallax</span>
                      <input type="number" min="0" step="0.05" name="layer-parallax-${layer.id}" value="${layer.parallax}" data-layer-parallax="${layer.id}" />
                    </label>
                    <label class="field">
                      <span>Order</span>
                      <input type="number" step="1" name="layer-order-${layer.id}" value="${layer.order}" data-layer-order="${layer.id}" />
                    </label>
                  </div>
                </article>
              `;
            }).join("")}
            </div>
          </div>
        </details>
      </div>
    `;

    bindSectionToggle(root, actions);
    bindLayerActions(root, actions);

    root.querySelectorAll("[data-select-layer]").forEach((node) => {
      node.addEventListener("click", (event) => {
        if (event.target.closest("button, input, select")) return;
        actions.onSelectLayer(node.dataset.selectLayer);
      });
    });

    root.querySelectorAll("[data-toggle-layer-visibility]").forEach((node) => {
      node.addEventListener("click", () => actions.onToggleLayerVisibility(node.dataset.toggleLayerVisibility));
    });

    root.querySelectorAll("[data-toggle-layer-lock]").forEach((node) => {
      node.addEventListener("click", () => actions.onToggleLayerLock(node.dataset.toggleLayerLock));
    });

    root.querySelectorAll("[data-layer-parallax]").forEach((node) => {
      node.addEventListener("change", () => {
        actions.onUpdateLayer(node.dataset.layerParallax, { parallax: Number(node.value) });
      });
    });

    root.querySelectorAll("[data-layer-order]").forEach((node) => {
      node.addEventListener("change", () => {
        actions.onUpdateLayer(node.dataset.layerOrder, { order: Number(node.value) });
      });
    });
  }

  window.LucidEditor.views = window.LucidEditor.views || {};
  window.LucidEditor.views.renderLayersPanel = renderLayersPanel;
})();
