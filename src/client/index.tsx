import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import { ENTRY_ID, readBranding, type Branding } from '../shared.js'
import { Settings, styles } from './Settings.js'
import { en, zh, type Key } from './locales.js'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap { 'yogurtss.branding': Key }
}
export const name = 'yogurtss-branding'
export const inject = ['slots', 'configForms', 'locale']
const NS = 'yogurtss.branding'

/** Register overrides only while populated; removing them reveals the original occupants. */
export function bindBrandSlots(ctx: Context, form: ConfigForm<Branding>): () => void {
  let offName: (() => void) | undefined
  let offLogo: (() => void) | undefined
  let offHeroLogo: (() => void) | undefined
  let previousName = ''
  let previousLogo = ''
  const sync = () => {
    const snapshot = form.getSnapshot()
    const { displayName, logo } = readBranding(snapshot.status === 'ready' ? snapshot.value : undefined)
    if (displayName !== previousName) {
      offName?.(); offName = undefined; previousName = displayName
      if (displayName) offName = ctx.slots.inject('sidebar.brand.name', () => ctx.slots.register({
        name: 'sidebar.brand.name', priority: -100,
      }, function BrandName() { return <span title={displayName} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</span> }))
    }
    if (logo !== previousLogo) {
      offLogo?.(); offLogo = undefined; previousLogo = logo
      offHeroLogo?.(); offHeroLogo = undefined
      if (logo) offLogo = ctx.slots.inject('sidebar.brand.mark', () => ctx.slots.register({
        name: 'sidebar.brand.mark', priority: -100,
      }, function BrandMark({ size }: PropsRuntime<'sidebar.brand.mark'>) {
        return <img src={logo} alt="" width={size} height={size} style={{ display: 'block', objectFit: 'contain' }} />
      }))
      if (logo) offHeroLogo = ctx.slots.inject('conversation.hero.brand.mark', () => ctx.slots.register({
        name: 'conversation.hero.brand.mark', priority: -100,
      }, function HeroBrandMark({ size, className }: PropsRuntime<'conversation.hero.brand.mark'>) {
        return <img src={logo} alt="" className={className} width={size} height={size} style={{ display: 'block', objectFit: 'contain' }} />
      }))
    }
  }
  const unsubscribe = form.subscribe(sync)
  sync()
  return () => { unsubscribe(); offName?.(); offLogo?.(); offHeroLogo?.() }
}

/** Attach the native settings page and reversible sidebar overrides. */
export function apply(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }))
  const form = ctx.configForms.get<Branding>(ENTRY_ID)
  ctx.effect(() => bindBrandSlots(ctx, form))
  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.plugin = '@yogurtss/dsh-branding'; style.textContent = styles
    document.head.appendChild(style)
    return () => style.remove()
  })
  const t = ctx.locale.bind(NS)
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section', id: ENTRY_ID, order: 25, label: () => t('title'), locale: NS,
    inject: () => ({ form }),
  }, Settings))
}
