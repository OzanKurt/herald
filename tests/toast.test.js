import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Herald from '../src/index.js';
import { reset, settle, text, toasts } from './helpers.js';

describe('toast', () => {
    beforeEach(reset);
    afterEach(() => vi.useRealTimers());

    it('renders title, content and colour in the top-right region', () => {
        Herald.toast({ title: 'Saved', content: 'Your changes are live.', color: '#296191', icon: 'bell' });

        const [toast] = toasts();
        expect(toast.closest('.hd-toasts')).not.toBeNull();
        expect(text(toast, '.hd-toast__title')).toBe('Saved');
        expect(text(toast, '.hd-toast__content')).toBe('Your changes are live.');
        expect(toast.style.getPropertyValue('--hd-accent')).toBe('#296191');
        expect(toast.querySelector('.hd-toast__icon svg')).not.toBeNull();
        expect(toast.closest('.hd-toasts').getAttribute('aria-live')).toBe('polite');
    });

    it('stacks the newest toast on top', () => {
        Herald.toast({ title: 'First' });
        Herald.toast({ title: 'Second' });

        expect(toasts().map((t) => text(t, '.hd-toast__title'))).toEqual(['Second', 'First']);
    });

    it('treats content as text unless html is given', () => {
        Herald.toast({ title: 'A', content: '<b>x</b>' });
        Herald.toast({ title: 'B', html: '<b>y</b>' });

        const [withHtml, withText] = toasts();
        expect(withText.querySelector('.hd-toast__content b')).toBeNull();
        expect(withText.querySelector('.hd-toast__content').textContent).toBe('<b>x</b>');
        expect(withHtml.querySelector('.hd-toast__content b').textContent).toBe('y');
    });

    it('maps a type to its colour and icon', () => {
        Herald.toast({ title: 'Done', type: 'success' });

        const [toast] = toasts();
        expect(toast.style.getPropertyValue('--hd-accent')).toBe('#739e73');
        expect(toast.dataset.type).toBe('success');
    });

    it('renders an unknown icon name as a class list, for icon fonts', () => {
        Herald.toast({ title: 'A', icon: 'fa fa-bell swing animated' });

        expect(toasts()[0].querySelector('.hd-toast__icon i').className).toBe('fa fa-bell swing animated');
    });

    it('closes on click and calls onClose once', () => {
        const onClose = vi.fn();
        const handle = Herald.toast({ title: 'A', onClose });

        toasts()[0].click();
        handle.close();
        settle();

        expect(document.querySelector('.hd-toast')).toBeNull();
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('stays without a timeout and leaves after one', () => {
        Herald.toast({ title: 'Sticky' });
        Herald.toast({ title: 'Brief', timeout: 4000 });

        vi.advanceTimersByTime(3999);
        expect(toasts()).toHaveLength(2);

        vi.advanceTimersByTime(1);
        settle();
        expect(toasts().map((t) => text(t, '.hd-toast__title'))).toEqual(['Sticky']);
    });

    it('pauses the timeout while hovered', () => {
        Herald.toast({ title: 'Brief', timeout: 4000 });
        const [toast] = toasts();

        vi.advanceTimersByTime(3000);
        toast.dispatchEvent(new MouseEvent('mouseenter'));
        vi.advanceTimersByTime(10000);
        expect(toasts()).toHaveLength(1);

        toast.dispatchEvent(new MouseEvent('mouseleave'));
        vi.advanceTimersByTime(999);
        expect(toasts()).toHaveLength(1);

        vi.advanceTimersByTime(1);
        settle();
        expect(toasts()).toHaveLength(0);
    });

    it('runs inline actions and closes', () => {
        const onYes = vi.fn();
        Herald.toast({ title: 'Ding Dong!', actions: [{ label: 'Yes', onClick: onYes }, { label: 'No', variant: 'danger' }] });

        const buttons = toasts()[0].querySelectorAll('.hd-toast__actions button');
        expect([...buttons].map((b) => b.textContent)).toEqual(['Yes', 'No']);
        expect(buttons[1].classList.contains('hd-button--danger')).toBe(true);

        buttons[0].click();
        settle();

        expect(onYes).toHaveBeenCalledTimes(1);
        expect(toasts()).toHaveLength(0);
    });

    it('shows a close button that does not need a click on the body', () => {
        Herald.toast({ title: 'A', closeOnClick: false });

        toasts()[0].click();
        expect(toasts()).toHaveLength(1);

        toasts()[0].querySelector('.hd-toast__close').click();
        settle();
        expect(toasts()).toHaveLength(0);
    });
});
