import type { Context } from '@deepseek-ai/cordis';
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client';
import { type Branding } from '../shared.js';
import { type Key } from './locales.js';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        'yogurtss.branding': Key;
    }
}
export declare const name = "yogurtss-branding";
export declare const inject: string[];
/** Register overrides only while populated; removing them reveals the original occupants. */
export declare function bindBrandSlots(ctx: Context, form: ConfigForm<Branding>): () => void;
/** Attach the native settings page and reversible sidebar overrides. */
export declare function apply(ctx: Context): void;
