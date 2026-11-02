import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client';
import { type Branding } from '../shared.js';
/** Override document favicons while configured, preserving the host's original nodes and media rules. */
export declare function bindFavicon(form: ConfigForm<Branding>, doc: Document): () => void;
