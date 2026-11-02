import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { Settings } from '../lib/client/Settings.js'
import { zh } from '../lib/client/locales.js'
import { prepareLogo } from '../lib/client/image.js'

const dom = new JSDOM('<html><body><div id="root"></div></body></html>', { url: 'http://localhost' })
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.IS_REACT_ACT_ENVIRONMENT = true

test('settings performs atomic reset and surfaces write rejection without claiming success', async () => {
  let snapshot = { status: 'ready', value: { displayName: 'Custom', logo: '' }, revision: 3, writable: true }
  const listeners = new Set()
  const calls = []
  let accept = false
  const form = {
    getSnapshot: () => snapshot,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener) },
    async mutate(ops, revision) {
      calls.push({ ops, revision })
      if (!accept) return false
      snapshot = { ...snapshot, revision: 4, value: Object.fromEntries(ops.map(op => [op.path[0], op.value])) }
      for (const cb of listeners) cb()
      return true
    },
  }
  const root = createRoot(document.getElementById('root'))
  await act(async () => root.render(React.createElement(Settings, { form, t: key => zh[key] })))
  const reset = () => [...document.querySelectorAll('button')].find(button => button.textContent === zh.reset)
  await act(async () => reset().click())
  assert.equal(document.querySelector('[role=alert]').textContent, zh.failed)
  assert.equal(document.querySelector('#yb-name').value, 'Custom')
  accept = true
  await act(async () => reset().click())
  assert.deepEqual(calls.at(-1), { revision: 3, ops: [
    { op: 'set', path: ['displayName'], value: '' }, { op: 'set', path: ['logo'], value: '' },
  ] })
  assert.equal(document.querySelector('#yb-name').value, '')
  assert.equal(document.querySelector('[role=status]').textContent, zh.restored)
  await act(async () => root.unmount())
  assert.equal(listeners.size, 0)
})

test('upload rejects non-raster and oversized files before allocating object URLs', async () => {
  await assert.rejects(prepareLogo({ size: 1, type: 'image/svg+xml' }), /uploadFailed/)
  await assert.rejects(prepareLogo({ size: 2 * 1024 * 1024 + 1, type: 'image/png' }), /tooLarge/)
})

test('upload releases object URL even when decoding fails', async () => {
  const originalImage = globalThis.Image
  const originalCreate = URL.createObjectURL
  const originalRevoke = URL.revokeObjectURL
  const revoked = []
  URL.createObjectURL = () => 'blob:test-image'
  URL.revokeObjectURL = url => revoked.push(url)
  globalThis.Image = class { async decode() { throw new Error('decode') } }
  try {
    await assert.rejects(prepareLogo({ size: 12, type: 'image/png' }), /decode/)
    assert.deepEqual(revoked, ['blob:test-image'])
  } finally { globalThis.Image = originalImage; URL.createObjectURL = originalCreate; URL.revokeObjectURL = originalRevoke }
})
