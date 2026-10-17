/**
 * Big boxes (SmartAdmin's $.bigBox): one panel at a time in the bottom-right.
 * Opening a new panel parks the visible one as a numbered tile above it;
 * clicking a tile brings that panel back.
 */

import { closeButton, el, fill, icon, leave, look, region } from './shared.js';

const state = { current: null, parked: [] };

const panelsRegion = () => region('hd-panels', (root) => root.append(el('div', 'hd-tiles')));

const render = (entry) => {
    const node = el('div', 'hd-panel');
    node.setAttribute('role', 'status');
    node.style.setProperty('--hd-accent', entry.color);

    node.append(
        closeButton('Close', () => closeEntry(entry), 'hd-panel__close'),
        el('div', 'hd-panel__title', entry.options.title ?? ''),
    );

    if (entry.options.content != null || entry.options.html != null) {
        node.append(fill(el('div', 'hd-panel__content'), entry.options));
    }

    const footer = el('div', 'hd-panel__footer');
    const iconNode = icon(entry.icon, 'hd-panel__icon');
    if (iconNode) {
        footer.append(iconNode);
    }
    if (entry.options.number != null) {
        footer.append(el('div', 'hd-panel__number', entry.options.number));
    }
    node.append(footer);

    entry.node = node;
    panelsRegion().append(node);

    clearTimeout(entry.timer);
    if (entry.options.timeout) {
        entry.timer = setTimeout(() => state.current === entry && closeEntry(entry), entry.options.timeout);
    }
};

const renderTiles = () => {
    const tiles = panelsRegion().querySelector('.hd-tiles');
    tiles.replaceChildren(...state.parked.map((entry) => {
        const tile = el('button', 'hd-tile', entry.options.number ?? '!');
        tile.type = 'button';
        tile.style.setProperty('--hd-accent', entry.color);
        tile.setAttribute('aria-label', `Show ${entry.options.title ?? 'notification'}`);
        tile.addEventListener('click', () => show(entry));

        return tile;
    }));
};

const park = (entry) => {
    clearTimeout(entry.timer);
    entry.node?.remove();
    entry.node = null;
    state.parked = [...state.parked.filter((other) => other !== entry), entry];
};

const show = (entry) => {
    if (state.current && state.current !== entry) {
        park(state.current);
    }

    state.parked = state.parked.filter((other) => other !== entry);
    state.current = entry;
    render(entry);
    renderTiles();
};

const closeEntry = (entry) => {
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

/**
 * @param {object} options
 * @param {string} options.title
 * @param {string} [options.content]   Plain text
 * @param {string} [options.html]      Trusted HTML instead of content
 * @param {'success'|'error'|'warning'|'info'} [options.type]
 * @param {string} [options.color]
 * @param {string} [options.icon]      Built-in icon name or icon font classes
 * @param {string|number} [options.number]  Shown in the corner and on the parked tile
 * @param {number} [options.timeout]   Milliseconds while visible; restarts when brought back
 * @param {Function} [options.onClose]
 * @returns {{ element: () => HTMLElement|null, close: () => void }}
 */
export const panel = (options = {}) => {
    const { color, icon: iconName } = look(options);
    const entry = { options, color, icon: iconName, node: null, timer: null, closed: false };

    show(entry);

    return { element: () => entry.node, close: () => closeEntry(entry) };
};

export const resetPanels = () => {
    [state.current, ...state.parked].forEach((entry) => entry && clearTimeout(entry.timer));
    state.current = null;
    state.parked = [];
};
