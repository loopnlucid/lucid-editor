(() => {
  "use strict";

  const { escapeHtml } = window.LucidEditor.utils;

  function countEntitiesByLayer(state, layerId) {
    return state.entities.filter((entity) => entity.layerId === layerId).length;
  }

  function renderLayersPanel(root, state, actions) {
    root.innerHTML = `
    <div class="stack">
      <ul class="layers">
        ${state.layers.map((layer) => {
          const isActive = layer.id === state.activeLayerId;
          const entityCount = countEntitiesByLayer(state, layer.id);

          return `
            <li class="layer ${isActive ? "active" : ""}" data-select-layer="${layer.id}">
              <div class="lrow">
                <div class="lname">${escapeHtml(layer.name)}</div>
                <button class="iconbtn" type="button" data-toggle-visibility="${layer.id}" title="Sichtbarkeit">
                  ${layer.visible ? "V" : "H"}
                </button>
                <button class="iconbtn" type="button" data-toggle-lock="${layer.id}" title="Sperre">
                  ${layer.locked ? "L" : "U"}
                </button>
              </div>
              <div class="lmeta">${escapeHtml(layer.type)} · Parallax ${layer.parallax} · ${entityCount} Instanzen</div>
              <div class="lcontrols">
                <select data-layer-type="${layer.id}">
                  <option value="background" ${layer.type === "background" ? "selected" : ""}>background</option>
                  <option value="midground" ${layer.type === "midground" ? "selected" : ""}>midground</option>
                  <option value="play" ${layer.type === "play" ? "selected" : ""}>play</option>
                  <option value="foreground" ${layer.type === "foreground" ? "selected" : ""}>foreground</option>
                </select>
                <input type="number" min="0" step="0.05" value="${layer.parallax}" data-layer-parallax="${layer.id}" />
              </div>
            </li>
          `;
        }).join("")}
      </ul>

      <button class="toolbar-btn add-row-btn" type="button" id="addLayerButton">+ Ebene hinzufuegen</button>
    </div>
    `;

    root.querySelectorAll("[data-select-layer]").forEach((node) => {
      node.addEventListener("click", (event) => {
        if (event.target.closest("button, select, input")) return;
        actions.onSelectLayer(node.dataset.selectLayer);
      });
    });

    root.querySelectorAll("[data-toggle-visibility]").forEach((node) => {
      node.addEventListener("click", () => actions.onToggleLayerVisibility(node.dataset.toggleVisibility));
    });

    root.querySelectorAll("[data-toggle-lock]").forEach((node) => {
      node.addEventListener("click", () => actions.onToggleLayerLock(node.dataset.toggleLock));
    });

    root.querySelectorAll("[data-layer-type]").forEach((node) => {
      node.addEventListener("change", () => {
        actions.onUpdateLayer(node.dataset.layerType, { type: node.value });
      });
    });

    root.querySelectorAll("[data-layer-parallax]").forEach((node) => {
      node.addEventListener("change", () => {
        actions.onUpdateLayer(node.dataset.layerParallax, { parallax: Number(node.value) || 0 });
      });
    });

    root.querySelector("#addLayerButton")?.addEventListener("click", actions.onAddLayer);
  }

  window.LucidEditor.views = window.LucidEditor.views || {};
  window.LucidEditor.views.renderLayersPanel = renderLayersPanel;
})();
