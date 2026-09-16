// Fermeture d'une pop-up au tap sur son voile — LE mécanisme, en un seul endroit.
//
// Il vivait recopié à l'identique dans les quatre pop-ups (`PromptModal`, `ScoreEntryDock`,
// `NumericPadDock`, `AlphaKeyboardSheet`) ; l'audit du design system le relève en P2
// (« mécanismes dupliqués »). Depuis la Story 11.3, `PopupCard` en est l'unique consommateur
// direct : les quatre pop-ups l'obtiennent en passant par elle.
//
// Règle du voile (Nathan, 2026-09-15, CLAUDE.md §10) : toute pop-up qui porte un CTA
// `ANNULER` ou `FERMER` se referme au tap dehors, et ce tap vaut ce CTA. Une pop-up sans
// retour garde un voile inerte — c'est ce que fait `enabled`.
//
// Deux précautions, toutes deux payées en revue :
// - le geste doit être COMPLET (appui ET relâchement du même pointeur). Se contenter du
//   relâchement refermait la pop-up dès son ouverture : une pop-up qui monte SOUS LE DOIGT
//   au `pointerdown` de `VALIDER` ou de `+` reçoit le `pointerup` de ce geste sur son voile,
//   qu'elle n'a jamais armé (revue du 2026-09-09) ;
// - le `pointerId` est MÉMORISÉ, jamais un booléen : une paume posée sur le voile n'arme
//   pas la fermeture au profit d'un autre doigt.
//
// Seule exception assumée à `@pointerdown` seul (AR8) : la fermeture demande les deux temps.
export function useBackdropClose(
  onClose: () => void,
  options?: { enabled?: () => boolean },
): {
  onPointerdown: (event: PointerEvent) => void
  onPointerup: (event: PointerEvent) => void
  onPointercancel: () => void
} {
  // `enabled` est une FONCTION et non un booléen : `PromptModal` le dérive du libellé de son
  // secondaire par un `computed`, dont la valeur change sur place. Relu à chaque geste.
  const isEnabled = () => options?.enabled?.() ?? true

  let armedPointerId: number | null = null

  return {
    onPointerdown(event: PointerEvent): void {
      if (!isEnabled()) return
      armedPointerId = event.pointerId
    },

    onPointerup(event: PointerEvent): void {
      if (armedPointerId === null || armedPointerId !== event.pointerId) return
      // Désarmé AVANT l'appel : un `pointerup` rejoué ne referme pas deux fois.
      armedPointerId = null
      onClose()
    },

    onPointercancel(): void {
      armedPointerId = null
    },
  }
}
