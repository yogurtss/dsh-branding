import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { bindFavicon } from '../lib/client/favicon.js'

const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg=='
function harness(head = '') {
  const doc = new JSDOM(`<html><head>${head}</head><body></body></html>`).window.document
  let snapshot = { status: 'ready', value: { displayName: '', logo: '' } }
  const listeners = new Set()
  const form = { getSnapshot: () => snapshot, subscribe: cb => { listeners.add(cb); return () => listeners.delete(cb) } }
  return { doc, form, listeners, update(logo, status = 'ready') {
    snapshot = { status, value: { displayName: '', logo } }; for (const cb of listeners) cb()
  } }
}

test('favicon switches both host media variants to one PNG and restores exact nodes/attributes/order', () => {
  const { doc, form, listeners, update } = harness('<link rel="manifest" href="/manifest.webmanifest"><link rel="icon" type="image/svg+xml" href="/favicon-dark.svg" media="(prefers-color-scheme: dark)"><link rel="icon" type="image/svg+xml" href="/favicon.svg" media="(prefers-color-scheme: light)"><link rel="apple-touch-icon" href="/touch.png"><title>DSH</title>')
  const before = doc.head.innerHTML
  const originalNodes = [...doc.head.children]
  const dispose = bindFavicon(form, doc)
  assert.equal(doc.head.innerHTML, before)
  update(png)
  const icon = doc.head.querySelector('link[rel="icon"]')
  assert.equal(doc.head.querySelectorAll('link[rel~="icon"]').length, 1)
  assert.equal(icon.type, 'image/png')
  assert.equal(icon.getAttribute('href'), png)
  assert.equal(icon.hasAttribute('media'), false)
  assert.equal(doc.querySelector('link[rel=manifest]').getAttribute('href'), '/manifest.webmanifest')
  assert.equal(doc.querySelector('link[rel=apple-touch-icon]').getAttribute('href'), '/touch.png')
  const next = png.replace('AAAANS', 'AAAANT')
  update(next)
  assert.equal(doc.head.querySelector('link[rel="icon"]'), icon)
  assert.equal(icon.getAttribute('href'), next)
  update('')
  assert.equal(doc.head.innerHTML, before)
  assert.deepEqual([...doc.head.children], originalNodes)
  update(png)
  dispose(); dispose()
  assert.equal(listeners.size, 0)
  assert.equal(doc.head.innerHTML, before)
  update(png)
  assert.equal(doc.head.innerHTML, before)
})

test('unavailable/invalid logo restores host icon, then reload and HMR reapply saved preference', () => {
  const { doc, form, update } = harness('<link rel="shortcut icon" sizes="32x32" href="/original.ico">')
  const before = doc.head.innerHTML
  update(png)
  const off = bindFavicon(form, doc)
  assert.equal(doc.querySelector('link[rel=icon]').getAttribute('href'), png)
  update(png, 'unavailable')
  assert.equal(doc.head.innerHTML, before)
  update('javascript:alert(1)')
  assert.equal(doc.head.innerHTML, before)
  update(png)
  off()
  assert.equal(doc.head.innerHTML, before)
  const offReload = bindFavicon(form, doc)
  assert.equal(doc.querySelector('link[rel=icon]').getAttribute('href'), png)
  offReload()
  assert.equal(doc.head.innerHTML, before)
})

test('host without a favicon returns to having none after reset', () => {
  const { doc, form, update } = harness()
  const off = bindFavicon(form, doc)
  update(png)
  assert.equal(doc.head.querySelectorAll('link').length, 1)
  update('')
  assert.equal(doc.head.children.length, 0)
  off()
})
