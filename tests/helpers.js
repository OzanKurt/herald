import { vi } from 'vitest';
import Herald from '../src/index.js';

export const reset = () => {
    Herald.reset();
    document.body.innerHTML = '';
    vi.useFakeTimers();
};

export const settle = () => vi.advanceTimersByTime(1000);

export const toasts = () => [...document.querySelectorAll('.hd-toast:not(.hd-leaving)')];
export const panel = () => document.querySelector('.hd-panel:not(.hd-leaving)');
export const tiles = () => [...document.querySelectorAll('.hd-tile')];
export const alertBox = () => document.querySelector('.hd-alert');
export const key = (k, target = document.activeElement ?? document) => target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
export const text = (root, selector) => root.querySelector(selector)?.textContent.trim();
