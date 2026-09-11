import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useHaptics } from './useHaptics'

// `navigator.vibrate` n'existe PAS dans happy-dom (vérifié : aucune occurrence dans
// node_modules/happy-dom/lib/navigator/). Une assignation directe suffit à le simuler,
// et `delete` restaure l'absence — c'est-à-dire le cas iPad/Safari réel.
// Vue volontairement détachée de `Navigator` : `lib.dom.d.ts` y déclare `vibrate()` comme
// TOUJOURS présente, ce qui interdirait le `delete` — alors que son absence est justement
// le cas réel sur iPad et en test.
const nav = navigator as unknown as { vibrate?: (pattern: number | number[]) => boolean }

describe('useHaptics', () => {
  beforeEach(() => {
    delete nav.vibrate
  })

  afterEach(() => {
    delete nav.vibrate
  })

  it('vibrates on tap', () => {
    const vibrate = vi.fn()
    nav.vibrate = vibrate

    useHaptics().tap()

    expect(vibrate).toHaveBeenCalledTimes(1)
  })

  // UX-DR10 : le refus doit être RECONNAISSABLE au doigt, donc distinct de l'accusé de
  // réception. Les durées exactes peuvent être ajustées ; leur différence, non.
  it('uses a distinct, shorter pattern to signal a refusal', () => {
    const vibrate = vi.fn()
    nav.vibrate = vibrate
    const { tap, reject } = useHaptics()

    tap()
    reject()

    const [tapPattern] = vibrate.mock.calls[0]!
    const [rejectPattern] = vibrate.mock.calls[1]!
    expect(rejectPattern).not.toEqual(tapPattern)
    expect(rejectPattern).toBeLessThan(tapPattern)
  })

  // Cas iPad/iPadOS Safari : l'API n'est pas implémentée, toutes versions confondues.
  // Sans la garde, chaque frappe lèverait une exception sur l'appareil cible.
  it('stays silent and never throws when the API is missing', () => {
    const { tap, reject } = useHaptics()

    expect(() => {
      tap()
      reject()
    }).not.toThrow()
  })
})
