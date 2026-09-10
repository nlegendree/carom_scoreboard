import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { effectScope, nextTick, type EffectScope } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useGameStore } from '../stores/useGameStore'
import { usePwaUpdate, UPDATE_CHECK_INTERVAL_MS } from './usePwaUpdate'

// Le module virtuel est résolu par `VitePWA()` dans vitest.config.ts, puis remplacé ici.
// La factory capture les options passées à `useRegisterSW` pour piloter les callbacks
// (`onRegisteredSW`, `onRegisterError`) comme le ferait `workbox-window`.
type RegisterOptions = {
  immediate?: boolean
  onRegisteredSW?: (url: string, registration: ServiceWorkerRegistration | undefined) => void
  onRegisterError?: (error: unknown) => void
}

// `vi.hoisted` s'exécute avant les imports statiques : `ref` doit y être importé à part.
const { needRefresh, updateServiceWorker, captured } = await vi.hoisted(async () => {
  const { ref } = await import('vue')
  return {
    needRefresh: ref(false),
    updateServiceWorker: vi.fn(),
    captured: { options: undefined as RegisterOptions | undefined },
  }
})

vi.mock('virtual:pwa-register/vue', async () => {
  const { ref } = await import('vue')
  return {
    useRegisterSW: (options: RegisterOptions) => {
      captured.options = options
      return { needRefresh, offlineReady: ref(false), updateServiceWorker }
    },
  }
})

function fakeRegistration(update = vi.fn().mockResolvedValue(undefined)) {
  return { update } as unknown as ServiceWorkerRegistration & { update: typeof update }
}

function setOnLine(value: boolean) {
  Object.defineProperty(navigator, 'onLine', { value, configurable: true })
}

// happy-dom n'implémente pas `navigator.serviceWorker` : un EventTarget nu suffit pour
// émettre `controllerchange`, l'événement natif qui signale que le nouveau SW contrôle la page.
function installFakeServiceWorkerContainer() {
  const container = new EventTarget()
  Object.defineProperty(navigator, 'serviceWorker', { value: container, configurable: true })
  return container
}

function fireControllerChange() {
  navigator.serviceWorker.dispatchEvent(new Event('controllerchange'))
}

