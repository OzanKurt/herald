/**
 * Smart alerts (SmartAdmin's $.SmartMessageBox): a modal over a dimmed page.
 * The default theme draws SmartAdmin's full-width band; the polished theme a
 * centred card.
 */

import { el, fill, registerRoot, unregisterRoot } from './shared.js';

let count = 0;

/** "[No][Yes]" or ['No', 'Yes'] -> ['No', 'Yes'] */
const list = (value, fallback) => {
    if (Array.isArray(value)) {
        return value.map(String);
    }

    const parsed = [...String(value ?? '').matchAll(/\[([^\]]*)\]/g)].map((match) => match[1]);

    return parsed.length ? parsed : fallback;
};

const FOCUSABLE = 'button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * @param {object} options
 * @param {string} options.title
 * @param {string} [options.content]      Plain text
 * @param {string} [options.html]         Trusted HTML instead of content
 * @param {string|string[]} [options.buttons='[OK]']  The last one is the main action
 * @param {'text'|'password'|'select'} [options.input]
 * @param {string} [options.inputValue]
 * @param {string} [options.placeholder]
 * @param {string|string[]} [options.options]  Choices for input: 'select'
 * @param {(button: string|null, value: string|null) => void} [callback]  Legacy style
 * @returns {Promise<{ button: string|null, value: string|null }>}  button is null when dismissed with Escape
 */
export const alert = (options = {}, callback) => new Promise((resolve) => {
    const id = `hd-alert-${++count}`;
    const labels = list(options.buttons, ['OK']);
    const previousFocus = document.activeElement;

    const backdrop = registerRoot(el('div', 'hd-alert-backdrop'));
    const box = el('div', 'hd-alert');
    box.setAttribute('role', 'alertdialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-labelledby', `${id}-title`);

    const inner = el('div', 'hd-alert__inner');
    const title = el('div', 'hd-alert__title', options.title ?? '');
    title.id = `${id}-title`;
    inner.append(title);

    if (options.content != null || options.html != null) {
        const content = fill(el('div', 'hd-alert__content'), options);
        content.id = `${id}-content`;
        box.setAttribute('aria-describedby', content.id);
        inner.append(content);
    }

    let field = null;
    if (options.input === 'select') {
        field = el('select', 'hd-alert__field');
        list(options.options, []).forEach((choice) => field.append(Object.assign(el('option', '', choice), { value: choice })));
    } else if (options.input) {
        field = el('input', 'hd-alert__field');
        field.type = options.input === 'password' ? 'password' : 'text';
        field.placeholder = options.placeholder ?? '';
        field.value = options.inputValue ?? '';
    }
    if (field) {
        field.id = `${id}-field`;
        field.setAttribute('aria-labelledby', `${id}-title`);
        inner.append(field);
    }

    let done = false;
    const finish = (button) => {
        if (done) {
            return;
        }
        done = true;
        document.removeEventListener('keydown', onKeydown, true);

        const value = field ? field.value : null;
        unregisterRoot(backdrop);
        previousFocus?.focus?.();
        callback?.(button, value);
        resolve({ button, value });
    };

    const row = el('div', 'hd-alert__buttons');
    labels.forEach((label, index) => {
        const main = index === labels.length - 1;
        const button = el('button', `hd-button${main ? ' hd-button--primary' : ''}`, label);
        button.type = 'button';
        button.addEventListener('click', () => finish(label));
        row.append(button);
    });
    inner.append(row);

    const onKeydown = (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            finish(null);
        } else if (event.key === 'Enter' && event.target === field && field.tagName === 'INPUT') {
            event.preventDefault();
            finish(labels[labels.length - 1]);
        } else if (event.key === 'Tab') {
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
    document.addEventListener('keydown', onKeydown, true);

    box.append(inner);
    backdrop.append(box);
    document.body.append(backdrop);

    (field ?? row.querySelector('.hd-button--primary')).focus();
});
