import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import { SlotCore } from '@deepseek-ai/dsh-client-ui-slots'
import { Config } from '../lib/index.js'
import { readBranding, MAX_LOGO_LENGTH } from '../lib/shared.js'

const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg=='
const require = createRequire(import.meta.url)
let bundle
vm.runInNewContext(readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8'), {
  window: { __ModuleLoader__: { load(value) { bundle = value } } },
})
const client = bundle.factory(require)

test('published client wrapper registers under the actual package id', () => {
  assert.equal(bundle.id, '@yogurtss/dsh-branding')
  assert.deepEqual(Array.from(client.inject), ['slots', 'configForms', 'locale'])
})

test('host validates size, controls and inert PNGs, including defaults', () => {
  assert.equal(Config({}).displayName.get(), '')
  assert.equal(Config({ logo: png }).logo.get(), png)
  for (const value of [{ displayName: 'x'.repeat(41) }, { displayName: 'bad\nname' },
    { logo: 'https://example.org/a.png' }, { logo: 'data:image/svg+xml,<svg/>' },
    { logo: 'data:image/png;base64,iVBORw0KGgo' + 'A'.repeat(MAX_LOGO_LENGTH) }]) {
    assert.throws(() => Config(value))
  }
  assert.equal(readBranding({ displayName: '  My DSH  ', logo: png }).displayName, 'My DSH')
  assert.deepEqual(readBranding(null), { displayName: '', logo: '' })
  assert.equal(readBranding({ logo: 'javascript:alert(1)' }).logo, '')
})

test('real SlotCore restores original occupants after reset, unavailable state, and dispose', () => {
  const core = new SlotCore()
  core.register({ name: 'root', children: {
    'sidebar.brand.name': { kind: 'single', scope: 'root' },
    'sidebar.brand.mark': { kind: 'single', scope: 'root' },
    'conversation.hero.brand.mark': { kind: 'single', scope: 'root' },
  } }, function Root({ renderSlot }) { return renderSlot('sidebar.brand.name', {}) })
  function OriginalName() { return 'original' }
  function OriginalLogo() { return 'original-logo' }
  core.register({ name: 'sidebar.brand.name' }, OriginalName)
  core.register({ name: 'sidebar.brand.mark' }, OriginalLogo)
  let snapshot = { status: 'ready', value: { displayName: '', logo: '' } }
  const listeners = new Set()
  const form = { getSnapshot: () => snapshot, subscribe: cb => { listeners.add(cb); return () => listeners.delete(cb) } }
  const ctx = { slots: { inject: (_key, effect) => effect(), register: core.register.bind(core) } }
  const dispose = client.bindBrandSlots(ctx, form)
  const update = value => { snapshot = { ...snapshot, value }; for (const cb of listeners) cb() }
  assert.equal(core.entries('sidebar.brand.name').length, 1)
  assert.equal(core.entries('conversation.hero.brand.mark').length, 0)
  update({ displayName: 'My DSH', logo: png })
  assert.equal(core.entriesOfSlot('sidebar.brand.name')[0].component({}).props.children, 'My DSH')
  assert.equal(core.entriesOfSlot('sidebar.brand.mark')[0].component({ size: 24 }).props.src, png)
  const hero = core.entriesOfSlot('conversation.hero.brand.mark')[0].component({ size: 34, className: 'host-hero-fish' })
  assert.equal(hero.props.src, png)
  assert.equal(hero.props.width, 34)
  assert.equal(hero.props.height, 34)
  assert.equal(hero.props.className, 'host-hero-fish')
  update({ displayName: 'Changed', logo: png })
  assert.equal(core.entries('sidebar.brand.name').length, 2)
  assert.equal(core.entries('conversation.hero.brand.mark').length, 1)
  const replacement = png.replace('AAAANS', 'AAAANT')
  update({ displayName: 'Changed', logo: replacement })
  assert.equal(core.entries('conversation.hero.brand.mark').length, 1)
  assert.equal(core.entriesOfSlot('conversation.hero.brand.mark')[0].component({ size: 34 }).props.src, replacement)
  update({ displayName: '', logo: '' })
  assert.equal(core.entriesOfSlot('sidebar.brand.name')[0].component, OriginalName)
  assert.equal(core.entriesOfSlot('sidebar.brand.mark')[0].component, OriginalLogo)
  assert.equal(core.entries('conversation.hero.brand.mark').length, 0, 'empty slot reveals the host animated fish fallback')
  update({ displayName: 'Again', logo: png })
  snapshot = { ...snapshot, status: 'unavailable' }; for (const cb of listeners) cb()
  assert.equal(core.entriesOfSlot('sidebar.brand.name')[0].component, OriginalName)
  assert.equal(core.entries('conversation.hero.brand.mark').length, 0)
  snapshot = { ...snapshot, status: 'ready' }; for (const cb of listeners) cb()
  dispose(); dispose()
  assert.equal(listeners.size, 0)
  assert.equal(core.entries('sidebar.brand.name').length, 1)
  assert.equal(core.entries('sidebar.brand.mark').length, 1)
  assert.equal(core.entries('conversation.hero.brand.mark').length, 0)
})
