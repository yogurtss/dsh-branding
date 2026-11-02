export const ENTRY_ID = 'yogurtss-branding';
export const MAX_NAME_LENGTH = 40;
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
export const MAX_LOGO_LENGTH = 100_000;
export const LOGO_PATTERN = /^(?:|data:image\/png;base64,iVBORw0KGgo[A-Za-z0-9+/]*={0,2})$/;
export const NAME_PATTERN = /^[^\u0000-\u001f\u007f]*$/;
export const EMPTY_BRANDING = { displayName: '', logo: '' };
/** Validate untrusted settings before using them in the sidebar. */
export function readBranding(value) {
    if (!value || typeof value !== 'object')
        return EMPTY_BRANDING;
    const { displayName, logo } = value;
    return {
        displayName: typeof displayName === 'string' && displayName.length <= MAX_NAME_LENGTH && NAME_PATTERN.test(displayName) ? displayName.trim() : '',
        logo: typeof logo === 'string' && logo.length <= MAX_LOGO_LENGTH && LOGO_PATTERN.test(logo) ? logo : '',
    };
}
