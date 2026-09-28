const assert = require('node:assert/strict')
const test = require('node:test')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

const source = fs.readFileSync(require('node:path').join(__dirname, '..', 'components/study/AudioButton.tsx'), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, jsxImportSource: 'react', module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText

function createHarness({ playBehavior = () => Promise.resolve() } = {}) {
  const effects = []
  const refs = []
  const states = []
  let hook = 0
  let tree
  let currentAudio
  let urlNumber = 0
  const revoked = []
  const timers = new Map()
  let timerNumber = 0

  function audio() {
    let source = ''
    const element = {
      pauseCalls: 0, loadCalls: 0, playCalls: 0, currentTime: 0, error: null, ended: false,
      readyState: 4, networkState: 1, canPlayType: () => 'probably',
      pause() { this.pauseCalls += 1 },
      load() { this.loadCalls += 1 },
      play() { this.playCalls += 1; return playBehavior(this.playCalls) },
      removeAttribute(name) { if (name === 'src') { source = ''; this.error = null; this.ended = false } },
      setAttribute() {},
      get src() { return source },
      set src(value) { source = value; this.error = null; this.ended = false },
      get currentSrc() { return source },
    }
    return element
  }

  function createElement(type, props, ...children) {
    if (typeof type === 'function') return type({ ...(props || {}), children })
    const node = { type, props: { ...(props || {}), children: props?.children ?? children } }
    if (type === 'audio') {
      currentAudio = currentAudio || audio()
      if (node.props.ref) node.props.ref.current = currentAudio
      currentAudio.onended = node.props.onEnded
      currentAudio.onerror = node.props.onError
      node.audio = currentAudio
    }
    return node
  }
  const react = {
    useRef(value) { const ref = refs[hook] || { current: value }; refs[hook++] = ref; return ref },
    useState(value) {
      const index = hook++
      if (!(index in states)) states[index] = value
      return [states[index], next => { states[index] = typeof next === 'function' ? next(states[index]) : next }]
    },
    useEffect(callback) { effects.push(callback) },
    createElement,
  }
  const windowObject = {
    setTimeout(callback) { const id = ++timerNumber; timers.set(id, callback); return id },
    clearTimeout(id) { timers.delete(id) },
  }
  const URLObject = {
    createObjectURL() { return `blob:audio-${++urlNumber}` },
    revokeObjectURL(url) { revoked.push(url) },
  }
  const mediaRepo = { getMediaByFilename: async () => ({ blob: new Blob(['audio'], { type: 'audio/mpeg' }), mimeType: 'audio/mpeg' }) }
  const Button = props => createElement('button', props)
  const module = { exports: {} }
  const context = vm.createContext({
    console, Blob, URL: URLObject, window: windowObject,
    require(request) {
      if (request === 'react') return react
      if (request === 'react/jsx-runtime') return { jsx: createElement, jsxs: createElement, Fragment: 'fragment' }
      if (request === 'lucide-react') return { Play: () => null }
      if (request === '@/components/ui/button') return { Button }
      if (request === '@/lib/utils') return { cn: (...values) => values.filter(Boolean).join(' ') }
      if (request === '@/src/db/mediaRepo') return mediaRepo
      throw new Error(`unexpected import: ${request}`)
    }, module, exports: module.exports,
  })
  new vm.Script(`(function (require, module, exports) { ${compiled}\n})(require, module, exports)`).runInContext(context)
  const Component = module.exports.AudioButton

  function render() {
    hook = 0
    tree = Component({ deckId: 'deck', filename: 'sound.mp3' })
    return tree
  }
  function button() {
    let found
    function visit(node) {
      if (!node || found) return
      if (Array.isArray(node)) { node.forEach(visit); return }
      if (node.type === 'button') found = node
      for (const child of node.props?.children || []) visit(child)
    }
    visit(tree)
    if (!found) throw new Error(`button not found: ${JSON.stringify(tree)}`)
    return found
  }
  let activeCleanup
  async function prepare() { activeCleanup = effects.at(-1)(); for (let i = 0; i < 5; i += 1) await Promise.resolve(); render() }
  function cleanup() { if (activeCleanup) activeCleanup() }
  function detachRef() { refs[1].current = null }
  function runTimer(id) { const callback = timers.get(id); timers.delete(id); callback?.() }
  return { render, prepare, cleanup, detachRef, button, status: () => states[0], audio: () => currentAudio, effects, revoked, timers, runTimer, URLObject }
}

test('stale pending play cannot affect a newer attempt, and cleanup uses detached audio', async () => {
  let plays = 0
  const pending = []
  const h = createHarness({ playBehavior: () => { plays += 1; if (plays === 1) return new Promise((resolve, reject) => pending.push({ resolve, reject })); return Promise.resolve() } })
  h.render(); await h.prepare()
  const audio = h.audio(); h.button().props.onClick({ stopPropagation() {} }); for (let i = 0; i < 3; i += 1) await Promise.resolve()
  const firstUrl = audio.currentSrc
  assert.equal(pending.length, 1)
  h.detachRef(); h.cleanup()
  h.render(); await h.prepare()
  h.button().props.onClick({ stopPropagation() {} })
  const secondUrl = audio.currentSrc
  pending[0].reject(new Error('stale rejection'))
  await Promise.resolve(); await Promise.resolve()
  assert.equal(audio.currentSrc, secondUrl)
  assert.ok(!h.revoked.includes(secondUrl))
  assert.ok(h.revoked.includes(firstUrl))
  assert.equal(audio.pauseCalls >= 1, true)
  assert.equal(audio.loadCalls >= 1, true)
})

test('native rejection shows error and retry creates a fresh attempt; end permits replay', async () => {
  let rejectNext
  const h = createHarness({ playBehavior: () => rejectNext ? new Promise((_, reject) => { const fn = reject; rejectNext = null; fn(new Error('blocked')) }) : Promise.resolve() })
  h.render(); await h.prepare()
  rejectNext = true
  h.button().props.onClick({ stopPropagation() {} }); await Promise.resolve(); await Promise.resolve()
  h.render()
  assert.equal(typeof h.button().props.onClick, 'function')
  h.button().props.onClick({ stopPropagation() {} }); await Promise.resolve()
  const url = h.audio().currentSrc
  h.audio().onended?.()
  h.render(); h.button().props.onClick({ stopPropagation() {} })
  assert.notEqual(h.audio().currentSrc, url)
})

test('stale native events are ignored, while genuine error and ended events update state', async () => {
  const h = createHarness()
  h.render(); await h.prepare()
  h.button().props.onClick({ stopPropagation() {} })
  await Promise.resolve()
  const firstUrl = h.audio().currentSrc

  h.detachRef(); h.cleanup()
  h.render(); await h.prepare()
  h.button().props.onClick({ stopPropagation() {} })
  await Promise.resolve()
  const secondUrl = h.audio().currentSrc
  assert.notEqual(firstUrl, secondUrl)

  h.audio().error = null
  h.audio().ended = false
  h.audio().onerror()
  h.audio().onended()
  assert.equal(h.audio().currentSrc, secondUrl)
  h.render()
  assert.equal(h.status(), 'playing')

  h.audio().error = { code: 4, message: 'decode failed' }
  h.audio().onerror()
  h.render()
  assert.equal(h.status(), 'error')

  h.button().props.onClick({ stopPropagation() {} })
  await Promise.resolve()
  h.audio().ended = true
  h.audio().onended()
  h.render()
  assert.equal(h.status(), 'idle')
})

test('repeated transitions clean up timers and owned URLs on unmount', async () => {
  const h = createHarness()
  h.render(); await h.prepare()
  for (let index = 0; index < 10; index += 1) {
    h.button().props.onClick({ stopPropagation() {} })
    await Promise.resolve()
    h.detachRef(); h.cleanup()
    h.render(); await h.prepare()
  }
  h.detachRef(); h.cleanup()
  assert.equal(h.timers.size, 0)
  assert.equal(h.revoked.length, 10)
})
