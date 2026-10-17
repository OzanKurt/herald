import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { reset, settle, text, toasts, panel, alertBox } from './helpers.js';

describe('jQuery drop-in', () => {
    beforeEach(async () => {
        reset();
        window.jQuery = function jQuery() {};
        window.$ = window.jQuery;
        vi.resetModules();
        await import('../src/jquery.js');
    });

    afterEach(() => {
        delete window.jQuery;
        delete window.$;
        vi.useRealTimers();
    });

    it('adds $.smallBox with legacy HTML content and icon classes', () => {
        window.$.smallBox({ title: 'Ding Dong!', content: "<i>Someone's</i> here", color: '#296191', iconSmall: 'fa fa-bell', timeout: 4000, sound: true });

        const [toast] = toasts();
        expect(text(toast, '.hd-toast__title')).toBe('Ding Dong!');
        expect(toast.querySelector('.hd-toast__content i').textContent).toBe("Someone's");
        expect(toast.querySelector('.hd-toast__mini i').className).toBe('fa fa-bell');
    });

    it('adds $.bigBox whose callback runs on close', () => {
        const callback = vi.fn();
        window.$.bigBox({ title: 'Big', content: 'Box', color: '#739E73', icon: 'fa fa-check', number: '4' }, callback);

        expect(text(panel(), '.hd-panel__number')).toBe('4');
        panel().querySelector('.hd-panel__close').click();
        settle();

        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('adds $.SmartMessageBox with the (button, value) callback', async () => {
        const callback = vi.fn();
        window.$.SmartMessageBox({ title: 'Input', content: 'Name?', buttons: '[Accept]', input: 'text', inputValue: 'ozan' }, callback);

        expect(alertBox().querySelector('input').value).toBe('ozan');
        alertBox().querySelector('.hd-button--primary').click();
        await Promise.resolve();

        expect(callback).toHaveBeenCalledWith('Accept', 'ozan');
    });

    it('exposes window.Herald', () => {
        expect(typeof window.Herald.toast).toBe('function');
    });
});

describe('jQuery drop-in, legacy behaviour', () => {
    beforeEach(async () => {
        reset();
        window.jQuery = function jQuery() {};
        window.$ = window.jQuery;
        vi.resetModules();
        await import('../src/jquery.js');
    });

    afterEach(() => {
        delete window.jQuery;
        delete window.$;
        vi.useRealTimers();
    });

    it('ignores Escape like SmartAdmin did, so callbacks only ever see button labels', () => {
        const callback = vi.fn();
        window.$.SmartMessageBox({ title: 'Delete?', buttons: '[No][Yes]' }, callback);

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

        expect(alertBox()).not.toBeNull();
        expect(callback).not.toHaveBeenCalled();
    });

    it('renders legacy titles as HTML', () => {
        window.$.SmartMessageBox({ title: "<i class='fa fa-sign-out'></i> Logout <span>Ozan</span>?" });
        window.$.bigBox({ title: '<b>Big</b>' });

        expect(alertBox().querySelector('.hd-alert__title i').className).toBe('fa fa-sign-out');
        expect(panel().querySelector('.hd-panel__title b').textContent).toBe('Big');
    });
});
