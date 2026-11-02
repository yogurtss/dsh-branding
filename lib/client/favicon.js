import { readBranding } from '../shared.js';
/** Override document favicons while configured, preserving the host's original nodes and media rules. */
export function bindFavicon(form, doc) {
    let custom;
    let originals = [];
    const restore = () => {
        custom?.remove();
        custom = undefined;
        for (const { node, marker } of originals)
            marker.replaceWith(node);
        originals = [];
    };
    const sync = () => {
        const snapshot = form.getSnapshot();
        const { logo } = readBranding(snapshot.status === 'ready' ? snapshot.value : undefined);
        if (!logo) {
            restore();
            return;
        }
        if (!custom) {
            // The exact supported host ships two static icon links (light/dark).
            // Keep their original nodes and positions, including all attributes.
            originals = [...doc.head.querySelectorAll('link[rel~="icon"]')].map(node => {
                const marker = doc.createComment('yogurtss-branding: original favicon');
                node.replaceWith(marker);
                return { node, marker };
            });
            custom = doc.createElement('link');
            custom.rel = 'icon';
            custom.type = 'image/png';
            custom.dataset.plugin = '@yogurtss/dsh-branding';
            custom.href = logo;
            doc.head.appendChild(custom);
        }
        else if (custom.getAttribute('href') !== logo) {
            custom.href = logo;
        }
    };
    const unsubscribe = form.subscribe(sync);
    sync();
    return () => { unsubscribe(); restore(); };
}
