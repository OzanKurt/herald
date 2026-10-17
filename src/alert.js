/**
 * Smart alerts (SmartAdmin's $.SmartMessageBox): a modal over a dimmed page.
 * The default theme draws SmartAdmin's full-width band; the polished theme a
 * centred card.
 */

import { el, fill, fillTitle, icon, look, onReset, registerRoot, unregisterRoot } from './shared.js';

let count = 0;

// Open alerts, newest last. Only the top one answers the keyboard.
const stack = [];

/** "[No][Yes]" or ['No', 'Yes'] -> ['No', 'Yes'], trimmed; the fallback when nothing is left. */
const list = (value, fallback) => {
    const parsed = Array.isArray(value)
        ? value.map(String)
        : [...String(value ?? '').matchAll(/\[([^\]]*)\]/g)].map((match) => match[1]);
    const labels = parsed.map((label) => label.trim()).filter((label) => label !== '');

    return labels.length ? labels : fallback;
};

const FOCUSABLE = 'a[href], button, input, select, textarea, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

/**
 * @param {object} options
 * @param {string} options.title
 * @param {string} [options.titleHtml]    Trusted HTML instead of title
 * @param {'success'|'error'|'warning'|'info'} [options.type]  Colour and icon
 * @param {string} [options.color]        Any CSS colour; wins over type
 * @param {string} [options.icon]         Built-in icon name or icon font classes; wins over type
 * @param {string} [options.content]      Plain text
 * @param {string} [options.html]         Trusted HTML instead of content
 * @param {string|string[]} [options.buttons='[OK]']  The last one is the main action
 * @param {'text'|'password'|'select'} [options.input]
 * @param {string} [options.inputValue]
 * @param {string} [options.placeholder]
 * @param {string|string[]} [options.options]  Choices for input: 'select'
 * @param {boolean} [options.dismissible=true]  Escape closes the alert with button null
 * @param {(button: string|null, value: string|null) => void} [callback]  Legacy style
 * @returns {Promise<{ button: string|null, value: string|null }>}  button is null when dismissed
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

    let typeIcon = null;
    // Typed alerts carry an accent colour and an icon; untyped ones look as before.
    if (options.type || options.color || options.icon) {
        const { color, icon: iconName } = look(options);
        box.style.setProperty('--hd-accent', color);
        if (options.type) {
            box.dataset.type = options.type;
        }
        box.classList.add('hd-alert--typed');
        typeIcon = icon(iconName, 'hd-alert__icon');
    }

    const inner = el('div', 'hd-alert__inner');
    if (typeIcon) {
        inner.append(typeIcon);
    }
    const title = fillTitle(el('div', 'hd-alert__title'), options);
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

    const self = {};
    let done = false;
    const finish = (button, { silent = false } = {}) => {
        if (done) {
            return;
        }
        done = true;
        document.removeEventListener('keydown', onKeydown, true);
        stack.splice(stack.indexOf(self), 1);
        forget();

        const value = field ? field.value : null;
        unregisterRoot(backdrop);
        previousFocus?.focus?.();
        resolve({ button, value });

        if (silent || !callback) {
            return;
        }

        // The promise is already settled, so a throwing callback cannot leave it pending.
        try {
            callback(button, value);
        } catch (error) {
            console.error(error);
        }
    };

    // reset() closes the alert without calling its callback.
    const forget = onReset(() => finish(null, { silent: true }));

    const row = el('div', 'hd-alert__buttons');
    labels.forEach((label, index) => {
        const main = index === labels.length - 1;
        const button = el('button', `hd-button${main ? ' hd-button--primary' : ''}`, label);
        button.type = 'button';
        button.addEventListener('click', () => finish(label));
        row.append(button);
    });
    inner.append(row);

    const trapTab = (event) => {
        const focusable = [...box.querySelectorAll(FOCUSABLE)];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        if (!box.contains(active)) {
            event.preventDefault();
            (event.shiftKey ? last : first).focus();
        } else if (event.shiftKey && active === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first.focus();
        }
    };

    const onKeydown = (event) => {
        if (stack[stack.length - 1] !== self) {
            return;
        }

        if (event.key === 'Escape' && options.dismissible !== false) {
            event.preventDefault();
            finish(null);
        } else if (event.key === 'Enter' && event.target === field && field.tagName === 'INPUT') {
            event.preventDefault();
            finish(labels[labels.length - 1]);
        } else if (event.key === 'Tab') {
            trapTab(event);
        }
    };
    document.addEventListener('keydown', onKeydown, true);
    stack.push(self);

    box.append(inner);
    backdrop.append(box);
    document.body.append(backdrop);

    (field ?? row.querySelector('.hd-button--primary')).focus();
});
