import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'
import { LOGO_PATTERN, MAX_LOGO_LENGTH, MAX_NAME_LENGTH, NAME_PATTERN } from './shared.js'

export const name = 'yogurtss-branding'
export const Config = z.object({
  displayName: z.string().max(MAX_NAME_LENGTH).pattern(NAME_PATTERN).default('').volatile(),
  logo: z.string().max(MAX_LOGO_LENGTH).pattern(LOGO_PATTERN).default('').volatile(),
})

/** Expose live preferences through the native, persisted DSH settings service. */
export function apply(ctx: Context): void {
  ctx.inject(['settings'], child => {
    child.effect(() => child.settings.configure({ auto: false }, ctx.fiber))
  })
}