describe('usePwaUpdate', () => {
  let scope: EffectScope
  let consoleError: ReturnType<typeof vi.spyOn>
  let reload: ReturnType<typeof vi.fn>

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.restoreAllMocks()
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    installFakeServiceWorkerContainer()
    reload = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload },
      configurable: true,
      writable: true,
    })
    needRefresh.value = false
    updateServiceWorker.mockReset()
    captured.options = undefined
    setOnLine(true)
    scope = effectScope()
  })

  afterEach(() => {
    scope.stop()
    vi.useRealTimers()
  })

  function run() {
    return scope.run(() => usePwaUpdate())!
  }

  it('registers the service worker immediately', () => {
    run()

    expect(captured.options?.immediate).toBe(true)
  })

  describe('periodic update check', () => {
    it('calls registration.update() once per interval while online', async () => {
      run()
      const registration = fakeRegistration()
      captured.options!.onRegisteredSW!('/sw.js', registration)

      await vi.advanceTimersByTimeAsync(UPDATE_CHECK_INTERVAL_MS)
      expect(registration.update).toHaveBeenCalledTimes(1)

      await vi.advanceTimersByTimeAsync(UPDATE_CHECK_INTERVAL_MS)
      expect(registration.update).toHaveBeenCalledTimes(2)
    })

    it('skips the check while offline', async () => {
      run()
      const registration = fakeRegistration()
      captured.options!.onRegisteredSW!('/sw.js', registration)
      setOnLine(false)

      await vi.advanceTimersByTimeAsync(UPDATE_CHECK_INTERVAL_MS)

      expect(registration.update).not.toHaveBeenCalled()
    })

    it('absorbs a failing check, logs it, and keeps the interval alive', async () => {
      run()
      const update = vi.fn().mockRejectedValue(new Error('network'))
      captured.options!.onRegisteredSW!('/sw.js', fakeRegistration(update))

      await vi.advanceTimersByTimeAsync(UPDATE_CHECK_INTERVAL_MS)
      expect(consoleError).toHaveBeenCalledWith('[pwa] update check failed:', expect.any(Error))

      await vi.advanceTimersByTimeAsync(UPDATE_CHECK_INTERVAL_MS)
      expect(update).toHaveBeenCalledTimes(2)
    })

    it('sets no interval when registration is undefined', async () => {
      run()

      expect(() => captured.options!.onRegisteredSW!('/sw.js', undefined)).not.toThrow()
      await vi.advanceTimersByTimeAsync(UPDATE_CHECK_INTERVAL_MS * 2)
      expect(vi.getTimerCount()).toBe(0)
    })

    it('logs a registration error without throwing', () => {
      run()

      expect(() => captured.options!.onRegisterError!(new Error('boom'))).not.toThrow()
      expect(consoleError).toHaveBeenCalledWith('[pwa] registration failed:', expect.any(Error))
    })

    it('clears the interval when the scope is disposed', async () => {
      run()
      const registration = fakeRegistration()
      captured.options!.onRegisteredSW!('/sw.js', registration)
      await vi.advanceTimersByTimeAsync(UPDATE_CHECK_INTERVAL_MS)
      expect(registration.update).toHaveBeenCalledTimes(1)

      scope.stop()

      await vi.advanceTimersByTimeAsync(UPDATE_CHECK_INTERVAL_MS)
      expect(registration.update).toHaveBeenCalledTimes(1)
      expect(consoleError).not.toHaveBeenCalled()
    })
  })

  describe('applying a new version only on the home screen (status idle)', () => {
    it('applies immediately when idle, exactly once even if status moves again', async () => {
      run()
      needRefresh.value = true
      await nextTick()
      expect(updateServiceWorker).toHaveBeenCalledTimes(1)
      expect(updateServiceWorker).toHaveBeenCalledWith(true)

      const store = useGameStore()
      store.startGame('libre', 'A', 'B')
      await nextTick()
      store.resetGame()
      await nextTick()
      expect(updateServiceWorker).toHaveBeenCalledTimes(1)
    })

    it('applies at launch when needRefresh is already true', async () => {
      needRefresh.value = true

      run()
      await nextTick()

      expect(updateServiceWorker).toHaveBeenCalledTimes(1)
    })

    it('waits for the end of the game: never during playing or finished', async () => {
      const store = useGameStore()
      store.startGame('libre', 'A', 'B')
      run()

      needRefresh.value = true
      await nextTick()
      expect(updateServiceWorker).not.toHaveBeenCalled()

      store.finishGame()
      await nextTick()
      expect(updateServiceWorker).not.toHaveBeenCalled()

      store.resetGame()
      await nextTick()
      expect(updateServiceWorker).toHaveBeenCalledTimes(1)
      expect(updateServiceWorker).toHaveBeenCalledWith(true)
    })

    // Le module `virtual:pwa-register` ne recharge la page sur `controlling` que si
    // `isUpdate` est vrai ; `workbox-window` classe comme EXTERNE (isUpdate: false) toute
    // mise à jour trouvée plus de 60 s après l'enregistrement — c'est le cas de la
    // vérification horaire. Le composable recharge donc lui-même sur `controllerchange`.
    it('reloads the page once the new service worker takes control (external update)', async () => {
      run()
      needRefresh.value = true
      await nextTick()
      expect(updateServiceWorker).toHaveBeenCalledWith(true)
      expect(reload).not.toHaveBeenCalled()

      fireControllerChange()

      expect(reload).toHaveBeenCalledTimes(1)
    })

    // `clientsClaim` : au tout premier chargement, le SW fraîchement installé prend le
    // contrôle de la page → `controllerchange` sans aucune mise à jour à appliquer.
    it('does not reload on controllerchange when no update is being applied', () => {
      run()

      fireControllerChange()

      expect(reload).not.toHaveBeenCalled()
    })

    it('stops listening to controllerchange once the scope is disposed', async () => {
      run()
      needRefresh.value = true
      await nextTick()

      scope.stop()
      fireControllerChange()

      expect(reload).not.toHaveBeenCalled()
    })

    it('exposes needRefresh read-only for observation', () => {
      const { needRefresh: exposed } = run()

      expect(exposed.value).toBe(false)
      needRefresh.value = true
      expect(exposed.value).toBe(true)
    })
  })
})

// FR45 / NFR13 : l'application ne dépend d'aucune ressource réseau au runtime. Toute
// police ou icône est auto-hébergée (`src/assets/`). Les tests sont exclus : ils ont le
// droit de citer une URL (ex. ce fichier, ou une doc). Pour un commentaire légitime dans
// une source, écrire le domaine sans schéma (`example.com`) plutôt qu'ajouter une exception.
describe('offline — aucune ressource réseau', () => {
  const sources = Object.entries({
    ...import.meta.glob('/src/**/*.{ts,vue,css}', { query: '?raw', import: 'default', eager: true }),
    ...import.meta.glob('/index.html', { query: '?raw', import: 'default', eager: true }),
  }).filter(([path]) => !path.endsWith('.test.ts')) as [string, string][]

  it('scans the application sources and index.html', () => {
    const paths = sources.map(([path]) => path)
    expect(paths).toContain('/index.html')
    expect(paths).toContain('/src/main.ts')
    expect(paths).toContain('/src/App.vue')
    expect(paths).toContain('/src/assets/main.css')
    expect(paths.some((p) => p.endsWith('.test.ts'))).toBe(false)
  })

  it.each(sources)('%s references no external URL and no fetch()', (_path, source) => {
    expect(source).not.toMatch(/https?:\/\//)
    expect(source).not.toContain('fetch(')
  })
})
