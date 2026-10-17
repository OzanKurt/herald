import Herald from '@ozankurt/herald';
import '@ozankurt/herald/style.css';

const params = new URLSearchParams(location.search);
const theme = params.get('theme') ?? 'polished';
const scheme = params.get('scheme') ?? 'light';
const scene = params.get('scene') ?? 'notifications';

document.documentElement.dataset.scheme = scheme;
Herald.configure({ theme, scheme });

const scenes = {
    notifications() {
        Herald.panel({ title: 'Big information box', content: 'This one is parked as tile 1.', type: 'error', icon: 'warning', number: 1 });
        Herald.panel({ title: 'Nightly backup is running', content: 'Two of five databases are done. You can keep working while it finishes.', type: 'info', icon: 'bell', number: 2 });
        Herald.panel({ title: 'Shield is up and running!', content: 'All 14 endpoints passed their checks. Close this panel to bring back the previous one.', type: 'warning', icon: 'shield', number: 3 });

        Herald.toast({ title: 'Payment received', content: 'Brightline Ltd paid invoice INV-2291 (€5,960.00).', type: 'success', timeout: 8000 });
        Herald.toast({ title: 'Ding Dong!', content: "Someone's at the door. Shall one get it, sir?", color: '#296191', icon: 'bell', actions: [{ label: 'Yes' }, { label: 'No', variant: 'danger' }] });
        Herald.toast({ title: 'Mara liked your comment', content: '2 seconds ago', color: '#296191', iconSmall: 'thumbs' });
    },

    alert() {
        Herald.alert({ title: 'Delete order #10480?', content: 'The order and its three shipments are removed. This cannot be undone.', buttons: '[Cancel][Delete order]' });
    },

    prompt() {
        Herald.alert({ title: 'Rename the dashboard', content: 'Shown in the sidebar and in shared links.', buttons: '[Cancel][Save]', input: 'text', inputValue: 'Operations overview' });
    },
};

scenes[scene]();

// Let fonts settle before a screenshot is taken.
document.fonts.ready.then(() => {
    document.body.dataset.ready = 'true';
});
