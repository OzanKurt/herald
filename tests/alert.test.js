import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Herald from '../src/index.js';
import { alertBox, key, reset, text } from './helpers.js';

describe('alert', () => {
    beforeEach(reset);
    afterEach(() => vi.useRealTimers());

    const buttons = () => [...alertBox().querySelectorAll('.hd-alert__buttons button')].map((b) => b.textContent);

    it('renders a modal alert with buttons from the legacy [No][Yes] syntax', () => {
        Herald.alert({ title: 'Smart Alert!', content: 'Sure?', buttons: '[No][Yes]' });

        expect(alertBox().getAttribute('role')).toBe('alertdialog');
        expect(alertBox().getAttribute('aria-modal')).toBe('true');
        expect(text(alertBox(), '.hd-alert__title')).toBe('Smart Alert!');
        expect(buttons()).toEqual(['No', 'Yes']);
        expect(alertBox().querySelector('.hd-button--primary').textContent).toBe('Yes');
    });

    it('accepts buttons as an array', () => {
        Herald.alert({ title: 'A', buttons: ['Cancel', 'Delete'] });

        expect(buttons()).toEqual(['Cancel', 'Delete']);
    });

    it('resolves with the pressed button and calls the legacy callback', async () => {
        const callback = vi.fn();
        const result = Herald.alert({ title: 'A', buttons: '[No][Yes]' }, callback);

        alertBox().querySelectorAll('.hd-alert__buttons button')[1].click();

        await expect(result).resolves.toEqual({ button: 'Yes', value: null });
        expect(callback).toHaveBeenCalledWith('Yes', null);
        expect(document.querySelector('.hd-alert-backdrop')).toBeNull();
    });

    it('submits the input with Enter as the main button', async () => {
        const result = Herald.alert({ title: 'Name', buttons: '[Cancel][Accept]', input: 'text', placeholder: 'User name' });
        const field = alertBox().querySelector('input');

        expect(document.activeElement).toBe(field);
        expect(field.placeholder).toBe('User name');

        field.value = 'ozan';
        key('Enter', field);

        await expect(result).resolves.toEqual({ button: 'Accept', value: 'ozan' });
    });

    it('offers a select with options', async () => {
        const result = Herald.alert({ title: 'Pick', buttons: '[Done]', input: 'select', options: '[Red][Green]' });
        const select = alertBox().querySelector('select');

        expect([...select.options].map((o) => o.value)).toEqual(['Red', 'Green']);
        select.value = 'Green';
        alertBox().querySelector('.hd-button--primary').click();

        await expect(result).resolves.toEqual({ button: 'Done', value: 'Green' });
    });

    it('resolves with a null button on Escape and restores focus', async () => {
        const opener = document.createElement('button');
        document.body.append(opener);
        opener.focus();

        const result = Herald.alert({ title: 'A', buttons: '[OK]' });
        expect(document.activeElement).toBe(alertBox().querySelector('.hd-button--primary'));

        key('Escape');

        await expect(result).resolves.toEqual({ button: null, value: null });
        expect(document.activeElement).toBe(opener);
    });

    it('keeps Tab inside the alert', () => {
        Herald.alert({ title: 'A', buttons: '[No][Yes]' });
        const [no, yes] = alertBox().querySelectorAll('.hd-alert__buttons button');

        yes.focus();
        const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
        yes.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(no);
    });

    it('treats content as text unless html is given', () => {
        Herald.alert({ title: 'A', content: '<b>x</b>' });

        expect(alertBox().querySelector('.hd-alert__content b')).toBeNull();
    });
});
