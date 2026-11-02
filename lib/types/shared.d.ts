export declare const ENTRY_ID = "yogurtss-branding";
export declare const MAX_NAME_LENGTH = 40;
export declare const MAX_UPLOAD_BYTES: number;
export declare const MAX_LOGO_LENGTH = 100000;
export declare const LOGO_PATTERN: RegExp;
export declare const NAME_PATTERN: RegExp;
export interface Branding {
    displayName: string;
    logo: string;
}
export declare const EMPTY_BRANDING: Branding;
/** Validate untrusted settings before using them in the sidebar. */
export declare function readBranding(value: unknown): Branding;
