/**
 * Small boxes: a stack in the top-right corner (SmartAdmin's $.smallBox).
 */

import { closeButton, el, fill, fillTitle, icon, leave, look, onReset, region } from './shared.js';

/**
 * @param {object} options
 * @param {string} options.title
 * @param {string} [options.titleHtml]   Trusted HTML instead of title
 * @param {string} [options.content]     Plain text
 * @param {string} [options.html]        Trusted HTML instead of content
 * @param {'success'|'error'|'warning'|'info'} [options.type]
 * @param {string} [options.color]       Any CSS colour; wins over type
 * @param {string} [options.icon]        Built-in icon name or icon font classes, shown large on the left
 * @param {string} [options.iconSmall]   Small icon in the bottom-right corner
 * @param {number} [options.timeout]     Milliseconds; without it (or 0) the toast stays until closed
 * @param {Array<{label: string, variant?: 'danger', onClick?: Function}>} [options.actions]
 * @param {boolean} [options.closeOnClick=true]
 * @param {Function} [options.onClose]
 * @returns {{ element: HTMLElement, close: () => void }}
 */
export const toast = (options = {}) => {
    const { color, icon: iconName } = look(options);
    const node = el('div', 'hd-toast');
    node.style.setProperty('--hd-accent', color);
    if (options.type) {
        node.dataset.type = options.type;
    }

    let closed = false;
    let timer = null;
    let remaining = options.timeout > 0 ? options.timeout : null;
    let startedAt = 0;

    // reset() stops the countdown without calling onClose.
    const forget = onReset(() => {
        closed = true;
        clearTimeout(timer);
    });

    const close = () => {
        if (closed) {
            return;
        }
        closed = true;
        clearTimeout(timer);
        forget();
        leave(node, () => options.onClose?.());
    };

    const iconNode = icon(iconName, 'hd-toast__icon');
    if (iconNode) {
        node.append(iconNode);
    } else {
        node.classList.add('hd-toast--plain');
    }

    const body = el('div', 'hd-toast__body');
    body.append(fillTitle(el('div', 'hd-toast__title'), options));
    if (options.content != null || options.html != null) {
        body.append(fill(el('div', 'hd-toast__content'), options));
    }

    if (options.actions?.length) {
        const row = el('div', 'hd-toast__actions');
        options.actions.forEach(({ label, variant, onClick }) => {
            const button = el('button', `hd-button${variant ? ` hd-button--${variant}` : ''}`, label);
            button.type = 'button';
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                onClick?.();
                close();
            });
            row.append(button);
        });
        body.append(row);
    }

    node.append(body, closeButton('Dismiss', close, 'hd-toast__close'));

    const mini = icon(options.iconSmall, 'hd-toast__mini');
    if (mini) {
        node.append(mini);
    }

    if (options.closeOnClick !== false) {
        node.addEventListener('click', close);
    } else {
        node.classList.add('hd-toast--sticky');
    }

    if (remaining !== null) {
        const bar = el('div', 'hd-toast__progress');
        node.style.setProperty('--hd-timeout', `${remaining}ms`);
        node.append(bar);

        const start = () => {
            clearTimeout(timer);
            startedAt = Date.now();
            timer = setTimeout(close, remaining);
        };

        // Hover or keyboard focus holds the toast so it can be read or used;
        // the countdown resumes from where it was once both have left.
        const holds = new Set();
        const hold = (reason) => {
            if (holds.size === 0) {
                clearTimeout(timer);
                remaining -= Date.now() - startedAt;
                node.dataset.paused = 'true';
            }
            holds.add(reason);
        };
        const release = (reason) => {
            if (!holds.delete(reason) || holds.size > 0) {
                return;
            }
            delete node.dataset.paused;
            if (!closed) {
                start();
            }
        };

        node.addEventListener('mouseenter', () => hold('hover'));
        node.addEventListener('mouseleave', () => release('hover'));
        node.addEventListener('focusin', () => hold('focus'));
        node.addEventListener('focusout', (event) => !node.contains(event.relatedTarget) && release('focus'));

        start();
    }

    region('hd-toasts').prepend(node);

    return { element: node, close };
};
