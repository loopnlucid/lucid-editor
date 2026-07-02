(() => {
  "use strict";

  // Lucide-Icons (https://lucide.dev, ISC). Pfade sind unveraendert aus
  // dem Icon-Set uebernommen; bitte keine eigenen Icons zeichnen.
  const ICON_PATHS = {
    eye: [
      '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />',
      '<circle cx="12" cy="12" r="3" />',
    ],
    project: [
      '<rect width="7" height="7" x="3" y="3" rx="1" />',
      '<rect width="7" height="7" x="14" y="3" rx="1" />',
      '<rect width="7" height="7" x="14" y="14" rx="1" />',
      '<rect width="7" height="7" x="3" y="14" rx="1" />',
    ],
    polygon: [
      '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />',
    ],
    level: [
      '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />',
      '<path d="M15 5.764v15" />',
      '<path d="M9 3.236v15" />',
    ],
    settings: [
      '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />',
      '<circle cx="12" cy="12" r="3" />',
    ],
    sprite: [
      '<circle cx="12" cy="5" r="1" />',
      '<path d="m9 20 3-6 3 6" />',
      '<path d="m6 8 6 2 6-2" />',
      '<path d="M12 10v4" />',
    ],
    "eye-off": [
      '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />',
      '<path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />',
      '<path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />',
      '<path d="m2 2 20 20" />',
    ],
    open: [
      '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />',
    ],
    "folder-open": [
      '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />',
    ],
    "box-select": [
      '<path d="M5 3a2 2 0 0 0-2 2" />',
      '<path d="M19 3a2 2 0 0 1 2 2" />',
      '<path d="M21 19a2 2 0 0 1-2 2" />',
      '<path d="M5 21a2 2 0 0 1-2-2" />',
      '<path d="M9 3h1" />',
      '<path d="M9 21h1" />',
      '<path d="M14 3h1" />',
      '<path d="M14 21h1" />',
      '<path d="M3 9v1" />',
      '<path d="M21 9v1" />',
      '<path d="M3 14v1" />',
      '<path d="M21 14v1" />',
    ],
    import: [
      '<path d="M12 3v12" />',
      '<path d="m8 11 4 4 4-4" />',
      '<path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4" />',
    ],
    pan: [
      '<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />',
      '<path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />',
      '<path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />',
      '<path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />',
    ],
    info: [
      '<circle cx="12" cy="12" r="10" />',
      '<path d="M12 16v-4" />',
      '<path d="M12 8h.01" />',
    ],
    plus: [
      '<path d="M5 12h14" />',
      '<path d="M12 5v14" />',
    ],
    move: [
      '<path d="M12 2v20" />',
      '<path d="m15 19-3 3-3-3" />',
      '<path d="m19 9 3 3-3 3" />',
      '<path d="M2 12h20" />',
      '<path d="m5 9-3 3 3 3" />',
      '<path d="m9 5 3-3 3 3" />',
    ],
    select: [
      '<path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />',
    ],
    unlock: [
      '<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />',
      '<path d="M7 11V7a5 5 0 0 1 9.9-1" />',
    ],
    check: [
      '<path d="M20 6 9 17l-5-5" />',
    ],
    play: [
      '<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />',
    ],
    zoom: [
      '<circle cx="11" cy="11" r="8" />',
      '<line x1="21" x2="16.65" y1="21" y2="16.65" />',
      '<line x1="11" x2="11" y1="8" y2="14" />',
      '<line x1="8" x2="14" y1="11" y2="11" />',
    ],
    expand: [
      '<rect width="18" height="18" x="3" y="3" rx="2" />',
      '<path d="M9 3v18" />',
      '<path d="m14 9 3 3-3 3" />',
    ],
    collapse: [
      '<rect width="18" height="18" x="3" y="3" rx="2" />',
      '<path d="M9 3v18" />',
      '<path d="m16 15-3-3 3-3" />',
    ],
    library: [
      '<path d="m16 6 4 14" />',
      '<path d="M12 6v14" />',
      '<path d="M8 8v12" />',
      '<path d="M4 4v16" />',
    ],
    trash: [
      '<path d="M10 11v6" />',
      '<path d="M14 11v6" />',
      '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />',
      '<path d="M3 6h18" />',
      '<path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />',
    ],
    wand: [
      '<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />',
      '<path d="m14 7 3 3" />',
      '<path d="M5 6v4" />',
      '<path d="M19 14v4" />',
      '<path d="M10 2v2" />',
      '<path d="M7 8H3" />',
      '<path d="M21 16h-4" />',
      '<path d="M11 3H9" />',
    ],
    save: [
      '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />',
      '<path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />',
      '<path d="M7 3v4a1 1 0 0 0 1 1h7" />',
    ],
    chevron: [
      '<path d="m9 18 6-6-6-6" />',
    ],
    layer: [
      '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />',
      '<path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />',
      '<path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />',
    ],
    undo: [
      '<path d="M9 14 4 9l5-5" />',
      '<path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />',
    ],
    lock: [
      '<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />',
      '<path d="M7 11V7a5 5 0 0 1 10 0v4" />',
    ],
    rectangle: [
      '<rect width="18" height="18" x="3" y="3" rx="2" />',
    ],
    redo: [
      '<path d="m15 14 5-5-5-5" />',
      '<path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13" />',
    ],
  };

  function isFiniteNumber(value) {
    return Number.isFinite(value);
  }

  function toNumberOrFallback(value, fallback) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : fallback;
  }

  function getBoundsFromPoints(points) {
    if (!Array.isArray(points) || !points.length) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  function toRelativePoints(points) {
    const bounds = getBoundsFromPoints(points);

    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      points: points.map((point) => ({
        x: point.x - bounds.x,
        y: point.y - bounds.y,
      })),
    };
  }

  function toAbsolutePoints(entityX, entityY, points) {
    return (points || []).map((point) => ({
      x: entityX + point.x,
      y: entityY + point.y,
    }));
  }

  function pointInPolygon(point, polygonPoints) {
    let inside = false;

    for (let index = 0, previous = polygonPoints.length - 1; index < polygonPoints.length; previous = index, index += 1) {
      const currentPoint = polygonPoints[index];
      const previousPoint = polygonPoints[previous];
      const intersects = (
        (currentPoint.y > point.y) !== (previousPoint.y > point.y) &&
        point.x < ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) / ((previousPoint.y - currentPoint.y) || 1e-9) + currentPoint.x
      );

      if (intersects) inside = !inside;
    }

    return inside;
  }

  function isTextInputElement(target) {
    if (!target) return false;

    const tagName = String(target.tagName || "").toLowerCase();
    return tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable;
  }

  function renderIcon(name, className = "") {
    const fragments = ICON_PATHS[name] || ICON_PATHS.info;
    const classAttribute = className ? ` ${className}` : "";
    return `<svg class="icon${classAttribute}" viewBox="0 0 24 24" aria-hidden="true">${fragments.join("")}</svg>`;
  }

  window.LucidEditor = window.LucidEditor || {};
  window.LucidEditor.utils = {
    clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    },

    deepClone(value) {
      return JSON.parse(JSON.stringify(value));
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

    groupBy(items, getKey) {
      return items.reduce((groups, item) => {
        const key = getKey(item);
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
        return groups;
      }, {});
    },

    getBoundsFromPoints,
    isFiniteNumber,
    isTextInputElement,
    pointInPolygon,
    renderIcon,
    toAbsolutePoints,
    toNumberOrFallback,
    toRelativePoints,
  };
})();
