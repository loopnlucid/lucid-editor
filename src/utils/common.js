(() => {
  "use strict";

  window.LucidEditor = window.LucidEditor || {};
  window.LucidEditor.utils = {
    clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    },

    escapeHtml(value = "") {
      return String(value).replace(/[&<>"]/g, (char) => {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
        }[char];
      });
    },

    deepClone(value) {
      return JSON.parse(JSON.stringify(value));
    },

    groupBy(items, getKey) {
      return items.reduce((groups, item) => {
        const key = getKey(item);
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
        return groups;
      }, {});
    },
  };
})();
