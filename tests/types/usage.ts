// Compiled by `npm run typecheck` (tsc --noEmit); never run.
import Herald, { type AlertResult, type ToastHandle } from '@ozankurt/herald';

const handle: ToastHandle = Herald.toast({ title: 'Saved', type: 'success', timeout: 4000, actions: [{ label: 'Undo', onClick: () => {} }] });
handle.close();

Herald.panel({ title: 'Backup', icon: 'shield', number: 3 }).close();

const result: Promise<AlertResult> = Herald.alert({ title: 'Delete?', buttons: ['Cancel', 'Delete'], input: 'text' }, (button, value) => {
    const label: string | null = button;
    const text: string | null = value;
    void label;
    void text;
});
void result;

Herald.configure({ theme: 'polished', scheme: 'dark' });
const theme: 'default' | 'polished' = Herald.settings().theme;
void theme;

Herald.toast({ icon: 'fa fa-bell' });

// @ts-expect-error unknown theme
Herald.configure({ theme: 'neon' });

// @ts-expect-error unknown type
Herald.toast({ type: 'fatal' });
