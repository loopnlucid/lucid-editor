(() => {
  "use strict";

  const {
    TOOL_DEFINITIONS,
    WORKSPACE_DEFINITIONS,
  } = window.LucidEditor.config;
  const { renderIcon, escapeHtml } = window.LucidEditor.utils;
  const { getActiveLayer, getActiveLevel } = window.LucidEditor.model;

  const TOOL_HINTS = {
    select: "Klick waehlt aus, Shift-Klick erweitert oder reduziert die Auswahl.",
    move: "Direkt auf der Canvas ziehen, um die aktuelle Auswahl frei zu verschieben.",
    pan: "Ansicht bewegen. Space oder Mausrad-Mittelklick funktionieren zusaetzlich temporaer.",
    zoom: "Mit Drag nach links hinein und nach rechts hinaus zoomen. Ctrl+0 setzt auf 100%.",
    rectangle: "Ein Rechteck ziehen und danach rechts den technischen Typ verfeinern.",
    polygon: "Punkte setzen, mit Doppelklick oder Enter abschliessen, mit Esc abbrechen.",
    playtest: "Playtest ist vorbereitet, folgt aber erst nach dem Kernwerkzeug-Block.",
  };

  function getToolDefinition(toolId) {
    return TOOL_DEFINITIONS.find((tool) => tool.id === toolId) || TOOL_DEFINITIONS[0];
  }

  function getWorkspaceDefinition(workspaceId) {
    return WORKSPACE_DEFINITIONS.find((workspace) => workspace.id === workspaceId) || WORKSPACE_DEFINITIONS[1];
  }

  function createTooltipText({ label, description, shortcut }) {
    return `${label}: ${description}${shortcut ? ` (${shortcut})` : ""}`;
  }

  function renderWorkspaceNavigation(root, state, actions) {
    const activeWorkspace = getWorkspaceDefinition(state.editorState.activeWorkspace);
    const collapseIcon = state.editorState.navCollapsed ? "expand" : "collapse";

    root.innerHTML = `
      <div class="nav-brand">
        <div class="nav-brand-mark">${renderIcon("level")}</div>
        <div class="nav-brand-copy">
          <strong>Lucid Editor</strong>
          <span>${escapeHtml(activeWorkspace.label)}</span>
        </div>
      </div>

      <div class="nav-stack">
        ${WORKSPACE_DEFINITIONS.map((workspace) => {
          const isActive = workspace.id === state.editorState.activeWorkspace;
          const classes = [
            "nav-button",
            isActive ? "is-active" : "",
            workspace.available ? "" : "is-ghost",
          ].filter(Boolean).join(" ");

          return `
            <button
              class="${classes}"
              type="button"
              data-workspace-button="${workspace.id}"
              title="${escapeHtml(createTooltipText({ label: workspace.label, description: workspace.description, shortcut: "" }))}"
            >
              ${renderIcon(workspace.icon)}
              <span class="nav-button-label">
                <strong>${escapeHtml(workspace.label)}</strong>
                <span>${escapeHtml(workspace.available ? "Aktivierbar" : "Platzhalter")}</span>
              </span>
            </button>
          `;
        }).join("")}
      </div>

      <div class="nav-actions">
        <button
          class="nav-button"
          type="button"
          id="toggleNavButton"
          title="${state.editorState.navCollapsed ? "Navigation ausklappen" : "Navigation einklappen"}"
        >
          ${renderIcon(collapseIcon)}
          <span class="nav-button-label">
            <strong>Navigation</strong>
            <span>${state.editorState.navCollapsed ? "Ausklappen" : "Einklappen"}</span>
          </span>
        </button>
      </div>
    `;

    root.querySelectorAll("[data-workspace-button]").forEach((button) => {
      button.addEventListener("click", () => actions.onSelectWorkspace(button.dataset.workspaceButton));
    });

    root.querySelector("#toggleNavButton")?.addEventListener("click", actions.onToggleNav);
  }

  function renderToolbar(root, state, actions) {
    const activeLevel = getActiveLevel(state);
    const activeLayer = getActiveLayer(state);

    root.innerHTML = `
      <div class="top-toolbar-main">
        <div class="toolbar-group">
          ${TOOL_DEFINITIONS.map((tool) => {
            const isActive = tool.id === state.editorState.activeTool;
            const isDisabled = tool.available === false;
            const classes = ["tool-button", isActive ? "is-active" : ""].filter(Boolean).join(" ");

            return `
              <button
                class="${classes}"
                type="button"
                data-tool-button="${tool.id}"
                ${isDisabled ? "disabled" : ""}
                title="${escapeHtml(createTooltipText(tool))}"
              >
                ${renderIcon(tool.icon)}
              </button>
            `;
          }).join("")}
        </div>

        <div class="toolbar-group">
          <button class="icon-button" type="button" data-history-action="undo" ${actions.canUndo ? "" : "disabled"} title="Undo: Letzten inhaltlichen Schritt rueckgaengig machen (Ctrl+Z)">
            ${renderIcon("undo")}
          </button>
          <button class="icon-button" type="button" data-history-action="redo" ${actions.canRedo ? "" : "disabled"} title="Redo: Letzten rueckgaengigen Schritt wiederherstellen (Ctrl+Y)">
            ${renderIcon("redo")}
          </button>
          <div class="toolbar-divider"></div>
          <button class="icon-button" type="button" data-file-action="save" title="Projekt speichern: Browser-Download des aktuellen Arbeitsstands">
            ${renderIcon("save")}
          </button>
          <button class="icon-button" type="button" data-file-action="load" title="Projekt laden: JSON-Datei auswaehlen und in den Editor einlesen">
            ${renderIcon("import")}
          </button>
        </div>
      </div>

      <div class="top-toolbar-meta">
        <div class="toolbar-chip">
          ${renderIcon("project", "small")}
          <div>
            <strong>${escapeHtml(state.meta.projectName)}</strong>
            <span>${escapeHtml(activeLevel?.name || "Kein aktives Level")}</span>
          </div>
        </div>
        <div class="toolbar-chip">
          ${renderIcon("layer", "small")}
          <div>
            <strong>${escapeHtml(activeLayer?.name || "Keine Ebene")}</strong>
            <span>${escapeHtml(activeLayer ? `Parallax ${activeLayer.parallax}` : "Layer fehlt")}</span>
          </div>
        </div>
      </div>
    `;

    root.querySelectorAll("[data-tool-button]").forEach((button) => {
      button.addEventListener("click", () => actions.onSelectTool(button.dataset.toolButton));
      button.addEventListener("dblclick", () => {
        if (button.dataset.toolButton === "zoom") actions.onResetZoom();
      });
    });

    root.querySelector("[data-history-action='undo']")?.addEventListener("click", actions.onUndo);
    root.querySelector("[data-history-action='redo']")?.addEventListener("click", actions.onRedo);
    root.querySelector("[data-file-action='save']")?.addEventListener("click", actions.onSaveProject);
    root.querySelector("[data-file-action='load']")?.addEventListener("click", actions.onLoadProject);
  }

  function renderStatusBar(root, state) {
    const activeLevel = getActiveLevel(state);
    root.innerHTML = `
      <div class="status-main">
        <span class="status-message">${escapeHtml(state.editorState.statusMessage)}</span>
      </div>
      <div class="status-meta">
        <span class="status-level">${escapeHtml(activeLevel?.name || "Kein Level")}</span>
        <span class="status-zoom">Zoom ${Math.round((state.editorState.camera.zoom || 1) * 100)}%</span>
      </div>
    `;
  }

  function renderCanvasChrome(titleRoot, hintRoot, state) {
    const activeLevel = getActiveLevel(state);
    const activeTool = getToolDefinition(state.editorState.activeTool);

    titleRoot.innerHTML = `
      <strong>${escapeHtml(activeLevel?.name || "Kein aktives Level")}</strong>
      <span>${escapeHtml(activeLevel ? `${activeLevel.entities.length} Elemente | Bounds ${activeLevel.bounds.width} x ${activeLevel.bounds.height}` : "Kein aktiver Inhalt")}</span>
    `;

    hintRoot.textContent = TOOL_HINTS[activeTool.id] || activeTool.description;
  }

  window.LucidEditor.views = window.LucidEditor.views || {};
  window.LucidEditor.views.renderCanvasChrome = renderCanvasChrome;
  window.LucidEditor.views.renderStatusBar = renderStatusBar;
  window.LucidEditor.views.renderToolbar = renderToolbar;
  window.LucidEditor.views.renderWorkspaceNavigation = renderWorkspaceNavigation;
})();
