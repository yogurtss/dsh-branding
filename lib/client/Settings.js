import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { EMPTY_BRANDING, MAX_NAME_LENGTH, NAME_PATTERN, readBranding } from '../shared.js';
import { prepareLogo } from './image.js';
export function Settings({ form, t }) {
    const snapshot = useSyncExternalStore(listener => form.subscribe(listener), () => form.getSnapshot());
    const [draft, setDraft] = useState(() => readBranding(snapshot.value));
    const [revision, setRevision] = useState(snapshot.revision);
    const [dirty, setDirty] = useState(false);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(false);
    const alive = useRef(true);
    const fileInput = useRef(null);
    useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
    useEffect(() => {
        if (!dirty) {
            setDraft(readBranding(snapshot.value));
            setRevision(snapshot.revision);
        }
    }, [snapshot.value, snapshot.revision, dirty]);
    function edit(value) {
        setDraft(previous => ({ ...previous, ...value }));
        setDirty(true);
        setMessage(null);
    }
    function reload() {
        setDraft(readBranding(form.getSnapshot().value));
        setRevision(form.getSnapshot().revision);
        setDirty(false);
        setMessage(null);
        setError(false);
    }
    async function upload(file) {
        setBusy(true);
        setMessage(null);
        try {
            const logo = await prepareLogo(file);
            if (alive.current)
                edit({ logo });
        }
        catch (cause) {
            if (alive.current) {
                const key = cause instanceof Error && ['tooLarge', 'dimensions'].includes(cause.message) ? cause.message : 'uploadFailed';
                setMessage(key);
                setError(true);
            }
        }
        finally {
            if (alive.current)
                setBusy(false);
        }
    }
    async function save(reset = false) {
        const value = reset ? EMPTY_BRANDING : { ...draft, displayName: draft.displayName.trim() };
        if (value.displayName.length > MAX_NAME_LENGTH || !NAME_PATTERN.test(value.displayName)) {
            setMessage('invalidName');
            setError(true);
            return;
        }
        setBusy(true);
        setMessage(null);
        try {
            const accepted = await form.mutate([
                { op: 'set', path: ['displayName'], value: value.displayName },
                { op: 'set', path: ['logo'], value: value.logo },
            ], reset ? snapshot.revision : revision);
            if (!accepted)
                throw new Error('refused');
            if (alive.current) {
                setDraft(value);
                setDirty(false);
                setError(false);
                setMessage(reset ? 'restored' : 'saved');
            }
        }
        catch {
            if (alive.current) {
                setError(true);
                setMessage('failed');
            }
        }
        finally {
            if (alive.current)
                setBusy(false);
        }
    }
    if (snapshot.status !== 'ready')
        return _jsx("p", { role: "status", children: t(snapshot.status === 'loading' ? 'loading' : 'unavailable') });
    return _jsxs("section", { className: "yogurtss-branding", "aria-label": t('title'), children: [_jsx("h2", { children: t('title') }), _jsx("p", { className: "yb-muted", children: t('intro') }), _jsxs("fieldset", { disabled: busy || !snapshot.writable, children: [_jsx("label", { htmlFor: "yb-name", children: t('name') }), _jsx("input", { id: "yb-name", type: "text", maxLength: MAX_NAME_LENGTH, value: draft.displayName, placeholder: t('placeholder'), onChange: event => edit({ displayName: event.target.value }), "aria-describedby": "yb-name-hint" }), _jsx("p", { id: "yb-name-hint", className: "yb-muted", children: t('nameHint') }), _jsx("label", { htmlFor: "yb-file", children: t('logo') }), _jsx("input", { ref: fileInput, id: "yb-file", type: "file", accept: "image/png,image/jpeg,image/webp", "aria-describedby": "yb-upload-hint", onChange: event => { const file = event.target.files?.[0]; event.target.value = ''; if (file)
                            void upload(file); } }), _jsx("p", { id: "yb-upload-hint", className: "yb-muted", children: t('uploadHint') }), _jsx("button", { type: "button", onClick: () => edit({ logo: '' }), disabled: !draft.logo, children: t('remove') }), _jsxs("div", { className: "yb-preview", "aria-label": t('preview'), children: [draft.logo ? _jsx("img", { src: draft.logo, alt: t('logo') }) : _jsx("span", { className: "yb-default", children: t('defaultLogo') }), _jsx("strong", { title: draft.displayName, children: draft.displayName || t('defaultName') })] }), _jsxs("div", { className: "yb-actions", children: [_jsx("button", { type: "button", className: "yb-primary", disabled: !dirty, onClick: () => { void save(); }, children: busy ? t('saving') : t('save') }), _jsx("button", { type: "button", onClick: () => { void save(true); }, children: t('reset') })] }), _jsx("p", { className: "yb-muted", children: t('resetHint') })] }), !snapshot.writable && _jsx("p", { role: "status", children: t('readOnly') }), message && _jsx("p", { role: error ? 'alert' : 'status', children: t(message) }), error && message === 'failed' && _jsx("button", { type: "button", onClick: reload, children: t('reload') })] });
}
export const styles = `
.yogurtss-branding{max-width:640px;color:var(--dsw-alias-label-primary);font:inherit}
.yogurtss-branding h2{font-size:20px;margin:0 0 12px}.yogurtss-branding p{line-height:1.6}
.yogurtss-branding .yb-muted{color:var(--dsw-alias-label-secondary);font-size:13px;margin:8px 0 22px}
.yogurtss-branding fieldset{border:0;padding:0;margin:0;min-width:0}.yogurtss-branding label{display:block;font-weight:600;margin:20px 0 10px}
.yogurtss-branding input[type=text]{box-sizing:border-box;width:100%;border:1px solid var(--dsw-alias-border-l1,#8886);border-radius:9px;padding:10px 12px;background:var(--dsw-alias-bg-layer-1,transparent);color:inherit;font:inherit}
.yogurtss-branding input[type=file]{max-width:100%;font:inherit}.yogurtss-branding button{font:inherit;color:inherit;background:var(--dsw-alias-bg-layer-1,transparent);border:1px solid var(--dsw-alias-border-l1,#8886);border-radius:9px;padding:9px 14px;cursor:pointer}
.yogurtss-branding .yb-primary{background:var(--dsw-alias-brand-primary,#4d6bfe);color:white;border-color:transparent}
.yogurtss-branding button:disabled{opacity:.5;cursor:default}.yogurtss-branding :focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4d6bfe);outline-offset:3px}
.yogurtss-branding .yb-preview{display:flex;gap:14px;align-items:center;margin:24px 0;padding:22px;border:1px solid var(--dsw-alias-border-l1,#8886);border-radius:12px;overflow:hidden}
.yb-preview img{width:40px;height:40px;object-fit:contain;flex:none}.yb-preview strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.yb-default{font-size:11px;border:1px dashed currentColor;border-radius:7px;padding:8px;flex:none}
.yogurtss-branding .yb-actions{display:flex;flex-wrap:wrap;gap:10px}.yogurtss-branding [role=alert]{color:var(--dsw-alias-state-error-primary,#c33)}
`;
