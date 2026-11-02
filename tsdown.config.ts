import { defineConfig } from 'tsdown'
import { readFileSync } from 'node:fs'
const { name } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
const external = ['react', 'react/jsx-runtime', 'react-dom', 'react-dom/client', '@deepseek-ai/cordis', '@deepseek-ai/dsh-client-store', '@deepseek-ai/dsh-client-ui-slots', '@deepseek-ai/dsh-client-ui-primitives']
export default defineConfig({
  entry: { client: 'lib/client/index.js' }, outDir: 'lib', format: 'cjs', platform: 'browser',
  clean: false, dts: false, sourcemap: true,
  deps: { neverBundle: id => external.includes(id), alwaysBundle: id => !external.includes(id) },
  plugins: [{ name: 'client-purity', resolveId(id) {
    if (id.startsWith('@deepseek-ai/') && !external.includes(id)) throw new Error(`Unsupported client value import: ${id}`)
  } }],
  outputOptions: {
    entryFileNames: 'client.js',
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(name)}, factory: (require) => {`,
    intro: 'var module = { exports: {} }; var exports = module.exports;',
    footer: 'return module.exports; } });',
  },
})
