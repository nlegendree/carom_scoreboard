import { describe, it, expect, vi } from 'vitest'
import { useBackdropClose } from './useBackdropClose'

// Les handlers sont appelés directement, sans monter de composant : le composable ne touche
// ni au DOM ni à la réactivité de Vue, il ne tient qu'un `pointerId`. `PointerEvent` n'existe
// pas dans happy-dom ; seul `pointerId` est lu, un littéral suffit.
const pointer = (pointerId: number) => ({ pointerId }) as PointerEvent

describe('useBackdropClose', () => {
  it('closes on a complete gesture of the same pointer', () => {
    const onClose = vi.fn()
    const { onPointerdown, onPointerup } = useBackdropClose(onClose)

    onPointerdown(pointer(1))
    onPointerup(pointer(1))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // Le cas qui justifie le geste complet : une pop-up qui monte SOUS LE DOIGT au
  // `pointerdown` de `VALIDER` ou de `+` reçoit le `pointerup` de ce geste sur un voile
  // qu'elle n'a jamais armé — elle ne doit pas se refermer aussitôt ouverte.
  it('ignores a pointerup with no preceding pointerdown', () => {
    const onClose = vi.fn()
    const { onPointerup } = useBackdropClose(onClose)

    onPointerup(pointer(1))

    expect(onClose).not.toHaveBeenCalled()
  })

  // `pointerId` mémorisé et non un booléen : une paume posée sur le voile ne doit pas armer
  // la fermeture au profit d'un autre doigt (revue du 2026-09-09).
  it('ignores a pointerup from a different pointer than the one armed', () => {
    const onClose = vi.fn()
    const { onPointerdown, onPointerup } = useBackdropClose(onClose)

    onPointerdown(pointer(1))
    onPointerup(pointer(2))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('disarms on pointercancel', () => {
    const onClose = vi.fn()
    const { onPointerdown, onPointercancel, onPointerup } = useBackdropClose(onClose)

    onPointerdown(pointer(1))
    onPointercancel()
    onPointerup(pointer(1))

    expect(onClose).not.toHaveBeenCalled()
  })

  // Le pointeur est désarmé AVANT l'appel : un `pointerup` rejoué ne referme pas deux fois.
  it('calls onClose only once for a single armed gesture', () => {
    const onClose = vi.fn()
    const { onPointerdown, onPointerup } = useBackdropClose(onClose)

    onPointerdown(pointer(1))
    onPointerup(pointer(1))
    onPointerup(pointer(1))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes again after a second complete gesture', () => {
    const onClose = vi.fn()
    const { onPointerdown, onPointerup } = useBackdropClose(onClose)

    onPointerdown(pointer(1))
    onPointerup(pointer(1))
    onPointerdown(pointer(2))
    onPointerup(pointer(2))

    expect(onClose).toHaveBeenCalledTimes(2)
  })

  // La garde `enabled` est ce qui rend inerte le voile des pop-ups sans retour
  // (« PARTIE TERMINÉE » par série, offre d'égalisatrice à `FIN DE PARTIE`).
  it('never closes when enabled is false', () => {
    const onClose = vi.fn()
    const { onPointerdown, onPointerup } = useBackdropClose(onClose, { enabled: () => false })

    onPointerdown(pointer(1))
    onPointerup(pointer(1))

    expect(onClose).not.toHaveBeenCalled()
  })

  // `enabled` est relu à chaque geste, pas capturé à la création : `closesOnBackdrop` de
  // `PromptModal` est un `computed` dont la valeur peut changer sur place.
  it('re-reads enabled at each gesture', () => {
    const onClose = vi.fn()
    let allowed = false
    const { onPointerdown, onPointerup } = useBackdropClose(onClose, { enabled: () => allowed })

    onPointerdown(pointer(1))
    onPointerup(pointer(1))
    expect(onClose).not.toHaveBeenCalled()

    allowed = true
    onPointerdown(pointer(2))
    onPointerup(pointer(2))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('is enabled by default', () => {
    const onClose = vi.fn()
    const { onPointerdown, onPointerup } = useBackdropClose(onClose, {})

    onPointerdown(pointer(1))
    onPointerup(pointer(1))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
