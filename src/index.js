/**
 * Herald
 *
 * Toasts, big notification panels and modal alerts in the classic SmartAdmin
 * style ("default" theme) or a modern one ("polished"). No dependencies.
 */

import { configure, getSettings, resetShared } from './shared.js';
import { toast } from './toast.js';
import { panel, resetPanels } from './panel.js';
import { alert } from './alert.js';

const Herald = {
    toast,
    panel,
    alert,
    /** @param {{ theme?: 'default'|'polished', scheme?: 'auto'|'light'|'dark' }} options */
    configure,
    settings: getSettings,
    /** Remove everything Herald has put on the page and restore the default settings. */
    reset: () => {
        resetPanels();
        resetShared();
    },
};

export { toast, panel, alert, configure };
export default Herald;
