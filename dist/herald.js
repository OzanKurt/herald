(() => {
  // src/shared.js
  var THEMES = ["default", "polished"];
  var SCHEMES = ["auto", "light", "dark"];
  var DEFAULTS = { theme: "default", scheme: "auto" };
  var settings = { ...DEFAULTS };
  var roots = /* @__PURE__ */ new Set();
  var getSettings = () => ({ ...settings });
  var configure = (options = {}) => {
    if (options.theme !== void 0 && !THEMES.includes(options.theme)) {
      throw new TypeError(`Unknown Herald theme "${options.theme}". Use one of: ${THEMES.join(", ")}.`);
    }
    if (options.scheme !== void 0 && !SCHEMES.includes(options.scheme)) {
      throw new TypeError(`Unknown Herald scheme "${options.scheme}". Use one of: ${SCHEMES.join(", ")}.`);
    }
    settings = { ...settings, ...pick(options, ["theme", "scheme"]) };
    roots.forEach(applySettings);
  };
  var pick = (object, keys) => Object.fromEntries(keys.filter((k) => object[k] !== void 0).map((k) => [k, object[k]]));
  var applySettings = (root) => {
    root.dataset.heraldTheme = settings.theme;
    root.dataset.heraldScheme = settings.scheme;
  };
  var registerRoot = (root) => {
    root.classList.add("hd-root");
    roots.add(root);
    applySettings(root);
    return root;
  };
  var unregisterRoot = (root) => {
    roots.delete(root);
    root.remove();
  };
  var resetShared = () => {
    roots.forEach((root) => root.remove());
    roots.clear();
    settings = { ...DEFAULTS };
  };
  var el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== void 0 && text !== null) node.textContent = String(text);
    return node;
  };
  var fill = (node, { content, html }) => {
    if (html !== void 0 && html !== null) {
      node.innerHTML = String(html);
    } else if (content !== void 0 && content !== null) {
      node.textContent = String(content);
    }
    return node;
  };
  var region = (className, build) => {
    const existing = [...roots].find((root2) => root2.classList.contains(className) && root2.isConnected);
    if (existing) {
      return existing;
    }
    const root = registerRoot(el("div", className));
    build?.(root);
    document.body.append(root);
    return root;
  };
  var leave = (node, done) => {
    let finished = false;
    const finish = () => {
      if (finished) {
        return;
      }
      finished = true;
      node.remove();
      done?.();
    };
    node.classList.add("hd-leaving");
    node.addEventListener("animationend", finish, { once: true });
    setTimeout(finish, 300);
  };
  var svg = (paths) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;
  var ICONS = {
    bell: svg('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>'),
    warning: svg('<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
    shield: svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
    check: svg('<path d="M20 6 9 17l-5-5"/>'),
    cross: svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
    info: svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'),
    thumbs: svg('<path d="M7 10v12"/><path d="M15 5.9 14 10h5.8a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.4 22H7V10l4-8a3 3 0 0 1 4 3.9z"/>'),
    cloud: svg('<path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9z"/>'),
    clock: svg('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>')
  };
  var icon = (name, className) => {
    if (!name) {
      return null;
    }
    const wrap = el("span", className);
    if (ICONS[name]) {
      wrap.innerHTML = ICONS[name];
    } else {
      const glyph = el("i", String(name));
      glyph.setAttribute("aria-hidden", "true");
      wrap.append(glyph);
    }
    return wrap;
  };
  var TYPES = {
    success: { color: "#739e73", icon: "check" },
    error: { color: "#c46a69", icon: "cross" },
    warning: { color: "#c79121", icon: "warning" },
    info: { color: "#3276b1", icon: "info" }
  };
  var DEFAULT_COLOR = "#3276b1";
  var look = (options) => {
    const type = TYPES[options.type];
    return {
      color: options.color ?? type?.color ?? DEFAULT_COLOR,
      icon: options.icon === void 0 ? type?.icon : options.icon
    };
  };
  var closeButton = (label, onClick, className) => {
    const button = el("button", `hd-close ${className}`);
    button.type = "button";
    button.setAttribute("aria-label", label);
    button.innerHTML = ICONS.cross;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      onClick();
    });
    return button;
  };

  // src/toast.js
  var toast = (options = {}) => {
    const { color, icon: iconName } = look(options);
    const node = el("div", "hd-toast");
    node.setAttribute("role", "status");
    node.style.setProperty("--hd-accent", color);
    if (options.type) {
      node.dataset.type = options.type;
    }
    let closed = false;
    let timer = null;
    let remaining = options.timeout ?? null;
    let startedAt = 0;
    const close = () => {
      if (closed) {
        return;
      }
      closed = true;
      clearTimeout(timer);
      leave(node, () => options.onClose?.());
    };
    const iconNode = icon(iconName, "hd-toast__icon");
    if (iconNode) {
      node.append(iconNode);
    } else {
      node.classList.add("hd-toast--plain");
    }
    const body = el("div", "hd-toast__body");
    body.append(el("div", "hd-toast__title", options.title ?? ""));
    if (options.content != null || options.html != null) {
      body.append(fill(el("div", "hd-toast__content"), options));
    }
    if (options.actions?.length) {
      const row = el("div", "hd-toast__actions");
      options.actions.forEach(({ label, variant, onClick }) => {
        const button = el("button", `hd-button${variant ? ` hd-button--${variant}` : ""}`, label);
        button.type = "button";
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          onClick?.();
          close();
        });
        row.append(button);
      });
      body.append(row);
    }
    node.append(body, closeButton("Dismiss", close, "hd-toast__close"));
    const mini = icon(options.iconSmall, "hd-toast__mini");
    if (mini) {
      node.append(mini);
    }
    if (options.closeOnClick !== false) {
      node.addEventListener("click", close);
    }
    if (remaining !== null) {
      const bar = el("div", "hd-toast__progress");
      node.style.setProperty("--hd-timeout", `${remaining}ms`);
      node.append(bar);
      const start = () => {
        startedAt = Date.now();
        timer = setTimeout(close, remaining);
      };
      node.addEventListener("mouseenter", () => {
        clearTimeout(timer);
        remaining -= Date.now() - startedAt;
        node.dataset.paused = "true";
      });
      node.addEventListener("mouseleave", () => {
        delete node.dataset.paused;
        if (!closed) {
          start();
        }
      });
      start();
    }
    region("hd-toasts").prepend(node);
    return { element: node, close };
  };

  // src/panel.js
  var state = { current: null, parked: [] };
  var panelsRegion = () => region("hd-panels", (root) => root.append(el("div", "hd-tiles")));
  var render = (entry) => {
    const node = el("div", "hd-panel");
    node.setAttribute("role", "status");
    node.style.setProperty("--hd-accent", entry.color);
    node.append(
      closeButton("Close", () => closeEntry(entry), "hd-panel__close"),
      el("div", "hd-panel__title", entry.options.title ?? "")
    );
    if (entry.options.content != null || entry.options.html != null) {
      node.append(fill(el("div", "hd-panel__content"), entry.options));
    }
    const footer = el("div", "hd-panel__footer");
    const iconNode = icon(entry.icon, "hd-panel__icon");
    if (iconNode) {
      footer.append(iconNode);
    }
    if (entry.options.number != null) {
      footer.append(el("div", "hd-panel__number", entry.options.number));
    }
    node.append(footer);
    entry.node = node;
    panelsRegion().append(node);
    clearTimeout(entry.timer);
    if (entry.options.timeout) {
      entry.timer = setTimeout(() => state.current === entry && closeEntry(entry), entry.options.timeout);
    }
  };
  var renderTiles = () => {
    const tiles = panelsRegion().querySelector(".hd-tiles");
    tiles.replaceChildren(...state.parked.map((entry) => {
      const tile = el("button", "hd-tile", entry.options.number ?? "!");
      tile.type = "button";
      tile.style.setProperty("--hd-accent", entry.color);
      tile.setAttribute("aria-label", `Show ${entry.options.title ?? "notification"}`);
      tile.addEventListener("click", () => show(entry));
      return tile;
    }));
  };
  var park = (entry) => {
    clearTimeout(entry.timer);
    entry.node?.remove();
    entry.node = null;
    state.parked = [...state.parked.filter((other) => other !== entry), entry];
  };
  var show = (entry) => {
    if (state.current && state.current !== entry) {
      park(state.current);
    }
    state.parked = state.parked.filter((other) => other !== entry);
    state.current = entry;
    render(entry);
    renderTiles();
  };
  var closeEntry = (entry) => {
    if (entry.closed) {
      return;
    }
    entry.closed = true;
    clearTimeout(entry.timer);
    if (state.current !== entry) {
      state.parked = state.parked.filter((other) => other !== entry);
      renderTiles();
      entry.options.onClose?.();
      return;
    }
    state.current = null;
    leave(entry.node, () => entry.options.onClose?.());
    const next = state.parked.pop();
    if (next) {
      state.current = next;
      render(next);
    }
    renderTiles();
  };
  var panel = (options = {}) => {
    const { color, icon: iconName } = look(options);
    const entry = { options, color, icon: iconName, node: null, timer: null, closed: false };
    show(entry);
    return { element: () => entry.node, close: () => closeEntry(entry) };
  };
  var resetPanels = () => {
    [state.current, ...state.parked].forEach((entry) => entry && clearTimeout(entry.timer));
    state.current = null;
    state.parked = [];
  };

  // src/alert.js
  var count = 0;
  var list = (value, fallback) => {
    if (Array.isArray(value)) {
      return value.map(String);
    }
    const parsed = [...String(value ?? "").matchAll(/\[([^\]]*)\]/g)].map((match) => match[1]);
    return parsed.length ? parsed : fallback;
  };
  var FOCUSABLE = 'button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
  var alert = (options = {}, callback) => new Promise((resolve) => {
    const id = `hd-alert-${++count}`;
    const labels = list(options.buttons, ["OK"]);
    const previousFocus = document.activeElement;
    const backdrop = registerRoot(el("div", "hd-alert-backdrop"));
    const box = el("div", "hd-alert");
    box.setAttribute("role", "alertdialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-labelledby", `${id}-title`);
    const inner = el("div", "hd-alert__inner");
    const title = el("div", "hd-alert__title", options.title ?? "");
    title.id = `${id}-title`;
    inner.append(title);
    if (options.content != null || options.html != null) {
      const content = fill(el("div", "hd-alert__content"), options);
      content.id = `${id}-content`;
      box.setAttribute("aria-describedby", content.id);
      inner.append(content);
    }
    let field = null;
    if (options.input === "select") {
      field = el("select", "hd-alert__field");
      list(options.options, []).forEach((choice) => field.append(Object.assign(el("option", "", choice), { value: choice })));
    } else if (options.input) {
      field = el("input", "hd-alert__field");
      field.type = options.input === "password" ? "password" : "text";
      field.placeholder = options.placeholder ?? "";
      field.value = options.inputValue ?? "";
    }
    if (field) {
      field.id = `${id}-field`;
      field.setAttribute("aria-labelledby", `${id}-title`);
      inner.append(field);
    }
    let done = false;
    const finish = (button) => {
      if (done) {
        return;
      }
      done = true;
      document.removeEventListener("keydown", onKeydown, true);
      const value = field ? field.value : null;
      unregisterRoot(backdrop);
      previousFocus?.focus?.();
      callback?.(button, value);
      resolve({ button, value });
    };
    const row = el("div", "hd-alert__buttons");
    labels.forEach((label, index) => {
      const main = index === labels.length - 1;
      const button = el("button", `hd-button${main ? " hd-button--primary" : ""}`, label);
      button.type = "button";
      button.addEventListener("click", () => finish(label));
      row.append(button);
    });
    inner.append(row);
    const onKeydown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finish(null);
      } else if (event.key === "Enter" && event.target === field && field.tagName === "INPUT") {
        event.preventDefault();
        finish(labels[labels.length - 1]);
      } else if (event.key === "Tab") {
        const focusable = [...box.querySelectorAll(FOCUSABLE)];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeydown, true);
    box.append(inner);
    backdrop.append(box);
    document.body.append(backdrop);
    (field ?? row.querySelector(".hd-button--primary")).focus();
  });

  // src/index.js
  var Herald = {
    toast,
    panel,
    alert,
    /** @param {{ theme?: 'default'|'polished', scheme?: 'auto'|'light'|'dark' }} options */
    configure,
    settings: getSettings,
    /** Remove everything Herald has put on the page and restore the default settings. */
    reset: () => {
      resetPanels();
      resetShared();
    }
  };
  var index_default = Herald;

  // src/browser.js
  window.Herald = index_default;
})();
//# sourceMappingURL=herald.js.map
