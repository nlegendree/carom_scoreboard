import { describe, it, expect, vi } from 'vitest'
import { useBackdropClose } from './useBackdropClose'

// Les handlers sont appelés directement, sans monter de composant : le composable ne touche
// ni au DOM ni à la réactivité de Vue, il ne tient qu'un `pointerId`. `PointerEvent` n'existe
// pas dans happy-dom ; seuls `pointerId`, `target` et `currentTarget` sont lus.
//
// ⚠️ `currentTarget` est TOUJOURS le voile — c'est lui qui porte les trois gestionnaires.
// `target` dit où le geste a réellement eu lieu : sur le voile lui-même, ou sur un descendant
// (la carte). C'est cette distinction, et non l'arrêt de propagation de la carte, qui tient la
// règle depuis la revue du 2026-09-17.
const BACKDROP = { nodeName: 'BACKDROP' }
const CARD = { nodeName: 'CARD' }

const onBackdrop = (pointerId: number) =>
  ({ pointerId, target: BACKDROP, currentTarget: BACKDROP }) as unknown as PointerEvent
const onCard = (pointerId: number) =>
  ({ pointerId, target: CARD, currentTarget: BACKDROP }) as unknown as PointerEvent

describe('useBackdropClose', () => {
  it('closes on a complete gesture of the same pointer', () => {
    const onClose = vi.fn()
    const { onPointerdown, onPointerup } = useBackdropClose(onClose)

    onPointerdown(onBackdrop(1))
    onPointerup(onBackdrop(1))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // Le cas qui justifie le geste complet : une pop-up qui monte SOUS LE DOIGT au
  // `pointerdown` de `VALIDER` ou de `+` reçoit le `pointerup` de ce geste sur un voile
  // qu'elle n'a jamais armé — elle ne doit pas se refermer aussitôt ouverte.
  it('ignores a pointerup with no preceding pointerdown', () => {
    const onClose = vi.fn()
    const { onPointerup } = useBackdropClose(onClose)

    onPointerup(onBackdrop(1))

    expect(onClose).not.toHaveBeenCalled()
  })

  // `pointerId` mémorisé et non un booléen : une paume posée sur le voile ne doit pas armer
  // la fermeture au profit d'un autre doigt (revue du 2026-09-09).
  it('ignores a pointerup from a different pointer than the one armed', () => {
    const onClose = vi.fn()
    const { onPointerdown, onPointerup } = useBackdropClose(onClose)

    onPointerdown(onBackdrop(1))
    onPointerup(onBackdrop(2))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('disarms on pointercancel of the armed pointer', () => {
    const onClose = vi.fn()
    const { onPointerdown, onPointercancel, onPointerup } = useBackdropClose(onClose)

    onPointerdown(onBackdrop(1))
    onPointercancel(onBackdrop(1))
    onPointerup(onBackdrop(1))

    expect(onClose).not.toHaveBeenCalled()
  })

  // Le pointeur est désarmé AVANT l'appel : un `pointerup` rejoué ne referme pas deux fois.
  it('calls onClose only once for a single armed gesture', () => {
    const onClose = vi.fn()
    const { onPointerdown, onPointerup } = useBackdropClose(onClose)

    onPointerdown(onBackdrop(1))
    onPointerup(onBackdrop(1))
    onPointerup(onBackdrop(1))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes again after a second complete gesture', () => {
    const onClose = vi.fn()
    const { onPointerdown, onPointerup } = useBackdropClose(onClose)

    onPointerdown(onBackdrop(1))
    onPointerup(onBackdrop(1))
    onPointerdown(onBackdrop(2))
    onPointerup(onBackdrop(2))

    expect(onClose).toHaveBeenCalledTimes(2)
  })

  // La garde `enabled` est ce qui rend inerte le voile des pop-ups sans retour
  // (« PARTIE TERMINÉE » par série, offre d'égalisatrice à `FIN DE PARTIE`).
  it('never closes when enabled is false', () => {
    const onClose = vi.fn()
    const { onPointerdown, onPointerup } = useBackdropClose(onClose, { enabled: () => false })

    onPointerdown(onBackdrop(1))
    onPointerup(onBackdrop(1))

    expect(onClose).not.toHaveBeenCalled()
  })

  // `enabled` est relu à chaque geste, pas capturé à la création : `closesOnBackdrop` de
  // `PromptModal` est un `computed` dont la valeur peut changer sur place.
  it('re-reads enabled at each gesture', () => {
    const onClose = vi.fn()
    let allowed = false
    const { onPointerdown, onPointerup } = useBackdropClose(onClose, { enabled: () => allowed })

    onPointerdown(onBackdrop(1))
    onPointerup(onBackdrop(1))
    expect(onClose).not.toHaveBeenCalled()

    allowed = true
    onPointerdown(onBackdrop(2))
    onPointerup(onBackdrop(2))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('is enabled by default', () => {
    const onClose = vi.fn()
    const { onPointerdown, onPointerup } = useBackdropClose(onClose, {})

    onPointerdown(onBackdrop(1))
    onPointerup(onBackdrop(1))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // ——— Les quatre cas de la revue du 2026-09-17 ———

  // LE défaut. `@pointerup.stop` sur la carte empêchait le relâchement d'atteindre le voile :
  // l'armement survivait à son propre geste, et le geste SUIVANT — parti dans la carte, donc
  // jamais armé — retombait sur le même `pointerId` (il vaut 1 en permanence à la souris) et
  // refermait la pop-up. Sur `ScoreEntryDock`, la série en cours de frappe était perdue.
  it('does not let a stale arming survive a gesture released on the card', () => {
    const onClose = vi.fn()
    const { onPointerdown, onPointerup } = useBackdropClose(onClose)

    // Geste 1 : appui sur le voile, relâchement sur la carte. Ne ferme pas, et DÉSARME.
    onPointerdown(onBackdrop(1))
    onPointerup(onCard(1))
    expect(onClose).not.toHaveBeenCalled()

    // Geste 2 : appui DANS la carte (n'arme rien), relâchement sur le voile. Même `pointerId`.
    onPointerdown(onCard(1))
    onPointerup(onBackdrop(1))
    expect(onClose).not.toHaveBeenCalled()
  })

  // Corollaire : un geste entièrement contenu dans la carte n'arme ni ne ferme rien, sans
  // dépendre du moindre `.stop` — c'est ce qui le rend immunisé à la capture implicite du
  // pointeur, que happy-dom ne simule pas.
  it('ignores a gesture that both starts and ends on the card', () => {
    const onClose = vi.fn()
    const { onPointerdown, onPointerup } = useBackdropClose(onClose)

    onPointerdown(onCard(1))
    onPointerup(onCard(1))

    expect(onClose).not.toHaveBeenCalled()
  })

  // `enabled` relu au RELÂCHEMENT et pas seulement à l'armement : une pop-up devenue inerte
  // pendant le geste ne se referme pas. L'ancien test ne basculait la garde qu'ENTRE deux
  // gestes complets — jamais dans l'intervalle où la relecture compte.
  it('re-reads enabled between the pointerdown and the pointerup', () => {
    const onClose = vi.fn()
    let allowed = true
    const { onPointerdown, onPointerup } = useBackdropClose(onClose, { enabled: () => allowed })

    onPointerdown(onBackdrop(1))
    allowed = false
    onPointerup(onBackdrop(1))

    expect(onClose).not.toHaveBeenCalled()
  })

  // Un `pointercancel` d'un AUTRE pointeur — la paume rejetée par iPadOS — ne doit pas
  // désarmer le doigt actif, sans quoi le tap dehors devient aléatoire à deux mains.
  it('keeps the armed pointer when another pointer is cancelled', () => {
    const onClose = vi.fn()
    const { onPointerdown, onPointercancel, onPointerup } = useBackdropClose(onClose)

    onPointerdown(onBackdrop(1))
    onPointercancel(onBackdrop(2))
    onPointerup(onBackdrop(1))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // Le pointeur armé garde la main : sans cette garde, la paume posée APRÈS le doigt écrasait
  // l'armement de celui-ci, et c'est le relèvement de la paume qui fermait.
  it('keeps the first armed pointer when a second one lands', () => {
    const onClose = vi.fn()
    const { onPointerdown, onPointerup } = useBackdropClose(onClose)

    onPointerdown(onBackdrop(1))
    onPointerdown(onBackdrop(2))

    onPointerup(onBackdrop(2))
    expect(onClose).not.toHaveBeenCalled()

    onPointerup(onBackdrop(1))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
