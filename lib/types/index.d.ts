import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
export declare const name = "yogurtss-branding";
export declare const Config: z<Schemastery.ObjectS<NoInfer<{
    displayName: z<string, string, "volatile-defined">;
    logo: z<string, string, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    displayName: z<string, string, "volatile-defined">;
    logo: z<string, string, "volatile-defined">;
}>>, "plain">;
/** Expose live preferences through the native, persisted DSH settings service. */
export declare function apply(ctx: Context): void;
