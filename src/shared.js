/**
 * Settings, DOM helpers, icons and types shared by toasts, panels and alerts.
 */

export const THEMES = ['default', 'polished'];
export const SCHEMES = ['auto', 'light', 'dark'];

const DEFAULTS = { theme: 'default', scheme: 'auto' };

let settings = { ...DEFAULTS };

// Every element Herald places on the page carries .hd-root and the current
// theme and scheme, so a configure() call can restyle the ones already shown.
const roots = new Set();

export const getSettings = () => ({ ...settings });

export const configure = (options = {}) => {
    if (options.theme !== undefined && !THEMES.includes(options.theme)) {
        throw new TypeError(`Unknown Herald theme "${options.theme}". Use one of: ${THEMES.join(', ')}.`);
    }

    if (options.scheme !== undefined && !SCHEMES.includes(options.scheme)) {
        throw new TypeError(`Unknown Herald scheme "${options.scheme}". Use one of: ${SCHEMES.join(', ')}.`);
    }

    settings = { ...settings, ...pick(options, ['theme', 'scheme']) };
    roots.forEach(applySettings);
};

const pick = (object, keys) => Object.fromEntries(keys.filter((k) => object[k] !== undefined).map((k) => [k, object[k]]));

const applySettings = (root) => {
    root.dataset.heraldTheme = settings.theme;
    root.dataset.heraldScheme = settings.scheme;
};

export const registerRoot = (root) => {
    root.classList.add('hd-root');
    roots.add(root);
    applySettings(root);

    return root;
};

export const unregisterRoot = (root) => {
    roots.delete(root);
    root.remove();
};

export const resetShared = () => {
    roots.forEach((root) => root.remove());
    roots.clear();
    settings = { ...DEFAULTS };
};

export const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);

    return node;
};

/**
 * Fill an element with plain text, or with trusted HTML when `html` is given.
 * `html` is for markup you wrote yourself (the jQuery drop-in passes legacy
 * content through it); never pass user input as `html`.
 */
export const fill = (node, { content, html }) => {
    if (html !== undefined && html !== null) {
        node.innerHTML = String(html);
    } else if (content !== undefined && content !== null) {
        node.textContent = String(content);
    }

    return node;
};

/** A fixed region element in <body>, created on first use. */
export const region = (className, build) => {
    const existing = [...roots].find((root) => root.classList.contains(className) && root.isConnected);
    if (existing) {
        return existing;
    }

    const root = registerRoot(el('div', className));
    build?.(root);
    document.body.append(root);

    return root;
};

/** Remove a node after its exit animation, with a timer in case animations are off. */
export const leave = (node, done) => {
    let finished = false;
    const finish = () => {
        if (finished) {
            return;
        }
        finished = true;
        node.remove();
        done?.();
    };

    node.classList.add('hd-leaving');
    node.addEventListener('animationend', finish, { once: true });
    setTimeout(finish, 300);
};

const svg = (paths) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;

export const ICONS = {
    bell: svg('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>'),
    warning: svg('<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
    shield: svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
    check: svg('<path d="M20 6 9 17l-5-5"/>'),
    cross: svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
    info: svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'),
    thumbs: svg('<path d="M7 10v12"/><path d="M15 5.9 14 10h5.8a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.4 22H7V10l4-8a3 3 0 0 1 4 3.9z"/>'),
    cloud: svg('<path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9z"/>'),
    clock: svg('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'),
};

/**
 * A built-in icon by name, or any other string as a class list for an icon
 * font (Font Awesome classes from legacy SmartAdmin code keep working).
 */
export const icon = (name, className) => {
    if (!name) {
        return null;
    }

    const wrap = el('span', className);
    if (ICONS[name]) {
        wrap.innerHTML = ICONS[name];
    } else {
        const glyph = el('i', String(name));
        glyph.setAttribute('aria-hidden', 'true');
        wrap.append(glyph);
    }

    return wrap;
};

// SmartAdmin's own colours.
export const TYPES = {
    success: { color: '#739e73', icon: 'check' },
    error: { color: '#c46a69', icon: 'cross' },
    warning: { color: '#c79121', icon: 'warning' },
    info: { color: '#3276b1', icon: 'info' },
};

export const DEFAULT_COLOR = '#3276b1';

/** Colour and icon from an explicit option, then the type, then the default. */
export const look = (options) => {
    const type = TYPES[options.type];

    return {
        color: options.color ?? type?.color ?? DEFAULT_COLOR,
        icon: options.icon === undefined ? type?.icon : options.icon,
    };
};

export const closeButton = (label, onClick, className) => {
    const button = el('button', `hd-close ${className}`);
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.innerHTML = ICONS.cross;
    button.addEventListener('click', (event) => {
        event.stopPropagation();
        onClick();
    });

    return button;
};
