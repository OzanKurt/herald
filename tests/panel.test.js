import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Herald from '../src/index.js';
import { panel, reset, settle, text, tiles } from './helpers.js';

describe('panel', () => {
    beforeEach(reset);
    afterEach(() => vi.useRealTimers());

    it('shows one panel bottom-right with title, content, icon and number', () => {
        Herald.panel({ title: 'Shield is up', content: 'All good.', type: 'warning', number: 3 });

        expect(panel().closest('.hd-panels')).not.toBeNull();
        expect(text(panel(), '.hd-panel__title')).toBe('Shield is up');
        expect(text(panel(), '.hd-panel__content')).toBe('All good.');
        expect(text(panel(), '.hd-panel__number')).toBe('3');
        expect(panel().querySelector('.hd-panel__icon svg')).not.toBeNull();
    });

    it('parks the previous panel as a tile and restores it on click', () => {
        Herald.panel({ title: 'One', number: 1, color: '#c46a69' });
        Herald.panel({ title: 'Two', number: 2 });

        expect(text(panel(), '.hd-panel__title')).toBe('Two');
        expect(tiles().map((t) => t.textContent)).toEqual(['1']);
        expect(tiles()[0].getAttribute('aria-label')).toBe('Show One');

        tiles()[0].click();

        expect(text(panel(), '.hd-panel__title')).toBe('One');
        expect(tiles().map((t) => t.textContent)).toEqual(['2']);
    });

    it('brings back the last parked panel when the visible one closes', () => {
        const onClose = vi.fn();
        Herald.panel({ title: 'One', number: 1 });
        Herald.panel({ title: 'Two', number: 2, onClose });

        panel().querySelector('.hd-panel__close').click();
        settle();

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(text(panel(), '.hd-panel__title')).toBe('One');
        expect(tiles()).toHaveLength(0);
    });

    it('times out only while visible', () => {
        Herald.panel({ title: 'Brief', number: 1, timeout: 6000 });
        vi.advanceTimersByTime(2000);
        Herald.panel({ title: 'Other', number: 2 });

        vi.advanceTimersByTime(20000);
        expect(tiles().map((t) => t.textContent)).toEqual(['1']);

        tiles()[0].click();
        vi.advanceTimersByTime(6000);
        settle();
        expect(text(panel(), '.hd-panel__title')).toBe('Other');
    });

    it('returns a handle that closes a parked panel too', () => {
        const first = Herald.panel({ title: 'One', number: 1 });
        Herald.panel({ title: 'Two', number: 2 });

        first.close();

        expect(tiles()).toHaveLength(0);
        expect(text(panel(), '.hd-panel__title')).toBe('Two');
    });
});
