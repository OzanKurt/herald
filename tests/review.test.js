import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Herald from '../src/index.js';
import { key, panel, reset, settle, text, toasts } from './helpers.js';

const alerts = () => [...document.querySelectorAll('.hd-alert')];

describe('review fixes', () => {
    beforeEach(reset);
    afterEach(() => vi.useRealTimers());

    it('Escape closes only the topmost alert', async () => {
        const first = vi.fn();
        const second = vi.fn();
        Herald.alert({ title: 'First' }, first);
        Herald.alert({ title: 'Second' }, second);

        key('Escape');

        expect(alerts().map((a) => text(a, '.hd-alert__title'))).toEqual(['First']);
        expect(second).toHaveBeenCalledWith(null, null);
        expect(first).not.toHaveBeenCalled();
    });

    it('a non-dismissible alert ignores Escape', () => {
        const callback = vi.fn();
        Herald.alert({ title: 'A', dismissible: false }, callback);

        key('Escape');

        expect(alerts()).toHaveLength(1);
        expect(callback).not.toHaveBeenCalled();
    });

    it('renders a trusted HTML title when titleHtml is given', () => {
        Herald.toast({ titleHtml: '<i class="fa fa-sign-out"></i> Logout' });

        expect(toasts()[0].querySelector('.hd-toast__title i').className).toBe('fa fa-sign-out');
    });

    it('brings focus back into the alert when it escaped to the page', () => {
        Herald.alert({ title: 'A', buttons: '[No][Yes]' });
        document.body.focus();
        document.activeElement.blur();

        const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
        document.body.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
        expect(document.activeElement.textContent).toBe('No');
    });

    it('includes links in the focus trap', () => {
        Herald.alert({ title: 'A', html: '<a href="/terms">Terms</a>', buttons: '[OK]' });
        const link = alerts()[0].querySelector('a');
        const ok = alerts()[0].querySelector('.hd-button--primary');

        ok.focus();
        const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
        ok.dispatchEvent(event);

        expect(document.activeElement).toBe(link);
    });

    it('reset dismisses open alerts without calling their callbacks and stops toast timers', async () => {
        const callback = vi.fn();
        const onClose = vi.fn();
        const result = Herald.alert({ title: 'A' }, callback);
        Herald.toast({ title: 'T', timeout: 1000, onClose });

        Herald.reset();
        key('Escape');
        vi.advanceTimersByTime(5000);

        await expect(result).resolves.toEqual({ button: null, value: null });
        expect(callback).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('announces through persistent live regions', () => {
        Herald.toast({ title: 'A' });
        Herald.panel({ title: 'B' });

        const toastRegion = document.querySelector('.hd-toasts');
        const panelRegion = document.querySelector('.hd-panels');
        expect(toastRegion.getAttribute('aria-live')).toBe('polite');
        expect(toastRegion.getAttribute('role')).toBe('status');
        expect(panelRegion.getAttribute('aria-live')).toBe('polite');
        expect(toasts()[0].hasAttribute('role')).toBe(false);
    });

    it('pauses the countdown while focus is inside the toast', () => {
        Herald.toast({ title: 'A', timeout: 4000, actions: [{ label: 'Yes' }] });
        const [toast] = toasts();

        vi.advanceTimersByTime(3000);
        toast.querySelector('.hd-button').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        vi.advanceTimersByTime(10000);
        expect(toasts()).toHaveLength(1);

        toast.querySelector('.hd-button').dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
        vi.advanceTimersByTime(1000);
        settle();
        expect(toasts()).toHaveLength(0);
    });

    it('marks toasts that only close from their button', () => {
        Herald.toast({ title: 'A', closeOnClick: false });

        expect(toasts()[0].classList.contains('hd-toast--sticky')).toBe(true);
    });

    it('falls back to an OK button for an empty button list', () => {
        Herald.alert({ title: 'A', buttons: [] });

        expect(alerts()[0].querySelector('.hd-button--primary').textContent).toBe('OK');
    });

    it('resolves even when the legacy callback throws', async () => {
        const result = Herald.alert({ title: 'A' }, () => {
            throw new Error('boom');
        });

        alerts()[0].querySelector('.hd-button--primary').click();

        await expect(result).resolves.toEqual({ button: 'OK', value: null });
    });

    it('trims labels in the bracket syntax', () => {
        Herald.alert({ title: 'A', buttons: '[ No ][ Yes ]' });

        expect([...alerts()[0].querySelectorAll('.hd-button')].map((b) => b.textContent)).toEqual(['No', 'Yes']);
    });

    it('ignores animationend from children of a leaving toast', () => {
        const onClose = vi.fn();
        const handle = Herald.toast({ title: 'A', onClose });

        handle.close();
        toasts.length;
        const node = document.querySelector('.hd-toast');
        node.querySelector('.hd-toast__title').dispatchEvent(new Event('animationend', { bubbles: true }));

        expect(node.isConnected).toBe(true);
        expect(onClose).not.toHaveBeenCalled();
    });

    it('treats timeout 0 as no timeout for toasts, like panels', () => {
        Herald.toast({ title: 'A', timeout: 0 });
        vi.advanceTimersByTime(10000);

        expect(toasts()).toHaveLength(1);
    });

    it('does not recreate the panel region from a stale handle after reset', () => {
        const handle = Herald.panel({ title: 'A' });
        Herald.reset();

        handle.close();

        expect(document.querySelector('.hd-panels')).toBeNull();
        expect(panel()).toBeNull();
    });
});
