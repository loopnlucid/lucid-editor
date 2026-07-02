(() => {
  "use strict";

  const { escapeHtml } = window.LucidEditor.utils;

  let activeBackdrop = null;

  function closeActive() {
    if (activeBackdrop) {
      activeBackdrop.remove();
      activeBackdrop = null;
    }
  }

  // Wiederverwendbares grafisches Bestaetigungs-Modal. Ersetzt window.confirm.
  // Liefert ein Promise<boolean> (true = bestaetigt).
  function confirm({
    title = "Bestaetigen",
    message = "",
    confirmLabel = "OK",
    cancelLabel = "Abbrechen",
    danger = false,
  } = {}) {
    return new Promise((resolve) => {
      closeActive();

      const backdrop = document.createElement("div");
      backdrop.className = "modal-backdrop";
      backdrop.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
          <div class="modal-head">${escapeHtml(title)}</div>
          <div class="modal-body">${escapeHtml(message)}</div>
          <div class="modal-actions">
            <button class="action-button secondary" type="button" data-modal-cancel>${escapeHtml(cancelLabel)}</button>
            <button class="action-button ${danger ? "danger" : ""}" type="button" data-modal-confirm>${escapeHtml(confirmLabel)}</button>
          </div>
        </div>
      `;
      document.body.appendChild(backdrop);
      activeBackdrop = backdrop;

      const finish = (result) => {
        document.removeEventListener("keydown", onKey, true);
        if (activeBackdrop === backdrop) activeBackdrop = null;
        backdrop.remove();
        resolve(result);
      };

      const onKey = (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          finish(false);
        } else if (event.key === "Enter") {
          event.preventDefault();
          event.stopPropagation();
          finish(true);
        }
      };

      backdrop.querySelector("[data-modal-confirm]").addEventListener("click", () => finish(true));
      backdrop.querySelector("[data-modal-cancel]").addEventListener("click", () => finish(false));
      backdrop.addEventListener("mousedown", (event) => {
        if (event.target === backdrop) finish(false);
      });
      document.addEventListener("keydown", onKey, true);
      backdrop.querySelector("[data-modal-confirm]").focus();
    });
  }

  // Wiederverwendbares Formular-Modal. Felder: { name, label, type
  // ("text"|"number"|"select"), value, step, options:[{value,label}], full }.
  // Liefert ein Promise mit dem Werte-Objekt (Number bei type "number") oder
  // null bei Abbruch.
  function prompt({ title = "Eingabe", fields = [], confirmLabel = "OK", cancelLabel = "Abbrechen" } = {}) {
    return new Promise((resolve) => {
      closeActive();

      const fieldHtml = fields.map((field) => {
        const cls = `field${field.full ? " full" : ""}`;
        if (field.type === "select") {
          const options = (field.options || []).map((opt) =>
            `<option value="${escapeHtml(String(opt.value))}" ${String(opt.value) === String(field.value) ? "selected" : ""}>${escapeHtml(opt.label)}</option>`).join("");
          return `<label class="${cls}"><span>${escapeHtml(field.label)}</span><select data-field="${escapeHtml(field.name)}">${options}</select></label>`;
        }
        const type = field.type === "number" ? "number" : "text";
        const step = field.step != null ? ` step="${escapeHtml(String(field.step))}"` : "";
        return `<label class="${cls}"><span>${escapeHtml(field.label)}</span><input type="${type}"${step} value="${escapeHtml(String(field.value ?? ""))}" data-field="${escapeHtml(field.name)}" /></label>`;
      }).join("");

      const backdrop = document.createElement("div");
      backdrop.className = "modal-backdrop";
      backdrop.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
          <div class="modal-head">${escapeHtml(title)}</div>
          <div class="modal-body"><div class="field-grid">${fieldHtml}</div></div>
          <div class="modal-actions">
            <button class="action-button secondary" type="button" data-modal-cancel>${escapeHtml(cancelLabel)}</button>
            <button class="action-button" type="button" data-modal-confirm>${escapeHtml(confirmLabel)}</button>
          </div>
        </div>
      `;
      document.body.appendChild(backdrop);
      activeBackdrop = backdrop;

      const finish = (result) => {
        document.removeEventListener("keydown", onKey, true);
        if (activeBackdrop === backdrop) activeBackdrop = null;
        backdrop.remove();
        resolve(result);
      };

      const collect = () => {
        const values = {};
        fields.forEach((field) => {
          const node = backdrop.querySelector(`[data-field="${field.name}"]`);
          if (!node) return;
          values[field.name] = field.type === "number" ? Number(node.value) : node.value;
        });
        return values;
      };

      const onKey = (event) => {
        if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); finish(null); }
        else if (event.key === "Enter") { event.preventDefault(); event.stopPropagation(); finish(collect()); }
      };

      backdrop.querySelector("[data-modal-confirm]").addEventListener("click", () => finish(collect()));
      backdrop.querySelector("[data-modal-cancel]").addEventListener("click", () => finish(null));
      backdrop.addEventListener("mousedown", (event) => { if (event.target === backdrop) finish(null); });
      document.addEventListener("keydown", onKey, true);
      backdrop.querySelector("[data-field]")?.focus();
    });
  }

  window.LucidEditor.ui = window.LucidEditor.ui || {};
  window.LucidEditor.ui.confirm = confirm;
  window.LucidEditor.ui.prompt = prompt;
  window.LucidEditor.ui.closeModal = closeActive;
})();
